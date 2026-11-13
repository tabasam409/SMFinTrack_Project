import "./HeroSection.css";
import Dashboard from "../DashBoard/DashBoard";
import Button from "../Button";
import dashboardPreview from "../../assets/dashboard-preview.png";
import dashboardPreviewWebp from "../../assets/dashboard-preview.webp";
import { useNavigate } from "react-router-dom";

import {
  Sparkles,
  Play,
  ArrowRight,
  ShieldCheck,
  Zap,
  Lock,
} from "lucide-react";

<div className="hero-right">
    <Dashboard/>
</div>
function HeroSection() {
  const navigate = useNavigate();
  return (
    <section className="hero">

      <div className="hero-container">

        {/* ================= LEFT ================= */}

        <div className="hero-left">

          {/* Badge */}

          <div className="hero-badge">

            <Sparkles size={15} />

            <span>Personal Finance Tracker for Students</span>

          </div>

          {/* Heading */}

          <h1 className="hero-title">

            Know where
            <br />

            it's going,

            <br />

            <span>before it's gone.</span>

          </h1>

          {/* Description */}

          <p className="hero-description">

            Track expenses, manage budgets, and predict next
            month's spending. Get early warnings and stay in
            control of your money.

          </p>

          {/* Buttons */}

          <div className="hero-buttons">

            <Button
              variant="primary"
              size="large"
              iconRight={<ArrowRight size={18} />}
              onClick={() => navigate("/signup")}
            >
              Get Started Free
            </Button>

            <Button
              variant="secondary"
              size="large"
              iconLeft={<Play size={16} fill="#004C48" color="#004C48" />}
            >
              See How It Works
            </Button>

          </div>

          {/* Trust */}

          <div className="hero-trust">

            <div className="trust-item">

              <Lock size={18} />

              <span>No Credit Card</span>

            </div>

            <div className="trust-item">

              <Zap size={18} />

              <span>Quick Setup</span>

            </div>

            <div className="trust-item">

              <ShieldCheck size={18} />

              <span>100% Secure</span>

            </div>

          </div>

        </div>

        {/* ================= RIGHT ================= */}

        <div className="hero-right">

          <picture>
            <source srcSet={dashboardPreviewWebp} type="image/webp" />
            <img
              src={dashboardPreview}
              alt="SMFinTrack Dashboard"
              className="hero-dashboard"
              decoding="async"
            />
          </picture>

        </div>

      </div>

    </section>
  );
}

export default HeroSection;