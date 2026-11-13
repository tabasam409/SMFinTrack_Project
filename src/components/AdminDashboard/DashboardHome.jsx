import { useState, useEffect, useMemo, useCallback } from "react";

import TrafficChart from "./TrafficChart";
import Card from "../Card";
import Button from "../Button";
import Input from "../Input";
import { DASHBOARD_STATS_SHAPE } from "./mockDashboardStats";

import {
  Users,
  CreditCard,
  UserPlus,
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight,
  Menu,
  AlertTriangle,
  ArrowRight,
  ExternalLink,
  LayoutGrid,
} from "lucide-react";

/* -------------------------------------------------------------------------
 * SM Digital — Dashboard Home
 * -----------------------------------------------------------------------
 * Data contract: GET /api/admin/dashboard-stats
 * See `DASHBOARD_STATS_SHAPE` in ./mockDashboardStats.js — hand that shape
 * directly to the backend engineer (Husnain).
 * ---------------------------------------------------------------------- */

const ENDPOINT = "https://unthematic-ta-soaringly.ngrok-free.dev/api/admin/dashboard-stats";

// Flip to false once the real endpoint is live. Loading / error / retry /
// rendering already work against a real fetch — this only swaps the source.
const USE_MOCK_DATA = true;

function formatNumber(value) {
  return new Intl.NumberFormat("en-US").format(value);
}

async function fetchDashboardStats(signal) {
  if (USE_MOCK_DATA) {
    await new Promise((resolve) => setTimeout(resolve, 800));
    if (Math.random() < 0.02) throw new Error("Simulated network failure.");
    return DASHBOARD_STATS_SHAPE;
  }
  const res = await fetch(ENDPOINT, { signal, headers: { Accept: "application/json" } });
  if (!res.ok) throw new Error(`Request failed with status ${res.status}`);
  return res.json();
}

/* ------------------------------- Rank badge ------------------------------- */

function RankBadge({ rank }) {
  const styles = ["gold", "silver", "bronze"];
  const style = styles[rank] || "plain";
  return <span className={`admin-rank-badge admin-rank-${style}`}>#{rank + 1}</span>;
}

/* ---------------------------- Management card ---------------------------- */

function ManagementCard({ icon: Icon, title, description, cta, variant, onClick }) {
  return (
    <div className="admin-management-card">
      <div className="admin-management-icon">
        <Icon size={20} strokeWidth={1.9} />
      </div>
      <h3>{title}</h3>
      <p>{description}</p>
      <Button
        variant={variant}
        size="medium"
        iconRight={<ArrowRight size={15} />}
        onClick={onClick}
      >
        {cta}
      </Button>
    </div>
  );
}

/* ------------------------------- Skeletons -------------------------------- */

function MetricSkeleton() {
  return (
    <div className="admin-skeleton admin-skeleton-card">
      <div className="shimmer-line w-40 h-10" />
      <div className="shimmer-line w-70 h-24" />
      <div className="shimmer-line w-50 h-10" />
    </div>
  );
}

function ChartSkeleton() {
  return (
    <div className="admin-skeleton admin-skeleton-chart">
      <div className="shimmer-line w-30 h-12" />
      <div className="shimmer-block" />
    </div>
  );
}

function TableSkeleton() {
  return (
    <div className="admin-skeleton admin-skeleton-table">
      <div className="shimmer-line w-30 h-12" />
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="shimmer-line w-100 h-16" />
      ))}
    </div>
  );
}

/* --------------------------------- Root ------------------------------------ */

