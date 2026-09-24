// Articulated station sentry with a readable low-hazard silhouette.
export default function (THREE) {
  const bot = new THREE.Group();
  bot.name = 'stationSecurityDrone';
  const ivory = new THREE.MeshStandardMaterial({ color: 0xe5e3d9, roughness: 0.48, metalness: 0.36 }); ivory.name = 'metal';
  const steel = new THREE.MeshStandardMaterial({ color: 0x637985, roughness: 0.42, metalness: 0.66 }); steel.name = 'metal';
  const dark = new THREE.MeshStandardMaterial({ color: 0x0d202c, roughness: 0.34, metalness: 0.78 }); dark.name = 'metal';
  const yellow = new THREE.MeshStandardMaterial({ color: 0xf6c453, roughness: 0.48, metalness: 0.28 }); yellow.name = 'metal';
  const copper = new THREE.MeshStandardMaterial({ color: 0xb95f46, roughness: 0.4, metalness: 0.68 }); copper.name = 'metal';
  const red = new THREE.MeshStandardMaterial({ color: 0xff4057, roughness: 0.16, emissive: 0xd7263d, emissiveIntensity: 3.2 }); red.name = 'stationAlarmMaterial';
  const teal = new THREE.MeshStandardMaterial({ color: 0x74ead8, roughness: 0.18, emissive: 0x45c4b0, emissiveIntensity: 2 }); teal.name = 'stationPassiveMaterial';
  const add = (parent, name, geometry, material, x = 0, y = 0, z = 0) => {
    const mesh = new THREE.Mesh(geometry, material);
    mesh.name = name;
    mesh.position.set(x, y, z);
    parent.add(mesh);
    return mesh;
  };
  const alarm = new THREE.Group(); alarm.name = 'stationAlarmSystem'; bot.add(alarm);
  const passive = new THREE.Group(); passive.name = 'stationPassiveSystem'; passive.visible = false; bot.add(passive);

  add(bot, 'driveChassis', new THREE.CylinderGeometry(0.62, 0.72, 0.3, 12), dark, 0, 0.31, 0);
  add(bot, 'lowerArmor', new THREE.CylinderGeometry(0.5, 0.62, 0.36, 12), steel, 0, 0.58, 0);
  for (const side of [-1, 1]) {
    const wheel = add(bot, 'magWheel', new THREE.TorusGeometry(0.27, 0.105, 8, 16), dark, side * 0.55, 0.27, 0);
    wheel.rotation.y = Math.PI / 2;
    add(bot, 'wheelHub', new THREE.CylinderGeometry(0.1, 0.1, 0.16, 10), yellow, side * 0.55, 0.27, 0).rotation.z = Math.PI / 2;
    add(bot, 'shoulderJoint', new THREE.SphereGeometry(0.16, 10, 7), copper, side * 0.61, 0.98, 0);
    const upper = add(bot, 'manipulatorUpper', new THREE.CapsuleGeometry(0.095, 0.34, 4, 8), dark, side * 0.72, 0.78, 0.02);
    upper.rotation.z = side * 0.62;
    const fore = add(bot, 'manipulatorForearm', new THREE.CapsuleGeometry(0.08, 0.28, 4, 8), steel, side * 0.82, 0.53, 0.12);
    fore.rotation.z = side * 0.18;
    add(bot, 'manipulatorClamp', new THREE.BoxGeometry(0.18, 0.12, 0.26), yellow, side * 0.84, 0.34, 0.16);
  }

  const torso = add(bot, 'armoredTorso', new THREE.SphereGeometry(0.64, 18, 12), ivory, 0, 1.03, 0);
  torso.scale.set(1, 0.76, 0.86);
  add(bot, 'torsoBelt', new THREE.TorusGeometry(0.56, 0.075, 7, 20), dark, 0, 0.98, 0).rotation.x = Math.PI / 2;
  add(bot, 'facePlate', new THREE.BoxGeometry(0.72, 0.32, 0.15), dark, 0, 1.12, 0.48);
  const eye = add(alarm, 'securityEye', new THREE.CapsuleGeometry(0.075, 0.38, 4, 10), red, 0, 1.12, 0.57);
  eye.rotation.z = Math.PI / 2;
  const safeEye = add(passive, 'securityPassiveCore', new THREE.CapsuleGeometry(0.055, 0.28, 4, 10), teal, 0, 1.12, 0.575);
  safeEye.rotation.z = Math.PI / 2;
  for (const x of [-0.22, 0.22]) add(bot, 'faceFastener', new THREE.CylinderGeometry(0.035, 0.035, 0.04, 8), yellow, x, 1.28, 0.57).rotation.x = Math.PI / 2;

  add(bot, 'sensorCrown', new THREE.CylinderGeometry(0.25, 0.34, 0.24, 10), steel, 0, 1.57, 0);
  const antenna = add(bot, 'antennaMast', new THREE.CylinderGeometry(0.035, 0.045, 0.48, 8), dark, 0, 1.88, 0);
  antenna.rotation.z = -0.12;
  add(alarm, 'stationAlarmBeacon', new THREE.SphereGeometry(0.09, 10, 7), red, 0.03, 2.12, 0);
  add(passive, 'stationPassiveStatus', new THREE.SphereGeometry(0.07, 10, 7), teal, 0.03, 2.12, 0);
  for (const side of [-1, 1]) {
    const aerial = add(bot, 'directionalAerial', new THREE.CylinderGeometry(0.025, 0.025, 0.36, 7), copper, side * 0.2, 1.84, 0);
    aerial.rotation.z = side * 0.52;
  }
  for (const part of bot.children) part.position.y += 0.11;
  return bot;
}
