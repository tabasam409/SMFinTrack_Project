import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import "./UserManagementPage.css";

import {
  Search,
  MoreVertical,
  X,
  Check,
  Ban,
  Eye,
  KeyRound,
  AlertTriangle,
  ChevronDown,
  Shield,
  Clock,
  CreditCard,
  ReceiptText,
  Wallet,
  TrendingUp,
  Activity,
  Users as UsersIcon,
} from "lucide-react";

import AdminPageHeader from "./AdminPageHeader";
import Button from "../Button";
import { ENDPOINTS, USE_MOCK_DATA, apiRequest } from "./adminApi";
import { MOCK_USERS } from "./mockAdminData";

/* -------------------------------------------------------------------------
 * SMFinTrack — User Management
 * -----------------------------------------------------------------------
 * Data contract: GET /api/admin/users → { users: [...], total }
 *   user: { id, first_name, last_name, email, university_name,
 *           is_active, created_at }
 *   optional (see mockAdminData.js note): account_status, last_active_at,
 *   spend_6mo, budgets, subscriptions_detected, audit_log, transactions
 *     transaction: { id, merchant, category, color, type, amount, date }
 * Actions:
 *   PATCH /api/admin/users/{id}  body: { is_active: boolean }
 * ---------------------------------------------------------------------- */

const STATUS_META = {
  active: { label: "Active", dot: "var(--success)", bg: "rgba(34,197,94,0.1)", fg: "#178a45" },
  suspended: { label: "Suspended", dot: "var(--danger)", bg: "rgba(239,68,68,0.1)", fg: "#c22f2f" },
  pending: { label: "Pending verification", dot: "var(--warning)", bg: "rgba(245,158,11,0.12)", fg: "#9a6205" },
};

function fullName(u) {
  return `${u.first_name} ${u.last_name}`;
}

const AVATAR_GRADIENTS = [
  "linear-gradient(135deg,#004C48,#2FA8A0)",
  "linear-gradient(135deg,#6D5BD0,#8B83F6)",
  "linear-gradient(135deg,#D9489B,#F6A8CC)",
  "linear-gradient(135deg,#0E9BB0,#22C55E)",
  "linear-gradient(135deg,#F59E0B,#F97316)",
  "linear-gradient(135deg,#3B82F6,#818CF8)",
];

function initials(u) {
  return `${(u.first_name || "?")[0]}${(u.last_name || "?")[0]}`.toUpperCase();
}

function avatarGradient(u) {
  let h = 0;
  const key = `${u.id}`;
  for (let i = 0; i < key.length; i++) h = (h * 31 + key.charCodeAt(i)) >>> 0;
  return AVATAR_GRADIENTS[h % AVATAR_GRADIENTS.length];
}

function fmtDate(iso) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function fmtPkr(n) {
  return `PKR ${n.toLocaleString()}`;
}

function timeAgo(iso, now) {
  if (!iso) return "Never";
  const mins = Math.round((now - new Date(iso)) / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.round(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return `${Math.round(days / 30)}mo ago`;
}

function highlight(text, query) {
  if (!query || !text) return text;
  const i = text.toLowerCase().indexOf(query.toLowerCase());
  if (i === -1) return text;
  return (
    <>
      {text.slice(0, i)}
      <mark className="umx-highlight">{text.slice(i, i + query.length)}</mark>
      {text.slice(i + query.length)}
    </>
  );
}

function StatusBadge({ status }) {
  const m = STATUS_META[status] || STATUS_META.active;
  return (
    <span className="umx-badge" style={{ background: m.bg, color: m.fg }}>
      <span className="umx-badge-dot" style={{ background: m.dot }} />
      {m.label}
    </span>
  );
}

function Sparkline({ data, width = 200, height = 46 }) {
  if (!data || data.every((v) => v === 0)) {
    return <p className="umx-spark-empty">Not enough history yet.</p>;
  }
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const step = width / (data.length - 1);
  const pts = data.map((v, i) => [i * step, height - ((v - min) / range) * (height - 8) - 4]);
  const path = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" ");
  const areaPath = `${path} L${width},${height} L0,${height} Z`;
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="umx-spark">
      <defs>
        <linearGradient id="umxSparkFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.25" />
          <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaPath} fill="url(#umxSparkFill)" />
      <path d={path} fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={pts[pts.length - 1][0]} cy={pts[pts.length - 1][1]} r="3" fill="var(--accent)" />
    </svg>
  );
}

