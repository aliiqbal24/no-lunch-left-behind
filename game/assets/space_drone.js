// Hostile orbital pursuit drone: compact enough to dodge, detailed enough to read up close.
export default function generate(THREE) {
  const g = new THREE.Group(); g.name = 'hostileSpaceDrone';
  const mat = (color, name, roughness, metalness = 0, glow = 0) => {
    const m = new THREE.MeshStandardMaterial({ color, roughness, metalness,
      emissive: glow ? color : 0x000000, emissiveIntensity: glow });
    m.name = name; return m;
  };
  const ivory = mat(0xf7f3e8, 'metal', 0.48, 0.38);
  const steel = mat(0x1f4e5f, 'metal', 0.34, 0.58);
  const dark = mat(0x111d2a, 'metal', 0.28, 0.72);
  const orange = mat(0xff6b4a, 'metal', 0.38, 0.38, 0.24);
  const yellow = mat(0xf6c453, 'metal', 0.4, 0.32);
  const red = mat(0xd7263d, 'metal', 0.22, 0.4, 1.8);
  const teal = mat(0x45c4b0, 'metal', 0.22, 0.4, 1.2);
  const box = (w, h, d, x, y, z, material, parent = g, name = '') => {
    const o = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material);
    o.position.set(x, y, z); o.name = name; parent.add(o); return o;
  };
  const strut = (a, b, radius, material, parent = g) => {
    const start = new THREE.Vector3(...a), end = new THREE.Vector3(...b);
    const o = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, start.distanceTo(end), 8), material);
    o.position.copy(start).add(end).multiplyScalar(0.5);
    o.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), end.clone().sub(start).normalize());
    parent.add(o); return o;
  };

  const core = new THREE.Mesh(new THREE.IcosahedronGeometry(0.84, 2), steel);
  core.position.y = 1.15; core.scale.z = 0.82; g.add(core);
  const front = new THREE.Mesh(new THREE.SphereGeometry(0.66, 18, 11), dark);
  front.position.set(0, 1.15, 0.54); front.scale.set(1, 0.72, 0.38); g.add(front);
  const visor = box(1.02, 0.19, 0.1, 0, 1.2, 0.82, red, g, 'droneEye');
  visor.rotation.x = -0.05;
  for (const x of [-0.33, 0, 0.33]) {
    const optic = new THREE.Mesh(new THREE.SphereGeometry(0.07, 8, 6), red);
    optic.position.set(x, 1.2, 0.9); g.add(optic);
  }
  const halo = new THREE.Mesh(new THREE.TorusGeometry(0.96, 0.09, 7, 28), orange);
  halo.position.y = 1.15; halo.rotation.x = Math.PI / 2; halo.name = 'droneRotor'; g.add(halo);
  for (const side of [-1, 1]) {
    const arm = new THREE.Group(); arm.name = 'droneArm';
    arm.position.set(side * 0.72, 1.15, 0);
    const shoulder = new THREE.Mesh(new THREE.SphereGeometry(0.22, 10, 7), yellow); arm.add(shoulder);
    strut([0, 0, 0], [side * 0.74, 0.28, 0.02], 0.12, dark, arm);
    const elbow = new THREE.Mesh(new THREE.SphereGeometry(0.17, 9, 6), orange);
    elbow.position.set(side * 0.74, 0.28, 0.02); arm.add(elbow);
    strut([side * 0.74, 0.28, 0.02], [side * 1.18, -0.02, 0.48], 0.095, steel, arm);
    box(0.28, 0.28, 0.62, side * 1.2, -0.03, 0.58, dark, arm);
    box(0.13, 0.13, 0.7, side * 1.2, -0.03, 1.0, red, arm, 'droneWeapon');
    for (const z of [-0.28, 0.28]) {
      const clamp = box(0.09, 0.42, 0.12, side * 1.38, -0.3, 0.55 + z, ivory, arm);
      clamp.rotation.z = side * 0.24;
    }
    g.add(arm);
  }
  for (const side of [-1, 1]) {
    const fin = box(0.75, 0.08, 0.94, side * 0.55, 1.72, -0.18, ivory);
    fin.rotation.z = side * 0.22; fin.rotation.y = side * -0.18;
    for (const z of [-0.28, 0.28]) box(0.48, 0.035, 0.08, side * 0.56, 1.78, z, teal);
  }
  for (const [x, y, z] of [[-0.43,0.62,-0.38],[0.43,0.62,-0.38],[-0.44,1.58,-0.4],[0.44,1.58,-0.4]]) {
    const jet = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.16, 0.32, 9), dark);
    jet.rotation.x = Math.PI / 2; jet.position.set(x, y, z); g.add(jet);
    const glow = new THREE.Mesh(new THREE.SphereGeometry(0.09, 8, 6), teal);
    glow.position.set(x, y, z - 0.2); glow.name = 'droneThruster'; g.add(glow);
  }
  for (const side of [-1, 1]) {
    const antenna = strut([side * 0.36, 1.75, -0.05], [side * 0.62, 2.15, -0.14], 0.035, dark);
    const tip = new THREE.Mesh(new THREE.SphereGeometry(0.07, 7, 5), red);
    tip.position.set(side * 0.62, 2.15, -0.14); g.add(tip);
  }
  const bounds = new THREE.Box3().setFromObject(g);
  const center = bounds.getCenter(new THREE.Vector3());
  g.children.forEach((child) => { child.position.x -= center.x; child.position.z -= center.z; child.position.y -= bounds.min.y; });
  g.traverse((o) => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
  return g;
}
