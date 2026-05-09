import { useMemo, useState } from "react";

function DesktopIconGlyph({ kind }) {
  const commonProps = {
    viewBox: "0 0 24 24",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg",
    "aria-hidden": "true",
  };

  if (kind === "folder") {
    return (
      <svg {...commonProps}>
        <path d="M4.5 8.2C4.5 7.3 5.2 6.6 6.1 6.6H9.3L10.6 8H17.9C18.8 8 19.5 8.7 19.5 9.6V16.8C19.5 17.7 18.8 18.4 17.9 18.4H6.1C5.2 18.4 4.5 17.7 4.5 16.8V8.2Z" fill="#FFD768" />
        <path d="M4.5 9.6H19.5V11.2H4.5V9.6Z" fill="#FFBF3F" />
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

  if (kind === "note") {
    return (
      <svg {...commonProps}>
        <rect x="5.4" y="4.6" width="13.2" height="14.8" rx="2.2" fill="#20242D" />
        <path d="M8.2 9.2H15.8M8.2 12H15.8M8.2 14.8H13.4" stroke="#7FE7B8" strokeWidth="1.2" strokeLinecap="round" />
      </svg>
    );
  }

  if (kind === "terminal") {
    return (
      <svg {...commonProps}>
        <rect x="4.2" y="5.4" width="15.6" height="13.2" rx="2.4" fill="#12151D" />
        <path d="M8.1 10L10.7 12L8.1 14" stroke="#8BFFB4" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M12.2 14.2H15.8" stroke="#8BFFB4" strokeWidth="1.4" strokeLinecap="round" />
      </svg>
    );
  }

  if (kind === "message") {
    return (
      <svg {...commonProps}>
        <rect x="4.4" y="5.4" width="15.2" height="13.2" rx="3.2" fill="#4D8DFF" />
        <path d="M7.4 9.2H16.6M7.4 12H13.2" stroke="#F8FCFF" strokeWidth="1.4" strokeLinecap="round" />
      </svg>
    );
  }

  if (kind === "network") {
    return (
      <svg {...commonProps}>
        <path d="M5.3 9.7C9.6 6 14.4 6 18.7 9.7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M7.8 12.3C10.7 9.9 13.3 9.9 16.2 12.3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M10.3 15C11.5 14.1 12.5 14.1 13.7 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="12" cy="17.6" r="1.2" fill="currentColor" />
      </svg>
    );
  }

  if (kind === "battery") {
    return (
      <svg {...commonProps}>
        <rect x="5.2" y="8.1" width="12.8" height="7.8" rx="1.6" stroke="currentColor" strokeWidth="1.5" />
        <path d="M18 10.3H19.2V13.7H18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <rect x="7.2" y="10" width="7.4" height="4" rx="0.8" fill="currentColor" />
      </svg>
    );
  }

  return null;
}

const DESKTOP_ITEMS = [
  { id: "folder", label: "个人资料", kind: "folder", open: "files", openMode: "double" },
  { id: "messageApp", label: "信息软件", kind: "message", open: "messages", openMode: "double" },
];

const TASKBAR_ITEMS = [
  { id: "start", kind: "start", action: "start" },
  { id: "search", kind: "search", action: "search" },
  { id: "folder", kind: "folder", action: "files" },
  { id: "browser", kind: "browser", action: "browser" },
  { id: "jobs", kind: "jobs", action: "jobs" },
  { id: "wechat", kind: "wechat", action: "messages" },
  { id: "note", kind: "note", action: "notes" },
];

const START_MENU_APPS = [
  { id: "terminal", label: "终端", subtitle: "高级功能入口", kind: "terminal" },
  { id: "messages", label: "信息软件", subtitle: "日常消息", kind: "message" },
  { id: "jobs", label: "招聘面板", subtitle: "投递与收藏岗位", kind: "jobs" },
  { id: "notes", label: "备忘录", subtitle: "今天先记下来", kind: "note" },
  { id: "browser", label: "浏览器", subtitle: "世界入口", kind: "browser" },
  { id: "files", label: "文件", subtitle: "最近文件", kind: "folder" },
];

const SEARCH_RESULTS = [
  { id: "messages", title: "信息软件", subtitle: "继续昨天没说完的话" },
  { id: "terminal", title: "终端", subtitle: "系统 shell 与隐藏功能入口" },
  { id: "files", title: "个人资料", subtitle: "打开桌面文件夹" },
];

const QUICK_PANEL_CONTENT = {
  network: {
    title: "网络",
    body: "Bedroom-WiFi 已连接。信号稳定，但外面的世界未必稳定。",
  },
  battery: {
    title: "电池",
    body: "设备电量 82%。今天还能亮很久，但人不一定。",
  },
};

const GENERIC_WINDOWS = {
  jobs: {
    title: "招聘面板",
    label: "JOB BOARD",
    body: "三条新岗位刚刚更新，关键词都写着：抗压、成长、主动、拥抱变化。",
  },
  notes: {
    title: "备忘录",
    label: "MEMO",
    body: "“先活过今天。” 有些提醒写下来，不一定会更轻，但至少不会彻底消失。",
  },
  browser: {
    title: "浏览器",
    label: "WORLD LINK",
    body: "后续这里很适合承接真正的网页式交互，比如资讯、论坛、社交和外部世界噪音。",
  },
  files: {
    title: "个人资料",
    label: "FILES",
    body: "桌面被故意收得很干净，只留下几条真正有用的入口。后面这里可以展开成更完整的文件系统。",
  },
};

const MESSAGE_THREADS = [
  {
    id: "partner",
    name: "最亲近的人",
    time: "15:09",
    preview: "电脑还在被同事用",
    unread: 18,
    accent: "is-green",
  },
  {
    id: "mortgage",
    name: "银行业务提醒",
    time: "03/24",
    preview: "下月起还款日调整",
    unread: 0,
  },
  {
    id: "group",
    name: "项目小组",
    time: "15:10",
    preview: "飞机停了好多，先别急",
    unread: 0,
  },
  {
    id: "public",
    name: "公众号",
    time: "15:02",
    preview: "工会通知已发布，请查收",
    unread: 4,
  },
];

function StartMenu({ onOpenApp }) {
  return (
    <section className="virtual-pc__start-menu" role="menu" aria-label="开始菜单">
      <div className="virtual-pc__start-search">
        <DesktopIconGlyph kind="search" />
        <span>输入以搜索应用、文档和设置</span>
      </div>

      <div className="virtual-pc__start-section">
        <div className="virtual-pc__start-section-head">
          <strong>Pinned</strong>
          <span>All apps</span>
        </div>

        <div className="virtual-pc__start-grid">
          {START_MENU_APPS.map((app) => (
            <button
              key={app.id}
              type="button"
              className="virtual-pc__start-app"
              onClick={() => onOpenApp(app.id)}
            >
              <span className="virtual-pc__start-app-icon">
                <DesktopIconGlyph kind={app.kind} />
              </span>
              <span className="virtual-pc__start-app-copy">
                <strong>{app.label}</strong>
                <em>{app.subtitle}</em>
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="virtual-pc__start-section virtual-pc__start-section--recommend">
        <div className="virtual-pc__start-section-head">
          <strong>Recommended</strong>
        </div>
        <article className="virtual-pc__recommend-card">
          <strong>昨晚未关闭的工作</strong>
          <p>上次离开桌面时，终端还停在一行没有回车的命令前。</p>
        </article>
      </div>
    </section>
  );
}

function SearchPanel({ onOpenApp }) {
  return (
    <section className="virtual-pc__search-panel" aria-label="搜索面板">
      <div className="virtual-pc__search-panel-head">
        <DesktopIconGlyph kind="search" />
        <span>搜索应用、文件和命令</span>
      </div>

      <div className="virtual-pc__search-results">
        {SEARCH_RESULTS.map((item) => (
          <button
            key={item.id}
            type="button"
            className="virtual-pc__search-result"
            onClick={() => onOpenApp(item.id)}
          >
            <strong>{item.title}</strong>
            <span>{item.subtitle}</span>
          </button>
        ))}
      </div>
    </section>
  );
}

function QuickPanel({ kind }) {
  const panel = QUICK_PANEL_CONTENT[kind];
  if (!panel) {
    return null;
  }

  return (
    <section className="virtual-pc__quick-panel" aria-label={panel.title}>
      <strong>{panel.title}</strong>
      <p>{panel.body}</p>
    </section>
  );
}

function TerminalWindow({ onClose, onOpenApp, onOpenQuickPanel }) {
  const [history, setHistory] = useState([
    { type: "output", text: "earth.online shell ready" },
    { type: "output", text: "type 'help' to list available commands" },
  ]);
  const [command, setCommand] = useState("");

  const runCommand = (raw) => {
    const nextHistory = [...history, { type: "input", text: raw }];
    const parts = raw.split(" ");
    const base = parts[0].toLowerCase();
    const arg = parts.slice(1).join(" ").trim().toLowerCase();

    if (base === "clear") {
      setHistory([]);
      return;
    }

    if (base === "help") {
      setHistory([
        ...nextHistory,
        { type: "output", text: "available: help, clear, status, echo <text>" },
        { type: "output", text: "open <messages|jobs|notes|files|browser|network|battery>" },
      ]);
      return;
    }

    if (base === "status") {
      setHistory([
        ...nextHistory,
        { type: "output", text: "scene: bedroom / desk: online / shell: ready" },
      ]);
      return;
    }

    if (base === "echo") {
      setHistory([
        ...nextHistory,
        { type: "output", text: parts.slice(1).join(" ") || "(empty)" },
      ]);
      return;
    }

    if (base === "open" && arg) {
      if (["messages", "jobs", "notes", "files", "browser"].includes(arg)) {
        setHistory([...nextHistory, { type: "output", text: `opening ${arg}...` }]);
        window.setTimeout(() => onOpenApp(arg), 120);
        return;
      }

      if (["network", "battery"].includes(arg)) {
        setHistory([...nextHistory, { type: "output", text: `opening ${arg} panel...` }]);
        window.setTimeout(() => onOpenQuickPanel(arg), 120);
        return;
      }
    }

    setHistory([...nextHistory, { type: "output", text: `'${raw}' is not recognized.` }]);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const raw = command.trim();
    if (!raw) {
      return;
    }
    runCommand(raw);
    setCommand("");
  };

  return (
    <section className="virtual-pc__app-window virtual-pc__app-window--terminal">
      <header className="virtual-pc__app-window-head">
        <div className="virtual-pc__window-dots" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
        <strong>Terminal</strong>
        <button type="button" className="virtual-pc__window-close" onClick={onClose}>
          ×
        </button>
      </header>

      <div className="virtual-pc__terminal-body">
        {history.map((entry, index) => (
          <p
            key={`${entry.type}-${entry.text}-${index}`}
            className={`virtual-pc__terminal-line ${
              entry.type === "input" ? "is-command" : ""
            }`}
          >
            <span className="virtual-pc__terminal-prefix">
              {entry.type === "input" ? "C:\\Users\\player>" : "system:"}
            </span>
            {entry.text}
          </p>
        ))}

        <form className="virtual-pc__terminal-form" onSubmit={handleSubmit}>
          <label className="virtual-pc__terminal-line is-input">
            <span className="virtual-pc__terminal-prefix">C:\Users\player&gt;</span>
            <input
              className="virtual-pc__terminal-input"
              value={command}
              onChange={(event) => setCommand(event.target.value)}
              autoFocus
              spellCheck="false"
            />
          </label>
        </form>
      </div>
    </section>
  );
}

function MessagesWindow({ onClose }) {
  const [activeThreadId, setActiveThreadId] = useState("partner");
  const [draft, setDraft] = useState("");
  const [messages, setMessages] = useState([
    { id: "m1", who: "them", text: "应该秒到" },
    { id: "m2", who: "them", text: "看看你邮箱" },
    { id: "m3", who: "me", text: "还没到" },
    { id: "m4", who: "me", text: "到了我发你" },
    { id: "m5", who: "them", text: "OK" },
  ]);

  const sendMessage = () => {
    const value = draft.trim();
    if (!value) {
      return;
    }

    setMessages((current) => [
      ...current,
      { id: `m-${Date.now()}`, who: "me", text: value },
    ]);
    setDraft("");
  };

  return (
    <section className="virtual-pc__chat-window">
      <header className="virtual-pc__chat-titlebar">
        <div className="virtual-pc__window-dots" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
        <strong>信息软件</strong>
        <button type="button" className="virtual-pc__window-close" onClick={onClose}>
          ×
        </button>
      </header>

      <div className="virtual-pc__chat-shell">
        <aside className="virtual-pc__chat-rail">
          <button type="button" className="is-active">
            <DesktopIconGlyph kind="wechat" />
          </button>
          <button type="button">
            <DesktopIconGlyph kind="message" />
          </button>
          <button type="button">
            <DesktopIconGlyph kind="folder" />
          </button>
        </aside>

        <section className="virtual-pc__chat-list-panel">
          <div className="virtual-pc__chat-search">搜索</div>
          <div className="virtual-pc__chat-thread-list">
            {MESSAGE_THREADS.map((thread) => (
              <button
                key={thread.id}
                type="button"
                className={`virtual-pc__chat-thread ${
                  activeThreadId === thread.id ? "is-active" : ""
                }`}
                onClick={() => setActiveThreadId(thread.id)}
              >
                <span className={`virtual-pc__chat-avatar ${thread.accent || ""}`}>
                  {thread.name.slice(0, 1)}
                </span>
                <span className="virtual-pc__chat-thread-copy">
                  <strong>{thread.name}</strong>
                  <em>{thread.preview}</em>
                </span>
                <span className="virtual-pc__chat-thread-meta">
                  <small>{thread.time}</small>
                  {thread.unread ? (
                    <span className="virtual-pc__chat-badge">{thread.unread}</span>
                  ) : null}
                </span>
              </button>
            ))}
          </div>
        </section>

        <section className="virtual-pc__chat-main">
          <div className="virtual-pc__chat-main-head">
            <strong>最亲近的人</strong>
            <span>正在电脑端登录</span>
          </div>

          <div className="virtual-pc__chat-messages">
            <div className="virtual-pc__chat-image-card">
              <div className="virtual-pc__chat-image-preview" />
              <span>15:28</span>
            </div>

            {messages.map((message) => (
              <div
                key={message.id}
                className={`virtual-pc__chat-bubble-row ${
                  message.who === "me" ? "is-me" : ""
                }`}
              >
                <span className="virtual-pc__chat-bubble">{message.text}</span>
              </div>
            ))}
          </div>

          <div className="virtual-pc__chat-compose">
            <div className="virtual-pc__chat-compose-surface">
              <textarea
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                autoFocus
                placeholder="输入消息..."
              />

              <div className="virtual-pc__chat-compose-footer">
                <div className="virtual-pc__chat-compose-tools">
                  <button type="button" aria-label="表情">☺</button>
                  <button type="button" aria-label="收藏">⬡</button>
                  <button type="button" aria-label="文件">🗂</button>
                  <button type="button" aria-label="截图">✂</button>
                  <button type="button" aria-label="语音">🎤</button>
                </div>

                <div className="virtual-pc__chat-compose-actions">
                  <button type="button" aria-label="语音消息">🔊</button>
                  <span className="virtual-pc__chat-compose-divider" />
                  <button type="button" onClick={sendMessage}>
                    发送
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </section>
  );
}

function GenericWindow({ appId, onClose }) {
  const windowInfo = GENERIC_WINDOWS[appId];
  if (!windowInfo) {
    return null;
  }

  return (
    <section className="virtual-pc__app-window">
      <header className="virtual-pc__app-window-head">
        <div className="virtual-pc__window-dots" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
        <strong>{windowInfo.title}</strong>
        <button type="button" className="virtual-pc__window-close" onClick={onClose}>
          ×
        </button>
      </header>

      <div className="virtual-pc__app-window-body">
        <span className="virtual-surface__label">{windowInfo.label}</span>
        <p>{windowInfo.body}</p>
      </div>
    </section>
  );
}

export function VirtualPc({ onClose }) {
  const [isStartOpen, setIsStartOpen] = useState(false);
  const [activeWindowId, setActiveWindowId] = useState(null);
  const [quickPanel, setQuickPanel] = useState(null);

  const taskbarState = useMemo(
    () =>
      TASKBAR_ITEMS.map((item) => ({
        ...item,
        active:
          item.id === "start"
            ? isStartOpen
            : item.id === "search"
              ? quickPanel === "search"
              : activeWindowId === "browser" && item.id === "browser"
                ? true
                : activeWindowId === "jobs" && item.id === "jobs"
                  ? true
                  : activeWindowId === "notes" && item.id === "note"
                    ? true
                    : activeWindowId === "messages" && item.id === "wechat"
                      ? true
                      : activeWindowId === "files" && item.id === "folder",
      })),
    [activeWindowId, isStartOpen, quickPanel],
  );

  const openWindow = (appId) => {
    setActiveWindowId(appId);
    setIsStartOpen(false);
    setQuickPanel(null);
  };

  const toggleQuickPanel = (panelId) => {
    setQuickPanel((current) => (current === panelId ? null : panelId));
    setIsStartOpen(false);
  };

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
                onDoubleClick={() => {
                  if (item.openMode === "double") {
                    openWindow(item.open);
                  }
                }}
              >
                <span className={`virtual-pc__desktop-item-icon is-${item.kind}`}>
                  <DesktopIconGlyph kind={item.kind} />
                </span>
                <span className="virtual-pc__desktop-item-label">{item.label}</span>
              </button>
            ))}
          </div>

          {activeWindowId === "terminal" ? (
            <TerminalWindow
              onClose={() => setActiveWindowId(null)}
              onOpenApp={openWindow}
              onOpenQuickPanel={toggleQuickPanel}
            />
          ) : activeWindowId === "messages" ? (
            <MessagesWindow onClose={() => setActiveWindowId(null)} />
          ) : activeWindowId ? (
            <GenericWindow
              appId={activeWindowId}
              onClose={() => setActiveWindowId(null)}
            />
          ) : null}

          {isStartOpen ? <StartMenu onOpenApp={openWindow} /> : null}
          {quickPanel === "search" ? (
            <SearchPanel onOpenApp={openWindow} />
          ) : null}
          {quickPanel && quickPanel !== "search" ? (
            <QuickPanel kind={quickPanel} />
          ) : null}

          <footer className="virtual-pc__taskbar-dock">
            <div className="virtual-pc__taskbar-left">
              <button
                type="button"
                className="virtual-pc__dock-pill"
                onClick={() => toggleQuickPanel("search")}
              >
                <DesktopIconGlyph kind="search" />
                <span>搜索</span>
              </button>
            </div>

            <div className="virtual-pc__taskbar-center">
              {taskbarState.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={`virtual-pc__taskbar-icon ${
                    item.active ? "is-active" : ""
                  }`}
                  onClick={() => {
                    if (item.action === "start") {
                      setIsStartOpen((current) => !current);
                      setQuickPanel(null);
                      return;
                    }

                    if (item.action === "search") {
                      toggleQuickPanel("search");
                      return;
                    }

                    if (item.action) {
                      openWindow(item.action);
                    }
                  }}
                >
                  <DesktopIconGlyph kind={item.kind} />
                </button>
              ))}
            </div>

            <div className="virtual-pc__taskbar-right">
              <div className="virtual-pc__tray-icons">
                <button
                  type="button"
                  className="virtual-pc__tray-icon-button"
                  onClick={() => toggleQuickPanel("network")}
                >
                  <DesktopIconGlyph kind="network" />
                </button>
                <button
                  type="button"
                  className="virtual-pc__tray-icon-button"
                  onClick={() => toggleQuickPanel("battery")}
                >
                  <DesktopIconGlyph kind="battery" />
                </button>
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
