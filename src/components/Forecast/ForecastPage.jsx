import { useEffect, useMemo, useState } from "react";
import {
  Menu,
  TrendingUp,
  TrendingDown,
  Minus,
  AlertTriangle,
  Search,
  Utensils,
  Car,
  Zap,
  Clapperboard,
  ShoppingBag,
  BookOpen,
  HeartPulse,
  PiggyBank,
  Repeat,
  LayoutGrid,
} from "lucide-react";

import { BudgetSidebar, SHELL_STYLES } from "../BudgetSetupPage/BudgetSetupPage";
import TopNavigation from "../TopNavigation/TopNavigation";
import { cachedFetchJSON } from "../../services/apiCache";

/* =========================================================================
   SMFinTrack — Forecast Page
   Same sidebar/header shell as BudgetSetupPage / BudgetTrackingPage /
   SubscriptionsPage (bsp-* classes, SHELL_STYLES imported directly so it
   stays pixel-identical). Uses the app's real design tokens, same ones
   already used across the other pages:
     Primary #004C48   Accent #2FA8A0   Success #22C55E
     Danger  #EF4444   Warning #F59E0B  Background #F7F9FB
   ========================================================================= */

/* Point this at the real forecast endpoint when it's live.
   Same integration pattern as SubscriptionsPage's SUBSCRIPTIONS_API_URL:
   real fetch() first, mock data as a fallback while the backend
   endpoint doesn't exist yet or is unreachable. */
const FORECAST_API_URL = "https://example.com/api/forecast";

const MOCK_FORECAST = {
  month: "Next Month",
  categories: [
    { id: "food", name: "Food & Dining", icon: "food", predicted: 6200, lastMonth: 5400 },
    { id: "transport", name: "Transport", icon: "transport", predicted: 2600, lastMonth: 2850 },
    { id: "bills", name: "Bills & Utilities", icon: "bills", predicted: 3100, lastMonth: 3100 },
    { id: "entertainment", name: "Entertainment", icon: "entertainment", predicted: 1800, lastMonth: 1150 },
    { id: "shopping", name: "Shopping", icon: "shopping", predicted: 2400, lastMonth: 3600 },
    { id: "subscriptions", name: "Subscriptions", icon: "subscriptions", predicted: 950, lastMonth: 950 },
    { id: "education", name: "Education", icon: "education", predicted: 4000, lastMonth: 4000 },
    { id: "health", name: "Health", icon: "health", predicted: 700, lastMonth: 520 },
  ],
};

/* Expected API response shape:
   { month, categories: [{ id, name, icon, predicted, lastMonth }] } */
async function fetchForecast() {
  try {
    // T15 perf fix: short-lived cache so re-visiting this page within the
    // same session doesn't pay a fresh network round-trip every time.
    const data = await cachedFetchJSON(FORECAST_API_URL);
    return data && Array.isArray(data.categories) ? data : MOCK_FORECAST;
  } catch {
    // Backend not live yet / unreachable — fall back to sample data
    // so the page still renders during local development.
    return new Promise((resolve) => setTimeout(() => resolve(MOCK_FORECAST), 1000));
  }
}

const pkr = (n) => "PKR " + Math.round(n).toLocaleString();

const ICONS = {
  food: Utensils,
  transport: Car,
  bills: Zap,
  entertainment: Clapperboard,
  shopping: ShoppingBag,
  subscriptions: Repeat,
  education: BookOpen,
  health: HeartPulse,
  savings: PiggyBank,
};

function iconFor(key) {
  return ICONS[key] || LayoutGrid;
}

function trendOf(predicted, lastMonth) {
  if (predicted > lastMonth) return "up";
  if (predicted < lastMonth) return "down";
  return "same";
}

function pct(predicted, lastMonth) {
  if (!lastMonth) return 0;
  return Math.round(((predicted - lastMonth) / lastMonth) * 100);
}

// Same semantic tokens as everywhere else: overspend-flavoured trends read
// as Danger, underspend-flavoured trends read as Success.
const TREND_META = {
  up: { label: "Trending up", className: "fc-badge up", Icon: TrendingUp },
  down: { label: "Trending down", className: "fc-badge down", Icon: TrendingDown },
  same: { label: "Staying the same", className: "fc-badge same", Icon: Minus },
};

