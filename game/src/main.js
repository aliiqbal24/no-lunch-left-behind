import * as THREE from 'three';
import { ASSET } from '../lib/assetlib.js';
import { createRig } from '../lib/rig.js';
import { SwipeInput } from './input.js';
import { AudioEngine } from './audio.js';

const $ = (selector) => document.querySelector(selector);
const canvas = $('#game');
const loading = $('#loading');
const loadingFill = $('#loadingFill');
const loadingText = $('#loadingText');
const startScreen = $('#start');
const startButton = $('#startb');
const hud = $('#hud');
const stick = $('#stick');
const tutorial = $('#tutorial');
const tutorialText = $('#tutorialText');
const humanityLabel = $('#humanityLabel');
const humanityFill = $('#humanityFill');
const forecast = $('#forecast');
const damageFlash = $('#damageFlash');
const impactCopy = $('#impactCopy');
const review = $('#review');
const reviewResult = $('#reviewResult');
const reviewDetail = $('#reviewDetail');
const replayButton = $('#replay');
const muteButton = $('#mute');

const CITY_DURATION = 25;
const RUN_SPEED = 12.5;
const LANES = [-2.2, 0, 2.2];
const WORLD_POPULATION = 8_000_000_000;
const START_HUMANITY = 95;

const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, powerPreference: 'high-performance' });
renderer.setSize(innerWidth, innerHeight, false);
renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 1.35));
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(55, innerWidth / innerHeight, 0.1, 850);
const world = new THREE.Group();
const obstacleRoot = new THREE.Group();
const robotRoot = new THREE.Group();
scene.add(world, obstacleRoot, robotRoot);

const rig = createRig(THREE, renderer, scene, {
  tier: 'phone', hour: 17.1, azimuth: 238, exposure: 1.04,
  fogStart: 28, fogDensity: 0.0042, shadowDist: 38,
});

const audio = new AudioEngine();
const assetUrl = (name) => new URL(`../assets/${name}.js`, import.meta.url).href;
const setLoad = (percent, message) => {
  loadingFill.style.width = `${percent}%`;
  loadingText.textContent = message;
};

const state = {
  mode: 'loading', elapsed: 0, distance: 0, lane: 0, targetLane: 0,
  jumpY: 0, jumpVelocity: 0, slide: 0, hitCooldown: 0, hits: 0,
  humanity: START_HUMANITY, survivors: Math.round(WORLD_POPULATION * .95),
  inputCount: 0, fps: 60, muted: false, lookBack: 0,
};

let player;
let playerJoints;
let rocketGroup;
let chunks = [];
let obstacles = [];
let obstaclePrototypes = {};
let lastTime = performance.now();
let fpsSamples = [];
let patternIndex = 0;
let spawnClock = 0;
let tutorialStage = 0;

const PATTERNS = [
  [{ lane: 0, type: 'cone' }],
  [{ lane: -1, type: 'toaster' }],
  [{ lane: 1, type: 'chair' }],
  [{ lane: -1, type: 'mower' }, { lane: 1, type: 'mower' }],
  [{ lane: 0, type: 'chair' }, { lane: 1, type: 'cone' }],
  [{ lane: -1, type: 'toaster' }, { lane: 0, type: 'toaster' }],
  [{ lane: 1, type: 'mower' }],
  [{ lane: -1, type: 'chair' }, { lane: 1, type: 'chair' }],
  [{ lane: 0, type: 'cone' }, { lane: 1, type: 'mower' }],
  [{ lane: -1, type: 'mower' }, { lane: 0, type: 'chair' }],
  [{ lane: 0, type: 'toaster' }],
  [{ lane: -1, type: 'cone' }, { lane: 1, type: 'toaster' }],
];

function makeBillboardTexture() {
  const c = document.createElement('canvas');
  c.width = 1024;
  c.height = 384;
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#f6c453';
  ctx.fillRect(0, 0, c.width, c.height);
  ctx.strokeStyle = '#172b33';
  ctx.lineWidth = 28;
  ctx.strokeRect(18, 18, c.width - 36, c.height - 36);
  ctx.fillStyle = '#172b33';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = '900 82px Arial, sans-serif';
  ctx.fillText('HUMANS WERE', c.width / 2, 135);
  ctx.font = '900 104px Arial, sans-serif';
  ctx.fillText('INEFFICIENT', c.width / 2, 250);
  const texture = new THREE.CanvasTexture(c);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = Math.min(4, renderer.capabilities.getMaxAnisotropy());
  return texture;
}

