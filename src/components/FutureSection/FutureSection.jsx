import "./FutureSection.css";

import {
  GraduationCap,
  Sparkles,
  WalletCards,
  ShieldCheck,
} from "lucide-react";

function FutureSection() {
  return (
    <section className="future-section" id="benefits">

      <div className="future-container">

        {/* Card 1 */}

        <div className="future-item">

          <div className="future-icon">
            <GraduationCap size={22} />
          </div>

          <div className="future-content">
            <h3>Students First</h3>
            <p>Built for students in Pakistan</p>
          </div>

        </div>

        {/* Card 2 */}

        <div className="future-item">

          <div className="future-icon">
            <Sparkles size={22} />
          </div>

          <div className="future-content">
            <h3>Smart Predictions</h3>
            <p>Know what you'll spend next</p>
          </div>

        </div>

        {/* Card 3 */}

        <div className="future-item">

          <div className="future-icon">
            <WalletCards size={22} />
          </div>

          <div className="future-content">
            <h3>Catch Subscriptions</h3>
            <p>Find and manage recurring charges</p>
          </div>

        </div>
        
        {/* Card 4 */}

        <div className="future-item">

          <div className="future-icon">
            <ShieldCheck size={22} />
          </div>

          <div className="future-content">
            <h3>Early Alerts</h3>
            <p>Warnings before you overspend</p>
          </div>

        </div>

      </div>

    </section>
  );
}

export default FutureSection;