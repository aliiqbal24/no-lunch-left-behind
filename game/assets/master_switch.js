// Monumental physical cut-off control: heavy enough to feel like the single
// point of failure for a planet-scale AI system.
export default function (THREE) {
  const control = new THREE.Group();
  control.name = 'masterSwitchMonument';
  const dark = new THREE.MeshStandardMaterial({ color: 0x0b1d29, roughness: 0.34, metalness: 0.78 }); dark.name = 'metal';
  const steel = new THREE.MeshStandardMaterial({ color: 0x637b86, roughness: 0.43, metalness: 0.64 }); steel.name = 'metal';
  const ivory = new THREE.MeshStandardMaterial({ color: 0xe9e5d9, roughness: 0.5, metalness: 0.34 }); ivory.name = 'metal';
  const yellow = new THREE.MeshStandardMaterial({ color: 0xf6c453, roughness: 0.48, metalness: 0.3 }); yellow.name = 'metal';
  const copper = new THREE.MeshStandardMaterial({ color: 0xad593f, roughness: 0.39, metalness: 0.72 }); copper.name = 'metal';
  const red = new THREE.MeshStandardMaterial({ color: 0xe72942, roughness: 0.24, metalness: 0.18, emissive: 0xd7263d, emissiveIntensity: 1.65 }); red.name = 'stationAlarmMaterial';
  const redHot = new THREE.MeshStandardMaterial({ color: 0xff6b61, roughness: 0.16, metalness: 0.1, emissive: 0xff233f, emissiveIntensity: 3.4 }); redHot.name = 'stationAlarmMaterial';
  const teal = new THREE.MeshStandardMaterial({ color: 0x60ddc9, roughness: 0.19, metalness: 0.22, emissive: 0x45c4b0, emissiveIntensity: 2.2 }); teal.name = 'stationPassiveMaterial';
  const add = (parent, name, geometry, material, x = 0, y = 0, z = 0) => {
    const mesh = new THREE.Mesh(geometry, material);
    mesh.name = name;
    mesh.position.set(x, y, z);
    parent.add(mesh);
    return mesh;
  };
  const alarm = new THREE.Group(); alarm.name = 'stationAlarmSystem'; control.add(alarm);
  const passive = new THREE.Group(); passive.name = 'stationPassiveSystem'; passive.visible = false; control.add(passive);

  add(control, 'foundation', new THREE.CylinderGeometry(1.72, 2.05, 0.38, 20), dark, 0, 0.19, 0);
  add(control, 'foundationArmor', new THREE.CylinderGeometry(1.5, 1.72, 0.52, 20), steel, 0, 0.64, 0);
  add(control, 'reactorPedestal', new THREE.CylinderGeometry(1.18, 1.42, 0.92, 16), ivory, 0, 1.26, 0);
  add(control, 'pedestalInset', new THREE.CylinderGeometry(1.01, 1.1, 0.52, 16), dark, 0, 1.58, 0);
  add(control, 'hazardCollar', new THREE.CylinderGeometry(1.2, 1.28, 0.26, 16), yellow, 0, 1.88, 0);
  for (let i = 0; i < 12; i++) {
    const angle = i * Math.PI / 6;
    const bolt = add(control, 'collarBolt', new THREE.CylinderGeometry(0.055, 0.055, 0.1, 8), dark,
      Math.cos(angle) * 1.02, 2.04, Math.sin(angle) * 1.02);
    bolt.rotation.z = Math.PI / 2;
  }

  const button = add(control, 'buttonCap', new THREE.SphereGeometry(0.84, 24, 14, 0, Math.PI * 2, 0, Math.PI / 2), red, 0, 2.0, 0);
  button.userData.restY = 2.0;
  add(alarm, 'stationAlarmButtonHalo', new THREE.TorusGeometry(0.94, 0.085, 8, 32), redHot, 0, 2.0, 0).rotation.x = Math.PI / 2;
  add(passive, 'stationPassiveButtonHalo', new THREE.TorusGeometry(0.94, 0.07, 8, 32), teal, 0, 1.96, 0).rotation.x = Math.PI / 2;

  // Four fuse towers and braided power looms sell the control's consequence.
  for (let i = 0; i < 4; i++) {
    const angle = Math.PI / 4 + i * Math.PI / 2;
    const x = Math.cos(angle) * 1.42;
    const z = Math.sin(angle) * 1.42;
    add(control, 'fuseTower', new THREE.CylinderGeometry(0.14, 0.18, 0.9, 10), copper, x, 1.12, z);
    add(control, 'fuseCage', new THREE.CylinderGeometry(0.23, 0.23, 0.48, 8, 1, true), dark, x, 1.34, z);
    add(alarm, 'stationAlarmFuse', new THREE.CylinderGeometry(0.075, 0.075, 0.38, 8), redHot, x, 1.35, z);
    add(passive, 'stationPassiveFuse', new THREE.CylinderGeometry(0.06, 0.06, 0.3, 8), teal, x, 1.35, z);
    const cablePoints = [
      new THREE.Vector3(x, 0.72, z),
      new THREE.Vector3(x * 1.35, 0.38, z * 1.35),
      new THREE.Vector3(x * 1.55, 0.18, z * 1.55),
    ];
    add(control, 'powerLoom', new THREE.TubeGeometry(new THREE.CatmullRomCurve3(cablePoints), 16, 0.085, 7, false), dark);
    const tracerPoints = cablePoints.map((point) => point.clone().add(new THREE.Vector3(0, 0.04, 0)));
    add(alarm, 'stationAlarmCableTracer', new THREE.TubeGeometry(new THREE.CatmullRomCurve3(tracerPoints), 16, 0.024, 5, false), red);
    add(passive, 'stationPassiveCableTracer', new THREE.TubeGeometry(new THREE.CatmullRomCurve3(tracerPoints), 16, 0.02, 5, false), teal);
  }

  // Low guard hoop keeps the pressable cap unobstructed from the approach.
  for (const side of [-1, 1]) {
    add(control, 'guardPost', new THREE.CylinderGeometry(0.08, 0.1, 1.25, 8), yellow, side * 1.42, 1.34, -0.58);
    const rail = add(control, 'guardRail', new THREE.CylinderGeometry(0.065, 0.065, 1.2, 8), yellow, side * 1.42, 1.91, 0);
    rail.rotation.x = Math.PI / 2;
  }
  return control;
}
