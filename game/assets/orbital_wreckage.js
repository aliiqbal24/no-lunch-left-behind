export default function generate(THREE) {
  const g = new THREE.Group(); g.name='orbitalWreckage';
  const mat=(color,roughness,metalness=0,glow=0)=>{const m=new THREE.MeshStandardMaterial({color,roughness,metalness,emissive:glow?color:0,emissiveIntensity:glow});m.name='metal';return m;};
  const steel=mat(0x9ba7b4,0.48,0.62),dark=mat(0x172b33,0.34,0.7),teal=mat(0x1f4e5f,0.44,0.5),orange=mat(0xff6b4a,0.48,0.3),red=mat(0xd7263d,0.22,0.38,1.3),cyan=mat(0x45c4b0,0.2,0.4,1.1),violet=mat(0x6b5b95,0.72,0.18);
  const box=(w,h,d,x,y,z,m,name='')=>{const o=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m);o.position.set(x,y,z);o.name=name;g.add(o);return o;};
  const strut=(a,b,r,m)=>{const s=new THREE.Vector3(...a),e=new THREE.Vector3(...b);const o=new THREE.Mesh(new THREE.CylinderGeometry(r,r,s.distanceTo(e),7),m);o.position.copy(s).add(e).multiplyScalar(.5);o.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),e.clone().sub(s).normalize());g.add(o);return o;};
  // Broken antenna truss and torn solar wing.
  for(const x of [-1.8,-0.6,0.6,1.8]) {strut([x,0.42,-0.3],[x+0.6,1.58,0.28],0.08,steel);strut([x+0.6,0.42,-0.3],[x,1.58,0.28],0.08,steel);}
  strut([-2.2,0.35,-0.35],[2.4,0.35,-0.35],0.12,dark);strut([-2.0,1.65,0.32],[2.05,1.65,0.32],0.1,dark);
  for(let i=0;i<4;i++) {const p=box(1.0,0.07,1.3,-2.0+i*1.12,1.15,0.85,i===3?violet:teal,'wreckagePanel');p.rotation.set(0.18+i*.09,-.12+i*.08,i===3?.55:.08);box(.08,.08,1.1,-2.0+i*1.12,1.19,0.86,cyan);}
  // Split rescue capsule and pressure hardware.
  const tank=new THREE.Mesh(new THREE.CapsuleGeometry(.56,1.15,5,12),steel);tank.rotation.z=Math.PI/2;tank.position.set(1.35,.72,-.8);g.add(tank);
  for(const x of [.7,1.35,2.0]) {const ring=new THREE.Mesh(new THREE.TorusGeometry(.58,.075,7,16),x===1.35?orange:dark);ring.position.set(x,.72,-.8);ring.rotation.y=Math.PI/2;g.add(ring);}
  const hatch=new THREE.Mesh(new THREE.CylinderGeometry(.44,.44,.16,14),dark);hatch.rotation.z=Math.PI/2;hatch.position.set(2.42,.72,-.8);g.add(hatch);
  box(.62,.16,.18,2.5,.72,-.8,red,'wreckageBeacon');
  // Frozen cable loop and fragmented insulation.
  const cable=new THREE.Mesh(new THREE.TorusKnotGeometry(.58,.07,48,7,2,3),orange);cable.position.set(-1.25,.7,-1.0);cable.rotation.set(.55,.2,.3);g.add(cable);
  for(const [x,y,z,s] of [[-2.4,.4,-.7,.32],[2.7,1.5,.3,.26],[.1,1.9,-.9,.2],[-.2,.3,1.2,.22]]) {const shard=new THREE.Mesh(new THREE.TetrahedronGeometry(s,0),violet);shard.position.set(x,y,z);shard.rotation.set(x,y,z);g.add(shard);}
  const bounds=new THREE.Box3().setFromObject(g);const center=bounds.getCenter(new THREE.Vector3());
  // Box3 conservatively expands rotated primitives; compensate to place the
  // lowest authored vertex exactly on the recipe ground plane.
  g.position.set(-center.x,-bounds.min.y-.295,-center.z);
  g.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true;}});return g;
}
