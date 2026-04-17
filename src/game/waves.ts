import type { WaveEntry } from './types';

export interface WaveData {
  name: string;
  entries: WaveEntry[];
  hpScale: number;
  bonus: number;
}

interface WaveDef {
  name: string;
  entries: WaveEntry[];
  bonus?: number;
}

const WAVE_DEFS: WaveDef[] = [
  // ═══════════ LEVEL 1: OUTPOST · teach mechanics, gentle ramp ═══════════
  // Start gold 225 = 3 Pulses. Player must learn spacing & positioning.
  {
    name: 'First Contact',
    entries: [
      { type: 'scout', count: 4, delay: 1200 },
      { type: 'scout', count: 1, delay: 4500 }, // breather
      { type: 'scout', count: 5, delay: 1100 },
      { type: 'scout', count: 1, delay: 4500 }, // breather
      { type: 'scout', count: 5, delay: 1000 },
    ],
  },
  {
    name: 'Recon Party',
    entries: [
      { type: 'scout', count: 6, delay: 900 },
      { type: 'drone', count: 1, delay: 3500 },
      { type: 'scout', count: 6, delay: 800 },
      { type: 'drone', count: 1, delay: 3500 },
      { type: 'scout', count: 5, delay: 750 },
    ],
  },
  {
    name: 'Probing Attack',
    entries: [
      { type: 'scout', count: 8, delay: 700 },
      { type: 'drone', count: 2, delay: 2500 },
      { type: 'scout', count: 8, delay: 600 },
      { type: 'drone', count: 2, delay: 2500 },
    ],
  },
  {
    // Swarm intro - requires AoE thinking
    name: 'Swarm Tide',
    entries: [
      { type: 'swarm', count: 10, delay: 500 },
      { type: 'scout', count: 4, delay: 1500 },
      { type: 'swarm', count: 12, delay: 400 },
      { type: 'scout', count: 4, delay: 1500 },
    ],
  },
  {
    // Mechs introduce: forces Blast (Nova) purchase
    name: 'Armored Column',
    entries: [
      { type: 'drone', count: 5, delay: 1100 },
      { type: 'mech', count: 1, delay: 4500 },
      { type: 'drone', count: 5, delay: 1000 },
      { type: 'mech', count: 1, delay: 4500 },
      { type: 'scout', count: 8, delay: 700 },
    ],
  },
  {
    // Multi-type pressure test
    name: 'Hammer & Anvil',
    entries: [
      { type: 'swarm', count: 12, delay: 400 },
      { type: 'mech', count: 2, delay: 3500 },
      { type: 'drone', count: 8, delay: 900 },
      { type: 'scout', count: 10, delay: 700 },
    ],
  },
  {
    // Boss finale
    name: 'WARDEN',
    entries: [
      { type: 'drone', count: 6, delay: 1000 },
      { type: 'swarm', count: 10, delay: 400 },
      { type: 'boss', count: 1, delay: 5000 },
      { type: 'drone', count: 8, delay: 900 },
      { type: 'scout', count: 12, delay: 600 },
    ],
    bonus: 25,
  },

  // ═══════════ LEVEL 2: CROSSROADS · Phantom + Sprinter intro ═══════════
  // Start gold 245. Denser waves, special enemies appear.
  {
    // L2W1 basic - scouts/drones only, HP scaling is the difficulty
    name: 'Steel Tide',
    entries: [
      { type: 'scout', count: 8, delay: 900 },
      { type: 'drone', count: 2, delay: 2800 },
      { type: 'scout', count: 10, delay: 700 },
      { type: 'drone', count: 2, delay: 2800 },
      { type: 'scout', count: 8, delay: 600 },
    ],
  },
  {
    // Phantom intro - lighter
    name: 'Ghost Recon',
    entries: [
      { type: 'scout', count: 8, delay: 800 },
      { type: 'phantom', count: 2, delay: 3000 },
      { type: 'scout', count: 8, delay: 700 },
      { type: 'phantom', count: 2, delay: 2800 },
      { type: 'drone', count: 3, delay: 1800 },
    ],
  },
  {
    // Sprinter intro - lighter
    name: 'Blitz Runners',
    entries: [
      { type: 'scout', count: 10, delay: 600 },
      { type: 'sprinter', count: 2, delay: 3000 },
      { type: 'scout', count: 10, delay: 550 },
      { type: 'sprinter', count: 2, delay: 2800 },
      { type: 'drone', count: 4, delay: 1500 },
    ],
  },
  {
    name: 'Heavy Hitters',
    entries: [
      { type: 'drone', count: 6, delay: 800 },
      { type: 'mech', count: 2, delay: 3500 },
      { type: 'phantom', count: 4, delay: 2000 },
      { type: 'swarm', count: 14, delay: 400 },
      { type: 'mech', count: 2, delay: 3500 },
    ],
  },
  {
    name: 'Iron Fist',
    entries: [
      { type: 'sprinter', count: 4, delay: 2200 },
      { type: 'drone', count: 10, delay: 700 },
      { type: 'mech', count: 3, delay: 3000 },
      { type: 'phantom', count: 5, delay: 2000 },
      { type: 'scout', count: 10, delay: 500 },
    ],
  },
  {
    name: 'Full Assault',
    entries: [
      { type: 'swarm', count: 20, delay: 300 },
      { type: 'mech', count: 3, delay: 3200 },
      { type: 'phantom', count: 5, delay: 1800 },
      { type: 'drone', count: 10, delay: 700 },
      { type: 'sprinter', count: 5, delay: 1800 },
    ],
  },
  {
    name: 'BEHEMOTH',
    entries: [
      { type: 'drone', count: 8, delay: 800 },
      { type: 'phantom', count: 5, delay: 2000 },
      { type: 'boss', count: 1, delay: 4500 },
      { type: 'sprinter', count: 5, delay: 1800 },
      { type: 'drone', count: 10, delay: 700 },
      { type: 'swarm', count: 15, delay: 350 },
    ],
    bonus: 30,
  },

  // ═══════════ LEVEL 3: SERPENTINE · Splitter intro ═══════════
  // Start gold 270. Tight zigzag path - AoE/chain shine here.
  {
    // L3W1 - scaled-up scouts primarily, gentle intro to L3
    name: 'Heavy Advance',
    entries: [
      { type: 'scout', count: 8, delay: 800 },
      { type: 'drone', count: 2, delay: 2800 },
      { type: 'scout', count: 10, delay: 600 },
      { type: 'drone', count: 3, delay: 2500 },
    ],
  },
  {
    // L3W2 - mixed scouts/drones/phantoms, no splitters yet (those come W3+)
    name: 'Ghost Parade',
    entries: [
      { type: 'scout', count: 10, delay: 500 },
      { type: 'phantom', count: 2, delay: 2500 },
      { type: 'drone', count: 8, delay: 700 },
      { type: 'phantom', count: 3, delay: 2200 },
    ],
  },
  {
    // Splitter intro at W3 - just 3 splitters total, lots of drones between
    name: 'Cell Division',
    entries: [
      { type: 'drone', count: 10, delay: 600 },
      { type: 'splitter', count: 1, delay: 3500 },
      { type: 'drone', count: 10, delay: 500 },
      { type: 'splitter', count: 2, delay: 3000 },
    ],
  },
  {
    name: 'Combined Arms',
    entries: [
      { type: 'drone', count: 8, delay: 800 },
      { type: 'mech', count: 2, delay: 3000 },
      { type: 'splitter', count: 2, delay: 2800 },
      { type: 'sprinter', count: 3, delay: 2200 },
      { type: 'scout', count: 8, delay: 600 },
    ],
  },
  {
    name: 'Breakthrough',
    entries: [
      { type: 'mech', count: 3, delay: 2800 },
      { type: 'phantom', count: 4, delay: 2000 },
      { type: 'splitter', count: 3, delay: 2500 },
      { type: 'drone', count: 8, delay: 700 },
    ],
  },
  {
    name: 'Pressure Point',
    entries: [
      { type: 'swarm', count: 15, delay: 350 },
      { type: 'splitter', count: 3, delay: 2500 },
      { type: 'mech', count: 2, delay: 3000 },
      { type: 'phantom', count: 3, delay: 2000 },
    ],
  },
  {
    name: 'TWIN TERRORS',
    entries: [
      { type: 'drone', count: 8, delay: 800 },
      { type: 'splitter', count: 3, delay: 2500 },
      { type: 'boss', count: 1, delay: 5000 },
      { type: 'phantom', count: 3, delay: 2000 },
      { type: 'mech', count: 2, delay: 2800 },
      { type: 'swarm', count: 12, delay: 400 },
    ],
    bonus: 40,
  },

  // ═══════════ LEVEL 4: SPIRAL · Necro + Guardian intro ═══════════
  // Start gold 295. Very long path - reward wide coverage.
  {
    // L4W1 basic - drones + mechs, no necro/guardian yet
    name: 'Iron Front',
    entries: [
      { type: 'drone', count: 8, delay: 700 },
      { type: 'mech', count: 2, delay: 3500 },
      { type: 'drone', count: 8, delay: 600 },
      { type: 'mech', count: 2, delay: 3000 },
      { type: 'scout', count: 10, delay: 500 },
    ],
  },
  {
    // Guardian intro
    name: 'Shield Wall',
    entries: [
      { type: 'guardian', count: 2, delay: 3500 },
      { type: 'drone', count: 8, delay: 800 },
      { type: 'guardian', count: 3, delay: 3000 },
      { type: 'mech', count: 3, delay: 2500 },
    ],
  },
  {
    name: 'Relentless',
    entries: [
      { type: 'necro', count: 3, delay: 2800 },
      { type: 'splitter', count: 5, delay: 2200 },
      { type: 'sprinter', count: 5, delay: 2000 },
      { type: 'swarm', count: 18, delay: 300 },
    ],
  },
  {
    name: 'Juggernaut',
    entries: [
      { type: 'guardian', count: 4, delay: 2800 },
      { type: 'mech', count: 4, delay: 2500 },
      { type: 'phantom', count: 5, delay: 2000 },
      { type: 'drone', count: 10, delay: 700 },
    ],
  },
  {
    name: 'Chaos Protocol',
    entries: [
      { type: 'necro', count: 4, delay: 2500 },
      { type: 'guardian', count: 3, delay: 2800 },
      { type: 'splitter', count: 6, delay: 2000 },
      { type: 'swarm', count: 22, delay: 280 },
    ],
  },
  {
    name: 'Last Stand',
    entries: [
      { type: 'guardian', count: 4, delay: 2500 },
      { type: 'necro', count: 4, delay: 2500 },
      { type: 'mech', count: 5, delay: 2300 },
      { type: 'sprinter', count: 6, delay: 1800 },
      { type: 'phantom', count: 5, delay: 1800 },
    ],
  },
  {
    name: 'OMEGA BREACH',
    entries: [
      { type: 'drone', count: 10, delay: 700 },
      { type: 'guardian', count: 2, delay: 3000 },
      { type: 'boss', count: 2, delay: 5500 },
      { type: 'necro', count: 2, delay: 3000 },
      { type: 'mech', count: 3, delay: 2500 },
      { type: 'splitter', count: 3, delay: 2200 },
    ],
    bonus: 55,
  },

  // ═══════════ LEVEL 5: NEXUS · everything at once ═══════════
  // Start gold 320. Final level. All enemy types in every wave from W3+.
  {
    // L5W1 - basic enemies at high HP scaling. Test baseline defense.
    name: 'Endless Tide',
    entries: [
      { type: 'scout', count: 10, delay: 700 },
      { type: 'drone', count: 3, delay: 2500 },
      { type: 'scout', count: 10, delay: 600 },
      { type: 'drone', count: 3, delay: 2200 },
      { type: 'scout', count: 8, delay: 500 },
    ],
  },
  {
    // L5W2 - scouts + drones + phantoms, no mechs/necro yet
    name: 'Death March',
    entries: [
      { type: 'drone', count: 8, delay: 700 },
      { type: 'phantom', count: 3, delay: 2500 },
      { type: 'drone', count: 10, delay: 600 },
      { type: 'phantom', count: 3, delay: 2000 },
      { type: 'scout', count: 12, delay: 500 },
    ],
  },
  {
    // L5W3 - swarms + phantoms, introduces splitter. No necro/mech yet.
    name: 'Extinction Event',
    entries: [
      { type: 'swarm', count: 15, delay: 350 },
      { type: 'phantom', count: 3, delay: 2500 },
      { type: 'splitter', count: 3, delay: 2500 },
      { type: 'swarm', count: 12, delay: 350 },
      { type: 'phantom', count: 3, delay: 2000 },
    ],
  },
  {
    name: 'Total War',
    entries: [
      { type: 'guardian', count: 2, delay: 3000 },
      { type: 'mech', count: 3, delay: 2500 },
      { type: 'necro', count: 2, delay: 2800 },
      { type: 'splitter', count: 2, delay: 2200 },
      { type: 'sprinter', count: 3, delay: 2000 },
    ],
  },
  {
    name: 'Darkest Hour',
    entries: [
      { type: 'drone', count: 10, delay: 700 },
      { type: 'guardian', count: 2, delay: 2500 },
      { type: 'boss', count: 1, delay: 5000 },
      { type: 'phantom', count: 4, delay: 2000 },
      { type: 'swarm', count: 18, delay: 300 },
    ],
  },
  {
    name: 'No Mercy',
    entries: [
      { type: 'guardian', count: 2, delay: 2500 },
      { type: 'necro', count: 2, delay: 2500 },
      { type: 'splitter', count: 3, delay: 2000 },
      { type: 'sprinter', count: 3, delay: 1800 },
      { type: 'mech', count: 3, delay: 2200 },
    ],
  },
  {
    name: 'APOCALYPSE',
    entries: [
      { type: 'drone', count: 8, delay: 700 },
      { type: 'guardian', count: 2, delay: 2800 },
      { type: 'boss', count: 2, delay: 5500 },
      { type: 'necro', count: 2, delay: 2500 },
      { type: 'splitter', count: 3, delay: 2000 },
      { type: 'phantom', count: 3, delay: 2000 },
      { type: 'swarm', count: 12, delay: 400 },
    ],
    bonus: 75,
  },
];

