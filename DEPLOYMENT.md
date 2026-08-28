# FlowLens AI — Production Deployment Guide & Architecture

## 🌐 Live Application URLs

- **Live Public HTTPS URL**: [https://99517b37bf47b6.lhr.life](https://99517b37bf47b6.lhr.life)
- **Production Health Check Endpoint**: [https://99517b37bf47b6.lhr.life/api/health](https://99517b37bf47b6.lhr.life/api/health)
- **Interactive OpenAPI Documentation**: [https://99517b37bf47b6.lhr.life/docs](https://99517b37bf47b6.lhr.life/docs)

---

## 🏗️ Production Architecture Overview

The FlowLens AI production architecture is packaged as a **Unified High-Performance Full-Stack Container**:

```
[ Incoming HTTPS Traffic ]
           │
           ▼
[ FastAPI High-Concurrency ASGI Server (Port 8000) ]
     ├── /api/health          ── Health Check & Monitoring
     ├── /api/datasets        ── Ingestion & Column Mapping Engine
     ├── /api/process/*       ── Process Graph & Bottleneck Analytics
     ├── /api/ai/ask          ── Grounded Process Intelligence Analyst
     ├── /api/simulation/run  ── What-If Scenario Calculation
     ├── /docs                ── Interactive OpenAPI Documentation
     ├── /assets/*            ── Optimized React 19 Frontend Assets
     └── /* (SPA Fallback)    ── React 19 Single Page Application Shell
```

---

## ☁️ Permanent Cloud Deployment Options (Runs 24/7 Independently of PC)

FlowLens AI includes pre-configured deployment manifests for all major cloud providers:

### Option 1: 1-Click Deploy on Render (Recommended)
1. Push this repository to GitHub or GitLab.
2. Log into [Render.com](https://render.com) and click **New +** -> **Blueprint**.
3. Connect your repository. Render will automatically detect [`render.yaml`](./render.yaml).
4. Click **Apply**. Render will build the Docker container and deploy the application with a permanent `https://<your-app>.onrender.com` URL.

### Option 2: 1-Click Deploy on Railway
1. Log into [Railway.app](https://railway.app) and click **New Project** -> **Deploy from GitHub repo**.
2. Select your repository. Railway will detect [`railway.json`](./railway.json) and [`Dockerfile`](./Dockerfile).
3. Under service settings, generate a domain (e.g. `https://flowlens-production.up.railway.app`).

### Option 3: Deploy with Docker to any VPS (DigitalOcean / AWS / GCP / Linode)
```bash
# Clone repository
git clone <your-repo-url>
cd flowlens

# Build and start container in background
docker-compose up -d --build
```
Your container will be running on port 8000 with automated health checks enabled.

### Option 4: Deploy to Fly.io
```bash
fly launch
fly deploy
```

---

## ⚙️ Environment Variables Checklist

| Variable | Description | Default / Example |
|---|---|---|
| `ENVIRONMENT` | Application mode | `production` |
| `PROJECT_NAME` | Platform Name | `FlowLens AI` |
| `PORT` | Listening Port | `8000` |
| `SECRET_KEY` | Strong Cryptographic Token Secret | `fl_prod_9a8f2c7e1b4d6a8f...` |
| `DATABASE_URL` | Persistent Database Connection | `sqlite:///flowlens.db` or `postgresql://...` |
| `CORS_ORIGINS` | Allowed CORS Domain(s) | `*` (or your custom domain) |
| `AI_API_KEY` | Optional External LLM Key (Backend only) | `AIzaSy...` |

---

## 🧪 Production Verification Endpoints

```bash
# 1. Health check
curl https://99517b37bf47b6.lhr.life/api/health

# 2. Interactive Swagger Docs
curl https://99517b37bf47b6.lhr.life/docs

# 3. List Active Datasets
curl https://99517b37bf47b6.lhr.life/api/datasets
```
