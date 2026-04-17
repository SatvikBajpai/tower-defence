import { SELL_RATIO, OVERCHARGE_DURATION, OVERCHARGE_COOLDOWN, CANVAS_W } from '../game/config';
import {
  state, upgradeTower, sellTower,
  getAdjacentFusionTargets, fuseTowers, overchargeTower,
  computeTowerDps,
} from '../game/engine';
import type { TargetingMode } from '../game/types';

interface Props {
  onStateChange: () => void;
}

const TARGETING_MODES: TargetingMode[] = ['first', 'last', 'strongest', 'closest'];
const TARGETING_LABELS: Record<TargetingMode, string> = {
  first: 'FIRST',
  last: 'LAST',
  strongest: 'STRONG',
  closest: 'CLOSE',
};

export default function TowerInfo({ onStateChange }: Props) {
  const tower = state.selectedTower;
  if (!tower) return null;

  const stats = tower.type.levels[tower.level];
  const isFusion = !!tower.type.fusion;
  const canUpgrade = tower.level + 1 < tower.type.levels.length;
  const upgradeCost = canUpgrade
    ? tower.type.levels[tower.level + 1].upgradeCost ?? tower.type.cost
    : 0;
  const sellValue = Math.floor(tower.totalInvested * SELL_RATIO);
  const dps = computeTowerDps(tower);

  const fusionTargets = getAdjacentFusionTargets(tower);

  const ocActive = tower.overchargeTime > 0;
  const ocCooldown = tower.overchargeTime < 0;
  const ocReady = tower.overchargeTime === 0;
  const cooldownPct = ocCooldown
    ? Math.round((-tower.overchargeTime / OVERCHARGE_COOLDOWN) * 100)
    : 0;

  // Position panel opposite to tower location so it doesn't cover the tower.
  // If tower is on right half, panel goes left; else panel goes right.
  const onRight = tower.x > CANVAS_W / 2;
  const sideStyle: React.CSSProperties = onRight
    ? { left: 10, right: 'auto' }
    : { right: 10, left: 'auto' };

  function setTargetingMode(mode: TargetingMode) {
    if (tower) {
      tower.targetingMode = mode;
      onStateChange();
    }
  }

  function close() {
    state.selectedTower = null;
    onStateChange();
  }

  return (
    <>
      {/* Mobile backdrop - tap to dismiss */}
      <div className="tower-info-backdrop" onClick={close} />
      <div
        className="tower-info"
        style={{
          ...sideStyle,
          '--tower-color': tower.type.color,
          '--tower-dark': tower.type.colorDark,
        } as React.CSSProperties}
      >
        {/* Header */}
        <div className="ti-header">
          <div className="ti-title">
            {isFusion && <span className="ti-fusion-badge">F</span>}
            <span className="ti-name">{tower.type.name}</span>
          </div>
          <div className="ti-header-right">
            <div className="ti-level-pill">
              {isFusion ? 'FUSION ' : ''}LV {tower.level + 1}/{tower.type.levels.length}
            </div>
            <button className="ti-close-btn" onClick={close} aria-label="close">✕</button>
          </div>
        </div>

      {/* DPS banner */}
      <div className="ti-dps">
        <span className="ti-dps-label">DPS</span>
        <span className="ti-dps-value">{dps}</span>
        <span className={`ti-dmg-type dt-${tower.type.damageType}`}>
          {tower.type.damageType.toUpperCase()}
        </span>
      </div>

      {/* Stats grid */}
      <div className="ti-stats">
        <div className="ti-stat">
          <span className="ti-stat-label">DMG</span>
          <span className="ti-stat-value">{stats.damage}</span>
        </div>
        <div className="ti-stat">
          <span className="ti-stat-label">RATE</span>
          <span className="ti-stat-value">{(1000 / stats.fireRate).toFixed(1)}/s</span>
        </div>
        <div className="ti-stat">
          <span className="ti-stat-label">RNG</span>
          <span className="ti-stat-value">{stats.range.toFixed(1)}</span>
        </div>
        {stats.chains != null && (
          <div className="ti-stat">
            <span className="ti-stat-label">CHN</span>
            <span className="ti-stat-value">{stats.chains}</span>
          </div>
        )}
        {stats.splashRadius != null && (
          <div className="ti-stat">
            <span className="ti-stat-label">AOE</span>
            <span className="ti-stat-value">{stats.splashRadius.toFixed(1)}</span>
          </div>
        )}
        {stats.slowAmount != null && (
          <div className="ti-stat">
            <span className="ti-stat-label">SLOW</span>
            <span className="ti-stat-value">{Math.round(stats.slowAmount * 100)}%</span>
          </div>
        )}
      </div>

      {/* Targeting mode selector */}
      <div className="ti-section-label">TARGET PRIORITY</div>
      <div className="ti-targeting">
        {TARGETING_MODES.map(mode => (
          <button
            key={mode}
            className={`ti-target-btn ${tower.targetingMode === mode ? 'active' : ''}`}
            onClick={() => setTargetingMode(mode)}
            title={mode}
          >
            {TARGETING_LABELS[mode]}
          </button>
        ))}
      </div>

      {/* Overcharge */}
      <div className="ti-section-label">ABILITY</div>
      {ocReady && (
        <button
          className="ti-btn overcharge-btn"
          onClick={() => { overchargeTower(tower); onStateChange(); }}
        >
          <span className="ti-btn-label">OVERCHARGE</span>
          <span className="ti-btn-sub">Q · {OVERCHARGE_DURATION}s burst · {OVERCHARGE_COOLDOWN}s lockout</span>
        </button>
      )}
      {ocActive && (
        <div className="ti-status overcharge-active">
          OVERCHARGING · {tower.overchargeTime.toFixed(1)}s
        </div>
      )}
      {ocCooldown && (
        <div className="ti-status overcharge-cooldown">
          <span>OFFLINE</span>
          <div className="ti-cooldown-bar">
            <div className="ti-cooldown-fill" style={{ width: `${100 - cooldownPct}%` }} />
          </div>
        </div>
      )}

      {/* Fusion opportunities */}
      {fusionTargets.length > 0 && (
        <>
          <div className="ti-section-label">FUSE · new tower appears at ◉ this cell</div>
          {fusionTargets.map((ft, i) => {
            const dc = ft.neighbor.col - tower.col;
            const dr = ft.neighbor.row - tower.row;
            const arrow =
              dc === 1 ? '◀' : dc === -1 ? '▶' : dr === 1 ? '▲' : '▼';
            return (
              <button
                key={i}
                className="ti-btn fuse-btn"
                onMouseEnter={() => { tower.id; /* hover */ }}
                onClick={() => { fuseTowers(tower, ft.neighbor); onStateChange(); }}
              >
                <span className="ti-btn-label">◉ → {ft.resultName}</span>
                <span className="ti-btn-sub">
                  absorbs {arrow} {ft.neighbor.type.name} (consumed)
                </span>
              </button>
            );
          })}
        </>
      )}

      {/* Upgrade / Sell */}
      <div className="ti-actions-row">
        {canUpgrade ? (
          <button
            className="ti-btn upgrade-btn"
            disabled={state.gold < upgradeCost}
            onClick={() => { upgradeTower(tower); onStateChange(); }}
          >
            ▲ UPGRADE
            <span className="ti-btn-cost">{upgradeCost}g</span>
          </button>
        ) : (
          <div className="ti-maxed">MAX LEVEL</div>
        )}
        <button
          className="ti-btn sell-btn"
          onClick={() => { sellTower(tower); onStateChange(); }}
        >
          ✕ SELL
          <span className="ti-btn-cost">+{sellValue}g</span>
        </button>
      </div>

        <div className="ti-footer">
          <span>Kills: {tower.kills}</span>
          <span>Invested: {tower.totalInvested}g</span>
        </div>
      </div>
    </>
  );
}
