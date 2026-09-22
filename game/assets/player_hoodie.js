export default function (THREE) {
  const g = new THREE.Group();
  const mat = (color, name, roughness = 0.72, metalness = 0) => {
    const m = new THREE.MeshStandardMaterial({ color, roughness, metalness });
    m.name = name;
    return m;
  };
  const yellow = mat(0xf6c453, 'fabric', 0.88);
  const teal = mat(0x1f4e5f, 'fabric', 0.84);
  const skin = mat(0xb96f51, 'skin', 0.82);
  const cream = mat(0xfff9ea, 'fabric', 0.9);
  const dark = mat(0x172b33, 'rubber', 0.92);

  const hips = new THREE.Group();
  hips.position.y = 0.743;
  g.add(hips);

  const torso = new THREE.Group();
  torso.position.y = 0.18;
  hips.add(torso);
  const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.36, 0.42, 5, 10), yellow);
  body.scale.set(1.02, 1, 0.82);
  body.position.y = 0.2;
  torso.add(body);
  const pocket = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.17, 0.08), cream);
  pocket.position.set(0, 0.08, 0.31);
  pocket.rotation.x = -0.08;
  torso.add(pocket);

  const head = new THREE.Group();
  head.position.y = 0.72;
  torso.add(head);
  const hood = new THREE.Mesh(new THREE.SphereGeometry(0.34, 14, 10), teal);
  hood.scale.set(1.12, 1.06, 1.02);
  head.add(hood);
  const face = new THREE.Mesh(new THREE.SphereGeometry(0.25, 14, 10), skin);
  face.position.set(0, 0, 0.18);
  face.scale.set(1, 1.05, 0.6);
  head.add(face);
  for (const x of [-0.085, 0.085]) {
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.027, 8, 6), dark);
    eye.position.set(x, 0.035, 0.335);
    head.add(eye);
  }

  const makeArm = (side) => {
    const joint = new THREE.Group();
    joint.position.set(side * 0.39, 0.47, 0);
    torso.add(joint);
    const sleeve = new THREE.Mesh(new THREE.CapsuleGeometry(0.11, 0.36, 4, 8), yellow);
    sleeve.position.y = -0.22;
    sleeve.rotation.z = side * -0.08;
    joint.add(sleeve);
    const hand = new THREE.Mesh(new THREE.SphereGeometry(0.105, 9, 7), skin);
    hand.position.set(side * 0.03, -0.5, 0.02);
    joint.add(hand);
    return joint;
  };

  const makeLeg = (side) => {
    const joint = new THREE.Group();
    joint.position.set(side * 0.19, -0.04, 0);
    hips.add(joint);
    const leg = new THREE.Mesh(new THREE.CapsuleGeometry(0.135, 0.39, 4, 8), teal);
    leg.position.y = -0.31;
    joint.add(leg);
    const shoe = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.16, 0.43), dark);
    shoe.position.set(0, -0.61, 0.08);
    shoe.rotation.x = -0.06;
    joint.add(shoe);
    return joint;
  };

  const leftArm = makeArm(-1);
  const rightArm = makeArm(1);
  const leftLeg = makeLeg(-1);
  const rightLeg = makeLeg(1);
  g.userData.joints = { hips, torso, head, leftArm, rightArm, leftLeg, rightLeg };
  return g;
}
