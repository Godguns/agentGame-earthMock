import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import "./menu.css";

const MENU_ITEMS = [
  { label: "开始游戏", action: "start" },
  { label: "继续", action: "continue" },
  { label: "游戏设置", action: "settings" },
  { label: "关于", action: "about" },
];

export function MainMenuScreen() {
  const location = useLocation();
  const navigate = useNavigate();
  const [entryMode, setEntryMode] = useState(
    location.state?.from === "settings" ? "from-settings" : "default",
  );

  useEffect(() => {
    if (location.state?.from === "settings") {
      const timerId = window.setTimeout(() => {
        setEntryMode("default");
      }, 1200);

      return () => window.clearTimeout(timerId);
    }

    return undefined;
  }, [location.state]);

  const handleAction = (action) => {
    if (action === "settings") {
      navigate("/settings");
    }
  };

  return (
    <main
      className={`menu-screen ${
        entryMode === "from-settings" ? "is-entering-from-settings" : ""
      }`}
    >
      <div className="menu-screen__backdrop" />
      <section className="menu-screen__panel">
        <p className="menu-screen__eyebrow">MAIN MENU</p>
        <h1 className="menu-screen__title">地球Online</h1>
        <nav aria-label="主菜单">
          <ul className="menu-screen__list">
            {MENU_ITEMS.map((item) => (
              <li key={item.label}>
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
  );
}
