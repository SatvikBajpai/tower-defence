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

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = CANVAS_W / rect.width;
    const scaleY = CANVAS_H / rect.height;
    const px = (e.clientX - rect.left) * scaleX;
    const py = (e.clientY - rect.top) * scaleY;
    state.mousePixel = { x: px, y: py };
    state.mouseGrid = { x: Math.floor(px / CELL), y: Math.floor(py / CELL) };
  }, []);

  const handleMouseLeave = useCallback(() => {
    state.mouseGrid = null;
    state.mousePixel = null;
  }, []);

  const handleClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = CANVAS_W / rect.width;
    const scaleY = CANVAS_H / rect.height;
    const px = (e.clientX - rect.left) * scaleX;
    const py = (e.clientY - rect.top) * scaleY;
    const col = Math.floor(px / CELL);
    const row = Math.floor(py / CELL);

    if (state.selectedTowerType) {
      const type = TOWER_TYPES[state.selectedTowerType];
      if (type && state.gold >= type.cost && canPlace(col, row)) {
        placeTower(col, row, state.selectedTowerType);
        onStateChange();
      }
      return;
    }

    const clicked = towers.find(t => t.col === col && t.row === row);
    state.selectedTower = clicked ?? null;
    onStateChange();
  }, [onStateChange]);

  const handleRightClick = useCallback((e: React.MouseEvent) => {
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
    <div ref={wrapperRef} style={{ position: 'relative' }}>
      <canvas
        ref={canvasRef}
        width={CANVAS_W}
        height={CANVAS_H}
        onClick={handleClick}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onContextMenu={handleRightClick}
        style={{
          display: 'block',
          width: '100%',
          height: 'auto',
          imageRendering: 'auto',
          cursor: state.selectedTowerType ? 'crosshair' : 'default',
        }}
      />
    </div>
  );
}
