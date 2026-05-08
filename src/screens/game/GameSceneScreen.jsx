import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import bedroomSceneLampOn from "../../images/home1.png";
import bedroomSceneLampOff from "../../images/home2.png";
import "./gameScene.css";

const HOTSPOTS = [
  {
    id: "pc",
    label: "PC",
    title: "桌面电脑",
    hint: "屏幕还亮着，像有人刚离开工位。",
    guideNote: "工作台入口",
    position: {
      left: "40.5%",
      top: "30.7%",
      width: "35%",
      height: "38%",
    },
    panelTitle: "PC / WORKSTATION",
    panelBody:
      "后续这里可以挂载完整的电脑桌面、工作消息、招聘网站、邮件系统，或者直接作为一个独立子页面入口。",
  },
  {
    id: "tablet",
    label: "iPad",
    title: "平板",
    hint: "屏幕是黑的，但还有一点余温。",
    guideNote: "记忆与日记",
    position: {
      left: "37%",
      top: "73%",
      width: "22%",
      height: "18%",
    },
    panelTitle: "IPAD / NOTE SURFACE",
    panelBody:
      "这一层很适合承接日记、记忆回放、草稿、画板、读书记录，做成更私密的内心容器。",
  },
  {
    id: "phone",
    label: "iPhone",
    title: "手机",
    hint: "它始终会是你和世界保持联系的唯一入口。",
    guideNote: "外部世界入口",
    position: {
      left: "59%",
      top: "75%",
      width: "13%",
      height: "17%",
    },
    panelTitle: "IPHONE / WORLD ENTRY",
    panelBody:
      "后续这里可以直接弹出游戏内手机，承接聊天、银行、招聘、状态、设置等几乎所有系统交互。",
  },
];

const WEATHER_COPY = {
  date: "2026-05-08",
  weather: "多云",
  mood: "风很轻，像有人刚离开房间。",
};

function DevicePanel({ hotspot, onClose }) {
  return (
    <div
      className="game-device-panel"
      role="dialog"
      aria-modal="true"
      aria-labelledby={`${hotspot.id}-title`}
    >
      <button
        type="button"
        className="game-device-panel__backdrop"
        aria-label="关闭设备浮层"
        onClick={onClose}
      />
      <aside
        className={`game-device-panel__sheet game-device-panel__sheet--${hotspot.id}`}
      >
        <div className="game-device-panel__frame" />
        <p className="game-device-panel__eyebrow">{hotspot.panelTitle}</p>
        <h2 id={`${hotspot.id}-title`} className="game-device-panel__title">
          {hotspot.title}
        </h2>
        <p className="game-device-panel__copy">{hotspot.panelBody}</p>
        <button
          type="button"
          className="game-device-panel__action"
          onClick={onClose}
        >
          CLOSE
        </button>
      </aside>
    </div>
  );
}

export function GameSceneScreen() {
  const navigate = useNavigate();
  const [phase, setPhase] = useState("closed");
  const [activeHotspotId, setActiveHotspotId] = useState(null);
  const [isLampOn, setIsLampOn] = useState(true);

  useEffect(() => {
    const openTimerId = window.setTimeout(() => {
      setPhase("opening");
    }, 180);

    const settlingTimerId = window.setTimeout(() => {
      setPhase("settling");
    }, 1680);

    const awakeTimerId = window.setTimeout(() => {
      setPhase("awake");
    }, 2900);

    return () => {
      window.clearTimeout(openTimerId);
      window.clearTimeout(settlingTimerId);
      window.clearTimeout(awakeTimerId);
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        if (activeHotspotId) {
          setActiveHotspotId(null);
          return;
        }

        navigate("/menu");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [activeHotspotId, navigate]);

  const activeHotspot = useMemo(
    () => HOTSPOTS.find((hotspot) => hotspot.id === activeHotspotId) ?? null,
    [activeHotspotId],
  );

  const currentSceneImage = isLampOn
    ? bedroomSceneLampOn
    : bedroomSceneLampOff;

  return (
    <main
      className={`game-scene game-scene--${phase} ${
        isLampOn ? "is-lamp-on" : "is-lamp-off"
      }`}
    >
      <div className="game-scene__backdrop" />
      <div className="game-scene__grain" />

      <div className="game-scene__art">
        <img
          className="game-scene__image"
          src={currentSceneImage}
          alt="卧室里的办公桌场景，桌面上摆放着电脑、平板和手机。"
        />
      </div>

      <div className="game-scene__lamp-glow" aria-hidden="true" />
      <div className="game-scene__vignette" />
      <div className="game-scene__focus" />

      <header className="game-scene__weather">
        <span className="game-scene__weather-date">
          {WEATHER_COPY.date} | {WEATHER_COPY.weather}
        </span>
        <strong className="game-scene__weather-title">窗外</strong>
        <p className="game-scene__weather-copy">{WEATHER_COPY.mood}</p>
      </header>

      <div className="game-scene__status">
        <span>
          状态：刚醒，还没彻底回到现实。台灯
          {isLampOn ? "还亮着。" : "已经关掉了。"}
        </span>
      </div>

      <div className="game-scene__caption">
        <p>
          你醒了。桌上的屏幕都还亮着，
          {isLampOn ? "台灯把桌角照得很安静。" : "房间只剩下屏幕在发光。"}
        </p>
      </div>

      <button
        type="button"
        className={`lamp-toggle ${phase === "awake" ? "is-awake" : ""} ${
          isLampOn ? "is-on" : "is-off"
        }`}
        onClick={() => setIsLampOn((current) => !current)}
        disabled={phase !== "awake"}
        aria-pressed={isLampOn}
        aria-label={isLampOn ? "关闭台灯" : "打开台灯"}
      >
        <span className="lamp-toggle__pulse" />
        <span className="lamp-toggle__outline" />
        <span className="lamp-toggle__guide" aria-hidden="true">
          <span className="lamp-toggle__guide-line" />
          <span className="lamp-toggle__guide-copy">
            <strong>LAMP</strong>
            <em>{isLampOn ? "点击关闭台灯" : "点击打开台灯"}</em>
          </span>
        </span>
      </button>

      <div className="game-scene__hotspots" aria-label="场景交互区域">
        {HOTSPOTS.map((hotspot) => (
          <button
            key={hotspot.id}
            type="button"
            className={`game-hotspot game-hotspot--${hotspot.id} ${
              phase === "awake" ? "is-awake" : ""
            } ${activeHotspotId === hotspot.id ? "is-active" : ""}`}
            style={hotspot.position}
            onClick={() => setActiveHotspotId(hotspot.id)}
            disabled={phase !== "awake"}
            aria-label={hotspot.title}
          >
            <span className="game-hotspot__pulse" />
            <span className="game-hotspot__outline" />
            <span className="game-hotspot__guide" aria-hidden="true">
              <span className="game-hotspot__guide-line" />
              <span className="game-hotspot__guide-copy">
                <strong>{hotspot.label}</strong>
                <em>{hotspot.guideNote}</em>
              </span>
            </span>
            <span className="game-hotspot__content">
              <strong>{hotspot.label}</strong>
              <em>{hotspot.hint}</em>
            </span>
          </button>
        ))}
      </div>

      {activeHotspot ? (
        <DevicePanel
          hotspot={activeHotspot}
          onClose={() => setActiveHotspotId(null)}
        />
      ) : null}

      <div className="eye-transition" aria-hidden="true">
        <div className="eye-transition__lid eye-transition__lid--top" />
        <div className="eye-transition__lid eye-transition__lid--bottom" />
        <div className="eye-transition__core" />
      </div>
    </main>
  );
}
