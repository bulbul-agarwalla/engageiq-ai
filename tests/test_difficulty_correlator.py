"""Tests for DifficultyCorrelator and analytics API routes."""

from datetime import datetime, timedelta

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from src.analytics.difficulty_correlator import DifficultyCorrelator
from src.api.main import app
from src.config.settings import EngagementState, UserRole
from src.database import get_db
from src.models import Base, Course, EngagementLog
from src.models import Session as SessionModel
from src.models import User

SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture(scope="function")
def db():
    Base.metadata.create_all(bind=engine)
    session = TestingSessionLocal()
    try:
        yield session
    finally:
        session.close()
        Base.metadata.drop_all(bind=engine)


@pytest.fixture(scope="function")
def client(db):
    def override_get_db():
        try:
            yield db
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()


def test_difficulty_correlator_empty():
    correlator = DifficultyCorrelator()
    assert correlator.correlate([]) == []


def test_difficulty_correlator_no_dips():
    correlator = DifficultyCorrelator()
    timeline = [(0.0, 75.0), (60.0, 80.0), (120.0, 65.0)]
    assert correlator.correlate(timeline, threshold=40.0) == []


def test_difficulty_correlator_identifies_dips():
    correlator = DifficultyCorrelator()
    timeline = [
        (0.0, 75.0),
        (60.0, 30.0),  # dip 1 start
        (120.0, 20.0),  # dip 1 end
        (180.0, 70.0),  # recovery
        (240.0, 35.0),  # dip 2 single
        (300.0, 85.0),  # recovery
    ]
    segments = correlator.correlate(timeline, threshold=40.0)
    assert len(segments) == 2

    seg1 = segments[0]
    assert seg1["start"] == 60.0
    assert seg1["end"] == 120.0
    assert seg1["mean_score"] == 25.0
    # ((40 - 25) / 40) * 100 = 37.5
    assert seg1["drop_pct"] == 37.5
    assert seg1["point_count"] == 2

    seg2 = segments[1]
    assert seg2["start"] == 240.0
    assert seg2["end"] == 240.0
    assert seg2["mean_score"] == 35.0
    assert seg2["point_count"] == 1


@pytest.fixture
def difficulty_fixture(db):
    teacher = User(name="Prof. Sprout", email="sprout@hogwarts.edu", role=UserRole.TEACHER)
    student = User(name="Neville", email="neville@hogwarts.edu", role=UserRole.STUDENT)
    db.add_all([teacher, student])
    db.commit()

    course = Course(name="Herbology", code="HRB101", teacher_id=teacher.id)
    db.add(course)
    db.commit()

    start_time = datetime(2026, 6, 1, 10, 0, 0)
    session = SessionModel(course_id=course.id, start_time=start_time, status="completed")
    db.add(session)
    db.commit()

    # Log with dip at 60s
    l1 = EngagementLog(
        session_id=session.id,
        user_id=student.id,
        timestamp=start_time,
        score=80.0,
        state=EngagementState.ENGAGED,
    )
    l2 = EngagementLog(
        session_id=session.id,
        user_id=student.id,
        timestamp=start_time + timedelta(seconds=60),
        score=25.0,
        state=EngagementState.CONFUSED,
    )
    l3 = EngagementLog(
        session_id=session.id,
        user_id=student.id,
        timestamp=start_time + timedelta(seconds=120),
        score=75.0,
        state=EngagementState.ENGAGED,
    )
    db.add_all([l1, l2, l3])
    db.commit()

    return {"course": course, "session": session}


def test_api_session_difficulty(client, difficulty_fixture):
    sess_id = difficulty_fixture["session"].id
    response = client.get(f"/api/analytics/sessions/{sess_id}/difficulty?threshold=40.0")
    assert response.status_code == 200
    res = response.json()
    assert res["session_id"] == sess_id
    assert res["total_dips"] == 1
    assert res["segments"][0]["mean_score"] == 25.0


def test_api_session_difficulty_not_found(client):
    response = client.get("/api/analytics/sessions/9999/difficulty")
    assert response.status_code == 404


def test_api_course_difficulty(client, difficulty_fixture):
    course_id = difficulty_fixture["course"].id
    response = client.get(f"/api/analytics/courses/{course_id}/difficulty?threshold=40.0")
    assert response.status_code == 200
    res = response.json()
    assert res["course_id"] == course_id
    assert res["total_flagged_sessions"] == 1


def test_api_course_difficulty_not_found(client):
    response = client.get("/api/analytics/courses/9999/difficulty")
    assert response.status_code == 404
