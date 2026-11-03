# EngageIQ AI — Production Deployment Guide

This guide describes how to deploy EngageIQ AI to production cloud infrastructure.

---

## Architecture Overview

```
[ Client Browser ]
        |
        +---> [ Frontend (Vercel / Netlify / S3) ]
        |       Vite + React 18 + Recharts SPA
        |
        +---> [ Backend API (Railway / Render / AWS ECS) ]
                FastAPI + Uvicorn + WebSockets
                    |
                    +---> [ PostgreSQL Database (Supabase / Neon / RDS) ]
                    |
                    +---> [ Groq LLaMA 3.3 API ] (Pedagogical Interventions)
                    |
                    +---> [ SendGrid API ] (Report Email Delivery)
```

---

## 1. Database Provisioning (PostgreSQL)

You can use any managed PostgreSQL provider (e.g. Supabase, Neon, or Railway Postgres):

1. Provision a PostgreSQL 15+ database instance.
2. Note the connection URI:
   ```
   postgresql://user:password@host:port/database_name
   ```
3. Run Alembic migrations against your production database:
   ```bash
   DATABASE_URL="postgresql://user:password@host:port/database_name" alembic upgrade head
   ```

---

## 2. Backend Deployment (Railway / Render / Docker)

### Option A: Railway (Recommended)

1. Connect your GitHub repository (`bulbul-agarwalla/engageiq-ai`) to Railway.
2. Add a new service from the repository with the root `Dockerfile`.
3. Set the following Environment Variables in the Railway Dashboard:
   - `DATABASE_URL`: Your managed Postgres connection string.
   - `SECRET_KEY`: Random 64-character secret string.
   - `JWT_SECRET_KEY`: Random 64-character secret string.
   - `GROQ_API_KEY`: Your Groq API key (from console.groq.com).
   - `LLM_PROVIDER`: `groq`
   - `SENDGRID_API_KEY`: (Optional) SendGrid API key for lecture reports email delivery.
   - `EMAIL_FROM`: Verified SendGrid sender email.
   - `FRONTEND_URL`: URL of your deployed frontend (e.g., `https://engageiq-ai.vercel.app`).
   - `DEBUG`: `false`
4. The service will build via `Dockerfile` and expose port `8000`.

### Option B: Docker Compose

For single-server deployment (e.g. AWS EC2, DigitalOcean Droplet):
```bash
docker compose up -d --build
```

---

## 3. Frontend Deployment (Vercel / Netlify)

1. Connect your repository to Vercel or Netlify.
2. Configure project settings:
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
3. Configure Environment Variables:
   - `VITE_BACKEND_URL`: URL of your deployed backend (e.g., `https://engageiq-backend.up.railway.app`).
4. In `frontend/vite.config.js`, reverse-proxy forwarding routes `/api` and `/health` to your production backend.

---

## 4. Health & Verification

Once deployed, verify backend status:
```bash
curl -f https://<backend-url>/health
```
Expected output:
```json
{"status":"healthy","version":"0.1.0"}
```
