// Stylized wounded Earth for the station viewport. Crisis scars are supplied
// by earth_crisis.js so this base globe can survive into the calm finale.
export default function (THREE) {
  const earth = new THREE.Group();
  earth.name = 'earth';
  const ocean = new THREE.MeshStandardMaterial({ color: 0x176c9a, roughness: 0.61, metalness: 0.04, emissive: 0x0d4770, emissiveIntensity: 0.72 }); ocean.name = 'stone';
  const deepOcean = new THREE.MeshStandardMaterial({ color: 0x0c4068, roughness: 0.66, metalness: 0.08 }); deepOcean.name = 'stone';
  const land = new THREE.MeshStandardMaterial({ color: 0x78aa65, roughness: 0.84, metalness: 0.02 }); land.name = 'foliage';
  const dryLand = new THREE.MeshStandardMaterial({ color: 0xb6a45c, roughness: 0.88, metalness: 0 }); dryLand.name = 'stone';
  const ice = new THREE.MeshStandardMaterial({ color: 0xdff4ef, roughness: 0.7, metalness: 0.03 }); ice.name = 'stone';
  const cloud = new THREE.MeshStandardMaterial({ color: 0xf7f3e8, roughness: 0.72, transparent: true, opacity: 0.64, depthWrite: false }); cloud.name = 'stone';
  const atmosphere = new THREE.MeshBasicMaterial({ color: 0x67d5ec, transparent: true, opacity: 0.17, depthWrite: false, side: THREE.BackSide, fog: false });
  const city = new THREE.MeshBasicMaterial({ color: 0xf6c453, transparent: true, opacity: 0.86, fog: false });
  const add = (name, geometry, material, x = 0, y = 0, z = 0) => {
    const mesh = new THREE.Mesh(geometry, material);
    mesh.name = name;
    mesh.position.set(x, y, z);
    earth.add(mesh);
    return mesh;
  };

  add('oceanGlobe', new THREE.SphereGeometry(2.8, 40, 28), ocean, 0, 3, 0);
  const night = add('nightHemisphere', new THREE.SphereGeometry(2.81, 32, 22, Math.PI * 0.45, Math.PI), deepOcean, 0, 3, 0);
  night.rotation.y = -0.28;
  const shell = add('atmosphereShell', new THREE.SphereGeometry(2.94, 36, 24), atmosphere, 0, 3, 0);
  shell.scale.set(1, 1, 1);

  const landMasses = [
    [-1.18, 3.58, 2.38, 0.95, 0.5, -0.18, land],
    [1.05, 3.28, 2.48, 0.7, 1.08, 0.34, land],
    [-0.46, 1.52, 2.5, 0.58, 0.78, -0.54, dryLand],
    [1.72, 4.14, 1.7, 0.48, 0.38, 0.3, dryLand],
    [-1.65, 2.36, 2.05, 0.38, 0.7, 0.6, land],
    [0.3, 4.7, 2.08, 0.72, 0.38, -0.12, ice],
  ];
  for (const [x, y, z, sx, sy, rotation, material] of landMasses) {
    const patch = add('continent', new THREE.SphereGeometry(0.8, 16, 10), material, x, y + 0.2, z);
    patch.scale.set(sx, sy, 0.115);
    patch.rotation.z = rotation;
  }
  for (const [y, scale, tilt] of [[2.0, 0.74, 0.12], [3.0, 0.82, -0.16], [4.12, 0.68, 0.22]]) {
    const band = add('cloudFront', new THREE.TorusGeometry(2.78, 0.05, 7, 48, Math.PI * 1.3), cloud, 0, y + 0.2, 0);
    band.rotation.x = Math.PI / 2 + tilt;
    band.rotation.z = tilt * 1.8;
    band.scale.y = scale;
  }
  for (let i = 0; i < 22; i++) {
    const angle = i * 2.399;
    const y = -0.62 + (i % 8) * 0.18;
    const radius = Math.sqrt(1 - y * y);
    const point = new THREE.Vector3(Math.cos(angle) * radius, y, Math.sin(angle) * radius);
    const light = add('cityLight', new THREE.SphereGeometry(0.032 + (i % 3) * 0.009, 7, 5), city,
      point.x * 2.83, 3 + point.y * 2.83, point.z * 2.83);
    light.userData.phase = i * 0.7;
  }
  const rim = add('atmosphereRim', new THREE.TorusGeometry(2.91, 0.07, 8, 64),
    new THREE.MeshBasicMaterial({ color: 0xb7f6ff, transparent: true, opacity: 0.72, fog: false }), 0, 3, 0);
  rim.rotation.y = Math.PI / 2;
  return earth;
}
