import { useState, useCallback, useEffect } from 'react';
import { state, startWave, overchargeTower, startLevel, resetGame, castFrostNova } from './game/engine';
import GameCanvas from './components/GameCanvas';
import HUD from './components/HUD';
import Toolbar from './components/Toolbar';
import TowerInfo from './components/TowerInfo';
import GameOver from './components/GameOver';
import LevelComplete from './components/LevelComplete';
import StartScreen from './components/StartScreen';

const SPEEDS = [1, 2, 4];
const STORAGE_KEY = 'grid-defense-unlocked';

function getUnlocked(): number {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    return v ? Math.max(1, parseInt(v, 10) || 1) : 1;
  } catch {
    return 1;
  }
}

function saveUnlocked(level: number) {
  try { localStorage.setItem(STORAGE_KEY, String(level)); } catch {}
}

export default function App() {
  const [, setTick] = useState(0);
  const [screen, setScreen] = useState<'menu' | 'game'>('menu');
  const [unlockedLevel, setUnlockedLevel] = useState(getUnlocked);

  const forceUpdate = useCallback(() => setTick(t => t + 1), []);

  function handleSelectLevel(levelNum: number) {
    startLevel(levelNum);
    setScreen('game');
    forceUpdate();
  }

  function handleLevelComplete() {
    const next = state.levelNum + 1;
    if (next > unlockedLevel) {
      setUnlockedLevel(next);
      saveUnlocked(next);
    }
  }

  function handleBackToMenu() {
    resetGame();
    setScreen('menu');
    forceUpdate();
  }

  useEffect(() => {
    if (state.phase === 'level_complete') handleLevelComplete();
  });

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (screen !== 'game') return;
      if (e.key === 'Escape') {
        state.paused = !state.paused;
        state.selectedTowerType = null;
        state.selectedTower = null;
        forceUpdate();
        return;
      }

      if (state.phase === 'gameover' || state.phase === 'level_complete' || state.paused) return;

      const towerKeys: Record<string, string> = { '1': 'pulse', '2': 'arc', '3': 'nova', '4': 'cryo' };

      if (towerKeys[e.key]) {
        const typeId = towerKeys[e.key];
        state.selectedTowerType = state.selectedTowerType === typeId ? null : typeId;
        if (state.selectedTowerType) state.selectedTower = null;
        forceUpdate();
      } else if (e.key === ' ') {
        e.preventDefault();
        startWave();
        forceUpdate();
      } else if (e.key === 'f' || e.key === 'F') {
        const idx = SPEEDS.indexOf(state.speed);
        state.speed = SPEEDS[(idx + 1) % SPEEDS.length];
        forceUpdate();
      } else if (e.key === 'q' || e.key === 'Q') {
        if (state.selectedTower) {
          overchargeTower(state.selectedTower);
          forceUpdate();
        }
      } else if (e.key === 'z' || e.key === 'Z') {
        castFrostNova();
        forceUpdate();
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [screen, forceUpdate]);

  if (screen === 'menu') {
    return (
      <StartScreen
        unlockedLevel={unlockedLevel}
        onSelectLevel={handleSelectLevel}
      />
    );
  }

  return (
    <div className="app">
      <HUD />
      <div className="game-area">
        <GameCanvas onStateChange={forceUpdate} />
        <TowerInfo onStateChange={forceUpdate} />
      </div>
      <Toolbar onStateChange={forceUpdate} />
      <GameOver onStateChange={handleBackToMenu} />
      <LevelComplete onStateChange={forceUpdate} onMenu={handleBackToMenu} />
      {state.paused && (
        <div className="overlay">
          <div className="pause-panel">
            <h1 className="pause-title">PAUSED</h1>
            <div className="pause-actions">
              <button className="pause-btn resume-btn" onClick={() => { state.paused = false; forceUpdate(); }}>
                RESUME
              </button>
              <button className="pause-btn menu-btn" onClick={handleBackToMenu}>
                LEVEL SELECT
              </button>
            </div>
            <div className="pause-hint">Press ESC to resume</div>
          </div>
        </div>
      )}
    </div>
  );
}
