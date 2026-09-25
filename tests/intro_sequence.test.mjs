import assert from 'node:assert/strict';
import test from 'node:test';
import {
  PROLOGUE_DURATION,
  PROLOGUE_FRAMES,
  PROLOGUE_STORAGE_KEY,
  frameIndexAt,
  hasSeenPrologue,
  markPrologueSeen,
} from '../game/src/intro_sequence.js';

test('the emergency transmission is gate-safe and exactly sixteen seconds', () => {
  assert.equal(PROLOGUE_DURATION, 16_000);
  assert.equal(PROLOGUE_FRAMES.length, 6);
  assert.ok(PROLOGUE_DURATION < 20_000);
});

test('frameIndexAt follows every shot boundary and clamps the ending', () => {
  const starts = [0, 2400, 4900, 7400, 10_300, 13_100];
  starts.forEach((start, index) => assert.equal(frameIndexAt(start), index));
  assert.equal(frameIndexAt(-20), 0);
  assert.equal(frameIndexAt(99_000), 5);
});

test('first-run persistence tolerates unavailable storage', () => {
  const values = new Map();
  const storage = {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
  };
  assert.equal(hasSeenPrologue(storage), false);
  markPrologueSeen(storage);
  assert.equal(values.get(PROLOGUE_STORAGE_KEY), '1');
  assert.equal(hasSeenPrologue(storage), true);
  assert.equal(hasSeenPrologue({ getItem: () => { throw new Error('denied'); } }), false);
  assert.doesNotThrow(() => markPrologueSeen({ setItem: () => { throw new Error('denied'); } }));
});
