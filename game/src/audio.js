const SCORE = {
  city: {
    bpm: 116,
    bass: [55, 55, 65.41, 55, 73.42, 65.41, 49, 55],
    arp: [220, 261.63, 329.63, 392, 329.63, 261.63, 233.08, 196],
    chords: [[110, 130.81, 164.81], [98, 123.47, 146.83], [82.41, 110, 130.81], [98, 130.81, 164.81]],
  },
  space: {
    bpm: 94,
    bass: [55, 55, 73.42, 55, 65.41, 49, 73.42, 65.41],
    arp: [220, 329.63, 440, 493.88, 392, 329.63, 246.94, 293.66],
    chords: [[110, 146.83, 220], [98, 130.81, 196], [73.42, 110, 164.81], [82.41, 123.47, 196]],
  },
  station: {
    bpm: 108,
    bass: [49, 49, 55, 49, 65.41, 55, 43.65, 49],
    arp: [196, 233.08, 261.63, 311.13, 261.63, 233.08, 207.65, 174.61],
    chords: [[98, 116.54, 146.83], [87.31, 110, 130.81], [73.42, 98, 116.54], [82.41, 103.83, 130.81]],
  },
};

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

export class AudioEngine {
  constructor() {
    this.ctx = null;
    try { this.enabled = window.sessionStorage.getItem('nflt-muted') !== '1'; }
    catch { this.enabled = true; }
    this.act = 'city';
    this.paused = false;
    this.timer = 0;
    this.step = 0;
    this.nextNoteTime = 0;
    this.master = null;
    this.musicBus = null;
    this.ambienceBus = null;
    this.sfxBus = null;
    this.reverb = null;
    this.reverbGain = null;
    this.ambience = [];
    this.ambienceGain = null;
    this.noiseBuffers = new Map();
  }

  makeGain(value, destination) {
    const gain = this.ctx.createGain();
    gain.gain.value = value;
    gain.connect(destination);
    return gain;
  }

  buildGraph() {
    const limiter = this.ctx.createDynamicsCompressor();
    limiter.threshold.value = -11;
    limiter.knee.value = 12;
    limiter.ratio.value = 7;
    limiter.attack.value = 0.004;
    limiter.release.value = 0.24;
    limiter.connect(this.ctx.destination);

    this.master = this.makeGain(this.enabled ? 0.78 : 0.0001, limiter);
    this.musicBus = this.makeGain(0.55, this.master);
    this.ambienceBus = this.makeGain(0.34, this.master);
    this.sfxBus = this.makeGain(0.92, this.master);

    this.reverb = this.ctx.createConvolver();
    this.reverb.buffer = this.impulse(1.65, 2.8);
    this.reverbGain = this.makeGain(0.18, this.master);
    this.reverb.connect(this.reverbGain);
  }

