"use client";

interface Props {
  value: number;
}

export default function ExecutionCircle({ value }: Props) {

  const color =
    value >= 70 ? "#dc2626" :
    value >= 40 ? "#d97706" :
                  "#059669";

  const trackColor =
    value >= 70 ? "#fee2e2" :
    value >= 40 ? "#fef3c7" :
                  "#d1fae5";

  const label =
    value >= 70 ? "Hard"     :
    value >= 40 ? "Moderate" :
                  "Easy";

  // Square progress — 4 segments as a visual bar-ring using stroke-dasharray trick
  // We use a square SVG path approach: draw a rounded-rect track and progress arc on top
  const size      = 120;
  const cx        = 60;
  const cy        = 60;
  const r         = 46;
  const circ      = 2 * Math.PI * r;
  const filled    = (value / 100) * circ;

  // Segments: divide into 10 dashes
  const segCount  = 10;
  const filled_segs = Math.round((value / 100) * segCount);
  const segArc    = circ / segCount;
  const gap       = 3;
  const dash      = segArc - gap;

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "10px" }}>

      <div style={{ position: "relative", width: size, height: size }}>

        <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>

          {/* Track segments */}
          {Array.from({ length: segCount }).map((_, i) => (
            <circle
              key={i}
              cx={cx} cy={cy} r={r}
              fill="none"
              stroke={trackColor}
              strokeWidth="10"
              strokeDasharray={`${dash} ${circ - dash}`}
              strokeDashoffset={-(i * segArc)}
              strokeLinecap="round"
            />
          ))}

          {/* Filled segments */}
          {Array.from({ length: filled_segs }).map((_, i) => (
            <circle
              key={`f-${i}`}
              cx={cx} cy={cy} r={r}
              fill="none"
              stroke={color}
              strokeWidth="10"
              strokeDasharray={`${dash} ${circ - dash}`}
              strokeDashoffset={-(i * segArc)}
              strokeLinecap="round"
              style={{ transition: `opacity 0.4s ease ${i * 40}ms` }}
            />
          ))}

        </svg>

        {/* Center */}
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
        {label} Execution
      </div>

    </div>
  );
}