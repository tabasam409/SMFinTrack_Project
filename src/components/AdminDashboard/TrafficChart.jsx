import "./TrafficChart.css";

function TrafficChart({ data }) {
  const width = 700;
  const height = 220;
  const paddingX = 12;
  const paddingY = 16;

  const values = data.map((d) => d.requests);
  const max = Math.max(...values);
  const min = Math.min(...values);
  const range = max - min || 1;

  const points = data.map((d, i) => {
    const x = paddingX + (i / (data.length - 1)) * (width - paddingX * 2);
    const y =
      height -
      paddingY -
      ((d.requests - min) / range) * (height - paddingY * 2);
    return { x, y, ...d };
  });

  const linePath = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
    .join(" ");

  const areaPath = `${linePath} L ${points[points.length - 1].x.toFixed(1)} ${height - paddingY
    } L ${points[0].x.toFixed(1)} ${height - paddingY} Z`;

  return (
    <div className="traffic-chart">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="none"
        className="traffic-chart-svg"
      >
        <defs>
          <linearGradient id="trafficFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#2fa8a0" stopOpacity="0.28" />
            <stop offset="100%" stopColor="#2fa8a0" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* gridlines */}
        {[0.25, 0.5, 0.75].map((f) => (
          <line
            key={f}
            x1={paddingX}
            x2={width - paddingX}
            y1={paddingY + f * (height - paddingY * 2)}
            y2={paddingY + f * (height - paddingY * 2)}
            stroke="#EEF2F6"
            strokeWidth="1"
          />
        ))}

        <path d={areaPath} fill="url(#trafficFill)" />
        <path d={linePath} fill="none" stroke="#2fa8a0" strokeWidth="2.5" />

        {points.map((p, i) => (
          <g key={i} className="traffic-point">
            <circle cx={p.x} cy={p.y} r="4" fill="#ffffff" stroke="#2fa8a0" strokeWidth="2.5" />
            <circle cx={p.x} cy={p.y} r="12" fill="transparent">
              <title>
                {p.day}: {new Intl.NumberFormat("en-US").format(p.requests)} requests
              </title>
            </circle>
          </g>
        ))}
      </svg>

      <div className="traffic-chart-labels">
        {data.map((d) => (
          <span key={d.day}>{d.day}</span>
        ))}
      </div>
    </div>
  );
}

export default TrafficChart;
