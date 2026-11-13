import { useState } from "react";
import "./AdminDashboard.css";

import { useNavigate } from "react-router-dom";

import AdminSidebar from "./AdminSidebar";
import TopNavigation from "../TopNavigation/TopNavigation";
import DashboardHome from "./DashboardHome";
import UserManagementPage from "./UserManagementPage";
import CategoryManagementPage from "./CategoryManagementPage";

/* -------------------------------------------------------------------------
 * SMFinTrack — Admin Dashboard shell
 * -----------------------------------------------------------------------
 * Holds which admin page is active and renders the sidebar + that page.
 * Sidebar and quick-nav clicks call `navigate(id)` instead of using <a href>,
 * so switching pages doesn't trigger a full reload / 404 against routes
 * that don't exist yet on the server.
 * ---------------------------------------------------------------------- */

function AdminDashboard() {
  const [page, setPage] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const routerNavigate = useNavigate();

  // Same account data LoginPage/SignupForm already save — reused here just
  // for the avatar initial in TopNavigation, same as the user dashboard.
  let firstName = "Admin";
  try {
    const savedUser = JSON.parse(localStorage.getItem("smfintrackUser"));
    if (savedUser?.firstName) firstName = savedUser.firstName;
  } catch {
    // ignore malformed/missing saved user
  }

  const navigate = (id) => {
    setPage(id);
    setSidebarOpen(false);
  };

  const openMenu = () => setSidebarOpen(true);
  const closeMenu = () => setSidebarOpen(false);

  const handleLogout = () => {
    localStorage.removeItem("smfintrackLoggedIn");
    localStorage.removeItem("smfintrackRole");
    routerNavigate("/login", { replace: true });
  };

  const handleBackToDashboard = () => {
    routerNavigate("/dashboard");
  };

  return (
    <div className="admin-dashboard">
      <AdminSidebar
        active={page}
        open={sidebarOpen}
        onClose={closeMenu}
        onNavigate={navigate}
        onLogout={handleLogout}
        onBackToDashboard={handleBackToDashboard}
      />

      <main className="admin-main">
        <TopNavigation
          title="Admin Panel"
          userInitials={firstName.charAt(0)}
          showSettings={false}
        />

        {page === "dashboard" && (
          <DashboardHome onNavigate={navigate} onOpenMenu={openMenu} />
        )}
        {page === "users" && (
          <UserManagementPage onNavigate={navigate} onOpenMenu={openMenu} />
        )}
        {page === "categories" && (
          <CategoryManagementPage onNavigate={navigate} onOpenMenu={openMenu} />
        )}
      </main>
    </div>
  );
}

export default AdminDashboard;
