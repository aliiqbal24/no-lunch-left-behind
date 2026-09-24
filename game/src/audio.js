const THEMES = {
  city: [110, 110, 146.83, 110, 98, 110, 130.81, 82.41],
  space: [164.81, 0, 220, 0, 146.83, 0, 246.94, 0],
  station: [130.81, 146.83, 130.81, 98, 130.81, 146.83, 164.81, 98],
};

export class AudioEngine {
  constructor() {
    this.ctx = null;
    try { this.enabled = window.sessionStorage.getItem('nflt-muted') !== '1'; }
    catch { this.enabled = true; }
    this.beat = 0;
    this.timer = 0;
    this.act = 'city';
    this.paused = false;
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
    if (!this.enabled || this.paused || document.hidden || this.act === 'results' || this.act === 'silence') return;
    const notes = THEMES[this.act] || THEMES.city;
    const note = notes[this.beat % notes.length];
    const type = this.act === 'space' ? 'sine' : this.act === 'station' ? 'square' : 'triangle';
    if (note) this.tone(note, this.act === 'space' ? 0.15 : 0.1, type, this.beat % 4 === 0 ? 0.032 : 0.019);
    if (this.act === 'city' && this.beat % 8 === 0) {
      this.tone(415, 0.42, 'sine', 0.018, 0.04, -105);
      this.noise(0.13, 0.014, 0.13);
    }
    if (this.act === 'space' && this.beat % 4 === 2) this.tone(1046, 0.045, 'sine', 0.013);
    if (this.act === 'station' && this.beat % 8 === 7) {
      this.tone(880, 0.1, 'square', 0.024);
      this.tone(659.25, 0.1, 'square', 0.02, 0.1);
    }
    this.beat += 1;
  }

  setAct(act) {
    this.act = act;
    this.beat = 0;
    const lead = act === 'city' ? [220, 164.81, 110] : act === 'space' ? [440, 329.63, 220] : [261.63, 196, 130.81];
    lead.forEach((note, i) => this.tone(note, 0.17, 'triangle', 0.028, i * 0.1));
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

  lockOn() {
    this.tone(740, 0.1, 'square', 0.038);
    this.tone(880, 0.1, 'square', 0.038, 0.19);
    this.tone(1046, 0.16, 'square', 0.043, 0.38);
  }

  lockFire() {
    this.tone(78, 0.28, 'sawtooth', 0.055, 0, -35);
    this.noise(0.14, 0.035);
  }

  netGate() {
    [392, 494, 587, 784].forEach((note, index) => this.tone(note, 0.12, 'square', 0.03, index * 0.32));
  }

  netCleared() {
    [330, 440, 659].forEach((note, index) => this.tone(note, 0.22, 'sine', 0.04, index * 0.12));
  }

  override() {
    this.tone(220, 0.11, 'square', 0.055);
    this.tone(330, 0.12, 'triangle', 0.05, 0.13);
    this.tone(440, 0.32, 'sine', 0.055, 0.3);
  }

  switchReady() {
    this.tone(165, 0.15, 'square', 0.038);
    this.tone(131, 0.26, 'square', 0.038, 0.2);
  }

  interlude(kind) {
    if (kind === 'climb') [220, 277.18, 329.63].forEach((n, i) => this.tone(n, 0.12, 'square', 0.028, i * 0.09));
    else [440, 554.37, 659.25].forEach((n, i) => this.tone(n, 0.2, 'sine', 0.024, i * 0.16));
  }

  launch() {
    this.tone(62, 2.7, 'sawtooth', 0.085, 0, 34);
    this.tone(41, 2.9, 'triangle', 0.09, 0.08, 48);
    for (let i = 0; i < 7; i++) this.noise(0.55, 0.045 + i * 0.003, i * 0.36);
  }

  dockClunk() {
    this.tone(72, 0.42, 'square', 0.11, 0, -28);
    this.noise(0.23, 0.06, 0.02);
    this.tone(784, 0.08, 'sine', 0.03, 0.24);
  }

  complete() {
    [392, 523, 659, 784].forEach((n, i) => this.tone(n, 0.22, 'triangle', 0.045, i * 0.1));
  }

  results(grade) {
    this.act = 'results';
    this.tone(92, 0.22, 'square', 0.055, 0, -25);
    this.noise(0.12, 0.028, 0.02);
    const notes = grade === 'S' ? [392, 523.25, 659.25, 783.99]
      : grade === 'D' ? [261.63, 220, 196]
        : [329.63, 392, 523.25];
    notes.forEach((note, index) => this.tone(note, 0.28, 'triangle', 0.036, 0.16 + index * 0.1));
  }

  masterSwitch() {
    this.act = 'silence';
    this.tone(92, 0.7, 'sawtooth', 0.09, 0, -48);
    this.noise(0.38, 0.07, 0.05);
  }

  finalCall(lineText = 'The machines stopped. We are still here. Thank you.') {
    if (!this.enabled) return;
    this.tone(880, 0.07, 'sine', 0.03, 1.42);
    this.tone(1100, 0.07, 'sine', 0.03, 1.55);
    if (!('speechSynthesis' in window) || !('SpeechSynthesisUtterance' in window)) return;
    window.speechSynthesis.cancel();
    const line = new SpeechSynthesisUtterance(lineText);
    line.rate = 0.88;
    line.pitch = 0.92;
    line.volume = 0.76;
    window.setTimeout(() => {
      if (this.enabled) window.speechSynthesis.speak(line);
    }, 1550);
  }

  setPaused(paused) {
    this.paused = paused;
    if (this.ctx) void (paused ? this.ctx.suspend() : this.ctx.resume());
    if ('speechSynthesis' in window) {
      if (paused) window.speechSynthesis.pause();
      else window.speechSynthesis.resume();
    }
  }

  toggle() {
    this.enabled = !this.enabled;
    try { window.sessionStorage.setItem('nflt-muted', this.enabled ? '0' : '1'); }
    catch { /* Storage is optional; sound still works for this run. */ }
    if (!this.enabled && 'speechSynthesis' in window) window.speechSynthesis.cancel();
    return this.enabled;
  }
}
