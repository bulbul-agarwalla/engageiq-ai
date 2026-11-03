"""Data structures and formatters for intervention suggestions."""

from typing import List

from pydantic import BaseModel, Field


class InterventionItem(BaseModel):
    """Individual pedagogical intervention recommendation."""

    type: str = Field(..., description="Category: pacing, activity, checkin, break, review")
    message: str = Field(..., description="Actionable recommendation for the instructor")
    priority: str = Field(..., description="high, medium, or low")
    confidence: float = Field(..., ge=0.0, le=1.0, description="Confidence score")


class InterventionReport(BaseModel):
    """Full session intervention report."""

    session_id: int
    suggestions: List[InterventionItem]
    source: str = Field(..., description="'llm' or 'rule_engine'")
