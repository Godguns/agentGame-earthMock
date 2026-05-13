import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { useAuthStore } from "../../app/store/authStore";
import { fetchInternalUsers } from "../../services/earthMockApi";
import "./internalUsers.css";

function formatDateTime(value) {
  if (!value) {
    return "--";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "--";
  }

  return date.toLocaleString();
}

function StatCard({ label, value, tone = "default" }) {
  return (
    <article className={`internal-users__stat internal-users__stat--${tone}`}>
      <span>{label}</span>
      <strong>{value}</strong>
    </article>
  );
}

export function InternalUsersScreen() {
  const navigate = useNavigate();
  const token = useAuthStore((state) => state.token);
  const restoreMe = useAuthStore((state) => state.restoreMe);
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");
  const [payload, setPayload] = useState(null);
  const [refreshToken, setRefreshToken] = useState(0);

  useEffect(() => {
    if (!token) {
      navigate("/menu");
      return;
    }

    let cancelled = false;

    const load = async () => {
      setStatus("loading");
      setError("");

      try {
        const currentUser = await restoreMe();
        if (!currentUser) {
          if (!cancelled) {
            navigate("/menu");
          }
          return;
        }

        const nextPayload = await fetchInternalUsers(token);
        if (cancelled) {
          return;
        }

        setPayload(nextPayload);
        setStatus("ready");
      } catch (nextError) {
        if (cancelled) {
          return;
        }

        setError(nextError.message || "Failed to load users");
        setStatus("error");
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [navigate, refreshToken, restoreMe, token]);

  const items = useMemo(() => payload?.items || [], [payload]);

  return (
    <main className="internal-users">
      <section className="internal-users__panel">
        <header className="internal-users__header">
          <div>
            <p className="internal-users__eyebrow">INTERNAL DASHBOARD</p>
            <h1>Current Users</h1>
            <p className="internal-users__summary">
              查看当前注册用户、Persona 绑定情况、消息量和 NPC 会话状态。
            </p>
          </div>

          <div className="internal-users__actions">
            <button type="button" onClick={() => setRefreshToken((value) => value + 1)}>
              Refresh
            </button>
            <button type="button" onClick={() => navigate("/menu")}>
              Back to Menu
            </button>
          </div>
        </header>

        <section className="internal-users__stats">
          <StatCard label="Total Users" value={payload?.total_users ?? "--"} />
          <StatCard
            label="Active Users"
            value={payload?.active_users ?? "--"}
            tone="active"
          />
          <StatCard
            label="Bound Persona"
            value={payload?.bound_persona_users ?? "--"}
            tone="bound"
          />
        </section>

        {status === "loading" ? (
          <div className="internal-users__feedback">Loading users...</div>
        ) : null}

        {status === "error" ? (
          <div className="internal-users__feedback internal-users__feedback--error">
            {error}
          </div>
        ) : null}

        {status === "ready" ? (
          <div className="internal-users__table-wrap">
            <table className="internal-users__table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Persona</th>
                  <th>City</th>
                  <th>Messages</th>
                  <th>Unread</th>
                  <th>NPC Sessions</th>
                  <th>Last Message</th>
                  <th>Last NPC Reply</th>
                  <th>Created</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <div className="internal-users__identity">
                        <strong>{item.username}</strong>
                        <small>{item.email}</small>
                        <span
                          className={`internal-users__badge ${
                            item.is_active ? "is-active" : "is-disabled"
                          }`}
                        >
                          {item.is_active ? "active" : "inactive"}
                        </span>
                      </div>
                    </td>
                    <td>
                      <div className="internal-users__persona">
                        <strong>{item.persona_display_name || "--"}</strong>
                        <span
                          className={`internal-users__badge ${
                            item.has_bound_persona ? "is-bound" : "is-missing"
                          }`}
                        >
                          {item.has_bound_persona ? "bound" : "missing"}
                        </span>
                      </div>
                    </td>
                    <td>{item.persona_city || "--"}</td>
                    <td>{item.message_count}</td>
                    <td>{item.unread_message_count}</td>
                    <td>{item.npc_session_count}</td>
                    <td>{formatDateTime(item.latest_message_at)}</td>
                    <td>{formatDateTime(item.latest_npc_message_at)}</td>
                    <td>{formatDateTime(item.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </section>
    </main>
  );
}
