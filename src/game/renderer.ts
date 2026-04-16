import {
  CELL, COLS, ROWS, CANVAS_W, CANVAS_H, TOWER_TYPES,
  OVERCHARGE_COOLDOWN,
} from './config';
import { pathCells, pathWaypoints, canPlace } from './path';
import {
  state, towers, enemies, projectiles, particles,
  floatingTexts, arcEffects,
} from './engine';
import type { Enemy, Tower } from './types';

let bgCanvas: HTMLCanvasElement | null = null;

function hexPath(ctx: CanvasRenderingContext2D, x: number, y: number, r: number) {
  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i - Math.PI / 6;
    const px = x + r * Math.cos(angle);
    const py = y + r * Math.sin(angle);
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
}

function octPath(ctx: CanvasRenderingContext2D, x: number, y: number, r: number) {
  ctx.beginPath();
  for (let i = 0; i < 8; i++) {
    const angle = (Math.PI / 4) * i - Math.PI / 8;
    const px = x + r * Math.cos(angle);
    const py = y + r * Math.sin(angle);
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
}

function diamondPath(ctx: CanvasRenderingContext2D, x: number, y: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x, y - r);
  ctx.lineTo(x + r, y);
  ctx.lineTo(x, y + r);
  ctx.lineTo(x - r, y);
  ctx.closePath();
}

