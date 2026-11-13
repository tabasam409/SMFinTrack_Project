import "./TestimonialStats.css";
import { Star, Users, BarChart3, CheckCircle2 } from "lucide-react";

function TestimonialStats() {
  return (
    <section className="testimonial-section">
      <div className="testimonial-card">

        {/* Left: review */}
        <div className="testimonial-review">
          <div className="testimonial-stars">
            <Star size={16} fill="#FBBF24" stroke="#FBBF24" />
            <Star size={16} fill="#FBBF24" stroke="#FBBF24" />
            <Star size={16} fill="#FBBF24" stroke="#FBBF24" />
            <Star size={16} fill="#FBBF24" stroke="#FBBF24" />
            <Star size={16} fill="#FBBF24" stroke="#FBBF24" />
          </div>

          <p className="testimonial-text">
            SMFinTrack helped me understand my spending and save more every
            month. Highly recommended for every student!
          </p>

          <div className="testimonial-author">
            {/* <img
              src="/avatar-placeholder.jpg"
              alt="awais , University Student"
              className="testimonial-avatar"
            /> */}
            <span>– AWAIS, NUML University (Student)</span>
          </div>
        </div>

        {/* Divider */}
        <div className="testimonial-divider"></div>

        {/* Right: stats */}
        <div className="testimonial-stats">

          <div className="stat-item">
            <div className="stat-icon">
              <Users size={20} />
            </div>
            <div className="stat-text">
              <h4>1K+</h4>
              <p>Students Using</p>
            </div>
          </div>

          <div className="stat-item">
            <div className="stat-icon">
              <BarChart3 size={20} />
            </div>
            <div className="stat-text">
              <h4>2.5M+</h4>
              <p>Transactions Analyzed</p>
            </div>
          </div>

          <div className="stat-item">
            <div className="stat-icon">
              <CheckCircle2 size={20} />
            </div>
            <div className="stat-text">
              <h4>92%</h4>
              <p>Users Improved Budgeting</p>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

export default TestimonialStats;