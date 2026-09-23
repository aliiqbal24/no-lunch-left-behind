# Asset Provenance

Record every shipped image, sound, music track, voice, and generated reference here. No downloaded 3D mesh may enter the game.

## Code-built 3D

All 26 modules in `game/assets/` are original Three.js source authored through the 404 recipe contract. Each default-exports a function of `THREE` and returns one `THREE.Group`. They cover the hoodie player, three robot families, city/launch props, the new rocket hub and spaceport wayfinder, ladder, player ship, satellites and debris, docking port, station corridor, lasers, security bots, master switch, and Earth.

The original 24 modules passed the official recipe verifier; their contact sheet and report are preserved in `review/full-game-assets.png` and `review/full-game-assets.json`. The new rocket hub and wayfinder, plus the revised city road and building, passed load, render, framing, finite-bounds, ground, centre, and side-view checks. Their sheet and report are preserved in `review/rocket-hub-assets.png` and `review/rocket-hub-assets.json`.

## External and generated files

No external media files, stock assets, downloaded meshes, textures, or runtime CDNs are present in the pre-Atlas build.

- Comic panels are original inline SVG assembled in `game/index.html`.
- The finale Earth is an original CSS illustration; a recipe-compatible procedural Earth module is also included in the asset library.
- Billboard text is generated at runtime with Canvas 2D.
- Music, impacts, gestures, interlude cues, docking, and the master-switch cue are synthesized at runtime with the Web Audio API.
- The final radio call uses the device's built-in Web Speech voice as a temporary pre-Atlas treatment, with complete subtitles on screen.

## Atlas status

No Atlas generation was used and no Atlas credit was spent on this build. This is the deliberately reviewable pre-Atlas baseline. A scene will only be regenerated or refined with Atlas after explicit creative approval from the project owner.
