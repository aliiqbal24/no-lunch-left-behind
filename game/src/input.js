export class SwipeInput {
  constructor(element, onGesture, onAnalog = () => {}) {
    this.element = element;
    this.onGesture = onGesture;
    this.onAnalog = onAnalog;
    this.active = null;
    this.threshold = 28;
    this.radius = 72;
    this.keys = new Set();
    this.bind();
  }

  bind() {
    this.element.addEventListener('pointerdown', (event) => {
      if (!event.isPrimary) return;
      this.active = { id: event.pointerId, x: event.clientX, y: event.clientY, sent: false };
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
      if (!this.active.sent && Math.hypot(event.clientX - this.active.x, event.clientY - this.active.y) < this.threshold) {
        this.onGesture('tap', 'touch');
      }
      this.active = null;
      this.onAnalog({ x: 0, y: 0, active: false, source: 'touch' });
      event.preventDefault();
    });
    this.element.addEventListener('pointercancel', () => {
      this.active = null;
      this.onAnalog({ x: 0, y: 0, active: false, source: 'touch' });
    });

    window.addEventListener('keydown', (event) => {
      const map = {
        ArrowLeft: 'left', KeyA: 'left',
        ArrowRight: 'right', KeyD: 'right',
        ArrowUp: 'up', KeyW: 'up', Space: 'up',
        ArrowDown: 'down', KeyS: 'down',
        KeyE: 'tap',
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
    const dx = x - this.active.x;
    const dy = y - this.active.y;
    const length = Math.max(1, Math.hypot(dx, dy));
    const strength = Math.min(1, length / this.radius);
    this.onAnalog({
      x: dx / length * strength,
      y: -dy / length * strength,
      active: true,
      source: 'touch',
      originX: this.active.x,
      originY: this.active.y,
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
    const dx = x - this.active.x;
    const dy = y - this.active.y;
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
