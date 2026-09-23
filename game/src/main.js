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
const beginButton = $('#beginRun');
const hud = $('#hud');
const stick = $('#stick');
const tutorial = $('#tutorial');
const tutorialText = $('#tutorialText');
const humanityLabel = $('#humanityLabel');
const humanityFill = $('#humanityFill');
const populationCrowd = $('#populationCrowd');
const robotAdvance = $('#robotAdvance');
const forecast = $('#forecast');
const actLabel = $('#actLabel');
const damageFlash = $('#damageFlash');
const impactCopy = $('#impactCopy');
const muteButton = $('#mute');
const devPauseButton = $('#devPause');
const devPausedLabel = $('#devPaused');
const sceneBanner = $('#sceneBanner');
const sceneKicker = $('#sceneKicker');
const sceneTitle = $('#sceneTitle');
const sceneOrder = $('#sceneOrder');
const climbScreen = $('#climb');
const climbFill = $('#climbFill');
const climbTap = $('#climbTap');
const climbStatus = $('#climbStatus');
const dockingScreen = $('#docking');
const dockingTitle = $('#dockingTitle');
const dockingCopy = $('#dockingCopy');
const switchScreen = $('#switchScreen');
const masterTap = $('#masterTap');
const finale = $('#finale');
const subtitle = $('#subtitle');
const finalSummary = $('#finalSummary');
const comicPanels = [...document.querySelectorAll('.comic-panel')];
const comicCount = $('#comicCount');

const params = new URLSearchParams(location.search);
const TEST_MODE = params.has('test');
const DEV_MODE = params.has('dev') || TEST_MODE || ['localhost', '127.0.0.1'].includes(location.hostname);
const START_SCENE = params.get('scene');
const ACT_DURATION = TEST_MODE ? 3.6 : 25;
const CLIMB_DURATION = TEST_MODE ? 1.8 : 5;
const DOCK_DURATION = TEST_MODE ? 1.5 : 3;
// The chase camera looks toward +Z, so screen-left is world +X.
const LANES = [2.2, 0, -2.2];
const WORLD_POPULATION = 8_000_000_000;
const START_HUMANITY = 95;
const crowdPeople = Array.from({ length: 25 }, () => {
  const person = document.createElement('span');
  person.className = 'population-person';
  populationCrowd.append(person);
  return person;
});

const ACTS = {
  city: { kicker: 'ACT 1', title: 'CITY RUN', order: 'GET TO THE ROCKET', speed: 12.5, spawnEvery: 1.06 },
  space: { kicker: 'ACT 2', title: 'SPACE FLIGHT', order: 'DODGE ORBITAL ADMINISTRATION', speed: 15.2, spawnEvery: 1.02 },
  station: { kicker: 'ACT 3', title: 'STATION CORRIDOR', order: 'FIND THE BIG RED BUTTON', speed: 13.4, spawnEvery: 1.0 },
};

const CITY_PATTERNS = [
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
];

const SPACE_PATTERNS = [
  [{ lane: 0, type: 'debris' }],
  [{ lane: -1, type: 'satelliteLow' }],
  [{ lane: 1, type: 'satelliteHigh' }],
  [{ lane: -1, type: 'debris' }, { lane: 1, type: 'debris' }],
  [{ lane: 0, type: 'satelliteHigh' }, { lane: 1, type: 'debris' }],
  [{ lane: -1, type: 'satelliteLow' }, { lane: 0, type: 'debris' }],
  [{ lane: 1, type: 'satelliteLow' }],
  [{ lane: -1, type: 'satelliteHigh' }, { lane: 1, type: 'satelliteHigh' }],
];

const STATION_PATTERNS = [
  [{ lane: 0, type: 'security' }],
  [{ lane: -1, type: 'laserLow' }],
  [{ lane: 1, type: 'laserHigh' }],
  [{ lane: -1, type: 'security' }, { lane: 1, type: 'security' }],
  [{ lane: 0, type: 'laserHigh' }, { lane: 1, type: 'laserLow' }],
  [{ lane: -1, type: 'laserLow' }, { lane: 0, type: 'security' }],
  [{ lane: 1, type: 'laserLow' }],
  [{ lane: -1, type: 'laserHigh' }, { lane: 1, type: 'laserHigh' }],
];

const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, powerPreference: 'high-performance' });
renderer.setSize(innerWidth, innerHeight, false);
renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 1.35));
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(55, innerWidth / innerHeight, 0.1, 850);
const cityRoot = new THREE.Group();
const spaceRoot = new THREE.Group();
const stationRoot = new THREE.Group();
const interludeRoot = new THREE.Group();
const actorRoot = new THREE.Group();
const obstacleRoot = new THREE.Group();
const robotRoot = new THREE.Group();
scene.add(cityRoot, spaceRoot, stationRoot, interludeRoot, actorRoot, obstacleRoot, robotRoot);

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
  mode: 'loading', act: 'city', elapsed: 0, totalElapsed: 0, distance: 0,
  lane: 0, targetLane: 0, jumpY: 0, jumpVelocity: 0, slide: 0,
  hitCooldown: 0, hits: 0, humanity: START_HUMANITY,
  survivors: Math.round(WORLD_POPULATION * START_HUMANITY / 100),
  inputCount: 0, fps: 60, lookBack: 0, climbProgress: 0,
  interludeElapsed: 0, dockSoundPlayed: false,
  paused: false,
};

