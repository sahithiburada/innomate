import json


def build_idea_context(analysis_data: dict) -> dict:
    """
    Extracts the locked + accepted version and builds a standardized
    context object to be consumed by all downstream models.
    """

    if not analysis_data:
        raise ValueError("analysis_data missing")

    idea_section = analysis_data.get("idea_analysis", {})

    if not idea_section.get("locked", False):
        raise ValueError("Idea must be locked before downstream modeling")

    accepted_version = idea_section.get("accepted_version")
    versions = idea_section.get("versions", [])

    selected_version = next(
        (v for v in versions if v["version"] == accepted_version),
        None
    )

    if not selected_version:
        raise ValueError("Accepted version not found")

    full = selected_version["full_analysis"]

    # =====================================================
    # MASTER CONTEXT OBJECT
    # =====================================================

    context = {
        "meta": {
            "version": accepted_version,
            "created_at": selected_version.get("created_at")
        },

        "identity": {
            "title": full.get("suggested_title"),
            "domain_raw": full.get("domain", {}).get("raw_inference"),
            "domain": full.get("domain", {}).get("normalized_label"),
            "domain_confidence": full.get("domain", {}).get("confidence"),
            "subdomain": full.get("subdomain")
        },

        "positioning": {
            "abstract_context": full.get("abstract_context"),
            "core_value_proposition": full.get("core_value_proposition"),
            "summarized_idea": full.get("summarized_idea")
        },

        "market_definition": {
            "target_segments": full.get("target_segments", []),
            "core_problem": full.get("core_problem"),

            "keyword_intelligence": {
                "core_terms": full.get("keyword_intelligence", {}).get("core_terms", []),
                "commercial_terms": full.get("keyword_intelligence", {}).get("commercial_terms", []),
                "persona_terms": full.get("keyword_intelligence", {}).get("persona_terms", []),
                "industry_terms": full.get("keyword_intelligence", {}).get("industry_terms", []),
                "long_tail_terms": full.get("keyword_intelligence", {}).get("long_tail_terms", [])
            }
        },
        "problem_structure": full.get("idea_understanding", {})
    }

    return context