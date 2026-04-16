export interface Point {
  x: number;
  y: number;
}

export interface TowerLevel {
  damage: number;
  range: number;
  fireRate: number;
  projSpeed?: number;
  chains?: number;
  splashRadius?: number;
  slowAmount?: number;
  slowDuration?: number;
  upgradeCost?: number;
}

export interface TowerType {
  id: string;
  name: string;
  cost: number;
  color: string;
  colorDark: string;
  description: string;
  key: string;
  levels: TowerLevel[];
  fusion?: boolean;
  fusionOf?: [string, string];
}

export interface Tower {
  id: number;
  type: TowerType;
  col: number;
  row: number;
  x: number;
  y: number;
  level: number;
  rotation: number;
  targetRotation: number;
  lastFired: number;
  totalInvested: number;
  kills: number;
  target: Enemy | null;
  pulseAnim: number;
  overchargeTime: number;
}

export type EnemyAbility = 'none' | 'phase' | 'split' | 'necro' | 'shield' | 'sprint';

export interface EnemyType {
  id: string;
  name: string;
  hp: number;
  speed: number;
  gold: number;
  color: string;
  size: number;
  shape: 'triangle' | 'diamond' | 'hexagon' | 'circle' | 'octagon' | 'star' | 'cross';
  ability: EnemyAbility;
}

export interface Enemy {
  id: number;
  type: EnemyType;
  hp: number;
  maxHp: number;
  speed: number;
  baseSpeed: number;
  distance: number;
  x: number;
  y: number;
  gold: number;
  alive: boolean;
  slowTimer: number;
  slowAmount: number;
  hitFlash: number;
  spawnDelay: number;
  angle: number;
  phaseTimer: number;
  phased: boolean;
  shieldHp: number;
  shieldMax: number;
  sprintReady: boolean;
  sprintTriggered: boolean;
}

export interface Projectile {
  x: number;
  y: number;
  targetId: number;
  damage: number;
  speed: number;
  color: string;
  type: string;
  splashRadius?: number;
  slowAmount?: number;
  slowDuration?: number;
  trail: Point[];
  alive: boolean;
}

export interface ArcEffect {
  targets: Point[];
  color: string;
  timer: number;
  maxTimer: number;
  damage: number;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
  type: 'circle' | 'spark' | 'ring';
  ringRadius?: number;
  ringMaxRadius?: number;
}

export interface FloatingText {
  x: number;
  y: number;
  text: string;
  color: string;
  life: number;
  vy: number;
}

export interface WaveEntry {
  type: string;
  count: number;
  delay: number;
}

export interface PathSegment {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  length: number;
  cumLength: number;
}

export type CellState = 0 | 1 | 2; // empty, path, tower

export interface GameState {
  gold: number;
  lives: number;
  maxLives: number;
  waveNum: number;
  waveName: string;
  phase: 'waiting' | 'spawning' | 'active' | 'gameover' | 'level_complete';
  speed: number;
  score: number;
  enemiesKilled: number;
  waveEnemiesTotal: number;
  waveEnemiesCleared: number;
  waveBonus: number;
  levelNum: number;
  levelWave: number;
  levelWavesTotal: number;
  levelName: string;
  selectedTowerType: string | null;
  selectedTower: Tower | null;
  mouseGrid: Point | null;
  mousePixel: Point | null;
}
