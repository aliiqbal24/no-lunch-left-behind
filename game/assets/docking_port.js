export default function (THREE) {
  const g = new THREE.Group();
  const ivory = new THREE.MeshStandardMaterial({ color: 0xf7f3e8, roughness: 0.48, metalness: 0.36 }); ivory.name = 'metal';
  const dark = new THREE.MeshStandardMaterial({ color: 0x172b33, roughness: 0.36, metalness: 0.7 }); dark.name = 'metal';
  const teal = new THREE.MeshStandardMaterial({ color: 0x45c4b0, roughness: 0.2, emissive: 0x45c4b0, emissiveIntensity: 1.1 }); teal.name = 'metal';
  const amber = new THREE.MeshStandardMaterial({ color: 0xf6c453, roughness: 0.24, emissive: 0xf6c453, emissiveIntensity: 1.35 }); amber.name = 'metal';
  const innerDark = new THREE.MeshStandardMaterial({ color: 0x10232b, roughness: 0.85, side: THREE.BackSide }); innerDark.name = 'metal';
  const bulkheadDark = new THREE.MeshStandardMaterial({ color: 0x09161d, roughness: 0.9 }); bulkheadDark.name = 'metal';
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
  for (const side of [-1, 1]) {
    const approachRail = new THREE.Mesh(new THREE.BoxGeometry(0.22, 1.4, 0.32), dark);
    approachRail.position.set(side * 3.88, 3.05, -0.18);
    g.add(approachRail);
    for (const height of [-0.46, 0.46]) {
      const beacon = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.26, 0.12), amber);
      beacon.position.set(side * 3.88, 3.05 + height, -0.43);
      g.add(beacon);
    }
  }
  const tunnel = new THREE.Mesh(new THREE.CylinderGeometry(3.35, 3.35, 2.8, 20, 1, true), dark);
  tunnel.rotation.x = Math.PI / 2;
  tunnel.position.set(0, 3.05, 1.55);
  g.add(tunnel);

  // The original tube has only outward faces. This second surface and the far
  // bulkhead give the approaching camera a closed, dark passage to travel through.
  const innerTunnel = new THREE.Mesh(new THREE.CylinderGeometry(3.12, 3.12, 2.8, 20, 1, true), innerDark);
  innerTunnel.name = 'dockPassage';
  innerTunnel.rotation.x = Math.PI / 2;
  innerTunnel.position.set(0, 3.05, 1.55);
  g.add(innerTunnel);
  const entranceRim = new THREE.Mesh(new THREE.TorusGeometry(3.16, 0.1, 7, 20), dark);
  entranceRim.position.set(0, 3.05, 0.16);
  g.add(entranceRim);
  for (const x of [-2.3, 2.3]) {
    const guide = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.12, 2.45), teal);
    guide.position.set(x, 1.06, 1.55);
    g.add(guide);
  }
  const bulkhead = new THREE.Group();
  bulkhead.name = 'dockBulkhead';
  bulkhead.position.set(0, 3.05, 2.83);
  const door = new THREE.Mesh(new THREE.CircleGeometry(3.08, 20), bulkheadDark);
  door.rotation.y = Math.PI;
  bulkhead.add(door);
  const seal = new THREE.Mesh(new THREE.TorusGeometry(3.04, 0.09, 7, 20), ivory);
  seal.position.z = -0.035;
  bulkhead.add(seal);
  const statusBar = new THREE.Mesh(new THREE.BoxGeometry(1.15, 0.12, 0.05), teal);
  statusBar.position.z = -0.08;
  bulkhead.add(statusBar);
  g.add(bulkhead);

  g.children.forEach((child) => {
    child.position.y += 0.3;
    child.position.z -= 1.38;
  });
  g.userData.mounts = ['left', 'right'];
  return g;
}
