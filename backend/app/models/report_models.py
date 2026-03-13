"""
app/models/report_models.py
"""
from pydantic import BaseModel


class ReportResponse(BaseModel):
    status: str
    pdf_url: str | None = None
    cached: bool = False