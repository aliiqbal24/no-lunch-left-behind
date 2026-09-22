export default function (THREE) {
  const g = new THREE.Group();
  const asphalt = new THREE.MeshStandardMaterial({ color: 0x56646b, roughness: 0.94 }); asphalt.name = 'ground';
  const curb = new THREE.MeshStandardMaterial({ color: 0xf5e6c8, roughness: 0.9 }); curb.name = 'stone';
  const paint = new THREE.MeshStandardMaterial({ color: 0xfff9ea, roughness: 0.84 }); paint.name = 'ground';
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
  return g;
}

