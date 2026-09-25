import assert from 'node:assert/strict';
import test from 'node:test';
import {
  PROLOGUE_DURATION,
  PROLOGUE_BEATS,
  PROLOGUE_STORAGE_KEY,
  beatIndexAt,
  hasSeenPrologue,
  markPrologueSeen,
} from '../game/src/intro_sequence.js';

test('the breakroom scene tells its complete story on a single clock', () => {
  assert.equal(PROLOGUE_DURATION, 20_500);
  assert.equal(PROLOGUE_BEATS.length, 8);
  assert.ok(PROLOGUE_BEATS.at(-1).at < PROLOGUE_DURATION);
  assert.match(PROLOGUE_BEATS[3].line, /steal my lunch/);
  assert.match(PROLOGUE_BEATS[6].line, /destroy everyone/);
  assert.match(PROLOGUE_BEATS[7].line, /Station 404/);
});

test('beatIndexAt follows every cue boundary and clamps the ending', () => {
  PROLOGUE_BEATS.forEach(({ at }, index) => assert.equal(beatIndexAt(at), index));
  assert.equal(beatIndexAt(-20), 0);
  assert.equal(beatIndexAt(99_000), PROLOGUE_BEATS.length - 1);
  assert.equal(beatIndexAt(Number.NaN), 0);
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
