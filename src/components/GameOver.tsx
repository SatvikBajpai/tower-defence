import { state } from '../game/engine';

interface Props {
  onStateChange: () => void;
}

export default function GameOver({ onStateChange }: Props) {
  if (state.phase !== 'gameover') return null;

  return (
    <div className="overlay">
      <div className="game-over-panel">
        <h1 className="go-title">SYSTEM FAILURE</h1>
        <div className="go-subtitle">Grid defenses breached</div>

        <div className="go-stats">
          <div className="go-stat">
            <span className="go-stat-label">Level</span>
            <span className="go-stat-value">{state.levelNum}</span>
          </div>
          <div className="go-stat">
            <span className="go-stat-label">Waves Survived</span>
            <span className="go-stat-value">{state.levelWave}</span>
          </div>
          <div className="go-stat">
            <span className="go-stat-label">Enemies Destroyed</span>
            <span className="go-stat-value">{state.enemiesKilled}</span>
          </div>
          <div className="go-stat">
            <span className="go-stat-label">Score</span>
            <span className="go-stat-value">{state.score}</span>
          </div>
        </div>

        <button className="go-restart" onClick={onStateChange}>
          LEVEL SELECT
        </button>
      </div>
    </div>
  );
}