function buildBackground(): HTMLCanvasElement {
  const c = document.createElement('canvas');
  c.width = CANVAS_W;
  c.height = CANVAS_H;
  const bg = c.getContext('2d')!;

  bg.fillStyle = '#06060f';
  bg.fillRect(0, 0, CANVAS_W, CANVAS_H);

  // Grid dots at intersections
  bg.fillStyle = 'rgba(30, 40, 80, 0.5)';
  for (let r = 0; r <= ROWS; r++) {
    for (let col = 0; col <= COLS; col++) {
      bg.fillRect(col * CELL - 0.5, r * CELL - 0.5, 1, 1);
    }
  }

  // Grid lines
  bg.strokeStyle = 'rgba(20, 25, 50, 0.5)';
  bg.lineWidth = 0.5;
  for (let col = 0; col <= COLS; col++) {
    bg.beginPath(); bg.moveTo(col * CELL, 0); bg.lineTo(col * CELL, CANVAS_H); bg.stroke();
  }
  for (let r = 0; r <= ROWS; r++) {
    bg.beginPath(); bg.moveTo(0, r * CELL); bg.lineTo(CANVAS_W, r * CELL); bg.stroke();
  }

  // Path cells fill
  for (const key of pathCells) {
    const [col, row] = key.split(',').map(Number);
    bg.fillStyle = '#0a1428';
    bg.fillRect(col * CELL + 1, row * CELL + 1, CELL - 2, CELL - 2);
  }

  // Path inner glow
  for (const key of pathCells) {
    const [col, row] = key.split(',').map(Number);
    const cx = col * CELL + CELL / 2;
    const cy = row * CELL + CELL / 2;
    const grad = bg.createRadialGradient(cx, cy, 0, cx, cy, CELL * 0.7);
    grad.addColorStop(0, 'rgba(0, 180, 255, 0.04)');
    grad.addColorStop(1, 'rgba(0, 180, 255, 0)');
    bg.fillStyle = grad;
    bg.fillRect(col * CELL, row * CELL, CELL, CELL);
  }

  // Path borders with glow
  bg.save();
  bg.shadowColor = '#00ccff';
  bg.shadowBlur = 6;
  bg.strokeStyle = 'rgba(0, 200, 255, 0.35)';
  bg.lineWidth = 1.5;

  for (const key of pathCells) {
    const [col, row] = key.split(',').map(Number);
    const x = col * CELL;
    const y = row * CELL;
    if (!pathCells.has(`${col},${row - 1}`)) {
      bg.beginPath(); bg.moveTo(x, y); bg.lineTo(x + CELL, y); bg.stroke();
    }
    if (!pathCells.has(`${col},${row + 1}`)) {
      bg.beginPath(); bg.moveTo(x, y + CELL); bg.lineTo(x + CELL, y + CELL); bg.stroke();
    }
    if (!pathCells.has(`${col - 1},${row}`)) {
      bg.beginPath(); bg.moveTo(x, y); bg.lineTo(x, y + CELL); bg.stroke();
    }
    if (!pathCells.has(`${col + 1},${row}`)) {
      bg.beginPath(); bg.moveTo(x + CELL, y); bg.lineTo(x + CELL, y + CELL); bg.stroke();
    }
  }
  bg.restore();

  // Path direction arrows
  bg.strokeStyle = 'rgba(0, 200, 255, 0.08)';
  bg.lineWidth = 1;
  for (let i = 0; i < pathWaypoints.length - 1; i++) {
    const p1 = pathWaypoints[i];
    const p2 = pathWaypoints[i + 1];
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    const len = Math.sqrt(dx * dx + dy * dy);
    const nx = dx / len;
    const ny = dy / len;
    const steps = Math.max(1, Math.floor(len / (CELL * 1.5)));
    for (let s = 1; s <= steps; s++) {
      const t = s / (steps + 1);
      const ax = p1.x + dx * t;
      const ay = p1.y + dy * t;
      bg.beginPath();
      bg.moveTo(ax - nx * 4 - ny * 3, ay - ny * 4 + nx * 3);
      bg.lineTo(ax + nx * 4, ay + ny * 4);
      bg.lineTo(ax - nx * 4 + ny * 3, ay - ny * 4 - nx * 3);
      bg.stroke();
    }
  }

  // Start & end portals
  const startPt = pathWaypoints[0];
  const endPt = pathWaypoints[pathWaypoints.length - 1];

  // Start portal - green glow gate
  const sx = Math.max(CELL * 0.6, startPt.x);
  const sy = startPt.y;
  bg.save();
  bg.shadowColor = '#00ff66';
  bg.shadowBlur = 18;
  bg.strokeStyle = '#00ff66';
  bg.lineWidth = 2.5;
  bg.beginPath();
  bg.moveTo(sx - 2, sy - CELL * 0.6);
  bg.lineTo(sx - 2, sy + CELL * 0.6);
  bg.stroke();
  bg.lineWidth = 1;
  bg.beginPath();
  bg.moveTo(sx + 4, sy - CELL * 0.4);
  bg.lineTo(sx + 4, sy + CELL * 0.4);
  bg.stroke();
  // Glow fill
  const sgr = bg.createRadialGradient(sx, sy, 0, sx, sy, CELL * 0.7);
  sgr.addColorStop(0, 'rgba(0, 255, 102, 0.12)');
  sgr.addColorStop(1, 'rgba(0, 255, 102, 0)');
  bg.fillStyle = sgr;
  bg.fillRect(sx - CELL * 0.7, sy - CELL * 0.7, CELL * 1.4, CELL * 1.4);
  bg.restore();

  // End portal - red glow gate
  const ex = Math.min(CANVAS_W - CELL * 0.6, endPt.x);
  const ey = endPt.y;
  bg.save();
  bg.shadowColor = '#ff0044';
  bg.shadowBlur = 18;
  bg.strokeStyle = '#ff0044';
  bg.lineWidth = 2.5;
  bg.beginPath();
  bg.moveTo(ex + 2, ey - CELL * 0.6);
  bg.lineTo(ex + 2, ey + CELL * 0.6);
  bg.stroke();
  bg.lineWidth = 1;
  bg.beginPath();
  bg.moveTo(ex - 4, ey - CELL * 0.4);
  bg.lineTo(ex - 4, ey + CELL * 0.4);
  bg.stroke();
  const egr = bg.createRadialGradient(ex, ey, 0, ex, ey, CELL * 0.7);
  egr.addColorStop(0, 'rgba(255, 0, 68, 0.12)');
  egr.addColorStop(1, 'rgba(255, 0, 68, 0)');
  bg.fillStyle = egr;
  bg.fillRect(ex - CELL * 0.7, ey - CELL * 0.7, CELL * 1.4, CELL * 1.4);
  bg.restore();

  // Vignette
  const vigGrad = bg.createRadialGradient(
    CANVAS_W / 2, CANVAS_H / 2, CANVAS_W * 0.3,
    CANVAS_W / 2, CANVAS_H / 2, CANVAS_W * 0.7
  );
  vigGrad.addColorStop(0, 'rgba(0,0,0,0)');
  vigGrad.addColorStop(1, 'rgba(0,0,0,0.35)');
  bg.fillStyle = vigGrad;
  bg.fillRect(0, 0, CANVAS_W, CANVAS_H);

  return c;
}

