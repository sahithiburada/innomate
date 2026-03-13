from pydantic import BaseModel
from typing import List


class SWOTResponse(BaseModel):
    Strengths: List[str]
    Weaknesses: List[str]
    Opportunities: List[str]
    Threats: List[str]