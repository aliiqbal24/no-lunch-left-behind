export default function (THREE) {
  const g = new THREE.Group();
  const ivory = new THREE.MeshStandardMaterial({ color: 0xf7f3e8, roughness: 0.48, metalness: 0.18 }); ivory.name = 'metal';
  const red = new THREE.MeshStandardMaterial({ color: 0xd7263d, roughness: 0.5, metalness: 0.15 }); red.name = 'metal';
  const teal = new THREE.MeshStandardMaterial({ color: 0x45c4b0, roughness: 0.28, emissive: 0x45c4b0, emissiveIntensity: 0.7 }); teal.name = 'glass';
  const dark = new THREE.MeshStandardMaterial({ color: 0x172b33, roughness: 0.45, metalness: 0.5 }); dark.name = 'metal';
  const body = new THREE.Mesh(new THREE.CylinderGeometry(1.05, 1.18, 6.2, 18), ivory);
  body.position.y = 4;
  g.add(body);
  const nose = new THREE.Mesh(new THREE.ConeGeometry(1.05, 2.25, 18), red);
  nose.position.y = 8.22;
  g.add(nose);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(1.13, 0.12, 7, 18), dark);
  ring.position.y = 1.02;
  ring.rotation.x = Math.PI / 2;
  g.add(ring);
  for (const x of [-0.43, 0.43]) {
    const window = new THREE.Mesh(new THREE.SphereGeometry(0.28, 10, 8), teal);
    window.position.set(x, 5.4, 0.99);
    window.scale.z = 0.28;
    g.add(window);
  }
  for (let i = 0; i < 3; i++) {
    const a = (i / 3) * Math.PI * 2;
    const fin = new THREE.Mesh(new THREE.BoxGeometry(0.2, 1.8, 1.55), red);
    fin.position.set(Math.sin(a) * 1.15, 1.15, Math.cos(a) * 1.15);
    fin.rotation.y = a;
    g.add(fin);
    const nozzle = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.46, 0.75, 12), dark);
    nozzle.position.set(Math.sin(a) * 0.55, 0.38, Math.cos(a) * 0.55);
    g.add(nozzle);
  }
  g.children.forEach((o) => { o.position.z -= 0.347; });
  return g;
}
