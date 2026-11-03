"""Dashboard routes for students and teachers."""

from typing import Any, Dict, List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session as DBSession

from src.analytics.class_aggregator import ClassAggregator
from src.analytics.risk_identifier import RiskIdentifier
from src.analytics.trend_analyzer import TrendAnalyzer
from src.api.middleware.auth import get_current_user, require_role
from src.database import get_db
from src.models.course import Course
from src.models.engagement_log import EngagementLog
from src.models.session import Session as SessionModel
from src.models.user import User

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


@router.get("/student")
def get_student_dashboard(
    current_user: User = Depends(get_current_user),
    db: DBSession = Depends(get_db),
):
    """Return student dashboard analytics for the currently authenticated student."""
    # Query all engagement logs for the current student
    logs = db.execute(
        select(
            EngagementLog.session_id,
            EngagementLog.score,
            EngagementLog.state,
            EngagementLog.timestamp,
        )
        .where(EngagementLog.user_id == current_user.id)
        .order_by(EngagementLog.timestamp)
    ).all()

    if not logs:
        return {
            "user_id": current_user.id,
            "user_name": current_user.name,
            "overall_average": 0.0,
            "total_sessions": 0,
            "focus_streak": 0,
            "trend": "stable",
            "recent_sessions": [],
        }

    # Group logs by session
    session_logs: Dict[int, List[float]] = {}
    for session_id, score, _, _ in logs:
        session_logs.setdefault(session_id, []).append(float(score))

    session_ids = list(session_logs.keys())
    sessions_db = db.execute(
        select(SessionModel, Course)
        .join(Course, SessionModel.course_id == Course.id)
        .where(SessionModel.id.in_(session_ids))
        .order_by(SessionModel.start_time.desc())
    ).all()

    recent_sessions: List[Dict[str, Any]] = []
    chronological_scores: List[float] = []

    for sess, course in reversed(sessions_db):
        scores = session_logs.get(sess.id, [])
        avg = round(sum(scores) / len(scores), 2) if scores else 0.0
        chronological_scores.append(avg)

    for sess, course in sessions_db[:10]:
        scores = session_logs.get(sess.id, [])
        avg = round(sum(scores) / len(scores), 2) if scores else 0.0
        recent_sessions.append(
            {
                "session_id": sess.id,
                "course_name": course.name,
                "course_code": course.code,
                "date": sess.start_time.strftime("%Y-%m-%d"),
                "student_average": avg,
            }
        )

    # Focus streak: consecutive sessions with avg >= 70
    focus_streak = 0
    for score in reversed(chronological_scores):
        if score >= 70.0:
            focus_streak += 1
        else:
            break

    # Trend calculation
    trend_analyzer = TrendAnalyzer()
    slope = trend_analyzer.compute_trend(chronological_scores)
    trend = "improving" if slope > 1.0 else ("declining" if slope < -1.0 else "stable")

    all_scores = [log[1] for log in logs]
    overall_avg = round(sum(all_scores) / len(all_scores), 2) if all_scores else 0.0

    return {
        "user_id": current_user.id,
        "user_name": current_user.name,
        "overall_average": overall_avg,
        "total_sessions": len(session_ids),
        "focus_streak": focus_streak,
        "trend": trend,
        "trend_slope": slope,
        "recent_sessions": recent_sessions,
    }


@router.get("/teacher")
def get_teacher_dashboard(
    current_user: User = Depends(require_role(["teacher"])),
    db: DBSession = Depends(get_db),
):
    """Return overview analytics across all courses taught by the current teacher."""
    courses = (
        db.execute(select(Course).where(Course.teacher_id == current_user.id).order_by(Course.name))
        .scalars()
        .all()
    )

    total_sessions_count = 0
    all_course_scores: List[float] = []
    courses_summary: List[Dict[str, Any]] = []
    at_risk_count = 0

    risk_identifier = RiskIdentifier(threshold=50.0, consecutive_sessions=2)

    for course in courses:
        sessions = (
            db.execute(
                select(SessionModel)
                .where(SessionModel.course_id == course.id)
                .order_by(SessionModel.start_time)
            )
            .scalars()
            .all()
        )
        total_sessions_count += len(sessions)

        # Compute average engagement for this course
        logs = db.execute(
            select(EngagementLog.user_id, EngagementLog.session_id, EngagementLog.score)
            .join(SessionModel, EngagementLog.session_id == SessionModel.id)
            .where(SessionModel.course_id == course.id)
            .order_by(EngagementLog.timestamp)
        ).all()

        course_scores = [float(log[2]) for log in logs]
        all_course_scores.extend(course_scores)
        course_avg = round(sum(course_scores) / len(course_scores), 2) if course_scores else 0.0

        # Unique students count
        unique_students = len({log[0] for log in logs})

        # Evaluate risk per student in this course
        student_history: Dict[int, List[float]] = {}
        for uid, sid, score in logs:
            student_history.setdefault(uid, []).append(float(score))

        course_at_risk = 0
        for uid, scores in student_history.items():
            eval_res = risk_identifier.evaluate(str(uid), scores)
            if eval_res.at_risk:
                course_at_risk += 1

        at_risk_count += course_at_risk

        courses_summary.append(
            {
                "id": course.id,
                "name": course.name,
                "code": course.code,
                "session_count": len(sessions),
                "student_count": unique_students,
                "average_engagement": course_avg,
                "at_risk_students": course_at_risk,
            }
        )

    overall_class_avg = (
        round(sum(all_course_scores) / len(all_course_scores), 2) if all_course_scores else 0.0
    )

    return {
        "teacher_id": current_user.id,
        "teacher_name": current_user.name,
        "total_courses": len(courses),
        "total_sessions": total_sessions_count,
        "overall_average": overall_class_avg,
        "total_at_risk": at_risk_count,
        "courses": courses_summary,
    }


