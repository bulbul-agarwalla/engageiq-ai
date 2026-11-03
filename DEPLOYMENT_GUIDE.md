# EngageIQ AI — Complete Production Deployment Guide

A beginner-friendly, step-by-step guide to deploying **EngageIQ AI** to the cloud.

---

## 1. System Architecture

EngageIQ AI uses a **hybrid edge-and-cloud architecture**:
* **Frontend SPA**: React 18 + Vite hosted on **Vercel** or **Netlify** (Global CDN edge).
* **Backend API**: Python 3.12 + FastAPI hosted on **Render** or **Railway** (Docker / Native Linux).
* **Database**: Managed PostgreSQL 14+ hosted on **Neon Serverless Postgres** or **Supabase**.
* **AI Pedagogical Agent**: **Groq API** running `llama-3.3-70b-versatile` with deterministic heuristic fallback.
* **Computer Vision Pipeline**: High-precision 478-point MediaPipe face mesh running on student/instructor devices (hardware accelerated via Apple Metal / XNNPACK) streaming encrypted telemetry to the backend.

```mermaid
flowchart TD
    subgraph Client ["Client Device (Mac / PC)"]
        Cam["Webcam Feed"] --> CV["MediaPipe Pipeline (scripts/live_demo.py)"]
        CV --> |Telemetry Ingestion| API["FastAPI Backend (Render / Railway)"]
        Browser["React SPA (Vercel / Netlify)"] --> |HTTP / WebSocket| API
    end

    subgraph Cloud ["Cloud Infrastructure"]
        API --> DB[(Neon / Supabase PostgreSQL)]
        API --> |Intervention Prompts| Groq["Groq Cloud (LLaMA-3.3)"]
        API --> |Email Delivery| SendGrid["SendGrid API (Optional)"]
    end
```

---

## 2. Platforms & Free Tiers Overview

| Component | Recommended Platform | Alternative | Free-Tier Details |
| :--- | :--- | :--- | :--- |
| **Frontend** | **Vercel** | Netlify | Free hobby tier includes unlimited deployments, global CDN, and automated HTTPS. |
| **Backend** | **Render** (Web Service) | Railway / Fly.io | Render offers a free Web Service tier (512MB RAM, spins down after 15m inactivity). Railway offers $5 trial credit. |
| **Database** | **Neon** | Supabase | Neon offers 0.5GB free serverless storage with instant branching and pooled connections. |
| **LLM Inference** | **Groq Cloud** | Ollama / Local | Free developer tier with high rate limits for `llama-3.3-70b-versatile`. |
| **Email Delivery** | **SendGrid** | Gmail SMTP | 100 emails/day free tier (optional). |

---

## 3. Environment Variables Master Checklist

### Backend Environment Variables (Configured on Render / Railway)

