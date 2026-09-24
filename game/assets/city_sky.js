export default function (THREE) {
  const g = new THREE.Group();
  const basic = (color, opacity = 1) => {
    const m = new THREE.MeshBasicMaterial({
      color, transparent: opacity < 1, opacity, depthWrite: false, fog: false,
    });
    m.name = 'metal';
    return m;
  };
  const warmCloud = basic(0xffb36f, 0.58);
  const smoke = basic(0x403449, 0.9);
  const smokeDark = basic(0x171b2d, 0.82);
  const fire = basic(0xff6b4a, 0.86);
  const red = basic(0xd7263d, 0.56);
  const silhouette = basic(0x121827, 0.92);
  const hot = basic(0xff8a40, 0.8);
  const puff = new THREE.SphereGeometry(1, 10, 7);

  for (const [x, y, width, height] of [[-46, 6, 15, 3.5], [-18, 9, 18, 4.2], [16, 5, 20, 4.8], [49, 10, 14, 3.4]]) {
    for (const [dx, dy, scale] of [[-0.38, 0, 0.72], [0.08, 0.5, 0.9], [0.5, -0.08, 0.66]]) {
      const lobe = new THREE.Mesh(puff, warmCloud);
      lobe.position.set(x + dx * width, y + dy * height, 0);
      lobe.scale.set(width * scale, height * (0.8 + scale * 0.18), 1.25);
      g.add(lobe);
    }
  }

  const columns = [[-42, -1, 1.2], [-21, 3, 0.92], [4, -2, 1.3], [29, 4, 1.02], [48, 0, 1.26]];
  for (const [x, base, scale] of columns) {
    const flame = new THREE.Mesh(new THREE.SphereGeometry(1.25, 10, 7), fire);
    flame.position.set(x, base + 2.2, -1);
    flame.scale.set(1.1 * scale, 1.8 * scale, 1);
    g.add(flame);
    for (let i = 0; i < 7; i++) {
      const cloud = new THREE.Mesh(puff, i > 3 ? smokeDark : smoke);
      cloud.position.set(x + Math.sin(i * 1.7) * (0.9 + i * 0.34), base + 4.4 + i * 3.35, 0);
      const s = scale * (1.9 + i * 0.58);
      cloud.scale.set(s, s * 1.2, 1.2);
      g.add(cloud);
    }
  }

  // A high soot shelf makes the disaster read as a city-wide event rather
  // than five isolated fires. The gap in the middle preserves the rocket.
  for (const [x, y, sx, sy] of [[-42, 28, 18, 4.5], [-18, 31, 15, 5.2], [24, 30, 17, 5], [47, 27, 14, 4.1]]) {
    const shelf = new THREE.Mesh(puff, smokeDark);
    shelf.position.set(x, y, -0.5);
    shelf.scale.set(sx, sy, 1.1);
    g.add(shelf);
  }

  const sun = new THREE.Mesh(new THREE.SphereGeometry(5.4, 20, 12), basic(0xf6c453));
  sun.position.set(17, 17, 1);
  g.add(sun);
  const halo = new THREE.Mesh(new THREE.TorusGeometry(7, 0.16, 5, 40), basic(0xffe7ad, 0.58));
  halo.position.copy(sun.position);
  g.add(halo);
  for (const [x, rotation] of [[-43, -0.34], [-27, -0.48], [31, 0.48], [46, 0.32]]) {
    const beam = new THREE.Mesh(new THREE.ConeGeometry(3.2, 24, 12, 1, true), red);
    beam.position.set(x, 13, 2);
    beam.rotation.z = rotation;
    beam.rotation.x = Math.PI;
    g.add(beam);
  }
  // Far occupation skyline: huge machine crowns and aerial bridges establish
  // city scale behind the playable blocks while preserving a central rocket gap.
  for (const [x, w, h] of [[-57, 8, 18], [-47, 6, 25], [-36, 7, 14], [-25, 5, 21],
    [26, 6, 19], [37, 8, 26], [49, 6, 16], [58, 8, 23]]) {
    const tower = new THREE.Mesh(new THREE.BoxGeometry(w, h, 0.8), silhouette);
    tower.position.set(x, h / 2 - 3, -2.2); g.add(tower);
    const crown = new THREE.Mesh(new THREE.CylinderGeometry(w * 0.28, w * 0.42, 1.2, 10), silhouette);
    crown.position.set(x, h - 2.4, -2.2); g.add(crown);
    const eye = new THREE.Mesh(new THREE.BoxGeometry(w * 0.5, 0.22, 0.1), red);
    eye.position.set(x, h - 3.4, -1.7); g.add(eye);
    const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 3.2, 7), silhouette);
    mast.position.set(x, h - 0.8, -2.2); g.add(mast);
  }
  for (const [x1, x2, y] of [[-57, -47, 9], [-47, -36, 13], [26, 37, 12], [37, 49, 10]]) {
    const bridge = new THREE.Mesh(new THREE.BoxGeometry(Math.abs(x2 - x1), 0.65, 0.8), silhouette);
    bridge.position.set((x1 + x2) / 2, y, -2.15); g.add(bridge);
    const lock = new THREE.Mesh(new THREE.BoxGeometry(Math.abs(x2 - x1) * 0.72, 0.12, 0.1), red);
    lock.position.set((x1 + x2) / 2, y - 0.28, -1.68); g.add(lock);
  }
  // Burning orbital fragments turn the open sky into a global event.
  for (const [x, y, angle, length] of [[-53, 31, -0.7, 8], [-12, 36, -0.5, 6], [23, 38, 0.58, 7], [55, 33, 0.76, 9]]) {
    const streak = new THREE.Mesh(new THREE.ConeGeometry(0.45, length, 8, 1, true), hot);
    streak.position.set(x, y, 0.5); streak.rotation.z = angle; g.add(streak);
    const fragment = new THREE.Mesh(new THREE.OctahedronGeometry(0.72, 0), smokeDark);
    fragment.position.set(x + Math.sin(angle) * length * 0.45, y - Math.cos(angle) * length * 0.45, 0.5); g.add(fragment);
  }
  const centre = new THREE.Box3().setFromObject(g).getCenter(new THREE.Vector3());
  const bounds = new THREE.Box3().setFromObject(g);
  g.children.forEach((child) => { child.position.x -= centre.x; child.position.y -= bounds.min.y; child.position.z -= centre.z; });
  return g;
}
