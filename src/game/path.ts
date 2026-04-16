import { CELL, COLS, ROWS, PATH_GRID } from './config';
import type { PathSegment, Point, CellState } from './types';

export const pathCells = new Set<string>();
export const grid: CellState[][] = Array.from({ length: ROWS }, () =>
  Array(COLS).fill(0) as CellState[]
);

function markPathCells() {
  for (let i = 0; i < PATH_GRID.length - 1; i++) {
    const [c1, r1] = PATH_GRID[i];
    const [c2, r2] = PATH_GRID[i + 1];
    if (r1 === r2) {
      const minC = Math.min(c1, c2);
      const maxC = Math.max(c1, c2);
      for (let c = minC; c <= maxC; c++) {
        if (c >= 0 && c < COLS) {
          pathCells.add(`${c},${r1}`);
          grid[r1][c] = 1;
        }
      }
    } else {
      const minR = Math.min(r1, r2);
      const maxR = Math.max(r1, r2);
      for (let r = minR; r <= maxR; r++) {
        if (r >= 0 && r < ROWS) {
          pathCells.add(`${c1},${r}`);
          grid[r][c1] = 1;
        }
      }
    }
  }
}

markPathCells();

export const pathWaypoints: Point[] = PATH_GRID.map(([c, r]) => ({
  x: c * CELL + CELL / 2,
  y: r * CELL + CELL / 2,
}));

export const pathSegments: PathSegment[] = [];
export let totalPathLength = 0;

function computeSegments() {
  let cumLen = 0;
  for (let i = 0; i < pathWaypoints.length - 1; i++) {
    const p1 = pathWaypoints[i];
    const p2 = pathWaypoints[i + 1];
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    const len = Math.sqrt(dx * dx + dy * dy);
    cumLen += len;
    pathSegments.push({ x1: p1.x, y1: p1.y, x2: p2.x, y2: p2.y, length: len, cumLength: cumLen });
  }
  totalPathLength = cumLen;
}

computeSegments();

export function getPositionOnPath(distance: number): Point & { angle: number } {
  let remaining = distance;
  for (const seg of pathSegments) {
    if (remaining <= seg.length) {
      const t = remaining / seg.length;
      return {
        x: seg.x1 + (seg.x2 - seg.x1) * t,
        y: seg.y1 + (seg.y2 - seg.y1) * t,
        angle: Math.atan2(seg.y2 - seg.y1, seg.x2 - seg.x1),
      };
    }
    remaining -= seg.length;
  }
  const last = pathSegments[pathSegments.length - 1];
  return {
    x: last.x2,
    y: last.y2,
    angle: Math.atan2(last.y2 - last.y1, last.x2 - last.x1),
  };
}

export function canPlace(col: number, row: number): boolean {
  if (col < 0 || col >= COLS || row < 0 || row >= ROWS) return false;
  return grid[row][col] === 0;
}
