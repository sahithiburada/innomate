import json
import re
from sqlalchemy import text
from app.utils.context_builder import build_idea_context
from app.utils.groq_client import call_llm


def safe_json(raw):
    try:
        cleaned = re.sub(r"```json|```", "", raw).strip()
        return json.loads(cleaned)
    except:
        return None


STAGE_PROFILES = {
    "student_mvp": {
        "label": "Lean / Side Project",
        "recommendation": "This idea can be validated solo with minimal investment.",
        "monthly_burn_range": (5_000, 25_000),
        "runway_months": 6,
        "team_size": 1,
        "dev_cost_range": (20_000, 80_000),
        "marketing_budget": 5_000,
        "arpu_b2c": 99,
        "arpu_b2b": 999,
        "initial_users": 50,
        "conversion_rate": 0.02,
        "currency": "INR",
        "currency_symbol": "₹",
    },
    "early_startup": {
        "label": "Early-Stage Startup",
        "recommendation": "A small founding team with pre-seed budget is the right fit to build this.",
        "monthly_burn_range": (50_000, 200_000),
        "runway_months": 12,
        "team_size": 3,
        "dev_cost_range": (100_000, 400_000),
        "marketing_budget": 30_000,
        "arpu_b2c": 299,
        "arpu_b2b": 2_999,
        "initial_users": 200,
        "conversion_rate": 0.03,
        "currency": "INR",
        "currency_symbol": "₹",
    },
    "funded_startup": {
        "label": "Funded Startup",
        "recommendation": "This type of idea typically requires seed or angel capital to build and launch properly.",
        "monthly_burn_range": (300_000, 800_000),
        "runway_months": 18,
        "team_size": 8,
        "dev_cost_range": (500_000, 1_500_000),
        "marketing_budget": 150_000,
        "arpu_b2c": 499,
        "arpu_b2b": 5_999,
        "initial_users": 500,
        "conversion_rate": 0.04,
        "currency": "INR",
        "currency_symbol": "₹",
    },
    "growth_stage": {
        "label": "Growth-Stage Venture",
        "recommendation": "This is a capital-intensive idea that would realistically need Series A-level resources.",
        "monthly_burn_range": (1_000_000, 5_000_000),
        "runway_months": 24,
        "team_size": 20,
        "dev_cost_range": (2_000_000, 8_000_000),
        "marketing_budget": 500_000,
        "arpu_b2c": 799,
        "arpu_b2b": 12_000,
        "initial_users": 2_000,
        "conversion_rate": 0.05,
        "currency": "INR",
        "currency_symbol": "₹",
    },
}

DOMAIN_MULTIPLIERS = {
    "healthtech": 1.6, "biotech": 2.2, "deeptech": 2.0,
    "fintech": 1.5, "insurtech": 1.5, "legaltech": 1.3,
    "edtech": 0.9, "agritech": 1.1, "climatetech": 1.4,
    "energytech": 1.5, "govtech": 1.4, "defensetech": 2.5,
    "retailtech": 1.0, "fashiontech": 0.9, "foodtech": 1.1,
    "traveltech": 1.0, "mediatech": 0.8, "creatoreconomy": 0.7,
    "gamingtech": 1.1, "mobilityt": 1.3, "supplychain": 1.2,
    "manufacturingtech": 1.5, "hrtech": 0.9, "proptech": 1.1,
    "enterprisetech": 1.2, "socialimpact": 0.8, "nonprofittech": 0.7,
}


def get_domain_multiplier(domain: str) -> float:
    d = domain.lower().replace(" ", "").replace("-", "")
    for key, val in DOMAIN_MULTIPLIERS.items():
        if key in d:
            return val
    return 1.0


def infer_stage(domain, target_segments, risk_score, market_strength, business_model_type):
    domain_lower = domain.lower()
    is_complex_domain = any(
        x in domain_lower
        for x in ["bio", "health", "deep", "defense", "energy", "finance", "insur", "legal"]
    )
    is_b2b = "b2b" in business_model_type.lower() or "enterprise" in business_model_type.lower()
    num_segments = len(target_segments)

    if is_complex_domain and risk_score >= 65:
        return "funded_startup"
    if is_b2b and num_segments >= 3 and market_strength >= 60:
        return "funded_startup"
    if market_strength >= 75 and risk_score < 50:
        return "funded_startup"
    if risk_score >= 70:
        return "early_startup"
    if num_segments <= 2 and not is_complex_domain and not is_b2b:
        return "student_mvp"
    return "early_startup"


