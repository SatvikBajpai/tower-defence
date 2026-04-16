import {
  CELL, COLS, ROWS, LEVELS,
  SELL_RATIO, MAX_PARTICLES, TOWER_TYPES, ENEMY_TYPES,
  FUSION_TYPES, FUSION_MAP, getFusionKey,
  OVERCHARGE_DURATION, OVERCHARGE_COOLDOWN,
} from './config';
import { grid, canPlace, getPositionOnPath, totalPathLength, initPath } from './path';
import { generateWave, peekNextWave } from './waves';
import { invalidateBackground } from './renderer';
import type {
  GameState, Tower, Enemy, Projectile, Particle,
  FloatingText, ArcEffect, Point,
} from './types';

let nextId = 1;

export const state: GameState = {
  gold: LEVELS[0].startGold,
  lives: LEVELS[0].lives,
  maxLives: LEVELS[0].lives,
  waveNum: 0,
  waveName: '',
  phase: 'waiting',
  paused: false,
  speed: 1,
  score: 0,
  enemiesKilled: 0,
  waveEnemiesTotal: 0,
  waveEnemiesCleared: 0,
  waveBonus: 0,
  waveCountdown: 5,
  announcement: null,
  levelNum: 1,
  levelWave: 0,
  levelWavesTotal: LEVELS[0].waves,
  levelName: LEVELS[0].name,
  selectedTowerType: null,
  selectedTower: null,
  mouseGrid: null,
  mousePixel: null,
};

export const towers: Tower[] = [];
export const enemies: Enemy[] = [];
export const projectiles: Projectile[] = [];
export const particles: Particle[] = [];
export const floatingTexts: FloatingText[] = [];
export const arcEffects: ArcEffect[] = [];

let spawnQueue: { type: string; hp: number; speed: number; gold: number; delay: number }[] = [];
let spawnTimer = 0;

function dist(a: Point, b: Point): number {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.sqrt(dx * dx + dy * dy);
}

function angleTo(a: Point, b: Point): number {
  return Math.atan2(b.y - a.y, b.x - a.x);
}

function lerpAngle(a: number, b: number, t: number): number {
  let diff = b - a;
  while (diff > Math.PI) diff -= Math.PI * 2;
  while (diff < -Math.PI) diff += Math.PI * 2;
  return a + diff * t;
}

export function addParticle(p: Omit<Particle, 'maxLife'>) {
  if (particles.length >= MAX_PARTICLES) particles.splice(0, 10);
  particles.push({ ...p, maxLife: p.life });
}

export function addFloatingText(x: number, y: number, text: string, color: string) {
  floatingTexts.push({ x, y, text, color, life: 1.0, vy: -40 });
}

function spawnParticleBurst(x: number, y: number, color: string, count: number, speed: number, size: number) {
  for (let i = 0; i < count; i++) {
    const angle = (Math.PI * 2 * i) / count + Math.random() * 0.5;
    const s = speed * (0.5 + Math.random() * 0.5);
    addParticle({
      x, y,
      vx: Math.cos(angle) * s,
      vy: Math.sin(angle) * s,
      life: 0.4 + Math.random() * 0.4,
      color,
      size: size * (0.5 + Math.random() * 0.5),
      type: 'spark',
    });
  }
}

// ---- LEVEL MANAGEMENT ----

export function startLevel(levelNum: number) {
  const level = LEVELS[levelNum - 1];
  if (!level) return;

  initPath(level.path);
  invalidateBackground();

  state.levelNum = levelNum;
  state.levelName = level.name;
  state.levelWave = 0;
  state.levelWavesTotal = level.waves;
  state.gold = level.startGold;
  state.lives = level.lives;
  state.maxLives = level.lives;
  state.waveNum = level.waveOffset;
  state.waveName = '';
  state.phase = 'waiting';
  state.paused = false;
  state.waveCountdown = 0;
  state.announcement = null;
  state.selectedTowerType = null;
  state.selectedTower = null;

  towers.length = 0;
  enemies.length = 0;
  projectiles.length = 0;
  particles.length = 0;
  floatingTexts.length = 0;
  arcEffects.length = 0;
  spawnQueue.length = 0;
}

