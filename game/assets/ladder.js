export default function (THREE) {
  const g = new THREE.Group();
  const metal = new THREE.MeshStandardMaterial({ color: 0x9ba7b4, roughness: 0.5, metalness: 0.62 }); metal.name = 'metal';
  const orange = new THREE.MeshStandardMaterial({ color: 0xff6b4a, roughness: 0.64, metalness: 0.2 }); orange.name = 'metal';
  for (const x of [-0.52, 0.52]) {
    const rail = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 8, 10), metal);
    rail.position.set(x, 4, 0);
    g.add(rail);
  }
  for (let y = 0.35; y < 8; y += 0.62) {
    const rung = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.055, 1.05, 9), y > 6.8 ? orange : metal);
    rung.rotation.z = Math.PI / 2;
    rung.position.y = y;
    g.add(rung);
  }
  return g;
}
