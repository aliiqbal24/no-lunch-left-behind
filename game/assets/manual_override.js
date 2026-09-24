// Roadside physical cut-off, also used inside the station.
export default function (THREE) {
  const g = new THREE.Group(); g.name = 'manualOverridePedestal';
  const mat = (color, name, roughness, metalness = 0, glow = 0) => {
    const m = new THREE.MeshStandardMaterial({ color, roughness, metalness,
      emissive: glow ? color : 0x000000, emissiveIntensity: glow });
    m.name = name; return m;
  };
  const steel = mat(0x1f4e5f, 'metal', 0.44, 0.4);
  const dark = mat(0x142a35, 'metal', 0.36, 0.55);
  const shell = mat(0xf7f3e8, 'metal', 0.58, 0.17);
  const warning = mat(0xf6c453, 'metal', 0.4, 0.24, 0.65);
  const orange = mat(0xff6b4a, 'metal', 0.38, 0.28, 0.32);
  const live = mat(0xd7263d, 'metal', 0.22, 0.34, 1.65);
  const teal = mat(0x45c4b0, 'metal', 0.3, 0.28, 0.8);
  const box = (w, h, d, x, y, z, material) => {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material);
    mesh.position.set(x, y, z); g.add(mesh); return mesh;
  };
  const base = new THREE.Mesh(new THREE.CylinderGeometry(1.15, 1.32, 0.32, 16), dark);
  base.position.y = 0.16; g.add(base);
  const plinth = new THREE.Mesh(new THREE.CylinderGeometry(0.96, 1.08, 0.38, 16), steel);
  plinth.position.y = 0.46; g.add(plinth);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.93, 0.11, 8, 24), orange);
  ring.position.y = 0.63; ring.rotation.x = Math.PI / 2; g.add(ring);
  box(1.1, 1.5, 0.88, 0, 1.38, 0, steel);
  box(0.86, 1.12, 0.18, 0, 1.46, -0.53, dark);
  for (const side of [-1, 1]) {
    const guard = box(0.22, 1.48, 0.3, side * 0.72, 1.45, -0.1, shell);
    guard.rotation.z = side * 0.16;
    const piston = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.11, 1.18, 10), orange);
    piston.position.set(side * 0.82, 1.45, 0.08); piston.rotation.z = side * -0.18; g.add(piston);
    for (const y of [0.98, 1.94]) {
      const joint = new THREE.Mesh(new THREE.SphereGeometry(0.15, 10, 7), warning);
      joint.position.set(side * 0.77, y, 0.03); g.add(joint);
    }
  }
  const plate = box(1.78, 0.98, 0.28, 0, 2.12, -0.48, warning);
  plate.rotation.x = -0.08;
  box(1.38, 0.66, 0.12, 0, 2.08, -0.68, dark);
  const buttonGuard = new THREE.Mesh(new THREE.TorusGeometry(0.48, 0.11, 9, 26), shell);
  buttonGuard.position.set(0, 2.1, -0.81); g.add(buttonGuard);
  const button = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.34, 0.28, 16), live);
  button.name = 'overrideButton'; button.rotation.x = Math.PI / 2; button.position.set(0, 2.1, -0.88); g.add(button);
  const buttonCore = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.17, 0.3, 14), orange);
  buttonCore.rotation.x = Math.PI / 2; buttonCore.position.set(0, 2.1, -1.02); g.add(buttonCore);
  for (const a of [-0.62, 0.62]) {
    for (const y of [1.77, 2.43]) {
      const bolt = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.055, 0.08, 8), shell);
      bolt.position.set(a, y, -0.67); bolt.rotation.x = Math.PI / 2; g.add(bolt);
    }
  }
  // Physical isolation bus and exposed cabling sell this as a real last-resort control.
  box(1.46, 0.22, 0.24, 0, 2.78, -0.14, dark);
  for (const x of [-0.48, 0, 0.48]) {
    const fuse = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.11, 0.45, 10), x === 0 ? live : teal);
    fuse.position.set(x, 2.82, -0.34); fuse.rotation.x = Math.PI / 2; g.add(fuse);
  }
  for (const side of [-1, 1]) {
    const cable = new THREE.CatmullRomCurve3([
      new THREE.Vector3(side * 0.55, 0.72, 0.32), new THREE.Vector3(side * 0.96, 1.02, 0.38),
      new THREE.Vector3(side * 1.02, 1.72, 0.24), new THREE.Vector3(side * 0.72, 2.5, 0.04),
    ]);
    g.add(new THREE.Mesh(new THREE.TubeGeometry(cable, 14, 0.07, 7, false), side < 0 ? orange : live));
  }
  const beaconBase = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.42, 0.3, 14), dark);
  beaconBase.position.y = 3.08; g.add(beaconBase);
  const beacon = new THREE.Mesh(new THREE.SphereGeometry(0.34, 14, 9), live);
  beacon.name = 'overrideBeacon'; beacon.position.y = 3.38; beacon.scale.y = 1.12; g.add(beacon);
  const halo = new THREE.Group(); halo.name = 'overrideHalo'; halo.position.set(0, 2.1, -1.08);
  halo.add(new THREE.Mesh(new THREE.TorusGeometry(0.65, 0.075, 7, 28), live)); g.add(halo);
  for (const side of [-1, 1]) {
    const chevron = box(0.16, 0.72, 0.16, side * 0.35, 3.95, -0.12, warning);
    chevron.rotation.z = side * 0.52;
  }
  g.traverse((o) => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
  return g;
}
