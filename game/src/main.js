import * as THREE from 'three';
import { ASSET } from '../lib/assetlib.js';
import { createRig } from '../lib/rig.js';
import { SwipeInput } from './input.js';
import { AudioEngine } from './audio.js';
import { createChaseVisuals } from './chase_visuals.js';
import { calculateRating } from './results.js';

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
const resultsCard = $('#resultsCard');
const resultsGrade = $('#resultsGrade');
const resultsTitle = $('#resultsTitle');
const resultsScore = $('#resultsScore');
const resultsPeople = $('#resultsPeople');
const resultsPeopleExact = $('#resultsPeopleExact');
const resultsDodged = $('#resultsDodged');
const resultsTime = $('#resultsTime');
const resultsHits = $('#resultsHits');
const playAgain = $('#playAgain');
const comicPanels = [...document.querySelectorAll('.comic-panel')];
const comicCount = $('#comicCount');

const params = new URLSearchParams(location.search);
const TEST_MODE = params.has('test');
const DEV_MODE = params.has('dev') || TEST_MODE || ['localhost', '127.0.0.1'].includes(location.hostname);
const REDUCED_MOTION = matchMedia('(prefers-reduced-motion: reduce)').matches;
const START_SCENE = params.get('scene');
const KEYBOARD_HINTS = !matchMedia('(pointer: coarse)').matches;
const ACT_DURATION = TEST_MODE ? 3.6 : 25;
const CLIMB_DURATION = TEST_MODE ? 1.8 : 5;
const DOCK_DURATION = TEST_MODE ? 1.5 : 3;
const INTRO_TRANSITION = 0.9;
const BOARD_DURATION = TEST_MODE ? 0.65 : 1.35;
const PASSAGE_DURATION = TEST_MODE ? 0.65 : 1.35;
const SWITCH_APPROACH_DURATION = TEST_MODE ? 0.55 : 1.15;
// The chase camera looks toward +Z, so screen-left is world +X.
const LANES = [2.2, 0, -2.2];
const WORLD_POPULATION = 8_000_000_000;
const START_HUMANITY = 95;
const compactPeople = new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 });
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
const MISSION_MODES = new Set(['playing', 'boarding', 'climb', 'launch', 'launchExit', 'docking', 'stationEntry', 'switchApproach', 'switch']);

function expectedMissionSeconds() {
  const firstAct = ['city', 'space', 'station'].includes(START_SCENE) ? START_SCENE : 'city';
  let seconds = ACT_DURATION + SWITCH_APPROACH_DURATION;
  if (firstAct !== 'station') seconds += ACT_DURATION + DOCK_DURATION + 2 * PASSAGE_DURATION;
  if (firstAct === 'city') {
    seconds += Math.max(ACT_DURATION, TEST_MODE ? 0 : 318 / ACTS.city.speed)
      + BOARD_DURATION + CLIMB_DURATION + 2 * PASSAGE_DURATION
      + (REDUCED_MOTION ? 0 : INTRO_TRANSITION);
  }
  return seconds;
}

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
scene.add(camera);
const cameraAim = new THREE.Vector3(0, 1.1, 9.5);
const introCameraFrom = new THREE.Vector3();
const introCameraTarget = new THREE.Vector3(0, 1.1, 9.5);
const cityRoot = new THREE.Group();
const spaceRoot = new THREE.Group();
const stationRoot = new THREE.Group();
const actorRoot = new THREE.Group();
const obstacleRoot = new THREE.Group();
const robotRoot = new THREE.Group();
scene.add(cityRoot, spaceRoot, stationRoot, actorRoot, obstacleRoot, robotRoot);

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
  mode: 'loading', act: 'city', elapsed: 0, totalElapsed: 0, distance: 0, actDistance: 0,
  lane: 0, targetLane: 0, jumpY: 0, jumpVelocity: 0, slide: 0,
  hitCooldown: 0, hits: 0, humanity: START_HUMANITY,
  survivors: Math.round(WORLD_POPULATION * START_HUMANITY / 100),
  missionElapsed: 0, missionTimeFinal: 0, obstaclesDodged: 0, rating: null, resultsRevealElapsed: 0,
  inputCount: 0, fps: 60, lookBack: 0, climbProgress: 0, climbTarget: 0,
  introCameraBlend: 0,
  introDelay: 0,
  interludeElapsed: 0, dockSoundPlayed: false, visualClock: 0,
  shot: null, passage: '', finaleElapsed: 0, finalePanStarted: false,
  paused: false,
};

