import "./SpacingSection.css";

function SpacingSection() {
  return (
    <section id="spacing" className="spacing-section">

      {/* ==========================
          SECTION TITLE
      =========================== */}

      <h2 className="spacing-section-title">
        8. Spacing Scale
      </h2>

      {/* ==========================
          SPACING CARD
      =========================== */}

      <div className="spacing-card">

        {/* ==========================
            LEFT COLUMN
        =========================== */}

        <div className="spacing-column">

          {/* 4px */}

          <div className="spacing-row">

            <span className="spacing-label">
              4px
            </span>

            <div className="spacing-preview">

              <div className="spacing-box spacing-4"></div>

            </div>

          </div>

          {/* 8px */}

          <div className="spacing-row">

            <span className="spacing-label">
              8px
            </span>

            <div className="spacing-preview">

              <div className="spacing-box spacing-8"></div>

            </div>

          </div>

          {/* 16px */}

          <div className="spacing-row">

            <span className="spacing-label">
              16px
            </span>

            <div className="spacing-preview">

              <div className="spacing-box spacing-16"></div>

            </div>

          </div>

        </div>

        {/* ==========================
            RIGHT COLUMN
        =========================== */}

        <div className="spacing-column">

          {/* 24px */}

          <div className="spacing-row">

            <span className="spacing-label">
              24px
            </span>

            <div className="spacing-preview">

              <div className="spacing-box spacing-24"></div>

            </div>

          </div>

          {/* 32px */}

          <div className="spacing-row">

            <span className="spacing-label">
              32px
            </span>

            <div className="spacing-preview">

              <div className="spacing-box spacing-32"></div>

            </div>

          </div>

          {/* 48px */}

          <div className="spacing-row">

            <span className="spacing-label">
              48px
            </span>

            <div className="spacing-preview">

              <div className="spacing-box spacing-48"></div>

            </div>

          </div>

        </div>

      </div>

    </section>
  );
}

export default SpacingSection;