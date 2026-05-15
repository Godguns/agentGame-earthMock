import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../app/store/authStore";
import { World3DStage } from "../../components/world3d/World3DStage";
import { SceneLoadingOverlay } from "../../components/world3d/SceneLoadingOverlay";
import "./worldFieldScreen.css";

/* ------------------------------------------------------------------ */
/* Scene & interaction data                                           */
/* ------------------------------------------------------------------ */

const SCENE_OPTIONS = [
  { key: "metro", label: "一线城市", subtitle: "高压、高密度、快节奏", tone: "city", icon: "🏙️" },
  { key: "town", label: "城镇", subtitle: "熟人社会、半开放流动", tone: "town", icon: "🏘️" },
  { key: "village", label: "乡村", subtitle: "低速、自然、关系紧密", tone: "village", icon: "🏡" },
];

const INTERACTIONS = {
  metro: [
    { id: "market", label: "超市", icon: "🛒", x: 22, y: 59, depth: 0, detail: "补给、消费、偶遇事件", story: "你走进超市，冷气扑面而来。货架间一个熟悉的身影让你停下了脚步..." },
    { id: "office", label: "公司", icon: "🏢", x: 50, y: 25, depth: -1, detail: "工作压力、晋升、同事关系", story: "办公室里只剩几盏灯还亮着。电脑屏幕上的 deadline 提醒让你心头一紧。" },
    { id: "apartment", label: "公寓", icon: "🏢", x: 78, y: 38, depth: 0, detail: "独居、日常、归属感", story: "推开公寓的门，小小的房间里摆放着你熟悉的家具。窗台上那盆绿植又长高了一些，你给花盆浇了浇水。" },
    { id: "cafe", label: "咖啡店", icon: "☕", x: 78, y: 54, depth: 0, detail: "休息、社交、支线触发", story: "咖啡的香气让你放松下来。窗边的位置正好能看见街景，你决定在这里多坐一会儿。" },
    { id: "metro_station", label: "地铁站", icon: "🚇", x: 30, y: 72, depth: 1, detail: "通勤、偶遇、日常事件", story: "地铁站人潮涌动。你站在站台上，耳机里放着熟悉的歌，等待下一班列车进站。" },
  ],
  town: [
    { id: "school", label: "学校", icon: "🏫", x: 18, y: 30, depth: -1, detail: "学习、考试、熟人剧情", story: "放学的铃声刚响，走廊里渐渐热闹起来。你收拾好书包，想着今天要去便利店买点东西。" },
    { id: "store", label: "便利店", icon: "🏪", x: 54, y: 58, depth: 0, detail: "闲聊、采购、小事件", story: "便利店老板笑着和你打招呼。你拿了瓶水，顺便问了下最近镇上有什么新鲜事。" },
    { id: "station", label: "公交站", icon: "🚌", x: 78, y: 42, depth: 0, detail: "出行、错过、偶遇", story: "公交站牌下的长椅还空着。你坐下来等车，看着街对面新开的店铺，心里盘算着周末去看看。" },
    { id: "clinic", label: "诊所", icon: "🏥", x: 42, y: 72, depth: 1, detail: "健康、社区、关怀事件", story: "诊所里飘着淡淡的消毒水味。护士抬头看见你，温和地问你需要什么帮助。" },
  ],
  village: [
    { id: "field", label: "耕地", icon: "🌾", x: 18, y: 62, depth: 0, detail: "劳作、收成、体力消耗", story: "风吹过稻田，掀起一层层金色的波浪。你弯腰拔了根杂草，抬头望了望远处的山。" },
    { id: "yard", label: "院子", icon: "🏠", x: 48, y: 32, depth: -1, detail: "家庭互动、日常事务", story: "院子里晒着的被单在风里轻轻摆动。邻居家的狗趴在墙根下打盹，一切都安静得刚刚好。" },
    { id: "path", label: "山路", icon: "⛰️", x: 76, y: 48, depth: 0, detail: "探索、采集、突发事件", story: "山路两旁的野花开得正盛。你听见不远处有溪水声，顺着小路走过去，发现了一片以前没注意到的空地。" },
    { id: "shop", label: "小卖部", icon: "🏚️", x: 58, y: 74, depth: 1, detail: "采购、闲聊、信息交换", story: "小卖部的老爷爷戴着老花镜在看报纸。你挑了几样东西，他放下报纸和你唠起了家常。" },
  ],
};

