export default function (THREE) {
  const g = new THREE.Group();
  const ivory = new THREE.MeshStandardMaterial({ color: 0xf7f3e8, roughness: 0.62, metalness: 0.18 }); ivory.name = 'metal';
  const dark = new THREE.MeshStandardMaterial({ color: 0x263945, roughness: 0.48, metalness: 0.45 }); dark.name = 'metal';
  const teal = new THREE.MeshStandardMaterial({ color: 0x45c4b0, roughness: 0.28, emissive: 0x45c4b0, emissiveIntensity: 0.75 }); teal.name = 'metal';
  const orange = new THREE.MeshStandardMaterial({ color: 0xff6b4a, roughness: 0.66, metalness: 0.2 }); orange.name = 'metal';
  const windowFrame = new THREE.MeshStandardMaterial({ color: 0x172b33, roughness: 0.45, metalness: 0.55 }); windowFrame.name = 'metal';
  const voidMaterial = new THREE.MeshBasicMaterial({ color: 0x071127, side: THREE.DoubleSide, fog: false });
  const glass = new THREE.MeshBasicMaterial({ color: 0x5ca5c5, transparent: true, opacity: 0.1, depthWrite: false, side: THREE.DoubleSide, fog: false });
  const planetMaterial = new THREE.MeshBasicMaterial({ color: 0x3b91b6, fog: false });
  const orbitMaterial = new THREE.MeshBasicMaterial({ color: 0x8de2db, fog: false });
  const floor = new THREE.Mesh(new THREE.BoxGeometry(8.3, 0.2, 40), dark);
  floor.position.y = 0.1;
  floor.receiveShadow = true;
  g.add(floor);
  const ceiling = new THREE.Mesh(new THREE.BoxGeometry(8.6, 0.2, 40), dark);
  ceiling.position.y = 5.25;
  g.add(ceiling);
  const ceilingLight = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.06, 38), teal);
  ceilingLight.position.y = 5.11;
  g.add(ceilingLight);
  for (const side of [-1, 1]) {
    // The opening is real: the stars sit behind the glass and the wall frames occlude them.
    const lowerWall = new THREE.Mesh(new THREE.BoxGeometry(0.35, 1.65, 40), ivory);
    lowerWall.position.set(side * 4.25, 0.825, 0);
    const upperWall = new THREE.Mesh(new THREE.BoxGeometry(0.35, 1.25, 40), ivory);
    upperWall.position.set(side * 4.25, 4.575, 0);
    g.add(lowerWall, upperWall);
    for (let z = -20; z <= 20; z += 8) {
      const mullion = new THREE.Mesh(new THREE.BoxGeometry(0.4, 2.3, 0.48), ivory);
      mullion.position.set(side * 4.25, 2.8, z);
      g.add(mullion);
    }
    for (const y of [1.7, 3.92]) {
      const sill = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.14, 40), windowFrame);
      sill.position.set(side * 4.03, y, 0);
      g.add(sill);
    }
    const spaceView = new THREE.Mesh(new THREE.PlaneGeometry(40, 3), voidMaterial);
    spaceView.position.set(side * 5.2, 2.8, 0);
    spaceView.rotation.y = Math.PI / 2;
    g.add(spaceView);
    const pane = new THREE.Mesh(new THREE.PlaneGeometry(40, 2.2), glass);
    pane.position.set(side * 4.04, 2.8, 0);
    pane.rotation.y = Math.PI / 2;
    g.add(pane);
    const starPositions = new Float32Array(90 * 3);
    const starColors = new Float32Array(90 * 3);
    let seed = side < 0 ? 404 : 1404;
    const random = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
    const palette = [new THREE.Color(0xfff9ea), new THREE.Color(0x94dbef), new THREE.Color(0xf6c453)];
    for (let i = 0; i < 90; i++) {
      starPositions[i * 3] = side * 5.07;
      starPositions[i * 3 + 1] = 1.83 + random() * 1.94;
      starPositions[i * 3 + 2] = -19.6 + random() * 39.2;
      const color = palette[Math.floor(random() * palette.length)];
      starColors[i * 3] = color.r;
      starColors[i * 3 + 1] = color.g;
      starColors[i * 3 + 2] = color.b;
    }
    const stars = new THREE.BufferGeometry();
    stars.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    stars.setAttribute('color', new THREE.BufferAttribute(starColors, 3));
    g.add(new THREE.Points(stars, new THREE.PointsMaterial({ size: 0.12, vertexColors: true, fog: false, depthWrite: false })));
    const planet = new THREE.Mesh(new THREE.SphereGeometry(0.82, 14, 10), planetMaterial);
    planet.scale.x = 0.13;
    planet.position.set(side * 5.05, 2.75, side < 0 ? -9 : 8);
    g.add(planet);
    const orbit = new THREE.Mesh(new THREE.TorusGeometry(1.08, 0.035, 5, 28), orbitMaterial);
    orbit.rotation.y = Math.PI / 2;
    orbit.rotation.x = -0.25;
    orbit.position.copy(planet.position);
    g.add(orbit);
    const rail = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.35, 40), orange);
    rail.position.set(side * 4.03, 1.25, 0);
    g.add(rail);
    const light = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.15, 36), teal);
    light.position.set(side * 4.03, 4.18, 0);
    g.add(light);
  }
  for (let z = -16; z <= 16; z += 8) {
    const beam = new THREE.Mesh(new THREE.BoxGeometry(8.5, 0.32, 0.42), ivory);
    beam.position.set(0, 5.05, z);
    g.add(beam);
    for (const x of [-2.2, 0, 2.2]) {
      const lane = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.025, 2.8), teal);
      lane.position.set(x, 0.22, z);
      g.add(lane);
    }
  }
  // The existing long lane guides stay readable while edge ticks pass more often.
  for (let z = -18; z <= 18; z += 3) {
    for (const x of [-3.55, 3.55]) {
      const tick = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.025, 0.48), orange);
      tick.position.set(x, 0.225, z);
      g.add(tick);
    }
  }
  return g;
}
