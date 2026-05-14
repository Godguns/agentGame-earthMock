import "./gameUi.css";

export function GameActionCard({ label, meta, ...props }) {
  return (
    <button type="button" className="game-ui-action-card" {...props}>
      <span className="game-ui-action-card__label">{label}</span>
      {meta ? <small className="game-ui-action-card__meta">{meta}</small> : null}
    </button>
  );
}
