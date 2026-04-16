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
  // ── LEVEL 1: OUTPOST (waves 1-7) ──
  {
    name: 'First Contact',
    entries: [{ type: 'scout', count: 10, delay: 700 }],
  },
  {
    name: 'Recon Party',
    entries: [{ type: 'scout', count: 15, delay: 500 }],
  },
  {
    name: 'Probing Attack',
    entries: [
      { type: 'scout', count: 12, delay: 450 },
      { type: 'drone', count: 3, delay: 900 },
    ],
  },
  {
    name: 'Armored Column',
    entries: [
      { type: 'drone', count: 8, delay: 650 },
      { type: 'scout', count: 10, delay: 450 },
    ],
  },
  {
    name: 'Scout Rush',
    entries: [
      { type: 'scout', count: 20, delay: 320 },
      { type: 'drone', count: 5, delay: 700 },
    ],
  },
  {
    name: 'Hammer & Anvil',
    entries: [
      { type: 'drone', count: 14, delay: 500 },
      { type: 'scout', count: 18, delay: 350 },
      { type: 'mech', count: 2, delay: 1200 },
    ],
  },
  {
    name: 'WARDEN',
    entries: [
      { type: 'boss', count: 1, delay: 0 },
      { type: 'drone', count: 10, delay: 500 },
      { type: 'scout', count: 15, delay: 350 },
    ],
    bonus: 40,
  },

  // ── LEVEL 2: CROSSROADS - introduces Phantom + Sprinter ──
  {
    name: 'Swarm Warning',
    entries: [
      { type: 'swarm', count: 30, delay: 180 },
      { type: 'scout', count: 10, delay: 500 },
    ],
  },
  {
    name: 'Ghost Recon',
    entries: [
      { type: 'phantom', count: 6, delay: 800 },
      { type: 'scout', count: 12, delay: 400 },
    ],
  },
  {
    name: 'Heavy Hitters',
    entries: [
      { type: 'mech', count: 5, delay: 900 },
      { type: 'drone', count: 10, delay: 500 },
      { type: 'phantom', count: 4, delay: 700 },
    ],
  },
  {
    name: 'Blitz Runners',
    entries: [
      { type: 'sprinter', count: 8, delay: 600 },
      { type: 'swarm', count: 25, delay: 180 },
      { type: 'scout', count: 15, delay: 350 },
    ],
  },
  {
    name: 'Iron Fist',
    entries: [
      { type: 'mech', count: 8, delay: 750 },
      { type: 'drone', count: 12, delay: 450 },
      { type: 'phantom', count: 5, delay: 600 },
      { type: 'sprinter', count: 4, delay: 700 },
    ],
  },
  {
    name: 'Full Assault',
    entries: [
      { type: 'mech', count: 6, delay: 800 },
      { type: 'drone', count: 16, delay: 400 },
      { type: 'phantom', count: 6, delay: 550 },
      { type: 'swarm', count: 25, delay: 180 },
    ],
  },
  {
    name: 'BEHEMOTH',
    entries: [
      { type: 'boss', count: 1, delay: 0 },
      { type: 'sprinter', count: 6, delay: 500 },
      { type: 'phantom', count: 4, delay: 600 },
      { type: 'drone', count: 12, delay: 400 },
    ],
    bonus: 60,
  },

  // ── LEVEL 3: SERPENTINE - introduces Splitter ──
  {
    name: 'Speed Demon',
    entries: [
      { type: 'scout', count: 35, delay: 220 },
      { type: 'sprinter', count: 8, delay: 500 },
    ],
  },
  {
    name: 'Cell Division',
    entries: [
      { type: 'splitter', count: 8, delay: 700 },
      { type: 'drone', count: 8, delay: 500 },
    ],
  },
  {
    name: 'Blitz',
    entries: [
      { type: 'swarm', count: 40, delay: 120 },
      { type: 'splitter', count: 6, delay: 650 },
      { type: 'phantom', count: 5, delay: 550 },
    ],
  },
  {
    name: 'Combined Arms',
    entries: [
      { type: 'mech', count: 8, delay: 700 },
      { type: 'splitter', count: 8, delay: 600 },
      { type: 'swarm', count: 30, delay: 160 },
      { type: 'sprinter', count: 6, delay: 500 },
    ],
  },
  {
    name: 'Breakthrough',
    entries: [
      { type: 'mech', count: 10, delay: 600 },
      { type: 'phantom', count: 8, delay: 500 },
      { type: 'splitter', count: 6, delay: 600 },
      { type: 'drone', count: 12, delay: 400 },
    ],
  },
  {
    name: 'Pressure Point',
    entries: [
      { type: 'splitter', count: 10, delay: 500 },
      { type: 'swarm', count: 40, delay: 130 },
      { type: 'mech', count: 6, delay: 700 },
    ],
  },
  {
    name: 'TWIN TERRORS',
    entries: [
      { type: 'boss', count: 2, delay: 2500 },
      { type: 'splitter', count: 8, delay: 550 },
      { type: 'phantom', count: 6, delay: 500 },
      { type: 'mech', count: 6, delay: 600 },
    ],
    bonus: 80,
  },

  // ── LEVEL 4: SPIRAL - introduces Necro + Guardian ──
  {
    name: 'Undying Swarm',
    entries: [
      { type: 'necro', count: 4, delay: 1000 },
      { type: 'swarm', count: 30, delay: 150 },
      { type: 'scout', count: 15, delay: 300 },
    ],
  },
  {
    name: 'Shield Wall',
    entries: [
      { type: 'guardian', count: 4, delay: 900 },
      { type: 'mech', count: 10, delay: 600 },
      { type: 'drone', count: 12, delay: 450 },
    ],
  },
  {
    name: 'Relentless',
    entries: [
      { type: 'necro', count: 5, delay: 800 },
      { type: 'splitter', count: 8, delay: 550 },
      { type: 'sprinter', count: 8, delay: 500 },
      { type: 'swarm', count: 30, delay: 140 },
    ],
  },
  {
    name: 'Juggernaut',
    entries: [
      { type: 'guardian', count: 6, delay: 800 },
      { type: 'mech', count: 12, delay: 550 },
      { type: 'phantom', count: 6, delay: 500 },
      { type: 'drone', count: 15, delay: 350 },
    ],
  },
  {
    name: 'Chaos Protocol',
    entries: [
      { type: 'necro', count: 6, delay: 700 },
      { type: 'guardian', count: 4, delay: 800 },
      { type: 'splitter', count: 8, delay: 550 },
      { type: 'swarm', count: 40, delay: 120 },
    ],
  },
  {
    name: 'Last Stand',
    entries: [
      { type: 'guardian', count: 6, delay: 700 },
      { type: 'necro', count: 5, delay: 700 },
      { type: 'mech', count: 10, delay: 550 },
      { type: 'sprinter', count: 8, delay: 450 },
      { type: 'phantom', count: 6, delay: 500 },
    ],
  },
  {
    name: 'OMEGA BREACH',
    entries: [
      { type: 'boss', count: 3, delay: 2000 },
      { type: 'guardian', count: 4, delay: 700 },
      { type: 'necro', count: 4, delay: 700 },
      { type: 'mech', count: 8, delay: 550 },
      { type: 'splitter', count: 6, delay: 500 },
    ],
    bonus: 100,
  },

  // ── LEVEL 5: NEXUS - everything at once ──
  {
    name: 'Endless Tide',
    entries: [
      { type: 'sprinter', count: 12, delay: 400 },
      { type: 'phantom', count: 10, delay: 450 },
      { type: 'swarm', count: 50, delay: 100 },
    ],
  },
  {
    name: 'Death March',
    entries: [
      { type: 'guardian', count: 6, delay: 700 },
      { type: 'necro', count: 6, delay: 650 },
      { type: 'mech', count: 14, delay: 500 },
      { type: 'splitter', count: 8, delay: 550 },
    ],
  },
  {
    name: 'Extinction Event',
    entries: [
      { type: 'swarm', count: 60, delay: 90 },
      { type: 'splitter', count: 12, delay: 450 },
      { type: 'necro', count: 6, delay: 600 },
      { type: 'phantom', count: 8, delay: 500 },
    ],
  },
  {
    name: 'Total War',
    entries: [
      { type: 'guardian', count: 8, delay: 600 },
      { type: 'mech', count: 14, delay: 450 },
      { type: 'necro', count: 6, delay: 600 },
      { type: 'splitter', count: 10, delay: 500 },
      { type: 'sprinter', count: 10, delay: 400 },
    ],
  },
  {
    name: 'Darkest Hour',
    entries: [
      { type: 'boss', count: 2, delay: 2000 },
      { type: 'guardian', count: 6, delay: 600 },
      { type: 'necro', count: 5, delay: 600 },
      { type: 'phantom', count: 8, delay: 450 },
      { type: 'swarm', count: 40, delay: 130 },
    ],
  },
  {
    name: 'No Mercy',
    entries: [
      { type: 'guardian', count: 8, delay: 500 },
      { type: 'necro', count: 8, delay: 500 },
      { type: 'splitter', count: 12, delay: 400 },
      { type: 'sprinter', count: 10, delay: 400 },
      { type: 'mech', count: 12, delay: 450 },
    ],
  },
  {
    name: 'APOCALYPSE',
    entries: [
      { type: 'boss', count: 4, delay: 1800 },
      { type: 'guardian', count: 6, delay: 550 },
      { type: 'necro', count: 6, delay: 550 },
      { type: 'splitter', count: 10, delay: 450 },
      { type: 'phantom', count: 8, delay: 450 },
      { type: 'sprinter', count: 8, delay: 400 },
    ],
    bonus: 150,
  },
];

function scaleWave(baseDef: WaveDef, waveNum: number): WaveDef {
  const cycle = Math.floor((waveNum - 36) / 7);
  const countScale = 1 + cycle * 0.35;

  return {
    name: baseDef.name,
    entries: baseDef.entries.map(e => ({
      ...e,
      count: Math.round(e.count * countScale),
      delay: Math.max(60, Math.round(e.delay * 0.92)),
    })),
    bonus: baseDef.bonus ? Math.round(baseDef.bonus * (1 + cycle * 0.2)) : undefined,
  };
}

export function generateWave(waveNum: number): WaveData {
  const hpScale = 1 + (waveNum - 1) * 0.20;

  let def: WaveDef;
  if (waveNum <= WAVE_DEFS.length) {
    def = WAVE_DEFS[waveNum - 1];
  } else {
    const templateIdx = ((waveNum - 36) % 7) + 28;
    const baseDef = WAVE_DEFS[templateIdx];
    def = scaleWave(baseDef, waveNum);
  }

  const bonus = def.bonus ?? (8 + waveNum * 2);

  return {
    name: def.name,
    entries: def.entries,
    hpScale,
    bonus,
  };
}

export function peekNextWave(waveNum: number): WaveData {
  return generateWave(waveNum + 1);
}
