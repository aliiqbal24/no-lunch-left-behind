export default function (THREE) {
  const g = new THREE.Group();
  const mat = (color, roughness, metalness = 0, emissive = 0, intensity = 0) => {
    const m = new THREE.MeshStandardMaterial({ color, roughness, metalness, emissive, emissiveIntensity: intensity });
    m.name = 'metal';
    return m;
  };
  const ivory = mat(0xf7f3e8, 0.42, 0.28);
  const yellow = mat(0xf6c453, 0.5, 0.12);
  const teal = mat(0x45c4b0, 0.22, 0.12, 0x45c4b0, 0.8);
  const red = mat(0xd7263d, 0.48, 0.18);
  const dark = mat(0x172b33, 0.38, 0.55);
  const orange = mat(0xff6b4a, 0.38, 0.28, 0xff6b4a, 0.24);
  const glass = mat(0x14394c, 0.14, 0.62, 0x45c4b0, 0.28);
  const box = (w, h, d, x, y, z, material, name = '') => {
    const o = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material);
    o.position.set(x, y, z); o.name = name; g.add(o); return o;
  };

  const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.58, 1.25, 6, 14), ivory);
  body.rotation.x = Math.PI / 2;
  body.position.set(0, 1.12, 0.18);
  body.scale.set(1, 1.16, 0.78);
  g.add(body);

  const nose = new THREE.Mesh(new THREE.ConeGeometry(0.58, 1.15, 14), red);
  nose.rotation.x = Math.PI / 2;
  nose.position.set(0, 1.12, 1.55);
  g.add(nose);

  const canopy = new THREE.Mesh(new THREE.SphereGeometry(0.43, 14, 10), teal);
  canopy.scale.set(1, 0.62, 1.15);
  canopy.position.set(0, 1.54, 0.26);
  g.add(canopy);
  const canopyFrame = new THREE.Mesh(new THREE.TorusGeometry(0.46, 0.055, 7, 22), dark);
  canopyFrame.rotation.x = Math.PI / 2; canopyFrame.scale.set(1, 1.25, 0.72);
  canopyFrame.position.set(0, 1.48, 0.38); g.add(canopyFrame);

  // Layered rescue hull panels, pressure seams and service hardware.
  for (const z of [-0.6, 0.05, 0.72]) {
    const collar = new THREE.Mesh(new THREE.TorusGeometry(0.6, 0.045, 7, 22), z === 0.05 ? yellow : dark);
    collar.rotation.x = Math.PI / 2; collar.position.set(0, 1.12, z); collar.scale.y = 0.78; g.add(collar);
  }
  for (const side of [-1, 1]) {
    const cheek = box(0.22, 0.62, 1.35, side * 0.58, 1.12, 0.35, ivory);
    cheek.rotation.y = side * -0.12;
    box(0.08, 0.34, 0.72, side * 0.7, 1.1, 0.4, orange);
    for (const z of [0.05, 0.48, 0.9]) {
      const fastener = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.06, 7), red);
      fastener.rotation.z = Math.PI / 2; fastener.position.set(side * 0.71, 1.12, z); g.add(fastener);
    }
  }

  for (const side of [-1, 1]) {
    const wing = new THREE.Mesh(new THREE.BoxGeometry(1.16, 0.14, 1.05), yellow);
    wing.position.set(side * 0.82, 0.93, -0.02);
    wing.rotation.y = side * -0.18;
    g.add(wing);
    const tip = new THREE.Mesh(new THREE.SphereGeometry(0.13, 8, 6), red);
    tip.position.set(side * 1.37, 0.96, 0.03);
    g.add(tip);
    const wingRoot = box(0.36, 0.32, 1.2, side * 0.76, 0.9, -0.2, dark);
    wingRoot.rotation.y = side * -0.12;
    const leading = box(1.0, 0.07, 0.09, side * 1.02, 1.03, 0.43, orange);
    leading.rotation.y = side * -0.2;
    // RCS pod with four visible maneuvering nozzles.
    const pod = new THREE.Mesh(new THREE.CapsuleGeometry(0.22, 0.38, 4, 9), dark);
    pod.rotation.z = Math.PI / 2; pod.position.set(side * 1.22, 0.9, -0.42); g.add(pod);
    for (const [dy, dz] of [[0.18,0],[-0.18,0],[0,0.2],[0,-0.2]]) {
      const nozzle = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.085, 0.12, 7), orange);
      nozzle.position.set(side * 1.42, 0.9 + dy, -0.42 + dz); nozzle.rotation.z = Math.PI / 2; g.add(nozzle);
    }
  }

  for (const x of [-0.28, 0.28]) {
    const engine = new THREE.Mesh(new THREE.CylinderGeometry(0.19, 0.26, 0.48, 10), dark);
    engine.rotation.x = Math.PI / 2;
    engine.position.set(x, 0.95, -1.04);
    g.add(engine);
    const glow = new THREE.Mesh(new THREE.SphereGeometry(0.14, 9, 7), teal);
    glow.scale.z = 1.5;
    glow.position.set(x, 0.95, -1.31);
    glow.name = 'engineGlow';
    g.add(glow);
    const plume = new THREE.Mesh(new THREE.ConeGeometry(0.18, 0.82, 10), teal);
    plume.rotation.x = -Math.PI / 2; plume.position.set(x, 0.95, -1.76); plume.name = 'enginePlume'; g.add(plume);
  }
  // Underslung life-support bay, antenna spine and compact landing hardware.
  box(0.82, 0.24, 1.15, 0, 0.58, -0.05, dark, 'serviceBay');
  for (const x of [-0.27, 0.27]) {
    const tank = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.72, 9), orange);
    tank.rotation.x = Math.PI / 2; tank.position.set(x, 0.47, 0.03); g.add(tank);
  }
  box(0.08, 0.52, 0.08, 0, 1.98, -0.22, dark);
  const antennaTip = new THREE.Mesh(new THREE.SphereGeometry(0.075, 8, 6), red);
  antennaTip.position.set(0, 2.26, -0.22); g.add(antennaTip);
  for (const side of [-1, 1]) {
    const leg = box(0.09, 0.52, 0.09, side * 0.54, 0.38, -0.35, dark);
    leg.rotation.z = side * 0.28;
    box(0.38, 0.08, 0.28, side * 0.66, 0.12, -0.35, yellow);
  }
  const glassPanel = box(0.34, 0.08, 0.52, 0, 1.62, 0.92, glass, 'navigationGlass');
  glassPanel.rotation.x = -0.34;
  const bounds = new THREE.Box3().setFromObject(g);
  const center = bounds.getCenter(new THREE.Vector3());
  g.position.set(-center.x, -bounds.min.y, -center.z);
  return g;
}
