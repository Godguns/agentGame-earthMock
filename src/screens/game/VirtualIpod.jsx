function IpodIcon({ kind }) {
  const commonProps = {
    viewBox: "0 0 24 24",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg",
    "aria-hidden": "true",
  };

  if (kind === "play") {
    return (
      <svg {...commonProps}>
        <path d="M9 7.4L16.2 12L9 16.6V7.4Z" fill="currentColor" />
      </svg>
    );
  }

  if (kind === "prev") {
    return (
      <svg {...commonProps}>
        <path d="M14.8 8L9.6 12L14.8 16V8Z" fill="currentColor" />
        <path d="M8 8V16" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    );
  }

  if (kind === "next") {
    return (
      <svg {...commonProps}>
        <path d="M9.2 8L14.4 12L9.2 16V8Z" fill="currentColor" />
        <path d="M16 8V16" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    );
  }

  return null;
}

export function VirtualIpod({ onClose }) {
  return (
    <div
      className="surface-overlay surface-overlay--ipod"
      role="dialog"
      aria-modal="true"
      aria-label="iPod music controller"
    >
      <button
        type="button"
        className="surface-overlay__backdrop"
        onClick={onClose}
        aria-label="关闭 iPod 界面"
      />

      <section className="virtual-ipod">
        <div className="virtual-ipod__glow" />
        <header className="virtual-ipod__header">
          <p className="virtual-surface__label">MEMORY NOISE</p>
          <button
            type="button"
            className="virtual-surface__close"
            onClick={onClose}
          >
            Close
          </button>
        </header>

        <div className="virtual-ipod__album">
          <span>Now Playing</span>
          <strong>Bedroom Rain Demo</strong>
          <em>以后这里会接真实 BGM / 环境音控制</em>
        </div>

        <div className="virtual-ipod__timeline">
          <span className="virtual-ipod__timeline-bar">
            <span className="virtual-ipod__timeline-progress" />
          </span>
          <div className="virtual-ipod__timeline-meta">
            <span>01:24</span>
            <span>03:58</span>
          </div>
        </div>

        <div className="virtual-ipod__controls">
          <button type="button" className="virtual-ipod__control" aria-label="上一首">
            <IpodIcon kind="prev" />
          </button>
          <button type="button" className="virtual-ipod__control virtual-ipod__control--play" aria-label="播放">
            <IpodIcon kind="play" />
          </button>
          <button type="button" className="virtual-ipod__control" aria-label="下一首">
            <IpodIcon kind="next" />
          </button>
        </div>

        <div className="virtual-ipod__sliders">
          <label>
            <span>BGM</span>
            <input type="range" min="0" max="100" defaultValue="58" />
          </label>
          <label>
            <span>Rain</span>
            <input type="range" min="0" max="100" defaultValue="34" />
          </label>
        </div>
      </section>
    </div>
  );
}
