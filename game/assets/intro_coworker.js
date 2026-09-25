// A seated office coworker, not a combat bot: suit, coffee, and one catastrophic idea.
export default function (THREE) {
  const bot = new THREE.Group(); bot.name = 'robotCoworker';
  const mat = (color, roughness = 0.64, metalness = 0.12, emissive = 0) => {
    const m = new THREE.MeshStandardMaterial({ color, roughness, metalness, emissive: emissive ? color : 0,
      emissiveIntensity: emissive });
    m.name = metalness > 0.2 ? 'metal' : 'fabric'; return m;
  };
  const shell = mat(0xfff6e7, 0.43, 0.18);
  const bright = mat(0xffffff, 0.38, 0.08);
  const suit = mat(0x1f4e5f, 0.72, 0.04);
  const suitShadow = mat(0x142d38, 0.77, 0.05);
  const trim = mat(0x41919a, 0.55, 0.26);
  const metal = mat(0xabc8c5, 0.38, 0.52);
  const ink = mat(0x172b33, 0.65, 0.06);
  const tie = mat(0xf6c453, 0.5, 0.1);
  const coffee = mat(0x523124, 0.38, 0);
  const glow = mat(0x45c4b0, 0.32, 0.18, 1.7);
  const box = (parent, w, h, d, x, y, z, material, name = '') => {
    const o = new THREE.Mesh(new THREE.BoxGeometry(w,h,d), material);
    o.position.set(x,y,z); o.name=name; parent.add(o); return o;
  };
  const sphere = (parent, r, x,y,z,material, w=14,h=10,name='') => {
    const o=new THREE.Mesh(new THREE.SphereGeometry(r,w,h), material);
    o.position.set(x,y,z); o.name=name; parent.add(o); return o;
  };
  const cyl = (parent,rt,rb,height,x,y,z,material,sides=12,name='') => {
    const o=new THREE.Mesh(new THREE.CylinderGeometry(rt,rb,height,sides),material);
    o.position.set(x,y,z); o.name=name; parent.add(o); return o;
  };
  const chest = new THREE.Group(); chest.position.y=0.8; bot.add(chest);
  const coat=box(chest,0.91,0.82,0.54,0,0.24,0,suit,'tailoredJacket');
  coat.scale.x=0.96;
  box(chest,0.37,0.67,0.055,0,0.28,0.29,bright,'shirtFront');
  for (const side of [-1,1]) {
    const lapel=box(chest,0.2,0.48,0.07,side*0.24,0.4,0.33,suitShadow,'jacketLapel');
    lapel.rotation.z=side*0.28;
    box(chest,0.24,0.055,0.035,side*0.22,0.02,0.32,trim,'pocketPiping');
    for (const y of [0.13,0.28,0.43]) sphere(chest,0.019,side*0.34,y,0.289,metal,7,6,'coatButton');
  }
  const knot = new THREE.Mesh(new THREE.ConeGeometry(0.09,0.12,4),tie);
  knot.rotation.z=Math.PI; knot.position.set(0,0.56,0.35); chest.add(knot);
  const tieBlade=box(chest,0.1,0.4,0.045,0,0.32,0.355,tie,'tieBlade');
  tieBlade.rotation.z=0.07;
  box(chest,0.22,0.085,0.1,-0.28,0.15,0.31,shell,'nameBadge');
  box(chest,0.13,0.025,0.018,-0.28,0.15,0.37,trim);
  const waist=cyl(bot,0.37,0.42,0.27,0,0.68,0,suitShadow,14,'waist');
  waist.scale.z=0.74;
  for (const side of [-1,1]) {
    const thigh=box(bot,0.31,0.23,0.53,side*0.24,0.61,0.23,suitShadow,'seatedThigh');
    thigh.rotation.x=-0.17;
    sphere(bot,0.15,side*0.24,0.54,0.46,metal,10,8,'kneeJoint');
    const shin=box(bot,0.22,0.47,0.24,side*0.24,0.29,0.48,suit,'shin');
    shin.rotation.x=-0.09;
    box(bot,0.33,0.12,0.43,side*0.24,0.075,0.59,ink,'officeShoe');
    box(bot,0.3,0.04,0.12,side*0.24,0.12,0.82,trim,'shoeCap');
  }
  const neck=cyl(chest,0.12,0.14,0.14,0,0.74,0,metal,12,'neckJoint');
  const head=new THREE.Group(); head.name='coworkerHead'; head.position.set(0,1.62,0.025); bot.add(head);
  const cranium=box(head,0.84,0.64,0.66,0,0,0,shell,'porcelainHead');
  cranium.scale.set(1.04,1,0.96);
  box(head,0.74,0.42,0.073,0,0.02,0.35,ink,'faceGlass');
  box(head,0.69,0.36,0.012,0,0.02,0.395,suitShadow);
  const leftEye=sphere(head,0.073,-0.18,0.08,0.415,glow,12,9,'leftEye');
  const rightEye=sphere(head,0.073,0.18,0.08,0.415,glow,12,9,'rightEye');
  leftEye.scale.set(1.05,0.8,0.35); rightEye.scale.set(1.05,0.8,0.35);
  for (const x of [-0.18,0.18]) {
    box(head,0.16,0.025,0.018,x,0.18,0.415,metal,'eyebrow');
    sphere(head,0.026,x,-0.08,0.423,trim,8,6,'cheekLed');
  }
  const smile=new THREE.Mesh(new THREE.TorusGeometry(0.12,0.015,5,16,Math.PI),glow);
  smile.position.set(0,-0.08,0.423); smile.rotation.z=Math.PI; head.add(smile);
  for (const side of [-1,1]) {
    const ear=cyl(head,0.09,0.09,0.055,side*0.45,-0.02,0,metal,12,'earDisc');
    ear.rotation.z=Math.PI/2;
    cyl(head,0.035,0.035,0.04,side*0.48,-0.02,0,glow,10,'earSignal').rotation.z=Math.PI/2;
  }
  cyl(head,0.035,0.035,0.18,0.22,0.4,-0.1,metal,10,'antenna');
  sphere(head,0.064,0.22,0.5,-0.1,tie,9,7,'antennaTip');
  for (const side of [-1,1]) {
    const shoulder=new THREE.Group(); shoulder.position.set(side*0.55,1.24,0);
    shoulder.name=side>0?'rightShoulder':'leftShoulder'; bot.add(shoulder);
    sphere(shoulder,0.16,0,0,0,suit,10,8);
    const upper=box(shoulder,0.25,0.46,0.28,side*0.025,-0.23,0,suit,'jacketSleeve');
    upper.rotation.z=side*0.1;
    sphere(shoulder,0.13,side*0.04,-0.47,0.02,metal,10,8,'elbow');
    box(shoulder,0.16,0.08,0.2,side*0.04,-0.52,0.02,bright,'shirtCuff');
    sphere(shoulder,0.12,side*0.04,-0.59,0.04,shell,10,8,'hand');
    if(side>0) bot.userData.rightShoulder=shoulder;
    else bot.userData.leftShoulder=shoulder;
  }
  // A separate two-part coffee arm joins the shoulder to the mug. It follows
  // the cup through its set-down and retracts after release.
  bot.userData.rightShoulder.visible=false;
  sphere(bot,0.155,0.55,1.24,0,suit,10,8,'coffeeShoulder');
  const shoulderEnd=new THREE.Vector3(0.55,1.24,0);
  const elbowPoint=new THREE.Vector3(0.57,0.96,0.22);
  const coffeeUpper=new THREE.Mesh(new THREE.CylinderGeometry(0.13,0.12,1,12),suit);
  coffeeUpper.name='coffeeUpperArm';
  coffeeUpper.position.copy(shoulderEnd).add(elbowPoint).multiplyScalar(0.5);
  coffeeUpper.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),elbowPoint.clone().sub(shoulderEnd).normalize());
  coffeeUpper.scale.y=shoulderEnd.distanceTo(elbowPoint); bot.add(coffeeUpper);
  sphere(bot,0.12,elbowPoint.x,elbowPoint.y,elbowPoint.z,metal,10,8,'coffeeElbow');
  const cupArm=new THREE.Mesh(new THREE.CylinderGeometry(0.11,0.095,1,12),suit);
  cupArm.name='coffeeForearm'; bot.add(cupArm);
  const coffeeHand=sphere(bot,0.13,0.33,1.35,0.54,shell,12,9,'coffeeHand');
  const initialForearm=coffeeHand.position.clone().sub(elbowPoint);
  cupArm.position.copy(elbowPoint).add(coffeeHand.position).multiplyScalar(0.5);
  cupArm.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),initialForearm.clone().normalize());
  cupArm.scale.y=initialForearm.length();
  // Cup is a movable prop, visible in the coworker's hand from the first shot.
  const cup=new THREE.Group(); cup.name='coffeeCup'; cup.position.set(0.48,1.43,0.54); bot.add(cup);
  cyl(cup,0.17,0.145,0.32,0,0,0,bright,18,'ceramicCup');
  cyl(cup,0.148,0.148,0.014,0,0.167,0,coffee,18,'coffeeSurface');
  const rim=new THREE.Mesh(new THREE.TorusGeometry(0.157,0.025,6,20),metal);
  rim.position.y=0.162; rim.rotation.x=Math.PI/2; cup.add(rim);
  const handle=new THREE.Mesh(new THREE.TorusGeometry(0.11,0.032,7,17,Math.PI*1.55),bright);
  handle.position.set(0.21,0,0); handle.rotation.y=Math.PI/2; cup.add(handle);
  for (const x of [-0.18,0.18]) {
    const wisp=new THREE.Mesh(new THREE.TorusGeometry(0.095,0.014,5,15,Math.PI*0.8),metal);
    wisp.position.set(x*0.4,0.37,0); wisp.rotation.z=x>0?0.55:-0.3; cup.add(wisp);
  }
  const eyeHalo=new THREE.PointLight(0x45c4b0,0.7,2.4,2); eyeHalo.position.set(0,0.02,0.52); head.add(eyeHalo);
  bot.userData.joints={head,leftEye,rightEye,cup,cupArm,coffeeHand,smile,eyeHalo,
    leftShoulder:bot.userData.leftShoulder,rightShoulder:bot.userData.rightShoulder};
  delete bot.userData.leftShoulder; delete bot.userData.rightShoulder;
  // Include the coffee silhouette in the authored bounds, not an offset origin.
  bot.position.set(-0.07,0,-0.285);
  return bot;
}
