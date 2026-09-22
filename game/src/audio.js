const NOTES = [261.63, 329.63, 392, 523.25, 392, 329.63, 293.66, 440];

export class AudioEngine {
  constructor() {
    this.ctx = null;
    this.enabled = true;
    this.beat = 0;
    this.timer = 0;
  }

  async start() {
    if (!this.ctx) this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    if (this.ctx.state === 'suspended') await this.ctx.resume();
    if (!this.timer) this.timer = window.setInterval(() => this.tick(), 260);
  }

  tone(frequency, duration = 0.08, type = 'square', volume = 0.025, when = 0) {
    if (!this.enabled || !this.ctx) return;
    const at = this.ctx.currentTime + when;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(frequency, at);
    gain.gain.setValueAtTime(0.0001, at);
    gain.gain.exponentialRampToValueAtTime(volume, at + 0.008);
    gain.gain.exponentialRampToValueAtTime(0.0001, at + duration);
    osc.connect(gain).connect(this.ctx.destination);
    osc.start(at);
    osc.stop(at + duration + 0.02);
  }

  tick() {
    if (!this.enabled || document.hidden) return;
    const note = NOTES[this.beat % NOTES.length];
    this.tone(note, 0.11, 'triangle', this.beat % 4 === 0 ? 0.035 : 0.018);
    if (this.beat % 4 === 2) this.tone(note / 2, 0.06, 'square', 0.009, 0.03);
    this.beat += 1;
  }

  gesture(kind) {
    const table = { left: 330, right: 392, up: 523, down: 220 };
    this.tone(table[kind], 0.07, 'sine', 0.035);
  }

  hit() {
    if (!this.enabled || !this.ctx) return;
    this.tone(105, 0.28, 'sawtooth', 0.1);
    this.tone(68, 0.34, 'square', 0.06, 0.04);
  }

  complete() {
    [392, 523, 659, 784].forEach((n, i) => this.tone(n, 0.22, 'triangle', 0.045, i * 0.1));
  }

  toggle() {
    this.enabled = !this.enabled;
    return this.enabled;
  }
}