let chaseVisuals = null;
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
let stationTerminal;
let stationWindow;
let stationEntryPassage;
let earthCrisis;
let dockingPort;
let spaceBackdrop;
let climbLadder;
let climbAnchorZ = 0;
let lastTime = performance.now();
let fpsSamples = [];
let patternIndex = 0;
let spawnClock = 0;
let tutorialStage = 0;
let comicIndex = 0;
let comicTimer = 0;
const introActorFrom = new THREE.Vector3();
let introActorRotation = 0;
let introHeadRotation = 0;

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
  const [road, building, billboard, cone, toaster, mower, chair, rocket, hub, wayfinder, citySky] = await Promise.all([
    ASSET(assetUrl('city_road'), { surfaces: true }),
    ASSET(assetUrl('city_building'), { surfaces: true }),
    ASSET(assetUrl('billboard'), { keepHierarchy: true }),
    ASSET(assetUrl('traffic_cone')),
    ASSET(assetUrl('toaster')),
    ASSET(assetUrl('lawnmower')),
    ASSET(assetUrl('office_chair')),
    ASSET(assetUrl('rocket'), { keepHierarchy: true }),
    ASSET(assetUrl('rocket_hub'), { surfaces: true }),
    ASSET(assetUrl('spaceport_wayfinder'), { surfaces: true }),
    ASSET(assetUrl('city_sky')),
  ]);

  setLoad(54, 'auditing low-orbit litter…');
  const [satellite, debris, backdrop, port] = await Promise.all([
    ASSET(assetUrl('satellite')),
    ASSET(assetUrl('space_debris')),
    ASSET(assetUrl('space_backdrop'), { keepHierarchy: true }),
    ASSET(assetUrl('docking_port'), { keepHierarchy: true }),
  ]);

  setLoad(72, 'installing corridor bureaucracy…');
  const [corridor, laser, security, masterSwitch, earth, ladder, endWindow, crisis] = await Promise.all([
    ASSET(assetUrl('station_corridor')),
    ASSET(assetUrl('laser_gate'), { keepHierarchy: true }),
    ASSET(assetUrl('security_bot')),
    ASSET(assetUrl('master_switch'), { keepHierarchy: true }),
    ASSET(assetUrl('earth')),
    ASSET(assetUrl('ladder')),
    ASSET(assetUrl('station_end_window'), { keepHierarchy: true }),
    ASSET(assetUrl('earth_crisis'), { keepHierarchy: true }),
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

  buildCity(road, building, billboard, rocket, hub, wayfinder, citySky);
  buildRobotArmy([boxy, spider, roller]);
  buildSpace(backdrop, port);
  buildStation(corridor, masterSwitch, earth, endWindow, crisis);
  buildClimb(ladder);

  setLoad(92, 'warming emergency lighting…');
  await rig.ready;
  rig.refresh(scene);
  setWorld('city');
  player.visible = false;
  setLoad(100, 'catastrophe approved');
}

function buildCity(road, building, billboard, rocket, hub, wayfinder, citySky) {
  const signTexture = makeBillboardTexture();
  citySky.position.set(0, 18, 170);
  citySky.traverse((object) => { if (object.isMesh) { object.castShadow = false; object.receiveShadow = false; } });
  cityRoot.add(citySky);
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
  dockingPort.position.set(0, 0, ACTS.space.speed * ACT_DURATION + 10);
  dockingPort.visible = false;
  spaceRoot.add(dockingPort);
}

function buildStation(corridor, masterSwitch, earth, endWindow, crisis) {
  for (let i = 0; i < 9; i++) {
    const chunk = corridor.clone(true);
    chunk.position.z = i * 40 + 12;
    stationRoot.add(chunk);
    stationChunks.push(chunk);
  }
  stationTerminal = new THREE.Group();
  stationTerminal.position.z = 330;
  stationRoot.add(stationTerminal);
  stationSwitch = masterSwitch;
  stationSwitch.position.set(0, 0, 0);
  stationTerminal.add(stationSwitch);
  stationWindow = endWindow;
  // ASSET recentres the room including its distant space plane. Restore its
  // authored origin so the circular floor surrounds the central switch.
  stationWindow.position.set(
    -stationWindow.children[0].position.x,
    -stationWindow.children[0].position.y,
    -stationWindow.children[0].position.z,
  );
  stationWindow.traverse((part) => {
    if (part.isMesh) part.castShadow = false;
  });
  stationEntryPassage = stationWindow.getObjectByName('hubEntryPassage');
  stationEntryPassage.visible = false;
  stationTerminal.add(stationWindow);
  stationEarth = earth;
  stationEarth.scale.setScalar(1.1);
  stationEarth.rotation.y = Math.PI;
  stationWindow.userData.earthMount.add(stationEarth);
  earthCrisis = crisis;
  stationEarth.add(earthCrisis);
  earthCrisis.traverse((part) => {
    if (part.isMesh) { part.castShadow = false; part.receiveShadow = false; }
  });
}

function buildClimb(ladder) {
  climbLadder = ladder;
  climbLadder.position.set(0, 0, -1.9);
  rocketGroup.add(climbLadder);
}

function setWorld(kind) {
  cityRoot.visible = kind === 'city';
  spaceRoot.visible = kind === 'space' || kind === 'docking';
  stationRoot.visible = kind === 'station' || kind === 'switch';
  obstacleRoot.visible = kind === 'city' || kind === 'space' || kind === 'station';
  robotRoot.visible = false;
}

function pointCamera(target) {
  cameraAim.copy(target);
  camera.lookAt(cameraAim);
}

function startShot(duration, position, target, onDone = null) {
  state.shot = {
    elapsed: 0,
    duration: REDUCED_MOTION ? Math.min(duration, 0.55) : duration,
    fromPosition: camera.position.clone(),
    fromTarget: cameraAim.clone(),
    toPosition: position.clone(),
    toTarget: target.clone(),
    onDone,
  };
}

function updateShot(dt) {
  const shot = state.shot;
  if (!shot) return;
  shot.elapsed = Math.min(shot.duration, shot.elapsed + dt);
  const eased = THREE.MathUtils.smoothstep(shot.elapsed / shot.duration, 0, 1);
  camera.position.lerpVectors(shot.fromPosition, shot.toPosition, eased);
  pointCamera(shot.fromTarget.clone().lerp(shot.toTarget, eased));
  if (shot.elapsed >= shot.duration) {
    state.shot = null;
    shot.onDone?.();
  }
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
  if (state.mode !== 'playing' || state.paused || state.introDelay > 0) return;
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
    tutorialText.textContent = KEYBOARD_HINTS ? 'UP / W TO JUMP · DOWN / S TO SLIDE' : 'SWIPE UP TO JUMP · DOWN TO SLIDE';
  } else if (state.act === 'city' && tutorialStage === 1 && (kind === 'up' || kind === 'down')) {
    tutorialStage = 2;
    tutorial.classList.remove('visible');
  }
}

new SwipeInput(stick, onGesture);

