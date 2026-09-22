# 404 Game Jam Submission

Planning and development workspace for Ali Iqbal's entry to the 404 Game Jam 001.

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
- Vercel: connected; City Run preview deployment in progress
- Concept: **No Lunch Left Behind** — cheerful robot bureaucracy causes the apocalypse over a stolen lunch
- Source repository: local only
- First eligible commit: `3011074` (after the jam cutoff)
- Current checkpoint: Scene 1, City Run
- Gate status: official mobile harness passes (390×844, real touch, throttled 4G/CPU)
- Submission deadline: 25 September 2026, 23:59 UTC / 17:59 Edmonton time

## Play the current checkpoint locally

Serve the `game/` directory with any static web server and open it on a phone-sized viewport. The build is fully local: no CDN, runtime API, or external asset requests.

Controls:

- Swipe left/right to change lanes.
- Swipe up to jump.
- Swipe down to slide.
- Keyboard fallback: arrows or WASD.

The City Run lasts 25 seconds and always reaches the rocket. Hits reduce the humanity count instead of stopping the story.

## Project documents

- [Submission plan](docs/SUBMISSION_PLAN.md)
- [Rules checklist](docs/RULES_CHECKLIST.md)
- [Concept scorecard](docs/CONCEPT_SCORECARD.md)
- [Decision log](docs/DECISIONS.md)
- [Services and deployment](docs/SERVICES.md)
- [Visual style lock](docs/STYLE_LOCK.md)
- [Asset provenance](docs/ASSET_PROVENANCE.md)

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
