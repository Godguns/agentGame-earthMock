function ProfileRow({ label, value }) {
  return (
    <div className="persona-panel__row">
      <span>{label}</span>
      <strong>{value || "未标定"}</strong>
    </div>
  );
}

function SaveCard({ item }) {
  return (
    <article className="persona-panel__save-card">
      <span className="persona-panel__save-code">{item.code}</span>
      <div>
        <strong>{item.label}</strong>
        <p>{item.summary}</p>
      </div>
    </article>
  );
}

function SignalList({ title, items }) {
  return (
    <div className="persona-panel__signal-group">
      <h4>{title}</h4>
      <div className="persona-panel__chips">
        {items.length > 0 ? (
          items.map((item) => (
            <span key={`${title}-${item}`} className="persona-panel__chip">
              {item}
            </span>
          ))
        ) : (
          <span className="persona-panel__chip is-muted">等待更多样本</span>
        )}
      </div>
    </div>
  );
}

export function PersonaProfilePanel({ profile, onClose, onOpenSettings }) {
  const { identity, anchors, saveModel, tags, signals } = profile;

  return (
    <div className="persona-panel__overlay" role="dialog" aria-modal="true">
      <button
        type="button"
        className="persona-panel__backdrop"
        onClick={onClose}
        aria-label="关闭人格档案"
      />

      <section className="persona-panel">
        <header className="persona-panel__header">
          <div>
            <p className="persona-panel__eyebrow">BOUND PROFILE</p>
            <h2>{identity.name}</h2>
            <span className="persona-panel__meta">
              {identity.birthDate}
              {identity.age ? ` · ${identity.age}岁` : ""}
              {identity.careerStatus ? ` · ${identity.careerStatus}` : ""}
            </span>
          </div>

          <div className="persona-panel__actions">
            <button
              type="button"
              className="persona-panel__ghost-action"
              onClick={onOpenSettings}
            >
              前往设置中心
            </button>
            <button
              type="button"
              className="persona-panel__close"
              onClick={onClose}
              aria-label="关闭人格档案"
            >
              ×
            </button>
          </div>
        </header>

        <div className="persona-panel__body">
          <section className="persona-panel__section">
            <div className="persona-panel__section-head">
              <h3>S.A.V.E. 模型</h3>
              <p>根据你的标定结果派生出的四象限底色，后续可以直接进入 AI 提示词。</p>
            </div>
            <div className="persona-panel__save-grid">
              {Object.values(saveModel).map((item) => (
                <SaveCard key={item.code} item={item} />
              ))}
            </div>
          </section>

          <section className="persona-panel__section persona-panel__section--split">
            <div className="persona-panel__card">
              <h3>基础锚点</h3>
              <ProfileRow label="出生坐标" value={anchors.origin.birthplace} />
              <ProfileRow label="家庭类型" value={anchors.origin.familyType} />
              <ProfileRow label="家庭期望" value={anchors.origin.familyExpectation} />
              <ProfileRow label="职业状态" value={identity.careerStatus} />
              <ProfileRow label="随身物件" value={identity.carryItem} />
            </div>

            <div className="persona-panel__card">
              <h3>身体与能力</h3>
              <ProfileRow label="身体反馈" value={anchors.body.feedback} />
              <ProfileRow label="维护态度" value={anchors.body.careAttitude} />
              <ProfileRow label="放松方式" value={anchors.body.relaxMode} />
              <ProfileRow
                label="能力偏向"
                value={anchors.skills.bias.join(" / ")}
              />
              <ProfileRow label="学习方式" value={anchors.skills.learningStyle} />
            </div>
          </section>

          <section className="persona-panel__section persona-panel__section--split">
            <div className="persona-panel__card">
              <h3>内心样本</h3>
              <ProfileRow label="最大恐惧" value={anchors.soul.fear} />
              <ProfileRow label="最深渴望" value={anchors.soul.desire} />
              <ProfileRow label="人生优先级" value={anchors.soul.priority} />
            </div>

            <div className="persona-panel__card">
              <h3>关系与财务</h3>
              <ProfileRow label="情感状态" value={anchors.love.status} />
              <ProfileRow label="亲密模式" value={anchors.love.attachment} />
              <ProfileRow label="存款状态" value={anchors.finance.savings} />
              <ProfileRow label="债务状态" value={anchors.finance.debt} />
              <ProfileRow label="现金应急" value={anchors.finance.cashFlow} />
            </div>
          </section>

          <section className="persona-panel__section">
            <div className="persona-panel__section-head">
              <h3>派生标签</h3>
              <p>这些标签更适合在世界生成、NPC 风格和事件权重里直接调用。</p>
            </div>
            <div className="persona-panel__chips">
              {tags.length > 0 ? (
                tags.map((tag) => (
                  <span key={tag} className="persona-panel__chip">
                    {tag}
                  </span>
                ))
              ) : (
                <span className="persona-panel__chip is-muted">等待更多标定</span>
              )}
            </div>
          </section>

          <section className="persona-panel__section persona-panel__section--signals">
            <SignalList title="压力触发" items={signals.pressureTriggers} />
            <SignalList title="安抚入口" items={signals.comfortZones} />
            <SignalList title="关系滤镜" items={signals.relationshipLens} />
          </section>

          <details className="persona-panel__raw">
            <summary>查看绑定结构</summary>
            <pre>{JSON.stringify(profile, null, 2)}</pre>
          </details>
        </div>
      </section>
    </div>
  );
}
