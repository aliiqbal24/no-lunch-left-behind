# 404 Game Jam Submission

Ali Iqbal's playable entry for the 404 Game Jam 001.

## Mission

Create a mobile-first Three.js game that is immediately understandable, satisfying under one finger, visually authored, and built around one memorable idea that other entries are unlikely to attempt.

The goal is not maximum scope. The goal is a small, unusually polished game with a strong answer to all four judging questions:

1. Is it good to play? — 40%
2. Does it look like a made thing? — 30%
3. What did it find that nobody else tried? — 20%
4. How was it made, with receipts? — 10%

## Current status

- GitHub account connected: `aliiqbal24`
- Atlas jam workspace: accessible; 2,600 credits claimed (2,000 campaign + 600 trial)
- Vercel: connected; production remains on the last approved build while development is local
- Concept: **No free lunch theorem** — cheerful robot bureaucracy causes the apocalypse over a stolen lunch
- Source repository: https://github.com/aliiqbal24/no-lunch-left-behind
- First eligible commit: `3011074` (after the jam cutoff)
- Current build: complete pre-Atlas game, playable from comic opening to the Earth call
- Live game: https://no-lunch-left-behind.vercel.app
- Gate status: full game passes the official mobile harness (390×844, real touch, throttled 4G/CPU)
- Submission deadline: 25 September 2026, 23:59 UTC / 17:59 Edmonton time

## Play

Serve the `game/` directory with any static web server and open it on a phone-sized viewport. The build is fully local: no CDN, runtime API, or external asset requests.

Controls:

- Swipe left/right to change lanes.
- Swipe up to jump.
- Swipe down to slide.
- Keyboard fallback: arrows or WASD.

For current scene review, open the [local development build](http://localhost:8080/__game__/game/) and refresh after edits. It reveals a small pause/resume button during runs and interludes; `P` toggles it on a keyboard. The public Vercel URL can lag local development by design. `?dev=1` reveals the pause button on a non-local preview.

The complete run is a compact five-part story:

1. **Comic briefing** — a stolen lunch triggers an extremely thorough robot solution.
2. **City Run** — survive 25 seconds of weaponized office and household objects, then reach the rocket.
3. **Rocket ladder and Space Flight** — tap to climb, then dodge satellites and debris for 25 seconds.
4. **Docking and Station Corridor** — connect with questionable confidence, then run for the master switch.
5. **Finale** — stop the robots and take Earth's audio call.

There is no game-over interruption: hits cost three percentage points of humanity, but the story always reaches its ending. The deliberately absurd worst-case floor is exactly 256 survivors.

## Project documents

- [Current task board](docs/NOW.md)
- [Parallel Codex workflow](docs/COLLABORATION.md)
- [Submission plan](docs/SUBMISSION_PLAN.md)
- [Rules checklist](docs/RULES_CHECKLIST.md)
- [Concept scorecard](docs/CONCEPT_SCORECARD.md)
- [Decision log](docs/DECISIONS.md)
- [Services and deployment](docs/SERVICES.md)
- [Visual style lock](docs/STYLE_LOCK.md)
- [Asset provenance](docs/ASSET_PROVENANCE.md)
- [Full-game review packet](review/README.md)

## Non-negotiable creative principles

- The player understands the interaction in under ten seconds.
- The core loop works with one real finger on a phone.
- The first moving frame already has a recognizable visual identity.
- The novelty is part of play, not merely lore or production technique.
- Every 3D object is generated as editable Three.js code through the 404 recipe.
- We cut features before sacrificing responsiveness, clarity, or the gate.

## Official references

- Rules: https://github.com/404-Repo/404-game-jam
- Recipe and harness: https://github.com/404-Repo/404-game-recipe
- Atlas jam credits: https://app.atlas.design/campaign/404-game-jam
