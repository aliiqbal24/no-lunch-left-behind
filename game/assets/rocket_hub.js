export default function generate(THREE) {
  const hub = new THREE.Group();
  const material = (color, name, roughness = 0.68, emissive = 0x000000) => {
    const m = new THREE.MeshStandardMaterial({ color, roughness, metalness: name === 'metal' ? 0.28 : 0, emissive, emissiveIntensity: emissive ? 0.7 : 0 });
    m.name = name;
    return m;
  };
  const ivory = material(0xf7f3e8, 'plaster', 0.84);
  const concrete = material(0x9ba7b4, 'stone', 0.9);
  const dark = material(0x1f4e5f, 'metal', 0.48);
  const orange = material(0xff6b4a, 'metal', 0.55);
  const yellow = material(0xf6c453, 'metal', 0.6);
  const glow = material(0x45c4b0, 'metal', 0.35, 0x45c4b0);
  const glass = material(0x78b7c5, 'metal', 0.28);

  function box(w, h, d, x, y, z, mat, parent = hub) {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
    mesh.position.set(x, y, z);
    mesh.castShadow = h > 2;
    mesh.receiveShadow = true;
    parent.add(mesh);
    return mesh;
  }
  function cylinder(radiusTop, radiusBottom, height, x, y, z, mat, sides = 12, parent = hub) {
    const mesh = new THREE.Mesh(new THREE.CylinderGeometry(radiusTop, radiusBottom, height, sides), mat);
    mesh.position.set(x, y, z);
    mesh.castShadow = height > 2;
    parent.add(mesh);
    return mesh;
  }

  // The transit concourse frames the road without closing off the three running lanes.
  for (const side of [-1, 1]) {
    const x = side * 16;
    box(9, 10, 24, x, 5, 3, ivory);
    box(9.7, 0.7, 24.7, x, 10.2, 3, dark);
    box(7, 3.4, 13, x, 12.1, 5, glass);
    box(7.6, 0.42, 13.7, x, 14, 5, dark);
    box(8.5, 0.4, 1, x, 4.8, -9.2, orange);
    for (const z of [-5, 0, 5, 10]) {
      box(0.28, 5.2, 0.2, x - side * 4.55, 6.3, z, glow);
      box(7.4, 0.22, 0.18, x, 7.8, z, dark);
    }
    for (const z of [-35, -17, 19, 49]) {
      const px = side * 5.7;
      box(1.1, 7.4, 1.1, px, 3.7, z, dark);
      box(1.5, 0.6, 1.5, px, 7.5, z, orange);
      box(0.18, 3.2, 0.8, px - side * 0.62, 4.4, z, glow);
      box(1.8, 0.28, 1.8, px, 0.14, z, concrete);
    }
  }

  // Tall paired gantries make the rocket hub readable before its details resolve.
  for (const side of [-1, 1]) {
    const x = side * 7.8;
    box(2.5, 43, 3.2, x, 21.5, 17, dark);
    box(3.2, 2.2, 3.8, x, 44, 17, orange);
    for (const y of [11, 20, 29, 38]) {
      box(3, 0.55, 5.4, x, y, 17, concrete);
      box(0.3, 4.3, 0.35, x - side * 1.35, y + 2.1, 14.4, glow);
    }
  }
  box(18.2, 2.4, 3.8, 0, 41, 17, ivory);
  box(12.4, 0.65, 4.3, 0, 43, 17, orange);
  box(18.2, 0.5, 0.25, 0, 39.4, 14.95, glow);
  for (const x of [-4.4, 4.4]) {
    box(1.1, 8, 1.1, x, 36.5, 17, concrete);
    box(3.1, 0.8, 1.4, x * 0.7, 33, 17, yellow);
  }

  // A broad landing apron, service bays and luminous edge rails establish a real place to reach.
  cylinder(8.2, 9, 0.5, 0, 0.25, 0, concrete, 20);
  cylinder(6.6, 6.6, 0.08, 0, 0.54, 0, dark, 20);
  cylinder(5.5, 5.5, 0.09, 0, 0.6, 0, ivory, 20);
  for (let i = 0; i < 12; i++) {
    const a = i / 12 * Math.PI * 2;
    const tick = box(0.65, 0.08, 1.45, Math.sin(a) * 7.15, 0.58, Math.cos(a) * 7.15, i % 3 ? yellow : orange);
    tick.rotation.y = a;
  }
  for (const side of [-1, 1]) {
    box(0.32, 0.14, 43, side * 4.65, 0.25, -27, glow);
    box(0.48, 0.24, 43, side * 4.65, 0.12, -27, dark);
    box(3.2, 2.7, 4.8, side * 11.5, 1.35, -21, concrete);
    box(3.6, 0.5, 5.2, side * 11.5, 2.95, -21, orange);
    box(0.3, 1.4, 3.1, side * 9.75, 1.85, -21, glow);
  }

  // Two skyline beacons continue the same graphic language above the city roofs.
  for (const side of [-1, 1]) {
    const x = side * 26;
    cylinder(2.6, 3.5, 23, x, 11.5, 12, ivory, 10);
    cylinder(3.2, 3.2, 1.2, x, 23.7, 12, dark, 10);
    cylinder(2.7, 2.7, 0.8, x, 25, 12, glow, 10);
    box(0.45, 7, 0.45, x, 29, 12, dark);
    cylinder(1.15, 1.15, 0.8, x, 32.8, 12, orange, 10);
  }

  // Keep the recipe contract: ground at y=0 and the footprint centred on x/z.
  const bounds = new THREE.Box3().setFromObject(hub);
  const centre = bounds.getCenter(new THREE.Vector3());
  for (const child of hub.children) {
    child.position.x -= centre.x;
    child.position.y -= bounds.min.y;
    child.position.z -= centre.z;
  }
  return hub;
}
