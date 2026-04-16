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
  // -- ACT 1: The basics (waves 1-5) --
  {
    name: 'First Contact',
    entries: [{ type: 'scout', count: 8, delay: 800 }],
  },
  {
    name: 'Recon Party',
    entries: [{ type: 'scout', count: 12, delay: 650 }],
  },
  {
    name: 'Scout Rush',
    entries: [{ type: 'scout', count: 18, delay: 450 }],
  },
  {
    name: 'Armored Advance',
    entries: [
      { type: 'drone', count: 6, delay: 900 },
      { type: 'scout', count: 8, delay: 600 },
    ],
  },
  {
    name: 'First Strike',
    entries: [
      { type: 'drone', count: 10, delay: 700 },
      { type: 'scout', count: 10, delay: 500 },
    ],
    bonus: 30,
  },

  // -- ACT 2: Escalation (waves 6-10) --
  {
    name: 'Swarm Warning',
    entries: [
      { type: 'swarm', count: 20, delay: 250 },
      { type: 'scout', count: 6, delay: 600 },
    ],
  },
  {
    name: 'Mixed Signals',
    entries: [
      { type: 'drone', count: 8, delay: 700 },
      { type: 'swarm', count: 15, delay: 300 },
    ],
  },
  {
    name: 'Heavy Hitters',
    entries: [
      { type: 'mech', count: 3, delay: 1200 },
      { type: 'drone', count: 6, delay: 600 },
    ],
  },
  {
    name: 'Full Assault',
    entries: [
      { type: 'mech', count: 4, delay: 1000 },
      { type: 'drone', count: 10, delay: 500 },
      { type: 'scout', count: 12, delay: 400 },
    ],
  },
  {
    name: 'BEHEMOTH',
    entries: [
      { type: 'boss', count: 1, delay: 0 },
      { type: 'drone', count: 8, delay: 600 },
    ],
    bonus: 50,
  },

  // -- ACT 3: Pressure (waves 11-15) --
  {
    name: 'Speed Demon',
    entries: [
      { type: 'scout', count: 25, delay: 300 },
      { type: 'swarm', count: 20, delay: 200 },
    ],
  },
  {
    name: 'Iron Wall',
    entries: [
      { type: 'mech', count: 8, delay: 900 },
      { type: 'drone', count: 5, delay: 800 },
    ],
  },
  {
    name: 'Blitz',
    entries: [
      { type: 'swarm', count: 35, delay: 180 },
      { type: 'scout', count: 15, delay: 350 },
    ],
  },
  {
    name: 'Combined Arms',
    entries: [
      { type: 'mech', count: 5, delay: 1000 },
      { type: 'drone', count: 12, delay: 500 },
      { type: 'swarm', count: 20, delay: 250 },
      { type: 'scout', count: 10, delay: 400 },
    ],
  },
  {
    name: 'TWIN TERRORS',
    entries: [
      { type: 'boss', count: 2, delay: 3000 },
      { type: 'mech', count: 6, delay: 800 },
      { type: 'drone', count: 8, delay: 500 },
    ],
    bonus: 75,
  },

  // -- ACT 4: Endurance (waves 16-20) --
  {
    name: 'Locust Swarm',
    entries: [
      { type: 'swarm', count: 50, delay: 150 },
      { type: 'scout', count: 20, delay: 300 },
    ],
  },
  {
    name: 'Siege Engines',
    entries: [
      { type: 'mech', count: 12, delay: 800 },
      { type: 'drone', count: 10, delay: 600 },
    ],
  },
  {
    name: 'Relentless',
    entries: [
      { type: 'drone', count: 20, delay: 350 },
      { type: 'scout', count: 25, delay: 280 },
      { type: 'swarm', count: 30, delay: 200 },
    ],
  },
  {
    name: 'Last Stand',
    entries: [
      { type: 'mech', count: 10, delay: 700 },
      { type: 'drone', count: 15, delay: 450 },
      { type: 'swarm', count: 25, delay: 220 },
      { type: 'scout', count: 15, delay: 350 },
    ],
  },
  {
    name: 'OMEGA BREACH',
    entries: [
      { type: 'boss', count: 3, delay: 2500 },
      { type: 'mech', count: 8, delay: 700 },
      { type: 'drone', count: 12, delay: 400 },
      { type: 'swarm', count: 20, delay: 200 },
    ],
    bonus: 100,
  },

  // -- ACT 5: Infinite escalation (waves 21-25 as templates) --
  {
    name: 'Endless Tide',
    entries: [
      { type: 'scout', count: 30, delay: 250 },
      { type: 'drone', count: 20, delay: 400 },
      { type: 'swarm', count: 40, delay: 150 },
    ],
  },
  {
    name: 'Juggernaut',
    entries: [
      { type: 'mech', count: 15, delay: 650 },
      { type: 'boss', count: 1, delay: 0 },
      { type: 'drone', count: 15, delay: 400 },
    ],
  },
  {
    name: 'Chaos Protocol',
    entries: [
      { type: 'swarm', count: 50, delay: 130 },
      { type: 'mech', count: 8, delay: 700 },
      { type: 'scout', count: 20, delay: 280 },
    ],
  },
  {
    name: 'Death March',
    entries: [
      { type: 'mech', count: 12, delay: 600 },
      { type: 'drone', count: 25, delay: 350 },
      { type: 'swarm', count: 30, delay: 180 },
      { type: 'scout', count: 20, delay: 300 },
    ],
  },
  {
    name: 'APOCALYPSE',
    entries: [
      { type: 'boss', count: 4, delay: 2000 },
      { type: 'mech', count: 10, delay: 600 },
      { type: 'drone', count: 20, delay: 350 },
      { type: 'swarm', count: 30, delay: 150 },
    ],
    bonus: 150,
  },
];

function scaleWave(baseDef: WaveDef, waveNum: number): WaveDef {
  const cycle = Math.floor((waveNum - 26) / 5);
  const countScale = 1 + cycle * 0.3;

  return {
    name: baseDef.name,
    entries: baseDef.entries.map(e => ({
      ...e,
      count: Math.round(e.count * countScale),
      delay: Math.max(100, Math.round(e.delay * 0.95)),
    })),
    bonus: baseDef.bonus ? Math.round(baseDef.bonus * (1 + cycle * 0.2)) : undefined,
  };
}

export function generateWave(waveNum: number): WaveData {
  const hpScale = 1 + (waveNum - 1) * 0.16;

  let def: WaveDef;
  if (waveNum <= WAVE_DEFS.length) {
    def = WAVE_DEFS[waveNum - 1];
  } else {
    const templateIdx = ((waveNum - 26) % 5) + 20;
    const baseDef = WAVE_DEFS[templateIdx];
    def = scaleWave(baseDef, waveNum);
  }

  const bonus = def.bonus ?? (10 + waveNum * 3);

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
