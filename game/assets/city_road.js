export default function (THREE) {
  const g = new THREE.Group();
  const asphalt = new THREE.MeshStandardMaterial({ color: 0x56646b, roughness: 0.94 }); asphalt.name = 'ground';
  const curb = new THREE.MeshStandardMaterial({ color: 0xf5e6c8, roughness: 0.9 }); curb.name = 'stone';
  const paint = new THREE.MeshStandardMaterial({ color: 0xfff9ea, roughness: 0.84 }); paint.name = 'ground';
  const guide = new THREE.MeshStandardMaterial({ color: 0x45c4b0, roughness: 0.38, emissive: 0x45c4b0, emissiveIntensity: 0.75 }); guide.name = 'metal';
  const approach = new THREE.MeshStandardMaterial({ color: 0xf6c453, roughness: 0.7 }); approach.name = 'ground';
  const road = new THREE.Mesh(new THREE.BoxGeometry(8.2, 0.18, 40), asphalt);
  road.position.y = 0.09;
  road.receiveShadow = true;
  g.add(road);
  for (const x of [-4.45, 4.45]) {
    const c = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.32, 40), curb);
    c.position.set(x, 0.16, 0);
    c.receiveShadow = true;
    g.add(c);
  }
  for (const x of [-1.1, 1.1]) {
    for (let z = -18; z <= 18; z += 6) {
      const dash = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.025, 2.5), paint);
      dash.position.set(x, 0.195, z);
      g.add(dash);
    }
  }
  for (const x of [-3.83, 3.83]) {
    const line = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.025, 40), guide);
    line.position.set(x, 0.205, 0);
    g.add(line);
  }
  // Short edge ticks provide frequent passing motion without changing the road or lanes.
  for (let z = -18; z <= 18; z += 3) {
    for (const x of [-3.35, 3.35]) {
      const marker = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.025, 0.52), approach);
      marker.position.set(x, 0.21, z);
      g.add(marker);
    }
  }
  return g;
}