function drawTower(ctx: CanvasRenderingContext2D, tower: Tower, time: number) {
  const { x, y, type, level, rotation, pulseAnim, overchargeTime } = tower;
  const isFusion = !!type.fusion;
  const isOC = overchargeTime > 0;
  const isCooldown = overchargeTime < 0;
  // Tower grows with level
  const levelScale = 1 + level * 0.08;
  const baseR = isFusion ? CELL * 0.42 : CELL * 0.38;
  const r = baseR * levelScale;
  const isSelected = state.selectedTower === tower;
  const glowIntensity = 8 + level * 4;
  const borderWidth = 1.5 + level * 0.5;

  ctx.save();

  if (isCooldown) ctx.globalAlpha = 0.45;

  // Range indicator
  if (isSelected) {
    const range = type.levels[level].range * CELL;
    ctx.beginPath();
    ctx.arc(x, y, range, 0, Math.PI * 2);
    ctx.fillStyle = `${type.color}10`;
    ctx.fill();
    ctx.strokeStyle = `${type.color}30`;
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    ctx.stroke();
    ctx.setLineDash([]);
  }

  // Level 2+ ambient glow ring
  if (level >= 1) {
    ctx.save();
    ctx.globalAlpha = 0.08 + level * 0.06;
    ctx.shadowColor = type.color;
    ctx.shadowBlur = 15 + level * 5;
    ctx.beginPath();
    ctx.arc(x, y, r + 3 + level * 2, 0, Math.PI * 2);
    ctx.fillStyle = type.color;
    ctx.fill();
    ctx.restore();
  }

  // Level 3 orbiting particles
  if (level >= 2) {
    ctx.save();
    ctx.globalAlpha = 0.6;
    ctx.fillStyle = type.color;
    const orbitR = r + 6;
    for (let i = 0; i < 3; i++) {
      const a = time * 0.003 + (Math.PI * 2 * i) / 3;
      ctx.beginPath();
      ctx.arc(x + Math.cos(a) * orbitR, y + Math.sin(a) * orbitR, 1.5, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  // Overcharge glow
  if (isOC) {
    ctx.save();
    const pulse = 0.6 + 0.4 * Math.sin(time * 0.012);
    ctx.globalAlpha = pulse;
    ctx.shadowColor = '#ffffff';
    ctx.shadowBlur = 25;
    ctx.beginPath();
    ctx.arc(x, y, r + 8, 0, Math.PI * 2);
    ctx.fillStyle = `${type.color}66`;
    ctx.fill();
    ctx.restore();
  }

  // Fire pulse
  if (pulseAnim > 0) {
    ctx.save();
    ctx.globalAlpha = pulseAnim * (isCooldown ? 0.45 : 1);
    ctx.shadowColor = type.color;
    ctx.shadowBlur = 20;
    ctx.beginPath();
    ctx.arc(x, y, r + 6, 0, Math.PI * 2);
    ctx.fillStyle = `${type.color}44`;
    ctx.fill();
    ctx.restore();
  }

  // Base shape
  ctx.shadowColor = isOC ? '#ffffff' : type.color;
  ctx.shadowBlur = isOC ? 14 : glowIntensity;

  if (isFusion) {
    // Fusion outer hex
    hexPath(ctx, x, y, r);
    ctx.fillStyle = type.colorDark;
    ctx.fill();
    ctx.strokeStyle = type.color;
    ctx.lineWidth = borderWidth;
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Level 2+ fusion: double border
    if (level >= 1) {
      hexPath(ctx, x, y, r * 0.85);
      ctx.strokeStyle = `${type.color}30`;
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    // Inner rotating ring
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(time * 0.001);
    hexPath(ctx, 0, 0, r * 0.6);
    ctx.strokeStyle = `${type.color}${level >= 2 ? '80' : '50'}`;
    ctx.lineWidth = level >= 2 ? 1.5 : 1;
    ctx.stroke();
    ctx.restore();

    // Level 3 fusion: second counter-rotating ring
    if (level >= 2) {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(-time * 0.0015);
      hexPath(ctx, 0, 0, r * 0.45);
      ctx.strokeStyle = `${type.color}40`;
      ctx.lineWidth = 0.8;
      ctx.stroke();
      ctx.restore();
    }

    // Center diamond + barrel
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rotation);
    const dSize = r * (0.3 + level * 0.04);
    diamondPath(ctx, 0, 0, dSize);
    ctx.fillStyle = type.color;
    ctx.fill();
    const barrelW = 5 + level * 1.5;
    ctx.fillRect(r * 0.2, -barrelW / 2, r * 0.7, barrelW);
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(r * 0.85, 0, 2 + level * 0.5, 0, Math.PI * 2);
    ctx.fill();
    // Level 2+ muzzle flare shape
    if (level >= 1) {
      ctx.fillStyle = `${type.color}60`;
      ctx.beginPath();
      ctx.moveTo(r * 0.9, -3 - level);
      ctx.lineTo(r * 1.05, 0);
      ctx.lineTo(r * 0.9, 3 + level);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();

    // Level pips
    for (let i = 0; i <= level; i++) {
      ctx.fillStyle = type.color;
      ctx.beginPath();
      ctx.arc(x - 6 + i * 6, y + r + 6, 2, 0, Math.PI * 2);
      ctx.fill();
    }
  } else {
    // ---- NORMAL TOWERS (level-dependent visuals) ----

    // Outer hex
    hexPath(ctx, x, y, r);
    ctx.fillStyle = type.colorDark;
    ctx.fill();
    ctx.strokeStyle = type.color;
    ctx.lineWidth = borderWidth;
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Level 2+: second inner hex ring
    if (level >= 1) {
      hexPath(ctx, x, y, r * 0.78);
      ctx.strokeStyle = `${type.color}25`;
      ctx.lineWidth = 0.8;
      ctx.stroke();
    }

    // Inner detail hex
    hexPath(ctx, x, y, r * 0.55);
    ctx.fillStyle = `${type.color}${level >= 2 ? '25' : '15'}`;
    ctx.fill();
    ctx.strokeStyle = `${type.color}${level >= 1 ? '60' : '40'}`;
    ctx.lineWidth = 0.5 + level * 0.3;
    ctx.stroke();

    // Level 3: core glow
    if (level >= 2) {
      const grad = ctx.createRadialGradient(x, y, 0, x, y, r * 0.4);
      grad.addColorStop(0, `${type.color}20`);
      grad.addColorStop(1, `${type.color}00`);
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(x, y, r * 0.4, 0, Math.PI * 2);
      ctx.fill();
    }

    // Turret - scales with level
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rotation);
    ctx.fillStyle = type.color;

    if (type.id === 'arc') {
      // Lightning bolt - bigger at higher levels
      const w = 3 + level * 1.5;
      ctx.beginPath();
      ctx.moveTo(r * 0.1, -w);
      ctx.lineTo(r * 0.85, -w * 0.3);
      ctx.lineTo(r * 0.4, 0);
      ctx.lineTo(r * 0.85, w * 0.3);
      ctx.lineTo(r * 0.1, w);
      ctx.lineTo(r * 0.3, 0);
      ctx.closePath();
      ctx.fill();
      // Level 2+: secondary prongs
      if (level >= 1) {
        ctx.fillStyle = `${type.color}88`;
        ctx.fillRect(r * 0.3, -w - 1.5, r * 0.3, 1.5);
        ctx.fillRect(r * 0.3, w, r * 0.3, 1.5);
      }
    } else if (type.id === 'nova') {
      // Double barrel - wider at higher levels
      const bw = 2.5 + level * 0.8;
      const gap = 1.5 + level * 0.5;
      ctx.fillRect(r * 0.15, -(gap + bw), r * 0.7, bw);
      ctx.fillRect(r * 0.15, gap, r * 0.7, bw);
      // Level 2+: center rail
      if (level >= 1) {
        ctx.fillStyle = `${type.color}66`;
        ctx.fillRect(r * 0.25, -1, r * 0.55, 2);
      }
      // Level 3: muzzle caps
      if (level >= 2) {
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(r * 0.85, -(gap + bw / 2), 1.5, 0, Math.PI * 2);
        ctx.arc(r * 0.85, gap + bw / 2, 1.5, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (type.id === 'cryo') {
      // Crystal - more facets at higher levels
      const w = 4 + level * 1.5;
      ctx.beginPath();
      ctx.moveTo(r * 0.85, 0);
      ctx.lineTo(r * 0.3, -w);
      ctx.lineTo(r * 0.15, 0);
      ctx.lineTo(r * 0.3, w);
      ctx.closePath();
      ctx.fill();
      // Level 2+: side crystals
      if (level >= 1) {
        ctx.fillStyle = `${type.color}77`;
        ctx.beginPath();
        ctx.moveTo(r * 0.65, -w * 0.3);
        ctx.lineTo(r * 0.45, -w - 2);
        ctx.lineTo(r * 0.25, -w * 0.3);
        ctx.closePath();
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(r * 0.65, w * 0.3);
        ctx.lineTo(r * 0.45, w + 2);
        ctx.lineTo(r * 0.25, w * 0.3);
        ctx.closePath();
        ctx.fill();
      }
    } else {
      // Pulse - single barrel, thicker at higher levels
      const bw = 4 + level * 2;
      ctx.fillRect(r * 0.15, -bw / 2, r * 0.75, bw);
      ctx.fillStyle = '#ffffff';
      const tipR = 1.5 + level * 0.8;
      ctx.beginPath();
      ctx.arc(r * 0.85, 0, tipR, 0, Math.PI * 2);
      ctx.fill();
      // Level 2+: heat vents
      if (level >= 1) {
        ctx.fillStyle = `${type.color}55`;
        ctx.fillRect(r * 0.3, -bw / 2 - 2, r * 0.15, 2);
        ctx.fillRect(r * 0.5, -bw / 2 - 2, r * 0.15, 2);
        ctx.fillRect(r * 0.3, bw / 2, r * 0.15, 2);
        ctx.fillRect(r * 0.5, bw / 2, r * 0.15, 2);
      }
    }
    ctx.restore();

    // Level pips
    for (let i = 0; i <= level; i++) {
      ctx.fillStyle = type.color;
      ctx.beginPath();
      ctx.arc(x - 6 + i * 6, y + r + 5, 2, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Cooldown arc indicator
  if (isCooldown) {
    ctx.globalAlpha = 1;
    const cooldownProgress = -overchargeTime / OVERCHARGE_COOLDOWN;
    ctx.strokeStyle = '#ff444488';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(x, y, r + 4, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * (1 - cooldownProgress));
    ctx.stroke();
    // Recovering arc
    ctx.strokeStyle = type.color + '88';
    ctx.beginPath();
    ctx.arc(x, y, r + 4, -Math.PI / 2 + Math.PI * 2 * (1 - cooldownProgress), -Math.PI / 2 + Math.PI * 2);
    ctx.stroke();
  }

  ctx.restore();
}

function starPath(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, points: number = 5) {
  ctx.beginPath();
  for (let i = 0; i < points * 2; i++) {
    const angle = (Math.PI * i) / points - Math.PI / 2;
    const rad = i % 2 === 0 ? r : r * 0.45;
    const px = x + rad * Math.cos(angle);
    const py = y + rad * Math.sin(angle);
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
}

function crossPath(ctx: CanvasRenderingContext2D, x: number, y: number, r: number) {
  const w = r * 0.4;
  ctx.beginPath();
  ctx.moveTo(x - w, y - r);
  ctx.lineTo(x + w, y - r);
  ctx.lineTo(x + w, y - w);
  ctx.lineTo(x + r, y - w);
  ctx.lineTo(x + r, y + w);
  ctx.lineTo(x + w, y + w);
  ctx.lineTo(x + w, y + r);
  ctx.lineTo(x - w, y + r);
  ctx.lineTo(x - w, y + w);
  ctx.lineTo(x - r, y + w);
  ctx.lineTo(x - r, y - w);
  ctx.lineTo(x - w, y - w);
  ctx.closePath();
}

function drawEnemy(ctx: CanvasRenderingContext2D, enemy: Enemy, time: number) {
  const { x, y, type, hp, maxHp, hitFlash, angle } = enemy;
  // Scale size slightly with HP (late-game enemies feel bigger)
  const hpScale = Math.min(1.4, 1 + Math.log2(Math.max(1, maxHp / (type.hp || 1))) * 0.08);
  const s = type.size * hpScale;
  const isBoss = type.id === 'boss';
  // Boss tier based on max HP: <1500 = tier 0, <3000 = tier 1, <5000 = tier 2, else tier 3
  const bossTier = isBoss ? (maxHp < 1500 ? 0 : maxHp < 3000 ? 1 : maxHp < 5000 ? 2 : 3) : 0;

  ctx.save();

  // Phased enemies are translucent
  if (enemy.phased) {
    ctx.globalAlpha = 0.25 + 0.1 * Math.sin(time * 0.008);
  }

  // Boss pulsing aura
  if (isBoss) {
    ctx.save();
    const pulseA = 0.12 + bossTier * 0.06 + 0.06 * Math.sin(time * 0.003);
    ctx.globalAlpha = pulseA;
    ctx.shadowColor = type.color;
    ctx.shadowBlur = 20 + bossTier * 8;
    ctx.beginPath();
    ctx.arc(x, y, s + 6 + bossTier * 3, 0, Math.PI * 2);
    ctx.fillStyle = type.color;
    ctx.fill();
    ctx.restore();

    // Boss orbiting shards (tier 1+)
    if (bossTier >= 1) {
      ctx.save();
      ctx.globalAlpha = 0.7;
      ctx.fillStyle = type.color;
      const shardCount = 2 + bossTier;
      const orbitR = s + 5 + bossTier * 2;
      for (let i = 0; i < shardCount; i++) {
        const a = time * 0.004 + (Math.PI * 2 * i) / shardCount;
        const sx = x + Math.cos(a) * orbitR;
        const sy = y + Math.sin(a) * orbitR;
        ctx.beginPath();
        ctx.moveTo(sx, sy - 2);
        ctx.lineTo(sx + 1.5, sy);
        ctx.lineTo(sx, sy + 2);
        ctx.lineTo(sx - 1.5, sy);
        ctx.closePath();
        ctx.fill();
      }
      ctx.restore();
    }
  }

  const fillColor = hitFlash > 0 ? '#ffffff' : type.color;
  ctx.shadowColor = hitFlash > 0 ? '#ffffff' : type.color;
  ctx.shadowBlur = hitFlash > 0 ? 12 : (isBoss ? 10 + bossTier * 4 : 6);
  ctx.fillStyle = fillColor;
  ctx.strokeStyle = type.color;
  ctx.lineWidth = isBoss ? 1.5 + bossTier * 0.5 : 1;

  switch (type.shape) {
    case 'triangle':
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(angle);
      ctx.beginPath();
      ctx.moveTo(s, 0);
      ctx.lineTo(-s * 0.6, -s * 0.7);
      ctx.lineTo(-s * 0.6, s * 0.7);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.restore();
      break;
    case 'diamond':
      diamondPath(ctx, x, y, s);
      ctx.fill();
      ctx.stroke();
      break;
    case 'hexagon':
      hexPath(ctx, x, y, s);
      ctx.fill();
      ctx.stroke();
      // Guardian shield aura ring
      if (type.ability === 'shield') {
        ctx.save();
        ctx.globalAlpha = 0.3 + 0.1 * Math.sin(time * 0.004);
        ctx.strokeStyle = '#ffcc44';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([3, 3]);
        ctx.beginPath();
        ctx.arc(x, y, CELL * 3, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.restore();
      }
      break;
    case 'octagon': {
      // Boss drawing - scales with tier
      octPath(ctx, x, y, s);
      ctx.fill();
      ctx.stroke();

      // Inner ring
      ctx.beginPath();
      ctx.arc(x, y, s * 0.55, 0, Math.PI * 2);
      ctx.strokeStyle = `${type.color}88`;
      ctx.lineWidth = 1;
      ctx.stroke();

      // Tier 1+: second inner octagon
      if (bossTier >= 1) {
        ctx.shadowBlur = 0;
        octPath(ctx, x, y, s * 0.7);
        ctx.strokeStyle = `${type.color}44`;
        ctx.lineWidth = 0.8;
        ctx.stroke();
      }

      // Tier 2+: inner cross pattern
      if (bossTier >= 2) {
        ctx.strokeStyle = `${type.color}55`;
        ctx.lineWidth = 1;
        for (let i = 0; i < 4; i++) {
          const a = (Math.PI / 2) * i + Math.PI / 4;
          ctx.beginPath();
          ctx.moveTo(x + Math.cos(a) * s * 0.2, y + Math.sin(a) * s * 0.2);
          ctx.lineTo(x + Math.cos(a) * s * 0.65, y + Math.sin(a) * s * 0.65);
          ctx.stroke();
        }
      }

      // Tier 3: rotating outer ring
      if (bossTier >= 3) {
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(time * 0.002);
        octPath(ctx, 0, 0, s * 1.15);
        ctx.strokeStyle = `${type.color}30`;
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.restore();
      }

      // Core dot - brighter at higher tiers
      ctx.fillStyle = hitFlash > 0 ? '#ffffff' : `${type.color}`;
      ctx.shadowColor = type.color;
      ctx.shadowBlur = 4 + bossTier * 3;
      ctx.beginPath();
      ctx.arc(x, y, 2 + bossTier, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case 'star':
      starPath(ctx, x, y, s);
      ctx.fill();
      ctx.stroke();
      break;
    case 'cross':
      crossPath(ctx, x, y, s);
      ctx.fill();
      ctx.stroke();
      break;
    default:
      ctx.beginPath();
      ctx.arc(x, y, s, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
  }

  // Ability indicators
  ctx.shadowBlur = 0;

  // Shield bar (above health bar)
  if (enemy.shieldMax > 0 && enemy.shieldHp > 0) {
    ctx.globalAlpha = enemy.phased ? 0.3 : 0.8;
    const barW = Math.max(s * 2.5, 16);
    const barH = 2;
    const bx = x - barW / 2;
    const by = y - s - 12;
    ctx.fillStyle = '#332200';
    ctx.fillRect(bx, by, barW, barH);
    ctx.fillStyle = '#ffcc44';
    ctx.fillRect(bx, by, barW * (enemy.shieldHp / enemy.shieldMax), barH);
    ctx.globalAlpha = enemy.phased ? 0.25 : 1;
  }

  // Sprint indicator
  if (enemy.sprintTriggered) {
    ctx.globalAlpha = 0.4;
    ctx.strokeStyle = enemy.type.color;
    ctx.lineWidth = 1;
    for (let t = 1; t <= 3; t++) {
      ctx.beginPath();
      ctx.arc(x - Math.cos(angle) * t * 5, y - Math.sin(angle) * t * 5, 2, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.globalAlpha = enemy.phased ? 0.25 : 1;
  }

  // Slow indicator
  if (enemy.slowTimer > 0) {
    ctx.globalAlpha = 0.5;
    ctx.strokeStyle = '#4488ff';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(x, y, s + 3, 0, Math.PI * 2);
    ctx.stroke();
    ctx.globalAlpha = enemy.phased ? 0.25 : 1;
  }

  // Health bar
  if (hp < maxHp) {
    const barW = Math.max(s * 2.5, 16);
    const barH = 3;
    const bx = x - barW / 2;
    const by = y - s - 8;
    ctx.fillStyle = '#1a0000';
    ctx.fillRect(bx, by, barW, barH);
    const ratio = hp / maxHp;
    ctx.fillStyle = ratio > 0.5 ? type.color : ratio > 0.25 ? '#ff8800' : '#ff0000';
    ctx.fillRect(bx, by, barW * ratio, barH);
    ctx.strokeStyle = 'rgba(255,255,255,0.15)';
    ctx.lineWidth = 0.5;
    ctx.strokeRect(bx, by, barW, barH);
  }

  ctx.restore();
}

function drawLightning(
  ctx: CanvasRenderingContext2D,
  x1: number, y1: number, x2: number, y2: number,
  color: string, alpha: number
) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.sqrt(dx * dx + dy * dy);
  if (len < 1) return;
  const segments = Math.max(3, Math.floor(len / 15));
  const nx = -dy / len;
  const ny = dx / len;

  ctx.save();
  ctx.globalAlpha = alpha;

  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.shadowColor = color;
  ctx.shadowBlur = 10;
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  for (let s = 1; s < segments; s++) {
    const t = s / segments;
    ctx.lineTo(
      x1 + dx * t + nx * (Math.random() - 0.5) * 16,
      y1 + dy * t + ny * (Math.random() - 0.5) * 16,
    );
  }
  ctx.lineTo(x2, y2);
  ctx.stroke();

  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 0.8;
  ctx.shadowBlur = 4;
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  for (let s = 1; s < segments; s++) {
    const t = s / segments;
    ctx.lineTo(
      x1 + dx * t + nx * (Math.random() - 0.5) * 8,
      y1 + dy * t + ny * (Math.random() - 0.5) * 8,
    );
  }
  ctx.lineTo(x2, y2);
  ctx.stroke();

  ctx.restore();
}

export function invalidateBackground() {
  bgCanvas = null;
}

export function render(ctx: CanvasRenderingContext2D, _time: number): void {
  ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);

  if (!bgCanvas) bgCanvas = buildBackground();
  ctx.drawImage(bgCanvas, 0, 0);

  // Placement ghost & range preview
  if (state.selectedTowerType && state.mouseGrid) {
    const mc = state.mouseGrid.x;
    const mr = state.mouseGrid.y;
    if (mc >= 0 && mc < COLS && mr >= 0 && mr < ROWS) {
      const gx = mc * CELL + CELL / 2;
      const gy = mr * CELL + CELL / 2;
      const ok = canPlace(mc, mr);
      const type = TOWER_TYPES[state.selectedTowerType];

      if (type) {
        // Range circle
        const range = type.levels[0].range * CELL;
        ctx.save();
        ctx.beginPath();
        ctx.arc(gx, gy, range, 0, Math.PI * 2);
        ctx.fillStyle = ok ? `${type.color}08` : 'rgba(255,0,68,0.05)';
        ctx.fill();
        ctx.strokeStyle = ok ? `${type.color}25` : 'rgba(255,0,68,0.2)';
        ctx.lineWidth = 1;
        ctx.setLineDash([3, 3]);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.restore();
      }

      ctx.save();
      ctx.globalAlpha = 0.5;
      hexPath(ctx, gx, gy, CELL * 0.38);
      ctx.fillStyle = ok ? '#00ff8818' : '#ff004418';
      ctx.fill();
      ctx.strokeStyle = ok ? '#00ff88' : '#ff0044';
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.restore();
    }
  }

  for (const tower of towers) drawTower(ctx, tower, _time);
  for (const enemy of enemies) drawEnemy(ctx, enemy, _time);

  // Projectiles
  for (const proj of projectiles) {
    ctx.save();
    if (proj.trail.length > 1) {
      for (let i = 1; i < proj.trail.length; i++) {
        ctx.globalAlpha = 0.15 * (i / proj.trail.length);
        ctx.strokeStyle = proj.color;
        ctx.lineWidth = proj.type === 'nova' ? 3 : 1.5;
        ctx.beginPath();
        ctx.moveTo(proj.trail[i - 1].x, proj.trail[i - 1].y);
        ctx.lineTo(proj.trail[i].x, proj.trail[i].y);
        ctx.stroke();
      }
    }
    ctx.globalAlpha = 1;
    ctx.shadowColor = proj.color;
    ctx.shadowBlur = proj.type === 'nova' ? 12 : 6;
    ctx.fillStyle = proj.color;
    const size = proj.type === 'nova' ? 5 : proj.type === 'cryo' ? 3.5 : 3;
    ctx.beginPath();
    ctx.arc(proj.x, proj.y, size, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(proj.x, proj.y, size * 0.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // Arc lightning
  for (const arc of arcEffects) {
    const alpha = arc.timer / arc.maxTimer;
    for (let i = 0; i < arc.targets.length - 1; i++) {
      drawLightning(
        ctx,
        arc.targets[i].x, arc.targets[i].y,
        arc.targets[i + 1].x, arc.targets[i + 1].y,
        arc.color, alpha,
      );
    }
  }

  // Particles
  for (const p of particles) {
    const alpha = p.life / p.maxLife;
    ctx.save();
    ctx.globalAlpha = alpha;
    if (p.type === 'ring') {
      ctx.strokeStyle = p.color;
      ctx.lineWidth = 2;
      ctx.shadowColor = p.color;
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.ringRadius ?? 5, 0, Math.PI * 2);
      ctx.stroke();
    } else {
      ctx.fillStyle = p.color;
      ctx.shadowColor = p.color;
      ctx.shadowBlur = 4;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * alpha, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  // Floating texts
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  for (const ft of floatingTexts) {
    ctx.save();
    ctx.globalAlpha = ft.life;
    ctx.fillStyle = ft.color;
    ctx.shadowColor = ft.color;
    ctx.shadowBlur = 4;
    ctx.font = 'bold 13px "Share Tech Mono", monospace';
    ctx.fillText(ft.text, ft.x, ft.y);
    ctx.restore();
  }

  // ---- WAVE ANNOUNCEMENT ----
  const ann = state.announcement;
  if (ann) {
    const maxT = 2.5;
    const t = 1 - ann.timer / maxT; // 0 -> 1
    const cx = CANVAS_W / 2;
    const cy = CANVAS_H / 2;

    // Phase: 0-0.3 slide in, 0.3-0.7 hold, 0.7-1.0 fade out
    let alpha: number;
    let slideX: number;
    if (t < 0.15) {
      // Slam in from left
      const p = t / 0.15;
      alpha = p;
      slideX = (1 - p * p) * -200;
    } else if (t < 0.7) {
      alpha = 1;
      slideX = 0;
    } else {
      const p = (t - 0.7) / 0.3;
      alpha = 1 - p;
      slideX = 0;
    }

    ctx.save();
    ctx.globalAlpha = alpha;

    // Full-width dark band
    const bandH = 80;
    const bandY = cy - bandH / 2;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, bandY, CANVAS_W, bandH);

    // Scan line accent at top and bottom of band
    const isBoss = ann.name === ann.name.toUpperCase();
    const accentColor = isBoss ? '#ff0044' : '#00ffff';
    ctx.shadowColor = accentColor;
    ctx.shadowBlur = 8;
    ctx.fillStyle = accentColor;
    ctx.fillRect(0, bandY, CANVAS_W, 1.5);
    ctx.fillRect(0, bandY + bandH - 1.5, CANVAS_W, 1.5);

    // Glitch offset for boss waves
    const glitchX = isBoss ? (Math.random() - 0.5) * 4 * alpha : 0;
    const glitchY = isBoss ? (Math.random() - 0.5) * 2 * alpha : 0;

    // Wave number
    ctx.shadowBlur = 0;
    ctx.fillStyle = `${accentColor}88`;
    ctx.font = '600 11px "Orbitron", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.letterSpacing = '4px';
    ctx.fillText(
      `WAVE ${ann.wave}`,
      cx + slideX + glitchX, cy - 18 + glitchY,
    );

    // Wave name - big and dramatic
    ctx.shadowColor = accentColor;
    ctx.shadowBlur = isBoss ? 20 : 10;
    ctx.fillStyle = isBoss ? '#ff0044' : '#ffffff';
    ctx.font = `900 ${isBoss ? 28 : 24}px "Orbitron", sans-serif`;
    ctx.fillText(
      ann.name,
      cx + slideX + glitchX * 2, cy + 10 + glitchY,
    );

    // Boss waves: extra red glow flash
    if (isBoss && t < 0.3) {
      ctx.globalAlpha = alpha * 0.15 * (1 - t / 0.3);
      ctx.fillStyle = '#ff0044';
      ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
    }

    ctx.restore();
  }

  // ---- COUNTDOWN OVERLAY ----
  if (state.phase === 'waiting' && state.levelWave > 0 && state.levelWave < state.levelWavesTotal && state.waveCountdown > 0) {
    const cd = state.waveCountdown;
    const maxCd = 5;
    const progress = 1 - cd / maxCd; // 0 at start, 1 when about to fire

    // Size grows from 28 to 64 as countdown approaches 0
    const fontSize = 28 + progress * 36;
    // Opacity grows from 0.2 to 1
    const baseAlpha = 0.2 + progress * 0.8;
    // Glow grows
    const glowSize = 6 + progress * 20;
    // Color shifts from cyan to red-ish in last second
    const isUrgent = cd <= 1.5;
    const color = isUrgent ? '#ff4444' : '#00ffff';

    ctx.save();
    ctx.globalAlpha = baseAlpha;
    ctx.fillStyle = color;
    ctx.shadowColor = color;
    ctx.shadowBlur = glowSize;
    ctx.font = `900 ${Math.round(fontSize)}px "Orbitron", sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(String(Math.ceil(cd)), CANVAS_W / 2, CANVAS_H / 2);

    // Expanding ring pulse on each second tick
    const frac = cd - Math.floor(cd);
    if (frac > 0.8) {
      const ringProgress = (1 - frac) / 0.2; // 0 to 1 within the tick
      ctx.globalAlpha = (1 - ringProgress) * 0.3;
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(CANVAS_W / 2, CANVAS_H / 2, fontSize * 0.6 + ringProgress * 40, 0, Math.PI * 2);
      ctx.stroke();
    }

    ctx.restore();
  }
}
