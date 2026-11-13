import "./Card.css";

function Card({
  variant = "budget",

  icon = null,

  title = "",

  subtitle = "",

  amount = "",

  secondaryAmount = "",

  badge = "",

  progress = 0,

  progressLabel = "",

  footer = "",

  status = "",

  trend = "",

  trendIcon = null,

  children,

  className = "",
}) {
  return (
    <div
      className={`card card-${variant} ${className}`}
    >
      {/* ================= HEADER ================= */}

      <div className="card-header">

        <div className="card-header-left">

          {icon && (
            <div className="card-icon">
              {icon}
            </div>
          )}

          <div>

            <h3 className="card-title">
              {title}
            </h3>

            {subtitle && (
              <p className="card-subtitle">
                {subtitle}
              </p>
            )}

          </div>

        </div>

        {badge && (
          <span className="card-badge">
            {badge}
          </span>
        )}

      </div>

      {/* ================= BODY ================= */}

      <div className="card-body">

        {amount && (
          <h2 className="card-amount">
            {amount}
          </h2>
        )}

        {secondaryAmount && (
          <p className="card-secondary">
            {secondaryAmount}
          </p>
        )}

        {/* Progress Bar */}

        {progress > 0 && (

          <div className="card-progress-wrapper">

            <div className="card-progress">

              <div
                className="card-progress-fill"
                style={{
                  width: `${progress}%`,
                }}
              />

            </div>

            {progressLabel && (
              <span className="card-progress-label">
                {progressLabel}
              </span>
            )}

          </div>

        )}

        {/* Extra Content */}

        {children}

      </div>

      {/* ================= FOOTER ================= */}

      {(footer || status || trend) && (

        <div className="card-footer">

          {footer && (
            <p className="card-footer-text">
              {footer}
            </p>
          )}

          {trend && (
            <div className="card-trend">

              {trendIcon && trendIcon}

              <span>{trend}</span>

            </div>
          )}

          {status && (
            <span className="card-status">
              {status}
            </span>
          )}

        </div>

      )}

    </div>
  );
}

export default Card;