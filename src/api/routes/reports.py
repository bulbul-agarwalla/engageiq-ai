"""API routes for session and course engagement reports."""

from fastapi import APIRouter, Depends, HTTPException, Query, status
from fastapi.responses import HTMLResponse
from pydantic import BaseModel
from sqlalchemy.orm import Session as DBSession

from src.agents.intervention_agent import InterventionAgent
from src.database import get_db
from src.reports.email_sender import EmailSender
from src.reports.session_report import SessionReportGenerator
from src.reports.weekly_report import WeeklyReportGenerator

router = APIRouter(prefix="/reports", tags=["reports"])


@router.get("/sessions/{id}", response_class=HTMLResponse)
def get_session_report_html(id: int, db: DBSession = Depends(get_db)):
    """Return self-contained HTML report for a specific session."""
    try:
        generator = SessionReportGenerator(db=db)
        html = generator.generate(id)
        return HTMLResponse(content=html, status_code=status.HTTP_200_OK)
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(exc),
        )
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate report: {str(exc)}",
        )


@router.get("/sessions/{id}/data")
def get_session_report_data(id: int, db: DBSession = Depends(get_db)):
    """Return structured JSON data for a specific session's report."""
    try:
        generator = SessionReportGenerator(db=db)
        return generator.build_report_data(id)
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(exc),
        )
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch report data: {str(exc)}",
        )


@router.get("/courses/{id}/weekly")
def get_weekly_course_report(
    id: int,
    week: str = Query(..., description="Week identifier in 'YYYY-Www' format"),
    db: DBSession = Depends(get_db),
):
    """Return weekly trend analytics for a course."""
    try:
        generator = WeeklyReportGenerator(db=db)
        return generator.build_report_data(id, week)
    except ValueError as exc:
        raise HTTPException(
            status_code=(
                status.HTTP_404_NOT_FOUND
                if "not found" in str(exc)
                else status.HTTP_400_BAD_REQUEST
            ),
            detail=str(exc),
        )
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate weekly report: {str(exc)}",
        )


@router.get("/sessions/{id}/interventions")
def get_session_interventions(id: int, db: DBSession = Depends(get_db)):
    """Return AI pedagogical intervention suggestions for a session."""
    try:
        report_gen = SessionReportGenerator(db=db)
        session_data = report_gen.build_report_data(id)
        agent = InterventionAgent()
        suggestions = agent.suggest(session_data)
        return {
            "session_id": id,
            "suggestions": suggestions,
            "count": len(suggestions),
        }
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(exc),
        )
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate interventions: {str(exc)}",
        )


class EmailReportRequest(BaseModel):
    to_email: str


@router.post("/sessions/{id}/email")
def email_session_report(
    id: int,
    request: EmailReportRequest,
    db: DBSession = Depends(get_db),
):
    """Email the rendered HTML report for a session to the specified address."""
    try:
        report_gen = SessionReportGenerator(db=db)
        html = report_gen.generate(id)
        sender = EmailSender()
        delivery = sender.send_session_report(
            to_email=request.to_email,
            session_id=id,
            html_content=html,
        )
        return {
            "session_id": id,
            "to_email": request.to_email,
            "delivery": delivery,
        }
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(exc),
        )
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to deliver report email: {str(exc)}",
        )