function DashboardHome({ onNavigate = () => {}, onOpenMenu = () => {} }) {
  const [stats, setStats] = useState(null);
  const [status, setStatus] = useState("loading"); // loading | success | error
  const [errorMessage, setErrorMessage] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState("");
  const [query, setQuery] = useState("");

  const load = useCallback(async ({ isRefresh = false, signal } = {}) => {
    if (isRefresh) setRefreshing(true);
    else setStatus("loading");

    try {
      const data = await fetchDashboardStats(signal);
      setStats(data);
      setStatus("success");
      setLastUpdated(
        new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })
      );
    } catch (err) {
      if (err.name === "AbortError") return;
      setErrorMessage(err.message || "Something went wrong while fetching platform stats.");
      setStatus("error");
    } finally {
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    // Intentional: fetch dashboard stats on mount and sync the result into
    // state, aborting the request if the component unmounts first.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load({ signal: controller.signal });
    return () => controller.abort();
  }, [load]);

  const filteredCategories = useMemo(() => {
    if (!stats) return [];
    const q = query.trim().toLowerCase();
    if (!q) return stats.popularCategories;
    return stats.popularCategories.filter((c) => c.name.toLowerCase().includes(q));
  }, [stats, query]);

  const maxTransactions = useMemo(() => {
    if (!stats) return 1;
    return Math.max(...stats.popularCategories.map((c) => c.transactionCount), 1);
  }, [stats]);

  const handleRefresh = () => {
    if (refreshing) return;
    load({ isRefresh: true });
  };

  return (
    <>
      {/* ================= Header ================= */}

      <header className="admin-header">
        <div className="admin-header-left">
          <button
            className="admin-menu-btn"
            onClick={onOpenMenu}
            aria-label="Open menu"
          >
            <Menu size={20} />
          </button>
          <div>
            <p className="admin-header-eyebrow">Overview</p>
            <h1 className="admin-header-title">Platform Stats</h1>
          </div>
        </div>

        <div className="admin-header-right">
          {lastUpdated && (
            <span className="admin-last-updated">Last updated {lastUpdated}</span>
          )}
          <Button
            variant="secondary"
            size="medium"
            iconLeft={<RefreshCw size={15} />}
            loading={refreshing}
            onClick={handleRefresh}
          >
            Sync
          </Button>
        </div>
      </header>

      {/* ================= Error ================= */}

      {status === "error" && (
        <div className="admin-error-box">
          <div className="admin-error-icon">
            <AlertTriangle size={20} strokeWidth={1.8} />
          </div>
          <h3>Couldn't load dashboard stats</h3>
          <p>{errorMessage}</p>
          <Button variant="danger" size="medium" onClick={() => load()}>
            Retry connection
          </Button>
        </div>
      )}

      {status !== "error" && (
        <>
          {/* ================= KPI cards ================= */}

          <div className="admin-kpi-grid">
            {status === "loading" ? (
              <>
                <MetricSkeleton />
                <MetricSkeleton />
                <MetricSkeleton />
              </>
            ) : (
              <>
                <Card
                  variant="budget"
                  icon={<Users size={18} />}
                  title="Total Users"
                  subtitle="Registered accounts, all-time"
                  amount={formatNumber(stats.metrics.totalUsers.value)}
                  trend={stats.metrics.totalUsers.badge.value}
                  trendIcon={<ArrowUpRight size={14} />}
                />
                <Card
                  variant="growth"
                  icon={<CreditCard size={18} />}
                  title="Total Transactions"
                  subtitle="Parsed across all statements"
                  amount={formatNumber(stats.metrics.totalTransactions.value)}
                  trend={stats.metrics.totalTransactions.badge.value}
                  trendIcon={<ArrowUpRight size={14} />}
                />
                <Card
                  variant="subscription"
                  icon={<UserPlus size={18} />}
                  title="Signups This Week"
                  subtitle="New accounts, last 7 days"
                  amount={formatNumber(stats.metrics.signupsThisWeek.value)}
                  trend={stats.metrics.signupsThisWeek.badge.value}
                  trendIcon={<ArrowDownRight size={14} />}
                  className="trend-negative"
                />
              </>
            )}
          </div>

          {/* ================= Traffic chart ================= */}

          <div className="admin-panel admin-chart-panel">
            {status === "loading" ? (
              <ChartSkeleton />
            ) : (
              <>
                <div className="admin-panel-header">
                  <div>
                    <h2>Platform Traffic</h2>
                    <p>Requests served, trailing 7 days</p>
                  </div>
                  <span className="admin-live-pill">
                    <span className="admin-live-dot" />
                    Live
                  </span>
                </div>
                <TrafficChart data={stats.trafficHistory} />
              </>
            )}
          </div>

          {/* ================= Table (full width) ================= */}

          <div className="admin-panel admin-table-panel">
              {status === "loading" ? (
                <TableSkeleton />
              ) : (
                <>
                  <div className="admin-panel-header">
                    <div>
                      <h2>Popular Categories</h2>
                      <p>Ranked by total transactions categorised</p>
                    </div>
                    <Input
                      icon="search"
                      placeholder="Filter categories…"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      className="admin-table-search"
                    />
                  </div>

                  <div className="admin-table-scroll">
                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th>Rank</th>
                          <th>Category</th>
                          <th>Mapped rules</th>
                          <th>Share of transactions</th>
                          <th className="admin-table-action-col">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredCategories.map((category) => {
                          const originalRank = stats.popularCategories.findIndex(
                            (c) => c.id === category.id
                          );
                          const percentage = Math.round(
                            (category.transactionCount / maxTransactions) * 100
                          );
                          return (
                            <tr key={category.id}>
                              <td>
                                <RankBadge rank={originalRank} />
                              </td>
                              <td>
                                <div className="admin-table-category">
                                  <span
                                    className="admin-category-dot"
                                    style={{ background: category.color }}
                                  >
                                    {category.name.charAt(0)}
                                  </span>
                                  {category.name}
                                </div>
                              </td>
                              <td className="admin-table-muted">
                                {formatNumber(category.ruleCount)} rules
                              </td>
                              <td>
                                <div className="admin-progress-cell">
                                  <div className="admin-progress-track">
                                    <div
                                      className="admin-progress-fill"
                                      style={{
                                        width: `${percentage}%`,
                                        background: category.color,
                                      }}
                                    />
                                  </div>
                                  <span>{percentage}%</span>
                                </div>
                              </td>
                              <td className="admin-table-action-col">
                                <button
                                  type="button"
                                  className="admin-table-action-link"
                                  onClick={() => onNavigate("categories")}
                                >
                                  Manage <ExternalLink size={12} />
                                </button>
                              </td>
                            </tr>
                          );
                        })}

                        {filteredCategories.length === 0 && (
                          <tr>
                            <td colSpan={5} className="admin-table-empty">
                              No categories match "{query}".
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </div>

            {/* ================= Management cards (below table) ================= */}

            <div className="admin-management-grid">
              <ManagementCard
                icon={Users}
                title="Manage Users"
                description="View, block, or edit registered accounts across the platform."
                cta="Go to Users"
                variant="primary"
                onClick={() => onNavigate("users")}
              />
              <ManagementCard
                icon={LayoutGrid}
                title="Manage Categories"
                description="Manage category rules used by the auto-categorisation engine, or add new categories."
                cta="Go to Categories"
                variant="secondary"
                onClick={() => onNavigate("categories")}
              />
            </div>
        </>
      )}
    </>
  );
}

export default DashboardHome;
