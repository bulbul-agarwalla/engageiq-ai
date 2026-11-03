"""Authentication routes."""

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session

from src.api.middleware.auth import create_access_token
from src.database import get_db
from src.models.user import User

router = APIRouter(prefix="/auth", tags=["auth"])


class GoogleAuthRequest(BaseModel):
    credential: str


@router.post("/token")
def login_for_access_token(request: GoogleAuthRequest, db: Session = Depends(get_db)):
    """
    Exchange Google OAuth credential for JWT token.
    For development, if credential starts with 'mock_', bypass Google verification.
    """
    credential = request.credential

    if credential.startswith("mock_"):
        clean_email = credential[5:]
        raw_email = credential
    else:
        # In a real app, verify the Google JWT token here using google-auth library
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only mock credentials supported in dev mode",
        )

    # Check if a user with either the clean email or the mock_ prefix already exists
    user = db.query(User).filter(User.email.in_([clean_email, raw_email])).first()

    if not user:
        # Auto-provision user with role inference
        role = (
            "teacher"
            if (
                "teacher" in raw_email.lower()
                or "prof" in raw_email.lower()
                or "smith" in raw_email.lower()
            )
            else "student"
        )
        name = "Professor Demo" if role == "teacher" else "Student Demo"
        user = User(email=raw_email, name=name, role=role)
        db.add(user)
        db.commit()
        db.refresh(user)

    access_token = create_access_token(data={"sub": user.email, "role": user.role})
    return {"access_token": access_token, "token_type": "bearer"}
