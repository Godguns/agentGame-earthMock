import { CountUp } from "./reactbitsLite";
import "./gameUi.css";

function clamp01(value) {
  return Math.min(Math.max(value, 0), 1);
}

export function GameStatRing({
  label,
  value,
  color,
  glowColor,
  displayValue,
  separator = "",
  prefix = "",
  suffix = "",
}) {
  const percent = Math.round(clamp01(value) * 100);
  const resolvedDisplay = displayValue ?? percent;
  const isNumericDisplay = typeof resolvedDisplay === "number";

  return (
    <div
      className="game-ui-stat-ring"
      style={{
        "--ring-color": color,
        "--ring-glow": glowColor || color,
        "--ring-fill": `${percent}%`,
      }}
    >
      <div className="game-ui-stat-ring__fill" />
      <div className="game-ui-stat-ring__content">
        <strong>
          {prefix ? <span className="game-ui-stat-ring__affix">{prefix}</span> : null}
          {isNumericDisplay ? (
            <CountUp from={0} to={resolvedDisplay} duration={1.5} separator={separator} />
          ) : (
            resolvedDisplay
          )}
          {suffix ? <span className="game-ui-stat-ring__affix">{suffix}</span> : null}
        </strong>
        <span>{label}</span>
      </div>
    </div>
  );
}
