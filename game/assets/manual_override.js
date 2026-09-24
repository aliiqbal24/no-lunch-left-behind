// Roadside physical cut-off, also used inside the station.
export default function generate(THREE) {
  const group = new THREE.Group();
  const metal = new THREE.MeshStandardMaterial({ color: 0x1f4e5f, roughness: 0.45, metalness: 0.35 }); metal.name = 'metal';
  const warning = new THREE.MeshStandardMaterial({ color: 0xf6c453, emissive: 0xf6c453, emissiveIntensity: 0.6 }); warning.name = 'metal';
  const live = new THREE.MeshStandardMaterial({ color: 0xd7263d, emissive: 0xd7263d, emissiveIntensity: 1.2 }); live.name = 'metal';
  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.86, 0.98, 0.28, 12), metal); base.position.y = 0.14; group.add(base);
  const stem = new THREE.Mesh(new THREE.BoxGeometry(0.55, 1.25, 0.42), metal); stem.position.y = 0.9; group.add(stem);
  const plate = new THREE.Mesh(new THREE.BoxGeometry(1.35, 0.74, 0.2), warning); plate.position.set(0, 1.57, -0.19); group.add(plate);
  const button = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.25, 0.22, 10), live);
  button.name = 'overrideButton'; button.rotation.x = Math.PI / 2; button.position.set(0, 1.57, -0.37); group.add(button);
  const beacon = new THREE.Mesh(new THREE.SphereGeometry(0.29, 10, 8), live);
  beacon.name = 'overrideBeacon'; beacon.position.y = 2.18; group.add(beacon);
  return group;
}
