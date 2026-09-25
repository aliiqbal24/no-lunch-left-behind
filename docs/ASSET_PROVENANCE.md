# Asset Provenance

Record every shipped image, sound, music track, voice, and generated reference here. No downloaded 3D mesh may enter the game.

## Code-built 3D

All 39 modules in `game/assets/` are original Three.js source authored through the 404 recipe contract. Each default-exports a function of `THREE` and returns one `THREE.Group`. They cover the articulated two-outfit human hero, three robot families, city/launch props, a working launch-city sequence with workers, factories, fuel tanks, rails, trains and pads, two physical override fixtures, the rocket hub and spaceport wayfinder, rocket exhaust and launch-pad vapor, procedural city sky, ladder, player ship, satellites and debris, hostile orbital drones, an AI interceptor and paired laser system, orbital wreckage, space backdrop, an orbital defence lattice, docking station, station corridor, domed station hub with a curved Earth viewport, Earth surface flares, lasers, security bots, master switch, Earth, and the new breakroom and office coworker. The rocket hatch, docking passage, city sky, layered stars, corridor windows, station hub, hemispherical viewport, finale Earth effects, and breakroom are built entirely from code with no imported media.

The original 24 modules passed the official recipe verifier; their contact sheet and report are preserved in `review/full-game-assets.png` and `review/full-game-assets.json`. The new rocket hub and wayfinder, plus the revised city road and building, passed load, render, framing, finite-bounds, ground, centre, and side-view checks. Their sheet and report are preserved in `review/rocket-hub-assets.png` and `review/rocket-hub-assets.json`. The new procedural rocket launch effect passed the four-view recipe verifier; its sheet and report are in `review/rocket-launch-fx.png` and `review/rocket-launch-fx.json`.
The launch-city districts and manual override modules passed the four-view recipe verifier (2/2 clean). Their sheet and report are in `review/apocalypse-city-assets.png` and `review/apocalypse-city-assets.json`.
The finished manual cut-off fixture, orbital net gate, Space Flight backdrop, Earth-facing station corridor, and beacon-lit docking port passed the four-view verifier (5/5 clean). Their sheet and report are in `review/finish-pass-assets.png` and `review/finish-pass-assets.json`.
The final Scene 1 pass reverified all sixteen City Run modules together: billboard, civic building, road, sky, ladder, ten-district city set, four hazard families, manual override, player, rocket, launch complex, launch effects, and wayfinder. All 16/16 passed parsing, loading, framing, finite-bounds, ground, centre, triangle, and multi-view checks. The final sheet and report are `review/scene1-final-assets.png` and `review/scene1-final-assets.json`.
The final Scene 2 pass verified the eight rebuilt or new Space Flight modules together: player ship, space backdrop, orbital defence lattice, docking station, hostile space drone, AI interceptor, paired interceptor laser, and orbital wreckage. All 8/8 passed parsing, loading, framing, finite-bounds, ground, centre, triangle, and multi-view checks. The final sheet and report are `review/scene2-final-assets.png` and `review/scene2-final-assets.json`.
The final Scene 3 pass reverified the eight station-facing modules together: pressure corridor, laser barricade, articulated security drone, master switch, domed observation hub, Earth, Earth crisis effects, and the physical safety breaker. All eight parse and render from five review angles; six are completely clean. The Earth-crisis overlay reports its expected above-ground offset because it mounts on the globe, while the observation hub reports its deliberately offset 37-metre approach passage and distant space backdrop. The final sheet and report are `review/scene3-final-assets.png` and `review/scene3-final-assets.json`.
The breakroom opening adds `intro_breakroom.js` and `intro_coworker.js`. The original `player_hoodie.js` was replaced by `player_hero.js`: one shared articulated face/rig, an everyday office outfit for the breakroom and City, and a sealed face-visible pressure suit activated after docking. Its woven surface treatment is generated from code at load time, not shipped as image media. The fridge door, robot cup/head, eyes, and alarm lighting retain editable joints. No imported model or image substitutes for their geometry. The original breakroom sheet and report remain `review/intro-3d-assets.png` and `review/intro-3d-assets.json`; the replacement hero passed the four-view verifier independently.

## External and generated files

No stock media, downloaded meshes, third-party textures, runtime raster images, or runtime CDNs are shipped in the game. Every 3D object remains editable Three.js recipe code.

- The opening renders the breakroom, characters, and props as live Three.js geometry, with HTML speech bubbles and a procedural Web Audio cue sequence. The superseded twelve Atlas transmission WebPs were removed from the runtime directory and remain recoverable in Git history.
- The finale shows the original procedural Earth module through the station hub's code-built hemispherical viewport.
- Billboard text is generated at runtime with Canvas 2D.
- The population HUD's armed walker, fleeing crowd and doomed-city panorama are original inline SVG and CSS; they add no imported images, models or Atlas-generated media.
- The metallic end-of-run grade card, typography treatment and staged readout are original HTML/CSS; its confirmation ticks are synthesized by the game's Web Audio engine. No font or media download is required.
- Chase streaks are original Canvas 2D lines at the screen edges; the denser road and corridor markers are original Three.js geometry in their asset modules.
- The complete score and sound design are original and synthesized at runtime with the Web Audio API; no stock or third-party audio files ship. Three distinct generative scores combine scene-specific tempo, bass movement, arpeggios, evolving chords, industrial percussion, stereo placement, filtering, and procedural reverb. Continuous city sirens and machinery, spacecraft engine pressure, station ventilation/electrical beds, movement feedback, AI lock and orbital-net warnings, material-specific obstacle impacts (plastic cone, appliance, mower, chair, orbital debris, drone, wreckage, security unit, both station beams, AI strike, net, and interceptor laser), overrides, climb and docking cues, rocket liftoff, the master-switch power-down, and grade-specific results cues are built from oscillators and generated noise through separate music, ambience, and effects buses.
- The final radio call uses the device's built-in Web Speech voice, with complete subtitles for each survival outcome on screen.

