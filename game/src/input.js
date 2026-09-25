export function joystickVector(dx, dy, radius = 72, deadzone = 7) {
  const distance = Math.hypot(dx, dy);
  if (distance <= deadzone) return { x: 0, y: 0 };

  const directionX = dx / distance;
  const directionY = dy / distance;
  const usableRadius = Math.max(1, radius - deadzone);
  const strength = Math.min(1, (distance - deadzone) / usableRadius);
  return {
    x: directionX * strength,
    // Screen Y grows downward; flight Y grows upward.
    y: -directionY * strength,
  };
}

export function screenFlightToWorld(input) {
  return {
    // The flight camera looks toward +Z, so screen-right is world -X.
    x: -input.x,
    y: input.y,
  };
}

export class SwipeInput {
  constructor(element, onGesture, onAnalog = () => {}) {
    this.element = element;
    this.onGesture = onGesture;
    this.onAnalog = onAnalog;
    this.active = null;
    this.threshold = 28;
    this.radius = 72;
    this.deadzone = 7;
    this.keys = new Set();
    this.bind();
  }

  bind() {
    this.element.addEventListener('pointerdown', (event) => {
      if (!event.isPrimary || this.active) return;
      this.active = {
        id: event.pointerId,
        startX: event.clientX,
        startY: event.clientY,
        originX: event.clientX,
        originY: event.clientY,
        sent: false,
      };
      this.element.setPointerCapture?.(event.pointerId);
      this.onAnalog({ x: 0, y: 0, active: true, source: 'touch', originX: event.clientX, originY: event.clientY });
      event.preventDefault();
    });
    this.element.addEventListener('pointermove', (event) => {
      if (!this.active || event.pointerId !== this.active.id) return;
      this.updateAnalog(event.clientX, event.clientY);
      this.finish(event.clientX, event.clientY);
      event.preventDefault();
    });
    this.element.addEventListener('pointerup', (event) => {
      if (!this.active || event.pointerId !== this.active.id) return;
      this.finish(event.clientX, event.clientY);
      if (!this.active.sent && Math.hypot(event.clientX - this.active.startX, event.clientY - this.active.startY) < this.threshold) {
        this.onGesture('tap', 'touch');
      }
      this.active = null;
      this.onAnalog({ x: 0, y: 0, active: false, source: 'touch' });
      event.preventDefault();
    });
    this.element.addEventListener('pointercancel', (event) => {
      if (!this.active || event.pointerId !== this.active.id) return;
      this.active = null;
      this.onAnalog({ x: 0, y: 0, active: false, source: 'touch' });
    });

    window.addEventListener('keydown', (event) => {
      const map = {
        ArrowLeft: 'left', KeyA: 'left',
        ArrowRight: 'right', KeyD: 'right',
        ArrowUp: 'up', KeyW: 'up', Space: 'up',
        ArrowDown: 'down', KeyS: 'down',
      };
      const gesture = map[event.code];
      if (!gesture) return;
      event.preventDefault();
      this.keys.add(event.code);
      this.emitKeyboardAnalog();
      if (!event.repeat) this.onGesture(gesture, 'keyboard');
    }, { passive: false });
    window.addEventListener('keyup', (event) => {
      if (!this.keys.has(event.code)) return;
      this.keys.delete(event.code);
      this.emitKeyboardAnalog();
    });
    window.addEventListener('blur', () => {
      this.keys.clear();
      this.onAnalog({ x: 0, y: 0, active: false, source: 'keyboard' });
    });
  }

  updateAnalog(x, y) {
    let dx = x - this.active.originX;
    let dy = y - this.active.originY;
    const distance = Math.hypot(dx, dy);

    // Like Roblox's dynamic thumbstick, the base begins wherever the player
    // touches and follows only when the thumb moves beyond the control radius.
    if (distance > this.radius) {
      const overflow = distance - this.radius;
      this.active.originX += dx / distance * overflow;
      this.active.originY += dy / distance * overflow;
      dx = x - this.active.originX;
      dy = y - this.active.originY;
    }

    const vector = joystickVector(dx, dy, this.radius, this.deadzone);
    this.onAnalog({
      x: vector.x,
      y: vector.y,
      active: true,
      source: 'touch',
      originX: this.active.originX,
      originY: this.active.originY,
    });
  }

  emitKeyboardAnalog() {
    const horizontal = Number(this.keys.has('ArrowRight') || this.keys.has('KeyD')) -
      Number(this.keys.has('ArrowLeft') || this.keys.has('KeyA'));
    const vertical = Number(this.keys.has('ArrowUp') || this.keys.has('KeyW') || this.keys.has('Space')) -
      Number(this.keys.has('ArrowDown') || this.keys.has('KeyS'));
    const length = Math.max(1, Math.hypot(horizontal, vertical));
    this.onAnalog({
      x: horizontal / length,
      y: vertical / length,
      active: horizontal !== 0 || vertical !== 0,
      source: 'keyboard',
    });
  }

  finish(x, y) {
    if (this.active.sent) return;
    const dx = x - this.active.startX;
    const dy = y - this.active.startY;
    const ax = Math.abs(dx);
    const ay = Math.abs(dy);
    if (Math.max(ax, ay) < this.threshold) return;
    if (ax > ay * 1.15) {
      this.active.sent = true;
      this.onGesture(dx < 0 ? 'left' : 'right', 'touch');
    } else if (ay > ax * 1.15) {
      this.active.sent = true;
      this.onGesture(dy < 0 ? 'up' : 'down', 'touch');
    }
  }
}
