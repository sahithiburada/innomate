from pydantic import BaseModel
from typing import List


class MonthlyProjection(BaseModel):
    month: int
    revenue: int
    expense: int


class BudgetResponse(BaseModel):

    monthly_operating_cost: int
    development_cost: int

    estimated_required_capital: int

    expected_break_even_month: int | None

    revenue_projection_36_month: int

    projection_confidence: str

    projection: List[MonthlyProjection]