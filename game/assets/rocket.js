export default function (THREE) {
  const g = new THREE.Group(); g.name = 'lastEvacuationRocket';
  const mat = (color, name, roughness, metalness = 0, glow = 0) => {
    const m = new THREE.MeshStandardMaterial({ color, roughness, metalness,
      emissive: glow ? color : 0x000000, emissiveIntensity: glow });
    m.name = name; return m;
  };
  const ivory = mat(0xf7f3e8, 'metal', 0.42, 0.24);
  const ivoryShade = mat(0xd9d6ca, 'metal', 0.5, 0.22);
  const red = mat(0xd7263d, 'metal', 0.34, 0.28, 0.28);
  const orange = mat(0xff6b4a, 'metal', 0.34, 0.32, 0.32);
  const yellow = mat(0xf6c453, 'metal', 0.4, 0.24, 0.38);
  const teal = mat(0x45c4b0, 'metal', 0.2, 0.35, 0.9);
  const dark = mat(0x172b33, 'metal', 0.32, 0.58);
  const recess = new THREE.MeshStandardMaterial({ color: 0x07131a, roughness: 1, side: THREE.DoubleSide }); recess.name = 'metal';
  const addBox = (parent, w, h, d, x, y, z, material, name = '') => {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material);
    mesh.position.set(x, y, z); mesh.name = name; parent.add(mesh); return mesh;
  };
  const addCylinder = (parent, rt, rb, h, x, y, z, material, sides = 20) => {
    const mesh = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, sides), material);
    mesh.position.set(x, y, z); parent.add(mesh); return mesh;
  };

  // Multi-stage hull with a deliberately open boarding bay facing the runner (-Z).
  addCylinder(g, 1.48, 1.72, 4.25, 0, 2.45, 0, ivoryShade, 28);
  addCylinder(g, 1.48, 1.48, 0.72, 0, 4.85, 0, dark, 28);
  for (const [start, length] of [[0, Math.PI - 0.58], [Math.PI + 0.58, Math.PI - 0.58]]) {
    const side = new THREE.Mesh(new THREE.CylinderGeometry(1.46, 1.48, 2.05, 28, 1, true, start, length), ivory);
    side.position.y = 5.95; g.add(side);
  }
  addCylinder(g, 1.34, 1.45, 3.25, 0, 8.6, 0, ivory, 28);
  addCylinder(g, 1.12, 1.34, 1.2, 0, 10.82, 0, ivoryShade, 28);
  for (const y of [0.66, 4.52, 7.03, 10.2]) {
    const ring = new THREE.Mesh(new THREE.TorusGeometry(y < 1 ? 1.7 : y > 10 ? 1.2 : 1.48, 0.13, 9, 36), y === 7.03 ? orange : dark);
    ring.position.y = y; ring.rotation.x = Math.PI / 2; g.add(ring);
  }

  // Ogive nose from a lathed profile gives the focal silhouette a designed curve.
  const noseProfile = [new THREE.Vector2(0, 0), new THREE.Vector2(1.12, 0), new THREE.Vector2(1.02, 0.7),
    new THREE.Vector2(0.78, 1.5), new THREE.Vector2(0.42, 2.35), new THREE.Vector2(0.08, 3.05), new THREE.Vector2(0, 3.16)];
  const nose = new THREE.Mesh(new THREE.LatheGeometry(noseProfile, 28), orange);
  nose.position.y = 11.42; g.add(nose);
  const noseBand = new THREE.Mesh(new THREE.TorusGeometry(1.03, 0.1, 8, 32), red);
  noseBand.position.y = 11.48; noseBand.rotation.x = Math.PI / 2; g.add(noseBand);
  const tip = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.08, 0.55, 10), dark);
  tip.position.y = 14.78; g.add(tip);
  const tipLight = new THREE.Mesh(new THREE.SphereGeometry(0.11, 10, 7), teal);
  tipLight.position.y = 15.08; g.add(tipLight);

  // Side evacuation boosters make the craft feel capable of lifting a city-scale payload.
  for (const side of [-1, 1]) {
    addCylinder(g, 0.48, 0.62, 4.75, side * 1.62, 3.35, 0.18, ivoryShade, 20);
    const boosterNose = new THREE.Mesh(new THREE.ConeGeometry(0.48, 1.2, 20), orange);
    boosterNose.position.set(side * 1.62, 6.3, 0.18); g.add(boosterNose);
    addCylinder(g, 0.34, 0.46, 0.65, side * 1.62, 0.62, 0.18, dark, 16);
    for (const y of [1.25, 3.25, 5.28]) {
      const collar = new THREE.Mesh(new THREE.TorusGeometry(0.53, 0.08, 7, 24), y === 3.25 ? red : dark);
      collar.position.set(side * 1.62, y, 0.18); collar.rotation.x = Math.PI / 2; g.add(collar);
    }
    addBox(g, 0.24, 3.2, 0.3, side * 1.34, 3.3, 0.18, orange);
  }

  // Boarding chamber and sliding pressure doors keep the close transition physical.
  const hatch = new THREE.Group(); hatch.name = 'boardingHatch';
  const shroud = new THREE.Group(); shroud.name = 'boardingShroud';
  addBox(shroud, 1.72, 2.12, 0.14, 0, 5.28, 0.74, recess, 'boardingOccluder');
  for (const x of [-0.88, 0.88]) addBox(shroud, 0.16, 2.18, 2.05, x, 5.28, -0.28, recess);
  addBox(shroud, 1.9, 0.16, 2.0, 0, 6.33, -0.28, recess);
  addBox(shroud, 1.9, 0.16, 2.0, 0, 4.23, -0.28, recess);
  hatch.add(shroud);
  for (const x of [-0.88, 0.88]) {
    addBox(hatch, 0.2, 2.38, 0.24, x, 5.28, -1.43, orange);
    addBox(hatch, 0.08, 1.92, 0.07, x, 5.28, -1.6, teal);
    for (const y of [4.37, 6.19]) {
      const guide = new THREE.Mesh(new THREE.SphereGeometry(0.11, 9, 6), yellow);
      guide.position.set(x, y, -1.62); hatch.add(guide);
    }
  }
  for (const y of [4.15, 6.41]) addBox(hatch, 1.95, 0.2, 0.26, 0, y, -1.43, orange);
  for (const side of [-1, 1]) {
    const door = addBox(hatch, 0.67, 2.1, 0.16, side * 0.335, 5.28, -1.56, dark,
      side < 0 ? 'boardingDoorLeft' : 'boardingDoorRight');
    addBox(door, 0.38, 0.11, 0.05, 0, 0.53, -0.12, teal);
    addBox(door, 0.18, 0.55, 0.05, -side * 0.16, -0.38, -0.12, ivory);
    for (const y of [-0.76, 0.76]) {
      const lock = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.08, 8), red);
      lock.position.set(-side * 0.2, y, -0.13); lock.rotation.x = Math.PI / 2; door.add(lock);
    }
  }
  g.add(hatch);

  // Deep observation ports, hull seams, service access panels and RCS pods.
  for (const x of [-0.52, 0, 0.52]) {
    const window = new THREE.Mesh(new THREE.SphereGeometry(0.3, 14, 9), teal);
    window.position.set(x, 8.75, -1.28); window.scale.set(0.82, 0.82, 0.2); g.add(window);
    const bezel = new THREE.Mesh(new THREE.TorusGeometry(0.28, 0.055, 8, 20), dark);
    bezel.position.set(x, 8.75, -1.34); g.add(bezel);
  }
  for (const side of [-1, 1]) {
    const rcs = addBox(g, 0.46, 0.72, 0.56, side * 1.42, 9.6, -0.15, dark);
    rcs.rotation.z = side * 0.12;
    for (const y of [9.42, 9.72]) {
      const port = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.13, 0.18, 10), orange);
      port.position.set(side * 1.65, y, -0.16); port.rotation.z = Math.PI / 2; g.add(port);
    }
  }
  for (let i = 0; i < 10; i++) {
    const a = i / 10 * Math.PI * 2;
    const seam = addBox(g, 0.035, 2.8, 0.045, Math.sin(a) * 1.49, 2.65, Math.cos(a) * 1.49, dark);
    seam.rotation.y = a;
  }
  for (const [x, y] of [[-0.8, 2.2], [0.82, 3.0], [-0.72, 9.55], [0.76, 10.05]]) {
    const panel = addBox(g, 0.58, 0.85, 0.08, x, y, -1.5, ivory);
    panel.rotation.z = x * 0.04;
    for (const dx of [-0.22, 0.22]) for (const dy of [-0.33, 0.33]) {
      const bolt = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.05, 7), orange);
      bolt.position.set(x + dx, y + dy, -1.57); bolt.rotation.x = Math.PI / 2; g.add(bolt);
    }
  }

  // Four sculpted fins and a seven-nozzle engine cluster fill the launch silhouette.
  const finShape = new THREE.Shape();
  finShape.moveTo(0, 0); finShape.lineTo(1.45, 0); finShape.lineTo(1.1, 2.65); finShape.lineTo(0.18, 1.65); finShape.closePath();
  const finGeo = new THREE.ExtrudeGeometry(finShape, { depth: 0.18, bevelEnabled: true, bevelSize: 0.06, bevelThickness: 0.05, bevelSegments: 2 });
  finGeo.translate(0, 0, -0.09);
  for (let i = 0; i < 4; i++) {
    const a = i / 4 * Math.PI * 2;
    const fin = new THREE.Mesh(finGeo, red);
    fin.position.set(Math.sin(a) * 1.42, 0.75, Math.cos(a) * 1.42); fin.rotation.y = a; g.add(fin);
  }
  const nozzlePositions = [[0, 0], [0.58, 0], [-0.58, 0], [0.29, 0.5], [-0.29, 0.5], [0.29, -0.5], [-0.29, -0.5]];
  for (const [x, z] of nozzlePositions) {
    const bell = addCylinder(g, 0.25, 0.4, 0.82, x, 0.42, z, dark, 16);
    const lip = new THREE.Mesh(new THREE.TorusGeometry(0.38, 0.06, 7, 18), orange);
    lip.position.set(x, 0.04, z); lip.rotation.x = Math.PI / 2; g.add(lip);
  }

  const bounds = new THREE.Box3().setFromObject(g);
  const centre = bounds.getCenter(new THREE.Vector3());
  g.children.forEach((child) => { child.position.x -= centre.x; child.position.y -= bounds.min.y; child.position.z -= centre.z; });
  g.traverse((o) => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
  return g;
}
