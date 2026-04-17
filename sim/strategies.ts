// Strategy library: 10+ distinct policies the simulator tests.
import type { Policy, Action, Context, Spot } from './framework';
import { TOWER_TYPES } from '../src/game/config';

function cost(type: string): number {
  return TOWER_TYPES[type]?.cost ?? Infinity;
}

function nextUpgradeCost(ctx: Context, towerIdx: number): number {
  const t = ctx.towers[towerIdx];
  if (!t) return Infinity;
  const next = t.type.levels[t.level + 1];
  if (!next) return Infinity;
  return next.upgradeCost ?? t.type.cost;
}

function occupiedKey(col: number, row: number, placed: Action[]): boolean {
  return placed.some(a => a.kind === 'place' && a.col === col && a.row === row);
}

function isPlaced(ctx: Context, col: number, row: number, planned: Action[]): boolean {
  return ctx.towers.some(t => t.col === col && t.row === row) || occupiedKey(col, row, planned);
}

// Returns spots that are at least `minDist` from any existing or planned placement.
// This simulates a human's tendency to spread rather than cluster.
function freeSpots(ctx: Context, planned: Action[], limit = 20, minDist = 3): Spot[] {
  const existing: { col: number; row: number }[] = [];
  for (const t of ctx.towers) existing.push({ col: t.col, row: t.row });
  for (const a of planned) {
    if (a.kind === 'place') existing.push({ col: a.col, row: a.row });
  }

  const out: Spot[] = [];
  for (const s of ctx.spots) {
    if (isPlaced(ctx, s.col, s.row, planned)) continue;
    let ok = true;
    for (const e of existing) {
      const dc = s.col - e.col;
      const dr = s.row - e.row;
      if (dc * dc + dr * dr < minDist * minDist) { ok = false; break; }
    }
    if (!ok) continue;
    out.push(s);
    if (out.length >= limit) break;
  }
  return out;
}

// Greedy buy: use all available gold on a target type, filling best spots.
// Re-queries freeSpots each iteration so spread constraints apply across planned placements.
function buyMany(type: string, gold: number, ctx: Context, planned: Action[]): Action[] {
  const out: Action[] = [];
  const c = cost(type);
  let g = gold;
  const allPlanned = [...planned];
  while (g >= c) {
    const spots = freeSpots(ctx, allPlanned, 1);
    if (spots.length === 0) break;
    const s = spots[0];
    const action: Action = { kind: 'place', type, col: s.col, row: s.row };
    out.push(action);
    allPlanned.push(action);
    g -= c;
  }
  return out;
}

// Upgrade the cheapest-to-upgrade tower of a given type.
function upgradeAvailable(type: string | null, gold: number, ctx: Context, planned: Action[]): Action | null {
  let cheapest = -1;
  let cheapCost = Infinity;
  for (let i = 0; i < ctx.towers.length; i++) {
    const t = ctx.towers[i];
    if (type && t.type.id !== type) continue;
    if (t.type.fusion && t.level >= t.type.levels.length - 1) continue;
    if (t.level >= t.type.levels.length - 1) continue;
    const c = nextUpgradeCost(ctx, i);
    if (c < cheapCost && c <= gold) {
      cheapCost = c;
      cheapest = i;
    }
  }
  if (cheapest < 0) return null;
  return { kind: 'upgrade', towerIdx: cheapest };
}

