export default function (THREE) {
  const g = new THREE.Group();
  const metal = new THREE.MeshStandardMaterial({ color: 0x9ba7b4, roughness: 0.36, metalness: 0.64 }); metal.name = 'metal';
  const dark = new THREE.MeshStandardMaterial({ color: 0x172b33, roughness: 0.85 }); dark.name = 'rubber';
  const red = new THREE.MeshStandardMaterial({ color: 0xd7263d, roughness: 0.55, emissive: 0xd7263d, emissiveIntensity: 0.5 }); red.name = 'glass';
  const body = new THREE.Mesh(new THREE.BoxGeometry(0.86, 0.58, 0.5), metal);
  body.position.y = 0.36;
  g.add(body);
  for (const x of [-0.2, 0.2]) {
    const slot = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.025, 0.26), dark);
    slot.position.set(x, 0.662, 0);
    g.add(slot);
  }
  const lever = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.25, 0.09), dark);
  lever.position.set(0.48, 0.31, 0);
  g.add(lever);
  const lamp = new THREE.Mesh(new THREE.SphereGeometry(0.045, 8, 6), red);
  lamp.position.set(0.18, 0.34, 0.258);
  g.add(lamp);
  for (const x of [-0.31, 0.31]) {
    for (const z of [-0.17, 0.17]) {
      const foot = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.07, 8), dark);
      foot.position.set(x, 0.035, z);
      g.add(foot);
    }
  }
  return g;
}

