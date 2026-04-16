import type { TowerType, EnemyType } from './types';

export const CELL = 40;
export const COLS = 24;
export const ROWS = 15;
export const CANVAS_W = COLS * CELL;
export const CANVAS_H = ROWS * CELL;

export const STARTING_GOLD = 225;
export const STARTING_LIVES = 20;
export const SELL_RATIO = 0.6;
export const MAX_PARTICLES = 600;

export const PATH_GRID: [number, number][] = [
  [-1, 2], [5, 2], [5, 6], [1, 6], [1, 10],
  [9, 10], [9, 6], [15, 6], [15, 12], [21, 12],
  [21, 2], [25, 2],
];

export const TOWER_TYPES: Record<string, TowerType> = {
  pulse: {
    id: 'pulse',
    name: 'PULSE',
    cost: 50,
    color: '#00ffff',
    colorDark: '#004455',
    description: 'Fast single-target',
    key: '1',
    levels: [
      { damage: 12, range: 3, fireRate: 500, projSpeed: 8 },
      { damage: 20, range: 3.5, fireRate: 400, projSpeed: 9, upgradeCost: 60 },
      { damage: 32, range: 4, fireRate: 280, projSpeed: 10, upgradeCost: 90 },
    ],
  },
  arc: {
    id: 'arc',
    name: 'ARC',
    cost: 100,
    color: '#ff00ff',
    colorDark: '#440044',
    description: 'Chain lightning',
    key: '2',
    levels: [
      { damage: 10, range: 3, fireRate: 1200, chains: 2 },
      { damage: 16, range: 3.5, fireRate: 1000, chains: 3, upgradeCost: 100 },
      { damage: 24, range: 4, fireRate: 750, chains: 4, upgradeCost: 150 },
    ],
  },
  nova: {
    id: 'nova',
    name: 'NOVA',
    cost: 125,
    color: '#00ff66',
    colorDark: '#003318',
    description: 'Area splash damage',
    key: '3',
    levels: [
      { damage: 25, range: 3, fireRate: 1800, splashRadius: 1.2, projSpeed: 4 },
      { damage: 42, range: 3.5, fireRate: 1500, splashRadius: 1.6, projSpeed: 4.5, upgradeCost: 125 },
      { damage: 65, range: 4, fireRate: 1100, splashRadius: 2.0, projSpeed: 5, upgradeCost: 185 },
    ],
  },
  cryo: {
    id: 'cryo',
    name: 'CRYO',
    cost: 75,
    color: '#4488ff',
    colorDark: '#0a1a44',
    description: 'Slows enemies',
    key: '4',
    levels: [
      { damage: 6, range: 3, fireRate: 800, slowAmount: 0.4, slowDuration: 2000, projSpeed: 6 },
      { damage: 10, range: 3.5, fireRate: 650, slowAmount: 0.5, slowDuration: 2500, projSpeed: 7, upgradeCost: 75 },
      { damage: 16, range: 4, fireRate: 500, slowAmount: 0.6, slowDuration: 3000, projSpeed: 8, upgradeCost: 110 },
    ],
  },
};

export const OVERCHARGE_DURATION = 5;
export const OVERCHARGE_COOLDOWN = 10;

export const FUSION_TYPES: Record<string, TowerType> = {
  storm: {
    id: 'storm', name: 'STORM', cost: 150,
    color: '#22ddff', colorDark: '#0a3348',
    description: 'Rapid chain bolts', key: '',
    fusion: true, fusionOf: ['pulse', 'arc'],
    levels: [{ damage: 16, range: 4, fireRate: 350, chains: 3 }],
  },
  barrage: {
    id: 'barrage', name: 'BARRAGE', cost: 175,
    color: '#88ff44', colorDark: '#1a3308',
    description: 'Rapid AoE shots', key: '',
    fusion: true, fusionOf: ['pulse', 'nova'],
    levels: [{ damage: 22, range: 4, fireRate: 500, splashRadius: 1.0, projSpeed: 8 }],
  },
  glacier: {
    id: 'glacier', name: 'GLACIER', cost: 125,
    color: '#44eeff', colorDark: '#0a2a33',
    description: 'Rapid freeze gun', key: '',
    fusion: true, fusionOf: ['pulse', 'cryo'],
    levels: [{ damage: 14, range: 4, fireRate: 350, slowAmount: 0.55, slowDuration: 3000, projSpeed: 9 }],
  },
  tempest: {
    id: 'tempest', name: 'TEMPEST', cost: 225,
    color: '#ff66ff', colorDark: '#330a33',
    description: 'Chain explosions', key: '',
    fusion: true, fusionOf: ['arc', 'nova'],
    levels: [{ damage: 28, range: 4.5, fireRate: 1000, chains: 3, splashRadius: 1.2 }],
  },
  shatter: {
    id: 'shatter', name: 'SHATTER', cost: 175,
    color: '#aa44ff', colorDark: '#1a0a33',
    description: 'Chain freeze', key: '',
    fusion: true, fusionOf: ['arc', 'cryo'],
    levels: [{ damage: 14, range: 4, fireRate: 800, chains: 3, slowAmount: 0.5, slowDuration: 2500 }],
  },
  avalanche: {
    id: 'avalanche', name: 'AVALANCHE', cost: 200,
    color: '#2288ff', colorDark: '#0a1a44',
    description: 'Massive freeze AoE', key: '',
    fusion: true, fusionOf: ['nova', 'cryo'],
    levels: [{ damage: 40, range: 4, fireRate: 1600, splashRadius: 2.2, slowAmount: 0.45, slowDuration: 2000, projSpeed: 4 }],
  },
};

export const FUSION_MAP: Record<string, string> = {
  'arc+pulse': 'storm',
  'nova+pulse': 'barrage',
  'cryo+pulse': 'glacier',
  'arc+nova': 'tempest',
  'arc+cryo': 'shatter',
  'cryo+nova': 'avalanche',
};

export function getFusionKey(a: string, b: string): string {
  return [a, b].sort().join('+');
}

export const ENEMY_TYPES: Record<string, EnemyType> = {
  scout: { id: 'scout', name: 'Scout', hp: 40, speed: 2.0, gold: 10, color: '#ff6644', size: 6, shape: 'triangle' },
  drone: { id: 'drone', name: 'Drone', hp: 80, speed: 1.5, gold: 15, color: '#ffaa00', size: 8, shape: 'diamond' },
  mech: { id: 'mech', name: 'Mech', hp: 200, speed: 1.0, gold: 30, color: '#ff4488', size: 10, shape: 'hexagon' },
  swarm: { id: 'swarm', name: 'Swarm', hp: 20, speed: 2.8, gold: 5, color: '#ffff00', size: 5, shape: 'circle' },
  boss: { id: 'boss', name: 'Boss', hp: 600, speed: 0.7, gold: 100, color: '#ff0044', size: 14, shape: 'octagon' },
};
