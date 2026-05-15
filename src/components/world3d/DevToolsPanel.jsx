import { useState } from "react";
import "./devTools.css";

const CAMERA_PRESETS = [
  { label: "NIKKE风",  fov: 35, distance: 16, pitch: 28,
    desc: "近景低角度，人物突出，参考 NIKKE / 少女前线 2" },
  { label: "等距标准", fov: 40, distance: 22, pitch: 30,
    desc: "经典等距 3/4 视角（默认）" },
  { label: "俯瞰",     fov: 42, distance: 26, pitch: 50,
    desc: "高俯角，方便观察全局地图" },
  { label: "近景跟拍", fov: 50, distance: 12, pitch: 22,
    desc: "超近跟拍，适合演出过场" },
];
const OSS_BASE = import.meta.env.DEV
  ? "/oss"
  : "https://earth2-1331021090.cos.ap-nanjing.myqcloud.com";
const MODEL_OPTIONS = [
  {
    label: "Emerald Blossom",
    url: `${OSS_BASE}/Meshy_AI_Emerald_Blossom_biped_Animation_Walking_Woman_withSkin.glb`,
  },
  {
    label: "Purple Haired",
    url: `${OSS_BASE}/Meshy_AI_Purple_Haired_Chibi_G_biped_Animation_Walking_Woman_withSkin.glb`,
  },
];
const LIGHTING_PRESETS = {
  anime: {
    label: "二次元",
    ambient: { intensity: 1.4, color: "#f0f4ff" },
    sun: { intensity: 1.5, color: "#fff8ee", posX: 6, posY: 14, posZ: 4 },
    fill: { intensity: 1.0, color: "#eef0ff", posX: -2, posY: 2, posZ: 12 },
    hemisphere: { intensity: 0.8, sky: "#e8eeff", ground: "#776655" },
    point: { intensity: 0.9, color: "#fff8f0", posX: 0, posY: 3, posZ: 6 },
  },
  warm: {
    label: "暖阳",
    ambient: { intensity: 1.2, color: "#fff5e8" },
    sun: { intensity: 2.5, color: "#ffe8cc", posX: 8, posY: 16, posZ: 6 },
    fill: { intensity: 0.8, color: "#fff0dd", posX: 0, posY: 3, posZ: 16 },
    hemisphere: { intensity: 0.7, sky: "#ffe4c4", ground: "#665544" },
    point: { intensity: 1.5, color: "#fff5e0", posX: 0, posY: 4, posZ: 6 },
  },
  cinematic: {
    label: "电影感",
    ambient: { intensity: 0.6, color: "#ddeeff" },
    sun: { intensity: 3.2, color: "#ffeedd", posX: 6, posY: 14, posZ: 4 },
    fill: { intensity: 0.4, color: "#ddeeff", posX: -4, posY: 2, posZ: 14 },
    hemisphere: { intensity: 0.5, sky: "#ddeeff", ground: "#443322" },
    point: { intensity: 2, color: "#fff8ee", posX: 0, posY: 3, posZ: 8 },
  },
  overcast: {
    label: "阴天",
    ambient: { intensity: 1.8, color: "#eef0f5" },
    sun: { intensity: 1.0, color: "#eef0f5", posX: 4, posY: 18, posZ: 8 },
    fill: { intensity: 1.2, color: "#eef0f5", posX: 0, posY: 2, posZ: 16 },
    hemisphere: { intensity: 1.0, sky: "#eef0f5", ground: "#888888" },
    point: { intensity: 0.6, color: "#eef0f5", posX: 0, posY: 5, posZ: 4 },
  },
  golden: {
    label: "黄金时刻",
    ambient: { intensity: 0.8, color: "#ffe8cc" },
    sun: { intensity: 3.5, color: "#ffbb66", posX: 10, posY: 8, posZ: 2 },
    fill: { intensity: 0.5, color: "#ffcc88", posX: -2, posY: 2, posZ: 14 },
    hemisphere: { intensity: 0.6, sky: "#ffbb66", ground: "#553322" },
    point: { intensity: 2.5, color: "#ffdd99", posX: 0, posY: 2, posZ: 10 },
  },
};

