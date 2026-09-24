export const WORLD_POPULATION = 8_000_000_000;
export const START_HUMANITY = 95;
export const BEST_END_HUMANITY = 70;

const startLoss = { city: 0, space: 15, station: 25 };
const actLoss = { city: 15, space: 10, station: 10 };

// The world keeps deteriorating while the runner travels. Each manual cut-off
// saves a further five percentage points by preventing a later AI escalation.
export function calculateStakes({ act = 'city', progress = 0, hits = 0, overrides = {}, overtime = 0 } = {}) {
  const stage = Object.hasOwn(startLoss, act) ? act : 'city';
  const fraction = Math.min(1, Math.max(0, Number.isFinite(progress) ? progress : 0));
  const impact = Math.max(0, Math.floor(Number.isFinite(hits) ? hits : 0));
  const position = ({ city: 0, space: 1, station: 2 })[stage] + fraction;
  const protectedLoss =
    (overrides.city ? 5 * Math.min(1, Math.max(0, (position - 0.69) / 0.56)) : 0) +
    (overrides.station ? 5 * Math.min(1, Math.max(0, (position - 2.64) / 0.36)) : 0);
  const delay = Math.max(0, Number.isFinite(overtime) ? overtime : 0);
  const humanity = impact >= 32 ? 0 : Math.max(0, Math.min(95,
    START_HUMANITY - startLoss[stage] - actLoss[stage] * fraction + protectedLoss - impact * 3 - delay * 0.18));
  return {
    humanity,
    survivors: humanity <= 0 ? 256 : Math.max(256, Math.round(WORLD_POPULATION * humanity / 100)),
  };
}
