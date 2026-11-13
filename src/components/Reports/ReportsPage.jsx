import { useEffect, useMemo, useRef, useState } from "react";
import {
  Menu,
  TrendingUp,
  TrendingDown,
  FileText,
  FileSpreadsheet,
  Loader2,
  PiggyBank,
  Utensils,
  Car,
  Zap,
  Clapperboard,
  ShoppingBag,
  LayoutGrid,
} from "lucide-react";

import { BudgetSidebar, SHELL_STYLES, STYLES as BSP_STYLES } from "../BudgetSetupPage/BudgetSetupPage";
import TopNavigation from "../TopNavigation/TopNavigation";
import { cachedFetchJSON } from "../../services/apiCache";

/* =========================================================================
   SMFinTrack — Reports Page
   Same sidebar/header shell as the rest of the app (bsp-* classes,
   SHELL_STYLES imported directly). Reuses the conic-gradient donut
   pattern already shipped in BudgetSetupPage instead of pulling in a
   charting library. Tokens: Primary #004C48  Accent #2FA8A0
   Success #22C55E  Danger #EF4444  Warning #F59E0B  Background #F7F9FB
   ========================================================================= */

/* Point this at the real reports endpoint when it's live. */
const REPORT_API_URL = "https://example.com/api/reports/summary";
const EXPORT_API_URL = "https://example.com/api/reports/export";

const MOCK_REPORT = {
  month: "July 2026",
  income: 32000,
  expenses: 21460,
  incomeChange: 4.9,
  expenseChange: -2.6,
  categories: [
    { id: "food", name: "Food & Dining", icon: "food", amount: 8400, color: "#004C48" },
    { id: "bills", name: "Bills & Utilities", icon: "bills", amount: 5100, color: "#2FA8A0" },
    { id: "transport", name: "Transport", icon: "transport", amount: 3200, color: "#F59E0B" },
    { id: "entertainment", name: "Entertainment", icon: "entertainment", amount: 2760, color: "#6D3FBF" },
    { id: "other", name: "Other", icon: "other", amount: 2000, color: "#94A3B8" },
  ],
};

const ICONS = {
  food: Utensils,
  transport: Car,
  bills: Zap,
  entertainment: Clapperboard,
  shopping: ShoppingBag,
  other: LayoutGrid,
};

function iconFor(key) {
  return ICONS[key] || LayoutGrid;
}

const pkr = (n) => "PKR " + Math.round(n).toLocaleString();

async function fetchReport() {
  try {
    // T15 perf fix: short-lived cache so re-visiting this page within the
    // same session doesn't pay a fresh network round-trip every time.
    const data = await cachedFetchJSON(REPORT_API_URL);
    return data && Array.isArray(data.categories) ? data : MOCK_REPORT;
  } catch {
    // Backend not live yet / unreachable — fall back to sample data.
    return new Promise((resolve) => setTimeout(() => resolve(MOCK_REPORT), 900));
  }
}

/* Real call: fetch(`${EXPORT_API_URL}?format=csv|pdf`) -> res.blob() */
async function requestExport(format) {
  try {
    const res = await fetch(`${EXPORT_API_URL}?format=${format}`);
    if (!res.ok) throw new Error("Bad response");
    return await res.blob();
  } catch {
    return new Promise((resolve) => {
      setTimeout(() => {
        const content =
          format === "csv"
            ? "category,amount\n" + MOCK_REPORT.categories.map((c) => `${c.name},${c.amount}`).join("\n")
            : "%PDF-1.4 mock report content";
        resolve(new Blob([content], { type: format === "csv" ? "text/csv" : "application/pdf" }));
      }, 1000);
    });
  }
}

