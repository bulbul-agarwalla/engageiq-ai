# EngageIQ AI — Intelligent Classroom Telemetry & Pedagogical Agent Platform

[![CI](https://github.com/bulbul-agarwalla/engageiq-ai/actions/workflows/ci.yml/badge.svg)](https://github.com/bulbul-agarwalla/engageiq-ai/actions/workflows/ci.yml)
[![Tests](https://img.shields.io/badge/tests-249%20passed-success)](https://github.com/bulbul-agarwalla/engageiq-ai)
[![Python](https://img.shields.io/badge/python-3.10%20%7C%203.12-blue)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/backend-FastAPI-009688)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/frontend-React%2018%20%2B%20Vite-61dafb)](https://react.dev/)
[![Deployment](https://img.shields.io/badge/deployment-Vercel%20%2B%20Render-black)](DEPLOYMENT_GUIDE.md)

**EngageIQ AI** is an intelligent, privacy-preserving classroom engagement monitoring and pedagogical intervention platform. It bridges the gap in remote, hybrid, and modern classrooms by analyzing webcam computer vision telemetry in real time, calculating multi-signal engagement scores, personalizing intelligent student nudges, and synthesizing AI-driven teaching recommendations for educators.

---

## Architecture

```
                                  [ Webcam Input ]
                                         │
                   ┌─────────────────────┴─────────────────────┐
                   ▼                                           ▼
      [ MediaPipe 478 Landmarks ]                     [ YOLOv8n Object Detection ]
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
   • Live Lecture Room with Real-Time HUD                                                  • Focus streaks & trajectories
   • Session HTML reports with Recharts                                                    • Nudge sensitivity controls
   • Weekly trend regressions & anomaly detection                                          • Quiet hours scheduling
   • Difficulty Correlator (dips vs timestamps)                                            • Anonymized privacy mode
   • Groq LLaMA-3.3 Pedagogical Intervention Agent
   • Data Portability Exports (CSV / JSON)
```

---

## Key Capabilities

1. **Edge Computer Vision & Telemetry**:
   * Tracks **478 MediaPipe facial landmarks** at 15 FPS using Apple Silicon Metal & XNNPACK acceleration.
   * Computes **Eye Aspect Ratio (EAR)** for microsleep and drowsiness detection (EAR < 0.22).
   * Computes **Mouth Aspect Ratio (MAR)** for yawn detection (MAR > 0.35).
   * Calculates iris offset vectors and 3D head pose orientation angles.

2. **Pedagogical Intervention Agent (`src/agents/intervention_agent.py`)**:
   * Uses **Groq Cloud API** running `llama-3.3-70b-versatile` to analyze engagement dip patterns and recommend actionable classroom pacing changes, micro-breaks, or check-in questions.
   * Includes deterministic rule-based fallbacks for air-gapped or offline deployment.

3. **Content Difficulty Correlator (`src/analytics/difficulty_correlator.py`)**:
   * Flags lecture intervals where average engagement drops below 50% for 3+ consecutive minutes, identifying challenging concepts that require follow-up.

4. **Privacy-Preserving Telemetry & Data Portability**:
   * Strictly zero video storage — frames are processed in-memory transiently.
   * Student IDs are cryptographically hashed using SHA-256 (`anon_<sha256>`) in all exported CSV and JSON files for full FERPA compliance.

---

## Project Structure

```
engageiq-ai/
├── src/
│   ├── agents/            # LangGraph pedagogical & intervention agents
│   ├── analytics/         # Difficulty correlator, trend analysis, anomaly detection
│   ├── api/
│   │   ├── middleware/    # JWT auth & role validation (Teacher / Student)
│   │   ├── routes/        # Auth, Dashboard, Sessions, Reports, Export, Preferences
│   │   └── main.py        # FastAPI application entry point & CORS configuration
│   ├── config/            # Scoring weights, course types, application settings
│   ├── database.py        # SQLAlchemy database engine & session dependency
│   ├── detection/         # MediaPipe face mesh, EAR, MAR, head pose, iris gaze
│   ├── models/            # User, Course, Session, EngagementLog, Nudge, Preferences
│   ├── reports/           # HTML/JSON session reports, weekly reports, email sender
│   └── scoring/           # Multi-signal composite engagement scoring algorithm
├── frontend/              # Modern React 18 + Vite Single Page Application
│   ├── src/
│   │   ├── components/    # Navigation, MetricCard, EngagementChart, Layout
│   │   ├── contexts/      # AuthContext with token persistence & role routing
│   │   ├── pages/         # LandingPage, LoginPage, TeacherDashboard, LiveSessionPage,
│   │   │                  # CourseDetailPage, SessionReportPage, StudentDashboard, ExportPage
│   │   └── styles/        # Dark/Light SaaS design system (globals.css)
│   └── package.json
├── scripts/
│   ├── live_demo.py       # High-precision real-time webcam MediaPipe demo
│   ├── seed.py            # Basic database seeder
│   └── seed_rich_demo.py  # Rich multi-session lecture telemetry simulator
├── tests/                 # 249 automated unit & integration tests
├── DEPLOYMENT_GUIDE.md    # Complete cloud deployment guide (Vercel + Render + Neon)
└── README.md
```

---

## Quick Start (Local Setup)

### 1. Prerequisites
* Python 3.10+ (or 3.12)
* Node.js 18+ and npm
* PostgreSQL 14+ running locally

### 2. Backend Setup
```bash
# Clone personal repository
git clone https://github.com/bulbul-agarwalla/engageiq-ai.git
cd engageiq-ai

# Install Python dependencies
pip install -r requirements-ci.txt

# Configure environment
cp .env.example .env

# Apply database migrations
alembic upgrade head

# Seed realistic demo telemetry
python scripts/seed_rich_demo.py

# Start FastAPI backend
uvicorn src.api.main:app --host 0.0.0.0 --port 8000
```
Backend health check: `http://localhost:8000/health`  
Interactive Swagger docs: `http://localhost:8000/docs`

### 3. Frontend Setup
In a new terminal window:
```bash
cd engageiq-ai/frontend

# Install dependencies
npm install

# Start Vite dev server
npm run dev
```
Open `http://localhost:5173` in your browser.

---

## Verified Demo Personas

On `http://localhost:5173/login`, choose either 1-click persona:
* **Instructor Experience**: `mock_teacher@engageiq.ai` (Dr. Angela Smith) -> Accesses course overviews, live lecture room, 40-minute session timelines, and data export.
* **Student Experience**: `mock_student@engageiq.ai` (Alex Rivera) -> Accesses individual focus streak, historical lecture trajectory, and nudge sensitivity preferences.

---

## Running the Real-Time Computer Vision Pipeline

Run the hardware-accelerated MediaPipe facial landmark engine on your webcam:
```bash
cd engageiq-ai
python scripts/live_demo.py
```
* **Features**: Live 478 face mesh points, eye aspect ratio (EAR), mouth aspect ratio (MAR), iris gaze focus, head pose displacement, and live engagement score HUD updating at 15 FPS.
* Press `Q` to quit.

---

## Running Tests & Code Quality

```bash
# Run complete test suite (249 passed)
pytest tests/ -q

# Check code formatting & linting
black --check --line-length 100 src/ tests/
isort --check src/ tests/
flake8 src/ tests/

# Test frontend build
cd frontend && npm run build
```

---

## Cloud Deployment

For step-by-step instructions to deploy EngageIQ AI to **Vercel** (Frontend), **Render** (Backend), and **Neon** (PostgreSQL), consult the [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md).

---

## License

This project is licensed under the MIT License.
