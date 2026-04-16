import { TOWER_TYPES } from '../game/config';
import { state, startWave } from '../game/engine';

interface Props {
  onStateChange: () => void;
}

const SPEEDS = [1, 2, 4];

export default function Toolbar({ onStateChange }: Props) {
  const towerList = Object.values(TOWER_TYPES);
  const isWaiting = state.phase === 'waiting';
  const isActive = state.phase === 'spawning' || state.phase === 'active';
  const canSend = isWaiting && state.levelWave < state.levelWavesTotal;

  function cycleSpeed() {
    const idx = SPEEDS.indexOf(state.speed);
    state.speed = SPEEDS[(idx + 1) % SPEEDS.length];
    onStateChange();
  }

  return (
    <div className="toolbar">
      <div className="tower-buttons">
        {towerList.map(type => {
          const affordable = state.gold >= type.cost;
          const selected = state.selectedTowerType === type.id;
          return (
            <button
              key={type.id}
              className={`tower-btn ${selected ? 'selected' : ''} ${!affordable ? 'disabled' : ''}`}
              style={{ '--tower-color': type.color, '--tower-dark': type.colorDark } as React.CSSProperties}
              onClick={() => {
                state.selectedTowerType = state.selectedTowerType === type.id ? null : type.id;
                if (state.selectedTowerType) state.selectedTower = null;
                onStateChange();
              }}
            >
              <span className="tower-btn-key">{type.key}</span>
              <span className="tower-btn-name">{type.name}</span>
              <span className="tower-btn-cost">{type.cost}g</span>
              <span className="tower-btn-desc">{type.description}</span>
            </button>
          );
        })}
      </div>

      <div className="toolbar-actions">
        {canSend && (
          <button
            className="action-btn send-wave ready"
            onClick={() => { startWave(); onStateChange(); }}
          >
            <span>SEND WAVE</span>
            <span className="action-key">SPACE</span>
          </button>
        )}

        {isActive && (
          <div className="wave-status">
            <span className="wave-status-name">{state.waveName}</span>
            <span className="wave-status-count">{state.waveEnemiesCleared}/{state.waveEnemiesTotal}</span>
          </div>
        )}

        <button
          className={`action-btn speed-btn ${state.speed > 1 ? 'active' : ''}`}
          onClick={cycleSpeed}
        >
          <span>{state.speed}X</span>
          <span className="action-key">F</span>
        </button>
      </div>
    </div>
  );
}
