import test from 'node:test';
import assert from 'node:assert/strict';
import { finaleResponse, LANE_CHALLENGES, LANE_CHALLENGE_SECONDS, SPACE_NETS, laneForX } from '../game/src/mission_cues.js';

test('three two-second lane calls in each ground act cover every lane without overlap', () => {
  assert.equal(LANE_CHALLENGE_SECONDS, 2);
  assert.equal(LANE_CHALLENGES.space, undefined);
  for (const act of ['city', 'station']) {
    const cues = LANE_CHALLENGES[act];
    assert.deepEqual(cues.map(cue => cue.lane).sort(), [-1, 0, 1]);
    assert.ok(cues[0].startAt > 4);
    assert.ok(cues.at(-1).startAt + LANE_CHALLENGE_SECONDS < 25);
    for (let i = 1; i < cues.length; i++) {
      assert.ok(cues[i].startAt - cues[i - 1].startAt > LANE_CHALLENGE_SECONDS);
    }
  }
  assert.equal(laneForX(2.2), -1);
  assert.equal(laneForX(0), 0);
  assert.equal(laneForX(-2.2), 1);
});

test('two orbital nets cross Space, including one at the opening', () => {
  assert.equal(SPACE_NETS.length, 2);
  assert.ok(SPACE_NETS[0].announceAt < 2);
  assert.ok(SPACE_NETS[0].impactAt < 5);
  assert.ok(SPACE_NETS[1].announceAt > SPACE_NETS[0].impactAt + 10);
  assert.ok(SPACE_NETS[1].impactAt < 25);
});

test('final call acknowledges the run without changing its ending action', () => {
  assert.equal(finaleResponse(70, 5_600_000_000).kind, 'strong');
  assert.equal(finaleResponse(49, 3_920_000_000).kind, 'fragile');
  assert.equal(finaleResponse(0, 256).kind, 'last');
  for (const response of [finaleResponse(70, 5_600_000_000), finaleResponse(30, 2_400_000_000), finaleResponse(0, 256)]) {
    assert.equal(response.lines.length, 5);
    assert.equal(response.lines[0][0], 0);
    assert.equal(response.lines[4][0], 6.1);
    assert.match(response.spoken, /machines stopped/i);
  }
});