function syncDevPause() {
  const available = DEV_MODE && ['playing', 'boarding', 'climb', 'launch', 'launchExit', 'docking', 'stationEntry', 'switchApproach', 'switch', 'finale'].includes(state.mode) && state.introDelay <= 0;
  devPauseButton.classList.toggle('visible', available);
  devPauseButton.classList.toggle('paused', state.paused);
  devPauseButton.textContent = state.paused ? '▶' : 'Ⅱ';
  devPauseButton.setAttribute('aria-label', state.paused ? 'Resume game' : 'Pause game');
  devPauseButton.title = state.paused ? 'Resume game' : 'Pause game';
  devPausedLabel.classList.toggle('visible', available && state.paused);
  document.body.classList.toggle('dev-paused', state.paused);
}

function setDevPaused(paused) {
  if (!DEV_MODE || !['playing', 'boarding', 'climb', 'launch', 'launchExit', 'docking', 'stationEntry', 'switchApproach', 'switch', 'finale'].includes(state.mode)) return;
  state.paused = paused;
  audio.setPaused(paused);
  syncDevPause();
}

function resetRun() {
  state.hits = 0;
  state.humanity = START_HUMANITY;
  state.survivors = Math.round(WORLD_POPULATION * START_HUMANITY / 100);
  state.missionElapsed = 0;
  state.missionTimeFinal = 0;
  state.obstaclesDodged = 0;
  state.rating = null;
  state.resultsRevealElapsed = 0;
  state.inputCount = 0;
  state.totalElapsed = 0;
  state.visualClock = 0;
  state.distance = 0;
  state.actDistance = 0;
  updateHumanity();
}

function startGame() {
  if (state.mode !== 'ready' || startScreen.classList.contains('exiting')) return;
  state.shot = null;
  state.passage = '';
  state.finaleElapsed = 0;
  state.finalePanStarted = false;
  clearInterval(comicTimer);
  document.body.classList.remove('intro-playing');
  const firstAct = ['city', 'space', 'station'].includes(START_SCENE) ? START_SCENE : 'city';
  const fromIntro = firstAct === 'city' && !REDUCED_MOTION;
  introCameraFrom.copy(camera.position);
  introActorFrom.copy(player.position);
  introActorRotation = player.rotation.y;
  introHeadRotation = playerJoints?.head.rotation.y || 0;
  if (fromIntro) {
    startScreen.classList.add('exiting');
    window.setTimeout(() => startScreen.classList.remove('visible', 'exiting'), INTRO_TRANSITION * 1000);
  } else {
    startScreen.classList.remove('visible');
  }
  [climbScreen, dockingScreen, switchScreen, finale].forEach((screen) => screen.classList.remove('visible'));
  finale.classList.remove('done');
  resultsCard.inert = true;
  resultsCard.setAttribute('aria-hidden', 'true');
  resetRun();
  state.paused = false;
  audio.setPaused(false);
  audio.start();
  startAct(firstAct, fromIntro);
}

