"""
app/services/report_service.py

ReportLab + matplotlib PDF — polished version.
Fixes vs previous:
  - Page border rectangle on every page
  - Navy accent bar at top of every page
  - Market trend x-axis: clean year labels (strips datetime noise)
  - Risk section: extracts clean strings from nested list/dict values
  - Rs. symbol used everywhere (Helvetica-safe, no broken glyphs)
  - SWOT 2x2 grid kept together on one page
  - Better spacing, section dividers, competitor table dark header
"""

import io
import os
import re
import json
import uuid
import httpx
from datetime import datetime

import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import matplotlib.ticker as mticker
import numpy as np

from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.units import mm, cm
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
    Image, PageBreak, KeepTogether,
)
from reportlab.platypus.flowables import HRFlowable

from sqlalchemy import text

from app.services.market_service          import generate_market_analysis
from app.services.competitor_service      import generate_competitor_analysis
from app.services.swot_service            import generate_swot_analysis
from app.services.risk_service            import generate_risk_analysis
from app.services.budget_service          import generate_budget_analysis
from app.services.recommendation_service  import generate_smart_recommendations
from app.utils.context_builder            import build_idea_context

SUPABASE_URL         = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

PAGE_W, PAGE_H = A4
MARGIN    = 1.8 * cm          # left/right margin inside border
CONTENT_W = PAGE_W - 2 * MARGIN

# ── Palette ──────────────────────────────────────────────────
C_NAVY    = colors.HexColor("#1a3c6e")
C_BLACK   = colors.HexColor("#111111")
C_DARK    = colors.HexColor("#222222")
C_MID     = colors.HexColor("#555555")
C_MUTED   = colors.HexColor("#888888")
C_LGREY   = colors.HexColor("#f4f4f4")
C_BORDER  = colors.HexColor("#c0c0c0")
C_HDR     = colors.HexColor("#e8e8e8")
C_WHITE   = colors.white

C_S_BG    = colors.HexColor("#edfaf3")   # strengths
C_W_BG    = colors.HexColor("#fff7ee")   # weaknesses
C_O_BG    = colors.HexColor("#eef4ff")   # opportunities
C_T_BG    = colors.HexColor("#fff4f4")   # threats
C_S_TXT   = colors.HexColor("#1a5c30")
C_W_TXT   = colors.HexColor("#a64000")
C_O_TXT   = colors.HexColor("#1045a0")
C_T_TXT   = colors.HexColor("#8b0000")

# ── Styles ───────────────────────────────────────────────────
S_TITLE = ParagraphStyle("Title",
    fontName="Helvetica-Bold", fontSize=28,
    textColor=C_NAVY, leading=34, spaceAfter=4)

S_SUBTITLE = ParagraphStyle("Subtitle",
    fontName="Helvetica-Oblique", fontSize=12,
    textColor=C_MID, leading=17, spaceAfter=0)

S_SECTION = ParagraphStyle("Section",
    fontName="Helvetica-Bold", fontSize=13,
    textColor=C_NAVY, leading=18,
    spaceBefore=14, spaceAfter=7)

S_BODY = ParagraphStyle("Body",
    fontName="Helvetica", fontSize=10,
    textColor=C_DARK, leading=15, spaceAfter=3)

S_SMALL = ParagraphStyle("Small",
    fontName="Helvetica", fontSize=9,
    textColor=C_MID, leading=13)

S_BOLD = ParagraphStyle("Bold",
    fontName="Helvetica-Bold", fontSize=10,
    textColor=C_BLACK, leading=15, spaceAfter=4)

S_LABEL = ParagraphStyle("Label",
    fontName="Helvetica-Bold", fontSize=9,
    textColor=C_DARK, leading=13)

S_BULLET = ParagraphStyle("Bullet",
    fontName="Helvetica", fontSize=10,
    textColor=C_DARK, leading=15,
    leftIndent=14, firstLineIndent=-10, spaceAfter=3)

S_ITALIC = ParagraphStyle("Italic",
    fontName="Helvetica-Oblique", fontSize=9,
    textColor=C_MID, leading=13,
    leftIndent=16, spaceAfter=3)


# ─────────────────────────────────────────────────────────────
# PAGE CANVAS DECORATOR  — border + navy bar + header + footer
# ─────────────────────────────────────────────────────────────

