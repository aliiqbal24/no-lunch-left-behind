import test from 'node:test';
import assert from 'node:assert/strict';
import { createCharacterMotion, setCharacterOutfit } from '../game/src/character_motion.js';

const part = () => ({ rotation: { x: 0, y: 0, z: 0,
  set(x, y, z) { this.x = x; this.y = y; this.z = z; } } });
const rig = () => Object.fromEntries([
  'hips', 'torso', 'head', 'leftArm', 'rightArm', 'leftElbow', 'rightElbow',
  'leftWrist', 'rightWrist', 'leftLeg', 'rightLeg', 'leftKnee', 'rightKnee',
  'leftAnkle', 'rightAnkle', 'leftToe', 'rightToe',
].map((key) => [key, part()]));

test('office and suit share a rig while only costume pieces toggle', () => {
  const face = { userData: {}, visible: true };
  const shirt = { userData: { outfit: 'office' }, visible: true };
  const helmet = { userData: { outfit: 'suit' }, visible: false };
  const root = { traverse(fn) { for (const item of [this, face, shirt, helmet]) fn(item); }, userData: {} };
  setCharacterOutfit(root, 'suit');
  assert.equal(face.visible, true);
  assert.equal(shirt.visible, false);
  assert.equal(helmet.visible, true);
  setCharacterOutfit(root, 'office');
  assert.equal(shirt.visible, true);
  assert.equal(helmet.visible, false);
});

test('the character controller owns run, airborne, landing and slide poses', () => {
  const motion = createCharacterMotion();
  const joints = rig();
  motion.update({ joints, distance: 5, jumpY: 0, jumpVelocity: 0, slide: 0, dt: 1 / 60 });
  assert.notEqual(joints.leftLeg.rotation.x, joints.rightLeg.rotation.x);
  motion.update({ joints, distance: 5, jumpY: 0.8, jumpVelocity: 2, slide: 0, dt: 1 / 30 });
  assert.ok(joints.leftKnee.rotation.x > 0);
  motion.update({ joints, distance: 5, jumpY: 0, jumpVelocity: 0, slide: 0, dt: 1 / 30 });
  motion.update({ joints, distance: 5, jumpY: 0, jumpVelocity: 0, slide: 0.4, dt: 1 / 20 });
  assert.ok(joints.hips.rotation.x > 0);
  for (const value of Object.values(joints))
    for (const angle of Object.values(value.rotation).filter((item) => typeof item === 'number'))
      assert.ok(Number.isFinite(angle));
  motion.reset(joints);
  assert.equal(joints.leftLeg.rotation.x, 0);
  assert.equal(joints.rightArm.rotation.x, 0);
});

test('ladder pose alternates the reaching hand and stepping knee', () => {
  const motion = createCharacterMotion();
  const joints = rig();
  motion.climb({ joints, height: 0.17, rungSpacing: 0.34, dt: 0.5 });
  const firstKnees = [joints.leftKnee.rotation.x, joints.rightKnee.rotation.x];
  const firstArms = [joints.leftArm.rotation.x, joints.rightArm.rotation.x];
  motion.climb({ joints, height: 0.51, rungSpacing: 0.34, dt: 0.5 });
  assert.ok(firstKnees[0] !== firstKnees[1]);
  assert.ok(firstArms[0] !== firstArms[1]);
  assert.ok((firstKnees[0] - firstKnees[1]) *
    (joints.leftKnee.rotation.x - joints.rightKnee.rotation.x) < 0);
});
