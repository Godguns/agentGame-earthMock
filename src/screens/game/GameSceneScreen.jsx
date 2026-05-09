import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import baseLampOn from "../../images/底图台灯亮.png";
import baseLampOff from "../../images/底图台灯暗.png";
import weatherCloudy from "../../images/多云全屏.png";
import weatherSunny from "../../images/晴天全屏.png";
import weatherSunset from "../../images/晚霞全屏.png";
import weatherSnow from "../../images/下雪天全屏.png";
import weatherNight from "../../images/夜晚全屏.png";
import weatherRain from "../../images/雨天全屏.png";
import pcImage from "../../images/pc.png";
import ipadImage from "../../images/ipad.png";
import iphoneImage from "../../images/iphone.png";
import ipodImage from "../../images/ipod.png";
import "./gameScene.css";

const WEATHER_OPTIONS = [
  {
    id: "cloudy",
    label: "多云",
    image: weatherCloudy,
    mood: "天色发灰，像一整天都没有真正开始。",
  },
  {
    id: "sunny",
    label: "晴天",
    image: weatherSunny,
    mood: "光线太亮，桌上的灰尘都像有了重量。",
  },
  {
    id: "sunset",
    label: "晚霞",
    image: weatherSunset,
    mood: "傍晚像一封没写完的信，还停在窗外。",
  },
  {
    id: "rain",
    label: "雨天",
    image: weatherRain,
    mood: "玻璃外面很安静，只剩下雨在替你说话。",
  },
  {
    id: "snow",
    label: "下雪",
    image: weatherSnow,
    mood: "世界被压低了音量，像有人替你盖上被子。",
  },
  {
    id: "night",
    label: "夜晚",
    image: weatherNight,
    mood: "天已经暗了，房间像只剩屏幕还在醒着。",
  },
];

const DEVICES = [
  {
    id: "pc",
    label: "PC",
    title: "桌面电脑",
    image: pcImage,
    note: "工作台入口",
    hint: "它还亮着，像今天的工作还没真正结束。",
    position: {
      left: "37.9%",
      top: "44.7%",
      width: "34.8%",
      height: "31.6%",
    },
    panelTitle: "PC / WORKSTATION",
    panelBody:
      "后续这里可以挂载完整的电脑桌面、工作消息、招聘网站、邮件系统，或者直接作为一个独立子页面入口。",
  },
  {
    id: "ipad",
    label: "iPad",
    title: "平板",
    image: ipadImage,
    note: "记忆与日记",
    hint: "像一个更安静的你，等着被重新点亮。",
    position: {
      left: "39.6%",
      top: "81.2%",
      width: "16.2%",
      height: "13.8%",
    },
    panelTitle: "IPAD / NOTE SURFACE",
    panelBody:
      "这一层很适合承接日记、记忆回放、草稿、画板、读书记录，做成更私密的内心容器。",
  },
  {
    id: "iphone",
    label: "iPhone",
    title: "手机",
    image: iphoneImage,
    note: "外部世界入口",
    hint: "你和世界之间，最后总会只剩这一块屏幕。",
    position: {
      left: "59.1%",
      top: "82.9%",
      width: "8.4%",
      height: "12.2%",
    },
    panelTitle: "IPHONE / WORLD ENTRY",
    panelBody:
      "后续这里可以直接弹出游戏内手机，承接聊天、银行、招聘、状态、设置等几乎所有系统交互。",
  },
  {
    id: "ipod",
    label: "iPod",
    title: "音乐播放器",
    image: ipodImage,
    note: "声音与回忆",
    hint: "有些时候，人是靠一首歌活过那一天的。",
    position: {
      left: "82.9%",
      top: "83%",
      width: "5.4%",
      height: "7.8%",
    },
    panelTitle: "IPOD / MEMORY NOISE",
    panelBody:
      "这里很适合接环境音、歌单、语音片段，或者做成触发记忆碎片与情绪回声的入口。",
  },
];

function DevicePanel({ device, onClose }) {
  return (
    <div
      className="game-device-panel"
      role="dialog"
      aria-modal="true"
      aria-labelledby={`${device.id}-title`}
    >
      <button
        type="button"
        className="game-device-panel__backdrop"
        aria-label="关闭设备浮层"
        onClick={onClose}
      />
      <aside
        className={`game-device-panel__sheet game-device-panel__sheet--${device.id}`}
      >
        <div className="game-device-panel__frame" />
        <p className="game-device-panel__eyebrow">{device.panelTitle}</p>
        <h2 id={`${device.id}-title`} className="game-device-panel__title">
          {device.title}
        </h2>
        <p className="game-device-panel__copy">{device.panelBody}</p>
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
  const [isLampOn, setIsLampOn] = useState(true);
  const [activeWeatherId, setActiveWeatherId] = useState("cloudy");
  const [activeDeviceId, setActiveDeviceId] = useState(null);

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
        if (activeDeviceId) {
          setActiveDeviceId(null);
          return;
        }

        navigate("/menu");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [activeDeviceId, navigate]);

  const activeWeather =
    WEATHER_OPTIONS.find((option) => option.id === activeWeatherId) ??
    WEATHER_OPTIONS[0];
  const activeDevice = useMemo(
    () => DEVICES.find((device) => device.id === activeDeviceId) ?? null,
    [activeDeviceId],
  );

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
          key={activeWeather.id}
          className="game-scene__weather-layer"
          src={activeWeather.image}
          alt={`${activeWeather.label}的窗外景色`}
        />
        <img
          className="game-scene__base"
          src={isLampOn ? baseLampOn : baseLampOff}
          alt="卧室里的办公桌底图。"
        />

        <div className="game-scene__device-layer" aria-label="桌面设备">
          {DEVICES.map((device) => (
            <button
              key={device.id}
              type="button"
              className={`scene-device scene-device--${device.id} ${
                phase === "awake" ? "is-awake" : ""
              } ${activeDeviceId === device.id ? "is-active" : ""}`}
              style={device.position}
              onClick={() => setActiveDeviceId(device.id)}
              disabled={phase !== "awake"}
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
      <div className="game-scene__vignette" />
      <div className="game-scene__focus" />

      <header className="game-scene__weather-shell">
        <div className="game-scene__weather-bar">
          {WEATHER_OPTIONS.map((option) => (
            <button
              key={option.id}
              type="button"
              className={`game-scene__weather-chip ${
                option.id === activeWeatherId ? "is-active" : ""
              }`}
              onClick={() => setActiveWeatherId(option.id)}
            >
              {option.label}
            </button>
          ))}
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

      {activeDevice ? (
        <DevicePanel
          device={activeDevice}
          onClose={() => setActiveDeviceId(null)}
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
