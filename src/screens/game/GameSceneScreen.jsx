import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  GAME_SCENE_ASSETS,
  preloadGameSceneAssets,
} from "./gameSceneAssets";
import { VirtualIpad } from "./VirtualIpad";
import { VirtualIpod } from "./VirtualIpod";
import { VirtualPc } from "./VirtualPc";
import { VirtualPhone } from "./VirtualPhone";
import "./gameScene.css";

const WEATHER_OPTIONS = [
  {
    id: "cloudy",
    label: "多云",
    image: GAME_SCENE_ASSETS.weatherCloudy,
    mood: "天色发灰，像一整天都没有真正开始。",
  },
  {
    id: "sunny",
    label: "晴天",
    image: GAME_SCENE_ASSETS.weatherSunny,
    mood: "光线太亮，桌上的灰尘都像有了重量。",
  },
  {
    id: "sunset",
    label: "晚霞",
    image: GAME_SCENE_ASSETS.weatherSunset,
    mood: "傍晚像一封没写完的信，还停在窗外。",
  },
  {
    id: "rain",
    label: "雨天",
    image: GAME_SCENE_ASSETS.weatherRain,
    mood: "玻璃外面很安静，只剩下雨在替你说话。",
  },
  {
    id: "snow",
    label: "下雪",
    image: GAME_SCENE_ASSETS.weatherSnow,
    mood: "世界被压低了音量，像有人替你盖上被子。",
  },
  {
    id: "night",
    label: "夜晚",
    image: GAME_SCENE_ASSETS.weatherNight,
    mood: "天已经暗了，房间像只剩屏幕还在醒着。",
  },
];

const DEVICES = [
  {
    id: "pc",
    label: "PC",
    title: "桌面电脑",
    image: GAME_SCENE_ASSETS.pc,
    note: "工作台入口",
    position: {
      left: "32.9%",
      top: "34.7%",
      width: "47.8%",
      height: "42.6%",
    },
  },
  {
    id: "ipad",
    label: "iPad",
    title: "平板",
    image: GAME_SCENE_ASSETS.ipad,
    note: "记忆与日记",
    position: {
      left: "24.5%",
      top: "79.6%",
      width: "31.2%",
      height: "27.4%",
    },
  },
  {
    id: "iphone",
    label: "iPhone",
    title: "手机",
    image: GAME_SCENE_ASSETS.iphone,
    note: "外部世界入口",
    position: {
      left: "59.1%",
      top: "82.9%",
      width: "8.4%",
      height: "12.2%",
    },
  },
  {
    id: "ipod",
    label: "iPod",
    title: "音乐播放器",
    image: GAME_SCENE_ASSETS.ipod,
    note: "声音与回忆",
    position: {
      left: "82.9%",
      top: "83%",
      width: "5.4%",
      height: "7.8%",
    },
  },
];

