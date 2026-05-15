import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { GlareHover, Magnet } from "../ui/reactbitsLite";

import { useAuthStore } from "../../app/store/authStore";
import { GameActionCard } from "../ui/GameActionCard";
import { GameBadge } from "../ui/GameBadge";
import { GamePanel } from "../ui/GamePanel";
import { GameSectionTitle } from "../ui/GameSectionTitle";
import { GameStatRing } from "../ui/GameStatRing";
import { useWorldStore } from "../../app/store/worldStore";
import "./worldPulseBoard.css";

function clamp01(value) {
  return Math.min(Math.max(value, 0), 1);
}

function formatPriority(priority) {
  if (priority === "high") return "高优先";
  if (priority === "medium") return "中优先";
  return "低优先";
}

function buildHeroMeta(event) {
  if (!event) {
    return {
      tag: "状态平稳",
      tone: "calm",
      title: "当前没有必须立刻处理的高压事件",
      copy: "你可以继续推进主线、修复关系，或者主动做一次轻量探索。",
    };
  }

  if (event.tone === "danger") {
    return {
      tag: "高压优先",
      tone: "danger",
      title: event.title,
      copy: event.consequence || event.subtitle,
    };
  }

  if (event.tone === "warn") {
    return {
      tag: "状态偏移",
      tone: "warn",
      title: event.title,
      copy: event.consequence || event.subtitle,
    };
  }

  return {
    tag: "关系提醒",
    tone: "info",
    title: event.title,
    copy: event.consequence || event.subtitle,
  };
}

function buildActionDescriptors(world) {
  const activeEventKeys = new Set(world.events.map((event) => event.event_key));
  const hasRentDue = activeEventKeys.has("rent_due");
  const hasSleepDebt = activeEventKeys.has("sleep_debt") || world.health.energy < 0.56;
  const hasMotherThread =
    activeEventKeys.has("mother_attention") || activeEventKeys.has("mother_distance");
  const hasCashCrunch = activeEventKeys.has("cash_crunch");

  return {
    "处理账单": {
      tone: hasRentDue ? "danger" : hasCashCrunch ? "warn" : "neutral",
      meta: hasRentDue
        ? "支付当前房租，解除近期账单压力"
        : "当前没有待处理的固定账单",
      disabled: !hasRentDue,
    },
    "早点休息": {
      tone: hasSleepDebt ? "health" : "neutral",
      meta: hasSleepDebt ? "优先补状态，避免精神继续下滑" : "作为日常恢复动作随时可做",
      disabled: false,
    },
    "给母亲回消息": {
      tone: hasMotherThread ? "relation" : "neutral",
      meta: hasMotherThread ? "先稳住家庭线关系波动" : "维持联系，降低后续疏离风险",
      disabled: false,
    },
    "出去走走": {
      tone: "mood",
      meta: "轻度恢复情绪和精力，适合缓压",
      disabled: false,
    },
  };
}

