import { useEffect, useMemo, useRef, useState } from "react";

import { usePhoneStore } from "../../app/store/phoneStore";
import { GAME_SCENE_ASSETS } from "./gameSceneAssets";

const PHONE_AUDIO_SETTINGS = {
  enabled: true,
  volume: 0.05,
};

const PHONE_APPS = [
  { id: "messages", label: "信息", subtitle: "聊天与提醒", iconType: "image" },
  { id: "journal", label: "日记", subtitle: "昨日回声", iconType: "vector" },
  { id: "bank", label: "银行", subtitle: "账单同步", iconType: "image" },
  { id: "jobs", label: "招聘", subtitle: "新的机会", iconType: "vector" },
  { id: "player", label: "播放器", subtitle: "BGM 控制", iconType: "image" },
  { id: "settings", label: "设置", subtitle: "系统偏好", iconType: "vector" },
];

const PHONE_APP_ICON_ASSETS = {
  messages: GAME_SCENE_ASSETS.phoneAppChat,
  bank: GAME_SCENE_ASSETS.phoneAppBank,
  player: GAME_SCENE_ASSETS.phoneAppPlayer,
};

let sharedAudioContext = null;

function getAudioContext() {
  if (typeof window === "undefined") {
    return null;
  }

  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) {
    return null;
  }

  if (!sharedAudioContext) {
    sharedAudioContext = new AudioContextClass();
  }

  return sharedAudioContext;
}

function playPhoneUiSound(kind) {
  if (!PHONE_AUDIO_SETTINGS.enabled) {
    return;
  }

  const context = getAudioContext();
  if (!context) {
    return;
  }

  const now = context.currentTime;
  const gain = context.createGain();
  gain.connect(context.destination);
  gain.gain.setValueAtTime(0.0001, now);

  const oscillator = context.createOscillator();
  oscillator.type = kind === "close" ? "triangle" : "sine";
  oscillator.frequency.setValueAtTime(kind === "close" ? 290 : 390, now);
  oscillator.frequency.exponentialRampToValueAtTime(
    kind === "close" ? 210 : 520,
    now + (kind === "close" ? 0.11 : 0.14),
  );

  gain.gain.exponentialRampToValueAtTime(
    PHONE_AUDIO_SETTINGS.volume,
    now + 0.02,
  );
  gain.gain.exponentialRampToValueAtTime(
    0.0001,
    now + (kind === "close" ? 0.16 : 0.2),
  );

  oscillator.connect(gain);
  oscillator.start(now);
  oscillator.stop(now + (kind === "close" ? 0.18 : 0.22));
}

function PhoneVectorIcon({ kind }) {
  const commonProps = {
    viewBox: "0 0 24 24",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg",
    "aria-hidden": "true",
  };

  if (kind === "journal") {
    return (
      <svg {...commonProps}>
        <path
          d="M8 6.2H15.2C16 6.2 16.6 6.8 16.6 7.6V17.6H8.7C7.8 17.6 7.2 17 7.2 16.1V7C7.2 6.6 7.5 6.2 8 6.2Z"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <path
          d="M9.8 9.3H13.8M9.8 12H13.8"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    );
  }

  if (kind === "jobs") {
    return (
      <svg {...commonProps}>
        <path
          d="M9.2 7.3H14.8C15.6 7.3 16.2 7.9 16.2 8.7V16.8H7.8V8.7C7.8 7.9 8.4 7.3 9.2 7.3Z"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <path
          d="M10.1 7.3V6.6C10.1 6 10.6 5.5 11.2 5.5H12.8C13.4 5.5 13.9 6 13.9 6.6V7.3"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <path d="M7.8 11.2H16.2" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    );
  }

  if (kind === "settings") {
    return (
      <svg {...commonProps}>
        <path
          d="M12 9.3A2.7 2.7 0 1 0 12 14.7A2.7 2.7 0 1 0 12 9.3Z"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <path
          d="M12 5.5V7M12 17V18.5M17 12H18.5M5.5 12H7M15.9 8.1L14.9 9.1M9.1 14.9L8.1 15.9M15.9 15.9L14.9 14.9M9.1 9.1L8.1 8.1"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    );
  }

  return null;
}

