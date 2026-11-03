"""Session management and live telemetry ingestion routes."""

from datetime import datetime
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel, Field
from sqlalchemy import func, select
from sqlalchemy.orm import Session as DBSession

from src.api.middleware.auth import get_current_user, require_role
from src.config.settings import EngagementState
from src.database import get_db
from src.models.course import Course
from src.models.engagement_log import EngagementLog
from src.models.session import Session as SessionModel
from src.models.user import User

router = APIRouter(prefix="/sessions", tags=["sessions"])


class SessionCreateRequest(BaseModel):
    course_id: int
    status: str = "active"


class TelemetryIngestRequest(BaseModel):
    score: float = Field(..., ge=0.0, le=100.0)
    state: EngagementState = EngagementState.ENGAGED
    gaze: Optional[str] = "forward"
    drowsiness: Optional[float] = Field(0.0, ge=0.0, le=1.0)
    expression: Optional[str] = "neutral"
    student_id: Optional[int] = None


@router.post("/", status_code=201)
def create_session(
    payload: SessionCreateRequest,
    db: DBSession = Depends(get_db),
    current_user: User = Depends(require_role(["teacher"])),
):
    """Create a new lecture session (Instructor only)."""
    course = db.get(Course, payload.course_id)
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")

    new_session = SessionModel(
        course_id=payload.course_id,
        status="active",
        start_time=datetime.utcnow(),
    )
    db.add(new_session)
    db.commit()
    db.refresh(new_session)

    return {
        "id": new_session.id,
        "course_id": new_session.course_id,
        "course_name": course.name,
        "course_code": course.code,
        "status": new_session.status,
        "start_time": new_session.start_time.isoformat() if new_session.start_time else None,
    }


@router.get("/active")
def get_active_session(
    course_id: Optional[int] = Query(None),
    db: DBSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get the latest active lecture session."""
    query = (
        select(SessionModel, Course)
        .join(Course, SessionModel.course_id == Course.id)
        .where(SessionModel.status == "active")
    )
    if course_id:
        query = query.where(SessionModel.course_id == course_id)

    query = query.order_by(SessionModel.start_time.desc())
    row = db.execute(query).first()

    if not row:
        return {"active": False, "session": None}

    session, course = row
    return {
        "active": True,
        "session": {
            "id": session.id,
            "course_id": session.course_id,
            "course_name": course.name,
            "course_code": course.code,
            "status": session.status,
            "start_time": session.start_time.isoformat() if session.start_time else None,
        },
    }


@router.get("/{session_id}")
def get_session_details(
    session_id: int,
    db: DBSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get details and aggregated stats for a specific session."""
    session = db.get(SessionModel, session_id)
    if not session:
        raise HTTPException(status_code=404, detail=f"Session {session_id} not found")

    course = db.get(Course, session.course_id)
    avg_score = (
        db.query(func.avg(EngagementLog.score))
        .filter(EngagementLog.session_id == session_id)
        .scalar()
        or 0.0
    )
    log_count = (
        db.query(func.count(EngagementLog.id))
        .filter(EngagementLog.session_id == session_id)
        .scalar()
        or 0
    )
    student_count = (
        db.query(func.count(func.distinct(EngagementLog.user_id)))
        .filter(EngagementLog.session_id == session_id)
        .scalar()
        or 0
    )

    return {
        "id": session.id,
        "course_id": session.course_id,
        "course_name": course.name if course else "Unknown",
        "course_code": course.code if course else "",
        "status": session.status,
        "start_time": session.start_time.isoformat() if session.start_time else None,
        "end_time": session.end_time.isoformat() if session.end_time else None,
        "average_engagement": round(float(avg_score), 2),
        "log_count": log_count,
        "student_count": student_count,
    }


@router.post("/{session_id}/end")
def end_session(
    session_id: int,
    db: DBSession = Depends(get_db),
    current_user: User = Depends(require_role(["teacher"])),
):
    """End an active lecture session."""
    session = db.get(SessionModel, session_id)
    if not session:
        raise HTTPException(status_code=404, detail=f"Session {session_id} not found")

    session.status = "completed"
    session.end_time = datetime.utcnow()
    db.commit()
    db.refresh(session)

    return {
        "id": session.id,
        "status": session.status,
        "start_time": session.start_time.isoformat() if session.start_time else None,
        "end_time": session.end_time.isoformat() if session.end_time else None,
        "message": "Session completed successfully",
    }


@router.post("/{session_id}/telemetry", status_code=201)
def ingest_telemetry(
    session_id: int,
    payload: TelemetryIngestRequest,
    db: DBSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Ingest a single frame or interval telemetry log."""
    session = db.get(SessionModel, session_id)
    if not session:
        raise HTTPException(status_code=404, detail=f"Session {session_id} not found")

    # If student_id is provided and user is teacher, record for that student; otherwise record for current user
    target_user_id = (
        payload.student_id
        if (payload.student_id and current_user.role == "teacher")
        else current_user.id
    )

    log_entry = EngagementLog(
        session_id=session_id,
        user_id=target_user_id,
        score=payload.score,
        state=payload.state,
        gaze=payload.gaze,
        drowsiness=payload.drowsiness,
        expression=payload.expression,
        timestamp=datetime.utcnow(),
    )
    db.add(log_entry)
    db.commit()
    db.refresh(log_entry)

    return {
        "id": log_entry.id,
        "session_id": log_entry.session_id,
        "user_id": log_entry.user_id,
        "score": log_entry.score,
        "state": log_entry.state,
        "timestamp": log_entry.timestamp.isoformat(),
    }


@router.get("/{session_id}/live-stats")
def get_session_live_stats(
    session_id: int,
    db: DBSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get live real-time stats for the active session."""
    session = db.get(SessionModel, session_id)
    if not session:
        raise HTTPException(status_code=404, detail=f"Session {session_id} not found")

    # Latest 20 logs
    recent_logs = (
        db.query(EngagementLog)
        .filter(EngagementLog.session_id == session_id)
        .order_by(EngagementLog.timestamp.desc())
        .limit(20)
        .all()
    )

    avg_score = (
        db.query(func.avg(EngagementLog.score))
        .filter(EngagementLog.session_id == session_id)
        .scalar()
        or 0.0
    )

    # State distribution
    state_counts = (
        db.query(EngagementLog.state, func.count(EngagementLog.id))
        .filter(EngagementLog.session_id == session_id)
        .group_by(EngagementLog.state)
        .all()
    )
    states_dict = {s.value: 0 for s in EngagementState}
    total_logs = 0
    for state, cnt in state_counts:
        key = state.value if hasattr(state, "value") else str(state)
        states_dict[key] = cnt
        total_logs += cnt

    state_distribution = {
        k: round((v / total_logs) * 100, 1) if total_logs > 0 else 0.0
        for k, v in states_dict.items()
    }

    # Format recent points
    timeline = [
        {
            "id": log.id,
            "timestamp": log.timestamp.strftime("%H:%M:%S") if log.timestamp else "",
            "score": round(log.score, 1),
            "state": log.state.value if hasattr(log.state, "value") else str(log.state),
            "drowsiness": round(log.drowsiness or 0.0, 2),
        }
        for log in reversed(recent_logs)
    ]

    return {
        "session_id": session_id,
        "status": session.status,
        "average_engagement": round(float(avg_score), 1),
        "total_observations": total_logs,
        "state_distribution": state_distribution,
        "recent_timeline": timeline,
    }
