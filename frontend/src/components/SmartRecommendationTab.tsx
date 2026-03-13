"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Card, CardHeader, CardTitle, CardContent } from "@/src/components/ui/card";
import { AlertCircle, Zap, Clock, TrendingUp, Lightbulb, ArrowRight, Target, Package, Sparkles } from "lucide-react";

interface Insight {
  observation: string;
  source: string;
}

interface Recommendation {
  priority: "High" | "Medium" | "Long-Term";
  action: string;
  reason: string;
  based_on: string[];
}

interface RoadmapPhase {
  phase: string;
  steps: string[];
}

interface RecommendationData {
  strategic_insights: Insight[];
  strategic_recommendations: Recommendation[];
  execution_roadmap: RoadmapPhase[];
}

export default function SmartRecommendationTab({
  ideaId,
}: {
  ideaId: string;
  acceptedVersion: number;
}) {

  const [data, setData] = useState<RecommendationData | null>(null);
  const [activePhase, setActivePhase] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {

    if (!ideaId) return;

    const fetchRecommendations = async () => {

      try {

        setLoading(true);
        setError(null);

        const { data: sessionData } = await supabase.auth.getSession();
        const token = sessionData.session?.access_token;

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/recommendations/${ideaId}`,
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
        } else {
          setError(result.message || "Failed to generate recommendations");
        }

      } catch (err) {

        console.error("Recommendation fetch failed:", err);
        setError("Something went wrong while generating recommendations.");

      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();

  }, [ideaId]);

  // ── Loading ───────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="sr-state-wrap">
        <style>{CSS}</style>
        <div className="sr-loading-ring" />
        <p className="sr-state-title">Generating strategic recommendations…</p>
        <p className="sr-state-sub">Analysing your market, risk, competitor &amp; budget data</p>
      </div>
    );
  }

  // ── Error ─────────────────────────────────────────────────────────────────

  if (error) {
    return (
      <>
        <style>{CSS}</style>
        <div className="sr-error-wrap">
          <AlertCircle size={15} color="#ef4444" />
          <p>{error}</p>
        </div>
      </>
    );
  }

  // ── Empty ─────────────────────────────────────────────────────────────────

  if (!data) {
    return (
      <>
        <style>{CSS}</style>
        <div className="sr-error-wrap" style={{ background: "#f8fafc", borderColor: "#e2e8f0" }}>
          <AlertCircle size={15} color="#94a3b8" />
          <p style={{ color: "#94a3b8" }}>No recommendations available yet.</p>
        </div>
      </>
    );
  }

  const high   = data.strategic_recommendations.filter(r => r.priority === "High");
  const medium = data.strategic_recommendations.filter(r => r.priority === "Medium");
  const long   = data.strategic_recommendations.filter(r => r.priority === "Long-Term");

  const PRIORITY_CFG = {
    High:       { icon: Zap,        accent: "#ef4444", grad: "linear-gradient(160deg,#fff1f2,#fce8e8)", border: "#fecaca", sub: "Act on these now" },
    Medium:     { icon: Clock,      accent: "#d97706", grad: "linear-gradient(160deg,#fffbeb,#fef3c7)", border: "#fde68a", sub: "Plan these next"   },
    "Long-Term":{ icon: TrendingUp, accent: "#0284c7", grad: "linear-gradient(160deg,#f0f9ff,#e0f2fe)", border: "#bae6fd", sub: "Build towards these" },
  };

  const PHASE_CFG = [
    { icon: Target,   accent: "#7c3aed", desc: "Test & confirm your core assumptions" },
    { icon: Zap,      accent: "#0284c7", desc: "Launch and acquire your first customers" },
    { icon: Sparkles, accent: "#059669", desc: "Expand, build defensibility and grow revenue" },
  ];

  const renderPriorityCol = (
    key: "High" | "Medium" | "Long-Term",
    items: Recommendation[]
  ) => {
    const cfg  = PRIORITY_CFG[key];
    const Icon = cfg.icon;
    return (
      <div className="sr-priority-col" style={{ background: cfg.grad, border: `1px solid ${cfg.border}` }}>
        {/* Header */}
        <div className="sr-priority-head">
          <div className="sr-priority-head-left">
            <div className="sr-priority-icon-wrap" style={{ background: `${cfg.accent}18`, border: `1px solid ${cfg.accent}30` }}>
              <Icon size={13} color={cfg.accent} />
            </div>
            <div>
              <p className="sr-priority-label" style={{ color: cfg.accent }}>{key === "Long-Term" ? "Long Term" : `${key} Priority`}</p>
              <p className="sr-priority-sub">{cfg.sub}</p>
            </div>
          </div>
          <span className="sr-priority-count" style={{ color: cfg.accent, background: `${cfg.accent}14` }}>
            {items.length}
          </span>
        </div>

        {/* Items */}
        <div className="sr-cards-stack">
          {items.map((r, i) => (
            <div key={i} className="sr-rec-card" style={{ animationDelay: `${i * 55}ms` }}>
              <div className="sr-rec-card-row">
                <div className="sr-rec-num" style={{ background: `${cfg.accent}14`, color: cfg.accent, border: `1.5px solid ${cfg.accent}30` }}>
                  {i + 1}
                </div>
                <p className="sr-rec-action">{r.action}</p>
              </div>
              {r.reason && (
                <p className="sr-rec-reason">{r.reason}</p>
              )}
              {r.based_on?.length > 0 && (
                <div className="sr-based-on-row">
                  {r.based_on.map((b, j) => (
                    <span key={j} className="sr-based-on-pill">{b}</span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="sr-root">
      <style>{CSS}</style>

      {/* ══════════════════════════════════════════════
          SECTION 1 — STRATEGIC PRIORITIES
      ══════════════════════════════════════════════ */}
      <section className="sr-section">
        <div className="sr-section-head">
          <h2 className="sr-section-title">Strategic Priorities</h2>
          <p className="sr-section-sub">Grounded in your market, risk, competitor &amp; budget analysis</p>
        </div>

        <div className="sr-priority-grid">
          {renderPriorityCol("High",      high)}
          {renderPriorityCol("Medium",    medium)}
          {renderPriorityCol("Long-Term", long)}
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          SECTION 2 — ROADMAP  (Timeline style)
      ══════════════════════════════════════════════ */}
      <section className="sr-section">
        <div className="sr-section-head">
          <h2 className="sr-section-title">Execution Roadmap</h2>
          <p className="sr-section-sub">A phased playbook for taking your idea to market</p>
        </div>

        {/* Phase selector */}
        <div className="sr-phase-selector">
          {data.execution_roadmap.map((phase, i) => {
            const pcfg   = PHASE_CFG[i] ?? PHASE_CFG[0];
            const PIcon  = pcfg.icon;
            const active = activePhase === i;
            return (
              <button
                key={i}
                onClick={() => setActivePhase(i)}
                className={`sr-phase-btn ${active ? "sr-phase-btn--active" : ""}`}
                style={active ? { borderColor: `${pcfg.accent}50`, background: `${pcfg.accent}06` } : {}}
              >
                <div
                  className="sr-phase-btn-icon"
                  style={{
                    background: active ? `${pcfg.accent}18` : "#f1f5f9",
                    border: active ? `1px solid ${pcfg.accent}33` : "1px solid transparent",
                  }}
                >
                  <PIcon size={13} color={active ? pcfg.accent : "#94a3b8"} />
                </div>
                <div className="sr-phase-btn-text">
                  <span className="sr-phase-btn-num" style={{ color: active ? pcfg.accent : "#94a3b8" }}>
                    Phase {i + 1}
                  </span>
                  <span className="sr-phase-btn-label" style={{ color: active ? "#0f172a" : "#64748b" }}>
                    {phase.phase}
                  </span>
                </div>
                {active && <div className="sr-phase-active-dot" style={{ background: pcfg.accent }} />}
              </button>
            );
          })}
        </div>

        {/* Phase description strip */}
        {PHASE_CFG[activePhase] && (
          <div
            className="sr-phase-desc"
            style={{
              borderColor: `${PHASE_CFG[activePhase].accent}30`,
              background:  `${PHASE_CFG[activePhase].accent}06`,
            }}
          >
            <ArrowRight size={12} color={PHASE_CFG[activePhase].accent} />
            <span style={{ color: PHASE_CFG[activePhase].accent }}>
              {PHASE_CFG[activePhase].desc}
            </span>
          </div>
        )}

        {/* Timeline list */}
        <div className="sr-phase-timeline">
          {data.execution_roadmap[activePhase]?.steps.map((step, i, arr) => {
            const pcfg  = PHASE_CFG[activePhase] ?? PHASE_CFG[0];
            const isLast = i === arr.length - 1;
            return (
              <div key={i} className="sr-phase-item" style={{ animationDelay: `${i * 60}ms` }}>
                {/* Spine */}
                <div className="sr-phase-spine">
                  <div className="sr-phase-dot" style={{ borderColor: `${pcfg.accent}40` }}>
                    <div className="sr-phase-dot-inner" style={{ background: pcfg.accent }} />
                  </div>
                  {!isLast && <div className="sr-phase-line" />}
                </div>
                {/* Step text */}
                <div className="sr-phase-step">
                  <p className="sr-phase-step-text">{step}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

// ─── CSS ──────────────────────────────────────────────────────────────────────

const CSS = `
  @keyframes sr-spin   { to { transform: rotate(360deg); } }
  @keyframes sr-fadeup { from { opacity:0; transform:translateY(6px); } to { opacity:1; transform:translateY(0); } }

  .sr-root {
    font-family: 'Inter', sans-serif;
    display: flex; flex-direction: column; gap: 28px;
    padding-bottom: 24px; color: #1e293b;
  }

  /* ── Loading / Error ──────────────────────────────────────────────────── */
  .sr-state-wrap {
    display:flex; flex-direction:column; align-items:center;
    justify-content:center; gap:10px; padding:72px 24px;
  }
  .sr-loading-ring {
    width:36px; height:36px; border-radius:50%;
    border:2.5px solid #e2e8f0; border-top-color:#6366f1;
    animation: sr-spin 0.8s linear infinite;
  }
  .sr-state-title { font-size:13.5px; font-weight:600; color:#475569; margin:0; }
  .sr-state-sub   { font-size:12px; color:#94a3b8; margin:0; text-align:center; }
  .sr-error-wrap  {
    display:flex; align-items:center; gap:8px; padding:14px 16px;
    border-radius:12px; background:#fef2f2; border:1px solid #fecaca;
    font-size:13px; color:#ef4444;
  }

  /* ── Section ──────────────────────────────────────────────────────────── */
  .sr-section      { display:flex; flex-direction:column; gap:14px; }
  .sr-section-head { display:flex; flex-direction:column; gap:2px; }
  .sr-section-title { font-size:15px; font-weight:700; color:#0f172a; margin:0; }
  .sr-section-sub   { font-size:11.5px; color:#94a3b8; margin:0; }

  /* ── Priority Grid ────────────────────────────────────────────────────── */
  .sr-priority-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:12px; }

  .sr-priority-col {
    border-radius:16px; padding:16px;
    display:flex; flex-direction:column; gap:12px;
  }
  .sr-priority-head {
    display:flex; align-items:flex-start; justify-content:space-between;
  }
  .sr-priority-head-left { display:flex; align-items:center; gap:8px; }
  .sr-priority-icon-wrap {
    width:28px; height:28px; border-radius:8px; flex-shrink:0;
    display:flex; align-items:center; justify-content:center;
  }
  .sr-priority-label { font-size:12.5px; font-weight:700; margin:0; line-height:1.2; }
  .sr-priority-sub   { font-size:10px; color:#94a3b8; margin:0; margin-top:1px; }
  .sr-priority-count { font-size:10.5px; font-weight:700; padding:2px 7px; border-radius:20px; flex-shrink:0; }

  .sr-cards-stack { display:flex; flex-direction:column; gap:7px; }

  /* ── Rec card ─────────────────────────────────────────────────────────── */
  .sr-rec-card {
    background:#fff; border:1px solid #e8edf5; border-radius:12px;
    padding:12px 13px; display:flex; flex-direction:column; gap:7px;
    animation: sr-fadeup 0.3s ease both;
    transition: box-shadow .18s, border-color .18s;
  }
  .sr-rec-card:hover { box-shadow:0 3px 14px rgba(0,0,0,0.07); border-color:#c7d2fe; }

  .sr-rec-card-row { display:flex; align-items:flex-start; gap:9px; }
  .sr-rec-num {
    flex-shrink:0; width:20px; height:20px; border-radius:50%;
    display:flex; align-items:center; justify-content:center;
    font-size:10px; font-weight:700; margin-top:1px;
  }
  .sr-rec-action {
    flex:1; font-size:12.5px; font-weight:600; color:#1e293b; line-height:1.5; margin:0;
  }
  .sr-rec-reason {
    font-size:11.5px; color:#64748b; line-height:1.6; margin:0;
    padding-left:29px; font-style:italic;
  }
  .sr-based-on-row {
    display:flex; flex-wrap:wrap; gap:5px; padding-left:29px;
  }
  .sr-based-on-pill {
    font-size:9.5px; font-weight:600; padding:2px 7px; border-radius:20px;
    background:#f1f5f9; color:#64748b; border:1px solid #e2e8f0;
    text-transform:uppercase; letter-spacing:0.04em;
  }

  /* ── Phase selector ───────────────────────────────────────────────────── */
  .sr-phase-selector { display:flex; gap:10px; flex-wrap:wrap; }

  .sr-phase-btn {
    display:flex; align-items:center; gap:10px; padding:10px 14px;
    border-radius:12px; border:1px solid #e2e8f0; background:#fff;
    cursor:pointer; transition:all .18s; position:relative; min-width:150px;
  }
  .sr-phase-btn:hover    { border-color:#c7d2fe; box-shadow:0 2px 10px rgba(0,0,0,0.06); }
  .sr-phase-btn--active  { box-shadow:0 3px 14px rgba(0,0,0,0.08); }

  .sr-phase-btn-icon {
    width:30px; height:30px; border-radius:8px; flex-shrink:0;
    display:flex; align-items:center; justify-content:center;
    transition:all .18s;
  }
  .sr-phase-btn-text  { display:flex; flex-direction:column; gap:1px; }
  .sr-phase-btn-num   { font-size:9.5px; font-weight:600; letter-spacing:0.04em; text-transform:uppercase; }
  .sr-phase-btn-label { font-size:12.5px; font-weight:700; }
  .sr-phase-active-dot {
    position:absolute; right:12px; top:50%; transform:translateY(-50%);
    width:6px; height:6px; border-radius:50%;
  }

  /* ── Phase descriptor strip ───────────────────────────────────────────── */
  .sr-phase-desc {
    display:flex; align-items:center; gap:7px; padding:9px 13px;
    border-radius:10px; border:1px solid; font-size:11.5px; font-weight:500;
    transition:all .2s;
  }

  /* ── Timeline ─────────────────────────────────────────────────────────── */
  .sr-phase-timeline { display:flex; flex-direction:column; }

  .sr-phase-item {
    display:flex; gap:0;
    animation: sr-fadeup 0.3s ease both;
  }

  .sr-phase-spine {
    display:flex; flex-direction:column; align-items:center;
    width:32px; flex-shrink:0; padding-top:12px;
  }
  .sr-phase-dot {
    width:16px; height:16px; border-radius:50%;
    background:#f8fafc; border:2px solid;
    display:flex; align-items:center; justify-content:center;
    flex-shrink:0; z-index:1;
  }
  .sr-phase-dot-inner { width:6px; height:6px; border-radius:50%; }
  .sr-phase-line {
    width:2px; flex:1; min-height:20px; margin-top:4px;
    background:linear-gradient(to bottom,#e2e8f0,#f1f5f9);
  }

  .sr-phase-step { flex:1; padding:9px 0 22px 14px; }
  .sr-phase-step-text {
    font-size:13px; font-weight:500; color:#334155; line-height:1.55; margin:0;
  }

  /* ── Responsive ───────────────────────────────────────────────────────── */
  @media (max-width: 920px) {
    .sr-priority-grid  { grid-template-columns: 1fr; }
    .sr-phase-selector { flex-direction: column; }
    .sr-phase-btn      { width: 100%; min-width:0; }
  }
  @media (max-width: 640px) {
    .sr-phase-selector { gap: 8px; }
  }
`;