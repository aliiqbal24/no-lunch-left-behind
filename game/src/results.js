// The population component saturates at this survivor count; slower passive
// loss can exceed it, while collision, dodge, time and lane-call bonuses remain.
const STARTING_SURVIVORS = 5_600_000_000;

const TITLES = {
  S: 'UNAUTHORIZED LEGEND',
  A: 'APPROVED WITH COMMENTS',
  B: 'SURVIVAL DEEMED ADEQUATE',
  C: 'PLEASE FILE AN EXPLANATION',
  D: 'HUMAN RESOURCES IS CONCERNED',
};

const clamp = (value, minimum, maximum) => Math.min(maximum, Math.max(minimum, value));
const nonNegative = value => typeof value === 'number' && Number.isFinite(value)
  ? Math.max(0, value)
  : 0;

/**
 * Calculate the final play rating from run statistics. Missing or invalid
 * counts are treated as zero; an invalid mission time earns no time bonus.
 * The return value is always finite and bounded, even for very large counts.
 */
export function calculateRating({ survivors, hits, obstaclesDodged, timeSeconds, baselineSeconds, laneChallengesCleared } = {}) {
  const people = nonNegative(survivors);
  const collisions = nonNegative(hits);
  const dodges = nonNegative(obstaclesDodged);
  const baseline = nonNegative(baselineSeconds);
  const laneCalls = clamp(nonNegative(laneChallengesCleared), 0, 6);

  // Scale first so two individually finite, very large counts cannot overflow
  // when combined into the dodge rate's denominator.
  const largestObstacleCount = Math.max(dodges, collisions);
  const dodgeRate = largestObstacleCount === 0
    ? 1
    : (dodges / largestObstacleCount) /
      ((dodges / largestObstacleCount) + (collisions / largestObstacleCount));

  const validTime = typeof timeSeconds === 'number' && Number.isFinite(timeSeconds) && timeSeconds >= 0;
  const timeBonus = validTime
    ? clamp(1 - Math.max(0, timeSeconds - baseline) / 15, 0, 1)
    : 0;
  const score = Math.round(
    65 * clamp(people / STARTING_SURVIVORS, 0, 1) +
    15 * dodgeRate +
    5 * timeBonus +
    15 * laneCalls / 6,
  );

  const grade = collisions === 0 && score >= 97 ? 'S'
    : score >= 88 ? 'A'
      : score >= 75 ? 'B'
        : score >= 55 ? 'C'
          : 'D';

  return { score, grade, title: TITLES[grade], dodgeRate };
}
