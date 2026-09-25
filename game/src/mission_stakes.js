export const WORLD_POPULATION = 8_000_000_000;
export const START_HUMANITY = 95;
export const PASSIVE_LOSS_FACTOR = 1 / 3;
export const BEST_END_HUMANITY = START_HUMANITY - 35 * PASSIVE_LOSS_FACTOR + 10;

const startLoss = { city: 0, space: 15, station: 25 };
const actLoss = { city: 15, space: 10, station: 10 };

// Passive destruction advances at one-third of its original pace. Collisions
// and the ten-point rescue from the six lane calls retain their full impact.
export function calculateStakes({ act = 'city', progress = 0, hits = 0, laneChallenges = {}, overtime = 0 } = {}) {
  const stage = Object.hasOwn(startLoss, act) ? act : 'city';
  const fraction = Math.min(1, Math.max(0, Number.isFinite(progress) ? progress : 0));
  const impact = Math.max(0, Math.floor(Number.isFinite(hits) ? hits : 0));
  const cleared = Math.min(3, Math.max(0, Number(laneChallenges.city) || 0)) +
    Math.min(3, Math.max(0, Number(laneChallenges.station) || 0));
  const protectedLoss = cleared * 10 / 6;
  const delay = Math.max(0, Number.isFinite(overtime) ? overtime : 0);
  const passiveLoss = (startLoss[stage] + actLoss[stage] * fraction + delay * 0.18) * PASSIVE_LOSS_FACTOR;
  const humanity = impact >= 32 ? 0 : Math.max(0, Math.min(START_HUMANITY,
    START_HUMANITY - passiveLoss + protectedLoss - impact * 3));
  return {
    humanity,
    survivors: humanity <= 0 ? 256 : Math.max(256, Math.round(WORLD_POPULATION * humanity / 100)),
  };
}
