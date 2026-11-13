import { useEffect, useMemo, useState, useRef, useCallback } from "react";
import { Menu, EyeOff, RotateCcw, TrendingUp, Undo2, Sparkles, Repeat } from "lucide-react";

import { BudgetSidebar, SHELL_STYLES } from "../BudgetSetupPage/BudgetSetupPage";
import TopNavigation from "../TopNavigation/TopNavigation";
import { cachedFetchJSON } from "../../services/apiCache";

/* =========================================================================
   SMFinTrack — Subscriptions Page
   Same sidebar/header shell as BudgetSetupPage / BudgetTrackingPage
   (bsp-* classes, SHELL_STYLES imported directly so it stays pixel-
   identical). Everything below uses the app's real design tokens:
   Primary #004C48   Accent #2FA8A0   Success #22C55E
   Danger  #EF4444   Warning #F59E0B  Background #F7F9FB
   ========================================================================= */

/* Point this at your real subscriptions endpoint when it's live.
   Same integration pattern as BudgetTrackingPage's BUDGET_API_URL:
   real fetch() first, mock data as a fallback while the backend
   endpoint doesn't exist yet or is unreachable. */
const SUBSCRIPTIONS_API_URL = "https://example.com/api/subscriptions";

const MOCK_SUBSCRIPTIONS = [
  { id: 1, merchant: "Netflix", amount: 1200, frequency: "monthly" },
  { id: 2, merchant: "Amazon Prime", amount: 15000, frequency: "yearly" },
  { id: 3, merchant: "Gym Membership", amount: 2500, frequency: "weekly" },
  { id: 4, merchant: "Spotify", amount: 850, frequency: "monthly" },
  { id: 5, merchant: "iCloud+", amount: 550, frequency: "monthly" },
  { id: 6, merchant: "Adobe Creative Cloud", amount: 65000, frequency: "yearly" },
  { id: 7, merchant: "Coffee Club", amount: 1200, frequency: "weekly" },
];

/* Expected API response shape:
   [{ id, merchant, amount, frequency: 'weekly'|'monthly'|'yearly' }] */
async function fetchSubscriptions() {
  try {
    // T15 perf fix: short-lived cache so re-visiting this page within the
    // same session doesn't pay a fresh network round-trip every time.
    const data = await cachedFetchJSON(SUBSCRIPTIONS_API_URL);
    return Array.isArray(data) ? data : data.subscriptions ?? MOCK_SUBSCRIPTIONS;
  } catch {
    // Backend not live yet / unreachable — fall back to sample data
    // so the page still renders during local development.
    return new Promise((resolve) => setTimeout(() => resolve(MOCK_SUBSCRIPTIONS), 1100));
  }
}

// Normalize any billing frequency into a monthly-equivalent cost
function toMonthly(amount, frequency) {
  switch (frequency) {
    case "weekly":
      return amount * (52 / 12);
    case "yearly":
      return amount / 12;
    default:
      return amount;
  }
}

const pkr = (n) => "PKR " + Math.round(n).toLocaleString();

/* Assumed monthly ceiling for recurring charges. Sized to the sample
   subscriptions above (~PKR 25k/mo) so the ring isn't pinned red by default —
   swap this for a real user-set budget once that's wired up. */
const MONTHLY_BUDGET = 22000;

const FREQ_META = {
  weekly: { label: "Weekly", className: "sub-badge accent" },
  monthly: { label: "Monthly", className: "sub-badge primary" },
  yearly: { label: "Yearly", className: "sub-badge warn" },
};

function Avatar({ name }) {
  const letter = name?.trim()?.[0]?.toUpperCase() ?? "?";
  return <div className="sub-avatar">{letter}</div>;
}

function FrequencyBadge({ frequency }) {
  const meta = FREQ_META[frequency] ?? FREQ_META.monthly;
  return <span className={meta.className}>{meta.label}</span>;
}

// Same thresholds as the Budget Tracking page: ok < 70%, warning 70–100%, critical > 100%
function ringStatus(percent) {
  if (percent > 100) return { color: "#EF4444", label: "critical" };
  if (percent >= 70) return { color: "#F59E0B", label: "warning" };
  return { color: "#22C55E", label: "ok" };
}

