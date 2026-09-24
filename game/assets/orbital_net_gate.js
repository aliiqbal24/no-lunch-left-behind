// Free-flight orbital defence lattice with one offset cyan breach aperture.
export default function generate(THREE) {
  const g = new THREE.Group(); g.name='orbitalDefenceLattice';
  const mat=(color,roughness,metalness=0,glow=0)=>{const m=new THREE.MeshStandardMaterial({color,roughness,metalness,emissive:glow?color:0,emissiveIntensity:glow});m.name='metal';return m;};
  const ivory=mat(0xf7f3e8,.52,.38),steel=mat(0x1f4e5f,.34,.66),dark=mat(0x111d2a,.26,.78),orange=mat(0xff6b4a,.38,.36,.3),red=mat(0xd7263d,.2,.38,1.65),teal=mat(0x45c4b0,.2,.4,1.45);
  const redBeam=new THREE.MeshBasicMaterial({color:0xd7263d,transparent:true,opacity:.72,depthWrite:false});redBeam.name='metal';
  const box=(w,h,d,x,y,z,m,name='')=>{const o=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m);o.position.set(x,y,z);o.name=name;g.add(o);return o;};
  const strut=(a,b,r,m)=>{const s=new THREE.Vector3(...a),e=new THREE.Vector3(...b);const o=new THREE.Mesh(new THREE.CylinderGeometry(r,r,s.distanceTo(e),8),m);o.position.copy(s).add(e).multiplyScalar(.5);o.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),e.clone().sub(s).normalize());g.add(o);return o;};

  for(const x of [-8.2,8.2]) {
    box(1.0,11.2,1.1,x,5.6,0,dark);
    for(const y of [1.0,3.4,5.8,8.2,10.4]) box(1.35,.42,1.35,x,y,0,Math.round(y)%2?orange:steel);
    const spool=new THREE.Mesh(new THREE.TorusGeometry(.72,.16,8,22),orange);spool.position.set(x,6.9,.72);spool.rotation.y=Math.PI/2;g.add(spool);
  }
  box(17.4,1.0,1.2,0,10.8,0,dark);box(17.4,.72,1.2,0,.36,0,dark);
  for(const x of [-6,-3,0,3,6]) {
    strut([x-1.2,.75,0],[x+1.2,10.3,0],.11,ivory);
    strut([x+1.2,.75,.18],[x-1.2,10.3,.18],.11,steel);
  }

  const safeX=3.45,safeY=6.55,safeRadius=1.72;
  const aperture=new THREE.Mesh(new THREE.TorusGeometry(safeRadius,.24,9,40),teal);
  aperture.position.set(safeX,safeY,-.38);aperture.name='netSafeAperture';g.add(aperture);
  const outer=new THREE.Mesh(new THREE.TorusGeometry(safeRadius+.52,.09,7,36),ivory);
  outer.position.set(safeX,safeY,-.25);outer.name='netGuideRing';g.add(outer);
  for(let i=0;i<8;i++) {
    const a=i/8*Math.PI*2;
    const marker=box(.18,.62,.16,safeX+Math.cos(a)*(safeRadius+.5),safeY+Math.sin(a)*(safeRadius+.5),-.52,i%2?teal:orange,'netGuide');
    marker.rotation.z=a;
  }
  for(let row=0;row<7;row++) for(let col=0;col<11;col++) {
    const x=-6.8+col*1.36,y=1.35+row*1.3;
    if(Math.hypot(x-safeX,y-safeY)<safeRadius+0.58) continue;
    const beam=box(1.04,.09,.13,x,y,-.28,redBeam,'netBeam');
    beam.rotation.z=(row+col)%2?.2:-.2;
  }
  for(const [x,y] of [[-5.9,2.2],[-2.9,8.6],[.2,3.2],[6.5,2.4]]) {
    const eye=new THREE.Mesh(new THREE.SphereGeometry(.28,12,8),red);eye.position.set(x,y,-.58);g.add(eye);
    box(1.0,.24,.22,x,y,-.45,steel,'netSensor');
  }
  g.userData.safeCenter={x:safeX,y:safeY,radius:safeRadius};
  return g;
}
