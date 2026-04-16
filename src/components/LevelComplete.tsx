import { state, advanceLevel, hasNextLevel } from '../game/engine';

interface Props {
  onStateChange: () => void;
  onMenu: () => void;
}

export default function LevelComplete({ onStateChange, onMenu }: Props) {
  if (state.phase !== 'level_complete') return null;

  const canAdvance = hasNextLevel();

  return (
    <div className="overlay">
      <div className="level-complete-panel">
        <div className="lc-badge">LEVEL {state.levelNum}</div>
        <h1 className="lc-title">{state.levelName}</h1>
        <div className="lc-subtitle">DEFENSE SUCCESSFUL</div>

        <div className="lc-stats">
          <div className="lc-stat">
            <span className="lc-stat-label">Enemies Destroyed</span>
            <span className="lc-stat-value">{state.enemiesKilled}</span>
          </div>
          <div className="lc-stat">
            <span className="lc-stat-label">Lives Remaining</span>
            <span className="lc-stat-value">{state.lives}</span>
          </div>
          <div className="lc-stat">
            <span className="lc-stat-label">Score</span>
            <span className="lc-stat-value">{state.score}</span>
          </div>
        </div>

        <div className="lc-actions">
          {canAdvance && (
            <button
              className="lc-btn"
              onClick={() => { advanceLevel(); onStateChange(); }}
            >
              NEXT LEVEL
            </button>
          )}
          {!canAdvance && (
            <div className="lc-victory">
              <div className="lc-victory-title">ALL LEVELS COMPLETE</div>
              <div className="lc-victory-sub">Final Score: {state.score}</div>
            </div>
          )}
          <button className="lc-btn-secondary" onClick={onMenu}>
            LEVEL SELECT
          </button>
        </div>
      </div>
    </div>
  );
}
