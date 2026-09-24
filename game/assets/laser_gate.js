// Industrial security barricade: a portable piece of station infrastructure,
// not a pair of abstract posts. Named state groups let the finale depower it.
export default function (THREE) {
  const gate = new THREE.Group();
  gate.name = 'industrialLaserBarricade';
  const dark = new THREE.MeshStandardMaterial({ color: 0x102431, roughness: 0.37, metalness: 0.76 }); dark.name = 'metal';
  const armor = new THREE.MeshStandardMaterial({ color: 0xd9ddd8, roughness: 0.52, metalness: 0.34 }); armor.name = 'metal';
  const steel = new THREE.MeshStandardMaterial({ color: 0x627986, roughness: 0.44, metalness: 0.63 }); steel.name = 'metal';
  const yellow = new THREE.MeshStandardMaterial({ color: 0xf6c453, roughness: 0.48, metalness: 0.3 }); yellow.name = 'metal';
  const copper = new THREE.MeshStandardMaterial({ color: 0xb95f46, roughness: 0.4, metalness: 0.7 }); copper.name = 'metal';
  const red = new THREE.MeshStandardMaterial({ color: 0xff4057, roughness: 0.18, metalness: 0.14, emissive: 0xd7263d, emissiveIntensity: 3.6 }); red.name = 'stationAlarmMaterial';
  const teal = new THREE.MeshStandardMaterial({ color: 0x67e4d2, roughness: 0.2, metalness: 0.2, emissive: 0x45c4b0, emissiveIntensity: 2.2 }); teal.name = 'stationPassiveMaterial';
  const add = (parent, name, geometry, material, x = 0, y = 0, z = 0) => {
    const mesh = new THREE.Mesh(geometry, material);
    mesh.name = name;
    mesh.position.set(x, y, z);
    parent.add(mesh);
    return mesh;
  };
  const active = new THREE.Group(); active.name = 'stationAlarmSystem'; gate.add(active);
  const passive = new THREE.Group(); passive.name = 'stationPassiveSystem'; passive.visible = false; gate.add(passive);

  for (const side of [-1, 1]) {
    const x = side * 0.88;
    add(gate, 'foldedFoot', new THREE.BoxGeometry(0.78, 0.16, 0.68), dark, x, 0.08, 0);
    add(gate, 'pylonBase', new THREE.CylinderGeometry(0.38, 0.48, 0.34, 8), steel, x, 0.27, 0);
    add(gate, 'armoredPylon', new THREE.BoxGeometry(0.46, 1.62, 0.5), armor, x, 1.12, 0);
    add(gate, 'pylonSpine', new THREE.BoxGeometry(0.2, 1.34, 0.62), dark, x, 1.12, -0.02);
    for (const y of [0.68, 1.05, 1.42]) {
      const emitter = add(gate, 'emitterCollar', new THREE.CylinderGeometry(0.18, 0.22, 0.3, 10), copper, x - side * 0.13, y, 0.16);
      emitter.rotation.z = Math.PI / 2;
      const lens = add(active, 'stationAlarmEmitterLens', new THREE.CylinderGeometry(0.105, 0.105, 0.08, 12), red, x - side * 0.31, y, 0.16);
      lens.rotation.z = Math.PI / 2;
    }
    add(gate, 'pylonCap', new THREE.CylinderGeometry(0.24, 0.31, 0.26, 8), dark, x, 2.08, 0);
    add(active, 'stationAlarmBeacon', new THREE.SphereGeometry(0.115, 10, 7), red, x, 2.25, 0.04);
    add(passive, 'stationPassiveStatus', new THREE.SphereGeometry(0.085, 10, 7), teal, x, 2.23, 0.04);
    for (const y of [0.56, 1.76]) {
      const bolt = add(gate, 'pylonFastener', new THREE.CylinderGeometry(0.06, 0.06, 0.08, 8), yellow, x, y, 0.31);
      bolt.rotation.x = Math.PI / 2;
    }
    const cablePoints = [
      new THREE.Vector3(x, 0.38, -0.18),
      new THREE.Vector3(x + side * 0.26, 0.22, -0.28),
      new THREE.Vector3(x + side * 0.46, 0.18, -0.06),
    ];
    add(gate, 'powerCable', new THREE.TubeGeometry(new THREE.CatmullRomCurve3(cablePoints), 10, 0.045, 6, false), dark);
  }
  for (const y of [0.68, 1.05, 1.42]) {
    const beam = add(active, 'laserBeam', new THREE.CylinderGeometry(0.047, 0.047, 1.72, 10), red, 0, y, 0.16);
    beam.rotation.z = Math.PI / 2;
    const haloMaterial = new THREE.MeshBasicMaterial({ color: 0xff263f, transparent: true, opacity: 0.2, depthWrite: false, fog: false });
    haloMaterial.name = 'stationAlarmMaterial';
    const halo = add(active, 'stationAlarmLaserHalo', new THREE.CylinderGeometry(0.09, 0.09, 1.72, 10, 1, true), haloMaterial, 0, y, 0.16);
    halo.rotation.z = Math.PI / 2;
  }
  add(gate, 'warningBar', new THREE.BoxGeometry(1.18, 0.14, 0.18), yellow, 0, 1.86, -0.04);
  for (const x of [-0.38, 0, 0.38]) {
    const slash = add(gate, 'warningSlash', new THREE.BoxGeometry(0.18, 0.04, 0.2), dark, x, 1.94, -0.05);
    slash.rotation.z = -0.58;
  }
  return gate;
}
