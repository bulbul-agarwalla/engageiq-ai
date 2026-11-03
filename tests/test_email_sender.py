"""Tests for EmailSender and report email delivery route."""

import sys
from datetime import datetime
from types import ModuleType
from unittest.mock import MagicMock

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from src.api.main import app
from src.config.settings import UserRole
from src.database import get_db
from src.models import Base, Course
from src.models import Session as SessionModel
from src.models import User
from src.reports.email_sender import EmailSender

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


def test_email_sender_no_config():
    sender = EmailSender(api_key="", email_from="")
    result = sender.send_session_report("teacher@example.com", 1, "<html>report</html>")
    assert result["sent"] is False
    assert result["reason"] == "no_email_config"
    assert result["to_email"] == "teacher@example.com"


def test_email_sender_mock_sendgrid_success():
    sender = EmailSender(api_key="SG.fake_key_12345", email_from="noreply@engageiq.ai")
    mock_response = MagicMock(status_code=202)

    # Mock sendgrid modules in sys.modules
    mock_sg_module = ModuleType("sendgrid")
    mock_sg_client_cls = MagicMock()
    mock_instance = MagicMock()
    mock_instance.send.return_value = mock_response
    mock_sg_client_cls.return_value = mock_instance
    mock_sg_module.SendGridAPIClient = mock_sg_client_cls

    mock_mail_module = ModuleType("sendgrid.helpers.mail")
    mock_mail_module.Mail = MagicMock()
    mock_mail_module.Email = MagicMock()
    mock_mail_module.To = MagicMock()
    mock_mail_module.Content = MagicMock()

    prev_sg = sys.modules.get("sendgrid")
    prev_mail = sys.modules.get("sendgrid.helpers.mail")
    try:
        sys.modules["sendgrid"] = mock_sg_module
        sys.modules["sendgrid.helpers.mail"] = mock_mail_module

        result = sender.send_session_report("teacher@example.com", 42, "<html>report</html>")
        assert result["sent"] is True
        assert result["status_code"] == 202
    finally:
        if prev_sg is not None:
            sys.modules["sendgrid"] = prev_sg
        else:
            sys.modules.pop("sendgrid", None)
        if prev_mail is not None:
            sys.modules["sendgrid.helpers.mail"] = prev_mail
        else:
            sys.modules.pop("sendgrid.helpers.mail", None)


def test_email_sender_mock_sendgrid_error():
    sender = EmailSender(api_key="SG.fake_key_12345", email_from="noreply@engageiq.ai")

    mock_sg_module = ModuleType("sendgrid")
    mock_sg_client_cls = MagicMock(side_effect=Exception("Connection refused"))
    mock_sg_module.SendGridAPIClient = mock_sg_client_cls

    mock_mail_module = ModuleType("sendgrid.helpers.mail")
    mock_mail_module.Mail = MagicMock()
    mock_mail_module.Email = MagicMock()
    mock_mail_module.To = MagicMock()
    mock_mail_module.Content = MagicMock()

    prev_sg = sys.modules.get("sendgrid")
    prev_mail = sys.modules.get("sendgrid.helpers.mail")
    try:
        sys.modules["sendgrid"] = mock_sg_module
        sys.modules["sendgrid.helpers.mail"] = mock_mail_module

        result = sender.send_session_report("teacher@example.com", 42, "<html>report</html>")
        assert result["sent"] is False
        assert "Connection refused" in result["reason"]
    finally:
        if prev_sg is not None:
            sys.modules["sendgrid"] = prev_sg
        else:
            sys.modules.pop("sendgrid", None)
        if prev_mail is not None:
            sys.modules["sendgrid.helpers.mail"] = prev_mail
        else:
            sys.modules.pop("sendgrid.helpers.mail", None)


def test_api_email_session_report_success(client, db):
    teacher = User(name="Prof. Lupin", email="lupin@hogwarts.edu", role=UserRole.TEACHER)
    db.add(teacher)
    db.commit()

    course = Course(name="Defense Against Dark Arts", code="DADA101", teacher_id=teacher.id)
    db.add(course)
    db.commit()

    session = SessionModel(
        course_id=course.id, start_time=datetime(2026, 6, 1, 10, 0), status="completed"
    )
    db.add(session)
    db.commit()

    response = client.post(
        f"/api/reports/sessions/{session.id}/email",
        json={"to_email": "lupin@hogwarts.edu"},
    )
    assert response.status_code == 200
    res = response.json()
    assert res["session_id"] == session.id
    assert res["to_email"] == "lupin@hogwarts.edu"
    assert "delivery" in res


def test_api_email_session_report_not_found(client):
    response = client.post(
        "/api/reports/sessions/9999/email",
        json={"to_email": "lupin@hogwarts.edu"},
    )
    assert response.status_code == 404
