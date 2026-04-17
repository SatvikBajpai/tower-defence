// Per-wave difficulty analysis: shows HP budget vs theoretical tower DPS needed.
// Run: bun run sim/analyze.ts

import { LEVELS, ENEMY_TYPES } from '../src/game/config';
import { generateWave } from '../src/game/waves';
import { pathCells } from '../src/game/path';
import { initPath } from '../src/game/path';

console.log('╔════════════════════════════════════════════════════════════════════╗');
console.log('║            WAVE DIFFICULTY ANALYSIS                                ║');
console.log('╚════════════════════════════════════════════════════════════════════╝\n');
console.log('Shows per-wave: enemy count, total effective HP, DPS required to clear.');
console.log('(DPS required = total HP / 60s wave window)\n');

for (const level of LEVELS) {
  initPath(level.path);
  const pathLength = pathCells.size;

  console.log(`\n━━━ L${level.id} ${level.name} · ${pathLength} path cells · ${level.startGold}g start · ${level.lives} lives ━━━`);
  console.log('W#  Name              Enemies  Total HP   DPS req   Composition');
  console.log('─'.repeat(90));

  for (let w = 1; w <= level.waves; w++) {
    const globalWave = level.waveOffset + w;
    const wave = generateWave(globalWave);

    let totalCount = 0;
    let totalHp = 0;
    const composition: string[] = [];

    for (const entry of wave.entries) {
      const et = ENEMY_TYPES[entry.type];
      if (!et) continue;
      const effectiveScale = entry.type === 'boss'
        ? Math.min(wave.hpScale, 4.0)
        : wave.hpScale;
      const hp = Math.round(et.hp * effectiveScale);

      totalCount += entry.count;
      totalHp += hp * entry.count;

      // Add splitter children (simplified - 2 scouts at 30% splitter HP)
      if (et.ability === 'split') {
        totalHp += 2 * Math.round(hp * 0.3) * entry.count;
        totalCount += 2 * entry.count;
      }
      // Add necro resurrections (3 swarm units at 20% necro HP)
      if (et.ability === 'necro') {
        const ghostHp = Math.round(hp * 0.2);
        totalHp += 3 * ghostHp * entry.count;
        totalCount += 3 * entry.count;
      }

      composition.push(`${entry.count}×${et.name}`);
    }

    const dpsReq = Math.round(totalHp / 60);
    const flag = dpsReq > 200 ? ' ⚠️' : '';

    console.log(
      `${String(w).padStart(2)}  ${wave.name.padEnd(17)} ${String(totalCount).padStart(4)}×  ${String(totalHp).padStart(7)}    ${String(dpsReq).padStart(5)}    ${composition.join(', ')}${flag}`,
    );
  }
}

// Reference DPS values
console.log('\n═══ REFERENCE: Tower DPS ═══');
console.log('  Pulse L1: 24   L2: 42   L3: 72');
console.log('  Arc L1: ~20  L2: ~40  L3: ~70 (with chains)');
console.log('  Nova L1: ~28  L2: ~47  L3: ~80 (with splash)');
console.log('  Cryo L1: 14   L2: 23   L3: 40   (plus slow utility)');
console.log('');
console.log('  At ~40% placement efficiency (typical spread), 5 towers = ~100 DPS effective');
console.log('  6 towers = ~120, 8 towers = ~170, 10 towers = ~210');
console.log('\n  ⚠️ = wave requires > 200 DPS (likely needs 8-10+ towers with mixed types)');
