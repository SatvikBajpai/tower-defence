interface Props {
  onStart: () => void;
}

export default function StartScreen({ onStart }: Props) {
  return (
    <div className="overlay start-screen">
      <div className="start-content">
        <div className="start-deco-line" />
        <h1 className="start-title">GRID DEFENSE</h1>
        <div className="start-subtitle">TACTICAL TOWER DEFENSE</div>
        <div className="start-deco-line" />

        <div className="start-instructions">
          <div className="si-section">CONTROLS</div>
          <div className="si-row"><span className="si-key">1-4</span> Select tower</div>
          <div className="si-row"><span className="si-key">CLICK</span> Place / select tower</div>
          <div className="si-row"><span className="si-key">RIGHT CLICK</span> Deselect</div>
          <div className="si-row"><span className="si-key">SPACE</span> Send wave</div>
          <div className="si-row"><span className="si-key">F</span> Fast forward</div>
          <div className="si-row"><span className="si-key">ESC</span> Cancel</div>

          <div className="si-divider" />
          <div className="si-section">SPECIAL</div>
          <div className="si-row"><span className="si-key">Q</span> Overcharge selected tower</div>
          <div className="si-hint">5s of 3x power, then 10s offline</div>
          <div className="si-row"><span className="si-key">FUSE</span> Merge adjacent towers</div>
          <div className="si-hint">6 unique fusion types from 4 base towers</div>
        </div>

        <button className="start-btn" onClick={onStart}>
          INITIALIZE GRID
        </button>
      </div>
    </div>
  );
}
