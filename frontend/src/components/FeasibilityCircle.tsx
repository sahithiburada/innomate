"use client";

interface Props {
  value: number;
}

export default function FeasibilityCircle({ value }: Props) {

  const radius = 46;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;

  const color =
    value >= 70 ? "#059669" :
    value >= 40 ? "#7c3aed" :
                  "#dc2626";

  const trackColor =
    value >= 70 ? "#d1fae5" :
    value >= 40 ? "#ede9fe" :
                  "#fee2e2";

  const label =
    value >= 70 ? "High"     :
    value >= 40 ? "Moderate" :
                  "Low";

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "10px" }}>

      <div style={{ position: "relative", width: 120, height: 120 }}>

        <svg width="120" height="120" style={{ transform: "rotate(-90deg)" }}>

          {/* Track */}
          <circle
            cx="60" cy="60" r={radius}
            stroke={trackColor}
            strokeWidth="10"
            fill="none"
          />

          {/* Progress */}
          <circle
            cx="60" cy="60" r={radius}
            stroke={color}
            strokeWidth="10"
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            style={{ transition: "stroke-dashoffset 0.8s cubic-bezier(.34,1.56,.64,1)" }}
          />

        </svg>

        {/* Center label */}
        <div style={{
          position: "absolute", inset: 0,
          display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
          gap: "1px",
        }}>
          <span style={{ fontSize: "20px", fontWeight: 700, color: "#0f172a", fontFamily: "Inter, sans-serif", lineHeight: 1 }}>
            {value}
          </span>
          <span style={{ fontSize: "10px", color: "#94a3b8", fontFamily: "Inter, sans-serif", fontWeight: 600 }}>
            / 100
          </span>
        </div>

      </div>

      {/* Level pill */}
      <div style={{
        display: "inline-flex", alignItems: "center", gap: "5px",
        padding: "3px 10px", borderRadius: "20px",
        background: `${color}14`, border: `1px solid ${color}33`,
        fontSize: "11px", fontWeight: 700, color,
        fontFamily: "Inter, sans-serif", letterSpacing: "0.03em",
      }}>
        <div style={{ width: 6, height: 6, borderRadius: "50%", background: color }} />
        {label} Feasibility
      </div>

    </div>
  );
}