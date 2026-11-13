import "./ColorCard.css";

function ColorCard({
  color,
  name,
  hex,
  usage,
}) {
  return (
    <div className="color-card">

      <div
        className="color-preview"
        style={{ backgroundColor: color }}
      ></div>

      <div className="color-info">

        <div className="color-top">

          <h4 className="color-name">
            {name}
          </h4>

          <span className="color-hex">
            {hex}
          </span>

        </div>

        <p className="color-usage">
          <span className="usage-label">
            Usage:
          </span>{" "}
          {usage}
        </p>

      </div>

    </div>
  );
}

export default ColorCard;