function UserSkeletonRows() {
  return (
    <>
      {Array.from({ length: 6 }).map((_, i) => (
        <tr key={i} className="umx-skeleton-row">
          {Array.from({ length: 5 }).map((__, j) => (
            <td key={j}>
              <div className="shimmer-line" style={{ width: j === 0 ? "72%" : "55%", height: 12 }} />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

/* ------------------------- Row action menu ------------------------- */
function ActionMenu({ user, onView, onSuspend, onActivate, onResetPassword }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function onClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  return (
    <div className="umx-menu" ref={ref}>
      <button className="umx-icon-btn" onClick={() => setOpen((o) => !o)} aria-label="Row actions">
        <MoreVertical size={16} />
      </button>
      {open && (
        <div className="umx-menu-panel">
          <button
            className="umx-menu-item"
            onClick={() => {
              setOpen(false);
              onView(user);
            }}
          >
            <Eye size={14} /> View details
          </button>
          {user.account_status === "suspended" ? (
            <button
              className="umx-menu-item umx-menu-item-success"
              onClick={() => {
                setOpen(false);
                onActivate(user);
              }}
            >
              <Check size={14} /> Activate account
            </button>
          ) : (
            <button
              className="umx-menu-item umx-menu-item-danger"
              onClick={() => {
                setOpen(false);
                onSuspend(user);
              }}
            >
              <Ban size={14} /> Suspend account
            </button>
          )}
          <button
            className="umx-menu-item"
            onClick={() => {
              setOpen(false);
              onResetPassword(user);
            }}
          >
            <KeyRound size={14} /> Reset password
          </button>
        </div>
      )}
    </div>
  );
}

/* ------------------------- Two-step suspend modal ------------------------- */
function SuspendModal({ user, onCancel, onConfirm }) {
  const REASONS = ["Terms violation", "Suspicious activity", "Requested by user", "Duplicate account", "Other"];
  const [picked, setPicked] = useState(REASONS[0]);
  const [reason, setReason] = useState("");

  return (
    <div className="umx-modal-backdrop" onClick={onCancel}>
      <div className="umx-modal" onClick={(e) => e.stopPropagation()}>
        <div className="umx-modal-head">
          <div className="umx-modal-icon">
            <AlertTriangle size={17} />
          </div>
          <div>
            <h3>Suspend {fullName(user)}?</h3>
            <p>They'll lose access immediately. This is logged and can be reversed from the same menu.</p>
          </div>
        </div>

        <div className="umx-modal-body">
          <label className="umx-modal-label">Reason for suspension</label>
          <div className="umx-chip-row">
            {REASONS.map((r) => (
              <button
                key={r}
                className={`umx-chip-option ${picked === r ? "active" : ""}`}
                onClick={() => setPicked(r)}
                type="button"
              >
                {r}
              </button>
            ))}
          </div>
          {picked === "Other" && (
            <textarea
              autoFocus
              rows={2}
              className="umx-textarea"
              placeholder="Describe what happened…"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          )}
        </div>

        <div className="umx-modal-actions">
          <Button variant="secondary" size="medium" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            variant="danger"
            size="medium"
            iconLeft={<Ban size={14} />}
            onClick={() => onConfirm(picked === "Other" ? reason || "Other" : picked)}
          >
            Suspend account
          </Button>
        </div>
      </div>
    </div>
  );
}

/* ------------------------- User details drawer ------------------------- */
function DetailsPanel({ user, now, onClose, onSuspend, onActivate }) {
  const totalLimit = user.budgets?.reduce((s, b) => s + b.limit, 0) || 0;
  const totalUsed = user.budgets?.reduce((s, b) => s + b.used, 0) || 0;
  const pct = totalLimit ? Math.round((totalUsed / totalLimit) * 100) : 0;
  const txCount = user.transactions?.length || 0;

  return (
    <>
      <div className="umx-drawer-backdrop" />

      <aside className="umx-panel">
        <div className="umx-panel-cover">
          <button className="umx-cover-close" onClick={onClose} aria-label="Close details">
            <X size={17} />
          </button>
          <div className="umx-cover-id">
            <div className="umx-avatar umx-avatar-lg umx-avatar-ring" style={{ background: avatarGradient(user) }}>
              {initials(user)}
            </div>
            <div className="umx-cover-text">
              <h2>{fullName(user)}</h2>
              <p>{user.email}</p>
            </div>
          </div>
          <div className="umx-cover-chips">
            <StatusBadge status={user.account_status} />
            <span className="umx-pill umx-pill-light">{user.university_name}</span>
            <span className="umx-pill umx-pill-light">Joined {fmtDate(user.created_at)}</span>
          </div>
        </div>

        <div className="umx-panel-stats">
          <div className="umx-stat-card">
            <span className="umx-stat-ico">
              <Clock size={13} />
            </span>
            <div>
              <p className="umx-stat-label">Last active</p>
              <p className="umx-stat-value">{timeAgo(user.last_active_at, now)}</p>
            </div>
          </div>
          <div className="umx-stat-card">
            <span className="umx-stat-ico">
              <CreditCard size={13} />
            </span>
            <div>
              <p className="umx-stat-label">Subscriptions</p>
              <p className="umx-stat-value">{user.subscriptions_detected ?? 0}</p>
            </div>
          </div>
          <div className="umx-stat-card">
            <span className="umx-stat-ico">
              <ReceiptText size={13} />
            </span>
            <div>
              <p className="umx-stat-label">Transactions</p>
              <p className="umx-stat-value">{txCount}</p>
            </div>
          </div>
        </div>

        <div className="umx-panel-body">
          <section>
            <div className="umx-section-title-row">
              <h3>
                <TrendingUp size={13} /> Spending, last 6 months
              </h3>
            </div>
            <div className="umx-card umx-card-graph">
              <Sparkline data={user.spend_6mo} />
            </div>
          </section>

          <section>
            <div className="umx-section-title-row">
              <h3>
                <ReceiptText size={13} /> Recent transactions
              </h3>
              <span className="umx-meta-text">PKR</span>
            </div>
            <div className="umx-card umx-card-tight">
              {user.transactions && user.transactions.length > 0 ? (
                <>
                  <div className="umx-tx-list">
                    {user.transactions.slice(0, 5).map((t) => (
                      <div key={t.id} className="umx-tx-row">
                        <span className="umx-tx-dot" style={{ background: t.color || "var(--accent)" }} />
                        <div className="umx-tx-info">
                          <p className="umx-tx-merchant">{t.merchant}</p>
                          <p className="umx-meta-text">
                            {t.category} · {fmtDate(t.date)}
                          </p>
                        </div>
                        <span className={`umx-tx-amount ${t.type === "deposit" ? "deposit" : ""}`}>
                          {t.type === "deposit" ? "+" : "−"}
                          {fmtPkr(t.amount)}
                        </span>
                      </div>
                    ))}
                  </div>
                  {user.transactions.length > 5 && (
                    <p className="umx-tx-more">+{user.transactions.length - 5} more</p>
                  )}
                </>
              ) : (
                <p className="umx-spark-empty">No transactions yet.</p>
              )}
            </div>
          </section>

          <section>
            <div className="umx-section-title-row">
              <h3>
                <Wallet size={13} /> Budgets this month
              </h3>
              <span className="umx-meta-text">{pct}% used</span>
            </div>
            <div className="umx-card umx-card-tight">
              {user.budgets && user.budgets.length > 0 ? (
                <div className="umx-budget-list">
                  {user.budgets.map((b) => {
                    const p = Math.min(100, Math.round((b.used / b.limit) * 100));
                    const over = p >= 100;
                    const warn = p >= 80 && !over;
                    return (
                      <div key={b.category} className="umx-budget-row">
                        <div className="umx-budget-labels">
                          <span>{b.category}</span>
                          <span className="umx-meta-text">
                            {fmtPkr(b.used)} / {fmtPkr(b.limit)}
                          </span>
                        </div>
                        <div className="umx-progress-track">
                          <div
                            className="umx-progress-fill"
                            style={{
                              width: `${p}%`,
                              background: over ? "var(--danger)" : warn ? "var(--warning)" : "var(--success)",
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="umx-spark-empty">No budgets set up yet.</p>
              )}
            </div>
          </section>

          {user.audit_log && user.audit_log.length > 0 && (
            <section>
              <div className="umx-section-title-row">
                <h3>
                  <Shield size={13} /> Audit log
                </h3>
              </div>
              <div className="umx-audit-list">
                {user.audit_log.map((a, i) => (
                  <div key={i} className="umx-card umx-card-tight">
                    <p className="umx-audit-action">{a.action}</p>
                    <p className="umx-audit-reason">"{a.reason}"</p>
                    <p className="umx-meta-text">
                      {a.who} · {fmtDate(a.at)}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        <div className="umx-panel-footer">
          {user.account_status === "suspended" ? (
            <Button variant="success" size="medium" iconLeft={<Check size={14} />} onClick={() => onActivate(user)}>
              Activate account
            </Button>
          ) : (
            <Button variant="danger" size="medium" iconLeft={<Ban size={14} />} onClick={() => onSuspend(user)}>
              Suspend account
            </Button>
          )}
        </div>
      </aside>
    </>
  );
}

/* ------------------------------- Main page ------------------------------- */
function UserManagementPage({ onOpenMenu = () => {} }) {
  const NOW = useMemo(() => new Date(), []);
  const [users, setUsers] = useState(null);
  const [status, setStatus] = useState("loading"); // loading | success | error
  const [errorMessage, setErrorMessage] = useState("");

  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [tab, setTab] = useState("all");
  const [uniFilters, setUniFilters] = useState([]);
  const [filterOpen, setFilterOpen] = useState(false);

  const [selectedId, setSelectedId] = useState(null);
  const [suspendTarget, setSuspendTarget] = useState(null);
  const [toast, setToast] = useState(null);
  const filterRef = useRef(null);

  const load = useCallback(async (signal) => {
    setStatus("loading");
    try {
      let data;
      if (USE_MOCK_DATA) {
        await new Promise((resolve) => setTimeout(resolve, 700));
        data = MOCK_USERS;
      } else {
        data = await apiRequest(ENDPOINTS.users, { signal });
      }
      setUsers(data.users);
      setStatus("success");
    } catch (err) {
      if (err.name === "AbortError") return;
      setErrorMessage(err.message || "Couldn't load users.");
      setStatus("error");
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load(controller.signal);
    return () => controller.abort();
  }, [load]);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query), 300);
    return () => clearTimeout(t);
  }, [query]);

  useEffect(() => {
    function onClick(e) {
      if (filterRef.current && !filterRef.current.contains(e.target)) setFilterOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2600);
    return () => clearTimeout(t);
  }, [toast]);

  const universities = useMemo(() => {
    if (!users) return [];
    return [...new Set(users.map((u) => u.university_name))];
  }, [users]);

  const filtered = useMemo(() => {
    if (!users) return [];
    let list = users;
    if (tab !== "all") list = list.filter((u) => u.account_status === tab);
    if (uniFilters.length) list = list.filter((u) => uniFilters.includes(u.university_name));
    const q = debouncedQuery.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (u) =>
          fullName(u).toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q) ||
          u.university_name.toLowerCase().includes(q)
      );
    }
    return list;
  }, [users, tab, uniFilters, debouncedQuery]);

  const counts = useMemo(() => {
    if (!users) return { all: 0, active: 0, suspended: 0, pending: 0 };
    return {
      all: users.length,
      active: users.filter((u) => u.account_status === "active").length,
      suspended: users.filter((u) => u.account_status === "suspended").length,
      pending: users.filter((u) => u.account_status === "pending").length,
    };
  }, [users]);

  const signupsThisWeek = useMemo(() => {
    if (!users) return 0;
    const weekAgo = NOW.getTime() - 7 * 86400000;
    return users.filter((u) => new Date(u.created_at).getTime() >= weekAgo).length;
  }, [users, NOW]);

  const clearFilters = () => {
    setQuery("");
    setTab("all");
    setUniFilters([]);
  };

  const selected = useMemo(() => users?.find((u) => u.id === selectedId) || null, [users, selectedId]);

  const applyStatusChange = useCallback(async (user, nextStatus, extra = {}) => {
    // Optimistic update first
    setUsers((prev) =>
      prev.map((u) =>
        u.id === user.id ? { ...u, account_status: nextStatus, is_active: nextStatus !== "suspended", ...extra } : u
      )
    );
    try {
      if (!USE_MOCK_DATA) {
        await apiRequest(ENDPOINTS.userById(user.id), {
          method: "PATCH",
          body: { is_active: nextStatus !== "suspended" },
        });
      } else {
        await new Promise((resolve) => setTimeout(resolve, 350));
      }
    } catch {
      // Roll back on failure
      setUsers((prev) => prev.map((u) => (u.id === user.id ? { ...u, account_status: user.account_status, is_active: user.is_active } : u)));
      setToast({ kind: "error", text: `Couldn't update ${fullName(user)}. Try again.` });
    }
  }, []);

  const handleSuspendConfirm = (reasonText) => {
    const u = suspendTarget;
    applyStatusChange(u, "suspended", {
      audit_log: [{ who: "You (Admin)", action: "Suspended account", reason: reasonText, at: NOW.toISOString() }, ...(u.audit_log || [])],
    });
    setSuspendTarget(null);
    setToast({ kind: "suspend", text: `${fullName(u)} was suspended` });
  };

  const handleActivate = (u) => {
    applyStatusChange(u, "active");
    setToast({ kind: "activate", text: `${fullName(u)} was reactivated` });
  };

  const toggleUniFilter = (name) => {
    setUniFilters((prev) => (prev.includes(name) ? prev.filter((x) => x !== name) : [...prev, name]));
  };

  return (
    <>
      <AdminPageHeader
        eyebrow="Admin"
        title="User Management"
        onOpenMenu={onOpenMenu}
        right={
          <span className="umx-live-pill">
            <UsersIcon size={13} /> {counts.all} accounts
          </span>
        }
      />

      {status === "success" && (
        <div className="umx-kpis">
          <div className="umx-kpi">
            <span className="umx-kpi-icon">
              <UsersIcon size={16} />
            </span>
            <div className="umx-kpi-text">
              <p className="umx-kpi-label">Total users</p>
              <p className="umx-kpi-value">{counts.all}</p>
              <p className="umx-kpi-trend">
                <TrendingUp size={12} /> +{signupsThisWeek} this week
              </p>
            </div>
          </div>

          <div className="umx-kpi">
            <span className="umx-kpi-icon umx-kpi-live">
              <Activity size={16} />
              <i className="umx-ping" />
            </span>
            <div className="umx-kpi-text">
              <p className="umx-kpi-label">Active users</p>
              <p className="umx-kpi-value">{counts.active}</p>
              <p className="umx-kpi-meta">Live &amp; verified</p>
            </div>
          </div>

          <div className="umx-kpi umx-kpi-danger">
            <span className="umx-kpi-icon">
              <Ban size={16} />
            </span>
            <div className="umx-kpi-text">
              <p className="umx-kpi-label">Suspended</p>
              <p className="umx-kpi-value">{counts.suspended}</p>
              <p className="umx-kpi-meta">Needs review</p>
            </div>
          </div>

          <div className="umx-kpi umx-kpi-warning">
            <span className="umx-kpi-icon">
              <Clock size={16} />
            </span>
            <div className="umx-kpi-text">
              <p className="umx-kpi-label">Pending verification</p>
              <p className="umx-kpi-value">{counts.pending}</p>
              <p className="umx-kpi-meta">Awaiting approval</p>
            </div>
          </div>
        </div>
      )}

      {status === "error" && (
        <div className="admin-error-box">
          <div className="admin-error-icon">
            <AlertTriangle size={20} strokeWidth={1.8} />
          </div>
          <h3>Couldn't load users</h3>
          <p>{errorMessage}</p>
          <Button variant="danger" size="medium" onClick={() => load()}>
            Retry connection
          </Button>
        </div>
      )}

      {status !== "error" && (
        <div className="umx-shell">
          <div className={`umx-table-col ${selected ? "with-panel" : ""}`}>
            <div className="admin-panel umx-toolbar-panel">
              <div className="admin-panel-header">
                <div>
                  <h2>Registered accounts</h2>
                  <p>Search, filter, and manage every SMFinTrack account from one place.</p>
                </div>
              </div>

              <div className="umx-controls">
                <div className="umx-search">
                  <Search size={15} className="umx-search-icon" />
                  <input
                    className="umx-search-input"
                    placeholder="Search by name, email, or university…"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                  />
                </div>

                <div className="umx-tabs">
                  {[
                    { key: "all", label: "All" },
                    { key: "active", label: "Active" },
                    { key: "suspended", label: "Suspended" },
                    { key: "pending", label: "Pending" },
                  ].map((t) => (
                    <button
                      key={t.key}
                      className={`umx-tab ${tab === t.key ? "active" : ""}`}
                      onClick={() => setTab(t.key)}
                    >
                      {t.label} <span>{counts[t.key]}</span>
                    </button>
                  ))}
                </div>

                <div className="umx-menu" ref={filterRef}>
                  <button className="umx-filter-btn" onClick={() => setFilterOpen((o) => !o)}>
                    University
                    {uniFilters.length > 0 && <span className="umx-filter-count">{uniFilters.length}</span>}
                    <ChevronDown size={13} />
                  </button>
                  {filterOpen && (
                    <div className="umx-menu-panel umx-filter-panel">
                      {universities.map((name) => (
                        <label key={name} className="umx-checkbox-row">
                          <input
                            type="checkbox"
                            checked={uniFilters.includes(name)}
                            onChange={() => toggleUniFilter(name)}
                          />
                          {name}
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {uniFilters.length > 0 && (
                <div className="umx-chip-row umx-active-chips">
                  {uniFilters.map((name) => (
                    <button key={name} className="umx-filter-chip" onClick={() => toggleUniFilter(name)}>
                      {name} <X size={11} />
                    </button>
                  ))}
                  <button className="umx-clear-all" onClick={() => setUniFilters([])}>
                    Clear all
                  </button>
                </div>
              )}
            </div>

            <div className="admin-panel umx-table-panel">
              <div className="admin-table-scroll">
                <table className="admin-table umx-table">
                  <thead>
                    <tr>
                      <th>User</th>
                      <th>Status</th>
                      <th>Signup date</th>
                      <th>Last active</th>
                      <th className="admin-table-action-col"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {status === "loading" && <UserSkeletonRows />}

                    {status === "success" && filtered.length === 0 && (
                      <tr>
                        <td colSpan={5} className="admin-table-empty">
                          <div className="umx-empty">
                            <div className="umx-empty-art">
                              <Search size={22} />
                            </div>
                            <p className="umx-empty-title">No users found</p>
                            <p className="umx-empty-sub">Try a different name or email, or clear your filters.</p>
                            {(query || tab !== "all" || uniFilters.length > 0) && (
                              <Button variant="secondary" size="small" onClick={clearFilters}>
                                Clear filters
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}

                    {status === "success" &&
                      filtered.map((u) => (
                        <tr
                          key={u.id}
                          className={`umx-row ${selectedId === u.id ? "selected" : ""}`}
                          onClick={() => setSelectedId(selectedId === u.id ? null : u.id)}
                        >
                          <td>
                            <div className="umx-user-cell">
                              <div className="umx-avatar" style={{ background: avatarGradient(u) }}>
                                {initials(u)}
                              </div>
                              <div className="umx-user-text">
                                <p className="umx-user-name">{highlight(fullName(u), debouncedQuery)}</p>
                                <p className="umx-user-email">{highlight(u.email, debouncedQuery)}</p>
                              </div>
                            </div>
                          </td>
                          <td>
                            <StatusBadge status={u.account_status} />
                          </td>
                          <td className="admin-table-muted">{fmtDate(u.created_at)}</td>
                          <td>
                            <p className="umx-active-primary">{timeAgo(u.last_active_at, NOW)}</p>
                            <p className="umx-meta-text">{u.last_active_at ? fmtDate(u.last_active_at) : "—"}</p>
                          </td>
                          <td className="admin-table-action-col" onClick={(e) => e.stopPropagation()}>
                            <div className="umx-row-actions">
                              <button
                                className="umx-icon-btn umx-hover-only"
                                title="Reset password"
                                onClick={() => setToast({ kind: "reset", text: `Password reset email sent to ${fullName(u)}` })}
                              >
                                <KeyRound size={15} />
                              </button>
                              <ActionMenu
                                user={u}
                                onView={(user) => setSelectedId(user.id)}
                                onSuspend={setSuspendTarget}
                                onActivate={handleActivate}
                                onResetPassword={(user) =>
                                  setToast({ kind: "reset", text: `Password reset email sent to ${fullName(user)}` })
                                }
                              />
                            </div>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {selected && (
            <DetailsPanel
              user={selected}
              now={NOW}
              onClose={() => setSelectedId(null)}
              onSuspend={setSuspendTarget}
              onActivate={handleActivate}
            />
          )}
        </div>
      )}

      {suspendTarget && (
        <SuspendModal user={suspendTarget} onCancel={() => setSuspendTarget(null)} onConfirm={handleSuspendConfirm} />
      )}

      {toast && <div className={`umx-toast ${toast.kind === "error" ? "umx-toast-error" : ""}`}>{toast.text}</div>}
    </>
  );
}

export default UserManagementPage;
