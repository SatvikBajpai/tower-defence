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
  const r = isFusion ? CELL * 0.42 : CELL * 0.38;
  const isSelected = state.selectedTower === tower;

  ctx.save();

  // Dim during cooldown
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
  ctx.shadowBlur = isOC ? 14 : 8;

  if (isFusion) {
    // Fusion towers: double hex with inner star
    hexPath(ctx, x, y, r);
    ctx.fillStyle = type.colorDark;
    ctx.fill();
    ctx.strokeStyle = type.color;
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Inner rotating ring
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(time * 0.001);
    hexPath(ctx, 0, 0, r * 0.6);
    ctx.strokeStyle = `${type.color}50`;
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.restore();

    // Center diamond
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rotation);
    diamondPath(ctx, 0, 0, r * 0.3);
    ctx.fillStyle = type.color;
    ctx.fill();
    // Barrel
    ctx.fillRect(r * 0.2, -2.5, r * 0.7, 5);
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(r * 0.85, 0, 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Fusion label
    ctx.save();
    ctx.fillStyle = type.color;
    ctx.beginPath();
    ctx.arc(x, y + r + 5, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  } else {
    // Normal tower
    hexPath(ctx, x, y, r);
    ctx.fillStyle = type.colorDark;
    ctx.fill();
    ctx.strokeStyle = type.color;
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.shadowBlur = 0;

    hexPath(ctx, x, y, r * 0.55);
    ctx.fillStyle = `${type.color}15`;
    ctx.fill();
    ctx.strokeStyle = `${type.color}40`;
    ctx.lineWidth = 0.5;
    ctx.stroke();

    // Turret
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rotation);
    ctx.fillStyle = type.color;

    if (type.id === 'arc') {
      ctx.beginPath();
      ctx.moveTo(r * 0.1, -3);
      ctx.lineTo(r * 0.8, -1);
      ctx.lineTo(r * 0.4, 0);
      ctx.lineTo(r * 0.8, 1);
      ctx.lineTo(r * 0.1, 3);
      ctx.lineTo(r * 0.3, 0);
      ctx.closePath();
      ctx.fill();
    } else if (type.id === 'nova') {
      ctx.fillRect(r * 0.15, -4, r * 0.7, 2.5);
      ctx.fillRect(r * 0.15, 1.5, r * 0.7, 2.5);
    } else if (type.id === 'cryo') {
      ctx.beginPath();
      ctx.moveTo(r * 0.8, 0);
      ctx.lineTo(r * 0.3, -4);
      ctx.lineTo(r * 0.15, 0);
      ctx.lineTo(r * 0.3, 4);
      ctx.closePath();
      ctx.fill();
    } else {
      ctx.fillRect(r * 0.15, -2, r * 0.75, 4);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(r * 0.8, -1.5, 3, 3);
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

function drawEnemy(ctx: CanvasRenderingContext2D, enemy: Enemy) {
  const { x, y, type, hp, maxHp, hitFlash, angle } = enemy;
  const s = type.size;
  const fillColor = hitFlash > 0 ? '#ffffff' : type.color;

  ctx.save();
  ctx.shadowColor = hitFlash > 0 ? '#ffffff' : type.color;
  ctx.shadowBlur = hitFlash > 0 ? 12 : 6;

  ctx.fillStyle = fillColor;
  ctx.strokeStyle = type.color;
  ctx.lineWidth = 1;

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
      break;
    case 'octagon':
      octPath(ctx, x, y, s);
      ctx.fill();
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(x, y, s * 0.5, 0, Math.PI * 2);
      ctx.strokeStyle = `${type.color}88`;
      ctx.stroke();
      break;
    default:
      ctx.beginPath();
      ctx.arc(x, y, s, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
  }

  if (enemy.slowTimer > 0) {
    ctx.globalAlpha = 0.5;
    ctx.strokeStyle = '#4488ff';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(x, y, s + 3, 0, Math.PI * 2);
    ctx.stroke();
    ctx.globalAlpha = 1;
  }

  ctx.shadowBlur = 0;

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
  for (const enemy of enemies) drawEnemy(ctx, enemy);

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
}