function StatusIcons() {
  return (
    <span className="virtual-phone__status-icons" aria-hidden="true">
      <span className="virtual-phone__signal-bars">
        <i />
        <i />
        <i />
        <i />
      </span>
      <span className="virtual-phone__wifi-icon" />
      <span className="virtual-phone__battery-pill">
        <span className="virtual-phone__battery-fill" />
      </span>
    </span>
  );
}

function appIconFor(appId) {
  return PHONE_APP_ICON_ASSETS[appId] || null;
}

function NotificationCard({ notification, theme, onRemove }) {
  const [offsetX, setOffsetX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const pointerStartXRef = useRef(0);

  const handlePointerDown = (event) => {
    if (event.pointerType === "mouse" && event.button !== 0) {
      return;
    }

    pointerStartXRef.current = event.clientX;
    setIsDragging(true);
    event.currentTarget.setPointerCapture?.(event.pointerId);
  };

  const handlePointerMove = (event) => {
    if (!isDragging) {
      return;
    }

    setOffsetX(event.clientX - pointerStartXRef.current);
  };

  const finishSwipe = (event) => {
    if (!isDragging) {
      return;
    }

    event.currentTarget.releasePointerCapture?.(event.pointerId);
    setIsDragging(false);

    if (Math.abs(offsetX) > 88) {
      onRemove(notification.id);
      return;
    }

    setOffsetX(0);
  };

  return (
    <article
      className={`virtual-phone__center-card ${
        isDragging ? "is-dragging" : ""
      }`}
      style={{ transform: `translateX(${offsetX}px)` }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={finishSwipe}
      onPointerCancel={finishSwipe}
    >
      <span className={`virtual-phone__center-icon virtual-phone__center-icon--${theme}`}>
        {notification.title.slice(0, 1)}
      </span>
      <div className="virtual-phone__center-copy">
        <strong>{notification.title}</strong>
        <p>{notification.body}</p>
      </div>
      <div className="virtual-phone__center-meta">
        <small>{notification.time}</small>
        <button
          type="button"
          className="virtual-phone__center-close"
          onClick={(event) => {
            event.stopPropagation();
            onRemove(notification.id);
          }}
          aria-label="关闭通知"
        >
          ×
        </button>
      </div>
    </article>
  );
}

function NotificationCenter({
  theme,
  notifications,
  isOpen,
  offsetY,
  onRemoveNotification,
  onClose,
  onPointerDown,
  onPointerMove,
  onPointerUp,
  onPointerCancel,
}) {
  const transform = isOpen
    ? `translateY(${Math.min(0, offsetY)}px)`
    : `translateY(calc(-104% + ${Math.max(0, offsetY)}px))`;
  const opacity = isOpen ? 1 : Math.min(Math.max(offsetY / 180, 0), 1);

  return (
    <section
      className={`virtual-phone__notification-center ${
        isOpen || offsetY !== 0 ? "is-visible" : ""
      }`}
      style={{ transform, opacity }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerCancel}
      aria-hidden={!isOpen && offsetY === 0}
    >
      <header className="virtual-phone__notification-header">
        <div>
          <p className="virtual-phone__notification-eyebrow">NOTIFICATION CENTER</p>
          <h3>通知中心</h3>
        </div>
        <button
          type="button"
          className="virtual-phone__notification-dismiss"
          onClick={onClose}
        >
          收起
        </button>
      </header>

      <div className="virtual-phone__notification-list">
        {notifications.length > 0 ? (
          notifications.map((notification) => (
            <NotificationCard
              key={notification.id}
              notification={notification}
              theme={theme}
              onRemove={onRemoveNotification}
            />
          ))
        ) : (
          <div className="virtual-phone__notification-empty">
            <strong>现在很安静</strong>
            <p>新的消息会先经过这里，然后落到你的掌心里。</p>
          </div>
        )}
      </div>
    </section>
  );
}

function PhoneAppIcon({ app, onOpen, isPressing }) {
  const iconAsset = appIconFor(app.id);

  return (
    <button
      type="button"
      className={`virtual-phone__app ${isPressing ? "is-pressing" : ""}`}
      onClick={() => onOpen(app.id)}
      aria-label={`打开${app.label}`}
    >
      <span
        className={`virtual-phone__app-icon virtual-phone__app-icon--${app.id} ${
          app.iconType === "image" ? "has-image" : ""
        }`}
      >
        {iconAsset ? (
          <img src={iconAsset} alt="" aria-hidden="true" />
        ) : (
          <PhoneVectorIcon kind={app.id} />
        )}
      </span>
      <span className="virtual-phone__app-label">{app.label}</span>
    </button>
  );
}

function PhoneHome({ onOpenApp, pressingAppId }) {
  return (
    <section className="virtual-phone__home">
      <header className="virtual-phone__hero">
        <div className="virtual-phone__hero-topline">
          <div>
            <p className="virtual-phone__eyebrow">WORLD ENTRY</p>
            <h2 className="virtual-phone__title">主屏幕</h2>
          </div>
        </div>
        <p className="virtual-phone__hero-copy">
          一切真正的消息，都应该先从上方轻轻落下。
        </p>
      </header>

      <div className="virtual-phone__app-grid">
        {PHONE_APPS.map((app) => (
          <PhoneAppIcon
            key={app.id}
            app={app}
            onOpen={onOpenApp}
            isPressing={pressingAppId === app.id}
          />
        ))}
      </div>
    </section>
  );
}

function PhoneMessagesApp({
  conversations,
  activeConversationId,
  onSelectConversation,
  onBack,
  onBackToList,
  onSendMessage,
}) {
  const [draft, setDraft] = useState("");
  const threadRef = useRef(null);
  const activeConversation =
    conversations.find((conversation) => conversation.id === activeConversationId) ||
    null;

  useEffect(() => {
    if (!activeConversation) {
      return;
    }

    setDraft("");
  }, [activeConversationId, activeConversation]);

  useEffect(() => {
    if (!activeConversation || !threadRef.current) {
      return;
    }

    threadRef.current.scrollTop = threadRef.current.scrollHeight;
  }, [activeConversation]);

  const handleSend = () => {
    if (!activeConversation || !draft.trim()) {
      return;
    }

    onSendMessage(activeConversation.id, draft);
    setDraft("");
  };

  if (!activeConversation) {
    return (
      <section className="virtual-phone__app-screen virtual-phone__messages-screen">
        <div className="virtual-phone__app-topbar">
          <button
            type="button"
            className="virtual-phone__back-action"
            onClick={onBack}
          >
            返回
          </button>
          <span className="virtual-phone__app-topbar-title">信息</span>
        </div>

        <div className="virtual-phone__messages-list">
          {conversations.map((conversation) => (
            <button
              key={conversation.id}
              type="button"
              className="virtual-phone__messages-item"
              onClick={() => onSelectConversation(conversation.id)}
            >
              <span
                className={`virtual-phone__messages-avatar virtual-phone__messages-avatar--${conversation.avatarTone}`}
              >
                {conversation.avatarText}
              </span>
              <span className="virtual-phone__messages-body">
                <strong>{conversation.name}</strong>
                <em>{conversation.messages.at(-1)?.text || conversation.subtitle}</em>
              </span>
              <span className="virtual-phone__messages-meta">
                <small>{conversation.messages.at(-1)?.time || "刚刚"}</small>
                {conversation.unreadCount > 0 ? (
                  <span className="virtual-phone__messages-badge">
                    {conversation.unreadCount}
                  </span>
                ) : null}
              </span>
            </button>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="virtual-phone__app-screen virtual-phone__messages-screen">
      <div className="virtual-phone__app-topbar">
        <button
          type="button"
          className="virtual-phone__back-action"
          onClick={onBackToList}
        >
          返回
        </button>
        <div className="virtual-phone__chat-heading">
          <span className="virtual-phone__app-topbar-title">
            {activeConversation.name}
          </span>
          <small>{activeConversation.subtitle}</small>
        </div>
      </div>

      <div ref={threadRef} className="virtual-phone__messages-thread">
        {activeConversation.messages.map((message) => (
          <div
            key={message.id}
            className={`virtual-phone__chat-row ${
              message.sender === "me" ? "is-me" : ""
            }`}
          >
            {message.sender === "them" ? (
              <span
                className={`virtual-phone__messages-avatar virtual-phone__messages-avatar--${activeConversation.avatarTone}`}
              >
                {activeConversation.avatarText}
              </span>
            ) : null}
            <div className="virtual-phone__chat-bubble-wrap">
              <div className="virtual-phone__chat-bubble">{message.text}</div>
              <small>{message.time}</small>
            </div>
          </div>
        ))}
      </div>

      <div className="virtual-phone__messages-composer">
        <textarea
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              handleSend();
            }
          }}
          placeholder="想说点什么，就把它留在这里。"
        />
        <div className="virtual-phone__messages-composer-footer">
          <span className="virtual-phone__composer-hint">Enter 发送一条新的消息</span>
          <button type="button" onClick={handleSend} disabled={!draft.trim()}>
            发送
          </button>
        </div>
      </div>
    </section>
  );
}

function SettingsApp({ onBack, theme, onSetTheme }) {
  return (
    <section className="virtual-phone__app-screen">
      <div className="virtual-phone__app-topbar">
        <button
          type="button"
          className="virtual-phone__back-action"
          onClick={onBack}
        >
          返回
        </button>
        <span className="virtual-phone__app-topbar-title">设置</span>
      </div>

      <div className="virtual-phone__settings-panel">
        <header className="virtual-phone__settings-header">
          <strong>外观主题</strong>
          <p>把白天和夜晚收进同一个程序里，不打扰主屏幕。</p>
        </header>

        <div className="virtual-phone__theme-program-grid">
          <button
            type="button"
            className={`virtual-phone__theme-program ${
              theme === "day" ? "is-active" : ""
            }`}
            onClick={() => onSetTheme("day")}
          >
            <span className="virtual-phone__theme-program-mark">昼</span>
            <strong>日间主题</strong>
            <small>明亮、轻盈，更像白天刚醒来的桌面。</small>
          </button>
          <button
            type="button"
            className={`virtual-phone__theme-program ${
              theme === "night" ? "is-active" : ""
            }`}
            onClick={() => onSetTheme("night")}
          >
            <span className="virtual-phone__theme-program-mark">夜</span>
            <strong>夜间主题</strong>
            <small>更安静，适合把消息和回忆压低声音地读完。</small>
          </button>
        </div>
      </div>
    </section>
  );
}

function PlaceholderApp({ appId, onBack }) {
  const currentApp = PHONE_APPS.find((app) => app.id === appId);
  const iconAsset = appIconFor(appId);

  return (
    <section className="virtual-phone__app-screen">
      <div className="virtual-phone__app-topbar">
        <button
          type="button"
          className="virtual-phone__back-action"
          onClick={onBack}
        >
          返回
        </button>
        <span className="virtual-phone__app-topbar-title">{currentApp?.label}</span>
      </div>

      <div className="virtual-phone__placeholder">
        <span
          className={`virtual-phone__placeholder-icon ${
            iconAsset ? "has-image" : ""
          }`}
        >
          {iconAsset ? (
            <img src={iconAsset} alt="" aria-hidden="true" />
          ) : (
            <PhoneVectorIcon kind={appId} />
          )}
        </span>
        <h3>{currentApp?.label} 功能开发中…</h3>
        <p>这里后续会承接真实的游戏内系统与交互内容。</p>
      </div>
    </section>
  );
}

export function VirtualPhone({ state, onClose }) {
  const [currentAppId, setCurrentAppId] = useState(null);
  const [pressingAppId, setPressingAppId] = useState(null);
  const [closeDragOffset, setCloseDragOffset] = useState(0);
  const [isCloseDragging, setIsCloseDragging] = useState(false);
  const [isSettlingBack, setIsSettlingBack] = useState(false);
  const [activeConversationId, setActiveConversationId] = useState(null);
  const [notificationCenterOpen, setNotificationCenterOpen] = useState(false);
  const [notificationCenterOffset, setNotificationCenterOffset] = useState(0);
  const [isCenterDragging, setIsCenterDragging] = useState(false);
  const closeDragStartYRef = useRef(0);
  const centerDragStartYRef = useRef(0);
  const ignoreStatusbarClickRef = useRef(false);
  const sheetRef = useRef(null);
  const theme = usePhoneStore((stateValue) => stateValue.theme);
  const conversations = usePhoneStore((stateValue) => stateValue.conversations);
  const notifications = usePhoneStore((stateValue) => stateValue.notifications);
  const markConversationRead = usePhoneStore(
    (stateValue) => stateValue.markConversationRead,
  );
  const sendMessage = usePhoneStore((stateValue) => stateValue.sendMessage);
  const setTheme = usePhoneStore((stateValue) => stateValue.setTheme);
  const removeNotification = usePhoneStore(
    (stateValue) => stateValue.removeNotification,
  );

  useEffect(() => {
    if (state === "open") {
      playPhoneUiSound("open");
    }

    if (state === "closing") {
      playPhoneUiSound("close");
    }
  }, [state]);

  useEffect(() => {
    if (state === "closed") {
      setCurrentAppId(null);
      setPressingAppId(null);
      setCloseDragOffset(0);
      setIsCloseDragging(false);
      setIsSettlingBack(false);
      setActiveConversationId(null);
      setNotificationCenterOpen(false);
      setNotificationCenterOffset(0);
      setIsCenterDragging(false);
    }
  }, [state]);

  const handleOpenApp = (appId) => {
    setPressingAppId(appId);
    window.setTimeout(() => {
      setCurrentAppId(appId);
      if (appId === "messages") {
        setActiveConversationId(null);
      }
      setPressingAppId(null);
    }, 120);
  };

  const handleOpenConversation = (conversationId) => {
    setActiveConversationId(conversationId);
    markConversationRead(conversationId);
  };

  const endCloseDrag = () => {
    const sheetHeight = sheetRef.current?.clientHeight ?? 0;
    const threshold = sheetHeight * 0.18;

    if (closeDragOffset >= threshold) {
      setIsCloseDragging(false);
      setCloseDragOffset(0);
      onClose();
      return;
    }

    setIsCloseDragging(false);
    setIsSettlingBack(true);
    setCloseDragOffset(0);
    window.setTimeout(() => {
      setIsSettlingBack(false);
    }, 240);
  };

  const handleCloseIndicatorPointerDown = (event) => {
    if (event.pointerType === "mouse" && event.button !== 0) {
      return;
    }

    closeDragStartYRef.current = event.clientY;
    setIsCloseDragging(true);
    setIsSettlingBack(false);
    event.currentTarget.setPointerCapture?.(event.pointerId);
  };

  const handleCloseIndicatorPointerMove = (event) => {
    if (!isCloseDragging) {
      return;
    }

    const offset = Math.max(0, event.clientY - closeDragStartYRef.current);
    setCloseDragOffset(offset);
  };

  const handleCloseIndicatorPointerUp = (event) => {
    if (!isCloseDragging) {
      return;
    }

    event.currentTarget.releasePointerCapture?.(event.pointerId);
    endCloseDrag();
  };

  const handleCloseIndicatorPointerCancel = (event) => {
    if (!isCloseDragging) {
      return;
    }

    event.currentTarget.releasePointerCapture?.(event.pointerId);
    endCloseDrag();
  };

  const handleCenterDragStart = (event) => {
    if (event.pointerType === "mouse" && event.button !== 0) {
      return;
    }

    centerDragStartYRef.current = event.clientY;
    ignoreStatusbarClickRef.current = false;
    setIsCenterDragging(true);
    event.currentTarget.setPointerCapture?.(event.pointerId);
  };

  const handleCenterDragMove = (event) => {
    if (!isCenterDragging) {
      return;
    }

    const delta = event.clientY - centerDragStartYRef.current;
    if (Math.abs(delta) > 10) {
      ignoreStatusbarClickRef.current = true;
    }
    setNotificationCenterOffset(notificationCenterOpen ? Math.min(0, delta) : Math.max(0, delta));
  };

  const finishCenterDrag = (event) => {
    if (!isCenterDragging) {
      return;
    }

    event.currentTarget.releasePointerCapture?.(event.pointerId);
    setIsCenterDragging(false);

    if (!notificationCenterOpen && notificationCenterOffset > 72) {
      setNotificationCenterOpen(true);
    }

    if (notificationCenterOpen && notificationCenterOffset < -72) {
      setNotificationCenterOpen(false);
    }

    setNotificationCenterOffset(0);
  };

  const sheetStyle = useMemo(
    () => ({
      transform: `translateY(${closeDragOffset}px)`,
    }),
    [closeDragOffset],
  );

  if (state === "closed") {
    return null;
  }

  return (
    <div
      className={`virtual-phone-overlay ${
        state === "closing" ? "is-closing" : "is-open"
      }`}
      role="dialog"
      aria-modal="true"
      aria-label="虚拟手机"
    >
      <button
        type="button"
        className="virtual-phone-overlay__backdrop"
        onClick={onClose}
        aria-label="关闭手机"
      />

      <div className="virtual-phone-overlay__sheet-wrap">
        <section
          ref={sheetRef}
          className={`virtual-phone virtual-phone--${theme} ${
            isCloseDragging ? "is-dragging" : ""
          } ${isSettlingBack ? "is-settling" : ""} ${
            notificationCenterOpen ? "is-center-open" : ""
          }`}
          style={sheetStyle}
        >
          <div
            className="virtual-phone__statusbar"
            onPointerDown={handleCenterDragStart}
            onPointerMove={handleCenterDragMove}
            onPointerUp={finishCenterDrag}
            onPointerCancel={finishCenterDrag}
            onClick={() => {
              if (ignoreStatusbarClickRef.current) {
                ignoreStatusbarClickRef.current = false;
                return;
              }
              setNotificationCenterOpen((current) => !current);
            }}
          >
            <span className="virtual-phone__status-time">09:41</span>
            <span className="virtual-phone__status-pull">
              {notificationCenterOpen ? "上滑收起通知" : "下滑查看通知"}
            </span>
            <StatusIcons />
          </div>

          <NotificationCenter
            theme={theme}
            notifications={notifications}
            isOpen={notificationCenterOpen}
            offsetY={notificationCenterOffset}
            onRemoveNotification={removeNotification}
            onClose={() => setNotificationCenterOpen(false)}
            onPointerDown={handleCenterDragStart}
            onPointerMove={handleCenterDragMove}
            onPointerUp={finishCenterDrag}
            onPointerCancel={finishCenterDrag}
          />

          <div className="virtual-phone__screen">
            <div className="virtual-phone__content">
              {!currentAppId ? (
                <PhoneHome
                  onOpenApp={handleOpenApp}
                  pressingAppId={pressingAppId}
                />
              ) : currentAppId === "messages" ? (
                <PhoneMessagesApp
                  conversations={conversations}
                  activeConversationId={activeConversationId}
                  onSelectConversation={handleOpenConversation}
                  onBack={() => setCurrentAppId(null)}
                  onBackToList={() => setActiveConversationId(null)}
                  onSendMessage={sendMessage}
                />
              ) : currentAppId === "settings" ? (
                <SettingsApp
                  onBack={() => setCurrentAppId(null)}
                  theme={theme}
                  onSetTheme={setTheme}
                />
              ) : (
                <PlaceholderApp appId={currentAppId} onBack={() => setCurrentAppId(null)} />
              )}
            </div>
          </div>

          <div
            className="virtual-phone__home-indicator-zone"
            onPointerDown={handleCloseIndicatorPointerDown}
            onPointerMove={handleCloseIndicatorPointerMove}
            onPointerUp={handleCloseIndicatorPointerUp}
            onPointerCancel={handleCloseIndicatorPointerCancel}
          >
            <span className="virtual-phone__home-indicator" />
          </div>
        </section>
      </div>
    </div>
  );
}
