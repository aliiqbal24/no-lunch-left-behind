# Chase speed visuals handoff

This contributor branch owns `game/src/chase_visuals.js`, `game/assets/city_road.js`, and `game/assets/station_corridor.js`. The new helper is deliberately disconnected until the integration session can edit `game/src/main.js` on a clean `main`. The road and corridor edge ticks work as soon as the commit is cherry-picked.

Connect the helper in `game/src/main.js` after the current transition edits are settled:

1. Import `createChaseVisuals` from `./chase_visuals.js`.
2. Declare `let chaseVisuals = null` near the other runtime objects.
3. At the end of `resize()`, after setting `camera.fov`, call `chaseVisuals?.setBaseFov(camera.fov)`.
4. After the existing bottom-of-file `resize()` call, before `requestAnimationFrame(frame)`, assign `chaseVisuals = createChaseVisuals({ camera, baseFov: camera.fov, reducedMotion: REDUCED_MOTION })`.
5. In `frame()`, after the mode updates and before `rig.render(...)`, call:

```js
chaseVisuals.update({
  dt: rawDt,
  active: !document.hidden && state.mode === 'playing' && state.introDelay <= 0,
  paused: state.paused,
  act: state.act,
  distance: state.distance,
  targetX: LANES[state.targetLane + 1],
  player,
  playerJoints,
  ship,
  jumpY: state.jumpY,
  slide: state.slide,
});
```

That call follows `updateActor()` and `updateCamera()`, so it changes only the final pose and projection. It must stay outside the `!state.paused` block to hide the overlay when an act ends, while its own pause check keeps the last frame fixed. There are no changes to `ACTS`, world travel, spawn clocks, collision thresholds, or timers.

Verify city, space, and station in both portrait and landscape, including the transition into and out of each act. Check reduced motion, developer pause, hazard readability, `window.__GAME__.speed`, draw calls, triangles, and a complete local playthrough. The official deployed gate is a release step owned by integration.
