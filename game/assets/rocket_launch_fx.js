// Procedural exhaust, shock diamonds, vapor and pad dust for the liftoff shot.
export default function (THREE) {
  const effect = new THREE.Group();
  const flames = new THREE.Group(); flames.name = 'launchFlames';
  const smoke = new THREE.Group(); smoke.name = 'launchSmoke';
  const basic = (color, opacity) => {
    const m = new THREE.MeshBasicMaterial({ color, transparent: true, opacity, depthWrite: false, side: THREE.DoubleSide });
    m.name = 'metal'; return m;
  };
  const outer = basic(0xff4b24, 0.78);
  const orange = basic(0xff8a3d, 0.88);
  const inner = basic(0xfff1b0, 0.96);
  const cyan = basic(0x9df5e7, 0.72);
  const spark = basic(0xf6c453, 0.9);
  const vapor = basic(0xd9e4e8, 0.56);
  const soot = basic(0x59616f, 0.28);
  const nozzlePositions = [[0, 0], [0.58, 0], [-0.58, 0], [0.29, 0.5], [-0.29, 0.5], [0.29, -0.5], [-0.29, -0.5]];
  for (let i = 0; i < nozzlePositions.length; i++) {
    const [x, z] = nozzlePositions[i];
    const spread = i ? 0.34 : 0.46;
    const jet = new THREE.Mesh(new THREE.ConeGeometry(spread, i ? 3.9 : 5.1, 12, 1, true), outer);
    jet.rotation.x = Math.PI; jet.position.set(x, i ? -1.4 : -1.95, z); flames.add(jet);
    const core = new THREE.Mesh(new THREE.ConeGeometry(spread * 0.55, i ? 2.8 : 3.8, 10, 1, true), inner);
    core.rotation.x = Math.PI; core.position.set(x, i ? -1.0 : -1.45, z); flames.add(core);
    const ion = new THREE.Mesh(new THREE.ConeGeometry(spread * 0.28, i ? 1.35 : 1.85, 9, 1, true), cyan);
    ion.rotation.x = Math.PI; ion.position.set(x, i ? -0.45 : -0.65, z); flames.add(ion);
    for (let d = 0; d < 3; d++) {
      const diamond = new THREE.Mesh(new THREE.OctahedronGeometry(spread * (0.42 - d * 0.06), 0), d === 1 ? inner : orange);
      diamond.scale.y = 1.8; diamond.position.set(x, -1.35 - d * 0.72 - (i ? 0 : 0.4), z); flames.add(diamond);
    }
  }
  const plume = new THREE.Mesh(new THREE.ConeGeometry(1.45, 8.2, 18, 1, true), outer);
  plume.rotation.x = Math.PI; plume.position.set(0, -4.35, 0); flames.add(plume);
  const plumeCore = new THREE.Mesh(new THREE.ConeGeometry(0.78, 6.2, 14, 1, true), orange);
  plumeCore.rotation.x = Math.PI; plumeCore.position.set(0, -3.3, 0); flames.add(plumeCore);
  for (let i = 0; i < 18; i++) {
    const angle = i * 2.399963;
    const radius = 0.4 + (i % 4) * 0.22;
    const streak = new THREE.Mesh(new THREE.ConeGeometry(0.035 + (i % 3) * 0.015, 0.65 + (i % 5) * 0.18, 6), spark);
    streak.rotation.x = Math.PI; streak.position.set(Math.sin(angle) * radius, -2.0 - (i % 6) * 0.62, Math.cos(angle) * radius); flames.add(streak);
  }
  const light = new THREE.PointLight(0xff7a3d, 0, 24, 2); light.name = 'launchEngineLight';
  light.position.set(0, -0.6, 0); flames.add(light);

  // Layered vapor bank: pale rolling steam outside, darker soot close to trench.
  for (let i = 0; i < 24; i++) {
    const puff = new THREE.Mesh(new THREE.SphereGeometry(0.9 + (i % 4) * 0.13, 10, 7), i < 16 ? vapor : soot);
    puff.name = 'launchSmokePuff'; puff.userData.index = i;
    const a = i / 24 * Math.PI * 2;
    const r = 1.2 + (i % 5) * 0.48;
    puff.position.set(Math.sin(a) * r, 0.5 + (i % 3) * 0.22, Math.cos(a) * r);
    puff.scale.set(1.2 + (i % 3) * 0.25, 0.55 + (i % 2) * 0.16, 1.1 + ((i + 1) % 3) * 0.22);
    smoke.add(puff);
  }
  const shockwave = new THREE.Mesh(new THREE.TorusGeometry(1.75, 0.2, 8, 36), basic(0xffc46e, 0.74));
  shockwave.name = 'launchShockwave'; shockwave.rotation.x = Math.PI / 2; shockwave.position.y = 0.72; smoke.add(shockwave);
  const dustRing = new THREE.Mesh(new THREE.TorusGeometry(2.6, 0.34, 8, 40), vapor);
  dustRing.position.y = 0.42; dustRing.rotation.x = Math.PI / 2; smoke.add(dustRing);
  for (let i = 0; i < 12; i++) {
    const a = i / 12 * Math.PI * 2;
    const shard = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.75, 6), orange);
    shard.position.set(Math.sin(a) * 2.4, 0.65, Math.cos(a) * 2.4); shard.rotation.z = Math.sin(a) * 0.65; smoke.add(shard);
  }
  effect.add(flames, smoke);
  effect.position.y = 8.3;
  return effect;
}
