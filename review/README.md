# Full pre-Atlas game — review packet

Live build: https://no-lunch-left-behind.vercel.app

The complete playable sequence is represented here at a 390×844 touch viewport:

- [23-second accelerated full-game clip](full-game-pre-atlas.mp4)
- [Comic opening](full-game-comic.png)
- [City Run](full-game-city.png)
- [Space Flight](full-game-space.png)
- [Station Corridor](full-game-station.png)
- [Earth call finale](full-game-finale.png)
- [All 24 procedural assets](full-game-assets.png)
- [Asset verifier report](full-game-assets.json)
- [Machine-readable live full-game verdict](full-game-live-verdict.json)
- [Machine-readable local full-game verdict](full-game-local-verdict.json)

## Official 404 jam harness result

| Check | Result |
| --- | ---: |
| Overall | **PASS** |
| Ready under throttling | 2.8 s / 20 s budget |
| Total game weight | 1.6 MB / 10 MB budget |
| Real touch target | `#stick` dragged up and held |
| Movement | 77.7 m / 1 m required |
| Peak draw calls | 190 / 900 budget |
| Peak triangles | 21,000 / 1,500,000 budget |
| Page errors | 0 |
| Missing requests | 0 |
| External dependencies | none |
| Requests outside game folder | none |

The table reports the production deployment at commit `48fdae9`. The harness reported 18 median FPS under software rendering and explicitly marks that number as non-verdict evidence. Device testing remains part of the polish pass.

## Review notes

- The clip uses the built-in accelerated QA mode so all acts fit in 23 seconds. Normal play uses the intended 25-second City, Space, and Station acts, a 5-second ladder, and a 3-second docking beat.
- The prior City-only checkpoint files remain in this folder as development evidence.
- Atlas credits are untouched. This is the baseline to play before choosing which scene deserves an Atlas refinement pass.
- For development review, open the live URL with `?dev=1` to show the small pause button during runs and interludes. `P` also toggles pause on a keyboard.

## Local rocket hub iteration

The City Run now has a fixed road to the rocket, a launch hub visible from the start, and wayfinder arches along the route. Obstacle rows are placed before play instead of appearing ahead of the player. The rocket stays at the end of the road and the ladder transition waits until the player reaches it.

- [Opening on the launch route](rocket-hub-opening.png)
- [Approaching the rocket](rocket-hub-arrival.png)
- [New asset contact sheet](rocket-hub-assets.png)
- [New asset verifier report](rocket-hub-assets.json)
- [Passing local mobile gate verdict](rocket-hub-local-verdict.json)

These are local 390×844 browser captures, not a new production gate verdict. The full City Run reached the ladder at 318 m with zero page errors or missing requests. The accelerated QA path still reached Space Flight. The local jam gate passed at commit `cb73a5f`: 4.1 s ready, 1.6 MB, 320 peak draw calls, 38,838 peak triangles, zero errors and 404s. The gate must be rerun against the final deployed commit.
