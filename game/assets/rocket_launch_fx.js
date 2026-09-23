// Procedural exhaust and pad vapor for the city rocket's liftoff shot.
export default function (THREE) {
  const effect = new THREE.Group();
  const flames = new THREE.Group();
  flames.name = 'launchFlames';
  const smoke = new THREE.Group();
  smoke.name = 'launchSmoke';

  const outer = new THREE.MeshBasicMaterial({ color: 0xff6b2f, transparent: true, opacity: 0.8, depthWrite: false, side: THREE.DoubleSide });
  const inner = new THREE.MeshBasicMaterial({ color: 0xffeaa1, transparent: true, opacity: 0.92, depthWrite: false, side: THREE.DoubleSide });
  for (let i = 0; i < 3; i++) {
    const angle = i * Math.PI * 2 / 3;
    const x = Math.sin(angle) * 0.55;
    const z = Math.cos(angle) * 0.55 - 0.35;
    const jet = new THREE.Mesh(new THREE.ConeGeometry(0.5, 4.2, 10), outer);
    jet.rotation.x = Math.PI;
    jet.position.set(x, -1.65, z);
    flames.add(jet);
    const core = new THREE.Mesh(new THREE.ConeGeometry(0.25, 3.1, 8), inner);
    core.rotation.x = Math.PI;
    core.position.set(x, -1.18, z);
    flames.add(core);
  }
  const plume = new THREE.Mesh(new THREE.ConeGeometry(0.72, 5.4, 12), outer);
  plume.rotation.x = Math.PI;
  plume.position.set(0, -2.15, -0.35);
  flames.add(plume);
  const light = new THREE.PointLight(0xff924a, 0, 15, 2);
  light.name = 'launchEngineLight';
  light.position.set(0, -0.5, -0.35);
  flames.add(light);

  const vapor = new THREE.MeshBasicMaterial({ color: 0xd8e1e6, transparent: true, opacity: 0.54, depthWrite: false });
  for (let i = 0; i < 12; i++) {
    const puff = new THREE.Mesh(new THREE.SphereGeometry(0.85, 8, 6), vapor);
    puff.name = 'launchSmokePuff';
    puff.userData.index = i;
    smoke.add(puff);
  }
  const ring = new THREE.Mesh(new THREE.TorusGeometry(1.4, 0.16, 6, 24),
    new THREE.MeshBasicMaterial({ color: 0xffc46e, transparent: true, opacity: 0.7, depthWrite: false }));
  ring.name = 'launchShockwave';
  ring.rotation.x = Math.PI / 2;
  ring.position.y = 0.7;
  smoke.add(ring);

  effect.add(flames, smoke);
  // Ground the standalone recipe preview. The game mounts the named child
  // groups at the rocket and pad using their authored local coordinates.
  effect.position.y = 4.85;
  return effect;
}
