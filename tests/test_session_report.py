"""Tests for session engagement reports and API endpoints."""

from datetime import datetime, timedelta

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from src.api.main import app
from src.config.settings import EngagementState, UserRole
from src.database import get_db
from src.models import Base, Course, EngagementLog
from src.models import Session as SessionModel
from src.models import User
from src.reports.session_report import SessionReportGenerator

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


@pytest.fixture
def seeded_data(db):
    """Seed sample course, session, and logs."""
    teacher = User(name="Prof. McGonagall", email="mcgonagall@hogwarts.edu", role=UserRole.TEACHER)
    student1 = User(name="Harry Potter", email="harry@hogwarts.edu", role=UserRole.STUDENT)
    student2 = User(name="Hermione Granger", email="hermione@hogwarts.edu", role=UserRole.STUDENT)
    db.add_all([teacher, student1, student2])
    db.commit()

    course = Course(name="Transfiguration", code="TRANS101", teacher_id=teacher.id)
    db.add(course)
    db.commit()

    start_time = datetime(2026, 6, 1, 10, 0, 0)
    session = SessionModel(course_id=course.id, start_time=start_time, status="completed")
    db.add(session)
    db.commit()

    # Add logs across 2 minutes for both students
    log1 = EngagementLog(
        session_id=session.id,
        user_id=student1.id,
        timestamp=start_time + timedelta(minutes=1),
        score=75.0,
        state=EngagementState.ENGAGED,
    )
    log2 = EngagementLog(
        session_id=session.id,
        user_id=student2.id,
        timestamp=start_time + timedelta(minutes=1),
        score=95.0,
        state=EngagementState.ENGAGED,
    )
    log3 = EngagementLog(
        session_id=session.id,
        user_id=student1.id,
        timestamp=start_time + timedelta(minutes=2),
        score=35.0,
        state=EngagementState.DISTRACTED,
    )
    log4 = EngagementLog(
        session_id=session.id,
        user_id=student2.id,
        timestamp=start_time + timedelta(minutes=2),
        score=85.0,
        state=EngagementState.PASSIVE,
    )
    db.add_all([log1, log2, log3, log4])
    db.commit()

    return {"session": session, "course": course, "students": [student1, student2]}


def test_session_report_generator_build_data(db, seeded_data):
    session = seeded_data["session"]
    gen = SessionReportGenerator(db=db)
    data = gen.build_report_data(session.id)

    assert data["session"]["id"] == session.id
    assert data["session"]["course_name"] == "Transfiguration"
    assert data["session"]["student_count"] == 2
    assert data["session"]["log_count"] == 4
    # (75 + 95 + 35 + 85) / 4 = 72.5
    assert data["class_average"] == 72.5
    assert len(data["timeline"]) == 2
    assert len(data["student_comparison"]) == 2
    assert any(c["label"].startswith("Student ") for c in data["student_comparison"])


def test_session_report_generator_html(db, seeded_data):
    session = seeded_data["session"]
    gen = SessionReportGenerator(db=db)
    html = gen.generate(session.id)

    assert "<!doctype html>" in html
    assert "Session engagement report" in html
    assert "Transfiguration" in html
    assert "72.5%" in html


def test_session_report_not_found(db):
    gen = SessionReportGenerator(db=db)
    with pytest.raises(ValueError, match="Session 9999 was not found"):
        gen.build_report_data(9999)


def test_api_session_report_html(client, seeded_data):
    session_id = seeded_data["session"].id
    response = client.get(f"/api/reports/sessions/{session_id}")
    assert response.status_code == 200
    assert "text/html" in response.headers["content-type"]
    assert "Transfiguration" in response.text


def test_api_session_report_html_not_found(client):
    response = client.get("/api/reports/sessions/9999")
    assert response.status_code == 404


def test_api_session_report_data_json(client, seeded_data):
    session_id = seeded_data["session"].id
    response = client.get(f"/api/reports/sessions/{session_id}/data")
    assert response.status_code == 200
    data = response.json()
    assert data["session"]["id"] == session_id
    assert data["class_average"] == 72.5


def test_api_session_report_data_not_found(client):
    response = client.get("/api/reports/sessions/9999/data")
    assert response.status_code == 404
