import { useEffect, useRef, useState } from "react";
import {
  Menu,
  User,
  Lock,
  Bell,
  Mail,
  GraduationCap,
  Wallet,
  Eye,
  EyeOff,
  Check,
  ChevronDown,
  Loader2,
  Pencil,
  ShieldAlert,
  ShieldCheck,
  Laptop,
  Smartphone,
  LogOut,
  Upload,
  Sparkles,
  TrendingUp,
  CreditCard,
  Target,
  Gift,
} from "lucide-react";

import { BudgetSidebar, SHELL_STYLES, STYLES as BSP_STYLES } from "../BudgetSetupPage/BudgetSetupPage";
import TopNavigation from "../TopNavigation/TopNavigation";

/* =========================================================================
   SMFinTrack — Settings Page
   Same sidebar/header shell as the rest of the app (bsp-* classes,
   SHELL_STYLES imported directly). Point SETTINGS_API_URL at the real
   settings endpoint when it's live — real fetch() first, mock resolve
   as a fallback while the backend doesn't exist yet, same pattern used
   across BudgetTrackingPage / ForecastPage.

   Layout: two-pane settings shell (stg-tabs-nav + stg-panel-area) with
   a fade-in transition between tabs on desktop; stacks into a horizontal
   scroll tab bar on narrow screens. Emergency Freeze banner sits above
   the tabs and applies read-only mode to every card via `disabled`.

   Tokens: Primary #004C48  Accent #2FA8A0  Success #22C55E
   Danger #EF4444  Warning #F59E0B  Background #F7F9FB
   ========================================================================= */

const SETTINGS_API_URL = "https://example.com/api/settings";

