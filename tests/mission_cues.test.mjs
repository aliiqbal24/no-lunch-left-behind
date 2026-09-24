import test from 'node:test';
import assert from 'node:assert/strict';
import { finaleResponse, LOCK_START_SECONDS, LOCK_WARNING_SECONDS, OVERRIDE_RANGE, SPACE_NET } from '../game/src/mission_cues.js';

test('the first City strike follows the initial obstacle lesson and clears before the cut-off', () => {
  assert.ok(LOCK_START_SECONDS.city > 10);
  assert.ok(LOCK_START_SECONDS.city + LOCK_WARNING_SECONDS < 14);
  assert.ok(OVERRIDE_RANGE.ahead + OVERRIDE_RANGE.behind >= 40);
  assert.ok(SPACE_NET.impactAt - SPACE_NET.announceAt >= 3);
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
