export default function (THREE) {
  const g = new THREE.Group();
  const frameMat = new THREE.MeshStandardMaterial({ color: 0x172b33, roughness: 0.55, metalness: 0.45 }); frameMat.name = 'metal';
  const faceMat = new THREE.MeshStandardMaterial({ color: 0xfff9ea, roughness: 0.82 }); faceMat.name = 'plaster';
  const face = new THREE.Mesh(new THREE.BoxGeometry(5.4, 2.15, 0.14), faceMat);
  face.name = 'billboardSurface';
  face.position.y = 5.1;
  g.add(face);
  for (const x of [-2.82, 2.82]) {
    const side = new THREE.Mesh(new THREE.BoxGeometry(0.16, 2.5, 0.28), frameMat);
    side.position.set(x, 5.1, 0);
    g.add(side);
  }
  for (const y of [3.82, 6.38]) {
    const rail = new THREE.Mesh(new THREE.BoxGeometry(5.8, 0.16, 0.28), frameMat);
    rail.position.set(0, y, 0);
    g.add(rail);
  }
  for (const x of [-1.7, 1.7]) {
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.13, 3.8, 8), frameMat);
    post.position.set(x, 1.9, -0.08);
    g.add(post);
  }
  const boltMat = new THREE.MeshStandardMaterial({ color: 0xff6b4a, roughness: 0.45, metalness: 0.35 }); boltMat.name = 'metal';
  for (const x of [-2.45, 2.45]) {
    for (const y of [4.22, 5.98]) {
      const bolt = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.075, 0.05, 10), boltMat);
      bolt.position.set(x, y, 0.105);
      bolt.rotation.x = Math.PI / 2;
      g.add(bolt);
    }
  }
  g.userData.surface = face;
  g.userData.mounts = 'back';
  return g;
}
