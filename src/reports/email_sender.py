"""Email delivery integration for reports via SendGrid with graceful fallback."""

from __future__ import annotations

import logging
from typing import Any, Dict, Optional

from src.config.settings import settings

logger = logging.getLogger(__name__)


class EmailSender:
    """Delivers formatted reports to teachers and administrators."""

    def __init__(
        self,
        api_key: Optional[str] = None,
        email_from: Optional[str] = None,
    ) -> None:
        self.api_key = api_key if api_key is not None else settings.sendgrid_api_key
        self.email_from = email_from if email_from is not None else settings.email_from

    def send_session_report(
        self,
        to_email: str,
        session_id: int,
        html_content: str,
        subject: Optional[str] = None,
    ) -> Dict[str, Any]:
        """Send an HTML session report to a recipient.

        If SendGrid is not configured, logs a notice and returns a non-error
        status dict without raising an exception.
        """
        if not self.api_key or not self.api_key.strip():
            logger.info(
                "SendGrid API key not configured. Mocking email delivery to %s for session %s",
                to_email,
                session_id,
            )
            return {
                "sent": False,
                "reason": "no_email_config",
                "to_email": to_email,
                "session_id": session_id,
            }

        try:
            import sendgrid
            from sendgrid.helpers.mail import Content, Email, Mail, To
        except ImportError:
            logger.warning("SendGrid package is not installed.")
            return {
                "sent": False,
                "reason": "sendgrid_not_installed",
                "to_email": to_email,
                "session_id": session_id,
            }

        try:
            sg = sendgrid.SendGridAPIClient(api_key=self.api_key)
            mail = Mail(
                from_email=Email(self.email_from),
                to_emails=To(to_email),
                subject=subject or f"EngageIQ Lecture Report - Session #{session_id}",
                html_content=Content("text/html", html_content),
            )
            response = sg.send(mail)
            return {
                "sent": True,
                "status_code": response.status_code,
                "to_email": to_email,
                "session_id": session_id,
            }
        except Exception as exc:
            logger.error("Failed to send email via SendGrid: %s", str(exc))
            return {
                "sent": False,
                "reason": str(exc),
                "to_email": to_email,
                "session_id": session_id,
            }
