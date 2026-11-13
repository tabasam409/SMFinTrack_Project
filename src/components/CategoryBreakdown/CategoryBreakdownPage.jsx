import { useMemo, useState } from "react";
import {
  Menu,
  Calendar,
  ChevronDown,
  TrendingDown,
  Lightbulb,
  FileText,
  Download,
  Utensils,
  Car,
  BookOpen,
  Gamepad2,
  ShoppingBag,
  Ellipsis,
  ArrowUpDown,
  ChevronUp,
} from "lucide-react";

import { BudgetSidebar, SHELL_STYLES } from "../BudgetSetupPage/BudgetSetupPage";
import TopNavigation from "../TopNavigation/TopNavigation";
import "./CategoryBreakdownPage.css";

/* =========================================================================
   SMFinTrack — Category Breakdown Page
   Ported from Awais's SMFinTrack_Project (src/components/CategoryBreakdown),
   dropped into the same bsp-sidebar / TopNavigation shell every other
   page in this app uses (see BudgetSetupPage.jsx). Content, layout and
   class names below are otherwise unchanged from Awais's version — the
   original page's own bell/avatar in the heading row is dropped since
   TopNavigation already provides those (same as TransactionsPage).
   ========================================================================= */

// ---- Category metadata: color + icon per category, matching the mockup ----
// Order here is intentional — it drives the pie slice order, the legend
// order, and the default table order, all matching the mockup exactly.
const CATEGORY_META = [
  { name: "Food & Dining", color: "#0F6E56", icon: Utensils },
  { name: "Transportation", color: "#F0575B", icon: Car },
  { name: "Education", color: "#F5A623", icon: BookOpen },
  { name: "Entertainment", color: "#5B9BEC", icon: Gamepad2 },
  { name: "Shopping", color: "#3FBE96", icon: ShoppingBag },
  { name: "Others", color: "#9B7FE8", icon: Ellipsis },
];

const DATE_RANGES = ["This Month", "Last Month", "Last 3 Months", "This Year"];

// TODO: once the category API (Task 8) is ready, replace this mock data
// with a real fetch keyed off the selected date range, e.g.
//   const res = await fetch(`/api/categories?range=${dateRange}`);
// Keep the same shape (name, amount, transactionCount) so the pie chart,
// legend, and table below don't need to change.
const MOCK_CATEGORY_DATA = {
  "Food & Dining": { amount: 15250, transactionCount: 24 },
  Transportation: { amount: 6500, transactionCount: 16 },
  Education: { amount: 7500, transactionCount: 12 },
  Entertainment: { amount: 5000, transactionCount: 10 },
  Shopping: { amount: 6000, transactionCount: 18 },
  Others: { amount: 5000, transactionCount: 9 },
};

const PREVIOUS_PERIOD_CHANGE_PCT = -8;
const PREVIOUS_PERIOD_LABEL = "Apr 1 - Apr 30";

function formatPKR(amount) {
  return `PKR ${amount.toLocaleString("en-PK")}`;
}

// Converts a percentage-around-the-circle into an (x, y) point on the pie's edge.
function polarToCartesian(cx, cy, r, angleDeg) {
  const angleRad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(angleRad), y: cy + r * Math.sin(angleRad) };
}

