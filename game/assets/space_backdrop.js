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

  const planet = new THREE.Mesh(new THREE.SphereGeometry(6.3, 22, 14), new THREE.MeshStandardMaterial({ color: 0x4b95b7, roughness: 0.86, emissive: 0x1f4e6e, emissiveIntensity: 0.35 }));
  planet.position.set(-9, 17, 75);
  g.add(planet);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(8.7, 0.32, 6, 52), new THREE.MeshBasicMaterial({ color: 0x9ad9dc, side: THREE.DoubleSide, fog: false }));
  ring.position.copy(planet.position);
  ring.rotation.set(1.05, 0.2, -0.25);
  g.add(ring);
  const moon = new THREE.Mesh(new THREE.SphereGeometry(3.3, 16, 10), new THREE.MeshStandardMaterial({ color: 0xdfa780, roughness: 0.92, emissive: 0x6b403d, emissiveIntensity: 0.25 }));
  moon.position.set(18, -7, 100);
  g.add(moon);
  g.children.forEach((child) => { child.position.y += 140; });
  return g;
}
