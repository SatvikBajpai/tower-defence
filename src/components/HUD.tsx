import { ENEMY_TYPES } from '../game/config';
import { state, getNextWavePreview } from '../game/engine';

export default function HUD() {
  const isActive = state.phase === 'spawning' || state.phase === 'active';
  const progress = state.waveEnemiesTotal > 0
    ? state.waveEnemiesCleared / state.waveEnemiesTotal
    : 0;

  const canPreview = state.phase === 'waiting' && state.levelWave < state.levelWavesTotal;
  const next = canPreview ? getNextWavePreview() : null;

  return (
    <div className="hud-wrapper">
      <div className="hud">
        <div className="hud-left">
          <div className="hud-item">
            <span className="hud-label">LEVEL</span>
            <span className="hud-value wave-value">{state.levelNum}</span>
          </div>
          <div className="hud-level-name">{state.levelName}</div>
          <div className="hud-item">
            <span className="hud-label">WAVE</span>
            <span className="hud-value">{state.levelWave}/{state.levelWavesTotal}</span>
          </div>
          <div
            className="hud-wave-name"
            style={{ visibility: isActive && state.waveName ? 'visible' : 'hidden' }}
          >
            {state.waveName || 'PLACEHOLDER'}
          </div>
        </div>

        <div className="hud-center">
          <div className="hud-title">GRID DEFENSE</div>
        </div>

        <div className="hud-right">
          <div className="hud-item">
            <span className="hud-label">SCORE</span>
            <span className="hud-value">{state.score}</span>
          </div>
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

      {/* Progress bar - always present so layout doesn't shift between waves */}
      <div className="wave-progress-bar">
        <div
          className="wave-progress-fill"
          style={{ width: `${isActive ? progress * 100 : 0}%` }}
        />
      </div>

      {/* Info bar - always present with stable height, content swaps by phase */}
      <div className="next-wave-bar">
        {next && (
          <>
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
          </>
        )}
        {isActive && (
          <>
            <span className="nw-label">IN WAVE:</span>
            <span className="nw-name">{state.waveName}</span>
            <div className="nw-enemies">
              <span className="nw-enemy" style={{ color: '#88aacc' }}>
                <span className="nw-enemy-dot" style={{ background: '#88aacc' }} />
                {state.waveEnemiesCleared}/{state.waveEnemiesTotal} cleared
              </span>
            </div>
          </>
        )}
        {!next && !isActive && (
          <span className="nw-label" style={{ opacity: 0.4 }}>LEVEL COMPLETE</span>
        )}
      </div>
    </div>
  );
}
