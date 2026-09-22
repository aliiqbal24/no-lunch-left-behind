export default function (THREE) {
  const g = new THREE.Group();
  const teal = new THREE.MeshStandardMaterial({ color: 0x1f4e5f, roughness: 0.8 }); teal.name = 'fabric';
  const metal = new THREE.MeshStandardMaterial({ color: 0x9ba7b4, roughness: 0.4, metalness: 0.62 }); metal.name = 'metal';
  const dark = new THREE.MeshStandardMaterial({ color: 0x172b33, roughness: 0.9 }); dark.name = 'rubber';
  const seat = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.18, 0.64), teal);
  seat.position.y = 0.78;
  seat.rotation.x = -0.07;
  g.add(seat);
  const back = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.72, 0.16), teal);
  back.position.set(0, 1.14, -0.27);
  back.rotation.x = -0.16;
  g.add(back);
  const post = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.07, 0.58, 8), metal);
  post.position.y = 0.47;
  g.add(post);
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2;
    const spoke = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.03, 0.52, 6), metal);
    spoke.position.set(Math.cos(a) * 0.2, 0.2, Math.sin(a) * 0.2);
    spoke.rotation.z = Math.PI / 2;
    spoke.rotation.y = -a;
    g.add(spoke);
    const wheel = new THREE.Mesh(new THREE.TorusGeometry(0.07, 0.025, 5, 9), dark);
    wheel.position.set(Math.cos(a) * 0.47, 0.09, Math.sin(a) * 0.47);
    wheel.rotation.y = a;
    g.add(wheel);
  }
  for (const x of [-0.43, 0.43]) {
    const arm = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.42, 0.08), metal);
    arm.position.set(x, 1.02, 0);
    g.add(arm);
  }
  return g;
}

