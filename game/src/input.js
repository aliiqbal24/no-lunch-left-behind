export class SwipeInput {
  constructor(element, onGesture) {
    this.element = element;
    this.onGesture = onGesture;
    this.active = null;
    this.threshold = 28;
    this.bind();
  }

  bind() {
    this.element.addEventListener('pointerdown', (event) => {
      if (!event.isPrimary) return;
      this.active = { id: event.pointerId, x: event.clientX, y: event.clientY, sent: false };
      this.element.setPointerCapture?.(event.pointerId);
      event.preventDefault();
    });
    this.element.addEventListener('pointermove', (event) => {
      if (!this.active || event.pointerId !== this.active.id) return;
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
      event.preventDefault();
    });
    this.element.addEventListener('pointercancel', () => { this.active = null; });

    window.addEventListener('keydown', (event) => {
      const map = {
        ArrowLeft: 'left', KeyA: 'left',
        ArrowRight: 'right', KeyD: 'right',
        ArrowUp: 'up', KeyW: 'up', Space: 'up',
        ArrowDown: 'down', KeyS: 'down',
        KeyE: 'tap',
      };
      const gesture = map[event.code];
      if (!gesture || event.repeat) return;
      event.preventDefault();
      this.onGesture(gesture, 'keyboard');
    }, { passive: false });
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
