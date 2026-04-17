// Simulation framework for Grid Defense balance testing.
// Runs the actual game engine headlessly with fake time.

let fakeTime = 0;
(globalThis as typeof globalThis & { performance: { now: () => number } }).performance =
  { now: () => fakeTime };

export function advanceFakeTime(ms: number) { fakeTime += ms; }
export function getFakeTime(): number { return fakeTime; }
export function resetFakeTime() { fakeTime = 0; }

import {
  state, towers, enemies, placeTower, upgradeTower, fuseTowers,
  getAdjacentFusionTargets, update, startLevel, startWave, castFrostNova,
} from '../src/game/engine';
import {
  CELL, COLS, ROWS, LEVELS, TOWER_TYPES,
} from '../src/game/config';
import { pathCells } from '../src/game/path';
import type { Tower } from '../src/game/types';

// ── Placement helpers ──────────────────────────────────

export interface Spot { col: number; row: number; coverage: number; }

/**
 * Returns all open cells (not path, not out of bounds) sorted by path coverage.
 * coverage = number of path cells within `range` of the spot.
 */
export function findPlacementSpots(range = 3): Spot[] {
  const spots: Spot[] = [];
  const pathCoords: [number, number][] = [];
  for (const key of pathCells) {
    const [c, r] = key.split(',').map(Number);
    pathCoords.push([c, r]);
  }

  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (pathCells.has(`${c},${r}`)) continue;
      let coverage = 0;
      for (const [pc, pr] of pathCoords) {
        const dc = c - pc, dr = r - pr;
        if (dc * dc + dr * dr <= range * range) coverage++;
      }
      if (coverage > 0) spots.push({ col: c, row: r, coverage });
    }
  }
  return spots.sort((a, b) => b.coverage - a.coverage);
}

/**
 * Non-overlapping placements: picks top spots where no two towers are within
 * `minDist` cells of each other (avoids stacking). Limit = max count.
 */
export function spreadSpots(count: number, minDist = 3, range = 3): Spot[] {
  const all = findPlacementSpots(range);
  const chosen: Spot[] = [];
  for (const s of all) {
    if (chosen.length >= count) break;
    let ok = true;
    for (const c of chosen) {
      const dc = s.col - c.col, dr = s.row - c.row;
      if (dc * dc + dr * dr < minDist * minDist) { ok = false; break; }
    }
    if (ok) chosen.push(s);
  }
  return chosen;
}

// ── Strategy types ──────────────────────────────────────

export type Action =
  | { kind: 'place'; type: string; col: number; row: number }
  | { kind: 'upgrade'; towerIdx: number } // index in towers[]
  | { kind: 'fuse'; towerIdx: number; neighborIdx: number };

export interface Policy {
  name: string;
  description: string;
  /** Called before each wave starts. Returns actions to attempt. */
  beforeWave: (waveNumInLevel: number, ctx: Context) => Action[];
}

export interface Context {
  gold: number;
  lives: number;
  towers: Tower[];
  waveNum: number; // 1-7 within level
  levelNum: number;
  spots: Spot[]; // pre-computed best spots for this level
}

// ── Simulation runner ─────────────────────────────────

export interface WaveResult {
  wave: number;
  name: string;
  livesBefore: number;
  livesAfter: number;
  livesLost: number;
  goldBefore: number;
  goldAfter: number;
  killsInWave: number;
  waveTotal: number;
  towerCountBefore: number;
  towerCountAfter: number;
  elapsedSecs: number;
  survived: boolean;
  placedActions: Action[];
}

export interface LevelResult {
  levelNum: number;
  levelName: string;
  policyName: string;
  waves: WaveResult[];
  cleared: boolean;
  livesRemaining: number;
  startLives: number;
  livesLost: number;
  totalKills: number;
  finalTowerCount: number;
}

function executeAction(action: Action): boolean {
  switch (action.kind) {
    case 'place':
      return placeTower(action.col, action.row, action.type);
    case 'upgrade':
      return action.towerIdx < towers.length && upgradeTower(towers[action.towerIdx]);
    case 'fuse':
      if (action.towerIdx >= towers.length || action.neighborIdx >= towers.length) return false;
      return fuseTowers(towers[action.towerIdx], towers[action.neighborIdx]);
  }
}

function runStep(dt: number) {
  advanceFakeTime(dt * 1000);
  update(dt);
}

function advanceUntilWaveDone(maxSecs = 600): number {
  const dt = 0.05;
  let elapsed = 0;
  while (elapsed < maxSecs) {
    runStep(dt);
    elapsed += dt;

    // Auto-cast Frost Nova when multiple enemies are near the exit (panic button).
    // Simulates a player hitting Z when a wave is breaking through.
    if (state.frostCooldown === 0) {
      const { totalPathLength } = require('../src/game/path');
      let dangerCount = 0;
      for (const e of enemies) {
        if (e.alive && e.distance > totalPathLength * 0.6) dangerCount++;
      }
      if (dangerCount >= 4) {
        castFrostNova();
      }
    }

    if (state.phase === 'waiting' || state.phase === 'gameover' || state.phase === 'level_complete') {
      return elapsed;
    }
  }
  return elapsed;
}

