export default function (THREE) {
  const g = new THREE.Group(); g.name = 'weaponizedToasterBot';
  const mat = (color, name, roughness, metalness = 0, glow = 0) => {
    const m = new THREE.MeshStandardMaterial({ color, roughness, metalness,
      emissive: glow ? color : 0x000000, emissiveIntensity: glow });
    m.name = name; return m;
  };
  const steel = mat(0x71818d, 'metal', 0.38, 0.62);
  const teal = mat(0x1f4e5f, 'metal', 0.42, 0.4);
  const dark = mat(0x152a33, 'metal', 0.36, 0.48);
  const red = mat(0xd7263d, 'metal', 0.25, 0.32, 1.65);
  const orange = mat(0xff6b4a, 'metal', 0.4, 0.28, 0.35);
  const ivory = mat(0xf7f3e8, 'metal', 0.55, 0.18);
  const rubber = mat(0x202735, 'metal', 0.8, 0.04);
  const box = (w, h, d, x, y, z, material) => {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material);
    mesh.position.set(x, y, z); g.add(mesh); return mesh;
  };
  box(1.12, 0.58, 0.74, 0, 0.5, 0, steel);
  box(1.18, 0.16, 0.8, 0, 0.23, 0, dark);
  for (const side of [-1, 1]) {
    const armor = box(0.16, 0.48, 0.82, side * 0.58, 0.51, 0, teal);
    armor.rotation.z = side * 0.05;
    const track = box(0.18, 0.2, 0.66, side * 0.62, 0.18, 0, rubber);
    for (const z of [-0.22, 0.22]) {
      const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.11, 0.2, 10), dark);
      wheel.position.set(side * 0.63, 0.18, z); wheel.rotation.z = Math.PI / 2; g.add(wheel);
      const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.22, 8), orange);
      hub.position.copy(wheel.position); hub.rotation.z = Math.PI / 2; g.add(hub);
    }
    const plate = box(0.08, 0.3, 0.42, side * 0.69, 0.53, 0, ivory);
    plate.rotation.x = side * 0.04;
  }
  for (const x of [-0.3, 0.3]) {
    box(0.38, 0.08, 0.4, x, 0.825, 0, dark);
    box(0.25, 0.035, 0.31, x, 0.872, 0, red);
    for (const z of [-0.1, 0, 0.1]) box(0.03, 0.02, 0.21, x + z, 0.895, 0, orange);
  }
  box(0.66, 0.2, 0.08, 0, 0.55, 0.42, dark);
  box(0.42, 0.08, 0.06, 0, 0.55, 0.475, red);
  for (const x of [-0.36, 0.36]) {
    const lens = new THREE.Mesh(new THREE.SphereGeometry(0.07, 10, 7), red);
    lens.position.set(x, 0.65, 0.43); g.add(lens);
  }
  box(0.18, 0.12, 0.08, 0.36, 0.38, 0.43, orange);
  for (const side of [-1, 1]) {
    const path = new THREE.CatmullRomCurve3([
      new THREE.Vector3(side * 0.58, 0.58, -0.1), new THREE.Vector3(side * 0.82, 0.68, 0.02),
      new THREE.Vector3(side * 0.91, 0.48, 0.22), new THREE.Vector3(side * 0.82, 0.3, 0.34),
    ]);
    g.add(new THREE.Mesh(new THREE.TubeGeometry(path, 14, 0.055, 7, false), teal));
    const wrist = new THREE.Mesh(new THREE.SphereGeometry(0.09, 9, 6), orange);
    wrist.position.set(side * 0.82, 0.3, 0.34); g.add(wrist);
    for (const dy of [-0.055, 0.055]) {
      const claw = box(0.06, 0.18, 0.05, side * 0.86, 0.21 + dy, 0.37, dark);
      claw.rotation.z = side * 0.25;
    }
  }
  // A severed power lead trails behind, still pulsing red at the plug.
  const cablePath = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0.38, 0.35, -0.38), new THREE.Vector3(0.62, 0.2, -0.55),
    new THREE.Vector3(0.45, 0.1, -0.82), new THREE.Vector3(0.68, 0.08, -1.02),
  ]);
  g.add(new THREE.Mesh(new THREE.TubeGeometry(cablePath, 16, 0.035, 7, false), rubber));
  box(0.14, 0.1, 0.2, 0.68, 0.1, -1.08, red);
  const bounds = new THREE.Box3().setFromObject(g);
  const centre = bounds.getCenter(new THREE.Vector3());
  g.children.forEach((child) => { child.position.x -= centre.x; child.position.y -= bounds.min.y; child.position.z -= centre.z; });
  g.traverse((o) => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
  return g;
}