function startAct(name, fromIntro = false, fromTransition = false) {
  const act = ACTS[name];
  state.mode = 'playing';
  state.act = name;
  state.elapsed = 0;
  state.actDistance = 0;
  state.lane = 0;
  state.targetLane = 0;
  state.jumpY = 0;
  state.jumpVelocity = 0;
  state.slide = 0;
  state.hitCooldown = 0;
  state.lookBack = name === 'city' ? 2 : 0;
  state.introCameraBlend = fromIntro ? 1 : 0;
  state.introDelay = fromIntro ? INTRO_TRANSITION : 0;
  syncDevPause();
  patternIndex = 0;
  spawnClock = 2.7;
  tutorialStage = 0;
  clearObstacles();
  resetWorld(name, fromIntro);
  setWorld(name);
  player.visible = name !== 'space';
  ship.visible = name === 'space';
  actLabel.textContent = `${act.title} · ${act.order}`;
  hud.classList.toggle('visible', !fromIntro && !fromTransition);
  hud.classList.toggle('on-dark', name === 'space');
  hud.classList.toggle('on-station', name === 'station');
  stick.classList.toggle('visible', !fromIntro && !fromTransition);
  tutorial.classList.toggle('visible', name === 'city' && !fromIntro && !fromTransition);
  tutorialText.textContent = name === 'city'
    ? (KEYBOARD_HINTS ? 'LEFT / RIGHT OR A / D TO CHANGE LANES' : 'SWIPE TO CHANGE LANES')
    : (KEYBOARD_HINTS ? 'SAME KEYS · NOW WITH VACUUM' : 'SAME SWIPES · NOW WITH VACUUM');
  if (name === 'space' && !fromTransition) {
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
  if (!fromIntro && !fromTransition) showBanner(act.kicker, act.title, act.order);
}

function revealAct(name) {
  state.mode = 'playing';
  hud.classList.add('visible');
  stick.classList.add('visible');
  if (name === 'space') {
    tutorial.classList.add('visible');
    window.setTimeout(() => {
      if (state.mode === 'playing' && state.act === 'space') tutorial.classList.remove('visible');
    }, 2200);
  }
  showBanner(ACTS[name].kicker, ACTS[name].title, ACTS[name].order);
  syncDevPause();
}

function clearObstacles() {
  for (const item of obstacles) obstacleRoot.remove(item.object);
  obstacles = [];
}

function resetWorld(name, preserveCamera = false) {
  cityChunks.forEach((chunk, index) => { chunk.position.z = index * 40 + 12; });
  stationChunks.forEach((chunk, index) => { chunk.position.z = index * 40 + 12; chunk.visible = true; });
  rocketGroup.position.set(0, 0, 330);
  rocketGroup.visible = name === 'city';
  stationTerminal.position.set(0, 0, 330);
  stationEntryPassage.visible = false;
  stationSwitch.visible = true;
  stationEarth.position.set(0, 0, 0);
  dockingPort.position.set(0, 0, ACTS.space.speed * ACT_DURATION + 10);
  dockingPort.visible = name === 'space';
  robotRoot.children.forEach((bot) => { bot.position.z = bot.userData.homeZ; });
  if (!preserveCamera) {
    player.position.set(0, 0.2, 0);
    player.rotation.set(0, 0, 0);
  }
  player.scale.setScalar(1.02);
  if (playerJoints && !preserveCamera) {
    playerJoints.head.rotation.y = 0;
    playerJoints.torso.rotation.y = 0;
    playerJoints.leftArm.rotation.x = 0;
    playerJoints.rightArm.rotation.x = 0;
    playerJoints.leftArm.rotation.z = 0;
    playerJoints.rightArm.rotation.z = 0;
  }
  ship.position.set(0, 0.4, 0);
  ship.rotation.set(0, 0, 0);
  ship.scale.setScalar(0.88);
  if (spaceBackdrop) spaceBackdrop.rotation.set(0, 0, 0);
  if (name === 'city' && !preserveCamera) camera.position.set(0, 2.9, 6.8);
}

function updateIntroCity() {
  const t = REDUCED_MOTION ? 0 : performance.now() * 0.001;
  const portrait = innerWidth / innerHeight < 0.8;
  camera.position.set(Math.sin(t * 0.36) * 0.17, portrait ? 4.5 : 4.1, portrait ? -8.8 : -10.6);
  pointCamera(introCameraTarget);
  player.position.set(portrait ? -0.7 : -1.2, 0.2, portrait ? -3.25 : -4.2);
  player.rotation.y = Math.sin(t * 0.7) * 0.16;
  if (playerJoints) {
    playerJoints.head.rotation.y = Math.sin(t * 0.7 - 0.8) * 3;
    playerJoints.torso.rotation.y = Math.sin(t * 0.7) * 0.16;
    playerJoints.leftArm.rotation.x = -0.18 + Math.sin(t * 1.9) * 0.08;
    playerJoints.rightArm.rotation.x = 0.24 + Math.sin(t * 1.9 + 1.3) * 0.08;
    playerJoints.leftArm.rotation.z = -0.55 + Math.sin(t * 2.3) * 0.08;
    playerJoints.rightArm.rotation.z = 0.55 - Math.sin(t * 2.3 + 0.7) * 0.08;
  }
}

function updateIntroTransition(dt) {
  state.introDelay = Math.max(0, state.introDelay - dt);
  const t = THREE.MathUtils.smoothstep(INTRO_TRANSITION - state.introDelay, 0, INTRO_TRANSITION);
  player.position.copy(introActorFrom).lerp(new THREE.Vector3(0, 0.2, 0), t);
  player.rotation.y = THREE.MathUtils.lerp(introActorRotation, 0, t);
  if (playerJoints) {
    playerJoints.head.rotation.y = THREE.MathUtils.lerp(introHeadRotation, 0, t);
    playerJoints.torso.rotation.y *= 1 - t;
    playerJoints.leftArm.rotation.x *= 1 - t;
    playerJoints.rightArm.rotation.x *= 1 - t;
    playerJoints.leftArm.rotation.z *= 1 - t;
    playerJoints.rightArm.rotation.z *= 1 - t;
  }
  updateCamera(dt);
  if (state.introDelay === 0) {
    hud.classList.add('visible');
    stick.classList.add('visible');
    tutorial.classList.add('visible');
    syncDevPause();
    showBanner(ACTS.city.kicker, ACTS.city.title, ACTS.city.order);
  }
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
      clearance: proto.clearance, hit: false, passed: false, phase: patternIndex + def.lane,
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
  state.actDistance += travel;

  const chunks = state.act === 'city' ? cityChunks : state.act === 'station' ? stationChunks : [];
  for (const chunk of chunks) {
    chunk.position.z -= travel;
    if (state.act === 'station' && chunk.position.z < -34) chunk.position.z += chunks.length * 40;
  }

  const remaining = Math.max(0, ACT_DURATION - state.elapsed);
  if (state.act === 'city') {
    const approach = TEST_MODE
      ? Math.max(state.actDistance, 318 * THREE.MathUtils.smoothstep(state.elapsed / ACT_DURATION, 0, 1))
      : state.actDistance;
    rocketGroup.position.z = Math.max(12, 330 - approach);
  } else if (state.act === 'space') {
    spaceBackdrop.rotation.y += dt * 0.012;
    dockingPort.position.z = Math.max(14, remaining * act.speed + 10);
    dockingPort.children.forEach((child, i) => { if (child.name.startsWith('dockRing')) child.rotation.z += dt * (i % 2 ? -0.55 : 0.4); });
  } else {
    const approach = TEST_MODE
      ? Math.max(state.actDistance, 319 * THREE.MathUtils.smoothstep(state.elapsed / ACT_DURATION, 0, 1))
      : state.actDistance;
    stationTerminal.position.z = Math.max(11, 330 - approach);
    // Replace the last corridor piece with the hub's windowed entry passage.
    for (const chunk of stationChunks) chunk.visible = chunk.position.z < stationTerminal.position.z - 18;
    stationEntryPassage.visible = stationTerminal.position.z <= 30;
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
    if (!item.passed && item.object.position.z < -0.93) {
      item.passed = true;
      if (!item.hit) state.obstaclesDodged += 1;
    }
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
      if (state.introDelay <= 0) state.lookBack = Math.max(0, state.lookBack - dt);
      const t = THREE.MathUtils.smoothstep(2 - state.lookBack, 1.25, 2);
      const openingPosition = new THREE.Vector3().lerpVectors(
        new THREE.Vector3(0, 2.9, 6.8),
        new THREE.Vector3(0, portrait ? 4.5 : 4.1, portrait ? -8.8 : -10.6),
        t,
      );
      const openingTarget = new THREE.Vector3(0, 1.1, THREE.MathUtils.lerp(-4, 9, t));
      if (state.introCameraBlend > 0) {
        state.introCameraBlend = Math.max(0, state.introCameraBlend - dt);
        const reveal = THREE.MathUtils.smoothstep(1 - state.introCameraBlend, 0, 1);
        camera.position.copy(introCameraFrom).lerp(openingPosition, reveal);
        pointCamera(introCameraTarget.clone().lerp(openingTarget, reveal));
      } else {
        camera.position.copy(openingPosition);
        pointCamera(openingTarget);
      }
      return;
    }
    const y = state.act === 'space' ? (portrait ? 4.1 : 3.7) : (portrait ? 4.5 : 4.1);
    const z = state.act === 'space' ? (portrait ? -10.5 : -9.4) : (portrait ? -8.8 : -10.6);
    const desired = new THREE.Vector3(actor.position.x * 0.14, y, z);
    camera.position.lerp(desired, 1 - Math.exp(-dt * 6));
    pointCamera(new THREE.Vector3(actor.position.x * 0.12, state.act === 'space' ? 1.5 + state.jumpY * 0.15 : 1.1 + state.jumpY * 0.18, 9.5));
  } else if (state.mode === 'climb') {
    const y = 3.4 + state.climbProgress * 4.6;
    camera.position.lerp(new THREE.Vector3(4.8, y, climbAnchorZ - 7), 1 - Math.exp(-dt * 4));
    cameraAim.lerp(new THREE.Vector3(0, 2.2 + state.climbProgress * 5.1, climbAnchorZ), 1 - Math.exp(-dt * 5));
    camera.lookAt(cameraAim);
  } else if (state.mode === 'docking') {
    const p = Math.min(1, state.interludeElapsed / DOCK_DURATION);
    camera.position.lerp(new THREE.Vector3(2.5 * (1 - p), 4.2, -9 + p * 5), 1 - Math.exp(-dt * 4));
    pointCamera(new THREE.Vector3(0, 3.1, dockingPort.position.z + 0.5));
  } else if (state.mode === 'switch') {
    const portraitSwitch = innerWidth / innerHeight < 0.8;
    camera.position.lerp(portraitSwitch
      ? new THREE.Vector3(-1.6, 3.8, -7.2)
      : new THREE.Vector3(-3.6, 3.6, -2.5), 1 - Math.exp(-dt * 4));
    pointCamera(new THREE.Vector3(portraitSwitch ? 0.5 : 0, 3.3, stationTerminal.position.z + 8));
  }
}