function scaleWave(baseDef: WaveDef, waveNum: number): WaveDef {
  const cycle = Math.floor((waveNum - 36) / 7);
  const countScale = 1 + cycle * 0.3;
  return {
    name: baseDef.name,
    entries: baseDef.entries.map(e => ({
      ...e,
      count: Math.round(e.count * countScale),
      delay: Math.max(200, Math.round(e.delay * 0.92)),
    })),
    bonus: baseDef.bonus ? Math.round(baseDef.bonus * (1 + cycle * 0.2)) : undefined,
  };
}

// Per-level HP multipliers. Smooth ramp.
const LEVEL_BASE_MULT = [1.00, 1.20, 1.40, 1.60, 1.80];

export function generateWave(waveNum: number): WaveData {
  const levelIdx = Math.floor((waveNum - 1) / 7);
  const waveInLevel = ((waveNum - 1) % 7);
  const baseMult = LEVEL_BASE_MULT[Math.min(levelIdx, LEVEL_BASE_MULT.length - 1)];
  const hpScale = baseMult + waveInLevel * 0.12;

  let def: WaveDef;
  if (waveNum <= WAVE_DEFS.length) {
    def = WAVE_DEFS[waveNum - 1];
  } else {
    const templateIdx = ((waveNum - 36) % 7) + 28;
    const baseDef = WAVE_DEFS[templateIdx];
    def = scaleWave(baseDef, waveNum);
  }

  const bonus = def.bonus ?? 0;
  return { name: def.name, entries: def.entries, hpScale, bonus };
}

export function peekNextWave(waveNum: number): WaveData {
  return generateWave(waveNum + 1);
}
