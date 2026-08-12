# ScoutEdge Project Rules & Knowledge Base

## 🚀 Repository & Branch Architecture
- **Production Repo**: `git@github.com:Piyush105454/scoutedge-live.git` (Use SSH for git commands)
  - `backend` branch: Python 3.10 / Flask AI analysis server (Deployed on Render).
  - `frontend` branch: React 18 / Vite / TypeScript UI (Deployed on Vercel).
- **Frontend Source Repo**: `git@github.com:Piyush105454/scoutedge.git` (`main` branch).

---

## 🛠️ Tech Stack & Key Files

### Backend (`backend` branch)
- **Framework**: Python 3.10 + Flask + Gunicorn (`gthread` async worker).
- **Core Files**: `app.py`, `routes/`, `services/`, `models/`, `requirements.txt`, `render.yaml`.
- **AI Pipeline**: Roboflow YOLO-World (player detection) + EasyOCR / OCR.space (jersey number reading).
- **Storage & DB**: Neon PostgreSQL (`DATABASE_URL`), Supabase S3 (`SUPABASE_ENDPOINT`).
- **Async Processing**: Upstash QStash (`UPSTASH_QSTASH_TOKEN`).

### Frontend (`frontend` branch)
- **Framework**: React 18 + Vite + TypeScript + TanStack Router + Tailwind CSS.
- **Core Files**: `src/`, `index.html`, `vite.config.ts`, `package.json`, `vercel.json`.
- **Features**: Direct-to-S3 video upload, interactive match player heatmaps with dynamic team colors, real-time job processing toasts.

---

## ⚡ Quick Run Commands
- **Backend Server**: `python app.py` (Local: `http://localhost:5000`)
- **Backend Tests**: `pytest tests/` or `python run_tests.py`
- **Frontend Dev**: `bun run dev` or `npm run dev` (Local: `http://localhost:5173`)
- **Frontend Build**: `bun run build` or `npm run build`