function finishPlayingAct() {
  if (state.act === 'city') beginBoarding();
  else if (state.act === 'space') beginDocking();
  else beginSwitchApproach();
}

function beginBoarding() {
  state.mode = 'boarding';
  state.interludeElapsed = 0;
  state.boardFromX = player.position.x;
  climbAnchorZ = rocketGroup.position.z + climbLadder.position.z - 0.52;
  stick.classList.remove('visible');
  tutorial.classList.remove('visible');
  actLabel.textContent = 'ROCKET LADDER · BOARDING';
  startShot(BOARD_DURATION,
    new THREE.Vector3(4.6, 3.9, climbAnchorZ - 6.8),
    new THREE.Vector3(0, 2.35, climbAnchorZ + 0.3),
    beginClimb);
  syncDevPause();
}

function beginClimb() {
  state.mode = 'climb';
  syncDevPause();
  state.interludeElapsed = 0;
  state.climbProgress = 0.06;
  state.climbTarget = 0.06;
  player.position.set(0, 0.2, climbAnchorZ);
  player.rotation.set(0, 0, 0);
  stick.classList.remove('visible');
  tutorial.classList.remove('visible');
  actLabel.textContent = 'ROCKET LADDER · TAP TAP TAP';
  climbFill.style.width = '6%';
  climbStatus.textContent = 'LADDER PROGRESS: LEGALLY INSUFFICIENT';
  climbScreen.classList.add('visible');
  audio.interlude('climb');
}

function registerClimbTap() {
  if (state.mode !== 'climb' || state.paused) return;
  state.climbTarget = Math.min(1, state.climbTarget + 0.13);
  state.inputCount += 1;
  audio.gesture('up');
}

function updateClimbPresentation() {
  const p = state.climbProgress;
  climbFill.style.width = `${Math.round(p * 100)}%`;
  player.position.y = 0.2 + p * 4.8;
  player.position.x = Math.sin(p * 12) * 0.045;
  player.position.z = climbAnchorZ;
  if (playerJoints) {
    const step = Math.sin(p * Math.PI * 12);
    playerJoints.leftArm.rotation.x = -1.35 + step * 0.32;
    playerJoints.rightArm.rotation.x = -1.35 - step * 0.32;
    playerJoints.leftLeg.rotation.x = step * 0.38;
    playerJoints.rightLeg.rotation.x = -step * 0.38;
    playerJoints.torso.rotation.z = step * 0.035;
  }
  climbStatus.textContent = p > 0.82
    ? 'LADDER PROGRESS: HEROIC ENOUGH'
    : p > 0.45 ? 'LADDER PROGRESS: AUDIT PENDING' : 'LADDER PROGRESS: LEGALLY INSUFFICIENT';
}

function finishClimb() {
  if (state.mode !== 'climb') return;
  state.climbTarget = 1;
  state.climbProgress = 1;
  updateClimbPresentation();
  climbScreen.classList.remove('visible');
  state.mode = 'launch';
  state.interludeElapsed = 0;
  startShot(PASSAGE_DURATION,
    new THREE.Vector3(0, 5.28, rocketGroup.position.z - 0.64),
    new THREE.Vector3(0, 5.28, rocketGroup.position.z + 0.17),
    beginLaunchExit);
  syncDevPause();
}

let passageShield = null;

