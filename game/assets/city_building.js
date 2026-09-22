export default function (THREE) {
  const g = new THREE.Group();
  const plaster = new THREE.MeshStandardMaterial({ color: 0xf5e6c8, roughness: 0.88 }); plaster.name = 'plaster';
  const coral = new THREE.MeshStandardMaterial({ color: 0xe98b62, roughness: 0.84 }); coral.name = 'plaster';
  const teal = new THREE.MeshStandardMaterial({ color: 0x1f4e5f, roughness: 0.72 }); teal.name = 'metal';
  const glass = new THREE.MeshStandardMaterial({ color: 0x78b7c5, roughness: 0.3, metalness: 0.12 }); glass.name = 'glass';
  const main = new THREE.Mesh(new THREE.BoxGeometry(5.6, 12, 4.6), plaster);
  main.position.y = 6;
  g.add(main);
  const side = new THREE.Mesh(new THREE.BoxGeometry(2, 8.2, 4.85), coral);
  side.position.set(2.35, 4.1, -0.15);
  g.add(side);
  for (let y = 2; y < 11; y += 2.1) {
    for (const x of [-1.65, 0, 1.65]) {
      const window = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.75, 0.08), glass);
      window.position.set(x, y, 2.34);
      g.add(window);
    }
  }
  const awning = new THREE.Mesh(new THREE.BoxGeometry(3.5, 0.28, 1.1), teal);
  awning.position.set(-0.45, 1.55, 2.75);
  awning.rotation.x = -0.08;
  g.add(awning);
  const roof = new THREE.Mesh(new THREE.BoxGeometry(5.9, 0.3, 4.9), teal);
  roof.position.y = 12.15;
  g.add(roof);
  g.children.forEach((o) => { o.position.x -= 0.2; o.position.z -= 0.367; });
  return g;
}
