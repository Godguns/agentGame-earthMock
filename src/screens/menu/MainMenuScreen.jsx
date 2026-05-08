import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { useLocation, useNavigate } from "react-router-dom";

import "./menu.css";

const MENU_ITEMS = [
  { label: "开始游戏", action: "start" },
  { label: "继续游戏", action: "continue" },
  { label: "游戏设置", action: "settings" },
  { label: "关于", action: "about" },
];

const DEVELOPERS = [
  {
    id: "jin",
    name: "异世界的大大金",
    avatarSrc: "/godguns.jpg",
    fallback: "金",
  },
  {
    id: "tang",
    name: "大吃一口跳跳糖",
    avatarSrc: "/liwen.jpg",
    fallback: "糖",
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
    <div className="about-overlay" role="dialog" aria-modal="true" aria-labelledby="about-overlay-title">
      <button
        type="button"
        className="about-overlay__backdrop"
        aria-label="关闭关于页面"
        onClick={onClose}
      />

      <div className="about-overlay__glow about-overlay__glow--one" />
      <div className="about-overlay__glow about-overlay__glow--two" />

      <section className="about-overlay__content">
        <header className="about-overlay__header">
          <p className="about-overlay__eyebrow">ABOUT THE DEVELOPERS</p>
          <h2 id="about-overlay-title" className="about-overlay__title">
            开发者
          </h2>
        </header>

        <div className="about-overlay__list" role="list" aria-label="开发者列表">
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

export function MainMenuScreen() {
  const location = useLocation();
  const navigate = useNavigate();
  const [entryMode, setEntryMode] = useState(
    location.state?.from === "settings" ? "from-settings" : "default",
  );
  const [isAboutOpen, setIsAboutOpen] = useState(false);

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
    if (!isAboutOpen) {
      return undefined;
    }

    const { body } = document;
    const previousOverflow = body.style.overflow;
    body.style.overflow = "hidden";

    return () => {
      body.style.overflow = previousOverflow;
    };
  }, [isAboutOpen]);

  const menuLabel = useMemo(() => "主菜单", []);

  const handleAction = (action) => {
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
          <p className="menu-screen__eyebrow">MAIN MENU</p>
          <h1 className="menu-screen__title">地球Online</h1>
          <nav aria-label={menuLabel}>
            <ul className="menu-screen__list">
              {MENU_ITEMS.map((item) => (
                <li key={item.action}>
                  <button
                    className="menu-screen__button"
                    type="button"
                    onClick={() => handleAction(item.action)}
                  >
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        </section>
      </main>

      {isAboutOpen ? <AboutOverlay onClose={() => setIsAboutOpen(false)} /> : null}
    </>
  );
}
