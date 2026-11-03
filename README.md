# EngageIQ AI — Intelligent Classroom Telemetry & Pedagogical Agent Platform

[![CI](https://github.com/bulbul-agarwalla/engageiq-ai/actions/workflows/ci.yml/badge.svg)](https://github.com/bulbul-agarwalla/engageiq-ai/actions/workflows/ci.yml)
[![Tests](https://img.shields.io/badge/tests-248%20passed-success)](https://github.com/bulbul-agarwalla/engageiq-ai)
[![Python](https://img.shields.io/badge/python-3.10%20%7C%203.12-blue)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/backend-FastAPI-009688)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/frontend-React%2018%20%2B%20Vite-61dafb)](https://react.dev/)
[![LangGraph](https://img.shields.io/badge/agents-LangGraph%20%2B%20Groq%20LLaMA--3.3-orange)](https://www.langchain.com/)

**EngageIQ AI** is an intelligent, privacy-preserving classroom engagement monitoring and pedagogical intervention platform. It bridges the gap in remote, hybrid, and modern classrooms by analyzing webcam computer vision telemetry in real time, calculating multi-signal engagement scores, personalizing intelligent student nudges, and synthesizing AI-driven teaching recommendations for educators.

---

## Architecture

```
                                  [ Webcam Input ]
                                         │
                   ┌─────────────────────┴─────────────────────┐
                   ▼                                           ▼
      [ MediaPipe 468 Landmarks ]                     [ YOLOv8n Object Detection ]
     (Head Pose, Gaze, EAR, MAR)                       (Phone / Distraction Events)
                   │                                           │
                   └─────────────────────┬─────────────────────┘
                                         ▼
                          [ Multi-Signal Engagement Scorer ]
                                         │
             ┌───────────────────────────┴───────────────────────────┐
             ▼                                                       ▼
   [ LangGraph Nudge Agent ]                              [ WebSocket Live Stream ]
  (Cooldown, Thresholding, &                              (Real-time State Telemetry)
    Effectiveness Tracking)                                          │
                                                                     ▼
                                                         [ PostgreSQL Database ]
                                                                     │
                         ┌───────────────────────────────────────────┴───────────────────────────────────────────┐
                         ▼                                                                                       ▼
            [ Instructor Analytics & Reports ]                                                      [ Student Focus Portal ]
   • Session HTML reports with Chart.js                                                    • Focus streaks & trends
   • Weekly trend regressions & anomaly detection                                          • Nudge sensitivity settings
   • Difficulty Correlator (dips vs timestamps)                                            • Anonymized privacy mode
   • Groq LLaMA-3.3 Pedagogical Intervention Agent
   • Data Portability Exports (CSV / JSON)
```

---

## Key Capabilities

1. **Edge Computer Vision & Telemetry**:
   - 468-point facial mesh mapping (pitch, yaw, roll head-pose orientation).
   - Gaze classification via iris coordinate ratios and head angle thresholds.
   - Fatigue and yawn tracking via Eye Aspect Ratio (EAR) and Mouth Aspect Ratio (MAR).
   - Emotional valence / expression state classification (Engaged, Confused, Bored, Neutral).
2. **Agentic Intervention Engine (LangGraph & Groq LLaMA-3.3)**:
   - Evaluates sustained drops, fatigue trends, and student sensitivity settings.
   - Recommends dynamic pedagogical interventions (e.g. interactive polls, stretch breaks, concept reviews) with confidence scores.
   - Graceful offline fallback: continues providing rule-based recommendations even without LLM credentials.
3. **Strict Privacy by Design**:
   - Real student identifiers are never stored in reports or export payloads; student IDs are deterministically hashed via SHA-256 (`anon_<hash[:8]>`).
   - Local-only processing modes for students.
4. **Data Portability & NAAC Accreditation Compliance**:
   - Streamed exports in both CSV and JSON formats with date-range and session filters.
5. **Modern Responsive React Dashboard**:
   - Single-page application built with React 18, Vite, React Router v6, and Recharts.
   - Dedicated views for Students, Teachers, Course Deep Dives, and Printable Lecture Reports.

---

## Tech Stack

| Domain | Technologies |
|---|---|
| **Backend & WebSockets** | FastAPI, Uvicorn, WebSockets, Pydantic v2, Python 3.10/3.12 |
| **Agent Orchestration & LLM** | LangGraph, LangChain, Groq API (LLaMA-3.3-70B), Google Gemini |
| **Computer Vision** | MediaPipe, OpenCV, Ultralytics YOLOv8, NumPy, SciPy |
| **Frontend** | React 18, Vite, React Router DOM, Recharts |
| **Database & ORM** | PostgreSQL 16, SQLAlchemy 2.0, Alembic migrations |
| **Reports & Export** | Jinja2, Chart.js, SendGrid API |
| **Testing & CI/CD** | Pytest, Flake8, Black, Isort, GitHub Actions, Docker |

---

## Getting Started

### 1. Prerequisites
- Python 3.10+
- Node.js 18+
- PostgreSQL (or local SQLite for dev/testing)

### 2. Backend Setup
```bash
# Clone the repository
git clone https://github.com/bulbul-agarwalla/engageiq-ai.git
cd engageiq-ai

# Create and activate virtual environment
python3 -m venv .venv
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Configure environment variables
cp .env.example .env

# Run database migrations
alembic upgrade head

# Start FastAPI server
uvicorn src.api.main:app --reload --port 8000
```
API Documentation will be live at `http://localhost:8000/docs`.

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
Open `http://localhost:5173` in your browser.

### 4. Running with Docker Compose
```bash
docker compose up -d --build
```

---

## API Summary

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/v1/auth/token` | Exchange OAuth or demo credentials for JWT token |
| `GET` | `/api/dashboard/student` | Student focus streak, engagement trends, and session history |
| `GET` | `/api/dashboard/teacher` | Class average, at-risk count, and course summaries |
| `GET` | `/api/dashboard/teacher/courses/{id}/overview` | Course breakdown with anonymized at-risk student flags |
| `GET` | `/api/reports/sessions/{id}` | Self-contained, printable HTML session report |
| `GET` | `/api/reports/sessions/{id}/data` | Structured JSON report telemetry |
| `GET` | `/api/reports/sessions/{id}/interventions` | AI pedagogical intervention recommendations |
| `GET` | `/api/reports/courses/{id}/weekly` | Weekly trend analysis and anomaly detection |
| `GET` | `/api/analytics/courses/{id}/difficulty` | Pinpoint difficult lecture topics via engagement dips |
| `POST` | `/api/reports/sessions/{id}/email` | Send report via SendGrid |
| `GET` | `/api/export/sessions/{id}` | Export session telemetry (CSV / JSON) |
| `GET` | `/api/export/courses/{id}` | Export course telemetry with date range filtering |
| `WS` | `/ws/engagement/{session_id}` | Real-time WebSocket engagement feed |

---

## Testing & Quality Assurance

The codebase includes an extensive automated test suite covering all CV pipelines, agent state machines, reporting engines, authentication, and API endpoints:

```bash
# Run all tests
pytest tests/ -v

# Run with test coverage
pytest tests/ --cov=src --cov-report=term-missing
```

**Status**: 248 passed, 0 failed.

---

## Documentation

- [Deployment Guide (Railway, Render, Vercel, Docker)](docs/deployment_guide.md)
- [Demonstration & Recruiter Script](docs/demo_script.md)

---

## License

MIT License. Designed and maintained by [Bulbul Agarwalla](https://github.com/bulbul-agarwalla).