export function DevToolsPanel({
  showGrid, setShowGrid,
  paintMode, setPaintMode,
  customBlockedCount, onClearBlocked,
  lighting, onLightingChange,
  fog, onFogChange,
  exposure, onExposureChange,
  camFov, onCamFovChange,
  camDistance, onCamDistanceChange,
  camPitch, onCamPitchChange,
  modelUrl, onModelChange,
}) {
  const [open, setOpen] = useState(false);
  const [sections, setSections] = useState({ grid: true, lighting: true, camera: false, fog: false, model: false });

  const toggleSection = (k) => setSections((s) => ({ ...s, [k]: !s[k] }));

  return (
    <>
      {/* Floating toggle button — always visible */}
      <button
        type="button"
        className={`dev-float-btn${open ? " dev-float-btn--active" : ""}`}
        onClick={() => setOpen((v) => !v)}
        title="开发者工具"
      >
        <span className="dev-float-btn__icon">&#x2699;</span>
        <span className="dev-float-btn__label">DEV</span>
      </button>

      {/* Panel */}
      {open && (
        <div className="dev-tools">
          <div className="dev-tools__header">
            <span>开发者工具</span>
            <button type="button" className="dev-tools__close" onClick={() => setOpen(false)}>✕</button>
          </div>

          {/* Grid */}
          <Section id="grid" title="可行走网格" open={sections.grid} onToggle={() => toggleSection("grid")}>
            <Toggle label="显示网格" value={showGrid} onChange={setShowGrid} />
            <Toggle
              label={<span>涂模式{paintMode && <span className="dev-tools__paint-badge" />}</span>}
              value={paintMode}
              onChange={setPaintMode}
            />
            {paintMode && (
              <p className="dev-tools__hint">点击地面标记/取消阻挡（橙=手动阻挡，红=建筑，绿=可行走）</p>
            )}
            <div className="dev-tools__row">
              <span className="dev-tools__label">已标记</span>
              <span className="dev-tools__val" style={{ width: "auto" }}>{customBlockedCount} 格</span>
            </div>
            <button className="dev-tools__btn dev-tools__btn--danger" onClick={onClearBlocked} disabled={customBlockedCount === 0}>
              清除全部手动阻挡
            </button>
          </Section>

          {/* Lighting */}
          <Section id="lighting" title="光照" open={sections.lighting} onToggle={() => toggleSection("lighting")}>
            <div className="dev-tools__presets">
              {Object.entries(LIGHTING_PRESETS).map(([key, preset]) => (
                <button key={key} type="button" className="dev-tools__preset" onClick={() => onLightingChange(preset)}>
                  {preset.label}
                </button>
              ))}
            </div>
            {lighting && (
              <>
                <Slider label="环境光" value={lighting.ambient?.intensity ?? 1} onChange={(v) => onLightingChange({ ...lighting, ambient: { ...lighting.ambient, intensity: v } })} max={3} />
                <ColorInput label="环境色" value={lighting.ambient?.color ?? "#fff"} onChange={(v) => onLightingChange({ ...lighting, ambient: { ...lighting.ambient, color: v } })} />
                <Slider label="主光源" value={lighting.sun?.intensity ?? 2} onChange={(v) => onLightingChange({ ...lighting, sun: { ...lighting.sun, intensity: v } })} max={6} />
                <ColorInput label="主光色" value={lighting.sun?.color ?? "#fff"} onChange={(v) => onLightingChange({ ...lighting, sun: { ...lighting.sun, color: v } })} />
                <Slider label="补光" value={lighting.fill?.intensity ?? 0.8} onChange={(v) => onLightingChange({ ...lighting, fill: { ...lighting.fill, intensity: v } })} max={3} />
                <Slider label="半球光" value={lighting.hemisphere?.intensity ?? 0.7} onChange={(v) => onLightingChange({ ...lighting, hemisphere: { ...lighting.hemisphere, intensity: v } })} max={2} />
                <Slider label="点光" value={lighting.point?.intensity ?? 1.5} onChange={(v) => onLightingChange({ ...lighting, point: { ...lighting.point, intensity: v } })} max={4} />
              </>
            )}
          </Section>

          {/* Camera */}
          <Section id="camera" title="相机" open={sections.camera} onToggle={() => toggleSection("camera")}>
            <div className="dev-tools__presets" style={{ marginBottom: 6 }}>
              {CAMERA_PRESETS.map((p) => (
                <button
                  key={p.label}
                  type="button"
                  className="dev-tools__preset"
                  title={p.desc}
                  onClick={() => {
                    onCamFovChange(p.fov);
                    onCamDistanceChange(p.distance);
                    onCamPitchChange(p.pitch);
                  }}
                >
                  {p.label}
                </button>
              ))}
            </div>
            <Slider label="FOV" value={camFov} onChange={onCamFovChange} min={25} max={70} step={1} />
            <Slider label="距离" value={camDistance} onChange={onCamDistanceChange} min={8} max={30} step={0.5} />
            <Slider label="俯仰角°" value={camPitch} onChange={onCamPitchChange} min={15} max={60} step={1} />
          </Section>

          {/* 角色模型 */}
          <Section id="model" title="角色模型" open={sections.model} onToggle={() => toggleSection("model")}>
            <div className="dev-tools__presets">
              {MODEL_OPTIONS.map((m) => (
                <button
                  key={m.url}
                  type="button"
                  className={`dev-tools__preset${modelUrl === m.url ? " dev-tools__preset--active" : ""}`}
                  onClick={() => onModelChange(m.url)}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </Section>

          {/* Shadows & Fog */}
          <Section id="fog" title="雾效 & 曝光" open={sections.fog} onToggle={() => toggleSection("fog")}>
            <Slider label="曝光度" value={exposure} onChange={onExposureChange} min={0.5} max={3} step={0.1} />
            {fog && (
              <>
                <ColorInput label="雾色" value={fog.color} onChange={(v) => onFogChange({ ...fog, color: v })} />
                <Slider label="雾近距" value={fog.near} onChange={(v) => onFogChange({ ...fog, near: v })} min={10} max={50} step={1} />
                <Slider label="雾远距" value={fog.far} onChange={(v) => onFogChange({ ...fog, far: v })} min={20} max={100} step={1} />
              </>
            )}
          </Section>
        </div>
      )}
    </>
  );
}

/* ---- Tiny internal components ---- */

function Section({ id, title, open, onToggle, children }) {
  return (
    <div className="dev-tools__section">
      <p className={`dev-tools__section-title${open ? " dev-tools__section-title--open" : ""}`} onClick={onToggle}>
        <span className="dev-tools__arrow">{open ? "▼" : "▶"}</span>
        {title}
      </p>
      {open && <div className="dev-tools__section-body">{children}</div>}
    </div>
  );
}

function Toggle({ label, value, onChange }) {
  return (
    <div className="dev-tools__row">
      <span className="dev-tools__label">{label}</span>
      <button type="button" className={`dev-tools__switch${value ? " dev-tools__switch--on" : ""}`} onClick={() => onChange(!value)} />
    </div>
  );
}

function Slider({ label, value, onChange, min = 0, max = 10, step = 0.1 }) {
  return (
    <div className="dev-tools__row">
      <span className="dev-tools__label">{label}</span>
      <input type="range" className="dev-tools__slider" min={min} max={max} step={step} value={value} onChange={(e) => onChange(parseFloat(e.target.value))} />
      <span className="dev-tools__val">{typeof value === "number" ? value.toFixed(1) : value}</span>
    </div>
  );
}

function ColorInput({ label, value, onChange }) {
  return (
    <div className="dev-tools__row">
      <span className="dev-tools__label">{label}</span>
      <input type="color" className="dev-tools__color" value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}
