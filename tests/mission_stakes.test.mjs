import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateStakes } from '../game/src/mission_stakes.js';

test('a clean run steadily loses ground across all three acts', () => {
  assert.equal(calculateStakes({ act: 'city' }).humanity, 95);
  assert.equal(calculateStakes({ act: 'city', progress: 1 }).humanity, 80);
  assert.equal(calculateStakes({ act: 'space', progress: 1 }).humanity, 70);
  assert.equal(calculateStakes({ act: 'station', progress: 1 }).humanity, 60);
});

test('both physical overrides protect ten points by the finale', () => {
  assert.equal(calculateStakes({ act: 'station', progress: 1, overrides: { city: true, station: true } }).survivors, 5_600_000_000);
  assert.equal(calculateStakes({ act: 'station', progress: 1, overrides: { station: true } }).humanity, 65);
  assert.equal(calculateStakes({ act: 'city', progress: 0.7, overrides: { city: true } }).humanity,
    calculateStakes({ act: 'city', progress: 0.7 }).humanity + 5);
});

test('collisions and wasted time cost lives; the 256 survivor ending remains reachable', () => {
  assert.equal(calculateStakes({ act: 'station', progress: 1, overrides: { city: true, station: true }, hits: 1 }).humanity, 67);
  assert.ok(calculateStakes({ act: 'city', progress: 1, overtime: 10 }).humanity < 80);
  assert.deepEqual(calculateStakes({ act: 'station', progress: 1, hits: 32, overrides: { city: true, station: true } }),
    { humanity: 0, survivors: 256 });
});
