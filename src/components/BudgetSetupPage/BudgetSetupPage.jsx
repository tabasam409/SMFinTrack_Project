import React, { useState, useMemo, useRef, useEffect, useCallback } from "react";
import {
  Layers3,
  Menu,
  CreditCard,
  Settings,
  TrendingUp,
  Utensils,
  Zap,
  Car,
  BookOpen,
  HeartPulse,
  Clapperboard,
  ShoppingBag,
  Repeat,
  LayoutGrid,
  PiggyBank,
  MoreVertical,
  Receipt,
  Activity,
  BarChart3,
  Wallet,
  ShieldCheck,
  PieChart,
  UserRound,
  LogOut,
} from "lucide-react";

import TopNavigation from "../TopNavigation/TopNavigation";

import promoImage from "../../assets/signuppagepic.png";

/* =========================================================================
   SMFinTrack — Budget Setup Page
   Navigation + colors copied 1:1 from AdminSidebar.jsx / AdminSidebar.css
   and AdminPageHeader.jsx (the real navigation shipped in
   smfintrack-admin-dashboard_Task 10):

     Sidebar    fixed dark teal #004C48, gradient logo box (#2CC0BA -> #004C48),
                active item = solid mint pill #BCEEE8 (text/icon #004C48),
                hover = translateX(3px) + rgba(255,255,255,.08),
                mobile drawer: transform off-canvas + backdrop + hamburger

     Header     eyebrow (uppercase, 12px, #6B7280) + title (Manrope 28px 800,
                #004C48), border-bottom #E5E7EB — matches AdminPageHeader

     Tokens     Primary #004C48   Accent #2FA8A0   Success #22C55E
                Danger  #EF4444   Warning #F59E0B  Background #F7F9FB
                Surface #FFFFFF   Text #1F2937     Text-light #6B7280
                Border  #E5E7EB   Radius 18px       Shadow 0 4px 10px rgba(15,23,42,.05)
   ========================================================================= */

const CATEGORY_DEFS = [
  { id: "food", name: "Food & Dining", type: "needs", icon: Utensils, weight: 0.32, mockSpent: 410 },
  { id: "bills", name: "Bills & Utilities", type: "needs", icon: Zap, weight: 0.26, mockSpent: 265 },
  { id: "transport", name: "Transport", type: "needs", icon: Car, weight: 0.18, mockSpent: 140 },
  { id: "education", name: "Education", type: "needs", icon: BookOpen, weight: 0.14, mockSpent: 60 },
  { id: "health", name: "Health", type: "needs", icon: HeartPulse, weight: 0.10, mockSpent: 35 },
  { id: "entertainment", name: "Entertainment", type: "wants", icon: Clapperboard, weight: 0.32, mockSpent: 190 },
  { id: "shopping", name: "Shopping", type: "wants", icon: ShoppingBag, weight: 0.36, mockSpent: 310 },
  { id: "subscriptions", name: "Subscriptions", type: "wants", icon: Repeat, weight: 0.16, mockSpent: 48 },
  { id: "misc", name: "Miscellaneous", type: "wants", icon: LayoutGrid, weight: 0.16, mockSpent: 75 },
  { id: "savings", name: "Savings", type: "savings", icon: PiggyBank, weight: 1.0, mockSpent: 220 },
];

// Needs/Wants/Savings mapped onto the app's real Accent/Warning/Success tokens.
const TYPE_META = {
  needs: { label: "Needs", color: "#004C48", bg: "#E7ECF2", share: 0.5 },
  wants: { label: "Wants", color: "#F59E0B", bg: "#FEF3E2", share: 0.3 },
  savings: { label: "Savings", color: "#2FA8A0", bg: "#E8F7F5", share: 0.2 },
};

export const SIDEBAR_NAV = [
  { id: "dashboard", label: "Dashboard", icon: LayoutGrid },
  { id: "budgets", label: "Budgets", icon: CreditCard },
  { id: "transactions", label: "Transactions", icon: Wallet },
  { id: "budget-tracking", label: "Budget Tracking", icon: Receipt },
  { id: "subscriptions", label: "Subscriptions", icon: Repeat },
  { id: "forecast", label: "Forecast", icon: TrendingUp },
  { id: "health-score", label: "Health Score", icon: Activity },
  { id: "reports", label: "Reports", icon: BarChart3 },
  { id: "category-breakdown", label: "Category Breakdown", icon: PieChart },
  { id: "profile", label: "Profile", icon: UserRound },
  { id: "settings", label: "Settings", icon: Settings },
];

const CURRENCIES = {
  PKR: { symbol: "Rs.", spaced: true },
  USD: { symbol: "$", spaced: false },
  EUR: { symbol: "€", spaced: false },
};

const DEFAULT_INCOME = "";

const fmt = (n, currency) => {
  const c = CURRENCIES[currency];
  const num = Math.round(n || 0).toLocaleString("en-US", { maximumFractionDigits: 0 });
  return c.spaced ? `${c.symbol} ${num}` : `${c.symbol}${num}`;
};

const mockFetchBudgets = (shouldFail) =>
  new Promise((resolve, reject) => {
    setTimeout(() => {
      if (shouldFail) reject(new Error("Could not reach the budget service."));
      else resolve({ income: DEFAULT_INCOME, budgets: {} });
    }, 1100);
  });

const mockSaveCategory = (id, value, shouldFail) =>
  new Promise((resolve, reject) => {
    setTimeout(() => {
      if (shouldFail) reject(new Error("Save failed."));
      else resolve({ id, value });
    }, 550);
  });

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(error) {
    console.error("BudgetSetupPage crashed:", error);
  }
  handleRetry = () => this.setState({ hasError: false });
  render() {
    if (this.state.hasError) {
      return (
        <div className="bsp-app">
          <style>{SHELL_STYLES + STYLES}</style>
          <main className="bsp-main">
            <div className="bsp-error-card">
              <p className="bsp-error-title">Something went wrong.</p>
              <p className="bsp-error-body">
                This page hit an unexpected error. Your saved budgets are safe — try reloading this section.
              </p>
              <button className="bsp-retry-btn" onClick={this.handleRetry}>
                Retry
              </button>
            </div>
          </main>
        </div>
      );
    }
    return this.props.children;
  }
}

/* -------------------------------------------------------------------------
   Sidebar — structure + classes copied from AdminSidebar.jsx
   ------------------------------------------------------------------------- */