let player;
let playerJoints;
let ship;
let cityChunks = [];
let stationChunks = [];
let obstacles = [];
let prototypes = { city: {}, space: {}, station: {} };
let rocketGroup;
let stationSwitch;
let stationEarth;
let dockingPort;
let spaceBackdrop;
let climbLadder;
let climbRocket;
let lastTime = performance.now();
let fpsSamples = [];
let patternIndex = 0;
let spawnClock = 0;
let tutorialStage = 0;
let comicIndex = 0;
let comicTimer = 0;
let finaleToken = 0;

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
  setLoad(8, 'authorising unscheduled heroism…');
  const [playerAsset, shipAsset, boxy, spider, roller] = await Promise.all([
    ASSET(assetUrl('player_hoodie'), { keepHierarchy: true }),
    ASSET(assetUrl('player_ship'), { keepHierarchy: true }),
    ASSET(assetUrl('robot_boxy')),
    ASSET(assetUrl('robot_spider')),
    ASSET(assetUrl('robot_roller')),
  ]);

  setLoad(26, 'weaponising household appliances…');
  const [road, building, billboard, cone, toaster, mower, chair, rocket, hub, wayfinder] = await Promise.all([
    ASSET(assetUrl('city_road'), { surfaces: true }),
    ASSET(assetUrl('city_building'), { surfaces: true }),
    ASSET(assetUrl('billboard'), { keepHierarchy: true }),
    ASSET(assetUrl('traffic_cone')),
    ASSET(assetUrl('toaster')),
    ASSET(assetUrl('lawnmower')),
    ASSET(assetUrl('office_chair')),
    ASSET(assetUrl('rocket')),
    ASSET(assetUrl('rocket_hub'), { surfaces: true }),
    ASSET(assetUrl('spaceport_wayfinder'), { surfaces: true }),
  ]);

  setLoad(54, 'auditing low-orbit litter…');
  const [satellite, debris, backdrop, port] = await Promise.all([
    ASSET(assetUrl('satellite')),
    ASSET(assetUrl('space_debris')),
    ASSET(assetUrl('space_backdrop'), { keepHierarchy: true }),
    ASSET(assetUrl('docking_port'), { keepHierarchy: true }),
  ]);

  setLoad(72, 'installing corridor bureaucracy…');
  const [corridor, laser, security, masterSwitch, earth, ladder] = await Promise.all([
    ASSET(assetUrl('station_corridor')),
    ASSET(assetUrl('laser_gate'), { keepHierarchy: true }),
    ASSET(assetUrl('security_bot')),
    ASSET(assetUrl('master_switch'), { keepHierarchy: true }),
    ASSET(assetUrl('earth')),
    ASSET(assetUrl('ladder')),
  ]);

  player = playerAsset;
  player.scale.setScalar(1.02);
  player.position.set(0, 0.2, 0);
  playerJoints = player.userData.joints;
  actorRoot.add(player);

  ship = shipAsset;
  ship.scale.setScalar(0.88);
  ship.position.set(0, 0.4, 0);
  ship.visible = false;
  actorRoot.add(ship);

  prototypes.city = {
    cone: { object: cone, kind: 'low', clearance: 0.56, scale: 1.05, y: 0.2 },
    toaster: { object: toaster, kind: 'low', clearance: 0.72, scale: 1.15, y: 0.2 },
    mower: { object: mower, kind: 'low', clearance: 0.92, scale: 0.92, y: 0.2 },
    chair: { object: chair, kind: 'high', clearance: 0.84, scale: 0.95, y: 1.06 },
  };
  prototypes.space = {
    debris: { object: debris, kind: 'low', clearance: 0.74, scale: 0.95, y: 0.45 },
    satelliteLow: { object: satellite, kind: 'low', clearance: 0.88, scale: 0.72, y: 0.2 },
    satelliteHigh: { object: satellite, kind: 'high', clearance: 0.9, scale: 0.72, y: 1.2 },
  };
  prototypes.station = {
    security: { object: security, kind: 'low', clearance: 0.82, scale: 0.95, y: 0.2 },
    laserLow: { object: laser, kind: 'low', clearance: 0.78, scale: 1, y: 0.2 },
    laserHigh: { object: laser, kind: 'high', clearance: 0.8, scale: 1, y: 0.2, beamLift: 0.76 },
  };

  buildCity(road, building, billboard, rocket, hub, wayfinder);
  buildRobotArmy([boxy, spider, roller]);
  buildSpace(backdrop, port);
  buildStation(corridor, masterSwitch, earth);
  buildClimb(ladder, rocket, [boxy, spider, roller]);

  setLoad(92, 'warming emergency lighting…');
  await rig.ready;
  rig.refresh(scene);
  setWorld('city');
  player.visible = false;
  setLoad(100, 'catastrophe approved');
}

