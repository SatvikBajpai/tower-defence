import type { TowerType, EnemyType } from './types';

export const CELL = 40;
export const COLS = 32;
export const ROWS = 18;
export const CANVAS_W = COLS * CELL;
export const CANVAS_H = ROWS * CELL;

export const SELL_RATIO = 0.5;
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
    startGold: 225, lives: 15, waves: 7, waveOffset: 0,
    path: [
      [-1, 4], [8, 4], [8, 14], [16, 14], [16, 4], [24, 4], [24, 14], [33, 14],
    ],
  },
  {
    // Winding corridors with switchbacks. ~74 path cells.
    id: 2, name: 'CROSSROADS', subtitle: 'Winding corridors',
    startGold: 245, lives: 14, waves: 7, waveOffset: 7,
    path: [
      [-1, 3], [6, 3], [6, 8], [2, 8], [2, 14], [12, 14],
      [12, 8], [18, 8], [18, 14], [24, 14], [24, 3], [29, 3], [29, 8], [33, 8],
    ],
  },
  {
    // Tight vertical zigzag lanes. ~99 path cells. Great for AoE/chain.
    id: 3, name: 'SERPENTINE', subtitle: 'Tight lanes',
    startGold: 350, lives: 12, waves: 7, waveOffset: 14,
    path: [
      [-1, 2], [5, 2], [5, 15], [10, 15], [10, 2],
      [15, 2], [15, 15], [20, 15], [20, 2], [25, 2], [25, 15], [33, 15],
    ],
  },
  {
    // Inward spiral - very long, many tower spots in the center. ~140 path cells.
    id: 4, name: 'SPIRAL', subtitle: 'The long road',
    startGold: 340, lives: 10, waves: 7, waveOffset: 21,
    path: [
      [-1, 1], [29, 1], [29, 16], [3, 16], [3, 5],
      [26, 5], [26, 12], [7, 12], [7, 8], [33, 8],
    ],
  },
  {
    // Complex weave with multiple pockets. ~93 path cells.
    id: 5, name: 'NEXUS', subtitle: 'Final stand',
    startGold: 580, lives: 12, waves: 7, waveOffset: 28,
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
    cost: 75,
    color: '#00ffff',
    colorDark: '#004455',
    description: 'Fast single-target',
    key: '1',
    damageType: 'energy',
    // DPS: 24 → 42 → 72 (1.75x per tier, 3.0x total)
    levels: [
      { damage: 12, range: 3, fireRate: 500, projSpeed: 8 },
      { damage: 18, range: 3.3, fireRate: 425, projSpeed: 9, upgradeCost: 75 },
      { damage: 26, range: 3.6, fireRate: 360, projSpeed: 10, upgradeCost: 110 },
    ],
  },
  arc: {
    id: 'arc',
    name: 'ARC',
    cost: 125,
    color: '#ff00ff',
    colorDark: '#440044',
    description: 'Chain lightning',
    key: '2',
    damageType: 'energy',
    // Effective DPS (with chains): ~20 → ~40 → ~70
    levels: [
      { damage: 10, range: 3, fireRate: 1200, chains: 2 },
      { damage: 14, range: 3.3, fireRate: 1050, chains: 3, upgradeCost: 115 },
      { damage: 20, range: 3.6, fireRate: 900, chains: 4, upgradeCost: 170 },
    ],
  },
  nova: {
    id: 'nova',
    name: 'NOVA',
    cost: 155,
    color: '#00ff66',
    colorDark: '#003318',
    description: 'Area splash damage',
    key: '3',
    damageType: 'blast',
    // Effective DPS (with splash): ~28 → ~47 → ~76
    levels: [
      { damage: 25, range: 3, fireRate: 1800, splashRadius: 1.2, projSpeed: 4 },
      { damage: 35, range: 3.3, fireRate: 1500, splashRadius: 1.5, projSpeed: 4.5, upgradeCost: 140 },
      { damage: 50, range: 3.6, fireRate: 1250, splashRadius: 1.8, projSpeed: 5, upgradeCost: 200 },
    ],
  },
  cryo: {
    id: 'cryo',
    name: 'CRYO',
    cost: 95,
    color: '#4488ff',
    colorDark: '#0a1a44',
    description: 'Slows enemies',
    key: '4',
    damageType: 'frost',
    // DPS: 14 → 23 → 40 (plus strong slow - utility scales too)
    levels: [
      { damage: 10, range: 3, fireRate: 700, slowAmount: 0.45, slowDuration: 2200, projSpeed: 6 },
      { damage: 14, range: 3.3, fireRate: 600, slowAmount: 0.55, slowDuration: 2500, projSpeed: 7, upgradeCost: 90 },
      { damage: 20, range: 3.6, fireRate: 500, slowAmount: 0.65, slowDuration: 2800, projSpeed: 8, upgradeCost: 125 },
    ],
  },
};

