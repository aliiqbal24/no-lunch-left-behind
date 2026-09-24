export default function (THREE) {
  const hub = new THREE.Group(); hub.name = 'lastLaunchComplex';
  const mat = (color, name, roughness, metalness = 0, glow = 0) => {
    const m = new THREE.MeshStandardMaterial({ color, roughness, metalness,
      emissive: glow ? color : 0x000000, emissiveIntensity: glow });
    m.name = name; return m;
  };
  const ivory = mat(0xf7f3e8, 'plaster', 0.82);
  const warm = mat(0xd8c5a5, 'stone', 0.9);
  const concrete = mat(0x9ba7b4, 'stone', 0.92);
  const steel = mat(0x1f4e5f, 'metal', 0.44, 0.38);
  const dark = mat(0x142a35, 'metal', 0.36, 0.55);
  const orange = mat(0xff6b4a, 'metal', 0.38, 0.3, 0.32);
  const yellow = mat(0xf6c453, 'metal', 0.42, 0.24, 0.34);
  const glow = mat(0x45c4b0, 'metal', 0.28, 0.3, 0.95);
  const red = mat(0xd7263d, 'metal', 0.24, 0.32, 1.4);
  const glass = mat(0x315f6d, 'metal', 0.2, 0.5);
  const box = (w, h, d, x, y, z, material, parent = hub, name = '') => {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material);
    mesh.position.set(x, y, z); mesh.name = name; parent.add(mesh); return mesh;
  };
  const cylinder = (rt, rb, h, x, y, z, material, sides = 18, parent = hub) => {
    const mesh = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, sides), material);
    mesh.position.set(x, y, z); parent.add(mesh); return mesh;
  };
  const strut = (a, b, radius, material, parent = hub) => {
    const start = new THREE.Vector3(...a), end = new THREE.Vector3(...b);
    const mesh = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, start.distanceTo(end), 8), material);
    mesh.position.copy(start).add(end).multiplyScalar(0.5);
    mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), end.clone().sub(start).normalize());
    parent.add(mesh); return mesh;
  };
  const tube = (points, radius, material, parent = hub, segments = 22) => {
    const path = new THREE.CatmullRomCurve3(points.map((p) => new THREE.Vector3(...p)));
    const mesh = new THREE.Mesh(new THREE.TubeGeometry(path, segments, radius, 8, false), material);
    parent.add(mesh); return mesh;
  };

  // Monumental radial pad and flame trench: the final physical destination of the run.
  cylinder(10.2, 11.2, 0.65, 0, 0.32, 0, concrete, 32);
  cylinder(8.9, 9.35, 0.24, 0, 0.77, 0, steel, 32);
  cylinder(7.45, 7.45, 0.12, 0, 0.96, 0, ivory, 32);
  box(4.2, 0.24, 15.2, 0, 1.0, 0, dark);
  box(2.7, 0.12, 14.4, 0, 1.14, 0, orange);
  for (let i = 0; i < 20; i++) {
    const a = i / 20 * Math.PI * 2;
    const tick = box(0.62, 0.1, 1.48, Math.sin(a) * 8.45, 1.0, Math.cos(a) * 8.45, i % 4 ? yellow : red);
    tick.rotation.y = a;
    const bolt = cylinder(0.08, 0.08, 0.08, Math.sin(a) * 9.45, 1.02, Math.cos(a) * 9.45, orange, 8);
  }
  for (const z of [-5.6, 5.6]) for (const x of [-3.15, 3.15]) {
    const hold = cylinder(0.42, 0.55, 1.1, x, 1.46, z, dark, 14);
    const jaw = box(1.1, 0.32, 0.7, x - Math.sign(x) * 0.38, 2.0, z, orange);
    jaw.rotation.z = Math.sign(x) * 0.2;
  }

  // Illuminated approach spine and blast walls preserve the playable corridor.
  for (const side of [-1, 1]) {
    box(0.5, 0.28, 43, side * 5.05, 0.28, -29, dark);
    box(0.22, 0.14, 43, side * 5.05, 0.5, -29, glow);
    box(1.1, 3.2, 39, side * 8.25, 1.6, -31, warm);
    box(0.42, 0.5, 39.5, side * 7.55, 3.05, -31, orange);
    for (const z of [-47, -39, -31, -23, -15]) {
      box(1.85, 0.28, 1.85, side * 6.65, 0.14, z, concrete);
      box(0.38, 4.6, 0.38, side * 6.65, 2.45, z, steel);
      const lamp = new THREE.Mesh(new THREE.SphereGeometry(0.18, 10, 7), red);
      lamp.position.set(side * 6.65, 4.85, z); hub.add(lamp);
    }
  }

  // Twin launch towers use lattice structure, maintenance decks, elevators and clamp arms.
  for (const side of [-1, 1]) {
    const x = side * 9.0;
    for (const z of [-2.8, 2.8]) {
      box(1.25, 31, 1.25, x, 15.5, z, dark);
      box(1.65, 0.6, 1.65, x, 3.2, z, orange);
      box(1.65, 0.6, 1.65, x, 12.4, z, orange);
      box(1.65, 0.6, 1.65, x, 21.6, z, orange);
      box(1.65, 0.6, 1.65, x, 30.8, z, orange);
    }
    for (const y of [4.5, 9.2, 13.9, 18.6, 23.3, 28]) {
      box(3.4, 0.44, 7.15, x, y, 0, steel);
      box(3.75, 0.14, 7.4, x, y + 0.32, 0, yellow);
      strut([x, y - 2.25, -2.8], [x, y + 2.25, 2.8], 0.13, concrete);
      strut([x, y - 2.25, 2.8], [x, y + 2.25, -2.8], 0.13, concrete);
      for (const z of [-3.35, 3.35]) box(0.08, 1.05, 0.08, x - side * 1.55, y + 0.7, z, ivory);
    }
    box(1.45, 24.5, 1.65, x + side * 2.15, 14.4, 0, steel);
    for (const y of [4.8, 8.8, 12.8, 16.8, 20.8, 24.8]) box(0.16, 0.82, 1.18, x + side * 1.35, y, 0, glow);
    // Two articulated fueling/boarding clamps reach toward the rocket.
    for (const [y, z] of [[7.4, -0.8], [13.2, 1.1], [19.0, -0.2]]) {
      const shoulder = new THREE.Mesh(new THREE.SphereGeometry(0.48, 14, 9), orange);
      shoulder.position.set(x - side * 1.7, y, z); hub.add(shoulder);
      strut([x - side * 1.7, y, z], [side * 4.8, y - 0.6, z], 0.26, steel);
      const elbow = new THREE.Mesh(new THREE.SphereGeometry(0.36, 12, 8), yellow);
      elbow.position.set(side * 4.8, y - 0.6, z); hub.add(elbow);
      strut([side * 4.8, y - 0.6, z], [side * 2.2, y - 1.1, z], 0.18, dark);
      box(1.1, 0.32, 0.72, side * 2.05, y - 1.1, z, red);
      tube([[x - side * 1.4, y + 0.2, z + 0.4], [side * 6.2, y + 0.5, z + 0.6], [side * 4.1, y - 0.15, z + 0.45]], 0.1, orange);
    }
  }
  // The crown sits behind the rocket from the approach camera, framing the
  // ascent instead of wiping across it as the camera rises.
  box(20.6, 2.2, 7.4, 0, 32.2, 5, dark);
  box(18.8, 0.38, 7.8, 0, 30.92, 5, orange);
  for (const x of [-7.8, -4.7, -1.56, 1.56, 4.7, 7.8]) {
    strut([x - 1.2, 31.1, 1.25], [x + 1.2, 33.25, 1.25], 0.12, ivory);
    strut([x + 1.2, 31.1, 1.25], [x - 1.2, 33.25, 1.25], 0.12, ivory);
  }
  box(7.2, 0.42, 0.42, 0, 32.15, 1.08, red);

  // Side concourses carry the evacuees and give human scale to the machinery.
  for (const side of [-1, 1]) {
    const x = side * 19.2;
    box(11.5, 9.4, 27, x, 4.7, -17, ivory);
    box(12.2, 0.8, 27.8, x, 9.8, -17, steel);
    box(9.2, 3.7, 18.5, x, 11.9, -14, glass);
    box(9.8, 0.48, 19.1, x, 14.0, -14, dark);
    for (const z of [-26, -20, -14, -8]) {
      box(0.32, 5.8, 0.26, x - side * 5.82, 6.4, z, glow);
      box(9.8, 0.28, 0.24, x, 7.8, z, dark);
      box(0.2, 2.2, 1.5, x - side * 5.84, 3.6, z, orange);
    }
    // Roof machinery, ventilation and evacuation bridge toward the tower.
    for (const z of [-22, -14, -6]) {
      cylinder(1.15, 1.35, 1.2, x, 14.9, z, steel, 14);
      const vent = new THREE.Mesh(new THREE.TorusGeometry(0.72, 0.13, 8, 20), orange);
      vent.position.set(x - side * 1.38, 15.1, z); vent.rotation.y = Math.PI / 2; hub.add(vent);
    }
    box(9.6, 1.65, 3.2, side * 13.8, 16.8, -3, steel);
    box(9.2, 0.16, 3.38, side * 13.8, 15.9, -3, red);
    for (const z of [-4.15, -3.4, -2.65, -1.9]) box(8.9, 0.09, 0.08, side * 13.8, 17.15, z, ivory);
  }

  // Fuel farm and rear service yard balance the long approach around the pad.
  for (const side of [-1, 1]) {
    for (const z of [24, 38]) {
      cylinder(3.5, 3.5, 7.2, side * 15.5, 3.6, z, ivory, 20);
      const dome = new THREE.Mesh(new THREE.SphereGeometry(3.45, 20, 10, 0, Math.PI * 2, 0, Math.PI / 2), warm);
      dome.position.set(side * 15.5, 7.2, z); hub.add(dome);
      for (const y of [1.0, 3.3, 5.6]) {
        const ring = new THREE.Mesh(new THREE.TorusGeometry(3.52, 0.13, 7, 28), y === 3.3 ? orange : steel);
        ring.position.set(side * 15.5, y, z); ring.rotation.x = Math.PI / 2; hub.add(ring);
      }
      for (const xoff of [-0.9, 0, 0.9]) box(0.09, 6.2, 0.13, side * 15.5 + xoff, 3.3, z - 3.55, yellow);
    }
    tube([[side * 15.5, 5.5, 24], [side * 11.0, 6.8, 16], [side * 8.3, 8.0, 8], [side * 4.2, 7.2, 3]], 0.24, orange, hub, 30);
    tube([[side * 15.5, 4.4, 38], [side * 18.5, 3.2, 31], [side * 16.0, 2.4, 20], [side * 10.4, 3.0, 9]], 0.18, glow, hub, 28);
  }

  // Distant lightning masts and AI surveillance crown the silhouette.
  for (const side of [-1, 1]) for (const z of [-38, 38]) {
    const x = side * 27;
    cylinder(1.9, 2.65, 17, x, 8.5, z, ivory, 14);
    cylinder(2.25, 2.25, 0.75, x, 17.35, z, dark, 14);
    cylinder(0.24, 0.34, 8.6, x, 22, z, steel, 10);
    const crown = new THREE.Mesh(new THREE.TorusGeometry(1.25, 0.14, 8, 24), red);
    crown.position.set(x, 26.1, z); crown.rotation.x = Math.PI / 2; hub.add(crown);
    const beacon = new THREE.Mesh(new THREE.SphereGeometry(0.3, 12, 8), red);
    beacon.position.set(x, 27.0, z); hub.add(beacon);
    strut([x, 11, z], [side * 22, 7, z - Math.sign(z) * 5], 0.18, steel);
  }

  // Footprint is authored symmetrically, so the pad remains exactly at rocket origin.
  const bounds = new THREE.Box3().setFromObject(hub);
  hub.children.forEach((child) => { child.position.y -= bounds.min.y; });
  hub.traverse((o) => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
  return hub;
}