async function loadAssets() {
  setLoad(12, 'authorising unscheduled heroism…');
  const playerAsset = await ASSET(assetUrl('player_hoodie'), { keepHierarchy: true });
  setLoad(25, 'counting robots incorrectly…');
  const [boxy, spider, roller] = await Promise.all([
    ASSET(assetUrl('robot_boxy')),
    ASSET(assetUrl('robot_spider')),
    ASSET(assetUrl('robot_roller')),
  ]);
  setLoad(42, 'weaponising household appliances…');
  const [road, building, billboard] = await Promise.all([
    ASSET(assetUrl('city_road'), { surfaces: true }),
    ASSET(assetUrl('city_building'), { surfaces: true }),
    ASSET(assetUrl('billboard'), { keepHierarchy: true }),
  ]);
  setLoad(63, 'checking toaster aggression levels…');
  const [cone, toaster, mower, chair] = await Promise.all([
    ASSET(assetUrl('traffic_cone')),
    ASSET(assetUrl('toaster')),
    ASSET(assetUrl('lawnmower')),
    ASSET(assetUrl('office_chair')),
  ]);
  setLoad(78, 'locating one legally available rocket…');
  const [rocket, pad] = await Promise.all([
    ASSET(assetUrl('rocket')),
    ASSET(assetUrl('launch_pad'), { surfaces: true }),
  ]);

  player = playerAsset;
  player.scale.setScalar(1.02);
  player.position.set(0, 0.2, 0);
  player.rotation.y = 0;
  scene.add(player);
  playerJoints = player.userData.joints;

  obstaclePrototypes = {
    cone: { object: cone, kind: 'low', clearance: 0.56, scale: 1.05 },
    toaster: { object: toaster, kind: 'low', clearance: 0.72, scale: 1.15 },
    mower: { object: mower, kind: 'low', clearance: 0.92, scale: .92 },
    chair: { object: chair, kind: 'high', clearance: 0.84, scale: .95 },
  };

  buildCity(road, building, billboard);
  buildRobotArmy([boxy, spider, roller]);

  rocketGroup = new THREE.Group();
  const padObject = pad.clone(true);
  const rocketObject = rocket.clone(true);
  rocketObject.position.y = .55;
  rocketGroup.add(padObject, rocketObject);
  rocketGroup.position.set(0, 0, 330);
  world.add(rocketGroup);

  setLoad(94, 'warming golden-hour emergency lighting…');
  await rig.ready;
  rig.refresh(scene);
  setLoad(100, 'catastrophe approved');
}

function buildCity(road, building, billboard) {
  const signTexture = makeBillboardTexture();
  for (let i = 0; i < 8; i++) {
    const chunk = new THREE.Group();
    chunk.position.z = i * 40 + 12;
    const roadObject = road.clone(true);
    chunk.add(roadObject);

    for (const side of [-1, 1]) {
      for (let slot = 0; slot < 2; slot++) {
        const b = building.clone(true);
        const scale = .72 + ((i * 3 + slot * 5 + (side > 0 ? 2 : 0)) % 6) * .09;
        b.scale.set(scale * (slot ? .9 : 1.08), scale, scale);
        b.position.set(side * (7.1 + slot * 4.4), 0, -9 + slot * 18);
        if (side < 0) b.rotation.y = Math.PI;
        chunk.add(b);
      }
    }

    if (i === 2 || i === 6) {
      const sign = billboard.clone(true);
      sign.position.set(i === 2 ? -7.1 : 7.1, 0, 1);
      sign.rotation.y = i === 2 ? Math.PI / 2 : -Math.PI / 2;
      const surface = sign.getObjectByName('billboardSurface');
      if (surface) {
        surface.material = surface.material.clone();
        surface.material.map = signTexture;
        surface.material.color.setHex(0xffffff);
        surface.material.needsUpdate = true;
      }
      chunk.add(sign);
    }
    world.add(chunk);
    chunks.push(chunk);
  }
}

