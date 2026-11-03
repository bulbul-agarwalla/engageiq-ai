"""Tests for session management and live telemetry ingestion routes."""

from datetime import datetime

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from src.api.main import app
from src.api.middleware.auth import create_access_token
from src.config.settings import UserRole
from src.database import get_db
from src.models import Base, Course
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


@pytest.fixture
def test_data(db):
    teacher = User(email="prof@nst.edu", role=UserRole.TEACHER, name="Prof. Sharma")
    student = User(email="student@nst.edu", role=UserRole.STUDENT, name="Rohan Gupta")
    db.add_all([teacher, student])
    db.commit()

    course = Course(name="Distributed AI Systems", code="CS401", teacher_id=teacher.id)
    db.add(course)
    db.commit()

    return {"teacher": teacher, "student": student, "course": course}


def test_create_session(client, test_data):
    token = create_access_token(data={"sub": test_data["teacher"].email, "role": "teacher"})
    res = client.post(
        "/api/sessions/",
        json={"course_id": test_data["course"].id},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert res.status_code == 201
    json_data = res.json()
    assert json_data["course_code"] == "CS401"
    assert json_data["status"] == "active"


def test_student_cannot_create_session(client, test_data):
    token = create_access_token(data={"sub": test_data["student"].email, "role": "student"})
    res = client.post(
        "/api/sessions/",
        json={"course_id": test_data["course"].id},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert res.status_code == 403


def test_get_active_session_and_details(client, db, test_data):
    session = SessionModel(
        course_id=test_data["course"].id, status="active", start_time=datetime.utcnow()
    )
    db.add(session)
    db.commit()

    token = create_access_token(data={"sub": test_data["teacher"].email, "role": "teacher"})
    res = client.get("/api/sessions/active", headers={"Authorization": f"Bearer {token}"})
    assert res.status_code == 200
    assert res.json()["active"] is True
    assert res.json()["session"]["id"] == session.id

    details_res = client.get(
        f"/api/sessions/{session.id}", headers={"Authorization": f"Bearer {token}"}
    )
    assert details_res.status_code == 200
    assert details_res.json()["course_code"] == "CS401"


def test_telemetry_ingest_and_live_stats(client, db, test_data):
    session = SessionModel(
        course_id=test_data["course"].id, status="active", start_time=datetime.utcnow()
    )
    db.add(session)
    db.commit()

    token = create_access_token(data={"sub": test_data["student"].email, "role": "student"})
    telemetry_payload = {
        "score": 84.5,
        "state": "engaged",
        "gaze": "center",
        "drowsiness": 0.05,
        "expression": "focused",
    }
    ingest_res = client.post(
        f"/api/sessions/{session.id}/telemetry",
        json=telemetry_payload,
        headers={"Authorization": f"Bearer {token}"},
    )
    assert ingest_res.status_code == 201
    assert ingest_res.json()["score"] == 84.5

    # Check live stats
    stats_res = client.get(
        f"/api/sessions/{session.id}/live-stats", headers={"Authorization": f"Bearer {token}"}
    )
    assert stats_res.status_code == 200
    stats = stats_res.json()
    assert stats["total_observations"] == 1
    assert stats["average_engagement"] == 84.5
    assert len(stats["recent_timeline"]) == 1


def test_end_session(client, db, test_data):
    session = SessionModel(
        course_id=test_data["course"].id, status="active", start_time=datetime.utcnow()
    )
    db.add(session)
    db.commit()

    token = create_access_token(data={"sub": test_data["teacher"].email, "role": "teacher"})
    res = client.post(
        f"/api/sessions/{session.id}/end", headers={"Authorization": f"Bearer {token}"}
    )
    assert res.status_code == 200
    assert res.json()["status"] == "completed"