function ProgressRing({ percent, size = 88, stroke = 8 }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const clamped = Math.min(percent, 100);
  const dash = (clamped / 100) * c;
  const { color } = ringStatus(percent);
  return (
    <svg width={size} height={size} className="sub-ring" style={{ transform: "rotate(-90deg)" }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#EEF2F6" strokeWidth={stroke} />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={color}
        strokeWidth={stroke}
        strokeDasharray={`${dash} ${c - dash}`}
        strokeLinecap="round"
        style={{ transition: "stroke-dasharray .6s ease, stroke .3s ease" }}
      />
    </svg>
  );
}

function SkeletonRow() {
  return (
    <div className="sub-row sub-skeleton-row">
      <div className="sub-skel sub-skel-avatar" />
      <div className="sub-skel-lines">
        <div className="sub-skel sub-skel-line" style={{ width: "40%" }} />
        <div className="sub-skel sub-skel-line" style={{ width: "26%", height: 9 }} />
      </div>
      <div className="sub-skel" style={{ width: 72, height: 20, borderRadius: 999 }} />
      <div className="sub-skel" style={{ width: 56, height: 16, borderRadius: 6 }} />
      <div className="sub-skel" style={{ width: 28, height: 28, borderRadius: 8 }} />
    </div>
  );
}

function EmptyState({ onReset }) {
  return (
    <div className="sub-empty">
      <div className="sub-empty-icon">
        <Sparkles size={24} />
      </div>
      <p className="sub-empty-title">All clean! No active recurring charges.</p>
      <p className="sub-empty-text">Every subscription is hidden. Bring them back whenever you want to see them again.</p>
      <button className="sub-reset-btn" onClick={onReset}>
        <RotateCcw size={14} />
        Reset list
      </button>
    </div>
  );
}

function SubscriptionRow({ sub, onHide }) {
  const [leaving, setLeaving] = useState(false);
  const monthlyEq = toMonthly(sub.amount, sub.frequency);

  const handleHide = () => {
    setLeaving(true);
    setTimeout(() => onHide(sub.id), 320);
  };

  return (
    <div className={`sub-row${leaving ? " leaving" : ""}`}>
      <Avatar name={sub.merchant} />

      <div className="sub-row-main">
        <p className="sub-merchant">{sub.merchant}</p>
        <p className="sub-sub">
          {pkr(sub.amount)} / {sub.frequency.replace("ly", "")}
        </p>
      </div>

      <FrequencyBadge frequency={sub.frequency} />

      <div className="sub-monthly">
        <p className="sub-monthly-amount">{pkr(monthlyEq)}</p>
        <p className="sub-monthly-label">/mo</p>
      </div>

      <button className="sub-hide-btn" onClick={handleHide} aria-label={`Hide ${sub.merchant}`}>
        <EyeOff size={16} />
      </button>
    </div>
  );
}

function Toast({ message, onUndo, onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, 4000);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <div className="sub-toast show">
      <span>{message}</span>
      <button onClick={onUndo}>
        <Undo2 size={13} />
        Undo
      </button>
    </div>
  );
}

function HiddenRow({ sub, onRestore }) {
  const monthlyEq = toMonthly(sub.amount, sub.frequency);
  return (
    <div className="sub-row sub-row-hidden">
      <Avatar name={sub.merchant} />

      <div className="sub-row-main">
        <p className="sub-merchant">{sub.merchant}</p>
        <p className="sub-sub">
          {pkr(sub.amount)} / {sub.frequency.replace("ly", "")}
        </p>
      </div>

      <FrequencyBadge frequency={sub.frequency} />

      <div className="sub-monthly">
        <p className="sub-monthly-amount">{pkr(monthlyEq)}</p>
        <p className="sub-monthly-label">/mo</p>
      </div>

      <button className="sub-restore-btn" onClick={() => onRestore(sub.id)}>
        <RotateCcw size={13} />
        Restore
      </button>
    </div>
  );
}