@router.get("/teacher/courses/{course_id}/overview")
def get_teacher_course_overview(
    course_id: int,
    current_user: User = Depends(require_role(["teacher"])),
    db: DBSession = Depends(get_db),
):
    """Return detailed analytics for a single course, including anonymized at-risk students."""
    course = db.get(Course, course_id)
    if course is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Course {course_id} not found",
        )
    if course.teacher_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to view this course",
        )

    sessions = (
        db.execute(
            select(SessionModel)
            .where(SessionModel.course_id == course_id)
            .order_by(SessionModel.start_time.desc())
        )
        .scalars()
        .all()
    )

    logs = db.execute(
        select(
            EngagementLog.session_id,
            EngagementLog.user_id,
            EngagementLog.score,
            EngagementLog.state,
            EngagementLog.timestamp,
        )
        .join(SessionModel, EngagementLog.session_id == SessionModel.id)
        .where(SessionModel.course_id == course_id)
        .order_by(EngagementLog.timestamp)
    ).all()

    # Per session summaries
    session_logs: Dict[int, List[float]] = {}
    session_students: Dict[int, set] = {}
    state_counts: Dict[str, int] = {}
    student_scores: Dict[int, List[float]] = {}

    for sid, uid, score, state, ts in logs:
        score_f = float(score)
        session_logs.setdefault(sid, []).append(score_f)
        session_students.setdefault(sid, set()).add(uid)
        student_scores.setdefault(uid, []).append(score_f)
        st_name = getattr(state, "value", str(state))
        state_counts[st_name] = state_counts.get(st_name, 0) + 1

    session_items = []
    for sess in sessions:
        scores = session_logs.get(sess.id, [])
        avg = round(sum(scores) / len(scores), 2) if scores else 0.0
        session_items.append(
            {
                "id": sess.id,
                "date": sess.start_time.strftime("%Y-%m-%d"),
                "average_engagement": avg,
                "log_count": len(scores),
                "student_count": len(session_students.get(sess.id, set())),
            }
        )

    # Anonymized At-Risk evaluation (MANDATORY: privacy)
    risk_identifier = RiskIdentifier(threshold=50.0, consecutive_sessions=2)
    student_ids = list(student_scores.keys())
    anonymized_labels = ClassAggregator.anonymize_student_ids(student_ids)

    at_risk_list = []
    for uid, scores in student_scores.items():
        eval_res = risk_identifier.evaluate(str(uid), scores)
        if eval_res.at_risk:
            avg_score = round(sum(scores) / len(scores), 2) if scores else 0.0
            at_risk_list.append(
                {
                    "anonymized_student_id": anonymized_labels.get(uid, f"anon_{uid}"),
                    "average_score": avg_score,
                    "reason": eval_res.reason,
                    "declining_trend": eval_res.declining_trend,
                }
            )

    all_scores = [log[2] for log in logs]
    course_avg = round(sum(all_scores) / len(all_scores), 2) if all_scores else 0.0

    return {
        "course_id": course.id,
        "course_name": course.name,
        "course_code": course.code,
        "total_sessions": len(sessions),
        "total_students": len(student_ids),
        "course_average": course_avg,
        "sessions": session_items,
        "state_distribution": [
            {"state": k.replace("_", " ").title(), "count": v} for k, v in state_counts.items()
        ],
        "at_risk_students": at_risk_list,
    }
