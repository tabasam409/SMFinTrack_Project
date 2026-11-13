import { useEffect, useMemo, useRef, useState } from "react";
import {
  Menu,
  RefreshCw,
  Plus,
  Utensils,
  Car,
  Zap,
  Clapperboard,
  Repeat,
  ShoppingBag,
  CircleHelp,
  ChevronLeft,
  ChevronRight,
  Search,
  Download,
  Target,
  Wifi,
  Bell,
  Wallet,
  CreditCard,
  X,
} from "lucide-react";

import { BudgetSidebar, SHELL_STYLES } from "../BudgetSetupPage/BudgetSetupPage";
import TopNavigation from "../TopNavigation/TopNavigation";
import { cachedFetchJSON, invalidateCache } from "../../services/apiCache";

/* =========================================================================
   SMFinTrack — Budget Tracking Page
   Same sidebar/header shell as BudgetSetupPage (bsp-* classes, SHELL_STYLES
   imported directly so it stays pixel-identical). Main content below is
   converted 1:1 from the "Budget Tracker" HTML mock, reusing the same
   design tokens: Primary #004C48  Accent #2FA8A0  Success #22C55E
   Danger #EF4444  Warning #F59E0B  Background #F7F9FB

   Task 4 additions (bt-* classes, same tokens as above):
     1. Monthly History Switcher — bsp-header-right, cycles MONTHLY_DATA
     2. Savings Goals            — bt-goals section, purple/indigo accent
     3. Upcoming Bills           — bt-bills sidebar card, calendar badges
     4. Export CSV               — bt-export-btn, client-side Blob download
     5. Search & Filter          — bt-search-input, filters visible cards
   ========================================================================= */

/* Point these at your real budget API when ready */
const BUDGET_API_URL = "https://example.com/api/budgets";
const EXPENSE_POST_URL = "https://example.com/api/expenses";

const ICONS = {
  "Food & Dining": Utensils,
  Transport: Car,
  "Bills & Utilities": Zap,
  Entertainment: Clapperboard,
  Subscriptions: Repeat,
  Shopping: ShoppingBag,
};

const MOCK_DATA = [
  { category: "Food & Dining", spent: 3400, budgeted: 5000 },
  { category: "Transport", spent: 1750, budgeted: 2000 },
  { category: "Bills & Utilities", spent: 2900, budgeted: 3000 },
  { category: "Entertainment", spent: 1450, budgeted: 1200 },
  { category: "Subscriptions", spent: 980, budgeted: 800 },
  { category: "Shopping", spent: 1100, budgeted: 3000 },
];

/* Feature 1: Monthly History Switcher — one budget snapshot per month.
   Swap this for a real "/api/budgets?month=" call once the backend is ready. */
const MONTHS = ["June 2026", "July 2026", "August 2026"];

const MONTHLY_DATA = {
  "June 2026": [
    { category: "Food & Dining", spent: 4200, budgeted: 5000 },
    { category: "Transport", spent: 1900, budgeted: 2000 },
    { category: "Bills & Utilities", spent: 2700, budgeted: 3000 },
    { category: "Entertainment", spent: 900, budgeted: 1200 },
    { category: "Subscriptions", spent: 800, budgeted: 800 },
    { category: "Shopping", spent: 2600, budgeted: 3000 },
  ],
  "July 2026": [
    { category: "Food & Dining", spent: 4800, budgeted: 5000 },
    { category: "Transport", spent: 2150, budgeted: 2000 },
    { category: "Bills & Utilities", spent: 3100, budgeted: 3000 },
    { category: "Entertainment", spent: 1350, budgeted: 1200 },
    { category: "Subscriptions", spent: 800, budgeted: 800 },
    { category: "Shopping", spent: 1800, budgeted: 3000 },
  ],
  "August 2026": MOCK_DATA,
};

/* Feature 2: Savings Goals */
const SAVINGS_GOALS = [
  { id: "laptop", name: "MacBook Pro M4 Fund", targetDate: "Dec 2026", saved: 1800, target: 2500 },
  { id: "emergency", name: "Emergency Fund", targetDate: "Mar 2027", saved: 2100, target: 5000 },
];

/* Feature 3: Upcoming Bills / Subscriptions */
const UPCOMING_BILLS = [
  { id: "netflix", name: "Netflix", day: 18, dueDays: 3, amount: 1200, icon: Clapperboard },
  { id: "internet", name: "Internet Bill", day: 22, dueDays: 7, amount: 3500, icon: Wifi },
  { id: "electricity", name: "Electricity Bill", day: 28, dueDays: 13, amount: 6200, icon: Zap },
  { id: "spotify", name: "Spotify", day: 15, dueDays: 0, amount: 1000, icon: Clapperboard },
  { id: "phone", name: "Mobile Plan", day: 5, dueDays: 5, amount: 1500, icon: Wifi },
  { id: "youtube", name: "YouTube Premium", day: 11, dueDays: 2, amount: 1199, icon: Clapperboard },
];

const TODAY_DAY = 15;

const pkr = (n) => "PKR " + Math.round(n).toLocaleString();

const dueLabel = (days) => {
  if (days <= 0) return "Due today";
  if (days === 1) return "Due tomorrow";
  return `Due in ${days} days`;
};

const statusOf = (percent, spent, budgeted) => {
  if (spent > budgeted) return "critical";
  if (percent >= 70) return "warning";
  return "ok";
};

