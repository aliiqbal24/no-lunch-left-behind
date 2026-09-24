export default function (THREE) {
  const g = new THREE.Group(); g.name = 'spaceportMonument';
  const mat = (color, name, roughness, metalness = 0, glow = 0) => {
    const m = new THREE.MeshStandardMaterial({ color, roughness, metalness,
      emissive: glow ? color : 0x000000, emissiveIntensity: glow });
    m.name = name; return m;
  };
  const steel = mat(0x1f4e5f, 'metal', 0.46, 0.38);
  const shell = mat(0xf7f3e8, 'metal', 0.57, 0.2);
  const dark = mat(0x142a35, 'metal', 0.38, 0.5);
  const orange = mat(0xff6b4a, 'metal', 0.38, 0.3, 0.35);
  const teal = mat(0x45c4b0, 'metal', 0.28, 0.3, 0.95);
  const yellow = mat(0xf6c453, 'metal', 0.42, 0.24, 0.35);
  const red = mat(0xd7263d, 'metal', 0.24, 0.32, 1.4);
  const box = (w, h, d, x, y, z, material) => {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material);
    mesh.position.set(x, y, z); g.add(mesh); return mesh;
  };
  const strut = (a, b, radius, material) => {
    const start = new THREE.Vector3(...a), end = new THREE.Vector3(...b);
    const mesh = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, start.distanceTo(end), 9), material);
    mesh.position.copy(start).add(end).multiplyScalar(0.5);
    mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), end.clone().sub(start).normalize());
    g.add(mesh); return mesh;
  };
  for (const side of [-1, 1]) {
    box(2.75, 0.62, 3.8, side * 6.2, 0.31, 0, orange);
    box(2.15, 1.0, 3.1, side * 6.2, 1.0, 0, dark);
    box(1.7, 11.8, 2.0, side * 6.2, 7.3, 0, steel);
    box(2.02, 1.15, 2.28, side * 6.2, 4.6, 0, shell);
    box(2.02, 1.15, 2.28, side * 6.2, 9.2, 0, shell);
    for (const y of [2.4, 6.9, 11.5]) {
      const collar = new THREE.Mesh(new THREE.TorusGeometry(0.9, 0.13, 8, 20), y === 6.9 ? orange : dark);
      collar.position.set(side * 6.2, y, 0); collar.rotation.x = Math.PI / 2; g.add(collar);
    }
    box(0.32, 8.2, 0.42, side * 5.12, 7.0, 1.15, teal);
    strut([side * 6.2, 11.4, 0.6], [side * 3.8, 14.2, 0.6], 0.22, shell);
    strut([side * 6.2, 10.8, -0.65], [side * 3.8, 13.8, -0.65], 0.14, orange);
    for (const y of [3.25, 5.75, 8.25, 10.75]) box(0.12, 1.15, 1.26, side * 5.28, y, 0, dark);
    const cablePath = new THREE.CatmullRomCurve3([
      new THREE.Vector3(side * 6.9, 2.0, -0.6), new THREE.Vector3(side * 7.25, 6.0, -0.85),
      new THREE.Vector3(side * 7.0, 10.5, -0.75), new THREE.Vector3(side * 5.4, 13.5, -0.7),
    ]);
    g.add(new THREE.Mesh(new THREE.TubeGeometry(cablePath, 20, 0.11, 7, false), orange));
  }
  box(11.1, 2.1, 2.6, 0, 14.45, 0, dark);
  box(12.5, 0.42, 3.0, 0, 13.35, 0, steel);
  box(12.7, 0.25, 3.15, 0, 15.65, 0, orange);
  for (const x of [-4.7, -2.35, 0, 2.35, 4.7]) {
    strut([x - 0.75, 13.5, -1.3], [x + 0.75, 15.45, -1.3], 0.09, shell);
    strut([x + 0.75, 13.5, -1.3], [x - 0.75, 15.45, -1.3], 0.09, shell);
  }
  box(5.5, 1.2, 0.46, 0, 14.5, 1.48, steel);
  box(3.8, 0.18, 0.08, 0, 14.5, 1.76, red);
  for (const x of [-1.45, -0.48, 0.48, 1.45]) {
    const optic = new THREE.Mesh(new THREE.SphereGeometry(0.1, 9, 6), red);
    optic.position.set(x, 14.5, 1.83); g.add(optic);
  }
  // Orbital crown and launch arrow remain the optimistic focal mark under AI occupation.
  const ring = new THREE.Mesh(new THREE.TorusGeometry(1.7, 0.2, 10, 36), teal);
  ring.position.set(0, 18.25, 0); g.add(ring);
  const ring2 = new THREE.Mesh(new THREE.TorusGeometry(1.15, 0.08, 8, 28), yellow);
  ring2.position.set(0, 18.25, 0); ring2.rotation.y = 0.6; g.add(ring2);
  box(0.34, 4.15, 0.34, 0, 18.15, 0, yellow);
  const tip = new THREE.Mesh(new THREE.ConeGeometry(0.62, 1.4, 12), orange);
  tip.position.set(0, 20.88, 0); g.add(tip);
  for (const x of [-1.15, 1.15]) {
    const beacon = new THREE.Mesh(new THREE.SphereGeometry(0.16, 10, 7), red);
    beacon.position.set(x, 16.1, 1.25); g.add(beacon);
  }
  g.traverse((o) => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
  return g;
}
