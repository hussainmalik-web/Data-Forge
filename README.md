# Data Forge

**From raw data to meaningful insights.**

Data Forge is an analyst productivity platform for turning CSV/XLSX data into analysis-ready information through profiling, data-quality checks, deterministic cleaning, exploration, visualization, dashboards, and exports.

## Run locally on Windows

### Backend

Open PowerShell in `backend`:

```powershell
python -m pip install -r requirements.txt
python -m uvicorn app.main:app --reload
```

Open API docs at `http://localhost:8000/docs`.

### Frontend

Open a second PowerShell in `frontend`:

```powershell
npm install
npm run dev
```

Open `http://localhost:5173`.

### Test backend

From `backend`:

```powershell
pytest
```

## Architecture

```text
React/Vite + TypeScript + Tailwind
              │
              │ REST API
              ▼
FastAPI + pandas + NumPy + openpyxl
              │
              ▼
       Local file storage
```

The current V1 build does not require PostgreSQL. The source dataset is never silently overwritten by cleaning; an Apply operation creates a separate cleaned dataset.

## Important

Use this project as one complete build. Do not copy frontend or backend files from earlier Data Forge ZIP versions into this project.
