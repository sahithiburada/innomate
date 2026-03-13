"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import {
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Area,
  AreaChart,
} from "recharts";
import InfoTooltip from "@/src/components/InfoTooltip";
import { TrendingUp, TrendingDown, Minus, Zap, Globe, BarChart2 } from "lucide-react";

export default function MarketTrendsTab({
  ideaId,
  acceptedVersion
}: {
  ideaId: string;
  acceptedVersion: number;
}) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!ideaId || !acceptedVersion) return;

    const fetchMarket = async () => {
      setLoading(true);
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/market/${ideaId}`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const result = await response.json();
      if (result.status === "success") {
        setData(result.data);
      }

      setLoading(false);
    };

    fetchMarket();
  }, [ideaId, acceptedVersion]);

  // ── Guard states ──────────────────────────────────────────────────────────

  if (!acceptedVersion) {
    return (
      <>
        <style>{CSS}</style>
        <div className="mt-empty">
          Accept an idea version to unlock Market Intelligence.
        </div>
      </>
    );
  }

  if (loading) {
    return (
      <>
        <style>{CSS}</style>
        <div className="mt-state-wrap">
          <div className="mt-loading-ring" />
          <p className="mt-state-title">Analysing market…</p>
          <p className="mt-state-sub">Running lifecycle diagnosis and trend models</p>
        </div>
      </>
    );
  }

  if (!data) return null;

  // ── Opportunity config ────────────────────────────────────────────────────

  const OPP_CFG: Record<string, { bg: string; border: string; text: string; dot: string }> = {
    "Very Strong": { bg: "#f0fdf4", border: "#a7f3d0", text: "#059669", dot: "#059669" },
    "Strong":      { bg: "#f0fdf4", border: "#bbf7d0", text: "#16a34a", dot: "#16a34a" },
    "Moderate":    { bg: "#fffbeb", border: "#fde68a", text: "#d97706", dot: "#d97706" },
    "Weak":        { bg: "#fff7ed", border: "#fed7aa", text: "#ea580c", dot: "#ea580c" },
    "Very Weak":   { bg: "#fef2f2", border: "#fecaca", text: "#dc2626", dot: "#dc2626" },
  };

  const opp   = OPP_CFG[data.market_opportunity_level] ?? OPP_CFG["Moderate"];
  const stage = data.strategic_market_stage;

  const STAGE_CFG: Record<string, { bg: string; text: string; border: string }> = {
    "Emerging":  { bg: "#faf5ff", text: "#7c3aed", border: "#ddd6fe" },
    "Growing":   { bg: "#f0fdf4", text: "#059669", border: "#a7f3d0" },
    "Mature":    { bg: "#eff6ff", text: "#2563eb", border: "#bfdbfe" },
    "Declining": { bg: "#fef2f2", text: "#dc2626", border: "#fecaca" },
  };
  const stageCfg = STAGE_CFG[stage] ?? STAGE_CFG["Mature"];

  const demandCfg =
    data.strategic_demand_direction === "Increasing"
      ? { icon: TrendingUp,   color: "#059669", label: "Increasing" }
      : data.strategic_demand_direction === "Decreasing"
      ? { icon: TrendingDown, color: "#dc2626", label: "Decreasing" }
      : { icon: Minus,        color: "#6366f1", label: "Stable"     };

  const DemandIcon = demandCfg.icon;

  // ── Custom tooltip ────────────────────────────────────────────────────────

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="mt-chart-tooltip">
        <p className="mt-chart-tooltip-date">{label}</p>
        <p className="mt-chart-tooltip-val">{payload[0].value}</p>
      </div>
    );
  };

  return (
    <div className="mt-root">
      <style>{CSS}</style>

      {/* ── Row 1: Opportunity + Stage + Demand ─────────────────────────── */}
      <div className="mt-row3">

        {/* Market Potential */}
        <div className="mt-card mt-card--stat">
          <div className="mt-card-head">
            <span className="mt-card-label">Market Potential</span>
            <InfoTooltip text="Overall opportunity score based on demand strength, growth trend, and market maturity." />
          </div>
          <div className="mt-stat-body">
            <div
              className="mt-opp-pill"
              style={{ background: opp.bg, border: `1px solid ${opp.border}`, color: opp.text }}
            >
              <div className="mt-opp-dot" style={{ background: opp.dot }} />
              {data.market_opportunity_level}
            </div>
            <p className="mt-stat-caption">Combined market strength: {data.combined_market_strength ?? "—"}/100</p>
          </div>
        </div>

        {/* Market Stage */}
        <div className="mt-card mt-card--stat">
          <div className="mt-card-head">
            <span className="mt-card-label">Market Stage</span>
            <InfoTooltip text="Indicates whether the market is Emerging, Growing, Mature, or Declining." />
          </div>
          <div className="mt-stat-body">
            <div
              className="mt-stage-pill"
              style={{ background: stageCfg.bg, border: `1px solid ${stageCfg.border}`, color: stageCfg.text }}
            >
              {stage}
            </div>
            <p className="mt-stat-caption">Strategic confidence: {data.strategic_confidence_score ?? "—"}/100</p>
          </div>
        </div>

        {/* Demand direction */}
        <div className="mt-card mt-card--stat">
          <div className="mt-card-head">
            <span className="mt-card-label">Demand Trend</span>
            <InfoTooltip text="Direction of market demand based on search trends and lifecycle stage." />
          </div>
          <div className="mt-stat-body">
            <div className="mt-demand-row" style={{ color: demandCfg.color }}>
              <DemandIcon size={20} />
              <span className="mt-demand-label">{demandCfg.label}</span>
            </div>
            <p className="mt-stat-caption">Search trend: {data.search_direction ?? "—"} · Score: {data.search_trend_score ?? "—"}/100</p>
          </div>
        </div>

      </div>

      {/* ── Row 2: 5-year chart ─────────────────────────────────────────── */}
      <div className="mt-card">
        <div className="mt-card-head">
          <div className="mt-card-head-left">
            <div className="mt-card-icon-wrap">
              <BarChart2 size={13} color="#6366f1" />
            </div>
            <span className="mt-section-title">5-Year Market Demand</span>
          </div>
          <InfoTooltip text="Google search interest over 5 years (0–100 scale). 100 represents peak popularity." />
        </div>

        <ResponsiveContainer width="100%" height={260}>
          <AreaChart data={data.trend_data || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="mt-trend" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#818cf8" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#c084fc" stopOpacity={0}    />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="date" hide />
            <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="value"
              stroke="#818cf8"
              strokeWidth={2}
              fill="url(#mt-trend)"
              dot={false}
              activeDot={{ r: 4, fill: "#818cf8", strokeWidth: 0 }}
            />
          </AreaChart>
        </ResponsiveContainer>

        {/* Keywords used */}
        {data.optimized_search_keywords?.length > 0 && (
          <div className="mt-keywords-row">
            <span className="mt-keywords-label">Trend keywords:</span>
            {data.optimized_search_keywords.map((k: string, i: number) => (
              <span key={i} className="mt-keyword-pill">{k}</span>
            ))}
          </div>
        )}
      </div>

      {/* ── Row 3: Growth drivers + Industry forces ──────────────────────── */}
      <div className="mt-row2">

        {/* Growth Drivers */}
        <div className="mt-card">
          <div className="mt-card-head">
            <div className="mt-card-head-left">
              <div className="mt-card-icon-wrap" style={{ background: "#f0fdf4", border: "1px solid #a7f3d0" }}>
                <Zap size={13} color="#059669" />
              </div>
              <span className="mt-section-title">Why This Market Has Potential</span>
            </div>
            <InfoTooltip text="Key factors currently driving market growth." />
          </div>

          <div className="mt-signal-list">
            {(data.key_growth_drivers || []).map((d: any, i: number) => (
              <div key={i} className="mt-signal-item mt-signal-item--green" style={{ animationDelay: `${i * 55}ms` }}>
                <div className="mt-signal-num" style={{ background: "#dcfce7", color: "#059669", border: "1.5px solid #a7f3d0" }}>
                  {i + 1}
                </div>
                <p className="mt-signal-text">
                  {typeof d === "string"
                    ? d
                    : d?.driver
                    ? `${d.driver}${d.impact ? ` (${d.impact})` : ""}`
                    : JSON.stringify(d)}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Industry Forces */}
        <div className="mt-card">
          <div className="mt-card-head">
            <div className="mt-card-head-left">
              <div className="mt-card-icon-wrap" style={{ background: "#fffbeb", border: "1px solid #fde68a" }}>
                <Globe size={13} color="#d97706" />
              </div>
              <span className="mt-section-title">Industry Forces</span>
            </div>
            <InfoTooltip text="External pressures and risks affecting growth." />
          </div>

          <div className="mt-signal-list">
            {(data.macro_forces || []).map((d: any, i: number) => (
              <div key={i} className="mt-signal-item mt-signal-item--amber" style={{ animationDelay: `${i * 55}ms` }}>
                <div className="mt-signal-num" style={{ background: "#fef3c7", color: "#d97706", border: "1.5px solid #fde68a" }}>
                  {i + 1}
                </div>
                <p className="mt-signal-text">
                  {typeof d === "string"
                    ? d
                    : d?.force
                    ? `${d.force}${d.impact ? ` (${d.impact})` : ""}`
                    : JSON.stringify(d)}
                </p>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* ── Row 4: 5-year outlook ────────────────────────────────────────── */}
      <div className="mt-card mt-outlook-card">
        <div className="mt-card-head">
          <div className="mt-card-head-left">
            <div className="mt-card-icon-wrap" style={{ background: "#eff6ff", border: "1px solid #bfdbfe" }}>
              <TrendingUp size={13} color="#2563eb" />
            </div>
            <span className="mt-section-title">5-Year Outlook</span>
          </div>
          <InfoTooltip text="Strategic projection of how this market may evolve over the next five years." />
        </div>
        <p className="mt-outlook-text">{data.five_year_outlook}</p>
      </div>

    </div>
  );
}

// ─── CSS ──────────────────────────────────────────────────────────────────────

const CSS = `
  @keyframes mt-spin   { to { transform: rotate(360deg); } }
  @keyframes mt-fadeup { from { opacity:0; transform:translateY(6px); } to { opacity:1; transform:translateY(0); } }

  .mt-root {
    font-family: 'Inter', sans-serif;
    display: flex; flex-direction: column; gap: 14px;
    padding-bottom: 32px; color: #1e293b;
  }

  /* ── States ── */
  .mt-empty { padding:48px 24px; text-align:center; font-size:13.5px; color:#94a3b8; }
  .mt-state-wrap {
    display:flex; flex-direction:column; align-items:center;
    justify-content:center; gap:10px; padding:72px 24px;
  }
  .mt-loading-ring {
    width:36px; height:36px; border-radius:50%;
    border:2.5px solid #e2e8f0; border-top-color:#818cf8;
    animation: mt-spin 0.8s linear infinite;
  }
  .mt-state-title { font-size:13.5px; font-weight:600; color:#475569; margin:0; }
  .mt-state-sub   { font-size:12px; color:#94a3b8; margin:0; text-align:center; }

  /* ── Card ── */
  .mt-card {
    background:#fff; border:1px solid #e8edf5; border-radius:16px;
    padding:20px;
    animation: mt-fadeup 0.3s ease both;
    transition: box-shadow .18s;
  }
  .mt-card:hover { box-shadow: 0 4px 18px rgba(0,0,0,0.06); }
  .mt-card--stat { padding:18px 20px; }

  .mt-card-head {
    display:flex; align-items:center; justify-content:space-between;
    margin-bottom:14px;
  }
  .mt-card-head-left { display:flex; align-items:center; gap:8px; }
  .mt-card-label  { font-size:10.5px; font-weight:700; text-transform:uppercase; letter-spacing:0.06em; color:#94a3b8; }
  .mt-section-title { font-size:13.5px; font-weight:700; color:#0f172a; }

  .mt-card-icon-wrap {
    width:26px; height:26px; border-radius:8px; flex-shrink:0;
    display:flex; align-items:center; justify-content:center;
    background:#ede9fe; border:1px solid #ddd6fe;
  }

  /* ── Stat cards ── */
  .mt-stat-body    { display:flex; flex-direction:column; gap:8px; }
  .mt-stat-caption { font-size:11px; color:#94a3b8; margin:0; }

  .mt-opp-pill {
    display:inline-flex; align-items:center; gap:6px;
    padding:5px 12px; border-radius:20px;
    font-size:13px; font-weight:700; width:fit-content;
  }
  .mt-opp-dot { width:7px; height:7px; border-radius:50%; flex-shrink:0; }

  .mt-stage-pill {
    display:inline-flex; align-items:center;
    padding:5px 12px; border-radius:20px;
    font-size:13px; font-weight:700; width:fit-content;
  }

  .mt-demand-row  { display:flex; align-items:center; gap:7px; }
  .mt-demand-label { font-size:14px; font-weight:700; }

  /* ── Row layouts ── */
  .mt-row3 { display:grid; grid-template-columns:repeat(3,1fr); gap:12px; }
  .mt-row2 { display:grid; grid-template-columns:1fr 1fr;       gap:12px; }

  /* ── Chart tooltip ── */
  .mt-chart-tooltip {
    background:#fff; border:1px solid #e8edf5; border-radius:10px;
    padding:8px 12px; box-shadow:0 4px 14px rgba(0,0,0,0.08);
  }
  .mt-chart-tooltip-date { font-size:10px; color:#94a3b8; margin:0 0 2px; }
  .mt-chart-tooltip-val  { font-size:14px; font-weight:700; color:#0f172a; margin:0; }

  /* ── Keywords ── */
  .mt-keywords-row {
    display:flex; align-items:center; flex-wrap:wrap; gap:6px;
    margin-top:12px; padding-top:12px; border-top:1px dashed #e8edf5;
  }
  .mt-keywords-label { font-size:10.5px; color:#94a3b8; font-weight:600; text-transform:uppercase; letter-spacing:0.05em; }
  .mt-keyword-pill {
    font-size:10.5px; padding:2px 9px; border-radius:20px;
    background:#f1f5f9; border:1px solid #e2e8f0; color:#64748b; font-weight:500;
  }

  /* ── Signal list ── */
  .mt-signal-list  { display:flex; flex-direction:column; gap:8px; }
  .mt-signal-item  {
    display:flex; align-items:flex-start; gap:10px;
    padding:10px 12px; border-radius:12px;
    animation: mt-fadeup 0.3s ease both;
  }
  .mt-signal-item--green { background:linear-gradient(135deg,#f0fdf4,#dcfce7); border:1px solid #a7f3d0; }
  .mt-signal-item--amber { background:linear-gradient(135deg,#fffbeb,#fef3c7); border:1px solid #fde68a; }

  .mt-signal-num {
    flex-shrink:0; width:20px; height:20px; border-radius:50%;
    display:flex; align-items:center; justify-content:center;
    font-size:10px; font-weight:700; margin-top:1px;
  }
  .mt-signal-text { font-size:12.5px; font-weight:500; line-height:1.6; margin:0; color:#1e293b; }

  /* ── Outlook ── */
  .mt-outlook-card { background:linear-gradient(135deg,#fafbff,#f5f3ff); border-color:#ddd6fe; }
  .mt-outlook-text { font-size:13px; color:#475569; line-height:1.8; margin:0; }

  /* ── Responsive ── */
  @media (max-width: 920px) {
    .mt-row3 { grid-template-columns: 1fr 1fr; }
    .mt-row2 { grid-template-columns: 1fr; }
  }
  @media (max-width: 600px) {
    .mt-row3 { grid-template-columns: 1fr; }
  }
`;