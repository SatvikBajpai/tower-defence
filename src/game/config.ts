import type { TowerType, EnemyType } from './types';

export const CELL = 40;
export const COLS = 32;
export const ROWS = 18;
export const CANVAS_W = COLS * CELL;
export const CANVAS_H = ROWS * CELL;

export const SELL_RATIO = 0.6;
export const MAX_PARTICLES = 600;

export interface LevelDef {
  id: number;
  name: string;
  subtitle: string;
  path: [number, number][];
  waves: number;
  startGold: number;
  lives: number;
  waveOffset: number;
}

export const LEVELS: LevelDef[] = [
  {
    // Simple S-curve, gentle introduction. ~55 path cells.
    id: 1, name: 'OUTPOST', subtitle: 'Basic training',
    startGold: 150, lives: 15, waves: 7, waveOffset: 0,
    path: [
      [-1, 4], [8, 4], [8, 14], [16, 14], [16, 4], [24, 4], [24, 14], [33, 14],
    ],
  },
  {
    // Winding corridors with switchbacks. ~74 path cells.
    id: 2, name: 'CROSSROADS', subtitle: 'Winding corridors',
    startGold: 160, lives: 14, waves: 7, waveOffset: 7,
    path: [
      [-1, 3], [6, 3], [6, 8], [2, 8], [2, 14], [12, 14],
      [12, 8], [18, 8], [18, 14], [24, 14], [24, 3], [29, 3], [29, 8], [33, 8],
    ],
  },
  {
    // Tight vertical zigzag lanes. ~99 path cells. Great for AoE/chain.
    id: 3, name: 'SERPENTINE', subtitle: 'Tight lanes',
    startGold: 175, lives: 12, waves: 7, waveOffset: 14,
    path: [
      [-1, 2], [5, 2], [5, 15], [10, 15], [10, 2],
      [15, 2], [15, 15], [20, 15], [20, 2], [25, 2], [25, 15], [33, 15],
    ],
  },
  {
    // Inward spiral - very long, many tower spots in the center. ~140 path cells.
    id: 4, name: 'SPIRAL', subtitle: 'The long road',
    startGold: 185, lives: 10, waves: 7, waveOffset: 21,
    path: [
      [-1, 1], [29, 1], [29, 16], [3, 16], [3, 5],
      [26, 5], [26, 12], [7, 12], [7, 8], [33, 8],
    ],
  },
  {
    // Complex weave with multiple pockets. ~93 path cells.
    id: 5, name: 'NEXUS', subtitle: 'Final stand',
    startGold: 200, lives: 8, waves: 7, waveOffset: 28,
    path: [
      [-1, 2], [8, 2], [8, 10], [2, 10], [2, 16], [14, 16],
      [14, 6], [20, 6], [20, 16], [28, 16], [28, 2], [33, 2],
    ],
  },
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
    levels: [
      { damage: 16, range: 4, fireRate: 350, chains: 3 },
      { damage: 22, range: 4.5, fireRate: 280, chains: 4, upgradeCost: 150 },
      { damage: 30, range: 5, fireRate: 220, chains: 5, upgradeCost: 225 },
    ],
  },
  barrage: {
    id: 'barrage', name: 'BARRAGE', cost: 175,
    color: '#88ff44', colorDark: '#1a3308',
    description: 'Rapid AoE shots', key: '',
    fusion: true, fusionOf: ['pulse', 'nova'],
    levels: [
      { damage: 22, range: 4, fireRate: 500, splashRadius: 1.0, projSpeed: 8 },
      { damage: 32, range: 4.5, fireRate: 400, splashRadius: 1.3, projSpeed: 9, upgradeCost: 175 },
      { damage: 45, range: 5, fireRate: 300, splashRadius: 1.6, projSpeed: 10, upgradeCost: 250 },
    ],
  },
  glacier: {
    id: 'glacier', name: 'GLACIER', cost: 125,
    color: '#44eeff', colorDark: '#0a2a33',
    description: 'Rapid freeze gun', key: '',
    fusion: true, fusionOf: ['pulse', 'cryo'],
    levels: [
      { damage: 14, range: 4, fireRate: 350, slowAmount: 0.55, slowDuration: 3000, projSpeed: 9 },
      { damage: 20, range: 4.5, fireRate: 280, slowAmount: 0.65, slowDuration: 3500, projSpeed: 10, upgradeCost: 125 },
      { damage: 28, range: 5, fireRate: 220, slowAmount: 0.75, slowDuration: 4000, projSpeed: 11, upgradeCost: 185 },
    ],
  },
  tempest: {
    id: 'tempest', name: 'TEMPEST', cost: 225,
    color: '#ff66ff', colorDark: '#330a33',
    description: 'Chain explosions', key: '',
    fusion: true, fusionOf: ['arc', 'nova'],
    levels: [
      { damage: 28, range: 4.5, fireRate: 1000, chains: 3, splashRadius: 1.2 },
      { damage: 40, range: 5, fireRate: 850, chains: 4, splashRadius: 1.5, upgradeCost: 225 },
      { damage: 55, range: 5.5, fireRate: 700, chains: 5, splashRadius: 1.8, upgradeCost: 325 },
    ],
  },
  shatter: {
    id: 'shatter', name: 'SHATTER', cost: 175,
    color: '#aa44ff', colorDark: '#1a0a33',
    description: 'Chain freeze', key: '',
    fusion: true, fusionOf: ['arc', 'cryo'],
    levels: [
      { damage: 14, range: 4, fireRate: 800, chains: 3, slowAmount: 0.5, slowDuration: 2500 },
      { damage: 20, range: 4.5, fireRate: 650, chains: 4, slowAmount: 0.6, slowDuration: 3000, upgradeCost: 175 },
      { damage: 28, range: 5, fireRate: 500, chains: 5, slowAmount: 0.7, slowDuration: 3500, upgradeCost: 250 },
    ],
  },
  avalanche: {
    id: 'avalanche', name: 'AVALANCHE', cost: 200,
    color: '#2288ff', colorDark: '#0a1a44',
    description: 'Massive freeze AoE', key: '',
    fusion: true, fusionOf: ['nova', 'cryo'],
    levels: [
      { damage: 40, range: 4, fireRate: 1600, splashRadius: 2.2, slowAmount: 0.45, slowDuration: 2000, projSpeed: 4 },
      { damage: 58, range: 4.5, fireRate: 1300, splashRadius: 2.6, slowAmount: 0.55, slowDuration: 2500, projSpeed: 4.5, upgradeCost: 200 },
      { damage: 80, range: 5, fireRate: 1000, splashRadius: 3.0, slowAmount: 0.65, slowDuration: 3000, projSpeed: 5, upgradeCost: 300 },
    ],
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
  scout:   { id: 'scout',   name: 'Scout',   hp: 50,  speed: 1.7, gold: 5,  color: '#ff6644', size: 6,  shape: 'triangle', ability: 'none' },
  drone:   { id: 'drone',   name: 'Drone',   hp: 110, speed: 1.2, gold: 8,  color: '#ffaa00', size: 8,  shape: 'diamond',  ability: 'none' },
  mech:    { id: 'mech',    name: 'Mech',    hp: 280, speed: 0.8, gold: 16, color: '#ff4488', size: 10, shape: 'hexagon',  ability: 'none' },
  swarm:   { id: 'swarm',   name: 'Swarm',   hp: 28,  speed: 2.3, gold: 2,  color: '#ffff00', size: 5,  shape: 'circle',   ability: 'none' },
  boss:    { id: 'boss',    name: 'Boss',    hp: 900, speed: 0.55, gold: 60, color: '#ff0044', size: 14, shape: 'octagon',  ability: 'none' },
  // Special enemies - introduced across levels
  phantom: { id: 'phantom', name: 'Phantom', hp: 70,  speed: 1.5, gold: 8,  color: '#aa66ff', size: 7,  shape: 'star',     ability: 'phase' },
  splitter:{ id: 'splitter', name: 'Splitter',hp: 160, speed: 1.1, gold: 10, color: '#ff8844', size: 9,  shape: 'cross',    ability: 'split' },
  necro:   { id: 'necro',   name: 'Necro',   hp: 200, speed: 0.9, gold: 15, color: '#44ff88', size: 9,  shape: 'star',     ability: 'necro' },
  guardian: { id: 'guardian', name: 'Guardian',hp: 250, speed: 0.75, gold: 18, color: '#ffcc44', size: 11, shape: 'hexagon',  ability: 'shield' },
  sprinter:{ id: 'sprinter', name: 'Sprinter',hp: 120, speed: 1.0, gold: 10, color: '#44ffcc', size: 7,  shape: 'triangle', ability: 'sprint' },
};