function OrbIcon({ kind }) {
  const commonProps = {
    viewBox: "0 0 24 24",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg",
    "aria-hidden": "true",
  };

  if (kind === "toggle") {
    return (
      <svg {...commonProps}>
        <path
          d="M7 9L12 14L17 9"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  if (kind === "lamp") {
    return (
      <svg {...commonProps}>
        <path
          d="M12 4.5C9.7 4.5 8 6.2 8 8.5C8 10 8.7 11.1 9.5 12L10.7 13.4C11 13.7 11.1 14 11.1 14.4H12.9C12.9 14 13 13.7 13.3 13.4L14.5 12C15.3 11.1 16 10 16 8.5C16 6.2 14.3 4.5 12 4.5Z"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
        <path
          d="M10 17H14"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
        <path
          d="M10.6 19H13.4"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
      </svg>
    );
  }

  if (kind === "cloudy") {
    return (
      <svg {...commonProps}>
        <path
          d="M8.2 17.2H16.8C18.6 17.2 20 15.9 20 14.2C20 12.6 18.8 11.3 17.2 11.2C16.8 9.2 15.1 7.8 13 7.8C11.2 7.8 9.7 8.9 9.1 10.5C7.3 10.6 6 11.9 6 13.6C6 15.6 7.5 17.2 8.2 17.2Z"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  if (kind === "sunny") {
    return (
      <svg {...commonProps}>
        <circle cx="12" cy="12" r="3.2" stroke="currentColor" strokeWidth="1.6" />
        <path
          d="M12 4V6.1M12 17.9V20M4 12H6.1M17.9 12H20M6.3 6.3L7.8 7.8M16.2 16.2L17.7 17.7M6.3 17.7L7.8 16.2M16.2 7.8L17.7 6.3"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
      </svg>
    );
  }

  if (kind === "sunset") {
    return (
      <svg {...commonProps}>
        <path d="M5 15H19" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        <path
          d="M7.5 15A4.5 4.5 0 0 1 16.5 15"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
        <path
          d="M12 4.5V7M8.5 8L9.7 9.2M15.5 8L14.3 9.2"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
      </svg>
    );
  }

  if (kind === "rain") {
    return (
      <svg {...commonProps}>
        <path
          d="M8.4 14.7H16.4C17.9 14.7 19 13.6 19 12.2C19 10.8 17.9 9.7 16.5 9.6C16.1 8 14.6 7 13 7C11.4 7 10 8 9.6 9.5C8 9.6 6.8 10.8 6.8 12.3C6.8 13.7 7.9 14.7 8.4 14.7Z"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
        <path
          d="M9.2 16.8L8.3 19M12.2 16.8L11.3 19M15.2 16.8L14.3 19"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
      </svg>
    );
  }

  if (kind === "snow") {
    return (
      <svg {...commonProps}>
        <path
          d="M12 5V19M7.2 7.8L16.8 16.2M16.8 7.8L7.2 16.2M6 12H18"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
      </svg>
    );
  }

  if (kind === "night") {
    return (
      <svg {...commonProps}>
        <path
          d="M15.7 5.4C14.9 5 14 4.8 13.1 4.8C9.9 4.8 7.3 7.4 7.3 10.6C7.3 13.8 9.9 16.4 13.1 16.4C15.2 16.4 17 15.3 18 13.6C17.4 13.8 16.7 13.9 16 13.9C12.8 13.9 10.2 11.3 10.2 8.1C10.2 7.1 10.4 6.2 10.8 5.4C11.4 5.2 12 5.1 12.6 5.1C13.7 5.1 14.8 5.2 15.7 5.4Z"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  return (
    <svg {...commonProps}>
      <path d="M6 12H18" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

export function GameSceneScreen() {
  const navigate = useNavigate();
  const [phase, setPhase] = useState("closed");
  const [isLampOn, setIsLampOn] = useState(true);
  const [activeWeatherId, setActiveWeatherId] = useState("cloudy");
  const [activeSurfaceId, setActiveSurfaceId] = useState(null);
  const [controlsExpanded, setControlsExpanded] = useState(false);
  const [phoneState, setPhoneState] = useState("closed");
  const [isIphonePressing, setIsIphonePressing] = useState(false);

  useEffect(() => {
    preloadGameSceneAssets();

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
      if (event.key !== "Escape") {
        return;
      }

      if (phoneState === "open") {
        setPhoneState("closing");
        return;
      }

      if (activeSurfaceId) {
        setActiveSurfaceId(null);
        return;
      }

      navigate("/menu");
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [activeSurfaceId, navigate, phoneState]);

  useEffect(() => {
    if (phoneState !== "closing") {
      return undefined;
    }

    const timerId = window.setTimeout(() => {
      setPhoneState("closed");
    }, 320);

    return () => {
      window.clearTimeout(timerId);
    };
  }, [phoneState]);

  const activeWeather =
    WEATHER_OPTIONS.find((option) => option.id === activeWeatherId) ??
    WEATHER_OPTIONS[0];
  const activeSurface = useMemo(
    () => DEVICES.find((device) => device.id === activeSurfaceId) ?? null,
    [activeSurfaceId],
  );
  const isDimWeather = ["rain", "snow", "night"].includes(activeWeatherId);
  const isPhoneVisible = phoneState !== "closed";
  const isOverlayActive = isPhoneVisible || activeSurfaceId !== null;

  const handlePhoneOpen = () => {
    if (phase !== "awake" || isPhoneVisible) {
      return;
    }

    setIsIphonePressing(true);
    window.setTimeout(() => {
      setIsIphonePressing(false);
    }, 300);
    setPhoneState("open");
  };

  const handlePhoneClose = () => {
    if (phoneState === "closed" || phoneState === "closing") {
      return;
    }

    setPhoneState("closing");
  };

  const renderActiveSurface = () => {
    if (activeSurfaceId === "pc") {
      return <VirtualPc onClose={() => setActiveSurfaceId(null)} />;
    }

    if (activeSurfaceId === "ipad") {
      return <VirtualIpad onClose={() => setActiveSurfaceId(null)} />;
    }

    if (activeSurfaceId === "ipod") {
      return <VirtualIpod onClose={() => setActiveSurfaceId(null)} />;
    }

    return null;
  };

  return (
    <main
      className={`game-scene game-scene--${phase} game-scene--weather-${activeWeatherId} ${
        isDimWeather ? "is-dim-weather" : ""
      } ${isLampOn ? "is-lamp-on" : "is-lamp-off"} ${
        isPhoneVisible ? "is-phone-active" : ""
      } ${isOverlayActive ? "is-overlay-active" : ""} ${
        isIphonePressing ? "is-iphone-pressing" : ""
      }`}
    >
      <div className="game-scene__backdrop" />
      <div className="game-scene__grain" />

      <div className="game-scene__art">
        <img
          key={activeWeather.id}
          className="game-scene__weather-layer"
          src={activeWeather.image}
          alt={`${activeWeather.label}的窗外景色`}
        />
        <img
          className="game-scene__base"
          src={
            isLampOn
              ? GAME_SCENE_ASSETS.baseLampOn
              : GAME_SCENE_ASSETS.baseLampOff
          }
          alt="卧室里的办公桌场景"
        />

        <div className="game-scene__device-layer" aria-label="桌面设备">
          {DEVICES.map((device) => (
            <button
              key={device.id}
              type="button"
              className={`scene-device scene-device--${device.id} ${
                phase === "awake" ? "is-awake" : ""
              } ${activeSurfaceId === device.id ? "is-active" : ""} ${
                device.id === "iphone" && isIphonePressing ? "is-pressing" : ""
              }`}
              style={device.position}
              onClick={() => {
                if (device.id === "iphone") {
                  handlePhoneOpen();
                  return;
                }

                setActiveSurfaceId(device.id);
              }}
              disabled={phase !== "awake" || isOverlayActive}
              aria-label={device.title}
            >
              <span className="scene-device__shine" />
              <span className="scene-device__frame" />
              <img
                className="scene-device__image"
                src={device.image}
                alt=""
                aria-hidden="true"
              />
              <span className="scene-device__guide" aria-hidden="true">
                <span className="scene-device__guide-line" />
                <span className="scene-device__guide-copy">
                  <strong>{device.label}</strong>
                  <em>{device.note}</em>
                </span>
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="game-scene__lamp-glow" aria-hidden="true" />
      <div className="game-scene__weather-mood" aria-hidden="true" />
      <div className="game-scene__vignette" />
      <div className="game-scene__focus" />

      <button
        type="button"
        className="game-scene__back-button"
        onClick={() => navigate("/menu")}
        aria-label="返回开始游戏页面"
      >
        <span className="game-scene__orb-icon" aria-hidden="true">
          ←
        </span>
      </button>

      <header className="game-scene__weather-shell">
        <div
          className={`game-scene__control-orbs ${
            controlsExpanded ? "is-expanded" : ""
          }`}
        >
          <button
            type="button"
            className={`game-scene__control-orb game-scene__control-orb--toggle ${
              controlsExpanded ? "is-active" : ""
            }`}
            onClick={() => setControlsExpanded((current) => !current)}
            aria-expanded={controlsExpanded}
            aria-label={controlsExpanded ? "收起控制按钮" : "展开控制按钮"}
          >
            <span className="game-scene__orb-icon" aria-hidden="true">
              <OrbIcon kind="toggle" />
            </span>
          </button>

          <div
            className={`game-scene__control-tray ${
              controlsExpanded ? "is-expanded" : ""
            }`}
          >
            <button
              type="button"
              className={`game-scene__control-orb ${
                isLampOn ? "is-active is-lamp" : ""
              }`}
              onClick={() => setIsLampOn((current) => !current)}
              disabled={phase !== "awake"}
              aria-pressed={isLampOn}
              aria-label={isLampOn ? "关闭台灯" : "打开台灯"}
            >
              <span className="game-scene__orb-icon" aria-hidden="true">
                <OrbIcon kind="lamp" />
              </span>
            </button>

            {WEATHER_OPTIONS.map((option) => (
              <button
                key={option.id}
                type="button"
                className={`game-scene__control-orb ${
                  option.id === activeWeatherId ? "is-active" : ""
                }`}
                onClick={() => setActiveWeatherId(option.id)}
                aria-label={`切换到${option.label}`}
              >
                <span className="game-scene__orb-icon" aria-hidden="true">
                  <OrbIcon kind={option.id} />
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="game-scene__weather-card">
          <span className="game-scene__weather-date">
            2026-05-09 | {activeWeather.label}
          </span>
          <strong className="game-scene__weather-title">窗外</strong>
          <p className="game-scene__weather-copy">{activeWeather.mood}</p>
        </div>
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
          {isLampOn ? "灯光把桌角照得很安静。" : "房间只剩窗外和屏幕在发光。"}
        </p>
      </div>

      {activeSurface ? renderActiveSurface() : null}
      <VirtualPhone state={phoneState} onClose={handlePhoneClose} />

      <div className="eye-transition" aria-hidden="true">
        <div className="eye-transition__lid eye-transition__lid--top" />
        <div className="eye-transition__lid eye-transition__lid--bottom" />
        <div className="eye-transition__core" />
      </div>
    </main>
  );
}