function PieChart({ categories, size = 260 }) {
  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2 - 6;

  let cumulativeAngle = 0;

  return (
    <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size}>
      {categories.map((c) => {
        const sweep = (c.percent / 100) * 360;
        const startAngle = cumulativeAngle;
        const endAngle = cumulativeAngle + sweep;
        cumulativeAngle = endAngle;

        const start = polarToCartesian(cx, cy, r, startAngle);
        const end = polarToCartesian(cx, cy, r, endAngle);
        const largeArc = sweep > 180 ? 1 : 0;

        const path = `M ${cx} ${cy} L ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 1 ${end.x} ${end.y} Z`;

        const midAngle = startAngle + sweep / 2;
        const labelPos = polarToCartesian(cx, cy, r * 0.62, midAngle);
        const showLabel = c.percent >= 6; // avoid cramming text into tiny slices

        return (
          <g key={c.name}>
            <path d={path} fill={c.color} stroke="#ffffff" strokeWidth="2" />
            {showLabel && (
              <text
                x={labelPos.x}
                y={labelPos.y}
                textAnchor="middle"
                dominantBaseline="middle"
                fill="#ffffff"
                fontSize="15"
                fontWeight="700"
              >
                {c.percent}%
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}

function CategoryBreakdownPage({ onNavigate }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dateRange, setDateRange] = useState("This Month");
  const [sortField, setSortField] = useState(null); // null = original mockup order
  const [sortDirection, setSortDirection] = useState("desc");

  const categories = useMemo(() => {
    const totalAmount = Object.values(MOCK_CATEGORY_DATA).reduce((sum, c) => sum + c.amount, 0);

    return CATEGORY_META.map((meta) => {
      const data = MOCK_CATEGORY_DATA[meta.name];
      return {
        ...meta,
        amount: data.amount,
        transactionCount: data.transactionCount,
        percent: Math.round((data.amount / totalAmount) * 100),
      };
    });
  }, []);

  const totalExpenses = categories.reduce((sum, c) => sum + c.amount, 0);
  const maxPercent = Math.max(...categories.map((c) => c.percent));
  const topCategory = categories.reduce((top, c) => (c.amount > top.amount ? c : top), categories[0]);

  const sortedCategories = useMemo(() => {
    if (!sortField) return categories;
    const sorted = [...categories].sort((a, b) => {
      const diff = sortField === "category" ? a.name.localeCompare(b.name) : a.amount - b.amount;
      return sortDirection === "asc" ? diff : -diff;
    });
    return sorted;
  }, [categories, sortField, sortDirection]);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection(field === "category" ? "asc" : "desc");
    }
  };

  const SortIcon = ({ field }) => {
    if (sortField !== field) return <ArrowUpDown size={13} className="sort-icon-idle" />;
    return sortDirection === "asc" ? <ChevronUp size={14} /> : <ChevronDown size={14} />;
  };

  return (
    <div className="bsp-app">
      <style>{SHELL_STYLES}</style>

      <BudgetSidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        activeId="category-breakdown"
        onNavigate={onNavigate}
      />

      <main className="bsp-main">
        <TopNavigation
          title="Category Breakdown"
          userInitials="NA"
          onSettingsClick={() => onNavigate && onNavigate("settings")}
        />

        <button
          type="button"
          className="bsp-menu-btn cbp-mobile-menu"
          onClick={() => setSidebarOpen(true)}
          aria-label="Open menu"
        >
          <Menu size={20} />
        </button>

        <div className="category-page">

          {/* ================= PAGE HEADING ================= */}
          <section className="category-heading-row">
            <div className="category-heading-text">
              <h1>Category Breakdown</h1>
              <p>See where your money is going by category.</p>
            </div>

            <div className="category-heading-actions">
              <div className="date-range-picker">
                <Calendar size={16} />
                <select value={dateRange} onChange={(e) => setDateRange(e.target.value)}>
                  {DATE_RANGES.map((r) => <option key={r} value={r}>{r}</option>)}
                </select>
                <ChevronDown size={15} />
              </div>
            </div>
          </section>

          {/* ================= PIE CHART + LEGEND CARD ================= */}
          <section className="category-card chart-card">

            <div className="chart-card-total">
              <span className="total-label">Total Expenses</span>
              <span className="total-value">{formatPKR(totalExpenses)}</span>
              <span className="total-change">
                <TrendingDown size={13} />
                {Math.abs(PREVIOUS_PERIOD_CHANGE_PCT)}% from {PREVIOUS_PERIOD_LABEL}
              </span>
            </div>

            <div className="chart-card-pie">
              <PieChart categories={categories} />
            </div>

            <div className="chart-card-legend">
              <ul className="category-legend">
                {categories.map((c) => (
                  <li key={c.name} className="category-legend-row">
                    <span className="legend-dot" style={{ background: c.color }} />
                    <span className="legend-name">{c.name}</span>
                    <span className="legend-amount">{formatPKR(c.amount)}</span>
                    <span className="legend-pct">{c.percent}%</span>
                  </li>
                ))}
              </ul>

              <div className="category-insight">
                <span className="insight-icon">
                  <Lightbulb size={16} />
                </span>
                <div>
                  <p className="insight-title">{topCategory.name} is your top spending category</p>
                  <p className="insight-subtitle">Try setting a monthly budget to save more!</p>
                </div>
              </div>
            </div>

          </section>

          {/* ================= CATEGORY DETAILS TABLE ================= */}
          <section className="category-card">

            <div className="category-card-header">
              <h2>
                <FileText size={19} />
                Category Details
              </h2>
              <button type="button" className="export-btn">
                <Download size={16} />
                Export
              </button>
            </div>

            <div className="category-table-wrap">
              <table className="category-table">
                <thead>
                  <tr>
                    <th className="index-col">#</th>
                    <th className="sortable" onClick={() => handleSort("category")}>
                      <span>Category <SortIcon field="category" /></span>
                    </th>
                    <th className="sortable" onClick={() => handleSort("amount")}>
                      <span>Amount <SortIcon field="amount" /></span>
                    </th>
                    <th>Percentage</th>
                    <th className="transactions-col">Transactions</th>
                  </tr>
                </thead>

                <tbody>
                  {sortedCategories.map((c, idx) => {
                    const Icon = c.icon;
                    return (
                      <tr key={c.name}>
                        <td className="index-col">{idx + 1}</td>
                        <td>
                          <div className="category-cell">
                            <span
                              className="category-icon-box"
                              style={{ background: `${c.color}1A`, color: c.color }}
                            >
                              <Icon size={16} />
                            </span>
                            {c.name}
                          </div>
                        </td>
                        <td className="amount-col">{formatPKR(c.amount)}</td>
                        <td>
                          <div className="percentage-cell">
                            <span className="percentage-value">{c.percent}%</span>
                            <div className="percentage-track">
                              <div
                                className="percentage-fill"
                                style={{ width: `${(c.percent / maxPercent) * 100}%`, background: c.color }}
                              />
                            </div>
                          </div>
                        </td>
                        <td className="transactions-col">{c.transactionCount}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <p className="category-table-footer">
              Showing 1 to {categories.length} of {categories.length} categories
            </p>

          </section>

        </div>
      </main>
    </div>
  );
}

export default CategoryBreakdownPage;
