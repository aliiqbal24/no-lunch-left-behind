export default function (THREE) {
  const g = new THREE.Group();
  const orange = new THREE.MeshStandardMaterial({ color: 0xff6b4a, roughness: 0.72 }); orange.name = 'rubber';
  const cream = new THREE.MeshStandardMaterial({ color: 0xfff9ea, roughness: 0.8 }); cream.name = 'rubber';
  const dark = new THREE.MeshStandardMaterial({ color: 0x172b33, roughness: 0.9 }); dark.name = 'rubber';
  const base = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.09, 0.62), dark);
  base.position.y = 0.045;
  g.add(base);
  const cone = new THREE.Mesh(new THREE.ConeGeometry(0.24, 0.72, 16, 1, true), orange);
  cone.position.y = 0.45;
  g.add(cone);
  const stripe = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.19, 0.13, 16, 1, true), cream);
  stripe.position.y = 0.47;
  g.add(stripe);
  const collar = new THREE.Mesh(new THREE.TorusGeometry(0.215, 0.025, 6, 16), cream);
  collar.position.y = 0.315;
  collar.rotation.x = Math.PI / 2;
  g.add(collar);
  return g;
}
