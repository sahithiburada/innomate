from pydantic import BaseModel

class MarketResponse(BaseModel):
    optimized_search_keywords: list
    search_trend_score: int
    search_direction: str
    strategic_market_stage: str
    strategic_demand_direction: str
    key_growth_drivers: list
    macro_forces: list
    five_year_outlook: str
    strategic_confidence_score: int
    combined_market_strength: int
    market_opportunity_level: str
    trend_data: list