export function advanceLevel(): boolean {
  const nextLvl = state.levelNum + 1;
  if (nextLvl > LEVELS.length) return false;
  startLevel(nextLvl);
  return true;
}

export function hasNextLevel(): boolean {
  return state.levelNum < LEVELS.length;
}

// ---- TOWER OPERATIONS ----

export function placeTower(col: number, row: number, typeId: string): boolean {
  const type = TOWER_TYPES[typeId];
  if (!type || state.gold < type.cost || !canPlace(col, row)) return false;

  state.gold -= type.cost;
  grid[row][col] = 2;

  const tower: Tower = {
    id: nextId++,
    type, col, row,
    x: col * CELL + CELL / 2,
    y: row * CELL + CELL / 2,
    level: 0,
    rotation: 0,
    targetRotation: 0,
    lastFired: 0,
    totalInvested: type.cost,
    kills: 0,
    target: null,
    pulseAnim: 1.0,
    overchargeTime: 0,
  };

  towers.push(tower);
  spawnParticleBurst(tower.x, tower.y, type.color, 12, 80, 3);
  return true;
}

export function upgradeTower(tower: Tower): boolean {
  const nextLevel = tower.level + 1;
  if (nextLevel >= tower.type.levels.length) return false;
  const cost = tower.type.levels[nextLevel].upgradeCost ?? tower.type.cost;
  if (state.gold < cost) return false;

  state.gold -= cost;
  tower.level = nextLevel;
  tower.totalInvested += cost;
  tower.pulseAnim = 1.0;
  spawnParticleBurst(tower.x, tower.y, tower.type.color, 16, 100, 4);
  return true;
}

export function sellTower(tower: Tower): void {
  const refund = Math.floor(tower.totalInvested * SELL_RATIO);
  state.gold += refund;
  grid[tower.row][tower.col] = 0;
  const idx = towers.indexOf(tower);
  if (idx >= 0) towers.splice(idx, 1);
  if (state.selectedTower === tower) state.selectedTower = null;
  addFloatingText(tower.x, tower.y - 10, `+${refund}g`, '#ffcc00');
  spawnParticleBurst(tower.x, tower.y, '#ffcc00', 10, 60, 3);
}

// ---- FUSION ----

export function getAdjacentFusionTargets(tower: Tower): { neighbor: Tower; resultName: string; resultId: string }[] {
  if (tower.type.fusion) return [];
  const results: { neighbor: Tower; resultName: string; resultId: string }[] = [];

  for (const t of towers) {
    if (t === tower || t.type.fusion) continue;
    const dc = Math.abs(t.col - tower.col);
    const dr = Math.abs(t.row - tower.row);
    if (dc + dr !== 1) continue;

    const key = getFusionKey(tower.type.id, t.type.id);
    const fusionId = FUSION_MAP[key];
    if (!fusionId) continue;

    const fusionType = FUSION_TYPES[fusionId];
    if (fusionType) {
      results.push({ neighbor: t, resultName: fusionType.name, resultId: fusionId });
    }
  }
  return results;
}

