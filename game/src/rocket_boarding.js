// The ladder always advances. Taps add temporary climbing momentum, capped at
// fifteen so a fast finger never skips the visible rung-by-rung animation.
export function createClimbController({ slowDuration = 9, maxTaps = 15 } = {}) {
  let progress = 0;
  let taps = 0;
  let momentum = 0;
  let speed = 1 / slowDuration;

  function reset() {
    progress = 0;
    taps = 0;
    momentum = 0;
    speed = 1 / slowDuration;
  }

  function tap() {
    if (progress >= 1 || taps >= maxTaps) return false;
    taps += 1;
    momentum += 1;
    return true;
  }

  function update(dt) {
    if (dt > 0 && progress < 1) {
      const targetSpeed = 1 / slowDuration + 0.043 * momentum;
      speed += (targetSpeed - speed) * (1 - Math.exp(-10 * dt));
      progress = Math.min(1, progress + speed * dt);
      momentum = Math.max(0, momentum - 1.4 * dt);
    }
    return { progress, taps, maxTaps, speed };
  }

  return { reset, tap, update };
}
