export default function (THREE) {
  const g = new THREE.Group();
  const shell = new THREE.MeshStandardMaterial({ color: 0xf7f3e8, roughness: 0.58, metalness: 0.18 }); shell.name = 'metal';
  const dark = new THREE.MeshStandardMaterial({ color: 0x172b33, roughness: 0.72, metalness: 0.12 }); dark.name = 'rubber';
  const orange = new THREE.MeshStandardMaterial({ color: 0xff6b4a, roughness: 0.55, metalness: 0.15 }); orange.name = 'metal';
  const glow = new THREE.MeshStandardMaterial({ color: 0x45c4b0, roughness: 0.28, emissive: 0x45c4b0, emissiveIntensity: 1.2 }); glow.name = 'glass';
  const wheel = new THREE.Mesh(new THREE.TorusGeometry(0.42, 0.15, 8, 18), dark);
  wheel.position.y = 0.46;
  wheel.rotation.y = Math.PI / 2;
  g.add(wheel);
  const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.29, 0.52, 5, 10), shell);
  body.position.y = 1.06;
  g.add(body);
  const face = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.18, 0.055), glow);
  face.position.set(0, 1.2, 0.3);
  g.add(face);
  const badge = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.045, 10), orange);
  badge.position.set(0, 0.92, 0.295);
  badge.rotation.x = Math.PI / 2;
  g.add(badge);
  g.children.forEach((o) => { o.position.y += 0.101; });
  return g;
}
