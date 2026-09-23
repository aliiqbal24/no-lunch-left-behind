export default function (THREE) {
  const g = new THREE.Group();
  const dark = new THREE.MeshStandardMaterial({ color: 0x172b33, roughness: 0.43, metalness: 0.55 }); dark.name = 'metal';
  const red = new THREE.MeshStandardMaterial({ color: 0xd7263d, roughness: 0.3, metalness: 0.16, emissive: 0xd7263d, emissiveIntensity: 0.55 }); red.name = 'metal';
  const yellow = new THREE.MeshStandardMaterial({ color: 0xf6c453, roughness: 0.62, metalness: 0.2 }); yellow.name = 'metal';
  const base = new THREE.Mesh(new THREE.CylinderGeometry(1.25, 1.5, 1.3, 16), dark);
  base.position.y = 0.65;
  g.add(base);
  const collar = new THREE.Mesh(new THREE.CylinderGeometry(1.05, 1.12, 0.32, 16), yellow);
  collar.position.y = 1.36;
  g.add(collar);
  const button = new THREE.Mesh(new THREE.SphereGeometry(0.82, 16, 10, 0, Math.PI * 2, 0, Math.PI / 2), red);
  button.position.y = 1.48;
  button.name = 'buttonCap';
  g.add(button);
  return g;
}