function TrendBadge({ trend }) {
  const meta = TREND_META[trend];
  const Icon = meta.Icon;
  return (
    <span className={meta.className}>
      <Icon size={12} strokeWidth={2.5} />
      {meta.label}
    </span>
  );
}

function SkeletonBar() {
  return (
    <div className="fc-skel-bargroup">
      <div className="fc-skel fc-skel-bar" style={{ height: "55%" }} />
      <div className="fc-skel fc-skel-bar" style={{ height: "75%" }} />
    </div>
  );
}

function SkeletonRow() {
  return (
    <div className="fc-row fc-skeleton-row">
      <div className="fc-skel fc-skel-icon" />
      <div className="fc-skel-lines">
        <div className="fc-skel fc-skel-line" style={{ width: "45%" }} />
      </div>
      <div className="fc-skel" style={{ width: 96, height: 22, borderRadius: 999 }} />
      <div className="fc-skel" style={{ width: 64, height: 16, borderRadius: 6 }} />
    </div>
  );
}

export default function ForecastPage({ onNavigate }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [status, setStatus] = useState("loading"); // loading | ready | error
  const [data, setData] = useState(null);
  const [filter, setFilter] = useState("all"); // all | up | down | same
  const [query, setQuery] = useState("");
  const [activeId, setActiveId] = useState(null);

  useEffect(() => {
    let mounted = true;
    setStatus("loading");
    fetchForecast()
      .then((res) => {
        if (!mounted) return;
        setData(res);
        setStatus("ready");
      })
      .catch(() => {
        if (mounted) setStatus("error");
      });
    return () => {
      mounted = false;
    };
  }, []);

  const rows = useMemo(() => {
    if (!data) return [];
    return data.categories.map((c) => ({
      ...c,
      trend: trendOf(c.predicted, c.lastMonth),
      diff: pct(c.predicted, c.lastMonth),
    }));
  }, [data]);

  const maxValue = useMemo(
    () => rows.reduce((m, r) => Math.max(m, r.predicted, r.lastMonth), 0) || 1,
    [rows]
  );

  const counts = useMemo(
    () => ({
      up: rows.filter((r) => r.trend === "up").length,
      down: rows.filter((r) => r.trend === "down").length,
      same: rows.filter((r) => r.trend === "same").length,
    }),
    [rows]
  );

  const filteredRows = useMemo(
    () =>
      rows.filter((r) => {
        if (filter !== "all" && r.trend !== filter) return false;
        if (query && !r.name.toLowerCase().includes(query.toLowerCase())) return false;
        return true;
      }),
    [rows, filter, query]
  );

  return (
    <div className="bsp-app">
      <style>{SHELL_STYLES + FC_STYLES}</style>

      <BudgetSidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        activeId="forecast"
        onNavigate={onNavigate}
      />

      <main className="bsp-main">
        <TopNavigation title="Forecast" userInitials="NA" onSettingsClick={() => onNavigate && onNavigate("settings")} />

        <header className="bsp-header">
          <div className="bsp-header-left">
            <button className="bsp-menu-btn" onClick={() => setSidebarOpen(true)} aria-label="Open menu">
              <Menu size={20} />
            </button>
            <div>
              <h1 className="bsp-header-title">Spending Forecast</h1>
            </div>
          </div>

          <div className="bsp-header-right">
            <span className="fc-sync">
              <span className={`fc-sync-dot ${status}`} />
              {status === "loading" && "Syncing…"}
              {status === "ready" && "Synced"}
              {status === "error" && "Sync failed"}
            </span>
          </div>
        </header>

        {/* Chart panel */}
        <div className="bsp-panel fc-chart-panel">
          <div className="fc-chart-head">
            <div>
              <p className="fc-panel-title">{data ? data.month : "Next Month"}</p>
              <p className="fc-panel-sub">Predicted vs last month, by category</p>
            </div>
            <div className="fc-legend">
              <span className="fc-legend-item">
                <span className="fc-legend-dot" style={{ background: "#004C48" }} />
                Last month
              </span>
              <span className="fc-legend-item">
                <span className="fc-legend-dot" style={{ background: "#2FA8A0" }} />
                Predicted
              </span>
            </div>
          </div>

          {status === "error" ? (
            <div className="fc-chart-empty">Couldn't load the forecast. Try again shortly.</div>
          ) : (
            <div className="fc-chart">
              {status === "loading"
                ? Array.from({ length: 6 }).map((_, i) => <SkeletonBar key={i} />)
                : rows.map((r) => {
                    const Icon = iconFor(r.icon);
                    const dimmed = activeId && activeId !== r.id;
                    return (
                      <div
                        key={r.id}
                        className={`fc-bargroup ${dimmed ? "dim" : ""}`}
                        onClick={() => setActiveId(activeId === r.id ? null : r.id)}
                      >
                        <div className="fc-tooltip">
                          <p className="fc-tooltip-title">{r.name}</p>
                          <div className="fc-tooltip-row">
                            <span>Predicted</span>
                            <strong>{pkr(r.predicted)}</strong>
                          </div>
                          <div className="fc-tooltip-row">
                            <span>Last month</span>
                            <strong>{pkr(r.lastMonth)}</strong>
                          </div>
                          <div className={`fc-tooltip-diff ${r.trend}`}>
                            {r.diff > 0 ? "+" : ""}
                            {r.diff}% vs last month
                          </div>
                        </div>

                        <div className="fc-bars">
                          <div
                            className="fc-bar last"
                            style={{ height: `${(r.lastMonth / maxValue) * 100}%` }}
                          />
                          <div
                            className="fc-bar predicted"
                            style={{ height: `${(r.predicted / maxValue) * 100}%` }}
                          />
                        </div>
                        <div className="fc-bar-icon">
                          <Icon size={14} />
                        </div>
                        <p className="fc-bar-label">{r.name}</p>
                      </div>
                    );
                  })}
            </div>
          )}
        </div>

        {/* Breakdown list */}
        <div className="bsp-panel fc-list-panel">
          <div className="fc-list-head">
            <p className="fc-panel-title">Category Breakdown</p>
            <div className="fc-list-controls">
              <label className="fc-search">
                <Search size={13} />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search category"
                />
              </label>
              {[
                { key: "all", label: "All" },
                { key: "up", label: `Up (${counts.up})` },
                { key: "down", label: `Down (${counts.down})` },
                { key: "same", label: `Same (${counts.same})` },
              ].map((f) => (
                <button
                  key={f.key}
                  className={`fc-filter-btn ${filter === f.key ? "active" : ""}`}
                  onClick={() => setFilter(f.key)}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {status === "loading" &&
            Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)}

          {status === "ready" && filteredRows.length === 0 && (
            <div className="fc-chart-empty">No categories match this filter.</div>
          )}

          {status === "ready" &&
            filteredRows.map((r) => {
              const Icon = iconFor(r.icon);
              return (
                <div
                  key={r.id}
                  className={`fc-row ${activeId === r.id ? "active" : ""}`}
                  onClick={() => setActiveId(activeId === r.id ? null : r.id)}
                >
                  <div className="fc-row-icon">
                    <Icon size={16} />
                  </div>
                  <p className="fc-row-name">{r.name}</p>
                  <TrendBadge trend={r.trend} />
                  <div className="fc-row-amounts">
                    <p className="fc-row-predicted">{pkr(r.predicted)}</p>
                    <p className="fc-row-last">was {pkr(r.lastMonth)}</p>
                  </div>
                </div>
              );
            })}
        </div>

        {/* Disclaimer */}
        <div className="fc-disclaimer">
          <AlertTriangle size={15} />
          <p>
            <strong>Disclaimer:</strong> forecasts are estimates based on past spending patterns
            and may not reflect actual future expenses.
          </p>
        </div>
      </main>
    </div>
  );
}

const FC_STYLES = `
  /* Sync indicator */
  .fc-sync{ display:flex; align-items:center; gap:7px; font-size:12.5px; font-weight:600; color:#6B7280; }
  .fc-sync-dot{ width:8px; height:8px; border-radius:50%; background:#F59E0B; flex-shrink:0; }
  .fc-sync-dot.ready{ background:#22C55E; }
  .fc-sync-dot.error{ background:#EF4444; }
  .fc-sync-dot.loading{ background:#F59E0B; animation:fc-pulse 1.4s ease infinite; }
  @keyframes fc-pulse{ 0%,100%{ opacity:1; } 50%{ opacity:.4; } }

  .fc-panel-title{ font-family:'Manrope',sans-serif; font-size:15px; font-weight:700; color:#004C48; margin:0; }
  .fc-panel-sub{ font-size:11.5px; color:#6B7280; margin:2px 0 0; }

  /* Chart panel */
  .fc-chart-panel{ padding-bottom:8px; }
  .fc-chart-head{ display:flex; align-items:flex-start; justify-content:space-between; flex-wrap:wrap; gap:12px; margin-bottom:18px; }
  .fc-legend{ display:flex; gap:16px; }
  .fc-legend-item{ display:flex; align-items:center; gap:6px; font-size:12px; font-weight:600; color:#6B7280; }
  .fc-legend-dot{ width:9px; height:9px; border-radius:3px; flex-shrink:0; }

  .fc-chart{ display:flex; align-items:flex-end; gap:14px; height:220px; padding:0 4px 4px; overflow:visible; }
  .fc-bargroup{ position:relative; display:flex; flex-direction:column; align-items:center; flex:1; min-width:52px; height:100%; cursor:pointer; opacity:1; transition:opacity .2s ease; }
  .fc-bargroup.dim{ opacity:.35; }
  .fc-bars{ display:flex; align-items:flex-end; gap:4px; height:168px; width:100%; justify-content:center; }
  .fc-bar{ width:16px; border-radius:4px 4px 0 0; transition:height .5s ease; min-height:3px; }
  .fc-bar.last{ background:#004C48; }
  .fc-bar.predicted{ background:#2FA8A0; }
  .fc-bar-icon{ margin-top:8px; width:26px; height:26px; border-radius:8px; background:#F0FAF9; color:#004C48; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
  .fc-bar-label{ font-size:10px; font-weight:600; color:#6B7280; margin:6px 0 0; text-align:center; line-height:1.25; max-width:64px; }

  /* Hover tooltip — dark navy card, matches the Predicted/Last month/percent layout */
  .fc-tooltip{ position:absolute; bottom:calc(100% + 10px); left:50%; transform:translateX(-50%) translateY(4px); min-width:190px; background:#0B2E2C; color:#fff; border-radius:14px; padding:16px 18px; box-shadow:0 16px 36px rgba(0,76,72,.30); opacity:0; visibility:hidden; pointer-events:none; transition:opacity .15s ease, transform .15s ease; z-index:30; text-align:left; }
  .fc-bargroup:hover .fc-tooltip, .fc-bargroup:focus-within .fc-tooltip{ opacity:1; visibility:visible; transform:translateX(-50%) translateY(0); }
  .fc-bargroup:first-child .fc-tooltip{ left:0; transform:translateX(0) translateY(4px); }
  .fc-bargroup:first-child:hover .fc-tooltip{ transform:translateX(0) translateY(0); }
  .fc-bargroup:last-child .fc-tooltip{ left:auto; right:0; transform:translateX(0) translateY(4px); }
  .fc-bargroup:last-child:hover .fc-tooltip{ transform:translateX(0) translateY(0); }
  .fc-tooltip-title{ font-family:'Manrope',sans-serif; font-size:14px; font-weight:700; color:#fff; margin:0 0 10px; }
  .fc-tooltip-row{ display:flex; align-items:center; justify-content:space-between; gap:20px; font-size:12.5px; color:rgba(255,255,255,.65); margin-bottom:6px; }
  .fc-tooltip-row strong{ color:#fff; font-weight:700; font-size:13px; }
  .fc-tooltip-diff{ margin-top:10px; padding-top:10px; border-top:1px solid rgba(255,255,255,.15); font-size:12.5px; font-weight:700; }
  .fc-tooltip-diff.up{ color:#F87171; }
  .fc-tooltip-diff.down{ color:#5EEAD4; }
  .fc-tooltip-diff.same{ color:rgba(255,255,255,.6); }

  .fc-chart-empty{ display:flex; align-items:center; justify-content:center; height:160px; color:#94A3B8; font-size:13px; text-align:center; }

  /* Skeletons */
  .fc-skel{ background:linear-gradient(90deg,#EEF2F6 25%,#F6F8FA 37%,#EEF2F6 63%); background-size:400% 100%; animation:fc-shimmer 1.4s ease infinite; border-radius:8px; }
  @keyframes fc-shimmer{ 0%{ background-position:100% 0; } 100%{ background-position:0 0; } }
  .fc-skel-bargroup{ display:flex; align-items:flex-end; gap:4px; flex:1; min-width:52px; height:168px; }
  .fc-skel-bar{ width:16px; border-radius:4px 4px 0 0; }
  .fc-skel-icon{ width:32px; height:32px; border-radius:9px; flex-shrink:0; }
  .fc-skel-lines{ flex:1; }
  .fc-skel-line{ height:12px; }

  /* List panel */
  .fc-list-panel{ padding-top:20px; }
  .fc-list-head{ display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px; margin-bottom:16px; }
  .fc-list-controls{ display:flex; align-items:center; gap:8px; flex-wrap:wrap; }
  .fc-search{ display:flex; align-items:center; gap:6px; border:1px solid #E5E7EB; border-radius:999px; padding:7px 12px; color:#94A3B8; background:#F7F9FB; }
  .fc-search input{ border:none; outline:none; background:transparent; font-size:12.5px; width:120px; color:#1F2937; }
  .fc-filter-btn{ border:1px solid #E5E7EB; background:#fff; color:#6B7280; border-radius:999px; padding:7px 13px; font-size:12px; font-weight:600; cursor:pointer; transition:all .15s ease; }
  .fc-filter-btn:hover{ border-color:#2FA8A0; color:#2FA8A0; }
  .fc-filter-btn.active{ background:#004C48; border-color:#004C48; color:#fff; }

  .fc-row{ display:flex; align-items:center; gap:14px; padding:13px 8px; border-top:1px solid #F1F4F8; cursor:pointer; border-radius:10px; transition:background .15s ease; }
  .fc-row:first-child{ border-top:none; }
  .fc-row:hover, .fc-row.active{ background:#F7F9FB; }
  .fc-row-icon{ width:34px; height:34px; border-radius:9px; background:#F0FAF9; color:#004C48; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
  .fc-row-name{ flex:1; min-width:0; font-size:13.5px; font-weight:600; color:#1F2937; margin:0; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
  .fc-row-amounts{ text-align:right; flex-shrink:0; min-width:96px; }
  .fc-row-predicted{ font-size:13.5px; font-weight:700; color:#004C48; margin:0; }
  .fc-row-last{ font-size:11px; color:#94A3B8; margin:2px 0 0; }

  .fc-badge{ display:inline-flex; align-items:center; gap:5px; font-size:11px; font-weight:700; padding:5px 11px; border-radius:999px; white-space:nowrap; flex-shrink:0; }
  .fc-badge.up{ background:rgba(239,68,68,0.10); color:#B91C1C; border:1px solid rgba(239,68,68,0.25); }
  .fc-badge.down{ background:rgba(34,197,94,0.10); color:#15803D; border:1px solid rgba(34,197,94,0.25); }
  .fc-badge.same{ background:#EEF2F6; color:#6B7280; border:1px solid #E5E7EB; }

  /* Disclaimer */
  .fc-disclaimer{ display:flex; align-items:flex-start; gap:10px; margin-top:18px; padding:14px 16px; background:#FEF3E2; border:1px solid rgba(245,158,11,0.30); border-radius:14px; }
  .fc-disclaimer svg{ color:#B45309; flex-shrink:0; margin-top:2px; }
  .fc-disclaimer p{ font-size:12.5px; color:#92400E; line-height:1.55; margin:0; }
  .fc-disclaimer strong{ font-weight:700; }

  @media (max-width:640px){
    .fc-chart{ height:200px; }
    .fc-bars{ height:150px; }
    .fc-row-amounts{ min-width:auto; }
  }
`;
