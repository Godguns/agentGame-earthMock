import "./gameUi.css";

export function GameBadge({ children, accent = false, ghost = false, className = "" }) {
  return (
    <span
      className={[
        "game-ui-badge",
        accent ? "game-ui-badge--accent" : "",
        ghost ? "game-ui-badge--ghost" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </span>
  );
}
