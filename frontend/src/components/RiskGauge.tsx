"use client";

interface Props {
  score: number;
}

export default function RiskGauge({ score }: Props) {

  // convert score (0–100) → rotation (-90deg to 90deg)
  const rotation = (score / 100) * 180 - 90;

  const getLevel = () => {
    if (score <= 25) return { label: "Low",             color: "#059669" };
    if (score <= 40) return { label: "Moderately Low",  color: "#10b981" };
    if (score <= 60) return { label: "Moderate",        color: "#f59e0b" };
    if (score <= 75) return { label: "Moderately High", color: "#f97316" };
    if (score <= 90) return { label: "High",            color: "#ef4444" };
    return               { label: "Very High",          color: "#dc2626" };
  };

  const { label, color } = getLevel();

  // Arc segments: 5 color bands across 180°
  const bands = [
    { color: "#86efac", from: 0,   to: 36  },  // Low
    { color: "#6ee7b7", from: 36,  to: 72  },  // Mod Low
    { color: "#fcd34d", from: 72,  to: 108 },  // Moderate
    { color: "#fb923c", from: 108, to: 144 },  // Mod High
    { color: "#f87171", from: 144, to: 180 },  // High / Very High
  ];

  const cx = 110, cy = 110, r = 80;

  function arcPath(startDeg: number, endDeg: number, radius: number) {
    const toRad = (d: number) => ((d - 90) * Math.PI) / 180;
    const x1 = cx + radius * Math.cos(toRad(startDeg - 90));
    const y1 = cy + radius * Math.sin(toRad(startDeg - 90));
    const x2 = cx + radius * Math.cos(toRad(endDeg - 90));
    const y2 = cy + radius * Math.sin(toRad(endDeg - 90));
    const large = endDeg - startDeg > 180 ? 1 : 0;
    return `M ${x1} ${y1} A ${radius} ${radius} 0 ${large} 1 ${x2} ${y2}`;
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>

      <svg width="220" height="130" viewBox="0 0 220 120" style={{ overflow: "visible" }}>

        {/* Track */}
        <path
          d={arcPath(0, 180, r)}
          fill="none"
          stroke="#f1f5f9"
          strokeWidth="14"
          strokeLinecap="round"
        />

        {/* Colored bands */}
        {bands.map((b, i) => (
          <path
            key={i}
            d={arcPath(b.from, b.to, r)}
            fill="none"
            stroke={b.color}
            strokeWidth="14"
            strokeLinecap={i === 0 ? "round" : i === bands.length - 1 ? "round" : "butt"}
            opacity="0.85"
          />
        ))}

        {/* Needle shadow */}
        <line
          x1={cx}
          y1={cy}
          x2={cx + (r - 6) * Math.cos(((rotation - 90) * Math.PI) / 180)}
          y2={cy + (r - 6) * Math.sin(((rotation - 90) * Math.PI) / 180)}
          stroke="#0f172a"
          strokeWidth="3"
          strokeLinecap="round"
          style={{ transition: "all 0.7s cubic-bezier(.34,1.56,.64,1)", opacity: 0.12 }}
          transform="translate(1.5,1.5)"
        />

        {/* Needle */}
        <line
          x1={cx}
          y1={cy}
          x2={cx + (r - 6) * Math.cos(((rotation - 90) * Math.PI) / 180)}
          y2={cy + (r - 6) * Math.sin(((rotation - 90) * Math.PI) / 180)}
          stroke="#0f172a"
          strokeWidth="2.5"
          strokeLinecap="round"
          style={{ transition: "all 0.7s cubic-bezier(.34,1.56,.64,1)" }}
        />

        {/* Needle hub outer */}
        <circle cx={cx} cy={cy} r="7" fill="#fff" stroke="#e2e8f0" strokeWidth="2" />
        {/* Needle hub inner */}
        <circle cx={cx} cy={cy} r="4" fill={color} />

        {/* Score text */}
        <text
          x={cx}
          y={cy - 18}
          textAnchor="middle"
          fontSize="22"
          fontWeight="700"
          fontFamily="Inter, sans-serif"
          fill="#0f172a"
        >
          {score}
        </text>

      </svg>

      {/* Level pill */}
      <div style={{
        display: "inline-flex", alignItems: "center", gap: "5px",
        padding: "3px 10px", borderRadius: "20px",
        background: `${color}14`, border: `1px solid ${color}33`,
        fontSize: "11px", fontWeight: 700, color, fontFamily: "Inter, sans-serif",
        letterSpacing: "0.03em",
      }}>
        <div style={{ width: 6, height: 6, borderRadius: "50%", background: color }} />
        {label}
      </div>

    </div>
  );
}