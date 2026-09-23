export default function (THREE) {
  const g = new THREE.Group();
  const cream = new THREE.MeshBasicMaterial({ color: 0xffc998, transparent: true, opacity: 0.86, depthWrite: false, fog: false });
  const coral = new THREE.MeshBasicMaterial({ color: 0xeb7b70, transparent: true, opacity: 0.64, depthWrite: false, fog: false });
  const haze = new THREE.MeshBasicMaterial({ color: 0xf6a564, transparent: true, opacity: 0.32, depthWrite: false, fog: false });
  const puff = new THREE.SphereGeometry(1, 10, 6);
  const clouds = [
    [-57, 9, -5, 12, 1.5], [-28, 15, 3, 15, 2.1],
    [3, 6, -2, 18, 2.2], [28, 20, 5, 12, 1.6], [56, 11, -3, 16, 2],
  ];
  for (const [x, y, z, width, height] of clouds) {
    for (const [dx, dy, scale, material] of [[-0.4, 0, 0.72, cream], [0.16, 0.55, 0.9, cream], [0.57, -0.18, 0.65, coral]]) {
      const lobe = new THREE.Mesh(puff, material);
      lobe.position.set(x + dx * width, y + dy * height, z);
      lobe.scale.set(width * scale, height * (0.75 + scale * 0.25), 1.2);
      g.add(lobe);
    }
  }
  for (const [x, y, width] of [[-36, 2, 30], [12, 13, 36], [55, 4, 32]]) {
    const wisp = new THREE.Mesh(puff, haze);
    wisp.position.set(x, y, -6);
    wisp.scale.set(width, 2.2, 1);
    g.add(wisp);
  }
  const sun = new THREE.Mesh(new THREE.SphereGeometry(5.8, 20, 12), new THREE.MeshBasicMaterial({ color: 0xf6c453, fog: false }));
  sun.position.set(18, 19, 2);
  g.add(sun);
  const halo = new THREE.Mesh(new THREE.TorusGeometry(7.2, 0.16, 5, 40), new THREE.MeshBasicMaterial({ color: 0xffe7ad, transparent: true, opacity: 0.7, fog: false }));
  halo.position.copy(sun.position);
  g.add(halo);
  const centre = new THREE.Box3().setFromObject(g).getCenter(new THREE.Vector3());
  g.children.forEach((child) => { child.position.x -= centre.x; child.position.z -= centre.z; });
  return g;
}
