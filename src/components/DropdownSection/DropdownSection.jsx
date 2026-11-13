import "./DropdownSection.css";

import { useState } from "react";
import { Building2 } from "lucide-react";

import Dropdown from "../Dropdown";

function DropdownSection() {

  /* ==========================================
     STATES
  ========================================== */

  const [defaultValue, setDefaultValue] = useState("");

  const [bankValue, setBankValue] = useState("");

  const [multiValue, setMultiValue] = useState([
    "Food & Dining",
    "Transport",
  ]);

  /* ==========================================
     DEFAULT SELECT
  ========================================== */

  const defaultOptions = [
    "Food & Dining",
    "Transport",
    "Bills & Utilities",
    "Entertainment",
    "Shopping",
  ];

  /* ==========================================
     BANK OPTIONS
  ========================================== */

  const bankOptions = [
    {
      label: "HBL",
      icon: <Building2 size={16} />,
    },
    {
      label: "UBL",
      icon: <Building2 size={16} />,
    },
    {
      label: "Meezan Bank",
      icon: <Building2 size={16} />,
    },
    {
      label: "Allied Bank",
      icon: <Building2 size={16} />,
    },
  ];

  return (

    <section className="dropdown-section">

      <h2 id="select" className="section-title">
        3. Select / Dropdown
      </h2>

      <div className="dropdown-layout">

        {/* ================= LEFT SIDE ================= */}

        <div className="dropdown-left">

          <Dropdown
            label="Default Select"
            placeholder="Select Category"
            value={defaultValue}
            onChange={setDefaultValue}
            options={defaultOptions}
          />

          <Dropdown
            label="With Icon"
            placeholder="Select Bank"
            value={bankValue}
            onChange={setBankValue}
            options={bankOptions}
            icon={<Building2 size={18} />}
          />

          <Dropdown
            label="Disabled Select"
            placeholder="Select an option"
            value=""
            options={defaultOptions}
            disabled
          />

        </div>

        {/* ================= RIGHT SIDE ================= */}

        <div className="dropdown-right">

          <Dropdown
            label="Multiple Select"
            placeholder="Select Categories"
            multiple
            value={multiValue}
            onChange={setMultiValue}
            options={defaultOptions}
          />

        </div>

      </div>

    </section>

  );

}

export default DropdownSection;