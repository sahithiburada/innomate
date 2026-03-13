from pydantic import BaseModel
from typing import List


class RecommendationOutput(BaseModel):
    high_priority_actions: List[str]
    medium_priority_actions: List[str]
    long_term_actions: List[str]
    phase1_validation: List[str]
    phase2_market_entry: List[str]
    phase3_scale: List[str]