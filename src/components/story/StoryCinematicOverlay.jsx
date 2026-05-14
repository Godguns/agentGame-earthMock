import { BlurText, Bounce } from "@appletosolutions/reactbits";
import "./storyCinematicOverlay.css";

export function StoryCinematicOverlay({
  open,
  title,
  subtitle,
  lines = [],
  choices = [],
  branchOptions = [],
  loading = false,
  onChoose,
  onStart,
  onClose,
}) {
  if (!open) {
    return null;
  }

  return (
    <div className="story-cinematic" role="dialog" aria-modal="true">
      <button
        type="button"
        className="story-cinematic__backdrop"
        aria-label="关闭剧情过场"
        onClick={onClose}
      />

      <section className="story-cinematic__stage">
        <div className="story-cinematic__bar" />
        <header className="story-cinematic__header">
          <p className="story-cinematic__eyebrow">MAIN STORY</p>
          <h3>
            <BlurText
              key={title}
              text={title}
              delay={120}
              animateBy="words"
              direction="bottom"
              stepDuration={60}
            />
          </h3>
          {subtitle ? <p className="story-line__text">{subtitle}</p> : null}
        </header>

        <div className="story-cinematic__dialogue">
          {loading ? <Bounce><article className="story-line"><p className="story-line__text">剧情同步中...</p></article></Bounce> : null}
          {!loading && lines.length
            ? lines.map((line, index) => (
                <Bounce key={`${line.speaker}-${index}`}>
                  <article className="story-line">
                    <span className="story-line__speaker">{line.speaker}</span>
                    <p className="story-line__text">{line.text}</p>
                  </article>
                </Bounce>
              ))
            : null}
          {!loading && !lines.length && branchOptions.length ? (
            <Bounce><article className="story-line">
              <span className="story-line__speaker">剧情系统</span>
              <p className="story-line__text">先选择一条最适合当前人格设定的人生主线。</p>
            </article></Bounce>
          ) : null}
        </div>

        <div className="story-cinematic__choices">
          {!loading && !lines.length && branchOptions.length
            ? branchOptions.map((branch) => (
                  <button
                    key={branch.key}
                    type="button"
                    className="story-choice"
                    onClick={() => onStart?.(branch)}
                  >
                    <span>{branch.label}{branch.recommended ? " · 推荐" : ""}</span>
                    {branch.description ? <small>{branch.description}</small> : null}
                  </button>
              ))
            : null}
          {!loading && lines.length
            ? choices.map((choice) => (
                  <button
                    key={choice.key}
                    type="button"
                    className="story-choice"
                    onClick={() => onChoose?.(choice)}
                  >
                    <span>{choice.label}</span>
                    {choice.description ? <small>{choice.description}</small> : null}
                  </button>
              ))
            : null}
        </div>
      </section>
    </div>
  );
}