  async start() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
      this.buildGraph();
    }
    if (this.ctx.state === 'suspended') await this.ctx.resume();
    this.startAmbience(this.act);
    this.nextNoteTime = this.ctx.currentTime + 0.04;
    if (!this.timer) this.timer = window.setInterval(() => this.schedule(), 45);
  }

  impulse(seconds, decay) {
    const length = Math.max(1, Math.floor(this.ctx.sampleRate * seconds));
    const buffer = this.ctx.createBuffer(2, length, this.ctx.sampleRate);
    let seed = 404;
    const random = () => {
      seed = (seed * 16807) % 2147483647;
      return seed / 2147483647;
    };
    for (let channel = 0; channel < 2; channel++) {
      const data = buffer.getChannelData(channel);
      for (let i = 0; i < length; i++) {
        const envelope = (1 - i / length) ** decay;
        data[i] = (random() * 2 - 1) * envelope;
      }
    }
    return buffer;
  }

  noiseBuffer(seconds = 1) {
    const key = seconds.toFixed(2);
    if (this.noiseBuffers.has(key)) return this.noiseBuffers.get(key);
    const length = Math.max(1, Math.floor(this.ctx.sampleRate * seconds));
    const buffer = this.ctx.createBuffer(1, length, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let last = 0;
    for (let i = 0; i < length; i++) {
      const white = Math.random() * 2 - 1;
      last = last * 0.94 + white * 0.06;
      data[i] = white * 0.72 + last * 0.28;
    }
    this.noiseBuffers.set(key, buffer);
    return buffer;
  }

  route(node, bus = this.sfxBus, reverb = 0) {
    node.connect(bus || this.ctx.destination);
    if (reverb > 0 && this.reverb) {
      const send = this.makeGain(reverb, this.reverb);
      node.connect(send);
    }
  }

  tone(frequency, duration = 0.08, type = 'square', volume = 0.025, when = 0, bend = 0, options = {}) {
    if (!this.enabled || !this.ctx) return;
    const at = options.absolute ? when : this.ctx.currentTime + when;
    const attack = Math.min(options.attack ?? 0.008, duration * 0.35);
    const release = Math.min(options.release ?? Math.max(0.03, duration * 0.55), duration - attack);
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();
    const pan = this.ctx.createStereoPanner ? this.ctx.createStereoPanner() : null;
    osc.type = type;
    osc.frequency.setValueAtTime(Math.max(20, frequency), at);
    if (bend) osc.frequency.exponentialRampToValueAtTime(Math.max(20, frequency + bend), at + duration);
    if (options.detune) osc.detune.value = options.detune;
    filter.type = options.filterType || 'lowpass';
    filter.frequency.setValueAtTime(options.cutoff || 7200, at);
    if (options.cutoffEnd) filter.frequency.exponentialRampToValueAtTime(Math.max(40, options.cutoffEnd), at + duration);
    filter.Q.value = options.q || 0.7;
    gain.gain.setValueAtTime(0.0001, at);
    gain.gain.exponentialRampToValueAtTime(Math.max(0.0002, volume), at + attack);
    gain.gain.setValueAtTime(Math.max(0.0002, volume * (options.sustain ?? 0.72)), Math.max(at + attack, at + duration - release));
    gain.gain.exponentialRampToValueAtTime(0.0001, at + duration);
    if (pan) {
      pan.pan.value = clamp(options.pan || 0, -1, 1);
      osc.connect(filter).connect(gain).connect(pan);
      this.route(pan, options.bus || this.sfxBus, options.reverb || 0);
    } else {
      osc.connect(filter).connect(gain);
      this.route(gain, options.bus || this.sfxBus, options.reverb || 0);
    }
    osc.start(at);
    osc.stop(at + duration + 0.04);
  }

  noise(duration = 0.16, volume = 0.04, when = 0, options = {}) {
    if (!this.enabled || !this.ctx) return;
    const at = options.absolute ? when : this.ctx.currentTime + when;
    const source = this.ctx.createBufferSource();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();
    const pan = this.ctx.createStereoPanner ? this.ctx.createStereoPanner() : null;
    source.buffer = this.noiseBuffer(Math.max(0.2, duration));
    filter.type = options.filterType || 'lowpass';
    filter.frequency.setValueAtTime(options.cutoff || 850, at);
    filter.Q.value = options.q || 0.7;
    const attack = Math.min(options.attack ?? 0.004, duration * 0.25);
    gain.gain.setValueAtTime(0.0001, at);
    gain.gain.exponentialRampToValueAtTime(Math.max(0.0002, volume), at + attack);
    gain.gain.exponentialRampToValueAtTime(0.0001, at + duration);
    if (pan) {
      pan.pan.value = clamp(options.pan || 0, -1, 1);
      source.connect(filter).connect(gain).connect(pan);
      this.route(pan, options.bus || this.sfxBus, options.reverb || 0);
    } else {
      source.connect(filter).connect(gain);
      this.route(gain, options.bus || this.sfxBus, options.reverb || 0);
    }
    source.start(at);
    source.stop(at + duration + 0.03);
  }

  kick(at, volume = 0.055) {
    this.tone(118, 0.19, 'sine', volume, at, -78, {
      absolute: true, attack: 0.002, release: 0.16, cutoff: 600, bus: this.musicBus,
    });
  }

  metal(at, volume = 0.018, pan = 0) {
    this.noise(0.055, volume, at, {
      absolute: true, filterType: 'bandpass', cutoff: 5200, q: 1.8, pan, bus: this.musicBus, reverb: 0.08,
    });
  }

  pad(chord, at, duration) {
    chord.forEach((frequency, index) => {
      this.tone(frequency, duration, index === 1 ? 'triangle' : 'sawtooth', 0.0085, at, 0, {
        absolute: true, attack: 0.36, release: 0.72, cutoff: this.act === 'space' ? 1250 : 900,
        pan: (index - 1) * 0.5, detune: index === 2 ? 5 : -4, bus: this.musicBus, reverb: 0.28,
      });
    });
  }

  scheduleStep(at, step) {
    const score = SCORE[this.act] || SCORE.city;
    const beat = step % 16;
    const bar = Math.floor(step / 16);
    const eighth = Math.floor(beat / 2);

    if (beat === 0 || beat === 8) this.kick(at, this.act === 'space' ? 0.036 : 0.052);
    if (beat === 4 || beat === 12) this.noise(0.11, 0.017, at, {
      absolute: true, filterType: 'bandpass', cutoff: this.act === 'station' ? 1700 : 1200,
      q: 0.9, bus: this.musicBus, reverb: 0.08,
    });
    if (beat % 2 === 1) this.metal(at, this.act === 'space' ? 0.008 : 0.012, beat % 4 === 1 ? -0.36 : 0.36);

    if (beat % 4 === 0) {
      const bass = score.bass[(bar * 4 + beat / 4) % score.bass.length];
      this.tone(bass, this.act === 'space' ? 0.72 : 0.42, 'sawtooth', 0.028, at, -4, {
        absolute: true, attack: 0.012, release: 0.18, cutoff: 360, cutoffEnd: 120,
        bus: this.musicBus, reverb: 0.04,
      });
    }

    if (beat % 2 === 0) {
      const note = score.arp[(eighth + bar * 3) % score.arp.length];
      const octave = this.act === 'space' && beat % 8 === 6 ? 2 : 1;
      this.tone(note * octave, this.act === 'space' ? 0.26 : 0.13, this.act === 'station' ? 'square' : 'triangle',
        this.act === 'space' ? 0.012 : 0.016, at, this.act === 'space' ? 5 : 0, {
          absolute: true, attack: 0.006, release: 0.09, cutoff: this.act === 'station' ? 1450 : 2600,
          pan: Math.sin(step * 1.7) * 0.46, bus: this.musicBus, reverb: this.act === 'space' ? 0.32 : 0.12,
        });
    }

    if (beat === 0) {
      const chord = score.chords[bar % score.chords.length];
      const sixteenth = 60 / score.bpm / 4;
      this.pad(chord, at, sixteenth * 15.5);
    }

    if (this.act === 'city' && (beat === 0 || beat === 10)) {
      this.tone(392, 0.7, 'sine', 0.011, at + 0.03, -135, {
        absolute: true, attack: 0.08, release: 0.3, cutoff: 1100, pan: beat ? 0.55 : -0.55,
        bus: this.musicBus, reverb: 0.22,
      });
    }
    if (this.act === 'station' && beat === 15) {
      this.tone(880, 0.065, 'square', 0.014, at, -110, {
        absolute: true, cutoff: 1800, bus: this.musicBus, reverb: 0.08,
      });
    }
  }

  schedule() {
    if (!this.enabled || this.paused || document.hidden || !this.ctx || this.ctx.state !== 'running' ||
        this.act === 'results' || this.act === 'silence') return;
    const score = SCORE[this.act] || SCORE.city;
    const sixteenth = 60 / score.bpm / 4;
    if (this.nextNoteTime < this.ctx.currentTime - 0.5) this.nextNoteTime = this.ctx.currentTime + 0.03;
    while (this.nextNoteTime < this.ctx.currentTime + 0.18) {
      this.scheduleStep(this.nextNoteTime, this.step);
      this.nextNoteTime += sixteenth;
      this.step += 1;
    }
  }

  ambienceOsc(frequency, type, volume, filterFrequency, destination, detune = 0) {
    const osc = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();
    osc.type = type;
    osc.frequency.value = frequency;
    osc.detune.value = detune;
    filter.type = 'lowpass';
    filter.frequency.value = filterFrequency;
    gain.gain.value = volume;
    osc.connect(filter).connect(gain).connect(destination);
    osc.start();
    this.ambience.push(osc);
    return { osc, gain, filter };
  }

  startAmbience(act) {
    if (!this.ctx || !this.ambienceBus || this.act === 'silence') return;
    this.stopAmbience(0.32);
    const at = this.ctx.currentTime;
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.0001, at);
    gain.gain.exponentialRampToValueAtTime(1, at + 0.75);
    gain.connect(this.ambienceBus);
    this.ambienceGain = gain;

    const bed = this.ctx.createBufferSource();
    const bedFilter = this.ctx.createBiquadFilter();
    const bedGain = this.ctx.createGain();
    bed.buffer = this.noiseBuffer(2.1);
    bed.loop = true;
    bedFilter.type = act === 'space' ? 'lowpass' : 'bandpass';
    bedFilter.frequency.value = act === 'city' ? 330 : act === 'space' ? 120 : 560;
    bedFilter.Q.value = act === 'station' ? 1.8 : 0.7;
    bedGain.gain.value = act === 'space' ? 0.035 : 0.052;
    bed.connect(bedFilter).connect(bedGain).connect(gain);
    bed.start();
    this.ambience.push(bed);

    if (act === 'city') {
      const industrial = this.ambienceOsc(55, 'sawtooth', 0.045, 240, gain, -7);
      const siren = this.ambienceOsc(196, 'sine', 0.014, 920, gain);
      const lfo = this.ctx.createOscillator();
      const depth = this.ctx.createGain();
      lfo.frequency.value = 0.19;
      depth.gain.value = 82;
      lfo.connect(depth).connect(siren.osc.frequency);
      lfo.start();
      this.ambience.push(lfo);
      industrial.gain.gain.setValueAtTime(0.035, at);
    } else if (act === 'space') {
      const engine = this.ambienceOsc(43.65, 'sawtooth', 0.055, 260, gain, -9);
      this.ambienceOsc(87.31, 'triangle', 0.026, 420, gain, 5);
      const lfo = this.ctx.createOscillator();
      const depth = this.ctx.createGain();
      lfo.frequency.value = 0.72;
      depth.gain.value = 7;
      lfo.connect(depth).connect(engine.osc.frequency);
      lfo.start();
      this.ambience.push(lfo);
    } else {
      this.ambienceOsc(49, 'sawtooth', 0.046, 210, gain, -5);
      const electric = this.ambienceOsc(293.66, 'triangle', 0.012, 880, gain, 7);
      const lfo = this.ctx.createOscillator();
      const depth = this.ctx.createGain();
      lfo.frequency.value = 3.4;
      depth.gain.value = 0.008;
      lfo.connect(depth).connect(electric.gain.gain);
      lfo.start();
      this.ambience.push(lfo);
    }
  }

  stopAmbience(fade = 0.45) {
    if (!this.ctx || !this.ambienceGain) return;
    const gain = this.ambienceGain;
    const nodes = this.ambience.splice(0);
    const at = this.ctx.currentTime;
    gain.gain.cancelScheduledValues(at);
    gain.gain.setValueAtTime(Math.max(0.0001, gain.gain.value), at);
    gain.gain.exponentialRampToValueAtTime(0.0001, at + fade);
    window.setTimeout(() => {
      nodes.forEach((node) => { try { node.stop(); } catch { /* Already stopped. */ } });
      try { gain.disconnect(); } catch { /* Already disconnected. */ }
    }, (fade + 0.08) * 1000);
    this.ambienceGain = null;
  }

  setAct(act) {
    this.act = act;
    this.step = 0;
    if (this.ctx) {
      this.nextNoteTime = this.ctx.currentTime + 0.06;
      this.startAmbience(act);
    }
    const lead = act === 'city' ? [220, 164.81, 110] : act === 'space' ? [440, 329.63, 220] : [261.63, 196, 130.81];
    lead.forEach((note, index) => this.tone(note, 0.22, 'triangle', 0.03, index * 0.105, -6, {
      cutoff: 1800, reverb: 0.2, pan: (index - 1) * 0.35,
    }));
  }

  gesture(kind) {
    const table = { left: 330, right: 392, up: 523, down: 220 };
    const pan = kind === 'left' ? -0.65 : kind === 'right' ? 0.65 : 0;
    this.tone(table[kind], 0.075, 'sine', 0.026, 0, kind === 'down' ? -70 : 48, {
      cutoff: 2400, pan, reverb: 0.08,
    });
    this.noise(0.06, 0.012, 0, { filterType: 'bandpass', cutoff: 1800, q: 1.2, pan });
  }

  hit() {
    this.tone(112, 0.34, 'sawtooth', 0.11, 0, -72, { cutoff: 720, cutoffEnd: 95, reverb: 0.08 });
    this.tone(61, 0.52, 'sine', 0.12, 0.015, -28, { cutoff: 260 });
    this.noise(0.28, 0.075, 0, { cutoff: 1200, reverb: 0.12 });
    this.tone(1260, 0.22, 'triangle', 0.026, 0.04, -480, { cutoff: 2600, reverb: 0.32, pan: 0.35 });
  }

  lockOn() {
    [740, 880, 1046].forEach((note, index) => {
      this.tone(note, 0.115, 'square', 0.04, index * 0.19, 20, { cutoff: 2500, pan: index % 2 ? 0.42 : -0.42 });
      this.tone(note / 2, 0.16, 'sawtooth', 0.016, index * 0.19, -12, { cutoff: 850 });
    });
  }

  lockFire() {
    this.tone(980, 0.22, 'sawtooth', 0.064, 0, -825, { cutoff: 3200, cutoffEnd: 280, pan: -0.55, reverb: 0.12 });
    this.tone(840, 0.24, 'sawtooth', 0.056, 0.055, -700, { cutoff: 2900, cutoffEnd: 240, pan: 0.55, reverb: 0.12 });
    this.noise(0.16, 0.032, 0.03, { filterType: 'bandpass', cutoff: 1900, q: 1.6 });
  }

  netGate() {
    [196, 293.66, 392, 587.33].forEach((note, index) => this.tone(note, 0.28, 'square', 0.034, index * 0.26, 35, {
      cutoff: 1900, reverb: 0.24, pan: index % 2 ? 0.5 : -0.5,
    }));
    this.noise(1.05, 0.018, 0, { filterType: 'bandpass', cutoff: 2800, q: 3.2, reverb: 0.18 });
  }

  netCleared() {
    [261.63, 392, 523.25, 783.99].forEach((note, index) => this.tone(note, 0.36, 'sine', 0.04, index * 0.11, 8, {
      cutoff: 3400, reverb: 0.38, pan: (index - 1.5) * 0.26,
    }));
  }

  override() {
    this.noise(0.19, 0.04, 0, { filterType: 'bandpass', cutoff: 620, q: 2.2 });
    this.tone(96, 0.28, 'square', 0.055, 0, -26, { cutoff: 480 });
    [220, 330, 440, 659.25].forEach((note, index) => this.tone(note, 0.34, 'triangle', 0.037, 0.13 + index * 0.11, 5, {
      cutoff: 2500, reverb: 0.28, pan: (index - 1.5) * 0.28,
    }));
  }

  switchReady() {
    this.tone(78, 0.58, 'sawtooth', 0.05, 0, 54, { cutoff: 520, cutoffEnd: 1100, reverb: 0.14 });
    this.noise(0.46, 0.024, 0.04, { filterType: 'bandpass', cutoff: 740, q: 2 });
    [165, 131, 98].forEach((note, index) => this.tone(note, 0.22, 'square', 0.03, 0.18 + index * 0.2, -8, { cutoff: 900 }));
  }

  interlude(kind) {
    if (kind === 'climb') {
      [110, 146.83, 196, 220].forEach((note, index) => {
        this.kick(this.ctx.currentTime + index * 0.12, 0.04);
        this.tone(note, 0.18, 'square', 0.027, index * 0.12, 18, { cutoff: 1050, pan: index % 2 ? 0.34 : -0.34 });
      });
    } else {
      this.noise(1.25, 0.022, 0, { filterType: 'bandpass', cutoff: 420, q: 1.4, reverb: 0.2 });
      [220, 329.63, 440, 659.25].forEach((note, index) => this.tone(note, 0.36, 'sine', 0.027, index * 0.17, 8, {
        cutoff: 2100, reverb: 0.42, pan: (index - 1.5) * 0.32,
      }));
    }
  }

  launch() {
    this.tone(38, 3.1, 'sawtooth', 0.12, 0, 42, { attack: 0.42, release: 0.8, cutoff: 320, cutoffEnd: 620, reverb: 0.08 });
    this.tone(57, 3.0, 'triangle', 0.105, 0.06, 51, { attack: 0.3, release: 0.72, cutoff: 460 });
    for (let i = 0; i < 10; i++) this.noise(0.62, 0.044 + i * 0.004, i * 0.29, {
      cutoff: 340 + i * 48, pan: Math.sin(i * 2.1) * 0.42, reverb: 0.06,
    });
    [98, 130.81, 196].forEach((note, index) => this.tone(note, 1.5, 'sawtooth', 0.018, 1.1 + index * 0.18, 42, {
      attack: 0.18, release: 0.7, cutoff: 780, reverb: 0.2,
    }));
  }

  prologueTransition() {
    if (!this.ctx || !this.enabled) return;
    this.noise(0.34, 0.052, 0, { filterType: 'bandpass', cutoff: 2100, q: 2.8, reverb: 0.2 });
    this.tone(880, 0.18, 'square', 0.038, 0, -520, { cutoff: 2500, cutoffEnd: 430, pan: -0.45 });
    this.tone(660, 0.2, 'square', 0.035, 0.08, -410, { cutoff: 2200, cutoffEnd: 360, pan: 0.45 });
    this.tone(55, 0.72, 'sawtooth', 0.075, 0.02, 42, { attack: 0.02, release: 0.42, cutoff: 520, cutoffEnd: 980 });
    [110, 164.81, 220, 329.63].forEach((note, index) => this.tone(note, 0.5, 'triangle', 0.035, 0.24 + index * 0.11, 8, {
      attack: 0.018, release: 0.26, cutoff: 2200, reverb: 0.28, pan: (index - 1.5) * 0.26,
    }));
  }

  dockClunk() {
    this.tone(69, 0.48, 'square', 0.12, 0, -31, { cutoff: 620, reverb: 0.2 });
    this.noise(0.26, 0.075, 0.018, { filterType: 'bandpass', cutoff: 780, q: 1.5, reverb: 0.24 });
    this.tone(1568, 0.12, 'sine', 0.035, 0.21, -390, { cutoff: 2900, reverb: 0.34 });
    this.tone(784, 0.22, 'sine', 0.025, 0.36, 10, { reverb: 0.3 });
  }

  complete() {
    [261.63, 392, 523.25, 659.25, 783.99].forEach((note, index) => this.tone(note, 0.38, 'triangle', 0.038, index * 0.09, 6, {
      cutoff: 2900, reverb: 0.32, pan: (index - 2) * 0.24,
    }));
  }

  results(grade) {
    this.act = 'results';
    this.stopAmbience(0.8);
    this.tone(92, 0.3, 'square', 0.052, 0, -25, { cutoff: 720 });
    this.noise(0.16, 0.026, 0.02, { filterType: 'bandpass', cutoff: 1050, q: 1.4 });
    const notes = grade === 'S' ? [261.63, 392, 523.25, 659.25, 783.99]
      : grade === 'D' ? [261.63, 220, 196]
        : [220, 329.63, 392, 523.25];
    notes.forEach((note, index) => this.tone(note, 0.48, 'triangle', 0.043, 0.17 + index * 0.12, grade === 'D' ? -14 : 8, {
      cutoff: 2600, reverb: 0.36, pan: (index - (notes.length - 1) / 2) * 0.22,
    }));
  }

  masterSwitch() {
    this.act = 'silence';
    this.stopAmbience(1.1);
    this.tone(94, 1.15, 'sawtooth', 0.105, 0, -64, { attack: 0.018, release: 0.75, cutoff: 1100, cutoffEnd: 90, reverb: 0.16 });
    this.tone(47, 1.5, 'sine', 0.13, 0.04, -25, { attack: 0.012, release: 1.1, cutoff: 240 });
    this.noise(0.72, 0.078, 0.04, { cutoff: 980, reverb: 0.2 });
    this.noise(1.35, 0.025, 0.23, { filterType: 'bandpass', cutoff: 2200, q: 2.4, reverb: 0.38 });
  }

  finalCall(lineText = 'The machines stopped. We are still here. Thank you.') {
    if (!this.enabled) return;
    this.tone(880, 0.08, 'sine', 0.027, 1.42, 0, { reverb: 0.24 });
    this.tone(1100, 0.08, 'sine', 0.027, 1.56, 0, { reverb: 0.24 });
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
    if (this.ctx) void (paused ? this.ctx.suspend() : this.ctx.resume().then(() => {
      this.nextNoteTime = this.ctx.currentTime + 0.04;
    }));
    if ('speechSynthesis' in window) {
      if (paused) window.speechSynthesis.pause();
      else window.speechSynthesis.resume();
    }
  }

  toggle() {
    this.enabled = !this.enabled;
    try { window.sessionStorage.setItem('nflt-muted', this.enabled ? '0' : '1'); }
    catch { /* Storage is optional; sound still works for this run. */ }
    if (this.master && this.ctx) {
      const at = this.ctx.currentTime;
      this.master.gain.cancelScheduledValues(at);
      this.master.gain.setValueAtTime(Math.max(0.0001, this.master.gain.value), at);
      this.master.gain.exponentialRampToValueAtTime(this.enabled ? 0.78 : 0.0001, at + 0.08);
      if (this.enabled) {
        this.nextNoteTime = at + 0.06;
        if (!this.ambienceGain && this.act !== 'silence' && this.act !== 'results') this.startAmbience(this.act);
      }
    }
    if (!this.enabled && 'speechSynthesis' in window) window.speechSynthesis.cancel();
    return this.enabled;
  }
}
