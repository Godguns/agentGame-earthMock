import "./gameUi.css";

export function GamePanel({
  children,
  className = "",
  compact = false,
  soft = false,
  showSlashes = true,
}) {
  return (
    <section
      className={[
        "game-ui-panel",
        compact ? "game-ui-panel--compact" : "",
        soft ? "game-ui-panel--soft" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {showSlashes ? <div className="game-ui-panel__slashes" aria-hidden="true" /> : null}
      <div className="game-ui-panel__inner">{children}</div>
    </section>
  );
}
