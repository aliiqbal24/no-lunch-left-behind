export default function (THREE) {
  const g = new THREE.Group();
  const ocean = new THREE.MeshStandardMaterial({ color: 0x2686b5, roughness: 0.72, metalness: 0.03, emissive: 0x143f68, emissiveIntensity: 0.22 }); ocean.name = 'stone';
  const land = new THREE.MeshStandardMaterial({ color: 0x87bd6d, roughness: 0.88, metalness: 0 }); land.name = 'foliage';
  const cloud = new THREE.MeshStandardMaterial({ color: 0xf7f3e8, roughness: 0.82, transparent: true, opacity: 0.78 }); cloud.name = 'stone';
  const globe = new THREE.Mesh(new THREE.SphereGeometry(2.8, 24, 16), ocean);
  globe.position.y = 2.8;
  g.add(globe);
  const patches = [
    [-1.3, 3.55, 2.35, 0.9, 0.45, 0.18],
    [1.1, 3.15, 2.5, 0.72, 0.95, -0.35],
    [-0.45, 1.45, 2.55, 0.5, 0.75, 0.6],
    [1.7, 4.15, 1.65, 0.5, 0.33, -0.2],
  ];
  for (const [x, y, z, sx, sy, r] of patches) {
    const patch = new THREE.Mesh(new THREE.SphereGeometry(0.78, 12, 8), land);
    patch.scale.set(sx, sy, 0.12);
    patch.position.set(x, y, z);
    patch.rotation.z = r;
    g.add(patch);
  }
  for (const y of [2.05, 3.75]) {
    const band = new THREE.Mesh(new THREE.TorusGeometry(2.77, 0.055, 6, 28), cloud);
    band.position.y = y;
    band.rotation.x = Math.PI / 2;
    band.scale.y = 0.72;
    g.add(band);
  }
  return g;
}