export function BudgetSidebar({ open, onClose, activeId = "budgets", onNavigate }) {
  // T15 fix: on mobile, the hamburger menu opens as an overlay on top of
  // the page, but the page underneath was never actually locked from
  // scrolling — so a scroll/swipe gesture that started on or near the
  // sidebar could still scroll the *page behind it*, which is what this
  // looked like: the menu appeared to not scroll properly, because it was
  // really the background content moving instead. Fix: lock body scroll
  // while the sidebar is open. Uses position:fixed on the body (not just
  // overflow:hidden) because iOS Safari specifically ignores
  // overflow:hidden on body for touch-scroll — position:fixed is the
  // reliable cross-browser way to actually stop background scroll,
  // restoring the exact scroll position on close.
  useEffect(() => {
    if (!open) return;
    const scrollY = window.scrollY;
    const { style } = document.body;
    const prev = { position: style.position, top: style.top, width: style.width, overflow: style.overflow };
    style.position = "fixed";
    style.top = `-${scrollY}px`;
    style.width = "100%";
    style.overflow = "hidden";
    return () => {
      style.position = prev.position;
      style.top = prev.top;
      style.width = prev.width;
      style.overflow = prev.overflow;
      window.scrollTo(0, scrollY);
    };
  }, [open]);

  return (
    <>
      <div className={`bsp-sidebar-backdrop ${open ? "show" : ""}`} onClick={onClose} />

      <aside className={`bsp-sidebar ${open ? "open" : ""}`}>
        <div className="bsp-sidebar-logo">
          <div className="bsp-logo-box">
            <Layers3 size={22} strokeWidth={2.3} />
          </div>
          <h2>SMFinTrack</h2>
        </div>

        <div className="bsp-sidebar-section">
          <p className="bsp-sidebar-heading">Menu</p>
          <ul>
            {SIDEBAR_NAV.map((item) => {
              const NavIcon = item.icon;
              return (
                <li key={item.id} className={item.id === activeId ? "active" : ""}>
                  <button
                    type="button"
                    onClick={() => {
                      onClose && onClose();
                      if (onNavigate) {
                        onNavigate(item.id);
                      }
                    }}
                  >
                    <NavIcon size={18} />
                    <span>{item.label}</span>
                  </button>
                </li>
              );
            })}

            {/* TEMPORARY: only shown when this session logged in with the
                admin checkbox (see LoginPage). Real deployments will just
                have separate accounts, not a same-account toggle. */}
            {localStorage.getItem("smfintrackRole") === "admin" && (
              <li>
                <button
                  type="button"
                  onClick={() => {
                    onClose && onClose();
                    if (onNavigate) {
                      onNavigate("admin-panel");
                    }
                  }}
                >
                  <ShieldCheck size={18} />
                  <span>Admin Panel</span>
                </button>
              </li>
            )}
          </ul>
        </div>

        {/* Promo card — image matches Awais's Sidebar.jsx promo card
            (src/assets/signuppagepic.png), placed above the logout button. */}
        <div className="bsp-sidebar-promo">
          <div className="bsp-sidebar-promo-image-wrapper">
            <img
              src={promoImage}
              alt="SMFinTrack financial overview"
              className="bsp-sidebar-promo-image"
            />
          </div>
          <div className="bsp-sidebar-promo-content">
            <h3>Track. Plan. Grow.</h3>
            <p>Take control of your finances and build a better tomorrow.</p>
          </div>
        </div>

        {/* Logout — same as Awais's Sidebar.jsx (logout button below the
            nav items), styled red like AdminSidebar's logout button.
            Goes through the existing onNavigate("logout") handler in
            FinanceApp, which clears the session and returns to /login. */}
        <button
          type="button"
          className="bsp-sidebar-logout"
          onClick={() => {
            onClose && onClose();
            if (onNavigate) {
              onNavigate("logout");
            }
          }}
        >
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </aside>
    </>
  );
}

