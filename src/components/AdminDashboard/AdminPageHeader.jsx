import { Menu } from "lucide-react";

function AdminPageHeader({ eyebrow, title, onOpenMenu, right = null }) {
  return (
    <header className="admin-header">
      <div className="admin-header-left">
        <button className="admin-menu-btn" onClick={onOpenMenu} aria-label="Open menu">
          <Menu size={20} />
        </button>
        <div>
          <p className="admin-header-eyebrow">{eyebrow}</p>
          <h1 className="admin-header-title">{title}</h1>
        </div>
      </div>

      {right && <div className="admin-header-right">{right}</div>}
    </header>
  );
}

export default AdminPageHeader;
