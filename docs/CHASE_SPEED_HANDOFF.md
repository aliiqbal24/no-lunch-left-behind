# Chase speed visuals handoff

Contributor commit `251f6e0` was cherry-picked onto `main` as `202a2bb`. The helper is connected in `game/src/main.js`; road and corridor edge ticks are also live.

The integration points in `game/src/main.js` are:

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

Local checks after integration: the 404 recipe ship check passed; desktop filmstrips and phone views covered city, space, and station; phone telemetry reported the original speeds (12.5, 15.2, and 13.4 m/s), no page errors, and draw and triangle counts below the jam limits. Intro and transition streak hiding, developer pause, and reduced motion also passed. Recheck hazard readability and the full story route after future camera or transition edits. The official deployed gate remains a release step.
