import { useEffect, useMemo, useRef, useState } from "react";
import {
  Menu,
  Sparkles,
  ChevronDown,
  PiggyBank,
  Target,
  Activity,
  Repeat,
  TrendingUp,
  AlertTriangle,
} from "lucide-react";

import { BudgetSidebar, SHELL_STYLES } from "../BudgetSetupPage/BudgetSetupPage";
import TopNavigation from "../TopNavigation/TopNavigation";
import { cachedFetchJSON } from "../../services/apiCache";

/* =========================================================================
   SMFinTrack — Health Score Page
   Same sidebar/header shell as BudgetSetupPage / BudgetTrackingPage /
   SubscriptionsPage / ForecastPage (bsp-* classes, SHELL_STYLES imported
   directly so it stays pixel-identical). Uses the app's real design
   tokens, same ones already used across the other pages:
     Primary #004C48   Accent #2FA8A0   Success #22C55E
     Danger  #EF4444   Warning #F59E0B  Background #F7F9FB

   Score formula (from the project doc):
     Savings Rate 30%  ·  Budget Adherence 25%  ·  Spending Consistency 20%
     Subscription Load 15%  ·  Forecast Trend 10%
   ========================================================================= */

/* Point this at the real health-score endpoint when it's live.
   Same integration pattern as ForecastPage's FORECAST_API_URL:
   real fetch() first, mock data as a fallback while the backend
   endpoint doesn't exist yet or is unreachable. */
const HEALTH_SCORE_API_URL = "https://example.com/api/health-score";

const MOCK_HEALTH_SCORE = {
  month: "This Month",
  factors: [
    {
      id: "savings",
      name: "Savings Rate",
      weight: 30,
      score: 85,
      icon: "savings",
      summary: "You're saving about 18% of what comes in each month — comfortably ahead of target.",
      tips: [
        "Auto-transfer PKR 1,000 the day your allowance lands",
        "Move any surplus income to savings within 48 hours",
        "Review your savings rate at the start of each month",
      ],
    },
    {
      id: "budget",
      name: "Budget Adherence",
      weight: 25,
      score: 68,
      icon: "budget",
      summary: "Entertainment has gone over budget 3 of the last 4 months — that's the main drag here.",
      tips: [
        "Lower the Entertainment alert threshold to 70%",
        "Check the Food & Dining budget once a week",
        "Set a hard cap warning on Shopping",
      ],
    },
    {
      id: "consistency",
      name: "Spending Consistency",
      weight: 20,
      score: 88,
      icon: "consistency",
      summary: "Month-to-month spending is steady with no wild swings — quietly your strongest factor.",
      tips: [
        "Flag any big one-off purchase as \"planned\" before you make it",
        "Compare this month's trend line to last month",
        "Keep the same categories for recurring spends",
      ],
    },
    {
      id: "subscriptions",
      name: "Subscription Load",
      weight: 15,
      score: 62,
      icon: "subscriptions",
      summary: "3 active subscriptions detected — one fitness app hasn't been used in 2 months.",
      tips: [
        "Cancel or pause the unused fitness app subscription",
        "Bundle streaming services where possible",
        "Set a subscription review reminder every 3 months",
      ],
    },
    {
      id: "forecast",
      name: "Forecast Trend",
      weight: 10,
      score: 75,
      icon: "forecast",
      summary: "Next month's spending is forecast flat to slightly improving, except one category to watch.",
      tips: [
        "Keep next month's Food budget where it is",
        "Watch Transport — forecast shows a 12% rise",
        "Set an early warning at 80% for Transport",
      ],
    },
  ],
};

/* Expected API response shape:
   { month, factors: [{ id, name, weight, score, icon, summary, tips }] }
   overall score is derived client-side as the weighted sum, same as the
   Health Score Formula in the project doc. */
async function fetchHealthScore() {
  try {
    // T15 perf fix: short-lived cache so re-visiting this page within the
    // same session doesn't pay a fresh network round-trip every time.
    const data = await cachedFetchJSON(HEALTH_SCORE_API_URL);
    return data && Array.isArray(data.factors) ? data : MOCK_HEALTH_SCORE;
  } catch {
    // Backend not live yet / unreachable — fall back to sample data
    // so the page still renders during local development.
    return new Promise((resolve) => setTimeout(() => resolve(MOCK_HEALTH_SCORE), 1000));
  }
}

const ICONS = {
  savings: PiggyBank,
  budget: Target,
  consistency: Activity,
  subscriptions: Repeat,
  forecast: TrendingUp,
};
function iconFor(key) {
  return ICONS[key] || Activity;
}

