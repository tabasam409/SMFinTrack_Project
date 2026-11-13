import "./TypographyCard.css";


function TypographyCard() {
  return (
    <div className="typography-card">

      {/* ===========================
          Heading 1
      =========================== */}

      <div className="type-item">

        <h1 className="heading-1">
          Heading 1
        </h1>

        <p className="type-spec">
          Manrope • 36px • Bold • Page Titles
        </p>

      </div>

      {/* ===========================
          Heading 2
      =========================== */}

      <div className="type-item">

        <h2 className="heading-2">
          Heading 2
        </h2>

        <p className="type-spec">
          Manrope • 28px • Bold • Section Titles
        </p>

      </div>

      {/* ===========================
          Heading 3
      =========================== */}

      <div className="type-item">

        <h3 className="heading-3">
          Heading 3
        </h3>

        <p className="type-spec">
          Manrope • 22px • SemiBold • Card Titles
        </p>

      </div>

      {/* ===========================
          Body Large
      =========================== */}

      <div className="type-item">

        <p className="body-large">
          Body Large — The quick brown fox jumps over the lazy dog.
        </p>

        <p className="type-spec">
          Inter • 16px • Regular • Main Content
        </p>

      </div>

      {/* ===========================
          Body Small
      =========================== */}

      <div className="type-item">

        <p className="body-small">
          Body Small — The quick brown fox jumps over the lazy dog.
        </p>

        <p className="type-spec">
          Inter • 14px • Regular • Secondary Content
        </p>

      </div>

      {/* ===========================
          Caption
      =========================== */}

      <div className="type-item">

        <span className="caption">
          Caption Text
        </span>

        <p className="type-spec">
          Inter • 12px • Regular • Labels & Helper Text
        </p>

      </div>

    </div>
  );
}

export default TypographyCard;