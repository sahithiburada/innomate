import json
import numpy as np
from sqlalchemy import text
from pytrends.request import TrendReq
from app.utils.groq_client import call_llm
from app.utils.context_builder import build_idea_context
import pandas as pd


def safe_json(s):
    try:
        return json.loads(s)
    except:
        return None


async def generate_market_analysis(db, idea_id: str, user_id: str):

    # ============================================================
    # FETCH IDEA + VERIFY OWNERSHIP
    # ============================================================

    query = text("""
        SELECT analysis_data, market_analysis
        FROM ideas
        WHERE id = :id AND user_id = :user_id
    """)

    result = await db.execute(query, {"id": idea_id, "user_id": user_id})
    row = result.fetchone()

    if not row:
        return {"status": "error", "message": "Idea not found"}

    analysis_data = row[0]
    market_data = row[1]

    if isinstance(analysis_data, str):
        analysis_data = json.loads(analysis_data)

    # ============================================================
    # LOCK CHECK
    # ============================================================

    idea_section = analysis_data.get("idea_analysis", {})

    if not idea_section.get("locked", False):
        return {"status": "error", "message": "Idea must be locked first"}

    accepted_version = idea_section.get("accepted_version")

    # ============================================================
    # BUILD STANDARDIZED CONTEXT
    # ============================================================

    idea_context = build_idea_context(analysis_data)

    # ============================================================
    # VERSION-AWARE CACHE CHECK
    # ============================================================

    if market_data:
        if isinstance(market_data, str):
            market_data = json.loads(market_data)

        cached = market_data.get("version_outputs", {}).get(str(accepted_version))
        if cached:
            return {"status": "success", "data": cached}

    pytrends = TrendReq(hl="en-US", tz=330)

    # ============================================================
    # STEP 1 — LIFECYCLE DIAGNOSIS  (your original, unchanged)
    # ============================================================

    lifecycle_prompt = f"""
You are evaluating the REAL-WORLD economic lifecycle of a business model in 2025.

Startup Context:
{json.dumps(idea_context, indent=2)}

Return ONLY JSON:
{{
  "market_stage": "Emerging | Growing | Mature | Declining",
  "demand_direction": "Increasing | Stable | Decreasing",
  "replacement_pressure": "Low | Moderate | High",
  "strategic_confidence_score": 0
}}
"""

    lifecycle_data = safe_json(call_llm(lifecycle_prompt))

    if not lifecycle_data or "market_stage" not in lifecycle_data:
        raise RuntimeError("Lifecycle analysis failed")

    market_stage = lifecycle_data["market_stage"]
    demand_direction = lifecycle_data["demand_direction"]
    replacement_pressure = lifecycle_data["replacement_pressure"]
    strategic_score = int(lifecycle_data["strategic_confidence_score"])

    # ORIGINAL SCORING LOGIC (UNCHANGED)
    if replacement_pressure == "High":
        market_stage = "Declining"
        demand_direction = "Decreasing"
        strategic_score = min(strategic_score, 35)

    if market_stage == "Emerging" and replacement_pressure != "Low":
        market_stage = "Mature"

    if market_stage == "Declining":
        strategic_score = min(strategic_score, 40)
    else:
        strategic_score = max(35, min(90, strategic_score))

    # ============================================================
    # STEP 2 — KEYWORDS  (your original, unchanged)
    # ============================================================

    keyword_intel = idea_context.get("market_definition", {}).get("keyword_intelligence", {})

    core = keyword_intel.get("core_terms", [])
    commercial = keyword_intel.get("commercial_terms", [])
    industry = keyword_intel.get("industry_terms", [])

    keywords = []
    keywords += commercial[:2]
    keywords += core[:2]
    if len(keywords) < 3:
        keywords += industry[:1]
    if not keywords:
        keywords = [idea_context["identity"]["domain"]]

    # ============================================================
    # STEP 3 — GOOGLE TRENDS  (your original, unchanged)
    # ============================================================

    def fetch(keyword):
        try:
            pytrends.build_payload([keyword], timeframe="today 5-y")
            df = pytrends.interest_over_time()
            if df.empty:
                return None
            if "isPartial" in df.columns:
                df = df.drop(columns=["isPartial"])
            return df[keyword]
        except:
            return None

    trend_series = []

    for k in keywords:
        ts = fetch(k)
        if ts is not None:
            trend_series.append(ts)

    trend_data = []
    combined = None
    slope = 0
    trend_std = 0
    trend_source = "real"

    if len(trend_series) == 0:
        trend_source = "fallback"
        search_score = 50
        slope = 0
        trend_std = 0

        dates = pd.date_range(end=pd.Timestamp.today(), periods=260, freq="W")
        values = np.full(260, 30)

        trend_data = [
            {"date": str(date.date()), "value": float(v)}
            for date, v in zip(dates, values)
        ]

        combined = None
    else:
        min_len = min(len(ts) for ts in trend_series)
        trend_series = [ts[-min_len:] for ts in trend_series]
        combined = sum(trend_series) / len(trend_series)
        combined = combined.rolling(8, min_periods=1).mean()

        recent = combined[-52:]
        avg_level = float(recent.mean())
        slope = float(np.polyfit(np.arange(len(combined)), combined.values, 1)[0])
        trend_std = float(combined.std())

        if avg_level >= 60:
            demand_strength = 70 + (avg_level - 60) * 0.5
        elif avg_level >= 30:
            demand_strength = 40 + (avg_level - 30)
        else:
            demand_strength = avg_level * 1.2

        if slope > 0:
            growth_bonus = min(slope * 50, 20)
        elif slope < 0:
            growth_bonus = max(slope * 50, -20)
        else:
            growth_bonus = 0

        search_score = int(max(5, min(demand_strength + growth_bonus, 100)))

    if slope > trend_std * 0.03:
        search_direction = "Rising"
    elif slope < -trend_std * 0.03:
        search_direction = "Declining"
    else:
        search_direction = "Stable"

    stage_power_map = {
        "Emerging": 45,
        "Growing": 70,
        "Mature": 65,
        "Declining": 15
    }

    stage_power = stage_power_map.get(market_stage, 40)

    combined_score = int(
        0.6 * strategic_score +
        0.2 * search_score +
        0.2 * stage_power
    )

    combined_score = max(5, min(combined_score, 100))

    def classify(score):
        if score >= 80: return "Very Strong"
        if score >= 60: return "Strong"
        if score >= 40: return "Moderate"
        if score >= 20: return "Weak"
        return "Very Weak"

    opportunity_level = classify(combined_score)

    if combined is not None:
        trend_data = [
            {"date": str(date), "value": float(val)}
            for date, val in zip(combined.index, combined.values)
        ]

    # ============================================================
    # STEP 4 — STRATEGIC INSIGHTS
    # FIX: The original insight_prompt only passed idea_context.
    # The lifecycle and trends steps had already computed market_stage,
    # demand_direction, search_score, combined_score, opportunity_level etc.
    # but none of that was being passed to the insight LLM — so it had no
    # data signal to differentiate on. Now we pass all computed signals.
    # All scoring logic above is completely unchanged.
    # ============================================================

    insight_prompt = f"""
You are a market intelligence analyst. Generate SPECIFIC market insights for this startup.
Every insight must reference the startup's domain, problem, and the computed signals below.
Do NOT write generic statements that could apply to any startup.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
STARTUP
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Title:      {idea_context["identity"]["title"]}
Domain:     {idea_context["identity"]["domain"]}
Subdomain:  {idea_context["identity"]["subdomain"]}
Problem:    {idea_context["market_definition"]["core_problem"]}
Value Prop: {idea_context["positioning"]["core_value_proposition"]}
Audience:   {idea_context["market_definition"]["target_segments"]}
Summary:    {idea_context["positioning"]["summarized_idea"]}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
COMPUTED MARKET SIGNALS (use these to ground every insight)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Market Stage:           {market_stage}
Demand Direction:       {demand_direction}
Replacement Pressure:   {replacement_pressure}
Search Trend Direction: {search_direction}
Search Score:           {search_score}/100
Combined Market Score:  {combined_score}/100
Opportunity Level:      {opportunity_level}
Trend Keywords:         {keywords}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
INSTRUCTIONS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
key_growth_drivers:
- 3–4 items
- Each must name a specific growth lever that directly applies to {idea_context["identity"]["title"]}
- Must reference the market stage ({market_stage}) or search direction ({search_direction})
- NOT generic phrases like "growing market" or "increasing demand"

macro_forces:
- 3 items
- Real-world macro trends that DIRECTLY affect {idea_context["identity"]["domain"]} in 2025
- Include at least one headwind (risk), not just tailwinds

five_year_outlook:
- 2–3 sentences
- Must reference the {market_stage} stage and what it specifically means for this startup
- Must include at least one concrete timeframe or directional signal
- Must close with the primary strategic implication for {idea_context["identity"]["title"]}

Return ONLY JSON:
{{
  "key_growth_drivers": [],
  "macro_forces": [],
  "five_year_outlook": ""
}}
"""

    insight_data = safe_json(call_llm(insight_prompt, temperature=0.3))

    if not insight_data:
        insight_data = {
            "key_growth_drivers": [],
            "macro_forces": [],
            "five_year_outlook": "Outlook unavailable."
        }

    key_growth_drivers = insight_data["key_growth_drivers"]
    macro_forces = insight_data["macro_forces"]
    five_year_outlook = insight_data["five_year_outlook"]

    # ============================================================
    # ASSEMBLE OUTPUT  (your original, unchanged)
    # ============================================================

    output = {
        "optimized_search_keywords": keywords,
        "search_trend_score": search_score,
        "search_direction": search_direction,
        "strategic_market_stage": market_stage,
        "strategic_demand_direction": demand_direction,
        "key_growth_drivers": key_growth_drivers,
        "macro_forces": macro_forces,
        "five_year_outlook": five_year_outlook,
        "strategic_confidence_score": strategic_score,
        "combined_market_strength": combined_score,
        "market_opportunity_level": opportunity_level,
        "trend_source": trend_source,
        "trend_data": trend_data
    }

    if not market_data:
        market_data = {"version_outputs": {}}
    elif isinstance(market_data, str):
        market_data = json.loads(market_data)

    if "version_outputs" not in market_data:
        market_data["version_outputs"] = {}

    market_data["version_outputs"][str(accepted_version)] = output

    update_query = text("""
        UPDATE ideas
        SET market_analysis = :market_analysis
        WHERE id = :id
    """)

    await db.execute(update_query, {
        "id": idea_id,
        "market_analysis": json.dumps(market_data)
    })

    await db.commit()

    return {"status": "success", "data": output}