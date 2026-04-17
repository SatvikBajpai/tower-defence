import { useRef, useCallback } from 'react';
import { CELL, CANVAS_W, CANVAS_H, TOWER_TYPES } from '../game/config';
import { canPlace } from '../game/path';
import { state, placeTower, towers, update } from '../game/engine';
import { render } from '../game/renderer';
import { useGameLoop } from '../hooks/useGameLoop';

interface Props {
  onStateChange: () => void;
}

export default function GameCanvas({ onStateChange }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const uiTickRef = useRef(0);

  // Compute grid coords from pointer event
  const coordsFromEvent = useCallback((clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    const scaleX = CANVAS_W / rect.width;
    const scaleY = CANVAS_H / rect.height;
    const px = (clientX - rect.left) * scaleX;
    const py = (clientY - rect.top) * scaleY;
    return {
      px, py,
      col: Math.floor(px / CELL),
      row: Math.floor(py / CELL),
    };
  }, []);

  const handlePointerMove = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
    // Only track position for mouse (hover preview). Touch fires move during drag
    // which we want to treat like tap position.
    const c = coordsFromEvent(e.clientX, e.clientY);
    if (!c) return;
    state.mousePixel = { x: c.px, y: c.py };
    state.mouseGrid = { x: c.col, y: c.row };
  }, [coordsFromEvent]);

  const handlePointerLeave = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
    // Mouse only - touch doesn't need persistent hover state
    if (e.pointerType === 'mouse') {
      state.mouseGrid = null;
      state.mousePixel = null;
    }
  }, []);

  const handlePointerDown = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const c = coordsFromEvent(e.clientX, e.clientY);
    if (!c) return;

    // For touch, show the placement preview at tapped cell
    if (e.pointerType === 'touch') {
      state.mousePixel = { x: c.px, y: c.py };
      state.mouseGrid = { x: c.col, y: c.row };
    }

    const clicked = towers.find(t => t.col === c.col && t.row === c.row);
    if (clicked) {
      state.selectedTowerType = null;
      state.selectedTower = clicked;
      onStateChange();
      return;
    }

    if (state.selectedTowerType) {
      const type = TOWER_TYPES[state.selectedTowerType];
      if (type && state.gold >= type.cost && canPlace(c.col, c.row)) {
        placeTower(c.col, c.row, state.selectedTowerType);
        onStateChange();
      }
      return;
    }

    state.selectedTower = null;
    onStateChange();
  }, [coordsFromEvent, onStateChange]);

  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    state.selectedTowerType = null;
    state.selectedTower = null;
    onStateChange();
  }, [onStateChange]);

  useGameLoop((dt, time) => {
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    update(dt);
    render(ctx, time);
    uiTickRef.current++;
    if (uiTickRef.current % 6 === 0) onStateChange();
  });

  return (
    <div ref={wrapperRef} className="canvas-wrapper">
      <canvas
        ref={canvasRef}
        width={CANVAS_W}
        height={CANVAS_H}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
        onContextMenu={handleContextMenu}
        style={{
          cursor: state.selectedTowerType ? 'crosshair' : 'default',
          touchAction: 'none',
        }}
      />
    </div>
  );
}