async function saveSettings(payload) {
  try {
    const res = await fetch(SETTINGS_API_URL, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error("API rejected request");
    return true;
  } catch {
    // Backend not live yet / unreachable — resolve after a short delay
    // so the page still behaves realistically during local development.
    return new Promise((resolve) => setTimeout(() => resolve(true), 700));
  }
}

const PASSWORD_PILLS = [
  { key: "len", label: "8+ Chars", test: (pw) => pw.length >= 8 },
  { key: "num", label: "1 Number", test: (pw) => /\d/.test(pw) },
  { key: "upper", label: "1 Uppercase", test: (pw) => /[A-Z]/.test(pw) },
  { key: "symbol", label: "1 Symbol", test: (pw) => /[^A-Za-z0-9]/.test(pw) },
];

const TABS = [
  { id: "general", label: "General", icon: User },
  { id: "security", label: "Security", icon: Lock },
  { id: "notifications", label: "Notifications", icon: Bell },
];

const FREQUENCY_OPTIONS = [
  { id: "off", label: "Off" },
  { id: "instant", label: "Instantly" },
  { id: "daily", label: "Daily Digest" },
  { id: "weekly", label: "Weekly Summary" },
];

/* Per-type alert preferences. Budget warnings aren't in this list on
   purpose — they're controlled by the frequency + threshold block above,
   which is finer-grained than a plain on/off switch would be. */
const NOTIFICATION_CATEGORIES = [
  {
    id: "forecastRisks",
    title: "Forecast Risks",
    description: "Warn me when projected spending is heading over budget.",
    icon: TrendingUp,
    bg: "#FFF1E0",
    color: "#D97706",
    defaultOn: true,
  },
  {
    id: "subscriptionReminders",
    title: "Subscription Reminders",
    description: "Remind me before a recurring subscription renews.",
    icon: Bell,
    bg: "#E3F7F1",
    color: "#0E8C74",
    defaultOn: true,
  },
  {
    id: "transactionAlerts",
    title: "Transaction Alerts",
    description: "Notify me about large or unusual transaction activity.",
    icon: CreditCard,
    bg: "#EDEBFB",
    color: "#6A4FD0",
    defaultOn: true,
  },
  {
    id: "goalUpdates",
    title: "Goal Updates",
    description: "Send progress updates on my savings goals.",
    icon: Target,
    bg: "#E3F7EC",
    color: "#16A34A",
    defaultOn: true,
  },
  {
    id: "newFeatures",
    title: "New Features & Tips",
    description: "Product news, tips, and occasional feature announcements.",
    icon: Gift,
    bg: "#FCEAF3",
    color: "#DB2777",
    defaultOn: false,
  },
];

const DEFAULT_CATEGORY_PREFS = Object.fromEntries(
  NOTIFICATION_CATEGORIES.map((c) => [c.id, c.defaultOn])
);

const INITIAL_DEVICES = [
  { id: 1, name: "Chrome on Windows", location: "Rawalpindi, Pakistan", lastActive: "Active now", current: true, type: "laptop" },
  { id: 2, name: "Safari on iPhone 14", location: "Islamabad, Pakistan", lastActive: "2 hours ago", current: false, type: "mobile" },
  { id: 3, name: "Chrome on Android", location: "Lahore, Pakistan", lastActive: "Yesterday", current: false, type: "mobile" },
];

const LAST_MONTH_SPEND = 27450;

const fmtPKR = (n) => `Rs. ${Math.round(n || 0).toLocaleString("en-US")}`;

export default function SettingsPage({ onNavigate }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const toastTimer = useRef(null);

  const [activeTab, setActiveTab] = useState("general");
  const [frozen, setFrozen] = useState(false);
  const [freezeConfirming, setFreezeConfirming] = useState(false);
  const [freezeBusy, setFreezeBusy] = useState(false);

  // Profile state lives here so Auto-Budget Calibration and Student
  // Verification can read/write the same values the Profile card shows.
  const [profile, setProfile] = useState({
    name: "Ayesha Khan",
    email: "ayesha.khan@student.edu.pk",
    university: "LUMS",
    monthlyIncome: "30000",
  });
  const [fieldStatus, setFieldStatus] = useState({});

  const showToast = (msg) => {
    setToast(msg);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2200);
  };

  const commitField = async (field, value) => {
    setProfile((p) => ({ ...p, [field]: value }));
    setFieldStatus((s) => ({ ...s, [field]: "saving" }));
    const ok = await saveSettings({ type: "profile", field, value });
    setFieldStatus((s) => ({ ...s, [field]: ok ? "saved" : "error" }));
    if (ok) showToast("Settings updated successfully");
    else showToast(`Couldn't save ${field}. Try again.`);
    setTimeout(() => setFieldStatus((s) => ({ ...s, [field]: "idle" })), 1800);
  };

  const handleFreezeConfirm = async () => {
    setFreezeBusy(true);
    const ok = await saveSettings({ type: "account-freeze", frozen: true });
    setFreezeBusy(false);
    setFreezeConfirming(false);
    if (ok) {
      setFrozen(true);
      showToast("Account frozen — settings are now read-only");
    } else {
      showToast("Couldn't freeze account. Try again.");
    }
  };

  const handleUnfreeze = async () => {
    setFreezeBusy(true);
    const ok = await saveSettings({ type: "account-freeze", frozen: false });
    setFreezeBusy(false);
    if (ok) {
      setFrozen(false);
      showToast("Account unfrozen — you can make changes again");
    } else {
      showToast("Couldn't unfreeze account. Try again.");
    }
  };

  return (
    <div className="bsp-app">
      <style>{SHELL_STYLES + BSP_STYLES + STG_STYLES}</style>

      <BudgetSidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        activeId="settings"
        onNavigate={onNavigate}
      />

      <main className="bsp-main">
        <TopNavigation title="Settings" userInitials="NA" onSettingsClick={() => {}} />

        <header className="bsp-header">
          <div className="bsp-header-left">
            <button className="bsp-menu-btn" onClick={() => setSidebarOpen(true)} aria-label="Open menu">
              <Menu size={20} />
            </button>
            <div>
              <p className="bsp-header-eyebrow">Account</p>
              <h1 className="bsp-header-title">Settings</h1>
            </div>
          </div>
        </header>

        <FreezeBanner
          frozen={frozen}
          confirming={freezeConfirming}
          busy={freezeBusy}
          onAskFreeze={() => setFreezeConfirming(true)}
          onCancel={() => setFreezeConfirming(false)}
          onConfirm={handleFreezeConfirm}
          onUnfreeze={handleUnfreeze}
        />

        <div className="stg-shell">
          <nav className="stg-tabs-nav">
            {TABS.map((t) => {
              const TabIcon = t.icon;
              return (
                <button
                  key={t.id}
                  type="button"
                  className={`stg-tab ${activeTab === t.id ? "active" : ""}`}
                  onClick={() => setActiveTab(t.id)}
                >
                  <TabIcon size={16} />
                  <span>{t.label}</span>
                </button>
              );
            })}
          </nav>

          <div className="stg-panel-area">
            <div key={activeTab} className="stg-fade-in">
              {activeTab === "general" && (
                <>
                  <ProfileCard profile={profile} fieldStatus={fieldStatus} onCommit={commitField} disabled={frozen} />
                  <AutoBudgetCard
                    monthlyIncome={profile.monthlyIncome}
                    onApply={(v) => commitField("monthlyIncome", v)}
                    disabled={frozen}
                  />
                  <StudentVerificationCard university={profile.university} disabled={frozen} showToast={showToast} />
                </>
              )}

              {activeTab === "security" && (
                <>
                  <PasswordCard showToast={showToast} disabled={frozen} />
                  <SessionsCard showToast={showToast} disabled={frozen} />
                </>
              )}

              {activeTab === "notifications" && <NotificationsCard showToast={showToast} disabled={frozen} />}
            </div>
          </div>
        </div>

        <div className={`bt-toast${toast ? " show" : ""}`}>{toast}</div>
      </main>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Emergency Freeze Switch                                             */
/* ------------------------------------------------------------------ */
function FreezeBanner({ frozen, confirming, busy, onAskFreeze, onCancel, onConfirm, onUnfreeze }) {
  return (
    <div className={`stg-freeze-banner${frozen ? " active" : ""}`}>
      <div className="stg-freeze-left">
        <div className="stg-freeze-icon">
          {frozen ? <ShieldAlert size={18} /> : <ShieldCheck size={18} />}
        </div>
        <div>
          <p className="stg-freeze-title">{frozen ? "Account Frozen" : "Emergency Freeze"}</p>
          <p className="stg-freeze-desc">
            {frozen
              ? "All settings are read-only right now. Unfreeze to make changes again."
              : confirming
              ? "This makes every setting read-only until you unfreeze — use it if you think your account is compromised."
              : "Think your account may be compromised? Freeze all settings instantly."}
          </p>
        </div>
      </div>

      <div className="stg-freeze-actions">
        {frozen ? (
          <button type="button" className="stg-btn-dark" onClick={onUnfreeze} disabled={busy}>
            {busy && <Loader2 size={14} className="rp-spin" />}
            {busy ? "Unfreezing…" : "Unfreeze account"}
          </button>
        ) : confirming ? (
          <>
            <button type="button" className="stg-btn-ghost" onClick={onCancel} disabled={busy}>
              Cancel
            </button>
            <button type="button" className="stg-btn-danger-solid" onClick={onConfirm} disabled={busy}>
              {busy && <Loader2 size={14} className="rp-spin" />}
              {busy ? "Freezing…" : "Confirm freeze"}
            </button>
          </>
        ) : (
          <button type="button" className="stg-btn-danger-outline" onClick={onAskFreeze}>
            Freeze account
          </button>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Save-on-blur inline field                                           */
/* ------------------------------------------------------------------ */
function InlineField({ label, icon: Icon, value, status = "idle", onCommit, disabled, inputMode, error }) {
  const [draft, setDraft] = useState(value);

  useEffect(() => {
    setDraft(value);
  }, [value]);

  const handleBlur = () => {
    if (disabled) return;
    if (draft.trim() !== "" && draft !== value) onCommit(draft);
    else setDraft(value);
  };

  return (
    <label className="stg-field">
      <span className="stg-field-label">{label}</span>
      <div className="stg-input-icon-wrap">
        {Icon && <Icon size={14} className="stg-input-icon" />}
        <input
          className={`stg-input ${Icon ? "with-icon" : ""} with-status`}
          value={draft}
          inputMode={inputMode}
          disabled={disabled}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={handleBlur}
        />
        <span className={`stg-inline-status ${status}`}>
          {status === "saving" && <Loader2 size={13} className="rp-spin" />}
          {status === "saved" && <Check size={13} strokeWidth={3} />}
          {status === "idle" && <Pencil size={12} />}
        </span>
      </div>
      {error && <span className="stg-field-error">{error}</span>}
    </label>
  );
}

function ProfileCard({ profile, fieldStatus, onCommit, disabled }) {
  const initials = profile.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase() || "U";

  const commitName = (v) => onCommit("name", v);
  const commitEmail = (v) => {
    if (!/^\S+@\S+\.\S+$/.test(v)) return;
    onCommit("email", v);
  };
  const commitUniversity = (v) => onCommit("university", v);
  const commitIncome = (v) => {
    if (!/^\d+$/.test(v)) return;
    onCommit("monthlyIncome", v);
  };

  return (
    <div className="bsp-panel">
      <h2 className="stg-section-title"><User size={16} color="#2FA8A0" /> Profile</h2>
      <p className="stg-section-hint">Changes save automatically the moment you click out of a field.</p>

      <div className="stg-avatar-row">
        <div className="stg-avatar">{initials}</div>
        <div>
          <p className="stg-avatar-name">{profile.name || "Your name"}</p>
          <p className="stg-avatar-sub">{profile.university || "University not set"}</p>
        </div>
      </div>

      <div className="stg-grid-2">
        <InlineField label="Name" value={profile.name} status={fieldStatus.name} onCommit={commitName} disabled={disabled} />
        <InlineField
          label="Email"
          icon={Mail}
          value={profile.email}
          status={fieldStatus.email}
          onCommit={commitEmail}
          disabled={disabled}
        />
        <InlineField
          label="University"
          icon={GraduationCap}
          value={profile.university}
          status={fieldStatus.university}
          onCommit={commitUniversity}
          disabled={disabled}
        />
        <InlineField
          label="Monthly income (PKR)"
          icon={Wallet}
          value={profile.monthlyIncome}
          status={fieldStatus.monthlyIncome}
          onCommit={commitIncome}
          disabled={disabled}
          inputMode="numeric"
        />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Auto-Budget Calibration                                             */
/* ------------------------------------------------------------------ */
function AutoBudgetCard({ monthlyIncome, onApply, disabled }) {
  const [enabled, setEnabled] = useState(false);
  const [calibrating, setCalibrating] = useState(false);
  const [applied, setApplied] = useState(false);

  const suggestedBudget = Math.ceil((LAST_MONTH_SPEND * 1.08) / 500) * 500;

  const handleToggle = async (v) => {
    if (disabled) return;
    if (!v) {
      setEnabled(false);
      setApplied(false);
      return;
    }
    setCalibrating(true);
    await saveSettings({ type: "auto-budget-calibration", enabled: true });
    setCalibrating(false);
    setEnabled(true);
  };

  const handleApply = () => {
    onApply(String(suggestedBudget));
    setApplied(true);
  };

  return (
    <div className="bsp-panel">
      <h2 className="stg-section-title"><Sparkles size={16} color="#2FA8A0" /> Auto-Budget Calibration</h2>

      <Toggle
        checked={enabled}
        onChange={handleToggle}
        disabled={disabled || calibrating}
        label={calibrating ? "Calculating your ideal budget…" : "Auto-calibrate my budget"}
        description="We'll look at last month's spending and suggest an ideal monthly budget for this month."
      />

      {enabled && (
        <div className="stg-autobudget-box">
          <div className="stg-autobudget-row">
            <span>Spent last month</span>
            <span>{fmtPKR(LAST_MONTH_SPEND)}</span>
          </div>
          <p className="stg-autobudget-figure">{fmtPKR(suggestedBudget)}<span> / suggested this month</span></p>
          {applied ? (
            <span className="stg-applied-tag"><Check size={13} strokeWidth={3} /> Applied to monthly income (currently {fmtPKR(monthlyIncome)})</span>
          ) : (
            <button type="button" className="stg-apply-btn" onClick={handleApply} disabled={disabled}>
              Apply to monthly income
            </button>
          )}
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Student Verification                                                */
/* ------------------------------------------------------------------ */
function StudentVerificationCard({ university, disabled, showToast }) {
  const [status, setStatus] = useState("unverified"); // unverified | pending | verified
  const [fileName, setFileName] = useState("");
  const inputRef = useRef(null);

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file || disabled) return;
    setFileName(file.name);
    setStatus("pending");
    await saveSettings({ type: "student-verification", fileName: file.name });
    setTimeout(() => {
      setStatus("verified");
      showToast("Student status verified successfully");
    }, 1200);
  };

  return (
    <div className="bsp-panel">
      <h2 className="stg-section-title"><GraduationCap size={16} color="#2FA8A0" /> Student Verification</h2>

      {status === "verified" && (
        <>
          <span className="stg-verified-pill"><Check size={13} strokeWidth={3} /> Student Verified</span>
          <p className="stg-section-hint" style={{ marginTop: 10 }}>
            Verified for {university || "your university"} — student discount features are unlocked.
          </p>
        </>
      )}

      {status === "pending" && (
        <div className="stg-pending-row">
          <Loader2 size={14} className="rp-spin" />
          Verifying {fileName}…
        </div>
      )}

      {status === "unverified" && (
        <>
          <p className="stg-section-hint" style={{ marginTop: -8, marginBottom: 14 }}>
            Upload your student ID or enrollment letter to unlock student discount features.
          </p>
          <input ref={inputRef} type="file" accept=".pdf,.jpg,.jpeg,.png" hidden onChange={handleFile} disabled={disabled} />
          <button type="button" className="stg-upload-btn" onClick={() => inputRef.current?.click()} disabled={disabled}>
            <Upload size={14} /> Upload Student ID / Enrollment Letter
          </button>
        </>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Password (matrix pill UI)                                           */
/* ------------------------------------------------------------------ */
function PasswordField({ label, value, onChange, show, toggle, disabled }) {
  return (
    <label className="stg-field">
      <span className="stg-field-label">{label}</span>
      <div className="stg-input-icon-wrap">
        <input
          type={show ? "text" : "password"}
          className="stg-input"
          value={value}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value)}
        />
        <button type="button" className="stg-eye-btn" onClick={toggle} aria-label={show ? "Hide password" : "Show password"} disabled={disabled}>
          {show ? <EyeOff size={14} /> : <Eye size={14} />}
        </button>
      </div>
    </label>
  );
}

function PasswordCard({ showToast, disabled }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ current: "", next: "", confirm: "" });
  const [show, setShow] = useState({ current: false, next: false, confirm: false });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const pillChecks = PASSWORD_PILLS.map((p) => ({ ...p, pass: p.test(form.next) }));
  const strength = pillChecks.filter((c) => c.pass).length;
  const strengthColor = ["#EEF2F6", "#EF4444", "#F59E0B", "#F59E0B", "#22C55E"][strength];

  const handleSave = async () => {
    setError("");
    if (!form.current) return setError("Enter your current password.");
    if (strength < 4) return setError("Your new password doesn't meet all the requirements yet.");
    if (form.next !== form.confirm) return setError("New password and confirmation don't match.");

    setSaving(true);
    const ok = await saveSettings({ type: "password", ...form });
    setSaving(false);
    if (ok) {
      showToast("Settings updated successfully");
      setForm({ current: "", next: "", confirm: "" });
      setOpen(false);
    } else {
      showToast("Couldn't update password. Try again.");
    }
  };

  return (
    <div className="bsp-panel">
      <button type="button" className="stg-accordion-head" onClick={() => setOpen(!open)}>
        <h2 className="stg-section-title" style={{ marginBottom: 0 }}><Lock size={16} color="#2FA8A0" /> Password</h2>
        <ChevronDown size={16} color="#004C48" style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform .2s ease" }} />
      </button>

      {open && (
        <div className="stg-accordion-body">
          <PasswordField
            label="Current password"
            value={form.current}
            onChange={(v) => setForm({ ...form, current: v })}
            show={show.current}
            toggle={() => setShow({ ...show, current: !show.current })}
            disabled={disabled}
          />
          <PasswordField
            label="New password"
            value={form.next}
            onChange={(v) => setForm({ ...form, next: v })}
            show={show.next}
            toggle={() => setShow({ ...show, next: !show.next })}
            disabled={disabled}
          />
          <div className="stg-strength-track">
            <div className="stg-strength-fill" style={{ width: `${(strength / 4) * 100}%`, background: strengthColor }} />
          </div>
          <div className="stg-pill-row">
            {pillChecks.map((c) => (
              <span key={c.key} className={`stg-pill ${c.pass ? "pass" : ""}`}>
                <Check size={11} strokeWidth={3} />
                {c.label}
              </span>
            ))}
          </div>
          <PasswordField
            label="Confirm new password"
            value={form.confirm}
            onChange={(v) => setForm({ ...form, confirm: v })}
            show={show.confirm}
            toggle={() => setShow({ ...show, confirm: !show.confirm })}
            disabled={disabled}
          />
          {error && <p className="stg-error-text">{error}</p>}
          <button className="stg-save-btn" onClick={handleSave} disabled={saving || disabled}>
            {saving && <Loader2 size={14} className="rp-spin" />}
            {saving ? "Updating…" : "Update password"}
          </button>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Session & Device Management                                         */
/* ------------------------------------------------------------------ */
function SessionsCard({ showToast, disabled }) {
  const [devices, setDevices] = useState(INITIAL_DEVICES);
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogoutAll = async () => {
    if (disabled) return;
    setLoggingOut(true);
    const ok = await saveSettings({ type: "sessions", action: "logout-all-other-devices" });
    setLoggingOut(false);
    if (ok) {
      setDevices((d) => d.filter((dev) => dev.current));
      showToast("Logged out from all other devices");
    } else {
      showToast("Couldn't log out other devices. Try again.");
    }
  };

  const otherCount = devices.filter((d) => !d.current).length;

  return (
    <div className="bsp-panel">
      <h2 className="stg-section-title"><Laptop size={16} color="#2FA8A0" /> Sessions &amp; Devices</h2>
      <p className="stg-section-hint">Places you're currently signed in to SMFinTrack.</p>

      <div>
        {devices.map((d) => {
          const DevIcon = d.type === "laptop" ? Laptop : Smartphone;
          return (
            <div className="stg-device-row" key={d.id}>
              <div className="stg-device-icon"><DevIcon size={17} /></div>
              <div>
                <p className="stg-device-name">
                  {d.name}
                  {d.current && <span className="stg-device-badge">This device</span>}
                </p>
                <p className="stg-device-meta">{d.location} · {d.lastActive}</p>
              </div>
            </div>
          );
        })}
      </div>

      <button
        type="button"
        className="stg-logout-all-btn"
        onClick={handleLogoutAll}
        disabled={disabled || loggingOut || otherCount === 0}
      >
        {loggingOut ? <Loader2 size={14} className="rp-spin" /> : <LogOut size={14} />}
        {loggingOut ? "Logging out…" : "Log out from all other devices"}
      </button>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Notifications (frequency matrix + hover preview)                    */
/* ------------------------------------------------------------------ */
function Toggle({ checked, onChange, label, description, disabled }) {
  return (
    <button type="button" className="stg-toggle-row" onClick={() => !disabled && onChange(!checked)} disabled={disabled}>
      <div className="stg-toggle-text">
        <p className="stg-toggle-label">{label}</p>
        {description && <p className="stg-toggle-desc">{description}</p>}
      </div>
      <span className={`stg-switch ${checked ? "on" : ""}`}>
        <span className="stg-switch-knob" />
      </span>
    </button>
  );
}

function NotificationsCard({ showToast, disabled }) {
  const [frequency, setFrequency] = useState("instant");
  const [categories, setCategories] = useState(DEFAULT_CATEGORY_PREFS);
  const [threshold, setThreshold] = useState(80);
  const saveTimer = useRef(null);

  const enabledCount = Object.values(categories).filter(Boolean).length;

  const persist = (payload) => {
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      const ok = await saveSettings({ type: "notifications", ...payload });
      showToast(ok ? "Settings updated successfully" : "Couldn't save notification settings.");
    }, 500);
  };

  const toggleCategory = (id) => {
    const next = { ...categories, [id]: !categories[id] };
    setCategories(next);
    persist({ frequency, threshold, categories: next });
  };

  return (
    <div className="bsp-panel">
      <h2 className="stg-section-title"><Bell size={16} color="#2FA8A0" /> Notifications</h2>

      <div className="stg-hover-wrap">
        <p className="stg-toggle-label" style={{ marginBottom: 4 }}>Budget alerts</p>
        <p className="stg-toggle-desc" style={{ marginBottom: 10 }}>
          Get notified when you reach your monthly budget threshold for any category. Hover a frequency to preview it.
        </p>

        <div className="stg-freq-row">
          {FREQUENCY_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              type="button"
              className={`stg-freq-pill ${frequency === opt.id ? "active" : ""}`}
              disabled={disabled}
              onClick={() => {
                setFrequency(opt.id);
                persist({ frequency: opt.id, threshold, categories });
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {frequency !== "off" && (
          <div className="stg-preview-pop">
            <div className="stg-preview-app">
              <span className="stg-preview-dot" />
              <span className="stg-preview-title">SMFinTrack</span>
              <span className="stg-preview-time">now</span>
            </div>
            <p className="stg-preview-body">You've reached {threshold}% of your Food &amp; Dining budget this month.</p>
          </div>
        )}
      </div>

      <div className="stg-pref-head">
        <div>
          <p className="stg-toggle-label">Alert types</p>
          <p className="stg-toggle-desc">Choose what else you want to be notified about.</p>
        </div>
        <span className="stg-pref-count">{enabledCount} of {NOTIFICATION_CATEGORIES.length} on</span>
      </div>

      <div className="stg-pref-grid">
        {NOTIFICATION_CATEGORIES.map((c) => {
          const Icon = c.icon;
          const on = categories[c.id];
          return (
            <button
              key={c.id}
              type="button"
              className={`stg-pref-card ${on ? "on" : ""}`}
              onClick={() => !disabled && toggleCategory(c.id)}
              disabled={disabled}
              role="switch"
              aria-checked={on}
              aria-label={`Toggle ${c.title}`}
            >
              <span className="stg-pref-icon" style={{ background: c.bg, color: c.color }}>
                <Icon size={17} />
              </span>
              <span className="stg-pref-text">
                <span className="stg-pref-title">{c.title}</span>
                <span className="stg-pref-desc">{c.description}</span>
              </span>
              <span className={`stg-switch ${on ? "on" : ""}`}>
                <span className="stg-switch-knob" />
              </span>
            </button>
          );
        })}
      </div>

      {frequency !== "off" && (
        <div className="stg-threshold">
          <div className="stg-threshold-top">
            <span>Alert threshold</span>
            <span className="stg-threshold-value">{threshold}%</span>
          </div>
          <input
            type="range"
            min={50}
            max={95}
            step={5}
            value={threshold}
            disabled={disabled}
            onChange={(e) => {
              const v = Number(e.target.value);
              setThreshold(v);
              persist({ frequency, threshold: v, categories });
            }}
            className="stg-slider"
          />
          <p className="stg-threshold-note">We'll warn you once spending in a category passes {threshold}% of its budget.</p>
        </div>
      )}
    </div>
  );
}

const STG_STYLES = `
  .stg-section-title { display: flex; align-items: center; gap: 8px; font-family: 'Manrope', sans-serif; font-size: 15px; font-weight: 700; color: #004C48; margin: 0 0 6px; }
  .stg-section-hint { font-size: 12px; color: #94A3B8; margin: 0 0 18px; }

  .stg-avatar-row { display: flex; align-items: center; gap: 12px; margin-bottom: 20px; }
  .stg-avatar { width: 52px; height: 52px; border-radius: 50%; background: #004C48; color: #fff; display: flex; align-items: center; justify-content: center; font-family: 'Manrope', sans-serif; font-weight: 700; font-size: 16px; flex-shrink: 0; }
  .stg-avatar-name { font-size: 14px; font-weight: 700; color: #004C48; margin: 0; }
  .stg-avatar-sub { font-size: 12px; color: #6B7280; margin: 2px 0 0; }

  .stg-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
  @media (max-width: 640px) { .stg-grid-2 { grid-template-columns: 1fr; } }

  .stg-field { display: block; }
  .stg-field-label { display: block; font-size: 12px; font-weight: 600; color: #6B7280; margin-bottom: 6px; }
  .stg-field-error { display: block; font-size: 11px; color: #EF4444; margin-top: 4px; }

  .stg-input { width: 100%; font-size: 13.5px; padding: 10px 12px; border-radius: 10px; border: 1px solid #E5E7EB; background: #F7F9FB; color: #16232F; outline: none; transition: all .15s ease; font-family: 'Inter', sans-serif; }
  .stg-input:focus { border-color: #2FA8A0; background: #fff; box-shadow: 0 0 0 3px rgba(47,168,160,0.14); }
  .stg-input:disabled { opacity: .6; cursor: not-allowed; }
  .stg-input.with-icon { padding-left: 34px; }
  .stg-input.with-status { padding-right: 32px; }
  .stg-input-icon-wrap { position: relative; }
  .stg-input-icon { position: absolute; left: 11px; top: 50%; transform: translateY(-50%); color: #94A3B8; pointer-events: none; }
  .stg-eye-btn { position: absolute; right: 10px; top: 50%; transform: translateY(-50%); background: none; border: none; color: #94A3B8; cursor: pointer; display: flex; padding: 2px; }

  .stg-inline-status { position: absolute; right: 11px; top: 50%; transform: translateY(-50%); display: flex; align-items: center; justify-content: center; color: #C3CBD6; }
  .stg-inline-status.saved { color: #22C55E; }
  .stg-inline-status.saving { color: #2FA8A0; }

  .stg-save-btn { margin-top: 20px; display: inline-flex; align-items: center; gap: 8px; background: #004C48; color: #fff; border: none; padding: 11px 20px; border-radius: 10px; font-size: 13.5px; font-weight: 600; cursor: pointer; box-shadow: 0 8px 20px rgba(0,76,72,.22); transition: all .2s ease; }
  .stg-save-btn:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 12px 26px rgba(0,76,72,.3); }
  .stg-save-btn:disabled { opacity: .5; cursor: not-allowed; box-shadow: none; }

  .stg-accordion-head { width: 100%; display: flex; align-items: center; justify-content: space-between; background: none; border: none; cursor: pointer; padding: 0; }
  .stg-accordion-body { margin-top: 16px; display: flex; flex-direction: column; gap: 14px; }

  .stg-strength-track { height: 6px; border-radius: 999px; background: #EEF2F6; overflow: hidden; margin-top: -4px; }
  .stg-strength-fill { height: 100%; border-radius: 999px; transition: width .3s ease, background .3s ease; }
  .stg-error-text { font-size: 12px; color: #EF4444; margin: -4px 0 0; }

  .stg-pill-row { display: flex; flex-wrap: wrap; gap: 8px; }
  .stg-pill { display: inline-flex; align-items: center; gap: 5px; font-size: 11px; font-weight: 700; padding: 5px 10px; border-radius: 999px; background: #F1F4F8; color: #B3BCC8; transition: all .2s ease; }
  .stg-pill svg { opacity: .4; }
  .stg-pill.pass { background: #DCFCE7; color: #15803D; }
  .stg-pill.pass svg { opacity: 1; }

  .stg-toggle-row { width: 100%; display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; background: none; border: none; border-top: 1px solid #F1F4F8; padding: 14px 0; cursor: pointer; text-align: left; }
  .stg-toggle-row:first-of-type { border-top: none; }
  .stg-toggle-row:disabled { cursor: not-allowed; opacity: .6; }
  .stg-toggle-text { max-width: 420px; }
  .stg-toggle-label { font-size: 13.5px; font-weight: 600; color: #004C48; margin: 0; }
  .stg-toggle-desc { font-size: 12px; color: #6B7280; margin: 3px 0 0; line-height: 1.5; }
  .stg-switch { position: relative; width: 42px; height: 24px; border-radius: 999px; background: #D8DEE6; flex-shrink: 0; transition: background .2s ease; }
  .stg-switch.on { background: #2FA8A0; }
  .stg-switch-knob { position: absolute; top: 3px; left: 3px; width: 18px; height: 18px; border-radius: 50%; background: #fff; box-shadow: 0 1px 3px rgba(0,0,0,.25); transition: transform .2s ease; }
  .stg-switch.on .stg-switch-knob { transform: translateX(18px); }

  .stg-threshold { border-top: 1px dashed #E5E7EB; margin-top: 6px; padding-top: 14px; }
  .stg-threshold-top { display: flex; justify-content: space-between; font-size: 12px; color: #6B7280; margin-bottom: 6px; }
  .stg-threshold-value { font-weight: 700; color: #004C48; }
  .stg-slider { width: 100%; accent-color: #2FA8A0; }
  .stg-slider:disabled { opacity: .5; }
  .stg-threshold-note { font-size: 11.5px; color: #94A3B8; margin: 6px 0 0; }

  .rp-spin { animation: rp-rotate .8s linear infinite; }
  @keyframes rp-rotate { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

  .bt-toast{ position:fixed; bottom:24px; left:50%; transform:translateX(-50%) translateY(20px); background:#004C48; color:#fff; padding:11px 20px; border-radius:11px; font-size:13px; font-weight:600; opacity:0; transition:all .3s ease; pointer-events:none; box-shadow:0 10px 30px rgba(0,0,0,0.2); z-index:60; }
  .bt-toast.show{ opacity:1; transform:translateX(-50%) translateY(0); }

  /* ============ Emergency Freeze banner ============ */
  .stg-freeze-banner { border-radius: 18px; padding: 18px 22px; margin-bottom: 24px; display: flex; align-items: center; justify-content: space-between; gap: 20px; border: 1px solid #E5E7EB; background: #fff; box-shadow: 0 4px 10px rgba(15,23,42,.05); flex-wrap: wrap; }
  .stg-freeze-banner.active { background: #FEF2F2; border-color: #FCA5A5; }
  .stg-freeze-left { display: flex; gap: 14px; align-items: flex-start; }
  .stg-freeze-icon { width: 40px; height: 40px; border-radius: 12px; background: #E8F7F5; color: #2FA8A0; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
  .stg-freeze-banner.active .stg-freeze-icon { background: #EF4444; color: #fff; }
  .stg-freeze-title { font-family: 'Manrope', sans-serif; font-size: 14.5px; font-weight: 700; color: #004C48; margin: 0 0 3px; }
  .stg-freeze-banner.active .stg-freeze-title { color: #B91C1C; }
  .stg-freeze-desc { font-size: 12.5px; color: #6B7280; margin: 0; line-height: 1.5; max-width: 480px; }
  .stg-freeze-banner.active .stg-freeze-desc { color: #7F1D1D; }
  .stg-freeze-actions { display: flex; gap: 10px; flex-shrink: 0; }

  .stg-btn-danger-outline { background: #fff; border: 1px solid #EF4444; color: #EF4444; padding: 10px 18px; border-radius: 10px; font-size: 13px; font-weight: 600; cursor: pointer; white-space: nowrap; }
  .stg-btn-danger-outline:hover { background: #FEF2F2; }
  .stg-btn-danger-solid { display: inline-flex; align-items: center; gap: 8px; background: #EF4444; border: none; color: #fff; padding: 10px 18px; border-radius: 10px; font-size: 13px; font-weight: 600; cursor: pointer; white-space: nowrap; }
  .stg-btn-danger-solid:hover:not(:disabled) { background: #DC2626; }
  .stg-btn-danger-solid:disabled { opacity: .6; cursor: not-allowed; }
  .stg-btn-ghost { background: none; border: 1px solid #E5E7EB; color: #6B7280; padding: 10px 18px; border-radius: 10px; font-size: 13px; font-weight: 600; cursor: pointer; white-space: nowrap; }
  .stg-btn-dark { display: inline-flex; align-items: center; gap: 8px; background: #004C48; border: none; color: #fff; padding: 10px 18px; border-radius: 10px; font-size: 13px; font-weight: 600; cursor: pointer; white-space: nowrap; }
  .stg-btn-dark:disabled { opacity: .6; cursor: not-allowed; }

  /* ============ Two-pane settings shell ============ */
  .stg-shell { display: flex; align-items: flex-start; gap: 28px; }
  .stg-tabs-nav { width: 200px; flex-shrink: 0; display: flex; flex-direction: column; gap: 4px; position: sticky; top: 24px; }
  .stg-tab { display: flex; align-items: center; gap: 10px; padding: 11px 14px; border-radius: 12px; border: none; background: none; color: #6B7280; font-family: 'Inter', sans-serif; font-size: 13.5px; font-weight: 600; cursor: pointer; text-align: left; transition: all .18s ease; }
  .stg-tab svg { opacity: .7; }
  .stg-tab:hover { background: #F1F4F8; color: #004C48; }
  .stg-tab.active { background: rgba(47,168,160,.12); color: #004C48; font-weight: 700; }
  .stg-tab.active svg { opacity: 1; }
  .stg-panel-area { flex: 1; min-width: 0; }

  .stg-fade-in { animation: stgFadeIn .28s ease; }
  @keyframes stgFadeIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }

  @media (max-width: 860px) {
    .stg-shell { flex-direction: column; }
    .stg-tabs-nav { width: 100%; flex-direction: row; overflow-x: auto; -webkit-overflow-scrolling: touch; position: static; padding-bottom: 4px; }
    .stg-tab { flex-shrink: 0; }
  }

  /* ============ Auto-Budget Calibration ============ */
  .stg-autobudget-box { margin-top: 16px; background: #F0FBFA; border: 1px solid #CDEFEA; border-radius: 14px; padding: 16px; }
  .stg-autobudget-row { display: flex; justify-content: space-between; font-size: 12.5px; color: #0E5B56; margin-bottom: 4px; }
  .stg-autobudget-figure { font-family: 'Manrope', sans-serif; font-size: 20px; font-weight: 800; color: #004C48; margin: 6px 0 12px; }
  .stg-autobudget-figure span { font-family: 'Inter', sans-serif; font-size: 12px; font-weight: 600; color: #6B7280; margin-left: 6px; }
  .stg-apply-btn { background: #2FA8A0; border: none; color: #fff; padding: 9px 16px; border-radius: 9px; font-size: 12.5px; font-weight: 700; cursor: pointer; }
  .stg-apply-btn:disabled { opacity: .5; cursor: not-allowed; }
  .stg-applied-tag { font-size: 11.5px; font-weight: 700; color: #15803D; display: inline-flex; align-items: center; gap: 4px; }

  /* ============ Student Verification ============ */
  .stg-verified-pill { display: inline-flex; align-items: center; gap: 6px; background: #DCFCE7; color: #15803D; font-size: 12px; font-weight: 700; padding: 6px 12px; border-radius: 999px; }
  .stg-upload-btn { display: inline-flex; align-items: center; gap: 8px; background: #fff; border: 1px dashed #2FA8A0; color: #004C48; padding: 10px 16px; border-radius: 10px; font-size: 12.5px; font-weight: 600; cursor: pointer; }
  .stg-upload-btn:hover:not(:disabled) { background: #F0FBFA; }
  .stg-upload-btn:disabled { opacity: .55; cursor: not-allowed; }
  .stg-pending-row { display: flex; align-items: center; gap: 8px; font-size: 12.5px; color: #B45309; }

  /* ============ Sessions & Devices ============ */
  .stg-device-row { display: flex; align-items: center; gap: 12px; padding: 13px 0; border-top: 1px solid #F1F4F8; }
  .stg-device-row:first-of-type { border-top: none; }
  .stg-device-icon { width: 38px; height: 38px; border-radius: 10px; background: #F0FBFA; color: #2FA8A0; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
  .stg-device-name { font-size: 13.5px; font-weight: 600; color: #004C48; margin: 0; display: flex; align-items: center; gap: 8px; }
  .stg-device-meta { font-size: 12px; color: #94A3B8; margin: 2px 0 0; }
  .stg-device-badge { font-size: 10px; font-weight: 700; color: #2FA8A0; background: #E8F7F5; padding: 2px 8px; border-radius: 999px; }
  .stg-logout-all-btn { margin-top: 18px; width: 100%; display: flex; align-items: center; justify-content: center; gap: 8px; background: #fff; border: 1px solid #EF4444; color: #EF4444; padding: 11px; border-radius: 10px; font-size: 13px; font-weight: 600; cursor: pointer; }
  .stg-logout-all-btn:hover:not(:disabled) { background: #FEF2F2; }
  .stg-logout-all-btn:disabled { opacity: .5; cursor: not-allowed; }

  /* ============ Notification frequency matrix + hover preview ============ */
  .stg-freq-row { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 2px; }
  .stg-freq-pill { border: 1px solid #E5E7EB; background: #fff; color: #6B7280; font-size: 12.5px; font-weight: 600; padding: 8px 14px; border-radius: 999px; cursor: pointer; transition: all .18s ease; }
  .stg-freq-pill:hover:not(:disabled) { border-color: #2FA8A0; color: #004C48; }
  .stg-freq-pill.active { background: #004C48; border-color: #004C48; color: #fff; }
  .stg-freq-pill:disabled { opacity: .5; cursor: not-allowed; }

  .stg-hover-wrap { position: relative; border-bottom: 1px solid #F1F4F8; padding-bottom: 16px; margin-bottom: 4px; }
  .stg-preview-pop { position: absolute; top: 0; right: 0; width: 210px; background: #0F172A; color: #fff; border-radius: 14px; padding: 12px 14px; opacity: 0; transform: translateY(-6px) scale(.96); pointer-events: none; transition: all .22s ease; box-shadow: 0 14px 30px rgba(0,0,0,.25); z-index: 20; }
  .stg-hover-wrap:hover .stg-preview-pop { opacity: 1; transform: translateY(0) scale(1); }
  .stg-preview-app { display: flex; align-items: center; gap: 8px; margin-bottom: 6px; }
  .stg-preview-dot { width: 20px; height: 20px; border-radius: 6px; background: #2FA8A0; flex-shrink: 0; }
  .stg-preview-title { font-size: 11.5px; font-weight: 700; }
  .stg-preview-time { font-size: 9.5px; color: rgba(255,255,255,.5); margin-left: auto; }
  .stg-preview-body { font-size: 11px; color: rgba(255,255,255,.85); line-height: 1.4; margin: 0; }
  @media (max-width: 860px) { .stg-preview-pop { display: none; } }

  /* ============ Per-type alert preferences ============ */
  .stg-pref-head { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; padding: 16px 0 12px; }
  .stg-pref-count { font-size: 11px; font-weight: 700; color: #2FA8A0; background: #E8F7F5; padding: 4px 10px; border-radius: 999px; white-space: nowrap; flex-shrink: 0; }

  .stg-pref-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
  @media (max-width: 760px) { .stg-pref-grid { grid-template-columns: 1fr; } }

  .stg-pref-card { display: flex; align-items: flex-start; gap: 11px; width: 100%; text-align: left; background: #fff; border: 1px solid #E5E7EB; border-radius: 12px; padding: 13px; cursor: pointer; transition: border-color .18s ease, box-shadow .18s ease, background .18s ease; }
  .stg-pref-card:hover:not(:disabled) { border-color: #2FA8A0; box-shadow: 0 4px 14px rgba(47,168,160,.12); }
  .stg-pref-card.on { background: #FAFDFD; border-color: #CCE9E7; }
  .stg-pref-card:disabled { opacity: .55; cursor: not-allowed; }
  .stg-pref-card .stg-switch { margin-top: 2px; }

  .stg-pref-icon { width: 34px; height: 34px; border-radius: 10px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
  .stg-pref-text { display: flex; flex-direction: column; gap: 3px; flex: 1; min-width: 0; }
  .stg-pref-title { font-size: 13px; font-weight: 600; color: #004C48; }
  .stg-pref-desc { font-size: 11.5px; color: #6B7280; line-height: 1.45; }
`;
