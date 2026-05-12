import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { useLocation, useNavigate } from "react-router-dom";

import { hasBoundPersona, useAuthStore } from "../../app/store/authStore";
import godgunsAvatar from "../../../godguns.jpg";
import liwenAvatar from "../../../liwen.jpg";
import { preloadGameSceneAssets } from "../game/gameSceneAssets";

import "./menu.css";

const MENU_ITEMS = [
  { label: "Start Game", action: "start" },
  { label: "Continue", action: "continue" },
  { label: "Settings", action: "settings" },
  { label: "About", action: "about" },
];

const DEVELOPERS = [
  {
    id: "jin",
    name: "godguns",
    avatarSrc: godgunsAvatar,
    fallback: "G",
  },
  {
    id: "tang",
    name: "liwen",
    avatarSrc: liwenAvatar,
    fallback: "L",
  },
];

function DeveloperAvatar({ src, alt, fallback }) {
  const [hasImageError, setHasImageError] = useState(false);

  useEffect(() => {
    setHasImageError(false);
  }, [src]);

  return (
    <div className="about-overlay__avatar-shell">
      {!hasImageError ? (
        <img
          className="about-overlay__avatar-image"
          src={src}
          alt={alt}
          onError={() => setHasImageError(true)}
        />
      ) : null}
      <span
        className={`about-overlay__avatar-fallback ${
          hasImageError ? "is-visible" : ""
        }`}
      >
        {fallback}
      </span>
    </div>
  );
}

function AboutOverlay({ onClose }) {
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  return createPortal(
    <div
      className="about-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="about-overlay-title"
    >
      <button
        type="button"
        className="about-overlay__backdrop"
        aria-label="Close about panel"
        onClick={onClose}
      />

      <div className="about-overlay__glow about-overlay__glow--one" />
      <div className="about-overlay__glow about-overlay__glow--two" />

      <section className="about-overlay__content">
        <header className="about-overlay__header">
          <p className="about-overlay__eyebrow">ABOUT THE DEVELOPERS</p>
          <h2 id="about-overlay-title" className="about-overlay__title">
            Credits
          </h2>
        </header>

        <div className="about-overlay__list" role="list" aria-label="Developers">
          {DEVELOPERS.map((developer, index) => (
            <article
              key={developer.id}
              className="about-overlay__item"
              role="listitem"
              style={{ "--about-delay": `${index * 90}ms` }}
            >
              <DeveloperAvatar
                src={developer.avatarSrc}
                alt={developer.name}
                fallback={developer.fallback}
              />
              <div className="about-overlay__meta">
                <p className="about-overlay__role">Developer</p>
                <p className="about-overlay__name">{developer.name}</p>
              </div>
            </article>
          ))}
        </div>

        <button
          type="button"
          className="about-overlay__dismiss"
          onClick={onClose}
        >
          RETURN
        </button>

        <p className="about-overlay__copyright">Copyright 2026</p>
      </section>
    </div>,
    document.body,
  );
}

function SessionStatusCard({
  user,
  persona,
  personaStatus,
  onOpenAuth,
  onLogout,
  onCalibrate,
}) {
  const personaReady = hasBoundPersona(persona);
  const isCheckingPersona = personaStatus === "loading";
  const statusConfig = user
    ? isCheckingPersona
      ? {
          tone: "syncing",
          badge: "同步中",
          title: user.username,
          detail: "Persona Cloud 正在检查",
        }
      : personaReady
        ? {
            tone: "ready",
            badge: "已就绪",
            title: user.username,
            detail: "账号已连接，可以进入 Earth Online",
          }
        : {
            tone: "pending",
            badge: "待补全",
            title: user.username,
            detail: "还需要完成人格标定",
          }
    : {
        tone: "guest",
        badge: "访客",
        title: "Guest Session",
        detail: "先登录或注册",
      };

  return (
    <section
      className={`menu-session-card menu-session-card--${statusConfig.tone}`}
      aria-label="Session status"
    >
      <div className="menu-session-card__copy">
        <span className="menu-session-card__badge">{statusConfig.badge}</span>
        <strong>{statusConfig.title}</strong>
        <small>{statusConfig.detail}</small>
        {user?.email ? <p>{user.email}</p> : null}
      </div>

      <div className="menu-session-card__actions">
        {user ? (
          <>
            {!personaReady ? (
              <button type="button" onClick={onCalibrate}>
                完成人格标定
              </button>
            ) : null}
            <button type="button" onClick={onLogout}>
              退出登录
            </button>
          </>
        ) : (
          <button type="button" onClick={onOpenAuth}>
            登录 / 注册
          </button>
        )}
      </div>
    </section>
  );
}

