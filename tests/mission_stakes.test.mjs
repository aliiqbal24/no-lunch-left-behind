import test from 'node:test';
import assert from 'node:assert/strict';
import { BEST_END_HUMANITY, calculateStakes } from '../game/src/mission_stakes.js';

const near = (actual, expected) => assert.ok(Math.abs(actual - expected) < 1e-9, `${actual} ≈ ${expected}`);

test('passive humanity loss is one-third of the original rate across all acts', () => {
  assert.equal(calculateStakes({ act: 'city' }).humanity, 95);
  near(calculateStakes({ act: 'city', progress: 1 }).humanity, 90);
  near(calculateStakes({ act: 'space', progress: 1 }).humanity, 95 - 25 / 3);
  near(calculateStakes({ act: 'station', progress: 1 }).humanity, 95 - 35 / 3);
  near(calculateStakes({ act: 'city', progress: 1, overtime: 10 }).humanity, 90 - 0.6);
});

test('six lane calls protect ten points by the finale', () => {
  const best = calculateStakes({ act: 'station', progress: 1, laneChallenges: { city: 3, station: 3 } });
  near(best.humanity, BEST_END_HUMANITY);
  assert.equal(best.survivors, 7_466_666_667);
  near(calculateStakes({ act: 'station', progress: 1, laneChallenges: { station: 3 } }).humanity, 95 - 35 / 3 + 5);
  assert.equal(calculateStakes({ act: 'city', progress: 1, laneChallenges: { city: 3 } }).humanity,
    calculateStakes({ act: 'city', progress: 1 }).humanity + 5);
});

test('collisions and wasted time cost lives; the 256 survivor ending remains reachable', () => {
  near(calculateStakes({ act: 'station', progress: 1, laneChallenges: { city: 3, station: 3 }, hits: 1 }).humanity,
    BEST_END_HUMANITY - 3);
  assert.deepEqual(calculateStakes({ act: 'station', progress: 1, hits: 32, laneChallenges: { city: 3, station: 3 } }),
    { humanity: 0, survivors: 256 });
});