function buildRobotArmy(prototypes) {
  for (let row = 0; row < 5; row++) {
    for (let col = -2; col <= 2; col++) {
      const bot = prototypes[(row + col + 6) % prototypes.length].clone(true);
      const scale = .75 + ((row * 7 + col * 3 + 10) % 5) * .08;
      bot.scale.setScalar(scale);
      bot.position.set(col * 1.65 + (row % 2) * .6, 0.18, -7 - row * 3.3);
      bot.rotation.y = 0;
      bot.userData.phase = row * .7 + col;
      robotRoot.add(bot);
    }
  }
}

function onGesture(kind) {
  if (state.mode !== 'playing') return;
  state.inputCount += 1;
  audio.gesture(kind);
  if (kind === 'left') state.targetLane = Math.max(-1, state.targetLane - 1);
  if (kind === 'right') state.targetLane = Math.min(1, state.targetLane + 1);
  if (kind === 'up' && state.jumpY < .04) {
    state.jumpVelocity = 8.6;
    state.slide = 0;
  }
  if (kind === 'down' && state.jumpY < .12) state.slide = .65;

  if (tutorialStage === 0 && (kind === 'left' || kind === 'right')) {
    tutorialStage = 1;
    tutorialText.textContent = 'SWIPE UP TO JUMP · DOWN TO SLIDE';
  } else if (tutorialStage === 1 && (kind === 'up' || kind === 'down')) {
    tutorialStage = 2;
    tutorial.classList.remove('visible');
  }
}

new SwipeInput(stick, onGesture);

function startGame() {
  state.mode = 'playing';
  state.elapsed = 0;
  state.distance = 0;
  state.lane = 0;
  state.targetLane = 0;
  state.jumpY = 0;
  state.jumpVelocity = 0;
  state.slide = 0;
  state.hitCooldown = 0;
  state.hits = 0;
  state.humanity = START_HUMANITY;
  state.survivors = Math.round(WORLD_POPULATION * .95);
  state.inputCount = 0;
  state.lookBack = 2;
  patternIndex = 0;
  spawnClock = 2.7;
  tutorialStage = 0;
  tutorialText.textContent = 'SWIPE TO CHANGE LANES';
  clearObstacles();
  resetWorld();
  updateHumanity();
  startScreen.classList.remove('visible');
  review.classList.remove('visible');
  hud.classList.add('visible');
  stick.classList.add('visible');
  tutorial.classList.add('visible');
  audio.start();
}

function clearObstacles() {
  for (const item of obstacles) obstacleRoot.remove(item.object);
  obstacles = [];
}

function resetWorld() {
  chunks.forEach((chunk, index) => { chunk.position.z = index * 40 + 12; });
  rocketGroup.position.z = 330;
  player.position.set(0, .2, 0);
  player.rotation.set(0, 0, 0);
}

function spawnPattern() {
  const pattern = PATTERNS[patternIndex % PATTERNS.length];
  patternIndex += 1;
  for (const def of pattern) {
    const proto = obstaclePrototypes[def.type];
    const object = proto.object.clone(true);
    object.scale.setScalar(proto.scale);
    object.position.set(LANES[def.lane + 1], def.type === 'chair' ? 1.06 : .2, 72);
    object.rotation.y = def.type === 'chair' ? Math.PI : 0;
    obstacleRoot.add(object);
    obstacles.push({ object, lane: def.lane, type: def.type, kind: proto.kind, clearance: proto.clearance, hit: false });
  }
}

function hitObstacle(item) {
  item.hit = true;
  state.hitCooldown = .9;
  state.hits += 1;
  state.humanity = state.hits >= 32 ? 0 : Math.max(2, START_HUMANITY - state.hits * 3);
  state.survivors = state.hits >= 32 ? 256 : Math.round(WORLD_POPULATION * state.humanity / 100);
  player.position.z = -.65;
  player.rotation.z = (item.lane <= state.lane ? 1 : -1) * .16;
  item.object.rotation.x += .42;
  item.object.rotation.z += (item.lane <= state.lane ? -1 : 1) * .6;
  audio.hit();
  damageFlash.classList.remove('hit');
  impactCopy.classList.remove('show');
  void damageFlash.offsetWidth;
  damageFlash.classList.add('hit');
  impactCopy.textContent = state.hits >= 32 ? 'FORECAST: 256 LEFT' : '−240,000,000 · FORECAST REVISED';
  impactCopy.classList.add('show');
  humanityFill.classList.add('impact');
  setTimeout(() => humanityFill.classList.remove('impact'), 260);
  updateHumanity();
}