export function WorldPulseBoard({ open = false }) {
  const navigate = useNavigate();
  const token = useAuthStore((state) => state.token);
  const world = useWorldStore();

  const topEvents = useMemo(() => world.events.slice(0, 3), [world.events]);
  const hero = useMemo(() => buildHeroMeta(topEvents[0]), [topEvents]);
  const actionDescriptors = useMemo(() => buildActionDescriptors(world), [world]);

  const metrics = useMemo(() => {
    const moneyScore = clamp01(
      ((world.money.balance + 1200) / 7200) * 0.72 + (1 - world.money.pressure) * 0.28,
    );
    const healthScore = clamp01(
      world.health.energy * 0.5 + world.health.sleep * 0.24 + world.health.body * 0.26,
    );
    const moodScore = clamp01(
      world.mood.stability * 0.58 +
        (1 - world.mood.anxiety) * 0.26 +
        (1 - world.mood.loneliness) * 0.16,
    );
    const relationScore = clamp01(
      world.relations.mother * 0.52 +
        world.relations.friends * 0.2 +
        world.relations.work * 0.18 +
        world.relations.institution * 0.1,
    );

    return [
      {
        key: "money",
        label: "资金",
        value: moneyScore,
        displayValue: world.money.balance,
        separator: ",",
        color: "rgba(255, 165, 92, 0.96)",
        glowColor: "rgba(255, 128, 78, 0.34)",
      },
      {
        key: "health",
        label: "健康",
        value: healthScore,
        displayValue: Math.round(healthScore * 100),
        color: "rgba(104, 226, 169, 0.96)",
        glowColor: "rgba(84, 218, 154, 0.3)",
      },
      {
        key: "mood",
        label: "情绪",
        value: moodScore,
        displayValue: Math.round(moodScore * 100),
        color: "rgba(104, 196, 255, 0.96)",
        glowColor: "rgba(80, 176, 255, 0.3)",
      },
      {
        key: "relations",
        label: "关系",
        value: relationScore,
        displayValue: Math.round(relationScore * 100),
        color: "rgba(255, 136, 186, 0.96)",
        glowColor: "rgba(255, 110, 170, 0.28)",
      },
    ];
  }, [world]);

  const visibleActions = useMemo(() => {
    return world.actions.slice(0, 4).map((action) => ({
      key: action,
      ...(actionDescriptors[action] || {
        tone: "neutral",
        meta: "将影响后续事件与剧情",
        disabled: false,
      }),
    }));
  }, [actionDescriptors, world.actions]);

  const isBusy = world.status === "loading";

  if (!open) return null;

  return (
    <div className="world-board-shell is-open">
      <GamePanel frosted className="world-board">
        <div id="world-board-panel" className="world-board__content">
          <div className="world-board__topline">
            <GameBadge accent>人生祈愿</GameBadge>
            <GameBadge ghost>{world.time.phase_key}</GameBadge>
          </div>

          <header className="world-board__header">
            <GameSectionTitle
              eyebrow="WORLD STATE"
              subtitle="当前生活压力、关系走向和最值得处理的现实事件。"
              title=""
            />
            <div className="world-board__header-meta">
              <GameBadge ghost>{world.time.deadline_label}</GameBadge>
              <button
                type="button"
                className="world-board__enter-field"
                onClick={() => navigate("/world/field")}
              >
                进入世界场景 →
              </button>
            </div>
          </header>

          <div className="world-board__hero">
            <div className="world-board__hero-copy">
              <GameBadge accent className={`world-board__hero-tag world-board__hero-tag--${hero.tone}`}>
                {hero.tag}
              </GameBadge>
              <strong>{hero.title}</strong>
              <p>{hero.copy}</p>
            </div>

            <div className="world-board__metrics">
              {metrics.map((metric) => (
                <GameStatRing
                  key={metric.key}
                  label={metric.label}
                  value={metric.value}
                  displayValue={metric.displayValue}
                  separator={metric.separator}
                  color={metric.color}
                  glowColor={metric.glowColor}
                />
              ))}
            </div>
          </div>

          <div className="world-board__split">
            <GamePanel className="world-board__panel world-board__panel--events" compact soft>
              <div className="world-board__panel-head">
                <strong>现实事件</strong>
                <small>优先级排序</small>
              </div>
              <div className="world-board__event-list">
                {topEvents.length ? (
                  topEvents.map((event) => (
                    <GlareHover
                      key={event.id}
                      width="100%"
                      height="auto"
                      background="transparent"
                      borderRadius="14px"
                      borderColor="transparent"
                      glareColor="rgba(255,255,255,0.22)"
                      glareOpacity={0.26}
                      glareSize={180}
                    >
                      <article className={`world-event world-event--${event.tone}`}>
                        <span className="world-event__source">{event.source}</span>
                        <strong>{event.title}</strong>
                        <p>{event.subtitle}</p>
                        <small>
                          {formatPriority(event.priority)} · {event.due_in}
                        </small>
                      </article>
                    </GlareHover>
                  ))
                ) : (
                  <article className="world-event world-event--empty">
                    <strong>暂无高压事件</strong>
                    <p>当前世界状态稳定，可以继续推进主线、关系或恢复动作。</p>
                  </article>
                )}
              </div>
            </GamePanel>

            <GamePanel className="world-board__panel world-board__panel--actions" compact soft>
              <div className="world-board__panel-head">
                <strong>即时行动</strong>
                <small>轻量干预</small>
              </div>
              <div className="world-board__action-list">
                {visibleActions.map((action) => (
                  <Magnet key={action.key} disabled={action.disabled || isBusy}>
                    <GameActionCard
                      label={action.key}
                      meta={action.meta}
                      tone={action.tone}
                      onClick={() => world.applyChoice(action.key, token)}
                      disabled={!token || isBusy || action.disabled}
                    />
                  </Magnet>
                ))}
              </div>
            </GamePanel>
          </div>
        </div>
      </GamePanel>
    </div>
  );
}
