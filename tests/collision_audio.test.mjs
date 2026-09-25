import test from 'node:test';
import assert from 'node:assert/strict';
import { AudioEngine } from '../game/src/audio.js';

const HAZARDS = {
  city: ['cone', 'toaster', 'mower', 'chair', 'lockOn'],
  space: ['debris', 'drone', 'wreckage', 'netGate', 'interceptorLaser'],
  station: ['security', 'laserLow', 'laserHigh', 'lockOn'],
};

function captureHit(type, act, side = 0) {
  const audio = new AudioEngine();
  const voices = [];
  audio.tone = (...args) => voices.push({ source: 'tone', args });
  audio.noise = (...args) => voices.push({ source: 'noise', args });
  audio.hit(type, act, side);
  return voices;
}

test('every obstacle and strike has a distinct collision signature in its act', () => {
  for (const [act, hazards] of Object.entries(HAZARDS)) {
    const signatures = new Set();
    for (const hazard of hazards) {
      const voices = captureHit(hazard, act);
      assert.ok(voices.length >= 5, `${act}/${hazard} should include detail beyond the common thump`);
      assert.equal(voices[0].source, 'tone');
      assert.equal(voices[1].source, 'noise');
      const detail = JSON.stringify(voices.slice(2));
      assert.ok(!signatures.has(detail), `${act}/${hazard} reuses another obstacle's signature`);
      signatures.add(detail);
      for (const { source, args } of voices) {
        const volume = source === 'tone' ? args[3] : args[1];
        const options = args.at(-1);
        assert.ok(Number.isFinite(volume) && volume > 0, `${act}/${hazard} has invalid gain`);
        assert.ok(Number.isFinite(options.pan) && Math.abs(options.pan) <= 1, `${act}/${hazard} has invalid pan`);
      }
    }
  }
});

test('collision direction places the sound on the struck side', () => {
  const left = captureHit('drone', 'space', -2);
  const right = captureHit('drone', 'space', 2);
  assert.ok(left[0].args.at(-1).pan < 0);
  assert.ok(right[0].args.at(-1).pan > 0);
  assert.equal(left[0].args[0], right[0].args[0]);
});

test('unrecognised hazards retain safe, audible damage feedback', () => {
  const voices = captureHit('newHazard', 'city');
  assert.equal(voices.length, 3);
  assert.equal(voices.at(-1).source, 'noise');
});
