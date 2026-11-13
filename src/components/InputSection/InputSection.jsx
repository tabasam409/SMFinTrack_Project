import "./InputSection.css";

import { useState } from "react";
import { Search } from "lucide-react";

import Input from "../Input";

function InputSection() {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <section id="inputs" className="input-section">

      <h2 className="section-title">
        2. Inputs
      </h2>

      <div className="input-layout">

        {/* ================= LEFT SIDE ================= */}

        <div className="input-left">

          <Input
            label="Default"
            placeholder="Enter text"
          />

          <Input
            label="Focused"
            placeholder="Enter text"
            variant="focused"
          />

          <Input
            label="Disabled"
            placeholder="Enter text"
            disabled
          />

          <Input
            label="Error"
            placeholder="Enter text"
            variant="error"
            helperText="This field is required"
          />

          <Input
            label="Success"
            placeholder="Enter text"
            variant="success"
            helperText="Looks good!"
          />

          <Input
            label="With Icon"
            placeholder="Search transactions"
            icon={<Search size={18} />}
          />

        </div>

        {/* ================= RIGHT SIDE ================= */}

        <div className="input-right">

          <Input
            label="Email"
            type="email"
            placeholder="you@example.com"
          />

          <Input
            label="Password"
            type="password"
            placeholder="••••••••••••••"
            showPasswordToggle
            passwordVisible={showPassword}
            onTogglePassword={() =>
              setShowPassword(!showPassword)
            }
          />

          <Input
            label="Amount"
            placeholder="PKR 5,000.00"
          />

          <div className="input-wrapper">

            <label className="input-label">
              Text Area
            </label>

            <textarea
              className="text-area"
              placeholder="Type your note here..."
              rows={4}
            />

          </div>

        </div>

      </div>

    </section>
  );
}

export default InputSection;