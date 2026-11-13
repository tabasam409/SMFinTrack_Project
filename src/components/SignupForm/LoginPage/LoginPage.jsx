import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import loginHero from "../../../assets/loginpagepic.png";
import loginHeroWebp from "../../../assets/loginpagepic.webp";
import "./LoginPage.css";


// Swap this for the real endpoint your backend team gives you

const MailIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none">
    <rect x="3" y="5" width="18" height="14" rx="2" stroke="#8fa3ac" strokeWidth="1.6" />
    <path d="m4 7 8 6 8-6" stroke="#8fa3ac" strokeWidth="1.6" strokeLinecap="round" />
  </svg>
);

const LockIcon = ({ color = "#8fa3ac" }) => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none">
    <rect x="4" y="10" width="16" height="10" rx="2" stroke={color} strokeWidth="1.6" />
    <path d="M8 10V7a4 4 0 0 1 8 0v3" stroke={color} strokeWidth="1.6" />
  </svg>
);

const EyeIcon = ({ off }) =>
  off ? (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none">
      <path
        d="M3 3l18 18M10.6 10.6a3 3 0 0 0 4.2 4.2M9.9 5.2A10.6 10.6 0 0 1 12 5c5 0 9 4 10 7a12.4 12.4 0 0 1-3.1 4.1M6.6 6.6C4.5 8 3 10 2 12c1 3 5 7 10 7 1.2 0 2.3-.2 3.4-.6"
        stroke="#8fa3ac"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ) : (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none">
      <path
        d="M2 12c1-3 5-7 10-7s9 4 10 7c-1 3-5 7-10 7s-9-4-10-7Z"
        stroke="#8fa3ac"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="12" r="3" stroke="#8fa3ac" strokeWidth="1.6" />
    </svg>
  );

const ArrowIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none">
    <path
      d="M5 12h14M13 6l6 6-6 6"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const GoogleIcon = () => (
  <svg viewBox="0 0 20 20" width="18" height="18">
    <path
      d="M19.6 10.23c0-.68-.06-1.36-.18-2.02H10v3.83h5.38a4.6 4.6 0 0 1-2 3.02v2.5h3.23c1.9-1.75 2.99-4.33 2.99-7.33Z"
      fill="#4285F4"
    />
    <path
      d="M10 20c2.7 0 4.96-.89 6.62-2.42l-3.23-2.5c-.9.6-2.05.95-3.39.95-2.6 0-4.8-1.76-5.59-4.12H1.06v2.59A10 10 0 0 0 10 20Z"
      fill="#34A853"
    />
    <path
      d="M4.41 11.91a5.99 5.99 0 0 1 0-3.82V5.5H1.06a10 10 0 0 0 0 9l3.35-2.59Z"
      fill="#FBBC05"
    />
    <path
      d="M10 3.98c1.47 0 2.79.5 3.83 1.5l2.87-2.87A9.6 9.6 0 0 0 10 0 10 10 0 0 0 1.06 5.5l3.35 2.59C5.2 5.74 7.4 3.98 10 3.98Z"
      fill="#EA4335"
    />
  </svg>
);

