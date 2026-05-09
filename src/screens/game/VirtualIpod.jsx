import { useMemo, useState } from "react";

import { GAME_SCENE_ASSETS } from "./gameSceneAssets";

function IpodIcon({ kind }) {
  const commonProps = {
    viewBox: "0 0 24 24",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg",
    "aria-hidden": "true",
  };

  if (kind === "play") {
    return (
      <svg {...commonProps}>
        <path d="M9 7.4L16.2 12L9 16.6V7.4Z" fill="currentColor" />
      </svg>
    );
  }

  if (kind === "pause") {
    return (
      <svg {...commonProps}>
        <path d="M9.2 7.8V16.2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        <path d="M14.8 7.8V16.2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    );
  }

  if (kind === "prev") {
    return (
      <svg {...commonProps}>
        <path d="M14.8 8L9.6 12L14.8 16V8Z" fill="currentColor" />
        <path d="M8 8V16" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    );
  }

  if (kind === "next") {
    return (
      <svg {...commonProps}>
        <path d="M9.2 8L14.4 12L9.2 16V8Z" fill="currentColor" />
        <path d="M16 8V16" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    );
  }

  return null;
}

const PLAYLIST = [
  {
    id: "night-drive",
    title: "凌晨四点的窗外",
    artist: "Earth Online OST",
    duration: "03:58",
    progress: 0.36,
    poster: GAME_SCENE_ASSETS.weatherNight,
    accent: "0, 158, 255",
    note: "深夜模式 / 房间微亮 / 适合发呆",
  },
  {
    id: "rain-loop",
    title: "雨声循环",
    artist: "Lo-Fi Terminal",
    duration: "05:12",
    progress: 0.58,
    poster: GAME_SCENE_ASSETS.weatherRain,
    accent: "72, 157, 255",
    note: "下雨天 / 写字 / 清空消息列表",
  },
  {
    id: "sunset-memo",
    title: "晚霞未读",
    artist: "Memory Archive",
    duration: "04:21",
    progress: 0.22,
    poster: GAME_SCENE_ASSETS.weatherSunset,
    accent: "255, 164, 96",
    note: "傍晚模式 / 情绪平滑 / 想起某个人",
  },
];

export function VirtualIpod({ onClose }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  const track = PLAYLIST[currentIndex];
  const currentTime = useMemo(() => {
    const seconds = Math.round(238 * track.progress);
    const minutesPart = Math.floor(seconds / 60);
    const secondsPart = seconds % 60;
    return `${String(minutesPart).padStart(2, "0")}:${String(secondsPart).padStart(2, "0")}`;
  }, [track.progress]);

  const goPrev = () => {
    setCurrentIndex((current) => (current === 0 ? PLAYLIST.length - 1 : current - 1));
  };

  const goNext = () => {
    setCurrentIndex((current) => (current === PLAYLIST.length - 1 ? 0 : current + 1));
  };

  return (
    <div
      className="surface-overlay surface-overlay--ipod"
      role="dialog"
      aria-modal="true"
      aria-label="iPod 音乐播放器"
    >
      <button
        type="button"
        className="surface-overlay__backdrop"
        onClick={onClose}
        aria-label="关闭 iPod 界面"
      />

      <section className="virtual-ipod">
        <div
          className="virtual-ipod__glow"
          style={{ "--ipod-accent-rgb": track.accent }}
        />

        <header className="virtual-ipod__header">
          <div>
            <p className="virtual-surface__label">SONIC ARCHIVE</p>
            <strong className="virtual-ipod__header-title">iPod</strong>
          </div>
          <button
            type="button"
            className="virtual-surface__close"
            onClick={onClose}
          >
            Close
          </button>
        </header>

        <div className="virtual-ipod__body">
          <section className="virtual-ipod__poster-stage">
            <div className="virtual-ipod__poster-backdrop">
              <img src={track.poster} alt="" aria-hidden="true" />
            </div>

            <article className="virtual-ipod__poster-card">
              <img
                className="virtual-ipod__poster-image"
                src={track.poster}
                alt={`${track.title} 海报`}
              />
              <div className="virtual-ipod__poster-overlay" />
              <div className="virtual-ipod__poster-copy">
                <span>Now Playing</span>
                <strong>{track.title}</strong>
                <em>{track.artist}</em>
              </div>
            </article>

            <div className="virtual-ipod__poster-stack" aria-hidden="true">
              <img src={GAME_SCENE_ASSETS.weatherRain} alt="" />
              <img src={GAME_SCENE_ASSETS.weatherSunset} alt="" />
            </div>
          </section>

          <section className="virtual-ipod__info">
            <div className="virtual-ipod__meta">
              <span className="virtual-ipod__meta-kicker">Bedroom Player</span>
              <h2>{track.title}</h2>
              <p>{track.note}</p>
            </div>

            <div className="virtual-ipod__timeline">
              <span className="virtual-ipod__timeline-bar">
                <span
                  className="virtual-ipod__timeline-progress"
                  style={{ width: `${track.progress * 100}%` }}
                />
              </span>
              <div className="virtual-ipod__timeline-meta">
                <span>{currentTime}</span>
                <span>{track.duration}</span>
              </div>
            </div>

            <div className="virtual-ipod__controls">
              <button type="button" className="virtual-ipod__control" aria-label="上一首" onClick={goPrev}>
                <IpodIcon kind="prev" />
              </button>
              <button
                type="button"
                className="virtual-ipod__control virtual-ipod__control--play"
                aria-label={isPlaying ? "暂停" : "播放"}
                onClick={() => setIsPlaying((current) => !current)}
              >
                <IpodIcon kind={isPlaying ? "pause" : "play"} />
              </button>
              <button type="button" className="virtual-ipod__control" aria-label="下一首" onClick={goNext}>
                <IpodIcon kind="next" />
              </button>
            </div>

            <div className="virtual-ipod__chips">
              <span>桌面播放器</span>
              <span>后续可接 BGM</span>
              <span>环境音入口</span>
            </div>
          </section>
        </div>
      </section>
    </div>
  );
}
