import "./Dropdown.css";

import { useState } from "react";
import { ChevronDown, X } from "lucide-react";

function Dropdown({
  label = "",
  placeholder = "Select an option",

  options = [],

  value = "",
  onChange = () => {},

  disabled = false,

  helperText = "",

  variant = "default",

  icon = null,

  multiple = false,

  className = "",
}) {
  const [open, setOpen] = useState(false);

  const toggleDropdown = () => {
    if (!disabled) {
      setOpen((prev) => !prev);
    }
  };

  const handleSelect = (option) => {
    const selectedValue =
      typeof option === "string" ? option : option.label;

    if (!multiple) {
      onChange(selectedValue);
      setOpen(false);
      return;
    }

    const currentValue = Array.isArray(value) ? value : [];

    if (currentValue.includes(selectedValue)) {
      onChange(
        currentValue.filter((item) => item !== selectedValue)
      );
    } else {
      onChange([...currentValue, selectedValue]);
    }
  };

  const removeTag = (item, e) => {
    e.stopPropagation();

    if (!Array.isArray(value)) return;

    onChange(value.filter((v) => v !== item));
  };

  return (
    <div
      className={`dropdown-wrapper dropdown-${variant} ${
        disabled ? "dropdown-disabled" : ""
      } ${className}`}
    >
      {label && (
        <label className="dropdown-label">
          {label}
        </label>
      )}

      <div
        className={`dropdown-box ${open ? "dropdown-open" : ""}`}
        onClick={toggleDropdown}
      >
        {icon && (
          <span className="dropdown-icon-left">
            {icon}
          </span>
        )}

        {!multiple ? (
          <span
            className={`dropdown-value ${
              value ? "selected" : ""
            }`}
          >
            {value || placeholder}
          </span>
        ) : (
          <div className="dropdown-tags">
            {Array.isArray(value) &&
              value.map((item) => (
                <span
                  className="dropdown-tag"
                  key={item}
                >
                  {item}

                  <button
                    type="button"
                    className="tag-remove"
                    onClick={(e) => removeTag(item, e)}
                  >
                    <X size={12} />
                  </button>
                </span>
              ))}

            {(!Array.isArray(value) ||
              value.length === 0) && (
              <span className="dropdown-placeholder">
                {placeholder}
              </span>
            )}
          </div>
        )}

        <ChevronDown
          size={18}
          className={`dropdown-arrow ${
            open ? "rotate" : ""
          }`}
        />
      </div>

      {open && (
        <div className="dropdown-menu">
          {options.map((option, index) => {
            const optionLabel =
              typeof option === "string"
                ? option
                : option.label;

            const optionIcon =
              typeof option === "string"
                ? null
                : option.icon;

            const active = multiple
              ? Array.isArray(value) &&
                value.includes(optionLabel)
              : value === optionLabel;

            return (
              <div
                key={index}
                className={`dropdown-item ${
                  active ? "active" : ""
                }`}
                onClick={() => handleSelect(option)}
              >
                {optionIcon && (
                  <span className="dropdown-item-icon">
                    {optionIcon}
                  </span>
                )}

                <span>{optionLabel}</span>
              </div>
            );
          })}
        </div>
      )}

      {helperText && (
        <p className={`dropdown-helper helper-${variant}`}>
          {helperText}
        </p>
      )}
    </div>
  );
}

export default Dropdown;