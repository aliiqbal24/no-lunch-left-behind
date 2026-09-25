# No free lunch theorem — locked style

> Rounded retro-futurist architecture and readable silhouettes, with a refined human-proportioned hero. Bevelled mechanical parts, tactile fabric and painted metal, golden-hour warmth, and expressive shapes remain readable instantly on a phone.

| role | hex | where it belongs |
|---|---|---|
| hero ochre | `0xF6C453` | business-casual overshirt, suit identity accents, guidance |
| deep teal | `0x1F4E5F` | road shadows, clothing, structure |
| robot ivory | `0xF7F3E8` | robot shells, station panels |
| hazard orange | `0xFF6B4A` | obstacles, sparks, warning props |
| emergency red | `0xD7263D` | damage, master switch, danger |
| friendly teal | `0x45C4B0` | robot screens and technology |
| space navy | `0x21243A` | space and deep shadow |
| space violet | `0x6B5B95` | space accent and debris |
| industrial metal | `0x9BA7B4` | machinery and infrastructure |
| warm concrete | `0xF5E6C8` | city buildings and launch pad |

## Fixed decisions

- Metres. The player is 1.75 m tall, robots are 1.1–1.8 m, a road lane is 2.2 m wide, and a four-storey building is about 13 m tall.
- Base at y = 0, centred on x and z, front faces +Z.
- Flat colours with sensible roughness; procedural surfaces are applied at load time.
- Material names use only `plaster`, `stone`, `timber`, `tile`, `metal`, `fabric`, `foliage`, and `ground`.
- Silhouettes stay rounded, asymmetrical, and readable. Small surface decoration never carries identity.
- The player is an original ordinary adult man: ochre open-collar overshirt, ivory undershirt, tapered teal chinos, and practical shoes through the office and City; a face-visible ivory/teal pressure suit only after he exits the spacecraft at Station 404.
- Both outfits use the same articulated proportions and face. The outfit changes under the docking bulkhead occlusion; gameplay motion is owned by one character controller.
- No gore. Catastrophe is communicated through numbers, smoke, props, and cheerful bureaucracy.
