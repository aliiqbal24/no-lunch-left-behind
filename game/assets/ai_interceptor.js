// AI command interceptor used as the visible Space Flight hunter and laser source.
export default function generate(THREE) {
  const g = new THREE.Group(); g.name = 'aiInterceptor';
  const mat = (color, roughness, metalness = 0, glow = 0) => {
    const m = new THREE.MeshStandardMaterial({ color, roughness, metalness,
      emissive: glow ? color : 0x000000, emissiveIntensity: glow });
    m.name = 'metal'; return m;
  };
  const steel = mat(0x1f4e5f, 0.3, 0.68);
  const navy = mat(0x111d2a, 0.26, 0.76);
  const ivory = mat(0xf7f3e8, 0.5, 0.32);
  const orange = mat(0xff6b4a, 0.34, 0.42, 0.22);
  const yellow = mat(0xf6c453, 0.42, 0.28);
  const red = mat(0xd7263d, 0.18, 0.42, 2.0);
  const teal = mat(0x45c4b0, 0.18, 0.4, 1.45);
  const violet = mat(0x6b5b95, 0.46, 0.34);
  const box = (w, h, d, x, y, z, material, parent = g, name = '') => {
    const o = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material);
    o.position.set(x, y, z); o.name = name; parent.add(o); return o;
  };
  const strut = (a, b, radius, material, parent = g, sides = 8) => {
    const start = new THREE.Vector3(...a), end = new THREE.Vector3(...b);
    const o = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, start.distanceTo(end), sides), material);
    o.position.copy(start).add(end).multiplyScalar(0.5);
    o.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), end.clone().sub(start).normalize());
    parent.add(o); return o;
  };

  const hull = new THREE.Mesh(new THREE.CapsuleGeometry(1.12, 4.5, 7, 18), steel);
  hull.rotation.x = Math.PI / 2; hull.position.set(0, 1.55, 0.3); hull.scale.set(1, 1.05, 0.72); g.add(hull);
  const prow = new THREE.Mesh(new THREE.ConeGeometry(1.15, 2.55, 18), navy);
  prow.rotation.x = Math.PI / 2; prow.position.set(0, 1.55, 3.72); g.add(prow);
  const dorsal = box(1.25, 0.72, 3.6, 0, 2.45, 0.35, navy);
  dorsal.rotation.x = -0.04;
  const sensor = box(1.36, 0.2, 0.12, 0, 1.72, 5.0, red, g, 'interceptorEye');
  sensor.rotation.x = -0.08;
  const sensorBrow = box(1.75, 0.14, 0.3, 0, 2.0, 4.82, orange);
  sensorBrow.rotation.x = -0.13;
  for (const side of [-1, 1]) {
    const optic = new THREE.Mesh(new THREE.SphereGeometry(0.12, 9, 6), red);
    optic.position.set(side * 0.72, 1.56, 5.0); g.add(optic);
  }
  for (const side of [-1, 1]) {
    // Swept armored wing with layered radiator and bright leading edge.
    const wing = new THREE.Group(); wing.name = 'interceptorWing';
    // Layered swept plates stay inside the recipe by using stock geometries;
    // the overlapping armored volumes make the same broad predatory silhouette.
    const plate = new THREE.Mesh(new THREE.BoxGeometry(5.8, 0.16, 2.1), steel);
    plate.position.set(side * 2.72, 1.62, -0.55);
    plate.rotation.y = side * -0.36;
    plate.rotation.z = side * 0.045;
    wing.add(plate);
    const lower = new THREE.Mesh(new THREE.BoxGeometry(4.7, 0.18, 1.45), navy);
    lower.position.set(side * 2.55, 1.38, -1.12);
    lower.rotation.y = side * -0.45;
    wing.add(lower);
    const blade = new THREE.Mesh(new THREE.BoxGeometry(3.1, 0.11, 0.72), orange);
    blade.position.set(side * 3.62, 1.73, -1.72);
    blade.rotation.y = side * -0.62;
    wing.add(blade);
    strut([side * 0.45,1.72,1.75],[side * 5.2,1.72,-1.0],0.13,orange,wing);
    strut([side * 0.55,1.45,-1.2],[side * 4.25,1.45,-2.8],0.12,ivory,wing);
    for (let i=0;i<5;i++) {
      const x = side * (1.55 + i * 0.68);
      const panel = box(0.54,0.06,1.35,x,1.72,-0.55-i*0.25, i%2 ? violet : navy, wing);
      panel.rotation.y = side * -0.34;
    }
    const nacelle = new THREE.Mesh(new THREE.CapsuleGeometry(0.48, 1.6, 5, 12), navy);
    nacelle.rotation.x = Math.PI/2; nacelle.position.set(side*3.75,1.48,-1.7); wing.add(nacelle);
    const engine = new THREE.Mesh(new THREE.CylinderGeometry(0.34,0.5,0.7,12),navy);
    engine.rotation.x=Math.PI/2; engine.position.set(side*3.75,1.48,-2.9); wing.add(engine);
    const exhaust = new THREE.Mesh(new THREE.CylinderGeometry(0.09,0.3,1.15,12),teal);
    exhaust.rotation.x=Math.PI/2; exhaust.position.set(side*3.75,1.48,-3.72); exhaust.name='interceptorEngine'; wing.add(exhaust);
    g.add(wing);
    // Articulated chin laser cannon.
    const cannon = new THREE.Group(); cannon.name = 'interceptorCannon';
    cannon.position.set(side*1.45,0.8,1.15);
    const joint = new THREE.Mesh(new THREE.SphereGeometry(0.32,12,8),orange); cannon.add(joint);
    box(0.5,0.42,1.5,0,0,0.72,navy,cannon);
    const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.12,0.17,1.65,10),darkMaterial(THREE));
    barrel.rotation.x=Math.PI/2; barrel.position.z=1.9; cannon.add(barrel);
    const muzzle = new THREE.Mesh(new THREE.TorusGeometry(0.21,0.065,7,14),red);
    muzzle.position.z=2.73; muzzle.name=side<0?'interceptorMuzzleLeft':'interceptorMuzzleRight'; cannon.add(muzzle);
    g.add(cannon);
  }
  for (const x of [-0.62,0,0.62]) {
    const engine = new THREE.Mesh(new THREE.CylinderGeometry(0.28,0.42,0.72,12),navy);
    engine.rotation.x=Math.PI/2; engine.position.set(x,1.3,-2.62); g.add(engine);
    const plume = new THREE.Mesh(new THREE.CylinderGeometry(0.08,0.25,1.2,10),teal);
    plume.rotation.x=Math.PI/2; plume.position.set(x,1.3,-3.52); plume.name='interceptorEngine'; g.add(plume);
  }
  for (const side of [-1,1]) for (const z of [-0.7,0.5]) {
    const pod = new THREE.Mesh(new THREE.CylinderGeometry(0.15,0.19,0.36,9),orange);
    pod.rotation.z=Math.PI/2; pod.position.set(side*1.12,2.05,z); g.add(pod);
  }
  const bounds = new THREE.Box3().setFromObject(g);
  const center = bounds.getCenter(new THREE.Vector3());
  g.children.forEach((child)=>{child.position.x-=center.x;child.position.z-=center.z;child.position.y-=bounds.min.y;});
  g.traverse((o)=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true;}});
  return g;
}

function darkMaterial(THREE) {
  const material = new THREE.MeshStandardMaterial({ color:0x111d2a, roughness:0.24, metalness:0.8 });
  material.name='metal'; return material;
}
