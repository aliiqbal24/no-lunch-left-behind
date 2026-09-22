# Asset Provenance

Record every shipped image, sound, music track, voice, and generated reference here. No downloaded 3D mesh may enter the game.

## Code-built 3D

All modules in `game/assets/` are authored as Three.js source through the 404 recipe contract. Each default-exports a function of `THREE` and returns one `THREE.Group`.

## External and generated files

No external media files are present in the City checkpoint. Sound is synthesized at runtime with the Web Audio API. Billboard text is generated at runtime with Canvas 2D.