export default function LoginForm() {
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isDark, setIsDark] = useState(false);

  // TEMPORARY: lets you log in to the /admin panel for testing until the
  // real backend/token+role system is live (see AdminDashboard/API_CONTRACT.md).
  const [loginAsAdmin, setLoginAsAdmin] = useState(false);
  const [loginPopup, setLoginPopup] = useState({
    show: false,
    type: "",
    message: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validate = () => {
    const newErrors = {};
    if (!form.email.trim()) newErrors.email = "Email is required";
    if (!form.password) newErrors.password = "Password is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
  e.preventDefault();

  setApiError("");

  // ---------------------------------------------
  // FRONTEND VALIDATION
  // ---------------------------------------------

  if (!validate()) {
    return;
  }

  setLoading(true);

  // Small delay to keep the existing loading behavior
  setTimeout(() => {
    // =================================================
    // GET SAVED USER FROM LOCAL STORAGE
    // =================================================

    const savedUser = localStorage.getItem("smfintrackUser");

    // No account exists
    if (!savedUser) {
      setLoading(false);

      const message =
        "No account found. Please sign up first.";

      setApiError(message);

      setLoginPopup({
        show: true,
        type: "error",
        message,
      });

      return;
    }

    // =================================================
    // READ SAVED USER
    // =================================================

    let user;

    try {
      user = JSON.parse(savedUser);
    } catch (error) {
      console.error("Invalid saved user:", error);

      setLoading(false);

      const message =
        "Saved account data is invalid. Please sign up again.";

      setApiError(message);

      setLoginPopup({
        show: true,
        type: "error",
        message,
      });

      return;
    }

    // =================================================
    // COMPARE LOGIN CREDENTIALS
    // =================================================

    const enteredEmail = form.email.trim().toLowerCase();
    const enteredPassword = form.password;

    const savedEmail = user.email?.trim().toLowerCase();
    const savedPassword = user.password;

    const isCorrectLogin =
      enteredEmail === savedEmail &&
      enteredPassword === savedPassword;

    // =================================================
    // SUCCESSFUL LOGIN
    // =================================================

    if (isCorrectLogin) {
      localStorage.setItem(
        "smfintrackLoggedIn",
        "true"
      );

      // TEMPORARY: persist the role chosen at login (see API_CONTRACT.md
      // for the real token/role plan). Route guards read this so a
      // student can't reach /admin just by typing the URL.
      localStorage.setItem(
        "smfintrackRole",
        loginAsAdmin ? "admin" : "user"
      );

      setLoading(false);

      setLoginPopup({
        show: true,
        type: "success",
        message: "Login successful! Welcome back.",
      });

      // TEMPORARY: route by the checkbox chosen at login, until real
      // backend/token-based roles exist (see API_CONTRACT.md).
      const destination = loginAsAdmin ? "/admin" : "/dashboard";
      setTimeout(() => {
        navigate(destination);
      }, 1200);

      return;
    }

    // =================================================
    // WRONG EMAIL OR PASSWORD
    // =================================================

    setLoading(false);

    const message =
      "Invalid email or password. Please try again.";

    setApiError(message);

    setLoginPopup({
      show: true,
      type: "error",
      message,
    });
  }, 600);
};  
  const handleGoogleLogin = () => {
    // Wire this up to your real OAuth flow (redirect to backend /auth/google, etc.)
    // window.location.href = "/api/auth/google";
    console.log("Google login will be connected when the backend API is ready.");
  };

  return (
    <div className={`login-page ${isDark ? "dark" : ""}`}>
      <div className="login-card">
        {/* Left panel: single full-bleed image */}
        {/* <div className="login-promo">
          <img
            className="promo-image"
            src={loginHero}
            alt="SMFinTrack - Smart finances, better tomorrow"
          />
        </div> */}
        {/* Left promo panel - same design as Signup page */}
        <div className="login-promo">
          <div className="login-brand">
            <svg
              className="login-brand-logo"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12 2 2 7l10 5 10-5-10-5Z"
                stroke="#0f766e"
                strokeWidth="1.6"
                strokeLinejoin="round"
              />
              <path
                d="M2 12l10 5 10-5"
                stroke="#0f766e"
                strokeWidth="1.6"
                strokeLinejoin="round"
              />
              <path
                d="M2 17l10 5 10-5"
                stroke="#0f766e"
                strokeWidth="1.6"
                strokeLinejoin="round"
              />
            </svg>

            <span className="login-brand-name">SMFinTrack</span>
          </div>

          <p className="login-promo-tagline">
            Know where it's going,
            <br />
            before it's gone.
          </p>

          <div className="login-promo-illustration">
            <picture>
              <source srcSet={loginHeroWebp} type="image/webp" />
              <img
                src={loginHero}
                alt="SMFinTrack financial dashboard"
                loading="lazy"
                decoding="async"
              />
            </picture>
          </div>
        </div>

        {/* Right form panel */}
        <div className="login-form-panel">
          <button
            type="button"
            className="theme-toggle"
            onClick={() => setIsDark((v) => !v)}
            aria-label="Toggle theme"
          >
            <span className={`theme-toggle-option ${!isDark ? "active" : ""}`}>
              ☀️
            </span>
            <span className={`theme-toggle-option ${isDark ? "active" : ""}`}>
              🌙
            </span>
          </button>

          <h1 className="login-title">
            Welcome Back <span className="wave">👋</span>
          </h1>
          <p className="login-subtitle">Login to continue to your account</p>

          <form className="login-form" onSubmit={handleSubmit} noValidate>
            {apiError && <div className="api-error">{apiError}</div>}

            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <div className={`input-wrap ${errors.email ? "input-error" : ""}`}>
                <span className="input-icon">
                  <MailIcon />
                </span>
                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Enter your email"
                  value={form.email}
                  onChange={handleChange}
                />
              </div>
              {errors.email && <span className="field-error">{errors.email}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <div className={`input-wrap ${errors.password ? "input-error" : ""}`}>
                <span className="input-icon">
                  <LockIcon />
                </span>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={handleChange}
                />
                <button
                  type="button"
                  className="toggle-visibility"
                  onClick={() => setShowPassword((v) => !v)}
                  tabIndex={-1}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  <EyeIcon off={showPassword} />
                </button>
              </div>
              {errors.password && (
                <span className="field-error">{errors.password}</span>
              )}
            </div>

            <div className="forgot-row">
              <a href="/forgot-password" className="forgot-link">
                Forgot Password?
              </a>
            </div>

            {/* TEMPORARY: lets you log in to the /admin panel for testing
                until real backend roles exist. */}
            <div className="admin-login-toggle">
              <label htmlFor="loginAsAdmin" className="admin-login-label">
                <input
                  type="checkbox"
                  id="loginAsAdmin"
                  checked={loginAsAdmin}
                  onChange={(e) => setLoginAsAdmin(e.target.checked)}
                />
                Login as admin
              </label>
            </div>

            <button type="submit" className="login-button" disabled={loading}>
              <span className="login-button-icon">
                <LockIcon color="#fff" />
              </span>
              <span>{loading ? "Logging in..." : "Login to your account"}
              </span>
              <span className="login-button-arrow">
                <ArrowIcon />
              </span>
            </button>

            <div className="divider">
              <span />
              <span className="divider-text">OR</span>
              <span />
            </div>

            <button
              type="button"
              className="google-button"
              onClick={handleGoogleLogin}
            >
              <GoogleIcon />
              <span>Continue with Google</span>
            </button>

            <p className="signup-hint">
              Don't have an account?{" "}
              <Link to="/signup">Sign Up</Link>
            </p>
          </form>
        </div>
      </div>
      {loginPopup.show && (
        <div className="login-popup-overlay">
          <div className={`login-popup ${loginPopup.type}`}>
            <div className="login-popup-icon">
              {loginPopup.type === "success" ? "✓" : "!"}
            </div>

            <h3>
              {loginPopup.type === "success"
                ? "Login Successful"
                : "Login Failed"}
            </h3>

            <p>{loginPopup.message}</p>

            {loginPopup.type === "error" && (
              <button
                type="button"
                onClick={() =>
                  setLoginPopup({
                    show: false,
                    type: "",
                    message: "",
                  })
                }
              >
                OK
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}