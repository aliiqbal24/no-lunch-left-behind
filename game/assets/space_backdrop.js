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
  for (const [x, y, z, sx, sy, rotation, material] of [
    [-42, 34, 88, 34, 7, 0.42, nebulaViolet], [34, -18, 74, 29, 6, -0.34, nebulaTeal],
    [0, 42, 116, 48, 5, 0.08, nebulaViolet],
  ]) {
    const ribbon = new THREE.Mesh(new THREE.SphereGeometry(1, 28, 12), material);
    ribbon.position.set(x, y, z); ribbon.scale.set(sx, sy, 1.4); ribbon.rotation.z = rotation; g.add(ribbon);
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
  // City-light arcs and AI crisis scars make Earth feel inhabited and endangered.
  const cityLight = new THREE.MeshBasicMaterial({ color: 0xf6c453, transparent: true, opacity: 0.92, fog: false });
  const crisis = new THREE.MeshBasicMaterial({ color: 0xd7263d, transparent: true, opacity: 0.78, fog: false });
  for (let i = 0; i < 34; i++) {
    const a = i * 2.399;
    const radius = 22 + (i % 5) * 0.9;
    const light = new THREE.Mesh(new THREE.SphereGeometry(0.18 + (i % 3) * 0.045, 7, 5), i % 8 === 0 ? crisis : cityLight);
    light.position.set(-16 + Math.cos(a) * radius, -28 + Math.sin(a) * radius * 0.72, 65.2 + (i % 4) * 0.22);
    g.add(light);
  }
  for (const [x, y, sx, sy, rot] of [[-26,-22,8,2.4,.45],[-8,-31,6,1.8,-.3],[-19,-42,7,1.6,.1]]) {
    const scar = new THREE.Mesh(new THREE.TorusGeometry(1, 0.08, 5, 30, Math.PI * 1.25), crisis);
    scar.position.set(x, y, 64.9); scar.scale.set(sx, sy, 1); scar.rotation.z = rot; g.add(scar);
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

  // Distant orbital construction, navigation lights and wreckage establish depth.
  const farSteel = new THREE.MeshBasicMaterial({ color: 0x1f4e5f, fog: false });
  const farIvory = new THREE.MeshBasicMaterial({ color: 0xf7f3e8, fog: false });
  const farTeal = new THREE.MeshBasicMaterial({ color: 0x45c4b0, fog: false });
  for (const [x, y, z, s, tilt] of [[-42,18,72,1.1,.3],[37,29,84,.8,-.4],[46,-8,98,1.25,.2],[-50,-22,104,.9,-.2]]) {
    const truss = new THREE.Group();
    for (let i = -2; i <= 2; i++) {
      const bar = new THREE.Mesh(new THREE.BoxGeometry(0.12 * s, 4.4 * s, 0.12 * s), farSteel);
      bar.position.x = i * 0.78 * s; truss.add(bar);
      if (i < 2) {
        const brace = new THREE.Mesh(new THREE.BoxGeometry(0.1 * s, 1.4 * s, 0.1 * s), farIvory);
        brace.position.set((i + 0.5) * 0.78 * s, 0, 0); brace.rotation.z = (i % 2 ? -1 : 1) * 0.52; truss.add(brace);
      }
    }
    truss.position.set(x, y, z); truss.rotation.set(0.3, tilt, tilt); g.add(truss);
  }
  for (const [x, y, z] of [[-9,17,55],[12,9,66],[-30,2,82],[31,-17,72],[4,31,96]]) {
    const buoy = new THREE.Group();
    const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.08,0.08,1.7,7),farIvory); buoy.add(stem);
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.52,0.07,6,16),farTeal); ring.rotation.x=Math.PI/2; buoy.add(ring);
    buoy.position.set(x,y,z); buoy.rotation.z=x*.03; g.add(buoy);
  }
  g.children.forEach((child) => { child.position.y += 140; });
  return g;
}