function getBand(score) {
  if (score >= 70) return { key: "healthy", label: "Healthy", color: "#22C55E", soft: "rgba(34,197,94,.14)" };
  if (score >= 40) return { key: "warning", label: "Needs Attention", color: "#F59E0B", soft: "rgba(245,158,11,.16)" };
  return { key: "critical", label: "Critical", color: "#EF4444", soft: "rgba(239,68,68,.16)" };
}
function badgeMeta(score) {
  if (score >= 75) return { cls: "hs-badge great", label: "Great" };
  if (score >= 50) return { cls: "hs-badge average", label: "Average" };
  return { cls: "hs-badge poor", label: "Poor" };
}

function SkeletonGauge() {
  return (
    <div className="hs-skel-gauge">
      <div className="bsp-skel" style={{ width: "100%", height: "100%", borderRadius: "50%" }} />
    </div>
  );
}
function SkeletonCard() {
  return (
    <div className="hs-card">
      <div className="hs-card-head">
        <div className="bsp-skel hs-skel-icon" />
        <div style={{ flex: 1 }}>
          <div className="bsp-skel hs-skel-line" style={{ width: "50%" }} />
        </div>
      </div>
      <div className="bsp-skel" style={{ height: 6, borderRadius: 999, marginTop: 14 }} />
    </div>
  );
}

