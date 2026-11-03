"""Tests for InterventionAgent and intervention routes."""

from datetime import datetime
from unittest.mock import MagicMock, patch

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from src.agents.intervention_agent import InterventionAgent
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


def test_intervention_agent_rule_fallback_minimum():
    agent = InterventionAgent(groq_api_key="")
    suggestions = agent.suggest({})
    assert len(suggestions) >= 3
    for s in suggestions:
        assert "type" in s
        assert "message" in s
        assert "priority" in s
        assert "confidence" in s


def test_intervention_agent_low_average():
    agent = InterventionAgent(groq_api_key="")
    data = {
        "class_average": 35.0,
        "state_distribution": [{"state": "distracted", "count": 20}],
    }
    suggestions = agent.suggest(data)
    types = [s["type"] for s in suggestions]
    assert "review" in types
    assert "activity" in types


def test_intervention_agent_drowsiness():
    agent = InterventionAgent(groq_api_key="")
    data = {
        "class_average": 75.0,
        "state_distribution": [
            {"state": "drowsy", "count": 30},
            {"state": "engaged", "count": 70},
        ],
    }
    suggestions = agent.suggest(data)
    types = [s["type"] for s in suggestions]
    assert "break" in types


def test_intervention_agent_llm_mock():
    mock_llm_json = (
        '[{"type": "activity", "message": "Quick live quiz", "priority": "high", "confidence": 0.95},'
        '{"type": "pacing", "message": "Slow down math derivation", "priority": "medium", "confidence": 0.88},'
        '{"type": "break", "message": "Take a 2 min water break", "priority": "low", "confidence": 0.70}]'
    )
    with patch("langchain_groq.ChatGroq") as mock_groq_cls:
        mock_instance = MagicMock()
        mock_instance.invoke.return_value = MagicMock(content=mock_llm_json)
        mock_groq_cls.return_value = mock_instance

        agent = InterventionAgent(groq_api_key="gsk_mock_key")
        suggestions = agent.suggest({"class_average": 60.0})

        assert len(suggestions) == 3
        assert suggestions[0]["message"] == "Quick live quiz"


def test_intervention_agent_llm_fallback_on_error():
    with patch("langchain_groq.ChatGroq", side_effect=Exception("API connection timeout")):
        agent = InterventionAgent(groq_api_key="gsk_mock_key")
        suggestions = agent.suggest({"class_average": 40.0})
        # Should gracefully fall back to rule engine
        assert len(suggestions) >= 3
        assert any(s["type"] == "review" for s in suggestions)


def test_api_session_interventions(client, db):
    teacher = User(name="Prof. Flitwick", email="flitwick@hogwarts.edu", role=UserRole.TEACHER)
    student = User(name="Ron", email="ron@hogwarts.edu", role=UserRole.STUDENT)
    db.add_all([teacher, student])
    db.commit()

    course = Course(name="Charms", code="CHM101", teacher_id=teacher.id)
    db.add(course)
    db.commit()

    session = SessionModel(
        course_id=course.id, start_time=datetime(2026, 6, 1, 9, 0), status="completed"
    )
    db.add(session)
    db.commit()

    log = EngagementLog(
        session_id=session.id,
        user_id=student.id,
        score=45.0,
        state=EngagementState.DISTRACTED,
    )
    db.add(log)
    db.commit()

    response = client.get(f"/api/reports/sessions/{session.id}/interventions")
    assert response.status_code == 200
    res = response.json()
    assert res["session_id"] == session.id
    assert res["count"] >= 3
    assert len(res["suggestions"]) >= 3


def test_api_session_interventions_not_found(client):
    response = client.get("/api/reports/sessions/9999/interventions")
    assert response.status_code == 404
