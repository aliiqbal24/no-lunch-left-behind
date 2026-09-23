// Surface flares for the existing Earth asset (radius 2.8, centre y=2.8).
// Load with keepHierarchy so each named flare remains independently animatable.
export default function (THREE) {
  const crisis = new THREE.Group();
  crisis.name = 'earthCrisis';
  const flares = {};
  const hot = new THREE.MeshBasicMaterial({ color: 0xffdf8f, fog: false });
  const orange = new THREE.MeshBasicMaterial({ color: 0xff6b4a, fog: false, side: THREE.DoubleSide });
  const halo = new THREE.MeshBasicMaterial({ color: 0xff8b54, transparent: true, opacity: 0.38, depthWrite: false, side: THREE.DoubleSide, fog: false });
  const axis = new THREE.Vector3(0, 0, 1);
  const radius = 2.8;

  // Opposite pairs keep the effect distributed over the whole globe while
  // presenting eight readable flares to the corridor-facing camera.
  for (let i = 0; i < 8; i++) {
    const y = -0.92 + i * (1.84 / 7);
    const circleRadius = Math.sqrt(1 - y * y);
    const x = circleRadius * 0.58 * Math.sin(i * 2.4 + 0.55);
    const z = Math.sqrt(1 - y * y - x * x);
    for (const side of [-1, 1]) {
      const normal = new THREE.Vector3(side * x, y, side * z);
      const flare = new THREE.Group();
      const index = i * 2 + (side + 1) / 2;
      flare.name = `earthFlare${index}`;
      flare.position.set(normal.x * radius, 2.8 + normal.y * radius, normal.z * radius);
      flare.quaternion.setFromUnitVectors(axis, normal);
      flare.userData.phase = i * 1.31 + (side === 1 ? 0.7 : 0);
      flare.userData.baseSize = 0.82 + (i % 3) * 0.16;

      const glow = new THREE.Mesh(new THREE.CircleGeometry(0.29, 12), halo);
      glow.name = 'glow';
      glow.position.z = 0.045;
      flare.add(glow);
      const ring = new THREE.Mesh(new THREE.TorusGeometry(0.19, 0.025, 5, 12), orange);
      ring.name = 'shockRing';
      ring.position.z = 0.075;
      flare.add(ring);
      const core = new THREE.Mesh(new THREE.SphereGeometry(0.095, 8, 6), hot);
      core.name = 'hotCore';
      core.position.z = 0.08;
      flare.add(core);
      crisis.add(flare);
      flares[`flare${index}`] = flare;
    }
  }

  crisis.userData.flares = flares;
  crisis.userData.radius = radius;
  crisis.userData.centreY = 2.8;
  return crisis;
}
