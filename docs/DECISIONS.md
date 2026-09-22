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

## Decision template

### YYYY-MM-DD — Decision

- Context:
- Options considered:
- Decision:
- Evidence:
- What we deliberately gave up:
- Revisit only if:
