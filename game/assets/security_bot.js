export default function (THREE) {
  const g = new THREE.Group();
  const ivory = new THREE.MeshStandardMaterial({ color: 0xf7f3e8, roughness: 0.5, metalness: 0.22 }); ivory.name = 'metal';
  const red = new THREE.MeshStandardMaterial({ color: 0xd7263d, roughness: 0.24, emissive: 0xd7263d, emissiveIntensity: 0.9 }); red.name = 'metal';
  const dark = new THREE.MeshStandardMaterial({ color: 0x172b33, roughness: 0.4, metalness: 0.62 }); dark.name = 'metal';
  const body = new THREE.Mesh(new THREE.SphereGeometry(0.62, 14, 10), ivory);
  body.scale.y = 0.82;
  body.position.y = 0.88;
  g.add(body);
  const eye = new THREE.Mesh(new THREE.SphereGeometry(0.18, 10, 7), red);
  eye.scale.z = 0.38;
  eye.position.set(0, 0.94, 0.57);
  g.add(eye);
  for (const side of [-1, 1]) {
    const arm = new THREE.Mesh(new THREE.CapsuleGeometry(0.09, 0.48, 4, 8), dark);
    arm.position.set(side * 0.65, 0.65, 0);
    arm.rotation.z = side * 0.58;
    g.add(arm);
    const wheel = new THREE.Mesh(new THREE.TorusGeometry(0.22, 0.09, 7, 12), dark);
    wheel.position.set(side * 0.55, 0.25, 0);
    wheel.rotation.y = Math.PI / 2;
    g.add(wheel);
  }
  const antenna = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.5, 8), dark);
  antenna.position.set(0, 1.52, 0);
  g.add(antenna);
  const tip = new THREE.Mesh(new THREE.SphereGeometry(0.09, 8, 6), red);
  tip.position.set(0, 1.8, 0);
  g.add(tip);
  g.children.forEach((child) => { child.position.y += 0.06; });
  return g;
}
