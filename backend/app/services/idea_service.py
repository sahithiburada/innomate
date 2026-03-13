import json
from datetime import datetime
from uuid import uuid4
from sqlalchemy import text
from app.utils.groq_client import call_llm


async def create_or_regenerate_idea(
    db,
    idea_id: str | None,
    startup_idea: str,
    user_id: str
):

    # =====================================================
    # INPUT VALIDATION (EXACT SAME LOGIC AS YOUR MODEL)
    # =====================================================

    validation_prompt = f"""
You are validating whether the following input is a meaningful startup idea.

GOALS:
- Reject ONLY meaningless, unsafe, or non-startup inputs.
- Do NOT be strict about grammar, structure, or completeness.
- Accept vague or poorly written ideas if they have some meaning.

HARD FAIL CONDITIONS:
- Random characters or gibberish
- No natural language meaning
- Pure greetings, jokes, poems, or chit-chat
- Requests unrelated to startup ideas

SOFT CONDITIONS (DO NOT reject):
- Missing problem clarity
- Missing target audience
- Unclear intent
- Very short or vague ideas

Return ONLY valid JSON:

{{
  "is_valid": true | false,
  "confidence": 0.0,
  "severity": "CLEAR | WEAK_BUT_ACCEPTABLE | INVALID_INPUT",
  "reason": "Short internal reason",
  "feedback_to_user": "Gentle, user-friendly guidance"
}}

Startup Idea:
{startup_idea}
"""

    validation_output = call_llm(validation_prompt)

    try:
        validation_data = json.loads(validation_output)
    except:
        return {
            "status": "error",
            "message": "Validation model failed."
        }

    if not validation_data["is_valid"]:
        return {
            "status": "invalid_input",
            "feedback": validation_data["feedback_to_user"]
        }

    # =====================================================
    # FULL IDEA ANALYSIS (YOUR EXACT FINALIZED PROMPT)
    # =====================================================
    # -------------------------------
    # Regeneration Title Protection # 
    previous_titles = []
    regeneration_instruction = ""

    if idea_id:
        query = text("SELECT analysis_data FROM ideas WHERE id = :id")
        result = await db.execute(query, {"id": idea_id})
        row = result.fetchone()

        if row:
            analysis_data_db = row[0]

            if isinstance(analysis_data_db, str):
                analysis_data_db = json.loads(analysis_data_db)

            previous_titles = [
                v["summary"]["suggested_title"]
                for v in analysis_data_db["idea_analysis"]["versions"]
            ]

        regeneration_instruction = ""

        if previous_titles:
            regeneration_instruction = f"""
        IMPORTANT:
        This is a regeneration of the same startup idea.

        Previously generated titles:
        {previous_titles}

        You MUST generate a completely new and distinct startup name.
        - Do NOT reuse previous titles.
        - Do NOT slightly modify them.
        - The new title must feel conceptually different.
        """
    analysis_prompt = f"""
    {regeneration_instruction}
Analyze the startup idea below and return a structured idea understanding.

Strict Rules:
- Return ONLY valid JSON
- Do NOT include explanations, markdown, or extra text
- Do NOT mention implementation details
- Think like a startup analyst + professional brand strategist
- Abstract context must be exactly ONE sentence
- Summarized idea must be 3–4 lines, human-readable
- Target audience must specify the exact population that benefits most

────────────────────────────
NAMING RULES (CRITICAL)
────────────────────────────
Suggested title rules:
- Must be 1–3 words MAX
- Must sound like a serious, venture-scale startup name
- Must NOT reuse or slightly rephrase words from the Startup Idea
- Must NOT include descriptive phrases
- Must NOT include generic business words like "platform", "system", "solution"
- Must be abstract, conceptual, or metaphorical
- Should evoke transformation, hidden value, continuity, leverage, or breakthrough
- Should feel like a fundable startup brand name

Bad examples:
- Smart Healthcare Access
- AI Farming Assistant
- Demand Forecasting Tool

Good style examples (style only):
- Greenaid
- Prodigy
- QuietBridge
- First Mile
- ClearPath

Standardized domain labels:
HealthTech, FinTech, EdTech, AgriTech, ClimateTech, LegalTech,
HRTech, InsurTech, PropTech, SupplyChainTech, ManufacturingTech,
RetailTech, FashionTech, FoodTech, TravelTech, MediaTech,
CreatorEconomy, GamingTech, MobilityTech, EnergyTech, BioTech,
DeepTech, GovTech, DefenseTech, EnterpriseTech, SocialImpact,
NonProfitTech, Other

KEYWORD INTELLIGENCE RULES:

You must extract deep semantic keyword clusters.

Return 5–8 keywords per category.

1. core_terms → fundamental product/service terms
2. commercial_terms → high search commercial phrases
3. persona_terms → specific audience segments
4. industry_terms → broader market category terms
5. long_tail_terms → 3–6 word realistic Google search phrases

Avoid generic words like "platform", "solution", "system".
Avoid repeating the startup name.
Use search-friendly phrases.

TARGET AUDIENCE RULES:

Return 4–6 SHORT audience labels.
Each must be MAX 1–3 words.
NO sentences.
NO descriptions.
NO verbs.
Just concise segment names.

Examples:
- Remote Engineers
- STEM Students
- SME Finance Teams
- Corporate Trainers
- Freelancers

REQUIRED JSON SCHEMA:

{{
  "suggested_title": "...",
  "abstract_context": "...",
  "domain": {{
    "raw_inference": "...",
    "normalized_label": "...",
    "confidence": 0.0
  }},
  "subdomain": "...",
  "target_segments": ["...", "...", "..."],
  "keyword_intelligence": {{
  "core_terms": ["..."],
  "commercial_terms": ["..."],
  "persona_terms": ["..."],
  "industry_terms": ["..."],
  "long_tail_terms": ["..."]
  }},
  "core_problem": "...",
  "core_value_proposition": "...",
  "idea_understanding": {{
    "Problem": "...",
    "Inefficiencies": {{
      "Issue 1 title": "...",
      "Issue 2 title": "..."
    }},
    "Access_gaps": {{
      "Gap 1 title": "...",
      "Gap 2 title": "..."
    }},
    "Consequences": {{
      "Consequence 1 title": "...",
      "Consequence 2 title": "..."
    }}
  }},
  "summarized_idea": "..."
}}

Startup Idea:
{startup_idea}
"""

    analysis_output = call_llm(analysis_prompt)

    try:
        analysis_data = json.loads(analysis_output)
    except:
        return {
            "status": "error",
            "message": "Analysis model failed."
        }

    # =====================================================
    # VERSION HANDLING (UNCHANGED LOGIC)
    # =====================================================

    if idea_id:
        query = text("SELECT analysis_data FROM ideas WHERE id = :id")
        result = await db.execute(query, {"id": idea_id})
        row = result.fetchone()

        if not row:
            return {"status": "error", "message": "Idea not found"}

        analysis_data_db = row[0]

        if isinstance(analysis_data_db, str):
            analysis_data_db = json.loads(analysis_data_db)

        current_versions = analysis_data_db["idea_analysis"]["versions"]
        new_version_number = len(current_versions) + 1
        

    else:
        idea_id = str(uuid4())
        current_versions = []
        new_version_number = 1

    # =====================================================
    # STORE FULL ANALYSIS INTERNALLY
    # =====================================================

    version_object = {
        "version": new_version_number,
        "created_at": datetime.utcnow().isoformat(),
        "summary": {
            "suggested_title": analysis_data["suggested_title"],
            "domain": analysis_data["domain"]["normalized_label"],
            "target_segments": analysis_data["target_segments"],
            "summarized_idea": analysis_data["summarized_idea"],
        },
        "full_analysis": analysis_data   # 🔥 FULL INTERNAL DATA STORED
    }

    current_versions.append(version_object)

    final_analysis_json = {
        "idea_analysis": {
            "versions": current_versions,
            "active_version": new_version_number,
            "locked": False
        }
    }

    if new_version_number == 1:
        insert_query = text("""
            INSERT INTO ideas (id, user_id, idea_text, title, analysis_data)
            VALUES (:id, :user_id, :idea_text, :title, :analysis_data)
        """)

        await db.execute(insert_query, {
            "id": idea_id,
            "user_id": user_id,
            "idea_text": startup_idea,
            "title": analysis_data["suggested_title"],
            "analysis_data": json.dumps(final_analysis_json)
        })
    else:
        update_query = text("""
            UPDATE ideas
            SET analysis_data = :analysis_data
            WHERE id = :id
        """)

        await db.execute(update_query, {
            "id": idea_id,
            "analysis_data": json.dumps(final_analysis_json)
        })

    await db.commit()

    return {
        "status": "success",
        "idea_id": idea_id,
        "active_version": new_version_number,
        "versions": current_versions
    }


async def lock_idea(db, idea_id: str, version_number: int):

    query = text("SELECT analysis_data FROM ideas WHERE id = :id")
    result = await db.execute(query, {"id": idea_id})
    row = result.fetchone()

    if not row:
        return {"status": "error"}

    analysis_data = row[0]

    if isinstance(analysis_data, str):
        analysis_data = json.loads(analysis_data)

    versions = analysis_data["idea_analysis"]["versions"]

    selected_version = next(
        (v for v in versions if v["version"] == version_number),
        None
    )

    if not selected_version:
        return {"status": "error", "message": "Version not found"}

    # Set active version
    analysis_data["idea_analysis"]["active_version"] = version_number

    # Mark officially accepted version
    analysis_data["idea_analysis"]["accepted_version"] = version_number

    # Lock idea
    analysis_data["idea_analysis"]["locked"] = True

    update_query = text("""
        UPDATE ideas
        SET analysis_data = :analysis_data,
            title = :title
        WHERE id = :id
    """)

    await db.execute(update_query, {
        "id": idea_id,
        "analysis_data": json.dumps(analysis_data),
        "title": selected_version["summary"]["suggested_title"]
    })

    await db.commit()

    return {"status": "locked"}