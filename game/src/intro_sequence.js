export const PROLOGUE_STORAGE_KEY = 'nflt-prologue-v1-seen';

export const PROLOGUE_FRAMES = Object.freeze([
  Object.freeze({ id: 'theft', duration: 2400 }),
  Object.freeze({ id: 'wish', duration: 2500 }),
  Object.freeze({ id: 'variable', duration: 2500 }),
  Object.freeze({ id: 'cascade', duration: 2900 }),
  Object.freeze({ id: 'station', duration: 2800 }),
  Object.freeze({ id: 'rocket', duration: 2900 }),
]);

export const PROLOGUE_DURATION = PROLOGUE_FRAMES.reduce((total, frame) => total + frame.duration, 0);

export function frameIndexAt(elapsedMs) {
  const elapsed = Math.max(0, Number.isFinite(elapsedMs) ? elapsedMs : 0);
  let boundary = 0;
  for (let index = 0; index < PROLOGUE_FRAMES.length; index += 1) {
    boundary += PROLOGUE_FRAMES[index].duration;
    if (elapsed < boundary) return index;
  }
  return PROLOGUE_FRAMES.length - 1;
}

export function hasSeenPrologue(storage) {
  try { return storage?.getItem(PROLOGUE_STORAGE_KEY) === '1'; }
  catch { return false; }
}

export function markPrologueSeen(storage) {
  try { storage?.setItem(PROLOGUE_STORAGE_KEY, '1'); }
  catch { /* Storage is optional; the cinematic can replay next visit. */ }
}