export const STRATEGIES: Policy[] = [
  {
    name: 'Pulse Spam',
    description: 'Build as many Pulse towers as gold allows, never upgrade.',
    beforeWave: (_w, ctx) => {
      return buyMany('pulse', ctx.gold, ctx, []);
    },
  },

  {
    name: 'Pulse + Upgrade',
    description: 'Prioritize upgrading existing pulse towers over spreading.',
    beforeWave: (_w, ctx) => {
      const actions: Action[] = [];
      let gold = ctx.gold;
      // Upgrade first
      while (true) {
        const up = upgradeAvailable('pulse', gold, ctx, actions);
        if (!up) break;
        actions.push(up);
        gold -= nextUpgradeCost(ctx, (up as { towerIdx: number }).towerIdx);
      }
      // Then spam new if still have gold
      actions.push(...buyMany('pulse', gold, ctx, actions));
      return actions;
    },
  },

  {
    name: 'Nova Focus',
    description: 'Heavy on Nova for blast damage (good vs mechs, swarms, splitters).',
    beforeWave: (_w, ctx) => {
      const actions: Action[] = [];
      let gold = ctx.gold;
      if (ctx.towers.length === 0 && gold >= cost('nova')) {
        actions.push(...buyMany('nova', gold, ctx, actions));
        return actions;
      }
      actions.push(...buyMany('nova', gold, ctx, actions));
      return actions;
    },
  },

  {
    name: 'Balanced Mix',
    description: 'Pulse first, Nova by wave 3, Cryo by wave 5.',
    beforeWave: (w, ctx) => {
      const actions: Action[] = [];
      let gold = ctx.gold;

      const hasNova = ctx.towers.some(t => t.type.id === 'nova');
      const hasCryo = ctx.towers.some(t => t.type.id === 'cryo');

      if (w >= 5 && !hasCryo && gold >= cost('cryo')) {
        const s = freeSpots(ctx, actions)[0];
        if (s) { actions.push({ kind: 'place', type: 'cryo', col: s.col, row: s.row }); gold -= cost('cryo'); }
      }
      if (w >= 3 && !hasNova && gold >= cost('nova')) {
        const s = freeSpots(ctx, actions)[0];
        if (s) { actions.push({ kind: 'place', type: 'nova', col: s.col, row: s.row }); gold -= cost('nova'); }
      }

      // Fill rest with Pulse
      actions.push(...buyMany('pulse', gold, ctx, actions));
      return actions;
    },
  },

  {
    name: 'Max Upgrade Few',
    description: 'Just 3 Pulses but max them all out ASAP.',
    beforeWave: (_w, ctx) => {
      const actions: Action[] = [];
      let gold = ctx.gold;

      // Maintain exactly 3 Pulses, upgrade them to max
      while (ctx.towers.length + actions.filter(a => a.kind === 'place').length < 3 && gold >= cost('pulse')) {
        const s = freeSpots(ctx, actions)[0];
        if (!s) break;
        actions.push({ kind: 'place', type: 'pulse', col: s.col, row: s.row });
        gold -= cost('pulse');
      }

      // Upgrade
      while (true) {
        const up = upgradeAvailable(null, gold, ctx, actions);
        if (!up) break;
        actions.push(up);
        gold -= nextUpgradeCost(ctx, (up as { towerIdx: number }).towerIdx);
      }
      return actions;
    },
  },

  {
    name: 'Wide Coverage',
    description: 'Spread lv1 Pulse towers across every corner of the path.',
    beforeWave: (_w, ctx) => {
      return buyMany('pulse', ctx.gold, ctx, []);
    },
  },

  {
    name: 'Cryo Turtle',
    description: 'Buy lots of Cryo to keep everything slowed, damage via a few Pulses.',
    beforeWave: (_w, ctx) => {
      const actions: Action[] = [];
      let gold = ctx.gold;

      const pulseCount = ctx.towers.filter(t => t.type.id === 'pulse').length;
      const cryoCount = ctx.towers.filter(t => t.type.id === 'cryo').length;

      // Keep ratio: 1 pulse per 2 cryo
      if (pulseCount < 2 && gold >= cost('pulse')) {
        const s = freeSpots(ctx, actions)[0];
        if (s) { actions.push({ kind: 'place', type: 'pulse', col: s.col, row: s.row }); gold -= cost('pulse'); }
      }
      if (cryoCount < pulseCount * 2 + 1 && gold >= cost('cryo')) {
        const s = freeSpots(ctx, actions)[0];
        if (s) { actions.push({ kind: 'place', type: 'cryo', col: s.col, row: s.row }); gold -= cost('cryo'); }
      }

      actions.push(...buyMany('cryo', gold, ctx, actions));
      return actions;
    },
  },

  {
    name: 'Arc Heavy',
    description: 'Arc towers for chain damage, upgrade for more chains.',
    beforeWave: (_w, ctx) => {
      const actions: Action[] = [];
      let gold = ctx.gold;

      while (gold >= cost('arc')) {
        const s = freeSpots(ctx, actions)[0];
        if (!s) break;
        actions.push({ kind: 'place', type: 'arc', col: s.col, row: s.row });
        gold -= cost('arc');
      }
      // Fill gaps with pulse
      actions.push(...buyMany('pulse', gold, ctx, actions));
      return actions;
    },
  },

  {
    name: 'Fusion Seeker',
    description: 'Build adjacent Pulse+Arc towers, fuse to Storm when possible.',
    beforeWave: (w, ctx) => {
      const actions: Action[] = [];
      let gold = ctx.gold;

      // Check if fusion is available
      for (let i = 0; i < ctx.towers.length; i++) {
        const t = ctx.towers[i];
        if (t.type.fusion) continue;
        for (let j = 0; j < ctx.towers.length; j++) {
          if (i === j) continue;
          const n = ctx.towers[j];
          if (n.type.fusion) continue;
          const dc = Math.abs(t.col - n.col);
          const dr = Math.abs(t.row - n.row);
          if (dc + dr !== 1) continue;
          // Only fuse if these are different types
          if (t.type.id !== n.type.id) {
            actions.push({ kind: 'fuse', towerIdx: i, neighborIdx: j });
            return actions; // one fuse per wave is enough
          }
        }
      }

      // Build pairs: place Pulse, then Arc adjacent to it
      const pulseCount = ctx.towers.filter(t => t.type.id === 'pulse').length;
      const arcCount = ctx.towers.filter(t => t.type.id === 'arc').length;

      if (pulseCount <= arcCount && gold >= cost('pulse')) {
        const s = freeSpots(ctx, actions)[0];
        if (s) { actions.push({ kind: 'place', type: 'pulse', col: s.col, row: s.row }); gold -= cost('pulse'); }
      }
      if (arcCount < pulseCount && gold >= cost('arc')) {
        // Find a spot adjacent to an existing pulse
        for (const t of ctx.towers) {
          if (t.type.id !== 'pulse') continue;
          const adjacent = [
            { col: t.col + 1, row: t.row },
            { col: t.col - 1, row: t.row },
            { col: t.col, row: t.row + 1 },
            { col: t.col, row: t.row - 1 },
          ];
          const spot = adjacent.find(a =>
            ctx.spots.some(s => s.col === a.col && s.row === a.row)
            && !isPlaced(ctx, a.col, a.row, actions)
          );
          if (spot) {
            actions.push({ kind: 'place', type: 'arc', col: spot.col, row: spot.row });
            gold -= cost('arc');
            break;
          }
        }
      }

      // Fill rest with pulse
      actions.push(...buyMany('pulse', gold, ctx, actions));
      return actions;
    },
  },

  {
    name: 'Nova Early',
    description: 'Buy Nova by W2 for blast coverage, then spread Pulse.',
    beforeWave: (w, ctx) => {
      const actions: Action[] = [];
      let gold = ctx.gold;

      const hasNova = ctx.towers.some(t => t.type.id === 'nova');
      const pulseCount = ctx.towers.filter(t => t.type.id === 'pulse').length;

      // Start: 2 pulses + save for nova
      if (w === 1 && ctx.towers.length === 0) {
        for (let i = 0; i < 2 && gold >= cost('pulse'); i++) {
          const s = freeSpots(ctx, actions, 1)[0];
          if (!s) break;
          actions.push({ kind: 'place', type: 'pulse', col: s.col, row: s.row });
          gold -= cost('pulse');
        }
        return actions;
      }

      // W2: buy nova if we can
      if (w === 2 && !hasNova && gold >= cost('nova')) {
        const s = freeSpots(ctx, actions, 1)[0];
        if (s) { actions.push({ kind: 'place', type: 'nova', col: s.col, row: s.row }); gold -= cost('nova'); }
      }

      // Add cryo around W4-5 for control
      const hasCryo = ctx.towers.some(t => t.type.id === 'cryo');
      if (w >= 4 && !hasCryo && gold >= cost('cryo')) {
        const s = freeSpots(ctx, actions, 1)[0];
        if (s) { actions.push({ kind: 'place', type: 'cryo', col: s.col, row: s.row }); gold -= cost('cryo'); }
      }

      // Another Nova at W5+
      if (w >= 5 && ctx.towers.filter(t => t.type.id === 'nova').length < 2 && gold >= cost('nova')) {
        const s = freeSpots(ctx, actions, 1)[0];
        if (s) { actions.push({ kind: 'place', type: 'nova', col: s.col, row: s.row }); gold -= cost('nova'); }
      }

      // Upgrade existing towers
      for (let i = 0; i < 2; i++) {
        const up = upgradeAvailable(null, gold, ctx, actions);
        if (!up) break;
        actions.push(up);
        gold -= nextUpgradeCost(ctx, (up as { towerIdx: number }).towerIdx);
      }

      // Fill with pulse
      actions.push(...buyMany('pulse', gold, ctx, actions));
      return actions;
    },
  },

  {
    name: 'Smart Adaptive',
    description: 'Build pulse early, add Nova for mechs (W5), upgrade mid-level.',
    beforeWave: (w, ctx) => {
      const actions: Action[] = [];
      let gold = ctx.gold;

      // Wave-specific priorities
      const hasNova = ctx.towers.some(t => t.type.id === 'nova');
      const hasCryo = ctx.towers.some(t => t.type.id === 'cryo');

      // Before W4 (swarm) or W5 (mechs), ensure we have Nova
      if (w >= 4 && !hasNova && gold >= cost('nova')) {
        const s = freeSpots(ctx, actions)[0];
        if (s) { actions.push({ kind: 'place', type: 'nova', col: s.col, row: s.row }); gold -= cost('nova'); }
      }

      // Upgrade some existing towers
      for (let i = 0; i < 2; i++) {
        const up = upgradeAvailable(null, gold, ctx, actions);
        if (!up) break;
        actions.push(up);
        gold -= nextUpgradeCost(ctx, (up as { towerIdx: number }).towerIdx);
      }

      // Add cryo by W5-6 for control
      if (w >= 5 && !hasCryo && gold >= cost('cryo')) {
        const s = freeSpots(ctx, actions)[0];
        if (s) { actions.push({ kind: 'place', type: 'cryo', col: s.col, row: s.row }); gold -= cost('cryo'); }
      }

      // Fill with pulse
      actions.push(...buyMany('pulse', gold, ctx, actions));
      return actions;
    },
  },
];
