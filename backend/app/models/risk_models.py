from pydantic import BaseModel
from typing import List, Dict


class RiskSummary(BaseModel):
    Overall_Risk_Score: int
    Overall_Risk_Level: str
    Feasibility_Score: int
    Execution_Risk_Score: int
    Market_Risk_Score: int
    Competition_Pressure_Score: int
    Top_3_Key_Risks: List[str]
    Final_Verdict: str


class RiskFeasibilityResponse(BaseModel):
    Primary_Summary: RiskSummary
    Detailed_Explanation: Dict