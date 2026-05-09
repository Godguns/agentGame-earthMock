function PcIcon({ kind }) {
  const commonProps = {
    viewBox: "0 0 24 24",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg",
    "aria-hidden": "true",
  };

  if (kind === "start") {
    return (
      <svg {...commonProps}>
        <path d="M5 5H11V11H5V5ZM13 5H19V11H13V5ZM5 13H11V19H5V13ZM13 13H19V19H13V13Z" fill="currentColor" />
      </svg>
    );
  }

  if (kind === "chat") {
    return (
      <svg {...commonProps}>
        <path d="M7 8.5C7 7.1 8.1 6 9.5 6H14.5C15.9 6 17 7.1 17 8.5V11.5C17 12.9 15.9 14 14.5 14H11.8L9.2 16.3V14H9.5C8.1 14 7 12.9 7 11.5V8.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      </svg>
    );
  }

  if (kind === "mail") {
    return (
      <svg {...commonProps}>
        <rect x="5.5" y="7" width="13" height="10" rx="2" stroke="currentColor" strokeWidth="1.5" />
        <path d="M6.5 8L12 12.5L17.5 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  if (kind === "folder") {
    return (
      <svg {...commonProps}>
        <path d="M6 8.5C6 7.7 6.7 7 7.5 7H10L11.1 8.2H16.5C17.3 8.2 18 8.9 18 9.7V15.5C18 16.3 17.3 17 16.5 17H7.5C6.7 17 6 16.3 6 15.5V8.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      </svg>
    );
  }

  if (kind === "browser") {
    return (
      <svg {...commonProps}>
        <circle cx="12" cy="12" r="6.5" stroke="currentColor" strokeWidth="1.5" />
        <path d="M5.8 10.2H18.2M12 5.5C13.6 7.3 14.5 9.6 14.5 12C14.5 14.4 13.6 16.7 12 18.5C10.4 16.7 9.5 14.4 9.5 12C9.5 9.6 10.4 7.3 12 5.5Z" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    );
  }

  if (kind === "power") {
    return (
      <svg {...commonProps}>
        <path d="M12 4.8V12.2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        <path d="M8 6.2C6.4 7.3 5.4 9.1 5.4 11.2C5.4 14.7 8.3 17.6 11.8 17.6C15.3 17.6 18.2 14.7 18.2 11.2C18.2 9.1 17.2 7.3 15.6 6.2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    );
  }

  return null;
}

const TASKBAR_APPS = [
  { id: "start", label: "Start", icon: "start" },
  { id: "chat", label: "Chat", icon: "chat" },
  { id: "jobs", label: "Jobs", icon: "folder" },
  { id: "browser", label: "Browser", icon: "browser" },
  { id: "mail", label: "Mail", icon: "mail" },
];

export function VirtualPc({ onClose }) {
  return (
    <div
      className="surface-overlay surface-overlay--pc"
      role="dialog"
      aria-modal="true"
      aria-label="PC workstation"
    >
      <button
        type="button"
        className="surface-overlay__backdrop"
        onClick={onClose}
        aria-label="关闭电脑界面"
      />

      <section className="virtual-pc">
        <div className="virtual-pc__wallpaper" />

        <header className="virtual-pc__topbar">
          <div>
            <p className="virtual-pc__eyebrow">WORKSTATION</p>
            <h2 className="virtual-pc__title">Desktop Session</h2>
          </div>
          <button
            type="button"
            className="virtual-surface__close"
            onClick={onClose}
          >
            Close
          </button>
        </header>

        <div className="virtual-pc__grid">
          <section className="virtual-pc__window virtual-pc__window--hero">
            <span className="virtual-surface__label">Today</span>
            <h3>Windows 11 风格工作台</h3>
            <p>
              这里后续可以承接邮件、即时消息、招聘网站、文档和老板消息。
            </p>
            <div className="virtual-pc__hero-actions">
              <button type="button" className="virtual-pc__chip">
                Resume Work
              </button>
              <button type="button" className="virtual-pc__chip">
                Check Mail
              </button>
            </div>
          </section>

          <section className="virtual-pc__window">
            <span className="virtual-surface__label">Pinned</span>
            <ul className="virtual-pc__list">
              <li>招聘平台：3 条新岗位</li>
              <li>工作群：老板在 00:21 留了语音</li>
              <li>邮件：待处理报表 1 份</li>
            </ul>
          </section>

          <section className="virtual-pc__window">
            <span className="virtual-surface__label">Widgets</span>
            <div className="virtual-pc__stats">
              <article>
                <strong>23:14</strong>
                <span>今晚还没真正下班</span>
              </article>
              <article>
                <strong>¥ 2,631.50</strong>
                <span>下次扣款还有 3 天</span>
              </article>
            </div>
          </section>
        </div>

        <footer className="virtual-pc__taskbar">
          <div className="virtual-pc__taskbar-icons">
            {TASKBAR_APPS.map((app) => (
              <button
                key={app.id}
                type="button"
                className="virtual-pc__taskbar-app"
                aria-label={app.label}
              >
                <PcIcon kind={app.icon} />
              </button>
            ))}
          </div>

          <div className="virtual-pc__tray">
            <span>CN</span>
            <span>23:14</span>
            <button
              type="button"
              className="virtual-pc__taskbar-app virtual-pc__taskbar-app--power"
              aria-label="关闭电脑界面"
              onClick={onClose}
            >
              <PcIcon kind="power" />
            </button>
          </div>
        </footer>
      </section>
    </div>
  );
}
