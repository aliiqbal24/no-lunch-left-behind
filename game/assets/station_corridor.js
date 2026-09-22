export default function (THREE) {
  const g = new THREE.Group();
  const ivory = new THREE.MeshStandardMaterial({ color: 0xf7f3e8, roughness: 0.62, metalness: 0.18 }); ivory.name = 'metal';
  const dark = new THREE.MeshStandardMaterial({ color: 0x263945, roughness: 0.48, metalness: 0.45 }); dark.name = 'metal';
  const teal = new THREE.MeshStandardMaterial({ color: 0x45c4b0, roughness: 0.28, emissive: 0x45c4b0, emissiveIntensity: 0.75 }); teal.name = 'metal';
  const orange = new THREE.MeshStandardMaterial({ color: 0xff6b4a, roughness: 0.66, metalness: 0.2 }); orange.name = 'metal';
  const floor = new THREE.Mesh(new THREE.BoxGeometry(8.3, 0.2, 40), dark);
  floor.position.y = 0.1;
  floor.receiveShadow = true;
  g.add(floor);
  for (const side of [-1, 1]) {
    const wall = new THREE.Mesh(new THREE.BoxGeometry(0.35, 5.2, 40), ivory);
    wall.position.set(side * 4.25, 2.6, 0);
    g.add(wall);
    const rail = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.35, 40), orange);
    rail.position.set(side * 4.03, 1.25, 0);
    g.add(rail);
    const light = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.15, 36), teal);
    light.position.set(side * 4.03, 3.75, 0);
    g.add(light);
  }
  for (let z = -16; z <= 16; z += 8) {
    const beam = new THREE.Mesh(new THREE.BoxGeometry(8.5, 0.32, 0.42), ivory);
    beam.position.set(0, 5.05, z);
    g.add(beam);
    for (const x of [-2.2, 0, 2.2]) {
      const lane = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.025, 2.8), teal);
      lane.position.set(x, 0.22, z);
      g.add(lane);
    }
  }
  return g;
}
