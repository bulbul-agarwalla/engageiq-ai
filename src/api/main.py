"""FastAPI application entry point."""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from src.api import websocket
from src.api.routes import (
    analytics,
    auth,
    courses,
    dashboard,
    export,
    nudge,
    preferences,
    reports,
    sessions,
    users,
)
from src.config.settings import settings

app = FastAPI(
    title="EngageIQ API",
    description="Backend for the EngageIQ intelligent classroom application",
    version="0.1.0",
)

# Set up CORS
_allowed_origins = [o.strip() for o in settings.frontend_url.split(",") if o.strip()]
for _local in ["http://localhost:5173", "http://localhost:3000"]:
    if _local not in _allowed_origins:
        _allowed_origins.append(_local)

app.add_middleware(
    CORSMiddleware,
    allow_origins=_allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/api/v1")
app.include_router(users.router, prefix="/api/v1")
app.include_router(courses.router, prefix="/api/v1")
app.include_router(nudge.router, prefix="/api")
app.include_router(preferences.router, prefix="/api")
app.include_router(export.router, prefix="/api")
app.include_router(reports.router, prefix="/api")
app.include_router(analytics.router, prefix="/api")
app.include_router(dashboard.router, prefix="/api")
app.include_router(sessions.router, prefix="/api")


@app.get("/health")
async def health_check():
    """Basic health check endpoint."""
    return {"status": "healthy", "version": "0.1.0"}


# TODO: Include route modules
# from src.api.routes import users, courses, sessions, engagement, reports
app.include_router(websocket.router)
