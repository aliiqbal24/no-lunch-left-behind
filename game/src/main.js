import * as THREE from 'three';
import { ASSET, bakeStatic } from '../lib/assetlib.js';
import { createRig } from '../lib/rig.js';
import { screenFlightToWorld, SwipeInput } from './input.js';
import { AudioEngine } from './audio.js';
import { createChaseVisuals } from './chase_visuals.js';
import { createCharacterMotion, setCharacterOutfit } from './character_motion.js';
import { poseBreakroom } from './intro_scene.js';
import {
  PROLOGUE_DURATION,
  PROLOGUE_BEATS,
  beatIndexAt,
  hasSeenPrologue,
  markPrologueSeen,
} from './intro_sequence.js';
import { calculateRating } from './results.js';
import { calculateStakes, WORLD_POPULATION, START_HUMANITY } from './mission_stakes.js';
import { finaleResponse, LOCK_START_SECONDS, LOCK_WARNING_SECONDS, OVERRIDE_RANGE, SPACE_NET } from './mission_cues.js';
import createLaunchCityDistricts from '../assets/launch_city_districts.js';

const $ = (selector) => document.querySelector(selector);
const canvas = $('#game');
const loading = $('#loading');
const loadingFill = $('#loadingFill');
const loadingText = $('#loadingText');
const startScreen = $('#start');
const startButton = $('#startb');
const missionReady = $('#missionReady');
const replayTransmission = $('#replayTransmission');
const introTime = $('#introTime');
const introBubble = $('#introBubble');
const introSpeaker = $('#introSpeaker');
const introLine = $('#introLine');
const introStatus = $('#introStatus');
const introSound = $('#introSound');
const hud = $('#hud');
const stick = $('#stick');
const flightJoystick = $('#flightJoystick');
const tutorial = $('#tutorial');
const tutorialText = $('#tutorialText');
const humanityLabel = $('#humanityLabel');
const humanityTrack = $('.humanity-track');
const humanityFill = $('#humanityFill');
const populationCrowd = $('#populationCrowd');
const robotAdvance = $('#robotAdvance');
const forecast = $('#forecast');
const actLabel = $('#actLabel');
const districtLabel = $('#districtLabel');
const overridePrompt = $('#overridePrompt');
const overrideTitle = $('#overrideTitle');
const overrideInstruction = $('#overrideInstruction');
const lockWarning = $('#lockWarning');
const lockTitle = $('#lockTitle');
const lockInstruction = $('#lockInstruction');
const lockLanes = [...document.querySelectorAll('.lock-lane')];
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
const signalLabel = $('#signalLabel');
const resultsCard = $('#resultsCard');
const resultsGrade = $('#resultsGrade');
const resultsTitle = $('#resultsTitle');
const resultsScore = $('#resultsScore');
const resultsPeople = $('#resultsPeople');
const resultsPeopleExact = $('#resultsPeopleExact');
const resultsDodged = $('#resultsDodged');
const resultsTime = $('#resultsTime');
const resultsHits = $('#resultsHits');
const resultsOverrides = $('#resultsOverrides');
const playAgain = $('#playAgain');
const overrideControlHint = $('#overrideControlHint');

const params = new URLSearchParams(location.search);
const TEST_MODE = params.has('test');
const DEV_MODE = params.has('dev') || TEST_MODE || ['localhost', '127.0.0.1'].includes(location.hostname);
const REDUCED_MOTION = matchMedia('(prefers-reduced-motion: reduce)').matches;
const START_SCENE = params.get('scene');
const KEYBOARD_HINTS = !matchMedia('(pointer: coarse)').matches;
overrideControlHint.textContent = KEYBOARD_HINTS ? 'E to cut off' : 'tap to cut off';
const ACT_DURATION = TEST_MODE ? 3.6 : 25;
const CLIMB_DURATION = TEST_MODE ? 1.8 : 5;
const DOCK_DURATION = TEST_MODE ? 1.5 : 3;
const INTRO_TRANSITION = 0.9;
const BOARD_DURATION = TEST_MODE ? 0.65 : 1.35;
const PASSAGE_DURATION = TEST_MODE ? 0.65 : 1.35;
const LIFTOFF_DURATION = TEST_MODE ? 1.8 : 3;
const SWITCH_APPROACH_DURATION = TEST_MODE ? 0.55 : 1.15;
const SPACE_BOUNDS = Object.freeze({ x: 5.7, minY: 0.35, maxY: 7.6 });
const INTERCEPTOR_SHOTS = Object.freeze([5.8, 10.2, 14.4]);
const ROCKET_SCALE = 4;
const LAUNCH_COMPLEX_SCALE = 4;
const ROCKET_BASE_Y = 0.55;
const ROCKET_HATCH_Y = ROCKET_BASE_Y + 5.28 * ROCKET_SCALE;
const ROCKET_CLIMB_HEIGHT = 4.8 * ROCKET_SCALE;
// The chase camera looks toward +Z, so screen-left is world +X.
const LANES = [2.2, 0, -2.2];
const OVERRIDE_EVENTS = {
  city: { at: 218, lane: -1, label: 'RAIL SIGNAL RELAY', saved: 'TRAINS RELEASED · 400M LIVES PROTECTED' },
  station: { at: 215, lane: 1, label: 'STATION SAFETY BREAKER', saved: 'STATION GRID ISOLATED · 400M LIVES PROTECTED' },
};
const compactPeople = new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 });
const crowdPeople = Array.from({ length: 25 }, () => {
  const person = document.createElement('span');
  person.className = 'population-person';
  populationCrowd.append(person);
  return person;
});

const ACTS = {
  city: { kicker: 'ACT 1 · THE CITY IS FALLING', title: 'CITY RUN', order: 'REACH THE LAST LAUNCH', speed: 12.5, spawnEvery: 1.06 },
  space: { kicker: 'ACT 2 · ORBIT IS COMPROMISED', title: 'SPACE FLIGHT', order: 'BREAK THROUGH THE AI NET', speed: 15.2, spawnEvery: 1.02 },
  station: { kicker: 'ACT 3 · LAST HUMAN CHANCE', title: 'STATION CORRIDOR', order: 'CUT THE FINAL LINK', speed: 13.4, spawnEvery: 1.0 },
};
const MISSION_MODES = new Set(['playing', 'boarding', 'climb', 'launch', 'liftoff', 'launchExit', 'docking', 'stationEntry', 'switchApproach', 'switch']);

