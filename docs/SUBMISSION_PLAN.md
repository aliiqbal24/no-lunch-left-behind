# Submission Plan

## Strategy

This is a short jam. We optimize for one excellent loop and visible authorship. Compliance, deployment, and mobile input are part of the game from the first prototype.

## Phase 1 — Direction and proof

Target: 21 September

- Select up to three concept candidates.
- Apply the hard filters and weighted scorecard.
- Grey-box the strongest one or two candidates.
- Test real touch immediately.
- Choose one concept and write its one-sentence player promise.
- Define a 60-second core loop and a three-minute full run.
- Commit the decision and rejected alternatives as process receipts.

Exit criteria:

- The mechanic is enjoyable with primitive placeholder geometry.
- We can explain the novel discovery in three honest sentences.
- The smallest shippable version is explicit.

## Phase 2 — Complete game loop

Target: 22 September

- Implement start, play, failure/success, and instant restart.
- Add touch controls and responsive feedback.
- Build only the essential code-generated 3D asset set.
- Establish camera, lighting, palette, typography, and sound direction.
- Deploy the first public build.
- Run the live gate and log failures.

Exit criteria:

- A stranger can play without verbal coaching.
- The entire game can be completed or failed and restarted.
- Deployment works at the intended final URL.

## Phase 3 — Depth and identity

Target: 23 September

- Add decision variety without adding a second control scheme.
- Create a deliberate difficulty curve.
- Replace placeholders that appear in the hero view.
- Add sound, impact, motion, and state-transition polish.
- Capture performance baselines on the phone profile.
- Remove anything that harms readability or frame time.

Exit criteria:

- Three minutes of play contains escalation and a memorable payoff.
- A five-second clip communicates the concept.
- The game has a recognizable frame with the UI hidden.

## Phase 4 — Ruthless playtest and optimization

Target: 24 September

- Run blind first-play tests.
- Fix confusion before adding content.
- Verify all assets with the recipe tools.
- Run `ship.mjs` and inspect every warning.
- Optimize draw calls, triangles, payload, load time, and touch latency.
- Freeze features.
- Draft entry JSON and `what_i_found`.

Exit criteria:

- Gate passes repeatedly from the public URL.
- No console errors or missing resources.
- Submission language describes what the game actually proves.

## Phase 5 — Submission with margin

Target: submit by 25 September, 12:00 Edmonton time

The official deadline is 17:59 Edmonton time. Noon is our internal deadline.

- Produce a clean final commit.
- Deploy that exact commit.
- Run the official gate against the deployment and exact SHA.
- Save the unedited verdict block.
- Verify the public source repository and commit history.
- Complete `entries/<slug>.json`.
- Fork the jam repository and open the entry PR.
- Check every declaration in the PR template.
- Confirm the play link from a clean browser session.
- Preserve the submitted deployment without feature changes.

## Scope ladder

### Must ship

- One polished touch interaction
- One complete repeatable loop
- Clear goal and failure/success feedback
- Instant restart
- Authored code-generated 3D world
- Mobile-first layout and performance
- Working public deployment and passing gate

### Should ship

- Meaningful escalation across a short run
- Distinctive sound and motion language
- A score, rank, or mastery target that invites replay
- A memorable ending or payoff

### Only if everything is green

- Additional levels or modes
- Narrative framing

### Explicitly out of scope

- Accounts, backend, multiplayer, or leaderboards
- Large procedural worlds
- Complex settings menus
- Multiple control schemes
- Desktop-only mechanics

## Ongoing evidence

For the 10% process score, keep:

- meaningful commits;
- screenshots or clips of major iterations;
- rejected concept notes;
- gate verdicts and performance measurements;
- before/after examples of playtest-driven changes;
- a short list of removed features and why they were removed.