| Variable Name | Required? | Secret? | Description & Example | Where to Obtain |
| :--- | :---: | :---: | :--- | :--- |
| `DATABASE_URL` | **Yes** | **Yes** | `postgresql://user:password@ep-xyz.neon.tech/engageiq?sslmode=require` | Neon Console -> Dashboard -> Connection String |
| `FRONTEND_URL` | **Yes** | No | `https://engageiq.vercel.app` (or comma-separated origins) | Your deployed frontend URL |
| `JWT_SECRET_KEY` | **Yes** | **Yes** | 64-char random hex string | Run in terminal: `openssl rand -hex 32` |
| `GROQ_API_KEY` | Optional | **Yes** | `gsk_...` (Enables LLaMA-3.3 pedagogical interventions) | [Groq Cloud Console](https://console.groq.com/keys) |
| `SENDGRID_API_KEY` | Optional | **Yes** | `SG.xyz...` (Enables session report email dispatch) | [SendGrid Settings](https://app.sendgrid.com/settings/api_keys) |
| `EMAIL_FROM` | Optional | No | `noreply@youruniversity.edu` | Verified sender in SendGrid |
| `PORT` | Auto | No | Render automatically sets this to `10000` or `8000`. | Provided by host platform |

> [!IMPORTANT]
> Never place `GROQ_API_KEY`, `JWT_SECRET_KEY`, or `DATABASE_URL` in frontend code or in public Git commits.

### Frontend Environment Variables (Configured on Vercel / Netlify)

| Variable Name | Required? | Secret? | Description & Example |
| :--- | :---: | :---: | :--- |
| `VITE_BACKEND_URL` | **Yes** | No | `https://engageiq-backend.onrender.com` (Your deployed Render backend URL) |

---

## 4. Step-by-Step Deployment Instructions

### Step 1: Provision the PostgreSQL Database on Neon (2 minutes)
1. Sign up at [neon.tech](https://neon.tech) (using GitHub).
2. Click **Create Project** -> Name it `engageiq-db`.
3. Choose the region closest to you (e.g., `us-east-2` or `eu-central-1`).
4. Copy the **Connection String** provided. It looks like:
   ```text
   postgresql://bulbul:secret_pass@ep-cool-fog-123456.us-east-2.aws.neon.tech/neondb?sslmode=require
   ```
5. Save this string — you will use it as `DATABASE_URL`.

---

### Step 2: Deploy the FastAPI Backend on Render (5 minutes)
1. Sign up at [render.com](https://render.com) using your GitHub account (`bulbul-agarwalla`).
2. Click **New +** -> **Web Service**.
3. Select your repository: `bulbul-agarwalla/engageiq-ai`.
4. Configure the service:
   * **Name**: `engageiq-backend`
   * **Region**: Same region as your Neon database.
   * **Branch**: `portfolio/complete-project` (or `dev`).
   * **Root Directory**: Leave blank (root of repo).
   * **Runtime**: **Python 3**.
   * **Build Command**:
     ```bash
     pip install --upgrade pip && pip install -r requirements-ci.txt && alembic upgrade head
     ```
   * **Start Command**:
     ```bash
     uvicorn src.api.main:app --host 0.0.0.0 --port $PORT
     ```
5. Add **Environment Variables** in the Render settings:
   * `DATABASE_URL` = (Paste your Neon connection string from Step 1)
   * `JWT_SECRET_KEY` = (Run `openssl rand -hex 32` locally and paste result)
   * `FRONTEND_URL` = `https://engageiq.vercel.app` (Update after Step 3)
   * `GROQ_API_KEY` = (Optional: your key from `console.groq.com`)
6. Click **Create Web Service**.
7. Wait 2–3 minutes for the build to finish. Once live, test:
   `https://engageiq-backend.onrender.com/health` -> should return `{"status":"healthy","version":"0.1.0"}`.

---

### Step 3: Deploy the React Frontend on Vercel (3 minutes)
1. Sign up at [vercel.com](https://vercel.com) using your GitHub account.
2. Click **Add New...** -> **Project**.
3. Import `bulbul-agarwalla/engageiq-ai`.
4. In Project Settings:
   * **Framework Preset**: **Vite**.
   * **Root Directory**: Click edit and select `frontend`.
   * **Build Command**: `npm run build`
   * **Output Directory**: `dist`
5. Under **Environment Variables**:
   * Key: `VITE_BACKEND_URL`
   * Value: `https://engageiq-backend.onrender.com` (Your Render URL from Step 2)
6. Click **Deploy**.
7. Within 60 seconds, your site is live at `https://engageiq-ai.vercel.app`!
8. Copy your Vercel URL and update `FRONTEND_URL` in Render settings so CORS allows requests.

---

### Step 4: Run Database Seed Script (Optional Demo Data)
To populate courses and 2,640 realistic historical lecture telemetry logs:
From your local terminal, run:
```bash
DATABASE_URL="YOUR_NEON_DATABASE_URL" /opt/anaconda3/bin/python scripts/seed_rich_demo.py
```

---

### Step 5: Webcam & Computer Vision Pipeline in Production

Because cloud servers cannot access physical user webcams, EngageIQ AI supports two client modes:

1. **In-Browser WebRTC Camera (Zero Installation)**:
   * Navigate to `/teacher/live` in your browser.
   * Click **Enable Camera** -> browser requests permission.
   * Video is rendered in real time on HTML5 Canvas while telemetry points stream continuously to the backend.

2. **Local Python High-Precision MediaPipe Agent (Instructor Laptop)**:
   * Run directly on your Mac for 478 face landmarks at 15 FPS:
     ```bash
     cd ~/engageiq-ai
     /opt/anaconda3/bin/python scripts/live_demo.py
     ```
   * The local CV agent processes all facial geometry on Apple Silicon (using Metal / XNNPACK) and transmits only lightweight, SHA-256 anonymized numerical coordinates to the cloud backend.

---

## 5. Post-Deployment Verification Checklist

- [ ] **Backend Health**: `https://<backend-url>/health` returns `200 OK`.
- [ ] **Interactive API Docs**: `https://<backend-url>/docs` opens Swagger UI.
- [ ] **Landing Page**: Root URL `https://<frontend-url>/` loads hero section and capabilities.
- [ ] **Instructor Login**: Click "Instructor Experience" on `/login` -> redirects to `/teacher`.
- [ ] **Student Login**: Click "Student Experience" on `/login` -> redirects to `/student`.
- [ ] **Live Lecture Room**: Navigate to `/teacher/live`, start session, and verify live HUD updates.
- [ ] **Lecture Reports**: Open `/reports/sessions/1`, verify 40-minute timeline and state distribution charts render.
- [ ] **Data Export**: Visit `/export`, select session #1, download CSV and verify `anonymized_student_id` is present.
- [ ] **Security**: Ensure `.env` is NOT in GitHub repository history.

---

## 6. Troubleshooting Common Cloud Errors

### 1. `CORS header 'Access-Control-Allow-Origin' missing`
* **Cause**: `FRONTEND_URL` in backend environment does not match your exact Vercel domain.
* **Fix**: In Render dashboard -> Environment -> update `FRONTEND_URL` to `https://<your-exact-vercel-domain>.vercel.app` (without trailing slash).

### 2. `alembic: command not found` during build
* **Cause**: alembic not installed in build container.
* **Fix**: Ensure your build command uses `pip install -r requirements-ci.txt` before `alembic upgrade head`.

### 3. Database connection timeout on Neon
* **Cause**: Neon free tier suspends idle compute after 5 minutes.
* **Fix**: The backend automatically retries pooled connections. The initial request might take 1–2 seconds while Neon wakes up.
