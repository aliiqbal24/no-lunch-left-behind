export default function (THREE) {
  const g = new THREE.Group();
  const concrete = new THREE.MeshStandardMaterial({ color: 0x9ba7b4, roughness: 0.88 }); concrete.name = 'stone';
  const dark = new THREE.MeshStandardMaterial({ color: 0x172b33, roughness: 0.52, metalness: 0.5 }); dark.name = 'metal';
  const orange = new THREE.MeshStandardMaterial({ color: 0xff6b4a, roughness: 0.58, metalness: 0.18 }); orange.name = 'metal';
  const base = new THREE.Mesh(new THREE.CylinderGeometry(3.7, 4, 0.55, 18), concrete);
  base.position.y = 0.275;
  g.add(base);
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * Math.PI * 2;
    const stripe = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.05, 1.4), orange);
    stripe.position.set(Math.sin(a) * 3.1, 0.58, Math.cos(a) * 3.1);
    stripe.rotation.y = a;
    g.add(stripe);
  }
  const tower = new THREE.Mesh(new THREE.BoxGeometry(0.5, 7.4, 0.5), dark);
  tower.position.set(-3.2, 3.7, -0.5);
  g.add(tower);
  for (const y of [1.2, 2.6, 4, 5.4, 6.8]) {
    const arm = new THREE.Mesh(new THREE.BoxGeometry(2.1, 0.18, 0.18), dark);
    arm.position.set(-2.15, y, -0.5);
    g.add(arm);
  }
  return g;
}
