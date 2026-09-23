// A broad rotunda opens from the corridor and ends in a curved Earth viewport.
// The switch is placed at this asset's origin; Earth mounts behind the bubble.
export default function (THREE) {
  const hub = new THREE.Group();
  hub.name = 'stationHub';
  const floorMat = new THREE.MeshStandardMaterial({ color: 0x203d59, roughness: 0.68, metalness: 0.34 }); floorMat.name = 'metal';
  const shell = new THREE.MeshStandardMaterial({ color: 0x516f83, roughness: 0.58, metalness: 0.34, side: THREE.BackSide }); shell.name = 'metal';
  const ivory = new THREE.MeshStandardMaterial({ color: 0xdce8ec, roughness: 0.5, metalness: 0.28 }); ivory.name = 'metal';
  const dark = new THREE.MeshStandardMaterial({ color: 0x122837, roughness: 0.4, metalness: 0.55 }); dark.name = 'metal';
  const teal = new THREE.MeshStandardMaterial({ color: 0x9cf6ed, roughness: 0.28, emissive: 0x45c4b0, emissiveIntensity: 0.9 }); teal.name = 'metal';
  const orange = new THREE.MeshStandardMaterial({ color: 0xff8067, roughness: 0.4, emissive: 0xff6b4a, emissiveIntensity: 0.25 }); orange.name = 'metal';
  const glass = new THREE.MeshBasicMaterial({ color: 0x7fdff0, transparent: true, opacity: 0.09, depthWrite: false, side: THREE.DoubleSide, fog: false });
  const spaceMat = new THREE.MeshBasicMaterial({ color: 0x061324, side: THREE.DoubleSide, fog: false });
  const entryWall = new THREE.MeshStandardMaterial({ color: 0xf7f3e8, roughness: 0.62, metalness: 0.18 }); entryWall.name = 'metal';
  const entryFrame = new THREE.MeshStandardMaterial({ color: 0x172b33, roughness: 0.45, metalness: 0.55 }); entryFrame.name = 'metal';
  const add = (name, geometry, material, x = 0, y = 0, z = 0) => {
    const mesh = new THREE.Mesh(geometry, material);
    mesh.name = name;
    mesh.position.set(x, y, z);
    hub.add(mesh);
    return mesh;
  };

  // This short windowed passage replaces the last recycled corridor chunk
  // when the room reaches it, then opens into the circular hub.
  const entryStart = hub.children.length;
  add('hubEntryFloor', new THREE.BoxGeometry(8.3, 0.2, 37), floorMat, 0, 0.11, -26.5);
  add('hubEntryCeiling', new THREE.BoxGeometry(8.6, 0.2, 26), dark, 0, 5.25, -32);
  add('hubEntryCeilingLight', new THREE.BoxGeometry(0.22, 0.06, 25), teal, 0, 5.11, -32);
  for (const side of [-1, 1]) {
    add('hubEntryLowerWall', new THREE.BoxGeometry(0.35, 1.65, 26), entryWall, side * 4.25, 0.825, -32);
    add('hubEntryUpperWall', new THREE.BoxGeometry(0.35, 1.25, 26), entryWall, side * 4.25, 4.575, -32);
    for (const y of [1.7, 3.92]) {
      add('hubEntryWindowSill', new THREE.BoxGeometry(0.22, 0.14, 26), entryFrame, side * 4.03, y, -32);
    }
    const view = add('hubEntrySpaceView', new THREE.PlaneGeometry(26, 3), spaceMat, side * 5.2, 2.8, -32);
    view.rotation.y = Math.PI / 2;
    const pane = add('hubEntryGlass', new THREE.PlaneGeometry(26, 2.2), glass, side * 4.04, 2.8, -32);
    pane.rotation.y = Math.PI / 2;
    add('hubEntryRail', new THREE.BoxGeometry(0.2, 0.35, 26), orange, side * 4.03, 1.25, -32);
    for (const z of [-41, -33, -25]) {
      add('hubEntryMullion', new THREE.BoxGeometry(0.4, 2.3, 0.48), entryWall, side * 4.25, 2.8, z);
    }
    const starPositions = new Float32Array(40 * 3);
    let seed = side < 0 ? 404 : 1404;
    const random = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
    for (let i = 0; i < 40; i++) {
      starPositions[i * 3] = side * 5.07;
      starPositions[i * 3 + 1] = 1.83 + random() * 1.94;
      starPositions[i * 3 + 2] = -44.6 + random() * 25.2;
    }
    const starGeometry = new THREE.BufferGeometry();
    starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    const stars = new THREE.Points(starGeometry,
      new THREE.PointsMaterial({ color: 0xd7f4ff, size: 0.12, fog: false, depthWrite: false }));
    stars.name = 'hubEntryStars';
    hub.add(stars);
  }
  for (const z of [-41, -33, -25]) {
    add('hubEntryBeam', new THREE.BoxGeometry(8.5, 0.32, 0.42), entryWall, 0, 5.05, z);
  }
  const entryPassage = new THREE.Group();
  entryPassage.name = 'hubEntryPassage';
  for (const part of hub.children.slice(entryStart)) {
    hub.remove(part);
    entryPassage.add(part);
  }
  hub.add(entryPassage);
  add('hubFloor', new THREE.CylinderGeometry(10, 10, 0.24, 48), floorMat, 0, 0.08, 0);
  for (const radius of [3.1, 8.2]) {
    const ring = add('floorGuide', new THREE.TorusGeometry(radius, 0.075, 6, 48), teal, 0, 0.235, 0);
    ring.rotation.x = Math.PI / 2;
  }
  for (let i = 0; i < 16; i++) {
    const angle = i * Math.PI / 8;
    const tick = add('floorSector', new THREE.BoxGeometry(0.13, 0.025, 0.82), i % 2 ? teal : orange,
      Math.sin(angle) * 7.4, 0.23, Math.cos(angle) * 7.4);
    tick.rotation.y = angle;
  }

  // Curved side walls and a high domed crown leave openings for the entry
  // and viewport, creating a ball-like command room instead of an end wall.
  const radius = 9.8;
  for (const start of [Math.PI / 4, 5 * Math.PI / 4]) {
    add('hubCurvedWall', new THREE.CylinderGeometry(radius, radius, 4.9, 16, 1, true, start, Math.PI / 2),
      shell, 0, 2.65, 0);
  }
  add('hubDomeCrown', new THREE.SphereGeometry(radius, 32, 7, 0, Math.PI * 2, 0, 0.62), shell, 0, 5.1, 0);
  for (const [start, length] of [[0, Math.PI / 4], [3 * Math.PI / 4, Math.PI / 2], [7 * Math.PI / 4, Math.PI / 4]]) {
    add('hubDomeSide', new THREE.SphereGeometry(radius, 16, 8, start, length, 0.62, Math.PI / 2 - 0.62),
      shell, 0, 5.1, 0);
  }
  for (const angle of [Math.PI / 4, Math.PI / 2, 3 * Math.PI / 2, 7 * Math.PI / 4]) {
    const x = Math.sin(angle) * radius;
    const z = Math.cos(angle) * radius;
    add('hubWallRib', new THREE.CylinderGeometry(0.16, 0.2, 4.9, 8), ivory, x, 2.65, z);
    add('hubWallLight', new THREE.CylinderGeometry(0.045, 0.045, 4.2, 6), teal,
      Math.sin(angle) * (radius - 0.19), 2.7, Math.cos(angle) * (radius - 0.19));
  }
  for (const phi of [0, Math.PI / 4, 3 * Math.PI / 4, Math.PI, 5 * Math.PI / 4, 7 * Math.PI / 4]) {
    const points = [];
    for (let i = 0; i <= 12; i++) {
      const theta = 0.62 + (Math.PI / 2 - 0.62) * i / 12;
      points.push(new THREE.Vector3(-radius * Math.cos(phi) * Math.sin(theta),
        5.1 + radius * Math.cos(theta), radius * Math.sin(phi) * Math.sin(theta)));
    }
    add('hubDomeRib', new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points), 20, 0.1, 5, false), ivory);
  }

  add('hubEntryArch', new THREE.TorusGeometry(4.25, 0.24, 8, 32, Math.PI), ivory, 0, 5, -8.4);

  // A half-sphere of clear glass bulges into space. Curved ribs frame the view
  // without laying a rectangular wall behind the button.
  const windowRadius = 5.3;
  const windowY = 5.55;
  const windowZ = 8;
  add('clearEarthPane', new THREE.SphereGeometry(windowRadius, 32, 18, 0, Math.PI), glass,
    0, windowY, windowZ);
  add('viewportOuterRim', new THREE.TorusGeometry(windowRadius, 0.22, 8, 48), dark, 0, windowY, windowZ);
  add('viewportLightRim', new THREE.TorusGeometry(windowRadius - 0.23, 0.075, 6, 48), teal,
    0, windowY, windowZ + 0.04);
  for (const yOffset of [-2.65, 0, 2.65]) {
    const arcRadius = Math.sqrt(windowRadius ** 2 - yOffset ** 2);
    const points = [];
    for (let i = 0; i <= 20; i++) {
      const angle = Math.PI * i / 20;
      points.push(new THREE.Vector3(arcRadius * Math.cos(angle), windowY + yOffset,
        windowZ + arcRadius * Math.sin(angle)));
    }
    add('viewportCurveRib', new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points), 32, 0.045, 5, false), teal);
  }
  for (const x of [-2.65, 2.65]) {
    const arcRadius = Math.sqrt(windowRadius ** 2 - x ** 2);
    const points = [];
    for (let i = 0; i <= 20; i++) {
      const angle = -Math.PI / 2 + Math.PI * i / 20;
      points.push(new THREE.Vector3(x, windowY + arcRadius * Math.sin(angle),
        windowZ + arcRadius * Math.cos(angle)));
    }
    add('viewportMeridian', new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points), 32, 0.06, 5, false), ivory);
  }

  for (const side of [-1, 1]) {
    add('hubSideConsole', new THREE.BoxGeometry(2.1, 1, 1.4), dark, side * 6.65, 0.7, 0.8);
    const display = add('hubSideDisplay', new THREE.BoxGeometry(1.7, 0.04, 0.9), teal,
      side * 6.65, 1.22, 0.8);
    display.rotation.z = side * -0.08;
  }

  const earthMount = new THREE.Group();
  earthMount.name = 'earthMount';
  earthMount.position.set(0, 2.47, 17.6);
  hub.add(earthMount);
  const space = add('spaceBeyondEarth', new THREE.PlaneGeometry(50, 26), spaceMat, 0, 7, 25);
  const starPositions = new Float32Array(90 * 3);
  let seed = 404;
  const random = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
  for (let i = 0; i < 90; i++) {
    starPositions[i * 3] = -19 + random() * 38;
    starPositions[i * 3 + 1] = -1 + random() * 16;
    starPositions[i * 3 + 2] = 24.9;
  }
  const starGeometry = new THREE.BufferGeometry();
  starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
  const stars = new THREE.Points(starGeometry, new THREE.PointsMaterial({ color: 0xd7f4ff, size: 0.13, fog: false, depthWrite: false }));
  stars.name = 'spaceBeyondEarthStars';
  hub.add(stars);

  hub.userData.earthMount = earthMount;
  hub.userData.spaceBackdrop = space;
  hub.userData.aperture = { width: 10.6, height: 10.6, centreY: windowY };
  hub.userData.earthScale = 1.1;
  return hub;
}
