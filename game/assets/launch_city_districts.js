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
  const skin = material(0xe9a778, 'cloth');
  const cloth = material(0x6b5b95, 'cloth');
  const flame = material(0xff8a40, 'metal', 1.3);
  const box = (group, w, h, d, x, y, z, mat, name = '') => {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
    mesh.name = name; mesh.position.set(x, y, z); mesh.castShadow = h > 2;
    group.add(mesh); return mesh;
  };
  const cylinder = (group, r, h, x, y, z, mat, sides = 10) => {
    const mesh = new THREE.Mesh(new THREE.CylinderGeometry(r, r, h, sides), mat);
    mesh.position.set(x, y, z); mesh.castShadow = h > 2;
    group.add(mesh); return mesh;
  };
  const lamp = (group, x, z) => {
    box(group, 0.16, 4.4, 0.16, x, 2.2, z, steel);
    box(group, 0.72, 0.26, 0.55, x, 4.42, z, red, 'alarmLamp');
  };
  const worker = (group, x, z, color = cloth) => {
    const person = new THREE.Group(); person.name = 'evacWorker';
    person.position.set(x, 0.22, z);
    cylinder(person, 0.2, 0.38, 0, 1.62, 0, skin, 8);
    box(person, 0.6, 0.86, 0.38, 0, 1.02, 0, color);
    box(person, 0.18, 0.75, 0.18, -0.18, 0.38, 0, dark);
    box(person, 0.18, 0.75, 0.18, 0.18, 0.38, 0, dark);
    group.add(person);
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
    root.add(g);
  }
  return root;
}