export default function ReportsPage({ onNavigate }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeCat, setActiveCat] = useState(0);
  const [exporting, setExporting] = useState(null);
  const [toast, setToast] = useState(null);
  const toastTimer = useRef(null);

  useEffect(() => {
    let alive = true;
    fetchReport().then((data) => {
      if (!alive) return;
      setReport(data);
      setLoading(false);
    });
    return () => {
      alive = false;
    };
  }, []);

  const showToast = (msg) => {
    setToast(msg);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2200);
  };

  const total = useMemo(
    () => (report ? report.categories.reduce((s, c) => s + c.amount, 0) : 0),
    [report]
  );

  const savingsRate = report && report.income
    ? Math.round(((report.income - report.expenses) / report.income) * 100)
    : 0;

  const donutGradient = useMemo(() => {
    if (!report || !total) return "conic-gradient(#EEF2F6 0% 100%)";
    let cursor = 0;
    const stops = report.categories.map((c) => {
      const start = cursor;
      const pct = (c.amount / total) * 100;
      cursor += pct;
      return `${c.color} ${start}% ${cursor}%`;
    });
    return `conic-gradient(${stops.join(", ")})`;
  }, [report, total]);

  const handleExport = async (format) => {
    setExporting(format);
    try {
      const blob = await requestExport(format);
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `smfintrack-report-${(report?.month || "report").replace(" ", "-").toLowerCase()}.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      showToast(`${format.toUpperCase()} report downloaded`);
    } catch {
      showToast("Couldn't export report. Try again.");
    } finally {
      setExporting(null);
    }
  };

  return (
    <div className="bsp-app">
      <style>{SHELL_STYLES + BSP_STYLES + RP_STYLES}</style>

      <BudgetSidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        activeId="reports"
        onNavigate={onNavigate}
      />

      <main className="bsp-main">
        <TopNavigation title="Reports" userInitials="NA" onSettingsClick={() => onNavigate && onNavigate("settings")} />

        <header className="bsp-header">
          <div className="bsp-header-left">
            <button className="bsp-menu-btn" onClick={() => setSidebarOpen(true)} aria-label="Open menu">
              <Menu size={20} />
            </button>
            <div>
              <p className="bsp-header-eyebrow">{report?.month || "This month"}</p>
              <h1 className="bsp-header-title">Monthly Report</h1>
            </div>
          </div>
        </header>

        {loading ? (
          <div className="rp-grid-3">
            <div className="rp-skel" />
            <div className="rp-skel" />
            <div className="rp-skel" />
          </div>
        ) : (
          <>
            {/* Summary cards */}
            <div className="rp-grid-3">
              <div className="bsp-panel rp-kpi-card">
                <div className="rp-kpi-top">
                  <span className="rp-kpi-label">Income</span>
                  <span className="rp-kpi-pill green">
                    <TrendingUp size={12} /> {report.incomeChange}%
                  </span>
                </div>
                <p className="rp-kpi-amount">{pkr(report.income)}</p>
              </div>

              <div className="bsp-panel rp-kpi-card">
                <div className="rp-kpi-top">
                  <span className="rp-kpi-label">Expenses</span>
                  <span className="rp-kpi-pill red">
                    <TrendingDown size={12} /> {Math.abs(report.expenseChange)}%
                  </span>
                </div>
                <p className="rp-kpi-amount">{pkr(report.expenses)}</p>
              </div>

              <div className="bsp-panel rp-kpi-card">
                <div className="rp-kpi-top">
                  <span className="rp-kpi-label">Savings rate</span>
                </div>
                <div className="rp-ring-row">
                  <svg width="56" height="56" viewBox="0 0 56 56">
                    <circle cx="28" cy="28" r="22" fill="none" stroke="#EEF2F6" strokeWidth="6" />
                    <circle
                      cx="28" cy="28" r="22" fill="none" stroke="#2FA8A0" strokeWidth="6"
                      strokeDasharray={2 * Math.PI * 22}
                      strokeDashoffset={2 * Math.PI * 22 * (1 - Math.max(0, Math.min(100, savingsRate)) / 100)}
                      strokeLinecap="round"
                      transform="rotate(-90 28 28)"
                    />
                  </svg>
                  <p className="rp-kpi-amount rp-kpi-amount-sm">{savingsRate}%</p>
                </div>
              </div>
            </div>

            {/* Top categories donut */}
            <div className="bsp-panel">
              <h2 className="rp-section-title"><PiggyBank size={16} color="#2FA8A0" /> Top categories</h2>
              <div className="bsp-donut-panel">
                <div className="bsp-donut-visual" style={{ background: donutGradient }}>
                  <div className="bsp-donut-hole">
                    <span className="bsp-donut-score">
                      {total ? Math.round((report.categories[activeCat].amount / total) * 100) : 0}%
                    </span>
                    <span className="bsp-donut-score-label">{report.categories[activeCat].name}</span>
                  </div>
                </div>
                <div className="bsp-donut-breakdown">
                  {report.categories.map((c, i) => {
                    const Icon = iconFor(c.icon);
                    return (
                      <div
                        key={c.id}
                        className={`rp-cat-row ${i === activeCat ? "active" : ""}`}
                        onMouseEnter={() => setActiveCat(i)}
                      >
                        <span className="rp-cat-dot" style={{ background: c.color }} />
                        <Icon size={14} color="#6B7280" />
                        <span className="rp-cat-name">{c.name}</span>
                        <span className="rp-cat-amount">{pkr(c.amount)}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Export */}
            <div className="bsp-panel rp-export-row">
              <div>
                <h2 className="rp-section-title" style={{ marginBottom: 2 }}>Export report</h2>
                <p className="rp-export-sub">Download your {report.month} summary.</p>
              </div>
              <div className="rp-export-actions">
                <button
                  className="rp-export-btn"
                  onClick={() => handleExport("pdf")}
                  disabled={exporting !== null}
                >
                  {exporting === "pdf" ? <Loader2 size={15} className="rp-spin" /> : <FileText size={15} />}
                  {exporting === "pdf" ? "Downloading…" : "PDF"}
                </button>
                <button
                  className="rp-export-btn"
                  onClick={() => handleExport("csv")}
                  disabled={exporting !== null}
                >
                  {exporting === "csv" ? <Loader2 size={15} className="rp-spin" /> : <FileSpreadsheet size={15} />}
                  {exporting === "csv" ? "Downloading…" : "CSV"}
                </button>
              </div>
            </div>
          </>
        )}

        <div className={`bt-toast${toast ? " show" : ""}`}>{toast}</div>
      </main>
    </div>
  );
}

const RP_STYLES = `
  .rp-grid-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 24px; }
  @media (max-width: 720px) { .rp-grid-3 { grid-template-columns: 1fr; } }

  .rp-skel { height: 110px; border-radius: 18px; background: linear-gradient(90deg,#E9EEF3 25%,#F4F7FA 37%,#E9EEF3 63%); background-size: 400% 100%; animation: rp-shimmer 1.4s ease infinite; }
  @keyframes rp-shimmer { 0% { background-position: 100% 0; } 100% { background-position: 0 0; } }

  .rp-kpi-card { margin-bottom: 0; padding: 18px 20px; cursor: default; border: none; transition: transform .2s ease, box-shadow .2s ease; }
  .rp-kpi-card:hover { transform: translateY(-3px); box-shadow: 0 14px 30px rgba(0,76,72,.14); }
  .rp-kpi-top { display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px; }
  .rp-kpi-label { font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: .06em; color: #6B7280; }
  .rp-kpi-pill { display: inline-flex; align-items: center; gap: 4px; font-size: 11px; font-weight: 700; padding: 3px 8px; border-radius: 999px; }
  .rp-kpi-pill.green { background: #EAFBF0; color: #15803D; }
  .rp-kpi-pill.red { background: #FDECEC; color: #B91C1C; }
  .rp-kpi-amount { font-family: 'Manrope', sans-serif; font-size: 26px; font-weight: 800; color: #004C48; margin: 0; letter-spacing: -0.02em; }
  .rp-ring-row { display: flex; align-items: center; gap: 12px; }
  .rp-kpi-amount-sm { font-size: 22px; }

  .rp-section-title { display: flex; align-items: center; gap: 8px; font-family: 'Manrope', sans-serif; font-size: 15px; font-weight: 700; color: #004C48; margin: 0 0 16px; }

  .rp-cat-row { display: grid; grid-template-columns: 10px 20px 1fr auto; align-items: center; gap: 10px; padding: 6px 8px; border-radius: 10px; cursor: default; transition: background .15s ease; }
  .rp-cat-row.active, .rp-cat-row:hover { background: #F7F9FB; }
  .rp-cat-dot { width: 10px; height: 10px; border-radius: 50%; }
  .rp-cat-name { font-size: 13.5px; font-weight: 600; color: #004C48; }
  .rp-cat-amount { font-size: 13px; font-weight: 700; color: #004C48; }

  .rp-export-row { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 14px; }
  .rp-export-sub { font-size: 12.5px; color: #6B7280; margin: 0; }
  .rp-export-actions { display: flex; gap: 10px; }
  .rp-export-btn { display: flex; align-items: center; gap: 7px; border: 1px solid #E5E7EB; background: #fff; color: #004C48; font-size: 13px; font-weight: 600; padding: 10px 16px; border-radius: 10px; cursor: pointer; transition: all .15s ease; }
  .rp-export-btn:hover:not(:disabled) { background: #F7F9FB; border-color: #2FA8A0; }
  .rp-export-btn:disabled { opacity: .65; cursor: not-allowed; }
  .rp-spin { animation: rp-rotate .8s linear infinite; }
  @keyframes rp-rotate { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

  .bt-toast{ position:fixed; bottom:24px; left:50%; transform:translateX(-50%) translateY(20px); background:#004C48; color:#fff; padding:11px 20px; border-radius:11px; font-size:13px; font-weight:600; opacity:0; transition:all .3s ease; pointer-events:none; box-shadow:0 10px 30px rgba(0,0,0,0.2); z-index:60; }
  .bt-toast.show{ opacity:1; transform:translateX(-50%) translateY(0); }
`;
