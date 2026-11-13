import { Settings } from "lucide-react";

import AdminPageHeader from "./AdminPageHeader";

function SettingsPage({ onOpenMenu = () => {} }) {
  return (
    <>
      <AdminPageHeader eyebrow="Admin" title="Settings" onOpenMenu={onOpenMenu} />

      <div className="admin-panel admin-placeholder-panel">
        <div className="admin-placeholder-icon">
          <Settings size={26} strokeWidth={1.8} />
        </div>
        <h2>Settings is coming together</h2>
        <p>
          Platform-wide preferences, admin roles, and API keys will live
          here.
        </p>
      </div>
    </>
  );
}

export default SettingsPage;