/* Avatar accent colors matching avatar setup */
const AVATAR_ACCENTS = {
  "avatar-01": "#6ab6ff",
  "avatar-02": "#ffa4c2",
  "avatar-03": "#ad9eff",
  "avatar-04": "#ffbc70",
  "avatar-05": "#77dfc4",
  "avatar-06": "#ff7a7a",
  "avatar-07": "#87d5ff",
  "avatar-08": "#b8adff",
  "avatar-09": "#ffaa8d",
  "avatar-10": "#ffd97a",
  "avatar-11": "#a2dbff",
  "avatar-12": "#95a3ff",
};

function readSelectedAvatar() {
  try {
    const raw = localStorage.getItem("earth-online-avatar-selection");
    if (!raw) return null;
    const ids = JSON.parse(raw);
    return ids.length > 0 ? ids[0] : null;
  } catch {
    return null;
  }
}

/* ------------------------------------------------------------------ */
/* Component                                                           */
/* ------------------------------------------------------------------ */

export function WorldFieldScreen() {
  const navigate = useNavigate();
  const persona = useAuthStore((s) => s.persona);

  /* Derive default scene from persona location */
  const defaultScene = useMemo(() => {
    const city = persona?.raw_settings?.identity?.location?.city;
    if (!city) return "metro";
    const bigCities = ["北京", "上海", "广州", "深圳", "杭州", "成都", "武汉", "南京", "重庆", "西安", "苏州", "天津"];
    if (bigCities.some((c) => city.includes(c))) return "metro";
    if (city.includes("县") || city.includes("村") || city.includes("乡")) return "village";
    return "town";
  }, [persona]);

  const [isLoading, setIsLoading] = useState(true);
  const handleLoadReady = useCallback(() => setIsLoading(false), []);

  const [menuCollapsed, setMenuCollapsed] = useState(false);
  const [sceneKey, setSceneKey] = useState(defaultScene);
  const [targetId, setTargetId] = useState(() => INTERACTIONS[defaultScene][0].id);
  const [storyOpen, setStoryOpen] = useState(false);
  const [walking, setWalking] = useState(false);
  const [arrived, setArrived] = useState(false);
  const walkTargetIsBuilding = useRef(false);
  const storyTimeoutRef = useRef(null);

  const activeScene = useMemo(
    () => SCENE_OPTIONS.find((item) => item.key === sceneKey) || SCENE_OPTIONS[0],
    [sceneKey],
  );
  const points = INTERACTIONS[sceneKey];
  const activePoint = points.find((item) => item.id === targetId) || points[0];

  const selectedAvatarId = readSelectedAvatar();
  const avatarAccent = AVATAR_ACCENTS[selectedAvatarId] || "#6ab6ff";

  /* User clicked a building in the 3D world */
  const handleBuildingClick = useCallback((building) => {
    if (storyTimeoutRef.current) {
      clearTimeout(storyTimeoutRef.current);
      storyTimeoutRef.current = null;
    }
    setTargetId(building.id);
    setWalking(true);
    setArrived(false);
    setStoryOpen(false);
    walkTargetIsBuilding.current = true;
  }, []);

  /* User clicked ground (free walk, no building) */
  const handleGroundClick = useCallback(() => {
    if (storyTimeoutRef.current) {
      clearTimeout(storyTimeoutRef.current);
      storyTimeoutRef.current = null;
    }
    setStoryOpen(false);
    setWalking(true);
    setArrived(false);
    walkTargetIsBuilding.current = false;
  }, []);

  /* Character arrived at destination */
  const handleArrived = useCallback(() => {
    setWalking(false);
    setArrived(true);
    // Only auto-open story when arriving at a building
    if (walkTargetIsBuilding.current) {
      storyTimeoutRef.current = setTimeout(() => {
        storyTimeoutRef.current = null;
        setStoryOpen(true);
      }, 500);
    }
  }, []);

  /* Switch scene */
  const handleSceneSwitch = useCallback((key) => {
    setSceneKey(key);
    setTargetId(INTERACTIONS[key][0].id);
    setWalking(false);
    setArrived(false);
    setStoryOpen(false);
  }, []);

  const personaCity = persona?.raw_settings?.identity?.location?.city || "未知";

  return (
    <main className={`world-field world-field--${activeScene.tone}`}>
      {/* Loading overlay — blocks until GLBs ready & 3s minimum elapsed */}
      {isLoading && <SceneLoadingOverlay onReady={handleLoadReady} />}

      {/* Fullscreen 3D stage — fills entire viewport */}
      <section className="world-field__stage">
        <World3DStage
          key={sceneKey}
          sceneKey={sceneKey}
          buildings={points}
          activeTargetId={targetId}
          onBuildingClick={handleBuildingClick}
          onGroundClick={handleGroundClick}
          onArrived={handleArrived}
          avatarAccent={avatarAccent}
        />

        {/* Top bar — floats above 3D */}
        <header className="world-field__topbar">
          <div>
            {/* <p className="world-field__eyebrow">SECOND SCENE · {personaCity}</p>
            <h1>世界场景</h1> */}
          </div>
          <div className="world-field__top-actions">
            <button type="button" onClick={() => navigate("/game")}>返回主界面</button>
            <button type="button" onClick={() => navigate("/avatar/setup")}>切换形象</button>
          </div>
        </header>

        {/* HUD overlay — floats above 3D canvas */}
        <div className="world-field__hud">
          <div className="world-field__mission">
            <span>当前场景</span>
            <strong>{activeScene.icon} {activeScene.label}</strong>
            <p>
              {walking
                ? `正在前往 ${activePoint.label}...`
                : "点击地图中的建筑或地面，角色会寻路走过去并触发交互剧情。"}
            </p>
          </div>

          <div className="world-field__action-bar">
            <button type="button" onClick={() => {
              setTargetId(activePoint.id);
              setWalking(true);
              setArrived(false);
            }}>
              前往当前位置
            </button>
            <button type="button" onClick={() => setStoryOpen(true)} disabled={!arrived && !storyOpen}>
              查看剧情
            </button>
          </div>
        </div>
      </section>

      {/* Floating light frosted glass scene selector */}
      <aside className={`world-field__selector ${menuCollapsed ? "is-collapsed" : ""}`}>
        <button
          type="button"
          className="world-field__menu-toggle"
          onClick={() => setMenuCollapsed((v) => !v)}
          aria-label={menuCollapsed ? "展开菜单" : "收起菜单"}
        >
          {menuCollapsed ? "☰" : "✕"}
        </button>
        {SCENE_OPTIONS.map((item) => (
          <button
            key={item.key}
            type="button"
            className={`world-field__scene-pill ${sceneKey === item.key ? "is-active" : ""}`}
            onClick={() => handleSceneSwitch(item.key)}
          >
            <span className="world-field__scene-icon">{item.icon}</span>
            <div>
              <strong>{item.label}</strong>
              <span>{item.subtitle}</span>
            </div>
          </button>
        ))}
      </aside>

      {/* Story dialog — VN-style bottom panel (React overlay above 3D) */}
      {storyOpen ? (
        <section
          className="world-field__story-overlay"
          role="dialog"
          aria-modal="true"
          onClick={() => setStoryOpen(false)}
        >
          <div
            className="world-field__story-panel"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="world-field__story-close"
              onClick={() => setStoryOpen(false)}
            >
              ×
            </button>

            <div className="world-field__story-header">
              <span className="world-field__story-location">
                {activePoint.icon} {activePoint.label}
              </span>
              <span className="world-field__story-scene">{activeScene.label}</span>
            </div>

            <div className="world-field__story-body">
              <p className="world-field__story-text">{activePoint.detail}</p>
              <div className="world-field__story-divider" />
              <p className="world-field__story-narration">{activePoint.story}</p>
            </div>

            <div className="world-field__story-choices">
              <button
                type="button"
                className="world-field__choice world-field__choice--primary"
                onClick={() => setStoryOpen(false)}
              >
                进入互动
              </button>
              <button
                type="button"
                className="world-field__choice world-field__choice--secondary"
                onClick={() => setStoryOpen(false)}
              >
                观察周围
              </button>
              <button
                type="button"
                className="world-field__choice world-field__choice--ghost"
                onClick={() => setStoryOpen(false)}
              >
                离开
              </button>
            </div>

            <div className="world-field__story-indicator">
              <span>点击对话框继续</span>
            </div>
          </div>
        </section>
      ) : null}
    </main>
  );
}
