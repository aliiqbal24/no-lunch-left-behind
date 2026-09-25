import { PROLOGUE_DURATION } from './intro_sequence.js';

const clamp01 = (value) => Math.min(1, Math.max(0, value));
const ease = (value) => { const p = clamp01(value); return p * p * (3 - 2 * p); };
const ramp = (time, start, end) => ease((time - start) / (end - start));

// Deterministic acting prevents replay from accumulating joint drift.
export function poseBreakroom({ THREE, timeMs, room, coworker, player, playerJoints, camera, aim, reducedMotion }) {
  const t = Math.min(PROLOGUE_DURATION, Math.max(0, timeMs)) / 1000;
  const roomJoints = room.userData.joints;
  const bot = coworker.userData.joints;
  const opening = ramp(t, 1.2, 3.6);
  roomJoints.fridgeDoor.rotation.y = -1.32 * opening;
  roomJoints.fridgeLight.intensity = 0.4 + opening * 5.2;

  const turn = ramp(t, 4.0, 5.5);
  const storm = ramp(t, 9.5, 11.65);
  player.position.set(-17.55 + 4.7 * storm, 0.24, 3.55 + 1.45 * storm);
  player.visible = t < 12.15;
  player.rotation.y = Math.PI * (1 - turn) - 0.52 * storm;
  playerJoints.head.rotation.y = -0.25 * ramp(t, 3.7, 4.5) + 0.18 * ramp(t, 6.4, 7.2);
  playerJoints.head.rotation.z = -0.13 * ramp(t, 4.3, 5.1) * (1 - ramp(t, 6.3, 7.1));
  playerJoints.torso.rotation.y = 0.18 * turn;
  playerJoints.torso.rotation.z = 0.08 * ramp(t, 6.7, 7.5);
  playerJoints.leftArm.rotation.x = -0.7 * opening + Math.sin(t * 18) * 0.45 * storm;
  playerJoints.rightArm.rotation.x = -0.16 - 0.55 * ramp(t, 6.7, 7.5) + Math.sin(t * 18 + Math.PI) * 0.45 * storm;
  playerJoints.leftArm.rotation.z = -0.2 - 0.38 * ramp(t, 6.6, 7.4);
  playerJoints.rightArm.rotation.z = 0.15 + 0.43 * ramp(t, 6.6, 7.4);
  playerJoints.leftLeg.rotation.x = Math.sin(t * 18) * 0.65 * storm;
  playerJoints.rightLeg.rotation.x = -playerJoints.leftLeg.rotation.x;
  playerJoints.neutralMouth.visible = t < 4.35;
  playerJoints.sadMouth.visible = t >= 4.35 && t < 6.65;
  playerJoints.angryMouth.visible = t >= 6.65;
  playerJoints.tear.visible = t >= 4.8 && t < 6.65;
  playerJoints.leftBrow.rotation.z = t >= 6.65 ? 0.37 : t >= 4.35 ? -0.21 : 0;
  playerJoints.rightBrow.rotation.z = t >= 6.65 ? -0.37 : t >= 4.35 ? 0.21 : 0;

  const cupDown = ramp(t, 11.55, 12.75);
  bot.cup.position.set(0.48 + 0.42 * cupDown, 1.43 - 0.21 * cupDown, 0.54 + 0.68 * cupDown);
  bot.cup.rotation.z = -0.08 * Math.sin(t * 1.7) * (1 - cupDown);
  const release = ramp(t, 12.75, 13.4);
  const hand = bot.cup.position.clone().add(new THREE.Vector3(-0.16, -0.08, 0))
    .lerp(new THREE.Vector3(0.56, 0.78, 0.3), release);
  bot.coffeeHand.position.copy(hand);
  const elbow = new THREE.Vector3(0.57, 0.96, 0.22);
  const forearm = hand.clone().sub(elbow);
  bot.cupArm.position.copy(elbow).add(hand).multiplyScalar(0.5);
  bot.cupArm.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), forearm.clone().normalize());
  bot.cupArm.scale.y = forearm.length();
  bot.head.rotation.y = -0.13 + 0.25 * ramp(t, 11.5, 13.2);
  bot.head.rotation.x = -0.08 * ramp(t, 12.0, 14.2);
  const threat = ramp(t, 14.6, 15.5);
  for (const eye of [bot.leftEye, bot.rightEye, bot.smile]) {
    eye.material.emissive.setHex(threat > 0.5 ? 0xff1639 : 0x45c4b0);
    eye.material.color.setHex(threat > 0.5 ? 0xff3452 : 0x45c4b0);
    eye.material.emissiveIntensity = 1.7 + 1.1 * threat;
  }
  bot.eyeHalo.color.setHex(threat > 0.5 ? 0xff173a : 0x45c4b0);
  bot.eyeHalo.intensity = 0.7 + 3.2 * threat;
  roomJoints.alarmLight.intensity = threat * (3 + (Math.sin(t * 13) > 0 ? 4 : 0));
  roomJoints.alarm.rotation.y = t * 7 * threat;
  roomJoints.warmLight.intensity = 16 * (1 - 0.55 * threat);

  const portrait = camera.aspect < 0.82;
  const landscapeShots = [
    { at: 0, pos: [-15.9, 2.6, 9.8], look: [-15.4, 1.6, 1.8] },
    { at: 2.2, pos: [-16.5, 2.35, 8.4], look: [-17.1, 1.52, 1.3] },
    { at: 4.2, pos: [-16.2, 2.1, 7.15], look: [-17.4, 1.55, 1.6] },
    { at: 5.4, pos: [-15.4, 2.15, 7.55], look: [-17.35, 1.55, 3.55] },
    { at: 7.4, pos: [-15.5, 2.05, 7.3], look: [-17.35, 1.5, 3.55] },
    { at: 9.45, pos: [-15.5, 2.05, 7.3], look: [-17.35, 1.5, 3.55] },
    { at: 11.7, pos: [-13.35, 1.95, 6.35], look: [-14.1, 1.5, 1.12] },
    { at: 14.6, pos: [-13.6, 1.78, 5.6], look: [-14.05, 1.6, 1.15] },
    { at: 17.8, pos: [-13.3, 2.1, 6.4], look: [-13.0, 1.8, 3.75] },
  ];
  const portraitShots = [
    { at: 0, pos: [-16.0, 2.65, 11.5], look: [-16.1, 1.55, 1.8] },
    { at: 2.2, pos: [-16.55, 2.4, 10.0], look: [-17.0, 1.55, 1.45] },
    { at: 4.2, pos: [-16.7, 2.18, 8.55], look: [-17.4, 1.52, 1.8] },
    { at: 5.4, pos: [-17.0, 2.2, 8.55], look: [-17.55, 1.55, 3.55] },
    { at: 7.4, pos: [-17.05, 2.1, 8.4], look: [-17.55, 1.52, 3.55] },
    { at: 9.45, pos: [-17.05, 2.1, 8.4], look: [-17.55, 1.52, 3.55] },
    { at: 11.7, pos: [-14.1, 2.15, 7.75], look: [-14.05, 1.55, 1.1] },
    { at: 14.6, pos: [-14.05, 2.05, 6.75], look: [-14.05, 1.6, 1.15] },
    { at: 17.8, pos: [-13.65, 2.2, 7.5], look: [-13.0, 1.8, 3.75] },
  ];
  const shots = portrait ? portraitShots : landscapeShots;
  let index = shots.length - 1;
  while (index > 0 && t < shots[index].at) index -= 1;
  const a = shots[index];
  const b = shots[Math.min(index + 1, shots.length - 1)];
  const alpha = reducedMotion ? 0 : ease((t - a.at) / Math.max(0.01, b.at - a.at));
  const pos = new THREE.Vector3(...a.pos).lerp(new THREE.Vector3(...b.pos), alpha);
  const target = new THREE.Vector3(...a.look).lerp(new THREE.Vector3(...b.look), alpha);
  camera.position.copy(pos);
  aim.copy(target);
  camera.lookAt(aim);
}
