export default function (THREE) {
  const g = new THREE.Group();
  const ivory = new THREE.MeshStandardMaterial({ color: 0xf7f3e8, roughness: 0.48, metalness: 0.36 }); ivory.name = 'metal';
  const dark = new THREE.MeshStandardMaterial({ color: 0x172b33, roughness: 0.36, metalness: 0.7 }); dark.name = 'metal';
  const teal = new THREE.MeshStandardMaterial({ color: 0x45c4b0, roughness: 0.2, emissive: 0x45c4b0, emissiveIntensity: 1.1 }); teal.name = 'metal';
  for (let i = 0; i < 3; i++) {
    const ring = new THREE.Mesh(new THREE.TorusGeometry(2.8 - i * 0.38, 0.16, 8, 24), i === 1 ? teal : ivory);
    ring.position.y = 3.05;
    ring.rotation.z = i * 0.18;
    ring.name = `dockRing${i}`;
    g.add(ring);
  }
  for (let i = 0; i < 6; i++) {
    const angle = i / 6 * Math.PI * 2;
    const strut = new THREE.Mesh(new THREE.BoxGeometry(0.22, 1.25, 0.38), dark);
    strut.position.set(Math.cos(angle) * 3.2, 3.05 + Math.sin(angle) * 3.2, 0);
    strut.rotation.z = angle;
    g.add(strut);
  }
  const tunnel = new THREE.Mesh(new THREE.CylinderGeometry(3.35, 3.35, 2.8, 20, 1, true), dark);
  tunnel.rotation.x = Math.PI / 2;
  tunnel.position.set(0, 3.05, 1.55);
  g.add(tunnel);
  g.children.forEach((child) => {
    child.position.y += 0.3;
    child.position.z -= 1.38;
  });
  g.userData.mounts = ['left', 'right'];
  return g;
}
