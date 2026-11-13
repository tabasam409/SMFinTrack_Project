import { useEffect, useRef, useState } from "react";
import { Bell, Settings, ArrowLeft, Wallet, Info, Check } from "lucide-react";
import * as notificationService from "../../services/notificationService";
import "./NotificationCenter.css";

/* =========================================================================
   SMFinTrack — Notification Center
   -------------------------------------------------------------------------
   Bell icon + unread badge that opens a dropdown with two views:
     "list"     - notifications with category icon, message, relative date
     "settings" - toggles for Budget Alerts / General Notifications

   Talks to notificationService.js instead of calling fetch() directly, so
   the mock data can be swapped for the real API later without touching
   this file.
   ========================================================================= */

function NotificationCenter() {
  const [open, setOpen] = useState(false);
  const [view, setView] = useState("list"); // "list" | "settings"
  const [notifications, setNotifications] = useState([]);
  const [settings, setSettings] = useState({ budgetAlerts: true, generalNotifications: false });
  const [marking, setMarking] = useState(false);
  const rootRef = useRef(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  // Load notifications + settings once on mount
  useEffect(() => {
    notificationService.getNotifications().then(setNotifications);
    notificationService.getSettings().then(setSettings);
  }, []);

  // Close on outside click / Escape
  useEffect(() => {
    if (!open) return;

    function handleClick(e) {
      if (rootRef.current && !rootRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    function handleKey(e) {
      if (e.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, [open]);

  function toggleOpen() {
    setOpen((prev) => {
      const next = !prev;
      if (next) setView("list");
      return next;
    });
  }

  async function handleMarkAllRead() {
    if (marking || unreadCount === 0) return;
    setMarking(true);
    const updated = await notificationService.markAllRead();
    setNotifications(updated);
    setMarking(false);
  }

  async function handleToggleSetting(key) {
    const next = { ...settings, [key]: !settings[key] };
    setSettings(next); // optimistic update
    await notificationService.updateSettings(next);
  }

  return (
    <div className="nc-root" ref={rootRef}>
      <button className={`nc-bell-btn ${open ? "is-active" : ""}`} onClick={toggleOpen} aria-label="Notifications">
        <Bell size={18} />
        {unreadCount > 0 && <span className="nc-badge">{unreadCount}</span>}
      </button>

      {open && (
        <div className="nc-panel" role="dialog" aria-label="Notifications">
          {view === "list" ? (
            <>
              <div className="nc-panel-header">
                <h2 className="nc-panel-title">Notifications</h2>
                <div className="nc-panel-header-actions">
                  <button
                    className="nc-icon-btn"
                    onClick={() => setView("settings")}
                    aria-label="Notification settings"
                  >
                    <Settings size={16} />
                  </button>
                  <button
                    className="nc-markread-btn"
                    onClick={handleMarkAllRead}
                    disabled={unreadCount === 0 || marking}
                  >
                    <Check size={14} />
                    Mark all read
                  </button>
                </div>
              </div>

              <div className="nc-list">
                {notifications.length === 0 && (
                  <p className="nc-empty">You're all caught up.</p>
                )}

                {notifications.map((n) => (
                  <div key={n.id} className={`nc-item ${!n.read ? "is-unread" : ""}`}>
                    <div className={`nc-item-icon nc-item-icon--${n.category}`}>
                      {n.category === "budget" ? <Wallet size={15} /> : <Info size={15} />}
                    </div>
                    <div className="nc-item-body">
                      <p className="nc-item-message">{n.message}</p>
                      <p className="nc-item-date">{n.date}</p>
                    </div>
                    {!n.read && <span className="nc-item-dot" />}
                  </div>
                ))}
              </div>
            </>
          ) : (
            <>
              <div className="nc-panel-header">
                <button className="nc-back-btn" onClick={() => setView("list")} aria-label="Back">
                  <ArrowLeft size={16} />
                  <span>Settings</span>
                </button>
              </div>

              <div className="nc-settings">
                <div className="nc-setting-row">
                  <div>
                    <p className="nc-setting-title">Budget alerts</p>
                    <p className="nc-setting-desc">
                      Get notified when you approach or exceed a category budget.
                    </p>
                  </div>
                  <button
                    className={`nc-toggle ${settings.budgetAlerts ? "is-on" : ""}`}
                    onClick={() => handleToggleSetting("budgetAlerts")}
                    role="switch"
                    aria-checked={settings.budgetAlerts}
                    aria-label="Toggle budget alerts"
                  >
                    <span className="nc-toggle-knob" />
                  </button>
                </div>

                <div className="nc-setting-row">
                  <div>
                    <p className="nc-setting-title">General notifications</p>
                    <p className="nc-setting-desc">
                      Product updates, statement processing, and account activity.
                    </p>
                  </div>
                  <button
                    className={`nc-toggle ${settings.generalNotifications ? "is-on" : ""}`}
                    onClick={() => handleToggleSetting("generalNotifications")}
                    role="switch"
                    aria-checked={settings.generalNotifications}
                    aria-label="Toggle general notifications"
                  >
                    <span className="nc-toggle-knob" />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default NotificationCenter;
