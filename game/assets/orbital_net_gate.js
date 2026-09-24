// A one-time, three-lane orbital defence shutter. The right lane is open.
export default function generate(THREE) {
  const group = new THREE.Group();
  const frame = new THREE.MeshStandardMaterial({ color: 0xf7f3e8, metalness: 0.55, roughness: 0.35 }); frame.name = 'metal';
  const dark = new THREE.MeshStandardMaterial({ color: 0x172b33, metalness: 0.6, roughness: 0.42 }); dark.name = 'metal';
  const danger = new THREE.MeshBasicMaterial({ color: 0xd7263d, transparent: true, opacity: 0.88 }); danger.name = 'metal';
  const safe = new THREE.MeshBasicMaterial({ color: 0x45c4b0, transparent: true, opacity: 0.95 }); safe.name = 'metal';

  const crossbar = new THREE.Mesh(new THREE.BoxGeometry(8.5, 0.28, 0.35), dark);
  crossbar.position.set(0, 4.25, 0);
  group.add(crossbar);
  for (const [index, x] of [2.2, 0, -2.2].entries()) {
    const opening = index === 2;
    for (const edge of [-1, 1]) {
      const post = new THREE.Mesh(new THREE.BoxGeometry(0.18, 3.7, 0.28), frame);
      post.position.set(x + edge * 0.94, 2.18, 0);
      group.add(post);
      const foot = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.36, 0.46), dark);
      foot.position.set(x + edge * 0.94, 0.18, 0);
      group.add(foot);
    }
    const crown = new THREE.Mesh(new THREE.BoxGeometry(2.03, 0.18, 0.3), opening ? safe : danger);
    crown.position.set(x, 3.95, -0.08);
    group.add(crown);
    if (opening) {
      for (const edge of [-1, 1]) {
        const guide = new THREE.Mesh(new THREE.BoxGeometry(0.09, 2.75, 0.1), safe);
        guide.position.set(x + edge * 0.76, 2.1, -0.22);
        group.add(guide);
      }
      const arrow = new THREE.Group();
      for (const edge of [-1, 1]) {
        const stroke = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.72, 0.12), safe);
        stroke.position.set(edge * 0.24, 0, 0);
        stroke.rotation.z = edge * 0.6;
        arrow.add(stroke);
      }
      arrow.position.set(x, 3.2, -0.25);
      group.add(arrow);
    } else {
      for (const y of [0.8, 1.5, 2.2, 2.9, 3.6]) {
        const beam = new THREE.Mesh(new THREE.BoxGeometry(1.72, 0.12, 0.13), danger);
        beam.position.set(x, y, -0.15);
        group.add(beam);
      }
      const core = new THREE.Mesh(new THREE.BoxGeometry(0.22, 3.1, 0.18), danger);
      core.position.set(x, 2.16, -0.2);
      group.add(core);
    }
  }
  return group;
}
