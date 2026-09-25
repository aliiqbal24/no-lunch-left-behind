import test from 'node:test';
import assert from 'node:assert/strict';
import { createClimbController } from '../game/src/rocket_boarding.js';

test('untapped ladder climbs slowly and reaches the hatch', () => {
  const climb = createClimbController();
  let state;
  for (let i = 0; i < 540; i++) state = climb.update(1 / 60);
  assert.equal(state.progress, 1);
  assert.equal(state.taps, 0);
});

test('fifteen taps speed the climb and further taps have no effect', () => {
  const climb = createClimbController();
  for (let i = 0; i < 15; i++) assert.equal(climb.tap(), true);
  assert.equal(climb.tap(), false);
  let state;
  for (let i = 0; i < 180; i++) state = climb.update(1 / 60);
  assert.equal(state.progress, 1);
  assert.equal(state.taps, 15);
  climb.reset();
  assert.deepEqual(climb.update(0).taps, 0);
  assert.equal(climb.update(0).progress, 0);
});
