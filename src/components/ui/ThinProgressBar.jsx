export function ThinProgressBar({ progress, percent }) {
  return (
    <div className="thin-progress" aria-label={`Loading ${percent}%`}>
      <div className="thin-progress__track">
        <div
          className="thin-progress__fill"
          style={{ transform: `scaleX(${progress})` }}
        />
      </div>
      <span className="thin-progress__percent">[ {percent}% ]</span>
    </div>
  );
}
