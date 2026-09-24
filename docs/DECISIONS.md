# Decision Log

Record decisions while they are fresh. This is both a guard against scope drift and evidence for the judging process.

## 2026-09-21 — Project created

- GitHub identity: `aliiqbal24`
- Working directory: `/home/ali/HeCode/404-game-jam-submission`
- Creative direction remains open pending fast prototypes.
- Strategy: prioritize touch feel, visual authorship, and one defensible discovery over feature count.
- Internal submission deadline: 25 September at 12:00 Edmonton time, six hours before the official cutoff.

## 2026-09-21 — Connected services audited

- Atlas Studio browser access is available for the dedicated jam workspace.
- The 2,600-credit claim is consistent with 2,000 campaign credits plus 600 trial credits.
- Direct Atlas MCP/API access is not configured; create a workspace key only when explicitly approved.
- Vercel is connected and has an empty team ready for this game.
- Deployment choice: use Vercel as the primary host and GitHub Pages as the fallback.

## 2026-09-21 — Game direction locked

- Title: `No Lunch Left Behind`.
- Tone: playful dark comedy; cheerful robots treat extinction like an office process.
- Structure: one three-lane touch mechanic, reskinned across City, Space, and Station acts.
- Failure model: the story always continues. Each hit costs 3 percentage points of humanity, with a deliberately absurd worst-case floor of exactly 256 survivors.
- HUD decision: show humanity only. Robot pressure is communicated through staging, animation, camera, and sound rather than a second meter.
- Art direction: bright, chunky, cartoon-scale forms; golden-hour city; crisp ink-like UI.
- Build order: scene by scene, with a playable URL and evidence gate before the next scene begins.

## 2026-09-21 — City Run checkpoint passes

- Duration: 25 seconds, including a brief opening look-back at the robot army.
- Authored obstacle set: weaponized toaster, lawnmower, office chair, and traffic cone.
- Technical result on the official jam harness: 4.2 s ready time, 1.5 MB transferred, 213 peak draw calls, 19,472 peak triangles, 0 errors, 0 missing requests, and no external dependencies.
- Real mobile drag input was detected on the full-screen play surface.
- Software-rendered median FPS was 18 in the harness and is recorded for awareness; the official harness explicitly does not treat this metric as a verdict.
- Result: `PASS`. City Run is ready for creative steering before work advances to the next scene.

## 2026-09-22 — Complete pre-Atlas build passes

- The full sequence now runs without a reset: comic, City Run, ladder, Space Flight, docking, Station Corridor, master switch, and Earth call.
- The three playable acts share one lane runner and one touch vocabulary, while camera, lighting, procedural scenery, obstacle families, player form, color, and audio change by act.
- All 24 authored Three.js asset modules pass the official asset verifier.
- The full story was exercised with real emulated touch input. Every state was observed and the replay control appeared with zero application errors.
- Official local jam harness result: 4.1 s ready time, 1.5 MB transferred, 190 peak draw calls, 21,000 peak triangles, 0 errors, 0 missing requests, and no external dependencies.
- The harness reported 17 median FPS under software rendering; the harness explicitly records this as non-verdict evidence.
- Result: `PASS` at a 390×844 phone viewport under throttled 4G and 2× CPU slowdown.
- Atlas decision: retain the 2,600 credits. This build is the gameplay and visual-direction baseline; spend credits only when a reviewed scene is explicitly approved for refinement.
- Production evidence: commit `19b9bf4` was deployed to `https://no-lunch-left-behind.vercel.app` and independently passed the live harness in 2.8 s with the same 190-draw / 21,000-triangle peaks, zero errors, zero missing requests, and no external dependencies.

## 2026-09-22 — Development pause and control direction

- Corrected the world-to-screen lane mapping and accounted for the brief opening camera flip, so left and right inputs follow what the player sees.
- Touch gestures now register when the finger crosses the threshold. The prior release-only path could miss a valid swipe on a slow frame.
- Added a translucent pause button in local and `?dev=1` sessions. It freezes run and interlude timers, scene motion, input, CSS animation, and audio.
- Verified live at commit `48fdae9`: official mobile harness `PASS`, 2.8 s ready, 1.6 MB, 190 peak draws, 21,000 peak triangles, zero errors and 404s. Mobile touch, keyboard direction, pause/resume, and the full act sequence were also exercised directly.

## 2026-09-22 — Game renamed

- Current title: `No free lunch theorem`.
- The source repository and deployment URL keep their existing slugs so published links and gate evidence remain valid.

## 2026-09-23 — Complete-content pass before Atlas

- Kept the three-act route and existing touch vocabulary. The middle act needed a memorable choice, so its new orbital shutter uses lane movement rather than another button or mode.
- Moved the first AI strike after the City hazard lesson and widened each optional physical cut-off to about three seconds. Each successful cut-off now shows its five-point rescue immediately; its 400-million-person effect remains unchanged at the ending.
- Gave Space Flight a consistent Earth landmark and station windows a matching view. The three final radio responses now acknowledge strong survival, severe losses, or the 256-person floor.
- Local evidence: four changed assets passed the recipe verifier; unit suites and ship check pass; the phone jam harness passed at 4.6 s ready, 1.7 MB, 513 draws, 38,770 triangles, zero errors and 404s. Browser routes reached the cut-off, both orbital-gate outcomes, the master switch, and the 256-person ending.
- Atlas art, Vercel deployment, the exact-commit public gate, and jam submission remain separate owner-approved release work.

## 2026-09-24 — Scene 1 Atlas-directed production pass

- Owner direction: spend Atlas credits and make City Run dramatically more complex, detailed, beautiful, massive, and emotionally apocalyptic.
- Atlas was used for three visual-development generations (49 image credits recorded), not for packaged 3D files. This preserves the jam requirement that every shipped 3D object remain editable Three.js recipe code.
- Rebuilt the full Scene 1 family: hero, four hazards, road, civic megastructure, ten launch-city districts, AI checkpoints and transit, sky, billboard, wayfinder, manual override, ladder, rocket, launch hub, and exhaust/smoke.
- The visual target is troubled code-red AI occupation rather than generic destruction: civic systems are visibly commandeered, evacuation details remain human-scale, and the last rocket reads as a desperate heroic objective.
- Runtime decision: retain authored detail but bake static district geometry and internal animated assemblies. Hide completed route chunks only after the hatch seals so checkpoint structures cannot obscure the liftoff composition.
- Scale decision: present the rocket and complete launch complex at 4× authored scale. Retune the ladder path, hatch alignment, boarding shot, transition shield, and exterior ascent camera rather than scaling the player, preserving the intended human-versus-megastructure contrast.
- Evidence: all sixteen Scene 1 recipe modules pass the official multi-view verifier; the throttled phone jam gate passes at 5.1 seconds ready, 1.7 MB, 771 draws, 290,068 triangles, zero errors and 404s. The complete accelerated Scene 1 route reaches Space Flight without console or request failures.
- Deployment remains unapproved and was not changed.

## Decision template

### YYYY-MM-DD — Decision

- Context:
- Options considered:
- Decision:
- Evidence:
- What we deliberately gave up:
- Revisit only if:
