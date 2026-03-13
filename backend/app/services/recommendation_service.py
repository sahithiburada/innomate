from sqlalchemy import text
import json
import re

from app.utils.context_builder import build_idea_context
from app.utils.groq_client import call_llm


# =====================================================
# SAFE JSON PARSER
# =====================================================

def safe_json(raw):
    if not raw:
        return None
    try:
        raw = re.sub(r"```json|```", "", raw).strip()
        match = re.search(r"\{[\s\S]*\}", raw)
        if match:
            raw = match.group(0)
        return json.loads(raw)
    except Exception as e:
        print("Recommendation JSON parse error:", e)
        try:
            last_brace = raw.rfind("}")
            if last_brace != -1:
                raw = raw[: last_brace + 1]
                return json.loads(raw)
        except Exception:
            pass
        print("Raw LLM output:", raw)
        return None


# =====================================================
# MAIN RECOMMENDATION ENGINE
# =====================================================

async def generate_smart_recommendations(db, idea_id, user_id):

    # =====================================================
    # FETCH IDEA
    # =====================================================

    query = text("""
        SELECT
            analysis_data,
            market_analysis,
            swot_analysis,
            competitor_analysis,
            risk_feasibility_analysis,
            budget_analysis,
            smart_recommendations
        FROM ideas
        WHERE id = :idea_id
        AND user_id = :user_id
    """)

    result = await db.execute(query, {
        "idea_id": idea_id,
        "user_id": user_id
    })

    row = result.fetchone()

    if not row:
        return {"status": "error", "message": "Idea not found"}

    analysis_data      = row.analysis_data
    market_data        = row.market_analysis
    swot_data          = row.swot_analysis
    competitor_data    = row.competitor_analysis
    risk_data          = row.risk_feasibility_analysis
    budget_data        = row.budget_analysis
    saved_recs         = row.smart_recommendations

    if isinstance(analysis_data, str):
        analysis_data = json.loads(analysis_data)

    idea_section     = analysis_data.get("idea_analysis", {})
    accepted_version = idea_section.get("accepted_version")

    if not accepted_version:
        return {
            "status": "error",
            "message": "Idea must be accepted before generating recommendations"
        }

    ver = str(accepted_version)

    # =====================================================
    # CHECK CACHE  (same version_outputs pattern as other services)
    # =====================================================

    def _parse(v):
        if not v:
            return {}
        if isinstance(v, str):
            try:
                return json.loads(v)
            except Exception:
                return {}
        return v

    saved_recs = _parse(saved_recs)
    cached = saved_recs.get("version_outputs", {}).get(ver)
    if cached:
        return {"status": "success", "data": cached}

    # =====================================================
    # EXTRACT VERSION DATA FROM OTHER MODELS
    # =====================================================

    def extract_version(data):
        if not data:
            return {}
        if isinstance(data, str):
            try:
                data = json.loads(data)
            except Exception:
                return {}
        return data.get("version_outputs", {}).get(ver, {})

    market_data     = extract_version(market_data)
    swot_data       = extract_version(swot_data)
    competitor_data = extract_version(competitor_data)
    risk_data       = extract_version(risk_data)
    budget_data     = extract_version(budget_data)

    # =====================================================
    # BUILD IDEA CONTEXT
    # =====================================================

    idea_context = build_idea_context(analysis_data)

    identity    = idea_context.get("identity", {})
    positioning = idea_context.get("positioning", {})
    market_def  = idea_context.get("market_definition", {})

    title      = identity.get("title")
    domain     = identity.get("domain")
    problem    = market_def.get("core_problem")
    audience   = market_def.get("target_segments")
    value_prop = positioning.get("core_value_proposition")

    # =====================================================
    # EXTRACT MODEL DATA
    # =====================================================

    market_stage    = market_data.get("strategic_market_stage")
    market_strength = market_data.get("combined_market_strength")
    growth_drivers  = market_data.get("key_growth_drivers", [])

    competitors      = competitor_data.get("top_competitors_ranked", [])
    competitor_names = [c.get("name") for c in competitors[:5]]

    strengths     = swot_data.get("Strengths", [])
    weaknesses    = swot_data.get("Weaknesses", [])
    opportunities = swot_data.get("Opportunities", [])
    threats       = swot_data.get("Threats", [])

    risk_summary = risk_data.get("Primary_Summary", {})
    overall_risk = risk_summary.get("Overall_Risk_Level")
    top_risks    = risk_summary.get("Top_3_Key_Risks", [])

    capital_required    = budget_data.get("estimated_required_capital")
    break_even          = budget_data.get("expected_break_even_month")
    revenue_projection  = budget_data.get("revenue_projection_36_month")

    # =====================================================
    # LLM PROMPT
    # =====================================================

    prompt = f"""
You are a senior startup strategist.

Analyze multiple business intelligence reports and produce strategic insights and recommendations.

CRITICAL RULES:
- Return ONLY valid JSON
- No markdown
- No explanation text
- JSON must start with {{ and end with }}

Startup Context:
Title: {title}
Domain: {domain}
Core Problem: {problem}
Value Proposition: {value_prop}
Target Audience: {audience}

Market Analysis:
Market Stage: {market_stage}
Market Strength: {market_strength}
Growth Drivers: {growth_drivers}

Competition:
Top Competitors: {competitor_names}

SWOT:
Strengths: {strengths}
Weaknesses: {weaknesses}
Opportunities: {opportunities}
Threats: {threats}

Risk Analysis:
Overall Risk Level: {overall_risk}
Key Risks: {top_risks}

Financial Insights:
Capital Required: {capital_required}
Break Even: {break_even}
Revenue Projection: {revenue_projection}

Return JSON in this format:

{{
 "strategic_insights":[
  {{
   "observation":"",
   "source":"market | swot | risk | competitor | budget"
  }}
 ],

 "strategic_recommendations":[
  {{
   "priority":"High | Medium | Long-Term",
   "action":"",
   "reason":"",
   "based_on":[]
  }}
 ],

 "execution_roadmap":[
  {{
   "phase":"Validation",
   "steps":[]
  }},
  {{
   "phase":"Market Entry",
   "steps":[]
  }},
  {{
   "phase":"Scale",
   "steps":[]
  }}
 ]
}}
"""

    # =====================================================
    # CALL LLM
    # =====================================================

    llm_output      = call_llm(prompt)
    recommendations = safe_json(llm_output)

    # =====================================================
    # FAILSAFE
    # =====================================================

    if not recommendations:
        return {
            "status": "success",
            "data": {
                "strategic_insights":      [],
                "strategic_recommendations": [],
                "execution_roadmap":       []
            }
        }

    # =====================================================
    # PERSIST TO DB  (version_outputs pattern — same as all other services)
    # =====================================================

    # Reload latest saved_recs in case it changed
    saved_recs = _parse(saved_recs)
    if "version_outputs" not in saved_recs:
        saved_recs["version_outputs"] = {}

    saved_recs["version_outputs"][ver] = recommendations

    try:
        await db.execute(
            text("""
                UPDATE ideas
                SET smart_recommendations = :smart_recommendations
                WHERE id = :idea_id
                AND user_id = :user_id
            """),
            {
                "smart_recommendations": json.dumps(saved_recs),
                "idea_id":  idea_id,
                "user_id":  user_id,
            }
        )
        await db.commit()
        print(f"[recommendations] Saved to DB for idea {idea_id} version {ver}")
    except Exception as e:
        print(f"[recommendations] DB save warning: {e}")
        # non-fatal — still return the data even if save failed

    # =====================================================
    # RETURN RESULT
    # =====================================================

    return {
        "status": "success",
        "data": recommendations
    }