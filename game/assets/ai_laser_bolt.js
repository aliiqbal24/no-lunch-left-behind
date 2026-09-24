export default function generate(THREE) {
  const g = new THREE.Group(); g.name = 'interceptorLaserBolt';
  const red = new THREE.MeshBasicMaterial({ color:0xff3158, transparent:true, opacity:0.94, depthWrite:false }); red.name='metal';
  const hot = new THREE.MeshBasicMaterial({ color:0xfff3d4, transparent:true, opacity:0.98, depthWrite:false }); hot.name='metal';
  const warning = new THREE.MeshBasicMaterial({ color:0xd7263d, transparent:true, opacity:0.24, side:THREE.DoubleSide, depthWrite:false }); warning.name='metal';
  for(const side of [-1,1]) {
    const outer = new THREE.Mesh(new THREE.CylinderGeometry(0.16,0.28,4.4,10),red);
    outer.rotation.x=Math.PI/2; outer.position.set(side*0.38,0.34,0); g.add(outer);
    const core = new THREE.Mesh(new THREE.CylinderGeometry(0.055,0.08,4.7,8),hot);
    core.rotation.x=Math.PI/2; core.position.set(side*0.38,0.34,0.12); g.add(core);
    const nose = new THREE.Mesh(new THREE.SphereGeometry(0.2,10,7),hot);
    nose.position.set(side*0.38,0.34,2.35); g.add(nose);
  }
  const halo = new THREE.Mesh(new THREE.TorusGeometry(0.78,0.06,7,24),red);
  halo.position.set(0,0.34,2.05); halo.name='laserHalo'; g.add(halo);
  const telegraph = new THREE.Mesh(new THREE.ConeGeometry(1.15,6.5,16,1,true),warning);
  telegraph.rotation.x=-Math.PI/2; telegraph.position.set(0,0.34,-1.4); telegraph.name='laserTelegraph'; g.add(telegraph);
  const bounds=new THREE.Box3().setFromObject(g),center=bounds.getCenter(new THREE.Vector3());
  g.position.set(-center.x,-bounds.min.y,-center.z);
  return g;
}
