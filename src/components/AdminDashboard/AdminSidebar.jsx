import "./AdminSidebar.css";

import promoImage from "../../assets/signuppagepic.png";

import {
  LayoutDashboard,
  Users,
  LayoutGrid,
  Layers3,
  LogOut,
  ArrowLeftCircle,
} from "lucide-react";

function AdminSidebar({
  active = "dashboard",
  open = false,
  onClose = () => {},
  onNavigate = () => {},
  onLogout = () => {},
  onBackToDashboard = () => {},
}) {
  const navItems = [
    { id: "dashboard", label: "Dashboard Home", icon: LayoutDashboard },
    { id: "users", label: "User Management", icon: Users },
    { id: "categories", label: "Category Management", icon: LayoutGrid },
  ];

  const handleClick = (id) => {
    onNavigate(id);
    onClose();
  };

  return (
    <>
      <div
        className={`admin-sidebar-backdrop ${open ? "show" : ""}`}
        onClick={onClose}
      />

      <aside className={`admin-sidebar ${open ? "open" : ""}`}>
      {/* ================= Logo ================= */}

      <div className="admin-sidebar-logo">
        <div className="admin-logo-box">
          <Layers3 size={22} strokeWidth={2.3} />
        </div>
        <h2>SMFinTrack</h2>
      </div>

      {/* ================= Nav ================= */}

      <div className="admin-sidebar-section">
        <p className="admin-sidebar-heading">Menu</p>

        <ul>
          {navItems.map((item) => (
            <li
              key={item.id}
              className={active === item.id ? "active" : ""}
            >
              <button type="button" onClick={() => handleClick(item.id)}>
                <item.icon size={18} />
                <span>{item.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* ================= Promo image ================= */}

      <div className="admin-sidebar-promo">
        <div className="admin-sidebar-promo-image-wrapper">
          <img
            src={promoImage}
            alt="SMFinTrack financial overview"
            className="admin-sidebar-promo-image"
          />
        </div>
        <div className="admin-sidebar-promo-content">
          <h3>Track. Plan. Grow.</h3>
          <p>Take control of your finances and build a better tomorrow.</p>
        </div>
      </div>

      {/* ================= Back to user dashboard ================= */}

      <button
        type="button"
        className="admin-sidebar-logout"
        onClick={onBackToDashboard}
      >
        <ArrowLeftCircle size={18} />
        <span>Back to My Dashboard</span>
      </button>

      {/* ================= Logout ================= */}

      <button
        type="button"
        className="admin-sidebar-logout"
        onClick={onLogout}
      >
        <LogOut size={18} />
        <span>Log out</span>
      </button>
      </aside>
    </>
  );
}

export default AdminSidebar;
