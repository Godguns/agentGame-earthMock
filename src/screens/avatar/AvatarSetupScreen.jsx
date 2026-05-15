import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../app/store/authStore";
import "./avatarSetupScreen.css";

const AVATAR_POOL = [
  { id: "avatar-01", name: "晨海", tag: "冷静 / 都市感", accent: "rgba(106, 182, 255, 0.9)", img: "https://i.imgant.com/v2/cQkD7mI.png" },
  { id: "avatar-02", name: "白露", tag: "柔和 / 轻社交", accent: "rgba(255, 164, 194, 0.92)", img: "https://i.imgant.com/v2/UrvwXnL.png" },
  { id: "avatar-03", name: "时雨", tag: "克制 / 高专注", accent: "rgba(173, 158, 255, 0.92)", img: "https://i.imgant.com/v2/NUcx5Nq.jpeg" },
  { id: "avatar-04", name: "夏澄", tag: "外向 / 活力型", accent: "rgba(255, 188, 112, 0.92)", img: "https://i.imgant.com/v2/4OF0VcB.png" },
  { id: "avatar-05", name: "鸢尾", tag: "神秘 / 观察者", accent: "rgba(119, 223, 196, 0.9)", img: "https://i.imgant.com/v2/IOYDyIN.png" },
  { id: "avatar-06", name: "凛夜", tag: "压迫感 / 强意志", accent: "rgba(255, 122, 122, 0.9)", img: "https://i.imgant.com/v2/g8YC4Tr.png" },
  { id: "avatar-07", name: "铃音", tag: "温软 / 慢热", accent: "rgba(135, 213, 255, 0.9)", img: null },
  { id: "avatar-08", name: "深月", tag: "理智 / 距离感", accent: "rgba(184, 173, 255, 0.9)", img: null },
  { id: "avatar-09", name: "栀夏", tag: "开朗 / 亲和", accent: "rgba(255, 170, 141, 0.92)", img: null },
  { id: "avatar-10", name: "璃光", tag: "明艳 / 主角感", accent: "rgba(255, 217, 122, 0.94)", img: "https://i.imgant.com/v2/YNZ2sbE.png" },
  { id: "avatar-11", name: "真昼", tag: "干净 / 少年感", accent: "rgba(162, 219, 255, 0.92)", img: null },
  { id: "avatar-12", name: "雾羽", tag: "孤僻 / 夜行性", accent: "rgba(149, 163, 255, 0.9)", img: null },
];

const MAX_SELECT = 6;
const STORAGE_KEY = "earth-online-avatar-selection";

function readStoredSelection() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function persistSelection(ids) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
}