export const OVERCHARGE_DURATION = 5;
export const OVERCHARGE_COOLDOWN = 20;
export const OVERCHARGE_DAMAGE_MULT = 2.0;
export const OVERCHARGE_FIRE_MULT = 3.0;

// Damage multipliers for splash/chain hits
export const CHAIN_DAMAGE_FALLOFF = 0.7;
export const SPLASH_SECONDARY_MULT = 0.5;
export const CHAIN_SPLASH_MULT = 0.3;

// Boss HP scaling cap
export const BOSS_HP_SCALE_MAX = 4.0;

export const FROST_NOVA_COOLDOWN = 60;
export const FROST_NOVA_DURATION = 7;
export const FROST_NOVA_SLOW = 0.95;

export const FUSION_TYPES: Record<string, TowerType> = {
  // Fusion L3 targets ~1.5-2× the power of 2 base L3 towers combined.
  // Since fusing consumes two towers, this keeps fusion worthwhile but not game-breaking.
  storm: {
    id: 'storm', name: 'STORM', cost: 150,
    color: '#22ddff', colorDark: '#0a3348',
    description: 'Rapid chain bolts', key: '',
    damageType: 'energy',
    fusion: true, fusionOf: ['pulse', 'arc'],
    // Effective DPS with chains: ~72 → ~144 → ~208
    levels: [
      { damage: 12, range: 3.5, fireRate: 400, chains: 2 },
      { damage: 17, range: 3.8, fireRate: 350, chains: 3, upgradeCost: 140 },
      { damage: 22, range: 4.2, fireRate: 300, chains: 3, upgradeCost: 210 },
    ],
  },
  barrage: {
    id: 'barrage', name: 'BARRAGE', cost: 175,
    color: '#88ff44', colorDark: '#1a3308',
    description: 'Rapid AoE shots', key: '',
    damageType: 'blast',
    fusion: true, fusionOf: ['pulse', 'nova'],
    // Effective DPS: ~58 → ~98 → ~160
    levels: [
      { damage: 16, range: 3.5, fireRate: 550, splashRadius: 1.0, projSpeed: 8 },
      { damage: 22, range: 3.8, fireRate: 450, splashRadius: 1.2, projSpeed: 9, upgradeCost: 155 },
      { damage: 30, range: 4.2, fireRate: 380, splashRadius: 1.5, projSpeed: 10, upgradeCost: 220 },
    ],
  },
  glacier: {
    id: 'glacier', name: 'GLACIER', cost: 125,
    color: '#44eeff', colorDark: '#0a2a33',
    description: 'Rapid freeze gun', key: '',
    damageType: 'frost',
    fusion: true, fusionOf: ['pulse', 'cryo'],
    // DPS + strongest slow - utility fusion
    levels: [
      { damage: 10, range: 3.5, fireRate: 400, slowAmount: 0.55, slowDuration: 3000, projSpeed: 9 },
      { damage: 14, range: 3.8, fireRate: 330, slowAmount: 0.65, slowDuration: 3500, projSpeed: 10, upgradeCost: 115 },
      { damage: 20, range: 4.2, fireRate: 270, slowAmount: 0.75, slowDuration: 4000, projSpeed: 11, upgradeCost: 170 },
    ],
  },
  tempest: {
    id: 'tempest', name: 'TEMPEST', cost: 225,
    color: '#ff66ff', colorDark: '#330a33',
    description: 'Chain explosions', key: '',
    damageType: 'blast',
    fusion: true, fusionOf: ['arc', 'nova'],
    // Elite fusion: chain + splash combined
    levels: [
      { damage: 22, range: 4, fireRate: 1100, chains: 2, splashRadius: 1.0 },
      { damage: 30, range: 4.3, fireRate: 950, chains: 3, splashRadius: 1.2, upgradeCost: 210 },
      { damage: 42, range: 4.6, fireRate: 800, chains: 3, splashRadius: 1.5, upgradeCost: 300 },
    ],
  },
  shatter: {
    id: 'shatter', name: 'SHATTER', cost: 175,
    color: '#aa44ff', colorDark: '#1a0a33',
    description: 'Chain freeze', key: '',
    damageType: 'frost',
    fusion: true, fusionOf: ['arc', 'cryo'],
    // Control fusion: chain + slow on all chained
    levels: [
      { damage: 11, range: 3.5, fireRate: 850, chains: 2, slowAmount: 0.5, slowDuration: 2500 },
      { damage: 15, range: 3.8, fireRate: 720, chains: 3, slowAmount: 0.6, slowDuration: 3000, upgradeCost: 160 },
      { damage: 21, range: 4.2, fireRate: 600, chains: 3, slowAmount: 0.7, slowDuration: 3500, upgradeCost: 230 },
    ],
  },
  avalanche: {
    id: 'avalanche', name: 'AVALANCHE', cost: 200,
    color: '#2288ff', colorDark: '#0a1a44',
    description: 'Massive freeze AoE', key: '',
    damageType: 'blast',
    fusion: true, fusionOf: ['nova', 'cryo'],
    // Heavy siege fusion: big splash + slow
    levels: [
      { damage: 30, range: 3.8, fireRate: 1700, splashRadius: 1.8, slowAmount: 0.45, slowDuration: 2000, projSpeed: 4 },
      { damage: 42, range: 4.2, fireRate: 1450, splashRadius: 2.1, slowAmount: 0.55, slowDuration: 2500, projSpeed: 4.5, upgradeCost: 185 },
      { damage: 58, range: 4.6, fireRate: 1200, splashRadius: 2.5, slowAmount: 0.65, slowDuration: 3000, projSpeed: 5, upgradeCost: 275 },
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
  scout:   { id: 'scout',   name: 'Scout',   hp: 55,  speed: 1.4, gold: 5,  color: '#ff6644', size: 6,  shape: 'triangle', ability: 'none' },
  drone:   { id: 'drone',   name: 'Drone',   hp: 110, speed: 1.0, gold: 9,  color: '#ffaa00', size: 8,  shape: 'diamond',  ability: 'none' },
  // Armored: heavy resist to Energy, very weak to Blast - FORCES Nova or fusion
  mech:    { id: 'mech',    name: 'Mech',    hp: 360, speed: 0.8, gold: 18, color: '#ff4488', size: 10, shape: 'hexagon',  ability: 'none',   resist: { energy: 0.5, blast: 1.6 } },
  // Light: shredded by Blast, mildly resistant to Energy
  swarm:   { id: 'swarm',   name: 'Swarm',   hp: 38,  speed: 2.3, gold: 2,  color: '#ffff00', size: 5,  shape: 'circle',   ability: 'none',   resist: { energy: 0.7, blast: 1.7 } },
  // Boss: resistant, big HP - event-tier, requires multi-tower focus
  boss:    { id: 'boss',    name: 'Boss',    hp: 1150,speed: 0.55, gold: 60, color: '#ff0044', size: 14, shape: 'octagon',  ability: 'none',   resist: { energy: 0.8, blast: 0.8, frost: 0.8 } },
  // Ethereal: Energy chains through, almost immune to Blast
  phantom: { id: 'phantom', name: 'Phantom', hp: 95,  speed: 1.5, gold: 10, color: '#aa66ff', size: 7,  shape: 'star',     ability: 'phase',  resist: { energy: 1.5, blast: 0.45 } },
  // Unstable: Blast cracks them wide open
  splitter:{ id: 'splitter', name: 'Splitter',hp: 200, speed: 1.1, gold: 12, color: '#ff8844', size: 9,  shape: 'cross',    ability: 'split',  resist: { blast: 1.5, energy: 0.85 } },
  // Undead: Frost interrupts resurrection, Energy absorbed
  necro:   { id: 'necro',   name: 'Necro',   hp: 255, speed: 0.9, gold: 18, color: '#44ff88', size: 9,  shape: 'star',     ability: 'necro',  resist: { energy: 0.6, frost: 1.7, blast: 1.1 } },
  // Shielded: Energy pierces shields, Blast bounces off
  guardian: { id: 'guardian', name: 'Guardian',hp: 320, speed: 0.75, gold: 22, color: '#ffcc44', size: 11, shape: 'hexagon',  ability: 'shield', resist: { energy: 1.4, blast: 0.65 } },
  // Fast: shakes off Frost, vulnerable to everything else
  sprinter:{ id: 'sprinter', name: 'Sprinter',hp: 155, speed: 1.0, gold: 12, color: '#44ffcc', size: 7,  shape: 'triangle', ability: 'sprint', resist: { frost: 0.4, energy: 1.3, blast: 1.3 } },
};
