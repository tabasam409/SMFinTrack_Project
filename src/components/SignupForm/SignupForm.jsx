import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import "./SignupForm.css";
// import { signupUser } from "../../api/auth";
import signupIllustration from "../../assets/signuppagepic.png";
import signupIllustrationWebp from "../../assets/signuppagepic.webp";

const UserIcon = () => (
  <svg
    viewBox="0 0 24 24"
    width="16"
    height="16"
    fill="none"
  >
    <circle
      cx="12"
      cy="8"
      r="3.5"
      stroke="#8fa39d"
      strokeWidth="1.6"
    />

    <path
      d="M5 20c.7-3.5 3.2-5.5 7-5.5s6.3 2 7 5.5"
      stroke="#8fa39d"
      strokeWidth="1.6"
      strokeLinecap="round"
    />
  </svg>
);


const MailIcon = () => (
  <svg
    viewBox="0 0 24 24"
    width="16"
    height="16"
    fill="none"
  >
    <rect
      x="3"
      y="5"
      width="18"
      height="14"
      rx="2"
      stroke="#8fa39d"
      strokeWidth="1.6"
    />

    <path
      d="m4 7 8 6 8-6"
      stroke="#8fa39d"
      strokeWidth="1.6"
      strokeLinecap="round"
    />
  </svg>
);


const LockIcon = () => (
  <svg
    viewBox="0 0 24 24"
    width="16"
    height="16"
    fill="none"
  >
    <rect
      x="4"
      y="10"
      width="16"
      height="10"
      rx="2"
      stroke="#8fa39d"
      strokeWidth="1.6"
    />

    <path
      d="M8 10V7a4 4 0 0 1 8 0v3"
      stroke="#8fa39d"
      strokeWidth="1.6"
    />
  </svg>
);


const EyeIcon = ({ off }) =>
  off ? (
    <svg
      viewBox="0 0 24 24"
      width="16"
      height="16"
      fill="none"
    >
      <path
        d="M3 3l18 18M10.6 10.6a3 3 0 0 0 4.2 4.2M9.9 5.2A10.6 10.6 0 0 1 12 5c5 0 9 4 10 7a12.4 12.4 0 0 1-3.1 4.1M6.6 6.6C4.5 8 3 10 2 12c1 3 5 7 10 7 1.2 0 2.3-.2 3.4-.6"
        stroke="#8fa39d"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ) : (
    <svg
      viewBox="0 0 24 24"
      width="16"
      height="16"
      fill="none"
    >
      <path
        d="M2 12c1-3 5-7 10-7s9 4 10 7c-1 3-5 7-10 7s-9-4-10-7Z"
        stroke="#8fa39d"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />

      <circle
        cx="12"
        cy="12"
        r="3"
        stroke="#8fa39d"
        strokeWidth="1.6"
      />
    </svg>
  );


const CheckIcon = () => (
  <svg
    viewBox="0 0 24 24"
    width="16"
    height="16"
    fill="none"
  >
    <circle
      cx="12"
      cy="12"
      r="10"
      fill="#0f766e"
    />

    <path
      d="m8 12.5 2.5 2.5 5.5-6"
      stroke="#fff"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);


const BigCheckIcon = () => (
  <svg
    viewBox="0 0 24 24"
    width="40"
    height="40"
    fill="none"
  >
    <path
      d="m5 12.5 4.5 4.5L19 7"
      stroke="#0f766e"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);


/*
=========================================================
VALIDATION
=========================================================
*/

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const PASSWORD_RULES = [
  {
    test: (value) => value.length >= 8,
    message: "at least 8 characters",
  },
  {
    test: (value) => /[A-Z]/.test(value),
    message: "one uppercase letter",
  },
  {
    test: (value) => /[a-z]/.test(value),
    message: "one lowercase letter",
  },
  {
    test: (value) => /[0-9]/.test(value),
    message: "one number",
  },
  {
    test: (value) => /[^A-Za-z0-9]/.test(value),
    message: "one special character",
  },
];


function getFieldError(name, values) {
  switch (name) {
    case "firstName":
      if (!values.firstName.trim()) {
        return "First name is required";
      }
      return "";

    case "lastName":
      if (!values.lastName.trim()) {
        return "Last name is required";
      }
      return "";

    case "email":
      if (!values.email.trim()) {
        return "Email is required";
      }

      if (!EMAIL_REGEX.test(values.email.trim())) {
        return "Enter a valid email address";
      }

      return "";

    case "university":
      if (!values.university.trim()) {
        return "University name is required";
      }

      return "";

    case "password": {
      if (!values.password) {
        return "Password is required";
      }

      const failedRule = PASSWORD_RULES.find(
        (rule) => !rule.test(values.password)
      );

      if (failedRule) {
        return `Password must have ${failedRule.message}`;
      }

      return "";
    }

    case "confirmPassword":
      if (!values.confirmPassword) {
        return "Please confirm your password";
      }

      if (values.password !== values.confirmPassword) {
        return "Passwords do not match";
      }

      return "";

    default:
      return "";
  }
}
/*
=========================================================
FIELDS USED FOR FRONTEND VALIDATION
=========================================================
*/

