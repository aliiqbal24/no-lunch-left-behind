export class SwipeInput {
  constructor(element, onGesture) {
    this.element = element;
    this.onGesture = onGesture;
    this.active = null;
    this.threshold = 28;
    this.maxMs = 450;
    this.bind();
  }

  bind() {
    this.element.addEventListener('pointerdown', (event) => {
      if (!event.isPrimary) return;
      this.active = { id: event.pointerId, x: event.clientX, y: event.clientY, at: performance.now() };
      this.element.setPointerCapture?.(event.pointerId);
      event.preventDefault();
    });
    this.element.addEventListener('pointerup', (event) => {
      if (!this.active || event.pointerId !== this.active.id) return;
      this.finish(event.clientX, event.clientY);
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
      };
      const gesture = map[event.code];
      if (!gesture || event.repeat) return;
      event.preventDefault();
      this.onGesture(gesture, 'keyboard');
    }, { passive: false });
  }

  finish(x, y) {
    const elapsed = performance.now() - this.active.at;
    const dx = x - this.active.x;
    const dy = y - this.active.y;
    const ax = Math.abs(dx);
    const ay = Math.abs(dy);
    if (elapsed > this.maxMs || Math.max(ax, ay) < this.threshold) return;
    if (ax > ay * 1.15) this.onGesture(dx < 0 ? 'left' : 'right', 'touch');
    else if (ay > ax * 1.15) this.onGesture(dy < 0 ? 'up' : 'down', 'touch');
  }
}

