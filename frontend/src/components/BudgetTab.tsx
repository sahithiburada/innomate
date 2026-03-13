"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, ReferenceLine,
} from "recharts";
import {
  Wallet, TrendingUp, Flame, BarChart3,
  Zap, Shield, ChevronRight, ArrowUpRight,
  Clock, DollarSign, AlertCircle,
} from "lucide-react";
import InfoTooltip from "@/src/components/InfoTooltip";
const API = process.env.NEXT_PUBLIC_BACKEND_URL;

const COLORS = {
  revenue: "#16a34a",
  expense: "#ef4444",
  pie: ["#6366f1", "#16a34a", "#f59e0b", "#ef4444", "#8b5cf6"],
};

function fmt(n: number, symbol = "₹") {
  if (n >= 10_000_000) return `${symbol}${(n / 10_000_000).toFixed(1)}Cr`;
  if (n >= 100_000)    return `${symbol}${(n / 100_000).toFixed(1)}L`;
  if (n >= 1_000)      return `${symbol}${(n / 1_000).toFixed(1)}K`;
  return `${symbol}${n}`;
}

function KPICard({ icon: Icon, label, value, sub, accent, tooltip }: any) {
  return (
    <div className="bt-card bt-kpi">
      <div className="bt-kpi-icon" style={{ background: `${accent}14` }}>
        <Icon size={18} style={{ color: accent }} />
      </div>
      <div className="bt-kpi-label-row">
        <p className="bt-kpi-label">{label}</p>
        {tooltip && <InfoTooltip text={tooltip} />}
      </div>
      <p className="bt-kpi-value" style={{ color: accent }}>{value}</p>
      {sub && <p className="bt-kpi-sub">{sub}</p>}
    </div>
  );
}

function ChartTooltip({ active, payload, label, breakEvenMonth }: any) {
  if (!active || !payload?.length) return null;
  const isBreakEven = breakEvenMonth && label === breakEvenMonth && breakEvenMonth <= 36;
  return (
    <div className="bt-tooltip">
      {isBreakEven && <div className="bt-tooltip-badge">⚡ Break-even</div>}
      <p className="bt-tooltip-month">Month {label}</p>
      {payload.map((p: any) => (
        <div key={p.name} className="bt-tooltip-row">
          <span style={{ color: p.stroke ?? p.fill }}>
            {p.name === "revenue" ? "Revenue" : "Expense"}
          </span>
          <span className="bt-tooltip-val">{fmt(p.value)}</span>
        </div>
      ))}
    </div>
  );
}

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="bt-meta-row">
      <span className="bt-meta-label">{label}</span>
      <span className="bt-meta-value">{value}</span>
    </div>
  );
}

function ConfidencePill({ level }: { level: string }) {
  const styles: Record<string, { bg: string; color: string; border: string }> = {
    High:     { bg: "#dcfce7", color: "#15803d", border: "#bbf7d0" },
    Moderate: { bg: "#fef9c3", color: "#a16207", border: "#fef08a" },
    Low:      { bg: "#fee2e2", color: "#b91c1c", border: "#fecaca" },
  };
  const s = styles[level] ?? styles.Moderate;
  return (
    <span className="bt-confidence-pill"
      style={{ background: s.bg, color: s.color, border: `1px solid ${s.border}` }}>
      {level} confidence
    </span>
  );
}

