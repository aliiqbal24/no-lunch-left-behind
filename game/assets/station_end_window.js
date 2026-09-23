// End cap for the 8.3 m wide, 5.25 m high station corridor.
// Keep its opening clear: the Earth model mounts behind it at earthMount.
export default function (THREE) {
  const end = new THREE.Group();
  end.name = 'stationEndWindow';

  const ivory = new THREE.MeshStandardMaterial({ color: 0xf7f3e8, roughness: 0.62, metalness: 0.18 }); ivory.name = 'metal';
  const dark = new THREE.MeshStandardMaterial({ color: 0x172b33, roughness: 0.44, metalness: 0.52 }); dark.name = 'metal';
  const teal = new THREE.MeshStandardMaterial({ color: 0x45c4b0, roughness: 0.26, metalness: 0.28, emissive: 0x45c4b0, emissiveIntensity: 0.7 }); teal.name = 'metal';
  const glass = new THREE.MeshBasicMaterial({ color: 0x76c8e0, transparent: true, opacity: 0.07, depthWrite: false, side: THREE.DoubleSide, fog: false });

  function box(name, w, h, d, x, y, z, material) {
    const part = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material);
    part.name = name;
    part.position.set(x, y, z);
    part.receiveShadow = true;
    end.add(part);
    return part;
  }

  // The four wall pieces form a real 6.6 x 3.25 m aperture at y=1.2..4.45.
  box('lowerWall', 8.3, 1.2, 0.42, 0, 0.6, 0, ivory);
  box('upperWall', 8.3, 0.8, 0.42, 0, 4.85, 0, ivory);
  for (const side of [-1, 1]) {
    box('sidePier', 0.85, 3.25, 0.42, side * 3.725, 2.825, 0, ivory);
    box('frameSide', 0.16, 3.41, 0.58, side * 3.38, 2.825, 0, dark);
    box('edgeLight', 0.055, 3.12, 0.61, side * 3.255, 2.825, 0, teal);
    for (const face of [-1, 1]) {
      box('frameRivet', 0.13, 0.13, 0.06, side * 3.38, 1.37, face * 0.31, dark);
      box('frameRivet', 0.13, 0.13, 0.06, side * 3.38, 4.28, face * 0.31, dark);
    }
  }
  box('sill', 6.85, 0.2, 0.65, 0, 1.2, 0, dark);
  box('header', 6.85, 0.19, 0.65, 0, 4.45, 0, dark);
  box('sillLight', 6.45, 0.055, 0.7, 0, 1.35, 0, teal);
  box('headerLight', 6.45, 0.055, 0.7, 0, 4.31, 0, teal);
  box('baseRail', 8.3, 0.18, 0.72, 0, 0.09, 0, dark);

  const pane = new THREE.Mesh(new THREE.PlaneGeometry(6.5, 3.08), glass);
  pane.name = 'clearEarthPane';
  pane.position.set(0, 2.825, 0);
  end.add(pane);

  // The existing Earth asset has its globe centred at y=2.8. At scale .65,
  // this mount aligns its centre with the window and keeps it outside the hull.
  const earthMount = new THREE.Group();
  earthMount.name = 'earthMount';
  earthMount.position.set(0, 1.005, 3.6);
  end.add(earthMount);
  end.userData.earthMount = earthMount;
  end.userData.aperture = { width: 6.5, height: 3.08, centreY: 2.825 };
  end.userData.earthScale = 0.65;
  return end;
}