export default function BudgetTrackingPage({ onNavigate }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [data, setData] = useState(MOCK_DATA);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [monthIndex, setMonthIndex] = useState(MONTHS.length - 1); // August 2026
  const [modalOpen, setModalOpen] = useState(false);
  const [category, setCategory] = useState(MOCK_DATA[0].category);
  const [amount, setAmount] = useState("");
  const [bills, setBills] = useState(UPCOMING_BILLS);
  const [showAllBills, setShowAllBills] = useState(false);
  const [modalMode, setModalMode] = useState("expense");
  const [billName, setBillName] = useState("");
  const [billDay, setBillDay] = useState("");
  const [billAmount, setBillAmount] = useState("");
  const [toast, setToast] = useState(null);
  const toastTimer = useRef(null);

  const fetchBudgetData = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      // T15 perf fix: short-lived cache on initial load so switching pages
      // and coming back doesn't re-pay the network round-trip. An explicit
      // refresh (isRefresh) always bypasses the cache and hits the network,
      // since the user is asking for the latest data on purpose.
      const json = isRefresh
        ? await (async () => {
            const res = await fetch(BUDGET_API_URL);
            if (!res.ok) throw new Error("Bad response");
            const data = await res.json();
            invalidateCache(BUDGET_API_URL);
            return data;
          })()
        : await cachedFetchJSON(BUDGET_API_URL);
      setData(json);
    } catch {
      setData(MONTHLY_DATA[MONTHS[monthIndex]] || MOCK_DATA);
    }

    if (isRefresh) {
      setTimeout(() => setRefreshing(false), 500);
      showToast("Budget data refreshed");
    } else {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBudgetData(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const showToast = (msg) => {
    setToast(msg);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2200);
  };

  /* Feature 1: switch month → swap in that month's snapshot (brief skeleton
     for the same polish as the refresh/loading states above) */
  const changeMonth = (dir) => {
    const next = monthIndex + dir;
    if (next < 0 || next >= MONTHS.length) return;
    setMonthIndex(next);
    setLoading(true);
    setTimeout(() => {
      setData(MONTHLY_DATA[MONTHS[next]] || MOCK_DATA);
      setLoading(false);
    }, 350);
  };

  const totals = useMemo(() => {
    const totalBudget = data.reduce((s, i) => s + i.budgeted, 0);
    const totalSpent = data.reduce((s, i) => s + i.spent, 0);
    const remaining = totalBudget - totalSpent;
    const pct = totalBudget ? Math.round((totalSpent / totalBudget) * 100) : 0;
    const overCats = data.filter((i) => i.spent > i.budgeted);
    return { totalBudget, totalSpent, remaining, pct, overCats };
  }, [data]);

  const billPct = totals.totalBudget
    ? Math.min(Math.round((bills.reduce((s, b) => s + b.amount, 0) / totals.totalBudget) * 100), 100)
    : 0;

  /* Feature 5: status filter + live search, combined */
  const visibleData = useMemo(() => {
    return data.filter((item) => {
      const percent = item.budgeted ? Math.round((item.spent / item.budgeted) * 100) : 0;
      const status = statusOf(percent, item.spent, item.budgeted);
      if (filter === "warning" && status !== "warning") return false;
      if (filter === "critical" && status !== "critical") return false;
      if (search.trim() && !item.category.toLowerCase().includes(search.trim().toLowerCase())) return false;
      return true;
    });
  }, [data, filter, search]);

  /* Feature 4: Export CSV — no extra dependency, plain Blob download */
  const exportCSV = () => {
    const header = ["Category", "Budgeted (PKR)", "Spent (PKR)", "Remaining (PKR)", "Percent Used"];
    const rows = visibleData.map((item) => {
      const percent = item.budgeted ? Math.round((item.spent / item.budgeted) * 100) : 0;
      return [item.category, item.budgeted, item.spent, item.budgeted - item.spent, `${percent}%`];
    });
    const csv = [header, ...rows].map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `smfintrack-budget-${MONTHS[monthIndex].replace(" ", "-").toLowerCase()}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast("Budget exported as CSV");
  };

  const postExpense = async (cat, amt) => {
    try {
      const res = await fetch(EXPENSE_POST_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category: cat, amount: amt }),
      });
      if (!res.ok) throw new Error("API rejected request");
      // Budget totals just changed server-side — drop the cached snapshot
      // so the next natural refetch picks up the real numbers instead of
      // serving stale cached data.
      invalidateCache(BUDGET_API_URL);
      return true;
    } catch {
      return false;
    }
  };

  const handleAddExpense = async (e) => {
    e.preventDefault();
    const amt = parseFloat(amount);
    if (!amt || amt <= 0) return;

    await postExpense(category, amt);

    setData((prev) =>
      prev.map((item) => (item.category === category ? { ...item, spent: item.spent + amt } : item))
    );

    setModalOpen(false);
    setAmount("");
    showToast(`Added PKR ${amt.toLocaleString()} to ${category}`);
  };

  const handleAddBill = (e) => {
    e.preventDefault();
    const amt = parseFloat(billAmount);
    const day = parseInt(billDay, 10);
    const name = billName.trim();
    if (!amt || amt <= 0 || !day || day < 1 || day > 31 || !name) return;

    setBills((prev) => [
      ...prev,
      {
        id: "bill-" + Date.now(),
        name,
        day,
        amount: amt,
        dueDays: day >= TODAY_DAY ? day - TODAY_DAY : 31 - TODAY_DAY + day,
        icon: Clapperboard,
      },
    ]);

    setModalOpen(false);
    setBillName("");
    setBillDay("");
    setBillAmount("");
    showToast(`Added bill "${name}" for ${pkr(amt)}`);
  };

  const openModal = (mode) => {
    setModalMode(mode);
    setModalOpen(true);
  };

  return (
    <div className="bsp-app">
      <style>{SHELL_STYLES + BT_STYLES}</style>

      <BudgetSidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        activeId="budget-tracking"
        onNavigate={onNavigate}
      />

      <main className="bsp-main">
        <TopNavigation title="Budget Tracking" userInitials="NA" onSettingsClick={() => onNavigate && onNavigate("settings")} />

        {/* Header — identical shell to BudgetSetupPage's header */}
        <header className="bsp-header">
          <div className="bsp-header-left">
            <button className="bsp-menu-btn" onClick={() => setSidebarOpen(true)} aria-label="Open menu">
              <Menu size={20} />
            </button>
            <div>
              <h1 className="bsp-header-title">Know where it's going</h1>
            </div>
          </div>

          <div className="bsp-header-right">
            {/* Feature 1: Monthly History Switcher */}
            <div className="bt-month-switcher">
              <button
                className="bt-month-btn"
                onClick={() => changeMonth(-1)}
                disabled={monthIndex === 0}
                aria-label="Previous month"
              >
                <ChevronLeft size={15} />
              </button>
              <span className="bt-month-label">{MONTHS[monthIndex]}</span>
              <button
                className="bt-month-btn"
                onClick={() => changeMonth(1)}
                disabled={monthIndex === MONTHS.length - 1}
                aria-label="Next month"
              >
                <ChevronRight size={15} />
              </button>
            </div>

            <button
              className={`bt-icon-btn${refreshing ? " spinning" : ""}`}
              title="Refresh data"
              onClick={() => fetchBudgetData(true)}
            >
              <RefreshCw size={17} />
            </button>
            <button className="bt-btn-primary" onClick={() => openModal("expense")}>
              <Plus size={14} strokeWidth={3} />
              Add Expense
            </button>
          </div>
        </header>

        {/* Summary cards */}
        <div className="bt-summary-grid">
          <div className="bt-summary-card">
            <div className="bt-summary-label">Total Budget</div>
            <div className="bt-summary-value">{loading ? "—" : pkr(totals.totalBudget)}</div>
            <div className="bt-summary-note">Across all categories</div>
          </div>
          <div className="bt-summary-card">
            <div className="bt-summary-label">Total Spent</div>
            <div className="bt-summary-value">{loading ? "—" : pkr(totals.totalSpent)}</div>
            <div className="bt-summary-note">{loading ? "—" : `${totals.pct}% of total budget used`}</div>
          </div>
          <div className="bt-summary-card">
            <div className="bt-summary-label">Remaining</div>
            <div className={`bt-summary-value${totals.remaining < 0 ? " neg" : ""}`}>
              {loading ? "—" : pkr(Math.abs(totals.remaining))}
            </div>
            <div className="bt-summary-note">
              {loading ? "—" : totals.remaining >= 0 ? "On track for this month" : "Over your total budget"}
            </div>
          </div>
        </div>

        {/* Alert banner */}
        {!loading && totals.overCats.length > 0 && (
          <div className="bt-alert-banner">
            <div className="bt-alert-icon">!</div>
            <div>
              <div className="bt-alert-title">Budget limit exceeded</div>
              <div className="bt-alert-text">
                {totals.overCats.length === 1
                  ? `You've gone over budget in ${totals.overCats[0].category}.`
                  : `You've gone over budget in ${totals.overCats.length} categories: ${totals.overCats
                      .map((i) => i.category)
                      .join(", ")}.`}
              </div>
            </div>
          </div>
        )}

        {/* Two-column workspace: budgets + goals on the left, bills feed on the right */}
        <div className="bt-content-grid">
          <div className="bt-content-left">
            {/* Feature 4 & 5: Export + Search utility bar */}
            <div className="bt-utility-bar">
              <div className="bt-search-wrap">
                <Search size={14} className="bt-search-icon" />
                <input
                  type="text"
                  className="bt-search-input"
                  placeholder="Search categories..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <button className="bt-export-btn" onClick={exportCSV}>
                <Download size={14} />
                Export CSV
              </button>
            </div>

            {/* Category Budgets heading */}
            <div className="bt-section-head">
              <div>
                <div className="bt-section-title bt-catb-title">
                  <Wallet size={15} className="bt-catb-icon" /> Category Budgets
                </div>
                <p className="bt-section-sub">Spend vs. budget this month</p>
              </div>
              <div className="bt-filters">
                {["all", "warning", "critical"].map((f) => (
                  <button
                    key={f}
                    className={`bt-filter-btn${filter === f ? " active" : ""}`}
                    onClick={() => setFilter(f)}
                  >
                    {f === "all" ? "All" : f === "warning" ? "Near Limit" : "Over Budget"}
                  </button>
                ))}
              </div>
            </div>

            {/* Grid */}
            <div className="bt-grid">
              {loading
                ? Array(4)
                    .fill(0)
                    .map((_, i) => <div className="bt-skeleton" key={i} />)
                : visibleData.length === 0
                ? (
                  <div className="bt-empty">No categories match "{search}".</div>
                )
                : visibleData.map((item) => {
                    const percent = item.budgeted ? Math.round((item.spent / item.budgeted) * 100) : 0;
                    const width = Math.min(percent, 100);
                    const remaining = item.budgeted - item.spent;
                    const status = statusOf(percent, item.spent, item.budgeted);
                    const Icon = ICONS[item.category] || CircleHelp;

                    const badgeClass = status === "ok" ? "green" : status === "warning" ? "amber" : "red";
                    const badgeText = status === "ok" ? "On Track" : status === "warning" ? "Warning" : "Critical";

                    return (
                      <div className="bt-card" key={item.category}>
                        <div className="bt-card-top">
                          <div className="bt-cat-row">
                            <div className={`bt-cat-icon ${badgeClass}`}>
                              <Icon size={18} />
                            </div>
                            <div>
                              <div className="bt-cat-name">{item.category}</div>
                              <div className="bt-cat-amounts">
                                <b>{pkr(item.spent)}</b> / {pkr(item.budgeted)}
                              </div>
                            </div>
                          </div>
                          <span className={`bt-badge ${badgeClass}`}>● {badgeText}</span>
                        </div>

                        <div className="bt-track">
                          <div className={`bt-fill ${badgeClass}`} style={{ width: `${width}%` }} />
                        </div>

                        <div className="bt-card-bottom">
                          {remaining >= 0 ? (
                            <span className="bt-remaining-left">
                              Left: <b>{pkr(remaining)}</b>
                            </span>
                          ) : (
                            <span className="bt-remaining-left over">
                              Over: <b>{pkr(Math.abs(remaining))}</b>
                            </span>
                          )}
                          <span className="bt-percent-label">{percent}%</span>
                        </div>
                      </div>
                    );
                  })}
            </div>

            {/* Feature 3: Upcoming Bills — below Category Budgets */}
            <div className="bt-bills-block">
              <div className="bt-section-title bt-bills-title">
                <Bell size={13} /> Upcoming Bills
              </div>
              <div className="bt-bills-card">
                <div className="bt-bills-total">
                <div className="bt-bills-total-label">
                  {bills.length} bills due this month
                </div>
                <div className="bt-bills-total-value">
                  {pkr(bills.reduce((s, b) => s + b.amount, 0))}
                </div>
                  <div className="bt-bills-total-note">
                    {billPct}% of your total budget
                  </div>
                  <div className="bt-bills-total-bar">
                    <div className="bt-bills-total-fill" style={{ width: `${billPct}%` }} />
                  </div>
                </div>
                {bills
                  .slice(0, showAllBills ? bills.length : 3)
                  .sort((a, b) => a.day - b.day)
                  .map((bill) => {
                    const BillIcon = bill.icon;
                    const urgency = bill.dueDays <= 1 ? "urgent" : bill.dueDays <= 5 ? "soon" : "later";
                    return (
                      <div className="bt-bill-row" key={bill.id}>
                        <div className="bt-bill-badge">
                          <BillIcon size={16} />
                          <span>{bill.day}</span>
                        </div>
                        <div className="bt-bill-info">
                          <div className="bt-bill-name">{bill.name}</div>
                          <div className={`bt-bill-note ${urgency}`}>{dueLabel(bill.dueDays)}</div>
                        </div>
                        <div className="bt-bill-amount">{pkr(bill.amount)}</div>
                      </div>
                    );
                  })}
                <div className="bt-bills-actions">
                  <button className="bt-bills-btn primary" onClick={() => openModal("bill")}>
                    <Plus size={13} strokeWidth={3} /> Add Bill
                  </button>
                  <button className="bt-bills-btn ghost" onClick={() => setShowAllBills((v) => !v)}>
                    {showAllBills ? "Show Less" : `View All (${bills.length})`}
                  </button>
                </div>
              </div>
            </div>

            {/* Feature 2: Savings Goals */}
            <div className="bt-goals">
              <div className="bt-section-row">
                <div className="bt-section-title bt-goals-title">Savings Goals</div>
              </div>
              <div className="bt-goals-list">
                {SAVINGS_GOALS.map((goal) => {
                  const pct = Math.min(Math.round((goal.saved / goal.target) * 100), 100);
                  return (
                    <div className="bt-goal-card" key={goal.id}>
                      <div className="bt-goal-top">
                        <div className="bt-cat-row">
                          <div className="bt-goal-icon">
                            <Target size={17} />
                          </div>
                          <div>
                            <div className="bt-cat-name">{goal.name}</div>
                            <div className="bt-cat-amounts">Target date: {goal.targetDate}</div>
                          </div>
                        </div>
                        <div className="bt-goal-amount">
                          <b>{pkr(goal.saved)}</b> <span>of {pkr(goal.target)}</span>
                        </div>
                      </div>
                      <div className="bt-track bt-goal-track">
                        <div className="bt-fill bt-goal-fill" style={{ width: `${pct}%` }} />
                      </div>
                      <div className="bt-goal-bottom">{pct}% completed</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Add Modal — expense or bill mode */}
        {modalOpen && (
          <div className="bt-modal-overlay" onClick={(e) => e.target === e.currentTarget && setModalOpen(false)}>
            <div className="bt-modal">
              <div className="bt-modal-head">
                <span className="bt-modal-icon">
                  {modalMode === "bill" ? <CreditCard size={18} /> : <Plus size={18} strokeWidth={2.5} />}
                </span>
                <div>
                  <h3>{modalMode === "bill" ? "Add a bill" : "Add an expense"}</h3>
                  <p>{modalMode === "bill" ? "Track a new upcoming payment" : "Log a spend in one of your categories"}</p>
                </div>
                <button type="button" className="bt-modal-close" onClick={() => setModalOpen(false)} aria-label="Close">
                  <X size={16} />
                </button>
              </div>
              <form onSubmit={modalMode === "bill" ? handleAddBill : handleAddExpense}>
                {modalMode === "bill" ? (
                  <>
                    <div className="bt-field">
                      <label>Bill name</label>
                      <input
                        type="text"
                        placeholder="e.g. Internet Bill"
                        value={billName}
                        onChange={(e) => setBillName(e.target.value)}
                        required
                      />
                    </div>
                    <div className="bt-field">
                      <label>Amount (PKR)</label>
                      <input
                        type="number"
                        min="1"
                        step="1"
                        placeholder="e.g. 3500"
                        value={billAmount}
                        onChange={(e) => setBillAmount(e.target.value)}
                        required
                      />
                    </div>
                    <div className="bt-field">
                      <label>Due day of month</label>
                      <input
                        type="number"
                        min="1"
                        max="31"
                        step="1"
                        placeholder="e.g. 22"
                        value={billDay}
                        onChange={(e) => setBillDay(e.target.value)}
                        required
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div className="bt-field">
                      <label>Category</label>
                      <select value={category} onChange={(e) => setCategory(e.target.value)} required>
                        {data.map((i) => (
                          <option key={i.category} value={i.category}>
                            {i.category}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="bt-field">
                      <label>Amount (PKR)</label>
                      <input
                        type="number"
                        min="1"
                        step="1"
                        placeholder="e.g. 500"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        required
                      />
                    </div>
                  </>
                )}
                <div className="bt-modal-actions">
                  <button type="button" className="bt-btn-cancel" onClick={() => setModalOpen(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="bt-btn-submit">
                    {modalMode === "bill" ? <CreditCard size={15} /> : <Plus size={15} strokeWidth={2.5} />}
                    {modalMode === "bill" ? "Add Bill" : "Add Expense"}
                  </button>
                </div>
                <p className="bt-form-note">
                  {modalMode === "bill"
                    ? "Adds to this month's Upcoming Bills list."
                    : "Posts to the budget API. Falls back to this session if the API is unreachable."}
                </p>
              </form>
            </div>
          </div>
        )}

        {/* Toast */}
        <div className={`bt-toast${toast ? " show" : ""}`}>{toast}</div>
      </main>
    </div>
  );
}

const BT_STYLES = `
  .bt-icon-btn{ width:40px; height:40px; border-radius:12px; border:1px solid #E5E7EB; background:#fff; display:flex; align-items:center; justify-content:center; cursor:pointer; color:#004C48; transition:transform .15s ease, box-shadow .15s ease; box-shadow:0 2px 10px rgba(0,76,72,0.05); }
  .bt-icon-btn:hover{ transform:translateY(-1px); box-shadow:0 6px 16px rgba(0,76,72,0.10); }
  .bt-icon-btn.spinning svg{ animation:bt-spin .8s linear infinite; }
  @keyframes bt-spin{ to{ transform:rotate(360deg); } }

  .bt-btn-primary{ background:#004C48; color:#fff; border:none; font-weight:600; font-size:13.5px; padding:11px 18px; border-radius:12px; cursor:pointer; box-shadow:0 8px 20px rgba(0,76,72,0.22); transition:transform .15s ease, box-shadow .15s ease; display:flex; align-items:center; gap:7px; }
  .bt-btn-primary:hover{ transform:translateY(-1px); box-shadow:0 10px 24px rgba(0,76,72,0.28); }

  /* Feature 1: Month switcher */
  .bt-month-switcher{ display:flex; align-items:center; gap:2px; background:#fff; border:1px solid rgba(0,76,72,0.1); border-radius:12px; padding:4px; box-shadow:0 2px 10px rgba(0,76,72,0.05); }
  .bt-month-btn{ width:28px; height:28px; border:none; background:transparent; border-radius:8px; display:flex; align-items:center; justify-content:center; color:#6B7A8C; cursor:pointer; transition:all .15s ease; }
  .bt-month-btn:hover:not(:disabled){ background:#F7F9FB; color:#004C48; }
  .bt-month-btn:disabled{ opacity:.35; cursor:not-allowed; }
  .bt-month-label{ font-size:12.5px; font-weight:700; color:#004C48; min-width:96px; text-align:center; }

  .bt-summary-grid{ display:grid; grid-template-columns:repeat(3,1fr); gap:14px; margin-bottom:22px; }
  .bt-summary-card{ background:rgba(255,255,255,0.85); -webkit-backdrop-filter:blur(10px); backdrop-filter:blur(10px); border:1px solid rgba(0,76,72,0.08); border-radius:16px; padding:16px 18px; box-shadow:0 8px 30px rgba(16,35,55,0.04); transition:transform .18s ease, box-shadow .18s ease; cursor:default; }
  .bt-summary-card:hover{ transform:translateY(-3px); box-shadow:0 14px 32px rgba(16,35,55,0.10); }
  .bt-summary-label{ font-size:11px; font-weight:700; letter-spacing:.06em; text-transform:uppercase; color:#6B7A8C; }
  .bt-summary-value{ font-size:24px; font-weight:800; color:#004C48; margin-top:6px; font-family:'Manrope',sans-serif; }
  .bt-summary-value.neg{ color:#EF4444; }
  .bt-summary-note{ font-size:11.5px; color:#6B7A8C; margin-top:4px; }

  .bt-alert-banner{ display:flex; align-items:flex-start; gap:12px; margin-bottom:20px; padding:14px 16px; border-radius:14px; background:rgba(239,68,68,0.07); border:1px solid rgba(239,68,68,0.25); }
  .bt-alert-icon{ width:30px; height:30px; border-radius:9px; background:rgba(239,68,68,0.15); color:#EF4444; display:flex; align-items:center; justify-content:center; flex-shrink:0; font-weight:800; }
  .bt-alert-title{ font-size:13.5px; font-weight:700; color:#B91C1C; }
  .bt-alert-text{ font-size:12.5px; color:#B91C1C; opacity:.85; margin-top:2px; }

  /* Content grid: single column — budgets, bills, then goals */
  .bt-content-grid{ display:grid; grid-template-columns:1fr; gap:22px; align-items:start; }
  .bt-bills-block{ margin-top:22px; }

  /* Feature 4 & 5: utility bar (search + export) */
  .bt-utility-bar{ display:flex; gap:10px; align-items:center; margin-bottom:14px; background:rgba(255,255,255,0.85); border:1px solid rgba(0,76,72,0.08); border-radius:14px; padding:10px; }
  .bt-search-wrap{ position:relative; flex:1; }
  .bt-search-icon{ position:absolute; left:11px; top:50%; transform:translateY(-50%); color:#9AA7B4; }
  .bt-search-input{ width:100%; padding:9px 12px 9px 32px; border-radius:10px; border:1px solid rgba(0,76,72,0.1); font-size:12.5px; font-family:'Inter',sans-serif; background:#F7F9FB; color:#16232F; }
  .bt-search-input:focus{ outline:2px solid #2FA8A0; outline-offset:1px; background:#fff; }
  .bt-export-btn{ display:flex; align-items:center; gap:7px; background:#F7F9FB; border:1px solid rgba(0,76,72,0.1); color:#004C48; font-weight:600; font-size:12.5px; padding:9px 14px; border-radius:10px; cursor:pointer; white-space:nowrap; transition:all .15s ease; }
  .bt-export-btn:hover{ background:#fff; box-shadow:0 6px 16px rgba(0,76,72,0.1); transform:translateY(-1px); }

  .bt-section-row{ display:flex; justify-content:space-between; align-items:center; margin-bottom:12px; flex-wrap:wrap; gap:10px; }
  .bt-section-title{ font-size:12px; font-weight:700; letter-spacing:.08em; text-transform:uppercase; color:#6B7A8C; display:flex; align-items:center; gap:6px; }

  /* Category Budgets heading — bigger, cleaner title */
  .bt-section-head{ display:flex; justify-content:space-between; align-items:flex-end; margin-bottom:14px; flex-wrap:wrap; gap:12px; }
  .bt-catb-title{ font-family:'Manrope',sans-serif; font-size:17px; font-weight:800; letter-spacing:-.01em; text-transform:none; color:#004C48; gap:7px; }
  .bt-catb-icon{ color:#2FA8A0; }
  .bt-section-sub{ font-size:11.5px; color:#6B7A8C; margin:2px 0 0 22px; }
  .bt-filters{ display:flex; gap:6px; background:#fff; padding:4px; border-radius:12px; border:1px solid rgba(0,76,72,0.08); }
  .bt-filter-btn{ border:none; background:transparent; font-size:12px; font-weight:600; color:#6B7A8C; padding:7px 12px; border-radius:9px; cursor:pointer; transition:all .15s ease; }
  .bt-filter-btn.active{ background:#004C48; color:#fff; }
  .bt-filter-btn:not(.active):hover{ color:#004C48; }

  .bt-grid{ display:grid; gap:14px; grid-template-columns:repeat(2,1fr); }
  @media (max-width:640px){ .bt-grid{ grid-template-columns:1fr; } .bt-summary-grid{ grid-template-columns:1fr; } }

  .bt-empty{ grid-column:1/-1; text-align:center; padding:30px 10px; color:#6B7A8C; font-size:13px; background:#fff; border:1px dashed rgba(0,76,72,0.15); border-radius:16px; }

  .bt-card{ background:rgba(255,255,255,0.9); border:1px solid rgba(0,76,72,0.08); border-radius:16px; padding:18px; box-shadow:0 8px 30px rgba(16,35,55,0.04); transition:transform .18s ease, box-shadow .18s ease; }
  .bt-card:hover{ transform:translateY(-2px); box-shadow:0 12px 28px rgba(16,35,55,0.08); }
  .bt-card-top{ display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:14px; }
  .bt-cat-row{ display:flex; gap:11px; align-items:center; }
  .bt-cat-icon{ width:38px;height:38px;border-radius:11px; display:flex;align-items:center;justify-content:center; flex-shrink:0; }
  .bt-cat-icon.green{ background:rgba(34,197,94,0.1); color:#15803D; }
  .bt-cat-icon.amber{ background:rgba(245,158,11,0.12); color:#B45309; }
  .bt-cat-icon.red{ background:rgba(239,68,68,0.1); color:#B91C1C; }
  .bt-cat-name{ font-size:14.5px; font-weight:700; color:#16232F; letter-spacing:-.01em; }
  .bt-cat-amounts{ font-size:11.5px; color:#6B7A8C; margin-top:1px; }
  .bt-cat-amounts b{ color:#16232F; font-weight:700; }

  .bt-badge{ font-size:10px; font-weight:700; padding:3px 9px; border-radius:99px; white-space:nowrap; }
  .bt-badge.green{ background:rgba(34,197,94,0.10); color:#15803D; border:1px solid rgba(34,197,94,0.25); }
  .bt-badge.amber{ background:rgba(245,158,11,0.12); color:#B45309; border:1px solid rgba(245,158,11,0.3); }
  .bt-badge.red{ background:rgba(239,68,68,0.1); color:#B91C1C; border:1px solid rgba(239,68,68,0.3); }

  .bt-track{ width:100%; height:10px; background:#EEF2F6; border-radius:99px; padding:2px; border:1px solid rgba(0,76,72,0.08); }
  .bt-fill{ height:100%; border-radius:99px; transition:width 900ms cubic-bezier(.16,1,.3,1); }
  .bt-fill.green{ background:#22C55E; }
  .bt-fill.amber{ background:#F59E0B; }
  .bt-fill.red{ background:#EF4444; animation:bt-pulse 1.4s ease-in-out infinite; }
  @keyframes bt-pulse{ 0%,100%{ box-shadow:0 0 0px rgba(239,68,68,0.4); } 50%{ box-shadow:0 0 12px rgba(239,68,68,0.55); } }

  .bt-card-bottom{ display:flex; justify-content:space-between; align-items:center; margin-top:8px; font-size:11.5px; }
  .bt-remaining-left{ color:#6B7A8C; }
  .bt-remaining-left b{ color:#22C55E; font-weight:700; }
  .bt-remaining-left.over b{ color:#EF4444; }
  .bt-percent-label{ font-weight:700; color:#16232F; }

  .bt-skeleton{ height:118px; border-radius:16px; background:linear-gradient(90deg,#E9EEF3 25%,#F4F7FA 37%,#E9EEF3 63%); background-size:400% 100%; animation:bt-shimmer 1.4s ease infinite; border:1px solid rgba(0,76,72,0.08); }
  @keyframes bt-shimmer{ 0%{ background-position:100% 0; } 100%{ background-position:0 0; } }

  /* Feature 2: Savings Goals */
  .bt-goals{ margin-top:26px; }
  .bt-goals-title{ color:#6D3FBF; }
  .bt-goals-list{ display:grid; gap:14px; }
  .bt-goal-card{ background:rgba(109,63,191,0.05); border:1px solid rgba(109,63,191,0.18); border-radius:16px; padding:18px; }
  .bt-goal-top{ display:flex; justify-content:space-between; align-items:flex-start; flex-wrap:wrap; gap:10px; margin-bottom:12px; }
  .bt-goal-icon{ width:38px; height:38px; border-radius:11px; background:rgba(109,63,191,0.12); color:#6D3FBF; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
  .bt-goal-amount{ font-size:13px; color:#6D3FBF; font-weight:700; text-align:right; }
  .bt-goal-amount span{ color:#6B7A8C; font-weight:500; font-size:11.5px; }
  .bt-goal-track{ border-color:rgba(109,63,191,0.15); }
  .bt-goal-fill{ background:#6D3FBF; }
  .bt-goal-bottom{ text-align:right; font-size:11px; font-weight:700; color:#6D3FBF; margin-top:6px; }

  /* Feature 3: Upcoming Bills — colors follow the navigation (sidebar) theme:
     teal #004C48 / #003A3A  accent #2FA8A0 / #5EEAD4  */
  .bt-bills-title{ color:#004C48; margin-bottom:12px; }
  .bt-bills-card{ background:rgba(255,255,255,0.9); border:1px solid rgba(0,76,72,0.08); border-radius:16px; padding:16px; box-shadow:0 8px 30px rgba(16,35,55,0.04); }
  .bt-bills-total{ background:#004C48; border-radius:12px; padding:12px 14px; margin-bottom:12px; box-shadow:0 8px 18px rgba(47,168,160,.25); }
  .bt-bills-total-label{ font-size:10.5px; font-weight:700; letter-spacing:.06em; text-transform:uppercase; color:rgba(255,255,255,.7); }
  .bt-bills-total-value{ font-size:22px; font-weight:800; color:#FFFFFF; margin-top:3px; font-family:'Manrope',sans-serif; }
  .bt-bills-total-note{ font-size:11px; color:#5EEAD4; margin-top:2px; font-weight:600; }
  .bt-bills-total-bar{ height:6px; border-radius:99px; background:rgba(255,255,255,.18); margin-top:10px; overflow:hidden; }
  .bt-bills-total-fill{ height:100%; border-radius:99px; background:#5EEAD4; transition:width 900ms cubic-bezier(.16,1,.3,1); }
  .bt-bill-row{ display:flex; align-items:center; gap:11px; padding:10px 8px; border-bottom:1px solid rgba(0,76,72,0.06); border-radius:10px; transition:background .15s ease; }
  .bt-bill-row:hover{ background:rgba(47,168,160,0.06); }
  .bt-bill-row:last-of-type{ border-bottom:none; }
  .bt-bill-badge{ width:44px; height:44px; border-radius:12px; background:rgba(47,168,160,0.12); border:1px solid rgba(47,168,160,0.25); color:#2FA8A0; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:2px; flex-shrink:0; }
  .bt-bill-badge span{ font-weight:800; font-size:13px; line-height:1; color:#004C48; }
  .bt-bill-info{ flex:1; min-width:0; }
  .bt-bill-name{ font-size:14px; font-weight:700; color:#16232F; letter-spacing:-.01em; }
  .bt-bill-note{ font-size:11px; color:#6B7A8C; margin-top:2px; font-weight:600; }
  .bt-bill-note.urgent{ color:#B91C1C; }
  .bt-bill-note.soon{ color:#B45309; }
  .bt-bill-note.later{ color:#15803D; }
  .bt-bill-amount{ font-size:14px; font-weight:800; color:#004C48; white-space:nowrap; }
  .bt-bills-actions{ display:flex; gap:8px; margin-top:12px; padding-top:12px; border-top:1px dashed rgba(0,76,72,0.1); }
  .bt-bills-btn{ flex:1; display:flex; align-items:center; justify-content:center; gap:6px; border-radius:10px; padding:9px 10px; font-size:12px; font-weight:700; cursor:pointer; transition:all .15s ease; }
  .bt-bills-btn.primary{ background:#004C48; color:#fff; border:none; box-shadow:0 6px 16px rgba(0,76,72,.3); }
  .bt-bills-btn.primary:hover{ transform:translateY(-1px); box-shadow:0 8px 20px rgba(0,76,72,.4); }
  .bt-bills-btn.ghost{ background:#F7F9FB; border:1px solid rgba(0,76,72,0.1); color:#004C48; }
  .bt-bills-btn.ghost:hover{ background:#fff; box-shadow:0 6px 14px rgba(0,76,72,0.08); }

  .bt-modal-overlay{ position:fixed; inset:0; background:rgba(7,29,58,0.5); -webkit-backdrop-filter:blur(4px); backdrop-filter:blur(4px); display:flex; align-items:center; justify-content:center; padding:20px; z-index:50; animation:bt-fade .18s ease; }
  @keyframes bt-fade{ from{ opacity:0; } }
  .bt-modal{ background:#fff; border-radius:20px; width:100%; max-width:400px; box-shadow:0 24px 70px rgba(7,29,58,0.3); overflow:hidden; animation:bt-pop .24s cubic-bezier(.16,1,.3,1); }
  @keyframes bt-pop{ from{ opacity:0; transform:translateY(14px) scale(.97); } }
  .bt-modal-head{ display:flex; align-items:center; gap:12px; padding:18px 20px; background:rgba(47,168,160,0.08); border-bottom:1px solid rgba(0,76,72,0.08); }
  .bt-modal-icon{ width:42px; height:42px; border-radius:12px; background:#004C48; color:#fff; display:flex; align-items:center; justify-content:center; flex-shrink:0; box-shadow:0 6px 16px rgba(0,76,72,0.35); }
  .bt-modal-head h3{ margin:0; font-family:'Manrope',sans-serif; font-size:17px; color:#004C48; }
  .bt-modal-head p{ margin:2px 0 0; font-size:12px; color:#6B7A8C; }
  .bt-modal-close{ margin-left:auto; width:32px; height:32px; border:none; background:rgba(0,76,72,0.06); border-radius:9px; color:#6B7A8C; cursor:pointer; display:flex; align-items:center; justify-content:center; transition:all .15s ease; flex-shrink:0; }
  .bt-modal-close:hover{ background:rgba(239,68,68,0.12); color:#EF4444; }
  .bt-modal form{ padding:20px; }
  .bt-field{ margin-bottom:14px; }
  .bt-field label{ font-size:11px; font-weight:700; letter-spacing:.05em; text-transform:uppercase; color:#004C48; display:block; margin-bottom:6px; }
  .bt-field select, .bt-field input{ width:100%; padding:12px 14px; border-radius:12px; border:1.5px solid rgba(0,76,72,0.2); font-size:14px; font-family:'Inter',sans-serif; background:#F7F9FB; color:#16232F; transition:all .15s ease; }
  .bt-field select:focus, .bt-field input:focus{ outline:none; border-color:#2FA8A0; background:#fff; box-shadow:0 0 0 4px rgba(47,168,160,0.14); }
  .bt-field select{ -webkit-appearance:none; -moz-appearance:none; appearance:none; cursor:pointer; }
  .bt-modal-actions{ display:flex; gap:10px; margin-top:4px; }
  .bt-btn-cancel{ flex:1; background:#EEF2F6; border:none; padding:12px; border-radius:12px; font-weight:600; font-size:13.5px; cursor:pointer; color:#6B7A8C; transition:all .15s ease; }
  .bt-btn-cancel:hover{ background:#E2E8F0; color:#004C48; }
  .bt-btn-cancel:disabled{ opacity:.5; cursor:not-allowed; }
  .bt-btn-submit{ flex:1.2; background:#004C48; border:none; padding:12px; border-radius:12px; font-weight:700; font-size:13.5px; cursor:pointer; color:#fff; box-shadow:0 8px 20px rgba(0,76,72,0.3); transition:all .15s ease; display:flex; align-items:center; justify-content:center; gap:7px; }
  .bt-btn-submit:hover{ transform:translateY(-1px); box-shadow:0 10px 26px rgba(0,76,72,0.42); }
  .bt-form-note{ font-size:11px; color:#6B7A8C; margin-top:14px; background:#F7F9FB; border:1px solid rgba(0,76,72,0.08); border-radius:10px; padding:9px 12px; line-height:1.5; }

  .bt-toast{ position:fixed; bottom:24px; left:50%; transform:translateX(-50%) translateY(20px); background:#004C48; color:#fff; padding:11px 20px; border-radius:11px; font-size:13px; font-weight:600; opacity:0; transition:all .3s ease; pointer-events:none; box-shadow:0 10px 30px rgba(0,0,0,0.2); z-index:60; }
  .bt-toast.show{ opacity:1; transform:translateX(-50%) translateY(0); }
`;