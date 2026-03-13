import json
from sqlalchemy import text
from app.utils.groq_client import call_llm
from app.utils.context_builder import build_idea_context


async def generate_swot_analysis(db, idea_id: str, user_id: str):

    # =============================================
    # FETCH IDEA
    # =============================================

    query = text("""
        SELECT analysis_data, swot_analysis
        FROM ideas
        WHERE id = :id AND user_id = :user_id
    """)

    result = await db.execute(query, {"id": idea_id, "user_id": user_id})
    row = result.fetchone()

    if not row:
        return {"status": "error", "message": "Idea not found"}

    analysis_data = row[0]
    swot_data = row[1]

    if isinstance(analysis_data, str):
        analysis_data = json.loads(analysis_data)

    # =============================================
    # LOCK CHECK
    # =============================================

    idea_section = analysis_data.get("idea_analysis", {})

    if not idea_section.get("locked", False):
        return {"status": "error", "message": "Idea must be locked first"}

    accepted_version = idea_section.get("accepted_version")

    # =============================================
    # CACHE CHECK
    # =============================================

    if swot_data:
        if isinstance(swot_data, str):
            swot_data = json.loads(swot_data)

        cached = swot_data.get("version_outputs", {}).get(str(accepted_version))

        if cached:
            return {"status": "success", "data": cached}

    # =============================================
    # BUILD CONTEXT
    # =============================================

    idea_context = build_idea_context(analysis_data)

    title = idea_context["identity"]["title"]
    domain = idea_context["identity"]["domain"]
    subdomain = idea_context["identity"]["subdomain"]
    problem = idea_context["market_definition"]["core_problem"]
    value = idea_context["positioning"]["core_value_proposition"]
    audience = idea_context["market_definition"]["target_segments"]
    summary = idea_context["positioning"]["summarized_idea"]

    # =============================================
    # SWOT PROMPT
    # =============================================

    prompt = f"""
You are a startup strategy expert.

Perform a SWOT analysis for the startup idea below.

Rules:
- Maximum 4 points per section
- Each point must be VERY concise (8–14 words)
- Avoid long explanations
- Focus on sharp business insights
- Write like bullet insights for a startup dashboard
- No filler words

Example style:
"AI automation reduces operational costs significantly."
"Growing sustainability demand creates strong adoption opportunities."

Return STRICT JSON.

Startup Title: {title}
Domain: {domain}
Subdomain: {subdomain}
Core Problem: {problem}
Value Proposition: {value}
Target Audience: {audience}
Summary: {summary}

Return JSON:

{{
 "Strengths": [],
 "Weaknesses": [],
 "Opportunities": [],
 "Threats": []
}}
"""

    llm_output = call_llm(prompt)

    try:
        swot_result = json.loads(llm_output)
    except:
        return {"status": "error", "message": "SWOT parsing failed"}

    # =============================================
    # STORE RESULT
    # =============================================

    if not swot_data:
        swot_data = {"version_outputs": {}}
    elif isinstance(swot_data, str):
        swot_data = json.loads(swot_data)

    swot_data["version_outputs"][str(accepted_version)] = swot_result

    update_query = text("""
        UPDATE ideas
        SET swot_analysis = :swot_analysis
        WHERE id = :id
    """)

    await db.execute(update_query, {
        "id": idea_id,
        "swot_analysis": json.dumps(swot_data)
    })

    await db.commit()

    return {"status": "success", "data": swot_result}