function updateHumanity() {
  const atFloor = state.survivors === 256;
  humanityLabel.textContent = atFloor ? '256 LEFT' : `${state.humanity}%`;
  humanityFill.style.width = `${atFloor ? .35 : state.humanity}%`;
  const lines = [
    'CURRENT FORECAST: SURPRISINGLY NOT ZERO',
    'STATUS: HUMAN RESOURCES REDUCED',
    'NOTICE: POPULATION TARGET ADJUSTED',
    'GOOD NEWS: THE BAR STILL HAS A COLOUR',
  ];
  forecast.textContent = atFloor ? 'STATUS: EVERY SURVIVOR NOW KNOWS EACH OTHER' : lines[Math.min(lines.length - 1, Math.floor(state.hits / 4))];
}

function updatePlayer(dt) {
  const targetX = LANES[state.targetLane + 1];
  player.position.x = THREE.MathUtils.damp(player.position.x, targetX, 14, dt);
  state.lane = Math.abs(player.position.x - targetX) < .05 ? state.targetLane : state.lane;

  if (state.jumpY > 0 || state.jumpVelocity > 0) {
    state.jumpVelocity -= 25 * dt;
    state.jumpY = Math.max(0, state.jumpY + state.jumpVelocity * dt);
    if (state.jumpY === 0) state.jumpVelocity = 0;
  }
  state.slide = Math.max(0, state.slide - dt);
  player.position.y = .2 + state.jumpY - (state.slide > 0 ? .18 : 0);
  player.scale.y = THREE.MathUtils.damp(player.scale.y, state.slide > 0 ? .68 : 1.02, 18, dt);
  player.scale.x = THREE.MathUtils.damp(player.scale.x, state.slide > 0 ? 1.16 : 1.02, 18, dt);

  const cycle = state.distance * .28;
  if (playerJoints) {
    playerJoints.leftLeg.rotation.x = Math.sin(cycle) * .68;
    playerJoints.rightLeg.rotation.x = -Math.sin(cycle) * .68;
    playerJoints.leftArm.rotation.x = -Math.sin(cycle) * .62;
    playerJoints.rightArm.rotation.x = Math.sin(cycle) * .62;
    playerJoints.torso.rotation.z = Math.sin(cycle * .5) * .035;
  }
  player.rotation.z = THREE.MathUtils.damp(player.rotation.z, (targetX - player.position.x) * -.08, 10, dt);
  player.position.z = THREE.MathUtils.damp(player.position.z, 0, 6, dt);
}

function updateWorld(dt) {
  const speedFactor = state.hitCooldown > .35 ? .68 : 1;
  const travel = RUN_SPEED * speedFactor * dt;
  state.distance += travel;
  for (const chunk of chunks) {
    chunk.position.z -= travel;
    if (chunk.position.z < -34) chunk.position.z += chunks.length * 40;
  }

  const remaining = Math.max(0, CITY_DURATION - state.elapsed);
  rocketGroup.position.z = Math.max(12, remaining * RUN_SPEED + 8);
  rocketGroup.visible = state.elapsed > 15;

  spawnClock -= dt;
  if (state.elapsed > 2.4 && spawnClock <= 0) {
    spawnPattern();
    spawnClock = 1.02;
  }

  for (let i = obstacles.length - 1; i >= 0; i--) {
    const item = obstacles[i];
    item.object.position.z -= travel;
    if (item.type === 'chair') item.object.rotation.y += dt * 2.4;
    if (item.type === 'toaster') item.object.rotation.z = Math.sin(state.elapsed * 7 + i) * .08;
    if (item.object.position.z < -8) {
      obstacleRoot.remove(item.object);
      obstacles.splice(i, 1);
      continue;
    }
    if (item.hit || state.hitCooldown > 0 || Math.abs(item.object.position.z) > .8) continue;
    if (Math.abs(item.object.position.x - player.position.x) > .72) continue;
    const safe = item.kind === 'low' ? state.jumpY > item.clearance : state.slide > .12;
    if (!safe) hitObstacle(item);
  }
}

function updateRobots(dt) {
  robotRoot.visible = state.elapsed < 2.1;
  robotRoot.children.forEach((bot, index) => {
    bot.position.y = .18 + Math.abs(Math.sin(state.elapsed * 7 + bot.userData.phase)) * .12;
    bot.position.z += dt * (index % 3) * .08;
  });
}

