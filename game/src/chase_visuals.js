/**
 * Visual speed cues for the three chase acts. This module never advances the
 * world, the act timer, obstacles, or collision state.
 *
 * Call update after the normal actor and camera updates, before rendering.
 * Pass active only when mode === 'playing' and introDelay <= 0. Pass paused
 * separately so the last rendered frame stays fixed while development is paused.
 */
export function createChaseVisuals({ camera, baseFov, reducedMotion = false }) {
  let standardFov = baseFov;
  let clock = 0;
  let bank = 0;
  let wasActive = false;
  const overlay = reducedMotion ? null : document.createElement('canvas');
  const context = overlay?.getContext('2d');

  if (overlay) {
    overlay.setAttribute('aria-hidden', 'true');
    overlay.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:11;display:none';
    document.body.append(overlay);
  }

  function resizeOverlay() {
    if (!overlay || !context) return;
    const ratio = Math.min(window.devicePixelRatio || 1, 1.5);
    overlay.width = Math.round(window.innerWidth * ratio);
    overlay.height = Math.round(window.innerHeight * ratio);
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
  }

  if (overlay) {
    resizeOverlay();
    window.addEventListener('resize', resizeOverlay);
  }

  function drawStreaks(act) {
    if (!context || !overlay) return;
    const width = window.innerWidth;
    const height = window.innerHeight;
    context.clearRect(0, 0, width, height);
    const space = act === 'space';
    const count = space ? 14 : 9;
    const reach = Math.min(width * (space ? 0.13 : 0.09), space ? 68 : 46);
    const colour = act === 'city' ? '23,43,51' : act === 'station' ? '246,196,83' : '168,229,238';
    context.lineCap = 'round';
    for (const side of [-1, 1]) {
      for (let i = 0; i < count; i++) {
        const phase = (i * 0.61803398875 + clock * (space ? 1.8 : 1.3)) % 1;
        const y = height * (0.18 + phase * 0.65);
        const inset = reach * (0.25 + ((i * 7) % 11) / 15);
        const x = side < 0 ? inset : width - inset;
        const length = (space ? 23 : 13) + phase * (space ? 42 : 25);
        const opacity = (space ? 0.32 : 0.19) * (0.35 + 0.65 * Math.sin(phase * Math.PI));
        context.strokeStyle = `rgba(${colour},${opacity})`;
        context.lineWidth = space ? 1.8 : 1.3;
        context.beginPath();
        context.moveTo(x, y);
        context.lineTo(x + side * Math.min(10, reach * 0.22), y - length);
        context.stroke();
      }
    }
  }

  function update({ dt, active, paused = false, act, targetX, player, ship }) {
    if (paused) return;
    const moving = active && dt > 0;
    const chaseFov = reducedMotion ? standardFov : standardFov + (act === 'space' ? 5 : 4);
    const desiredFov = moving ? chaseFov : standardFov;
    const nextFov = camera.fov + (desiredFov - camera.fov) * (1 - Math.exp(-dt * 4));
    if (Math.abs(nextFov - camera.fov) > 0.001) {
      camera.fov = nextFov;
      camera.updateProjectionMatrix();
    }

    if (!moving) {
      bank = 0;
      if (overlay && wasActive) overlay.style.display = 'none';
      wasActive = false;
      return;
    }

    const actor = act === 'space' ? ship : player;
    const laneError = actor ? targetX - actor.position.x : 0;
    if (!reducedMotion) {
      const desiredBank = Math.max(-0.035, Math.min(0.035, -laneError * 0.022));
      bank += (desiredBank - bank) * (1 - Math.exp(-dt * 9));
      camera.rotateZ(bank);
      clock += dt;
      if (overlay && context) {
        if (!wasActive) overlay.style.display = 'block';
        drawStreaks(act);
      }
    }

    if (act === 'space' && ship && !reducedMotion) {
      const desiredShipBank = Math.max(-0.42, Math.min(0.42, -laneError * 0.3));
      ship.rotation.z += (desiredShipBank - ship.rotation.z) * (1 - Math.exp(-dt * 10));
    }
    wasActive = true;
  }

  function dispose() {
    if (overlay) {
      window.removeEventListener('resize', resizeOverlay);
      overlay.remove();
    }
  }

  return { update, setBaseFov: (value) => { standardFov = value; }, dispose };
}
