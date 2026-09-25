# Game visual review packet

Live build: https://no-lunch-left-behind.vercel.app

## 3D breakroom opening (2026-09-25, local build)

The former still-image transmission is replaced with a live, editable Three.js scene inside a City facade: hinged empty fridge, warm office set, expressive hoodie hero, suited robot coworker with a movable coffee cup, red-eye turn, and code-red alarm state. Speech bubbles and procedural sound cues carry the scene into the existing playable City Run. The first-run opening can be skipped immediately, returning players may replay it, and no runtime raster assets are required.

- [Three-asset verifier sheet](intro-3d-assets.png) and [machine report](intro-3d-assets.json): breakroom, coworker, and updated hero 3/3 clean; the breakroom's three exterior mounted faces are explicitly declared flat
- [First-run phone frame](intro-3d-phone.png) and [local phone jam verdict](intro-3d-local-verdict.json): PASS, 5.1 s ready, 1.8 MB, 775 peak draws, 291,200 peak triangles, no errors or 404s
- Atlas references: [warm set](atlas/breakroom-warm-set.jpg) and [character acting](atlas/breakroom-acting.jpg). A third code-red prop and lighting sheet remains in the Atlas project.
- The old transmission review sheet remains in this directory only as historical evidence; its twelve WebPs were removed from the shipped game folder.

This is a local development build, not the older live deployment above.

## Scene 3 final station visual pass (2026-09-24)

Station gameplay is unchanged, but its complete visual language is rebuilt around a massive **CODE RED AI occupation**. The pressure corridor now has authored ribs, service trenches, cable arteries, equipment cabinets and scan infrastructure; hazards are articulated security drones and industrial laser barricades; the final observatory surrounds a monumental wired switch and a much larger wounded Earth. Pressing the switch visibly changes the same environment from hostile red alarm systems to passive cyan life-support systems while the Earth crisis scars fade.

- [Eight-asset verifier sheet](scene3-final-assets.png) and [machine report](scene3-final-assets.json): all 8 render, 6 completely clean; the globe-mounted crisis overlay and passage/backdrop hub carry documented contextual framing warnings
- [Local phone jam verdict](scene3-final-local-verdict.json): PASS, 5.2 s ready, 1.8 MB, 771 peak draws, 290,068 peak triangles, no errors or 404s
- Atlas references: [code-red hero frame](atlas/scene3-code-red-hero.png) and [active/passive production sheet](atlas/scene3-active-passive-assets.png)

Normal-speed and accelerated browser routes exercised the rebuilt corridor, switch approach, physical press, passive-state transformation, Earth finale, and results handoff without application errors. This is local development evidence; the public build above remains older until release approval.

## Scene 2 final visual and free-flight pass (2026-09-24)

Space Flight is no longer a three-lane reskin. The craft now flies continuously in two dimensions with held keyboard input or an anchored mobile drag joystick. The rebuilt encounter adds articulated hostile drones, tumbling orbital wreckage, a large AI interceptor that crosses in front and fires paired red lasers, and a full-width orbital defence lattice with one cyan breach aperture. A wounded Earth and the monumental rotating station hold the emotional frame from pursuit through docking.

- [Eight-asset verifier sheet](scene2-final-assets.png) and [machine report](scene2-final-assets.json): 8/8 clean
- [Local phone jam verdict](scene2-local-verdict.json): PASS, 5.5 s ready, 1.8 MB, 773 peak draws, 290,836 peak triangles, no errors or 404s
- Atlas references: [free-flight hero frame](atlas/scene2-free-flight-hero.png) and [production asset sheet](atlas/scene2-production-assets.png)

Normal-speed browser routes exercised the interceptor lock and laser impact, both the cyan-aperture clear and impact branches, the full docking approach, and Station entry. A real diagonal touch drag moved the ship in both axes. This is local development evidence; the public build above remains older until release approval.

## Scene 1 final visual pass (2026-09-24)

City Run now uses the approved Atlas-directed **code red AI apocalypse** language: monumental civic and launch infrastructure, occupied transit rails, machine checkpoints, evacuation activity, layered road hardware, surveillance scan light, smoke shelves, orbital debris, a detailed hero, and a fully staged last-rocket launch. The rocket and launch complex are shown at four times their authored scale, with the boarding and liftoff cinematics retuned around the new megastructure proportions. The Atlas generations were visual references; the shipped assets remain original editable Three.js recipe code.

- [Final phone gameplay frame](scene1-final-phone.png)
- [Boarding-to-Space route proof](scene1-route-proof.png)
- [Final liftoff frame](scene1-final-liftoff.png)
- [Sixteen-asset verifier sheet](scene1-final-assets.png) and [machine report](scene1-final-assets.json): 16/16 clean
- [Local phone jam verdict](scene1-final-local-verdict.json): PASS, 5.1 s ready, 1.7 MB, 771 peak draws, 290,068 peak triangles, no errors or 404s
- Atlas references: [hero composition](atlas/city-run-hero-reference.png) and [code-red escalation](atlas/city-run-code-red-reference.png)

The accelerated phone route reached City, boarding, climb, liftoff, launch exit, and Space Flight with no console or request failures. Its measured peak was 810 draws and 304,580 triangles. This is local development evidence; the public build above remains older until release approval.

## Local complete-content pass (2026-09-23)

The local game now teaches hazards before its first AI strike, gives both physical cut-offs a wider and more visible rescue window, and stages a right-lane orbital-net escape during Space Flight. Gold low satellites and red high satellites cue the jump and slide; beacons frame the approaching dock. Earth anchors the flight and appears through corridor windows; the final radio call reflects how many people survived. Mute persists when replay returns to the start page.

- [Phone gameplay frame](finish-pass-phone.png)
- [Five changed procedural assets](finish-pass-assets.png) and [verifier report](finish-pass-assets.json): 5/5 clean
- [Local phone jam verdict](finish-pass-local-verdict.json): PASS, 4.6 s ready, 1.7 MB, 524 peak draws, 38,818 peak triangles, no errors or 404s

This is local development evidence, not a new production gate verdict. The public build listed below is older.

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
- The files in this older section are the pre-Atlas baseline. The new Scene 1 evidence is listed above.
- For development review, open the live URL with `?dev=1` to show the small pause button during runs and interludes. `P` also toggles pause on a keyboard.

## Local rocket hub iteration

The City Run now has a fixed road to the rocket, launch-route lighting and beacons, a launch hub visible from the start, and wayfinder arches along the route. Obstacle rows are placed before play instead of appearing ahead of the player. The rocket stays at the end of the road and the ladder transition waits until the player reaches it.

- [Opening on the launch route](rocket-hub-opening.png)
- [Approaching the rocket](rocket-hub-arrival.png)
- [Four City Run asset contact sheet](rocket-hub-assets.png)
- [Four City Run asset verifier report](rocket-hub-assets.json)
- [Passing local mobile gate verdict](rocket-hub-local-verdict.json)

These are local 390×844 browser captures, not a new production gate verdict. The full City Run reached the ladder at 318 m with zero page errors or missing requests. The accelerated QA path still reached Space Flight. The local jam gate passed at commit `262f9f7`: 4.1 s ready, 1.6 MB, 376 peak draw calls, 44,646 peak triangles, zero errors and 404s. The gate must be rerun against the final deployed commit.

## Local rocket liftoff iteration

After the character enters, the rocket ignites and rises through a three-second exterior shot before Space Flight. The exhaust and pad vapor are a code-built Three.js asset. Its [four-view verifier sheet](rocket-launch-fx.png) and [verifier report](rocket-launch-fx.json) passed locally. This is development evidence, not a production gate verdict.