export function fuseTowers(towerA: Tower, towerB: Tower): boolean {
  const key = getFusionKey(towerA.type.id, towerB.type.id);
  const fusionId = FUSION_MAP[key];
  if (!fusionId) return false;

  const fusionType = FUSION_TYPES[fusionId];
  if (!fusionType) return false;

  const bx = towerB.x;
  const by = towerB.y;

  grid[towerB.row][towerB.col] = 0;
  const idx = towers.indexOf(towerB);
  if (idx >= 0) towers.splice(idx, 1);

  // Fusion level based on combined upgrade levels of both parents
  // Both at lv0 = fusion lv0, one maxed = fusion lv1, both maxed = fusion lv2
  const combinedLevels = towerA.level + towerB.level;
  const fusionLevel = Math.min(combinedLevels, fusionType.levels.length - 1);

  towerA.type = fusionType;
  towerA.level = fusionLevel;
  towerA.totalInvested += towerB.totalInvested;
  towerA.kills += towerB.kills;
  towerA.pulseAnim = 1.0;
  towerA.overchargeTime = 0;
  towerA.lastFired = 0;

  spawnParticleBurst(towerA.x, towerA.y, fusionType.color, 24, 130, 5);
  spawnParticleBurst(bx, by, fusionType.color, 16, 100, 4);
  addFloatingText(towerA.x, towerA.y - 20, fusionType.name, fusionType.color);

  state.selectedTower = towerA;
  return true;
}

// ---- OVERCHARGE ----

export function overchargeTower(tower: Tower): boolean {
  if (tower.overchargeTime !== 0) return false;
  tower.overchargeTime = OVERCHARGE_DURATION;
  spawnParticleBurst(tower.x, tower.y, '#ffffff', 12, 60, 3);
  addFloatingText(tower.x, tower.y - 20, 'OVERCHARGE', '#ffffff');
  return true;
}

// ---- WAVE / PREVIEW ----

export function getNextWavePreview() {
  return peekNextWave(state.waveNum);
}

export function startWave(): boolean {
  if (state.phase !== 'waiting') return false;
  if (state.levelWave >= state.levelWavesTotal) return false;

  state.waveNum++;
  state.levelWave++;
  const wave = generateWave(state.waveNum);
  state.waveName = wave.name;
  state.waveBonus = wave.bonus;

  spawnQueue = [];
  for (const entry of wave.entries) {
    const et = ENEMY_TYPES[entry.type];
    if (!et) continue;
    for (let i = 0; i < entry.count; i++) {
      spawnQueue.push({
        type: entry.type,
        hp: Math.round(et.hp * wave.hpScale),
        speed: et.speed,
        gold: et.gold,
        delay: entry.delay,
      });
    }
  }

  for (let i = spawnQueue.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    if (Math.abs(i - j) < 4) {
      [spawnQueue[i], spawnQueue[j]] = [spawnQueue[j], spawnQueue[i]];
    }
  }

  state.waveEnemiesTotal = spawnQueue.length;
  state.waveEnemiesCleared = 0;
  spawnTimer = 0;
  state.phase = 'spawning';
  state.announcement = { wave: state.levelWave, name: state.waveName, timer: 2.5 };
  return true;
}

// ---- ENEMY ----

function createEnemy(et: typeof ENEMY_TYPES[string], hp: number, speed: number, gold: number, distance: number): Enemy {
  const shieldMax = et.ability === 'shield' ? Math.round(hp * 0.4) : 0;
  const enemy: Enemy = {
    id: nextId++, type: et,
    hp, maxHp: hp, speed, baseSpeed: speed,
    distance, x: 0, y: 0,
    gold, alive: true,
    slowTimer: 0, slowAmount: 0,
    hitFlash: 0, spawnDelay: 0, angle: 0,
    phaseTimer: et.ability === 'phase' ? 2 + Math.random() * 2 : 0,
    phased: false,
    shieldHp: shieldMax, shieldMax,
    sprintReady: et.ability === 'sprint',
    sprintTriggered: false,
  };
  const pos = getPositionOnPath(distance);
  enemy.x = pos.x; enemy.y = pos.y; enemy.angle = pos.angle;
  return enemy;
}

function spawnEnemy(data: typeof spawnQueue[0]) {
  const et = ENEMY_TYPES[data.type];
  if (!et) return;
  enemies.push(createEnemy(et, data.hp, data.speed, data.gold, 0));
}

function findTarget(tower: Tower): Enemy | null {
  const stats = tower.type.levels[tower.level];
  const range = stats.range * CELL;
  let best: Enemy | null = null;
  let bestDist = -1;

  for (const enemy of enemies) {
    if (!enemy.alive || enemy.phased) continue;
    const d = dist(tower, enemy);
    if (d <= range && enemy.distance > bestDist) {
      best = enemy;
      bestDist = enemy.distance;
    }
  }
  return best;
}

