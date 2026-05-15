import { BlurText, Bounce } from "../ui/reactbitsLite";
import "./storyCinematicOverlay.css";

function StoryChoiceButton({ item, onClick, recommended = false }) {
  return (
    <button type="button" className="story-choice" onClick={onClick}>
      <span>
        {item.label}
        {recommended ? <em>推荐</em> : null}
      </span>
      {item.description ? <small>{item.description}</small> : null}
    </button>
  );
}

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
  if (!open) return null;

  const latestLine = lines[lines.length - 1] || null;
  const mode = branchOptions.length && !lines.length ? "branch" : "scene";

  return (
    <div className="story-cinematic" role="dialog" aria-modal="true">
      <button
        type="button"
        className="story-cinematic__backdrop"
        aria-label="关闭剧情过场"
        onClick={onClose}
      />

      <section className={`story-cinematic__stage story-cinematic__stage--${mode}`}>
        <div className="story-cinematic__scene-layer">
          <div className="story-cinematic__scene-avatar story-cinematic__scene-avatar--far" />
          <div className="story-cinematic__scene-avatar story-cinematic__scene-avatar--lead" />
        </div>

        <div className="story-cinematic__dialog-panel">
          <div className="story-cinematic__dialog-main">
            <div className="story-cinematic__hud">
              <button type="button" className="story-cinematic__return" onClick={onClose}>
                返回
              </button>
              <div className="story-cinematic__meta">
                <p>MAIN STORY</p>
                <h3>
                  <BlurText
                    key={title}
                    text={title}
                    delay={90}
                    animateBy="words"
                    direction="bottom"
                    stepDuration={52}
                  />
                </h3>
              </div>
            </div>

            <div className="story-cinematic__dialog-copy">
              <strong className="story-cinematic__speaker">
                {latestLine?.speaker || (mode === "branch" ? "剧情系统" : "旁白")}
              </strong>
              <div className="story-cinematic__dialog-text">
                {loading ? (
                  <Bounce>
                    <p>剧情同步中...</p>
                  </Bounce>
                ) : latestLine ? (
                  <Bounce>
                    <p>{latestLine.text}</p>
                  </Bounce>
                ) : (
                  <Bounce>
                    <p>{subtitle || "先选择一条最适合当前人格设定的人生主线。"}</p>
                  </Bounce>
                )}
              </div>
            </div>
          </div>

          <div className="story-cinematic__dialog-side">
            {!loading && mode === "branch"
              ? branchOptions.map((branch) => (
                  <StoryChoiceButton
                    key={branch.key}
                    item={branch}
                    recommended={branch.recommended}
                    onClick={() => onStart?.(branch)}
                  />
                ))
              : null}

            {!loading && mode === "scene"
              ? choices.map((choice) => (
                  <StoryChoiceButton
                    key={choice.key}
                    item={choice}
                    onClick={() => onChoose?.(choice)}
                  />
                ))
              : null}
          </div>
        </div>
      </section>
    </div>
  );
}