export default function HealthScorePage({ onNavigate }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [status, setStatus] = useState("loading"); // loading | ready | error
  const [data, setData] = useState(null);
  const [openId, setOpenId] = useState(null);
  const [checked, setChecked] = useState({});
  const [animated, setAnimated] = useState(false);
  const confettiLayerRef = useRef(null);

  useEffect(() => {
    let mounted = true;
    setStatus("loading");
    fetchHealthScore()
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

  const factors = useMemo(() => (data ? data.factors : []), [data]);

  const overallScore = useMemo(() => {
    if (!factors.length) return 0;
    return Math.round(factors.reduce((sum, f) => sum + (f.score * f.weight) / 100, 0));
  }, [factors]);

  const band = getBand(overallScore);

  const lowest = useMemo(() => {
    if (!factors.length) return null;
    return factors.reduce((a, b) => (a.score < b.score ? a : b));
  }, [factors]);

  const synopsis = useMemo(() => {
    if (overallScore >= 70) {
      return `Your financial health is strong this month — ${
        lowest ? lowest.name.toLowerCase() : "a couple of factors"
      } is the main thing standing between you and a top score.`;
    }
    if (overallScore >= 40) {
      return "Your finances are on track but wobbly — a few adjustments this month will move you into healthy territory.";
    }
    return "Your spending needs attention this month — start with the factor dragging your score down most.";
  }, [overallScore, lowest]);

  // Fire once when data becomes ready: triggers the arc / count-up / confetti.
  useEffect(() => {
    if (status !== "ready" || animated) return;
    const t = setTimeout(() => setAnimated(true), 60);
    return () => clearTimeout(t);
  }, [status, animated]);

  useEffect(() => {
    if (!animated || overallScore < 70) return;
    const layer = confettiLayerRef.current;
    if (!layer) return;
    const colors = ["#2FA8A0", "#22C55E", "#004C48", "#F59E0B"];
    const pieces = [];
    for (let i = 0; i < 40; i++) {
      const piece = document.createElement("div");
      piece.className = "hs-confetti-piece";
      piece.style.left = Math.random() * 100 + "%";
      piece.style.background = colors[i % colors.length];
      piece.style.borderRadius = Math.random() > 0.5 ? "50%" : "2px";
      const duration = 2.4 + Math.random() * 1.6;
      piece.style.animationDuration = duration + "s";
      piece.style.animationDelay = Math.random() * 0.4 + "s";
      layer.appendChild(piece);
      pieces.push(piece);
    }
    const cleanup = setTimeout(() => pieces.forEach((p) => p.remove()), 4200);
    return () => clearTimeout(cleanup);
  }, [animated, overallScore]);

  const circumference = 2 * Math.PI * 80;
  const dashOffset = animated ? circumference * (1 - overallScore / 100) : circumference;

  const toggleCard = (id) => setOpenId((cur) => (cur === id ? null : id));
  const toggleCheck = (key) => setChecked((c) => ({ ...c, [key]: !c[key] }));

  const scrollToLowest = () => {
    if (!lowest) return;
    setOpenId(lowest.id);
    const el = document.getElementById(`hs-card-${lowest.id}`);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  return (
    <div className="bsp-app">
      <style>{SHELL_STYLES + HS_STYLES}</style>
      <BudgetSidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        activeId="health-score"
        onNavigate={onNavigate}
      />

      <main className="bsp-main" style={{ position: "relative" }}>
        <TopNavigation title="Health Score" userInitials="NA" onSettingsClick={() => onNavigate && onNavigate("settings")} />

        <div className="hs-confetti-layer" ref={confettiLayerRef} />
        <header className="bsp-header">
          <div className="bsp-header-left">
            <button className="bsp-menu-btn" onClick={() => setSidebarOpen(true)} aria-label="Open menu">
              <Menu size={20} />
            </button>
            <div>
              <h1 className="bsp-header-title">Financial Health Score</h1>
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

        {/* Gauge hero */}
        <div className="bsp-panel hs-hero-panel">
          <div className={`hs-glow ${animated ? "show" : ""}`} style={{ background: `radial-gradient(closest-side, ${band.soft}, transparent 70%)` }} />

          {status === "error" ? (
            <div className="fc-chart-empty">Couldn't load your health score. Try again shortly.</div>
          ) : (
            <>
              <div className="hs-gauge-card">
                {status === "loading" ? (
                  <SkeletonGauge />
                ) : (
                  <div className="hs-gauge-wrap">
                    <svg viewBox="0 0 200 200">
                      <circle className="hs-gauge-track" cx="100" cy="100" r="80" />
                      <circle
                        className="hs-gauge-progress"
                        cx="100"
                        cy="100"
                        r="80"
                        style={{
                          stroke: band.color,
                          strokeDasharray: circumference,
                          strokeDashoffset: dashOffset,
                          filter: `drop-shadow(0 0 8px ${band.soft})`,
                        }}
                      />
                    </svg>
                    <div className="hs-gauge-center">
                      <span className="hs-score-num">{animated ? overallScore : 0}</span>
                      <span className={`hs-score-status ${animated ? "show" : ""}`} style={{ color: band.color }}>
                        {band.label}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {status === "ready" && <p className="hs-synopsis">{synopsis}</p>}
            </>
          )}
        </div>

        {/* Quick win */}
        {status === "ready" && lowest && (
          <div className="hs-quickwin" onClick={scrollToLowest} role="button" tabIndex={0}>
            <div className="hs-qw-icon">
              <Sparkles size={18} />
            </div>
            <div>
              <span className="hs-qw-label">Quick win</span>
              <p className="hs-qw-text">
                <strong>{lowest.name}</strong> is your biggest drag right now. {lowest.summary}
              </p>
            </div>
          </div>
        )}

        {/* Breakdown */}
        <div className="bsp-panel hs-breakdown-panel">
          <p className="fc-panel-title">Score Breakdown</p>
          <p className="fc-panel-sub">
            {data ? data.month : "This month"} · savings, budget, consistency, subscriptions &amp; forecast
          </p>

          <div className="hs-grid">
            {status === "loading" &&
              Array.from({ length: 5 }).map((_, i) => <SkeletonCard key={i} />)}

            {status === "ready" &&
              factors.map((f) => {
                const Icon = iconFor(f.icon);
                const b = badgeMeta(f.score);
                const fBand = getBand(f.score);
                const open = openId === f.id;
                return (
                  <article
                    key={f.id}
                    id={`hs-card-${f.id}`}
                    className={`hs-card ${open ? "open" : ""}`}
                  >
                    <div className="hs-card-head" onClick={() => toggleCard(f.id)}>
                      <div className="hs-card-icon">
                        <Icon size={17} />
                      </div>
                      <div className="hs-card-title-wrap">
                        <p className="hs-card-title">{f.name}</p>
                        <p className="hs-card-weight">{f.weight}% of overall score</p>
                      </div>
                      <span className="hs-card-score">{f.score}</span>
                      <ChevronDown size={16} className="hs-chevron" />
                    </div>

                    <span className={b.cls}>{b.label}</span>
                    <div className="hs-track">
                      <div
                        className="hs-track-fill"
                        style={{ width: animated ? `${f.score}%` : "0%", background: fBand.color }}
                      />
                    </div>

                    <div className="hs-card-body">
                      <div className="hs-card-body-inner">
                        <p className="hs-card-summary">{f.summary}</p>
                        <ul className="hs-milestones">
                          {f.tips.map((tip, idx) => {
                            const key = `${f.id}-${idx}`;
                            return (
                              <li key={key} className={checked[key] ? "done" : ""}>
                                <input
                                  type="checkbox"
                                  id={`hs-ms-${key}`}
                                  checked={!!checked[key]}
                                  onChange={() => toggleCheck(key)}
                                />
                                <label htmlFor={`hs-ms-${key}`}>{tip}</label>
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    </div>
                  </article>
                );
              })}
          </div>
        </div>

        {/* Disclaimer */}
        <div className="fc-disclaimer">
          <AlertTriangle size={15} />
          <p>
            <strong>Disclaimer:</strong> your health score is an estimate based on savings rate, budget
            adherence, spending consistency, subscription load and forecast trend — it isn't financial advice.
          </p>
        </div>
      </main>
    </div>
  );
}

const HS_STYLES = `
  /* Confetti (celebration when score is 70+) — kept off the sidebar,
     confined to the main content area (same 240px offset / breakpoint
     the sidebar itself uses in SHELL_STYLES). */
  .hs-confetti-layer{ position:fixed; top:0; right:0; bottom:0; left:240px; pointer-events:none; overflow:hidden; z-index:60; }
  .hs-confetti-piece{ position:absolute; top:-16px; width:7px; height:12px; opacity:1; animation-name:hs-fall; animation-timing-function:linear; animation-fill-mode:forwards; }
  @keyframes hs-fall{ 0%{ opacity:1; transform:translateY(0) rotate(0deg); } 100%{ opacity:0; transform:translateY(110vh) rotate(540deg); } }
  @media (max-width:992px){ .hs-confetti-layer{ left:0; } }

  /* Hero / gauge */
  .hs-hero-panel{ position:relative; display:flex; flex-direction:column; align-items:center; text-align:center; padding:40px 24px 34px; overflow:hidden; isolation:isolate; }
  .hs-glow{ position:absolute; inset:-25% -15% auto -15%; height:140%; filter:blur(14px); z-index:-1; opacity:0; transition:opacity 1.2s ease; animation:hs-breathe 5s ease-in-out infinite; }
  .hs-glow.show{ opacity:1; }
  @keyframes hs-breathe{ 0%,100%{ transform:scale(1); } 50%{ transform:scale(1.05); } }

  .hs-gauge-card{ background:rgba(255,255,255,.7); backdrop-filter:blur(18px) saturate(140%); -webkit-backdrop-filter:blur(18px) saturate(140%); border:1px solid rgba(255,255,255,.8); border-radius:50%; padding:14px; box-shadow:0 18px 40px -18px rgba(0,76,72,.28), inset 0 1px 0 rgba(255,255,255,.9); }
  .hs-gauge-wrap{ position:relative; width:208px; height:208px; }
  .hs-skel-gauge{ width:208px; height:208px; }
  .hs-gauge-wrap svg{ width:100%; height:100%; transform:rotate(-90deg); }
  .hs-gauge-track{ fill:none; stroke:rgba(0,76,72,.08); stroke-width:14; }
  .hs-gauge-progress{ fill:none; stroke-width:14; stroke-linecap:round; transition:stroke-dashoffset 1.8s cubic-bezier(.22,1,.36,1), stroke .5s ease; }
  .hs-gauge-center{ position:absolute; inset:0; display:flex; flex-direction:column; align-items:center; justify-content:center; }
  .hs-score-num{ font-family:'Manrope',sans-serif; font-weight:800; font-size:50px; line-height:1; color:#004C48; }
  .hs-score-status{ margin-top:6px; font-size:12px; font-weight:700; letter-spacing:.4px; text-transform:uppercase; opacity:0; transition:opacity .5s ease .3s; }
  .hs-score-status.show{ opacity:1; }
  .hs-synopsis{ max-width:480px; margin:24px 0 0; font-size:14.5px; line-height:1.6; color:#6B7280; }
  .hs-synopsis strong{ color:#004C48; font-weight:600; }

  /* Quick win */
  .hs-quickwin{ display:flex; gap:14px; align-items:flex-start; background:linear-gradient(135deg, rgba(47,168,160,.10), rgba(0,76,72,.05)); border:1px solid rgba(47,168,160,.28); border-radius:16px; padding:16px 18px; margin-bottom:24px; cursor:pointer; transition:transform .2s ease, box-shadow .2s ease; }
  .hs-quickwin:hover{ transform:translateY(-2px); box-shadow:0 12px 26px -14px rgba(0,76,72,.25); }
  .hs-qw-icon{ flex:none; width:36px; height:36px; border-radius:11px; background:#2FA8A0; color:#fff; display:flex; align-items:center; justify-content:center; }
  .hs-qw-label{ font-family:'Manrope',sans-serif; font-weight:700; font-size:12px; text-transform:uppercase; letter-spacing:.5px; color:#2FA8A0; display:block; margin-bottom:4px; }
  .hs-qw-text{ font-size:13.5px; line-height:1.55; color:#1F2937; margin:0; }
  .hs-qw-text strong{ color:#004C48; }

  /* Breakdown grid */
  .hs-breakdown-panel{ padding-top:22px; }
  .hs-grid{ display:grid; grid-template-columns:repeat(2, 1fr); gap:14px; margin-top:16px; }
  @media (max-width:760px){ .hs-grid{ grid-template-columns:1fr; } }

  .hs-card{ background:#fff; border:1px solid #E5E7EB; border-radius:16px; padding:16px 16px 14px; transition:border-color .2s ease, box-shadow .2s ease; }
  .hs-card.open{ border-color:#BCEEE8; box-shadow:0 10px 24px -18px rgba(0,76,72,.3); }
  .hs-card-head{ display:flex; align-items:center; gap:11px; cursor:pointer; }
  .hs-card-icon{ flex:none; width:34px; height:34px; border-radius:10px; background:#F0FAF9; color:#004C48; display:flex; align-items:center; justify-content:center; }
  .hs-card-title-wrap{ flex:1; min-width:0; }
  .hs-card-title{ font-family:'Manrope',sans-serif; font-weight:700; font-size:13.5px; color:#1F2937; margin:0; }
  .hs-card-weight{ font-size:11px; color:#94A3B8; margin:1px 0 0; }
  .hs-card-score{ font-family:'Manrope',sans-serif; font-weight:800; font-size:18px; color:#004C48; margin-right:2px; }
  .hs-chevron{ color:#94A3B8; transition:transform .3s ease; flex-shrink:0; }
  .hs-card.open .hs-chevron{ transform:rotate(180deg); }

  .hs-badge{ display:inline-block; font-size:10px; font-weight:700; letter-spacing:.3px; text-transform:uppercase; padding:3px 9px; border-radius:999px; margin-top:10px; }
  .hs-badge.great{ background:rgba(34,197,94,.13); color:#178a4c; }
  .hs-badge.average{ background:rgba(245,158,11,.15); color:#a15c05; }
  .hs-badge.poor{ background:rgba(239,68,68,.13); color:#c62b2b; }

  .hs-track{ height:6px; border-radius:999px; background:#EEF2F6; margin-top:11px; overflow:hidden; }
  .hs-track-fill{ height:100%; border-radius:999px; width:0%; transition:width 1.3s cubic-bezier(.22,1,.36,1); }

  .hs-card-body{ max-height:0; overflow:hidden; transition:max-height .45s ease; }
  .hs-card.open .hs-card-body{ max-height:260px; }
  .hs-card-body-inner{ padding-top:13px; }
  .hs-card-summary{ font-size:12.5px; line-height:1.55; color:#6B7280; margin:2px 0 12px; }

  .hs-milestones{ list-style:none; margin:0; padding:0; display:flex; flex-direction:column; gap:8px; }
  .hs-milestones li{ display:flex; align-items:flex-start; gap:9px; font-size:12.5px; color:#1F2937; line-height:1.4; }
  .hs-milestones input{ accent-color:#2FA8A0; margin-top:2px; flex:none; cursor:pointer; }
  .hs-milestones label{ cursor:pointer; }
  .hs-milestones li.done{ color:#94A3B8; text-decoration:line-through; }

  .hs-skel-icon{ width:34px; height:34px; border-radius:10px; flex-shrink:0; }
  .hs-skel-line{ height:13px; }

  @media (max-width:600px){
    .hs-score-num{ font-size:42px; }
    .hs-gauge-wrap, .hs-skel-gauge{ width:180px; height:180px; }
  }

  /* Disclaimer — same styling as ForecastPage's .fc-disclaimer, repeated
     here because this page doesn't import FC_STYLES. */
  .fc-disclaimer{ display:flex; align-items:flex-start; gap:10px; margin-top:18px; padding:14px 16px; background:#FEF3E2; border:1px solid rgba(245,158,11,0.30); border-radius:14px; }
  .fc-disclaimer svg{ color:#B45309; flex-shrink:0; margin-top:2px; }
  .fc-disclaimer p{ font-size:12.5px; color:#92400E; line-height:1.55; margin:0; }
  .fc-disclaimer strong{ font-weight:700; }
`;