function damageEnemy(enemy: Enemy, damage: number, tower?: Tower) {
  if (enemy.phased) return;

  let remaining = damage;

  // Shield absorbs damage first
  if (enemy.shieldHp > 0) {
    const absorbed = Math.min(enemy.shieldHp, remaining);
    enemy.shieldHp -= absorbed;
    remaining -= absorbed;
    if (enemy.shieldHp <= 0) {
      spawnParticleBurst(enemy.x, enemy.y, '#ffcc44', 6, 40, 2);
    }
  }

  enemy.hp -= remaining;
  enemy.hitFlash = 0.12;

  // Sprint trigger: when below 40% HP, dash
  if (enemy.sprintReady && !enemy.sprintTriggered && enemy.hp < enemy.maxHp * 0.4 && enemy.hp > 0) {
    enemy.sprintTriggered = true;
    enemy.sprintReady = false;
    enemy.speed = enemy.baseSpeed * 4;
    addFloatingText(enemy.x, enemy.y - 12, 'SPRINT!', enemy.type.color);
    spawnParticleBurst(enemy.x, enemy.y, enemy.type.color, 8, 80, 2);
    // Speed resets after 1.5s via slowTimer trick (handled in update)
    setTimeout(() => {
      if (enemy.alive) enemy.speed = enemy.baseSpeed;
    }, 1500);
  }

  if (enemy.hp <= 0 && enemy.alive) {
    enemy.alive = false;
    state.gold += enemy.gold;
    state.score += enemy.gold;
    state.enemiesKilled++;
    state.waveEnemiesCleared++;
    if (tower) tower.kills++;

    addFloatingText(enemy.x, enemy.y - 15, `+${enemy.gold}g`, '#ffcc00');
    spawnParticleBurst(enemy.x, enemy.y, enemy.type.color, 20, 120, 4);

    for (let i = 0; i < 5; i++) {
      addParticle({
        x: enemy.x, y: enemy.y,
        vx: (Math.random() - 0.5) * 60, vy: (Math.random() - 0.5) * 60,
        life: 0.6 + Math.random() * 0.4, color: '#ffffff',
        size: 2 + Math.random() * 2, type: 'spark',
      });
    }

    // Splitter: spawn 2 smaller copies
    if (enemy.type.ability === 'split') {
      const splitType = ENEMY_TYPES['scout'];
      for (let i = 0; i < 2; i++) {
        const child = createEnemy(
          splitType,
          Math.round(enemy.maxHp * 0.3),
          enemy.baseSpeed * 1.3,
          Math.round(enemy.gold * 0.3),
          enemy.distance + (i - 0.5) * CELL * 0.5,
        );
        enemies.push(child);
        spawnParticleBurst(child.x, child.y, enemy.type.color, 6, 50, 2);
      }
    }

    // Necro: resurrect up to 2 recently dead nearby enemies
    if (enemy.type.ability === 'necro') {
      let resCount = 0;
      // Find dead enemies that were near this one (check recent deaths by spawning ghosts at this position)
      const necroType = ENEMY_TYPES['swarm'];
      for (let i = 0; i < 3; i++) {
        const ghost = createEnemy(
          necroType,
          Math.round(enemy.maxHp * 0.2),
          necroType.speed,
          3,
          enemy.distance - CELL * (0.5 + i * 0.3),
        );
        enemies.push(ghost);
        resCount++;
      }
      if (resCount > 0) {
        addFloatingText(enemy.x, enemy.y - 20, 'RESURRECT!', enemy.type.color);
        spawnParticleBurst(enemy.x, enemy.y, '#44ff88', 16, 80, 3);
      }
    }
  }
}