const FIELD_NAMES = [
  "firstName",
  "lastName",
  "email",
  "university",
  "password",
  "confirmPassword",
];


/*
=========================================================
SIGNUP COMPONENT
=========================================================
*/

export default function SignupForm() {

  const navigate = useNavigate();


  /*
  -------------------------------------------------------
  FORM STATE
  -------------------------------------------------------
  */

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    university: "",
    password: "",
    confirmPassword: "",
  });


  /*
  -------------------------------------------------------
  UI STATE
  -------------------------------------------------------
  */

  const [touched, setTouched] = useState({});

  const [submitted, setSubmitted] = useState(false);

  const [showPassword, setShowPassword] = useState(false);

  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [apiError, setApiError] = useState("");

  const [loading, setLoading] = useState(false);

  const [success, setSuccess] = useState(false);


  /*
  -------------------------------------------------------
  REDIRECT AFTER SUCCESS
  -------------------------------------------------------
  */

  useEffect(() => {

    if (!success) {
      return;
    }

    const timer = setTimeout(() => {
      navigate("/login");
    }, 1800);

    return () => clearTimeout(timer);

  }, [success, navigate]);


  /*
  -------------------------------------------------------
  INPUT CHANGE
  -------------------------------------------------------
  */

  const handleChange = (e) => {

    const { name, value } = e.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    /*
    Clear API error when user starts changing
    the form again.
    */

    if (apiError) {
      setApiError("");
    }
  };


  /*
  -------------------------------------------------------
  INPUT BLUR
  -------------------------------------------------------
  */

  const handleBlur = (e) => {

    const { name } = e.target;

    setTouched((previous) => ({
      ...previous,
      [name]: true,
    }));
  };


  /*
  -------------------------------------------------------
  DISPLAY FIELD ERROR
  -------------------------------------------------------
  */

  const shownError = (name) => {

    if (touched[name] || submitted) {
      return getFieldError(name, form);
    }

    return "";
  };


  /*
  -------------------------------------------------------
  VALID FIELD
  -------------------------------------------------------
  */

  const isFieldValid = (name) => {

    return (
      (touched[name] || submitted) &&
      form[name] &&
      !getFieldError(name, form)
    );
  };


  /*
  =======================================================
  SIGNUP API
  =======================================================
  */

