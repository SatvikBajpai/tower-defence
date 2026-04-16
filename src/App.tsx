import { useState, useCallback, useEffect } from 'react';
import { state, startWave, overchargeTower } from './game/engine';
import GameCanvas from './components/GameCanvas';
import HUD from './components/HUD';
import Toolbar from './components/Toolbar';
import TowerInfo from './components/TowerInfo';
import GameOver from './components/GameOver';
import StartScreen from './components/StartScreen';

export default function App() {
  const [, setTick] = useState(0);
  const [started, setStarted] = useState(false);

  const forceUpdate = useCallback(() => setTick(t => t + 1), []);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (!started || state.phase === 'gameover') return;

      const towerKeys: Record<string, string> = { '1': 'pulse', '2': 'arc', '3': 'nova', '4': 'cryo' };

      if (towerKeys[e.key]) {
        const typeId = towerKeys[e.key];
        if (state.selectedTowerType === typeId) {
          state.selectedTowerType = null;
        } else {
          state.selectedTowerType = typeId;
          state.selectedTower = null;
        }
        forceUpdate();
      } else if (e.key === ' ') {
        e.preventDefault();
        startWave();
        forceUpdate();
      } else if (e.key === 'f' || e.key === 'F') {
        state.speed = state.speed === 1 ? 2 : 1;
        forceUpdate();
      } else if (e.key === 'q' || e.key === 'Q') {
        if (state.selectedTower) {
          overchargeTower(state.selectedTower);
          forceUpdate();
        }
      } else if (e.key === 'Escape') {
        state.selectedTowerType = null;
        state.selectedTower = null;
        forceUpdate();
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [started, forceUpdate]);

  if (!started) {
    return <StartScreen onStart={() => setStarted(true)} />;
  }

  return (
    <div className="app">
      <HUD />
      <div className="game-area">
        <GameCanvas onStateChange={forceUpdate} />
        <TowerInfo onStateChange={forceUpdate} />
      </div>
      <Toolbar onStateChange={forceUpdate} />
      <GameOver onStateChange={forceUpdate} />
    </div>
  );
}
