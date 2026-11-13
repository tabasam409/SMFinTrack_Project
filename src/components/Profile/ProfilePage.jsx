import { useState } from "react";
import {
  Menu,
  UserRound,
  Building2,
  GraduationCap,
  CircleDollarSign,
  Save,
  Info,
  X,
  Check,
  ChevronDown,
} from "lucide-react";

import { BudgetSidebar, SHELL_STYLES } from "../BudgetSetupPage/BudgetSetupPage";
import TopNavigation from "../TopNavigation/TopNavigation";
import "./ProfilePage.css";

/* =========================================================================
   SMFinTrack — Profile Page
   Ported from Awais's SMFinTrack_Project (src/components/Profile),
   dropped into the same bsp-sidebar / TopNavigation shell every other
   page in this app uses (see BudgetSetupPage.jsx). Content, layout and
   class names below are otherwise unchanged from Awais's version.
   ========================================================================= */

function ProfilePage({ onNavigate }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [profile, setProfile] = useState({
    firstName: "Muhammad",
    lastName: "Awais",
    university: "National University of Modern Languages (NUML)",
    semester: "6th Semester",
    monthlyIncome: "50000",
  });

  const [showSuccess, setShowSuccess] = useState(true);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;

    setProfile((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }

    setShowSuccess(false);
  };

  const validateForm = () => {
    const newErrors = {};

    if (!profile.firstName.trim()) {
      newErrors.firstName = "First name is required.";
    }

    if (!profile.lastName.trim()) {
      newErrors.lastName = "Last name is required.";
    }

    if (!profile.university.trim()) {
      newErrors.university = "University is required.";
    }

    if (!profile.semester.trim()) {
      newErrors.semester = "Semester is required.";
    }

    if (!profile.monthlyIncome.trim()) {
      newErrors.monthlyIncome = "Monthly income is required.";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) {
      setShowSuccess(false);
      return;
    }

    setShowSuccess(true);

    setTimeout(() => {
      setShowSuccess(false);
    }, 5000);
  };

  return (
    <div className="bsp-app">
      <style>{SHELL_STYLES}</style>

      <BudgetSidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        activeId="profile"
        onNavigate={onNavigate}
      />

      <main className="bsp-main">
        <TopNavigation
          title="Profile"
          userInitials={profile.firstName.charAt(0)}
          onSettingsClick={() => onNavigate && onNavigate("settings")}
        />

        <button
          type="button"
          className="bsp-menu-btn pp-mobile-menu"
          onClick={() => setSidebarOpen(true)}
          aria-label="Open menu"
        >
          <Menu size={20} />
        </button>

        <div className="profile-page">

          {/* ================= PAGE HEADING ================= */}
          <section className="profile-heading-row">

            <div className="profile-heading-text">
              <h1>My Profile</h1>

              <p>
                Manage your personal and university information.
              </p>
            </div>

            {/* ================= SUCCESS MESSAGE ================= */}
            {showSuccess && (
              <div className="profile-success-message">

                <div className="success-icon">
                  <Check size={19} strokeWidth={3} />
                </div>

                <span>Profile updated successfully!</span>

                <button
                  type="button"
                  className="success-close"
                  onClick={() => setShowSuccess(false)}
                  aria-label="Close success message"
                >
                  <X size={17} />
                </button>

              </div>
            )}

          </section>

          {/* ================= PROFILE CARD ================= */}
          <form
            className="profile-card"
            onSubmit={handleSubmit}
          >

            {/* ================= CARD HEADER ================= */}
            <div className="profile-card-header">

              <div className="profile-card-icon">
                <UserRound
                  size={32}
                  strokeWidth={2}
                />
              </div>

              <div className="profile-card-heading">
                <h2>Personal Information</h2>

                <p>
                  Keep your profile information updated to get the best experience.
                </p>
              </div>

            </div>

            <div className="profile-divider" />

            {/* ================= FORM FIELDS ================= */}
            <div className="profile-form">

              {/* FIRST NAME */}
              <div className="profile-field">

                <label htmlFor="firstName">
                  First Name <span>*</span>
                </label>

                <div
                  className={`profile-input-wrapper ${
                    errors.firstName ? "input-error" : ""
                  }`}
                >
                  <UserRound size={21} />

                  <input
                    id="firstName"
                    name="firstName"
                    type="text"
                    value={profile.firstName}
                    onChange={handleChange}
                    placeholder="Enter first name"
                  />
                </div>

                {errors.firstName && (
                  <small className="field-error">
                    {errors.firstName}
                  </small>
                )}

              </div>

              {/* LAST NAME */}
              <div className="profile-field">

                <label htmlFor="lastName">
                  Last Name <span>*</span>
                </label>

                <div
                  className={`profile-input-wrapper ${
                    errors.lastName ? "input-error" : ""
                  }`}
                >
                  <UserRound size={21} />

                  <input
                    id="lastName"
                    name="lastName"
                    type="text"
                    value={profile.lastName}
                    onChange={handleChange}
                    placeholder="Enter last name"
                  />
                </div>

                {errors.lastName && (
                  <small className="field-error">
                    {errors.lastName}
                  </small>
                )}

              </div>

              {/* UNIVERSITY - FULL WIDTH */}
              <div className="profile-field profile-field-full">

                <label htmlFor="university">
                  University <span>*</span>
                </label>

                <div
                  className={`profile-input-wrapper ${
                    errors.university ? "input-error" : ""
                  }`}
                >
                  <Building2 size={21} />

                  <input
                    id="university"
                    name="university"
                    type="text"
                    value={profile.university}
                    onChange={handleChange}
                    placeholder="Enter university name"
                  />
                </div>

                {errors.university && (
                  <small className="field-error">
                    {errors.university}
                  </small>
                )}

              </div>

              {/* SEMESTER */}
              <div className="profile-field">

                <label htmlFor="semester">
                  Semester <span>*</span>
                </label>

                <div
                  className={`profile-input-wrapper profile-select-wrapper ${
                    errors.semester ? "input-error" : ""
                  }`}
                >
                  <GraduationCap size={21} />

                  <select
                    id="semester"
                    name="semester"
                    value={profile.semester}
                    onChange={handleChange}
                  >
                    <option value="">Select semester</option>
                    <option value="1st Semester">1st Semester</option>
                    <option value="2nd Semester">2nd Semester</option>
                    <option value="3rd Semester">3rd Semester</option>
                    <option value="4th Semester">4th Semester</option>
                    <option value="5th Semester">5th Semester</option>
                    <option value="6th Semester">6th Semester</option>
                    <option value="7th Semester">7th Semester</option>
                    <option value="8th Semester">8th Semester</option>
                  </select>

                  <ChevronDown
                    className="select-arrow"
                    size={19}
                  />
                </div>

                {errors.semester && (
                  <small className="field-error">
                    {errors.semester}
                  </small>
                )}

              </div>

              {/* MONTHLY INCOME */}
              <div className="profile-field">

                <label htmlFor="monthlyIncome">
                  Monthly Income (PKR) <span>*</span>
                </label>

                <div
                  className={`profile-input-wrapper ${
                    errors.monthlyIncome ? "input-error" : ""
                  }`}
                >
                  <CircleDollarSign size={21} />

                  <input
                    id="monthlyIncome"
                    name="monthlyIncome"
                    type="number"
                    min="0"
                    value={profile.monthlyIncome}
                    onChange={handleChange}
                    placeholder="Enter monthly income"
                  />
                </div>

                {errors.monthlyIncome && (
                  <small className="field-error">
                    {errors.monthlyIncome}
                  </small>
                )}

              </div>

            </div>

            {/* ================= BOTTOM AREA ================= */}
            <div className="profile-bottom">

              {/* INFORMATION BOX */}
              <div className="profile-info-box">

                <div className="profile-info-icon">
                  <Info size={15} strokeWidth={2.5} />
                </div>

                <p>
                  Your profile information helps us personalize your budgeting
                  experience and provide better financial insights.
                </p>

              </div>

              {/* SAVE BUTTON */}
              <button
                type="submit"
                className="save-profile-button"
              >
                <Save size={21} strokeWidth={2} />

                <span>Save Changes</span>
              </button>

            </div>

          </form>

        </div>
      </main>
    </div>
  );
}

export default ProfilePage;
