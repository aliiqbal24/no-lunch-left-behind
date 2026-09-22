export default function (THREE) {
  const g = new THREE.Group();
  const rock = new THREE.MeshStandardMaterial({ color: 0x6b5b95, roughness: 0.94, metalness: 0.05 }); rock.name = 'stone';
  const metal = new THREE.MeshStandardMaterial({ color: 0x9ba7b4, roughness: 0.52, metalness: 0.58 }); metal.name = 'metal';
  const orange = new THREE.MeshStandardMaterial({ color: 0xff6b4a, roughness: 0.7, metalness: 0.15 }); orange.name = 'metal';
  const boulder = new THREE.Mesh(new THREE.DodecahedronGeometry(0.76, 0), rock);
  boulder.scale.set(1.18, 0.86, 0.93);
  boulder.position.set(-0.28, 0.78, 0.08);
  boulder.rotation.set(0.3, 0.45, -0.18);
  g.add(boulder);
  const panel = new THREE.Mesh(new THREE.BoxGeometry(1.15, 0.12, 0.7), metal);
  panel.position.set(0.72, 0.65, -0.08);
  panel.rotation.set(0.4, 0.34, 0.57);
  g.add(panel);
  const cable = new THREE.Mesh(new THREE.TorusGeometry(0.35, 0.06, 7, 12, Math.PI * 1.45), orange);
  cable.position.set(0.42, 1.17, 0.22);
  cable.rotation.set(0.4, 0.2, 0.8);
  g.add(cable);
  g.children.forEach((child) => { child.position.y -= 0.131; });
  return g;
}