export default function SubscriptionsPage({ onNavigate }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [subscriptions, setSubscriptions] = useState([]);
  const [hiddenIds, setHiddenIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [showHiddenPanel, setShowHiddenPanel] = useState(false);
  const undoTimerRef = useRef(null);

  useEffect(() => {
    let mounted = true;
    fetchSubscriptions().then((data) => {
      if (mounted) {
        setSubscriptions(data);
        setLoading(false);
      }
    });
    return () => {
      mounted = false;
      clearTimeout(undoTimerRef.current);
    };
  }, []);

  const visibleSubscriptions = useMemo(
    () => subscriptions.filter((s) => !hiddenIds.includes(s.id)),
    [subscriptions, hiddenIds]
  );

  const totalMonthlyCost = useMemo(
    () => visibleSubscriptions.reduce((sum, s) => sum + toMonthly(s.amount, s.frequency), 0),
    [visibleSubscriptions]
  );

  const percentOfBudget = MONTHLY_BUDGET > 0 ? (totalMonthlyCost / MONTHLY_BUDGET) * 100 : 0;

  const handleHide = useCallback(
    (id) => {
      const sub = subscriptions.find((s) => s.id === id);
      setHiddenIds((prev) => [...prev, id]);
      if (sub) setToast({ id, merchant: sub.merchant });
    },
    [subscriptions]
  );

  const handleUndo = () => {
    if (!toast) return;
    setHiddenIds((prev) => prev.filter((id) => id !== toast.id));
    setToast(null);
  };

  const hiddenSubscriptions = useMemo(
    () => subscriptions.filter((s) => hiddenIds.includes(s.id)),
    [subscriptions, hiddenIds]
  );

  const handleRestore = useCallback((id) => {
    setHiddenIds((prev) => prev.filter((hid) => hid !== id));
  }, []);

  const handleReset = () => {
    setHiddenIds([]);
    setShowHiddenPanel(false);
  };

  return (
    <div className="bsp-app">
      <style>{SHELL_STYLES + SUB_STYLES}</style>

      <BudgetSidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        activeId="subscriptions"
        onNavigate={onNavigate}
      />

      <main className="bsp-main">
        <TopNavigation title="Subscriptions" userInitials="NA" onSettingsClick={() => onNavigate && onNavigate("settings")} />

        <header className="bsp-header">
          <div className="bsp-header-left">
            <button className="bsp-menu-btn" onClick={() => setSidebarOpen(true)} aria-label="Open menu">
              <Menu size={20} />
            </button>
            <div>
              <h1 className="bsp-header-title">Recurring charges, tracked</h1>
            </div>
          </div>
        </header>

        {/* Hero: total monthly cost + progress ring */}
        <div className="sub-hero">
          <div className="sub-hero-ring">
            <ProgressRing percent={percentOfBudget} />
            <div className="sub-hero-ring-label" style={{ color: ringStatus(percentOfBudget).color }}>
              {Math.round(percentOfBudget)}%
            </div>
          </div>
          <div className="sub-hero-main">
            <div className="sub-hero-amount-row">
              <span className="sub-hero-amount">{loading ? "—" : pkr(totalMonthlyCost)}</span>
              {!loading && <TrendingUp size={18} color={ringStatus(percentOfBudget).color} />}
            </div>
            <p className="sub-hero-note">
              Based on active, unhidden subscriptions · budget {pkr(MONTHLY_BUDGET)}/mo
            </p>
          </div>
        </div>

        {/* List */}
        <div className="sub-section-head">
          <div className="sub-section-title">
            <Repeat size={15} className="sub-section-icon" /> Active Subscriptions
          </div>
          <p className="sub-section-sub">Everything billing you on repeat, one place</p>
        </div>

        {loading ? (
          <div className="sub-list">
            {Array.from({ length: 5 }).map((_, i) => (
              <SkeletonRow key={i} />
            ))}
          </div>
        ) : visibleSubscriptions.length === 0 ? (
          <EmptyState onReset={handleReset} />
        ) : (
          <div className="sub-list">
            {visibleSubscriptions.map((sub) => (
              <SubscriptionRow key={sub.id} sub={sub} onHide={handleHide} />
            ))}
          </div>
        )}

        {!loading && hiddenIds.length > 0 && visibleSubscriptions.length > 0 && (
          <button className="sub-show-hidden" onClick={() => setShowHiddenPanel((v) => !v)}>
            <RotateCcw size={12} />
            {showHiddenPanel
              ? "Hide this list"
              : `Show ${hiddenIds.length} hidden subscription${hiddenIds.length > 1 ? "s" : ""}`}
          </button>
        )}

        {/* Hidden Subscriptions — separate section, only what's been hidden, one at a time */}
        {!loading && showHiddenPanel && hiddenSubscriptions.length > 0 && (
          <div className="sub-hidden-block">
            <div className="sub-section-head">
              <div>
                <div className="sub-section-title sub-hidden-title">
                  <EyeOff size={15} className="sub-section-icon" /> Hidden Subscriptions
                </div>
                <p className="sub-section-sub">Subscriptions you've hidden from the list above</p>
              </div>
            </div>
            <div className="sub-list">
              {hiddenSubscriptions.map((sub) => (
                <HiddenRow key={sub.id} sub={sub} onRestore={handleRestore} />
              ))}
            </div>
          </div>
        )}
      </main>

      {toast && (
        <Toast message={`${toast.merchant} has been archived.`} onUndo={handleUndo} onDone={() => setToast(null)} />
      )}
    </div>
  );
}

const SUB_STYLES = `
  /* Hero card */
  .sub-hero{ display:flex; align-items:center; gap:24px; background:rgba(255,255,255,0.9); border:1px solid #E5E7EB; border-radius:18px; box-shadow:0 4px 10px rgba(15,23,42,.05); padding:24px; margin-bottom:28px; }
  .sub-hero-ring{ position:relative; flex-shrink:0; }
  .sub-hero-ring-label{ position:absolute; inset:0; display:flex; align-items:center; justify-content:center; font-size:12px; font-weight:700; color:#004C48; }
  .sub-hero-main{ flex:1; min-width:0; }
  .sub-hero-amount-row{ display:flex; align-items:center; gap:8px; }
  .sub-hero-amount{ font-family:'Manrope',sans-serif; font-size:32px; font-weight:800; color:#004C48; letter-spacing:-0.02em; }
  .sub-hero-note{ font-size:12.5px; color:#6B7280; margin-top:6px; }

  /* Section head */
  .sub-section-head{ margin-bottom:14px; }
  .sub-section-title{ font-family:'Manrope',sans-serif; font-size:17px; font-weight:800; color:#004C48; display:flex; align-items:center; gap:7px; letter-spacing:-.01em; }
  .sub-section-icon{ color:#2FA8A0; }
  .sub-section-sub{ font-size:11.5px; color:#6B7280; margin:2px 0 0 22px; }

  /* List + rows */
  .sub-list{ display:flex; flex-direction:column; gap:12px; }
  .sub-row{ display:flex; align-items:center; gap:14px; background:#fff; border:1px solid #E5E7EB; border-radius:16px; padding:14px 16px; box-shadow:0 4px 10px rgba(15,23,42,.04); transition:opacity .32s ease, transform .32s ease, box-shadow .18s ease, border-color .18s ease; }
  .sub-row:hover{ border-color:#2FA8A0; box-shadow:0 10px 24px rgba(0,76,72,.08); }
  .sub-row.leaving{ opacity:0; transform:translateX(-18px); }

  .sub-avatar{ width:40px; height:40px; border-radius:50%; flex-shrink:0; display:flex; align-items:center; justify-content:center; font-weight:700; font-size:14.5px; color:#004C48; background:#E8F7F5; border:1px solid rgba(47,168,160,.3); }

  .sub-row-main{ flex:1; min-width:0; }
  .sub-merchant{ font-size:14.5px; font-weight:700; color:#16232F; margin:0; letter-spacing:-.01em; }
  .sub-sub{ font-size:11.5px; color:#6B7280; margin:2px 0 0; }

  .sub-badge{ font-size:11px; font-weight:700; padding:4px 11px; border-radius:999px; white-space:nowrap; flex-shrink:0; }
  .sub-badge.accent{ background:rgba(47,168,160,0.10); color:#2FA8A0; border:1px solid rgba(47,168,160,0.3); }
  .sub-badge.primary{ background:rgba(0,76,72,0.08); color:#004C48; border:1px solid rgba(0,76,72,0.2); }
  .sub-badge.warn{ background:rgba(245,158,11,0.12); color:#B45309; border:1px solid rgba(245,158,11,0.3); }

  .sub-monthly{ text-align:right; width:76px; flex-shrink:0; }
  .sub-monthly-amount{ font-size:13.5px; font-weight:700; color:#004C48; margin:0; }
  .sub-monthly-label{ font-size:10px; color:#9AA7B4; margin:0; }

  .sub-hide-btn{ flex-shrink:0; width:32px; height:32px; border-radius:9px; border:1px solid #E5E7EB; background:#fff; color:#6B7280; display:flex; align-items:center; justify-content:center; cursor:pointer; transition:all .15s ease; }
  .sub-hide-btn:hover{ border-color:#FCA5A5; background:#FEF2F2; color:#EF4444; }

  /* Skeleton */
  .sub-skeleton-row{ pointer-events:none; }
  .sub-skel{ background:linear-gradient(90deg,#EEF2F6 25%,#F6F8FA 37%,#EEF2F6 63%); background-size:400% 100%; animation:sub-shimmer 1.4s ease infinite; border-radius:8px; }
  @keyframes sub-shimmer{ 0%{ background-position:100% 0; } 100%{ background-position:0 0; } }
  .sub-skel-avatar{ width:40px; height:40px; border-radius:50%; flex-shrink:0; }
  .sub-skel-lines{ flex:1; display:flex; flex-direction:column; gap:8px; }
  .sub-skel-line{ height:12px; border-radius:6px; }

  /* Empty state */
  .sub-empty{ display:flex; flex-direction:column; align-items:center; text-align:center; padding:56px 24px; background:#fff; border:1px dashed rgba(0,76,72,0.2); border-radius:18px; }
  .sub-empty-icon{ width:52px; height:52px; border-radius:50%; background:rgba(34,197,94,0.1); border:1px solid rgba(34,197,94,0.3); color:#15803D; display:flex; align-items:center; justify-content:center; margin-bottom:14px; }
  .sub-empty-title{ font-size:14.5px; font-weight:700; color:#16232F; margin:0; }
  .sub-empty-text{ font-size:12.5px; color:#6B7280; max-width:320px; margin:6px 0 0; }
  .sub-reset-btn{ display:inline-flex; align-items:center; gap:7px; margin-top:18px; background:#004C48; color:#fff; border:none; padding:10px 18px; border-radius:11px; font-size:13px; font-weight:600; cursor:pointer; box-shadow:0 8px 20px rgba(0,76,72,.24); transition:transform .15s ease; }
  .sub-reset-btn:hover{ transform:translateY(-1px); }

  .sub-show-hidden{ margin-top:18px; background:none; border:none; color:#6B7280; font-size:12px; display:inline-flex; align-items:center; gap:6px; cursor:pointer; transition:color .15s ease; }
  .sub-show-hidden:hover{ color:#004C48; }

  /* Hidden Subscriptions section */
  .sub-hidden-block{ margin-top:22px; padding-top:20px; border-top:1px dashed rgba(0,76,72,0.15); }
  .sub-hidden-title{ color:#6B7280; }
  .sub-row-hidden{ background:#F7F9FB; opacity:.85; }
  .sub-row-hidden .sub-merchant, .sub-row-hidden .sub-monthly-amount{ color:#6B7280; }
  .sub-restore-btn{ flex-shrink:0; display:inline-flex; align-items:center; gap:6px; border:1px solid rgba(47,168,160,0.35); background:#fff; color:#2FA8A0; font-size:12px; font-weight:700; padding:7px 12px; border-radius:9px; cursor:pointer; transition:all .15s ease; }
  .sub-restore-btn:hover{ background:#E8F7F5; border-color:#2FA8A0; }

  /* Toast */
  .sub-toast{ position:fixed; bottom:24px; left:50%; transform:translateX(-50%); display:flex; align-items:center; gap:12px; background:#004C48; color:#fff; padding:11px 18px; border-radius:12px; font-size:13px; font-weight:600; box-shadow:0 12px 30px rgba(0,0,0,.22); z-index:60; animation:sub-toast-in .25s ease; }
  .sub-toast button{ display:inline-flex; align-items:center; gap:5px; background:none; border:none; color:#5EEAD4; font-weight:700; font-size:13px; cursor:pointer; }
  @keyframes sub-toast-in{ from{ opacity:0; transform:translate(-50%,10px); } to{ opacity:1; transform:translate(-50%,0); } }

  @media (max-width:640px){
    .sub-hero{ flex-direction:column; align-items:flex-start; text-align:left; }
    .sub-row{ flex-wrap:wrap; }
    .sub-monthly{ width:auto; }
  }
`;
