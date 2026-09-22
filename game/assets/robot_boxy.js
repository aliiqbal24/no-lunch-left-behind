export default function (THREE) {
  const g = new THREE.Group();
  const mat = (color, name, roughness = 0.65, metalness = 0.1, emissive = 0) => {
    const m = new THREE.MeshStandardMaterial({ color, roughness, metalness, emissive, emissiveIntensity: emissive ? 1.4 : 0 });
    m.name = name;
    return m;
  };
  const shell = mat(0xf7f3e8, 'metal', 0.55, 0.18);
  const edge = mat(0x1f4e5f, 'metal', 0.48, 0.25);
  const screen = mat(0x45c4b0, 'glass', 0.3, 0.1, 0x45c4b0);
  const orange = mat(0xff6b4a, 'metal', 0.62, 0.12);
  const body = new THREE.Mesh(new THREE.BoxGeometry(0.76, 0.72, 0.55), shell);
  body.position.y = 0.82;
  body.rotation.z = 0.025;
  g.add(body);
  const head = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.47, 0.48), shell);
  head.position.set(0, 1.42, 0.03);
  g.add(head);
  const face = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.23, 0.055), screen);
  face.position.set(0, 1.43, 0.277);
  g.add(face);
  for (const x of [-0.12, 0.12]) {
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.035, 7, 6), edge);
    eye.position.set(x, 1.46, 0.316);
    g.add(eye);
  }
  const smile = new THREE.Mesh(new THREE.TorusGeometry(0.1, 0.018, 5, 12, Math.PI), edge);
  smile.position.set(0, 1.39, 0.319);
  smile.rotation.z = Math.PI;
  g.add(smile);
  for (const side of [-1, 1]) {
    const arm = new THREE.Mesh(new THREE.CapsuleGeometry(0.075, 0.44, 4, 7), edge);
    arm.position.set(side * 0.49, 0.85, 0);
    arm.rotation.z = side * -0.23;
    g.add(arm);
    const foot = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.18, 0.42), orange);
    foot.position.set(side * 0.23, 0.09, 0.07);
    g.add(foot);
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.48, 8), edge);
    leg.position.set(side * 0.23, 0.38, 0);
    g.add(leg);
  }
  const antenna = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.25, 7), edge);
  antenna.position.set(0.18, 1.78, 0);
  g.add(antenna);
  const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.07, 8, 6), orange);
  bulb.position.set(0.18, 1.93, 0);
  g.add(bulb);
  return g;
}

