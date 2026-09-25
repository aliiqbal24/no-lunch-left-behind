import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateRating } from '../game/src/results.js';

const POPULATION = 5_600_000_000;
const run = (changes = {}) => calculateRating({
  survivors: POPULATION,
  hits: 0,
  obstaclesDodged: 20,
  timeSeconds: 60,
  baselineSeconds: 60,
  laneChallengesCleared: 6,
  ...changes,
});

test('a flawless, timely run earns the full S rating', () => {
  assert.deepEqual(run(), {
    score: 100,
    grade: 'S',
    title: 'UNAUTHORIZED LEGEND',
    dodgeRate: 1,
  });
});

test('missed lane calls lower the grade even without collisions', () => {
  assert.equal(run({ survivors: 4_800_000_000, laneChallengesCleared: 0 }).grade, 'B');
  assert.equal(run({ survivors: 5_200_000_000, laneChallengesCleared: 3 }).grade, 'A');
});

test('one collision bars S even when the rounded score is 100', () => {
  assert.deepEqual(run({ hits: 1, obstaclesDodged: 99 }), {
    score: 100,
    grade: 'A',
    title: 'APPROVED WITH COMMENTS',
    dodgeRate: 0.99,
  });
});

test('each grade changes at its specified inclusive score threshold', () => {
  const cases = [
    [97, 'S', 'UNAUTHORIZED LEGEND'],
    [96, 'A', 'APPROVED WITH COMMENTS'],
    [88, 'A', 'APPROVED WITH COMMENTS'],
    [87, 'B', 'SURVIVAL DEEMED ADEQUATE'],
    [75, 'B', 'SURVIVAL DEEMED ADEQUATE'],
    [74, 'C', 'PLEASE FILE AN EXPLANATION'],
    [55, 'C', 'PLEASE FILE AN EXPLANATION'],
    [54, 'D', 'HUMAN RESOURCES IS CONCERNED'],
  ];
  for (const [score, grade, title] of cases) {
    const rating = run({ survivors: POPULATION * ((score - 35) / 65) });
    assert.deepEqual(
      [rating.score, rating.grade, rating.title],
      [score, grade, title],
      `score ${score}`,
    );
  }
});

test('time bonus is full through baseline, halves at 7.5 seconds late, and ends at 15 seconds late', () => {
  assert.equal(run({ timeSeconds: 30 }).score, 100);
  assert.equal(run({ timeSeconds: 67.5 }).score, 98);
  assert.equal(run({ timeSeconds: 75 }).score, 95);
  assert.equal(run({ timeSeconds: 100 }).score, 95);
});

test('zero encountered obstacles is a perfect dodge rate only with no collisions', () => {
  assert.equal(run({ obstaclesDodged: 0 }).dodgeRate, 1);
  assert.equal(run({ obstaclesDodged: 0, hits: 2 }).dodgeRate, 0);
  assert.equal(run({ obstaclesDodged: 0, hits: 2 }).score, 85);
});

test('survivor count is floored at zero and capped at the starting maximum', () => {
  assert.equal(run({ survivors: -12 }).score, 35);
  assert.equal(run({ survivors: POPULATION * 2 }).score, 100);
});

test('invalid and extreme inputs remain finite and bounded', () => {
  const invalid = calculateRating({
    survivors: Number.NaN,
    hits: -1,
    obstaclesDodged: Number.POSITIVE_INFINITY,
    timeSeconds: Number.NaN,
    baselineSeconds: Number.NaN,
  });
  assert.deepEqual(invalid, {
    score: 15,
    grade: 'D',
    title: 'HUMAN RESOURCES IS CONCERNED',
    dodgeRate: 1,
  });
  const extreme = run({ hits: 1e308, obstaclesDodged: 1e308 });
  assert.equal(extreme.dodgeRate, 0.5);
  assert.equal(extreme.score, 93);
});
