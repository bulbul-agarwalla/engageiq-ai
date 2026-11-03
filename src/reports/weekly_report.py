"""Generate weekly trend reports with visualizations."""

from __future__ import annotations

from datetime import datetime, timedelta
from typing import Any, Dict, List, Optional

from sqlalchemy import func, select
from sqlalchemy.orm import Session as DatabaseSession

from src.analytics.trend_analyzer import TrendAnalyzer
from src.database import SessionLocal
from src.models.course import Course
from src.models.engagement_log import EngagementLog
from src.models.session import Session


class WeeklyReportGenerator:
    """Generate weekly trend analytics for a course."""

    def __init__(self, db: Optional[DatabaseSession] = None) -> None:
        self.db = db
        self.trend_analyzer = TrendAnalyzer()

    @staticmethod
    def parse_week_range(week_str: str) -> tuple[datetime, datetime]:
        """Parse 'YYYY-Www' string into (start_of_week, end_of_week) datetimes."""
        try:
            # Format: 'YYYY-Www-1' for Monday of that week
            start = datetime.strptime(f"{week_str}-1", "%Y-W%W-%w")
            end = start + timedelta(days=6, hours=23, minutes=59, seconds=59)
            return start, end
        except ValueError as exc:
            raise ValueError(f"Invalid week format '{week_str}'. Expected 'YYYY-Www'.") from exc

    def build_report_data(self, course_id: int, week_str: str) -> Dict[str, Any]:
        """Aggregate course sessions and trends for the specified week."""
        owns_db = self.db is None
        db = self.db or SessionLocal()
        try:
            course = db.get(Course, course_id)
            if course is None:
                raise ValueError(f"Course {course_id} was not found")

            week_start, week_end = self.parse_week_range(week_str)

            # Query current week sessions
            sessions = (
                db.execute(
                    select(Session)
                    .where(
                        Session.course_id == course_id,
                        Session.start_time >= week_start,
                        Session.start_time <= week_end,
                    )
                    .order_by(Session.start_time)
                )
                .scalars()
                .all()
            )

            session_summaries: List[Dict[str, Any]] = []
            session_scores: List[float] = []

            for sess in sessions:
                logs = db.execute(
                    select(EngagementLog.score, EngagementLog.state).where(
                        EngagementLog.session_id == sess.id
                    )
                ).all()

                if logs:
                    avg_score = round(sum(log[0] for log in logs) / len(logs), 2)
                    states: Dict[str, int] = {}
                    for _, state in logs:
                        st_name = getattr(state, "value", str(state))
                        states[st_name] = states.get(st_name, 0) + 1
                else:
                    avg_score = 0.0
                    states = {}

                session_scores.append(avg_score)
                session_summaries.append(
                    {
                        "session_id": sess.id,
                        "date": sess.start_time.strftime("%Y-%m-%d"),
                        "average_engagement": avg_score,
                        "log_count": len(logs),
                        "state_distribution": states,
                    }
                )

            week_average = (
                round(sum(session_scores) / len(session_scores), 2) if session_scores else 0.0
            )

            trend_slope = self.trend_analyzer.compute_trend(session_scores)
            anomaly_indices = self.trend_analyzer.detect_anomalies(session_scores)
            anomalous_session_ids = [session_summaries[i]["session_id"] for i in anomaly_indices]

            # Query prior 4 weeks averages
            prior_weeks: List[Dict[str, Any]] = []
            for i in range(1, 5):
                p_start = week_start - timedelta(weeks=i)
                p_end = week_end - timedelta(weeks=i)
                p_week_label = p_start.strftime("%Y-W%W")

                p_avg = db.execute(
                    select(func.avg(EngagementLog.score))
                    .join(Session, EngagementLog.session_id == Session.id)
                    .where(
                        Session.course_id == course_id,
                        Session.start_time >= p_start,
                        Session.start_time <= p_end,
                    )
                ).scalar()
                prior_weeks.append(
                    {
                        "week": p_week_label,
                        "average_engagement": (
                            round(float(p_avg), 2) if p_avg is not None else 0.0
                        ),
                    }
                )

            return {
                "course_id": course.id,
                "course_name": course.name,
                "course_code": course.code,
                "week": week_str,
                "week_start": week_start.strftime("%Y-%m-%d"),
                "week_end": week_end.strftime("%Y-%m-%d"),
                "session_count": len(session_summaries),
                "week_average": week_average,
                "trend_slope": trend_slope,
                "sessions": session_summaries,
                "anomalous_session_ids": anomalous_session_ids,
                "prior_weeks": list(reversed(prior_weeks)),
            }
        finally:
            if owns_db:
                db.close()