function buildCity(road, building, billboard, rocket, hub, wayfinder) {
  const signTexture = makeBillboardTexture();
  // The whole road exists from the first frame; no distant section is recycled into view.
  for (let i = 0; i < 10; i++) {
    const chunk = new THREE.Group();
    chunk.position.z = i * 40 + 12;
    chunk.add(road.clone(true));
    for (const side of [-1, 1]) {
      for (let slot = 0; slot < 2; slot++) {
        const b = building.clone(true);
        const scale = 0.72 + ((i * 3 + slot * 5 + (side > 0 ? 2 : 0)) % 6) * 0.09;
        b.scale.set(scale * (slot ? 0.9 : 1.08), scale, scale);
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
    if ([1, 4, 7].includes(i)) {
      const arch = wayfinder.clone(true);
      arch.position.z = -8;
      chunk.add(arch);
    }
    cityRoot.add(chunk);
    cityChunks.push(chunk);
  }
  rocketGroup = new THREE.Group();
  const rocketObject = rocket.clone(true);
  rocketObject.position.y = 0.55;
  rocketObject.name = 'cityRocket';
  rocketGroup.add(hub, rocketObject);
  rocketGroup.position.set(0, 0, 330);
  cityRoot.add(rocketGroup);
}

function buildRobotArmy(robotAssets) {
  for (let row = 0; row < 5; row++) {
    for (let col = -2; col <= 2; col++) {
      const bot = robotAssets[(row + col + 6) % robotAssets.length].clone(true);
      const scale = 0.75 + ((row * 7 + col * 3 + 10) % 5) * 0.08;
      bot.scale.setScalar(scale);
      bot.position.set(col * 1.65 + (row % 2) * 0.6, 0.18, -7 - row * 3.3);
      bot.userData.phase = row * 0.7 + col;
      bot.userData.homeZ = bot.position.z;
      robotRoot.add(bot);
    }
  }
}

function buildSpace(backdrop, port) {
  spaceBackdrop = backdrop;
  spaceBackdrop.position.y = -140;
  spaceRoot.add(spaceBackdrop);
  dockingPort = port;
  dockingPort.position.set(0, 0, 120);
  dockingPort.visible = false;
  spaceRoot.add(dockingPort);
}

function buildStation(corridor, masterSwitch, earth) {
  for (let i = 0; i < 7; i++) {
    const chunk = corridor.clone(true);
    chunk.position.z = i * 40 + 12;
    stationRoot.add(chunk);
    stationChunks.push(chunk);
  }
  stationSwitch = masterSwitch;
  stationSwitch.position.set(0, 0, 330);
  stationRoot.add(stationSwitch);
  stationEarth = earth;
  stationEarth.scale.setScalar(1.35);
  stationEarth.position.set(0, 3.2, 365);
  stationRoot.add(stationEarth);
}

function buildClimb(ladder, rocket, robotAssets) {
  climbLadder = ladder;
  climbLadder.position.set(0, 0, 4);
  interludeRoot.add(climbLadder);
  climbRocket = rocket.clone(true);
  climbRocket.scale.setScalar(0.72);
  climbRocket.position.set(4.1, 0, 11);
  interludeRoot.add(climbRocket);
  for (let i = 0; i < 8; i++) {
    const bot = robotAssets[i % robotAssets.length].clone(true);
    bot.scale.setScalar(0.62 + (i % 3) * 0.08);
    bot.position.set(2 + (i % 4) * 1.15, 0.15, 7 + Math.floor(i / 4) * 1.8);
    bot.rotation.y = -0.3;
    bot.userData.phase = i;
    interludeRoot.add(bot);
  }
}

function setWorld(kind) {
  cityRoot.visible = kind === 'city';
  spaceRoot.visible = kind === 'space' || kind === 'docking';
  stationRoot.visible = kind === 'station' || kind === 'switch';
  interludeRoot.visible = kind === 'climb';
  obstacleRoot.visible = kind === 'city' || kind === 'space' || kind === 'station';
  robotRoot.visible = false;
}

function showBanner(kicker, title, order) {
  sceneKicker.textContent = kicker;
  sceneTitle.textContent = title;
  sceneOrder.textContent = order;
  sceneBanner.classList.remove('show');
  void sceneBanner.offsetWidth;
  sceneBanner.classList.add('show');
}

function showComic(index) {
  comicIndex = (index + comicPanels.length) % comicPanels.length;
  comicPanels.forEach((panel, i) => panel.classList.toggle('active', i === comicIndex));
  comicCount.textContent = `${comicIndex + 1} / ${comicPanels.length}`;
}

function revealIntro() {
  startScreen.classList.remove('intro-playing');
  startScreen.classList.add('intro-revealed');
  document.body.classList.remove('intro-playing');
}

function onGesture(kind) {
  if (state.mode !== 'playing' || state.paused) return;
  state.inputCount += 1;
  audio.gesture(kind);
  // The City introduction faces the runner briefly; follow screen direction during that camera flip.
  const screenLeftStep = camera.getWorldDirection(new THREE.Vector3()).z < 0 ? 1 : -1;
  if (kind === 'left') state.targetLane = THREE.MathUtils.clamp(state.targetLane + screenLeftStep, -1, 1);
  if (kind === 'right') state.targetLane = THREE.MathUtils.clamp(state.targetLane - screenLeftStep, -1, 1);
  if (kind === 'up' && state.jumpY < 0.04) {
    state.jumpVelocity = state.act === 'space' ? 9.8 : 8.6;
    state.slide = 0;
  }
  if (kind === 'down' && state.jumpY < 0.12) state.slide = state.act === 'space' ? 0.78 : 0.65;

  if (state.act === 'city' && tutorialStage === 0 && (kind === 'left' || kind === 'right')) {
    tutorialStage = 1;
    tutorialText.textContent = 'SWIPE UP TO JUMP · DOWN TO SLIDE';
  } else if (state.act === 'city' && tutorialStage === 1 && (kind === 'up' || kind === 'down')) {
    tutorialStage = 2;
    tutorial.classList.remove('visible');
  }
}

new SwipeInput(stick, onGesture);

function syncDevPause() {
  const available = DEV_MODE && ['playing', 'climb', 'docking'].includes(state.mode);
  devPauseButton.classList.toggle('visible', available);
  devPauseButton.classList.toggle('paused', state.paused);
  devPauseButton.textContent = state.paused ? '▶' : 'Ⅱ';
  devPauseButton.setAttribute('aria-label', state.paused ? 'Resume game' : 'Pause game');
  devPauseButton.title = state.paused ? 'Resume game' : 'Pause game';
  devPausedLabel.classList.toggle('visible', available && state.paused);
  document.body.classList.toggle('dev-paused', state.paused);
}

function setDevPaused(paused) {
  if (!DEV_MODE || !['playing', 'climb', 'docking'].includes(state.mode)) return;
  state.paused = paused;
  audio.setPaused(paused);
  syncDevPause();
}

function resetRun() {
  state.hits = 0;
  state.humanity = START_HUMANITY;
  state.survivors = Math.round(WORLD_POPULATION * START_HUMANITY / 100);
  state.inputCount = 0;
  state.totalElapsed = 0;
  state.distance = 0;
  updateHumanity();
}

function startGame() {
  finaleToken += 1;
  clearInterval(comicTimer);
  document.body.classList.remove('intro-playing');
  [startScreen, climbScreen, dockingScreen, switchScreen, finale].forEach((screen) => screen.classList.remove('visible'));
  finale.classList.remove('done');
  resetRun();
  state.paused = false;
  audio.setPaused(false);
  audio.start();
  startAct(['city', 'space', 'station'].includes(START_SCENE) ? START_SCENE : 'city');
}

function startAct(name) {
  const act = ACTS[name];
  state.mode = 'playing';
  syncDevPause();
  state.act = name;
  state.elapsed = 0;
  state.lane = 0;
  state.targetLane = 0;
  state.jumpY = 0;
  state.jumpVelocity = 0;
  state.slide = 0;
  state.hitCooldown = 0;
  state.lookBack = name === 'city' ? 2 : 0;
  patternIndex = 0;
  spawnClock = 2.7;
  tutorialStage = 0;
  clearObstacles();
  resetWorld(name);
  setWorld(name);
  player.visible = name !== 'space';
  ship.visible = name === 'space';
  actLabel.textContent = `${act.title} · ${act.order}`;
  hud.classList.add('visible');
  hud.classList.toggle('on-dark', name === 'space');
  stick.classList.add('visible');
  tutorial.classList.toggle('visible', name === 'city');
  tutorialText.textContent = name === 'city' ? 'SWIPE TO CHANGE LANES' : 'SAME SWIPES · NOW WITH VACUUM';
  if (name === 'space') {
    tutorial.classList.add('visible');
    setTimeout(() => {
      if (state.mode === 'playing' && state.act === 'space') tutorial.classList.remove('visible');
    }, 2600);
  }
  audio.setAct(name);
  rig.setTime(name === 'city' ? { hour: 17.1, azimuth: 238 } : name === 'space' ? { hour: 10.5, azimuth: 210 } : { hour: 12.2, azimuth: 160 });
  if (name === 'city') {
    // Place the obstacles along the road now, so each one is approached in space.
    const spacing = ACTS.city.speed * ACTS.city.spawnEvery;
    for (let i = 0; i < 18; i++) spawnPattern(106 + i * spacing);
  }
  showBanner(act.kicker, act.title, act.order);
}

function clearObstacles() {
  for (const item of obstacles) obstacleRoot.remove(item.object);
  obstacles = [];
}

function resetWorld(name) {
  cityChunks.forEach((chunk, index) => { chunk.position.z = index * 40 + 12; });
  stationChunks.forEach((chunk, index) => { chunk.position.z = index * 40 + 12; });
  rocketGroup.position.set(0, 0, 330);
  rocketGroup.visible = name === 'city';
  stationSwitch.position.set(0, 0, 330);
  stationSwitch.visible = false;
  stationEarth.position.z = 365;
  dockingPort.position.set(0, 0, 120);
  dockingPort.visible = false;
  robotRoot.children.forEach((bot) => { bot.position.z = bot.userData.homeZ; });
  player.position.set(0, 0.2, 0);
  player.rotation.set(0, 0, 0);
  player.scale.setScalar(1.02);
  ship.position.set(0, 0.4, 0);
  ship.rotation.set(0, 0, 0);
  ship.scale.setScalar(0.88);
  if (spaceBackdrop) spaceBackdrop.rotation.set(0, 0, 0);
  if (name === 'city') camera.position.set(0, 2.9, 6.8);
}

function activePatterns() {
  if (state.act === 'space') return SPACE_PATTERNS;
  if (state.act === 'station') return STATION_PATTERNS;
  return CITY_PATTERNS;
}

function spawnPattern(z = state.act === 'space' ? 82 : 72) {
  const patterns = activePatterns();
  const pattern = patterns[patternIndex % patterns.length];
  patternIndex += 1;
  for (const def of pattern) {
    const proto = prototypes[state.act][def.type];
    const object = proto.object.clone(true);
    object.scale.setScalar(proto.scale);
    object.position.set(LANES[def.lane + 1], proto.y, z);
    if (def.type === 'chair') object.rotation.y = Math.PI;
    if (proto.beamLift) {
      object.traverse((node) => {
        if (node.name === 'laserBeam') node.position.y += proto.beamLift;
      });
    }
    obstacleRoot.add(object);
    obstacles.push({
      object, lane: def.lane, type: def.type, kind: proto.kind,
      clearance: proto.clearance, hit: false, phase: patternIndex + def.lane,
    });
  }
}

function activeActor() {
  return state.act === 'space' ? ship : player;
}

function hitObstacle(item) {
  item.hit = true;
  state.hitCooldown = 0.9;
  state.hits += 1;
  state.humanity = state.hits >= 32 ? 0 : Math.max(2, START_HUMANITY - state.hits * 3);
  state.survivors = state.hits >= 32 ? 256 : Math.round(WORLD_POPULATION * state.humanity / 100);
  const actor = activeActor();
  actor.position.z = -0.65;
  actor.rotation.z = (item.lane <= state.lane ? 1 : -1) * 0.18;
  item.object.rotation.x += 0.42;
  item.object.rotation.z += (item.lane <= state.lane ? -1 : 1) * 0.6;
  audio.hit();
  damageFlash.classList.remove('hit');
  impactCopy.classList.remove('show');
  void damageFlash.offsetWidth;
  damageFlash.classList.add('hit');
  const copy = {
    city: '−240,000,000 · FORECAST REVISED',
    space: 'HULL DENT · EARTH BLAMES YOU',
    station: 'SECURITY INCIDENT FORM OPENED',
  };
  impactCopy.textContent = state.hits >= 32 ? 'FORECAST: 256 LEFT' : copy[state.act];
  impactCopy.classList.add('show');
  humanityFill.classList.add('impact');
  setTimeout(() => humanityFill.classList.remove('impact'), 260);
  updateHumanity();
  robotAdvance.classList.remove('firing');
  void robotAdvance.offsetWidth;
  robotAdvance.classList.add('firing');
}

function updateHumanity() {
  const atFloor = state.survivors === 256;
  const visibleHumanity = atFloor ? 0.35 : state.humanity;
  const survivingIcons = atFloor ? 1 : Math.ceil(visibleHumanity * crowdPeople.length / 100);
  humanityLabel.textContent = atFloor ? '256 LEFT' : `${state.humanity}%`;
  humanityFill.style.width = `${visibleHumanity}%`;
  robotAdvance.style.left = `${Math.min(95, Math.max(5, 100 - visibleHumanity))}%`;
  crowdPeople.forEach((person, index) => {
    person.classList.toggle('gone', index < crowdPeople.length - survivingIcons);
  });
  const lines = [
    'CURRENT FORECAST: SURPRISINGLY NOT ZERO',
    'STATUS: HUMAN RESOURCES REDUCED',
    'NOTICE: POPULATION TARGET ADJUSTED',
    'GOOD NEWS: THE BAR STILL HAS A COLOUR',
  ];
  forecast.textContent = atFloor
    ? 'STATUS: EVERY SURVIVOR NOW KNOWS EACH OTHER'
    : lines[Math.min(lines.length - 1, Math.floor(state.hits / 4))];
}

function updateActor(dt) {
  const actor = activeActor();
  const targetX = LANES[state.targetLane + 1];
  actor.position.x = THREE.MathUtils.damp(actor.position.x, targetX, 14, dt);
  state.lane = Math.abs(actor.position.x - targetX) < 0.05 ? state.targetLane : state.lane;

  if (state.jumpY > 0 || state.jumpVelocity > 0) {
    state.jumpVelocity -= (state.act === 'space' ? 28 : 25) * dt;
    state.jumpY = Math.max(0, state.jumpY + state.jumpVelocity * dt);
    if (state.jumpY === 0) state.jumpVelocity = 0;
  }
  state.slide = Math.max(0, state.slide - dt);

  if (state.act === 'space') {
    ship.position.y = 0.4 + state.jumpY - (state.slide > 0 ? 0.55 : 0) + Math.sin(state.elapsed * 4.2) * 0.06;
    ship.rotation.x = THREE.MathUtils.damp(ship.rotation.x, state.slide > 0 ? -0.18 : state.jumpY > 0.1 ? 0.12 : 0, 8, dt);
    ship.rotation.z = THREE.MathUtils.damp(ship.rotation.z, (targetX - ship.position.x) * -0.16, 9, dt);
  } else {
    player.position.y = 0.2 + state.jumpY - (state.slide > 0 ? 0.18 : 0);
    player.scale.y = THREE.MathUtils.damp(player.scale.y, state.slide > 0 ? 0.68 : 1.02, 18, dt);
    player.scale.x = THREE.MathUtils.damp(player.scale.x, state.slide > 0 ? 1.16 : 1.02, 18, dt);
    const cycle = state.distance * 0.28;
    if (playerJoints) {
      playerJoints.leftLeg.rotation.x = Math.sin(cycle) * 0.68;
      playerJoints.rightLeg.rotation.x = -Math.sin(cycle) * 0.68;
      playerJoints.leftArm.rotation.x = -Math.sin(cycle) * 0.62;
      playerJoints.rightArm.rotation.x = Math.sin(cycle) * 0.62;
      playerJoints.torso.rotation.z = Math.sin(cycle * 0.5) * 0.035;
    }
    player.rotation.z = THREE.MathUtils.damp(player.rotation.z, (targetX - player.position.x) * -0.08, 10, dt);
  }
  actor.position.z = THREE.MathUtils.damp(actor.position.z, 0, 6, dt);
}

function updatePlayingWorld(dt) {
  const act = ACTS[state.act];
  const speedFactor = state.hitCooldown > 0.35 ? 0.68 : 1;
  const travel = act.speed * speedFactor * dt;
  state.distance += travel;

  const chunks = state.act === 'city' ? cityChunks : state.act === 'station' ? stationChunks : [];
  for (const chunk of chunks) {
    chunk.position.z -= travel;
    if (state.act === 'station' && chunk.position.z < -34) chunk.position.z += chunks.length * 40;
  }

  const remaining = Math.max(0, ACT_DURATION - state.elapsed);
  if (state.act === 'city') {
    rocketGroup.position.z = Math.max(12, 330 - state.distance);
  } else if (state.act === 'space') {
    spaceBackdrop.rotation.y += dt * 0.012;
    dockingPort.position.z = Math.max(14, remaining * act.speed + 10);
    dockingPort.visible = state.elapsed > ACT_DURATION * 0.62;
    dockingPort.children.forEach((child, i) => { if (child.name.startsWith('dockRing')) child.rotation.z += dt * (i % 2 ? -0.55 : 0.4); });
  } else {
    stationSwitch.position.z = Math.max(11, remaining * act.speed + 8);
    stationEarth.position.z = stationSwitch.position.z + 42;
    stationSwitch.visible = state.elapsed > ACT_DURATION * 0.6;
  }

  spawnClock -= dt;
  if (state.act !== 'city' && state.elapsed > 2.35 && spawnClock <= 0) {
    spawnPattern();
    spawnClock = act.spawnEvery;
  }

  const actor = activeActor();
  for (let i = obstacles.length - 1; i >= 0; i--) {
    const item = obstacles[i];
    item.object.position.z -= travel;
    animateObstacle(item, dt, i);
    if (item.object.position.z < -9) {
      obstacleRoot.remove(item.object);
      obstacles.splice(i, 1);
      continue;
    }
    if (item.hit || state.hitCooldown > 0 || Math.abs(item.object.position.z) > 0.92) continue;
    if (Math.abs(item.object.position.x - actor.position.x) > 0.74) continue;
    const safe = item.kind === 'low' ? state.jumpY > item.clearance : state.slide > 0.12;
    if (!safe) hitObstacle(item);
  }
}

function animateObstacle(item, dt, index) {
  if (item.type === 'chair') item.object.rotation.y += dt * 2.4;
  if (item.type === 'toaster') item.object.rotation.z = Math.sin(state.elapsed * 7 + index) * 0.08;
  if (item.type === 'debris') {
    item.object.rotation.x += dt * 0.8;
    item.object.rotation.y += dt * 1.15;
  }
  if (item.type.startsWith('satellite')) {
    item.object.rotation.z += dt * 0.46;
    item.object.rotation.y += dt * 0.2;
  }
  if (item.type === 'security') item.object.position.y += Math.sin(state.elapsed * 6 + item.phase) * dt * 0.13;
  if (item.type.startsWith('laser')) {
    item.object.children.forEach((child) => {
      if (child.name === 'laserBeam') child.scale.x = 0.92 + Math.sin(state.elapsed * 14 + index) * 0.08;
    });
  }
}

function updateRobots(dt) {
  robotRoot.visible = state.mode === 'playing' && state.act === 'city' && state.elapsed < 2.1;
  robotRoot.children.forEach((bot, index) => {
    bot.position.y = 0.18 + Math.abs(Math.sin(state.elapsed * 7 + bot.userData.phase)) * 0.12;
    bot.position.z += dt * (index % 3) * 0.08;
  });
}

function updateCamera(dt) {
  const portrait = innerWidth / innerHeight < 0.8;
  if (state.mode === 'playing') {
    const actor = activeActor();
    if (state.act === 'city' && state.lookBack > 0) {
      state.lookBack = Math.max(0, state.lookBack - dt);
      const t = THREE.MathUtils.smoothstep(2 - state.lookBack, 1.25, 2);
      camera.position.lerpVectors(
        new THREE.Vector3(0, 2.9, 6.8),
        new THREE.Vector3(0, portrait ? 4.5 : 4.1, portrait ? -8.8 : -10.6),
        t,
      );
      camera.lookAt(new THREE.Vector3(0, 1.1, THREE.MathUtils.lerp(-4, 9, t)));
      return;
    }
    const y = state.act === 'space' ? (portrait ? 4.1 : 3.7) : (portrait ? 4.5 : 4.1);
    const z = state.act === 'space' ? (portrait ? -10.5 : -12) : (portrait ? -8.8 : -10.6);
    const desired = new THREE.Vector3(actor.position.x * 0.14, y, z);
    camera.position.lerp(desired, 1 - Math.exp(-dt * 6));
    camera.lookAt(actor.position.x * 0.12, state.act === 'space' ? 1.5 + state.jumpY * 0.15 : 1.1 + state.jumpY * 0.18, 9.5);
  } else if (state.mode === 'climb') {
    camera.position.lerp(new THREE.Vector3(4.8, 3.9, -8.5), 1 - Math.exp(-dt * 5));
    camera.lookAt(0, 3.2, 5.5);
  } else if (state.mode === 'docking') {
    camera.position.lerp(new THREE.Vector3(3.8, 4.3, -10.8), 1 - Math.exp(-dt * 4));
    camera.lookAt(0, 2.2, 5.5);
  } else if (state.mode === 'switch') {
    camera.position.lerp(new THREE.Vector3(3.6, 3.2, -6.2), 1 - Math.exp(-dt * 5));
    camera.lookAt(0, 1.6, 2.8);
  }
}

function finishPlayingAct() {
  if (state.act === 'city') beginClimb();
  else if (state.act === 'space') beginDocking();
  else beginSwitch();
}

function beginClimb() {
  state.mode = 'climb';
  syncDevPause();
  state.interludeElapsed = 0;
  state.climbProgress = 0.06;
  clearObstacles();
  setWorld('climb');
  player.visible = true;
  ship.visible = false;
  player.position.set(0, 0.2, 3.7);
  player.rotation.set(0, 0, 0);
  stick.classList.remove('visible');
  tutorial.classList.remove('visible');
  actLabel.textContent = 'ROCKET LADDER · TAP TAP TAP';
  hud.classList.add('on-dark');
  climbFill.style.width = '6%';
  climbStatus.textContent = 'LADDER PROGRESS: LEGALLY INSUFFICIENT';
  climbScreen.classList.add('visible');
  audio.interlude('climb');
}

function registerClimbTap() {
  if (state.mode !== 'climb' || state.paused) return;
  state.climbProgress = Math.min(1, state.climbProgress + 0.13);
  state.inputCount += 1;
  audio.gesture('up');
  updateClimbPresentation();
}

function updateClimbPresentation() {
  const p = state.climbProgress;
  climbFill.style.width = `${Math.round(p * 100)}%`;
  player.position.y = 0.2 + p * 6.25;
  player.position.x = Math.sin(p * 12) * 0.08;
  climbStatus.textContent = p > 0.82
    ? 'LADDER PROGRESS: HEROIC ENOUGH'
    : p > 0.45 ? 'LADDER PROGRESS: AUDIT PENDING' : 'LADDER PROGRESS: LEGALLY INSUFFICIENT';
}

function finishClimb() {
  if (state.mode !== 'climb') return;
  state.climbProgress = 1;
  updateClimbPresentation();
  climbScreen.classList.remove('visible');
  startAct('space');
}

function beginDocking() {
  state.mode = 'docking';
  syncDevPause();
  state.interludeElapsed = 0;
  state.dockSoundPlayed = false;
  clearObstacles();
  setWorld('docking');
  player.visible = false;
  ship.visible = true;
  ship.position.set(0, 0.5, 0);
  dockingPort.visible = true;
  dockingPort.position.set(0, 0, 10);
  stick.classList.remove('visible');
  tutorial.classList.remove('visible');
  actLabel.textContent = 'AUTO-DOCKING · PLEASE LOWER EXPECTATIONS';
  hud.classList.add('on-dark');
  dockingTitle.innerHTML = 'ALIGNING<br>PROBABLY';
  dockingCopy.textContent = 'Please remain calm while two expensive objects approach each other.';
  dockingScreen.classList.add('visible');
  audio.interlude('dock');
}

function finishDocking() {
  if (state.mode !== 'docking') return;
  dockingScreen.classList.remove('visible');
  startAct('station');
}

function beginSwitch() {
  state.mode = 'switch';
  syncDevPause();
  state.interludeElapsed = 0;
  clearObstacles();
  setWorld('switch');
  player.visible = true;
  ship.visible = false;
  player.position.set(-1.65, 0.2, 1.8);
  player.rotation.y = -0.2;
  stationSwitch.visible = true;
  stationSwitch.position.set(0.7, 0, 3.2);
  stationEarth.position.set(0, 3.2, 32);
  hud.classList.remove('visible');
  stick.classList.remove('visible');
  tutorial.classList.remove('visible');
  switchScreen.classList.add('visible');
  audio.complete();
}

function beginFinale() {
  if (state.mode !== 'switch') return;
  state.mode = 'finale';
  switchScreen.classList.remove('visible');
  finale.classList.add('visible');
  finale.classList.remove('done');
  subtitle.textContent = '—hello? Hello?!';
  finalSummary.textContent = '';
  const token = ++finaleToken;
  audio.masterSwitch();
  const lines = [
    [0, '—hello? Hello?!'],
    [1450, 'They just… stopped?'],
    [3000, 'The robots just stopped!'],
    [4600, 'Are you there?'],
    [6100, '…Thank you.'],
  ];
  lines.forEach(([delay, line]) => setTimeout(() => {
    if (token === finaleToken) subtitle.textContent = line;
  }, TEST_MODE ? delay * 0.35 : delay));
  audio.finalCall();
  setTimeout(() => {
    if (token !== finaleToken) return;
    state.mode = 'complete';
    const survivors = state.survivors === 256 ? '256 people' : state.survivors.toLocaleString('en-US') + ' people';
    finalSummary.innerHTML = `<strong>${survivors} remain.</strong><br>${state.hits} collision${state.hits === 1 ? '' : 's'} were deemed operationally acceptable.`;
    finale.classList.add('done');
    setTimeout(() => {
      if (token === finaleToken) window.location.reload();
    }, TEST_MODE ? 1800 : 5500);
  }, TEST_MODE ? 2600 : 8000);
}

function frame(now) {
  const rawDt = Math.min(0.1, Math.max(0.001, (now - lastTime) / 1000));
  lastTime = now;
  if (!document.hidden && !state.paused) {
    if (state.mode === 'playing') {
      state.elapsed += rawDt;
      state.totalElapsed += rawDt;
      state.hitCooldown = Math.max(0, state.hitCooldown - rawDt);
      updateActor(rawDt);
      updatePlayingWorld(rawDt);
      updateRobots(rawDt);
      updateCamera(rawDt);
      if (state.elapsed >= ACT_DURATION && (state.act !== 'city' || TEST_MODE || state.distance >= 318)) finishPlayingAct();
    } else if (state.mode === 'climb') {
      state.interludeElapsed += rawDt;
      state.totalElapsed += rawDt;
      state.climbProgress = Math.min(1, state.climbProgress + rawDt * 0.035);
      updateClimbPresentation();
      interludeRoot.children.forEach((child, index) => {
        if (child !== climbLadder && child !== climbRocket) child.position.y = 0.15 + Math.abs(Math.sin(state.interludeElapsed * 6 + index)) * 0.1;
      });
      updateCamera(rawDt);
      if ((state.climbProgress >= 1 && state.interludeElapsed > 1.1) || state.interludeElapsed >= CLIMB_DURATION) finishClimb();
    } else if (state.mode === 'docking') {
      state.interludeElapsed += rawDt;
      state.totalElapsed += rawDt;
      const p = Math.min(1, state.interludeElapsed / DOCK_DURATION);
      dockingPort.position.z = THREE.MathUtils.lerp(10, 2.25, THREE.MathUtils.smoothstep(p, 0, 1));
      dockingPort.children.forEach((child, i) => { if (child.name.startsWith('dockRing')) child.rotation.z += rawDt * (i % 2 ? -0.8 : 0.55); });
      ship.rotation.z = Math.sin(state.interludeElapsed * 5) * (1 - p) * 0.12;
      ship.position.x = Math.sin(state.interludeElapsed * 4) * (1 - p) * 0.22;
      if (p > 0.72 && !state.dockSoundPlayed) {
        state.dockSoundPlayed = true;
        dockingTitle.innerHTML = 'CONNECTION<br>SECURE';
        dockingCopy.textContent = '(probably)';
        audio.dockClunk();
      }
      updateCamera(rawDt);
      if (state.interludeElapsed >= DOCK_DURATION) finishDocking();
    } else if (state.mode === 'switch') {
      state.interludeElapsed += rawDt;
      stationSwitch.getObjectByName('buttonCap')?.rotation.set(0, state.interludeElapsed * 0.4, 0);
      updateCamera(rawDt);
    }
  }

  fpsSamples.push(1 / rawDt);
  if (fpsSamples.length > 30) fpsSamples.shift();
  state.fps = Math.round(fpsSamples.reduce((a, b) => a + b, 0) / fpsSamples.length);

  rig.render(camera, state.paused ? 0 : rawDt);
  const actor = activeActor();
  window.__GAME__ = {
    pos: [actor?.position.x || 0, state.distance],
    fps: state.fps,
    speed: state.mode === 'playing' && !state.paused ? ACTS[state.act].speed : 0,
    score: state.survivors,
    over: state.mode === 'complete',
    draws: renderer.info.render.calls,
    tris: renderer.info.render.triangles,
    scene: state.mode === 'playing' ? state.act : state.mode,
    sceneProgress: state.mode === 'playing' ? Math.min(1, state.elapsed / ACT_DURATION) : 0,
    lane: state.targetLane,
    verticalState: state.slide > 0 ? 'slide' : state.jumpY > 0.05 ? 'jump' : 'ground',
    humanityPercent: state.humanity,
    survivors: state.survivors,
    hits: state.hits,
    inputCount: state.inputCount,
    paused: state.paused,
  };
  requestAnimationFrame(frame);
}

function resize() {
  camera.aspect = innerWidth / innerHeight;
  camera.fov = innerWidth / innerHeight < 0.8 ? 58 : 50;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight, false);
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, innerWidth < 700 ? 1.25 : 1.5));
  rig.resize(innerWidth, innerHeight);
}

