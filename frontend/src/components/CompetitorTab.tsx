"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import InfoTooltip from "@/src/components/InfoTooltip";
import { TrendingUp, TrendingDown, Minus, ExternalLink, BarChart2 } from "lucide-react";

export default function CompetitorTab({
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

    const fetchCompetitors = async () => {
      setLoading(true);

      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/competitor/${ideaId}`,
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

    fetchCompetitors();
  }, [ideaId, acceptedVersion]);

  // ── Guard states ──────────────────────────────────────────────────────────

  if (!acceptedVersion) {
    return (
      <>
        <style>{CSS}</style>
        <div className="ct-empty">
          Accept your idea to unlock Competitor Intelligence.
        </div>
      </>
    );
  }

  if (loading) {
    return (
      <>
        <style>{CSS}</style>
        <div className="ct-state-wrap">
          <div className="ct-loading-ring" />
          <p className="ct-state-title">Analysing competitors…</p>
          <p className="ct-state-sub">Verifying real-world companies and trend data</p>
        </div>
      </>
    );
  }

  if (!data) return null;

  const competitors = data.top_competitors_ranked || [];


  // Rank accent colors — cycles through 5
  const RANK_COLORS = ["#7c3aed", "#0284c7", "#059669", "#d97706", "#dc2626"];

  return (
    <div className="ct-root">
      <style>{CSS}</style>

      {/* ── Header strip ───────────────────────────────────────────────── */}
      <div className="ct-header">
        <div className="ct-header-left">
          <div className="ct-header-icon">
            <BarChart2 size={14} color="#7c3aed" />
          </div>
          <div>
            <p className="ct-header-title">Top Competitors</p>
            <p className="ct-header-sub">
              Verified companies ranked by market popularity and trend momentum
            </p>
          </div>
        </div>
        <div className="ct-header-right">
          <span className="ct-count-pill">{competitors.length} verified</span>
          <InfoTooltip text="Competitors identified and verified via web search and Google Trends data." />
        </div>
      </div>

      {/* ── Competitor cards grid ───────────────────────────────────────── */}
      <div className="ct-grid">
        {competitors.map((comp: any, index: number) => {
          const accent  = RANK_COLORS[index % RANK_COLORS.length];
          let hostname  = "";
          try { hostname = comp.website ? new URL(comp.website).hostname : ""; } catch {}

          return (
            <div
              key={index}
              className="ct-card"
              style={{ animationDelay: `${index * 60}ms` }}
            >
              {/* Card header */}
              <div className="ct-card-header">
                <div className="ct-rank-bubble" style={{ background: `${accent}14`, color: accent, border: `1.5px solid ${accent}30` }}>
                  {index + 1}
                </div>
                <div className="ct-name-block">
                  <p className="ct-comp-name">{comp.name}</p>
                  {comp.business_model && (
                    <span className="ct-biz-model">{comp.business_model}</span>
                  )}
                </div>
                {hostname && (
                  <a
                    href={comp.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ct-website-btn"
                    title={hostname}
                  >
                    <ExternalLink size={13} color="#94a3b8" />
                  </a>
                )}
              </div>

              {/* Description */}
              <p className="ct-description">{comp.description}</p>

              {/* Website domain pill */}
              {hostname && (
                <a
                  href={comp.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ct-domain-pill"
                >
                  <ExternalLink size={10} />
                  {hostname}
                </a>
              )}

            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── CSS ──────────────────────────────────────────────────────────────────────

const CSS = `
  @keyframes ct-spin   { to { transform: rotate(360deg); } }
  @keyframes ct-fadeup { from { opacity:0; transform:translateY(7px); } to { opacity:1; transform:translateY(0); } }

  .ct-root {
    font-family: 'Inter', sans-serif;
    display: flex; flex-direction: column; gap: 16px;
    padding-bottom: 32px; color: #1e293b;
  }

  /* ── States ── */
  .ct-empty { padding:48px 24px; text-align:center; font-size:13.5px; color:#94a3b8; }
  .ct-state-wrap {
    display:flex; flex-direction:column; align-items:center;
    justify-content:center; gap:10px; padding:72px 24px;
  }
  .ct-loading-ring {
    width:36px; height:36px; border-radius:50%;
    border:2.5px solid #e2e8f0; border-top-color:#7c3aed;
    animation: ct-spin 0.8s linear infinite;
  }
  .ct-state-title { font-size:13.5px; font-weight:600; color:#475569; margin:0; }
  .ct-state-sub   { font-size:12px; color:#94a3b8; margin:0; text-align:center; }

  /* ── Header strip ── */
  .ct-header {
    display:flex; align-items:center; justify-content:space-between;
    padding:16px 18px; border-radius:16px;
    background:linear-gradient(135deg,#fafbff,#f5f3ff);
    border:1px solid #ddd6fe;
    animation: ct-fadeup 0.3s ease both;
  }
  .ct-header-left  { display:flex; align-items:center; gap:12px; }
  .ct-header-right { display:flex; align-items:center; gap:8px; }
  .ct-header-icon  {
    width:34px; height:34px; border-radius:10px; flex-shrink:0;
    background:#ede9fe; border:1px solid #ddd6fe;
    display:flex; align-items:center; justify-content:center;
  }
  .ct-header-title { font-size:14px; font-weight:700; color:#0f172a; margin:0 0 2px; }
  .ct-header-sub   { font-size:11.5px; color:#94a3b8; margin:0; }
  .ct-count-pill {
    font-size:11px; font-weight:700; padding:3px 10px; border-radius:20px;
    background:#ede9fe; color:#7c3aed; border:1px solid #ddd6fe;
  }

  /* ── Grid ── */
  .ct-grid {
    display:grid; grid-template-columns:repeat(2,1fr); gap:12px;
  }

  /* ── Card ── */
  .ct-card {
    background:#fff; border:1px solid #e8edf5; border-radius:16px;
    padding:18px; display:flex; flex-direction:column; gap:12px;
    animation: ct-fadeup 0.35s ease both;
    transition: box-shadow .18s, border-color .18s;
  }
  .ct-card:hover { box-shadow:0 4px 18px rgba(0,0,0,0.07); border-color:#c7d2fe; }

  /* Card header */
  .ct-card-header { display:flex; align-items:flex-start; gap:10px; }

  .ct-rank-bubble {
    flex-shrink:0; width:28px; height:28px; border-radius:50%;
    display:flex; align-items:center; justify-content:center;
    font-size:11px; font-weight:800; margin-top:1px;
  }

  .ct-name-block  { flex:1; min-width:0; }
  .ct-comp-name   { font-size:14px; font-weight:700; color:#0f172a; margin:0 0 3px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
  .ct-biz-model   {
    font-size:9.5px; font-weight:600; padding:1px 7px; border-radius:20px;
    background:#f1f5f9; border:1px solid #e2e8f0; color:#64748b;
    text-transform:uppercase; letter-spacing:0.04em;
    display:inline-block;
  }

  .ct-website-btn {
    flex-shrink:0; width:28px; height:28px; border-radius:8px;
    background:#f8fafc; border:1px solid #e8edf5;
    display:flex; align-items:center; justify-content:center;
    transition:background .15s, border-color .15s;
    margin-left:auto;
  }
  .ct-website-btn:hover { background:#ede9fe; border-color:#ddd6fe; }

  /* Description */
  .ct-description {
    font-size:12.5px; color:#475569; line-height:1.65;
    margin:0; padding:10px 12px;
    background:#f8fafc; border-radius:10px;
    border:1px solid #f1f5f9;
  }

  /* Metrics */
  .ct-metrics-row { display:grid; grid-template-columns:1fr 1fr; gap:8px; }

  .ct-metric {
    display:flex; flex-direction:column; gap:3px;
    padding:10px 12px; border-radius:12px;
  }
  .ct-metric-label   { font-size:9.5px; font-weight:700; color:#94a3b8; text-transform:uppercase; letter-spacing:0.05em; }
  .ct-metric-val-row { display:flex; align-items:baseline; gap:3px; }
  .ct-metric-val     { font-size:18px; font-weight:800; line-height:1; }
  .ct-metric-unit    { font-size:11px; font-weight:600; }
  .ct-metric-badge   { font-size:9.5px; font-weight:700; padding:1px 6px; border-radius:10px; width:fit-content; }

  /* Domain pill */
  .ct-domain-pill {
    display:inline-flex; align-items:center; gap:5px;
    font-size:10.5px; color:#64748b; padding:4px 10px;
    border-radius:20px; background:#f8fafc; border:1px solid #e8edf5;
    text-decoration:none; transition:background .15s, border-color .15s;
    width:fit-content;
  }
  .ct-domain-pill:hover { background:#ede9fe; border-color:#ddd6fe; color:#7c3aed; }

  /* ── Responsive ── */
  @media (max-width: 800px) {
    .ct-grid { grid-template-columns: 1fr; }
  }
`;