async def generate_budget_analysis(db, idea_id: str, user_id: str):

    query = text("""
        SELECT analysis_data, market_analysis, competitor_analysis,
               risk_feasibility_analysis, budget_analysis
        FROM ideas WHERE id = :id AND user_id = :user_id
    """)
    result = await db.execute(query, {"id": idea_id, "user_id": user_id})
    row = result.fetchone()
    if not row:
        return {"status": "error", "message": "Idea not found"}

    analysis_data, market_data, competitor_data, risk_data, budget_data = row
    if isinstance(analysis_data, str):
        analysis_data = json.loads(analysis_data)

    idea_section = analysis_data.get("idea_analysis", {})
    if not idea_section.get("locked", False):
        return {"status": "error", "message": "Idea must be locked first"}

    accepted_version = idea_section.get("accepted_version")

    if budget_data:
        if isinstance(budget_data, str):
            budget_data = json.loads(budget_data)
        cached = budget_data.get("version_outputs", {}).get(str(accepted_version))
        if cached:
            return {"status": "success", "data": cached}

    idea_context = build_idea_context(analysis_data)
    title       = idea_context["identity"]["title"]
    domain      = idea_context["identity"]["domain"]
    summary     = idea_context["positioning"]["summarized_idea"]
    problem     = idea_context["market_definition"]["core_problem"]
    target_segs = idea_context["market_definition"]["target_segments"]
    value_prop  = idea_context["positioning"]["core_value_proposition"]

    market_strength = 50
    market_growth_drivers: list[str] = []
    if market_data:
        if isinstance(market_data, str):
            market_data = json.loads(market_data)
        mv = market_data.get("version_outputs", {}).get(str(accepted_version))
        if mv:
            market_strength       = mv.get("combined_market_strength", 50)
            market_growth_drivers = mv.get("key_growth_drivers", [])

    risk_score           = 50
    execution_risk       = 50
    competition_pressure = 50
    top_key_risks: list[str] = []
    if risk_data:
        if isinstance(risk_data, str):
            risk_data = json.loads(risk_data)
        rv = risk_data.get("version_outputs", {}).get(str(accepted_version))
        if rv:
            rs                   = rv["Primary_Summary"]
            risk_score           = rs["Overall_Risk_Score"]
            execution_risk       = rs["Execution_Risk_Score"]
            competition_pressure = rs["Competition_Pressure_Score"]
            top_key_risks        = rs.get("Top_3_Key_Risks", [])

    competition_score = 50
    top_competitor_names: list[str] = []
    if competitor_data:
        if isinstance(competitor_data, str):
            competitor_data = json.loads(competitor_data)
        cv = competitor_data.get("version_outputs", {}).get(str(accepted_version))
        if cv:
            comps = cv.get("top_competitors_ranked", [])[:5]
            if comps:
                competition_score      = int(sum(c.get("popularity_avg", 50) for c in comps) / len(comps))
                top_competitor_names   = [c.get("name", "") for c in comps if c.get("name")]

    # ── LLM: financial profile + budget intelligence ──────────────────────────
    competitors_context = (
        f"Known competitors in this space: {', '.join(top_competitor_names[:3])}."
        if top_competitor_names else
        "No specific competitors identified yet."
    )

    prompt = f"""
You are a startup financial analyst. Analyze this startup and return a complete financial and budget intelligence profile.

Startup:
Title: {title}
Domain: {domain}
Problem: {problem}
Value Proposition: {value_prop}
Summary: {summary}
Target Segments: {", ".join(target_segs)}
Competitor Context: {competitors_context}
Market Strength Score: {market_strength}/100
Risk Score: {risk_score}/100

Return ONLY valid JSON (no markdown, no explanation):

{{
  "business_model_type": "B2C | B2B | B2B2C | Marketplace | SaaS | D2C",
  "customer_type": "Consumer | SME | Enterprise | Mixed",
  "monetization_model": "Subscription | Freemium | One-time | Commission | Ads | Usage-based",
  "pricing_model": "Free | Tiered | Per-seat | Flat-rate | Pay-per-use",
  "revenue_stream": "SaaS | Transactional | Licensing | Ad revenue | Service fees",
  "cost_structure_profile": {{
    "tech_intensity": 0.0,
    "marketing_intensity": 0.0,
    "operational_intensity": 0.0
  }},
  "growth_profile": {{
    "expected_growth_speed": 0.0,
    "network_effect_strength": 0.0
  }},
  "founder_profile_hint": "student | solo_founder | small_team | funded_team",
  "growth_drivers": [
    "3-5 specific growth levers referencing {title} and {domain} — not generic phrases"
  ],
  "risk_signals": [
    "3-5 specific risks referencing {title} and {domain} — not generic phrases"
  ],
  "budget_intelligence": [
    {{
      "title": "Short label for this insight (e.g. 'Allocate Dev Budget')",
      "insight": "A concrete budget or capital allocation insight for {title}. Reference competitor spending patterns from: {competitors_context}. Be specific about INR amounts or percentages of capital."
    }},
    {{
      "title": "Short label",
      "insight": "A second budget insight about burn rate optimization or cost reduction specific to {domain}."
    }},
    {{
      "title": "Short label",
      "insight": "A third insight about revenue acceleration or how to shorten the break-even timeline for {title}."
    }}
  ]
}}

Rules:
- All floats 0.0–1.0
- budget_intelligence must be BUDGET SPECIFIC — about capital allocation, competitor spend benchmarks, burn optimization, cost trade-offs
- Do NOT give generic startup advice — reference {domain}, {title}, competitors, and INR figures
- Each budget_intelligence insight should be 1-2 sentences max, actionable and specific
"""

    financial_profile = safe_json(call_llm(prompt))
    if not financial_profile:
        return {"status": "error", "message": "Financial inference failed"}

    tech_intensity      = financial_profile["cost_structure_profile"]["tech_intensity"]
    marketing_intensity = financial_profile["cost_structure_profile"]["marketing_intensity"]
    ops_intensity       = financial_profile["cost_structure_profile"]["operational_intensity"]
    growth_speed        = financial_profile["growth_profile"]["expected_growth_speed"]
    network_effect      = financial_profile["growth_profile"]["network_effect_strength"]
    business_model_type = financial_profile.get("business_model_type", "B2C")
    founder_hint        = financial_profile.get("founder_profile_hint", "solo_founder")

    llm_growth_drivers = financial_profile.get("growth_drivers", [])
    llm_risk_signals   = financial_profile.get("risk_signals", [])
    budget_intelligence = financial_profile.get("budget_intelligence", [])

    growth_drivers = list(dict.fromkeys(market_growth_drivers + llm_growth_drivers))[:5]
    risk_signals   = list(dict.fromkeys(top_key_risks + llm_risk_signals))[:5]

    monetization_model = financial_profile["monetization_model"].lower()
    MONETIZATION_ARPU_MODIFIER = {
        "freemium": 0.5, "ads": 0.35, "commission": 0.7,
        "usage": 0.9, "subscription": 1.0, "one-time": 0.8,
    }
    arpu_modifier = 1.0
    for key, val in MONETIZATION_ARPU_MODIFIER.items():
        if key in monetization_model:
            arpu_modifier = val
            break

    hint_to_stage = {
        "student": "student_mvp", "solo_founder": "early_startup",
        "small_team": "early_startup", "funded_team": "funded_startup",
    }
    inferred_stage_key = hint_to_stage.get(founder_hint, "early_startup")
    signal_stage = infer_stage(domain, target_segs, risk_score, market_strength, business_model_type)

    if signal_stage == "funded_startup" or inferred_stage_key == "funded_startup":
        stage_key = "funded_startup"
    elif signal_stage == "student_mvp" and inferred_stage_key == "student_mvp":
        stage_key = "student_mvp"
    else:
        stage_key = signal_stage

    stage       = STAGE_PROFILES[stage_key]
    domain_mult = get_domain_multiplier(domain)
    currency_symbol = stage["currency_symbol"]

    dev_base_low, dev_base_high = stage["dev_cost_range"]
    dev_base = dev_base_low + (dev_base_high - dev_base_low) * tech_intensity
    dev_cost = dev_base * domain_mult * (1 + execution_risk / 300)

    marketing_cost = stage["marketing_budget"] * (0.5 + marketing_intensity)
    burn_low, burn_high = stage["monthly_burn_range"]
    ops_base = (burn_low + burn_high) / 2
    ops_cost = ops_base * ops_intensity * domain_mult

    salary_per_head = {"student_mvp": 0, "early_startup": 20_000, "funded_startup": 50_000, "growth_stage": 80_000}
    monthly_salary = salary_per_head[stage_key] * stage["team_size"]
    misc_monthly   = burn_low * 0.1

    initial_users   = stage["initial_users"]
    conversion_rate = stage["conversion_rate"] + (network_effect * 0.02)
    is_b2b    = "b2b" in business_model_type.lower() or "enterprise" in business_model_type.lower()
    base_arpu = stage["arpu_b2b"] if is_b2b else stage["arpu_b2c"]
    arpu      = max(base_arpu * arpu_modifier, base_arpu * 0.20)

    growth_rate = (
        (market_strength / 200)
        + (growth_speed * 0.06)
        + (network_effect * 0.04)
        - (risk_score / 300)
    )
    if stage_key == "student_mvp":
        growth_rate *= 0.5
    elif stage_key == "early_startup":
        growth_rate *= 0.7
    growth_rate = max(0.015, min(growth_rate, 0.15))

    users              = initial_users
    cumulative_revenue = 0
    cumulative_expense = dev_cost
    timeline_36        = []
    break_even_month   = None
    monthly_burn       = 0

    for month in range(1, 61):
        adoption_multiplier = 1 + (growth_rate * (1 - 1 / (1 + month / 8)))
        users = int(users * adoption_multiplier)
        paying_users    = max(1, int(users * conversion_rate))
        monthly_revenue = paying_users * arpu
        burn_decay   = max(0.55, 1 - (month * 0.012))
        monthly_burn = (
            (ops_cost * burn_decay)
            + (marketing_cost * burn_decay)
            + monthly_salary
            + misc_monthly
            + (monthly_revenue * 0.10)
        )
        cumulative_revenue += monthly_revenue
        cumulative_expense += monthly_burn

        if month <= 36:
            timeline_36.append({
                "month": month,
                "users": users,
                "revenue": round(cumulative_revenue),
                "expense": round(cumulative_expense),
            })

        if cumulative_revenue >= cumulative_expense and break_even_month is None:
            break_even_month = month

    if break_even_month is None:
        break_even_label = "Beyond 5 years"
        break_even_sub   = "Consider pivoting pricing model"
    elif break_even_month <= 36:
        break_even_label = f"Month {break_even_month}"
        break_even_sub   = f"~{break_even_month} months"
    else:
        break_even_label = f"~Month {break_even_month}"
        break_even_sub   = "Projected beyond 36-month window"

    # Revenue coverage ratio at M36 — helps UI show context
    m36_revenue = timeline_36[-1]["revenue"]
    m36_expense = timeline_36[-1]["expense"]
    revenue_coverage_pct = round((m36_revenue / m36_expense) * 100) if m36_expense > 0 else 0

    runway_months    = stage["runway_months"] + int(risk_score / 25)
    required_capital = (monthly_burn * runway_months) + dev_cost
    CAPITAL_CAP = {
        "student_mvp": 200_000, "early_startup": 3_000_000,
        "funded_startup": 15_000_000, "growth_stage": 50_000_000,
    }
    required_capital = min(required_capital, CAPITAL_CAP.get(stage_key, required_capital))

    total_cost = dev_cost + ops_cost + marketing_cost + (monthly_salary * 12) + (misc_monthly * 12)
    total_cost = max(total_cost, 1)
    cost_structure = [
        {"name": "Development", "percentage": round((dev_cost / total_cost) * 100)},
        {"name": "Marketing",   "percentage": round(((marketing_cost * 12) / total_cost) * 100)},
        {"name": "Operations",  "percentage": round(((ops_cost * 12) / total_cost) * 100)},
        {"name": "Salaries",    "percentage": round(((monthly_salary * 12) / total_cost) * 100)},
        {"name": "Misc",        "percentage": round(((misc_monthly * 12) / total_cost) * 100)},
    ]
    total_pct = sum(c["percentage"] for c in cost_structure)
    if total_pct != 100:
        cost_structure[0]["percentage"] += (100 - total_pct)

    confidence_score = int(
        0.50 * (100 - risk_score)
        + 0.30 * market_strength
        + 0.20 * (100 - competition_score)
    )
    confidence = "High" if confidence_score > 70 else "Moderate" if confidence_score > 45 else "Low"

    output = {
        "startup_type": title, "industry": domain, "target_customer": summary,
        "inferred_startup_stage": stage["label"],
        "stage_description":      stage["recommendation"],
        "currency":               stage["currency"],
        "currency_symbol":        currency_symbol,
        "monetization_model":     financial_profile["monetization_model"],
        "pricing_model":          financial_profile["pricing_model"],
        "revenue_stream":         financial_profile["revenue_stream"],
        "business_model_type":    business_model_type,
        "customer_type":          financial_profile["customer_type"],
        "estimated_dev_cost":          round(dev_cost),
        "monthly_operating_cost":      round(monthly_burn),
        "estimated_required_capital":  round(required_capital),
        "runway_months":               runway_months,
        "expected_break_even_month":   break_even_month,
        "break_even_label":            break_even_label,
        "break_even_sub":              break_even_sub,
        "revenue_projection_36_month": m36_revenue,
        "revenue_coverage_pct":        revenue_coverage_pct,   # new: % of expenses covered by revenue at M36
        "projection_confidence":       confidence,
        "cost_structure":  cost_structure,
        "projection":      timeline_36,
        "growth_drivers":  growth_drivers,
        "risk_signals":    risk_signals,
        "budget_intelligence": budget_intelligence,             # replaces founder_playbook
    }

    if not budget_data:
        budget_data = {"version_outputs": {}}
    budget_data["version_outputs"][str(accepted_version)] = output

    await db.execute(
        text("UPDATE ideas SET budget_analysis = :budget WHERE id = :id"),
        {"id": idea_id, "budget": json.dumps(budget_data)},
    )
    await db.commit()
    return {"status": "success", "data": output}