function expectedMissionSeconds() {
  const firstAct = ['city', 'space', 'station'].includes(START_SCENE) ? START_SCENE : 'city';
  let seconds = ACT_DURATION + SWITCH_APPROACH_DURATION;
  if (firstAct !== 'station') seconds += ACT_DURATION + DOCK_DURATION + 2 * PASSAGE_DURATION;
  if (firstAct === 'city') {
    seconds += Math.max(ACT_DURATION, TEST_MODE ? 0 : 318 / ACTS.city.speed)
      + BOARD_DURATION + CLIMB_DURATION + 2 * PASSAGE_DURATION + LIFTOFF_DURATION
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
  [{ x: -3.8, y: 1.4, type: 'drone' }],
  [{ x: 3.6, y: 5.8, type: 'wreckage' }],
  [{ x: -3.2, y: 5.5, type: 'drone' }, { x: 3.4, y: 1.2, type: 'debris' }],
  [{ x: 0.2, y: 3.6, type: 'wreckage' }],
  [{ x: -4.2, y: 2.2, type: 'debris' }, { x: 3.8, y: 5.9, type: 'drone' }],
  [{ x: -3.7, y: 6.2, type: 'wreckage' }, { x: 3.5, y: 1.0, type: 'drone' }],
  [{ x: 0, y: 1.1, type: 'debris' }, { x: 0.6, y: 6.3, type: 'drone' }],
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
const overrideGreen = new THREE.MeshStandardMaterial({
  color: 0x45c4b0, emissive: 0x45c4b0, emissiveIntensity: 1.1,
});
overrideGreen.name = 'metal';
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
const introRoot = new THREE.Group();
scene.add(cityRoot, spaceRoot, stationRoot, actorRoot, obstacleRoot, robotRoot, introRoot);

const rig = createRig(THREE, renderer, scene, {
  tier: 'phone', hour: 17.1, azimuth: 238, exposure: 1.04,
  fogStart: 28, fogDensity: 0.0042, shadowDist: 38,
});
const audio = new AudioEngine();
muteButton.textContent = audio.enabled ? 'SOUND ON' : 'SOUND OFF';
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
  overrides: { city: 'pending', station: 'pending' }, overtime: 0,
  lockOn: { phase: 'idle', lane: 0, timer: 0 },
  netGate: { phase: 'idle', timer: 0 },
  flightInput: { x: 0, y: 0, active: false }, flightVelocity: { x: 0, y: 0 },
  interceptor: { shotIndex: 0, warning: false }, dockFromY: 0.4,
  finaleOutcome: null,
  introElapsed: 0, introBeatIndex: -1,
};

let chaseVisuals = null;
const characterMotion = createCharacterMotion();
let player;
let playerJoints;
let playerOutfit = 'office';

function setPlayerOutfit(outfit) {
  if (!player || playerOutfit === outfit) return;
  setCharacterOutfit(player, outfit);
  playerOutfit = outfit;
}
let introRoom;
let introCoworker;
let ship;
let cityChunks = [];
let cityAnimated = [];
let cityRelay;
let stationBreaker;
let stationChunks = [];
let obstacles = [];
let prototypes = { city: {}, space: {}, station: {} };
let rocketGroup;
let rocketBody;
let launchFlames;
let launchSmoke;
let launchEngineLight;
let launchShockwave;
let stationSwitch;
let stationEarth;
let stationTerminal;
let stationWindow;
let stationEntryPassage;
let earthCrisis;
let stationAlarmGroups = [];
let stationPassiveGroups = [];
let stationAlarmMaterials = [];
let stationPassiveMaterials = [];
let dockingPort;
let spaceBackdrop;
let spaceGate;
let spaceDrift = [];
let spaceInterceptor;
let interceptorLaserPrototype;
let spaceProjectiles = [];
let climbLadder;
let climbAnchorZ = 0;
let lastTime = performance.now();
let fpsSamples = [];
let patternIndex = 0;
let spawnClock = 0;
let tutorialStage = 0;
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

function bakePreserving(root, preservedNames) {
  root.updateMatrixWorld(true);
  const preserved = [];
  root.traverse((part) => {
    if (!preservedNames.has(part.name)) return;
    let parent = part.parent;
    while (parent && parent !== root) {
      if (preservedNames.has(parent.name)) return;
      parent = parent.parent;
    }
    preserved.push(part);
  });
  const inverse = root.matrixWorld.clone().invert();
  const optimized = [];
  for (const part of preserved) {
    const localMatrix = inverse.clone().multiply(part.matrixWorld);
    part.removeFromParent();
    const position = new THREE.Vector3();
    const quaternion = new THREE.Quaternion();
    const scale = new THREE.Vector3();
    localMatrix.decompose(position, quaternion, scale);
    if (part.children.length) {
      part.position.set(0, 0, 0); part.quaternion.identity(); part.scale.set(1, 1, 1);
      const bakedPart = bakeStatic(part);
      bakedPart.name = part.name;
      bakedPart.userData = { ...part.userData };
      bakedPart.position.copy(position); bakedPart.quaternion.copy(quaternion); bakedPart.scale.copy(scale);
      optimized.push(bakedPart);
    } else {
      part.position.copy(position); part.quaternion.copy(quaternion); part.scale.copy(scale);
      optimized.push(part);
    }
  }
  const result = new THREE.Group();
  result.name = root.name;
  result.userData = { ...root.userData };
  result.add(bakeStatic(root), ...optimized);
  return result;
}

async function loadAssets() {
  setLoad(8, 'authorising unscheduled heroism…');
  const [playerAsset, shipAsset, boxy, spider, roller, roomAsset, coworkerAsset] = await Promise.all([
    ASSET(assetUrl('player_hero'), { keepHierarchy: true }),
    ASSET(assetUrl('player_ship'), { keepHierarchy: true }),
    ASSET(assetUrl('robot_boxy')),
    ASSET(assetUrl('robot_spider')),
    ASSET(assetUrl('robot_roller')),
    ASSET(assetUrl('intro_breakroom'), { keepHierarchy: true }),
    ASSET(assetUrl('intro_coworker'), { keepHierarchy: true }),
  ]);

  setLoad(26, 'weaponising household appliances…');
  const [road, building, billboard, cone, toaster, mower, chair, rocket, launchFx, hub, wayfinder, citySky, relayAsset] = await Promise.all([
    ASSET(assetUrl('city_road'), { surfaces: true }),
    ASSET(assetUrl('city_building'), { surfaces: true }),
    ASSET(assetUrl('billboard'), { keepHierarchy: true }),
    ASSET(assetUrl('traffic_cone')),
    ASSET(assetUrl('toaster')),
    ASSET(assetUrl('lawnmower')),
    ASSET(assetUrl('office_chair')),
    ASSET(assetUrl('rocket'), { keepHierarchy: true }),
    ASSET(assetUrl('rocket_launch_fx'), { keepHierarchy: true }),
    ASSET(assetUrl('rocket_hub'), { surfaces: true }),
    ASSET(assetUrl('spaceport_wayfinder'), { surfaces: true }),
    ASSET(assetUrl('city_sky')),
    ASSET(assetUrl('manual_override'), { keepHierarchy: true }),
  ]);

  setLoad(54, 'auditing low-orbit litter…');
  const [satellite, debris, backdrop, port, netGateAsset, drone, wreckage, interceptor, laserBolt] = await Promise.all([
    ASSET(assetUrl('satellite')),
    ASSET(assetUrl('space_debris')),
    ASSET(assetUrl('space_backdrop'), { keepHierarchy: true }),
    ASSET(assetUrl('docking_port'), { keepHierarchy: true }),
    ASSET(assetUrl('orbital_net_gate'), { keepHierarchy: true }),
    ASSET(assetUrl('space_drone'), { keepHierarchy: true }),
    ASSET(assetUrl('orbital_wreckage'), { keepHierarchy: true }),
    ASSET(assetUrl('ai_interceptor'), { keepHierarchy: true }),
    ASSET(assetUrl('ai_laser_bolt'), { keepHierarchy: true }),
  ]);

  setLoad(72, 'installing corridor bureaucracy…');
  const [corridor, laser, security, masterSwitch, earth, ladder, endWindow, crisis] = await Promise.all([
    ASSET(assetUrl('station_corridor'), { keepHierarchy: true }),
    ASSET(assetUrl('laser_gate'), { keepHierarchy: true }),
    ASSET(assetUrl('security_bot'), { keepHierarchy: true }),
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

  introRoom = roomAsset;
  introRoom.position.set(-15.5, 0, 3);
  introRoot.add(introRoom);
  introCoworker = coworkerAsset;
  introCoworker.position.set(-14.05, 0.24, 1.1);
  introRoot.add(introCoworker);
  introRoot.visible = false;

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
    debris: { object: debris, scale: 1.05, radius: 0.82 },
    drone: { object: drone, scale: 0.82, radius: 1.0 },
    wreckage: { object: wreckage, scale: 0.72, radius: 1.28 },
  };
  prototypes.station = {
    security: { object: security, kind: 'low', clearance: 0.82, scale: 0.95, y: 0.2 },
    laserLow: { object: laser, kind: 'low', clearance: 0.78, scale: 1, y: 0.2 },
    laserHigh: { object: laser, kind: 'high', clearance: 0.8, scale: 1, y: 0.2, beamLift: 0.76 },
  };

  buildCity(road, building, billboard, rocket, launchFx, hub, wayfinder, citySky);
  cityRelay = relayAsset.clone(true);
  cityRelay.position.set(LANES[0], 0.2, OVERRIDE_EVENTS.city.at);
  cityRoot.add(cityRelay);
  buildRobotArmy([boxy, spider, roller]);
  buildSpace(backdrop, port, netGateAsset, satellite, debris, wreckage, interceptor, laserBolt);
  const optimizedCorridor = bakePreserving(corridor, new Set(['stationAlarmSystem', 'stationPassiveSystem']));
  buildStation(optimizedCorridor, masterSwitch, earth, endWindow, crisis);
  stationBreaker = relayAsset.clone(true);
  stationBreaker.position.set(LANES[2], 0.2, OVERRIDE_EVENTS.station.at);
  stationRoot.add(stationBreaker);
  buildClimb(ladder);

  setLoad(92, 'warming emergency lighting…');
  await rig.ready;
  rig.refresh(scene);
  setWorld('city');
  player.visible = false;
  setLoad(100, 'catastrophe approved');
}

function buildCity(road, building, billboard, rocket, launchFx, hub, wayfinder, citySky) {
  const signTexture = makeBillboardTexture();
  const districtAssets = [...createLaunchCityDistricts(THREE).children];
  // Workers and alarm lamps are deliberately baked into each city chunk. Their
  // authored poses and emissive lenses survive, while batching them keeps the
  // production-detail pass inside the jam's phone draw-call budget.
  const movingNames = new Set(['evacTrain', 'craneArm', 'ventFlare', 'railSignal',
    'commandeeredTransit', 'aiSentinel', 'scanBeam']);
  citySky.position.set(0, 18, 170);
  citySky.traverse((object) => { if (object.isMesh) { object.castShadow = false; object.receiveShadow = false; } });
  cityRoot.add(citySky);
  // The whole road exists from the first frame; no distant section is recycled into view.
  for (let i = 0; i < 10; i++) {
    const chunk = new THREE.Group();
    chunk.position.z = i * 40 + 12;
    chunk.add(road.clone(true));
    const sourceDetail = districtAssets[i];
    sourceDetail.updateMatrixWorld(true);
    const moving = [];
    sourceDetail.traverse((part) => {
      if (!movingNames.has(part.name)) return;
      let parent = part.parent;
      while (parent && parent !== sourceDetail) {
        if (movingNames.has(parent.name)) return;
        parent = parent.parent;
      }
      moving.push(part);
    });
    const sourceInverse = sourceDetail.matrixWorld.clone().invert();
    const optimizedMoving = [];
    for (const part of moving) {
      const localMatrix = sourceInverse.clone().multiply(part.matrixWorld);
      part.removeFromParent();
      const position = new THREE.Vector3();
      const quaternion = new THREE.Quaternion();
      const scale = new THREE.Vector3();
      localMatrix.decompose(position, quaternion, scale);
      if (part.isGroup) {
        part.position.set(0, 0, 0); part.quaternion.identity(); part.scale.set(1, 1, 1);
        const bakedPart = bakeStatic(part);
        bakedPart.name = part.name;
        bakedPart.userData = { ...part.userData };
        bakedPart.position.copy(position); bakedPart.quaternion.copy(quaternion); bakedPart.scale.copy(scale);
        optimizedMoving.push(bakedPart);
      } else {
        part.position.copy(position); part.quaternion.copy(quaternion); part.scale.copy(scale);
        optimizedMoving.push(part);
      }
    }
    const detail = new THREE.Group();
    detail.name = sourceDetail.name;
    detail.userData = { ...sourceDetail.userData };
    detail.add(bakeStatic(sourceDetail), ...optimizedMoving);
    chunk.add(detail);
    detail.traverse((part) => {
      if (['evacWorker', 'evacTrain', 'craneArm', 'ventFlare', 'alarmLamp', 'railSignal',
        'commandeeredTransit', 'aiSentinel', 'scanBeam'].includes(part.name)) {
        part.userData.homeZ = part.position.z;
        part.userData.homeY = part.position.y;
        part.userData.phase = part.position.x * 0.7 + part.position.z * 0.11;
        if (part.name === 'evacTrain') part.userData.progress = 6;
        cityAnimated.push(part);
      }
    });
    for (const side of [-1, 1]) {
      if (i > 1) continue;
      for (let slot = 0; slot < 2; slot++) {
        const b = building.clone(true);
        const scale = 0.72 + ((i * 3 + slot * 5 + (side > 0 ? 2 : 0)) % 6) * 0.09;
        b.scale.set(scale * (slot ? 0.9 : 1.08), scale, scale);
        b.position.set(side * (15.5 + slot * 4.4), 0, -9 + slot * 18);
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
  rocketBody = bakePreserving(rocket, new Set(['boardingDoorLeft', 'boardingDoorRight', 'boardingOccluder']));
  rocketBody.scale.setScalar(ROCKET_SCALE);
  rocketBody.position.y = ROCKET_BASE_Y;
  rocketBody.name = 'cityRocket';
  const sourceFlames = launchFx.getObjectByName('launchFlames');
  const sourceSmoke = launchFx.getObjectByName('launchSmoke');
  sourceFlames.removeFromParent();
  sourceSmoke.removeFromParent();
  launchFlames = bakeStatic(sourceFlames);
  launchFlames.name = 'launchFlames';
  launchSmoke = bakePreserving(sourceSmoke, new Set(['launchSmokePuff', 'launchShockwave']));
  launchSmoke.name = 'launchSmoke';
  launchSmoke.scale.setScalar(ROCKET_SCALE);
  launchFlames.visible = false;
  launchSmoke.visible = false;
  launchEngineLight = launchFlames.getObjectByName('launchEngineLight');
  launchShockwave = launchSmoke.getObjectByName('launchShockwave');
  rocketBody.add(launchFlames);
  hub.scale.setScalar(LAUNCH_COMPLEX_SCALE);
  // Keep the enlarged pad deck aligned to the runner road instead of lifting
  // the player four metres into its foundation.
  hub.position.y = -3.3;
  rocketGroup.add(hub, rocketBody, launchSmoke);
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

function buildSpace(backdrop, port, netGateAsset, satellite, debris, wreckage, interceptor, laserBolt) {
  spaceBackdrop = backdrop;
  spaceBackdrop.position.y = -140;
  spaceRoot.add(spaceBackdrop);
  spaceGate = netGateAsset;
  spaceGate.visible = false;
  spaceRoot.add(spaceGate);
  for (const [asset, x, y, z, scale] of [
    [satellite, 12, 7, 35, 1.45], [debris, -11, 2, 61, 1.8],
    [satellite, -13, -4, 88, 1.15], [wreckage, 10, 9, 109, 1.0],
  ]) {
    const object = asset.clone(true);
    object.scale.setScalar(scale);
    object.position.set(x, y, z);
    object.userData.homeZ = z;
    spaceRoot.add(object);
    spaceDrift.push(object);
  }
  spaceInterceptor = interceptor;
  spaceInterceptor.scale.setScalar(1.02);
  spaceInterceptor.position.set(0, 4.8, 23);
  spaceInterceptor.visible = false;
  spaceRoot.add(spaceInterceptor);
  interceptorLaserPrototype = laserBolt;
  dockingPort = port;
  dockingPort.position.set(0, 0, ACT_DURATION * 6 + 10);
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
  stationEarth.scale.setScalar(1.48);
  stationEarth.rotation.y = Math.PI;
  stationWindow.userData.earthMount.add(stationEarth);
  earthCrisis = crisis;
  stationEarth.add(earthCrisis);
  earthCrisis.traverse((part) => {
    if (part.isMesh) { part.castShadow = false; part.receiveShadow = false; }
  });
  collectStationVisualState();
  setStationThreatLevel(1);
}

function collectStationVisualState() {
  stationAlarmGroups = [];
  stationPassiveGroups = [];
  const alarmMaterials = new Set();
  const passiveMaterials = new Set();
  stationRoot.traverse((part) => {
    if (part.name === 'stationAlarmSystem') stationAlarmGroups.push(part);
    if (part.name === 'stationPassiveSystem') stationPassiveGroups.push(part);
    if (!part.isMesh || !part.material) return;
    const materials = Array.isArray(part.material) ? part.material : [part.material];
    for (const material of materials) {
      if (material.name === 'stationAlarmMaterial') alarmMaterials.add(material);
      if (material.name === 'stationPassiveMaterial') passiveMaterials.add(material);
    }
  });
  stationAlarmMaterials = [...alarmMaterials];
  stationPassiveMaterials = [...passiveMaterials];
  for (const material of [...stationAlarmMaterials, ...stationPassiveMaterials]) {
    material.userData.stationBaseEmissive = material.emissiveIntensity || 0;
    material.userData.stationBaseOpacity = material.opacity;
  }
}

function setStationThreatLevel(level) {
  const threat = THREE.MathUtils.clamp(level, 0, 1);
  const safe = 1 - threat;
  for (const group of stationAlarmGroups) group.visible = threat > 0.015;
  for (const group of stationPassiveGroups) group.visible = safe > 0.015;
  for (const material of stationAlarmMaterials) {
    material.emissiveIntensity = material.userData.stationBaseEmissive * (0.08 + threat * 0.92);
    if (material.transparent) material.opacity = material.userData.stationBaseOpacity * threat;
  }
  for (const material of stationPassiveMaterials) {
    material.emissiveIntensity = material.userData.stationBaseEmissive * safe;
    if (material.transparent) material.opacity = material.userData.stationBaseOpacity * safe;
  }
}

function buildClimb(ladder) {
  climbLadder = ladder;
  climbLadder.scale.setScalar(ROCKET_SCALE);
  climbLadder.position.set(0, 0, -1.9 * ROCKET_SCALE);
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

function concealMissionReady() {
  missionReady.classList.remove('revealed');
  startScreen.classList.remove('mission-armed');
  missionReady.hidden = true;
  missionReady.inert = true;
  missionReady.setAttribute('aria-hidden', 'true');
  startButton.textContent = 'PLAY NOW ↗';
}

function revealMissionReady() {
  missionReady.hidden = false;
  missionReady.inert = false;
  missionReady.setAttribute('aria-hidden', 'false');
  startScreen.classList.add('mission-armed');
  missionReady.classList.add('revealed');
  startButton.textContent = 'RUN TO THE ROCKET';
}

function showIntroBeat(index) {
  const beat = PROLOGUE_BEATS[index];
  introBubble.hidden = !beat.line;
  introBubble.classList.toggle('robot', beat.speaker === 'COWORKER');
  introBubble.classList.toggle('code-red', beat.id === 'evacuate');
  introSpeaker.textContent = beat.speaker;
  introLine.textContent = beat.line;
  introStatus.textContent = beat.id === 'red' || beat.id === 'evacuate'
    ? 'CODE RED · AI SAFETY GRID COMPROMISED' : 'INCIDENT ZERO · THE LAST NORMAL LUNCH BREAK';
  startScreen.classList.toggle('code-red', index >= 6);
  audio.introCue(beat.cue);
}

function startPrologue() {
  setPlayerOutfit('office');
  state.mode = 'intro';
  state.introElapsed = 0;
  state.introBeatIndex = -1;
  concealMissionReady();
  introRoot.visible = true;
  cityRoot.visible = false;
  obstacleRoot.visible = false;
  player.visible = true;
  ship.visible = false;
  document.body.classList.add('intro-playing');
  startScreen.classList.add('visible');
  introBubble.hidden = true;
  introTime.textContent = '00:00';
  introSound.textContent = audio.ctx && audio.enabled ? '♪ SOUND ON' : '♪ ENABLE SOUND';
  poseBreakroom({ THREE, timeMs: 0, room: introRoom, coworker: introCoworker,
    player, playerJoints, camera, aim: cameraAim, reducedMotion: REDUCED_MOTION });
  showIntroBeat(0);
  state.introBeatIndex = 0;
  if (audio.ctx) void audio.startIntro();
}

function finishPrologue() {
  if (state.mode !== 'intro') return;
  try { markPrologueSeen(window.localStorage); }
  catch { /* The game remains playable without storage. */ }
  state.mode = 'ready';
  introRoot.visible = false;
  cityRoot.visible = true;
  obstacleRoot.visible = true;
  player.visible = true;
  startScreen.classList.remove('code-red');
  playerJoints.neutralMouth.visible = true;
  playerJoints.sadMouth.visible = false;
  playerJoints.angryMouth.visible = false;
  playerJoints.tear.visible = false;
  playerJoints.leftBrow.rotation.z = 0;
  playerJoints.rightBrow.rotation.z = 0;
  playerJoints.head.rotation.z = 0;
  playerJoints.leftLeg.rotation.x = 0;
  playerJoints.rightLeg.rotation.x = 0;
  updateIntroCity();
  revealMissionReady();
}

function updatePrologue(dt) {
  state.introElapsed = Math.min(PROLOGUE_DURATION, state.introElapsed + dt * 1000);
  const index = beatIndexAt(state.introElapsed);
  if (index !== state.introBeatIndex) {
    showIntroBeat(index);
    state.introBeatIndex = index;
  }
  introTime.textContent = `00:${String(Math.floor(state.introElapsed / 1000)).padStart(2, '0')}`;
  poseBreakroom({ THREE, timeMs: state.introElapsed, room: introRoom, coworker: introCoworker,
    player, playerJoints, camera, aim: cameraAim, reducedMotion: REDUCED_MOTION });
  if (state.introElapsed >= PROLOGUE_DURATION) finishPrologue();
}

function showHazardHint() {
  tutorialStage = 1;
  tutorialText.textContent = KEYBOARD_HINTS
    ? 'UP / W JUMPS LOW HAZARDS · DOWN / S SLIDES UNDER HIGH ONES'
    : 'SWIPE UP OVER LOW HAZARDS · DOWN UNDER HIGH ONES';
}

function updateCityTutorial() {
  if (state.act !== 'city' || state.mode !== 'playing') return;
  if (tutorialStage === 0 && state.elapsed >= 5) showHazardHint();
  if (tutorialStage < 2 && state.elapsed >= 11) {
    tutorialStage = 2;
    tutorial.classList.remove('visible');
  }
}

function onGesture(kind, source = 'touch') {
  if (state.mode !== 'playing' || state.paused || state.introDelay > 0) return;
  state.inputCount += 1;
  if (kind === 'tap') {
    tryOverride();
    return;
  }
  // Space Flight is continuous and two-dimensional. Keyboard presses and touch
  // drags are consumed by onFlightAnalog instead of being quantised into lanes.
  if (state.act === 'space') {
    if (source === 'keyboard') audio.gesture(kind);
    return;
  }
  audio.gesture(kind);
  // The City introduction faces the runner briefly; follow screen direction during that camera flip.
  const screenLeftStep = camera.getWorldDirection(new THREE.Vector3()).z < 0 ? 1 : -1;
  if (kind === 'left') state.targetLane = THREE.MathUtils.clamp(state.targetLane + screenLeftStep, -1, 1);
  if (kind === 'right') state.targetLane = THREE.MathUtils.clamp(state.targetLane - screenLeftStep, -1, 1);
  if (kind === 'up' && state.jumpY < 0.04) {
    state.jumpVelocity = 8.6;
    state.slide = 0;
  }
  if (kind === 'down' && state.jumpY < 0.12) state.slide = 0.65;

  if (state.act === 'city' && tutorialStage === 0 && (kind === 'left' || kind === 'right')) {
    showHazardHint();
  } else if (state.act === 'city' && tutorialStage === 1 && (kind === 'up' || kind === 'down')) {
    tutorialStage = 2;
    tutorial.classList.remove('visible');
  }
}

function onFlightAnalog(input) {
  if (state.act !== 'space' || state.mode !== 'playing' || state.paused || state.introDelay > 0) {
    state.flightInput = { x: 0, y: 0, active: false };
    flightJoystick.classList.remove('active');
    return;
  }
  state.flightInput = { x: input.x, y: input.y, active: input.active };
  if (input.active && input.source === 'touch') {
    flightJoystick.style.left = `${input.originX}px`;
    flightJoystick.style.top = `${input.originY}px`;
    flightJoystick.style.setProperty('--joy-dx', `${input.x * 34}px`);
    flightJoystick.style.setProperty('--joy-dy', `${-input.y * 34}px`);
    flightJoystick.classList.add('active');
  } else {
    flightJoystick.classList.remove('active');
  }
}

new SwipeInput(stick, onGesture, onFlightAnalog);

function syncDevPause() {
  const available = DEV_MODE && ['playing', 'boarding', 'climb', 'launch', 'liftoff', 'launchExit', 'docking', 'stationEntry', 'switchApproach', 'switch', 'finale'].includes(state.mode) && state.introDelay <= 0;
  devPauseButton.classList.toggle('visible', available);
  devPauseButton.classList.toggle('paused', state.paused);
  devPauseButton.textContent = state.paused ? '▶' : 'Ⅱ';
  devPauseButton.setAttribute('aria-label', state.paused ? 'Resume game' : 'Pause game');
  devPauseButton.title = state.paused ? 'Resume game' : 'Pause game';
  devPausedLabel.classList.toggle('visible', available && state.paused);
  document.body.classList.toggle('dev-paused', state.paused);
}

function setDevPaused(paused) {
  if (!DEV_MODE || !['playing', 'boarding', 'climb', 'launch', 'liftoff', 'launchExit', 'docking', 'stationEntry', 'switchApproach', 'switch', 'finale'].includes(state.mode)) return;
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
  state.overrides = { city: 'pending', station: 'pending' };
  state.overtime = 0;
  state.lockOn = { phase: 'idle', lane: 0, timer: 0 };
  state.netGate = { phase: 'idle', timer: 0 };
  state.flightInput = { x: 0, y: 0, active: false };
  state.flightVelocity = { x: 0, y: 0 };
  state.interceptor = { shotIndex: 0, warning: false };
  state.dockFromY = 0.4;
  state.finaleOutcome = null;
  overridePrompt.classList.remove('visible', 'in-range');
  lockWarning.classList.remove('visible', 'firing', 'cleared', 'net-gate', 'free-flight');
  flightJoystick.classList.remove('active');
  updateHumanity();
}

function startGame() {
  if (state.mode === 'intro') finishPrologue();
  if (state.mode !== 'ready' || startScreen.classList.contains('exiting')) return;
  state.shot = null;
  state.passage = '';
  state.finaleElapsed = 0;
  state.finalePanStarted = false;
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
  void audio.start().then(() => audio.prologueTransition());
  startAct(firstAct, fromIntro);
}

function startAct(name, fromIntro = false, fromTransition = false) {
  if (name !== 'space') setPlayerOutfit(name === 'station' ? 'suit' : 'office');
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
  state.lockOn = { phase: 'idle', lane: 0, timer: 0 };
  state.netGate = { phase: 'idle', timer: 0 };
  state.flightInput = { x: 0, y: 0, active: false };
  state.flightVelocity = { x: 0, y: 0 };
  state.interceptor = { shotIndex: 0, warning: false };
  lockWarning.classList.remove('visible', 'firing', 'cleared', 'net-gate', 'free-flight');
  lockLanes.forEach((lane) => lane.classList.remove('targeted', 'safe'));
  overridePrompt.classList.remove('visible', 'in-range');
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
  districtLabel.textContent = name === 'city' ? 'WORKER DISTRICT · EVACUATION IN PROGRESS'
    : name === 'space' ? 'ORBITAL DEFENCE GRID · ACTIVE' : 'STATION SAFETY GRID · COMPROMISED';
  hud.classList.toggle('visible', !fromIntro && !fromTransition);
  hud.classList.toggle('on-dark', name === 'space');
  hud.classList.toggle('on-station', name === 'station');
  stick.classList.toggle('visible', !fromIntro && !fromTransition);
  stick.classList.toggle('flight-mode', name === 'space');
  tutorial.classList.toggle('visible', name === 'city' && !fromIntro && !fromTransition);
  tutorialText.textContent = name === 'city'
    ? (KEYBOARD_HINTS ? 'LEFT / RIGHT OR A / D TO CHANGE LANES' : 'SWIPE TO CHANGE LANES')
    : name === 'space' ? (KEYBOARD_HINTS ? 'WASD / ARROWS · FLY FREELY · EVADE RED FIRE' : 'TOUCH ANYWHERE · DRAG TO FLY · RELEASE TO COAST') :
      (KEYBOARD_HINTS ? 'SAME KEYS · REACH THE SWITCH' : 'SAME SWIPES · REACH THE SWITCH');
  if (name === 'space' && !fromTransition) {
    tutorial.classList.add('visible');
    setTimeout(() => {
      if (state.mode === 'playing' && state.act === 'space') tutorial.classList.remove('visible');
    }, 2600);
  }
  audio.setAct(name);
  rig.setTime(name === 'city' ? { hour: 17.1, azimuth: 238 } : name === 'space' ? { hour: 10.5, azimuth: 210 } : { hour: 17.2, azimuth: 166 });
  if (name === 'city') {
    // Place the obstacles along the road now, so each one is approached in space.
    const spacing = ACTS.city.speed * ACTS.city.spawnEvery;
    for (let i = 0; i < 18; i++) spawnPattern(106 + i * spacing);
  }
  if (!fromIntro && !fromTransition) showBanner(act.kicker, act.title, act.order);
  updateHumanity();
}

function revealAct(name) {
  state.mode = 'playing';
  hud.classList.add('visible');
  stick.classList.add('visible');
  stick.classList.toggle('flight-mode', name === 'space');
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
  clearSpaceProjectiles();
}

function resetWorld(name, preserveCamera = false) {
  cityChunks.forEach((chunk, index) => {
    chunk.position.z = index * 40 + 12;
    chunk.visible = true;
  });
  stationChunks.forEach((chunk, index) => { chunk.position.z = index * 40 + 12; chunk.visible = true; });
  rocketGroup.position.set(0, 0, 330);
  rocketGroup.visible = name === 'city';
  rocketBody.position.set(0, ROCKET_BASE_Y, 0);
  climbLadder.visible = true;
  launchFlames.visible = false;
  launchSmoke.visible = false;
  launchEngineLight.intensity = 0;
  const leftDoor = rocketGroup.getObjectByName('boardingDoorLeft');
  const rightDoor = rocketGroup.getObjectByName('boardingDoorRight');
  if (leftDoor) leftDoor.position.x = -0.335;
  if (rightDoor) rightDoor.position.x = 0.335;
  stationTerminal.position.set(0, 0, 330);
  stationEntryPassage.visible = false;
  stationSwitch.visible = true;
  const resetCap = stationSwitch.getObjectByName('buttonCap');
  if (resetCap) resetCap.position.y = resetCap.userData.restY ?? 2;
  setStationThreatLevel(1);
  stationEarth.position.set(0, 0, 0);
  dockingPort.position.set(0, 0, ACT_DURATION * 6 + 10);
  dockingPort.visible = name === 'space';
  robotRoot.children.forEach((bot) => { bot.position.z = bot.userData.homeZ; });
  if (!preserveCamera) {
    player.position.set(0, 0.2, 0);
    player.rotation.set(0, 0, 0);
  }
  player.scale.setScalar(1.02);
  if (playerJoints && !preserveCamera) {
    characterMotion.reset(playerJoints);
    playerJoints.head.rotation.y = 0;
    playerJoints.torso.rotation.y = 0;
    playerJoints.leftArm.rotation.x = 0;
    playerJoints.rightArm.rotation.x = 0;
    playerJoints.leftArm.rotation.z = 0;
    playerJoints.rightArm.rotation.z = 0;
  }
  ship.position.set(0, name === 'space' ? 3.1 : 0.4, 0);
  ship.rotation.set(0, 0, 0);
  ship.scale.setScalar(0.88);
  if (spaceBackdrop) spaceBackdrop.rotation.set(0, 0, 0);
  if (spaceGate) spaceGate.visible = false;
  if (spaceInterceptor) spaceInterceptor.visible = false;
  for (const part of spaceDrift) part.position.z = part.userData.homeZ;
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
    if (state.act === 'space') object.position.set(def.x, def.y, z);
    else object.position.set(LANES[def.lane + 1], proto.y, z);
    if (def.type === 'chair') object.rotation.y = Math.PI;
    if (proto.beamLift) {
      object.traverse((node) => {
        if (node.name === 'laserBeam') node.position.y += proto.beamLift;
      });
    }
    obstacleRoot.add(object);
    obstacles.push({
      object, lane: def.lane, type: def.type, kind: proto.kind,
      clearance: proto.clearance, radius: proto.radius, homeX: def.x, homeY: def.y,
      hit: false, passed: false, phase: patternIndex + (def.lane ?? def.x ?? 0),
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
  const actor = activeActor();
  actor.position.z = -0.65;
  const impactSide = item.object ? item.object.position.x - actor.position.x : (item.lane ?? 0) - state.lane;
  actor.rotation.z = (impactSide <= 0 ? 1 : -1) * 0.18;
  if (item.object) {
    item.object.rotation.x += 0.42;
    item.object.rotation.z += (impactSide <= 0 ? -1 : 1) * 0.6;
  }
  audio.hit(item.type, state.act, impactSide);
  damageFlash.classList.remove('hit');
  impactCopy.classList.remove('show');
  void damageFlash.offsetWidth;
  damageFlash.classList.add('hit');
  const copy = {
    city: '−240,000,000 · EVACUATION ROUTE LOST',
    space: '−240,000,000 · DEFENCE GRID BREACHED',
    station: '−240,000,000 · EARTH LINK EXPOSED',
  };
  impactCopy.textContent = state.hits >= 32 ? 'ONLY 256 VOICES REMAIN' : item.type === 'lockOn'
    ? 'AI STRIKE · −240,000,000' : item.type === 'netGate'
      ? 'AI NET IMPACT · −240,000,000' : item.type === 'interceptorLaser'
        ? 'INTERCEPTOR HIT · −240,000,000' : copy[state.act];
  impactCopy.classList.add('show');
  humanityFill.classList.add('impact');
  setTimeout(() => humanityFill.classList.remove('impact'), 260);
  updateHumanity();
  robotAdvance.classList.remove('firing');
  void robotAdvance.offsetWidth;
  robotAdvance.classList.add('firing');
}

function updateHumanity() {
  const progress = Math.min(1, Math.max(state.actDistance / (ACTS[state.act].speed * ACT_DURATION),
    TEST_MODE ? state.elapsed / ACT_DURATION : 0));
  const stakes = calculateStakes({
    act: state.act, progress, hits: state.hits, overtime: state.overtime,
    overrides: { city: state.overrides.city === 'done', station: state.overrides.station === 'done' },
  });
  state.humanity = stakes.humanity;
  state.survivors = stakes.survivors;
  const atFloor = state.survivors === 256;
  const visibleHumanity = atFloor ? 0.35 : state.humanity;
  const survivingIcons = atFloor ? 1 : Math.ceil(visibleHumanity * crowdPeople.length / 100);
  const roundedHumanity = atFloor ? 0 : Math.round(state.humanity);
  const valueText = atFloor ? 'Only 256 people remain' : `${roundedHumanity} percent humanity remaining`;
  humanityLabel.textContent = atFloor ? '256 LEFT' : roundedHumanity + '%';
  if (humanityTrack.getAttribute('aria-valuenow') !== String(roundedHumanity) ||
      humanityTrack.getAttribute('aria-valuetext') !== valueText) {
    humanityTrack.setAttribute('aria-valuenow', String(roundedHumanity));
    humanityTrack.setAttribute('aria-valuetext', valueText);
  }
  humanityFill.style.width = `${visibleHumanity}%`;
  robotAdvance.style.left = `${Math.min(95, Math.max(5, 100 - visibleHumanity))}%`;
  crowdPeople.forEach((person, index) => {
    person.classList.toggle('gone', index < crowdPeople.length - survivingIcons);
  });
  forecast.textContent = atFloor
    ? 'ONLY 256 PEOPLE LEFT · FINISH THE MISSION'
    : state.act === 'city' && state.overrides.city === 'done'
      ? '400M PROTECTED · EVACUATION TRAINS MOVING'
      : state.act === 'station' && state.overrides.station === 'done'
        ? '400M PROTECTED · EARTH LINK ISOLATING'
        : state.act === 'city' ? 'REMOTE SHUTDOWN FAILED · REACH THE ROCKET'
          : state.act === 'space' ? 'AI ORBITAL NET · EARTH IS RUNNING OUT OF TIME'
            : 'LAST PHYSICAL SWITCH AHEAD · KEEP MOVING';
}

function updateActor(dt) {
  const actor = activeActor();
  if (state.act === 'space') {
    const input = state.flightInput;
    const worldInput = screenFlightToWorld(input);
    const desiredX = worldInput.x * 7.8;
    const desiredY = worldInput.y * 7.0;
    const response = input.active ? 7.5 : 3.2;
    state.flightVelocity.x = THREE.MathUtils.damp(state.flightVelocity.x, desiredX, response, dt);
    state.flightVelocity.y = THREE.MathUtils.damp(state.flightVelocity.y, desiredY, response, dt);
    ship.position.x = THREE.MathUtils.clamp(ship.position.x + state.flightVelocity.x * dt, -SPACE_BOUNDS.x, SPACE_BOUNDS.x);
    ship.position.y = THREE.MathUtils.clamp(ship.position.y + state.flightVelocity.y * dt, SPACE_BOUNDS.minY, SPACE_BOUNDS.maxY);
    ship.position.z = THREE.MathUtils.damp(ship.position.z, 0, 6, dt);
    ship.rotation.z = THREE.MathUtils.damp(ship.rotation.z, -state.flightVelocity.x * 0.055, 6.5, dt);
    ship.rotation.x = THREE.MathUtils.damp(ship.rotation.x, state.flightVelocity.y * 0.035, 6.5, dt);
    ship.rotation.y = THREE.MathUtils.damp(ship.rotation.y, state.flightVelocity.x * 0.015, 5, dt);
    state.targetLane = ship.position.x > 0.74 ? -1 : ship.position.x < -0.74 ? 1 : 0;
    state.lane = state.targetLane;
    return;
  }
  const targetX = LANES[state.targetLane + 1];
  actor.position.x = THREE.MathUtils.damp(actor.position.x, targetX, 14, dt);
  state.lane = Math.abs(actor.position.x - targetX) < 0.05 ? state.targetLane : state.lane;

  if (state.jumpY > 0 || state.jumpVelocity > 0) {
    state.jumpVelocity -= 25 * dt;
    state.jumpY = Math.max(0, state.jumpY + state.jumpVelocity * dt);
    if (state.jumpY === 0) state.jumpVelocity = 0;
  }
  state.slide = Math.max(0, state.slide - dt);

  const pose = characterMotion.update({ joints: playerJoints, distance: state.distance,
    jumpY: state.jumpY, jumpVelocity: state.jumpVelocity, slide: state.slide,
    dt, reducedMotion: REDUCED_MOTION });
  player.position.y = 0.2 + state.jumpY - (state.slide > 0 ? 0.18 : 0) + pose.bob;
  player.scale.y = THREE.MathUtils.damp(player.scale.y, state.slide > 0 ? 0.68 : 1.02, 18, dt);
  player.scale.x = THREE.MathUtils.damp(player.scale.x, state.slide > 0 ? 1.16 : 1.02, 18, dt);
  player.rotation.z = THREE.MathUtils.damp(player.rotation.z, (targetX - player.position.x) * -0.08, 10, dt);
  actor.position.z = THREE.MathUtils.damp(actor.position.z, 0, 6, dt);
}

function overrideDistance(event) {
  // The accelerated test route keeps the interaction window long enough for a real tap.
  return TEST_MODE
    ? event.at + (state.elapsed - ACT_DURATION * 0.58) * 24
    : state.actDistance;
}

function tryOverride() {
  const event = OVERRIDE_EVENTS[state.act];
  if (!event || state.overrides[state.act] !== 'pending') return;
  const delta = event.at - overrideDistance(event);
  if (delta < -OVERRIDE_RANGE.behind || delta > OVERRIDE_RANGE.ahead || state.targetLane !== event.lane) return;
  state.overrides[state.act] = 'done';
  overridePrompt.classList.remove('visible', 'in-range');
  impactCopy.textContent = event.saved;
  impactCopy.classList.remove('show');
  void impactCopy.offsetWidth;
  impactCopy.classList.add('show');
  const fixture = state.act === 'city' ? cityRelay : stationBreaker;
  const button = fixture.getObjectByName('overrideButton');
  const beacon = fixture.getObjectByName('overrideBeacon');
  if (button && beacon) {
    button.material = overrideGreen;
    beacon.material = overrideGreen;
    if (state.act === 'city') {
      for (const part of cityAnimated) if (part.name === 'railSignal') part.material = overrideGreen;
    }
  }
  audio.override();
  updateHumanity();
}

function updateOverride() {
  const event = OVERRIDE_EVENTS[state.act];
  if (!event) return;
  const delta = event.at - overrideDistance(event);
  const fixture = state.act === 'city' ? cityRelay : stationBreaker;
  fixture.position.z = delta;
  const halo = fixture.getObjectByName('overrideHalo');
  if (halo) halo.scale.setScalar(1 + (REDUCED_MOTION ? 0 : 0.1 * Math.sin(state.visualClock * 10)));
  if (state.overrides[state.act] !== 'pending') return;
  if (delta < -OVERRIDE_RANGE.behind) {
    state.overrides[state.act] = 'missed';
    overridePrompt.classList.remove('visible', 'in-range');
    return;
  }
  const visible = delta <= OVERRIDE_RANGE.announce && delta >= -OVERRIDE_RANGE.behind;
  overridePrompt.classList.toggle('visible', visible);
  if (visible) {
    tutorial.classList.remove('visible');
    overrideTitle.textContent = event.label;
    const lane = event.lane < 0 ? 'LEFT' : 'RIGHT';
    overrideInstruction.textContent = delta > OVERRIDE_RANGE.ahead
      ? `${lane} LANE · SAVE 400M PEOPLE`
      : state.targetLane !== event.lane
        ? `MOVE ${lane} · THEN ${KEYBOARD_HINTS ? 'PRESS E' : 'TAP'}`
        : `${KEYBOARD_HINTS ? 'PRESS E' : 'TAP NOW'} · SAVE 400M`;
    overridePrompt.classList.toggle('in-range', delta <= OVERRIDE_RANGE.ahead && state.targetLane === event.lane);
  }
}

function updateLockOn(dt) {
  if (state.act === 'space') return;
  if (TEST_MODE && OVERRIDE_EVENTS[state.act]) return;
  const attack = state.lockOn;
  if (attack.phase === 'idle' && state.elapsed >= LOCK_START_SECONDS[state.act]) {
    attack.phase = 'warning';
    attack.timer = 0;
    attack.lane = state.targetLane;
    lockLanes.forEach((lane, index) => lane.classList.toggle('targeted', index === attack.lane + 1));
    lockTitle.textContent = 'AI LOCK · ' + (attack.lane < 0 ? 'LEFT' : attack.lane > 0 ? 'RIGHT' : 'CENTRE') + ' LANE';
    lockWarning.classList.add('visible');
    audio.lockOn();
  }
  if (attack.phase !== 'warning') return;
  attack.timer += dt;
  lockWarning.style.setProperty('--remaining', Math.max(0, 100 * (1 - attack.timer / LOCK_WARNING_SECONDS)) + '%');
  if (attack.timer < LOCK_WARNING_SECONDS) return;
  attack.phase = 'done';
  lockWarning.classList.add('firing');
  if (Math.abs(activeActor().position.x - LANES[attack.lane + 1]) < 0.74 && state.hitCooldown <= 0) {
    hitObstacle({ lane: attack.lane, type: 'lockOn', object: null, hit: false });
  }
  audio.lockFire();
  window.setTimeout(() => lockWarning.classList.remove('visible', 'firing'), 450);
}

function updateNetGate(dt, travel) {
  if (state.act !== 'space') return;
  const gate = state.netGate;
  if (gate.phase === 'idle' && state.elapsed >= SPACE_NET.announceAt) {
    gate.phase = 'warning';
    gate.timer = 0;
    spaceGate.position.set(0, 0, ACTS.space.speed * (SPACE_NET.impactAt - state.elapsed));
    spaceGate.visible = true;
    lockTitle.textContent = 'AI NET · CYAN BREACH DETECTED';
    lockInstruction.textContent = 'FLY THROUGH THE CYAN APERTURE';
    lockWarning.classList.remove('firing', 'cleared');
    lockWarning.classList.add('visible', 'net-gate', 'free-flight');
    audio.netGate();
  }
  if (gate.phase === 'idle') return;
  spaceGate.position.z -= travel;
  if (gate.phase === 'warning') {
    gate.timer += dt;
    lockWarning.style.setProperty('--remaining', Math.max(0, 100 * (1 - gate.timer / (SPACE_NET.impactAt - SPACE_NET.announceAt))) + '%');
    if (spaceGate.position.z > 0) return;
    gate.phase = 'done';
    const opening = spaceGate.userData.safeCenter || { x: 3.45, y: 6.55, radius: 1.72 };
    const clearedOpening = Math.hypot(ship.position.x - opening.x, ship.position.y - opening.y) <= opening.radius * 0.78;
    if (!clearedOpening) {
      if (state.hitCooldown <= 0) hitObstacle({ lane: state.targetLane, type: 'netGate', object: null, hit: false });
      lockTitle.textContent = 'AI NET · SHIP HIT';
      lockInstruction.textContent = 'HULL BREACH · KEEP FLYING';
      lockWarning.classList.add('firing');
    } else {
      state.obstaclesDodged += 1;
      lockTitle.textContent = 'AI NET · CLEAR';
      lockInstruction.textContent = 'BREACH CONFIRMED · STATION AHEAD';
      impactCopy.textContent = 'ORBITAL NET BREACHED · DOCK AHEAD';
      impactCopy.classList.remove('show');
      void impactCopy.offsetWidth;
      impactCopy.classList.add('show');
      lockWarning.classList.add('cleared');
      audio.netCleared();
    }
    window.setTimeout(() => lockWarning.classList.remove('visible', 'firing', 'cleared', 'net-gate', 'free-flight'), 450);
  }
  if (gate.phase === 'done' && spaceGate.position.z < -12) spaceGate.visible = false;
}

function clearSpaceProjectiles() {
  for (const shot of spaceProjectiles) obstacleRoot.remove(shot.object);
  spaceProjectiles = [];
}

function spawnInterceptorLaser() {
  if (!interceptorLaserPrototype || !spaceInterceptor) return;
  const object = interceptorLaserPrototype.clone(true);
  object.scale.setScalar(0.72);
  object.rotation.y = Math.PI;
  object.position.copy(spaceInterceptor.position);
  object.position.y -= 1.25;
  obstacleRoot.add(object);
  spaceProjectiles.push({
    object, age: 0, startX: object.position.x, startY: object.position.y,
    targetX: ship.position.x, targetY: ship.position.y, startZ: object.position.z,
    hit: false,
  });
  audio.lockFire();
}

function updateSpaceCombat(dt) {
  if (state.act !== 'space' || state.mode !== 'playing') {
    if (spaceInterceptor) spaceInterceptor.visible = false;
    return;
  }
  const combat = state.interceptor;
  const shotAt = INTERCEPTOR_SHOTS[combat.shotIndex];
  const active = state.elapsed >= 2.7 && state.elapsed <= 16.8;
  spaceInterceptor.visible = active;
  if (active) {
    const t = state.elapsed - 2.7;
    spaceInterceptor.position.set(Math.sin(t * 0.92) * 2.8, 4.5 + Math.sin(t * 1.31) * 0.9,
      13.2 + Math.cos(t * 0.58) * 2.4);
    spaceInterceptor.rotation.z = -Math.sin(t * 0.92) * 0.18;
    spaceInterceptor.rotation.y = Math.PI + Math.sin(t * 0.48) * 0.2;
    spaceInterceptor.getObjectByName('interceptorEye')?.scale.set(1 + Math.sin(t * 13) * 0.08, 1, 1);
  }
  if (shotAt !== undefined && state.elapsed >= shotAt - 0.9 && !combat.warning) {
    combat.warning = true;
    lockTitle.textContent = 'INTERCEPTOR LOCK';
    lockInstruction.textContent = 'KEEP MOVING · RED FIRE INBOUND';
    lockWarning.classList.remove('net-gate', 'cleared');
    lockWarning.classList.add('visible', 'free-flight');
    audio.lockOn();
  }
  if (shotAt !== undefined && state.elapsed >= shotAt) {
    spawnInterceptorLaser();
    combat.shotIndex += 1;
    combat.warning = false;
    lockWarning.classList.add('firing');
    window.setTimeout(() => {
      if (state.act === 'space' && state.netGate.phase !== 'warning') {
        lockWarning.classList.remove('visible', 'firing', 'free-flight');
      }
    }, 420);
  }
  for (let i = spaceProjectiles.length - 1; i >= 0; i--) {
    const shot = spaceProjectiles[i];
    shot.age += dt;
    shot.object.position.z -= 20 * dt;
    const progress = THREE.MathUtils.clamp(1 - shot.object.position.z / Math.max(1, shot.startZ), 0, 1);
    shot.object.position.x = THREE.MathUtils.lerp(shot.startX, shot.targetX, progress);
    shot.object.position.y = THREE.MathUtils.lerp(shot.startY, shot.targetY, progress);
    const halo = shot.object.getObjectByName('laserHalo');
    if (halo) halo.rotation.z += dt * 6;
    const telegraph = shot.object.getObjectByName('laserTelegraph');
    if (telegraph?.material) telegraph.material.opacity = Math.max(0.04, 0.25 * (1 - progress));
    if (!shot.hit && state.hitCooldown <= 0 && Math.abs(shot.object.position.z) < 1.15 &&
        Math.hypot(shot.object.position.x - ship.position.x, shot.object.position.y - ship.position.y) < 0.92) {
      shot.hit = true;
      hitObstacle({ type: 'interceptorLaser', object: shot.object, lane: state.targetLane, hit: false });
    }
    if (shot.object.position.z < -7) {
      obstacleRoot.remove(shot.object);
      spaceProjectiles.splice(i, 1);
    }
  }
}

function updateCityLife(dt) {
  const distance = state.actDistance;
  const district = distance < 55 ? 'WORKER DISTRICT · EVACUATION IN PROGRESS'
    : distance < 125 ? 'FACTORIES · PRODUCTION UNDER ATTACK'
      : distance < 190 ? 'TANK FARM · FUEL PRESSURE CRITICAL'
        : distance < 255 ? 'TRANSPORT RAILS · TRAINS HELD BY AI'
          : 'LAUNCH PADS · LAST DEPARTURE';
  if (districtLabel.textContent !== district) districtLabel.textContent = district;
  const t = state.visualClock;
  for (const part of cityAnimated) {
    if (part.name === 'evacWorker') part.position.z = part.userData.homeZ + (REDUCED_MOTION ? 0 : Math.sin(t * 4 + part.position.x) * 0.45);
    if (part.name === 'evacTrain' && !REDUCED_MOTION) {
      part.userData.progress = (part.userData.progress + dt * (state.overrides.city === 'done' ? 3.5 : 0.55)) % 12;
      part.position.z = part.userData.homeZ + part.userData.progress - 6;
    }
    if (part.name === 'craneArm') part.rotation.y = REDUCED_MOTION ? 0 : Math.sin(t * 0.9) * 0.16;
    if (part.name === 'ventFlare') part.scale.setScalar(REDUCED_MOTION ? 1 : 0.72 + Math.sin(t * 11 + part.position.z) * 0.2);
    if (part.name === 'alarmLamp') part.visible = REDUCED_MOTION || Math.sin(t * 8) > 0;
    if (part.name === 'commandeeredTransit' && !REDUCED_MOTION) {
      part.position.z = part.userData.homeZ + Math.sin(t * 0.72 + part.userData.phase) * 7.5;
    }
    if (part.name === 'aiSentinel' && !REDUCED_MOTION) {
      part.position.y = part.userData.homeY + Math.sin(t * 4.2 + part.userData.phase) * 0.08;
      part.rotation.y += dt * 0.22;
    }
    if (part.name === 'scanBeam') {
      part.rotation.y = REDUCED_MOTION ? 0 : Math.sin(t * 0.85 + part.userData.phase) * 0.46;
      part.material.opacity = REDUCED_MOTION ? 0.28 : 0.24 + (Math.sin(t * 6 + part.userData.phase) * 0.5 + 0.5) * 0.18;
    }
  }
}

function updatePlayingWorld(dt) {
  const act = ACTS[state.act];
  const speedFactor = state.hitCooldown > 0.35 ? 0.68 : 1;
  const travel = act.speed * speedFactor * dt;
  state.distance += travel;
  state.actDistance += travel;
  updateCityTutorial();
  updateOverride();
  updateLockOn(dt);
  updateNetGate(dt, travel);
  updateSpaceCombat(dt);
  if (state.act === 'city') updateCityLife(dt);
  updateHumanity();

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
    if (state.elapsed >= SPACE_NET.impactAt + 0.5 && districtLabel.textContent !== 'STATION DOCK · HOLD COURSE') {
      districtLabel.textContent = 'STATION DOCK · HOLD COURSE';
    }
    spaceBackdrop.rotation.y += dt * 0.012;
    for (const part of spaceDrift) {
      part.position.z -= travel * 0.55;
      if (part.position.z < -18) part.position.z += 130;
      part.rotation.y += dt * 0.18;
    }
    dockingPort.position.z = Math.max(14, remaining * 6 + 10);
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
  if (state.act !== 'city' && state.elapsed > 2.35 && spawnClock <= 0 &&
      (state.act !== 'space' || state.elapsed < 12.5)) {
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
    if (item.object.position.z < -4) {
      obstacleRoot.remove(item.object);
      obstacles.splice(i, 1);
      continue;
    }
    if (item.hit || state.hitCooldown > 0 || Math.abs(item.object.position.z) > 0.92) continue;
    if (state.act === 'space') {
      const distance = Math.hypot(item.object.position.x - actor.position.x, item.object.position.y - actor.position.y);
      if (distance <= item.radius) hitObstacle(item);
      continue;
    }
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
  if (item.type === 'wreckage') {
    item.object.rotation.z += dt * 0.42;
    item.object.rotation.y -= dt * 0.31;
  }
  if (item.type === 'drone') {
    item.object.position.x = item.homeX + Math.sin(state.elapsed * 2.2 + item.phase) * 0.42;
    item.object.position.y = item.homeY + Math.cos(state.elapsed * 2.8 + item.phase) * 0.34;
    item.object.rotation.z = Math.sin(state.elapsed * 2.2 + item.phase) * -0.18;
    const rotor = item.object.getObjectByName('droneRotor');
    if (rotor) rotor.rotation.z += dt * 2.4;
    item.object.traverse((part) => {
      if (part.name === 'droneWeapon' && part.material?.emissive) {
        part.material.emissiveIntensity = 1.2 + Math.sin(state.elapsed * 12 + item.phase) * 0.55;
      }
    });
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
        new THREE.Vector3(0, portrait ? 4.1 : 3.8, portrait ? -7.8 : -9.2),
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
    const y = state.act === 'space'
      ? (portrait ? 4.1 : 3.7) + (actor.position.y - 3.1) * 0.22
      : (portrait ? 4.1 : 3.8);
    const z = state.act === 'space' ? (portrait ? -11.8 : -10.3) : (portrait ? -7.8 : -9.2);
    const desired = new THREE.Vector3(actor.position.x * (state.act === 'space' ? 0.2 : 0.14), y, z);
    camera.position.lerp(desired, 1 - Math.exp(-dt * 6));
    pointCamera(new THREE.Vector3(actor.position.x * 0.12,
      state.act === 'space' ? 2.65 + (actor.position.y - 3.1) * 0.45 : 1.1 + state.jumpY * 0.18,
      state.act === 'space' ? 10.5 : 8.5));
  } else if (state.mode === 'climb') {
    const y = 7.2 + state.climbProgress * 16.5;
    camera.position.lerp(new THREE.Vector3(14.5, y, climbAnchorZ - 21), 1 - Math.exp(-dt * 4));
    cameraAim.lerp(new THREE.Vector3(0, 3.4 + state.climbProgress * 18.8, climbAnchorZ), 1 - Math.exp(-dt * 5));
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
  if (state.act !== 'city') {
    state.actDistance = Math.max(state.actDistance, ACTS[state.act].speed * ACT_DURATION);
    updateHumanity();
  }
  if (state.act === 'city') beginBoarding();
  else if (state.act === 'space') beginDocking();
  else beginSwitchApproach();
}

function beginBoarding() {
  state.mode = 'boarding';
  state.interludeElapsed = 0;
  state.boardFromX = player.position.x;
  climbAnchorZ = rocketGroup.position.z + climbLadder.position.z - 0.52 * ROCKET_SCALE;
  stick.classList.remove('visible');
  tutorial.classList.remove('visible');
  actLabel.textContent = 'ROCKET LADDER · BOARDING';
  startShot(BOARD_DURATION,
    new THREE.Vector3(15.5, 10.5, climbAnchorZ - 24),
    new THREE.Vector3(0, 8.5, climbAnchorZ + 1.2),
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
  climbStatus.textContent = 'LADDER PROGRESS: HATCH OPEN';
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
  player.position.y = 0.2 + p * ROCKET_CLIMB_HEIGHT;
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
    ? 'LADDER PROGRESS: CREW READY TO SEAL'
    : p > 0.45 ? 'LADDER PROGRESS: KEEP CLIMBING' : 'LADDER PROGRESS: HATCH OPEN';
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
    new THREE.Vector3(0, ROCKET_HATCH_Y, rocketGroup.position.z - 0.64 * ROCKET_SCALE),
    new THREE.Vector3(0, ROCKET_HATCH_Y, rocketGroup.position.z + 0.17 * ROCKET_SCALE),
    beginLiftoff);
  syncDevPause();
}

function beginLiftoff() {
  state.mode = 'liftoff';
  state.interludeElapsed = 0;
  // The city route has finished its job once the hatch seals. Remove its
  // foreground gantries and wayfinders so the launch complex and rising
  // rocket own the final City Run composition.
  cityChunks.forEach((chunk) => { chunk.visible = false; });
  player.visible = false;
  climbLadder.visible = false;
  const left = rocketGroup.getObjectByName('boardingDoorLeft');
  const right = rocketGroup.getObjectByName('boardingDoorRight');
  if (left) left.position.x = -0.335;
  if (right) right.position.x = 0.335;
  launchFlames.visible = true;
  launchSmoke.visible = true;
  hud.classList.remove('visible');
  camera.position.set(0, 24, rocketGroup.position.z - 75);
  pointCamera(new THREE.Vector3(0, 25, rocketGroup.position.z));
  audio.launch();
  syncDevPause();
}

function updateLiftoff(dt) {
  state.interludeElapsed += dt;
  const p = Math.min(1, state.interludeElapsed / LIFTOFF_DURATION);
  const thrust = THREE.MathUtils.smoothstep(p, 0, 0.18);
  const travel = Math.max(0, (p - 0.18) / 0.82);
  const rise = 78 * travel * travel;
  rocketBody.position.y = ROCKET_BASE_Y + rise;
  launchFlames.scale.set(0.65 + thrust * 0.35,
    0.35 + thrust * (1.1 + travel * 0.85) + Math.sin(state.visualClock * 39) * 0.07 * thrust,
    0.65 + thrust * 0.35);
  launchEngineLight.intensity = 7 * thrust;
  for (const puff of launchSmoke.children) {
    if (puff.name !== 'launchSmokePuff') continue;
    const angle = puff.userData.index * Math.PI / 6;
    const drift = 1.25 + 4.8 * THREE.MathUtils.smoothstep(p, 0, 0.82);
    puff.position.set(Math.sin(angle) * drift, 0.85 + p * 1.7, Math.cos(angle) * drift);
    puff.scale.setScalar(0.55 + p * 2.4);
    puff.material.opacity = 0.54 * (1 - THREE.MathUtils.smoothstep(p, 0.2, 0.95));
  }
  launchShockwave.scale.setScalar(1 + p * 5.5);
  launchShockwave.material.opacity = 0.7 * (1 - THREE.MathUtils.smoothstep(p, 0.1, 0.7));
  launchSmoke.visible = p < 0.95;
  const shake = REDUCED_MOTION ? 0 : 0.17 * thrust * (1 - THREE.MathUtils.smoothstep(p, 0.3, 0.82));
  camera.position.set(Math.sin(state.visualClock * 48) * shake,
    24 + rise * 0.35 + Math.sin(state.visualClock * 63) * shake * 0.45,
    rocketGroup.position.z - 75 - p * 10);
  pointCamera(new THREE.Vector3(0, 25 + rise * 0.9, rocketGroup.position.z));
  if (p >= 1) beginLaunchExit();
}

let passageShield = null;

function coverPassage(source, scale = 1) {
  if (passageShield) camera.remove(passageShield);
  passageShield = source.clone(false);
  passageShield.material = source.material.clone();
  passageShield.material.depthTest = false;
  passageShield.material.depthWrite = false;
  passageShield.position.set(0, 0, -0.32);
  passageShield.rotation.set(0, 0, 0);
  passageShield.scale.setScalar(2.5 * scale);
  passageShield.renderOrder = 1000;
  camera.add(passageShield);
}

function uncoverPassage() {
  if (passageShield) camera.remove(passageShield);
  passageShield = null;
}

function beginLaunchExit() {
  coverPassage(rocketGroup.getObjectByName('boardingOccluder'), ROCKET_SCALE);
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
  state.dockFromY = ship.position.y;
  state.dockSoundPlayed = false;
  dockingPort.visible = true;
  stick.classList.remove('visible');
  tutorial.classList.remove('visible');
  actLabel.textContent = 'STATION DOCKING · EARTH LINK WEAKENING';
  hud.classList.add('on-dark');
  dockingTitle.innerHTML = 'DOCKING<br>UNDER FIRE';
  dockingCopy.textContent = 'Station power is failing. Hold course.';
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
    new THREE.Vector3(0, innerWidth / innerHeight < 0.8 ? 4.1 : 3.8, innerWidth / innerHeight < 0.8 ? -7.8 : -9.2),
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
  audio.switchReady();
}

function beginFinale() {
  if (state.mode !== 'switch') return;
  state.missionTimeFinal = state.missionElapsed;
  state.mode = 'finale';
  switchScreen.classList.remove('visible');
  finale.classList.add('visible');
  finale.classList.remove('done');
  state.finaleOutcome = finaleResponse(state.humanity, state.survivors);
  finale.dataset.outcome = state.finaleOutcome.kind;
  signalLabel.textContent = state.finaleOutcome.signal;
  subtitle.textContent = state.finaleOutcome.lines[0][1];
  state.finaleElapsed = 0;
  state.finalePanStarted = false;
  resultsCard.inert = true;
  resultsCard.setAttribute('aria-hidden', 'true');
  audio.masterSwitch();
  audio.finalCall(state.finaleOutcome.spoken);
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
  const secured = (state.overrides.city === 'done' ? 1 : 0) +
    (state.overrides.station === 'done' ? 1 : 0);
  resultsOverrides.textContent = secured
    ? `${secured} / 2 CUT-OFFS · ${secured * 400}M PEOPLE PROTECTED`
    : '0 / 2 CUT-OFFS · NO EXTRA LIVES PROTECTED';
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
    overridesSecured: (state.overrides.city === 'done' ? 1 : 0) +
      (state.overrides.station === 'done' ? 1 : 0),
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
  if (cap) {
    const restY = cap.userData.restY ?? 2;
    cap.position.y = restY - press * 0.34;
  }
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
  setStationThreatLevel(1 - THREE.MathUtils.smoothstep(storyTime, 0.34, 2.4));
  updateEarthCrisis(1 - THREE.MathUtils.smoothstep(storyTime, 0.35, 3.1));
  for (const [time, line] of state.finaleOutcome.lines) {
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
    if (state.mode === 'intro') {
      updatePrologue(rawDt);
    } else if (state.mode === 'ready') {
      updateIntroCity();
    } else if (state.mode === 'playing') {
      if (state.introDelay > 0) {
        updateIntroTransition(rawDt);
      } else {
        const previousElapsed = state.elapsed;
        state.elapsed += rawDt;
        if (!TEST_MODE) {
          const expectedActTime = state.act === 'city'
            ? Math.max(ACT_DURATION, 318 / ACTS.city.speed) : ACT_DURATION;
          state.overtime += Math.max(0, state.elapsed - expectedActTime) -
            Math.max(0, previousElapsed - expectedActTime);
        }
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
      player.position.z = climbAnchorZ + 1.45 * ROCKET_SCALE * THREE.MathUtils.smoothstep(p, 0.35, 1);
      updateShot(rawDt);
    } else if (state.mode === 'liftoff') {
      updateLiftoff(rawDt);
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
      ship.position.y = THREE.MathUtils.lerp(state.dockFromY, 3.35, THREE.MathUtils.smoothstep(p, 0, 1));
      if (p > 0.72 && !state.dockSoundPlayed) {
        state.dockSoundPlayed = true;
        dockingTitle.innerHTML = 'AIRLOCK<br>SECURE';
        dockingCopy.textContent = 'One corridor remains between you and the cut-off.';
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
    targetX: state.act === 'space' ? ship.position.x : LANES[state.targetLane + 1],
    player, ship,
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
    verticalState: state.act === 'space' ? 'free-flight' : state.slide > 0 ? 'slide' : state.jumpY > 0.05 ? 'jump' : 'ground',
    flightPos: [ship?.position.x || 0, ship?.position.y || 0],
    flightInput: { ...state.flightInput },
    interceptorVisible: !!spaceInterceptor?.visible,
    projectiles: spaceProjectiles.length,
    humanityPercent: state.humanity,
    survivors: state.survivors,
    hits: state.hits,
    overrides: { ...state.overrides },
    lockOn: { ...state.lockOn },
    netGate: { ...state.netGate },
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
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 1.5,
    Math.sqrt(4_500_000 / (innerWidth * innerHeight))));
  rig.resize(innerWidth, innerHeight);
  chaseVisuals?.setBaseFov(camera.fov);
}

window.addEventListener('resize', resize);
startButton.addEventListener('click', startGame);
replayTransmission.addEventListener('click', () => {
  if (state.mode !== 'ready') return;
  startPrologue();
});
introSound.addEventListener('click', async () => {
  if (!audio.enabled) {
    audio.toggle();
    muteButton.textContent = 'SOUND ON';
  }
  await audio.startIntro();
  introSound.textContent = '♪ SOUND ON';
  if (state.introElapsed >= PROLOGUE_BEATS[6].at) audio.introCue('threat');
});
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
  else if (state.mode === 'liftoff') beginLaunchExit();
  else if (state.mode === 'docking') finishDocking();
  else if (state.mode === 'switch') beginFinale();
  else if (state.mode === 'finale') state.finaleElapsed = TEST_MODE ? 2.6 : 8;
};
window.__GAME__ = { pos: [0, 0], fps: 0, speed: 0, score: 0, over: false, draws: 0, tris: 0 };

let returningPlayer = Boolean(START_SCENE);
try { returningPlayer ||= hasSeenPrologue(window.localStorage); }
catch { /* Some embedded browsers deny storage; treat them as a first visit. */ }
loadAssets().then(() => {
  resetWorld('city');
  player.visible = true;
  loading.classList.remove('visible');
  startScreen.classList.add('visible');
  if (returningPlayer) {
    state.mode = 'ready';
    updateIntroCity();
    revealMissionReady();
  } else {
    startPrologue();
  }
  window.__READY__ = true;
}).catch((error) => {
  console.error(error);
  loadingText.textContent = `loading failed: ${error.message}`;
});

resize();
chaseVisuals = createChaseVisuals({ camera, baseFov: camera.fov, reducedMotion: REDUCED_MOTION });
requestAnimationFrame(frame);