export function AvatarSetupScreen() {
  const navigate = useNavigate();
  const persona = useAuthStore((s) => s.persona);

  const [selectedIds, setSelectedIds] = useState(() => {
    const stored = readStoredSelection();
    return stored.length > 0 ? stored : ["avatar-02", "avatar-06"];
  });
  const [focusedId, setFocusedId] = useState(() => {
    const stored = readStoredSelection();
    return stored[0] || "avatar-02";
  });
  const [previewOpen, setPreviewOpen] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  const selectedAvatars = useMemo(
    () => AVATAR_POOL.filter((item) => selectedIds.includes(item.id)),
    [selectedIds],
  );
  const focusedAvatar =
    AVATAR_POOL.find((item) => item.id === focusedId) || AVATAR_POOL[0];

  const toggleAvatar = (id) => {
    setFocusedId(id);
    setSelectedIds((current) => {
      let next;
      if (current.includes(id)) {
        next = current.filter((item) => item !== id);
      } else if (current.length >= MAX_SELECT) {
        next = [...current.slice(1), id];
      } else {
        next = [...current, id];
      }
      persistSelection(next);
      return next;
    });
  };

  const handleConfirm = () => {
    if (selectedIds.length === 0) return;
    persistSelection(selectedIds);
    setConfirmed(true);

    // Navigate to world field after a brief confirmation visual
    setTimeout(() => {
      navigate("/world/field");
    }, 600);
  };

  const personaScene = persona?.raw_settings?.identity?.location?.city
    ? "metro"
    : null;

  return (
    <main className={`avatar-setup ${confirmed ? "avatar-setup--confirmed" : ""}`}>
      {/* Left dock nav */}
      <aside className="avatar-setup__dock">
        <button
          type="button"
          className="avatar-setup__nav-pill"
          onClick={() => navigate("/game")}
        >
          返回主界面
        </button>
        <button type="button" className="avatar-setup__nav-icon" aria-label="人物筛选" />
        <button type="button" className="avatar-setup__nav-icon" aria-label="外观预设" />
        <button type="button" className="avatar-setup__nav-icon" aria-label="收藏形象" />
      </aside>

      {/* Hero section — focused avatar showcase */}
      <section className="avatar-setup__hero">
        <div className="avatar-setup__hero-overlay" />
        <div className="avatar-setup__hero-copy">
          <p className="avatar-setup__eyebrow">AVATAR INIT</p>
          <h1>选择你的虚拟形象</h1>
          <p className="avatar-setup__copy">
            选择一个代表你在虚拟地球中的形象。后续将支持像素风角色素材替换，当前可先选择气质标签匹配的形象。
          </p>
          <div className="avatar-setup__hero-meta">
            <span>{focusedAvatar.name}</span>
            <strong>{focusedAvatar.tag}</strong>
          </div>
          <div className="avatar-setup__hero-actions">
            <button
              type="button"
              className="avatar-setup__btn avatar-setup__btn--primary"
              onClick={handleConfirm}
              disabled={selectedIds.length === 0}
            >
              确认选择 ({selectedIds.length}/{MAX_SELECT})
            </button>
            <button
              type="button"
              className="avatar-setup__btn avatar-setup__btn--ghost"
              onClick={() => setPreviewOpen(true)}
            >
              预览形象
            </button>
          </div>
        </div>

        <div className="avatar-setup__featured">
          <div
            className="avatar-setup__featured-card"
            style={{ "--avatar-accent": focusedAvatar.accent }}
          >
            <div className="avatar-setup__featured-art">
              {focusedAvatar.img ? (
                <img
                  className="avatar-setup__featured-img"
                  src={focusedAvatar.img}
                  alt={focusedAvatar.name}
                />
              ) : (
                <span className="avatar-setup__placeholder-label">{focusedAvatar.name}</span>
              )}
            </div>
            <div className="avatar-setup__featured-label">
              <strong>{focusedAvatar.name}</strong>
              <span>{focusedAvatar.tag}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Right panel — grid + selected strip */}
      <section className="avatar-setup__panel">
        <header className="avatar-setup__toolbar">
          <div>
            <p>角色池</p>
            <h2>可部署虚拟形象</h2>
          </div>
          <div className="avatar-setup__toolbar-actions">
            <button type="button" onClick={() => setPreviewOpen(true)}>预览</button>
            <button
              type="button"
              className="avatar-setup__confirm-btn"
              onClick={handleConfirm}
              disabled={selectedIds.length === 0}
            >
              确认
            </button>
          </div>
        </header>

        <div className="avatar-setup__grid">
          {AVATAR_POOL.map((item) => {
            const active = selectedIds.includes(item.id);
            const focused = focusedId === item.id;
            return (
              <button
                key={item.id}
                type="button"
                className={`avatar-card ${active ? "is-active" : ""} ${focused ? "is-focused" : ""}`}
                style={{ "--avatar-accent": item.accent }}
                onClick={() => toggleAvatar(item.id)}
              >
                <span className="avatar-card__plus">{active ? "−" : "+"}</span>
                <span className="avatar-card__frame">
                  {item.img ? (
                    <img className="avatar-card__img" src={item.img} alt={item.name} />
                  ) : (
                    <span className="avatar-card__img-placeholder">{item.name[0]}</span>
                  )}
                </span>
                <span className="avatar-card__name">{item.name}</span>
                <small>{item.tag}</small>
              </button>
            );
          })}
        </div>

        <footer className="avatar-setup__selected">
          <div className="avatar-setup__selected-head">
            <strong>已选形象</strong>
            <span>{selectedAvatars.length}/{MAX_SELECT}</span>
          </div>
          <div className="avatar-setup__selected-strip">
            {Array.from({ length: MAX_SELECT }).map((_, index) => {
              const item = selectedAvatars[index];
              return item ? (
                <button
                  key={item.id}
                  type="button"
                  className="avatar-setup__slot is-filled"
                  style={{ "--avatar-accent": item.accent }}
                  onClick={() => setFocusedId(item.id)}
                >
                  {item.img ? (
                    <img className="avatar-setup__slot-img" src={item.img} alt={item.name} />
                  ) : (
                    <span className="avatar-setup__slot-img-placeholder">{item.name[0]}</span>
                  )}
                  <strong>{item.name}</strong>
                  <span>{item.tag}</span>
                </button>
              ) : (
                <div key={`empty-${index}`} className="avatar-setup__slot">
                  <span className="avatar-setup__slot-empty-icon">+</span>
                </div>
              );
            })}
          </div>
        </footer>
      </section>

      {/* Preview modal */}
      {previewOpen ? (
        <div
          className="avatar-setup__preview-overlay"
          role="dialog"
          aria-modal="true"
          onClick={() => setPreviewOpen(false)}
        >
          <div
            className="avatar-setup__preview-card"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="avatar-setup__preview-close"
              onClick={() => setPreviewOpen(false)}
            >
              ×
            </button>
            <p className="avatar-setup__eyebrow">PREVIEW</p>
            <h2>形象预览</h2>
            <div className="avatar-setup__preview-grid">
              {selectedAvatars.length === 0 ? (
                <p className="avatar-setup__preview-empty">尚未选择形象</p>
              ) : (
                selectedAvatars.map((item) => (
                  <div
                    key={item.id}
                    className="avatar-setup__preview-item"
                    style={{ "--avatar-accent": item.accent }}
                  >
                    <div className="avatar-setup__preview-art">
                      {item.img ? (
                        <img className="avatar-setup__preview-img" src={item.img} alt={item.name} />
                      ) : (
                        <span className="avatar-setup__placeholder-label">{item.name}</span>
                      )}
                    </div>
                    <strong>{item.name}</strong>
                    <span>{item.tag}</span>
                  </div>
                ))
              )}
            </div>
            <div className="avatar-setup__preview-actions">
              <button
                type="button"
                className="avatar-setup__btn avatar-setup__btn--primary"
                onClick={() => {
                  setPreviewOpen(false);
                  handleConfirm();
                }}
              >
                确认并进入世界
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {/* Confirmed overlay flash */}
      {confirmed ? (
        <div className="avatar-setup__confirm-flash" />
      ) : null}
    </main>
  );
}
