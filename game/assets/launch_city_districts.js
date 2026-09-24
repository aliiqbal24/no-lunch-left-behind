// Editable procedural launch city. Each child fits one 40m road chunk.
export default function generate(THREE) {
  const root = new THREE.Group();
  const material = (color, name = 'metal', glow = 0) => {
    const m = new THREE.MeshStandardMaterial({ color, roughness: 0.68, metalness: name === 'metal' ? 0.26 : 0.02,
      emissive: color, emissiveIntensity: glow });
    m.name = name;
    return m;
  };
  const steel = material(0x1f4e5f);
  const pale = material(0xf7f3e8, 'stone');
  const orange = material(0xff6b4a);
  const yellow = material(0xf6c453);
  const teal = material(0x45c4b0, 'metal', 0.55);
  const red = material(0xd7263d, 'metal', 0.8);
  const dark = material(0x172b33);
  const skin = material(0xe9a778, 'fabric');
  const cloth = material(0x6b5b95, 'fabric');
  const flame = material(0xff8a40, 'metal', 1.3);
  const scan = new THREE.MeshBasicMaterial({
    color: 0xd7263d, transparent: true, opacity: 0.34, depthWrite: false, side: THREE.DoubleSide,
  });
  scan.name = 'metal';
  const box = (group, w, h, d, x, y, z, mat, name = '') => {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
    mesh.name = name; mesh.position.set(x, y, z); mesh.castShadow = h > 2;
    group.add(mesh); return mesh;
  };
  const cylinder = (group, r, h, x, y, z, mat, sides = 8) => {
    const mesh = new THREE.Mesh(new THREE.CylinderGeometry(r, r, h, sides), mat);
    mesh.position.set(x, y, z); mesh.castShadow = h > 2;
    group.add(mesh); return mesh;
  };
  const tube = (group, points, radius, mat, segments = 18) => {
    const path = new THREE.CatmullRomCurve3(points.map(([x, y, z]) => new THREE.Vector3(x, y, z)));
    const mesh = new THREE.Mesh(new THREE.TubeGeometry(path, segments, radius, 5, false), mat);
    mesh.castShadow = true; group.add(mesh); return mesh;
  };
  const strut = (group, ax, ay, az, bx, by, bz, radius, mat) => {
    const a = new THREE.Vector3(ax, ay, az), b = new THREE.Vector3(bx, by, bz);
    const mesh = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, a.distanceTo(b), 6), mat);
    mesh.position.copy(a).add(b).multiplyScalar(0.5);
    mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), b.clone().sub(a).normalize());
    mesh.castShadow = true; group.add(mesh); return mesh;
  };
  const lamp = (group, x, z) => {
    box(group, 0.16, 4.4, 0.16, x, 2.2, z, steel);
    const head = box(group, 0.72, 0.26, 0.55, x, 4.42, z, red, 'alarmLamp');
    head.rotation.y = Math.PI / 4;
    const beacon = new THREE.Mesh(new THREE.SphereGeometry(0.16, 8, 5), red);
    beacon.position.set(x, 4.68, z); group.add(beacon);
  };
  const worker = (group, x, z, color = cloth) => {
    const person = new THREE.Group(); person.name = 'evacWorker';
    person.position.set(x, 0.22, z);
    cylinder(person, 0.2, 0.38, 0, 1.55, 0, skin, 8);
    const helmet = new THREE.Mesh(new THREE.SphereGeometry(0.29, 9, 6), yellow);
    helmet.scale.y = 0.78; helmet.position.set(0, 1.72, 0); person.add(helmet);
    box(person, 0.34, 0.13, 0.08, 0, 1.65, 0.24, dark);
    box(person, 0.66, 0.9, 0.42, 0, 1.0, 0, color);
    box(person, 0.36, 0.62, 0.18, 0, 1.05, -0.31, steel);
    box(person, 0.18, 0.75, 0.18, -0.18, 0.38, 0, dark);
    box(person, 0.18, 0.75, 0.18, 0.18, 0.38, 0, dark);
    for (const side of [-1, 1]) {
      const arm = box(person, 0.16, 0.72, 0.16, side * 0.42, 1.02, 0, color);
      arm.rotation.z = side * -0.28;
      box(person, 0.25, 0.15, 0.3, side * 0.19, 0.05, 0.05, orange);
    }
    group.add(person);
  };
  const sentinel = (group, x, z, facing = 1) => {
    const bot = new THREE.Group(); bot.name = 'aiSentinel';
    bot.position.set(x, 0.2, z); bot.rotation.y = facing > 0 ? 0 : Math.PI;
    const shell = new THREE.Mesh(new THREE.CapsuleGeometry(0.48, 0.62, 3, 8), steel);
    shell.position.y = 1.15; shell.scale.z = 0.76; bot.add(shell);
    box(bot, 0.84, 0.42, 0.62, 0, 1.48, 0.02, dark);
    const visor = new THREE.Mesh(new THREE.BoxGeometry(0.68, 0.2, 0.1), dark);
    visor.position.set(0, 1.52, 0.36); bot.add(visor);
    for (const eyeX of [-0.16, 0.16]) {
      const eye = new THREE.Mesh(new THREE.SphereGeometry(0.065, 6, 4), red);
      eye.position.set(eyeX, 1.52, 0.43); bot.add(eye);
    }
    box(bot, 0.52, 0.12, 0.1, 0, 1.02, 0.42, red);
    for (const side of [-1, 1]) {
      const shoulder = new THREE.Mesh(new THREE.SphereGeometry(0.2, 8, 5), orange);
      shoulder.position.set(side * 0.52, 1.13, 0); bot.add(shoulder);
      const arm = new THREE.Mesh(new THREE.CapsuleGeometry(0.11, 0.42, 3, 6), steel);
      arm.position.set(side * 0.68, 0.89, 0.03); arm.rotation.z = side * 0.3; bot.add(arm);
      const wrist = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 0.2, 8), dark);
      wrist.position.set(side * 0.8, 0.59, 0.03); wrist.rotation.z = Math.PI / 2; bot.add(wrist);
      for (const dz of [-0.12, 0.12]) {
        const claw = box(bot, 0.08, 0.28, 0.08, side * 0.86, 0.43, 0.03 + dz, orange);
        claw.rotation.z = side * 0.18;
      }
      const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.26, 0.2, 10), dark);
      wheel.position.set(side * 0.31, 0.29, 0); wheel.rotation.z = Math.PI / 2; bot.add(wheel);
      const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.22, 8), yellow);
      hub.position.copy(wheel.position); hub.rotation.z = Math.PI / 2; bot.add(hub);
    }
    for (const side of [-1, 1]) {
      const antenna = box(bot, 0.04, 0.38, 0.04, side * 0.22, 1.9, -0.05, dark);
      antenna.rotation.z = side * 0.18;
      const tip = new THREE.Mesh(new THREE.SphereGeometry(0.06, 6, 4), red);
      tip.position.set(side * 0.25, 2.1, -0.05); bot.add(tip);
    }
    group.add(bot);
  };
  const checkpoint = (group, z, variant = 0) => {
    const gate = new THREE.Group(); gate.name = 'aiCheckpoint'; gate.position.z = z;
    for (const side of [-1, 1]) {
      const x = side * 5.55;
      box(gate, 1.35, 0.55, 2.65, x, 0.28, 0, pale);
      box(gate, 1.05, 8.6, 1.65, x, 4.55, 0, dark);
      box(gate, 1.42, 1.05, 1.92, x, 3.3, 0, steel);
      box(gate, 1.42, 1.05, 1.92, x, 6.35, 0, steel);
      cylinder(gate, 0.19, 3.4, x - side * 0.68, 4.75, 0.12, orange, 10);
      for (const y of [1.25, 7.92]) {
        const collar = new THREE.Mesh(new THREE.TorusGeometry(0.5, 0.11, 5, 12), orange);
        collar.position.set(x, y, 0); collar.rotation.x = Math.PI / 2; gate.add(collar);
      }
      strut(gate, x, 7.7, 0, side * 3.65, 9.35, 0, 0.16, steel);
      strut(gate, x, 7.7, 0.55, side * 3.65, 9.35, 0.55, 0.1, orange);
      box(gate, 0.3, 0.3, 1.98, x, 8.98, 0, red, 'alarmLamp');
    }
    box(gate, 12.3, 1.45, 1.72, 0, 9.38, 0, dark);
    box(gate, 9.45, 0.38, 2.05, 0, 8.58, 0, steel);
    box(gate, 4.55, 1.08, 1.96, 0, 9.3, 0.18, steel);
    box(gate, 3.25, 0.22, 0.14, 0, 9.32, 1.22, red, 'alarmLamp');
    for (const x of [-1.02, 1.02]) {
      const optic = new THREE.Mesh(new THREE.SphereGeometry(0.2, 8, 6), red);
      optic.position.set(x, 9.32, 1.3); gate.add(optic);
    }
    for (const side of [-1, 1]) {
      const shoulder = new THREE.Mesh(new THREE.SphereGeometry(0.35, 8, 6), orange);
      shoulder.position.set(side * 3.25, 8.75, 0.82); gate.add(shoulder);
      strut(gate, side * 3.25, 8.75, 0.82, side * 2.7, 7.25, 1.2, 0.18, steel);
      const elbow = new THREE.Mesh(new THREE.SphereGeometry(0.26, 8, 5), orange);
      elbow.position.set(side * 2.7, 7.25, 1.2); gate.add(elbow);
      strut(gate, side * 2.7, 7.25, 1.2, side * 2.1, 6.22, 1.48, 0.14, steel);
      box(gate, 0.68, 0.2, 0.22, side * 2.02, 6.05, 1.55, red);
      tube(gate, [[side * 4.8, 9.3, -0.35], [side * 3.7, 8.25, -0.75], [side * 2.7, 6.95, -0.6]], 0.07, orange, 12);
    }
    // Deployed barricade machinery remains outside the playable lane envelope.
    for (const side of [-1, 1]) {
      box(gate, 0.72, 1.05, 1.1, side * 4.18, 0.62, 1.8, steel);
      const arm = box(gate, 2.15, 0.22, 0.26, side * 3.28, 1.2, 1.8, orange);
      arm.rotation.z = side * (variant ? 0.42 : 0.18);
      for (const dx of [-0.65, 0, 0.65]) box(gate, 0.28, 0.24, 0.28, side * 3.28 + dx, 1.22, 1.8, pale);
    }
    group.add(gate);
  };
  for (let i = 0; i < 10; i++) {
    const g = new THREE.Group(); g.name = `district${i}`;
    const type = i < 2 ? 'WORKER DISTRICT' : i < 4 ? 'FACTORIES' : i < 5 ? 'TANK FARM' : i < 7 ? 'TRANSPORT RAILS' : 'LAUNCH PADS';
    g.userData.district = type;
    if (i < 2) {
      for (const side of [-1, 1]) {
        const x = side * 9.4;
        box(g, 5.8, 3.3, 9, x, 1.65, -8, pale);
        box(g, 6.1, 0.45, 9.3, x, 3.5, -8, orange);
        for (const z of [-11, -8, -5]) box(g, 1.1, 0.85, 0.12, x - side * 2.95, 1.8, z, teal);
        box(g, 3.7, 1.85, 6, side * 6.8, 1.1, 9, yellow); // evacuation bus
        box(g, 1.4, 0.65, 0.12, side * 5.04, 1.65, 7, dark);
        for (const z of [6.7, 11.2]) cylinder(g, 0.42, 0.34, side * 5.5, 0.35, z, dark, 8);
        worker(g, side * 5.6, -2, orange); worker(g, side * 6.2, 1, cloth);
        lamp(g, side * 5.0, -16);
      }
    } else if (i < 4) {
      for (const side of [-1, 1]) {
        const x = side * 10;
        box(g, 7, 6, 12, x, 3, -4, steel);
        box(g, 7.5, 0.7, 12.5, x, 6.4, -4, yellow);
        for (const z of [-8, -4, 0]) box(g, 1.6, 1.5, 0.12, x - side * 3.55, 3, z, teal);
        box(g, 2.4, 0.48, 15, side * 6.1, 1.0, 5, orange, 'conveyor');
        for (const z of [0, 4, 8]) box(g, 1.6, 0.8, 1.3, side * 6.1, 1.6, z, pale);
        box(g, 0.28, 9, 0.28, side * 13, 4.5, 10, steel);
        const arm = new THREE.Group(); arm.name = 'craneArm'; arm.position.set(side * 13, 8.7, 10);
        box(arm, 7, 0.34, 0.5, -side * 3.1, 0, 0, yellow); g.add(arm);
        worker(g, side * 5.4, -13, pale);
        lamp(g, side * 5, 15);
      }
    } else if (i === 4) {
      for (const side of [-1, 1]) {
        for (const z of [-12, 3, 15]) {
          const x = side * 9;
          cylinder(g, 3.2, 5.5, x, 2.75, z, pale, 12);
          cylinder(g, 3.27, 0.45, x, 5.7, z, orange, 12);
          box(g, 0.34, 0.34, 8, side * 5.35, 0.78, z, yellow);
          box(g, 0.45, 6.5, 0.45, side * 5.2, 3.25, z + 3, steel, 'ventPipe');
          const vent = new THREE.Mesh(new THREE.SphereGeometry(0.62, 8, 6), flame);
          vent.name = 'ventFlare'; vent.position.set(side * 5.2, 6.65, z + 3); g.add(vent);
        }
        lamp(g, side * 5.1, -19);
      }
    } else if (i < 7) {
      for (const side of [-1, 1]) {
        const x = side * 5.9;
        for (const railX of [x - 0.72, x + 0.72]) box(g, 0.18, 0.15, 40, railX, 0.3, 0, steel);
        for (let z = -17; z <= 17; z += 5) box(g, 2.2, 0.13, 0.28, x, 0.2, z, pale);
        const train = new THREE.Group(); train.name = 'evacTrain'; train.position.set(x, 0.25, i === 5 ? 3 : -9);
        for (const z of [-5.3, 0, 5.3]) {
          box(train, 2.65, 2.2, 5, 0, 1.55, z, side < 0 ? orange : yellow);
          box(train, 1.3, 0.72, 0.1, -side * 1.34, 1.9, z, teal);
        }
        g.add(train);
        box(g, 0.2, 6, 0.2, side * 5, 3, -15, steel);
        box(g, 2.2, 0.9, 0.2, side * 5, 5.9, -15, red, 'railSignal');
        worker(g, side * 8.0, 15, cloth);
      }
    } else {
      for (const side of [-1, 1]) {
        const x = side * 9;
        cylinder(g, 5.8, 0.5, x, 0.25, 1, steel, 12);
        for (const dz of [-7, 8]) {
          box(g, 0.45, 11, 0.45, x + side * 3.7, 5.5, dz, steel);
          box(g, 6.3, 0.35, 0.55, x, 10.8, dz, yellow);
        }
        box(g, 1.0, 1.0, 5.2, side * 5.1, 0.7, 3, orange);
        lamp(g, side * 5.0, -17);
        if (i === 7) worker(g, side * 5.3, 17, pale);
      }
    }

    // Secondary and tertiary construction layers turn the district masses into
    // believable infrastructure at runner-camera distance.
    if (i < 2) {
      for (const side of [-1, 1]) {
        const x = side * 10.2;
        box(g, 5.0, 5.8, 7.4, x, 6.65, -8, pale);
        box(g, 5.35, 0.46, 7.75, x, 9.7, -8, dark);
        box(g, 3.7, 2.9, 5.2, x + side * 0.35, 11.35, -8.3, steel);
        box(g, 4.1, 0.35, 5.55, x + side * 0.35, 12.94, -8.3, orange);
        for (const y of [4.7, 6.7, 8.7]) for (const z of [-10.3, -8, -5.7]) {
          box(g, 0.16, 1.2, 1.32, x - side * 2.56, y, z, dark);
          box(g, 0.08, 0.82, 0.88, x - side * 2.68, y, z, teal);
          box(g, 0.2, 0.12, 1.4, x - side * 2.68, y - 0.72, z, yellow);
        }
        for (const z of [-10.7, -7.8, -4.9]) {
          cylinder(g, 0.32, 1.35, x + side * 1.45, 10.45, z, dark, 12);
          const cap = new THREE.Mesh(new THREE.TorusGeometry(0.33, 0.07, 7, 16), orange);
          cap.position.set(x + side * 1.45, 11.1, z); cap.rotation.x = Math.PI / 2; g.add(cap);
        }
        tube(g, [[x - side * 2.3, 3.8, -11.2], [x - side * 2.8, 6.2, -11.2], [x - side * 2.8, 9.5, -9.5], [x - side * 1.8, 12.2, -9.5]], 0.12, orange);
        // Evacuation bus: layered body, windows, wheel hubs and roof luggage rail.
        box(g, 4.0, 0.42, 6.25, side * 6.8, 2.18, 9, orange);
        for (const wz of [7.25, 8.75, 10.25]) box(g, 0.1, 0.64, 1.05, side * 4.76, 1.75, wz, dark);
        for (const wz of [6.8, 11.2]) {
          const wheel = cylinder(g, 0.5, 0.38, side * 5.02, 0.58, wz, dark, 14); wheel.rotation.z = Math.PI / 2;
          const hub = cylinder(g, 0.18, 0.42, side * 4.98, 0.58, wz, yellow, 12); hub.rotation.z = Math.PI / 2;
        }
        box(g, 2.7, 0.15, 5.1, side * 6.8, 2.56, 9, steel);
      }
      if (i === 1) {
        // A high civic skybridge gives human-scale buildings monumental context.
        box(g, 16.8, 1.9, 3.15, 0, 11.2, -10.5, pale);
        box(g, 15.4, 1.15, 3.28, 0, 11.25, -10.5, dark);
        for (const x of [-6, -3, 0, 3, 6]) box(g, 1.55, 0.72, 0.1, x, 11.3, -8.82, teal);
        box(g, 16.4, 0.16, 3.42, 0, 10.32, -10.5, red);
      }
    } else if (i < 4) {
      for (const side of [-1, 1]) {
        const x = side * 10.4;
        for (const z of [-8.5, -1]) {
          cylinder(g, 1.35, 8.8, x + side * 2.1, 10.4, z, dark, 10);
          cylinder(g, 1.55, 0.45, x + side * 2.1, 6.1, z, orange, 10);
          cylinder(g, 1.55, 0.45, x + side * 2.1, 14.7, z, orange, 10);
          const hood = new THREE.Mesh(new THREE.ConeGeometry(1.72, 1.35, 10), steel);
          hood.position.set(x + side * 2.1, 15.6, z); g.add(hood);
        }
        box(g, 7.2, 0.34, 8.6, x, 8.6, -4.4, steel);
        for (const z of [-8, -5.6, -3.2, -0.8]) {
          box(g, 7.5, 0.15, 0.12, x, 9.25, z, pale);
          for (const sx of [-3.45, 3.45]) box(g, 0.1, 1.25, 0.1, x + sx, 8.72, z, pale);
        }
        tube(g, [[side * 6.2, 2.1, 10], [side * 7.4, 5.4, 8.8], [x, 7.8, 2.8], [x + side * 2.0, 11.8, -1]], 0.17, orange, 22);
        for (const y of [2.2, 4.3]) for (const z of [-8, -4, 0]) box(g, 0.18, 0.9, 1.45, side * 6.42, y, z, dark);
      }
    } else if (i === 4) {
      for (const side of [-1, 1]) for (const z of [-12, 3, 15]) {
        for (const y of [1.25, 2.75, 4.25]) {
          const ring = new THREE.Mesh(new THREE.TorusGeometry(3.22, 0.11, 5, 16), y === 2.75 ? orange : steel);
          ring.position.set(side * 9, y, z); ring.rotation.x = Math.PI / 2; g.add(ring);
        }
        const dome = new THREE.Mesh(new THREE.SphereGeometry(3.05, 12, 7, 0, Math.PI * 2, 0, Math.PI / 2), pale);
        dome.position.set(side * 9, 5.55, z); g.add(dome);
        for (const lx of [-0.85, 0, 0.85]) box(g, 0.08, 5.1, 0.12, side * 9 + lx, 2.7, z - 3.2, yellow);
        tube(g, [[side * 5.3, 0.9, z], [side * 6.2, 1.2, z], [side * 7.0, 3.8, z], [side * 9, 4.5, z]], 0.16, orange, 16);
      }
    } else if (i < 7) {
      for (const side of [-1, 1]) {
        for (const z of [-15, -5, 5, 15]) {
          box(g, 0.45, 5.8, 0.45, side * 8.2, 3.1, z, steel);
          strut(g, side * 8.2, 1.2, z, side * 6.25, 5.7, z, 0.1, orange);
        }
        box(g, 2.0, 0.24, 39, side * 7.2, 5.95, 0, steel);
        box(g, 0.12, 1.05, 39, side * 6.15, 6.45, 0, pale);
      }
    } else {
      for (const side of [-1, 1]) {
        const x = side * 11.4;
        for (const z of [-12, 10]) {
          box(g, 1.15, 13.5, 1.15, x, 6.75, z, dark);
          box(g, 1.55, 0.55, 1.55, x, 2.4, z, orange);
          for (const y of [4.6, 8.2, 11.8]) box(g, 2.25, 0.32, 1.65, x, y, z, steel);
        }
        strut(g, x, 13.3, -12, side * 6.2, 9.6, -2, 0.22, yellow);
        strut(g, x, 13.3, 10, side * 6.2, 9.6, 1, 0.22, yellow);
        tube(g, [[x, 12.5, -12], [x - side * 1.2, 10.5, -4], [side * 7.2, 7.2, 4]], 0.12, orange, 18);
      }
    }

    // The AI has commandeered the elevated transit network. Keeping the rails
    // outside the playable road preserves lane readability on a phone.
    if (i < 5) {
      for (const side of [-1, 1]) {
        const railX = side * 6.75;
        box(g, 0.72, 0.7, 40, railX, 7.5, 0, dark);
        box(g, 0.14, 0.16, 40, railX - side * 0.52, 7.94, 0, red);
        box(g, 0.12, 0.12, 40, railX + side * 0.48, 7.94, 0, orange);
        for (const z of [-15, 0, 15]) {
          box(g, 0.68, 7.35, 0.68, railX + side * 1.05, 3.68, z, steel);
          box(g, 2.35, 0.38, 0.72, railX + side * 0.12, 7.08, z, steel);
          strut(g, railX + side * 1.05, 3.2, z, railX, 6.75, z - 1.2, 0.12, orange);
          const brake = new THREE.Mesh(new THREE.TorusGeometry(0.4, 0.11, 5, 12), orange);
          brake.position.set(railX, 7.28, z); brake.rotation.y = Math.PI / 2; g.add(brake);
        }
        const pod = new THREE.Group(); pod.name = 'commandeeredTransit';
        pod.position.set(railX, 8.72, i % 2 ? -8 : 9);
        const cabin = new THREE.Mesh(new THREE.CapsuleGeometry(0.92, 2.55, 4, 10), pale);
        cabin.rotation.x = Math.PI / 2; cabin.scale.y = 0.86; pod.add(cabin);
        box(pod, 1.82, 0.42, 3.55, 0, -0.52, 0, dark);
        box(pod, 1.94, 0.18, 2.65, 0, 0.72, -0.05, steel);
        for (const z of [-1.0, 0, 1.0]) {
          box(pod, 1.84, 0.62, 0.62, 0, 0.16, z, dark);
          box(pod, 1.92, 0.1, 0.74, 0, 0.16, z, teal);
        }
        const windscreen = new THREE.Mesh(new THREE.BoxGeometry(1.34, 0.52, 0.16), dark);
        windscreen.position.set(0, 0.25, 2.08); pod.add(windscreen);
        const eye = new THREE.Mesh(new THREE.BoxGeometry(1.02, 0.11, 0.08), red);
        eye.position.set(0, 0.25, 2.18); pod.add(eye);
        for (const sideX of [-1, 1]) for (const z of [-1.2, 1.15]) {
          const damper = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.34, 8), orange);
          damper.position.set(sideX * 0.74, -0.72, z); pod.add(damper);
          const mag = new THREE.Mesh(new THREE.TorusGeometry(0.26, 0.08, 5, 10), red);
          mag.position.set(sideX * 0.74, -0.89, z); mag.rotation.x = Math.PI / 2; pod.add(mag);
        }
        for (const x of [-0.62, 0.62]) {
          const beacon = new THREE.Mesh(new THREE.SphereGeometry(0.1, 6, 4), red);
          beacon.position.set(x, 0.78, 0.85); pod.add(beacon);
        }
        g.add(pod);
      }
    }
    if (i < 4) {
      sentinel(g, -5.45, -5 + i * 3, 1);
      sentinel(g, 5.45, 8 - i * 2, -1);
    }
    if (i < 2) {
      for (const side of [-1, 1]) {
        const beam = new THREE.Mesh(new THREE.ConeGeometry(1.6, 11, 8, 1, true), scan);
        beam.name = 'scanBeam';
        beam.position.set(side * 8.8, 6.5, 4 + side * 7);
        beam.rotation.z = side * -0.64;
        beam.renderOrder = 3;
        g.add(beam);
      }
    }
    if ([1, 3, 5, 8].includes(i)) checkpoint(g, 8, i % 2);
    root.add(g);
  }
  return root;
}
