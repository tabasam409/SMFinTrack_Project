import { useState } from "react";
import { useNavigate } from "react-router-dom";

import BudgetSetupPage from "../BudgetSetupPage/BudgetSetupPage";
import DashboardPage from "../DashboardPage/DashboardPage";
import TransactionsPage from "../TransactionsPage/TransactionsPage";
import BudgetTrackingPage from "../BudgetTracking/BudgetTrackingPage";
import SubscriptionsPage from "../Subscriptions/SubscriptionsPage";
import ForecastPage from "../Forecast/ForecastPage";
import HealthScorePage from "../HealthScore/HealthScorePage";
import ReportsPage from "../Reports/ReportsPage";
import SettingsPage from "../Settings/SettingsPage";
import CategoryBreakdownPage from "../CategoryBreakdown/CategoryBreakdownPage";
import ProfilePage from "../Profile/ProfilePage";

/* -------------------------------------------------------------------------
 * User-facing finance area (T4-9 pages), mounted under the /dashboard
 * route of the merged app. Internal navigation between these pages uses
 * the original onNavigate(pageName) pattern — only the entry point (login)
 * and the exit point (logout) go through react-router.
 * ---------------------------------------------------------------------- */
function FinanceApp() {
  const [page, setPage] = useState("dashboard");
  const routerNavigate = useNavigate();

  // Pages call onNavigate("logout") to leave the finance area entirely,
  // or onNavigate("admin-panel") to jump to /admin (only shown to
  // accounts that logged in with the admin role).
  const navigate = (target) => {
    if (target === "logout") {
      localStorage.removeItem("smfintrackLoggedIn");
      localStorage.removeItem("smfintrackRole");
      routerNavigate("/login", { replace: true });
      return;
    }
    if (target === "admin-panel") {
      routerNavigate("/admin");
      return;
    }
    setPage(target);
  };

  if (page === "budgets") return <BudgetSetupPage onNavigate={navigate} />;
  if (page === "transactions") return <TransactionsPage onNavigate={navigate} />;
  if (page === "budget-tracking") return <BudgetTrackingPage onNavigate={navigate} />;
  if (page === "subscriptions") return <SubscriptionsPage onNavigate={navigate} />;
  if (page === "forecast") return <ForecastPage onNavigate={navigate} />;
  if (page === "health-score") return <HealthScorePage onNavigate={navigate} />;
  if (page === "reports") return <ReportsPage onNavigate={navigate} />;
  if (page === "category-breakdown") return <CategoryBreakdownPage onNavigate={navigate} />;
  if (page === "profile") return <ProfilePage onNavigate={navigate} />;
  if (page === "settings") return <SettingsPage onNavigate={navigate} />;
  return <DashboardPage onNavigate={navigate} />;
}

export default FinanceApp;
