export const PROLOGUE_STORAGE_KEY = 'nflt-breakroom-v2-seen';

// Milliseconds: captions, acting, camera, and sound share one story clock.
export const PROLOGUE_BEATS = Object.freeze([
  Object.freeze({ id: 'arrival', at: 0, speaker: '', line: '', cue: 'room' }),
  Object.freeze({ id: 'starving', at: 1700, speaker: 'YOU', line: 'Man, I am staaaarving!', cue: 'fridge' }),
  Object.freeze({ id: 'missing', at: 4450, speaker: 'YOU', line: 'Wait… my lunch is gone?', cue: 'empty' }),
  Object.freeze({ id: 'wish', at: 6800, speaker: 'YOU', line: 'I wish no one could steal my lunch again!!', cue: 'wish' }),
  Object.freeze({ id: 'exit', at: 9950, speaker: '', line: '', cue: 'steps' }),
  Object.freeze({ id: 'solution', at: 12100, speaker: 'COWORKER', line: 'I know exactly how to stop that.', cue: 'cup' }),
  Object.freeze({ id: 'red', at: 14800, speaker: 'COWORKER', line: 'We’ll destroy everyone. Then it can never happen again.', cue: 'threat' }),
  Object.freeze({ id: 'evacuate', at: 17800, speaker: 'CITY CONTINUITY', line: 'CODE RED. The manual kill switch is on Station 404. Run to the rocket.', cue: 'alarm' }),
]);

export const PROLOGUE_DURATION = 20_500;

export function beatIndexAt(elapsedMs) {
  const elapsed = Math.max(0, Number.isFinite(elapsedMs) ? elapsedMs : 0);
  for (let index = PROLOGUE_BEATS.length - 1; index >= 0; index -= 1) {
    if (elapsed >= PROLOGUE_BEATS[index].at) return index;
  }
  return 0;
}

export function hasSeenPrologue(storage) {
  try { return storage?.getItem(PROLOGUE_STORAGE_KEY) === '1'; }
  catch { return false; }
}

export function markPrologueSeen(storage) {
  try { storage?.setItem(PROLOGUE_STORAGE_KEY, '1'); }
  catch { /* Storage is optional; the cinematic can replay next visit. */ }
}
