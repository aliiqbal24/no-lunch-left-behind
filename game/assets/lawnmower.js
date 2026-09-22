export default function (THREE) {
  const g = new THREE.Group();
  const red = new THREE.MeshStandardMaterial({ color: 0xd7263d, roughness: 0.58, metalness: 0.12 }); red.name = 'metal';
  const dark = new THREE.MeshStandardMaterial({ color: 0x172b33, roughness: 0.9 }); dark.name = 'rubber';
  const metal = new THREE.MeshStandardMaterial({ color: 0x9ba7b4, roughness: 0.42, metalness: 0.62 }); metal.name = 'metal';
  const deck = new THREE.Mesh(new THREE.CapsuleGeometry(0.35, 0.45, 5, 10), red);
  deck.rotation.z = Math.PI / 2;
  deck.scale.set(1, 0.65, 1.25);
  deck.position.y = 0.32;
  g.add(deck);
  const motor = new THREE.Mesh(new THREE.CylinderGeometry(0.23, 0.3, 0.35, 12), dark);
  motor.position.y = 0.58;
  g.add(motor);
  for (const x of [-0.4, 0.4]) {
    for (const z of [-0.3, 0.3]) {
      const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 0.11, 10), dark);
      wheel.position.set(x, 0.19, z);
      wheel.rotation.z = Math.PI / 2;
      g.add(wheel);
    }
  }
  for (const x of [-0.3, 0.3]) {
    const rail = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 1.28, 6), metal);
    rail.position.set(x, 1.05, -0.46);
    rail.rotation.x = -0.5;
    g.add(rail);
  }
  const grip = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.7, 8), dark);
  grip.position.set(0, 1.62, -0.77);
  grip.rotation.z = Math.PI / 2;
  g.add(grip);
  const bag = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.34, 0.48), dark);
  bag.position.set(0, 0.48, -0.53);
  bag.rotation.x = -0.12;
  g.add(bag);
  const rearPanel = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.18, 0.055), red);
  rearPanel.position.set(0, 0.5, -0.79);
  rearPanel.rotation.x = -0.12;
  g.add(rearPanel);
  for (const x of [-0.15, 0.15]) {
    const vent = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.07, 8), metal);
    vent.position.set(x, 0.5, -0.835);
    vent.rotation.x = Math.PI / 2;
    g.add(vent);
  }
  g.children.forEach((o) => { o.position.z += 0.182; });
  return g;
}
