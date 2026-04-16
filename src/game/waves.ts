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
    entries: [{ type: 'scout', count: 14, delay: 3500 }],
  },
  {
    name: 'Recon Party',
    entries: [{ type: 'scout', count: 18, delay: 2800 }],
  },
  {
    name: 'Probing Attack',
    entries: [
      { type: 'scout', count: 14, delay: 2400 },
      { type: 'drone', count: 5, delay: 4000 },
    ],
  },
  {
    name: 'Armored Column',
    entries: [
      { type: 'drone', count: 10, delay: 3200 },
      { type: 'scout', count: 12, delay: 2200 },
    ],
  },
  {
    name: 'Scout Rush',
    entries: [
      { type: 'scout', count: 22, delay: 1800 },
      { type: 'drone', count: 6, delay: 3500 },
    ],
  },
  {
    name: 'Hammer & Anvil',
    entries: [
      { type: 'drone', count: 14, delay: 2600 },
      { type: 'scout', count: 18, delay: 1800 },
      { type: 'mech', count: 3, delay: 5000 },
    ],
  },
  {
    name: 'WARDEN',
    entries: [
      { type: 'boss', count: 1, delay: 0 },
      { type: 'drone', count: 12, delay: 2600 },
      { type: 'scout', count: 16, delay: 1800 },
    ],
    bonus: 25,
  },

  // ── LEVEL 2: CROSSROADS - introduces Phantom + Sprinter ──
  {
    name: 'Swarm Warning',
    entries: [
      { type: 'swarm', count: 30, delay: 1200 },
      { type: 'scout', count: 12, delay: 2400 },
    ],
  },
  {
    name: 'Ghost Recon',
    entries: [
      { type: 'phantom', count: 8, delay: 3800 },
      { type: 'scout', count: 14, delay: 2200 },
    ],
  },
  {
    name: 'Heavy Hitters',
    entries: [
      { type: 'mech', count: 6, delay: 4500 },
      { type: 'drone', count: 12, delay: 2600 },
      { type: 'phantom', count: 5, delay: 3500 },
    ],
  },
  {
    name: 'Blitz Runners',
    entries: [
      { type: 'sprinter', count: 10, delay: 3200 },
      { type: 'swarm', count: 25, delay: 1100 },
      { type: 'scout', count: 16, delay: 1800 },
    ],
  },
  {
    name: 'Iron Fist',
    entries: [
      { type: 'mech', count: 8, delay: 3800 },
      { type: 'drone', count: 14, delay: 2400 },
      { type: 'phantom', count: 6, delay: 3200 },
      { type: 'sprinter', count: 5, delay: 3500 },
    ],
  },
  {
    name: 'Full Assault',
    entries: [
      { type: 'mech', count: 6, delay: 4000 },
      { type: 'drone', count: 16, delay: 2200 },
      { type: 'phantom', count: 8, delay: 2800 },
      { type: 'swarm', count: 25, delay: 1100 },
    ],
  },
  {
    name: 'BEHEMOTH',
    entries: [
      { type: 'boss', count: 1, delay: 0 },
      { type: 'sprinter', count: 8, delay: 2800 },
      { type: 'phantom', count: 6, delay: 3200 },
      { type: 'drone', count: 14, delay: 2200 },
    ],
    bonus: 35,
  },

  // ── LEVEL 3: SERPENTINE - introduces Splitter ──
  {
    name: 'Speed Demon',
    entries: [
      { type: 'scout', count: 30, delay: 1400 },
      { type: 'sprinter', count: 10, delay: 2800 },
    ],
  },
  {
    name: 'Cell Division',
    entries: [
      { type: 'splitter', count: 10, delay: 3500 },
      { type: 'drone', count: 10, delay: 2600 },
    ],
  },
  {
    name: 'Blitz',
    entries: [
      { type: 'swarm', count: 40, delay: 900 },
      { type: 'splitter', count: 8, delay: 3200 },
      { type: 'phantom', count: 6, delay: 2800 },
    ],
  },
  {
    name: 'Combined Arms',
    entries: [
      { type: 'mech', count: 8, delay: 3800 },
      { type: 'splitter', count: 10, delay: 3000 },
      { type: 'swarm', count: 30, delay: 1000 },
      { type: 'sprinter', count: 6, delay: 2800 },
    ],
  },
  {
    name: 'Breakthrough',
    entries: [
      { type: 'mech', count: 10, delay: 3200 },
      { type: 'phantom', count: 10, delay: 2600 },
      { type: 'splitter', count: 8, delay: 3000 },
      { type: 'drone', count: 12, delay: 2200 },
    ],
  },
  {
    name: 'Pressure Point',
    entries: [
      { type: 'splitter', count: 12, delay: 2600 },
      { type: 'swarm', count: 40, delay: 850 },
      { type: 'mech', count: 6, delay: 4000 },
    ],
  },
  {
    name: 'TWIN TERRORS',
    entries: [
      { type: 'boss', count: 2, delay: 12000 },
      { type: 'splitter', count: 10, delay: 2800 },
      { type: 'phantom', count: 8, delay: 2600 },
      { type: 'mech', count: 6, delay: 3500 },
    ],
    bonus: 45,
  },

  // ── LEVEL 4: SPIRAL - introduces Necro + Guardian ──
  {
    name: 'Undying Swarm',
    entries: [
      { type: 'necro', count: 5, delay: 5000 },
      { type: 'swarm', count: 30, delay: 1000 },
      { type: 'scout', count: 16, delay: 1800 },
    ],
  },
  {
    name: 'Shield Wall',
    entries: [
      { type: 'guardian', count: 5, delay: 4500 },
      { type: 'mech', count: 10, delay: 3200 },
      { type: 'drone', count: 14, delay: 2400 },
    ],
  },
  {
    name: 'Relentless',
    entries: [
      { type: 'necro', count: 6, delay: 4200 },
      { type: 'splitter', count: 10, delay: 2800 },
      { type: 'sprinter', count: 8, delay: 2600 },
      { type: 'swarm', count: 30, delay: 950 },
    ],
  },
  {
    name: 'Juggernaut',
    entries: [
      { type: 'guardian', count: 6, delay: 4000 },
      { type: 'mech', count: 12, delay: 3000 },
      { type: 'phantom', count: 8, delay: 2600 },
      { type: 'drone', count: 16, delay: 2000 },
    ],
  },
  {
    name: 'Chaos Protocol',
    entries: [
      { type: 'necro', count: 6, delay: 3800 },
      { type: 'guardian', count: 5, delay: 4200 },
      { type: 'splitter', count: 10, delay: 2800 },
      { type: 'swarm', count: 40, delay: 800 },
    ],
  },
  {
    name: 'Last Stand',
    entries: [
      { type: 'guardian', count: 6, delay: 3800 },
      { type: 'necro', count: 6, delay: 3600 },
      { type: 'mech', count: 10, delay: 3000 },
      { type: 'sprinter', count: 8, delay: 2600 },
      { type: 'phantom', count: 8, delay: 2600 },
    ],
  },
  {
    name: 'OMEGA BREACH',
    entries: [
      { type: 'boss', count: 3, delay: 10000 },
      { type: 'guardian', count: 5, delay: 3800 },
      { type: 'necro', count: 5, delay: 3600 },
      { type: 'mech', count: 8, delay: 3000 },
      { type: 'splitter', count: 8, delay: 2600 },
    ],
    bonus: 55,
  },

  // ── LEVEL 5: NEXUS - everything at once ──
  {
    name: 'Endless Tide',
    entries: [
      { type: 'sprinter', count: 14, delay: 2200 },
      { type: 'phantom', count: 12, delay: 2400 },
      { type: 'swarm', count: 50, delay: 700 },
    ],
  },
  {
    name: 'Death March',
    entries: [
      { type: 'guardian', count: 8, delay: 3600 },
      { type: 'necro', count: 8, delay: 3400 },
      { type: 'mech', count: 14, delay: 2800 },
      { type: 'splitter', count: 10, delay: 2600 },
    ],
  },
  {
    name: 'Extinction Event',
    entries: [
      { type: 'swarm', count: 60, delay: 600 },
      { type: 'splitter', count: 14, delay: 2400 },
      { type: 'necro', count: 8, delay: 3200 },
      { type: 'phantom', count: 10, delay: 2600 },
    ],
  },
  {
    name: 'Total War',
    entries: [
      { type: 'guardian', count: 8, delay: 3400 },
      { type: 'mech', count: 14, delay: 2600 },
      { type: 'necro', count: 8, delay: 3200 },
      { type: 'splitter', count: 12, delay: 2600 },
      { type: 'sprinter', count: 10, delay: 2200 },
    ],
  },
  {
    name: 'Darkest Hour',
    entries: [
      { type: 'boss', count: 2, delay: 10000 },
      { type: 'guardian', count: 8, delay: 3200 },
      { type: 'necro', count: 6, delay: 3200 },
      { type: 'phantom', count: 10, delay: 2400 },
      { type: 'swarm', count: 40, delay: 850 },
    ],
  },
  {
    name: 'No Mercy',
    entries: [
      { type: 'guardian', count: 10, delay: 2800 },
      { type: 'necro', count: 10, delay: 2800 },
      { type: 'splitter', count: 14, delay: 2200 },
      { type: 'sprinter', count: 12, delay: 2200 },
      { type: 'mech', count: 12, delay: 2600 },
    ],
  },
  {
    name: 'APOCALYPSE',
    entries: [
      { type: 'boss', count: 4, delay: 8000 },
      { type: 'guardian', count: 8, delay: 3000 },
      { type: 'necro', count: 8, delay: 3000 },
      { type: 'splitter', count: 12, delay: 2400 },
      { type: 'phantom', count: 10, delay: 2400 },
      { type: 'sprinter', count: 10, delay: 2200 },
    ],
    bonus: 75,
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
      delay: Math.max(400, Math.round(e.delay * 0.92)),
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

  const bonus = def.bonus ?? (5 + waveNum);

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
