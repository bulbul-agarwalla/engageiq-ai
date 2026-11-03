"""Tests for weekly trend reports and TrendAnalyzer."""

from datetime import datetime

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from src.analytics.trend_analyzer import TrendAnalyzer
from src.api.main import app
from src.config.settings import EngagementState, UserRole
from src.database import get_db
from src.models import Base, Course, EngagementLog
from src.models import Session as SessionModel
from src.models import User
from src.reports.weekly_report import WeeklyReportGenerator

SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture(scope="function")
def db():
    """Create a clean in-memory database."""
    Base.metadata.create_all(bind=engine)
    session = TestingSessionLocal()
    try:
        yield session
    finally:
        session.close()
        Base.metadata.drop_all(bind=engine)


@pytest.fixture(scope="function")
def client(db):
    """Test client with db override."""

    def override_get_db():
        try:
            yield db
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()


def test_trend_analyzer_compute_trend():
    analyzer = TrendAnalyzer()
    assert analyzer.compute_trend([]) == 0.0
    assert analyzer.compute_trend([50.0]) == 0.0
    # Perfect line with slope 5: [50, 55, 60, 65]
    assert analyzer.compute_trend([50.0, 55.0, 60.0, 65.0]) == 5.0
    # Negative trend
    assert analyzer.compute_trend([80.0, 70.0, 60.0]) == -10.0


def test_trend_analyzer_detect_anomalies():
    analyzer = TrendAnalyzer()
    assert analyzer.detect_anomalies([50.0, 50.0]) == []
    # All equal: std dev is 0
    assert analyzer.detect_anomalies([50.0, 50.0, 50.0]) == []
    # 5th item is an outlier (10.0 while others are ~80)
    scores = [80.0, 81.0, 79.0, 80.0, 80.0, 10.0, 82.0]
    anomalies = analyzer.detect_anomalies(scores, z_threshold=2.0)
    assert 5 in anomalies


@pytest.fixture
def sample_course_data(db):
    teacher = User(name="Prof. Snape", email="snape@hogwarts.edu", role=UserRole.TEACHER)
    student = User(name="Harry", email="harry@hogwarts.edu", role=UserRole.STUDENT)
    db.add_all([teacher, student])
    db.commit()

    course = Course(name="Potions", code="POT101", teacher_id=teacher.id)
    db.add(course)
    db.commit()

    # 2026-W22 starts on Monday 2026-06-01
    s1 = SessionModel(
        course_id=course.id, start_time=datetime(2026, 6, 1, 10, 0), status="completed"
    )
    s2 = SessionModel(
        course_id=course.id, start_time=datetime(2026, 6, 3, 10, 0), status="completed"
    )
    db.add_all([s1, s2])
    db.commit()

    log1 = EngagementLog(
        session_id=s1.id, user_id=student.id, score=60.0, state=EngagementState.ENGAGED
    )
    log2 = EngagementLog(
        session_id=s2.id, user_id=student.id, score=80.0, state=EngagementState.ENGAGED
    )
    db.add_all([log1, log2])
    db.commit()

    return {"course": course, "sessions": [s1, s2]}


def test_weekly_report_generator_build(db, sample_course_data):
    course = sample_course_data["course"]
    generator = WeeklyReportGenerator(db=db)
    data = generator.build_report_data(course.id, "2026-W22")

    assert data["course_id"] == course.id
    assert data["session_count"] == 2
    assert data["week_average"] == 70.0
    assert data["trend_slope"] == 20.0
    assert len(data["prior_weeks"]) == 4


def test_weekly_report_invalid_week(db, sample_course_data):
    generator = WeeklyReportGenerator(db=db)
    with pytest.raises(ValueError, match="Invalid week format"):
        generator.build_report_data(sample_course_data["course"].id, "invalid-week")


def test_api_weekly_report_success(client, sample_course_data):
    course_id = sample_course_data["course"].id
    response = client.get(f"/api/reports/courses/{course_id}/weekly?week=2026-W22")
    assert response.status_code == 200
    res = response.json()
    assert res["course_name"] == "Potions"
    assert res["week_average"] == 70.0


def test_api_weekly_report_invalid_week(client, sample_course_data):
    course_id = sample_course_data["course"].id
    response = client.get(f"/api/reports/courses/{course_id}/weekly?week=badweek")
    assert response.status_code == 400


def test_api_weekly_report_course_not_found(client):
    response = client.get("/api/reports/courses/9999/weekly?week=2026-W22")
    assert response.status_code == 404
