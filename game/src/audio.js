const THEMES = {
  city: [261.63, 329.63, 392, 523.25, 392, 329.63, 293.66, 440],
  space: [220, 329.63, 440, 659.25, 523.25, 392, 293.66, 587.33],
  station: [196, 246.94, 293.66, 392, 349.23, 293.66, 233.08, 311.13],
};

export class AudioEngine {
  constructor() {
    this.ctx = null;
    this.enabled = true;
    this.beat = 0;
    this.timer = 0;
    this.act = 'city';
  }

  async start() {
    if (!this.ctx) this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    if (this.ctx.state === 'suspended') await this.ctx.resume();
    if (!this.timer) this.timer = window.setInterval(() => this.tick(), 245);
  }

  tone(frequency, duration = 0.08, type = 'square', volume = 0.025, when = 0, bend = 0) {
    if (!this.enabled || !this.ctx) return;
    const at = this.ctx.currentTime + when;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(frequency, at);
    if (bend) osc.frequency.exponentialRampToValueAtTime(Math.max(20, frequency + bend), at + duration);
    gain.gain.setValueAtTime(0.0001, at);
    gain.gain.exponentialRampToValueAtTime(volume, at + 0.008);
    gain.gain.exponentialRampToValueAtTime(0.0001, at + duration);
    osc.connect(gain).connect(this.ctx.destination);
    osc.start(at);
    osc.stop(at + duration + 0.03);
  }

  noise(duration = 0.16, volume = 0.04, when = 0) {
    if (!this.enabled || !this.ctx) return;
    const length = Math.max(1, Math.floor(this.ctx.sampleRate * duration));
    const buffer = this.ctx.createBuffer(1, length, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / length);
    const source = this.ctx.createBufferSource();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 650;
    gain.gain.value = volume;
    source.buffer = buffer;
    source.connect(filter).connect(gain).connect(this.ctx.destination);
    source.start(this.ctx.currentTime + when);
  }

  tick() {
    if (!this.enabled || document.hidden) return;
    const notes = THEMES[this.act] || THEMES.city;
    const note = notes[this.beat % notes.length];
    const type = this.act === 'space' ? 'sine' : this.act === 'station' ? 'square' : 'triangle';
    this.tone(note, this.act === 'space' ? 0.18 : 0.11, type, this.beat % 4 === 0 ? 0.035 : 0.018);
    if (this.beat % 4 === 2) this.tone(note / 2, 0.06, 'square', 0.009, 0.03);
    if (this.act === 'station' && this.beat % 8 === 7) this.tone(880, 0.035, 'square', 0.012);
    this.beat += 1;
  }

  setAct(act) {
    this.act = act;
    this.beat = 0;
    const lead = act === 'city' ? [261.63, 329.63, 392] : act === 'space' ? [220, 440, 659.25] : [196, 233.08, 293.66];
    lead.forEach((note, i) => this.tone(note, 0.16, 'triangle', 0.035, i * 0.11));
  }

  gesture(kind) {
    const table = { left: 330, right: 392, up: 523, down: 220 };
    this.tone(table[kind], 0.07, 'sine', 0.035, 0, kind === 'down' ? -45 : 35);
  }

  hit() {
    this.tone(105, 0.28, 'sawtooth', 0.1, 0, -55);
    this.tone(68, 0.34, 'square', 0.06, 0.04, -20);
    this.noise(0.18, 0.035);
  }

  interlude(kind) {
    if (kind === 'climb') [220, 277.18, 329.63].forEach((n, i) => this.tone(n, 0.12, 'square', 0.028, i * 0.09));
    else [440, 554.37, 659.25].forEach((n, i) => this.tone(n, 0.2, 'sine', 0.024, i * 0.16));
  }

  dockClunk() {
    this.tone(72, 0.42, 'square', 0.11, 0, -28);
    this.noise(0.23, 0.06, 0.02);
    this.tone(784, 0.08, 'sine', 0.03, 0.24);
  }

  complete() {
    [392, 523, 659, 784].forEach((n, i) => this.tone(n, 0.22, 'triangle', 0.045, i * 0.1));
  }

  masterSwitch() {
    this.tone(92, 0.7, 'sawtooth', 0.09, 0, -48);
    this.noise(0.38, 0.07, 0.05);
    [261.63, 329.63, 392, 523.25].forEach((n, i) => this.tone(n, 0.5, 'sine', 0.04, 0.52 + i * 0.14));
  }

  finalCall() {
    if (!this.enabled) return;
    this.tone(880, 0.07, 'sine', 0.03, 0.85);
    this.tone(1100, 0.07, 'sine', 0.03, 0.98);
    if (!('speechSynthesis' in window) || !('SpeechSynthesisUtterance' in window)) return;
    window.speechSynthesis.cancel();
    const line = new SpeechSynthesisUtterance('Hello? Hello! They just stopped. The robots just stopped! Are you there? Thank you.');
    line.rate = 0.88;
    line.pitch = 0.92;
    line.volume = 0.76;
    window.setTimeout(() => {
      if (this.enabled) window.speechSynthesis.speak(line);
    }, 650);
  }

  toggle() {
    this.enabled = !this.enabled;
    if (!this.enabled && 'speechSynthesis' in window) window.speechSynthesis.cancel();
    return this.enabled;
  }
}
