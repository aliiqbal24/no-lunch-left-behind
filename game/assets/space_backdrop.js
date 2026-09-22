export default function (THREE) {
  const g = new THREE.Group();
  const domeMaterial = new THREE.MeshBasicMaterial({ color: 0x090d22, side: THREE.BackSide, depthWrite: false, fog: false });
  domeMaterial.name = 'stone';
  const dome = new THREE.Mesh(new THREE.SphereGeometry(140, 20, 12), domeMaterial);
  dome.name = 'spaceDome';
  g.add(dome);

  const count = 230;
  const positions = new Float32Array(count * 3);
  let seed = 404;
  const random = () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 4294967296;
  };
  for (let i = 0; i < count; i++) {
    const theta = random() * Math.PI * 2;
    const phi = Math.acos(random() * 2 - 1);
    const radius = 85 + random() * 35;
    positions[i * 3] = Math.sin(phi) * Math.cos(theta) * radius;
    positions[i * 3 + 1] = Math.cos(phi) * radius;
    positions[i * 3 + 2] = Math.sin(phi) * Math.sin(theta) * radius;
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const starMaterial = new THREE.PointsMaterial({ color: 0xfff9ea, size: 0.72, sizeAttenuation: true, fog: false });
  starMaterial.name = 'stone';
  const stars = new THREE.Points(geometry, starMaterial);
  stars.name = 'stars';
  g.add(stars);
  g.children.forEach((child) => { child.position.y += 140; });
  return g;
}
