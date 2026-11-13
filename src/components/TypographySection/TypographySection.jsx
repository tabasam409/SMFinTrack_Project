import "./TypographySection.css";

import TypographyCard from "../TypographyCard";

function TypographySection() {
  return (
    <section id="typography" className="typography-section">

      {/* ===========================
          Section Heading
      =========================== */}

      <h2 className="typography-section-title">
        7. Typography
      </h2>

      {/* ===========================
          Typography Card
      =========================== */}

      <div className="typography-container">

        <TypographyCard />

      </div>

    </section>
  );
}

export default TypographySection;