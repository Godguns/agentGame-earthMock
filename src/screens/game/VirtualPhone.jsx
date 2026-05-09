import { useEffect, useMemo, useRef, useState } from "react";

import { GAME_SCENE_ASSETS } from "./gameSceneAssets";

const PHONE_AUDIO_SETTINGS = {
  enabled: true,
  volume: 0.05,
};

const PHONE_APPS = [
  { id: "chat", label: "聊天", subtitle: "未读 3", iconType: "image" },
  { id: "journal", label: "日记", subtitle: "昨日残响", iconType: "vector" },
  { id: "wallet", label: "银行", subtitle: "账单同步", iconType: "image" },
  { id: "jobs", label: "招聘", subtitle: "新岗位", iconType: "vector" },
  { id: "player", label: "播放器", subtitle: "BGM 控制", iconType: "image" },
  { id: "settings", label: "设置", subtitle: "系统偏好", iconType: "vector" },
];

const PHONE_APP_ICON_ASSETS = {
  chat: GAME_SCENE_ASSETS.phoneAppChat,
  wallet: GAME_SCENE_ASSETS.phoneAppBank,
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

function PhoneAppIcon({ app, onOpen, isPressing }) {
  const iconAsset = PHONE_APP_ICON_ASSETS[app.id];

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
        {app.id === "chat" ? (
          <span className="virtual-phone__app-badge">3</span>
        ) : null}
      </span>
      <span className="virtual-phone__app-label">{app.label}</span>
    </button>
  );
}

function PhoneHome({ onOpenApp, pressingAppId }) {
  return (
    <section className="virtual-phone__home">
      <header className="virtual-phone__hero">
        <p className="virtual-phone__eyebrow">WORLD ENTRY</p>
        <h2 className="virtual-phone__title">主屏幕</h2>
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

function PlaceholderApp({ appId, onBack }) {
  const currentApp = PHONE_APPS.find((app) => app.id === appId);
  const iconAsset = PHONE_APP_ICON_ASSETS[appId];

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
        <h3>{currentApp?.label}功能开发中…</h3>
        <p>这里后续会承接真实的游戏内系统与交互内容。</p>
      </div>
    </section>
  );
}

export function VirtualPhone({ state, onClose }) {
  const [currentAppId, setCurrentAppId] = useState(null);
  const [pressingAppId, setPressingAppId] = useState(null);
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isSettlingBack, setIsSettlingBack] = useState(false);
  const dragStartYRef = useRef(0);
  const sheetRef = useRef(null);

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
      setDragOffset(0);
      setIsDragging(false);
      setIsSettlingBack(false);
    }
  }, [state]);

  const handleOpenApp = (appId) => {
    setPressingAppId(appId);
    window.setTimeout(() => {
      setCurrentAppId(appId);
      setPressingAppId(null);
    }, 120);
  };

  const endDrag = () => {
    const sheetHeight = sheetRef.current?.clientHeight ?? 0;
    const threshold = sheetHeight * 0.3;

    if (dragOffset >= threshold) {
      setIsDragging(false);
      setDragOffset(0);
      onClose();
      return;
    }

    setIsDragging(false);
    setIsSettlingBack(true);
    setDragOffset(0);
    window.setTimeout(() => {
      setIsSettlingBack(false);
    }, 240);
  };

  const handleHandlePointerDown = (event) => {
    if (event.pointerType === "mouse" && event.button !== 0) {
      return;
    }

    dragStartYRef.current = event.clientY;
    setIsDragging(true);
    setIsSettlingBack(false);
    event.currentTarget.setPointerCapture?.(event.pointerId);
  };

  const handleHandlePointerMove = (event) => {
    if (!isDragging) {
      return;
    }

    const offset = Math.max(0, event.clientY - dragStartYRef.current);
    setDragOffset(offset);
  };

  const handleHandlePointerUp = (event) => {
    if (!isDragging) {
      return;
    }

    event.currentTarget.releasePointerCapture?.(event.pointerId);
    endDrag();
  };

  const handleHandlePointerCancel = (event) => {
    if (!isDragging) {
      return;
    }

    event.currentTarget.releasePointerCapture?.(event.pointerId);
    endDrag();
  };

  const sheetStyle = useMemo(
    () => ({
      transform: `translateY(${dragOffset}px)`,
    }),
    [dragOffset],
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
          className={`virtual-phone ${
            isDragging ? "is-dragging" : ""
          } ${isSettlingBack ? "is-settling" : ""}`}
          style={sheetStyle}
        >
          <div
            className="virtual-phone__handle-zone"
            onPointerDown={handleHandlePointerDown}
            onPointerMove={handleHandlePointerMove}
            onPointerUp={handleHandlePointerUp}
            onPointerCancel={handleHandlePointerCancel}
          >
            <span className="virtual-phone__handle" />
          </div>

          <div className="virtual-phone__screen">
            {!currentAppId ? (
              <PhoneHome
                onOpenApp={handleOpenApp}
                pressingAppId={pressingAppId}
              />
            ) : (
              <PlaceholderApp
                appId={currentAppId}
                onBack={() => setCurrentAppId(null)}
              />
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