// Revenue coverage context: how healthy is 38% coverage at M36?
function RevenueCoverageBadge({ pct }: { pct: number }) {
  const status =
    pct >= 80  ? { label: "Near break-even", color: "#15803d", bg: "#dcfce7", border: "#bbf7d0" } :
    pct >= 40  ? { label: "Normal burn phase", color: "#a16207", bg: "#fef9c3", border: "#fef08a" } :
                 { label: "Heavy burn phase", color: "#b91c1c", bg: "#fee2e2", border: "#fecaca" };
  return (
    <span className="bt-coverage-badge"
      style={{ color: status.color, background: status.bg, border: `1px solid ${status.border}` }}>
      {pct}% cost coverage · {status.label}
    </span>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function BudgetTab({ ideaId }: { ideaId: string }) {
  const [data, setData]       = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { if (ideaId) fetchBudget(); }, [ideaId]);

  async function fetchBudget() {
    const { data: sess } = await supabase.auth.getSession();
    const token = sess.session?.access_token;
    const res = await fetch(`${API}/api/budget/${ideaId}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
    const json = await res.json();
    setData(json.data);
    setLoading(false);
  }

if (loading) {
  return (
    <>
      <style>{CSS}</style>
      <div className="bt-state-wrap">
        <div className="bt-loading-ring" />
        <p className="bt-state-title">Analyzing financial projections…</p>
        <p className="bt-state-sub">
          Simulating revenue, burn rate and break-even timeline
        </p>
      </div>
    </>
  );
}

if (!data) return null;

  const sym = data.currency_symbol ?? "₹";
  const chartData = data.projection.map((m: any) => ({
    month: m.month, revenue: m.revenue, expense: m.expense,
  }));

  const breakEvenMonth: number | null = data.expected_break_even_month ?? null;
  const breakEvenLabel: string = data.break_even_label ?? (breakEvenMonth ? `Month ${breakEvenMonth}` : "Not reached");
  const breakEvenSub: string   = data.break_even_sub   ?? (breakEvenMonth && breakEvenMonth <= 36 ? `~${breakEvenMonth} months` : "Projected beyond window");
  const coveragePct: number    = data.revenue_coverage_pct ?? 0;
  const showBeyondMarker       = breakEvenMonth !== null && breakEvenMonth > 36;

  const growthItems:       string[]  = data.growth_drivers?.length      ? data.growth_drivers      : [];
  const riskItems:         string[]  = data.risk_signals?.length        ? data.risk_signals        : [];
  const budgetIntelligence: any[]    = data.budget_intelligence?.length ? data.budget_intelligence : [];

  return (
    <>
      <style>{CSS}</style>
      <div className="bt-grid">

        {/* ── Estimated Resource Profile ── */}
        <div className="bt-card bt-stage bt-full">
          <div className="bt-stage-left">
            <div className="bt-stage-eyebrow-row">
              <p className="bt-stage-eyebrow">Estimated Resource Profile</p>
              <InfoTooltip text="Based on idea complexity and domain — not your current funding status. This shows what level of resources this type of idea typically requires." />
            </div>
            <div className="bt-stage-chip">
              <span className="bt-stage-dot" />
              <div>
                <p className="bt-stage-name">{data.inferred_startup_stage}</p>
                <p className="bt-stage-desc">{data.stage_description}</p>
              </div>
            </div>
          </div>
          <div className="bt-stage-right">
            <ConfidencePill level={data.projection_confidence} />
            <span className="bt-stage-runway">
              <Clock size={13} style={{ marginRight: 4 }} />
              {data.runway_months}mo estimated runway
            </span>
          </div>
        </div>

        {/* ── KPI cards ── */}
        <KPICard
          icon={Wallet}
          label="Required Capital"
          value={fmt(data.estimated_required_capital, sym)}
          sub={`Dev cost: ${fmt(data.estimated_dev_cost, sym)}`}
          accent="#6366f1"
          tooltip="Total estimated capital needed to reach the runway target, including initial development cost and operating expenses."
        />
        <KPICard
          icon={BarChart3}
          label="Break-even"
          value={breakEvenLabel}
          sub={breakEvenSub}
          accent="#16a34a"
          tooltip="The projected month when cumulative revenue equals or exceeds cumulative expenses. Simulated over 60 months for accuracy."
        />
        <KPICard
          icon={TrendingUp}
          label="36M Revenue"
          value={fmt(data.revenue_projection_36_month, sym)}
          sub="Projected cumulative"
          accent="#f59e0b"
          tooltip="Total revenue accumulated over 36 months based on projected user growth, conversion rate, and ARPU for this business model."
        />
        <KPICard
          icon={Flame}
          label="Monthly Burn"
          value={fmt(data.monthly_operating_cost, sym)}
          sub="Operating cost / month"
          accent="#ef4444"
          tooltip="Estimated monthly operating cost at month 36, including salaries, marketing, operations, and variable COGS. Burn decreases slightly as operations mature."
        />

        {/* ── Revenue vs Expense chart ── */}
        <div className="bt-card bt-chart-card">
          <div className="bt-card-header">
            <div>
              <div className="bt-chart-title-row">
                <p className="bt-card-title">Revenue vs Expense</p>
                <InfoTooltip text="Cumulative revenue and expense over 36 months. A gap between lines is normal in early stages — most funded startups don't break even within 3 years. The coverage % below shows how much of costs are being covered by revenue at M36." />
              </div>
              <div className="bt-chart-sub-row">
                <p className="bt-card-sub">36-month projection · cumulative</p>
                {showBeyondMarker && (
                  <span className="bt-chart-beyond-note">
                    · break-even projected {breakEvenLabel.toLowerCase()}
                  </span>
                )}
              </div>
              <RevenueCoverageBadge pct={coveragePct} />
            </div>
            <div className="bt-legend-row">
              <span className="bt-legend-dot" style={{ background: COLORS.revenue }} />Revenue
              <span className="bt-legend-dot bt-legend-dot--dash" style={{ background: COLORS.expense }} />Expense
            </div>
          </div>
          <ResponsiveContainer width="100%" height={210}>
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="btRevGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor={COLORS.revenue} stopOpacity={0.15} />
                  <stop offset="95%" stopColor={COLORS.revenue} stopOpacity={0.01} />
                </linearGradient>
                <linearGradient id="btExpGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor={COLORS.expense} stopOpacity={0.12} />
                  <stop offset="95%" stopColor={COLORS.expense} stopOpacity={0.01} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="#f1f5f9" strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="month" tick={{ fill: "#94a3b8", fontSize: 11, fontFamily: "Inter, sans-serif" }} tickLine={false} axisLine={false} tickFormatter={(v) => `M${v}`} interval={5} />
              <YAxis tick={{ fill: "#94a3b8", fontSize: 11, fontFamily: "Inter, sans-serif" }} tickLine={false} axisLine={false} tickFormatter={(v) => fmt(v, sym)} width={60} />
              <Tooltip content={<ChartTooltip breakEvenMonth={breakEvenMonth} />} />
              {breakEvenMonth && breakEvenMonth <= 36 && (
                <ReferenceLine x={breakEvenMonth} stroke="#f59e0b" strokeDasharray="4 3" strokeWidth={1.5}
                  label={{ value: "BEP", position: "top", fill: "#d97706", fontSize: 10, fontFamily: "Inter, sans-serif" }} />
              )}
              <Area type="monotone" dataKey="expense" stroke={COLORS.expense} strokeWidth={2} strokeDasharray="5 4" fill="url(#btExpGrad)" dot={false} />
              <Area type="monotone" dataKey="revenue" stroke={COLORS.revenue} strokeWidth={2.5} fill="url(#btRevGrad)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* ── Business model ── */}
        <div className="bt-card bt-model-card">
          <div className="bt-card-header">
            <p className="bt-card-title">Business Model</p>
            <InfoTooltip text="Inferred business model details for this idea — model type, customer segment, and how revenue is generated." />
          </div>
          <div className="bt-model-rows">
            <MetaRow label="Type"         value={data.business_model_type} />
            <MetaRow label="Customer"     value={data.customer_type} />
            <MetaRow label="Monetization" value={data.monetization_model} />
            <MetaRow label="Pricing"      value={data.pricing_model} />
            <MetaRow label="Revenue"      value={data.revenue_stream} />
            <MetaRow label="Industry"     value={data.industry} />
          </div>
          <div className="bt-outlook-box">
            <ArrowUpRight size={14} style={{ color: "#6366f1", flexShrink: 0, marginTop: 2 }} />
            <p>{data.projection_confidence} viability · break-even {breakEvenLabel.toLowerCase()}</p>
          </div>
        </div>

        {/* ── Cost Structure donut — no % in legend ── */}
        <div className="bt-card bt-donut-card">
          <div className="bt-card-header">
            <p className="bt-card-title">Cost Structure</p>
            <InfoTooltip text="Breakdown of where capital goes across development, marketing, salaries, operations, and miscellaneous costs. Hover segments for exact percentages." />
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie
                data={data.cost_structure}
                cx="50%" cy="50%"
                innerRadius={52} outerRadius={78}
                dataKey="percentage" nameKey="name"
                paddingAngle={4} cornerRadius={6} strokeWidth={0}
              >
                {data.cost_structure.map((_: any, i: number) => (
                  <Cell key={i} fill={COLORS.pie[i % COLORS.pie.length]} />
                ))}
              </Pie>
              <Tooltip
                formatter={(v: any) => `${v}%`}
                contentStyle={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 12, fontFamily: "Inter, sans-serif", color: "#1e293b", boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }}
              />
            </PieChart>
          </ResponsiveContainer>
          {/* Legend — name only, NO percentage */}
          <div className="bt-donut-legend">
            {data.cost_structure.map((c: any, i: number) => (
              <div key={c.name} className="bt-donut-legend-item">
                <span className="bt-donut-dot" style={{ background: COLORS.pie[i % COLORS.pie.length] }} />
                <span className="bt-donut-name">{c.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Growth Drivers ── */}
        <div className="bt-card bt-signal-card">
          <div className="bt-card-header">
            <div className="bt-signal-header-left">
              <Zap size={15} style={{ color: "#16a34a" }} />
              <p className="bt-card-title">Growth Drivers</p>
            </div>
            <InfoTooltip text="Key factors that could accelerate revenue and user growth for this idea. Sourced from market trend analysis and financial model inference." />
          </div>
          {growthItems.length > 0 ? (
            <ul className="bt-signal-list">
              {growthItems.map((item, i) => (
                <li key={i} className="bt-signal-item">
                  <ChevronRight size={13} style={{ color: "#16a34a", flexShrink: 0 }} />
                  {item}
                </li>
              ))}
            </ul>
          ) : (
            <p className="bt-signal-empty">Run Market Analysis to populate growth drivers.</p>
          )}
        </div>

        {/* ── Risk Signals ── */}
        <div className="bt-card bt-signal-card">
          <div className="bt-card-header">
            <div className="bt-signal-header-left">
              <Shield size={15} style={{ color: "#ef4444" }} />
              <p className="bt-card-title">Risk Signals</p>
            </div>
            <InfoTooltip text="Specific risks that could affect this idea's financial viability. Sourced from risk analysis and domain-specific financial modeling." />
          </div>
          {riskItems.length > 0 ? (
            <ul className="bt-signal-list">
              {riskItems.map((item, i) => (
                <li key={i} className="bt-signal-item">
                  <ChevronRight size={13} style={{ color: "#ef4444", flexShrink: 0 }} />
                  {item}
                </li>
              ))}
            </ul>
          ) : (
            <p className="bt-signal-empty">Run Risk Analysis to populate risk signals.</p>
          )}
        </div>

        {/* ── Budget Intelligence — LLM + competitor context ── */}
        {budgetIntelligence.length > 0 && (
          <div className="bt-card bt-intel-card bt-full">
            <div className="bt-intel-header">
              <div className="bt-intel-header-left">
                <DollarSign size={16} style={{ color: "#6366f1" }} />
                <p className="bt-card-title">Budget Intelligence</p>
              </div>
              <InfoTooltip text="AI-generated capital allocation insights specific to this idea — how to spend, where competitors invest, and how to shorten time to break-even." />
            </div>
            <div className="bt-intel-grid">
              {budgetIntelligence.map((item: any, i: number) => (
                <div key={i} className="bt-intel-item">
                  <div className="bt-intel-item-header">
                    <span className="bt-intel-num">0{i + 1}</span>
                    <span className="bt-intel-title">{item.title}</span>
                  </div>
                  <p className="bt-intel-insight">{item.insight}</p>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </>
  );
}

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

  .bt-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 14px;
    width: 100%;
    font-family: 'Inter', sans-serif;
    color: #1e293b;
  }
  .bt-full { grid-column: 1 / -1; }

  .bt-card {
    background: #ffffff;
    border: 1px solid #e2e8f0;
    border-radius: 16px;
    padding: 18px 20px;
    position: relative;
    overflow: visible;
    transition: border-color 0.2s, box-shadow 0.2s, transform 0.2s;
  }

  /* ── KPI ── */
  .bt-kpi { display: flex; flex-direction: column; gap: 5px; min-height: 118px; }
  .bt-kpi-icon { width: 34px; height: 34px; border-radius: 10px; display: flex; align-items: center; justify-content: center; margin-bottom: 4px; }
  .bt-kpi-label-row { display: flex; align-items: center; }
  .bt-kpi-label { font-size: 11px; color: #94a3b8; letter-spacing: 0.05em; text-transform: uppercase; font-weight: 600; }
  .bt-kpi-value { font-size: 22px; font-weight: 700; letter-spacing: -0.02em; }
  .bt-kpi-sub   { font-size: 11px; color: #94a3b8; font-weight: 400; }

  /* ── Stage banner ── */
  .bt-stage { display: flex; align-items: center; justify-content: space-between; padding: 14px 20px; }
  .bt-stage-eyebrow-row { display: flex; align-items: center; margin-bottom: 6px; }
  .bt-stage-eyebrow { font-size: 10px; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.08em; font-weight: 600; }
  .bt-stage-chip { display: flex; align-items: flex-start; gap: 10px; }
  .bt-stage-dot  { width: 8px; height: 8px; border-radius: 50%; background: #16a34a; margin-top: 5px; flex-shrink: 0; box-shadow: 0 0 0 3px #dcfce7; }
  .bt-stage-name { font-size: 14px; font-weight: 700; color: #0f172a; }
  .bt-stage-desc { font-size: 12px; color: #64748b; margin-top: 2px; }
  .bt-stage-right { display: flex; align-items: center; gap: 12px; flex-shrink: 0; }
  .bt-stage-runway { display: flex; align-items: center; font-size: 12px; color: #64748b; font-weight: 500; }
  .bt-confidence-pill { font-size: 11px; font-weight: 600; padding: 4px 10px; border-radius: 20px; letter-spacing: 0.02em; }

  /* ── Card header / title ── */
  .bt-card-header { display: flex; align-items: flex-start; gap: 8px; justify-content: space-between; margin-bottom: 14px; }
  .bt-card-title  { font-size: 13.5px; font-weight: 700; color: #0f172a; }
  .bt-card-sub    { font-size: 11px; color: #94a3b8; margin-top: 2px; }
  .bt-chart-title-row { display: flex; align-items: center; gap: 4px; }
  .bt-chart-sub-row   { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }
  .bt-chart-beyond-note { font-size: 11px; color: #d97706; font-weight: 500; }

  /* ── Coverage badge ── */
  .bt-coverage-badge {
    display: inline-flex;
    align-items: center;
    font-size: 11px;
    font-weight: 600;
    padding: 3px 9px;
    border-radius: 20px;
    margin-top: 6px;
    letter-spacing: 0.01em;
  }

  /* ── Chart ── */
  .bt-chart-card { grid-column: span 3; }
  .bt-legend-row { display: flex; align-items: center; gap: 12px; font-size: 12px; color: #64748b; font-weight: 500; flex-shrink: 0; }
  .bt-legend-dot { display: inline-block; width: 8px; height: 8px; border-radius: 2px; margin-right: 4px; }

  /* ── Tooltip ── */
  .bt-tooltip { background: #fff; border: 1px solid #e2e8f0; border-radius: 10px; padding: 10px 14px; font-size: 12px; min-width: 140px; box-shadow: 0 4px 12px rgba(0,0,0,0.08); font-family: 'Inter', sans-serif; }
  .bt-tooltip-badge { font-size: 10px; color: #d97706; font-weight: 700; margin-bottom: 6px; }
  .bt-tooltip-month { color: #94a3b8; font-size: 11px; margin-bottom: 6px; font-weight: 500; }
  .bt-tooltip-row   { display: flex; justify-content: space-between; gap: 16px; margin-top: 3px; font-weight: 600; }
  .bt-tooltip-val   { color: #0f172a; }

  /* ── Business model ── */
  .bt-model-card { grid-column: span 1; }
  .bt-model-rows { display: flex; flex-direction: column; margin-bottom: 14px; }
  .bt-meta-row   { display: flex; justify-content: space-between; align-items: center; padding: 7px 0; border-bottom: 1px solid #f1f5f9; font-size: 12px; }
  .bt-meta-label { color: #94a3b8; font-weight: 500; }
  .bt-meta-value { color: #1e293b; font-weight: 600; text-align: right; max-width: 60%; }
  .bt-outlook-box { display: flex; gap: 8px; background: #f8fafc; border-radius: 10px; padding: 10px 12px; font-size: 12px; color: #475569; line-height: 1.5; border: 1px solid #e2e8f0; }

  /* ── Donut ── */
  .bt-donut-card { grid-column: span 2; display: flex; flex-direction: column; }
  .bt-donut-legend { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin-top: 10px; }
  .bt-donut-legend-item { display: flex; align-items: center; gap: 6px; font-size: 12px; }
  .bt-donut-dot  { width: 8px; height: 8px; border-radius: 3px; flex-shrink: 0; }
  .bt-donut-name { color: #64748b; font-weight: 500; }

  /* ── Signal cards ── */
  .bt-signal-card { grid-column: span 1; }
  .bt-signal-header-left { display: flex; align-items: center; gap: 6px; }
  .bt-signal-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 8px; }
  .bt-signal-item { display: flex; align-items: flex-start; gap: 8px; font-size: 12.5px; color: #475569; line-height: 1.45; font-weight: 500; }
  .bt-signal-empty { font-size: 12px; color: #94a3b8; font-style: italic; margin-top: 4px; }

  /* ── Budget Intelligence ── */
  .bt-intel-card { border-color: #e0e7ff; background: #fafafe; }
  .bt-intel-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
  .bt-intel-header-left { display: flex; align-items: center; gap: 8px; }
  .bt-intel-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
  .bt-intel-item {
    background: #ffffff;
    border: 1px solid #e0e7ff;
    border-radius: 12px;
    padding: 14px 16px;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  .bt-intel-item-header { display: flex; align-items: center; gap: 8px; }
  .bt-intel-num   { font-size: 11px; color: #6366f1; font-weight: 700; letter-spacing: 0.04em; }
  .bt-intel-title { font-size: 12.5px; font-weight: 700; color: #1e293b; }
  .bt-intel-insight { font-size: 12.5px; color: #475569; line-height: 1.6; margin: 0; font-weight: 400; }

/* ── Loading State ── */

.bt-state-wrap {
  display:flex;
  flex-direction:column;
  align-items:center;
  justify-content:center;
  gap:10px;
  padding:72px 24px;
  font-family:'Inter',sans-serif;
}

.bt-loading-ring {
  width:36px;
  height:36px;
  border-radius:50%;
  border:2.5px solid #e2e8f0;
  border-top-color:#6366f1;
  animation: bt-spin 0.8s linear infinite;
}

.bt-state-title {
  font-size:13.5px;
  font-weight:600;
  color:#475569;
  margin:0;
}

.bt-state-sub {
  font-size:12px;
  color:#94a3b8;
  margin:0;
  text-align:center;
}
  
  /* ── Responsive ── */
  @media (max-width: 1024px) {
    .bt-grid { grid-template-columns: repeat(2, 1fr); }
    .bt-chart-card { grid-column: span 2; }
    .bt-model-card { grid-column: span 2; }
    .bt-donut-card { grid-column: span 2; }
    .bt-intel-grid { grid-template-columns: 1fr; }
  }
  @media (max-width: 640px) {
    .bt-grid { grid-template-columns: 1fr; }
    .bt-chart-card, .bt-model-card, .bt-donut-card, .bt-signal-card { grid-column: span 1; }
  }
`;