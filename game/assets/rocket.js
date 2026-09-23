export default function (THREE) {
  const g = new THREE.Group();
  const ivory = new THREE.MeshStandardMaterial({ color: 0xf7f3e8, roughness: 0.48, metalness: 0.18 }); ivory.name = 'metal';
  const red = new THREE.MeshStandardMaterial({ color: 0xd7263d, roughness: 0.5, metalness: 0.15 }); red.name = 'metal';
  const teal = new THREE.MeshStandardMaterial({ color: 0x45c4b0, roughness: 0.28, emissive: 0x45c4b0, emissiveIntensity: 0.7 }); teal.name = 'glass';
  const dark = new THREE.MeshStandardMaterial({ color: 0x172b33, roughness: 0.45, metalness: 0.5 }); dark.name = 'metal';
  const recess = new THREE.MeshStandardMaterial({ color: 0x09161d, roughness: 1, side: THREE.DoubleSide }); recess.name = 'metal';

  // The opening faces the approaching runner (-Z). Three cylinder sections keep the
  // original silhouette while leaving a real gap for a camera/character to enter.
  const lowerBody = new THREE.Mesh(new THREE.CylinderGeometry(1.109, 1.18, 3.4, 18), ivory);
  lowerBody.position.y = 2.6;
  g.add(lowerBody);
  const upperBody = new THREE.Mesh(new THREE.CylinderGeometry(1.05, 1.068, 0.85, 18), ivory);
  upperBody.position.y = 6.675;
  g.add(upperBody);
  for (const [start, length] of [[0, Math.PI - 0.64], [Math.PI + 0.64, Math.PI - 0.64]]) {
    const side = new THREE.Mesh(new THREE.CylinderGeometry(1.068, 1.109, 1.95, 18, 1, true, start, length), ivory);
    side.position.y = 5.275;
    g.add(side);
  }

  const hatch = new THREE.Group();
  hatch.name = 'boardingHatch';
  const shroud = new THREE.Group();
  shroud.name = 'boardingShroud';
  const addBox = (parent, width, height, depth, x, y, z, material, name) => {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(width, height, depth), material);
    mesh.position.set(x, y, z);
    if (name) mesh.name = name;
    parent.add(mesh);
    return mesh;
  };
  // An opaque chamber behind the sliding doors hides the world handoff at close range.
  addBox(shroud, 1.45, 1.95, 0.1, 0, 5.275, 0.48, recess, 'boardingOccluder');
  for (const x of [-0.72, 0.72]) addBox(shroud, 0.12, 1.95, 1.55, x, 5.275, -0.34, recess);
  addBox(shroud, 1.45, 0.1, 1.55, 0, 6.2, -0.34, recess);
  addBox(shroud, 1.45, 0.1, 1.55, 0, 4.35, -0.34, recess);
  hatch.add(shroud);
  for (const x of [-0.73, 0.73]) {
    addBox(hatch, 0.13, 2.12, 0.16, x, 5.275, -1.16, red);
    addBox(hatch, 0.06, 1.75, 0.05, x, 5.275, -1.28, teal);
  }
  for (const y of [4.25, 6.3]) addBox(hatch, 1.58, 0.13, 0.17, 0, y, -1.16, red);
  for (const side of [-1, 1]) {
    const door = addBox(hatch, 0.67, 1.9, 0.12, side * 0.335, 5.275, -1.23, dark,
      side < 0 ? 'boardingDoorLeft' : 'boardingDoorRight');
    addBox(door, 0.37, 0.09, 0.04, 0, 0.44, -0.09, teal);
  }
  g.add(hatch);

  const nose = new THREE.Mesh(new THREE.ConeGeometry(1.05, 2.25, 18), red);
  nose.position.y = 8.22;
  g.add(nose);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(1.13, 0.12, 7, 18), dark);
  ring.position.y = 1.02;
  ring.rotation.x = Math.PI / 2;
  g.add(ring);
  for (const x of [-0.43, 0.43]) {
    const window = new THREE.Mesh(new THREE.SphereGeometry(0.28, 10, 8), teal);
    window.position.set(x, 5.4, 0.99);
    window.scale.z = 0.28;
    g.add(window);
  }
  for (let i = 0; i < 3; i++) {
    const a = (i / 3) * Math.PI * 2;
    const fin = new THREE.Mesh(new THREE.BoxGeometry(0.2, 1.8, 1.55), red);
    fin.position.set(Math.sin(a) * 1.15, 1.15, Math.cos(a) * 1.15);
    fin.rotation.y = a;
    g.add(fin);
    const nozzle = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.46, 0.75, 12), dark);
    nozzle.position.set(Math.sin(a) * 0.55, 0.38, Math.cos(a) * 0.55);
    g.add(nozzle);
  }
  g.children.forEach((o) => { o.position.z -= 0.347; });
  return g;
}
