export default function (THREE) {
  const g = new THREE.Group(); g.name = 'hijackedCivicBillboard';
  const mat = (color, name, roughness, metalness = 0, glow = 0) => {
    const m = new THREE.MeshStandardMaterial({ color, roughness, metalness,
      emissive: glow ? color : 0x000000, emissiveIntensity: glow });
    m.name = name; return m;
  };
  const steel = mat(0x172b33, 'metal', 0.44, 0.52);
  const teal = mat(0x1f4e5f, 'metal', 0.48, 0.34);
  const faceMat = mat(0xfff9ea, 'plaster', 0.82);
  const orange = mat(0xff6b4a, 'metal', 0.4, 0.34, 0.28);
  const red = mat(0xd7263d, 'metal', 0.26, 0.3, 1.5);
  const yellow = mat(0xf6c453, 'metal', 0.45, 0.22, 0.24);
  const box = (w, h, d, x, y, z, material) => {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material);
    mesh.position.set(x, y, z); g.add(mesh); return mesh;
  };
  const face = box(6.6, 2.75, 0.18, 0, 6.15, 0.24, faceMat);
  face.name = 'billboardSurface';
  box(7.2, 0.28, 0.55, 0, 4.62, 0, steel);
  box(7.2, 0.28, 0.55, 0, 7.68, 0, steel);
  for (const x of [-3.46, 3.46]) box(0.28, 3.35, 0.55, x, 6.15, 0, steel);
  for (const [x, y] of [[-3.08, 5.05], [3.08, 5.05], [-3.08, 7.25], [3.08, 7.25]]) {
    const bolt = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.08, 10), orange);
    bolt.position.set(x, y, 0.39); bolt.rotation.x = Math.PI / 2; g.add(bolt);
  }
  // Rear truss and maintenance deck establish believable structure.
  for (const x of [-2.3, 2.3]) {
    box(0.28, 4.8, 0.38, x, 2.4, -0.35, teal);
    box(0.72, 0.35, 1.05, x, 0.18, -0.35, steel);
  }
  for (const x of [-2.3, 0, 2.3]) {
    const diagonalA = box(0.16, 3.1, 0.16, x - 0.55, 3.25, -0.45, orange); diagonalA.rotation.z = -0.62;
    const diagonalB = box(0.16, 3.1, 0.16, x + 0.55, 3.25, -0.45, orange); diagonalB.rotation.z = 0.62;
  }
  box(6.95, 0.22, 1.4, 0, 4.48, -0.55, teal);
  box(7.0, 0.12, 0.12, 0, 5.02, -1.2, yellow);
  for (let x = -3.3; x <= 3.31; x += 0.55) box(0.05, 1.0, 0.05, x, 4.54, -1.2, yellow);
  // Machine takeover hardware: paired cameras, speaker horns and live conduit.
  for (const x of [-2.7, 2.7]) {
    box(0.62, 0.38, 0.52, x, 8.0, 0.08, teal);
    const lens = new THREE.Mesh(new THREE.SphereGeometry(0.12, 10, 7), red);
    lens.position.set(x, 8.0, 0.41); g.add(lens);
    const horn = new THREE.Mesh(new THREE.ConeGeometry(0.3, 0.6, 12, 1, true), steel);
    horn.position.set(x, 4.35, 0.55); horn.rotation.x = Math.PI / 2; g.add(horn);
  }
  const eyeBar = box(2.5, 0.38, 0.34, 0, 7.96, 0.12, steel);
  eyeBar.rotation.x = -0.04;
  box(1.76, 0.1, 0.08, 0, 7.96, 0.34, red);
  const cablePath = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-3.2, 7.55, -0.34), new THREE.Vector3(-3.65, 6.65, -0.52),
    new THREE.Vector3(-3.55, 5.2, -0.55), new THREE.Vector3(-2.5, 4.45, -0.62),
  ]);
  g.add(new THREE.Mesh(new THREE.TubeGeometry(cablePath, 16, 0.07, 7, false), red));
  g.userData.surface = face;
  g.userData.mounts = 'back';
  g.traverse((o) => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
  return g;
}