def _make_page_fn(generated_str: str):
    def draw(canvas, doc):
        canvas.saveState()
        w, h = A4

        # ── outer border ──────────────────────────────────
        canvas.setStrokeColor(C_BORDER)
        canvas.setLineWidth(1.0)
        canvas.rect(14, 14, w - 28, h - 28)

        # ── navy accent bar across top ────────────────────
        canvas.setFillColor(C_NAVY)
        canvas.rect(14, h - 30, w - 28, 16, stroke=0, fill=1)

        # ── brand in bar ─────────────────────────────────
        canvas.setFont("Helvetica-Bold", 8)
        canvas.setFillColor(C_WHITE)
        canvas.drawString(22, h - 22, "INNOMATE  |  Startup Intelligence Report")

        # ── date in bar ──────────────────────────────────
        canvas.drawRightString(w - 22, h - 22, f"Generated: {generated_str}")

        # ── bottom separator line ─────────────────────────
        canvas.setStrokeColor(C_BORDER)
        canvas.setLineWidth(0.5)
        canvas.line(22, 26, w - 22, 26)

        # ── footer text ───────────────────────────────────
        canvas.setFont("Helvetica", 8)
        canvas.setFillColor(C_MUTED)
        canvas.drawString(22, 16, "Confidential Startup Analysis")
        canvas.drawRightString(w - 22, 16, f"Page {doc.page}")

        canvas.restoreState()
    return draw


# ─────────────────────────────────────────────────────────────
# HELPERS
# ─────────────────────────────────────────────────────────────

def _t(val, default="N/A"):
    return str(val) if val not in (None, "", [], {}) else default


def _fmt_inr(val):
    """Rs. N,NNN — pure ASCII, safe for Helvetica (no rupee glyph)."""
    try:
        n = int(val)
        return f"Rs. {n:,}"
    except (TypeError, ValueError):
        s = str(val) if val else "N/A"
        # replace any rupee glyph variants with Rs.
        s = re.sub(r"[₹\u20b9]", "Rs.", s)
        return s


def _clean_inr_text(text: str) -> str:
    """Strip rupee glyphs from arbitrary text (for budget_intelligence insights)."""
    return re.sub(r"[₹\u20b9]", "Rs.", str(text))


def _clean_date_label(raw) -> str:
    """'2021-03-07 00:00:00' → '2021',  '2024-06' → '2024-06',  other → as-is."""
    s = str(raw).strip()
    m = re.match(r"(\d{4})-\d{2}-\d{2}", s)
    if m:
        return m.group(1)
    if re.match(r"\d{4}-\d{2}$", s):
        return s
    return s


def _extract_risk_bullets(det: dict) -> list[str]:
    """Pull clean string sentences from Detailed_Explanation regardless of nesting."""
    out = []
    for v in det.values():
        if isinstance(v, str) and v.strip():
            out.append(v.strip())
        elif isinstance(v, list):
            for item in v:
                if isinstance(item, str) and item.strip():
                    out.append(item.strip())
                elif isinstance(item, dict):
                    txt = item.get("reason") or item.get("description") or item.get("insight", "")
                    if txt: out.append(str(txt).strip())
        elif isinstance(v, dict):
            txt = v.get("reason") or v.get("description") or v.get("insight", "")
            if txt: out.append(str(txt).strip())
    return out[:4]


def _bullet(text: str) -> Paragraph:
    return Paragraph(f"&bull;  {_clean_inr_text(text)}", S_BULLET)


def _bullets(items, fallback="N/A"):
    if not items:
        return [Paragraph(fallback, S_BODY)]
    return [_bullet(str(i)) for i in items if str(i).strip()]


def _section_block(num: int, title: str) -> list:
    """Section heading + full-width navy underline."""
    return [
        Paragraph(f"{num}.  {title}", S_SECTION),
        HRFlowable(width="100%", thickness=1.5, color=C_NAVY,
                   spaceAfter=6, spaceBefore=0),
    ]


