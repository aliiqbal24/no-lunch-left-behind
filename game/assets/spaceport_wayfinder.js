export default function generate(THREE) {
  const g = new THREE.Group();
  const material = (color, name, emissive = false) => {
    const m = new THREE.MeshStandardMaterial({
      color, roughness: emissive ? 0.32 : 0.62, metalness: name === 'metal' ? 0.28 : 0,
      emissive: emissive ? color : 0x000000, emissiveIntensity: emissive ? 0.8 : 0,
    });
    m.name = name;
    return m;
  };
  const steel = material(0x1f4e5f, 'metal');
  const shell = material(0xf7f3e8, 'metal');
  const orange = material(0xff6b4a, 'metal');
  const teal = material(0x45c4b0, 'metal', true);
  const yellow = material(0xf6c453, 'metal');

  function box(w, h, d, x, y, z, mat, angle = 0) {
    const part = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
    part.position.set(x, y, z);
    part.rotation.z = angle;
    part.castShadow = h > 1;
    g.add(part);
  }

  // These supports sit beyond the road curbs, leaving the running lanes clear.
  for (const side of [-1, 1]) {
    box(2.2, 0.5, 3.2, side * 5.8, 0.25, 0, orange);
    box(1.35, 12.5, 1.65, side * 5.8, 6.5, 0, steel);
    box(1.8, 1.2, 2, side * 5.8, 12.9, 0, shell);
    box(0.22, 7.4, 0.3, side * 4.98, 7, 0.86, teal);
    box(1.2, 4.5, 0.5, side * 4.5, 10.9, 0, shell, side * 0.28);
  }
  box(10.5, 1.7, 2.1, 0, 14, 0, steel);
  box(10.8, 0.23, 2.25, 0, 15.1, 0, orange);
  box(10.1, 0.32, 0.2, 0, 13.7, 1.17, teal);
  box(5.2, 1.1, 0.3, 0, 14.2, 1.2, shell);
  for (const x of [-1.5, 0, 1.5]) {
    box(0.16, 0.75, 0.14, x - 0.2, 14.2, 1.42, orange, -0.58);
    box(0.16, 0.75, 0.14, x + 0.2, 14.2, 1.42, orange, 0.58);
  }
  const orbitalMark = new THREE.Mesh(new THREE.TorusGeometry(1.2, 0.16, 6, 16), teal);
  orbitalMark.position.set(0, 17.3, 0);
  g.add(orbitalMark);
  box(0.28, 2.5, 0.28, 0, 17.4, 0, yellow);
  const tip = new THREE.Mesh(new THREE.ConeGeometry(0.48, 1.1, 8), orange);
  tip.position.set(0, 19.05, 0);
  g.add(tip);
  return g;
}
