function IpadIcon({ kind }) {
  const commonProps = {
    viewBox: "0 0 24 24",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg",
    "aria-hidden": "true",
  };

  if (kind === "journal") {
    return (
      <svg {...commonProps}>
        <rect x="7" y="5.8" width="10" height="12.4" rx="1.8" stroke="currentColor" strokeWidth="1.5" />
        <path d="M10 9.2H14M10 12H14M10 14.8H12.7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    );
  }

  if (kind === "memory") {
    return (
      <svg {...commonProps}>
        <circle cx="12" cy="12" r="6.2" stroke="currentColor" strokeWidth="1.5" />
        <path d="M12 9V12.3L14.2 13.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  if (kind === "notes") {
    return (
      <svg {...commonProps}>
        <path d="M8 6.5H15.5C16.3 6.5 17 7.2 17 8V16.2L14.1 14.4L11.2 16.2L8.3 14.4L7 15.3V8C7 7.2 7.7 6.5 8.5 6.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      </svg>
    );
  }

  return null;
}

const IPAD_TABS = [
  { id: "journal", label: "日记", icon: "journal" },
  { id: "memory", label: "记忆", icon: "memory" },
  { id: "notes", label: "草稿", icon: "notes" },
];

export function VirtualIpad({ onClose }) {
  return (
    <div
      className="surface-overlay surface-overlay--ipad"
      role="dialog"
      aria-modal="true"
      aria-label="iPad journal surface"
    >
      <button
        type="button"
        className="surface-overlay__backdrop"
        onClick={onClose}
        aria-label="关闭 iPad 界面"
      />

      <section className="virtual-ipad">
        <header className="virtual-ipad__header">
          <div>
            <p className="virtual-surface__label">NOTE SURFACE</p>
            <h2>内心记录板</h2>
          </div>
          <button
            type="button"
            className="virtual-surface__close"
            onClick={onClose}
          >
            Close
          </button>
        </header>

        <div className="virtual-ipad__body">
          <aside className="virtual-ipad__sidebar">
            {IPAD_TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                className={`virtual-ipad__tab ${
                  tab.id === "journal" ? "is-active" : ""
                }`}
              >
                <IpadIcon kind={tab.icon} />
                <span>{tab.label}</span>
              </button>
            ))}
          </aside>

          <div className="virtual-ipad__content">
            <article className="virtual-ipad__page">
              <div className="virtual-ipad__page-top">
                <span>2026 / 05 / 09</span>
                <span>Syncing Mood Draft</span>
              </div>
              <h3>今天的你，还没真正进入白天。</h3>
              <p>
                iPad 这里后续很适合承接日记、状态回顾、记忆碎片、草稿和读书记录。
              </p>
              <div className="virtual-ipad__cards">
                <section>
                  <strong>昨晚残响</strong>
                  <p>你梦见自己回到学生时代，但醒来之后什么也没抓住。</p>
                </section>
                <section>
                  <strong>今日草稿</strong>
                  <p>“如果今天还是一样，那至少让我先把心情整理好。”</p>
                </section>
              </div>
            </article>
          </div>
        </div>
      </section>
    </div>
  );
}
