export default function (THREE) {
  const g = new THREE.Group();
  g.name = 'aiOccupiedBoulevard';
  const material = (color, name, roughness, emissive = 0, opacity = 1, metalness = 0.08) => {
    const m = new THREE.MeshStandardMaterial({
      color, roughness, metalness,
      emissive: emissive ? color : 0x000000,
      emissiveIntensity: emissive,
      transparent: opacity < 1, opacity, depthWrite: opacity >= 1,
    });
    m.name = name; return m;
  };
  const asphalt = material(0x1c2d38, 'ground', 0.98);
  const repair = material(0x293e48, 'ground', 0.91);
  const shoulder = material(0x35505b, 'ground', 0.9);
  const curb = material(0xe1cfaf, 'stone', 0.94);
  const curbDark = material(0x8fa0a3, 'stone', 0.84);
  const paint = material(0xffefd0, 'ground', 0.82);
  const red = material(0xd7263d, 'metal', 0.32, 1.45, 1, 0.28);
  const grid = material(0xd7263d, 'metal', 0.42, 0.92, 0.78, 0.22);
  const warning = material(0xff6b4a, 'metal', 0.42, 0.9, 1, 0.22);
  const yellow = material(0xf6c453, 'tile', 0.72, 0.18);
  const steel = material(0x152b35, 'metal', 0.5, 0, 1, 0.48);
  const teal = material(0x45c4b0, 'metal', 0.38, 0.34, 1, 0.25);
  const addBox = (w, h, d, x, y, z, mat) => {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
    mesh.position.set(x, y, z); mesh.receiveShadow = true; g.add(mesh); return mesh;
  };
  const instance = (geometry, mat, transforms) => {
    const mesh = new THREE.InstancedMesh(geometry, mat, transforms.length);
    const matrix = new THREE.Matrix4();
    transforms.forEach(({ p, r = [0, 0, 0], s = [1, 1, 1] }, i) => {
      matrix.compose(new THREE.Vector3(...p), new THREE.Quaternion().setFromEuler(new THREE.Euler(...r)), new THREE.Vector3(...s));
      mesh.setMatrixAt(i, matrix);
    });
    mesh.instanceMatrix.needsUpdate = true; mesh.receiveShadow = true; g.add(mesh); return mesh;
  };

  addBox(8.25, 0.22, 40, 0, 0.11, 0, asphalt);
  for (const x of [-4.68, 4.68]) {
    addBox(1.25, 0.28, 40, x, 0.14, 0, shoulder);
    addBox(0.34, 0.42, 40, x - Math.sign(x) * 0.7, 0.21, 0, curb);
    addBox(0.14, 0.18, 40, x - Math.sign(x) * 0.48, 0.31, 0, curbDark);
  }

  // Flush modular paving plates interrupt the broad asphalt without harming lane read.
  const panels = [];
  for (let z = -17.5; z <= 17.6; z += 5) {
    for (const x of [-2.48, 0, 2.48]) panels.push({ p: [x, 0.232, z], s: [1, 1, 1] });
  }
  instance(new THREE.BoxGeometry(2.25, 0.018, 4.55), repair, panels);
  const seams = [];
  for (let z = -19.75; z <= 19.76; z += 5) seams.push({ p: [0, 0.247, z] });
  instance(new THREE.BoxGeometry(8.02, 0.018, 0.055), steel, seams);

  // Painted lane dashes sit over the repair plates as an unbroken navigation layer.
  const dashes = [];
  for (const x of [-1.25, 1.25]) for (let z = -18; z <= 18; z += 5.5) dashes.push({ p: [x, 0.272, z] });
  instance(new THREE.BoxGeometry(0.11, 0.032, 2.25), paint, dashes);

  // Hostile projected AI grid: transverse scan lines, rails, and glowing intersection nodes.
  const scans = [];
  for (let z = -18; z <= 18; z += 4) scans.push({ p: [0, 0.284, z] });
  const scanGrid = instance(new THREE.BoxGeometry(7.65, 0.024, 0.065), grid, scans);
  scanGrid.renderOrder = 2;
  for (const x of [-3.82, -2.5, 0, 2.5, 3.82]) addBox(0.07, 0.025, 40, x, 0.287, 0, x === -3.82 || x === 3.82 ? red : grid);
  const nodes = [];
  for (let z = -18; z <= 18; z += 4) for (const x of [-2.5, 0, 2.5]) nodes.push({ p: [x, 0.31, z], r: [0, 0, Math.PI / 4] });
  instance(new THREE.BoxGeometry(0.18, 0.04, 0.18), red, nodes);

  // Storm channels include a recessed trough, grate bars, bolts, and luminous edge markers.
  for (const x of [-3.63, 3.63]) {
    addBox(0.52, 0.09, 40, x, 0.255, 0, steel);
    const grateBars = [];
    for (let z = -19.4; z <= 19.41; z += 0.62) grateBars.push({ p: [x, 0.32, z] });
    instance(new THREE.BoxGeometry(0.48, 0.055, 0.09), curbDark, grateBars);
    const edgeLights = [];
    for (let z = -18; z <= 18; z += 3) edgeLights.push({ p: [x - Math.sign(x) * 0.52, 0.31, z] });
    instance(new THREE.BoxGeometry(0.22, 0.06, 0.5), warning, edgeLights);
  }

  // Access hatches and service fasteners create close-camera tertiary detail.
  for (const [x, z, rot] of [[-2.62, -11.5, 0.12], [2.55, 8.4, -0.18], [-2.5, 17.2, 0.08]]) {
    const hatch = new THREE.Mesh(new THREE.CylinderGeometry(0.62, 0.62, 0.055, 12), steel);
    hatch.position.set(x, 0.3, z); hatch.rotation.y = rot; g.add(hatch);
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.48, 0.065, 7, 20), curbDark);
    ring.position.set(x, 0.34, z); ring.rotation.x = Math.PI / 2; g.add(ring);
    const hatchBar = addBox(0.7, 0.045, 0.1, x, 0.365, z, teal); hatchBar.rotation.y = rot;
    for (let i = 0; i < 6; i++) {
      const angle = i * Math.PI / 3;
      const bolt = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.045, 7), warning);
      bolt.position.set(x + Math.cos(angle) * 0.44, 0.37, z + Math.sin(angle) * 0.44); g.add(bolt);
    }
  }

  // Tactile evacuation strips run down both walks, with damaged displaced slabs.
  const tactiles = [];
  for (const x of [-4.68, 4.68]) for (let z = -18; z <= 18; z += 2.1) tactiles.push({ p: [x, 0.302, z] });
  instance(new THREE.BoxGeometry(0.62, 0.045, 1.25), yellow, tactiles);
  for (const [x, z, rot] of [[-4.7, -6, 0.12], [4.66, 12.2, -0.1]]) {
    const slab = addBox(0.76, 0.14, 1.5, x, 0.37, z, curb); slab.rotation.y = rot; slab.rotation.z = Math.sign(x) * 0.04;
  }

  // Short branching fracture lines avoid a perfectly manufactured surface.
  for (const [x, z, angle] of [[-1.9, -4.5, 0.42], [-2.12, -3.92, -0.26], [2.1, 14.1, -0.5], [2.35, 13.52, 0.22]]) {
    const crack = addBox(0.035, 0.018, 1.05, x, 0.292, z, steel); crack.rotation.y = angle;
  }

  g.traverse((object) => { if (object.isMesh) object.receiveShadow = true; });
  return g;
}