function coverPassage(source) {
  if (passageShield) camera.remove(passageShield);
  passageShield = source.clone(false);
  passageShield.material = source.material.clone();
  passageShield.material.depthTest = false;
  passageShield.material.depthWrite = false;
  passageShield.position.set(0, 0, -0.32);
  passageShield.rotation.set(0, 0, 0);
  passageShield.scale.setScalar(2.5);
  passageShield.renderOrder = 1000;
  camera.add(passageShield);
}

function uncoverPassage() {
  if (passageShield) camera.remove(passageShield);
  passageShield = null;
}

function beginLaunchExit() {
  coverPassage(rocketGroup.getObjectByName('boardingOccluder'));
  startAct('space', false, true);
  state.mode = 'launchExit';
  startShot(PASSAGE_DURATION,
    new THREE.Vector3(0, innerWidth / innerHeight < 0.8 ? 4.1 : 3.7, innerWidth / innerHeight < 0.8 ? -10.5 : -9.4),
    new THREE.Vector3(0, 1.5, 9.5),
    () => { uncoverPassage(); revealAct('space'); });
  syncDevPause();
}

function beginDocking() {
  state.mode = 'docking';
  syncDevPause();
  state.interludeElapsed = 0;
  state.dockSoundPlayed = false;
  dockingPort.visible = true;
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
  state.mode = 'stationEntry';
  state.passage = 'dockIn';
  startShot(PASSAGE_DURATION,
    new THREE.Vector3(0, 3.35, dockingPort.position.z + 0.62),
    new THREE.Vector3(0, 3.35, dockingPort.position.z + 1.46),
    beginStationExit);
  syncDevPause();
}

function beginStationExit() {
  coverPassage(dockingPort.getObjectByName('dockBulkhead').children[0]);
  startAct('station', false, true);
  player.position.z = 4;
  state.mode = 'stationEntry';
  state.passage = 'dockOut';
  startShot(PASSAGE_DURATION,
    new THREE.Vector3(0, innerWidth / innerHeight < 0.8 ? 4.5 : 4.1, innerWidth / innerHeight < 0.8 ? -8.8 : -10.6),
    new THREE.Vector3(0, 1.1, 9.5),
    () => { uncoverPassage(); revealAct('station'); });
  syncDevPause();
}

function beginSwitchApproach() {
  state.mode = 'switchApproach';
  state.interludeElapsed = 0;
  state.switchFromX = player.position.x;
  clearObstacles();
  stick.classList.remove('visible');
  tutorial.classList.remove('visible');
  hud.classList.remove('visible');
  const portraitSwitch = innerWidth / innerHeight < 0.8;
  startShot(SWITCH_APPROACH_DURATION,
    portraitSwitch ? new THREE.Vector3(-1.6, 3.8, -7.2) : new THREE.Vector3(-3.6, 3.6, -2.5),
    new THREE.Vector3(portraitSwitch ? 0.5 : 0, 3.3, stationTerminal.position.z + 8),
    beginSwitch);
  syncDevPause();
}

function beginSwitch() {
  state.mode = 'switch';
  syncDevPause();
  state.interludeElapsed = 0;
  player.position.set(1.6, 0.2, stationTerminal.position.z - 1.6);
  player.rotation.y = -0.1;
  switchScreen.classList.add('visible');
  audio.complete();
}

function beginFinale() {
  if (state.mode !== 'switch') return;
  state.missionTimeFinal = state.missionElapsed;
  state.mode = 'finale';
  switchScreen.classList.remove('visible');
  finale.classList.add('visible');
  finale.classList.remove('done');
  subtitle.textContent = '—hello? Hello?!';
  state.finaleElapsed = 0;
  state.finalePanStarted = false;
  resultsCard.inert = true;
  resultsCard.setAttribute('aria-hidden', 'true');
  audio.masterSwitch();
  audio.finalCall();
  syncDevPause();
}

function updateEarthCrisis(level) {
  const flares = Object.values(earthCrisis?.userData.flares || {});
  for (const flare of flares) {
    flare.visible = level > 0.005;
    if (!flare.visible) continue;
    const pulse = 0.85 + 0.15 * Math.sin(state.visualClock * 7 + flare.userData.phase);
    flare.scale.setScalar(level * flare.userData.baseSize * pulse);
  }
}

function formatMissionTime(seconds) {
  const tenths = Math.round(seconds * 10);
  const minutes = Math.floor(tenths / 600);
  const remaining = tenths % 600;
  return `${String(minutes).padStart(2, '0')}:${String(Math.floor(remaining / 10)).padStart(2, '0')}.${remaining % 10}`;
}

function updateResultCounters(dt) {
  state.resultsRevealElapsed = Math.min(0.85, state.resultsRevealElapsed + dt);
  const progress = REDUCED_MOTION ? 1 : state.resultsRevealElapsed / 0.85;
  const eased = 1 - (1 - progress) ** 3;
  const people = Math.round(state.survivors * eased);
  resultsPeople.textContent = compactPeople.format(people);
  resultsPeopleExact.textContent = `${people.toLocaleString('en-US')} PEOPLE`;
  resultsDodged.textContent = Math.round(state.obstaclesDodged * eased).toLocaleString('en-US');
  resultsTime.textContent = formatMissionTime(state.missionTimeFinal * eased);
  resultsHits.textContent = Math.round(state.hits * eased).toLocaleString('en-US');
}

function revealResults() {
  state.mode = 'complete';
  state.resultsRevealElapsed = 0;
  state.rating = calculateRating({
    survivors: state.survivors,
    hits: state.hits,
    obstaclesDodged: state.obstaclesDodged,
    timeSeconds: state.missionTimeFinal,
    baselineSeconds: expectedMissionSeconds(),
  });
  resultsCard.dataset.grade = state.rating.grade;
  resultsGrade.textContent = state.rating.grade;
  resultsTitle.textContent = state.rating.title;
  resultsScore.textContent = `${state.rating.score} / 100`;
  updateResultCounters(REDUCED_MOTION ? 0.85 : 0);
  resultsCard.inert = false;
  resultsCard.setAttribute('aria-hidden', 'false');
  finale.classList.add('done');
  audio.results(state.rating.grade);
  syncDevPause();
  resultsTitle.focus({ preventScroll: true });
}

