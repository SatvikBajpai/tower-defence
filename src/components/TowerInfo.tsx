import { SELL_RATIO, OVERCHARGE_DURATION, OVERCHARGE_COOLDOWN } from '../game/config';
import {
  state, upgradeTower, sellTower,
  getAdjacentFusionTargets, fuseTowers, overchargeTower,
} from '../game/engine';

interface Props {
  onStateChange: () => void;
}

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

  const fusionTargets = getAdjacentFusionTargets(tower);

  const ocActive = tower.overchargeTime > 0;
  const ocCooldown = tower.overchargeTime < 0;
  const ocReady = tower.overchargeTime === 0;
  const cooldownPct = ocCooldown
    ? Math.round((-tower.overchargeTime / OVERCHARGE_COOLDOWN) * 100)
    : 0;

  return (
    <div
      className="tower-info"
      style={{
        '--tower-color': tower.type.color,
        '--tower-dark': tower.type.colorDark,
      } as React.CSSProperties}
    >
      <div className="ti-header">
        <span className="ti-name">
          {isFusion && <span className="ti-fusion-badge">F</span>}
          {tower.type.name}
        </span>
        <span className="ti-level">
          {isFusion ? 'FUSION' : `LV.${tower.level + 1}`}
        </span>
      </div>

      <div className="ti-stats">
        <div className="ti-stat">
          <span className="ti-stat-label">DMG</span>
          <span className="ti-stat-value">{stats.damage}</span>
        </div>
        <div className="ti-stat">
          <span className="ti-stat-label">RNG</span>
          <span className="ti-stat-value">{stats.range.toFixed(1)}</span>
        </div>
        <div className="ti-stat">
          <span className="ti-stat-label">SPD</span>
          <span className="ti-stat-value">{(stats.fireRate / 1000).toFixed(1)}s</span>
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

      <div className="ti-kills">Kills: {tower.kills}</div>

      <div className="ti-actions">
        {/* Overcharge */}
        {ocReady && (
          <button
            className="ti-btn overcharge-btn"
            onClick={() => { overchargeTower(tower); onStateChange(); }}
          >
            OVERCHARGE
            <span className="ti-btn-sub">Q - {OVERCHARGE_DURATION}s burst</span>
          </button>
        )}
        {ocActive && (
          <div className="ti-status overcharge-active">
            OVERCHARGING...
          </div>
        )}
        {ocCooldown && (
          <div className="ti-status overcharge-cooldown">
            OFFLINE ({cooldownPct}%)
          </div>
        )}

        {/* Fusion */}
        {fusionTargets.map((ft, i) => (
          <button
            key={i}
            className="ti-btn fuse-btn"
            onClick={() => { fuseTowers(tower, ft.neighbor); onStateChange(); }}
          >
            FUSE: {ft.resultName}
            <span className="ti-btn-sub">with {ft.neighbor.type.name}</span>
          </button>
        ))}

        {/* Upgrade */}
        {canUpgrade && (
          <button
            className="ti-btn upgrade-btn"
            disabled={state.gold < upgradeCost}
            onClick={() => { upgradeTower(tower); onStateChange(); }}
          >
            UPGRADE ({upgradeCost}g)
          </button>
        )}
        {!canUpgrade && <div className="ti-maxed">MAX LEVEL</div>}

        {/* Sell */}
        <button
          className="ti-btn sell-btn"
          onClick={() => { sellTower(tower); onStateChange(); }}
        >
          SELL ({sellValue}g)
        </button>
      </div>
    </div>
  );
}
