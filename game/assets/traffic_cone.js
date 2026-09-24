export default function (THREE) {
  const g = new THREE.Group(); g.name = 'aiLockdownPylon';
  const mat = (color, name, roughness, metalness = 0, glow = 0) => {
    const m = new THREE.MeshStandardMaterial({ color, roughness, metalness,
      emissive: glow ? color : 0x000000, emissiveIntensity: glow });
    m.name = name; return m;
  };
  const orange = mat(0xff6b4a, 'fabric', 0.72);
  const ivory = mat(0xf7f3e8, 'fabric', 0.66);
  const dark = mat(0x182c35, 'metal', 0.45, 0.35);
  const red = mat(0xd7263d, 'metal', 0.28, 0.25, 1.5);
  const yellow = mat(0xf6c453, 'metal', 0.42, 0.2, 0.35);
  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.47, 0.53, 0.11, 8), dark);
  base.position.y = 0.055; g.add(base);
  const baseInset = new THREE.Mesh(new THREE.CylinderGeometry(0.39, 0.44, 0.08, 8), orange);
  baseInset.position.y = 0.145; g.add(baseInset);
  const profile = [
    new THREE.Vector2(0.31, 0), new THREE.Vector2(0.32, 0.08), new THREE.Vector2(0.27, 0.14),
    new THREE.Vector2(0.23, 0.34), new THREE.Vector2(0.2, 0.39), new THREE.Vector2(0.16, 0.58),
    new THREE.Vector2(0.12, 0.64), new THREE.Vector2(0.08, 0.77), new THREE.Vector2(0.06, 0.82),
  ];
  const body = new THREE.Mesh(new THREE.LatheGeometry(profile, 20), orange);
  body.position.y = 0.16; g.add(body);
  for (const [y, r] of [[0.47, 0.205], [0.68, 0.13]]) {
    const band = new THREE.Mesh(new THREE.TorusGeometry(r, 0.055, 8, 24), ivory);
    band.position.y = y; band.rotation.x = Math.PI / 2; g.add(band);
    const rail = new THREE.Mesh(new THREE.TorusGeometry(r + 0.015, 0.018, 7, 24), yellow);
    rail.position.y = y + 0.002; rail.rotation.x = Math.PI / 2; g.add(rail);
  }
  const sensor = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.075, 0.16, 12), dark);
  sensor.position.y = 1.03; g.add(sensor);
  const lens = new THREE.Mesh(new THREE.SphereGeometry(0.065, 10, 7), red);
  lens.position.set(0, 1.08, 0.085); g.add(lens);
  for (const side of [-1, 1]) {
    const fin = new THREE.Mesh(new THREE.BoxGeometry(0.23, 0.08, 0.32), yellow);
    fin.position.set(side * 0.39, 0.2, 0); fin.rotation.y = side * 0.16; g.add(fin);
    for (const z of [-0.28, 0.28]) {
      const bolt = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.055, 7), red);
      bolt.position.set(side * 0.36, 0.22, z); g.add(bolt);
    }
  }
  g.traverse((o) => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
  return g;
}
