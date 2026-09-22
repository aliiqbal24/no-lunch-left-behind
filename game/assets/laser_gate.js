export default function (THREE) {
  const g = new THREE.Group();
  const dark = new THREE.MeshStandardMaterial({ color: 0x172b33, roughness: 0.42, metalness: 0.58 }); dark.name = 'metal';
  const red = new THREE.MeshStandardMaterial({ color: 0xd7263d, roughness: 0.25, emissive: 0xd7263d, emissiveIntensity: 1.65 }); red.name = 'metal';
  const ivory = new THREE.MeshStandardMaterial({ color: 0xf7f3e8, roughness: 0.6, metalness: 0.2 }); ivory.name = 'metal';
  for (const x of [-0.82, 0.82]) {
    const post = new THREE.Mesh(new THREE.BoxGeometry(0.25, 2.3, 0.36), ivory);
    post.position.set(x, 1.15, 0);
    g.add(post);
    const cap = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.34, 0.52), dark);
    cap.position.set(x, 1.18, 0);
    g.add(cap);
  }
  for (const y of [0.72, 0.98]) {
    const beam = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.055, 1.52, 8), red);
    beam.rotation.z = Math.PI / 2;
    beam.position.y = y;
    beam.name = 'laserBeam';
    g.add(beam);
  }
  for (const x of [-0.82, 0.82]) {
    for (const y of [0.32, 2.02]) {
      const lamp = new THREE.Mesh(new THREE.SphereGeometry(0.1, 8, 6), red);
      lamp.position.set(x, y, 0.2);
      g.add(lamp);
    }
  }
  return g;
}
