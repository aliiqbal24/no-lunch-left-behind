export default function (THREE) {
  const g = new THREE.Group(); g.name = 'rocketBoardingLadder';
  const mat = (color, name, roughness, metalness = 0, glow = 0) => {
    const m = new THREE.MeshStandardMaterial({ color, roughness, metalness,
      emissive: glow ? color : 0x000000, emissiveIntensity: glow });
    m.name = name; return m;
  };
  const steel = mat(0x9ba7b4, 'metal', 0.42, 0.68);
  const dark = mat(0x1f4e5f, 'metal', 0.44, 0.42);
  const orange = mat(0xff6b4a, 'metal', 0.4, 0.26, 0.3);
  const yellow = mat(0xf6c453, 'metal', 0.43, 0.24, 0.28);
  const red = mat(0xd7263d, 'metal', 0.25, 0.3, 1.35);
  for (const x of [-0.56, 0.56]) {
    const rail = new THREE.Mesh(new THREE.CylinderGeometry(0.095, 0.095, 8.2, 12), steel);
    rail.position.set(x, 4.1, 0); g.add(rail);
    for (const y of [0.8, 3.4, 6.0]) {
      const clamp = new THREE.Mesh(new THREE.TorusGeometry(0.14, 0.045, 7, 14), orange);
      clamp.position.set(x, y, 0); clamp.rotation.x = Math.PI / 2; g.add(clamp);
    }
  }
  // The rocket is four times the authored height, while the climber stays
  // human-sized. Quarter-spaced rungs become a reachable 54 cm apart in world.
  for (let y = 0.35; y < 8.05; y += 0.135) {
    const rung = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.065, 1.15, 10), y > 6.65 ? orange : steel);
    rung.rotation.z = Math.PI / 2; rung.position.y = y; g.add(rung);
    for (const x of [-0.34, 0, 0.34]) {
      const grip = new THREE.Mesh(new THREE.TorusGeometry(0.075, 0.018, 6, 10), dark);
      grip.position.set(x, y, 0); grip.rotation.y = Math.PI / 2; g.add(grip);
    }
  }
  // Rear safety cage, mounting standoffs, and illuminated upper escape section.
  for (const y of [1.2, 2.55, 3.9, 5.25, 6.6, 7.75]) {
    const hoop = new THREE.Mesh(new THREE.TorusGeometry(0.86, 0.055, 7, 18, Math.PI * 1.25), y > 6.5 ? orange : dark);
    hoop.position.set(0, y, 0.34); hoop.rotation.x = Math.PI / 2; hoop.rotation.z = -Math.PI * 0.125; g.add(hoop);
  }
  for (const x of [-0.72, 0.72]) {
    const cageRail = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 6.7, 8), dark);
    cageRail.position.set(x, 4.45, 0.48); g.add(cageRail);
    for (const y of [1.0, 3.0, 5.0, 7.0]) {
      const standoff = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.1, 0.42), steel);
      standoff.position.set(x > 0 ? 0.68 : -0.68, y, 0.2); g.add(standoff);
    }
  }
  for (const side of [-1, 1]) {
    const foot = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.18, 0.72), yellow);
    foot.position.set(side * 0.55, 0.09, 0.08); g.add(foot);
    const topHandle = new THREE.Mesh(new THREE.TorusGeometry(0.32, 0.075, 8, 18, Math.PI), orange);
    topHandle.position.set(side * 0.34, 8.22, 0); topHandle.rotation.z = side > 0 ? 0 : Math.PI; g.add(topHandle);
  }
  for (const y of [6.9, 7.45, 8.0]) {
    const lamp = new THREE.Mesh(new THREE.SphereGeometry(0.07, 8, 6), red);
    lamp.position.set(0, y, 0.16); g.add(lamp);
  }
  const bounds = new THREE.Box3().setFromObject(g);
  const centre = bounds.getCenter(new THREE.Vector3());
  g.children.forEach((child) => { child.position.x -= centre.x; child.position.y -= bounds.min.y; child.position.z -= centre.z; });
  g.traverse((o) => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
  return g;
}
