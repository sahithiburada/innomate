import json
import re
import asyncio
from concurrent.futures import ThreadPoolExecutor
from sqlalchemy import text
from pytrends.request import TrendReq
from ddgs import DDGS

from app.utils.context_builder import build_idea_context
from app.utils.groq_client import call_llm


# ─── Thread pool ──────────────────────────────────────────────────────────────
# PyTrends and DDGS are synchronous blocking calls.
# We run them in a thread pool so all competitors are enriched concurrently
# instead of sequentially, cutting total time from N×3 calls → ~1×3 calls.
_executor = ThreadPoolExecutor(max_workers=10)


# ─── Blocking helpers (run inside threads) ────────────────────────────────────

def _verify_company_exists(name: str) -> bool:
    try:
        with DDGS() as ddgs:
            results = list(ddgs.text(name + " company", max_results=5))
            return len(results) >= 3
    except:
        return False


def _get_company_website(name: str):
    try:
        with DDGS() as ddgs:
            results = list(ddgs.text(name + " company official website", max_results=5))
            for r in results:
                url = r.get("href", "")
                if name.lower().replace(" ", "") in url.lower():
                    return url
            if results:
                return results[0].get("href")
    except:
        pass
    return None


def _get_trends(name: str):
    try:
        # One TrendReq instance per thread to avoid shared state issues
        pytrends = TrendReq(hl='en-US', tz=330)
        pytrends.build_payload([name], timeframe='today 5-y')
        data = pytrends.interest_over_time()
        if not data.empty:
            values = data[name].tolist()
            avg    = int(sum(values) / len(values))
            growth = values[-1] - values[0]
            return avg, growth
    except:
        pass
    return 0, 0


def _enrich_competitor(comp: dict):
    """
    All three blocking calls for one competitor, runs in a thread.
    Returns enriched dict, or None if company cannot be verified.
    """
    name = comp["name"]

    if not _verify_company_exists(name):
        return None

    avg, growth = _get_trends(name)
    website     = _get_company_website(name)

    return {
        **comp,
        "popularity_avg": avg,
        "trend_growth":   growth,
        "website":        website,
    }


async def _enrich_all(companies: list) -> list:
    """
    Fires off all competitor enrichments concurrently via the thread pool.
    Previously this was a sequential for-loop with time.sleep(0.3) between each.
    """
    loop    = asyncio.get_event_loop()
    tasks   = [
        loop.run_in_executor(_executor, _enrich_competitor, comp)
        for comp in companies
    ]
    results = await asyncio.gather(*tasks)
    return [r for r in results if r is not None]


# ─── Main service ─────────────────────────────────────────────────────────────

async def generate_competitor_analysis(db, idea_id: str, user_id: str):

    # =====================================================
    # FETCH IDEA
    # =====================================================

    query = text("""
        SELECT analysis_data, competitor_analysis
        FROM ideas
        WHERE id = :id AND user_id = :user_id
    """)

    result = await db.execute(query, {"id": idea_id, "user_id": user_id})
    row    = result.fetchone()

    if not row:
        return {"status": "error", "message": "Idea not found"}

    analysis_data   = row[0]
    competitor_data = row[1]

    if isinstance(analysis_data, str):
        analysis_data = json.loads(analysis_data)

    # =====================================================
    # LOCK CHECK
    # =====================================================

    idea_section = analysis_data.get("idea_analysis", {})

    if not idea_section.get("locked", False):
        return {"status": "error", "message": "Idea must be locked first"}

    accepted_version = idea_section.get("accepted_version")

    # =====================================================
    # BUILD CONTEXT
    # =====================================================

    idea_context = build_idea_context(analysis_data)

    title        = idea_context["identity"]["title"]
    domain       = idea_context["identity"]["domain"]
    subdomain    = idea_context["identity"]["subdomain"]
    summary      = idea_context["positioning"]["summarized_idea"]
    core_problem = idea_context["market_definition"]["core_problem"]
    value_prop   = idea_context["positioning"]["core_value_proposition"]
    audience     = idea_context["market_definition"]["target_segments"]

    # =====================================================
    # CACHE CHECK
    # =====================================================

    if competitor_data:
        if isinstance(competitor_data, str):
            competitor_data = json.loads(competitor_data)

        cached = competitor_data.get("version_outputs", {}).get(str(accepted_version))

        if cached:
            return {"status": "success", "data": cached}

    # =====================================================
    # LLM COMPETITOR DISCOVERY
    # =====================================================

    prompt = f"""
You are a competitive intelligence analyst. Identify REAL, VERIFIABLE companies that compete with this startup.

Startup Title:    {title}
Domain:           {domain}
Subdomain:        {subdomain}
Core Problem:     {core_problem}
Value Prop:       {value_prop}
Target Audience:  {audience}
Summary:          {summary}

Rules:
- Only name companies that actually exist and are searchable online
- Direct competitors: solve the SAME problem for the SAME target audience as {title}
- Indirect competitors: solve the same problem differently OR serve the same audience's adjacent need
- "description" must explain specifically how this competitor overlaps with {title},
  not a generic company description
- Return 4–6 direct and 3–4 indirect competitors

Return JSON:

{{
 "direct_competitors": [
   {{
     "name": "",
     "description": "",
     "business_model": ""
   }}
 ],
 "indirect_competitors": [
   {{
     "name": "",
     "description": "",
     "business_model": ""
   }}
 ]
}}
"""

    llm_output = call_llm(prompt)
    json_match = re.search(r"\{.*\}", llm_output, re.DOTALL)

    if json_match:
        llm_output = json_match.group(0)

    try:
        competitor_llm = json.loads(llm_output)
    except Exception:
        print("Invalid JSON from LLM:", llm_output)
        return {"status": "error", "message": "Failed to parse competitor data"}

    # =====================================================
    # PARALLEL VERIFICATION + ENRICHMENT
    # Before: sequential for-loop, ~3-5s per competitor × 10 companies = 30-50s
    # After:  all companies enriched concurrently = ~3-5s total
    # =====================================================

    all_companies = (
        competitor_llm["direct_competitors"]
        + competitor_llm["indirect_competitors"]
    )

    validated = await _enrich_all(all_companies)

    validated_sorted = sorted(
        validated,
        key=lambda x: x["popularity_avg"],
        reverse=True
    )

    top = validated_sorted[:10]

    output = {"top_competitors_ranked": top}

    # =====================================================
    # STORE
    # =====================================================

    if not competitor_data:
        competitor_data = {"version_outputs": {}}
    elif isinstance(competitor_data, str):
        competitor_data = json.loads(competitor_data)

    competitor_data["version_outputs"][str(accepted_version)] = output

    update_query = text("""
        UPDATE ideas
        SET competitor_analysis = :competitor_analysis
        WHERE id = :id
    """)

    await db.execute(update_query, {
        "id": idea_id,
        "competitor_analysis": json.dumps(competitor_data)
    })

    await db.commit()

    return {"status": "success", "data": output}