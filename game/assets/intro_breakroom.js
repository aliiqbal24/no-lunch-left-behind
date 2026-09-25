// The interior occupies the left rear civic building at the City Run start.
// Every piece is authored geometry; moving fittings are preserved by ASSET.
export default function (THREE) {
  const room = new THREE.Group();
  room.name = 'continuityBreakroom';
  const material = (color, roughness = 0.7, metalness = 0, emissive = 0) => {
    const m = new THREE.MeshStandardMaterial({ color, roughness, metalness, emissive: emissive ? color : 0,
      emissiveIntensity: emissive });
    m.name = metalness > 0.18 ? 'metal' : 'plaster';
    return m;
  };
  const ivory = material(0xf2e8d0, 0.84);
  const bone = material(0xfff7e6, 0.73);
  const teal = material(0x1f4e5f, 0.46, 0.34);
  const tealEdge = material(0x367783, 0.4, 0.3);
  const navy = material(0x172b33, 0.62, 0.22);
  const rubber = material(0x27343b, 0.93);
  const steel = material(0xb3c9c5, 0.32, 0.72);
  const yellow = material(0xf6c453, 0.58, 0.08);
  const orange = material(0xff6b4a, 0.55, 0.17);
  const red = material(0xd7263d, 0.35, 0.25, 1.4);
  const mint = material(0x94e6ce, 0.32, 0.1, 1.05);
  const glass = new THREE.MeshPhysicalMaterial({ color: 0x9ddbcf, transparent: true, opacity: 0.18,
    metalness: 0.12, roughness: 0.18, side: THREE.DoubleSide, depthWrite: false });
  glass.name = 'glass';
  const box = (parent, w, h, d, x, y, z, mat, name = '') => {
    const o = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
    o.position.set(x, y, z); o.name = name; parent.add(o); return o;
  };
  const cylinder = (parent, rt, rb, h, x, y, z, mat, sides = 14, name = '') => {
    const o = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, sides), mat);
    o.position.set(x, y, z); o.name = name; parent.add(o); return o;
  };
  const tube = (parent, points, radius, mat) => {
    const path = new THREE.CatmullRomCurve3(points.map((p) => new THREE.Vector3(...p)));
    const mesh = new THREE.Mesh(new THREE.TubeGeometry(path, 20, radius, 6, false), mat);
    parent.add(mesh); return mesh;
  };

  // Architectural massing deliberately matches the game's deep-teal civic facade.
  box(room, 7.25, 0.24, 6.5, 0, -0.12, 0, navy, 'breakroomSlab');
  box(room, 7.25, 0.16, 6.5, 0, 4.2, 0, teal, 'ceilingDeck');
  box(room, 7.25, 4.2, 0.22, 0, 2.1, -3.24, ivory, 'rearWall');
  box(room, 0.24, 4.2, 6.5, -3.62, 2.1, 0, ivory, 'leftWall');
  box(room, 0.22, 4.2, 3.25, 3.62, 2.1, -1.62, ivory, 'streetWallRear');
  box(room, 0.22, 1.12, 2.95, 3.62, 3.64, 1.58, ivory, 'streetWallLintel');
  box(room, 0.22, 1.2, 2.95, 3.62, 0.6, 1.58, ivory, 'streetWallSill');
  box(room, 0.24, 4.2, 0.45, 3.62, 2.1, 3.0, ivory, 'streetWallPier');
  for (let x = -3.35; x <= 3.35; x += 0.67) for (let z = -2.95; z <= 2.95; z += 0.67) {
    box(room, 0.645, 0.02, 0.645, x, 0.012, z, (Math.round(x * 2 + z * 3) & 1) ? bone : ivory);
  }
  for (const x of [-3.48, 3.48]) box(room, 0.08, 0.23, 6.2, x, 0.2, 0, teal);
  box(room, 6.85, 0.22, 0.09, 0, 0.2, -3.12, teal);
  for (const x of [-2.9, -1.45, 0, 1.45, 2.9]) {
    box(room, 0.12, 0.3, 6.28, x, 4.04, 0, teal, 'ceilingRib');
    for (const z of [-2.6, 2.5]) cylinder(room, 0.11, 0.11, 0.035, x, 3.88, z, steel, 10);
  }
  for (const y of [0.43, 3.7]) box(room, 0.1, 0.1, 6.1, -3.42, y, 0, tealEdge);
  for (const z of [-2.6, -0.7, 1.4]) box(room, 0.1, 3.45, 0.1, -3.42, 2.05, z, tealEdge);

  // Window: real opening, deep mullions, glass, evacuation street silhouettes.
  box(room, 0.15, 2.1, 2.52, 3.55, 2.23, 1.45, teal, 'windowFrame');
  box(room, 0.17, 0.12, 2.55, 3.48, 2.23, 1.45, steel);
  box(room, 0.12, 2.02, 0.1, 3.46, 2.22, 1.45, steel);
  box(room, 0.025, 1.96, 2.4, 3.53, 2.2, 1.45, glass, 'streetGlass');
  box(room, 0.36, 0.19, 2.66, 3.45, 1.22, 1.45, teal, 'windowSill');
  box(room, 0.22, 0.32, 2.3, 3.4, 1.43, 1.45, navy);
  for (const z of [0.45, 1.2, 2.1]) {
    box(room, 0.08, 0.21, 0.23, 3.32, 1.64, z, orange, 'streetReflection');
  }
  // Deep side exit to the same road, visible when the hero storms out.
  box(room, 0.24, 3.2, 0.22, 3.58, 1.6, -0.03, teal, 'exitJamb');
  box(room, 0.24, 3.2, 0.22, 3.58, 1.6, -1.34, teal, 'exitJamb');
  box(room, 0.34, 0.28, 1.62, 3.52, 3.22, -0.69, teal, 'exitLintel');
  box(room, 0.2, 0.13, 1.32, 3.5, 0.14, -0.69, yellow, 'threshold');

  // Fridge body and nested cavity: cold light makes the absent lunch readable.
  box(room, 2.13, 0.16, 1.38, -2.05, 2.84, -2.37, teal, 'fridgeTop');
  box(room, 2.13, 0.16, 1.38, -2.05, 0.08, -2.37, teal, 'fridgeFoot');
  box(room, 0.15, 2.76, 1.38, -3.04, 1.46, -2.37, teal, 'fridgeSide');
  box(room, 0.15, 2.76, 1.38, -1.06, 1.46, -2.37, teal, 'fridgeSide');
  box(room, 1.88, 2.76, 0.14, -2.05, 1.46, -3.01, teal, 'fridgeBack');
  box(room, 1.78, 2.56, 0.025, -2.05, 1.46, -2.92, navy, 'fridgeCavity');
  for (const x of [-3.03, -1.07]) box(room, 0.09, 2.7, 0.12, x, 1.46, -1.62, steel, 'fridgeRim');
  for (const y of [0.12, 2.8]) box(room, 1.9, 0.09, 0.12, -2.05, y, -1.62, steel, 'fridgeRim');
  for (const y of [0.8, 1.44, 2.12]) {
    box(room, 1.68, 0.07, 0.7, -2.05, y, -1.96, glass, 'shelfGlass');
    box(room, 1.68, 0.06, 0.08, -2.05, y, -1.58, steel, 'shelfEdge');
  }
  box(room, 1.18, 0.035, 0.55, -2.05, 1.5, -1.94, yellow, 'emptyLunchOutlineBack');
  box(room, 0.035, 0.09, 0.55, -2.63, 1.56, -1.94, yellow);
  box(room, 0.035, 0.09, 0.55, -1.47, 1.56, -1.94, yellow);
  for (const x of [-2.67, -1.43]) box(room, 0.07, 2.54, 0.07, x, 1.46, -1.45, mint, 'fridgeLight');
  box(room, 1.65, 0.07, 0.06, -2.05, 2.73, -1.46, mint);
  const fridgeDoor = new THREE.Group(); fridgeDoor.name = 'fridgeDoor';
  fridgeDoor.position.set(-3.05, 0, -1.44); room.add(fridgeDoor);
  box(fridgeDoor, 2.02, 2.87, 0.18, 1.01, 1.46, 0.03, bone, 'fridgeDoorSlab');
  box(fridgeDoor, 1.86, 2.7, 0.05, 1.01, 1.46, -0.07, rubber, 'doorGasket');
  box(fridgeDoor, 1.65, 2.48, 0.06, 1.01, 1.46, -0.115, steel, 'doorLiner');
  box(fridgeDoor, 0.1, 1.34, 0.19, 1.76, 1.55, 0.19, teal, 'doorHandle');
  for (const y of [0.7, 1.25, 1.8, 2.35]) box(fridgeDoor, 1.56, 0.028, 0.11, 0.98, y, -0.18, tealEdge, 'doorShelf');
  for (const x of [0.18, 1.84]) for (const y of [0.2, 2.75]) cylinder(fridgeDoor, 0.05, 0.05, 0.045, x, y, 0.145, steel, 10);
  for (let i = 0; i < 7; i++) box(room, 0.13, 0.035, 0.04, -2.05 + (i - 3) * 0.2, 2.86, -1.65, navy, 'compressorVent');

  // Table and civic canteen furnishings. Robot remains in peripheral vision.
  box(room, 2.15, 0.16, 1.15, 1.35, 0.92, -0.8, teal, 'canteenTable');
  box(room, 2.27, 0.035, 1.27, 1.35, 1.03, -0.8, bone, 'tableTop');
  for (const x of [0.52, 2.18]) for (const z of [-1.15, -0.45]) {
    cylinder(room, 0.065, 0.085, 0.85, x, 0.43, z, steel, 10, 'tableLeg');
    cylinder(room, 0.12, 0.12, 0.04, x, 0.035, z, rubber, 10);
  }
  box(room, 1.03, 0.13, 0.9, 1.44, 0.49, -1.9, teal, 'coworkerChairSeat');
  box(room, 1.07, 0.9, 0.15, 1.44, 1.03, -2.3, teal, 'coworkerChairBack');
  for (const x of [1.07, 1.8]) for (const z of [-2.19, -1.63]) cylinder(room, 0.035, 0.055, 0.47, x, 0.24, z, steel, 8);
  box(room, 0.48, 0.06, 0.38, 0.79, 1.075, -0.69, orange, 'stackedNapkins');
  for (const x of [0.9, 1.0, 1.1]) box(room, 0.035, 0.08, 0.4, x, 1.12, -0.69, bone);
  cylinder(room, 0.2, 0.2, 0.025, 2.34, 1.08, -0.68, rubber, 18, 'coffeeCoaster');

  // Coffee service: rounded tanks, valve, steam nozzles, discarded mugs.
  box(room, 1.6, 0.82, 0.57, 1.22, 0.46, -2.82, teal, 'coffeeCabinet');
  box(room, 1.72, 0.08, 0.68, 1.22, 0.92, -2.8, bone, 'coffeeCounter');
  box(room, 1.0, 0.82, 0.5, 1.43, 1.36, -2.83, navy, 'coffeeMachine');
  box(room, 0.86, 0.14, 0.53, 1.43, 1.78, -2.83, steel, 'coffeeMachineCrown');
  for (const x of [1.1, 1.42, 1.74]) cylinder(room, 0.09, 0.09, 0.055, x, 1.76, -2.51, yellow, 14, 'coffeeDial');
  cylinder(room, 0.17, 0.19, 0.34, 0.9, 1.1, -2.52, bone, 14, 'counterCup');
  cylinder(room, 0.25, 0.25, 0.035, 1.43, 1.05, -2.42, steel, 18, 'dripTray');
  tube(room, [[1.78,1.38,-2.54],[1.9,1.24,-2.52],[1.88,1.05,-2.5]], 0.035, steel);
  box(room, 1.62, 0.11, 0.42, 1.23, 2.52, -3.07, teal, 'cupShelf');
  for (const x of [0.73, 1.06, 1.39, 1.72]) cylinder(room, 0.115, 0.105, 0.3, x, 2.7, -3.02, (x < 1.2 ? yellow : bone), 12);

  // Bureaucratic charm: noticeboard, ducts, signs without baked lettering.
  box(room, 1.62, 1.16, 0.14, -0.03, 2.45, -3.13, teal, 'noticeBoard');
  box(room, 1.47, 1.0, 0.045, -0.03, 2.45, -3.02, yellow);
  for (const [x,y,w,h] of [[-0.46,2.59,0.4,0.46],[0.21,2.63,0.48,0.43],[-0.02,2.12,0.55,0.24]]) {
    box(room, w, h, 0.025, x, y, -2.98, bone, 'noticePaper');
    cylinder(room, 0.04, 0.04, 0.03, x, y + h * 0.37, -2.95, red, 8);
  }
  for (let i = 0; i < 6; i++) box(room, 0.34, 0.045, 0.025, -0.49, 2.73 - i * 0.06, -2.94, navy, 'paperRule');
  for (const x of [-3.1, 3.1]) {
    tube(room, [[x,3.7,-2.9],[x,3.73,-1.8],[x,3.75,0],[x,3.76,2.45]], 0.075, teal);
    for (const z of [-2.3, -0.5, 1.2]) box(room, 0.28, 0.1, 0.28, x, 3.82, z, steel);
  }
  cylinder(room, 0.72, 0.72, 0.28, 0.2, 3.89, -0.1, teal, 18, 'ceilingVent');
  for (const z of [-0.4, -0.2, 0, 0.2]) box(room, 1.02, 0.02, 0.055, 0.2, 3.74, z, navy);
  for (const x of [-1.1, 1.2]) {
    cylinder(room, 0.065, 0.065, 0.42, x, 3.93, 0.9, steel, 10);
    cylinder(room, 0.43, 0.48, 0.15, x, 3.62, 0.9, teal, 18, 'hangingLamp');
    cylinder(room, 0.33, 0.33, 0.03, x, 3.52, 0.9, mint, 18, 'lampLens');
  }
  const alarm = new THREE.Group(); alarm.name = 'breakroomAlarm';
  alarm.position.set(2.6, 3.65, -3.08); room.add(alarm);
  box(alarm, 0.56, 0.32, 0.14, 0, 0, 0, navy);
  cylinder(alarm, 0.21, 0.24, 0.16, 0, 0.11, 0.12, red, 16, 'alarmBeacon');
  for (const x of [-0.21, 0.21]) box(alarm, 0.035, 0.32, 0.2, x, 0.08, 0.12, steel);
  const warmLight = new THREE.PointLight(0xffcc86, 16, 7, 2); warmLight.position.set(-0.4, 3.1, 0.8); room.add(warmLight);
  const fridgeLight = new THREE.PointLight(0x9deedc, 4.4, 3, 2); fridgeLight.position.set(-2.05, 1.55, -1.22); room.add(fridgeLight);
  const alarmLight = new THREE.PointLight(0xff2039, 0, 5, 2); alarmLight.position.set(2.55, 3.45, -2.8); room.add(alarmLight);
  // The three exterior faces are mounted inside the sealed City facade; the
  // playable/cinematic face is the open fourth wall.
  room.userData.mounts = ['back', 'left', 'right'];
  room.position.y = 0.24;
  room.userData.joints = { fridgeDoor, alarm, warmLight, fridgeLight, alarmLight };
  return room;
}