def _kv_table(rows, col_widths=None):
    cw = col_widths or [CONTENT_W * 0.33, CONTENT_W * 0.67]
    data = [[Paragraph(k, S_LABEL), Paragraph(v, S_BODY)] for k, v in rows]
    t = Table(data, colWidths=cw)
    t.setStyle(TableStyle([
        ("BACKGROUND",    (0, 0), (0, -1), C_HDR),
        ("GRID",          (0, 0), (-1, -1), 0.5, C_BORDER),
        ("VALIGN",        (0, 0), (-1, -1), "MIDDLE"),
        ("LEFTPADDING",   (0, 0), (-1, -1), 8),
        ("RIGHTPADDING",  (0, 0), (-1, -1), 8),
        ("TOPPADDING",    (0, 0), (-1, -1), 5),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
        # Alternating rows on value column
        ("ROWBACKGROUNDS", (1, 0), (1, -1), [C_WHITE, C_LGREY]),
    ]))
    return t


def _sub_heading(text: str) -> Paragraph:
    return Paragraph(text, S_BOLD)


# ─────────────────────────────────────────────────────────────
# CHARTS
# ─────────────────────────────────────────────────────────────

def _chart_market_trend(trend_data: list):
    if not trend_data:
        return None
    try:
        raw_labels = [str(d.get("date", d.get("month", i)))
                      for i, d in enumerate(trend_data)]
        labels = [_clean_date_label(l) for l in raw_labels]
        values = [float(d.get("value", d.get("score", 0))) for d in trend_data]

        fig, ax = plt.subplots(figsize=(7.2, 3.0))
        ax.plot(range(len(values)), values, color="#1a3c6e", linewidth=2.2)
        ax.fill_between(range(len(values)), values, alpha=0.10, color="#1a3c6e")
        ax.set_title("Market Trend Index", fontsize=11, fontweight="bold", pad=10)
        ax.set_xlabel("Time", fontsize=9)
        ax.set_ylabel("Search Interest", fontsize=9)

        # Deduplicate labels; show at most 7 ticks
        step = max(1, len(labels) // 7)
        tick_idx = list(range(0, len(labels), step))
        # Show only unique year labels to avoid clutter
        shown, tick_labels = set(), []
        for i in tick_idx:
            lbl = labels[i]
            tick_labels.append(lbl if lbl not in shown else "")
            shown.add(lbl)

        ax.set_xticks(tick_idx)
        ax.set_xticklabels(tick_labels, fontsize=8, rotation=0)
        ax.tick_params(axis="y", labelsize=8)
        ax.spines["top"].set_visible(False)
        ax.spines["right"].set_visible(False)
        ax.yaxis.set_major_locator(mticker.MaxNLocator(integer=True, nbins=5))
        fig.tight_layout(pad=1.2)

        buf = io.BytesIO()
        fig.savefig(buf, format="png", dpi=150, bbox_inches="tight")
        plt.close(fig)
        buf.seek(0)
        return Image(buf, width=CONTENT_W * 0.92, height=7 * cm)
    except Exception as e:
        print(f"[report] market trend chart error: {e}")
        return None


def _chart_revenue_expense(projection: list):
    if not projection:
        return None
    try:
        months   = [p["month"]   for p in projection]
        revenues = [p["revenue"] / 1e7 for p in projection]
        expenses = [p["expense"] / 1e7 for p in projection]

        be_idx = next(
            (i for i, p in enumerate(projection) if p["revenue"] >= p["expense"]),
            None
        )

        x, w = np.arange(len(months)), 0.38
        fig, ax = plt.subplots(figsize=(7.2, 3.2))
        ax.bar(x - w/2, revenues, w, label="Revenue",  color="#4a86c8", alpha=0.88)
        ax.bar(x + w/2, expenses, w, label="Expenses", color="#e8721c", alpha=0.88)
        if be_idx is not None:
            ax.axvline(x=be_idx - 0.5, color="#cc0000",
                       linestyle="--", linewidth=1.6, label="Break-even")
        ax.set_title("Revenue vs Expense (36 Month Projection)",
                     fontsize=11, fontweight="bold", pad=10)
        ax.set_xlabel("Month", fontsize=9)
        ax.set_ylabel("Amount (Rs.) 1e7", fontsize=9)
        ax.legend(fontsize=8, loc="upper left", framealpha=0.8)
        step = max(1, len(months) // 9)
        ax.set_xticks(x[::step])
        ax.set_xticklabels([str(months[i]) for i in range(0, len(months), step)], fontsize=8)
        ax.tick_params(axis="y", labelsize=8)
        ax.spines["top"].set_visible(False)
        ax.spines["right"].set_visible(False)
        ax.yaxis.set_major_locator(mticker.MaxNLocator(nbins=5))
        fig.tight_layout(pad=1.2)

        buf = io.BytesIO()
        fig.savefig(buf, format="png", dpi=150, bbox_inches="tight")
        plt.close(fig)
        buf.seek(0)
        return Image(buf, width=CONTENT_W * 0.92, height=7 * cm)
    except Exception as e:
        print(f"[report] revenue chart error: {e}")
        return None


def _chart_cost_pie(cost_structure: list):
    if not cost_structure:
        return None
    try:
        labels     = [c["name"] for c in cost_structure]
        sizes      = [max(c.get("percentage", 1), 1) for c in cost_structure]
        palette    = ["#2e75b6", "#70ad47", "#e8721c", "#ffc000", "#7030a0", "#c00000"]

        fig, ax = plt.subplots(figsize=(6.5, 4.2))
        wedges, texts, autotexts = ax.pie(
            sizes, labels=labels, autopct="%1.1f%%",
            colors=palette[:len(labels)],
            startangle=90, pctdistance=0.80,
            textprops={"fontsize": 9},
        )
        for at in autotexts:
            at.set_fontsize(8)
            at.set_fontweight("bold")
            at.set_color("white")
        ax.set_title("Startup Cost Distribution",
                     fontsize=11, fontweight="bold", pad=14)
        fig.tight_layout(pad=1.2)

        buf = io.BytesIO()
        fig.savefig(buf, format="png", dpi=150, bbox_inches="tight")
        plt.close(fig)
        buf.seek(0)
        return Image(buf, width=CONTENT_W * 0.75, height=8.5 * cm)
    except Exception as e:
        print(f"[report] cost pie error: {e}")
        return None


# ─────────────────────────────────────────────────────────────
# STORY BUILDER
# ─────────────────────────────────────────────────────────────

def _build_story(ctx: dict, data: dict, generated_str: str) -> list:
    identity    = ctx["identity"]
    positioning = ctx["positioning"]
    mkt_def     = ctx["market_definition"]

    title      = identity["title"]
    domain     = identity["domain"]
    subdomain  = identity["subdomain"]
    problem    = mkt_def.get("core_problem")              or "N/A"
    value_prop = positioning.get("core_value_proposition") or "N/A"
    audience   = ", ".join(mkt_def.get("target_segments") or []) or "N/A"
    summary    = positioning.get("summarized_idea")        or "N/A"
    abstract   = positioning.get("abstract_context")       or ""

    m  = data.get("market")     or {}
    c  = data.get("competitor") or {}
    s  = data.get("swot")       or {}
    r  = data.get("risk")       or {}
    b  = data.get("budget")     or {}
    rc = data.get("recommend")  or {}

    ps          = r.get("Primary_Summary", {})
    competitors = c.get("top_competitors_ranked", [])

    SP    = Spacer(1, 6)
    SP_LG = Spacer(1, 16)
    story = []

    # ── Cover title ──────────────────────────────────────────
    story.append(Spacer(1, 1.2 * cm))
    story.append(Paragraph(title, S_TITLE))
    if abstract:
        story.append(Paragraph(abstract, S_SUBTITLE))
    story.append(Spacer(1, 4))
    story.append(HRFlowable(width="100%", thickness=2, color=C_NAVY,
                             spaceAfter=12, spaceBefore=4))

    # ══ 1. STARTUP OVERVIEW ═════════════════════════════════
    story += _section_block(1, "Startup Overview")
    story.append(_kv_table([
        ("Startup Name", title),
        ("Domain",       domain),
        ("Subdomain",    subdomain),
    ]))
    story.append(SP)

    for label, val in [
        ("Business Context", abstract   if abstract   else None),
        ("Problem",          problem),
        ("Value Proposition",value_prop),
        ("Target Audience",  audience),
        ("Startup Summary",  summary),
    ]:
        if val and val != "N/A":
            story.append(_sub_heading(label))
            story.append(Paragraph(val, S_BODY))
            story.append(SP)
    story.append(SP_LG)

    # ══ 2. MARKET OPPORTUNITY ═══════════════════════════════
    story += _section_block(2, "Market Opportunity")
    story.append(_kv_table([
        ("Market Stage",      _t(m.get("strategic_market_stage"))),
        ("Demand Direction",  _t(m.get("strategic_demand_direction"))),
        ("Opportunity Score", f"{_t(m.get('combined_market_strength'))}/100"),
        ("Opportunity Level", _t(m.get("market_opportunity_level"))),
    ]))
    story.append(SP)

    story.append(_sub_heading("Key Growth Drivers"))
    story.extend(_bullets(m.get("key_growth_drivers", [])))
    story.append(SP)

    story.append(_sub_heading("Industry Forces"))
    story.extend(_bullets(m.get("macro_forces", [])))
    story.append(SP)

    story.append(_sub_heading("5-Year Outlook"))
    story.append(Paragraph(_t(m.get("five_year_outlook")), S_ITALIC))
    story.append(SP)

    trend_chart = _chart_market_trend(m.get("trend_data", []))
    if trend_chart:
        story.append(trend_chart)
    story.append(SP_LG)

    # ══ 3. COMPETITIVE LANDSCAPE ════════════════════════════
    story.append(PageBreak())
    story += _section_block(3, "Competitive Landscape")

    if competitors:
        hdr = [Paragraph(h, ParagraphStyle("WhiteLbl",
                fontName="Helvetica-Bold", fontSize=9,
                textColor=C_WHITE, leading=13))
               for h in ["Competitor", "Description", "Business Model", "Score"]]
        rows = [hdr]
        for comp in competitors[:6]:
            score = comp.get("popularity_avg", comp.get("overall_score", "—"))
            rows.append([
                Paragraph(_t(comp.get("name")), S_BOLD),
                Paragraph(_t(comp.get("description")), S_SMALL),
                Paragraph(_t(comp.get("business_model")), S_SMALL),
                Paragraph(str(score), S_BODY),
            ])
        cw = [CONTENT_W*0.15, CONTENT_W*0.44, CONTENT_W*0.28, CONTENT_W*0.13]
        ct = Table(rows, colWidths=cw, repeatRows=1)
        ct.setStyle(TableStyle([
            ("BACKGROUND",    (0, 0), (-1, 0), C_NAVY),
            ("GRID",          (0, 0), (-1, -1), 0.5, C_BORDER),
            ("VALIGN",        (0, 0), (-1, -1), "TOP"),
            ("LEFTPADDING",   (0, 0), (-1, -1), 6),
            ("RIGHTPADDING",  (0, 0), (-1, -1), 6),
            ("TOPPADDING",    (0, 0), (-1, -1), 5),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
            ("ROWBACKGROUNDS",(0, 1), (-1, -1), [C_WHITE, C_LGREY]),
        ]))
        story.append(ct)
    else:
        story.append(Paragraph("No competitor data available.", S_BODY))

    ci = c.get("competitive_insights") or c.get("competitive_landscape_summary")
    if ci:
        story.append(SP)
        story.append(_sub_heading("Competitive Insights"))
        story.extend(_bullets(ci) if isinstance(ci, list) else [Paragraph(str(ci), S_BODY)])
    story.append(SP_LG)

    # ══ 4. SWOT ANALYSIS ════════════════════════════════════
    story += _section_block(4, "SWOT Analysis")

    def _swot_cell(items, header, hcolor, bg):
        cell = [Paragraph(header, ParagraphStyle(
            f"SH{header}", fontName="Helvetica-Bold", fontSize=10,
            textColor=hcolor, spaceAfter=6))]
        cell += [_bullet(str(i)) for i in (items or ["N/A"])]
        return cell

    swot_tbl = Table(
        [
            [_swot_cell(s.get("Strengths",    []), "Strengths",     C_S_TXT, C_S_BG),
             _swot_cell(s.get("Weaknesses",   []), "Weaknesses",    C_W_TXT, C_W_BG)],
            [_swot_cell(s.get("Opportunities",[]), "Opportunities", C_O_TXT, C_O_BG),
             _swot_cell(s.get("Threats",      []), "Threats",       C_T_TXT, C_T_BG)],
        ],
        colWidths=[CONTENT_W * 0.5, CONTENT_W * 0.5]
    )
    swot_tbl.setStyle(TableStyle([
        ("BOX",           (0, 0), (-1, -1), 1.2, C_BORDER),
        ("INNERGRID",     (0, 0), (-1, -1), 0.75, C_BORDER),
        ("VALIGN",        (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING",   (0, 0), (-1, -1), 10),
        ("RIGHTPADDING",  (0, 0), (-1, -1), 10),
        ("TOPPADDING",    (0, 0), (-1, -1), 10),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 10),
        ("BACKGROUND",    (0, 0), (0, 0), C_S_BG),
        ("BACKGROUND",    (1, 0), (1, 0), C_W_BG),
        ("BACKGROUND",    (0, 1), (0, 1), C_O_BG),
        ("BACKGROUND",    (1, 1), (1, 1), C_T_BG),
    ]))
    story.append(KeepTogether([swot_tbl]))
    story.append(SP_LG)

    # ══ 5. RISK & FEASIBILITY ═══════════════════════════════
    story.append(PageBreak())
    story += _section_block(5, "Risk & Feasibility")
    story.append(_kv_table([
        ("Overall Risk Score",   _t(ps.get("Overall_Risk_Score"))),
        ("Risk Level",           _t(ps.get("Overall_Risk_Level"))),
        ("Feasibility Score",    _t(ps.get("Feasibility_Score"))),
        ("Execution Risk Score", _t(ps.get("Execution_Risk_Score"))),
    ]))
    story.append(SP)

    # ── clean risk interpretation ────────────────────────────
    det = r.get("Detailed_Explanation", {})
    if det and isinstance(det, dict):
        risk_bullets = _extract_risk_bullets(det)
        if risk_bullets:
            story.append(_sub_heading("Risk Interpretation"))
            story.extend(_bullets(risk_bullets))
            story.append(SP)

    # ── key risks / mitigation ───────────────────────────────
    top_risks = ps.get("Top_3_Key_Risks", [])
    if top_risks:
        story.append(_sub_heading("Key Risks & Mitigation"))
        story.extend(_bullets(top_risks))
        story.append(SP)

    # ── verdict box ──────────────────────────────────────────
    verdict = ps.get("Final_Verdict")
    if verdict:
        vbox = Table(
            [[Paragraph(f"Verdict:  {verdict}", S_BOLD)]],
            colWidths=[CONTENT_W]
        )
        vbox.setStyle(TableStyle([
            ("BACKGROUND",    (0, 0), (-1, -1), C_LGREY),
            ("BOX",           (0, 0), (-1, -1), 1.0, C_NAVY),
            ("LEFTPADDING",   (0, 0), (-1, -1), 10),
            ("TOPPADDING",    (0, 0), (-1, -1), 7),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 7),
        ]))
        story.append(vbox)
    story.append(SP_LG)

    # ══ 6. FINANCIAL INSIGHTS ═══════════════════════════════
    story += _section_block(6, "Financial Insights")
    story.append(_kv_table([
        ("Capital Required",      _fmt_inr(b.get("estimated_required_capital"))),
        ("Startup Stage",         _t(b.get("inferred_startup_stage"))),
        ("Break-even",            _t(b.get("break_even_label"))),
        ("36-Month Revenue",      _fmt_inr(b.get("revenue_projection_36_month"))),
        ("Projection Confidence", _t(b.get("projection_confidence"))),
    ]))
    story.append(SP)

    budget_intel = b.get("budget_intelligence", [])
    if budget_intel:
        story.append(_sub_heading("Financial Outlook"))
        for bi in budget_intel:
            ins = bi.get("insight", "") if isinstance(bi, dict) else str(bi)
            if ins.strip():
                story.append(_bullet(ins))
        story.append(SP)

    drivers = b.get("growth_drivers", [])
    if drivers:
        story.append(_sub_heading("Key Growth Drivers"))
        story.extend(_bullets(drivers))
        story.append(SP)

    rev_chart = _chart_revenue_expense(b.get("projection", []))
    if rev_chart:
        story.append(rev_chart)
        story.append(Spacer(1, 10))

    cost_chart = _chart_cost_pie(b.get("cost_structure", []))
    if cost_chart:
        story.append(cost_chart)
    story.append(SP_LG)

    # ══ 7. STRATEGIC RECOMMENDATIONS ════════════════════════
    story.append(PageBreak())
    story += _section_block(7, "Strategic Recommendations")

    recs = rc.get("strategic_recommendations", [])
    priority_order = {"High": 0, "Medium": 1, "Long-Term": 2}
    sorted_recs = sorted(
        recs, key=lambda x: priority_order.get(x.get("priority", "Medium"), 1)
    )
    current_p = None
    for rec in sorted_recs:
        p = rec.get("priority", "Medium")
        if p != current_p:
            current_p = p
            label = {
                "High":      "High Priority Actions",
                "Medium":    "Medium Priority Actions",
                "Long-Term": "Long Term Actions",
            }.get(p, f"{p} Priority Actions")
            story.append(SP)
            story.append(_sub_heading(label))
        if rec.get("action"):
            story.append(_bullet(rec["action"]))
        if rec.get("reason"):
            story.append(Paragraph(rec["reason"], S_ITALIC))

    insights = rc.get("strategic_insights", [])
    if insights:
        story.append(SP)
        story.append(_sub_heading("Strategic Insights"))
        for ins in insights:
            obs = ins.get("observation", ins) if isinstance(ins, dict) else str(ins)
            story.append(_bullet(str(obs)))
    story.append(SP_LG)

    # ══ 8. STARTUP ROADMAP ══════════════════════════════════
    story += _section_block(8, "Startup Roadmap")

    phase_labels = {
        "Validation":   "Phase 1 - Validation",
        "Market Entry": "Phase 2 - Market Entry",
        "Scale":        "Phase 3 - Scale",
    }
    for phase in rc.get("execution_roadmap", []):
        pname = phase.get("phase", "")
        label = phase_labels.get(pname, pname)
        story.append(_sub_heading(label))
        story.extend(_bullets(phase.get("steps", [])))
        story.append(SP)

    return story


# ─────────────────────────────────────────────────────────────
# SUPABASE UPLOAD
# ─────────────────────────────────────────────────────────────

async def _upload_to_supabase(pdf_bytes: bytes, filename: str) -> str:
    url = f"{SUPABASE_URL}/storage/v1/object/reports/{filename}"
    async with httpx.AsyncClient(timeout=60) as client:
        r = await client.post(
            url, content=pdf_bytes,
            headers={
                "Authorization": f"Bearer {SUPABASE_SERVICE_KEY}",
                "Content-Type":  "application/pdf",
                "x-upsert":      "true",
            },
        )
        if not r.is_success:
            print(f"[report] Supabase upload {r.status_code}: {r.text}")
            r.raise_for_status()
    return f"{SUPABASE_URL}/storage/v1/object/public/reports/{filename}"


# ─────────────────────────────────────────────────────────────
# DB HELPERS
# ─────────────────────────────────────────────────────────────

async def _fetch_raw(db, idea_id: str, user_id: str):
    q = text("""
        SELECT analysis_data, market_analysis, competitor_analysis,
               swot_analysis, risk_feasibility_analysis, budget_analysis
        FROM ideas WHERE id = :id AND user_id = :uid
    """)
    result = await db.execute(q, {"id": idea_id, "uid": user_id})
    row = result.fetchone()
    if not row:
        return None

    def sp(v):
        if v is None: return None
        if isinstance(v, str):
            try: return json.loads(v)
            except: return None
        return v

    return {
        "analysis_data":   sp(row[0]),
        "market_data":     sp(row[1]),
        "competitor_data": sp(row[2]),
        "swot_data":       sp(row[3]),
        "risk_data":       sp(row[4]),
        "budget_data":     sp(row[5]),
        "recommend_data":  None,
    }


def _get_ver(data, ver):
    if not data: return None
    return data.get("version_outputs", {}).get(ver)


async def _ensure(db, idea_id, user_id, ver, raw):
    async def run_if_missing(field_key, service_fn):
        cached = _get_ver(raw.get(field_key), ver)
        if cached: return cached
        result = await service_fn(db, idea_id, user_id)
        return result.get("data", {}) if result.get("status") == "success" else {}

    market     = await run_if_missing("market_data",     generate_market_analysis)
    competitor = await run_if_missing("competitor_data", generate_competitor_analysis)
    swot       = await run_if_missing("swot_data",       generate_swot_analysis)
    risk       = await run_if_missing("risk_data",       generate_risk_analysis)
    budget     = await run_if_missing("budget_data",     generate_budget_analysis)

    rec_res   = await generate_smart_recommendations(db, idea_id, user_id)
    recommend = rec_res.get("data", {}) if rec_res.get("status") == "success" else {}

    return {
        "market": market, "competitor": competitor, "swot": swot,
        "risk": risk, "budget": budget, "recommend": recommend,
    }


# ─────────────────────────────────────────────────────────────
# PDF BUILD
# ─────────────────────────────────────────────────────────────

def _build_pdf_bytes(ctx: dict, data: dict, generated_str: str) -> bytes:
    buf = io.BytesIO()
    doc = SimpleDocTemplate(
        buf, pagesize=A4,
        leftMargin=MARGIN + 4,
        rightMargin=MARGIN + 4,
        topMargin=2.2 * cm,
        bottomMargin=1.8 * cm,
        title=ctx["identity"]["title"],
        author="Innomate",
    )
    page_fn = _make_page_fn(generated_str)
    story   = _build_story(ctx, data, generated_str)
    doc.build(story, onFirstPage=page_fn, onLaterPages=page_fn)
    return buf.getvalue()


# ─────────────────────────────────────────────────────────────
# PUBLIC API
# ─────────────────────────────────────────────────────────────

async def generate_report(db, idea_id: str, user_id: str) -> dict:
    raw = await _fetch_raw(db, idea_id, user_id)
    if not raw:
        return {"status": "error", "message": "Idea not found"}

    analysis_data = raw["analysis_data"]
    if not analysis_data:
        return {"status": "error", "message": "Idea analysis data missing"}

    idea_section = analysis_data.get("idea_analysis", {})
    if not idea_section.get("locked", False):
        return {"status": "error",
                "message": "Idea must be locked before generating a report"}

    ver = str(idea_section.get("accepted_version"))

    try:
        idea_ctx = build_idea_context(analysis_data)
    except Exception as e:
        return {"status": "error", "message": f"Context build failed: {e}"}

    # Check cache
    res = await db.execute(text("""
        SELECT pdf_url FROM reports
        WHERE idea_id = :idea_id AND user_id = :user_id
        ORDER BY created_at DESC LIMIT 1
    """), {"idea_id": idea_id, "user_id": user_id})
    existing = res.fetchone()
    if existing and existing[0]:
        return {"status": "success", "pdf_url": existing[0], "cached": True}

    # Run missing models on-demand
    try:
        data = await _ensure(db, idea_id, user_id, ver, raw)
    except Exception as e:
        return {"status": "error", "message": f"Model generation failed: {e}"}

    # Build PDF
    generated_str = datetime.now().strftime("%d %b %Y")
    try:
        pdf_bytes = _build_pdf_bytes(idea_ctx, data, generated_str)
    except Exception as e:
        return {"status": "error", "message": f"PDF build failed: {e}"}

    # Upload
    title_slug = re.sub(r"[^a-zA-Z0-9]", "_", idea_ctx["identity"]["title"])[:40]
    filename   = f"{user_id}/{idea_id}_{title_slug}.pdf"
    try:
        pdf_url = await _upload_to_supabase(pdf_bytes, filename)
    except Exception as e:
        return {"status": "error", "message": f"Upload failed: {e}"}

    # Save DB record
    try:
        await db.execute(text("""
            INSERT INTO reports (id, idea_id, user_id, pdf_url, created_at)
            VALUES (:id, :idea_id, :user_id, :pdf_url, NOW())
        """), {"id": str(uuid.uuid4()), "idea_id": idea_id,
               "user_id": user_id, "pdf_url": pdf_url})
        await db.commit()
    except Exception as e:
        print(f"[report] DB save warning: {e}")

    return {"status": "success", "pdf_url": pdf_url, "cached": False}


async def regenerate_report(db, idea_id: str, user_id: str) -> dict:
    """Delete cached record then generate fresh."""
    try:
        await db.execute(text(
            "DELETE FROM reports WHERE idea_id = :idea_id AND user_id = :user_id"
        ), {"idea_id": idea_id, "user_id": user_id})
        await db.commit()
    except Exception as e:
        print(f"[report] cache clear warning: {e}")
    return await generate_report(db, idea_id, user_id)