function AuthModal({ open, onClose, onSuccess }) {
  const status = useAuthStore((state) => state.status);
  const error = useAuthStore((state) => state.error);
  const login = useAuthStore((state) => state.login);
  const register = useAuthStore((state) => state.register);
  const [mode, setMode] = useState("login");
  const [account, setAccount] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const isLoading = status === "loading";

  useEffect(() => {
    if (!open) {
      return undefined;
    }

    const handleKeyDown = (event) => {
      if (event.key === "Escape" && !isLoading) {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isLoading, onClose, open]);

  if (!open) {
    return null;
  }

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (isLoading) {
      return;
    }

    try {
      if (mode === "login") {
        await login({ account, password });
      } else {
        await register({ email, username, password });
      }

      setPassword("");
      onSuccess();
    } catch {
      // Store error is already populated.
    }
  };

  return createPortal(
    <div className="menu-modal" role="dialog" aria-modal="true">
      <button
        type="button"
        className="menu-modal__backdrop"
        aria-label="Close sign in dialog"
        onClick={isLoading ? undefined : onClose}
      />

      <section className="menu-modal__panel menu-modal__panel--auth">
        <div className="menu-modal__glow menu-modal__glow--left" />
        <div className="menu-modal__glow menu-modal__glow--right" />

        <header className="menu-modal__header">
          <p className="menu-modal__eyebrow">ACCESS GATE</p>
          <h2>{mode === "login" ? "Return to Earth" : "Create your link"}</h2>
          <p>
            Login is checked before the game starts. Registration will also create
            your player profile slot.
          </p>
        </header>

        <div className="menu-auth-tabs" role="tablist" aria-label="Auth mode">
          <button
            type="button"
            className={mode === "login" ? "is-active" : ""}
            onClick={() => setMode("login")}
          >
            Login
          </button>
          <button
            type="button"
            className={mode === "register" ? "is-active" : ""}
            onClick={() => setMode("register")}
          >
            Register
          </button>
        </div>

        <form className="menu-auth-form" onSubmit={handleSubmit}>
          {mode === "register" ? (
            <>
              <input
                type="email"
                value={email}
                placeholder="Email"
                autoComplete="email"
                onChange={(event) => setEmail(event.target.value)}
              />
              <input
                type="text"
                value={username}
                placeholder="Username"
                autoComplete="username"
                minLength={3}
                onChange={(event) => setUsername(event.target.value)}
              />
            </>
          ) : (
            <input
              type="text"
              value={account}
              placeholder="Email or username"
              autoComplete="username"
              onChange={(event) => setAccount(event.target.value)}
            />
          )}

          <input
            type="password"
            value={password}
            placeholder="Password"
            autoComplete={mode === "login" ? "current-password" : "new-password"}
            minLength={8}
            onChange={(event) => setPassword(event.target.value)}
          />

          {error ? <p className="menu-auth-form__error">{error}</p> : null}

          <div className="menu-modal__footer">
            <button type="button" className="menu-modal__ghost" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="menu-modal__primary" disabled={isLoading}>
              {isLoading
                ? "Connecting..."
                : mode === "login"
                  ? "Enter"
                  : "Create account"}
            </button>
          </div>
        </form>
      </section>
    </div>,
    document.body,
  );
}

function PersonaGateModal({ open, onClose, onCalibrate }) {
  if (!open) {
    return null;
  }

  return createPortal(
    <div className="menu-modal" role="dialog" aria-modal="true">
      <button
        type="button"
        className="menu-modal__backdrop"
        aria-label="Close persona guide"
        onClick={onClose}
      />

      <section className="menu-modal__panel menu-modal__panel--persona">
        <header className="menu-modal__header">
          <p className="menu-modal__eyebrow">PERSONA REQUIRED</p>
          <h2>Your player imprint is still empty</h2>
          <p>
            Before entering the main game, we need one round of persona
            calibration so the world can react to the player behind the screen.
          </p>
        </header>

        <div className="menu-persona-guide">
          <article>
            <strong>What happens next</strong>
            <p>
              You will be guided through the calibration page, your answers will
              be saved to the backend, and then you will be sent directly into the
              game scene.
            </p>
          </article>
        </div>

        <div className="menu-modal__footer">
          <button type="button" className="menu-modal__ghost" onClick={onClose}>
            Back
          </button>
          <button type="button" className="menu-modal__primary" onClick={onCalibrate}>
            Start calibration
          </button>
        </div>
      </section>
    </div>,
    document.body,
  );
}

export function MainMenuScreen() {
  const location = useLocation();
  const navigate = useNavigate();
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);
  const persona = useAuthStore((state) => state.persona);
  const status = useAuthStore((state) => state.status);
  const personaStatus = useAuthStore((state) => state.personaStatus);
  const restoreMe = useAuthStore((state) => state.restoreMe);
  const loadPersona = useAuthStore((state) => state.loadPersona);
  const clearSession = useAuthStore((state) => state.clearSession);
  const [entryMode, setEntryMode] = useState(
    location.state?.from === "settings" ? "from-settings" : "default",
  );
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isPersonaGateOpen, setIsPersonaGateOpen] = useState(false);
  const [isStarting, setIsStarting] = useState(false);

  useEffect(() => {
    if (!token) {
      return;
    }

    if (!user) {
      restoreMe();
      return;
    }

    if (!persona) {
      loadPersona();
    }
  }, [loadPersona, persona, restoreMe, token, user]);

  useEffect(() => {
    if (location.state?.from === "settings") {
      const timerId = window.setTimeout(() => {
        setEntryMode("default");
      }, 1200);

      return () => window.clearTimeout(timerId);
    }

    return undefined;
  }, [location.state]);

  useEffect(() => {
    preloadGameSceneAssets();
  }, []);

  useEffect(() => {
    if (!isAboutOpen && !isAuthOpen && !isPersonaGateOpen) {
      return undefined;
    }

    const { body } = document;
    const previousOverflow = body.style.overflow;
    body.style.overflow = "hidden";

    return () => {
      body.style.overflow = previousOverflow;
    };
  }, [isAboutOpen, isAuthOpen, isPersonaGateOpen]);

  const menuLabel = useMemo(() => "Main menu", []);

  const continueStartFlow = async () => {
    if (isStarting) {
      return;
    }

    setIsStarting(true);

    try {
      // 直接从 store 读取最新值，避免 React 闭包陈旧快照问题
      const {
        token: freshToken,
        user: freshUser,
        persona: freshPersona,
      } = useAuthStore.getState();

      if (!freshToken) {
        setIsAuthOpen(true);
        return;
      }

      const activeUser = freshUser || (await restoreMe());
      if (!activeUser) {
        setIsAuthOpen(true);
        return;
      }

      const activePersona = freshPersona || (await loadPersona());
      if (!hasBoundPersona(activePersona)) {
        setIsPersonaGateOpen(true);
        return;
      }

      navigate("/game");
    } finally {
      setIsStarting(false);
    }
  };

  const handleOpenCalibration = () => {
    setIsPersonaGateOpen(false);
    navigate("/settings", {
      state: {
        from: "menu",
        purpose: "onboarding",
        redirectTo: "/game",
      },
    });
  };

  const handleAction = (action) => {
    if (action === "start" || action === "continue") {
      continueStartFlow();
      return;
    }

    if (action === "settings") {
      navigate("/settings");
      return;
    }

    if (action === "about") {
      setIsAboutOpen(true);
    }
  };

  return (
    <>
      <main
        className={`menu-screen ${
          entryMode === "from-settings" ? "is-entering-from-settings" : ""
        } ${isAboutOpen ? "is-about-open" : ""}`}
      >
        <div className="menu-screen__backdrop" />
        <section className="menu-screen__panel">
          <SessionStatusCard
            user={user}
            persona={persona}
            personaStatus={personaStatus}
            onOpenAuth={() => setIsAuthOpen(true)}
            onLogout={clearSession}
            onCalibrate={handleOpenCalibration}
          />

          <p className="menu-screen__eyebrow">MAIN MENU</p>
          <h1 className="menu-screen__title">Earth Online</h1>
          <p className="menu-screen__summary">
            The world checks your login and persona state before opening the next
            scene.
          </p>

          <nav aria-label={menuLabel}>
            <ul className="menu-screen__list">
              {MENU_ITEMS.map((item) => (
                <li key={item.action}>
                  <button
                    className="menu-screen__button"
                    type="button"
                    onClick={() => handleAction(item.action)}
                    disabled={isStarting || status === "loading"}
                  >
                    {item.action === "start" && isStarting ? "Checking..." : item.label}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        </section>
      </main>

      {isAboutOpen ? <AboutOverlay onClose={() => setIsAboutOpen(false)} /> : null}
      <AuthModal
        open={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onSuccess={() => {
          setIsAuthOpen(false);
          continueStartFlow();
        }}
      />
      <PersonaGateModal
        open={isPersonaGateOpen}
        onClose={() => setIsPersonaGateOpen(false)}
        onCalibrate={handleOpenCalibration}
      />
    </>
  );
}
