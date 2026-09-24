export default function (THREE) {
  const g = new THREE.Group();
  const domeMaterial = new THREE.MeshBasicMaterial({ color: 0x090d22, side: THREE.BackSide, depthWrite: false, fog: false });
  domeMaterial.name = 'stone';
  const dome = new THREE.Mesh(new THREE.SphereGeometry(140, 20, 12), domeMaterial);
  dome.name = 'spaceDome';
  g.add(dome);

  let seed = 404;
  const random = () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 4294967296;
  };
  const starPalette = [new THREE.Color(0xfff9ea), new THREE.Color(0xa8e5ee), new THREE.Color(0xf6c453), new THREE.Color(0xc8b9ec)];
  for (const [count, size] of [[950, 1.25], [140, 2.8]]) {
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const theta = random() * Math.PI * 2;
      const phi = Math.acos(random() * 2 - 1);
      const radius = 90 + random() * 30;
      positions[i * 3] = Math.sin(phi) * Math.cos(theta) * radius;
      positions[i * 3 + 1] = Math.cos(phi) * radius;
      positions[i * 3 + 2] = Math.sin(phi) * Math.sin(theta) * radius;
      const color = starPalette[Math.floor(random() * starPalette.length)];
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    const stars = new THREE.Points(geometry, new THREE.PointsMaterial({ size, vertexColors: true, fog: false, depthWrite: false }));
    stars.name = size > 2 ? 'brightStars' : 'stars';
    g.add(stars);
  }

  const nebulaTeal = new THREE.MeshBasicMaterial({ color: 0x286d86, transparent: true, opacity: 0.07, depthWrite: false, fog: false });
  const nebulaViolet = new THREE.MeshBasicMaterial({ color: 0x6b5b95, transparent: true, opacity: 0.07, depthWrite: false, fog: false });
  for (const [x, y, z, sx, sy, material] of [[28, 24, 105, 27, 9, nebulaTeal], [-38, -6, 100, 25, 11, nebulaViolet]]) {
    const cloud = new THREE.Mesh(new THREE.SphereGeometry(1, 24, 14), material);
    cloud.position.set(x, y, z);
    cloud.scale.set(sx, sy, 2);
    g.add(cloud);
  }

  // Earth stays in view throughout the flight, then fills the final station window.
  const earth = new THREE.Mesh(new THREE.SphereGeometry(29, 32, 20),
    new THREE.MeshBasicMaterial({ color: 0x2c88ba, fog: false }));
  earth.position.set(-16, -28, 94);
  g.add(earth);
  const atmosphere = new THREE.Mesh(new THREE.SphereGeometry(29.8, 32, 20),
    new THREE.MeshBasicMaterial({ color: 0x9ad9dc, transparent: true, opacity: 0.18, side: THREE.BackSide, depthWrite: false, fog: false }));
  atmosphere.position.copy(earth.position);
  g.add(atmosphere);
  const land = new THREE.MeshBasicMaterial({ color: 0x88bc74, fog: false });
  for (const [x, y, z, sx, sy, rotation] of [
    [-26, -13, 67.5, 7, 3.8, 0.45], [-6, -20, 68.4, 5.5, 8, -0.35],
    [-18, -35, 65.7, 7.5, 3.5, 0.15], [2, -37, 76, 4.2, 3.6, -0.3],
  ]) {
    const patch = new THREE.Mesh(new THREE.SphereGeometry(1, 12, 8), land);
    patch.position.set(x, y, z);
    patch.scale.set(sx, sy, 0.28);
    patch.rotation.z = rotation;
    g.add(patch);
  }
  for (const [y, radius] of [[-21, 27.7], [-38, 25.7]]) {
    const cloud = new THREE.Mesh(new THREE.TorusGeometry(radius, 0.15, 5, 48),
      new THREE.MeshBasicMaterial({ color: 0xdaf4f1, transparent: true, opacity: 0.56, depthWrite: false, fog: false }));
    cloud.position.set(-16, y, 66.2);
    cloud.scale.y = 0.38;
    g.add(cloud);
  }
  const distantPlanet = new THREE.Mesh(new THREE.SphereGeometry(5.2, 20, 12),
    new THREE.MeshStandardMaterial({ color: 0x8da4d7, roughness: 0.92, emissive: 0x3c4d7a, emissiveIntensity: 0.25 }));
  distantPlanet.position.set(24, 17, 105);
  g.add(distantPlanet);
  const distantRing = new THREE.Mesh(new THREE.TorusGeometry(7.3, 0.22, 5, 40),
    new THREE.MeshBasicMaterial({ color: 0xb8dcdf, side: THREE.DoubleSide, fog: false }));
  distantRing.position.copy(distantPlanet.position);
  distantRing.rotation.set(1.05, 0.2, -0.25);
  g.add(distantRing);
  g.children.forEach((child) => { child.position.y += 140; });
  return g;
}
