import "./gameUi.css";

export function GamePanel({
  children,
  className = "",
  compact = false,
  soft = false,
  frosted = false,
  showSlashes = false,
}) {
  return (
    <section
      className={[
        "game-ui-panel",
        compact ? "game-ui-panel--compact" : "",
        soft ? "game-ui-panel--soft" : "",
        frosted ? "game-ui-panel--frosted" : "",
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