function updateFinale(dt) {
  state.finaleElapsed += dt;
  const storyTime = state.finaleElapsed / (TEST_MODE ? 0.35 : 1);
  const cap = stationSwitch.getObjectByName('buttonCap');
  const press = THREE.MathUtils.smoothstep(storyTime, 0, 0.42);
  if (cap) cap.position.y = 1.48 - press * 0.28;
  player.position.z = stationTerminal.position.z - 1.6 + press * 0.8;
  if (playerJoints) {
    playerJoints.rightArm.rotation.x = -1.25 - press * 1.05;
    playerJoints.torso.rotation.x = -press * 0.22;
  }
  if (!state.finalePanStarted && storyTime >= 0.42) {
    state.finalePanStarted = true;
    startShot(TEST_MODE ? 0.75 : 1.8,
      new THREE.Vector3(-0.9, 5.1, stationTerminal.position.z + 3),
      new THREE.Vector3(0, 5.55, stationTerminal.position.z + 17.6));
  }
  updateEarthCrisis(1 - THREE.MathUtils.smoothstep(storyTime, 0.35, 3.1));
  const lines = [
    [0, '—hello? Hello?!'],
    [1.45, 'They just… stopped?'],
    [3, 'The robots just stopped!'],
    [4.6, 'Are you there?'],
    [6.1, '…Thank you.'],
  ];
  for (const [time, line] of lines) {
    if (storyTime >= time) subtitle.textContent = line;
  }
  updateShot(dt);
  if (state.finaleElapsed >= (TEST_MODE ? 2.6 : 8)) {
    revealResults();
  }
}