window.addEventListener('resize', resize);
startButton.addEventListener('click', startGame);
startButton.addEventListener('keydown', (event) => {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    startGame();
  }
});
beginButton.addEventListener('click', startGame);
climbTap.addEventListener('click', registerClimbTap);
climbScreen.addEventListener('pointerdown', (event) => {
  if (event.target !== climbTap) registerClimbTap();
});
masterTap.addEventListener('click', beginFinale);
devPauseButton.addEventListener('click', () => setDevPaused(!state.paused));
window.addEventListener('keydown', (event) => {
  if (DEV_MODE && event.code === 'KeyP' && !event.repeat) {
    event.preventDefault();
    setDevPaused(!state.paused);
  }
});
$('#comicPrev').addEventListener('click', () => showComic(comicIndex - 1));
$('#comicNext').addEventListener('click', () => showComic(comicIndex + 1));
muteButton.addEventListener('click', () => {
  const enabled = audio.toggle();
  muteButton.textContent = enabled ? 'SOUND ON' : 'SOUND OFF';
});

window.__READY__ = false;
window.__START__ = startGame;
window.__SKIP__ = () => {
  if (state.mode === 'playing') state.elapsed = ACT_DURATION;
  else if (state.mode === 'climb') finishClimb();
  else if (state.mode === 'docking') finishDocking();
  else if (state.mode === 'switch') beginFinale();
};
window.__GAME__ = { pos: [0, 0], fps: 0, speed: 0, score: 0, over: false, draws: 0, tris: 0 };

loadAssets().then(() => {
  state.mode = 'ready';
  loading.classList.remove('visible');
  startScreen.classList.add('visible');
  showComic(0);
  let comicTurns = 0;
  comicTimer = window.setInterval(() => {
    showComic(comicIndex + 1);
    comicTurns += 1;
    if (comicTurns === comicPanels.length) revealIntro();
  }, 6300);
  window.__READY__ = true;
}).catch((error) => {
  console.error(error);
  loadingText.textContent = `loading failed: ${error.message}`;
});

resize();
requestAnimationFrame(frame);
