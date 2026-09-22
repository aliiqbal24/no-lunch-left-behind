# City Run checkpoint — review packet

Live build: https://no-lunch-left-behind.vercel.app

Captured from the deployed build at a 390×844 touch viewport:

- [8-second gameplay clip](city-run-checkpoint.mp4)
- [Mobile gameplay frame](city-run-mobile.png)
- [Machine-readable official verdict](city-run-verdict.json)

## Official 404 jam harness result

| Check | Result |
| --- | ---: |
| Overall | **PASS** |
| Ready under throttling | 3.1 s / 20 s budget |
| Total game weight | 1.5 MB / 10 MB budget |
| Real touch target | `#stick` dragged up and held |
| Movement | 75.8 m / 1 m required |
| Peak draw calls | 213 / 900 budget |
| Peak triangles | 19,472 / 1,500,000 budget |
| Page errors | 0 |
| Missing requests | 0 |
| External dependencies | none |
| Requests outside game folder | none |

The harness reported 18 median FPS under software rendering and explicitly marks that number as non-verdict evidence. Device testing remains part of the polish pass.

## Steering questions for this checkpoint

1. Does the opening robot-army look-back sell the premise quickly enough?
2. Is the golden-hour city distinctive enough, or should we push saturation and comedy harder?
3. Does the player read as a cute hoodie-wearing human at phone size?
4. Is the humanity bar the right emotional feedback, or should hit copy carry more of the joke?