function frame(now) {
  const rawDt = Math.min(0.1, Math.max(0.001, (now - lastTime) / 1000));
  lastTime = now;
  if (!document.hidden && !state.paused) {
    state.visualClock += rawDt;
    if (MISSION_MODES.has(state.mode)) state.missionElapsed += rawDt;
    if (state.mode === 'ready') {
      updateIntroCity();
    } else if (state.mode === 'playing') {
      if (state.introDelay > 0) {
        updateIntroTransition(rawDt);
      } else {
        state.elapsed += rawDt;
        state.totalElapsed += rawDt;
        state.hitCooldown = Math.max(0, state.hitCooldown - rawDt);
        updateActor(rawDt);
        updatePlayingWorld(rawDt);
        updateRobots(rawDt);
        updateCamera(rawDt);
        if (state.elapsed >= ACT_DURATION && (state.act !== 'city' || TEST_MODE || state.actDistance >= 318)) finishPlayingAct();
      }
    } else if (state.mode === 'boarding') {
      state.interludeElapsed += rawDt;
      const p = Math.min(1, state.interludeElapsed / BOARD_DURATION);
      const travel = THREE.MathUtils.smoothstep(p, 0, 1);
      const leap = Math.max(0, Math.min(1, (p - 0.55) / 0.45));
      player.position.set(THREE.MathUtils.lerp(state.boardFromX, 0, travel),
        0.2 + Math.sin(leap * Math.PI) * 0.85,
        THREE.MathUtils.lerp(0, climbAnchorZ, travel));
      player.rotation.y = THREE.MathUtils.lerp(player.rotation.y, 0, travel);
      if (playerJoints) {
        playerJoints.leftArm.rotation.x = -0.35 - leap * 1.1;
        playerJoints.rightArm.rotation.x = -0.35 - leap * 1.1;
        playerJoints.leftLeg.rotation.x = Math.sin(p * 18) * (1 - leap) * 0.6;
        playerJoints.rightLeg.rotation.x = -playerJoints.leftLeg.rotation.x;
      }
      updateShot(rawDt);
    } else if (state.mode === 'climb') {
      state.interludeElapsed += rawDt;
      state.totalElapsed += rawDt;
      state.climbTarget = Math.min(1, state.climbTarget + rawDt * (0.94 / CLIMB_DURATION));
      state.climbProgress = THREE.MathUtils.damp(state.climbProgress, state.climbTarget, 9, rawDt);
      updateClimbPresentation();
      updateCamera(rawDt);
      if ((state.climbTarget >= 1 && state.climbProgress >= 0.99 && state.interludeElapsed > 1.1)
        || (state.interludeElapsed >= CLIMB_DURATION && state.climbProgress >= 0.985)) finishClimb();
    } else if (state.mode === 'launch') {
      state.interludeElapsed += rawDt;
      const p = Math.min(1, state.interludeElapsed / PASSAGE_DURATION);
      const open = THREE.MathUtils.smoothstep(p, 0, 0.68);
      const left = rocketGroup.getObjectByName('boardingDoorLeft');
      const right = rocketGroup.getObjectByName('boardingDoorRight');
      if (left) left.position.x = -0.335 - 0.82 * open;
      if (right) right.position.x = 0.335 + 0.82 * open;
      player.position.z = climbAnchorZ + 1.45 * THREE.MathUtils.smoothstep(p, 0.35, 1);
      updateShot(rawDt);
    } else if (state.mode === 'launchExit') {
      const shot = state.shot;
      if (passageShield && shot) passageShield.scale.setScalar(2.5 * (1 - THREE.MathUtils.smoothstep(shot.elapsed / shot.duration, 0.28, 0.92)));
      updateShot(rawDt);
    } else if (state.mode === 'docking') {
      state.interludeElapsed += rawDt;
      state.totalElapsed += rawDt;
      const p = Math.min(1, state.interludeElapsed / DOCK_DURATION);
      dockingPort.position.z = THREE.MathUtils.lerp(14, 2.25, THREE.MathUtils.smoothstep(p, 0, 1));
      dockingPort.children.forEach((child, i) => { if (child.name.startsWith('dockRing')) child.rotation.z += rawDt * (i % 2 ? -0.8 : 0.55); });
      ship.rotation.z = Math.sin(state.interludeElapsed * 5) * (1 - p) * 0.12;
      ship.position.x = THREE.MathUtils.lerp(ship.position.x, 0, Math.min(1, rawDt * 2.2));
      ship.position.y = THREE.MathUtils.lerp(0.4, 3.35, THREE.MathUtils.smoothstep(p, 0, 1));
      if (p > 0.72 && !state.dockSoundPlayed) {
        state.dockSoundPlayed = true;
        dockingTitle.innerHTML = 'CONNECTION<br>SECURE';
        dockingCopy.textContent = '(probably)';
        audio.dockClunk();
      }
      updateCamera(rawDt);
      if (state.interludeElapsed >= DOCK_DURATION) finishDocking();
    } else if (state.mode === 'stationEntry') {
      if (state.passage === 'dockOut' && state.shot) {
        const p = state.shot.elapsed / state.shot.duration;
        player.position.z = 4 * (1 - THREE.MathUtils.smoothstep(p, 0, 1));
        if (passageShield) passageShield.scale.setScalar(2.5 * (1 - THREE.MathUtils.smoothstep(p, 0.28, 0.92)));
      }
      updateShot(rawDt);
    } else if (state.mode === 'switchApproach') {
      state.interludeElapsed += rawDt;
      const p = THREE.MathUtils.smoothstep(Math.min(1, state.interludeElapsed / SWITCH_APPROACH_DURATION), 0, 1);
      player.position.set(THREE.MathUtils.lerp(state.switchFromX, 1.6, p), 0.2,
        THREE.MathUtils.lerp(0, stationTerminal.position.z - 1.6, p));
      if (playerJoints) {
        playerJoints.leftLeg.rotation.x = Math.sin(p * 16) * (1 - p) * 0.45;
        playerJoints.rightLeg.rotation.x = -playerJoints.leftLeg.rotation.x;
        playerJoints.rightArm.rotation.x = -0.35 - p * 0.9;
      }
      updateShot(rawDt);
    } else if (state.mode === 'switch') {
      state.interludeElapsed += rawDt;
      stationSwitch.getObjectByName('buttonCap')?.rotation.set(0, state.interludeElapsed * 0.4, 0);
      updateCamera(rawDt);
    } else if (state.mode === 'finale') {
      updateFinale(rawDt);
    } else if (state.mode === 'complete') {
      updateResultCounters(rawDt);
    }
    if (state.mode !== 'finale' && state.mode !== 'complete') updateEarthCrisis(1);
  }

  fpsSamples.push(1 / rawDt);
  if (fpsSamples.length > 30) fpsSamples.shift();
  state.fps = Math.round(fpsSamples.reduce((a, b) => a + b, 0) / fpsSamples.length);

  chaseVisuals?.update({
    dt: rawDt,
    active: !document.hidden && state.mode === 'playing' && state.introDelay <= 0,
    paused: state.paused,
    act: state.act,
    distance: state.distance,
    targetX: LANES[state.targetLane + 1],
    player, playerJoints, ship,
    jumpY: state.jumpY, slide: state.slide,
  });
  rig.render(camera, state.paused ? 0 : rawDt);
  const actor = activeActor();
  window.__GAME__ = {
    pos: [actor?.position.x || 0, state.distance],
    fps: state.fps,
    speed: state.mode === 'playing' && !state.paused && state.introDelay <= 0 ? ACTS[state.act].speed : 0,
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
    obstaclesDodged: state.obstaclesDodged,
    missionTime: state.mode === 'finale' || state.mode === 'complete' ? state.missionTimeFinal : state.missionElapsed,
    rating: state.rating?.grade || null,
    inputCount: state.inputCount,
    paused: state.paused,
  };
  requestAnimationFrame(frame);
}

function resize() {
  const aspect = innerWidth / innerHeight;
  camera.aspect = aspect;
  // Keep the road and player at a useful scale on ultrawide monitors.
  camera.fov = aspect < 0.8 ? 58 : aspect > 1.8
    ? Math.max(34, THREE.MathUtils.radToDeg(2 * Math.atan(Math.tan(THREE.MathUtils.degToRad(50) / 2) * 1.8 / aspect)))
    : 50;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight, false);
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, innerWidth < 700 ? 1.25 : 1.5, Math.sqrt(4_500_000 / (innerWidth * innerHeight))));
  rig.resize(innerWidth, innerHeight);
  chaseVisuals?.setBaseFov(camera.fov);
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
playAgain.addEventListener('click', () => {
  const replayUrl = new URL(window.location.href);
  replayUrl.searchParams.delete('scene');
  window.location.assign(replayUrl.href);
});
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
  if (state.mode === 'playing') {
    state.elapsed = ACT_DURATION;
    if (state.act === 'city') state.actDistance = 318;
  }
  else if (state.shot) state.shot.elapsed = state.shot.duration;
  else if (state.mode === 'climb') finishClimb();
  else if (state.mode === 'docking') finishDocking();
  else if (state.mode === 'switch') beginFinale();
  else if (state.mode === 'finale') state.finaleElapsed = TEST_MODE ? 2.6 : 8;
};
window.__GAME__ = { pos: [0, 0], fps: 0, speed: 0, score: 0, over: false, draws: 0, tris: 0 };

loadAssets().then(() => {
  state.mode = 'ready';
  resetWorld('city');
  player.visible = true;
  updateIntroCity();
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
chaseVisuals = createChaseVisuals({ camera, baseFov: camera.fov, reducedMotion: REDUCED_MOTION });
requestAnimationFrame(frame);
