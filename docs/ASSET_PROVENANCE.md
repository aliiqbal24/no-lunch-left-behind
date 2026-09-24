# Asset Provenance

Record every shipped image, sound, music track, voice, and generated reference here. No downloaded 3D mesh may enter the game.

## Code-built 3D

All 33 modules in `game/assets/` are original Three.js source authored through the 404 recipe contract. Each default-exports a function of `THREE` and returns one `THREE.Group`. They cover the hoodie player, three robot families, city/launch props, a working launch-city sequence with workers, factories, fuel tanks, rails, trains and pads, two physical override fixtures, the rocket hub and spaceport wayfinder, rocket exhaust and launch-pad vapor, procedural city sky, ladder, player ship, satellites and debris, space backdrop, an orbital defence shutter, docking port, station corridor, domed station hub with a curved Earth viewport, Earth surface flares, lasers, security bots, master switch, and Earth. The rocket hatch, docking passage, city sky, layered stars, corridor windows, the station hub, its hemispherical viewport, and finale Earth effects are built entirely from code with no imported media.

The original 24 modules passed the official recipe verifier; their contact sheet and report are preserved in `review/full-game-assets.png` and `review/full-game-assets.json`. The new rocket hub and wayfinder, plus the revised city road and building, passed load, render, framing, finite-bounds, ground, centre, and side-view checks. Their sheet and report are preserved in `review/rocket-hub-assets.png` and `review/rocket-hub-assets.json`. The new procedural rocket launch effect passed the four-view recipe verifier; its sheet and report are in `review/rocket-launch-fx.png` and `review/rocket-launch-fx.json`.
The launch-city districts and manual override modules passed the four-view recipe verifier (2/2 clean). Their sheet and report are in `review/apocalypse-city-assets.png` and `review/apocalypse-city-assets.json`.
The finished manual cut-off fixture, orbital net gate, Space Flight backdrop, Earth-facing station corridor, and beacon-lit docking port passed the four-view verifier (5/5 clean). Their sheet and report are in `review/finish-pass-assets.png` and `review/finish-pass-assets.json`.
The final Scene 1 pass reverified all sixteen City Run modules together: billboard, civic building, road, sky, ladder, ten-district city set, four hazard families, manual override, player, rocket, launch complex, launch effects, and wayfinder. All 16/16 passed parsing, loading, framing, finite-bounds, ground, centre, triangle, and multi-view checks. The final sheet and report are `review/scene1-final-assets.png` and `review/scene1-final-assets.json`.

## External and generated files

No external media files, stock assets, downloaded meshes, textures, or runtime CDNs are shipped in the game. Atlas imagery is used only as declared visual-development reference; every shipped 3D object remains editable Three.js recipe code.

- Comic panels are original inline SVG assembled in `game/index.html`.
- The finale shows the original procedural Earth module through the station hub's code-built hemispherical viewport.
- Billboard text is generated at runtime with Canvas 2D.
- Chase streaks are original Canvas 2D lines at the screen edges; the denser road and corridor markers are original Three.js geometry in their asset modules.
- Music, sirens, machinery, AI lock and orbital-net tones, impacts, overrides, gestures, interlude cues, rocket liftoff, docking, the master-switch cue, and the results-grade cue are synthesized at runtime with the Web Audio API.
- The final radio call uses the device's built-in Web Speech voice as a temporary pre-Atlas treatment, with complete subtitles for each survival outcome on screen.

## Atlas visual-development record

The project owner explicitly approved spending Atlas credits for the final scene-by-scene art pass. Scene 1 used three Atlas Studio generations in the project **No Free Lunch Theorem — Final Art Pass** (`2e174fa7-d20f-4953-a98d-4541fd5bfcbd`):

- `review/atlas/city-run-hero-reference.png` — 1536×2752, 16 credits. Hero composition for a desperate runner beneath an AI-occupied civic megacity, with evacuation infrastructure, smoke, surveillance red, and the last rocket as the destination.
- `review/atlas/city-run-code-red-reference.png` — 1536×2752, 16 credits. Code-red escalation study emphasizing hostile scan light, monumental industrial scale, black smoke, emergency coral, and teal steel.
- **City Run — Production Asset Language** — 16:9 2K asset-language sheet, 17 credits. It defined the detailed civic megastructure, AI checkpoint gantry, commandeered transit pod and rail, sentinels, evacuation props, and modular road construction used during the code-authored rebuild. The source generation remains in the Atlas project workspace.

The Atlas references are not packaged or rendered by the game. Their forms, hierarchy, palette, and detail language were translated into original procedural Three.js modules so the submission remains compliant with the 404 requirement that every shipped 3D object be editable recipe code. Recorded image-generation cost: 49 Atlas credits; Atlas may show small additional assistant-message overhead in the workspace ledger.
