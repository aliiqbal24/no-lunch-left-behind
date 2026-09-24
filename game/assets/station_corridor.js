// Modular 40 m pressure corridor. Static structure is deliberately separated
// from the two lighting-state groups so the game can bake the shell while
// retaining an authored CODE RED -> safe-mode transition.
export default function (THREE) {
  const corridor = new THREE.Group();
  corridor.name = 'stationCorridor';
  const shell = new THREE.Group();
  shell.name = 'stationCorridorShell';
  const alarm = new THREE.Group();
  alarm.name = 'stationAlarmSystem';
  const passive = new THREE.Group();
  passive.name = 'stationPassiveSystem';
  corridor.add(shell, alarm, passive);

  const mat = (name, color, roughness, metalness, emissive = 0, emissiveIntensity = 0) => {
    const material = new THREE.MeshStandardMaterial({ color, roughness, metalness, emissive, emissiveIntensity });
    material.name = name;
    return material;
  };
  const ivory = mat('metal', 0xb9bbb5, 0.54, 0.34);
  const armor = mat('metal', 0x526f7a, 0.48, 0.5);
  const navy = mat('metal', 0x132736, 0.38, 0.7);
  const trench = mat('metal', 0x071722, 0.58, 0.5);
  const soot = mat('metal', 0x2d3038, 0.72, 0.28);
  const yellow = mat('metal', 0xf6c453, 0.53, 0.23);
  const copper = mat('metal', 0xb95f46, 0.46, 0.66);
  const red = mat('stationAlarmMaterial', 0xd7263d, 0.25, 0.24, 0xd7263d, 2.2);
  const redHot = mat('stationAlarmMaterial', 0xff8067, 0.2, 0.16, 0xff2f45, 3.2);
  const teal = mat('stationPassiveMaterial', 0x45c4b0, 0.23, 0.3, 0x45c4b0, 1.75);
  const cyan = mat('stationPassiveMaterial', 0xa4fff4, 0.18, 0.16, 0x45c4b0, 2.5);
  const glass = new THREE.MeshPhysicalMaterial({ color: 0x75c9df, roughness: 0.12, metalness: 0.08, transparent: true, opacity: 0.16, depthWrite: false, side: THREE.DoubleSide });
  glass.name = 'glass';
  const space = new THREE.MeshBasicMaterial({ color: 0x030814, side: THREE.DoubleSide, fog: false });
  const add = (parent, name, geometry, material, x = 0, y = 0, z = 0) => {
    const mesh = new THREE.Mesh(geometry, material);
    mesh.name = name;
    mesh.position.set(x, y, z);
    parent.add(mesh);
    return mesh;
  };

  add(shell, 'pressureDeck', new THREE.BoxGeometry(8.3, 0.22, 40), armor, 0, 0.11, 0);
  add(shell, 'deckUnderstructure', new THREE.BoxGeometry(8.65, 0.18, 40), navy, 0, 0.09, 0);
  for (const x of [-3.58, 3.58]) {
    add(shell, 'serviceTrench', new THREE.BoxGeometry(0.68, 0.12, 39.2), trench, x, 0.24, 0);
    add(shell, 'trenchRail', new THREE.BoxGeometry(0.07, 0.08, 39.2), yellow, x - Math.sign(x) * 0.39, 0.31, 0);
    for (let z = -18.5; z <= 18.5; z += 2) add(shell, 'trenchGrate', new THREE.BoxGeometry(0.56, 0.035, 0.12), copper, x, 0.32, z);
  }
  for (const x of [-2.2, 0, 2.2]) add(shell, 'laneInlay', new THREE.BoxGeometry(0.08, 0.025, 39), navy, x, 0.235, 0);
  for (let z = -18; z <= 18; z += 4) {
    for (const x of [-2.2, 0, 2.2]) add(passive, 'stationPassiveFloorNode', new THREE.BoxGeometry(0.13, 0.035, 0.82), teal, x, 0.255, z);
  }

  add(shell, 'ceilingArmor', new THREE.BoxGeometry(8.75, 0.25, 40), navy, 0, 5.3, 0);
  add(shell, 'ceilingServiceSpine', new THREE.BoxGeometry(1.38, 0.34, 39.4), soot, 0, 5.05, 0);
  for (const side of [-1, 1]) {
    add(shell, 'lowerPressureWall', new THREE.BoxGeometry(0.42, 1.55, 40), armor, side * 4.22, 0.78, 0);
    add(shell, 'upperPressureWall', new THREE.BoxGeometry(0.48, 1.18, 40), ivory, side * 4.2, 4.7, 0);
    add(shell, 'wallKickPlate', new THREE.BoxGeometry(0.16, 0.46, 40), navy, side * 3.98, 0.43, 0);
    const view = add(shell, 'windowVoid', new THREE.PlaneGeometry(40, 2.72), space, side * 4.52, 2.83, 0);
    view.rotation.y = Math.PI / 2;
    const pane = add(shell, 'pressureGlass', new THREE.PlaneGeometry(40, 2.56), glass, side * 4.0, 2.83, 0);
    pane.rotation.y = Math.PI / 2;
    for (const y of [1.52, 4.16]) add(shell, 'windowSeal', new THREE.BoxGeometry(0.26, 0.14, 40), navy, side * 4.0, y, 0);

    for (const [offset, radius, material] of [[0, 0.085, copper], [0.22, 0.065, navy], [0.39, 0.05, yellow]]) {
      const pipe = add(shell, 'serviceConduit', new THREE.CylinderGeometry(radius, radius, 39.2, 8), material,
        side * (3.96 - offset * 0.04), 1.08 - offset, 0);
      pipe.rotation.x = Math.PI / 2;
    }
    for (let z = -16; z <= 16; z += 8) {
      add(shell, 'conduitClamp', new THREE.BoxGeometry(0.24, 0.72, 0.18), soot, side * 3.93, 0.92, z);
      add(shell, 'windowMullion', new THREE.BoxGeometry(0.54, 2.82, 0.58), ivory, side * 4.17, 2.84, z);
      add(shell, 'mullionInset', new THREE.BoxGeometry(0.12, 2.12, 0.7), navy, side * 3.86, 2.84, z);
      add(shell, 'junctionCabinet', new THREE.BoxGeometry(0.38, 0.72, 1.02), navy, side * 3.88, 1.34, z + 2.75);
      for (const dy of [-0.2, 0, 0.2]) add(shell, 'cabinetVent', new THREE.BoxGeometry(0.06, 0.055, 0.62), copper, side * 3.66, 1.34 + dy, z + 2.75);
    }
  }

  for (let z = -20; z <= 20; z += 8) {
    for (const side of [-1, 1]) {
      add(shell, 'pressureRibColumn', new THREE.BoxGeometry(0.58, 4.7, 0.72), ivory, side * 4.02, 2.55, z);
      const shoulder = add(shell, 'pressureRibShoulder', new THREE.BoxGeometry(1.45, 0.48, 0.72), ivory, side * 3.42, 4.72, z);
      shoulder.rotation.z = side * 0.34;
      const lowerFastener = add(shell, 'ribFastener', new THREE.CylinderGeometry(0.105, 0.105, 0.08, 8), yellow, side * 3.88, 1.12, z + 0.38);
      lowerFastener.rotation.x = Math.PI / 2;
      const upperFastener = add(shell, 'ribFastener', new THREE.CylinderGeometry(0.105, 0.105, 0.08, 8), yellow, side * 3.88, 3.55, z + 0.38);
      upperFastener.rotation.x = Math.PI / 2;
    }
    add(shell, 'pressureRibCrown', new THREE.BoxGeometry(6.35, 0.5, 0.72), ivory, 0, 5.03, z);
    add(shell, 'crownMachinery', new THREE.BoxGeometry(1.05, 0.58, 1.18), soot, 0, 4.72, z);
    for (const x of [-0.32, 0.32]) add(shell, 'crownVent', new THREE.BoxGeometry(0.18, 0.08, 0.76), copper, x, 4.41, z);
    for (const side of [-1, 1]) {
      add(alarm, 'stationAlarmBeaconHousing', new THREE.CylinderGeometry(0.2, 0.25, 0.24, 10), soot, side * 2.74, 4.66, z);
      const beacon = add(alarm, 'stationAlarmBeacon', new THREE.CylinderGeometry(0.14, 0.18, 0.2, 10), redHot, side * 2.74, 4.5, z);
      beacon.userData.phase = z * 0.19 + side;
      const scanMaterial = new THREE.MeshBasicMaterial({ color: 0xd7263d, transparent: true, opacity: 0.14, depthWrite: false, side: THREE.DoubleSide, fog: false });
      scanMaterial.name = 'stationAlarmMaterial';
      const scan = add(alarm, 'stationAlarmScanProjector', new THREE.ConeGeometry(0.42, 2.5, 12, 1, true), scanMaterial, side * 2.74, 3.18, z);
      scan.rotation.z = Math.PI;
    }
  }

  for (let z = -18; z <= 18; z += 3) {
    for (const x of [-3.72, 3.72]) {
      const chevron = add(shell, 'warningChevron', new THREE.BoxGeometry(0.42, 0.035, 0.11), z % 6 ? yellow : copper, x, 0.31, z);
      chevron.rotation.y = Math.sign(x) * 0.6;
    }
  }
  add(alarm, 'stationAlarmCeilingLine', new THREE.BoxGeometry(0.18, 0.09, 38.6), red, 0, 4.68, 0);
  for (const side of [-1, 1]) add(alarm, 'stationAlarmWallLine', new THREE.BoxGeometry(0.08, 0.12, 37.8), red, side * 3.82, 4.15, 0);
  add(passive, 'stationPassiveCeilingLine', new THREE.BoxGeometry(0.2, 0.075, 38.8), cyan, 0, 4.67, 0);
  for (const side of [-1, 1]) add(passive, 'stationPassiveWallLine', new THREE.BoxGeometry(0.08, 0.12, 37.8), teal, side * 3.82, 4.15, 0);
  passive.visible = false;

  for (const side of [-1, 1]) {
    const positions = new Float32Array(72 * 3);
    let seed = side < 0 ? 404 : 1404;
    const random = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
    for (let i = 0; i < 72; i++) {
      positions[i * 3] = side * 4.47;
      positions[i * 3 + 1] = 1.68 + random() * 2.28;
      positions[i * 3 + 2] = -19.6 + random() * 39.2;
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const stars = new THREE.Points(geometry, new THREE.PointsMaterial({ color: 0xe8faff, size: 0.1, fog: false, depthWrite: false }));
    stars.name = 'corridorStars';
    shell.add(stars);
  }
  return corridor;
}