function BudgetSetupPageInner({ onNavigate }) {
  const [currency, setCurrency] = useState("PKR");
  const [simulateFailures, setSimulateFailures] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [pageStatus, setPageStatus] = useState("loading");
  const [targetIncome, setTargetIncome] = useState(DEFAULT_INCOME);
  const [categories, setCategories] = useState(CATEGORY_DEFS);
  const [budgets, setBudgets] = useState(() => Object.fromEntries(CATEGORY_DEFS.map((c) => [c.id, ""])));
  const [committed, setCommitted] = useState(() => Object.fromEntries(CATEGORY_DEFS.map((c) => [c.id, ""])));
  const [rowStatus, setRowStatus] = useState({});
  const [saveAllState, setSaveAllState] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState("");
  const [editType, setEditType] = useState("needs");
  const [removingIds, setRemovingIds] = useState(() => new Set());
  const [addName, setAddName] = useState("");
  const [addType, setAddType] = useState("needs");
  const [menuOpenId, setMenuOpenId] = useState(null);
  const [toast, setToast] = useState("");
  const [pendingScrollId, setPendingScrollId] = useState(null);
  const debounceTimers = useRef({});
  const statusTimers = useRef({});
  const saveAllTimer = useRef(null);
  const toastTimer = useRef(null);

  const loadBudgets = useCallback(() => {
    setPageStatus("loading");
    mockFetchBudgets(simulateFailures)
      .then((data) => {
        setTargetIncome(data.income);
        const merged = Object.fromEntries(CATEGORY_DEFS.map((c) => [c.id, data.budgets[c.id] || ""]));
        setBudgets(merged);
        setCommitted(merged);
        setPageStatus("ready");
      })
      .catch(() => setPageStatus("error"));
  }, [simulateFailures]);

  useEffect(() => {
    loadBudgets();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!menuOpenId) return;
    const close = (e) => {
      if (!e.target.closest(".bsp-dots-wrap")) setMenuOpenId(null);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [menuOpenId]);

  const saveCategory = useCallback(
    (id, value) => {
      const previous = committed[id];
      setRowStatus((prev) => ({ ...prev, [id]: "saving" }));

      mockSaveCategory(id, value, simulateFailures)
        .then(() => {
          setCommitted((prev) => ({ ...prev, [id]: value }));
          setRowStatus((prev) => ({ ...prev, [id]: "saved" }));
          clearTimeout(statusTimers.current[id]);
          statusTimers.current[id] = setTimeout(() => {
            setRowStatus((prev) => {
              const next = { ...prev };
              delete next[id];
              return next;
            });
          }, 2000);
          return true;
        })
        .catch(() => {
          setBudgets((prev) => ({ ...prev, [id]: previous }));
          setRowStatus((prev) => ({ ...prev, [id]: "error" }));
          return false;
        });
    },
    [committed, simulateFailures]
  );

  const handleBudgetChange = (id, raw) => {
    const cleaned = raw === "" ? "" : raw.replace(/[^0-9.]/g, "");
    setBudgets((prev) => ({ ...prev, [id]: cleaned }));
    clearTimeout(debounceTimers.current[id]);
    debounceTimers.current[id] = setTimeout(() => saveCategory(id, cleaned), 700);
  };

  const handleManualSave = (id) => {
    clearTimeout(debounceTimers.current[id]);
    saveCategory(id, budgets[id]);
  };

  const handleSaveAll = () => {
    const toSave = categories.filter((c) => budgets[c.id] !== committed[c.id]);
    if (toSave.length === 0) {
      setSaveAllState("done");
      clearTimeout(saveAllTimer.current);
      saveAllTimer.current = setTimeout(() => setSaveAllState(null), 2000);
      return;
    }
    setSaveAllState("saving");
    Promise.all(
      toSave.map((c) => {
        clearTimeout(debounceTimers.current[c.id]);
        return saveCategory(c.id, budgets[c.id]);
      })
    ).then((results) => {
      clearTimeout(saveAllTimer.current);
      setSaveAllState(results.every(Boolean) ? "done" : "error");
      saveAllTimer.current = setTimeout(() => setSaveAllState(null), 2000);
    });
  };

  const handleReset = () => {
    Object.values(debounceTimers.current).forEach(clearTimeout);
    Object.values(statusTimers.current).forEach(clearTimeout);
    clearTimeout(saveAllTimer.current);
    setCategories(CATEGORY_DEFS);
    const empty = Object.fromEntries(CATEGORY_DEFS.map((c) => [c.id, ""]));
    setBudgets(empty);
    setCommitted(empty);
    setRowStatus({});
    setSaveAllState(null);
    setEditingId(null);
    setRemovingIds(new Set());
    setMenuOpenId(null);
    setTargetIncome(DEFAULT_INCOME);
  };

  const startEdit = (cat) => {
    setEditingId(cat.id);
    setEditName(cat.name);
    setEditType(cat.type);
    setMenuOpenId(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  const saveEdit = (id) => {
    const name = editName.trim() || "Untitled";
    setCategories((prev) => prev.map((c) => (c.id === id ? { ...c, name, type: editType } : c)));
    setEditingId(null);
  };

  const deleteCategory = (id) => {
    const cat = categories.find((c) => c.id === id);
    const ok = window.confirm(`Are you sure you want to delete "${cat ? cat.name : "this category"}"?`);
    if (!ok) return;
    if (removingIds.has(id)) return;
    setRemovingIds((prev) => new Set(prev).add(id));
    setTimeout(() => {
      setCategories((prev) => prev.filter((c) => c.id !== id));
      setBudgets((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
      setCommitted((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
      setRowStatus((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
      clearTimeout(debounceTimers.current[id]);
      clearTimeout(statusTimers.current[id]);
      setRemovingIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
      if (editingId === id) setEditingId(null);
    }, 320);
  };

  const addCategory = () => {
    const name = addName.trim();
    if (!name) return;
    const id = `custom-${Date.now()}`;
    const newCat = { id, name, type: addType, icon: LayoutGrid, weight: 0, mockSpent: 0 };
    setCategories((prev) => [...prev, newCat]);
    setBudgets((prev) => ({ ...prev, [id]: "" }));
    setCommitted((prev) => ({ ...prev, [id]: "" }));
    setAddName("");

    // T15 fix: adding a category always worked, but it silently appended
    // to the *bottom* of the list with no confirmation at all — on a page
    // with 10+ existing categories that reads as "nothing happened" even
    // though it did. Confirm it with a toast and scroll the new row into
    // view so it's unmistakable.
    setToast(`"${name}" added`);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(""), 2500);
    setPendingScrollId(id);
  };

  useEffect(() => {
    if (!pendingScrollId) return;
    const el = document.getElementById(`cat-row-${pendingScrollId}`);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
    setPendingScrollId(null);
  }, [pendingScrollId]);

  const applyTemplate = () => {
    const income = Number(targetIncome) || 0;
    const next = {};
    ["needs", "wants", "savings"].forEach((type) => {
      const pool = income * TYPE_META[type].share;
      categories.filter((c) => c.type === type).forEach((c) => {
        next[c.id] = String(Math.round(pool * (c.weight || 0)));
      });
    });
    setBudgets(next);
    Object.entries(next).forEach(([id, value]) => {
      clearTimeout(debounceTimers.current[id]);
      debounceTimers.current[id] = setTimeout(() => saveCategory(id, value), 700);
    });
  };

  const { totals, totalBudgeted, exceedsIncome, segmentPct, matchScore, dirtyCount } = useMemo(() => {
    const totals = { needs: 0, wants: 0, savings: 0 };
    categories.forEach((c) => {
      totals[c.type] += Number(budgets[c.id]) || 0;
    });
    const totalBudgeted = totals.needs + totals.wants + totals.savings;
    const exceedsIncome = totalBudgeted > (Number(targetIncome) || 0) && totalBudgeted > 0;

    const segmentPct =
      totalBudgeted > 0
        ? {
            needs: (totals.needs / totalBudgeted) * 100,
            wants: (totals.wants / totalBudgeted) * 100,
            savings: (totals.savings / totalBudgeted) * 100,
          }
        : { needs: 50, wants: 30, savings: 20 };

    const deviation =
      Math.abs(segmentPct.needs - 50) + Math.abs(segmentPct.wants - 30) + Math.abs(segmentPct.savings - 20);
    const matchScore = totalBudgeted > 0 ? Math.max(0, Math.round(100 - deviation / 2)) : null;

    const dirtyCount = categories.filter((c) => budgets[c.id] !== committed[c.id]).length;

    return { totals, totalBudgeted, exceedsIncome, segmentPct, matchScore, dirtyCount };
  }, [budgets, committed, targetIncome, categories]);

  const donutGradient = `conic-gradient(
    ${TYPE_META.needs.color} 0% ${segmentPct.needs}%,
    ${TYPE_META.wants.color} ${segmentPct.needs}% ${segmentPct.needs + segmentPct.wants}%,
    ${TYPE_META.savings.color} ${segmentPct.needs + segmentPct.wants}% 100%
  )`;

  return (
    <div className="bsp-app">
      <style>{SHELL_STYLES + STYLES}</style>

      <BudgetSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} activeId="budgets" onNavigate={onNavigate} />

      <main className="bsp-main">
        {/* Top navigation — sits at the very top of the content area, level with the sidebar top, doesn't overlap the sidebar */}
        <TopNavigation title="Budget Setup" userInitials="NA" onSettingsClick={() => onNavigate && onNavigate("settings")} />

        <div className={`bsp-toast ${toast ? "show" : ""}`}>{toast}</div>

        {/* Header — matches AdminPageHeader.jsx exactly (eyebrow + title + menu btn) */}
        <header className="bsp-header">
          <div className="bsp-header-left">
            <button className="bsp-menu-btn" onClick={() => setSidebarOpen(true)} aria-label="Open menu">
              <Menu size={20} />
            </button>
            <div>
              <h1 className="bsp-header-title">Budget Setup</h1>
            </div>
          </div>

          <div className="bsp-header-right">
            <label className="bsp-currency-field">
              <select value={currency} onChange={(e) => setCurrency(e.target.value)}>
                {Object.entries(CURRENCIES).map(([code, c]) => (
                  <option key={code} value={code}>
                    {c.symbol} {code}
                  </option>
                ))}
              </select>
            </label>
            <label
              className="bsp-sim-toggle"
              title="Demo control — forces every save/load call to fail so you can see the error + retry states"
            >
              <input type="checkbox" checked={simulateFailures} onChange={(e) => setSimulateFailures(e.target.checked)} />
              <span>Simulate error</span>
            </label>
          </div>
        </header>

        {pageStatus === "loading" && <LoadingSkeleton />}

        {pageStatus === "error" && (
          <div className="bsp-error-card">
            <p className="bsp-error-title">Couldn't load your budgets.</p>
            <p className="bsp-error-body">The budget service didn't respond. Check your connection and try again.</p>
            <button className="bsp-retry-btn" onClick={loadBudgets}>
              Retry
            </button>
          </div>
        )}

        {pageStatus === "ready" && (
          <>
            <section className="bsp-panel bsp-kpi-panel">
              <div className="bsp-kpi-top">
                <div>
                  <p className="bsp-kpi-label">Total Monthly Budgeted</p>
                  <h2 className={`bsp-kpi-amount ${exceedsIncome ? "is-alert" : ""}`}>{fmt(totalBudgeted, currency)}</h2>
                  {exceedsIncome && <span className="bsp-alert-badge">⚠️ Budget exceeds income threshold</span>}
                </div>
                <div className="bsp-income-field">
                  <label htmlFor="bsp-income">Targeted monthly income</label>
                  <div className="bsp-income-input-wrap">
                    <span>{CURRENCIES[currency].symbol}</span>
                    <input
                      id="bsp-income"
                      type="text"
                      inputMode="numeric"
                      value={targetIncome}
                      onChange={(e) => setTargetIncome(e.target.value.replace(/[^0-9]/g, ""))}
                      placeholder="0"
                    />
                  </div>
                </div>
              </div>

              <div className="bsp-split-bar-track" role="img" aria-label="Needs, wants, and savings allocation">
                <div className="bsp-split-seg" style={{ width: `${segmentPct.needs}%`, background: TYPE_META.needs.color }} />
                <div className="bsp-split-seg" style={{ width: `${segmentPct.wants}%`, background: TYPE_META.wants.color }} />
                <div className="bsp-split-seg" style={{ width: `${segmentPct.savings}%`, background: TYPE_META.savings.color }} />
              </div>
              <div className="bsp-split-legend">
                {["needs", "wants", "savings"].map((type) => (
                  <span className="bsp-legend-item" key={type}>
                    <span className="bsp-legend-dot" style={{ background: TYPE_META[type].color }} />
                    {TYPE_META[type].label} <strong>{fmt(totals[type], currency)}</strong>
                  </span>
                ))}
              </div>

              <button className="bsp-template-btn" onClick={applyTemplate}>
                ✨ Auto Apply 50/30/20 Template
              </button>
            </section>

            <section className="bsp-panel bsp-donut-panel">
              <div className="bsp-donut-visual" style={{ background: donutGradient }}>
                <div className="bsp-donut-hole">
                  <span className="bsp-donut-score">{matchScore === null ? "—" : `${matchScore}%`}</span>
                  <span className="bsp-donut-score-label">match to 50/30/20</span>
                </div>
              </div>
              <div className="bsp-donut-breakdown">
                {["needs", "wants", "savings"].map((type) => {
                  const actual = Math.round(segmentPct[type]);
                  const ideal = Math.round(TYPE_META[type].share * 100);
                  const delta = actual - ideal;
                  return (
                    <div className="bsp-donut-row" key={type}>
                      <span className="bsp-legend-dot" style={{ background: TYPE_META[type].color }} />
                      <span className="bsp-donut-row-label">{TYPE_META[type].label}</span>
                      <span className="bsp-donut-row-actual">{actual}%</span>
                      <span className="bsp-donut-row-target">target {ideal}%</span>
                      <span className={`bsp-donut-row-delta ${delta === 0 ? "" : delta > 0 ? "over" : "under"}`}>
                        {delta === 0 ? "on target" : `${delta > 0 ? "+" : ""}${delta} pts`}
                      </span>
                    </div>
                  );
                })}
              </div>
            </section>

            <section className="bsp-panel bsp-add-panel">
              <h3 className="bsp-add-title">Add New Category</h3>
              <div className="bsp-add-form">
                <input
                  className="bsp-add-name-input"
                  type="text"
                  placeholder="Category name"
                  value={addName}
                  onChange={(e) => setAddName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") addCategory();
                  }}
                />
                <select
                  className="bsp-add-type-select"
                  value={addType}
                  onChange={(e) => setAddType(e.target.value)}
                >
                  {["needs", "wants", "savings"].map((t) => (
                    <option key={t} value={t}>
                      {TYPE_META[t].label}
                    </option>
                  ))}
                </select>
                <button
                  className="bsp-add-btn"
                  onClick={addCategory}
                  disabled={!addName.trim() || removingIds.size > 0}
                >
                  + Add Category
                </button>
              </div>
            </section>

            <section className="bsp-panel bsp-table-panel">
              <div className="bsp-table-header-row">
                <span>Category Status</span>
                <span>Type</span>
                <span>Monthly budget</span>
              </div>

              {categories.map((cat) => {
                const Icon = cat.icon;
                const meta = TYPE_META[cat.type];
                const status = rowStatus[cat.id];
                const isEditing = editingId === cat.id;
                const isRemoving = removingIds.has(cat.id);
                const budgetNum = Number(budgets[cat.id]) || 0;
                const spent = cat.mockSpent;
                const pct = budgetNum > 0 ? Math.min((spent / budgetNum) * 100, 999) : 0;
                const barLevel = pct >= 100 ? "over" : pct >= 80 ? "warn" : "ok";

                return (
                  <div className={`bsp-row-wrap ${isRemoving ? "is-removing" : ""}`} key={cat.id} id={`cat-row-${cat.id}`}>
                    <div className="bsp-row">
                      <div className="bsp-cat-name-cell">
                        <div className="bsp-cat-icon-wrap" style={{ background: meta.bg }}>
                          <Icon size={18} color={meta.color} strokeWidth={2} />
                        </div>
                        {isEditing ? (
                          <input
                            className="bsp-edit-name-input"
                            type="text"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                          />
                        ) : (
                          <span className="bsp-cat-name">{cat.name}</span>
                        )}
                      </div>

                      {isEditing ? (
                        <select
                          className="bsp-edit-type-select"
                          value={editType}
                          onChange={(e) => setEditType(e.target.value)}
                        >
                          {["needs", "wants", "savings"].map((t) => (
                            <option key={t} value={t}>
                              {TYPE_META[t].label}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <span className="bsp-tag-pill" style={{ background: meta.bg, color: meta.color }}>
                          {meta.label}
                        </span>
                      )}

                      <div className="bsp-budget-cell">
                        <div className="bsp-input-wrap">
                          <span>{CURRENCIES[currency].symbol}</span>
                          <input
                            type="text"
                            inputMode="decimal"
                            placeholder="0"
                            value={budgets[cat.id]}
                            onChange={(e) => handleBudgetChange(cat.id, e.target.value)}
                          />
                        </div>

                        {isEditing ? (
                          <div className="bsp-action-grid">
                            <button className="bsp-save-btn" onClick={() => saveEdit(cat.id)}>
                              Save Changes
                            </button>
                            <button className="bsp-cancel-btn" onClick={cancelEdit}>
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <div className="bsp-action-grid">
                            <button
                              className={`bsp-save-btn ${status === "saving" ? "is-saving" : ""} ${
                                status === "saved" ? "is-saved" : ""
                              } ${status === "error" ? "is-error" : ""}`}
                              onClick={() => handleManualSave(cat.id)}
                              disabled={status === "saving"}
                            >
                              {status === "saving" && (
                                <>
                                  <span className="bsp-spinner" /> Saving...
                                </>
                              )}
                              {status === "saved" && "✓ Saved"}
                              {status === "error" && "⟳ Retry"}
                              {!status && (budgets[cat.id] !== committed[cat.id] ? "Save" : "Saved")}
                            </button>

                            <div className="bsp-dots-wrap">
                              <button
                                className={`bsp-dots-btn ${menuOpenId === cat.id ? "active" : ""}`}
                                onClick={() => setMenuOpenId((prev) => (prev === cat.id ? null : cat.id))}
                                aria-label={`Actions for ${cat.name}`}
                              >
                                <MoreVertical size={17} strokeWidth={2.2} />
                              </button>
                              {menuOpenId === cat.id && (
                                <div className="bsp-dots-menu">
                                  <button
                                    className="bsp-dots-option"
                                    onClick={() => startEdit(cat)}
                                  >
                                    <span>✎</span> Edit
                                  </button>
                                  <button
                                    className="bsp-dots-option danger"
                                    onClick={() => deleteCategory(cat.id)}
                                  >
                                    <span>🗑</span> Delete
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="bsp-progress-row">
                      <div className="bsp-progress-track">
                        <div className={`bsp-progress-fill ${barLevel}`} style={{ width: `${Math.min(pct, 100)}%` }} />
                      </div>
                      <span className="bsp-progress-label">
                        {fmt(spent, currency)} spent of {budgetNum > 0 ? fmt(budgetNum, currency) : "—"}
                        {budgetNum > 0 && ` (${Math.round(pct)}%)`}
                      </span>
                    </div>
                  </div>
                );
              })}
            </section>

            <div className="bsp-footer-actions">
              <button className="bsp-reset-btn" onClick={handleReset}>
                Reset all
              </button>
              <button
                className={`bsp-saveall-btn ${saveAllState === "saving" ? "is-saving" : ""} ${
                  saveAllState === "done" ? "is-done" : ""
                } ${saveAllState === "error" ? "is-error" : ""}`}
                onClick={handleSaveAll}
                disabled={saveAllState === "saving"}
              >
                {saveAllState === "saving" && (
                  <>
                    <span className="bsp-spinner" /> Saving...
                  </>
                )}
                {saveAllState === "done" && "✓ All saved"}
                {saveAllState === "error" && "Retry"}
                {!saveAllState && `Save All Changes${dirtyCount > 0 ? ` (${dirtyCount})` : ""}`}
              </button>
            </div>
          </>
        )}
      </main>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <>
      <div className="bsp-skel bsp-skel-kpi" />
      <div className="bsp-skel bsp-skel-donut" />
      <div className="bsp-panel bsp-table-panel">
        {Array.from({ length: 5 }).map((_, i) => (
          <div className="bsp-skel-row" key={i}>
            <div className="bsp-skel bsp-skel-icon" />
            <div className="bsp-skel bsp-skel-line" style={{ width: "40%" }} />
            <div className="bsp-skel bsp-skel-line" style={{ width: "20%" }} />
            <div className="bsp-skel bsp-skel-line" style={{ width: "15%" }} />
          </div>
        ))}
      </div>
    </>
  );
}

/* -------------------------------------------------------------------------
   Shell styles — sidebar + header. Copied 1:1 from AdminSidebar.css /
   AdminPageHeader's markup + AdminDashboard.css header tokens.
   ------------------------------------------------------------------------- */
export const SHELL_STYLES = `
  .bsp-app { display: flex; width: 100%; min-height: 100vh; font-family: 'Inter', -apple-system, 'Segoe UI', sans-serif; background: #F7F9FB; }
  .bsp-app *, .bsp-app *::before, .bsp-app *::after { box-sizing: border-box; }

  /* ============ Sidebar (AdminSidebar.css, verbatim tokens) ============ */
  /* T15 fix: mobile browsers (Chrome/Safari) measure 100vh against a
     *larger* virtual viewport than what's actually visible on screen — it
     doesn't account for the browser's own address bar / bottom nav bar
     taking up real space. That made this sidebar's own box taller than
     the real screen, which meant the bottom of the menu (Reports,
     Settings, the Logout button) could sit below the visible
     edge — and, worse, overflow-y:auto on the sidebar never actually
     kicked in to let you scroll down to them, because measured against
     its own (inflated) 100vh height, the content already fit with no
     overflow to speak of. That's what "moves down and isn't visible, no
     matter how I scroll" was. 100dvh (dynamic viewport height) tracks
     the real visible height instead, so the sidebar sizes itself to what's
     actually on screen and any content past that genuinely scrolls into
     view. Kept plain 100vh first as a fallback for older browsers that
     don't understand dvh yet. */
  .bsp-sidebar { position: fixed; top: 0; left: 0; width: 240px; height: 100vh; height: 100dvh; background: #004C48; color: #FFFFFF; display: flex; flex-direction: column; padding: 24px 16px; overflow-y: auto; -webkit-overflow-scrolling: touch; overscroll-behavior: contain; scrollbar-width: thin; border-right: 1px solid rgba(255,255,255,.05); z-index: 50; transition: transform .3s ease; }
  .bsp-sidebar::-webkit-scrollbar { width: 5px; }
  .bsp-sidebar::-webkit-scrollbar-thumb { background: #146F68; border-radius: 20px; }

  .bsp-sidebar-logo { display: flex; align-items: center; gap: 12px; margin-bottom: 34px; padding: 0 2px; }
  .bsp-logo-box { width: 36px; height: 36px; border-radius: 10px; background: transparent; display: flex; align-items: center; justify-content: center; color: #2CC0BA; flex-shrink: 0; }
  .bsp-sidebar-logo h2 { margin: 0; font-family: 'Manrope', sans-serif; font-size: 20px; font-weight: 700; color: #FFFFFF; letter-spacing: -0.4px; }

  .bsp-sidebar-section { margin-bottom: 26px; flex: 1; }
  .bsp-sidebar-heading { font-family: 'Inter', sans-serif; font-size: 11px; font-weight: 700; letter-spacing: 1.2px; color: rgba(255,255,255,.55); margin-bottom: 12px; text-transform: uppercase; }
  .bsp-sidebar-section ul { list-style: none; padding: 0; margin: 0; }
  .bsp-sidebar-section li { border-radius: 12px; margin-bottom: 6px; overflow: hidden; }
  .bsp-sidebar-section li button { display: flex; align-items: center; gap: 12px; width: 100%; height: 44px; padding: 0 14px; border-radius: 12px; cursor: pointer; color: #D8E1EC; background: transparent; border: none; transition: all .25s ease; font-family: 'Inter', sans-serif; font-size: 14px; font-weight: 500; text-align: left; }
  .bsp-sidebar-section li button svg { width: 18px; height: 18px; stroke-width: 2; flex-shrink: 0; }
  .bsp-sidebar-section li.active button { background: #BCEEE8; color: #004C48; font-weight: 600; box-shadow: 0 8px 18px rgba(0,76,72,.18); }

  .bsp-sidebar-promo { width: 100%; flex-shrink: 0; overflow: hidden; box-sizing: border-box; background: #c7eee9; border-radius: 15px; color: #003f3b; margin-bottom: 14px; }
  .bsp-sidebar-promo-image-wrapper { width: 100%; height: 110px; overflow: hidden; display: flex; align-items: center; justify-content: center; background: #d8f3ef; }
  .bsp-sidebar-promo-image { width: 100%; height: 100%; display: block; object-fit: cover; }
  .bsp-sidebar-promo-content { padding: 12px 14px 14px; box-sizing: border-box; }
  .bsp-sidebar-promo-content h3 { margin: 0 0 6px; color: #003b38; font-family: 'Segoe UI', Arial, sans-serif; font-size: 15px; font-weight: 700; line-height: 1.25; }
  .bsp-sidebar-promo-content p { margin: 0; color: #174f4b; font-family: 'Segoe UI', Arial, sans-serif; font-size: 12px; font-weight: 400; line-height: 1.4; }

  .bsp-sidebar-logout { display: flex; align-items: center; gap: 10px; width: 100%; margin-top: 12px; padding: 10px 12px; border-radius: 10px; border: 1px solid rgba(239,68,68,.25); background: rgba(239,68,68,.08); color: #FF9D9D; font-family: 'Inter', sans-serif; font-size: 14px; font-weight: 500; cursor: pointer; transition: background .15s ease, color .15s ease, transform .15s ease; }
  .bsp-sidebar-logout:hover { background: rgba(239,68,68,.16); color: #FFD1D1; }
  .bsp-sidebar-logout svg { width: 18px; height: 18px; stroke-width: 2; flex-shrink: 0; }

  .bsp-sidebar-backdrop { display: none; }

  @media (max-width: 992px) {
    .bsp-sidebar { transform: translateX(-100%); box-shadow: 0 0 40px rgba(0,0,0,.3); }
    .bsp-sidebar.open { transform: translateX(0); }
    .bsp-sidebar-backdrop.show { display: block; position: fixed; inset: 0; background: rgba(7,29,58,.4); -webkit-backdrop-filter:blur(2px); backdrop-filter:blur(2px); z-index: 40; }
  }

  /* ============ Main + header (AdminDashboard.css / AdminPageHeader) ============ */
  .bsp-main { flex: 1; margin-left: 240px; padding: 32px 40px 60px; max-width: 1240px; }
  .bsp-header { display: flex; align-items: flex-start; justify-content: space-between; gap: 20px; margin-bottom: 28px; padding-bottom: 24px; border-bottom: 1px solid #E5E7EB; }
  .bsp-header-left { display: flex; align-items: center; gap: 12px; }
  .bsp-menu-btn { display: none; width: 40px; height: 40px; align-items: center; justify-content: center; border-radius: 10px; border: 1px solid #E5E7EB; background: #fff; color: #004C48; cursor: pointer; }
  .bsp-header-eyebrow { font-family: 'Inter', sans-serif; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: .6px; color: #6B7280; margin: 0 0 4px; }
  .bsp-header-title { font-family: 'Manrope', sans-serif; font-size: 28px; font-weight: 800; color: #004C48; margin: 0; }
  .bsp-header-right { display: flex; align-items: center; gap: 14px; }

  @media (max-width: 992px) {
    .bsp-main { margin-left: 0; padding: 24px 24px 48px; }
    .bsp-menu-btn { display: flex; }
  }
  @media (max-width: 600px) {
    .bsp-header { flex-direction: column; align-items: stretch; }
    .bsp-header-right { justify-content: space-between; }
    .bsp-header-title { font-size: 24px; }
  }

  /* T15 safety net: clip any horizontal overflow on mobile/tablet (the
     width the sticky settings tab-nav is already disabled at — see
     .stg-tabs-nav below — so this can't interfere with that). One stray
     wide element anywhere in a page (like the TopNavigation bleed bug
     found in testing) shouldn't be able to make the whole page
     side-scrollable; this keeps that class of bug contained to a visual
     glitch on the offending element instead of breaking the whole page's
     scroll behaviour. */
  @media (max-width: 860px) {
    .bsp-main { overflow-x: hidden; }
  }
`;

export const STYLES = `
  .bsp-currency-field select { border: 1px solid #E5E7EB; border-radius: 8px; padding: 8px 10px; font-size: 13px; font-weight: 600; color: #004C48; background: #fff; }
  .bsp-sim-toggle { display: flex; align-items: center; gap: 7px; font-size: 12px; color: #6B7280; cursor: pointer; }
  .bsp-sim-toggle input { accent-color: #EF4444; width: 14px; height: 14px; }

  /* Panels — admin-panel token: radius 18px, border #E5E7EB, shadow 0 4px 10px rgba(15,23,42,.05) */
  .bsp-panel { background: #fff; border: 1px solid #E5E7EB; border-radius: 18px; box-shadow: 0 4px 10px rgba(15,23,42,.05); padding: 24px; margin-bottom: 24px; }

  .bsp-kpi-top { display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 16px; margin-bottom: 20px; }
  .bsp-kpi-label { font-size: 12.5px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.06em; color: #6B7280; margin: 0 0 6px; }
  .bsp-kpi-amount { font-family: 'Manrope', sans-serif; font-size: 34px; font-weight: 800; line-height: 1; margin: 0; color: #004C48; transition: color .35s ease; letter-spacing: -0.02em; }
  .bsp-kpi-amount.is-alert { color: #EF4444; }
  .bsp-alert-badge { display: inline-flex; align-items: center; gap: 6px; margin-top: 10px; padding: 5px 12px; border-radius: 999px; background: #FEF2F2; border: 1px solid #FCA5A5; color: #EF4444; font-size: 12.5px; font-weight: 600; }
  .bsp-income-field { display: flex; flex-direction: column; align-items: flex-end; gap: 6px; }
  .bsp-income-field label { font-size: 12.5px; font-weight: 600; color: #6B7280; }
  .bsp-income-input-wrap { display: flex; align-items: center; background: #F7F9FB; border: 1px solid #E5E7EB; border-radius: 10px; padding: 0 10px; }
  .bsp-income-input-wrap span { color: #6B7280; font-weight: 600; }
  .bsp-income-input-wrap input { border: none; background: transparent; outline: none; padding: 8px 6px; font-size: 14px; font-weight: 600; color: #004C48; width: 100px; text-align: right; }

  .bsp-split-bar-track { display: flex; width: 100%; height: 14px; border-radius: 999px; overflow: hidden; background: #EEF2F6; margin-bottom: 10px; }
  .bsp-split-seg { height: 100%; transition: width 0.4s ease; }
  .bsp-split-legend { display: flex; gap: 20px; flex-wrap: wrap; margin-bottom: 20px; }
  .bsp-legend-item { display: flex; align-items: center; gap: 7px; font-size: 13px; color: #6B7280; }
  .bsp-legend-dot { width: 9px; height: 9px; border-radius: 50%; flex-shrink: 0; }
  .bsp-legend-item strong { color: #004C48; font-weight: 600; }

  .bsp-template-btn { display: inline-flex; align-items: center; gap: 8px; background: #004C48; color: #fff; border: none; padding: 11px 20px; border-radius: 12px; font-size: 14px; font-weight: 600; cursor: pointer; box-shadow: 0 8px 24px rgba(0,76,72,.22); transition: transform .25s ease, box-shadow .25s ease; }
  .bsp-template-btn:hover { transform: translateY(-2px); box-shadow: 0 14px 32px rgba(0,76,72,.30); }
  .bsp-template-btn:active { transform: scale(.98); }

  .bsp-donut-panel { display: flex; align-items: center; gap: 28px; flex-wrap: wrap; }
  .bsp-donut-visual { position: relative; width: 120px; height: 120px; border-radius: 50%; flex-shrink: 0; transition: background .4s ease; }
  .bsp-donut-hole { position: absolute; inset: 19px; background: #fff; border-radius: 50%; display: flex; flex-direction: column; align-items: center; justify-content: center; box-shadow: inset 0 0 0 1px #E5E7EB; }
  .bsp-donut-score { font-family: 'Manrope', sans-serif; font-size: 18px; font-weight: 800; color: #004C48; }
  .bsp-donut-score-label { font-size: 9.5px; color: #6B7280; text-align: center; line-height: 1.2; margin-top: 2px; max-width: 68px; }
  .bsp-donut-breakdown { display: flex; flex-direction: column; gap: 10px; flex: 1; min-width: 220px; }
  .bsp-donut-row { display: grid; grid-template-columns: 10px 70px 40px 1fr auto; align-items: center; gap: 10px; font-size: 13px; }
  .bsp-donut-row-label { font-weight: 600; color: #004C48; }
  .bsp-donut-row-actual { font-weight: 700; color: #004C48; }
  .bsp-donut-row-target { color: #6B7280; font-size: 12px; }
  .bsp-donut-row-delta { font-size: 12px; font-weight: 600; color: #6B7280; }
  .bsp-donut-row-delta.over { color: #F59E0B; }
  .bsp-donut-row-delta.under { color: #2FA8A0; }

  .bsp-table-panel { padding: 0; overflow: visible; border-radius: 18px; }
  .bsp-table-header-row { display: grid; grid-template-columns: 2fr 1fr 2.6fr; gap: 12px; padding: 14px 24px; background: #F7F9FB; border-bottom: 1px solid #E5E7EB; border-radius: 18px 18px 0 0; }
  .bsp-table-header-row span { font-size: 11.5px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; color: #6B7280; }
  .bsp-table-header-row span:nth-child(3) { text-align: right; }

  .bsp-row-wrap { border-bottom: 1px solid #F1F4F8; transition: background .15s ease; }
  .bsp-row-wrap:last-child { border-bottom: none; border-radius: 0 0 18px 18px; }
  .bsp-row-wrap:hover { background: #F7F9FB; }
  .bsp-row-wrap.is-removing { opacity: 0; transform: translateX(-24px); height: 0; overflow: hidden; padding: 0; transition: opacity .28s ease, transform .28s ease, height .28s ease, padding .28s ease; }
  .bsp-row { display: grid; grid-template-columns: 2fr 1fr 2.6fr; gap: 12px; align-items: center; padding: 14px 24px 8px; }
  .bsp-cat-name-cell { display: flex; align-items: center; gap: 12px; }
  .bsp-cat-icon-wrap { width: 36px; height: 36px; border-radius: 10px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
  .bsp-cat-name { font-size: 14.5px; font-weight: 600; color: #1F2937; }
  .bsp-tag-pill { display: inline-flex; align-items: center; padding: 4px 11px; border-radius: 999px; font-size: 12px; font-weight: 700; width: fit-content; }

  .bsp-budget-cell { display: flex; align-items: center; justify-content: flex-end; gap: 10px; flex-wrap: wrap; }
  .bsp-input-wrap { display: flex; align-items: center; border: 1px solid #E5E7EB; border-radius: 10px; background: #F7F9FB; padding: 0 12px; height: 38px; width: 130px; transition: border-color .15s ease, box-shadow .15s ease; }
  .bsp-input-wrap:focus-within { border-color: #2FA8A0; box-shadow: 0 0 0 3px rgba(47,168,160,0.14); background: #fff; }
  .bsp-input-wrap span { color: #6B7280; font-weight: 600; font-size: 14px; margin-right: 4px; }
  .bsp-input-wrap input { border: none; outline: none; background: transparent; font-size: 14px; font-weight: 600; color: #004C48; width: 100%; padding: 0; }
  .bsp-input-wrap input::placeholder { color: #B7C1CC; font-weight: 500; }

  .bsp-save-btn { display: inline-flex; align-items: center; justify-content: center; gap: 6px; height: 38px; min-width: 96px; border-radius: 10px; border: 1px solid #E5E7EB; background: #fff; color: #004C48; font-size: 12.5px; font-weight: 600; cursor: pointer; transition: background .15s ease, border-color .15s ease, color .15s ease; }
  .bsp-save-btn:hover:not(:disabled) { border-color: #2FA8A0; color: #2FA8A0; }
  .bsp-save-btn.is-saving { background: #F1F5F9; color: #6B7280; border-color: #E5E7EB; cursor: default; }
  .bsp-save-btn.is-saved { background: #ECFDF5; border-color: #86EFAC; color: #15803D; cursor: default; }
  .bsp-save-btn.is-error { background: #FEF2F2; border-color: #FCA5A5; color: #EF4444; }
  .bsp-spinner { width: 13px; height: 13px; border-radius: 50%; border: 2px solid #CBD5E1; border-top-color: #6B7280; animation: bsp-spin .7s linear infinite; }
  @keyframes bsp-spin { to { transform: rotate(360deg); } }

  .bsp-action-grid { display: flex; align-items: center; justify-content: flex-end; gap: 8px; flex-wrap: wrap; }
  .bsp-edit-btn, .bsp-delete-btn, .bsp-cancel-btn { height: 38px; min-width: 72px; border-radius: 10px; border: 1px solid #E5E7EB; background: #fff; font-size: 12.5px; font-weight: 600; cursor: pointer; transition: background .15s ease, border-color .15s ease, color .15s ease; }
  .bsp-edit-btn { color: #004C48; }
  .bsp-edit-btn:hover { border-color: #2FA8A0; color: #2FA8A0; }
  .bsp-delete-btn { color: #EF4444; }
  .bsp-delete-btn:hover { background: #FEF2F2; border-color: #FCA5A5; }
  .bsp-cancel-btn { color: #6B7280; }
  .bsp-cancel-btn:hover { background: #F1F5F9; border-color: #D1D5DB; }

  .bsp-dots-wrap { position: relative; display: inline-flex; }
  .bsp-dots-btn { display: inline-flex; align-items: center; justify-content: center; width: 34px; height: 34px; border-radius: 9px; border: 1px solid #E5E7EB; background: #fff; color: #6B7280; cursor: pointer; transition: border-color .15s ease, color .15s ease, background .15s ease; }
  .bsp-dots-btn:hover, .bsp-dots-btn.active { border-color: #2FA8A0; color: #2FA8A0; background: #F0FAF9; }
  .bsp-dots-menu { position: absolute; top: 40px; right: 0; z-index: 30; min-width: 148px; background: #fff; border: 1px solid #E5E7EB; border-radius: 12px; box-shadow: 0 10px 30px rgba(15,23,42,.14); padding: 6px; display: flex; flex-direction: column; gap: 2px; animation: bsp-menu-in .16s ease; }
  @keyframes bsp-menu-in { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: translateY(0); } }
  .bsp-dots-option { display: flex; align-items: center; gap: 9px; width: 100%; border: none; background: transparent; padding: 9px 11px; border-radius: 8px; font-size: 13px; font-weight: 600; color: #1F2937; cursor: pointer; text-align: left; transition: background .12s ease; }
  .bsp-dots-option span { font-size: 13px; opacity: .8; }
  .bsp-dots-option:hover { background: #F7F9FB; }
  .bsp-dots-option.danger { color: #EF4444; }
  .bsp-dots-option.danger:hover { background: #FEF2F2; }

  .bsp-edit-name-input { flex: 1; min-width: 90px; border: 1px solid #E5E7EB; border-radius: 10px; padding: 8px 10px; font-size: 14px; font-weight: 600; color: #1F2937; background: #fff; outline: none; transition: border-color .15s ease, box-shadow .15s ease; }
  .bsp-edit-name-input:focus { border-color: #2FA8A0; box-shadow: 0 0 0 3px rgba(47,168,160,0.14); }
  .bsp-edit-type-select { height: 38px; border: 1px solid #E5E7EB; border-radius: 10px; padding: 0 10px; font-size: 12px; font-weight: 700; color: #004C48; background: #fff; cursor: pointer; outline: none; }

  .bsp-add-panel { margin-top: 24px; }
  .bsp-add-panel + .bsp-table-panel { margin-top: -12px; }
  .bsp-add-title { font-family: 'Manrope', sans-serif; font-size: 15px; font-weight: 700; color: #004C48; margin: 0 0 14px; }
  .bsp-add-form { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
  .bsp-add-name-input { flex: 1; min-width: 180px; height: 40px; border: 1px solid #E5E7EB; border-radius: 10px; background: #F7F9FB; padding: 0 12px; font-size: 14px; font-weight: 600; color: #1F2937; outline: none; transition: border-color .15s ease, box-shadow .15s ease; }
  .bsp-add-name-input:focus { border-color: #2FA8A0; box-shadow: 0 0 0 3px rgba(47,168,160,0.14); background: #fff; }
  .bsp-add-name-input::placeholder { color: #B7C1CC; font-weight: 500; }
  .bsp-add-type-select { height: 40px; border: 1px solid #E5E7EB; border-radius: 10px; padding: 0 12px; font-size: 13px; font-weight: 600; color: #004C48; background: #fff; cursor: pointer; outline: none; }
  .bsp-add-btn { display: inline-flex; align-items: center; gap: 6px; height: 40px; padding: 0 18px; border-radius: 10px; border: none; background: #004C48; color: #fff; font-size: 13.5px; font-weight: 700; cursor: pointer; box-shadow: 0 6px 18px rgba(0,76,72,.22); transition: transform .2s ease, opacity .2s ease, background .15s ease; }
  .bsp-add-btn:hover:not(:disabled) { transform: translateY(-1px); }
  .bsp-add-btn:disabled { cursor: not-allowed; }

  .bsp-progress-row { padding: 0 24px 14px 24px; display: flex; align-items: center; gap: 10px; }
  .bsp-progress-track { flex: 1; height: 6px; border-radius: 999px; background: #EEF2F6; overflow: hidden; }
  .bsp-progress-fill { height: 100%; border-radius: 999px; transition: width .35s ease, background .35s ease; }
  .bsp-progress-fill.ok { background: #22C55E; }
  .bsp-progress-fill.warn { background: #F59E0B; }
  .bsp-progress-fill.over { background: #EF4444; }
  .bsp-progress-label { font-size: 11.5px; color: #6B7280; white-space: nowrap; }

  .bsp-footer-actions { display: flex; justify-content: flex-end; gap: 12px; }
  .bsp-reset-btn { background: #fff; border: 1px solid #E5E7EB; color: #6B7280; padding: 11px 18px; border-radius: 12px; font-size: 13.5px; font-weight: 600; cursor: pointer; transition: border-color .15s ease, color .15s ease; }
  .bsp-reset-btn:hover { border-color: #EF4444; color: #EF4444; }
  .bsp-saveall-btn { background: #004C48; border: none; color: #fff; padding: 11px 20px; border-radius: 12px; font-size: 13.5px; font-weight: 700; cursor: pointer; box-shadow: 0 8px 24px rgba(0,76,72,.22); transition: transform .25s ease, opacity .25s ease; }
  .bsp-saveall-btn:hover:not(:disabled) { transform: translateY(-2px); }
  .bsp-saveall-btn:disabled { opacity: .7; cursor: default; box-shadow: none; }
  .bsp-saveall-btn.is-saving { background: #BCEEE8; color: #004C48; box-shadow: 0 8px 24px rgba(188,238,232,.3); }
  .bsp-saveall-btn.is-done { background: #BCEEE8; color: #004C48; box-shadow: 0 8px 24px rgba(188,238,232,.3); }
  .bsp-saveall-btn.is-error { background: #EF4444; box-shadow: 0 8px 24px rgba(239,68,68,.25); }

  .bsp-error-card { background: #fff; border: 1px solid #FECACA; border-radius: 18px; padding: 32px; text-align: center; margin-bottom: 20px; }
  .bsp-error-title { font-size: 16px; font-weight: 700; color: #B91C1C; margin: 0 0 6px; }
  .bsp-error-body { font-size: 13.5px; color: #6B7280; margin: 0 0 16px; }
  .bsp-retry-btn { background: #004C48; color: #fff; border: none; padding: 10px 22px; border-radius: 10px; font-weight: 600; font-size: 13.5px; cursor: pointer; }

  .bsp-skel { background: linear-gradient(90deg, #EEF2F6 25%, #F6F8FA 37%, #EEF2F6 63%); background-size: 400% 100%; animation: bsp-shimmer 1.4s ease infinite; border-radius: 10px; }
  @keyframes bsp-shimmer { 0% { background-position: 100% 0; } 100% { background-position: 0 0; } }
  .bsp-skel-kpi { height: 168px; margin-bottom: 20px; border-radius: 18px; }
  .bsp-skel-donut { height: 96px; margin-bottom: 20px; border-radius: 18px; }
  .bsp-skel-row { display: flex; align-items: center; gap: 16px; padding: 16px 24px; border-bottom: 1px solid #F1F4F8; }
  .bsp-skel-row:last-child { border-bottom: none; }
  .bsp-skel-icon { width: 36px; height: 36px; border-radius: 10px; flex-shrink: 0; }
  .bsp-skel-line { height: 14px; }

  @media (max-width: 992px) {
    .bsp-kpi-grid { grid-template-columns: 1fr; }
  }
  @media (max-width: 640px) {
    .bsp-table-header-row, .bsp-row { grid-template-columns: 1.4fr 1fr 2fr; padding-left: 16px; padding-right: 16px; }
    .bsp-progress-row { padding-left: 16px; padding-right: 16px; flex-direction: column; align-items: flex-start; gap: 4px; }
    .bsp-cat-name { font-size: 13px; }
    .bsp-kpi-amount { font-size: 28px; }
    .bsp-donut-panel { flex-direction: column; align-items: flex-start; }
    .bsp-donut-row { grid-template-columns: 10px 60px 34px 1fr; }
    .bsp-donut-row-delta { display: none; }
  }

  /* T15 fix: at real phone widths, the 3-column grid (name / type / budget)
     didn't have enough room for its 3rd column's content — the budget
     input, Save button and the ⋮ menu together need ~280px, but that
     column was only getting a fraction of an already-narrow row. The
     result was the budget input, Save button and ⋮ menu wrapping onto
     their own lines and visually overlapping the row below. Below 480px,
     stack each category as name → type → budget instead of forcing them
     into columns that don't fit, so every control gets the row's full
     width and nothing overlaps. */
  @media (max-width: 480px) {
    .bsp-table-header-row { display: none; }
    .bsp-row {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      gap: 10px;
      padding: 14px 16px 12px;
    }
    .bsp-budget-cell { width: 100%; justify-content: space-between; }
  }

  /* T15 fix: confirmation toast for "Add Category" — same pattern already
     used for toasts elsewhere in the app (Transactions, Budget Tracking).
     Adding a category always worked, it just gave zero feedback, which on
     a long list looked exactly like it silently failed. */
  .bsp-toast { position: fixed; bottom: 24px; left: 50%; transform: translateX(-50%) translateY(20px); background: #004C48; color: #fff; padding: 11px 20px; border-radius: 11px; font-size: 13px; font-weight: 600; opacity: 0; transition: all .3s ease; pointer-events: none; box-shadow: 0 10px 30px rgba(0,0,0,0.2); z-index: 60; }
  .bsp-toast.show { opacity: 1; transform: translateX(-50%) translateY(0); }
`;

export default function BudgetSetupPage({ onNavigate }) {
  return (
    <ErrorBoundary>
      <BudgetSetupPageInner onNavigate={onNavigate} />
    </ErrorBoundary>
  );
}