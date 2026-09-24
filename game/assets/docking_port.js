export default function (THREE) {
  const g = new THREE.Group();
  const ivory = new THREE.MeshStandardMaterial({ color: 0xf7f3e8, roughness: 0.48, metalness: 0.36 }); ivory.name = 'metal';
  const dark = new THREE.MeshStandardMaterial({ color: 0x172b33, roughness: 0.36, metalness: 0.7 }); dark.name = 'metal';
  const teal = new THREE.MeshStandardMaterial({ color: 0x45c4b0, roughness: 0.2, emissive: 0x45c4b0, emissiveIntensity: 1.1 }); teal.name = 'metal';
  const amber = new THREE.MeshStandardMaterial({ color: 0xf6c453, roughness: 0.24, emissive: 0xf6c453, emissiveIntensity: 1.35 }); amber.name = 'metal';
  const innerDark = new THREE.MeshStandardMaterial({ color: 0x10232b, roughness: 0.85, side: THREE.BackSide }); innerDark.name = 'metal';
  const bulkheadDark = new THREE.MeshStandardMaterial({ color: 0x09161d, roughness: 0.9 }); bulkheadDark.name = 'metal';
  const orange = new THREE.MeshStandardMaterial({ color: 0xff6b4a, roughness: 0.4, metalness: 0.42, emissive: 0xff6b4a, emissiveIntensity: 0.26 }); orange.name = 'metal';
  const red = new THREE.MeshStandardMaterial({ color: 0xd7263d, roughness: 0.24, metalness: 0.42, emissive: 0xd7263d, emissiveIntensity: 1.25 }); red.name = 'metal';
  const glass = new THREE.MeshStandardMaterial({ color: 0x173d4d, roughness: 0.18, metalness: 0.62, emissive: 0x45c4b0, emissiveIntensity: 0.18 }); glass.name = 'metal';
  const box = (w,h,d,x,y,z,material,parent=g,name='') => {
    const o = new THREE.Mesh(new THREE.BoxGeometry(w,h,d),material);
    o.position.set(x,y,z); o.name=name; parent.add(o); return o;
  };
  const strut = (a,b,r,material,parent=g) => {
    const s=new THREE.Vector3(...a),e=new THREE.Vector3(...b);
    const o=new THREE.Mesh(new THREE.CylinderGeometry(r,r,s.distanceTo(e),8),material);
    o.position.copy(s).add(e).multiplyScalar(.5);
    o.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),e.clone().sub(s).normalize());
    parent.add(o); return o;
  };
  for (let i = 0; i < 3; i++) {
    const ring = new THREE.Mesh(new THREE.TorusGeometry(2.8 - i * 0.38, 0.16, 8, 24), i === 1 ? teal : ivory);
    ring.position.y = 3.05;
    ring.rotation.z = i * 0.18;
    ring.name = `dockRing${i}`;
    g.add(ring);
  }
  // Monumental outer station rings and radial trusswork turn the old port into
  // a destination visible throughout free flight.
  for (let i = 0; i < 4; i++) {
    const radius = 5.2 + i * 1.05;
    const ring = new THREE.Mesh(new THREE.TorusGeometry(radius, 0.24 - i * 0.025, 8, 40), i === 2 ? orange : dark);
    ring.position.y = 3.05; ring.scale.y = 0.38; ring.rotation.z = i * 0.035; ring.name = `dockRingOuter${i}`; g.add(ring);
  }
  for (let i = 0; i < 12; i++) {
    const a = i / 12 * Math.PI * 2;
    const inner = [Math.cos(a)*3.55,3.05+Math.sin(a)*2.5,0.2];
    const outer = [Math.cos(a)*8.15,3.05+Math.sin(a)*3.0,0.85 + (i%2)*0.45];
    strut(inner,outer,0.14,i%3===0?orange:ivory);
    const node = new THREE.Mesh(new THREE.SphereGeometry(0.28,10,7),i%3===0?red:teal);
    node.position.set(...outer); g.add(node);
  }
  // Pressurised side modules, radiator wings and exposed service spine.
  for (const side of [-1,1]) {
    const module = new THREE.Group(); module.position.set(side*10.2,3.05,2.4);
    const shell = new THREE.Mesh(new THREE.CapsuleGeometry(1.25,4.2,6,16),ivory);
    shell.rotation.x=Math.PI/2; module.add(shell);
    for(const z of [-1.8,-.6,.6,1.8]) {
      const rib=new THREE.Mesh(new THREE.TorusGeometry(1.25,.1,7,20),side*z>0?orange:dark);
      rib.rotation.x=Math.PI/2; rib.position.z=z; module.add(rib);
    }
    for(const x of [-.46,.46]) box(.58,.34,.08,x,0.34,2.14,glass,module);
    g.add(module);
    for (const yOff of [-2.0,2.0]) {
      const radiator = new THREE.Group(); radiator.position.set(side*8.8,3.05+yOff,2.1);
      for(let j=-2;j<=2;j++) box(2.9,.42,.1,0,j*.52,0,j%2?glass:dark,radiator);
      box(.18,3.0,.2,0,0,0.05,orange,radiator); g.add(radiator);
    }
    box(1.3,1.2,7.8,side*6.9,3.05,4.9,dark);
    for(const z of [1.6,3.4,5.2,7.0]) box(1.42,.2,.38,side*6.9,3.05,z,teal);
  }
  for (const z of [3.2,5.6,8.0]) {
    box(4.8,.68,.72,0,3.05,z,dark);
    for(const x of [-2.1,0,2.1]) box(.28,1.45,.82,x,3.05,z,orange);
  }
  for (let i = 0; i < 6; i++) {
    const angle = i / 6 * Math.PI * 2;
    const strut = new THREE.Mesh(new THREE.BoxGeometry(0.22, 1.25, 0.38), dark);
    strut.position.set(Math.cos(angle) * 3.2, 3.05 + Math.sin(angle) * 3.2, 0);
    strut.rotation.z = angle;
    g.add(strut);
  }
  for (const side of [-1, 1]) {
    const approachRail = new THREE.Mesh(new THREE.BoxGeometry(0.22, 1.4, 0.32), dark);
    approachRail.position.set(side * 3.88, 3.05, -0.18);
    g.add(approachRail);
    for (const height of [-0.46, 0.46]) {
      const beacon = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.26, 0.12), amber);
      beacon.position.set(side * 3.88, 3.05 + height, -0.43);
      g.add(beacon);
    }
  }
  // Deep approach beacon corridor and emergency shutter machinery.
  for (const side of [-1,1]) for (const z of [-1.4,0.2,1.8,3.4,5.0]) {
    const beacon = new THREE.Mesh(new THREE.CylinderGeometry(0.12,0.18,0.32,9),side*z>0?amber:teal);
    beacon.rotation.x=Math.PI/2; beacon.position.set(side*3.9,3.05,z); beacon.name='dockBeacon'; g.add(beacon);
  }
  for (const side of [-1,1]) {
    box(.55,4.9,1.2,side*3.42,3.05,1.72,dark);
    for(const y of [1.2,2.45,3.7,4.95]) box(.68,.22,1.28,side*3.42,y,1.72,red);
  }
  const tunnel = new THREE.Mesh(new THREE.CylinderGeometry(3.35, 3.35, 2.8, 20, 1, true), dark);
  tunnel.rotation.x = Math.PI / 2;
  tunnel.position.set(0, 3.05, 1.55);
  g.add(tunnel);

  // The original tube has only outward faces. This second surface and the far
  // bulkhead give the approaching camera a closed, dark passage to travel through.
  const innerTunnel = new THREE.Mesh(new THREE.CylinderGeometry(3.12, 3.12, 2.8, 20, 1, true), innerDark);
  innerTunnel.name = 'dockPassage';
  innerTunnel.rotation.x = Math.PI / 2;
  innerTunnel.position.set(0, 3.05, 1.55);
  g.add(innerTunnel);
  const entranceRim = new THREE.Mesh(new THREE.TorusGeometry(3.16, 0.1, 7, 20), dark);
  entranceRim.position.set(0, 3.05, 0.16);
  g.add(entranceRim);
  for (const x of [-2.3, 2.3]) {
    const guide = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.12, 2.45), teal);
    guide.position.set(x, 1.06, 1.55);
    g.add(guide);
  }
  const bulkhead = new THREE.Group();
  bulkhead.name = 'dockBulkhead';
  bulkhead.position.set(0, 3.05, 2.83);
  const door = new THREE.Mesh(new THREE.CircleGeometry(3.08, 20), bulkheadDark);
  door.rotation.y = Math.PI;
  bulkhead.add(door);
  const seal = new THREE.Mesh(new THREE.TorusGeometry(3.04, 0.09, 7, 20), ivory);
  seal.position.z = -0.035;
  bulkhead.add(seal);
  const statusBar = new THREE.Mesh(new THREE.BoxGeometry(1.15, 0.12, 0.05), teal);
  statusBar.position.z = -0.08;
  bulkhead.add(statusBar);
  g.add(bulkhead);

  const bounds = new THREE.Box3().setFromObject(g);
  const center = bounds.getCenter(new THREE.Vector3());
  // Rotated rings make Box3's fast bounds conservative by 0.61m versus their
  // true vertices, so account for it to keep the station grounded.
  const shiftY = -bounds.min.y - 0.61;
  g.position.set(-center.x, shiftY, -center.z);
  g.userData.dockCenter = { y: 3.05 + shiftY };
  g.userData.mounts = ['left', 'right'];
  return g;
}
