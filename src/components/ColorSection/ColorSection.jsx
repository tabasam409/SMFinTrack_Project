import "./ColorSection.css";

import ColorCard from "../ColorCard";

function ColorSection() {

  const colors = [

    {
      name: "Primary",
      color: "#004C48",
      hex: "#004C48",
      usage: "Buttons, Navbar, Headings",
    },

    {
      name: "Accent",
      color: "#2FA8A0",
      hex: "#2FA8A0",
      usage: "Charts, Highlights",
    },

    {
      name: "Success",
      color: "#22C55E",
      hex: "#22C55E",
      usage: "Positive, Completed",
    },

    {
      name: "Danger",
      color: "#EF4444",
      hex: "#EF4444",
      usage: "Errors, Delete",
    },

    {
      name: "Warning",
      color: "#F59E0B",
      hex: "#F59E0B",
      usage: "Alerts, Warnings",
    },

    {
      name: "Background",
      color: "#FFFFFF",
      hex: "#FFFFFF",
      usage: "Main Background",
    },

    {
      name: "Surface",
      color: "#F7F9FB",
      hex: "#F7F9FB",
      usage: "Cards, Sections",
    },

    {
      name: "Text Primary",
      color: "#1F2937",
      hex: "#1F2937",
      usage: "Headings, Key Text",
    },

    {
      name: "Text Secondary",
      color: "#6B7280",
      hex: "#6B7280",
      usage: "Body, Secondary",
    },

    {
      name: "Border",
      color: "#D6DCE5",
      hex: "#D6DCE5",
      usage: "Borders, Dividers",
    },

  ];

  const leftColors = colors.slice(0, 5);

  const rightColors = colors.slice(5);

  return (

    <section  id="colors" className="color-section">

      <div className="color-system-card">

        <h2 className="color-section-title">
          6. Color System
        </h2>

        <div className="color-list">

            <div className="color-column">

                {leftColors.map((color) => (

                    <ColorCard
                        key={color.name}
                        {...color}
                    />

                ))}

            </div>

            <div className="color-column">

                {rightColors.map((color) => (

                    <ColorCard
                        key={color.name}
                        {...color}
                    />

                ))}

            </div>

        </div>

      </div>

    </section>

  );

}

export default ColorSection;