function fireProjectile(tower: Tower, target: Enemy) {
  const stats = tower.type.levels[tower.level];
  const isOC = tower.overchargeTime > 0;
  const dmgMult = isOC ? 1.5 : 1;
  const damage = Math.round(stats.damage * dmgMult);
  const hasChains = stats.chains != null;

  if (hasChains) {
    const chainTargets: Point[] = [{ x: target.x, y: target.y }];
    const hitIds = new Set<number>([target.id]);
    const chains = stats.chains!;
    const hasSplash = stats.splashRadius != null;
    const hasSlow = stats.slowAmount != null;

    damageEnemy(target, damage, tower);
    if (hasSlow) {
      target.slowTimer = (stats.slowDuration ?? 2000) / 1000;
      target.slowAmount = stats.slowAmount!;
    }
    if (hasSplash) {
      const sr = stats.splashRadius! * CELL;
      for (const e of enemies) {
        if (!e.alive || e.id === target.id) continue;
        if (dist(e, target) <= sr) damageEnemy(e, Math.round(damage * 0.5), tower);
      }
      addParticle({ x: target.x, y: target.y, vx: 0, vy: 0, life: 0.25, color: tower.type.color, size: 0, type: 'ring', ringRadius: 5, ringMaxRadius: sr });
    }

    let current: Enemy = target;
    for (let c = 0; c < chains; c++) {
      let closest: Enemy | null = null;
      let closestDist = CELL * 3;
      for (const e of enemies) {
        if (!e.alive || hitIds.has(e.id)) continue;
        const d = dist(current, e);
        if (d < closestDist) { closest = e; closestDist = d; }
      }
      if (!closest) break;
      hitIds.add(closest.id);
      chainTargets.push({ x: closest.x, y: closest.y });
      damageEnemy(closest, Math.round(damage * 0.7), tower);
      if (hasSlow) {
        closest.slowTimer = (stats.slowDuration ?? 2000) / 1000;
        closest.slowAmount = stats.slowAmount!;
      }
      if (hasSplash) {
        const sr = stats.splashRadius! * CELL;
        for (const e of enemies) {
          if (!e.alive || hitIds.has(e.id)) continue;
          if (dist(e, closest!) <= sr) damageEnemy(e, Math.round(damage * 0.3), tower);
        }
        addParticle({ x: closest.x, y: closest.y, vx: 0, vy: 0, life: 0.2, color: tower.type.color, size: 0, type: 'ring', ringRadius: 5, ringMaxRadius: sr });
      }
      current = closest;
    }

    arcEffects.push({
      targets: [{ x: tower.x, y: tower.y }, ...chainTargets],
      color: tower.type.color, timer: 0.25, maxTimer: 0.25, damage,
    });
    for (const pt of chainTargets) spawnParticleBurst(pt.x, pt.y, tower.type.color, 6, 50, 2);
  } else {
    projectiles.push({
      x: tower.x, y: tower.y,
      targetId: target.id, damage,
      speed: (stats.projSpeed ?? 6) * CELL,
      color: tower.type.color,
      type: tower.type.id,
      splashRadius: stats.splashRadius ? stats.splashRadius * CELL : undefined,
      slowAmount: stats.slowAmount,
      slowDuration: stats.slowDuration,
      trail: [], alive: true,
    });
  }

  tower.pulseAnim = 0.3;
  spawnParticleBurst(tower.x, tower.y, tower.type.color, 4, 40, 2);
}

// ---- MAIN UPDATE ----

