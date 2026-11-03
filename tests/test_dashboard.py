"""Tests for student and teacher dashboard API endpoints."""

from datetime import datetime

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from src.api.main import app
from src.api.middleware.auth import create_access_token
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


@pytest.fixture
def dashboard_fixture(db):
    teacher1 = User(name="Prof. McGonagall", email="mcgonagall@hogwarts.edu", role=UserRole.TEACHER)
    teacher2 = User(name="Prof. Snape", email="snape@hogwarts.edu", role=UserRole.TEACHER)
    student1 = User(name="Harry Potter", email="harry@hogwarts.edu", role=UserRole.STUDENT)
    student2 = User(name="Ron Weasley", email="ron@hogwarts.edu", role=UserRole.STUDENT)
    db.add_all([teacher1, teacher2, student1, student2])
    db.commit()

    course1 = Course(name="Transfiguration", code="TRANS101", teacher_id=teacher1.id)
    course2 = Course(name="Potions", code="POT101", teacher_id=teacher2.id)
    db.add_all([course1, course2])
    db.commit()

    s1 = SessionModel(
        course_id=course1.id, start_time=datetime(2026, 6, 1, 10, 0), status="completed"
    )
    s2 = SessionModel(
        course_id=course1.id, start_time=datetime(2026, 6, 2, 10, 0), status="completed"
    )
    db.add_all([s1, s2])
    db.commit()

    # Harry scores well: 85 and 90 (focus streak = 2)
    l1 = EngagementLog(
        session_id=s1.id, user_id=student1.id, score=85.0, state=EngagementState.ENGAGED
    )
    l2 = EngagementLog(
        session_id=s2.id, user_id=student1.id, score=90.0, state=EngagementState.ENGAGED
    )
    # Ron struggles: 30 and 40 (at-risk)
    l3 = EngagementLog(
        session_id=s1.id,
        user_id=student2.id,
        score=30.0,
        state=EngagementState.DISTRACTED,
    )
    l4 = EngagementLog(
        session_id=s2.id, user_id=student2.id, score=40.0, state=EngagementState.DROWSY
    )
    db.add_all([l1, l2, l3, l4])
    db.commit()

    return {
        "teacher1": teacher1,
        "teacher2": teacher2,
        "student1": student1,
        "student2": student2,
        "course1": course1,
        "course2": course2,
    }


def test_student_dashboard_unauthenticated(client):
    response = client.get("/api/dashboard/student")
    assert response.status_code == 401


def test_student_dashboard_authenticated(client, dashboard_fixture):
    student = dashboard_fixture["student1"]
    token = create_access_token({"sub": student.email})
    headers = {"Authorization": f"Bearer {token}"}

    response = client.get("/api/dashboard/student", headers=headers)
    assert response.status_code == 200
    res = response.json()
    assert res["user_name"] == "Harry Potter"
    assert res["overall_average"] == 87.5
    assert res["total_sessions"] == 2
    assert res["focus_streak"] == 2
    assert res["trend"] == "improving"
    assert len(res["recent_sessions"]) == 2


def test_teacher_dashboard_role_forbidden_for_student(client, dashboard_fixture):
    student = dashboard_fixture["student1"]
    token = create_access_token({"sub": student.email})
    headers = {"Authorization": f"Bearer {token}"}

    response = client.get("/api/dashboard/teacher", headers=headers)
    assert response.status_code == 403


def test_teacher_dashboard_success(client, dashboard_fixture):
    teacher = dashboard_fixture["teacher1"]
    token = create_access_token({"sub": teacher.email})
    headers = {"Authorization": f"Bearer {token}"}

    response = client.get("/api/dashboard/teacher", headers=headers)
    assert response.status_code == 200
    res = response.json()
    assert res["teacher_name"] == "Prof. McGonagall"
    assert res["total_courses"] == 1
    assert res["total_sessions"] == 2
    assert len(res["courses"]) == 1
    # Ron is at risk (30 and 40 both < 50)
    assert res["total_at_risk"] >= 1


def test_teacher_course_overview_success(client, dashboard_fixture):
    teacher = dashboard_fixture["teacher1"]
    course = dashboard_fixture["course1"]
    token = create_access_token({"sub": teacher.email})
    headers = {"Authorization": f"Bearer {token}"}

    response = client.get(f"/api/dashboard/teacher/courses/{course.id}/overview", headers=headers)
    assert response.status_code == 200
    res = response.json()
    assert res["course_id"] == course.id
    assert res["course_name"] == "Transfiguration"
    assert len(res["sessions"]) == 2
    assert len(res["state_distribution"]) > 0

    # Privacy verification: check at-risk student ID is anonymized
    assert len(res["at_risk_students"]) >= 1
    at_risk = res["at_risk_students"][0]
    assert at_risk["anonymized_student_id"].startswith("anon_")
    assert "Harry" not in at_risk["anonymized_student_id"]
    assert "Ron" not in at_risk["anonymized_student_id"]


def test_teacher_course_overview_forbidden_other_teacher(client, dashboard_fixture):
    other_teacher = dashboard_fixture["teacher2"]
    course = dashboard_fixture["course1"]  # belongs to teacher1
    token = create_access_token({"sub": other_teacher.email})
    headers = {"Authorization": f"Bearer {token}"}

    response = client.get(f"/api/dashboard/teacher/courses/{course.id}/overview", headers=headers)
    assert response.status_code == 403


def test_teacher_course_overview_not_found(client, dashboard_fixture):
    teacher = dashboard_fixture["teacher1"]
    token = create_access_token({"sub": teacher.email})
    headers = {"Authorization": f"Bearer {token}"}

    response = client.get("/api/dashboard/teacher/courses/9999/overview", headers=headers)
    assert response.status_code == 404
