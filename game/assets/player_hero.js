// Original editable Three.js hero. +Z is forward; every outfit shares one rig.
export default function (THREE) {
  const hero = new THREE.Group();
  const material = (color, name = 'fabric', roughness = 0.8, metalness = 0) => {
    const value = new THREE.MeshStandardMaterial({ color, roughness, metalness });
    value.name = name;
    return value;
  };
  const ochre = material(0xf6c453), ochreShade = material(0xd59b35);
  const teal = material(0x1f4e5f), tealShade = material(0x173944);
  const ivory = material(0xf7f3e8), skin = material(0xb96f51), skinShade = material(0x9d573f);
  const hair = material(0x172b33), sole = material(0x172b33, 'metal', 0.8);
  const steel = material(0x9ba7b4, 'metal', 0.36, 0.62), red = material(0xd7263d, 'metal', 0.46, 0.28);
  const glow = new THREE.MeshStandardMaterial({ color: 0x45c4b0, emissive: 0x45c4b0,
    emissiveIntensity: 0.7, roughness: 0.3, metalness: 0.2 });
  glow.name = 'metal';
  const visor = new THREE.MeshPhysicalMaterial({ color: 0xa9eef2, metalness: 0,
    roughness: 0.1, transparent: true, opacity: 0.18, depthWrite: false, side: THREE.FrontSide });
  visor.name = 'metal';
  // Tiny procedural weave, not a shipped bitmap: the close intro and airlock
  // shots retain a textile/pressure-fabric surface instead of flat toy plastic.
  const weaveData = new Uint8Array(64 * 64 * 4);
  for (let y = 0; y < 64; y++) for (let x = 0; x < 64; x++) {
    const n = (x * 37 + y * 73 + x * y * 13) % 29;
    const value = 150 + ((x + y) % 2) * 45 + n;
    const i = (y * 64 + x) * 4;
    weaveData[i] = value; weaveData[i + 1] = value;
    weaveData[i + 2] = value; weaveData[i + 3] = 255;
  }
  const weave = new THREE.DataTexture(weaveData, 64, 64, THREE.RGBAFormat);
  weave.wrapS = weave.wrapT = THREE.RepeatWrapping;
  weave.repeat.set(3, 3);
  weave.magFilter = THREE.LinearFilter;
  weave.minFilter = THREE.LinearFilter;
  weave.needsUpdate = true;
  for (const cloth of [ochre, ochreShade, teal, tealShade, ivory]) {
    cloth.bumpMap = weave;
    cloth.bumpScale = 0.012;
  }
  const add = (parent, geometry, mat, x, y, z, outfit) => {
    const mesh = new THREE.Mesh(geometry, mat);
    mesh.position.set(x, y, z);
    if (outfit) mesh.userData.outfit = outfit;
    parent.add(mesh);
    return mesh;
  };
  const group = (parent, x, y, z) => {
    const part = new THREE.Group(); part.position.set(x, y, z); parent.add(part); return part;
  };
  const box = (parent, w, h, d, mat, x, y, z, outfit) =>
    add(parent, new THREE.BoxGeometry(w, h, d), mat, x, y, z, outfit);
  const sphere = (parent, r, mat, x, y, z, outfit, width = 12, height = 8) =>
    add(parent, new THREE.SphereGeometry(r, width, height), mat, x, y, z, outfit);
  const cylinder = (parent, top, bottom, h, mat, x, y, z, outfit, sides = 10) =>
    add(parent, new THREE.CylinderGeometry(top, bottom, h, sides), mat, x, y, z, outfit);
  const capsule = (parent, r, h, mat, x, y, z, outfit) =>
    add(parent, new THREE.CapsuleGeometry(r, h, 4, 10), mat, x, y, z, outfit);
  const ring = (parent, r, tube, mat, x, y, z, outfit) =>
    add(parent, new THREE.TorusGeometry(r, tube, 6, 18), mat, x, y, z, outfit);

  const hips = group(hero, 0, 0.91, 0);
  const torso = group(hips, 0, 0.06, 0);
  // Anatomical masses stay narrower than the old toy-like jacket and backpack.
  const waist = capsule(hips, 0.225, 0.12, teal, 0, 0.02, 0, 'office');
  waist.scale.z = 0.85;
  cylinder(hips, 0.245, 0.22, 0.16, ivory, 0, 0.02, 0, 'suit');
  const shirt = capsule(torso, 0.275, 0.43, ochre, 0, 0.32, 0, 'office');
  shirt.scale.set(1.13, 1, 0.69);
  const suitBody = capsule(torso, 0.31, 0.48, ivory, 0, 0.32, 0, 'suit');
  suitBody.scale.z = 0.82;
  const inset = capsule(torso, 0.23, 0.39, ivory, 0, 0.30, 0.055, 'office');
  inset.scale.z = 0.52;
  const jacketLeft = box(torso, 0.15, 0.42, 0.035, ochre, -0.175, 0.30, 0.187, 'office');
  jacketLeft.rotation.z = -0.035;
  const jacketRight = box(torso, 0.15, 0.42, 0.035, ochre, 0.175, 0.30, 0.187, 'office');
  jacketRight.rotation.z = 0.035;
  for (const side of [-1, 1]) {
    const collar = box(torso, 0.17, 0.11, 0.04, ochreShade, side * 0.115, 0.55, 0.22, 'office');
    collar.rotation.z = side * 0.34;
    box(torso, 0.10, 0.09, 0.015, ochreShade, side * 0.21, 0.31, 0.215, 'office');
    box(torso, 0.052, 0.30, 0.015, teal, side * 0.28, 0.35, -0.01, 'office');
    const seam = box(torso, 0.022, 0.39, 0.025, teal, side * 0.262, 0.32, 0.038, 'office');
    seam.rotation.z = side * 0.06;
    const lapelEdge = box(torso, 0.012, 0.15, 0.018, ivory, side * 0.125, 0.51, 0.242, 'office');
    lapelEdge.rotation.z = side * 0.34;
    box(torso, 0.06, 0.012, 0.019, ochreShade, side * 0.21, 0.355, 0.238, 'office');
    box(torso, 0.11, 0.014, 0.02, ochreShade, side * 0.17, 0.14, 0.22, 'office');
    box(torso, 0.12, 0.12, 0.017, ochreShade, side * 0.176, 0.32, -0.194, 'office');
    box(torso, 0.085, 0.012, 0.021, ivory, side * 0.176, 0.37, -0.203, 'office');
    box(torso, 0.014, 0.085, 0.015, tealShade, side * 0.09, 0.565, -0.187, 'office');
    box(hips, 0.047, 0.075, 0.027, steel, side * 0.178, 0.11, 0.161, 'office');
    box(torso, 0.075, 0.24, 0.035, teal, side * 0.22, 0.35, 0.222, 'suit');
    box(torso, 0.058, 0.10, 0.05, ochre, side * 0.25, 0.55, 0.17, 'suit');
  }
  box(torso, 0.064, 0.39, 0.018, ochreShade, 0, 0.29, 0.224, 'office');
  box(torso, 0.48, 0.024, 0.016, ochreShade, 0, 0.54, -0.22, 'office');
  box(torso, 0.023, 0.31, 0.014, ochreShade, 0, 0.34, -0.222, 'office');
  for (const y of [0.16, 0.29, 0.42]) sphere(torso, 0.013, tealShade, 0, y, 0.238, 'office', 6, 5);
  box(torso, 0.08, 0.085, 0.022, teal, 0.20, 0.42, 0.228, 'office');
  box(torso, 0.052, 0.012, 0.026, glow, 0.20, 0.44, 0.242, 'office');
  box(hips, 0.51, 0.055, 0.34, tealShade, 0, 0.10, 0, 'office');
  box(hips, 0.085, 0.065, 0.025, steel, 0, 0.10, 0.185, 'office');
  for (const x of [-0.2, -0.1, 0.1, 0.2]) box(hips, 0.025, 0.075, 0.019, tealShade, x, 0.11, 0.179, 'office');
  // Station suit: engineered plate layers, pressure seams and actual life support.
  box(torso, 0.33, 0.20, 0.075, teal, 0, 0.37, 0.28, 'suit');
  box(torso, 0.28, 0.045, 0.085, steel, 0, 0.48, 0.31, 'suit');
  for (const x of [-0.095, 0, 0.095]) box(torso, 0.055, 0.018, 0.014, x === 0 ? red : glow, x, 0.38, 0.327, 'suit');
  for (const x of [-0.09, 0.09]) {
    cylinder(torso, 0.042, 0.042, 0.025, steel, x, 0.43, 0.337, 'suit').rotation.x = Math.PI / 2;
    cylinder(torso, 0.026, 0.026, 0.028, x < 0 ? glow : red, x, 0.43, 0.353, 'suit').rotation.x = Math.PI / 2;
    ring(torso, 0.048, 0.011, steel, x, 0.10, 0.296, 'suit');
  }
  box(torso, 0.41, 0.11, 0.08, teal, 0, 0.01, 0.255, 'suit');
  for (const x of [-0.19, 0.19]) {
    box(torso, 0.055, 0.54, 0.045, ochre, x, 0.30, 0.252, 'suit');
    box(torso, 0.08, 0.065, 0.07, steel, x, 0.12, 0.285, 'suit');
  }
  box(torso, 0.42, 0.52, 0.19, teal, 0, 0.33, -0.36, 'suit');
  box(torso, 0.32, 0.10, 0.20, ivory, 0, 0.58, -0.38, 'suit');
  for (const x of [-0.14, 0.14]) {
    cylinder(torso, 0.055, 0.055, 0.36, steel, x, 0.33, -0.49, 'suit');
    ring(torso, 0.056, 0.014, red, x, 0.13, -0.49, 'suit').rotation.x = Math.PI / 2;
  }
  box(torso, 0.26, 0.04, 0.03, red, 0, 0.35, -0.48, 'suit');
  for (const y of [0.16, 0.23, 0.30, 0.41])
    box(torso, 0.24, 0.012, 0.019, steel, 0, y, -0.468, 'suit');
  for (const x of [-0.23, 0.23]) {
    cylinder(torso, 0.054, 0.054, 0.065, steel, x, 0.08, 0.05, 'suit').rotation.z = Math.PI / 2;
    cylinder(torso, 0.039, 0.039, 0.069, teal, x * 1.13, 0.08, 0.05, 'suit').rotation.z = Math.PI / 2;
  }

  const neck = cylinder(torso, 0.095, 0.11, 0.13, skinShade, 0, 0.68, 0);
  const head = group(torso, 0, 0.86, 0);
  head.scale.setScalar(0.86);
  const skull = sphere(head, 0.235, skin, 0, 0, 0.015, undefined, 16, 12);
  skull.scale.set(0.88, 1.14, 0.86);
  const jaw = sphere(head, 0.165, skin, 0, -0.112, 0.095);
  jaw.scale.set(1.08, 0.72, 0.65);
  const hairCap = sphere(head, 0.242, hair, 0, 0.115, -0.02, undefined, 16, 10);
  hairCap.scale.set(0.94, 0.63, 0.89);
  for (const x of [-0.12, -0.04, 0.045, 0.13]) {
    const lock = sphere(head, 0.048, hair, x, 0.18 + Math.abs(x) * 0.09, 0.13);
    lock.scale.set(1.05, 0.48, 0.7);
  }
  for (const side of [-1, 1]) {
    const ear = sphere(head, 0.055, skin, side * 0.213, -0.015, 0.03);
    ear.scale.set(0.58, 1.2, 0.78);
    sphere(head, 0.025, ivory, side * 0.081, 0.017, 0.212, undefined, 8, 6);
    sphere(head, 0.013, hair, side * 0.081, 0.016, 0.235, undefined, 8, 6);
    const upperLid = capsule(head, 0.008, 0.058, skinShade, side * 0.081, 0.047, 0.221);
    upperLid.rotation.z = Math.PI / 2;
    const lowerLid = capsule(head, 0.006, 0.055, skinShade, side * 0.081, -0.014, 0.223);
    lowerLid.rotation.z = Math.PI / 2;
    const cheek = sphere(head, 0.052, skinShade, side * 0.125, -0.078, 0.165);
    cheek.scale.set(1.1, 0.42, 0.35);
  }
  const leftBrow = capsule(head, 0.012, 0.065, hair, -0.082, 0.091, 0.219);
  leftBrow.rotation.z = Math.PI / 2;
  const rightBrow = capsule(head, 0.012, 0.065, hair, 0.082, 0.091, 0.219);
  rightBrow.rotation.z = Math.PI / 2;
  const nose = sphere(head, 0.035, skinShade, 0, -0.035, 0.217, undefined, 8, 6);
  nose.scale.set(0.72, 1, 0.8);
  const neutralMouth = box(head, 0.075, 0.013, 0.008, hair, 0, -0.112, 0.225);
  const lowerLip = capsule(head, 0.008, 0.055, skinShade, 0, -0.133, 0.226);
  lowerLip.rotation.z = Math.PI / 2;
  const sadMouth = add(head, new THREE.TorusGeometry(0.046, 0.008, 6, 14, Math.PI),
    hair, 0, -0.145, 0.229); sadMouth.visible = false;
  const angryMouth = capsule(head, 0.019, 0.055, hair, 0, -0.125, 0.232);
  angryMouth.rotation.z = Math.PI / 2; angryMouth.visible = false;
  const tear = sphere(head, 0.015, glow, -0.096, -0.041, 0.23); tear.visible = false;
  // Helmet shell remains transparent so the established human face reads.
  const helmetBack = add(head,
    new THREE.SphereGeometry(0.32, 16, 12, Math.PI, Math.PI), teal, 0, -0.03, -0.045, 'suit');
  helmetBack.scale.set(1.05, 1.04, 0.93);
  const visorRim = ring(head, 0.275, 0.031, ivory, 0, -0.022, 0.206, 'suit');
  visorRim.scale.y = 1.02;
  const glass = sphere(head, 0.30, visor, 0, -0.02, 0.164, 'suit', 20, 14);
  glass.scale.set(0.93, 0.95, 0.58); glass.renderOrder = 3;
  for (const side of [-1, 1]) {
    cylinder(head, 0.065, 0.065, 0.055, steel, side * 0.313, -0.018, 0.015, 'suit').rotation.z = Math.PI / 2;
    sphere(head, 0.026, red, side * 0.35, -0.018, 0.015, 'suit');
  }
  ring(torso, 0.22, 0.035, steel, 0, 0.69, 0, 'suit').rotation.x = Math.PI / 2;

  const arms = [], elbows = [], wrists = [], legs = [], knees = [], ankles = [], toes = [];
  for (const side of [-1, 1]) {
    const shoulder = group(torso, side * 0.36, 0.57, 0);
    arms.push(shoulder);
    sphere(shoulder, 0.082, ochre, 0, -0.035, 0, 'office');
    capsule(shoulder, 0.084, 0.205, ochre, side * 0.012, -0.16, 0, 'office');
    for (const y of [-0.255, -0.282])
      ring(shoulder, 0.085, 0.011, ochreShade, side * 0.012, y, 0, 'office').rotation.x = Math.PI / 2;
    capsule(shoulder, 0.102, 0.22, ivory, side * 0.01, -0.16, 0, 'suit');
    box(shoulder, 0.12, 0.05, 0.05, teal, 0, -0.10, 0.106, 'suit');
    box(shoulder, 0.12, 0.02, 0.026, ochreShade, 0, -0.24, 0.077, 'office');
    box(shoulder, 0.07, 0.055, 0.02, red, 0, -0.15, 0.105, 'suit');
    const elbow = group(shoulder, side * 0.018, -0.35, 0);
    elbows.push(elbow);
    sphere(elbow, 0.075, skin, 0, -0.02, 0, 'office');
    sphere(elbow, 0.115, teal, 0, -0.02, 0, 'suit');
    for (const y of [-0.055, -0.015, 0.025])
      ring(elbow, 0.096, 0.01, steel, 0, y, 0, 'suit').rotation.x = Math.PI / 2;
    capsule(elbow, 0.068, 0.17, skin, 0, -0.145, 0, 'office');
    capsule(elbow, 0.10, 0.21, ivory, 0, -0.15, 0, 'suit');
    cylinder(elbow, 0.082, 0.078, 0.065, ochreShade, 0, -0.25, 0, 'office');
    ring(elbow, 0.080, 0.013, ochre, 0, -0.226, 0, 'office').rotation.x = Math.PI / 2;
    cylinder(elbow, 0.11, 0.09, 0.07, teal, 0, -0.27, 0, 'suit');
    box(elbow, 0.055, 0.13, 0.019, steel, 0, -0.16, 0.105, 'suit');
    const wrist = group(elbow, 0, -0.315, 0); wrists.push(wrist);
    sphere(wrist, 0.072, skin, 0, -0.035, 0, 'office');
    sphere(wrist, 0.092, teal, 0, -0.035, 0, 'suit');
    for (const dx of [-0.042, 0, 0.042])
      capsule(wrist, 0.018, 0.05, skin, dx, -0.105, 0.018, 'office');
    box(wrist, 0.11, 0.025, 0.06, steel, 0, -0.08, 0.052, 'suit');
    for (const dx of [-0.041, 0, 0.041])
      capsule(wrist, 0.023, 0.06, ivory, dx, -0.103, 0.014, 'suit');

    const hip = group(hips, side * 0.165, -0.08, 0); legs.push(hip);
    cylinder(hip, 0.137, 0.113, 0.35, teal, 0, -0.203, 0, 'office', 16);
    cylinder(hip, 0.155, 0.128, 0.35, ivory, 0, -0.203, 0, 'suit', 16);
    box(hip, 0.12, 0.035, 0.055, tealShade, 0, -0.23, 0.143, 'office');
    box(hip, 0.018, 0.29, 0.017, tealShade, side * 0.125, -0.21, 0.072, 'office');
    box(hip, 0.065, 0.015, 0.02, tealShade, side * 0.03, -0.33, 0.139, 'office');
    box(hip, 0.15, 0.075, 0.065, ochre, 0, -0.16, 0.16, 'suit');
    box(hip, 0.07, 0.17, 0.028, ochre, 0, -0.25, 0.154, 'suit');
    box(hip, 0.17, 0.017, 0.02, red, 0, -0.36, 0.139, 'suit');
    const knee = group(hip, 0, -0.405, 0); knees.push(knee);
    sphere(knee, 0.106, tealShade, 0, 0, 0, 'office');
    sphere(knee, 0.12, teal, 0, 0, 0, 'suit');
    box(knee, 0.17, 0.11, 0.065, steel, 0, 0, 0.106, 'suit');
    cylinder(knee, 0.113, 0.083, 0.30, teal, 0, -0.183, 0, 'office', 16);
    box(knee, 0.015, 0.29, 0.016, tealShade, side * 0.095, -0.17, 0.045, 'office');
    ring(knee, 0.111, 0.012, tealShade, 0, -0.30, 0, 'office').rotation.x = Math.PI / 2;
    cylinder(knee, 0.136, 0.105, 0.30, ivory, 0, -0.183, 0, 'suit', 16);
    for (const y of [-0.18, -0.27])
      ring(knee, 0.125, 0.012, teal, 0, y, 0, 'suit').rotation.x = Math.PI / 2;
    box(knee, 0.06, 0.21, 0.028, ochre, side * 0.084, -0.17, 0.125, 'suit');
    const ankle = group(knee, 0, -0.37, 0); ankles.push(ankle);
    const shoe = box(ankle, 0.24, 0.13, 0.34, sole, 0, -0.042, 0.095, 'office');
    shoe.rotation.x = -0.03;
    box(ankle, 0.23, 0.025, 0.37, tealShade, 0, -0.107, 0.1, 'office');
    box(ankle, 0.24, 0.025, 0.16, tealShade, 0, 0.03, -0.012, 'office');
    box(ankle, 0.10, 0.022, 0.18, ochreShade, 0, -0.015, 0.21, 'office');
    box(ankle, 0.29, 0.17, 0.40, teal, 0, -0.035, 0.10, 'suit');
    box(ankle, 0.30, 0.035, 0.42, sole, 0, -0.122, 0.10, 'suit');
    box(ankle, 0.10, 0.05, 0.13, steel, 0, 0.066, 0.07, 'suit');
    for (const z of [-0.02, 0.10, 0.22])
      box(ankle, 0.31, 0.018, 0.035, steel, 0, -0.118, z, 'suit');
    const toe = group(ankle, 0, -0.08, 0.19); toes.push(toe);
    box(toe, 0.22, 0.08, 0.15, sole, 0, 0.027, 0.06, 'office');
    box(toe, 0.27, 0.11, 0.17, steel, 0, 0.033, 0.06, 'suit');
    for (const y of [0.025, 0.06]) box(ankle, 0.13, 0.012, 0.015, ivory, 0, y, 0.254, 'office');
  }
  // API names are stable for both gameplay and the authored breakroom acting.
  hero.userData.joints = { hips, torso, head, leftArm: arms[0], rightArm: arms[1],
    leftElbow: elbows[0], rightElbow: elbows[1], leftWrist: wrists[0], rightWrist: wrists[1],
    leftLeg: legs[0], rightLeg: legs[1], leftKnee: knees[0], rightKnee: knees[1],
    leftAnkle: ankles[0], rightAnkle: ankles[1], leftToe: toes[0], rightToe: toes[1],
    leftBrow, rightBrow, neutralMouth, sadMouth, angryMouth, tear };
  hero.traverse((part) => { if (part.userData.outfit === 'suit') part.visible = false; });
  const bounds = new THREE.Box3().setFromObject(hero);
  const centre = bounds.getCenter(new THREE.Vector3());
  hero.scale.setScalar(0.82);
  hero.position.set(-centre.x * 0.82, -bounds.min.y * 0.82, -centre.z * 0.82);
  return hero;
}
