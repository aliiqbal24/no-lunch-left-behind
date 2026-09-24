export default function (THREE) {
  const g = new THREE.Group();
  g.name = 'occupiedCivicMegastructure';
  const mat = (color, name, roughness, metalness = 0, glow = 0) => {
    const m = new THREE.MeshStandardMaterial({
      color, roughness, metalness,
      emissive: glow ? color : 0x000000,
      emissiveIntensity: glow,
    });
    m.name = name;
    return m;
  };
  const concrete = mat(0xcbb99b, 'plaster', 0.94);
  const warm = mat(0xf0d9b8, 'plaster', 0.87);
  const teal = mat(0x1f4e5f, 'metal', 0.5, 0.28);
  const tealEdge = mat(0x2e6f7c, 'metal', 0.42, 0.32);
  const dark = mat(0x142a35, 'metal', 0.37, 0.34);
  const glass = mat(0x183d4d, 'metal', 0.2, 0.52);
  const red = mat(0xd7263d, 'metal', 0.3, 0.32, 1.45);
  const orange = mat(0xff6b4a, 'metal', 0.42, 0.24, 0.38);
  const yellow = mat(0xf6c453, 'metal', 0.44, 0.18, 0.28);
  const rubber = mat(0x202735, 'metal', 0.78, 0.06);
  const addBox = (w, h, d, x, y, z, material, name = '') => {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material);
    mesh.position.set(x, y, z); mesh.name = name; g.add(mesh); return mesh;
  };
  const addCylinder = (rt, rb, h, x, y, z, material, sides = 14) => {
    const mesh = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, sides), material);
    mesh.position.set(x, y, z); g.add(mesh); return mesh;
  };
  const instance = (geometry, material, transforms) => {
    const mesh = new THREE.InstancedMesh(geometry, material, transforms.length);
    const matrix = new THREE.Matrix4();
    transforms.forEach(({ p, r = [0, 0, 0], s = [1, 1, 1] }, i) => {
      matrix.compose(new THREE.Vector3(...p), new THREE.Quaternion().setFromEuler(new THREE.Euler(...r)), new THREE.Vector3(...s));
      mesh.setMatrixAt(i, matrix);
    });
    mesh.instanceMatrix.needsUpdate = true; g.add(mesh); return mesh;
  };

  // Heavy primary massing: podium, deep tower, setback control floor.
  addBox(10.4, 3.2, 8.5, 0, 1.6, 0, concrete, 'civicPodium');
  addBox(8.6, 13.4, 7.25, 0, 9.7, -0.15, concrete, 'civicTower');
  addBox(6.8, 4.6, 6.25, 0, 18.55, -0.25, warm, 'controlSetback');
  addBox(9.35, 0.72, 7.9, 0, 3.36, -0.05, teal);
  addBox(8.95, 0.46, 7.55, 0, 16.55, -0.1, teal);
  addBox(7.3, 0.48, 6.75, 0, 20.9, -0.25, orange);

  // Monumental rounded buttresses and articulated vertical service spines.
  const buttressGeo = new THREE.CylinderGeometry(0.72, 0.92, 17.2, 16);
  instance(buttressGeo, warm, [
    { p: [-4.5, 9.4, 3.25] }, { p: [4.5, 9.4, 3.25] },
    { p: [-4.5, 9.4, -3.25] }, { p: [4.5, 9.4, -3.25] },
  ]);
  const spineGeo = new THREE.BoxGeometry(0.52, 11.8, 0.48);
  instance(spineGeo, teal, [
    { p: [-4.72, 10.1, 2.35] }, { p: [4.72, 10.1, 2.35] },
    { p: [-4.72, 10.1, -2.35] }, { p: [4.72, 10.1, -2.35] },
  ]);
  const clampGeo = new THREE.BoxGeometry(1.08, 0.25, 0.72);
  const clamps = [];
  for (const x of [-4.72, 4.72]) for (const z of [-2.35, 2.35]) {
    for (const y of [5.2, 8.8, 12.4, 15.6]) clamps.push({ p: [x, y, z] });
  }
  instance(clampGeo, orange, clamps);

  // Deep framed windows: backing, glass, mullions and evacuation sills.
  const frontWindows = [];
  for (const y of [5.0, 7.8, 10.6, 13.4]) for (const x of [-2.82, -0.94, 0.94, 2.82]) frontWindows.push({ p: [x, y, 3.64] });
  instance(new THREE.BoxGeometry(1.5, 1.35, 0.24), teal, frontWindows);
  instance(new THREE.BoxGeometry(1.18, 1.02, 0.16), glass, frontWindows.map(({ p }) => ({ p: [p[0], p[1], 3.82] })));
  instance(new THREE.BoxGeometry(0.12, 1.08, 0.08), warm, frontWindows.map(({ p }) => ({ p: [p[0], p[1], 3.92] })));
  instance(new THREE.BoxGeometry(1.42, 0.12, 0.34), yellow, frontWindows.map(({ p }) => ({ p: [p[0], p[1] - 0.78, 3.76] })));
  const sideWindows = [];
  for (const side of [-1, 1]) for (const y of [5.2, 8.1, 11, 13.9]) {
    for (const z of [-1.9, 0.1, 2.1]) sideWindows.push({ p: [side * 4.32, y, z], r: [0, Math.PI / 2, 0] });
  }
  instance(new THREE.BoxGeometry(1.45, 1.05, 0.2), teal, sideWindows);
  instance(new THREE.BoxGeometry(1.12, 0.76, 0.13), glass,
    sideWindows.map(({ p, r }) => ({ p: [p[0] + Math.sign(p[0]) * 0.17, p[1], p[2]], r })));

  // Rear service elevation: cooling cassettes, conduits and lockdown status
  // rails keep the structure fully authored even when seen from the launch pad.
  const rearModules = [];
  for (const y of [5.2, 8.15, 11.1, 14.05]) {
    for (const x of [-2.75, -0.92, 0.92, 2.75]) rearModules.push({ p: [x, y, -3.83] });
  }
  instance(new THREE.BoxGeometry(1.46, 1.52, 0.24), teal, rearModules);
  instance(new THREE.BoxGeometry(1.14, 1.18, 0.13), dark,
    rearModules.map(({ p }) => ({ p: [p[0], p[1], -4.01] })));
  const rearFins = [];
  for (const { p } of rearModules) for (const dx of [-0.38, 0, 0.38]) {
    rearFins.push({ p: [p[0] + dx, p[1], -4.1] });
  }
  instance(new THREE.BoxGeometry(0.08, 0.98, 0.08), warm, rearFins);
  for (const x of [-3.72, 3.72]) {
    addCylinder(0.13, 0.13, 11.4, x, 9.9, -4.08, orange, 9);
    for (const y of [5.1, 8.75, 12.4, 15.55]) {
      addBox(0.62, 0.17, 0.46, x, y, -4.02, yellow);
    }
  }
  addBox(6.8, 0.18, 0.16, 0, 16.05, -4.12, red, 'rearLockdownRail');
  addBox(5.4, 0.26, 0.48, 0, 3.62, -4.02, tealEdge, 'rearServicePlinth');

  // AI-sealed public entrance: canopy, mechanical shutter, pistons and lock rail.
  addBox(5.9, 3.05, 0.55, -0.65, 1.62, 4.35, teal, 'shutterFrame');
  addBox(5.28, 2.48, 0.36, -0.65, 1.45, 4.68, dark, 'blastShutter');
  const shutterSlats = [];
  for (let i = 0; i < 9; i++) shutterSlats.push({ p: [-0.65, 0.42 + i * 0.26, 4.91] });
  instance(new THREE.BoxGeometry(5.02, 0.09, 0.09), tealEdge, shutterSlats);
  addBox(5.45, 0.15, 0.12, -0.65, 2.68, 4.93, red, 'lockdownRail');
  addBox(6.8, 0.42, 1.65, -0.45, 3.35, 4.55, teal, 'entryCanopy').rotation.x = -0.06;
  addBox(5.9, 0.12, 1.34, -0.45, 3.18, 4.62, red);
  for (const x of [-3.05, 1.75]) {
    addCylinder(0.14, 0.14, 2.65, x, 1.5, 4.95, dark, 10);
    addCylinder(0.24, 0.24, 0.22, x, 2.82, 4.95, red, 10);
  }

  // Evacuation balcony and guard hardware give the facade real depth.
  addBox(8.15, 0.34, 1.55, 0, 15.55, 4.08, teal, 'evacuationBalcony');
  addBox(8.15, 0.16, 0.18, 0, 16.62, 4.72, warm);
  const railPosts = [];
  for (let x = -3.9; x <= 3.91; x += 0.78) railPosts.push({ p: [x, 16.05, 4.72] });
  instance(new THREE.CylinderGeometry(0.045, 0.045, 1.08, 7), warm, railPosts);
  for (const x of [-3.45, 3.45]) {
    addBox(0.72, 1.05, 0.22, x, 16.02, 4.88, dark);
    addBox(0.42, 0.14, 0.12, x, 16.05, 5.02, red);
  }

  // Service pipework travels around a corner rather than reading as decoration.
  for (const side of [-1, 1]) {
    const pipePath = new THREE.CatmullRomCurve3([
      new THREE.Vector3(side * 4.68, 3.8, -2.5), new THREE.Vector3(side * 5.05, 6.1, -2.5),
      new THREE.Vector3(side * 5.05, 12.8, -1.4), new THREE.Vector3(side * 4.35, 17.2, -1.1),
    ]);
    g.add(new THREE.Mesh(new THREE.TubeGeometry(pipePath, 18, 0.13, 7, false), orange));
    for (const y of [6.1, 9.4, 12.7]) {
      const bracket = addBox(0.58, 0.18, 0.62, side * 4.78, y, -2.1, dark);
      bracket.rotation.z = side * 0.12;
    }
    const fan = new THREE.Group();
    const rim = new THREE.Mesh(new THREE.TorusGeometry(0.72, 0.12, 8, 22), teal);
    rim.rotation.y = Math.PI / 2; fan.add(rim);
    const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 0.22, 10), orange);
    hub.rotation.z = Math.PI / 2; fan.add(hub);
    for (let i = 0; i < 5; i++) {
      const blade = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.12, 0.08), rubber);
      blade.position.y = 0.3; blade.rotation.x = i * Math.PI * 2 / 5; fan.add(blade);
    }
    fan.position.set(side * 4.78, 6.9, -0.1); fan.rotation.y = side < 0 ? Math.PI : 0; g.add(fan);
  }

  // Machine crown: lathed control drum, sensor ring, dish and red paired optics.
  addBox(7.45, 0.58, 6.7, 0, 21.15, -0.25, dark, 'roofDeck');
  const crownProfile = [new THREE.Vector2(0, 0), new THREE.Vector2(2.75, 0), new THREE.Vector2(3.05, 0.45),
    new THREE.Vector2(2.65, 1.05), new THREE.Vector2(2.18, 1.35), new THREE.Vector2(0, 1.35)];
  const crown = new THREE.Mesh(new THREE.LatheGeometry(crownProfile, 24), teal);
  crown.position.y = 21.42; g.add(crown);
  const sensorRing = new THREE.Mesh(new THREE.TorusGeometry(2.34, 0.16, 9, 36), red);
  sensorRing.position.y = 22.47; sensorRing.rotation.x = Math.PI / 2; g.add(sensorRing);
  addCylinder(0.2, 0.26, 2.65, 0, 24.05, -0.2, dark, 10);
  const dish = new THREE.Mesh(new THREE.SphereGeometry(1.28, 18, 9, 0, Math.PI * 2, 0, Math.PI / 3.5), warm);
  dish.position.set(0, 24.72, -0.2); dish.rotation.x = -0.48; g.add(dish);
  addCylinder(0.1, 0.1, 1.65, 0, 25.45, 0.25, orange, 8).rotation.z = -0.45;
  for (const x of [-0.56, 0.56]) {
    addCylinder(0.07, 0.09, 1.75, x, 23.78, 1.12, dark, 8);
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.19, 12, 8), red);
    eye.position.set(x, 24.68, 1.12); g.add(eye);
  }

  // Restrained damage: displaced armor plates and hot exposed fasteners.
  for (const [x, y, angle] of [[-3.58, 6.4, -0.16], [3.55, 9.2, 0.13], [-3.4, 12.7, 0.1]]) {
    const plate = addBox(1.05, 1.65, 0.16, x, y, 3.91, warm); plate.rotation.z = angle;
    for (const dy of [-0.58, 0.58]) {
      const bolt = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.08, 8), orange);
      bolt.position.set(x, y + dy, 4.03); bolt.rotation.x = Math.PI / 2; g.add(bolt);
    }
  }

  const centre = new THREE.Box3().setFromObject(g).getCenter(new THREE.Vector3());
  g.children.forEach((child) => { child.position.x -= centre.x; child.position.z -= centre.z; });
  g.traverse((object) => { if (object.isMesh) { object.castShadow = true; object.receiveShadow = true; } });
  return g;
}
