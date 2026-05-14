import "./gameUi.css";

export function GameSectionTitle({ eyebrow, title, titleNode, subtitle, level = 2 }) {
  const HeadingTag = level === 3 ? "h3" : "h2";

  return (
    <div className="game-ui-title">
      {eyebrow ? <p className="game-ui-title__eyebrow">{eyebrow}</p> : null}
      <div className="game-ui-title__main">
        <HeadingTag>{titleNode || title}</HeadingTag>
      </div>
      {subtitle ? <p className="game-ui-title__sub">{subtitle}</p> : null}
    </div>
  );
}