export function update(dt: number): void {
  if (state.phase === 'gameover' || state.phase === 'level_complete' || state.paused) return;

  const gameDt = dt * state.speed;

  // Spawn
  if (state.phase === 'spawning' && spawnQueue.length > 0) {
    spawnTimer -= gameDt * 1000;
    while (spawnTimer <= 0 && spawnQueue.length > 0) {
      const next = spawnQueue.shift()!;
      spawnEnemy(next);
      spawnTimer += next.delay;
    }
    if (spawnQueue.length === 0) state.phase = 'active';
  }

  // Enemies
  for (let i = enemies.length - 1; i >= 0; i--) {
    const enemy = enemies[i];
    if (!enemy.alive) { enemies.splice(i, 1); continue; }

    // Phantom phase ability
    if (enemy.type.ability === 'phase') {
      enemy.phaseTimer -= gameDt;
      if (enemy.phaseTimer <= 0) {
        enemy.phased = !enemy.phased;
        enemy.phaseTimer = enemy.phased ? 1.5 : (2 + Math.random() * 2);
        if (enemy.phased) {
          spawnParticleBurst(enemy.x, enemy.y, enemy.type.color, 6, 30, 2);
        }
      }
    }

    // Guardian shield regen aura - recharges shields of nearby enemies
    if (enemy.type.ability === 'shield') {
      for (const other of enemies) {
        if (other === enemy || !other.alive) continue;
        if (other.shieldMax > 0 && other.shieldHp < other.shieldMax) {
          const d = dist(enemy, other);
          if (d < CELL * 3) {
            other.shieldHp = Math.min(other.shieldMax, other.shieldHp + 8 * gameDt);
          }
        }
      }
    }

    if (enemy.slowTimer > 0) {
      enemy.slowTimer -= gameDt;
      enemy.speed = enemy.baseSpeed * (1 - enemy.slowAmount);
      if (enemy.slowTimer <= 0 && !enemy.sprintTriggered) enemy.speed = enemy.baseSpeed;
    }

    enemy.distance += enemy.speed * CELL * gameDt;
    const pos = getPositionOnPath(enemy.distance);
    enemy.x = pos.x; enemy.y = pos.y; enemy.angle = pos.angle;
    if (enemy.hitFlash > 0) enemy.hitFlash -= gameDt;

    if (enemy.distance >= totalPathLength) {
      state.lives--;
      enemy.alive = false;
      state.waveEnemiesCleared++;
      enemies.splice(i, 1);
      spawnParticleBurst(pos.x, pos.y, '#ff0000', 8, 60, 3);
      if (state.lives <= 0) { state.lives = 0; state.phase = 'gameover'; return; }
    }
  }

  // Wave complete check
  if (state.phase === 'active' && enemies.length === 0 && spawnQueue.length === 0) {
    state.gold += state.waveBonus;
    addFloatingText(COLS * CELL / 2, ROWS * CELL / 2 - 30, `+${state.waveBonus}g`, '#00ffff');

    if (state.levelWave >= state.levelWavesTotal) {
      state.phase = 'level_complete';
    } else {
      state.phase = 'waiting';
      state.waveCountdown = 5;
    }
  }

  // Auto-start countdown
  if (state.phase === 'waiting' && state.levelWave < state.levelWavesTotal && state.levelWave > 0) {
    state.waveCountdown -= gameDt;
    if (state.waveCountdown <= 0) {
      startWave();
    }
  }

  // Towers
  const now = performance.now();
  for (const tower of towers) {
    const stats = tower.type.levels[tower.level];

    if (tower.overchargeTime > 0) {
      tower.overchargeTime -= gameDt;
      if (Math.random() < 0.3) {
        const a = Math.random() * Math.PI * 2;
        addParticle({ x: tower.x + Math.cos(a) * 12, y: tower.y + Math.sin(a) * 12, vx: Math.cos(a) * 30, vy: Math.sin(a) * 30, life: 0.3, color: '#ffffff', size: 2, type: 'spark' });
      }
      if (tower.overchargeTime <= 0) {
        tower.overchargeTime = -OVERCHARGE_COOLDOWN;
        addFloatingText(tower.x, tower.y - 15, 'OFFLINE', '#ff4444');
      }
    } else if (tower.overchargeTime < 0) {
      tower.overchargeTime += gameDt;
      if (tower.overchargeTime >= 0) {
        tower.overchargeTime = 0;
        spawnParticleBurst(tower.x, tower.y, tower.type.color, 8, 40, 2);
      }
    }

    if (tower.overchargeTime < 0) { tower.target = null; continue; }

    tower.target = findTarget(tower);
    if (tower.target) tower.targetRotation = angleTo(tower, tower.target);
    tower.rotation = lerpAngle(tower.rotation, tower.targetRotation, 8 * gameDt);
    if (tower.pulseAnim > 0) tower.pulseAnim -= gameDt * 3;

    const isOC = tower.overchargeTime > 0;
    const effectiveRate = isOC ? stats.fireRate / 2.5 : stats.fireRate;

    if (tower.target && now - tower.lastFired >= effectiveRate / state.speed) {
      fireProjectile(tower, tower.target);
      tower.lastFired = now;
    }
  }

  // Projectiles
  for (let i = projectiles.length - 1; i >= 0; i--) {
    const proj = projectiles[i];
    if (!proj.alive) { projectiles.splice(i, 1); continue; }

    const target = enemies.find(e => e.id === proj.targetId && e.alive);
    if (!target) { proj.alive = false; projectiles.splice(i, 1); continue; }

    proj.trail.push({ x: proj.x, y: proj.y });
    if (proj.trail.length > 8) proj.trail.shift();

    const angle = angleTo(proj, target);
    proj.x += Math.cos(angle) * proj.speed * gameDt;
    proj.y += Math.sin(angle) * proj.speed * gameDt;

    if (dist(proj, target) < 8) {
      proj.alive = false;
      if (proj.splashRadius) {
        addParticle({ x: target.x, y: target.y, vx: 0, vy: 0, life: 0.35, color: proj.color, size: 0, type: 'ring', ringRadius: 5, ringMaxRadius: proj.splashRadius });
        for (const enemy of enemies) {
          if (!enemy.alive) continue;
          if (dist(enemy, target) <= proj.splashRadius) {
            damageEnemy(enemy, Math.round(proj.damage * (1 - dist(enemy, target) / proj.splashRadius * 0.4)));
            if (proj.slowAmount) { enemy.slowTimer = (proj.slowDuration ?? 2000) / 1000; enemy.slowAmount = proj.slowAmount; }
          }
        }
        spawnParticleBurst(target.x, target.y, proj.color, 12, 80, 3);
      } else if (proj.slowAmount) {
        damageEnemy(target, proj.damage);
        target.slowTimer = (proj.slowDuration ?? 2000) / 1000;
        target.slowAmount = proj.slowAmount;
        spawnParticleBurst(target.x, target.y, proj.color, 8, 50, 2);
      } else {
        damageEnemy(target, proj.damage);
        spawnParticleBurst(target.x, target.y, proj.color, 6, 50, 2);
      }
      projectiles.splice(i, 1);
    }
  }

  // Arc effects
  for (let i = arcEffects.length - 1; i >= 0; i--) {
    arcEffects[i].timer -= gameDt;
    if (arcEffects[i].timer <= 0) arcEffects.splice(i, 1);
  }

  // Particles
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.life -= gameDt;
    if (p.life <= 0) { particles.splice(i, 1); continue; }
    p.x += p.vx * gameDt;
    p.y += p.vy * gameDt;
    p.vx *= 0.96;
    p.vy *= 0.96;
    if (p.type === 'ring' && p.ringRadius != null && p.ringMaxRadius != null) {
      p.ringRadius = 5 + (p.ringMaxRadius - 5) * (1 - p.life / p.maxLife);
    }
  }

  // Announcement timer
  if (state.announcement) {
    state.announcement.timer -= gameDt;
    if (state.announcement.timer <= 0) state.announcement = null;
  }

  // Floating texts
  for (let i = floatingTexts.length - 1; i >= 0; i--) {
    const ft = floatingTexts[i];
    ft.life -= gameDt * 1.5;
    ft.y += ft.vy * gameDt;
    if (ft.life <= 0) floatingTexts.splice(i, 1);
  }
}

export function resetGame(): void {
  state.score = 0;
  state.enemiesKilled = 0;
  state.speed = 1;
  startLevel(1);
}
