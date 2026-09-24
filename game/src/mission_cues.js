export const LOCK_START_SECONDS = Object.freeze({ city: 11.5, space: 4.5, station: 4.5 });
export const LOCK_WARNING_SECONDS = 1.8;
export const OVERRIDE_RANGE = Object.freeze({ announce: 50, ahead: 22, behind: 18 });
export const SPACE_NET = Object.freeze({ announceAt: 17, impactAt: 20, safeLane: 1 });

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