## Atlas visual-development record

The project owner explicitly approved spending Atlas credits for the final scene-by-scene art pass. Scene 1 used three Atlas Studio generations in the project **No Free Lunch Theorem — Final Art Pass** (`2e174fa7-d20f-4953-a98d-4541fd5bfcbd`):

- `review/atlas/city-run-hero-reference.png` — 1536×2752, 16 credits. Hero composition for a desperate runner beneath an AI-occupied civic megacity, with evacuation infrastructure, smoke, surveillance red, and the last rocket as the destination.
- `review/atlas/city-run-code-red-reference.png` — 1536×2752, 16 credits. Code-red escalation study emphasizing hostile scan light, monumental industrial scale, black smoke, emergency coral, and teal steel.
- **City Run — Production Asset Language** — 16:9 2K asset-language sheet, 17 credits. It defined the detailed civic megastructure, AI checkpoint gantry, commandeered transit pod and rail, sentinels, evacuation props, and modular road construction used during the code-authored rebuild. The source generation remains in the Atlas project workspace.
- `review/atlas/scene2-free-flight-hero.png` — 1536×2752, 16 credits. Scene 2 hero composition defining unrestricted two-axis flight above a wounded Earth, a predatory interceptor, hostile drones, red fire, debris, and a monumental station destination.
- `review/atlas/scene2-production-assets.png` — 2752×1536, 16 credits. Production sheet defining the layered rescue ship, interceptor, drone, paired laser language, wreckage family, and colossal rotating docking architecture translated into the Scene 2 recipe modules.
- `review/atlas/scene3-code-red-hero.png` — 1536×2752, 16 credits. Scene 3 hero frame defining a monumental ribbed pressure corridor, exposed service trenches, security drones, live laser barriers, wounded Earth, and the master switch under controlled emergency red.
- `review/atlas/scene3-active-passive-assets.png` — 2752×1536, 17 credits. Active/passive production sheet defining the same station before and after the physical cut-off: hostile red scan infrastructure and crisis damage give way to dark lasers, calm cyan life-support lines, and an unobstructed Earth view.

The scene-pass references above are not packaged or rendered by the game. Their forms, hierarchy, palette, and detail language were translated into original procedural Three.js modules so every shipped 3D object remains editable recipe code.

The earlier six-shot emergency transmission was generated in the same Atlas project as six responsive shot pairs (2K, Gemini 3 Pro Image, seed 404). Its twelve WebPs are no longer shipped; the historic review sheet remains at `review/intro-cinematic-assets.jpg`, and the old media remain in Git history. That earlier generation cost 208 credits, bringing the then-recorded total to 322.

The replacement 3D breakroom was directed with three further Atlas generations in the same project, all Gemini 3 Pro Image, 16:9 2K, seed 404, at 16 credits each:

- **Breakroom — Warm Set Design** (`0d988ac6-ebaa-47fb-8828-a2394c751471`): warm civic interior, empty fridge, architectural ceiling and window, table and coffee service. Local review copy: `review/atlas/breakroom-warm-set.jpg`.
- **Breakroom — Hero and Coworker Acting** (`37dec000-9bce-44b6-b1b4-59d53277a8c2`): hungry/sad/angry hero turn, suited robot with coffee, and its red-eye turn. Local review copy: `review/atlas/breakroom-acting.jpg`.
- **Breakroom — Props and Code Red Lighting** (`de2a3d43-aca7-4783-b57e-e2f7cf1a9b16`): fridge, mug, stool, alarm, exit and window under normal and emergency lighting. Source remains in Atlas Studio.

These are visual-development references only. The shipped scene is authored Three.js geometry and Web Audio, not a raster cinematic. New generation cost: 48 credits; total recorded Atlas image-generation cost: 370 credits (not including any small assistant-message overhead in Atlas's ledger).

The refined character pass added three Atlas Studio references in the same project, all Gemini 3 Pro Image, 16:9 2K, seed 404, at 16 credits each:

- **Hero — Office Turnaround** (`1f717779-17a5-4311-a5d1-e14c54d2ed85`): office outfit, face, and proportional direction. Local review: `review/atlas/hero-office-turnaround.png`.
- **Hero — Motion Sheet** (`b97388a4-bad8-4f9e-9754-f63eac2a0caf`): contact, passing, flight and push-off run poses; jump, landing and slide keys. Local review: `review/atlas/hero-motion-sheet.png`.
- **Hero — Astronaut Turnaround** (`698a3e4d-19aa-4420-ba63-aa97c8a84e9f`): face-visible suit, life support, pressure joints and boots. Local review: `review/atlas/hero-astronaut-turnaround.png`.

These images are not loaded by the game. The new hero is editable recipe geometry with procedural fabric bump detail; the gait is original runtime joint animation. The three references cost 48 credits, bringing recorded Atlas image-generation cost to 418 credits (excluding assistant-message overhead).
