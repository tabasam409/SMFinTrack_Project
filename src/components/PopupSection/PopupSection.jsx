import "./PopupSection.css";

import Popup from "../Popup";

import {
  Upload,
  TriangleAlert,
  Check,
  X,
} from "lucide-react";

function PopupSection() {
  return (
    <section id="popup" className="popup-section">

      {/* ===========================
          Section Heading
      =========================== */}

      <h2 className="section-title">
        5. Modal / Popup Examples
      </h2>

      {/* ===========================
          Popup Cards
      =========================== */}

      <div className="popup-grid">

        {/* ===================================
            Upload Statement
        ==================================== */}

        <Popup className="upload-popup">

          <div className="popup-header">

            <h3>Upload Statement</h3>

            <button className="popup-close">
              <X size={18} />
            </button>

          </div>

          <div className="upload-box">

            <Upload
              size={42}
              strokeWidth={1.8}
            />

            <p className="upload-text">
              Drag &amp; drop your CSV or Excel file
            </p>

            <span className="upload-or">
              or
            </span>

            <button className="choose-file-btn">
              Choose File
            </button>

          </div>

          <div className="popup-actions">

            <button className="btn-cancel">
              Cancel
            </button>

            <button className="btn-upload">
              Upload
            </button>

          </div>

        </Popup>

        {/* ===================================
            Delete Transaction
        ==================================== */}

        <Popup className="delete-popup">

          <div className="popup-header">

            <div className="popup-title-row">

              <TriangleAlert
                size={20}
                className="danger-icon"
              />

              <h3>Delete Transaction</h3>

            </div>

            <button className="popup-close">
              <X size={18} />
            </button>

          </div>

          <div className="popup-content">

            <h4>
              Are you sure you want to delete this transaction?
            </h4>

            <p>
              This action cannot be undone.
            </p>

          </div>

          <div className="popup-actions">

            <button className="btn-cancel">
              Cancel
            </button>

            <button className="btn-delete">
              Delete
            </button>

          </div>

        </Popup>

        {/* ===================================
            Success
        ==================================== */}

        <Popup className="success-popup">

          <div className="popup-header">

            <div className="popup-title-row">

              <div className="success-outline">

                <Check size={14} />

              </div>

              <h3>Success</h3>

            </div>

            <button className="popup-close">
              <X size={18} />
            </button>

          </div>

          <div className="success-body">

            <div className="success-circle">

              <Check
                size={34}
                strokeWidth={3}
              />

            </div>

            <h4>
              Statement Uploaded Successfully!
            </h4>

            <p>
              Your transactions have been categorized.
            </p>

          </div>

          <div className="popup-actions center">

            <button className="btn-done">
              Done
            </button>

          </div>

        </Popup>

      </div>

    </section>
  );
}

export default PopupSection;