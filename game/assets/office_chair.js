export default function (THREE) {
  const g = new THREE.Group(); g.name = 'rogueExecutiveChair';
  const mat = (color, name, roughness, metalness = 0, glow = 0) => {
    const m = new THREE.MeshStandardMaterial({ color, roughness, metalness,
      emissive: glow ? color : 0x000000, emissiveIntensity: glow });
    m.name = name; return m;
  };
  const fabric = mat(0x1f4e5f, 'fabric', 0.88);
  const fabricEdge = mat(0x2f6f7b, 'fabric', 0.78);
  const steel = mat(0x84919b, 'metal', 0.32, 0.7);
  const dark = mat(0x172934, 'metal', 0.4, 0.42);
  const rubber = mat(0x202735, 'metal', 0.84, 0.04);
  const orange = mat(0xff6b4a, 'metal', 0.4, 0.26, 0.3);
  const red = mat(0xd7263d, 'metal', 0.24, 0.32, 1.55);
  const ivory = mat(0xf7f3e8, 'metal', 0.52, 0.18);
  const box = (w, h, d, x, y, z, material) => {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material);
    mesh.position.set(x, y, z); g.add(mesh); return mesh;
  };
  const seat = new THREE.Mesh(new THREE.CapsuleGeometry(0.42, 0.38, 6, 14), fabric);
  seat.rotation.z = Math.PI / 2; seat.scale.set(1.15, 0.36, 1.12); seat.position.set(0, 0.94, 0.04); g.add(seat);
  const seatRim = new THREE.Mesh(new THREE.TorusGeometry(0.48, 0.07, 8, 24), fabricEdge);
  seatRim.scale.z = 0.78; seatRim.position.set(0, 0.9, 0.03); seatRim.rotation.x = Math.PI / 2; g.add(seatRim);
  const back = new THREE.Mesh(new THREE.CapsuleGeometry(0.44, 0.55, 6, 14), fabric);
  back.scale.set(1.03, 1.12, 0.34); back.position.set(0, 1.55, -0.34); back.rotation.x = -0.12; g.add(back);
  box(0.7, 0.08, 0.08, 0, 1.36, -0.15, fabricEdge);
  box(0.76, 0.08, 0.08, 0, 1.68, -0.18, fabricEdge);
  for (const x of [-0.52, 0.52]) {
    box(0.1, 0.58, 0.1, x, 1.12, 0, steel);
    const arm = box(0.22, 0.12, 0.62, x, 1.42, 0.08, dark); arm.rotation.x = -0.08;
    box(0.16, 0.07, 0.48, x, 1.5, 0.12, orange);
  }
  const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.13, 0.62, 12), steel);
  stem.position.set(0, 0.58, 0); g.add(stem);
  const piston = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.055, 0.42, 10), orange);
  piston.position.set(0, 0.69, 0); g.add(piston);
  const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.17, 0.16, 12), dark);
  hub.position.set(0, 0.3, 0); g.add(hub);
  for (let i = 0; i < 5; i++) {
    const angle = i * Math.PI * 2 / 5;
    const x = Math.cos(angle) * 0.34, z = Math.sin(angle) * 0.34;
    const arm = box(0.08, 0.08, 0.58, x, 0.28, z, steel);
    arm.rotation.y = -angle;
    const caster = new THREE.Mesh(new THREE.TorusGeometry(0.1, 0.04, 7, 12), rubber);
    caster.position.set(Math.cos(angle) * 0.62, 0.12, Math.sin(angle) * 0.62);
    caster.rotation.y = -angle; g.add(caster);
    const fork = box(0.08, 0.2, 0.06, Math.cos(angle) * 0.58, 0.2, Math.sin(angle) * 0.58, dark);
    fork.rotation.y = -angle;
  }
  // Hijack module turns an ordinary chair into an airborne bureaucratic hazard.
  box(0.58, 0.38, 0.22, 0, 1.42, -0.72, dark);
  box(0.36, 0.1, 0.08, 0, 1.47, -0.86, red);
  for (const x of [-0.22, 0.22]) {
    const optic = new THREE.Mesh(new THREE.SphereGeometry(0.065, 9, 6), red);
    optic.position.set(x, 1.6, -0.85); g.add(optic);
    const antenna = box(0.035, 0.42, 0.035, x, 1.9, -0.75, steel); antenna.rotation.z = x;
  }
  for (const x of [-0.34, 0.34]) {
    const thruster = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.12, 0.34, 12), ivory);
    thruster.position.set(x, 0.74, -0.34); thruster.rotation.x = Math.PI / 2; g.add(thruster);
    const core = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.36, 10), red);
    core.position.set(x, 0.74, -0.52); core.rotation.x = Math.PI / 2; g.add(core);
  }
  const bounds = new THREE.Box3().setFromObject(g);
  const centre = bounds.getCenter(new THREE.Vector3());
  g.children.forEach((child) => { child.position.x -= centre.x; child.position.y -= bounds.min.y; child.position.z -= centre.z; });
  g.traverse((o) => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
  return g;
}
