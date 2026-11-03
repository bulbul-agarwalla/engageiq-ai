# EngageIQ AI — Demonstration & Portfolio Review Script

A structured walkthrough demonstrating the key features of EngageIQ AI for interviews, portfolio showcases, and technical recruiters.

---

## 1. Introduction & Problem Statement (1 min)

> *"In digital and hybrid classrooms, teachers cannot see when students become distracted, fatigued, or confused. EngageIQ AI solves this by combining local computer vision signals (head pose, gaze classification, eye aspect ratios, expression metrics) with a multi-tiered pedagogical agent and real-time dashboard analytics."*

### Key Highlights
- **Privacy-First Architecture**: Real student IDs are hashed using truncated SHA-256 (`anon_...`). Data can remain local or be synced securely.
- **Agentic Decision Engine**: LangGraph state machine evaluating nudge cooldowns, fatigue duration, and personalized student sensitivities.
- **Pedagogical Intervention Agent**: Groq LLaMA-3.3-powered assistant providing targeted teaching interventions when sustained engagement dips occur.

---

## 2. Walkthrough Steps (4 mins)

### Step 1: Starting the Platform
```bash
# Terminal 1: Backend
uvicorn src.api.main:app --reload --port 8000

# Terminal 2: Frontend
cd frontend && npm run dev
```
Navigate to `http://localhost:5173`.

### Step 2: Instructor Portal & Course Analytics
1. Click **"Sign in as Teacher (Demo)"** on the login page.
2. Review the **Instructor Overview**:
   - Class Average Engagement score.
   - At-Risk Student counter alerting to sustained attention dips.
   - Active courses list with session counts and average engagement rates.
3. Click **"View Deep Dive"** on any course to review:
   - State Distribution Chart (Engaged, Passive, Confused, Distracted, Drowsy).
   - Anonymized At-Risk Student list.
   - Session breakdown list.

### Step 3: Session Report & AI Interventions
1. Open any lecture session report.
2. Review the interactive engagement timeline and identify top distraction dips.
3. Inspect the **AI Pedagogical Intervention Agent** output:
   - Specific intervention cards (e.g. *Activity*, *Pacing*, *Review*, *Break*).
   - Priority rankings and confidence scores.
4. Toggle **"View Printable HTML"** to display the standalone, print-friendly report with embedded Chart.js visualizations.
5. Demonstrate email dispatch to a colleague via SendGrid.

### Step 4: Student Focus & Nudge Personalization
1. Click **"Logout"** and sign in as **Student (Demo)**.
2. Review the **Student Dashboard**:
   - Focus Streak (consecutive sessions >= 70%).
   - Engagement trajectory and recent lecture logs.
3. Navigate to **Nudge Preferences**:
   - Customize nudge frequency, threshold sensitivity, and quiet hours.

### Step 5: Data Portability & Anonymized Exports
1. Navigate to **Export Telemetry**.
2. Query by Session ID or Course ID, select CSV or JSON format, and trigger instant download.
3. Open the downloaded file to demonstrate that all student records contain `anonymized_student_id` without exposing private identities.

---

## 3. Technical Verification & Test Suite
```bash
pytest tests/ -v
```
All **248 automated unit and integration tests** pass in ~5 seconds.
