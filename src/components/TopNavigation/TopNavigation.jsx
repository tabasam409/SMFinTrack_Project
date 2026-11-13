import "./TopNavigation.css";
import { Settings } from "lucide-react";
import NotificationCenter from "../NotificationCenter/NotificationCenter";

/* =========================================================================
   SMFinTrack — Top Navigation
   -------------------------------------------------------------------------
   Standalone top bar: title on the left, notification bell / settings /
   avatar on the right. Not wired into any page — drop <TopNavigation />
   at the top of whichever page/layout needs it.

   Props:
     title           - text shown on the left (default: "Assigned tasks")
     onSettingsClick - handler for the settings button
     userInitials    - text shown inside the avatar circle (default: "NA")
   ========================================================================= */

function TopNavigation({
  title = "Assigned tasks",
  onSettingsClick = () => {},
  userInitials = "NA",
  showSettings = true,
}) {
  return (
    <header className="top-nav">
      <div className="top-nav-left">
        <h1 className="top-nav-title">{title}</h1>
      </div>

      <div className="top-nav-right">
        <NotificationCenter />

        {showSettings && (
          <button className="top-nav-icon-btn" onClick={onSettingsClick} aria-label="Settings">
            <Settings size={18} />
          </button>
        )}

        <div className="top-nav-avatar">{userInitials}</div>
      </div>
    </header>
  );
}

export default TopNavigation;
