import { CountUp } from "./reactbitsLite";
import "./gameUi.css";

export function GameStatRing({ label, value, color }) {
  const percent = Math.round(value * 100);

  return (
    <div className="game-ui-stat-ring" style={{ "--ring-color": color, "--ring-fill": `${percent}%` }}>
      <div className="game-ui-stat-ring__fill" />
      <div className="game-ui-stat-ring__content">
        <strong>
          <CountUp from={0} to={percent} duration={1.5} />
        </strong>
        <span>{label}</span>
      </div>
    </div>
  );
}
