export default function (THREE) {
  const g = new THREE.Group();
  const metal = new THREE.MeshStandardMaterial({ color: 0x9ba7b4, roughness: 0.4, metalness: 0.6 }); metal.name = 'metal';
  const gold = new THREE.MeshStandardMaterial({ color: 0xf6c453, roughness: 0.46, metalness: 0.42 }); gold.name = 'metal';
  const dark = new THREE.MeshStandardMaterial({ color: 0x21243a, roughness: 0.55, metalness: 0.28 }); dark.name = 'metal';
  const teal = new THREE.MeshStandardMaterial({ color: 0x45c4b0, roughness: 0.25, emissive: 0x45c4b0, emissiveIntensity: 0.45 }); teal.name = 'metal';
  const core = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 1.15, 12), gold);
  core.rotation.z = Math.PI / 2;
  core.position.y = 1.25;
  g.add(core);
  for (const side of [-1, 1]) {
    const arm = new THREE.Mesh(new THREE.BoxGeometry(0.75, 0.11, 0.11), metal);
    arm.position.set(side * 0.85, 1.25, 0);
    g.add(arm);
    const panel = new THREE.Mesh(new THREE.BoxGeometry(1.35, 0.08, 0.82), dark);
    panel.position.set(side * 1.75, 1.25, 0);
    g.add(panel);
    for (const z of [-0.22, 0.22]) {
      const strip = new THREE.Mesh(new THREE.BoxGeometry(1.12, 0.025, 0.035), teal);
      strip.position.set(side * 1.75, 1.302, z);
      g.add(strip);
    }
  }
  const dish = new THREE.Mesh(new THREE.SphereGeometry(0.48, 14, 8, 0, Math.PI * 2, 0, Math.PI / 2), metal);
  dish.position.set(0, 1.77, 0);
  g.add(dish);
  const antenna = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.74, 8), metal);
  antenna.position.set(0, 2.25, 0);
  g.add(antenna);
  g.children.forEach((child) => { child.position.y -= 0.75; });
  return g;
}
