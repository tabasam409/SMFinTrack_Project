import "./Input.css";

import { Search, Eye, EyeOff } from "lucide-react";

function Input({
  label = "",
  type = "text",
  placeholder = "Enter text",
  value = "",
  onChange = () => {},
  disabled = false,
  required = false,

  // default | focused | error | success
  variant = "default",

  // left icon
  icon = "",

  // helper text
  helperText = "",

  // textarea
  textarea = false,
  rows = 4,

  // password
  showPasswordToggle = false,
  passwordVisible = false,
  onTogglePassword = () => {},

  className = "",
}) {
  const inputType =
    showPasswordToggle && type === "password"
      ? passwordVisible
        ? "text"
        : "password"
      : type;

  const wrapperClass = `
    input-wrapper
    input-${variant}
    ${disabled ? "input-disabled" : ""}
    ${className}
  `;

  return (
    <div className={wrapperClass.trim()}>

      {label && (
        <label className="input-label">
          {label}
        </label>
      )}

      <div className="input-box">

        {/* LEFT ICON */}

        {icon && (
          <span className="input-icon-left">
            {icon === "search"
              ? <Search size={18} />
              : icon}
          </span>
        )}

        {/* TEXTAREA */}

        {textarea ? (

          <textarea
            rows={rows}
            placeholder={placeholder}
            disabled={disabled}
            className="text-area"
          />

        ) : (

          <input
            type={inputType}
            value={value}
            placeholder={placeholder}
            onChange={onChange}
            disabled={disabled}
            required={required}
            className={`
              input-field
              ${icon ? "has-left-icon" : ""}
              ${showPasswordToggle ? "has-right-icon" : ""}
            `}
          />

        )}

        {/* PASSWORD TOGGLE */}

        {!textarea && showPasswordToggle && (

          <button
            type="button"
            className="input-icon-right"
            onClick={onTogglePassword}
          >
            {passwordVisible ? (
              <EyeOff size={18} />
            ) : (
              <Eye size={18} />
            )}
          </button>

        )}

      </div>

      {/* HELPER TEXT */}

      {helperText && (
        <p className={`input-helper helper-${variant}`}>
          {helperText}
        </p>
      )}

    </div>
  );
}

export default Input;