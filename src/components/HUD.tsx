import { ENEMY_TYPES } from '../game/config';
import { state, getNextWavePreview } from '../game/engine';

export default function HUD() {
  const isActive = state.phase === 'spawning' || state.phase === 'active';
  const progress = state.waveEnemiesTotal > 0
    ? state.waveEnemiesCleared / state.waveEnemiesTotal
    : 0;

  const next = state.phase === 'waiting' ? getNextWavePreview() : null;

  return (
    <div className="hud-wrapper">
      <div className="hud">
        <div className="hud-left">
          <div className="hud-item">
            <span className="hud-label">WAVE</span>
            <span className="hud-value wave-value">{state.waveNum || '-'}</span>
          </div>
          {isActive && state.waveName && (
            <div className="hud-wave-name">{state.waveName}</div>
          )}
          <div className="hud-item">
            <span className="hud-label">SCORE</span>
            <span className="hud-value">{state.score}</span>
          </div>
        </div>

        <div className="hud-center">
          <div className="hud-title">GRID DEFENSE</div>
        </div>

        <div className="hud-right">
          <div className="hud-item">
            <span className="hud-label">GOLD</span>
            <span className="hud-value gold-value">{state.gold}</span>
          </div>
          <div className="hud-item">
            <span className="hud-label">LIVES</span>
            <span className="hud-value lives-value">{state.lives}</span>
            <div className="lives-bar">
              <div
                className="lives-bar-fill"
                style={{ width: `${(state.lives / state.maxLives) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {isActive && (
        <div className="wave-progress-bar">
          <div
            className="wave-progress-fill"
            style={{ width: `${progress * 100}%` }}
          />
        </div>
      )}

      {next && state.phase === 'waiting' && (
        <div className="next-wave-bar">
          <span className="nw-label">NEXT:</span>
          <span className="nw-name">{next.name}</span>
          <div className="nw-enemies">
            {next.entries.map((entry, i) => {
              const et = ENEMY_TYPES[entry.type];
              if (!et) return null;
              return (
                <span key={i} className="nw-enemy" style={{ color: et.color }}>
                  <span className="nw-enemy-dot" style={{ background: et.color }} />
                  {entry.count} {et.name}
                </span>
              );
            })}
          </div>
          <span className="nw-bonus">+{next.bonus}g</span>
        </div>
      )}
    </div>
  );
}
