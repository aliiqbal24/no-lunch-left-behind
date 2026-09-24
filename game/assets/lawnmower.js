export default function (THREE) {
  const g = new THREE.Group(); g.name = 'autonomousMower';
  const mat = (color, name, roughness, metalness = 0, glow = 0) => {
    const m = new THREE.MeshStandardMaterial({ color, roughness, metalness,
      emissive: glow ? color : 0x000000, emissiveIntensity: glow });
    m.name = name; return m;
  };
  const redPaint = mat(0xd7263d, 'metal', 0.48, 0.28);
  const orange = mat(0xff6b4a, 'metal', 0.4, 0.3, 0.35);
  const steel = mat(0x7c8a92, 'metal', 0.34, 0.68);
  const teal = mat(0x1f4e5f, 'metal', 0.42, 0.38);
  const dark = mat(0x162934, 'metal', 0.4, 0.45);
  const rubber = mat(0x202735, 'metal', 0.86, 0.03);
  const eyeMat = mat(0xd7263d, 'metal', 0.22, 0.32, 1.7);
  const yellow = mat(0xf6c453, 'metal', 0.46, 0.22, 0.26);
  const box = (w, h, d, x, y, z, material) => {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material);
    mesh.position.set(x, y, z); g.add(mesh); return mesh;
  };
  const deck = new THREE.Mesh(new THREE.CylinderGeometry(0.64, 0.7, 0.22, 16), redPaint);
  deck.scale.z = 1.26; deck.position.set(0, 0.28, 0.08); g.add(deck);
  const skirt = new THREE.Mesh(new THREE.TorusGeometry(0.62, 0.08, 8, 24), dark);
  skirt.scale.z = 1.22; skirt.position.set(0, 0.21, 0.08); skirt.rotation.x = Math.PI / 2; g.add(skirt);
  box(0.8, 0.46, 0.72, 0, 0.61, -0.03, teal);
  box(0.66, 0.18, 0.58, 0, 0.93, -0.03, dark);
  for (const x of [-0.22, 0.22]) {
    const vent = box(0.12, 0.06, 0.42, x, 1.05, -0.03, steel); vent.rotation.z = x * 0.08;
  }
  box(0.54, 0.14, 0.08, 0, 0.69, 0.36, dark);
  box(0.32, 0.07, 0.06, 0, 0.69, 0.415, eyeMat);
  for (const side of [-1, 1]) {
    for (const z of [-0.42, 0.43]) {
      const wheel = new THREE.Mesh(new THREE.CylinderGeometry(z < 0 ? 0.29 : 0.22, z < 0 ? 0.29 : 0.22, 0.2, 14), rubber);
      wheel.position.set(side * 0.59, z < 0 ? 0.34 : 0.29, z); wheel.rotation.z = Math.PI / 2; g.add(wheel);
      const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.23, 10), orange);
      hub.position.copy(wheel.position); hub.rotation.z = Math.PI / 2; g.add(hub);
      const tread = new THREE.Mesh(new THREE.TorusGeometry(z < 0 ? 0.24 : 0.18, 0.035, 6, 16), steel);
      tread.position.copy(wheel.position); tread.rotation.y = Math.PI / 2; g.add(tread);
    }
  }
  // Exposed front cutter is readable but tucked below the collision silhouette.
  const bladeHub = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.13, 0.08, 12), yellow);
  bladeHub.position.set(0, 0.18, 0.56); g.add(bladeHub);
  for (let i = 0; i < 3; i++) {
    const blade = box(0.08, 0.035, 0.52, 0, 0.18, 0.56, steel);
    blade.rotation.y = i * Math.PI / 3;
  }
  box(0.95, 0.12, 0.18, 0, 0.36, 0.67, orange);
  for (const x of [-0.34, 0.34]) {
    const lamp = new THREE.Mesh(new THREE.SphereGeometry(0.08, 10, 7), eyeMat);
    lamp.position.set(x, 0.39, 0.78); g.add(lamp);
  }
  // Articulated handle and control yoke, with emergency cable and clamp joints.
  for (const side of [-1, 1]) {
    const path = new THREE.CatmullRomCurve3([
      new THREE.Vector3(side * 0.42, 0.72, -0.32), new THREE.Vector3(side * 0.52, 1.1, -0.62),
      new THREE.Vector3(side * 0.62, 1.46, -0.85), new THREE.Vector3(side * 0.56, 1.72, -1.02),
    ]);
    g.add(new THREE.Mesh(new THREE.TubeGeometry(path, 16, 0.055, 8, false), steel));
    for (const y of [0.78, 1.35]) {
      const joint = new THREE.Mesh(new THREE.SphereGeometry(0.09, 9, 6), orange);
      joint.position.set(side * (y < 1 ? 0.43 : 0.59), y, y < 1 ? -0.37 : -0.77); g.add(joint);
    }
  }
  box(1.18, 0.12, 0.12, 0, 1.76, -1.04, rubber);
  box(0.5, 0.28, 0.12, 0, 1.61, -0.98, dark);
  box(0.3, 0.08, 0.06, 0, 1.62, -0.91, eyeMat);
  const cable = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0.28, 1.6, -0.96), new THREE.Vector3(0.18, 1.26, -0.83),
    new THREE.Vector3(0.26, 0.9, -0.5), new THREE.Vector3(0.15, 0.73, -0.25),
  ]);
  g.add(new THREE.Mesh(new THREE.TubeGeometry(cable, 14, 0.025, 6, false), eyeMat));
  const bounds = new THREE.Box3().setFromObject(g);
  const centre = bounds.getCenter(new THREE.Vector3());
  g.children.forEach((child) => { child.position.x -= centre.x; child.position.y -= bounds.min.y; child.position.z -= centre.z; });
  g.traverse((o) => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
  return g;
}
