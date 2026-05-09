function DesktopIconGlyph({ kind }) {
  const commonProps = {
    viewBox: "0 0 24 24",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg",
    "aria-hidden": "true",
  };

  if (kind === "bin") {
    return (
      <svg {...commonProps}>
        <path d="M8 7H16L15.2 18H8.8L8 7Z" fill="#E9F5FF" />
        <path d="M9.5 4.8H14.5L15 6.5H9L9.5 4.8Z" fill="#D6E9FF" />
        <path d="M8.7 10.3L15.2 15.8M15.2 10.3L8.7 15.8" stroke="#48C878" strokeWidth="1.2" strokeLinecap="round" />
      </svg>
    );
  }

  if (kind === "chrome") {
    return (
      <svg {...commonProps}>
        <circle cx="12" cy="12" r="9" fill="#F44336" />
        <path d="M12 12L20.4 12A8.4 8.4 0 0 1 8 19.3Z" fill="#4CAF50" />
        <path d="M12 12L7.7 4.4A8.4 8.4 0 0 1 20.4 12Z" fill="#FFC107" />
        <circle cx="12" cy="12" r="4.3" fill="#1E88E5" stroke="#DFF3FF" strokeWidth="1.1" />
      </svg>
    );
  }

  if (kind === "folder") {
    return (
      <svg {...commonProps}>
        <path d="M4.5 8.2C4.5 7.3 5.2 6.6 6.1 6.6H9.3L10.6 8H17.9C18.8 8 19.5 8.7 19.5 9.6V16.8C19.5 17.7 18.8 18.4 17.9 18.4H6.1C5.2 18.4 4.5 17.7 4.5 16.8V8.2Z" fill="#FFD768" />
        <path d="M4.5 9.6H19.5V11.2H4.5V9.6Z" fill="#FFBF3F" />
      </svg>
    );
  }

  if (kind === "sheet") {
    return (
      <svg {...commonProps}>
        <path d="M7 3.8H14.7L18 7.1V19.2H7V3.8Z" fill="#FFFFFF" />
        <path d="M14.7 3.8V7.1H18" fill="#DCEBFF" />
        <path d="M9.2 10.1H15.8M9.2 13H15.8M9.2 15.9H13.7" stroke="#A9B7CC" strokeWidth="1.1" strokeLinecap="round" />
      </svg>
    );
  }

  if (kind === "code") {
    return (
      <svg {...commonProps}>
        <rect x="4.2" y="4.2" width="15.6" height="15.6" rx="3.2" fill="#1976D2" />
        <path d="M9.4 9.2L7.1 12L9.4 14.8M14.6 9.2L16.9 12L14.6 14.8" stroke="#EAF4FF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  if (kind === "mail") {
    return (
      <svg {...commonProps}>
        <rect x="4.8" y="6.4" width="14.4" height="11.2" rx="2.2" fill="#2A74FF" />
        <path d="M6.3 8L12 12L17.7 8" stroke="#F7FBFF" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  if (kind === "note") {
    return (
      <svg {...commonProps}>
        <rect x="5.4" y="4.6" width="13.2" height="14.8" rx="2.2" fill="#20242D" />
        <path d="M8.2 9.2H15.8M8.2 12H15.8M8.2 14.8H13.4" stroke="#7FE7B8" strokeWidth="1.2" strokeLinecap="round" />
      </svg>
    );
  }

  if (kind === "image") {
    return (
      <svg {...commonProps}>
        <rect x="4.5" y="5.1" width="15" height="13.8" rx="2.4" fill="#1D2027" />
        <path d="M6.8 15.4L10.3 11.7L13.5 14.9L15.5 12.8L18 15.4V17.2H6.8V15.4Z" fill="#FFD36A" />
        <circle cx="9.2" cy="9" r="1.3" fill="#EAF4FF" />
      </svg>
    );
  }

  if (kind === "search") {
    return (
      <svg {...commonProps}>
        <circle cx="10.5" cy="10.5" r="4.8" stroke="currentColor" strokeWidth="1.6" />
        <path d="M14 14L18 18" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    );
  }

  if (kind === "start") {
    return (
      <svg {...commonProps}>
        <path d="M5 5H11V11H5V5ZM13 5H19V11H13V5ZM5 13H11V19H5V13ZM13 13H19V19H13V13Z" fill="currentColor" />
      </svg>
    );
  }

  if (kind === "browser") {
    return (
      <svg {...commonProps}>
        <circle cx="12" cy="12" r="9" fill="#1E88E5" />
        <path d="M12 3C15.6 3 18.7 5.2 20 8.4H12V3Z" fill="#43A047" />
        <path d="M6 18.5C4.1 16.9 3 14.6 3 12H12L6 18.5Z" fill="#FBC02D" />
        <circle cx="12" cy="12" r="4.2" fill="#FFFFFF" opacity="0.92" />
      </svg>
    );
  }

  if (kind === "jobs") {
    return (
      <svg {...commonProps}>
        <rect x="5.2" y="6.2" width="13.6" height="11.6" rx="2.2" fill="#F0B43C" />
        <path d="M9.2 6.2V5.4C9.2 4.8 9.7 4.3 10.3 4.3H13.7C14.3 4.3 14.8 4.8 14.8 5.4V6.2" stroke="#FFF6D8" strokeWidth="1.2" />
        <path d="M5.2 10.1H18.8" stroke="#FFF6D8" strokeWidth="1.2" />
      </svg>
    );
  }

  if (kind === "wechat") {
    return (
      <svg {...commonProps}>
        <rect x="3.2" y="3.2" width="17.6" height="17.6" rx="4.4" fill="#33D16B" />
        <path d="M8.2 11.4C8.2 9.4 10.1 7.8 12.5 7.8C14.9 7.8 16.8 9.4 16.8 11.4C16.8 13.4 14.9 15 12.5 15H11.2L9.2 16.8L9.5 14.6C8.7 14 8.2 12.8 8.2 11.4Z" fill="#FFFFFF" />
        <circle cx="11.3" cy="11.1" r="0.55" fill="#33D16B" />
        <circle cx="13.7" cy="11.1" r="0.55" fill="#33D16B" />
      </svg>
    );
  }

  return null;
}

const DESKTOP_ITEMS = [
  { id: "bin", label: "回收站", kind: "bin" },
  { id: "chrome", label: "Google Chrome", kind: "chrome" },
  { id: "shortcut", label: "chrome - 快捷方式", kind: "sheet" },
  { id: "asset", label: "素材", kind: "image" },
  { id: "tool", label: "batch-tool", kind: "folder" },
  { id: "report", label: "机器人自测报告.xlsx", kind: "sheet" },
  { id: "cursor", label: "Cursor", kind: "code" },
  { id: "vscode", label: "Visual Studio Code", kind: "code" },
  { id: "api", label: "# For producti...", kind: "sheet" },
  { id: "wechat-dev", label: "微信开发者工具", kind: "note" },
  { id: "switch", label: "4种5位置切换", kind: "sheet" },
  { id: "avatar", label: "godguns.jpg", kind: "image" },
  { id: "wps", label: "WPS Office", kind: "sheet" },
  { id: "home", label: "home.png", kind: "image" },
  { id: "log", label: "日报记录.txt", kind: "sheet" },
  { id: "skill", label: "SKILL.md", kind: "sheet" },
  { id: "pdf", label: "测试pdf1.pdf", kind: "sheet" },
  { id: "docs", label: "个人资料", kind: "folder" },
];

const TASKBAR_ITEMS = [
  { id: "start", kind: "start", active: false },
  { id: "search", kind: "search", active: false },
  { id: "folder", kind: "folder", active: true },
  { id: "browser", kind: "browser", active: true },
  { id: "jobs", kind: "jobs", active: false },
  { id: "wechat", kind: "wechat", active: false },
  { id: "note", kind: "note", active: false },
];

export function VirtualPc({ onClose }) {
  return (
    <div
      className="surface-overlay surface-overlay--pc"
      role="dialog"
      aria-modal="true"
      aria-label="Windows desktop"
    >
      <button
        type="button"
        className="surface-overlay__backdrop"
        onClick={onClose}
        aria-label="关闭电脑界面"
      />

      <section className="virtual-pc virtual-pc--desktop">
        <div className="virtual-pc__desktop-shell">
          <div className="virtual-pc__desktop-glow virtual-pc__desktop-glow--left" />
          <div className="virtual-pc__desktop-glow virtual-pc__desktop-glow--right" />

          <button
            type="button"
            className="virtual-pc__close-orb"
            onClick={onClose}
            aria-label="关闭电脑界面"
          >
            ×
          </button>

          <div className="virtual-pc__desktop-icons">
            {DESKTOP_ITEMS.map((item) => (
              <button
                key={item.id}
                type="button"
                className="virtual-pc__desktop-item"
              >
                <span className={`virtual-pc__desktop-item-icon is-${item.kind}`}>
                  <DesktopIconGlyph kind={item.kind} />
                </span>
                <span className="virtual-pc__desktop-item-label">{item.label}</span>
              </button>
            ))}
          </div>

          <footer className="virtual-pc__taskbar-dock">
            <div className="virtual-pc__taskbar-left">
              <button type="button" className="virtual-pc__dock-pill">
                <DesktopIconGlyph kind="search" />
                <span>搜索</span>
              </button>
            </div>

            <div className="virtual-pc__taskbar-center">
              {TASKBAR_ITEMS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={`virtual-pc__taskbar-icon ${
                    item.active ? "is-active" : ""
                  }`}
                >
                  <DesktopIconGlyph kind={item.kind} />
                </button>
              ))}
            </div>

            <div className="virtual-pc__taskbar-right">
              <div className="virtual-pc__tray-icons">
                <span>⌃</span>
                <span>🌐</span>
                <span>🔋</span>
              </div>
              <div className="virtual-pc__tray-meta">
                <strong>14:22</strong>
                <span>2026/5/9</span>
              </div>
            </div>
          </footer>
        </div>
      </section>
    </div>
  );
}