export function simulateLevel(levelNum: number, policy: Policy): LevelResult {
  resetFakeTime();
  startLevel(levelNum);

  const levelDef = LEVELS[levelNum - 1];
  const startLives = state.lives;
  const spots = findPlacementSpots(3);

  const waves: WaveResult[] = [];

  for (let w = 1; w <= levelDef.waves; w++) {
    const ctx: Context = {
      gold: state.gold,
      lives: state.lives,
      towers: [...towers],
      waveNum: w,
      levelNum,
      spots,
    };

    const actions = policy.beforeWave(w, ctx);
    const placedActions: Action[] = [];
    for (const a of actions) {
      if (executeAction(a)) placedActions.push(a);
    }

    const livesBefore = state.lives;
    const goldBefore = state.gold;
    const killsBefore = state.enemiesKilled;
    const towerCountBefore = towers.length;

    startWave();
    const waveName = state.waveName;
    const waveTotal = state.waveEnemiesTotal;
    const elapsed = advanceUntilWaveDone();

    waves.push({
      wave: w,
      name: waveName,
      livesBefore,
      livesAfter: state.lives,
      livesLost: livesBefore - state.lives,
      goldBefore,
      goldAfter: state.gold,
      killsInWave: state.enemiesKilled - killsBefore,
      waveTotal,
      towerCountBefore,
      towerCountAfter: towers.length,
      elapsedSecs: elapsed,
      survived: state.phase !== 'gameover',
      placedActions,
    });

    if (state.phase === 'gameover' || state.phase === 'level_complete') break;
  }

  const totalKills = waves.reduce((s, w) => s + w.killsInWave, 0);
  const cleared = state.phase === 'level_complete';

  return {
    levelNum,
    levelName: levelDef.name,
    policyName: policy.name,
    waves,
    cleared,
    livesRemaining: state.lives,
    startLives,
    livesLost: startLives - state.lives,
    totalKills,
    finalTowerCount: towers.length,
  };
}

// ── Pretty printing ──────────────────────────────────

export function printMatrix(results: LevelResult[][]) {
  // results[policyIdx][levelIdx]
  const policies = results.map(r => r[0]?.policyName || '?');
  const levels = LEVELS.map(l => l.name);

  console.log('\n╔════════════════════════════════════════════════════════════════════════╗');
  console.log('║                   STRATEGY × LEVEL MATRIX                             ║');
  console.log('╚════════════════════════════════════════════════════════════════════════╝\n');

  const colW = 14;
  const header = 'Policy'.padEnd(30) + levels.map(l => l.padEnd(colW)).join('');
  console.log(header);
  console.log('─'.repeat(header.length));

  for (let p = 0; p < policies.length; p++) {
    const row = policies[p].padEnd(30);
    const cells = results[p].map(r => {
      if (!r) return '—'.padEnd(colW);
      if (r.cleared) return `✓ ${r.livesRemaining}/${r.startLives} L`.padEnd(colW);
      const waveFailed = r.waves[r.waves.length - 1]?.wave || 0;
      return `✗ W${waveFailed}`.padEnd(colW);
    }).join('');
    console.log(row + cells);
  }
}

export function printLevelDetail(result: LevelResult) {
  console.log(`\n━━━ ${result.policyName} @ ${result.levelName} ━━━`);
  const tagline = result.cleared
    ? `✅ CLEARED with ${result.livesRemaining}/${result.startLives} lives`
    : `❌ FAILED on wave ${result.waves[result.waves.length - 1].wave}/${LEVELS[result.levelNum - 1].waves}`;
  console.log(tagline);

  console.log('W# Name              Lives      Gold       Kills    Twrs  Actions                         Status');
  console.log('─'.repeat(110));
  for (const w of result.waves) {
    const lives = `${w.livesBefore}→${w.livesAfter}`.padEnd(10);
    const gold = `${w.goldBefore}→${w.goldAfter}`.padEnd(11);
    const kills = `${w.killsInWave}/${w.waveTotal}`.padEnd(8);
    const twrs = `${w.towerCountBefore}→${w.towerCountAfter}`.padEnd(5);
    const actions = w.placedActions.length
      ? w.placedActions.slice(0, 3).map(formatAction).join(', ') + (w.placedActions.length > 3 ? '...' : '')
      : '—';
    const status = !w.survived ? '💀' : w.livesLost === 0 ? '✓' : `−${w.livesLost}`;
    console.log(
      `${String(w.wave).padStart(2)} ${w.name.padEnd(17)} ${lives} ${gold} ${kills} ${twrs} ${actions.padEnd(32)} ${status}`,
    );
  }
}

function formatAction(a: Action): string {
  switch (a.kind) {
    case 'place': return `+${a.type}@${a.col},${a.row}`;
    case 'upgrade': return `↑T${a.towerIdx}`;
    case 'fuse': return `fuse T${a.towerIdx}+T${a.neighborIdx}`;
  }
}

export { state, towers, getAdjacentFusionTargets, CELL, COLS, ROWS, LEVELS, TOWER_TYPES };
