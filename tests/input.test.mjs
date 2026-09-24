import test from 'node:test';
import assert from 'node:assert/strict';
import { joystickVector, screenFlightToWorld } from '../game/src/input.js';

test('the dynamic joystick follows screen directions and respects its deadzone', () => {
  assert.deepEqual(joystickVector(4, 0), { x: 0, y: 0 });
  assert.deepEqual(joystickVector(72, 0), { x: 1, y: -0 });
  assert.deepEqual(joystickVector(-72, 0), { x: -1, y: -0 });
  assert.deepEqual(joystickVector(0, -72), { x: 0, y: 1 });
  assert.deepEqual(joystickVector(0, 72), { x: 0, y: -1 });
});

test('flight input is converted from screen space to the camera-facing world axes', () => {
  assert.deepEqual(screenFlightToWorld({ x: 1, y: 0 }), { x: -1, y: 0 });
  assert.deepEqual(screenFlightToWorld({ x: -1, y: 0 }), { x: 1, y: 0 });
  assert.deepEqual(screenFlightToWorld({ x: 0, y: 1 }), { x: -0, y: 1 });
});