const handleSubmit = async (e) => {
  e.preventDefault();

  setApiError("");
  setSubmitted(true);

  // ---------------------------------------------
  // FRONTEND VALIDATION
  // ---------------------------------------------

  const hasErrors = FIELD_NAMES.some((name) =>
    getFieldError(name, form)
  );

  if (hasErrors) {
    return;
  }

  setLoading(true);

  try {
    // =================================================
    // BACKEND API CODE - TEMPORARILY COMMENTED OUT
    // Keep this code for later when the signup API
    // is working again.
    // =================================================

    /*
    const payload = {
      email: form.email.trim().toLowerCase(),
      first_name: form.firstName.trim(),
      last_name: form.lastName.trim(),
      university_name: form.university.trim(),
      password: form.password,
      confirm_password: form.confirmPassword,
    };

    console.log("Signup payload:", payload);

    const response = await signupUser(payload);

    console.log("Signup successful:", response);

    localStorage.setItem(
      "smfintrackUser",
      JSON.stringify(response)
    );

    localStorage.removeItem("smfintrackLoggedIn");
    */

    // =================================================
    // TEMPORARY FRONTEND SIGNUP
    // =================================================

    const userData = {
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      email: form.email.trim().toLowerCase(),
      university: form.university.trim(),
      password: form.password,
    };

    console.log("Temporary signup user:", userData);

    // Save the user locally
    localStorage.setItem(
      "smfintrackUser",
      JSON.stringify(userData)
    );

    // Make sure the user is not considered logged in yet
    localStorage.removeItem("smfintrackLoggedIn");

    // Show success screen
    setSuccess(true);

  } catch (error) {
    // =================================================
    // BACKEND API ERROR HANDLING - KEPT FOR LATER
    // =================================================

    /*
    console.error("Signup error:", error);

    if (error.status === 409) {
      setApiError("This email is already registered.");
    } else if (error.status === 422) {
      setApiError(
        "Please check your information and make sure all fields are valid."
      );
    } else if (error.code === "NETWORK_ERROR") {
      setApiError(
        "Unable to connect to the signup server. Please try again when the API is available."
      );
    } else {
      setApiError(
        "Unable to create your account. Please try again."
      );
    }
    */

    // Temporary fallback error
    console.error("Signup error:", error);
    setApiError("Unable to create your account. Please try again.");
  } finally {
    setLoading(false);
  }
};  /*
  =======================================================
  UI
  =======================================================
  */

  return (
    <div className="signup-page">

      <div className="signup-card">


        {/* =================================================
            LEFT PROMO PANEL
        ================================================= */}

        <div className="signup-promo">

          <div className="brand">

            <svg
              className="brand-logo"
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

            <span className="brand-name">
              SMFinTrack
            </span>

          </div>


          <p className="promo-tagline">
            Know where it's going,
            <br />
            before it's gone.
          </p>


          <div
            className="promo-illustration"
            aria-hidden="true"
          >
            <picture>
              <source srcSet={signupIllustrationWebp} type="image/webp" />
              <img
                src={signupIllustration}
                alt="Sign Up"
                loading="lazy"
                decoding="async"
              />
            </picture>
          </div>

        </div>


        {/* =================================================
            RIGHT FORM PANEL
        ================================================= */}

        <div className="signup-form-panel">

          {success ? (

            /*
            =================================================
            SUCCESS SCREEN
            =================================================
            */

            <div className="success-state">

              <div className="success-icon">
                <BigCheckIcon />
              </div>

              <h2 className="success-title">
                Account created successfully!
              </h2>

              <p className="success-subtitle">
                Your account has been created.
                Redirecting to login...
              </p>

              <span
                className="success-spinner"
                aria-hidden="true"
              />

            </div>

          ) : (

            <>
              <h1 className="signup-title">
                Create your account
              </h1>

              <p className="signup-subtitle">
                Sign up to get started with SMFinTrack.
              </p>


              <form
                className="signup-form"
                onSubmit={handleSubmit}
                noValidate
              >


                {/* =================================================
                    API ERROR
                ================================================= */}

                {apiError && (
                  <div className="api-error">
                    {apiError}
                  </div>
                )}


                {/* =================================================
                    FIRST NAME
                ================================================= */}

                <div className="form-group">

                  <label htmlFor="firstName">
                    First name
                  </label>

                  <div
                    className={`input-wrap ${
                      shownError("firstName")
                        ? "input-error"
                        : ""
                    } ${
                      isFieldValid("firstName")
                        ? "input-valid"
                        : ""
                    }`}
                  >

                    <span className="input-icon">
                      <UserIcon />
                    </span>

                    <input
                      id="firstName"
                      name="firstName"
                      type="text"
                      placeholder="Enter your first name"
                      value={form.firstName}
                      onChange={handleChange}
                      onBlur={handleBlur}
                    />

                    {isFieldValid("firstName") && (
                      <span className="status-icon">
                        <CheckIcon />
                      </span>
                    )}

                  </div>

                  {shownError("firstName") && (
                    <span className="field-error">
                      {shownError("firstName")}
                    </span>
                  )}

                </div>


                {/* =================================================
                    LAST NAME
                ================================================= */}

                <div className="form-group">

                  <label htmlFor="lastName">
                    Last name
                  </label>

                  <div
                    className={`input-wrap ${
                      shownError("lastName")
                        ? "input-error"
                        : ""
                    } ${
                      isFieldValid("lastName")
                        ? "input-valid"
                        : ""
                    }`}
                  >

                    <span className="input-icon">
                      <UserIcon />
                    </span>

                    <input
                      id="lastName"
                      name="lastName"
                      type="text"
                      placeholder="Enter your last name"
                      value={form.lastName}
                      onChange={handleChange}
                      onBlur={handleBlur}
                    />

                    {isFieldValid("lastName") && (
                      <span className="status-icon">
                        <CheckIcon />
                      </span>
                    )}

                  </div>

                  {shownError("lastName") && (
                    <span className="field-error">
                      {shownError("lastName")}
                    </span>
                  )}

                </div>


                {/* =================================================
                    EMAIL
                ================================================= */}

                <div className="form-group">

                  <label htmlFor="email">
                    Email address
                  </label>

                  <div
                    className={`input-wrap ${
                      shownError("email")
                        ? "input-error"
                        : ""
                    } ${
                      isFieldValid("email")
                        ? "input-valid"
                        : ""
                    }`}
                  >

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
                      onBlur={handleBlur}
                    />

                    {isFieldValid("email") && (
                      <span className="status-icon">
                        <CheckIcon />
                      </span>
                    )}

                  </div>

                  {shownError("email") && (
                    <span className="field-error">
                      {shownError("email")}
                    </span>
                  )}

                </div>

                <div className="form-group">

                  <label htmlFor="university">
                    University
                  </label>

                  <div
                    className={`input-wrap ${
                      shownError("university")
                        ? "input-error"
                        : ""
                    } ${
                      isFieldValid("university")
                        ? "input-valid"
                        : ""
                    }`}
                  >

                    <span className="input-icon">
                      <UserIcon />
                    </span>

                    <input
                      id="university"
                      name="university"
                      type="text"
                      placeholder="Enter your university"
                      value={form.university}
                      onChange={handleChange}
                      onBlur={handleBlur}
                    />

                    {isFieldValid("university") && (
                      <span className="status-icon">
                        <CheckIcon />
                      </span>
                    )}

                  </div>

                  {shownError("university") && (
                    <span className="field-error">
                      {shownError("university")}
                    </span>
                  )}

                </div>


                {/* =================================================
                    PASSWORD
                ================================================= */}

                <div className="form-group">

                  <label htmlFor="password">
                    Password
                  </label>

                  <div
                    className={`input-wrap ${
                      shownError("password")
                        ? "input-error"
                        : ""
                    } ${
                      isFieldValid("password")
                        ? "input-valid"
                        : ""
                    }`}
                  >

                    <span className="input-icon">
                      <LockIcon />
                    </span>

                    <input
                      id="password"
                      name="password"
                      type={
                        showPassword
                          ? "text"
                          : "password"
                      }
                      placeholder="Enter your password"
                      value={form.password}
                      onChange={handleChange}
                      onBlur={handleBlur}
                    />

                    {isFieldValid("password") && (
                      <span className="status-icon">
                        <CheckIcon />
                      </span>
                    )}

                    <button
                      type="button"
                      className="toggle-visibility"
                      onClick={() =>
                        setShowPassword(
                          (value) => !value
                        )
                      }
                      tabIndex={-1}
                      aria-label={
                        showPassword
                          ? "Hide password"
                          : "Show password"
                      }
                    >
                      <EyeIcon
                        off={showPassword}
                      />
                    </button>

                  </div>

                  {shownError("password") && (
                    <span className="field-error">
                      {shownError("password")}
                    </span>
                  )}

                </div>


                {/* =================================================
                    CONFIRM PASSWORD
                ================================================= */}

                <div className="form-group">

                  <label htmlFor="confirmPassword">
                    Confirm password
                  </label>

                  <div
                    className={`input-wrap ${
                      shownError("confirmPassword")
                        ? "input-error"
                        : ""
                    } ${
                      isFieldValid("confirmPassword")
                        ? "input-valid"
                        : ""
                    }`}
                  >

                    <span className="input-icon">
                      <LockIcon />
                    </span>

                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={
                        showConfirmPassword
                          ? "text"
                          : "password"
                      }
                      placeholder="Confirm your password"
                      value={form.confirmPassword}
                      onChange={handleChange}
                      onBlur={handleBlur}
                    />

                    {isFieldValid("confirmPassword") && (
                      <span className="status-icon">
                        <CheckIcon />
                      </span>
                    )}

                    <button
                      type="button"
                      className="toggle-visibility"
                      onClick={() =>
                        setShowConfirmPassword(
                          (value) => !value
                        )
                      }
                      tabIndex={-1}
                      aria-label={
                        showConfirmPassword
                          ? "Hide password"
                          : "Show password"
                      }
                    >
                      <EyeIcon
                        off={showConfirmPassword}
                      />
                    </button>

                  </div>

                  {shownError("confirmPassword") && (
                    <span className="field-error">
                      {shownError("confirmPassword")}
                    </span>
                  )}

                </div>


                {/* =================================================
                    SIGN UP BUTTON
                ================================================= */}

                <button
                  type="submit"
                  className="signup-button"
                  disabled={loading}
                >
                  {loading
                    ? "Signing up..."
                    : "Sign Up"}
                </button>


                {/* =================================================
                    LOGIN LINK
                ================================================= */}

                <p className="login-hint">
                  Already have an account?{" "}
                  <Link to="/login">
                    Login
                  </Link>
                </p>

              </form>
            </>

          )}

        </div>

      </div>

    </div>
  );
}