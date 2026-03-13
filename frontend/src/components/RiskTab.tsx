"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { ChevronDown, ChevronUp } from "lucide-react";
import RiskGauge from "@/src/components/RiskGauge";
import FeasibilityCircle from "@/src/components/FeasibilityCircle";
import ExecutionCircle from "@/src/components/ExecutionCircle";
import InfoTooltip from "@/src/components/InfoTooltip";

export default function RiskTab({
  ideaId,
  acceptedVersion,
}: {
  ideaId: string;
  acceptedVersion: number;
}) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [showInsight, setShowInsight] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    if (!ideaId || !acceptedVersion) return;

    const fetchRisk = async () => {
      setLoading(true);

      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/risk/${ideaId}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const result = await response.json();

      if (result.status === "success") {
        setData(result.data);
      }

      setLoading(false);
    };

    fetchRisk();
  }, [ideaId, acceptedVersion]);

  if (!acceptedVersion) {
    return (
      <>
        <style>{CSS}</style>
        <div className="rk-empty">
          Accept an idea version to unlock Risk &amp; Feasibility Analysis.
        </div>
      </>
    );
  }

  if (loading) {
    return (
      <>
        <style>{CSS}</style>
        <div className="rk-state-wrap">
          <div className="rk-loading-ring" />
          <p className="rk-state-title">Analysing startup risks…</p>
          <p className="rk-state-sub">Running feasibility, execution &amp; market risk models</p>
        </div>
      </>
    );
  }

  if (!data) return null;

  const summary = data.Primary_Summary;
  const details = data.Detailed_Explanation;

  /* ── Level dots (logic untouched, only styling changed) ── */
  const levelDots = (level: string) => {
    const active = level === "Low" ? 2 : level === "Medium" ? 3 : 5;
    const color  = level === "Low" ? "#10b981" : level === "Medium" ? "#f59e0b" : "#ef4444";
    return (
      <div className="rk-dots">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="rk-dot"
            style={{ background: i < active ? color : "#e8edf5" }}
          />
        ))}
      </div>
    );
  };

  const toggleExpand = (key: string) => {
    setExpanded((prev) => (prev === key ? null : key));
  };

  /* ── Verdict color ── */
  const verdictLower = (summary.Final_Verdict ?? "").toLowerCase();
  const verdictAccent =
    verdictLower.includes("high") || verdictLower.includes("caution")
      ? { bg: "#fef2f2", border: "#fecaca", text: "#dc2626", icon: "⚠" }
      : verdictLower.includes("moderate")
      ? { bg: "#fffbeb", border: "#fde68a", text: "#d97706", icon: "◎" }
      : { bg: "#f0fdf4", border: "#a7f3d0", text: "#059669", icon: "✓" };

  /* ── Driver rows ── */
  const drivers = [
    { key: "technical",   label: "Technical Complexity",  data: details.Technical_Complexity  },
    { key: "operational", label: "Operational Complexity", data: details.Operational_Complexity },
    { key: "regulatory",  label: "Regulatory Exposure",    data: details.Regulatory_Exposure   },
  ];

  return (
    <div className="rk-root">
      <style>{CSS}</style>

      {/* ── Final Verdict ── */}
      <div
        className="rk-verdict"
        style={{ background: verdictAccent.bg, border: `1px solid ${verdictAccent.border}`, color: verdictAccent.text }}
      >
        <span className="rk-verdict-icon">{verdictAccent.icon}</span>
        <div>
          <p className="rk-verdict-label">Final Startup Verdict</p>
          <p className="rk-verdict-text">{summary.Final_Verdict}</p>
        </div>
      </div>

      {/* ── Top Metric Cards ── */}
      <div className="rk-metrics-grid">

        {/* Risk Level */}
        <div className="rk-metric-card">
          <p className="rk-metric-label">Overall Risk</p>
          <RiskGauge score={summary.Overall_Risk_Score} />
        </div>

        {/* Feasibility */}
        <div className="rk-metric-card">
          <p className="rk-metric-label">Feasibility</p>
          <FeasibilityCircle value={summary.Feasibility_Score} />
          <p className="rk-metric-sub">Ease of execution</p>
        </div>

        {/* Execution */}
        <div className="rk-metric-card">
          <p className="rk-metric-label">Execution Difficulty</p>
          <ExecutionCircle value={summary.Execution_Risk_Score} />
          <p className="rk-metric-sub">Technical &amp; operational effort</p>
        </div>

      </div>

      {/* ── Second Row ── */}
      <div className="rk-row2">

        {/* Execution Drivers */}
        <div className="rk-card">
          <h3 className="rk-card-title">Execution Drivers</h3>
          <div className="rk-drivers">
            {drivers.map(({ key, label, data: d }) => (
              <div key={key} className="rk-driver-item">
                <div className="rk-driver-header" onClick={() => toggleExpand(key)}>
                  <div className="rk-driver-left">
                    <span className="rk-driver-label">{label}</span>
                    <span
                      className="rk-driver-badge"
                      style={{
                        color:      d.level === "Low" ? "#059669" : d.level === "Medium" ? "#d97706" : "#dc2626",
                        background: d.level === "Low" ? "#f0fdf4" : d.level === "Medium" ? "#fffbeb" : "#fef2f2",
                        border:     `1px solid ${d.level === "Low" ? "#a7f3d0" : d.level === "Medium" ? "#fde68a" : "#fecaca"}`,
                      }}
                    >
                      {d.level}
                    </span>
                  </div>
                  <div className="rk-chevron" style={{ transform: expanded === key ? "rotate(180deg)" : "rotate(0)" }}>
                    <ChevronDown size={15} color="#94a3b8" />
                  </div>
                </div>

                {levelDots(d.level)}

                <div className={`rk-driver-reason ${expanded === key ? "rk-driver-reason--open" : ""}`}>
                  <p>{d.reason}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Key Risks */}
        <div className="rk-card">
          <h3 className="rk-card-title">Key Risks</h3>
          <div className="rk-risks">
            {(summary.Top_3_Key_Risks || []).map((risk: string, i: number) => (
              <div key={i} className="rk-risk-item">
                <div className="rk-risk-num">{i + 1}</div>
                <p className="rk-risk-text">{risk}</p>
              </div>
            ))}
          </div>

          {/* Score summary row */}
          <div className="rk-score-row">
            <div className="rk-score-chip">
              <span className="rk-score-chip-label">Market Risk</span>
              <span className="rk-score-chip-val" style={{ color: "#0284c7" }}>{summary.Market_Risk_Score}</span>
            </div>
            <div className="rk-score-chip">
              <span className="rk-score-chip-label">Competition</span>
              <span className="rk-score-chip-val" style={{ color: "#7c3aed" }}>{summary.Competition_Pressure_Score}</span>
            </div>
            <div className="rk-score-chip">
              <span className="rk-score-chip-label">Execution</span>
              <span className="rk-score-chip-val" style={{ color: "#d97706" }}>{summary.Execution_Risk_Score}</span>
            </div>
          </div>
        </div>

      </div>

      {/* ── Strategic Insight ── */}
      <div className="rk-card rk-insight-card" onClick={() => setShowInsight(!showInsight)}>
        <div className="rk-insight-header">
          <h3 className="rk-card-title" style={{ margin: 0 }}>Strategic Insight</h3>
          <div className="rk-chevron" style={{ transform: showInsight ? "rotate(180deg)" : "rotate(0)" }}>
            <ChevronDown size={15} color="#94a3b8" />
          </div>
        </div>
        <div className={`rk-insight-body ${showInsight ? "rk-insight-body--open" : ""}`}>
          <p className="rk-insight-text">{details.Insight_Summary}</p>
        </div>
      </div>

    </div>
  );
}

const CSS = `
  @keyframes rk-spin   { to { transform: rotate(360deg); } }
  @keyframes rk-fadeup { from { opacity:0; transform:translateY(6px); } to { opacity:1; transform:translateY(0); } }

  .rk-root {
    font-family: 'Inter', sans-serif;
    display: flex; flex-direction: column; gap: 16px;
    padding-bottom: 32px; color: #1e293b;
    max-width: 100%;
  }

  /* ── State ── */
  .rk-empty {
    padding: 48px 24px; text-align: center;
    font-size: 13.5px; color: #94a3b8;
  }
  .rk-state-wrap {
    display:flex; flex-direction:column; align-items:center;
    justify-content:center; gap:10px; padding:72px 24px;
  }
  .rk-loading-ring {
    width:36px; height:36px; border-radius:50%;
    border:2.5px solid #e2e8f0; border-top-color:#6366f1;
    animation: rk-spin 0.8s linear infinite;
  }
  .rk-state-title { font-size:13.5px; font-weight:600; color:#475569; margin:0; }
  .rk-state-sub   { font-size:12px; color:#94a3b8; margin:0; text-align:center; }

  /* ── Verdict ── */
  .rk-verdict {
    display:flex; align-items:flex-start; gap:12px;
    padding:14px 18px; border-radius:14px;
    animation: rk-fadeup 0.3s ease both;
  }
  .rk-verdict-icon  { font-size:18px; flex-shrink:0; margin-top:1px; }
  .rk-verdict-label { font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:0.07em; opacity:0.7; margin:0 0 3px; }
  .rk-verdict-text  { font-size:13.5px; font-weight:600; margin:0; line-height:1.5; }

  /* ── Metrics grid ── */
  .rk-metrics-grid {
    display:grid; grid-template-columns:repeat(3,1fr); gap:12px;
  }
  .rk-metric-card {
    background:#fff; border:1px solid #e8edf5; border-radius:16px;
    padding:22px 16px; display:flex; flex-direction:column;
    align-items:center; gap:10px;
    animation: rk-fadeup 0.3s ease both;
    transition: box-shadow .18s, border-color .18s;
  }
  .rk-metric-card:hover { box-shadow:0 4px 18px rgba(0,0,0,0.07); border-color:#c7d2fe; }
  .rk-metric-label { font-size:11px; font-weight:600; color:#94a3b8; text-transform:uppercase; letter-spacing:0.06em; margin:0; }
  .rk-metric-sub   { font-size:11px; color:#94a3b8; margin:0; text-align:center; }

  /* ── Row 2 ── */
  .rk-row2 {
    display:grid; grid-template-columns:1fr 1fr; gap:12px;
  }

  /* ── Generic card ── */
  .rk-card {
    background:#fff; border:1px solid #e8edf5; border-radius:16px;
    padding:20px;
    animation: rk-fadeup 0.3s ease both;
    transition: box-shadow .18s;
  }
  .rk-card:hover { box-shadow:0 4px 18px rgba(0,0,0,0.06); }
  .rk-card-title { font-size:13.5px; font-weight:700; color:#0f172a; margin:0 0 16px; }

  /* ── Drivers ── */
  .rk-drivers { display:flex; flex-direction:column; gap:16px; }

  .rk-driver-item { display:flex; flex-direction:column; gap:0; }

  .rk-driver-header {
    display:flex; align-items:center; justify-content:space-between;
    cursor:pointer; padding:6px 0;
  }
  .rk-driver-header:hover .rk-driver-label { color:#4338ca; }

  .rk-driver-left  { display:flex; align-items:center; gap:8px; }
  .rk-driver-label { font-size:12.5px; font-weight:600; color:#1e293b; transition:color .15s; }
  .rk-driver-badge {
    font-size:9.5px; font-weight:700; padding:2px 7px;
    border-radius:20px; text-transform:uppercase; letter-spacing:0.04em;
  }
  .rk-chevron { transition:transform .2s; flex-shrink:0; }

  .rk-dots { display:flex; gap:5px; margin:7px 0 0; }
  .rk-dot  { width:10px; height:10px; border-radius:3px; transition:background .2s; }

  /* Accordion */
  .rk-driver-reason {
    display:grid; grid-template-rows:0fr;
    transition:grid-template-rows .25s ease, opacity .25s ease;
    opacity:0; overflow:hidden;
  }
  .rk-driver-reason--open { grid-template-rows:1fr; opacity:1; }
  .rk-driver-reason > p {
    font-size:12px; color:#64748b; line-height:1.65;
    margin:10px 0 0; padding-top:10px;
    border-top:1px dashed #e8edf5;
    overflow:hidden;
  }

  /* ── Key Risks ── */
  .rk-risks { display:flex; flex-direction:column; gap:9px; margin-bottom:16px; }
  .rk-risk-item {
    display:flex; align-items:flex-start; gap:10px;
    padding:10px 12px; border-radius:10px;
    background:linear-gradient(135deg,#fff1f2,#fce8e8);
    border:1px solid #fecaca;
  }
  .rk-risk-num {
    flex-shrink:0; width:20px; height:20px; border-radius:50%;
    background:#fecaca; color:#dc2626;
    display:flex; align-items:center; justify-content:center;
    font-size:10px; font-weight:700; margin-top:1px;
  }
  .rk-risk-text { font-size:12.5px; color:#7f1d1d; font-weight:500; line-height:1.5; margin:0; }

  /* Score chips */
  .rk-score-row  { display:flex; gap:8px; margin-top:4px; }
  .rk-score-chip {
    flex:1; display:flex; flex-direction:column; gap:1px;
    padding:8px 10px; border-radius:10px;
    background:#f8fafc; border:1px solid #e8edf5;
  }
  .rk-score-chip-label { font-size:9.5px; color:#94a3b8; font-weight:600; text-transform:uppercase; letter-spacing:0.05em; }
  .rk-score-chip-val   { font-size:16px; font-weight:700; }

  /* ── Strategic Insight ── */
  .rk-insight-card { cursor:pointer; }
  .rk-insight-header {
    display:flex; align-items:center; justify-content:space-between;
  }
  .rk-insight-body {
    display:grid; grid-template-rows:0fr;
    transition:grid-template-rows .25s ease, opacity .25s ease;
    opacity:0; overflow:hidden;
  }
  .rk-insight-body--open { grid-template-rows:1fr; opacity:1; }
  .rk-insight-text {
    font-size:13px; color:#475569; line-height:1.75;
    margin:14px 0 0; padding-top:14px;
    border-top:1px dashed #e8edf5;
    overflow:hidden;
  }

  /* ── Responsive ── */
  @media (max-width: 900px) {
    .rk-metrics-grid { grid-template-columns: 1fr 1fr; }
    .rk-row2         { grid-template-columns: 1fr; }
  }
  @media (max-width: 600px) {
    .rk-metrics-grid { grid-template-columns: 1fr; }
    .rk-score-row    { flex-wrap: wrap; }
  }
`;