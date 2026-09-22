export default function (THREE) {
  const g = new THREE.Group();
  const mat = (color, roughness, metalness = 0, emissive = 0, intensity = 0) => {
    const m = new THREE.MeshStandardMaterial({ color, roughness, metalness, emissive, emissiveIntensity: intensity });
    m.name = 'metal';
    return m;
  };
  const ivory = mat(0xf7f3e8, 0.42, 0.28);
  const yellow = mat(0xf6c453, 0.5, 0.12);
  const teal = mat(0x45c4b0, 0.22, 0.12, 0x45c4b0, 0.8);
  const red = mat(0xd7263d, 0.48, 0.18);
  const dark = mat(0x172b33, 0.38, 0.55);

  const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.58, 1.25, 6, 14), ivory);
  body.rotation.x = Math.PI / 2;
  body.position.set(0, 1.12, 0.18);
  body.scale.set(1, 1.16, 0.78);
  g.add(body);

  const nose = new THREE.Mesh(new THREE.ConeGeometry(0.58, 1.15, 14), red);
  nose.rotation.x = Math.PI / 2;
  nose.position.set(0, 1.12, 1.55);
  g.add(nose);

  const canopy = new THREE.Mesh(new THREE.SphereGeometry(0.43, 14, 10), teal);
  canopy.scale.set(1, 0.62, 1.15);
  canopy.position.set(0, 1.54, 0.26);
  g.add(canopy);

  for (const side of [-1, 1]) {
    const wing = new THREE.Mesh(new THREE.BoxGeometry(1.16, 0.14, 1.05), yellow);
    wing.position.set(side * 0.82, 0.93, -0.02);
    wing.rotation.y = side * -0.18;
    g.add(wing);
    const tip = new THREE.Mesh(new THREE.SphereGeometry(0.13, 8, 6), red);
    tip.position.set(side * 1.37, 0.96, 0.03);
    g.add(tip);
  }

  for (const x of [-0.28, 0.28]) {
    const engine = new THREE.Mesh(new THREE.CylinderGeometry(0.19, 0.26, 0.48, 10), dark);
    engine.rotation.x = Math.PI / 2;
    engine.position.set(x, 0.95, -1.04);
    g.add(engine);
    const glow = new THREE.Mesh(new THREE.SphereGeometry(0.14, 9, 7), teal);
    glow.scale.z = 1.5;
    glow.position.set(x, 0.95, -1.31);
    glow.name = 'engineGlow';
    g.add(glow);
  }
  g.children.forEach((child) => {
    child.position.y -= 0.54;
    child.position.z -= 0.307;
  });
  return g;
}
