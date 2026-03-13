from pydantic import BaseModel
from typing import List

class Competitor(BaseModel):
    name: str
    description: str
    business_model: str
    popularity_avg: int
    trend_growth: int
    overall_score: float


class CompetitorResponse(BaseModel):
    top_competitors_ranked: List[Competitor]