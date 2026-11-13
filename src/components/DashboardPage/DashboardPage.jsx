import { useState } from "react";
import {
  Menu,
  TrendingUp,
  TrendingDown,
  PiggyBank,
  ListChecks,
  PieChart,
  ShoppingCart,
  Briefcase,
  Car,
  BookOpen,
  Wallet,
  Calendar,
} from "lucide-react";

import { BudgetSidebar, SHELL_STYLES } from "../BudgetSetupPage/BudgetSetupPage";
import TopNavigation from "../TopNavigation/TopNavigation";
import "./DashboardPage.css";

/* =========================================================================
   SMFinTrack — Dashboard Page
   Ported from Awais's SMFinTrack_Project (src/components/Dashboard),
   dropped into the same bsp-sidebar / TopNavigation shell every other
   page in this app uses (see BudgetSetupPage.jsx). Content, layout and
   class names below are otherwise unchanged from Awais's version.
   ========================================================================= */

const TRANSACTION_ICONS = {
  cart: ShoppingCart,
  briefcase: Briefcase,
  car: Car,
  book: BookOpen,
  wallet: Wallet,
};

function formatPKR(amount) {
  return `PKR ${Math.abs(amount).toLocaleString("en-PK")}`;
}

export default function DashboardPage({ onNavigate }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Read the logged-in user's name from the account saved at signup
  // (see SignupForm.jsx / LoginPage.jsx — smfintrackUser holds firstName).
  // Falls back to a generic greeting if no saved profile is found.
  const [firstName] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("smfintrackUser") || "null");
      return saved?.firstName?.trim() || "there";
    } catch {
      return "there";
    }
  });

  const [summary] = useState({
    totalIncome: 85000,
    totalExpenses: 45250,
    totalSavings: 39750,
    incomeChangePct: 12,
    expensesChangePct: 8,
    savingsChangePct: 18,
  });

  const [transactions] = useState([
    { id: "t1", title: "Grocery Shopping", category: "Essentials", date: "May 22, 2025", amount: -3250, icon: "cart" },
    { id: "t2", title: "Freelance Work", category: "Income", date: "May 21, 2025", amount: 15000, icon: "briefcase" },
    { id: "t3", title: "Transportation", category: "Travel", date: "May 21, 2025", amount: -500, icon: "car" },
    { id: "t4", title: "Online Course", category: "Education", date: "May 20, 2025", amount: -2500, icon: "book" },
    { id: "t5", title: "Pocket Money", category: "Income", date: "May 20, 2025", amount: 10000, icon: "wallet" },
  ]);

  const [budgets] = useState([
    { id: "b1", name: "Food & Dining", spent: 8000, limit: 12000 },
    { id: "b2", name: "Transportation", spent: 2000, limit: 4000 },
    { id: "b3", name: "Education", spent: 3500, limit: 6000 },
    { id: "b4", name: "Entertainment", spent: 1200, limit: 3000 },
    { id: "b5", name: "Shopping", spent: 2000, limit: 5000 },
  ]);

  const [categories] = useState([
    { id: "c1", name: "Food & Dining", amount: 15250, percent: 34, color: "#08736f" },
    { id: "c2", name: "Transportation", amount: 6500, percent: 14, color: "#dc2626" },
    { id: "c3", name: "Education", amount: 7500, percent: 17, color: "#e08a2e" },
    { id: "c4", name: "Entertainment", amount: 5000, percent: 11, color: "#4a90d9" },
    { id: "c5", name: "Shopping", amount: 6000, percent: 13, color: "#149c97" },
    { id: "c6", name: "Others", amount: 5000, percent: 11, color: "#8b6fd1" },
  ]);

  const radius = 70;
  const stroke = 26;
  const circumference = 2 * Math.PI * radius;
  let offsetSoFar = 0;

  return (
    <div className="bsp-app">
      <style>{SHELL_STYLES}</style>

      <BudgetSidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        activeId="dashboard"
        onNavigate={onNavigate}
      />

      <main className="bsp-main">
        <TopNavigation
          title="Dashboard"
          userInitials={firstName.charAt(0).toUpperCase()}
          onSettingsClick={() => onNavigate && onNavigate("settings")}
        />

        <button
          type="button"
          className="bsp-menu-btn dp-mobile-menu"
          onClick={() => setSidebarOpen(true)}
          aria-label="Open menu"
        >
          <Menu size={20} />
        </button>

        <div className="dashboard-page">

          {/* ================= PAGE HEADING ================= */}
          <section className="dashboard-heading-row">

            <div className="dashboard-heading-text">
              <h1>
                Welcome back, <span>{firstName}</span> <span className="wave">👋</span>
              </h1>

              <p>Here's your financial overview for today.</p>
            </div>

            <div className="dashboard-heading-actions">
              <div className="dashboard-date-badge">
                <Calendar size={16} />
                <span>May 22, 2025</span>
              </div>
            </div>

          </section>

          {/* ================= SUMMARY CARDS ================= */}
          <section className="summary-cards">

            <div className="summary-card">
              <div className="summary-card-icon income">
                <TrendingUp size={24} />
              </div>
              <div className="summary-card-body">
                <span className="summary-card-label">Total Income</span>
                <span className="summary-card-value">{formatPKR(summary.totalIncome)}</span>
                <span className="summary-card-change positive">
                  <TrendingUp size={13} /> {summary.incomeChangePct}% from last month
                </span>
              </div>
            </div>

            <div className="summary-card">
              <div className="summary-card-icon expense">
                <TrendingDown size={24} />
              </div>
              <div className="summary-card-body">
                <span className="summary-card-label">Total Expenses</span>
                <span className="summary-card-value">{formatPKR(summary.totalExpenses)}</span>
                <span className="summary-card-change negative">
                  <TrendingUp size={13} /> {summary.expensesChangePct}% from last month
                </span>
              </div>
            </div>

            <div className="summary-card">
              <div className="summary-card-icon savings">
                <PiggyBank size={24} />
              </div>
              <div className="summary-card-body">
                <span className="summary-card-label">Total Savings</span>
                <span className="summary-card-value">{formatPKR(summary.totalSavings)}</span>
                <span className="summary-card-change positive">
                  <TrendingUp size={13} /> {summary.savingsChangePct}% from last month
                </span>
              </div>
            </div>

          </section>

          {/* ================= TRANSACTIONS + BUDGET ROW ================= */}
          <section className="dashboard-row">

            {/* RECENT TRANSACTIONS */}
            <div className="dashboard-card">

              <div className="dashboard-card-header">
                <h2>
                  <ListChecks size={19} />
                  Recent Transactions
                </h2>
                <button
                  type="button"
                  className="card-header-action"
                  onClick={() => onNavigate && onNavigate("transactions")}
                >
                  View All
                </button>
              </div>

              <ul className="transaction-list">
                {transactions.map((tx) => {
                  const Icon = TRANSACTION_ICONS[tx.icon] || Wallet;
                  const positive = tx.amount >= 0;

                  return (
                    <li key={tx.id} className="transaction-row">
                      <div className={`transaction-icon ${positive ? "positive" : "neutral"}`}>
                        <Icon size={18} />
                      </div>

                      <div className="transaction-info">
                        <span className="transaction-title">{tx.title}</span>
                        <span className="transaction-meta">{tx.date} • {tx.category}</span>
                      </div>

                      <span className={`transaction-amount ${positive ? "positive" : "negative"}`}>
                        {positive ? "+" : "-"}{formatPKR(tx.amount)}
                      </span>
                    </li>
                  );
                })}
              </ul>

            </div>

            {/* BUDGET OVERVIEW */}
            <div className="dashboard-card">

              <div className="dashboard-card-header">
                <h2>
                  <PieChart size={19} />
                  Budget Overview
                </h2>
                <button
                  type="button"
                  className="card-header-action"
                  onClick={() => onNavigate && onNavigate("budgets")}
                >
                  View Budgets
                </button>
              </div>

              <ul className="budget-list">
                {budgets.map((b) => {
                  const pct = Math.min(100, Math.round((b.spent / b.limit) * 100));

                  return (
                    <li key={b.id} className="budget-row">
                      <div className="budget-row-top">
                        <span className="budget-name">{b.name}</span>
                        <span className="budget-amounts">
                          {formatPKR(b.spent)} / {formatPKR(b.limit)}
                        </span>
                        <span className="budget-pct">{pct}%</span>
                      </div>

                      <div className="budget-track">
                        <div
                          className={`budget-fill ${pct >= 90 ? "high" : ""}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </li>
                  );
                })}
              </ul>

            </div>

          </section>

          {/* ================= SPENDING BY CATEGORY ================= */}
          <section className="dashboard-card spending-card">

            <div className="dashboard-card-header">
              <h2>
                <PieChart size={19} />
                Spending by Category
              </h2>
            </div>

            <div className="spending-body">

              <div className="donut-wrap">
                <svg viewBox="0 0 180 180" width="220" height="220">
                  <g transform="rotate(-90 90 90)">
                    {categories.map((c) => {
                      const segmentLength = (c.percent / 100) * circumference;
                      const dasharray = `${segmentLength} ${circumference - segmentLength}`;
                      const dashoffset = -offsetSoFar;
                      offsetSoFar += segmentLength;

                      return (
                        <circle
                          key={c.id}
                          cx="90"
                          cy="90"
                          r={radius}
                          fill="none"
                          stroke={c.color}
                          strokeWidth={stroke}
                          strokeDasharray={dasharray}
                          strokeDashoffset={dashoffset}
                        />
                      );
                    })}
                  </g>
                </svg>

                <div className="donut-center">
                  <span className="donut-center-label">Total Expenses</span>
                  <span className="donut-center-value">{formatPKR(summary.totalExpenses)}</span>
                </div>
              </div>

              <ul className="spending-legend">
                {categories.map((c) => (
                  <li key={c.id} className="spending-legend-row">
                    <span className="legend-dot" style={{ background: c.color }} />
                    <span className="legend-name">{c.name}</span>
                    <span className="legend-amount">{formatPKR(c.amount)}</span>
                    <span className="legend-pct">{c.percent}%</span>
                  </li>
                ))}
              </ul>

              <div className="spending-tip-card">
                <div className="spending-tip-art" aria-hidden="true">
                  <svg viewBox="0 0 140 100" width="100%" height="100%">
                    <rect x="28" y="38" width="72" height="46" rx="8" fill="#08736f" />
                    <rect x="28" y="50" width="72" height="9" fill="#0b3d2e" opacity="0.35" />
                    <circle cx="82" cy="72" r="7" fill="#7BD8B5" />

                    <circle cx="104" cy="26" r="16" fill="#ffffff" stroke="#d8f4f1" strokeWidth="2" />
                    <path d="M104 18v8l6 4" stroke="#08736f" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <path
                      d="M104 26 L112 21 A9 9 0 0 1 104 35 Z"
                      fill="#dc2626"
                      opacity="0.85"
                    />

                    <circle cx="18" cy="26" r="14" fill="#ffffff" stroke="#d8f4f1" strokeWidth="2" />
                    <path d="M12 22h10l-2 8h-6z" stroke="#08736f" strokeWidth="1.8" strokeLinejoin="round" fill="none" />
                    <circle cx="14" cy="32" r="1.6" fill="#08736f" />
                    <circle cx="20" cy="32" r="1.6" fill="#08736f" />

                    <circle cx="118" cy="58" r="11" fill="#ffffff" stroke="#d8f4f1" strokeWidth="2" />
                    <circle cx="118" cy="58" r="3.2" fill="#08736f" />
                    <path d="M118 51v3M118 62v3M111 58h3M122 58h3" stroke="#08736f" strokeWidth="1.6" strokeLinecap="round" />
                  </svg>
                </div>

                <p className="spending-tip-title">Great job! 🎉</p>
                <p className="spending-tip-text">
                  You're managing your finances better than last month.
                </p>
              </div>

            </div>

          </section>

        </div>
      </main>
    </div>
  );
}
