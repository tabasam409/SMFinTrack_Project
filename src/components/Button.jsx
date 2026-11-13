import "./Button.css";
import { Loader2 } from "lucide-react";

function Button({
  children = "Button",
  variant = "primary",
  size = "medium",

  iconLeft = null,
  iconRight = null,
  iconOnly = null,

  loading = false,
  disabled = false,

  onClick,
}) {
  const classes = [
    "btn",
    `btn-${variant}`,
    `btn-${size}`,
    iconOnly ? "btn-icon-only" : "",
    loading ? "btn-loading" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button
      className={classes}
      disabled={disabled || loading}
      onClick={onClick}
    >
      {loading && (
        <>
          <Loader2 className="btn-spinner" size={16} />
          {!iconOnly && <span>{children}</span>}
        </>
      )}

      {!loading && iconOnly && iconOnly}

      {!loading && !iconOnly && (
        <>
          {iconLeft && (
            <span className="btn-icon">
              {iconLeft}
            </span>
          )}

          <span className="btn-text">
            {children}
          </span>

          {iconRight && (
            <span className="btn-icon">
              {iconRight}
            </span>
          )}
        </>
      )}
    </button>
  );
}

export default Button;