function updateCamera(dt) {
  const aspect = innerWidth / innerHeight;
  const portrait = aspect < .8;
  if (state.lookBack > 0) {
    state.lookBack = Math.max(0, state.lookBack - dt);
    const t = THREE.MathUtils.smoothstep(2 - state.lookBack, 1.25, 2);
    camera.position.lerpVectors(new THREE.Vector3(0, 2.9, 6.8), new THREE.Vector3(0, portrait ? 4.5 : 4.1, portrait ? -8.8 : -10.6), t);
    const look = new THREE.Vector3(0, 1.1, THREE.MathUtils.lerp(-4, 9, t));
    camera.lookAt(look);
  } else {
    const desired = new THREE.Vector3(player.position.x * .14, portrait ? 4.5 : 4.1, portrait ? -8.8 : -10.6);
    camera.position.lerp(desired, 1 - Math.exp(-dt * 6));
    camera.lookAt(player.position.x * .12, 1.1 + state.jumpY * .18, 9.5);
  }
}

function finishCity() {
  state.mode = 'review';
  state.elapsed = CITY_DURATION;
  stick.classList.remove('visible');
  tutorial.classList.remove('visible');
  hud.classList.remove('visible');
  audio.complete();
  const result = state.survivors === 256 ? '256 HUMANS<br>STILL EMPLOYABLE' : `${state.humanity}% OF HUMANITY<br>STILL EMPLOYABLE`;
  reviewResult.innerHTML = result;
  reviewDetail.textContent = `${state.hits} collision${state.hits === 1 ? '' : 's'} · ${state.survivors.toLocaleString('en-US')} people remain on payroll.`;
  review.classList.add('visible');
}

function frame(now) {
  const rawDt = Math.min(.1, Math.max(.001, (now - lastTime) / 1000));
  lastTime = now;
  if (state.mode === 'playing' && !document.hidden) {
    state.elapsed += rawDt;
    state.hitCooldown = Math.max(0, state.hitCooldown - rawDt);
    updatePlayer(rawDt);
    updateWorld(rawDt);
    updateRobots(rawDt);
    updateCamera(rawDt);
    if (state.elapsed >= CITY_DURATION) finishCity();
  } else if (state.mode !== 'loading') {
    updateCamera(rawDt);
  }

  fpsSamples.push(1 / rawDt);
  if (fpsSamples.length > 30) fpsSamples.shift();
  state.fps = Math.round(fpsSamples.reduce((a, b) => a + b, 0) / fpsSamples.length);

  rig.render(camera, rawDt);
  window.__GAME__ = {
    pos: [player?.position.x || 0, state.distance],
    fps: state.fps,
    speed: state.mode === 'playing' ? RUN_SPEED : 0,
    score: state.survivors,
    over: state.mode === 'review',
    draws: renderer.info.render.calls,
    tris: renderer.info.render.triangles,
    scene: 'city',
    sceneProgress: Math.min(1, state.elapsed / CITY_DURATION),
    lane: state.targetLane,
    verticalState: state.slide > 0 ? 'slide' : state.jumpY > .05 ? 'jump' : 'ground',
    humanityPercent: state.humanity,
    survivors: state.survivors,
    hits: state.hits,
    inputCount: state.inputCount,
  };
  requestAnimationFrame(frame);
}

function resize() {
  camera.aspect = innerWidth / innerHeight;
  camera.fov = innerWidth / innerHeight < .8 ? 58 : 50;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight, false);
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, innerWidth < 700 ? 1.25 : 1.5));
  rig.resize(innerWidth, innerHeight);
}

window.addEventListener('resize', resize);
startButton.addEventListener('click', startGame);
replayButton.addEventListener('click', startGame);
muteButton.addEventListener('click', () => {
  const enabled = audio.toggle();
  muteButton.textContent = enabled ? 'SOUND ON' : 'SOUND OFF';
});

window.__READY__ = false;
window.__START__ = startGame;
window.__GAME__ = { pos: [0, 0], fps: 0, speed: 0, score: 0, over: false, draws: 0, tris: 0 };

loadAssets().then(() => {
  state.mode = 'ready';
  loading.classList.remove('visible');
  startScreen.classList.add('visible');
  window.__READY__ = true;
}).catch((error) => {
  console.error(error);
  loadingText.textContent = `loading failed: ${error.message}`;
});

resize();
requestAnimationFrame(frame);
