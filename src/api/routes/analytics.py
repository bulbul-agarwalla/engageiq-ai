"""Analytics routes for content difficulty correlation and engagement diagnostics."""

from typing import List, Tuple

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.orm import Session as DBSession

from src.analytics.difficulty_correlator import DifficultyCorrelator
from src.database import get_db
from src.models.course import Course
from src.models.engagement_log import EngagementLog
from src.models.session import Session as SessionModel

router = APIRouter(prefix="/analytics", tags=["analytics"])


@router.get("/sessions/{id}/difficulty")
def get_session_difficulty(
    id: int,
    threshold: float = Query(40.0, ge=0.0, le=100.0),
    db: DBSession = Depends(get_db),
):
    """Analyze a single session for difficult content segments where engagement dipped."""
    session = db.get(SessionModel, id)
    if session is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Session {id} not found",
        )

    logs = db.execute(
        select(EngagementLog.timestamp, EngagementLog.score)
        .where(EngagementLog.session_id == id)
        .order_by(EngagementLog.timestamp)
    ).all()

    if not logs:
        return {
            "session_id": id,
            "threshold": threshold,
            "segments": [],
            "total_dips": 0,
        }

    session_start = session.start_time
    timeline: List[Tuple[float, float]] = [
        (max(0.0, (ts - session_start).total_seconds()), float(score)) for ts, score in logs
    ]

    correlator = DifficultyCorrelator()
    segments = correlator.correlate(timeline, threshold=threshold)

    return {
        "session_id": id,
        "threshold": threshold,
        "segments": segments,
        "total_dips": len(segments),
    }


@router.get("/courses/{id}/difficulty")
def get_course_difficulty(
    id: int,
    threshold: float = Query(40.0, ge=0.0, le=100.0),
    db: DBSession = Depends(get_db),
):
    """Analyze course sessions to pinpoint difficult segments."""
    course = db.get(Course, id)
    if course is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Course {id} not found",
        )

    sessions = (
        db.execute(
            select(SessionModel)
            .where(SessionModel.course_id == id)
            .order_by(SessionModel.start_time)
        )
        .scalars()
        .all()
    )

    correlator = DifficultyCorrelator()
    course_segments = []

    for sess in sessions:
        logs = db.execute(
            select(EngagementLog.timestamp, EngagementLog.score)
            .where(EngagementLog.session_id == sess.id)
            .order_by(EngagementLog.timestamp)
        ).all()
        if not logs:
            continue

        sess_start = sess.start_time
        timeline = [
            (max(0.0, (ts - sess_start).total_seconds()), float(score)) for ts, score in logs
        ]
        sess_dips = correlator.correlate(timeline, threshold=threshold)
        if sess_dips:
            course_segments.append(
                {
                    "session_id": sess.id,
                    "date": sess.start_time.strftime("%Y-%m-%d"),
                    "dips": sess_dips,
                }
            )

    return {
        "course_id": id,
        "course_name": course.name,
        "threshold": threshold,
        "flagged_sessions": course_segments,
        "total_flagged_sessions": len(course_segments),
    }
