import json
import re
from sqlalchemy import text
from app.utils.context_builder import build_idea_context
from app.utils.groq_client import call_llm


def safe_json(text):
    try:
        text = re.sub(r"```json|```", "", text).strip()
        return json.loads(text)
    except:
        return None


async def generate_risk_analysis(db, idea_id: str, user_id: str):

    query = text("""
        SELECT analysis_data,
               market_analysis,
               competitor_analysis,
               risk_feasibility_analysis
        FROM ideas
        WHERE id = :id AND user_id = :user_id
    """)

    result = await db.execute(query, {"id": idea_id, "user_id": user_id})
    row = result.fetchone()

    if not row:
        return {"status": "error", "message": "Idea not found"}

    analysis_data = row[0]
    market_data = row[1]
    competitor_data = row[2]
    risk_data = row[3]

    if isinstance(analysis_data, str):
        analysis_data = json.loads(analysis_data)

    idea_section = analysis_data.get("idea_analysis", {})

    if not idea_section.get("locked", False):
        return {"status": "error", "message": "Idea must be locked first"}

    accepted_version = idea_section.get("accepted_version")

    idea_context = build_idea_context(analysis_data)

    # =============================
    # CACHE CHECK
    # =============================

    if risk_data:
        if isinstance(risk_data, str):
            risk_data = json.loads(risk_data)

        cached = risk_data.get("version_outputs", {}).get(str(accepted_version))

        if cached:
            return {"status": "success", "data": cached}

    # =============================
    # MARKET DATA  (your original logic, unchanged)
    # =============================

    market_strength = 50

    if market_data:
        if isinstance(market_data, str):
            market_data = json.loads(market_data)

        market_version = market_data.get("version_outputs", {}).get(str(accepted_version))

        if market_version:
            market_strength = market_version.get("combined_market_strength", 50)

    market_risk_score = 100 - market_strength

    # =============================
    # COMPETITOR DATA  (your original logic, unchanged)
    # =============================

    competition_score = 50

    if competitor_data:
        if isinstance(competitor_data, str):
            competitor_data = json.loads(competitor_data)

        comp_version = competitor_data.get("version_outputs", {}).get(str(accepted_version))

        if comp_version:
            competitors = comp_version.get("top_competitors_ranked", [])[:6]

            if competitors:
                avg = sum(c.get("popularity_avg", 50) for c in competitors) / len(competitors)
                competition_score = int(avg)

    # =============================
    # PULL INTERDEPENDENCY SIGNALS
    # These were already fetched above — we now surface them into the prompt
    # so the LLM produces differentiated output per idea instead of generic risks.
    # =============================

    # From market model
    market_stage = "Unknown"
    demand_direction = "Unknown"
    market_opportunity = ""
    search_direction = "Unknown"
    search_score = 50
    growth_drivers = []
    five_year_outlook = ""

    if market_data:
        mv = market_data.get("version_outputs", {}).get(str(accepted_version)) if isinstance(market_data, dict) else {}
        if mv:
            market_stage       = mv.get("strategic_market_stage", "Unknown")
            demand_direction   = mv.get("strategic_demand_direction", "Unknown")
            market_opportunity = mv.get("market_opportunity_level", "")
            search_direction   = mv.get("search_direction", "Unknown")
            search_score       = mv.get("search_trend_score", 50)
            growth_drivers     = mv.get("key_growth_drivers", [])
            five_year_outlook  = mv.get("five_year_outlook", "")

    # From competitor model
    top_competitors = []
    if competitor_data:
        cv = competitor_data.get("version_outputs", {}).get(str(accepted_version)) if isinstance(competitor_data, dict) else {}
        if cv:
            top_competitors = [
                c.get("name") for c in cv.get("top_competitors_ranked", [])[:5] if c.get("name")
            ]

    # =============================
    # LLM ANALYSIS
    # Prompt now contains all interdependency signals so the LLM
    # can produce idea-specific, differentiated risk output.
    # The JSON schema is unchanged — we only added a "score" field
    # (1–100 integer) alongside "level" so scoring isn't forced into
    # only 3 possible values (20 / 50 / 80).
    # =============================

    prompt = f"""
You are a startup execution and risk analyst. Produce a SPECIFIC risk analysis for this exact startup.
Every reason, risk, and insight must reference this idea's actual domain, problem, and competitive context.
Do NOT write generic startup risks.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
STARTUP
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Title:         {idea_context["identity"]["title"]}
Domain:        {idea_context["identity"]["domain"]}
Subdomain:     {idea_context["identity"]["subdomain"]}
Problem:       {idea_context["market_definition"]["core_problem"]}
Value Prop:    {idea_context["positioning"]["core_value_proposition"]}
Audience:      {idea_context["market_definition"]["target_segments"]}
Summary:       {idea_context["positioning"]["summarized_idea"]}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
MARKET SIGNALS (from Market Analysis model)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Market Stage:         {market_stage}
Demand Direction:     {demand_direction}
Opportunity Level:    {market_opportunity}
Search Trend:         {search_direction} (score: {search_score}/100)
Market Strength:      {market_strength}/100
Growth Drivers:       {growth_drivers}
5-Year Outlook:       {five_year_outlook}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
COMPETITIVE SIGNALS (from Competitor Analysis model)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Verified Competitors: {top_competitors}
Competition Score:    {competition_score}/100

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
INSTRUCTIONS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
For Technical_Complexity, Operational_Complexity, Regulatory_Exposure:
- "level" → one of: "Low", "Medium", "High"
- "score" → integer 1–100, be precise (e.g. 34, 67, 81) — do NOT use only 20/50/80
  Use the market stage, domain, and competitor signals to calibrate this number.
- "reason" → 1–2 sentences specific to THIS startup's stack, ops, or regulation.
  Must NOT be generic. Must reference the domain or the specific problem being solved.

For Top_Key_Risks:
- Exactly 3 items
- Each must be a specific risk statement referencing this idea's domain or competitors
- NOT category labels like "market risk" or "execution risk"

For Insight_Summary:
- 3–4 sentences
- MUST reference at least one named competitor from the list above
- MUST reference the market stage ({market_stage}) and what it means for this startup
- MUST end with one specific, actionable mitigation step
- FORBIDDEN phrases: "startups in this space", "requires careful planning", "is essential", "various"

Return STRICT JSON:

{{
  "Technical_Complexity": {{"level": "", "score": 0, "reason": ""}},
  "Operational_Complexity": {{"level": "", "score": 0, "reason": ""}},
  "Regulatory_Exposure": {{"level": "", "score": 0, "reason": ""}},
  "Top_Key_Risks": [],
  "Insight_Summary": ""
}}
"""

    llm_data = safe_json(call_llm(prompt))

    if not llm_data:
        return {"status": "error", "message": "Risk model failed"}

    # =============================
    # SCORING  (your original logic, with one fix)
    # Original: risk_map {"Low":20,"Medium":50,"High":80} — only 3 possible values
    # Fix: use LLM's granular "score" field if present, fall back to risk_map
    # All weighting formulas and thresholds are UNCHANGED from your original.
    # =============================

    risk_map = {"Low": 20, "Medium": 50, "High": 80}

    tech_score = int(llm_data["Technical_Complexity"].get("score") or
                     risk_map.get(llm_data["Technical_Complexity"]["level"], 50))
    ops_score  = int(llm_data["Operational_Complexity"].get("score") or
                     risk_map.get(llm_data["Operational_Complexity"]["level"], 50))
    reg_score  = int(llm_data["Regulatory_Exposure"].get("score") or
                     risk_map.get(llm_data["Regulatory_Exposure"]["level"], 50))

    # Clamp to valid range
    tech_score = max(5, min(tech_score, 95))
    ops_score  = max(5, min(ops_score,  95))
    reg_score  = max(5, min(reg_score,  95))

    execution_risk_score = int((tech_score + ops_score + reg_score) / 3)

    final_risk_score = int(
        0.45 * execution_risk_score +
        0.35 * market_risk_score +
        0.20 * competition_score
    )

    final_risk_score = max(5, min(final_risk_score, 100))

    overall_level = (
        "High" if final_risk_score >= 75 else
        "Moderate" if final_risk_score >= 45 else
        "Low"
    )

    technical_feasibility = 100 - tech_score
    operational_feasibility = 100 - ops_score

    feasibility_score = int(
        0.4 * technical_feasibility +
        0.3 * operational_feasibility +
        0.3 * market_strength
    )

    if final_risk_score < 40 and feasibility_score >= 60:
        verdict = "Strongly Recommended"
    elif final_risk_score < 60:
        verdict = "Conditionally Viable"
    else:
        verdict = "High Risk"

    output = {
        "Primary_Summary": {
            "Overall_Risk_Score": final_risk_score,
            "Overall_Risk_Level": overall_level,
            "Feasibility_Score": feasibility_score,
            "Execution_Risk_Score": execution_risk_score,
            "Market_Risk_Score": market_risk_score,
            "Competition_Pressure_Score": competition_score,
            "Top_3_Key_Risks": llm_data["Top_Key_Risks"][:3],
            "Final_Verdict": verdict
        },
        "Detailed_Explanation": llm_data
    }

    if not risk_data:
        risk_data = {"version_outputs": {}}

    risk_data["version_outputs"][str(accepted_version)] = output

    update_query = text("""
        UPDATE ideas
        SET risk_feasibility_analysis = :risk
        WHERE id = :id
    """)

    await db.execute(update_query, {
        "id": idea_id,
        "risk": json.dumps(risk_data)
    })

    await db.commit()

    return {"status": "success", "data": output}