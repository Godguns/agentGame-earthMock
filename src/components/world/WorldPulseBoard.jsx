import { useMemo, useState } from "react";

import { useAuthStore } from "../../app/store/authStore";
import { GameActionCard } from "../ui/GameActionCard";
import { GameBadge } from "../ui/GameBadge";
import { GamePanel } from "../ui/GamePanel";
import { GameSectionTitle } from "../ui/GameSectionTitle";
import { GameStatRing } from "../ui/GameStatRing";
import { useWorldStore } from "../../app/store/worldStore";
import "./worldPulseBoard.css";

export function WorldPulseBoard() {
  const token = useAuthStore((state) => state.token);
  const world = useWorldStore();
  const topEvents = useMemo(() => world.events.slice(0, 2), [world.events]);
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={`world-board-shell ${isOpen ? "is-open" : "is-closed"}`}>
      <button
        type="button"
        className={`world-board-toggle ${isOpen ? "is-open" : ""}`}
        onClick={() => setIsOpen((current) => !current)}
        aria-expanded={isOpen}
        aria-controls="world-board-panel"
      >
        <span className="world-board-toggle__badge">世界</span>
        <strong>{isOpen ? "收起状态面板" : "打开状态面板"}</strong>
        <small>{world.time.day_label}</small>
      </button>

      {isOpen ? (
        <GamePanel className="world-board">
          <div id="world-board-panel" className="world-board__content">
            <div className="world-board__topline">
              <GameBadge accent>人生祈愿</GameBadge>
              <GameBadge ghost>{world.time.phase_key}</GameBadge>
            </div>

            <header className="world-board__header">
              <GameSectionTitle
                eyebrow="WORLD STATE"
                title="响彻未来"
                subtitle="这个面板会展示当前生活压力、关系走势和最值得处理的现实事件。"
              />
              <div className="world-board__header-meta">
                <GameBadge ghost>{world.time.deadline_label}</GameBadge>
              </div>
            </header>

            <div className="world-board__hero">
              <div className="world-board__hero-copy">
                <GameBadge className="world-board__hero-tag" accent>
                  高压优先
                </GameBadge>
                <strong>先处理最影响人生轨迹的事件</strong>
                <p>当金钱、健康、情绪、关系偏离安全区时，事件与剧情权重会被动态提高。</p>
              </div>

              <div className="world-board__metrics">
                <GameStatRing label="资金" value={Math.min(world.money.balance / 10000, 1)} color="#47d7ba" />
                <GameStatRing label="健康" value={world.health.energy} color="#66b5ff" />
                <GameStatRing label="情绪" value={world.mood.stability} color="#ffcd6c" />
                <GameStatRing label="关系" value={world.relations.mother} color="#ff98c4" />
              </div>
            </div>

            <div className="world-board__split">
              <GamePanel className="world-board__panel" compact soft showSlashes={false}>
                <div className="world-board__panel-head">
                  <strong>现实事件</strong>
                  <small>优先级排序</small>
                </div>
                <div className="world-board__event-list">
                  {topEvents.map((event) => (
                    <article key={event.id} className={`world-event world-event--${event.tone}`}>
                      <span className="world-event__source">{event.source}</span>
                      <strong>{event.title}</strong>
                      <p>{event.subtitle}</p>
                      <small>
                        {event.priority} · {event.due_in}
                      </small>
                    </article>
                  ))}
                </div>
              </GamePanel>

              <GamePanel className="world-board__panel" compact soft showSlashes={false}>
                <div className="world-board__panel-head">
                  <strong>即时行动</strong>
                  <small>轻量干预</small>
                </div>
                <div className="world-board__action-list">
                  {world.actions.slice(0, 4).map((action) => (
                    <GameActionCard
                      key={action}
                      label={action}
                      meta="将影响后续事件与剧情"
                      onClick={() => world.applyChoice(action, token)}
                      disabled={!token || world.status === "loading"}
                    />
                  ))}
                </div>
              </GamePanel>
            </div>
          </div>
        </GamePanel>
      ) : null}
    </div>
  );
}
