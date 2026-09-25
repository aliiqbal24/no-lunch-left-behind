export default function (THREE) {
  const g = new THREE.Group();
  const mat = (color, name, roughness = 0.72, metalness = 0) => {
    const m = new THREE.MeshStandardMaterial({ color, roughness, metalness });
    m.name = name;
    return m;
  };
  const yellow = mat(0xf6c453, 'fabric', 0.88);
  const teal = mat(0x1f4e5f, 'fabric', 0.84);
  const skin = mat(0xb96f51, 'fabric', 0.82);
  const cream = mat(0xfff9ea, 'fabric', 0.9);
  const dark = mat(0x172b33, 'metal', 0.92);
  const red = mat(0xd7263d, 'fabric', 0.82);
  const orange = mat(0xff6b4a, 'metal', 0.5, 0.18);
  const tealLight = new THREE.MeshStandardMaterial({ color: 0x45c4b0, roughness: 0.32, metalness: 0.24,
    emissive: 0x45c4b0, emissiveIntensity: 0.75 }); tealLight.name = 'metal';

  const hips = new THREE.Group();
  hips.position.y = 0.743;
  g.add(hips);
  const torso = new THREE.Group();
  torso.position.y = 0.18;
  hips.add(torso);
  const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.37, 0.44, 5, 12), yellow);
  body.scale.set(1.05, 1, 0.84);
  body.position.y = 0.2;
  torso.add(body);
  const lowerPanel = new THREE.Mesh(new THREE.CylinderGeometry(0.36, 0.34, 0.33, 12), teal);
  lowerPanel.scale.z = 0.82;
  lowerPanel.position.y = -0.06;
  torso.add(lowerPanel);
  const pocket = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.17, 0.08), cream);
  pocket.position.set(0, 0.04, 0.32);
  pocket.rotation.x = -0.08;
  torso.add(pocket);
  const pocketLip = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.045, 0.055), orange);
  pocketLip.position.set(0, 0.115, 0.385); torso.add(pocketLip);
  for (const side of [-1, 1]) {
    const torsoSeam = new THREE.Mesh(new THREE.TorusGeometry(0.34, 0.018, 6, 18, Math.PI * 0.62), orange);
    torsoSeam.position.set(side * 0.02, 0.2, 0.02); torsoSeam.rotation.set(Math.PI / 2, side * Math.PI / 2, 0); torso.add(torsoSeam);
    const shoulderPatch = new THREE.Mesh(new THREE.BoxGeometry(0.17, 0.08, 0.2), teal);
    shoulderPatch.position.set(side * 0.32, 0.48, 0.08); shoulderPatch.rotation.z = side * 0.18; torso.add(shoulderPatch);
  }
  for (const x of [-0.105, 0.105]) {
    const drawstring = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.24, 6), dark);
    drawstring.position.set(x, 0.38, 0.33);
    torso.add(drawstring);
  }
  const badge = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.1, 0.035), red);
  badge.position.set(0.21, 0.28, 0.36);
  torso.add(badge);
  const badgeLight = new THREE.Mesh(new THREE.SphereGeometry(0.025, 7, 5), tealLight);
  badgeLight.position.set(0.21, 0.28, 0.383); torso.add(badgeLight);
  // Compact evacuation pack, harness and oxygen canister make the hero mission-specific.
  const pack = new THREE.Mesh(new THREE.BoxGeometry(0.54, 0.64, 0.22), teal);
  pack.position.set(0, 0.21, -0.34); torso.add(pack);
  const packTop = new THREE.Mesh(new THREE.CapsuleGeometry(0.2, 0.16, 4, 10), dark);
  packTop.rotation.z = Math.PI / 2; packTop.position.set(0, 0.5, -0.37); torso.add(packTop);
  for (const x of [-0.2, 0.2]) {
    const strap = new THREE.Mesh(new THREE.BoxGeometry(0.055, 0.62, 0.045), orange);
    strap.position.set(x, 0.22, 0.34); strap.rotation.z = x * -0.12; torso.add(strap);
    const buckle = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.08, 0.05), dark);
    buckle.position.set(x, 0.03, 0.375); torso.add(buckle);
  }
  const canister = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.48, 10), cream);
  canister.position.set(-0.2, 0.18, -0.5); torso.add(canister);
  const canisterCap = new THREE.Mesh(new THREE.TorusGeometry(0.1, 0.025, 6, 12), red);
  canisterCap.position.set(-0.2, 0.41, -0.5); canisterCap.rotation.x = Math.PI / 2; torso.add(canisterCap);

  const head = new THREE.Group();
  head.position.y = 0.72;
  torso.add(head);
  const hood = new THREE.Mesh(new THREE.SphereGeometry(0.35, 16, 12), teal);
  hood.scale.set(1.13, 1.07, 1.04);
  head.add(hood);
  const hoodRim = new THREE.Mesh(new THREE.TorusGeometry(0.255, 0.035, 8, 18), yellow);
  hoodRim.position.z = 0.252;
  hoodRim.scale.y = 1.05;
  head.add(hoodRim);
  const hoodSeam = new THREE.Mesh(new THREE.TorusGeometry(0.32, 0.018, 6, 20, Math.PI * 1.2), orange);
  hoodSeam.rotation.z = Math.PI * 0.4; hoodSeam.position.z = -0.08; head.add(hoodSeam);
  const face = new THREE.Mesh(new THREE.SphereGeometry(0.25, 16, 11), skin);
  face.position.set(0, 0, 0.185);
  face.scale.set(1, 1.05, 0.6);
  head.add(face);
  const eyebrows = [];
  for (const x of [-0.085, 0.085]) {
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.027, 8, 6), dark);
    eye.position.set(x, 0.035, 0.338);
    head.add(eye);
    const eyebrow = new THREE.Mesh(new THREE.CapsuleGeometry(0.012, 0.07, 3, 7), dark);
    eyebrow.rotation.z = Math.PI / 2;
    eyebrow.position.set(x, 0.105, 0.346);
    head.add(eyebrow);
    eyebrows.push(eyebrow);
  }
  const nose = new THREE.Mesh(new THREE.SphereGeometry(0.032, 8, 6), skin);
  nose.position.set(0, -0.01, 0.347); head.add(nose);
  const mouth = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.012, 0.015), dark);
  mouth.position.set(0, -0.085, 0.34); head.add(mouth);
  const sadMouth = new THREE.Mesh(new THREE.TorusGeometry(0.058, 0.009, 5, 12, Math.PI), dark);
  sadMouth.position.set(0, -0.112, 0.352); sadMouth.visible = false; head.add(sadMouth);
  const angryMouth = new THREE.Mesh(new THREE.CapsuleGeometry(0.035, 0.06, 4, 10), dark);
  angryMouth.rotation.z = Math.PI / 2;
  angryMouth.position.set(0, -0.09, 0.356); angryMouth.visible = false; head.add(angryMouth);
  const tear = new THREE.Mesh(new THREE.SphereGeometry(0.013, 7, 5), tealLight);
  tear.position.set(-0.09, -0.012, 0.35); tear.visible = false; head.add(tear);
  const comm = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.075, 0.05, 10), orange);
  comm.position.set(0.31, 0, 0.1); comm.rotation.z = Math.PI / 2; head.add(comm);
  const commLight = new THREE.Mesh(new THREE.SphereGeometry(0.03, 7, 5), tealLight);
  commLight.position.set(0.345, 0.015, 0.12); head.add(commLight);

  const makeArm = (side) => {
    const joint = new THREE.Group();
    joint.position.set(side * 0.4, 0.47, 0);
    torso.add(joint);
    const sleeve = new THREE.Mesh(new THREE.CapsuleGeometry(0.115, 0.36, 4, 9), yellow);
    sleeve.position.y = -0.22;
    sleeve.rotation.z = side * -0.08;
    joint.add(sleeve);
    const elbow = new THREE.Mesh(new THREE.SphereGeometry(0.13, 9, 6), orange);
    elbow.scale.set(1, 0.72, 0.82); elbow.position.set(side * 0.015, -0.25, -0.04); joint.add(elbow);
    const reflective = new THREE.Mesh(new THREE.TorusGeometry(0.116, 0.018, 6, 12), cream);
    reflective.position.y = -0.34; reflective.rotation.x = Math.PI / 2; joint.add(reflective);
    const cuff = new THREE.Mesh(new THREE.CylinderGeometry(0.115, 0.105, 0.12, 9), teal);
    cuff.position.y = -0.45;
    joint.add(cuff);
    const hand = new THREE.Mesh(new THREE.SphereGeometry(0.105, 9, 7), skin);
    hand.position.set(side * 0.03, -0.53, 0.02);
    joint.add(hand);
    for (const z of [-0.06, 0, 0.06]) {
      const finger = new THREE.Mesh(new THREE.CapsuleGeometry(0.018, 0.065, 3, 6), skin);
      finger.position.set(side * 0.03, -0.59, z + 0.02); joint.add(finger);
    }
    return joint;
  };
  const makeLeg = (side) => {
    const joint = new THREE.Group();
    joint.position.set(side * 0.19, -0.04, 0);
    hips.add(joint);
    const leg = new THREE.Mesh(new THREE.CapsuleGeometry(0.14, 0.39, 4, 9), teal);
    leg.position.y = -0.31;
    joint.add(leg);
    const knee = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.2, 0.08), orange);
    knee.position.set(0, -0.24, 0.13); knee.rotation.x = -0.08; joint.add(knee);
    const calfStrip = new THREE.Mesh(new THREE.TorusGeometry(0.14, 0.018, 6, 12), cream);
    calfStrip.position.y = -0.44; calfStrip.rotation.x = Math.PI / 2; joint.add(calfStrip);
    const sole = new THREE.Mesh(new THREE.BoxGeometry(0.29, 0.17, 0.44), dark);
    sole.position.set(0, -0.61, 0.08);
    sole.rotation.x = -0.06;
    joint.add(sole);
    const toe = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.08, 0.16), yellow);
    toe.position.set(0, -0.56, 0.27);
    toe.rotation.x = -0.06;
    joint.add(toe);
    const heel = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.1, 0.13), orange);
    heel.position.set(0, -0.58, -0.14); joint.add(heel);
    for (const x of [-0.055, 0.055]) {
      const lace = new THREE.Mesh(new THREE.BoxGeometry(0.025, 0.02, 0.18), cream);
      lace.position.set(x, -0.49, 0.18); lace.rotation.x = -0.2; joint.add(lace);
    }
    return joint;
  };
  const leftArm = makeArm(-1);
  const rightArm = makeArm(1);
  const leftLeg = makeLeg(-1);
  const rightLeg = makeLeg(1);
  const bounds = new THREE.Box3().setFromObject(g);
  const centre = bounds.getCenter(new THREE.Vector3());
  g.children.forEach((child) => { child.position.x -= centre.x; child.position.z -= centre.z; });
  g.userData.joints = { hips, torso, head, leftArm, rightArm, leftLeg, rightLeg,
    leftBrow: eyebrows[0], rightBrow: eyebrows[1], neutralMouth: mouth, sadMouth, angryMouth, tear };
  return g;
}
