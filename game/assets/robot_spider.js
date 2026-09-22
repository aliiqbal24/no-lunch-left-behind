export default function (THREE) {
  const g = new THREE.Group();
  const ivory = new THREE.MeshStandardMaterial({ color: 0xf7f3e8, roughness: 0.58, metalness: 0.16 }); ivory.name = 'metal';
  const dark = new THREE.MeshStandardMaterial({ color: 0x1f4e5f, roughness: 0.48, metalness: 0.32 }); dark.name = 'metal';
  const glow = new THREE.MeshStandardMaterial({ color: 0x45c4b0, roughness: 0.3, emissive: 0x45c4b0, emissiveIntensity: 1.2 }); glow.name = 'glass';
  const body = new THREE.Mesh(new THREE.SphereGeometry(0.48, 12, 8), ivory);
  body.scale.set(1.15, 0.72, 1);
  body.position.y = 0.73;
  g.add(body);
  const visor = new THREE.Mesh(new THREE.CapsuleGeometry(0.12, 0.48, 4, 8), glow);
  visor.position.set(0, 0.76, 0.39);
  visor.rotation.z = Math.PI / 2;
  visor.scale.z = 0.35;
  g.add(visor);
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2 + Math.PI / 6;
    const hip = new THREE.Group();
    hip.position.set(Math.cos(a) * 0.37, 0.66, Math.sin(a) * 0.33);
    hip.rotation.y = -a + Math.PI / 2;
    g.add(hip);
    const upper = new THREE.Mesh(new THREE.CapsuleGeometry(0.045, 0.38, 3, 6), dark);
    upper.position.set(0.24, -0.1, 0);
    upper.rotation.z = Math.PI / 3;
    hip.add(upper);
    const lower = new THREE.Mesh(new THREE.CapsuleGeometry(0.04, 0.38, 3, 6), dark);
    lower.position.set(0.55, -0.35, 0);
    lower.rotation.z = Math.PI / 5;
    hip.add(lower);
  }
  g.children.forEach((o) => { o.position.y -= 0.118; });
  return g;
}
