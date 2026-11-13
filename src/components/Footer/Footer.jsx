import { useState } from "react";
import "./Footer.css";
// import { facebook, Instagram, Twitter, Linkedin, Layers } from "lucide-react";
import { Layers } from "lucide-react";

import {
  FaFacebookF,
  FaInstagram,
  FaLinkedinIn,
  FaXTwitter,
} from "react-icons/fa6";

function Footer() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle"); // idle | loading | success | error
  const [message, setMessage] = useState("");

  const handleSubscribe = async (e) => {
    e.preventDefault();

    const trimmed = email.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!trimmed) {
      setStatus("error");
      setMessage("Please enter your email address.");
      return;
    }

    if (!emailRegex.test(trimmed)) {
      setStatus("error");
      setMessage("Please enter a valid email address.");
      return;
    }

    setStatus("loading");
    setMessage("");

    try {
      // =================================================
      // BACKEND API CODE - COMMENTED OUT FOR NOW
      // Connect this when the newsletter endpoint is live.
      // =================================================

      /*
      const response = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmed.toLowerCase() }),
      });
      if (!response.ok) throw new Error("Subscription failed");
      */

      // =================================================
      // TEMPORARY FRONTEND SUBSCRIPTION
      // Save subscriber locally for now.
      // =================================================

      const subscribers = JSON.parse(
        localStorage.getItem("smfintrack_subscribers") || "[]"
      );
      const normalized = trimmed.toLowerCase();

      if (!subscribers.includes(normalized)) {
        subscribers.push(normalized);
        localStorage.setItem(
          "smfintrack_subscribers",
          JSON.stringify(subscribers)
        );
      }

      setEmail("");
      setStatus("success");
      setMessage("Thanks for subscribing! You're on the list.");
    } catch (error) {
      console.error("Subscribe error:", error);
      setStatus("error");
      setMessage("Something went wrong. Please try again.");
    }
  };

  return (
    <footer className="footer-section" id="about-us">
      <div className="footer-top">

        {/* Brand */}
        <div className="footer-brand">
          <div className="footer-logo">
            <Layers size={20} />
            <span>SMFinTrack</span>
          </div>
          <p>Know where it's going, before it's gone.</p>

          <div className="footer-socials">
            <a href="#"><FaFacebookF size={16} /></a>
            <a href="#"><FaInstagram size={16} /></a>
            <a href="#"><FaXTwitter size={16} /></a>
            <a href="#"><FaLinkedinIn size={16} /></a>
          </div>
        </div>

        {/* Product */}
        <div className="footer-col">
          <h4>Product</h4>
          <a href="#">Features</a>
          <a href="#">How It Works</a>
          <a href="#">Pricing</a>
          <a href="#">Updates</a>
        </div>

        {/* Company */}
        <div className="footer-col">
          <h4>Company</h4>
          <a href="#">About Us</a>
          <a href="#">Blog</a>
          <a href="#">Careers</a>
          <a href="#">Contact Us</a>
        </div>

        {/* Support */}
        <div className="footer-col">
          <h4>Support</h4>
          <a href="#">Help Center</a>
          <a href="#">Privacy Policy</a>
          <a href="#">Terms of Service</a>
          <a href="#">FAQ</a>
        </div>

        {/* Newsletter */}
        <div className="footer-newsletter">
          <h4>Stay Updated</h4>
          <p>Subscribe to our newsletter for tips and updates.</p>

          <form className="newsletter-form" onSubmit={handleSubscribe}>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={status === "loading"}
              aria-label="Email address"
            />
            <button type="submit" disabled={status === "loading"}>
              {status === "loading" ? "Subscribing..." : "Subscribe"}
            </button>
          </form>

          {message && (
            <p
              className={
                status === "success"
                  ? "newsletter-message newsletter-success"
                  : "newsletter-message newsletter-error"
              }
              role="status"
            >
              {message}
            </p>
          )}
        </div>

      </div>

      <div className="footer-bottom">
        <p>© 2026 SMFinTrack. All rights reserved.</p>
      </div>
    </footer>
  );
}

export default Footer;