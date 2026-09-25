// One owner for the visible runner pose. Physics/collision state stays in main.js.
const approach = (value, target, rate, dt) => value + (target - value) * (1 - Math.exp(-rate * dt));

export function setCharacterOutfit(root, outfit) {
  root.traverse((part) => {
    if (part.userData.outfit) part.visible = part.userData.outfit === outfit;
  });
}

export function createCharacterMotion() {
  let wasAirborne = false;
  let landing = 0;
  let slideBlend = 0;
  const set = (part, axis, target, rate, dt) => {
    if (part) part.rotation[axis] = approach(part.rotation[axis], target, rate, dt);
  };
  function reset(joints) {
    wasAirborne = false;
    landing = 0;
    slideBlend = 0;
    if (!joints) return;
    for (const key of ['leftArm', 'rightArm', 'leftElbow', 'rightElbow', 'leftWrist', 'rightWrist',
      'leftLeg', 'rightLeg', 'leftKnee', 'rightKnee', 'leftAnkle', 'rightAnkle', 'leftToe', 'rightToe']) {
      if (joints[key]) joints[key].rotation.set(0, 0, 0);
    }
    joints.hips.rotation.set(0, 0, 0);
    joints.torso.rotation.set(0, 0, 0);
    joints.head.rotation.set(0, 0, 0);
  }
  function update({ joints, distance, jumpY, jumpVelocity, slide, dt, reducedMotion = false }) {
    if (!joints || dt <= 0) return { bob: 0 };
    const airborne = jumpY > 0.012 || jumpVelocity > 0;
    if (wasAirborne && !airborne) landing = 1;
    wasAirborne = airborne;
    landing = Math.max(0, landing - dt * 5.4);
    slideBlend = approach(slideBlend, slide > 0 ? 1 : 0, slide > 0 ? 18 : 12, dt);
    const phase = distance * 1.28;
    const stride = Math.sin(phase);
    const liftL = Math.max(0, -stride);
    const liftR = Math.max(0, stride);
    const stance = Math.abs(Math.sin(phase));
    const running = (1 - slideBlend) * (airborne ? 0 : 1);
    const takeoff = airborne ? Math.min(1, Math.max(0, jumpVelocity / 8.6)) : 0;
    const descent = airborne ? Math.min(1, Math.max(0, -jumpVelocity / 8.6)) : 0;
    const float = airborne ? 1 - Math.max(takeoff, descent) : 0;
    const jumpPose = Math.min(1, takeoff + float + descent);
    const fast = airborne || slide > 0 ? 17 : 13;
    for (const [side, arm, elbow, wrist, leg, knee, ankle, toe, lift] of [
      [-1, joints.leftArm, joints.leftElbow, joints.leftWrist, joints.leftLeg,
        joints.leftKnee, joints.leftAnkle, joints.leftToe, liftL],
      [1, joints.rightArm, joints.rightElbow, joints.rightWrist, joints.rightLeg,
        joints.rightKnee, joints.rightAnkle, joints.rightToe, liftR],
    ]) {
      const swing = side === -1 ? stride : -stride;
      // Upper/lower segments are independent: lifted foot folds and the planted one extends.
      set(leg, 'x', swing * 0.68 * running - (0.28 + side * 0.18) * jumpPose + slideBlend * (side < 0 ? 1.05 : -0.46), fast, dt);
      set(knee, 'x', (0.12 + lift * 1.02) * running + (0.72 + 0.24 * float) * jumpPose + slideBlend * (side < 0 ? -1.0 : 1.25), fast, dt);
      set(ankle, 'x', (-0.10 - lift * 0.35) * running - 0.22 * jumpPose + 0.26 * slideBlend, fast, dt);
      set(toe, 'x', (0.18 + Math.max(0, -swing) * 0.25) * running + 0.14 * jumpPose, fast, dt);
      set(arm, 'x', -swing * 0.63 * running - (0.48 - side * 0.19) * jumpPose + slideBlend * (side < 0 ? -0.82 : 0.55), fast, dt);
      set(arm, 'z', side * (0.10 + 0.12 * slideBlend), fast, dt);
      set(elbow, 'x', (-0.72 - lift * 0.20) * running - 0.76 * jumpPose - 0.54 * slideBlend, fast, dt);
      set(wrist, 'x', 0.12 * running + 0.1 * jumpPose, fast, dt);
    }
    set(joints.hips, 'x', -0.04 * running - 0.18 * takeoff + 0.17 * landing + 0.56 * slideBlend, fast, dt);
    set(joints.torso, 'x', 0.15 * running + 0.08 * descent + 0.20 * slideBlend, fast, dt);
    set(joints.torso, 'z', Math.sin(phase * 0.5) * 0.025 * running, 8, dt);
    set(joints.head, 'x', -0.06 * running - 0.09 * jumpPose, 10, dt);
    return { bob: reducedMotion || airborne || slide > 0 ? 0 : (0.018 * stance - 0.035 * landing) };
  }
  function climb({ joints, height, rungSpacing = 0.54, dt }) {
    if (!joints || dt <= 0) return;
    // One alternating reach per rung. The foot on the lower rung extends as
    // the opposite knee lifts, and each hand reaches for the next rung.
    const phase = height / rungSpacing * Math.PI;
    const stride = Math.sin(phase);
    for (const [side, arm, elbow, wrist, leg, knee, ankle, toe] of [
      [-1, joints.leftArm, joints.leftElbow, joints.leftWrist, joints.leftLeg,
        joints.leftKnee, joints.leftAnkle, joints.leftToe],
      [1, joints.rightArm, joints.rightElbow, joints.rightWrist, joints.rightLeg,
        joints.rightKnee, joints.rightAnkle, joints.rightToe],
    ]) {
      const lift = Math.max(0, side * stride);
      const planted = Math.max(0, -side * stride);
      set(arm, 'x', -1.16 - lift * 0.36 + planted * 0.14, 16, dt);
      set(arm, 'z', side * 0.10, 16, dt);
      set(elbow, 'x', -0.35 - lift * 0.40, 16, dt);
      set(wrist, 'x', 0.10 + lift * 0.12, 16, dt);
      set(leg, 'x', 0.12 + lift * 0.46 - planted * 0.28, 16, dt);
      set(knee, 'x', 0.14 + lift * 0.76, 16, dt);
      set(ankle, 'x', -0.08 - lift * 0.25, 16, dt);
      set(toe, 'x', planted * 0.18, 16, dt);
    }
    set(joints.hips, 'x', 0.07, 12, dt);
    set(joints.torso, 'x', 0.18, 12, dt);
    set(joints.torso, 'z', stride * 0.035, 12, dt);
    set(joints.head, 'x', -0.10, 12, dt);
  }
  return { update, climb, reset };
}
