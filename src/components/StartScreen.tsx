import { LEVELS } from '../game/config';

interface Props {
  unlockedLevel: number;
  onSelectLevel: (levelNum: number) => void;
}

export default function StartScreen({ unlockedLevel, onSelectLevel }: Props) {
  return (
    <div className="overlay start-screen">
      <div className="start-content">
        <div className="start-deco-line" />
        <h1 className="start-title">GRID DEFENSE</h1>
        <div className="start-subtitle">TACTICAL TOWER DEFENSE</div>
        <div className="start-deco-line" />

        <div className="level-select">
          <div className="ls-header">SELECT LEVEL</div>
          <div className="ls-grid">
            {LEVELS.map(level => {
              const locked = level.id > unlockedLevel;
              return (
                <button
                  key={level.id}
                  className={`ls-card ${locked ? 'locked' : ''} ${level.id === unlockedLevel ? 'latest' : ''}`}
                  disabled={locked}
                  onClick={() => onSelectLevel(level.id)}
                >
                  <span className="ls-num">{level.id}</span>
                  <span className="ls-name">{level.name}</span>
                  <span className="ls-sub">{locked ? 'LOCKED' : level.subtitle}</span>
                  <span className="ls-meta">{level.waves} waves</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="start-controls">
          <div className="si-section">CONTROLS</div>
          <div className="si-row-compact">
            <span className="si-key-sm">1-4</span> Towers
            <span className="si-sep" />
            <span className="si-key-sm">SPACE</span> Send wave
            <span className="si-sep" />
            <span className="si-key-sm">F</span> Speed
            <span className="si-sep" />
            <span className="si-key-sm">Q</span> Overcharge
            <span className="si-sep" />
            <span className="si-key-sm">ESC</span> Cancel
          </div>
        </div>
      </div>
    </div>
  );
}
