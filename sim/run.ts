// Main simulation runner. Executes every strategy × every level and prints results.
// Run: bun run sim/run.ts [--detail] [--level N]

import {
  simulateLevel, printMatrix, printLevelDetail,
  LEVELS,
  type LevelResult,
} from './framework';
import { STRATEGIES } from './strategies';

const args = process.argv.slice(2);
const detail = args.includes('--detail');
const onlyLevel = args.includes('--level')
  ? parseInt(args[args.indexOf('--level') + 1], 10)
  : 0;

console.log('╔════════════════════════════════════════════════════════════════════════╗');
console.log('║        GRID DEFENSE · BALANCE SIMULATION · all strategies × levels    ║');
console.log('╚════════════════════════════════════════════════════════════════════════╝');

const results: LevelResult[][] = []; // [strategyIdx][levelIdx]

for (let s = 0; s < STRATEGIES.length; s++) {
  results.push([]);
  for (let l = 0; l < LEVELS.length; l++) {
    if (onlyLevel && LEVELS[l].id !== onlyLevel) {
      results[s].push(null as unknown as LevelResult);
      continue;
    }
    process.stdout.write(`  Running ${STRATEGIES[s].name} × L${LEVELS[l].id}... `);
    const t0 = Date.now();
    const result = simulateLevel(LEVELS[l].id, STRATEGIES[s]);
    const t1 = Date.now();
    results[s].push(result);
    const status = result.cleared ? `✓ ${result.livesRemaining}L` : `✗ W${result.waves.length}`;
    console.log(`${status} (${((t1 - t0) / 1000).toFixed(1)}s)`);
  }
}

printMatrix(results);

// Summary stats
console.log('\n═══ SUMMARY ═══');
for (let s = 0; s < STRATEGIES.length; s++) {
  const cleared = results[s].filter(r => r && r.cleared).length;
  const total = onlyLevel ? 1 : LEVELS.length;
  const avgLives = results[s]
    .filter(r => r && r.cleared)
    .reduce((sum, r) => sum + r.livesRemaining, 0) / Math.max(cleared, 1);
  console.log(
    `  ${STRATEGIES[s].name.padEnd(22)} ${cleared}/${total} levels cleared` +
    (cleared > 0 ? ` · avg ${avgLives.toFixed(1)} lives remaining` : ''),
  );
}

// Per-level best strategy
console.log('\n═══ PER-LEVEL BEST STRATEGY ═══');
for (let l = 0; l < LEVELS.length; l++) {
  if (onlyLevel && LEVELS[l].id !== onlyLevel) continue;
  const levelResults = results.map(row => row[l]).filter(r => r);
  const clearers = levelResults.filter(r => r.cleared);
  if (clearers.length === 0) {
    const bestFail = levelResults.sort((a, b) => b.waves.length - a.waves.length)[0];
    console.log(`  L${LEVELS[l].id} ${LEVELS[l].name}: NO CLEARS (best reached W${bestFail?.waves.length})`);
  } else {
    const best = clearers.sort((a, b) => b.livesRemaining - a.livesRemaining)[0];
    console.log(
      `  L${LEVELS[l].id} ${LEVELS[l].name}: ${clearers.length} strategies cleared · best = "${best.policyName}" (${best.livesRemaining} lives left)`,
    );
  }
}

// Detailed per-wave output if requested
if (detail) {
  console.log('\n═══ DETAILED WAVE-BY-WAVE BREAKDOWN ═══');
  for (let s = 0; s < STRATEGIES.length; s++) {
    for (let l = 0; l < LEVELS.length; l++) {
      if (onlyLevel && LEVELS[l].id !== onlyLevel) continue;
      if (results[s][l]) printLevelDetail(results[s][l]);
    }
  }
}

console.log('\nRun with --detail for wave-by-wave breakdowns.');
console.log('Run with --level N to test a specific level only.\n');
