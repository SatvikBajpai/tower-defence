import { TOWER_TYPES, FROST_NOVA_COOLDOWN } from '../game/config';
import { state, startWave, castFrostNova } from '../game/engine';

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
        {/* Fixed-width wave slot - same width across all phases so nothing shifts */}
        <div className="wave-slot">
          {canSend && state.levelWave === 0 && (
            <button
              className="action-btn send-wave ready"
              onClick={() => { startWave(); onStateChange(); }}
            >
              <span>START WAVE</span>
              <span className="action-key">SPACE</span>
            </button>
          )}

          {canSend && state.levelWave > 0 && (
            <div className="wave-countdown">
              <span className="wc-label">NEXT</span>
              <span className="wc-timer">{Math.ceil(state.waveCountdown)}s</span>
              <button
                className="wc-skip"
                onClick={() => { startWave(); onStateChange(); }}
              >
                SKIP
              </button>
            </div>
          )}

          {isActive && (
            <div className="wave-status">
              <span className="wave-status-name">{state.waveName}</span>
              <span className="wave-status-count">{state.waveEnemiesCleared}/{state.waveEnemiesTotal}</span>
            </div>
          )}
        </div>

        <button
          className={`action-btn frost-btn ${state.frostCooldown === 0 ? 'ready' : 'cooling'}`}
          onClick={() => { castFrostNova(); onStateChange(); }}
          disabled={state.frostCooldown > 0}
          title="Freeze all enemies for 3s"
        >
          <span className="frost-icon">❄</span>
          <span className="frost-label">
            {state.frostCooldown > 0 ? `${Math.ceil(state.frostCooldown)}s` : 'FROST'}
          </span>
          <span className="action-key">Z</span>
          {state.frostCooldown > 0 && (
            <div
              className="frost-cd-fill"
              style={{ width: `${(1 - state.frostCooldown / FROST_NOVA_COOLDOWN) * 100}%` }}
            />
          )}
        </button>

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
