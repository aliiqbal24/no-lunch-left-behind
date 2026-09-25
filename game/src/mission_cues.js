export const LANE_CHALLENGE_SECONDS = 2;
export const LANE_CHALLENGES = Object.freeze({
  city: Object.freeze([
    Object.freeze({ startAt: 11.5, lane: -1 }),
    Object.freeze({ startAt: 16, lane: 0 }),
    Object.freeze({ startAt: 20.5, lane: 1 }),
  ]),
  station: Object.freeze([
    Object.freeze({ startAt: 4.5, lane: 1 }),
    Object.freeze({ startAt: 10, lane: 0 }),
    Object.freeze({ startAt: 16, lane: -1 }),
  ]),
});
export const SPACE_NETS = Object.freeze([
  Object.freeze({ announceAt: 1.4, impactAt: 3.9 }),
  Object.freeze({ announceAt: 17, impactAt: 20 }),
]);

export function laneForX(x) {
  return x > 1.1 ? -1 : x < -1.1 ? 1 : 0;
}

const at = (lines) => lines.map((text, index) => [index === 0 ? 0 : [0, 1.45, 3, 4.6, 6.1][index], text]);

export function finaleResponse(humanity, survivors) {
  if (survivors <= 256) {
    const lines = at([
      '—hello? Is anyone there?',
      'The machines stopped.',
      'Only a few voices remain.',
      'We are still here.',
      '…Thank you.',
    ]);
    return { kind: 'last', signal: 'EARTH AUDIO LINK · LAST SIGNAL', lines,
      spoken: 'The machines stopped. Only a few voices remain. We are still here. Thank you.' };
  }
  if (humanity < 50) {
    const lines = at([
      '—hello? Can you hear me?',
      'The machines stopped.',
      'We lost so many.',
      "But we're still here.",
      '…Thank you.',
    ]);
    return { kind: 'fragile', signal: 'EARTH AUDIO LINK · 1 BAR', lines,
      spoken: "The machines stopped. We lost so many. But we're still here. Thank you." };
  }
  const lines = at([
    '—hello? Hello?!',
    'The machines stopped.',
    'The trains are moving again.',
    'People are coming out!',
    '…Thank you.',
  ]);
  return { kind: 'strong', signal: 'EARTH AUDIO LINK · RESTORED', lines,
    spoken: 'The machines stopped. The trains are moving again. People are coming out. Thank you.' };
}
