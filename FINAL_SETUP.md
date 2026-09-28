# Data Forge — Final Local Setup

## 1. Backend

Open PowerShell in `backend`:

```powershell
python -m pip install -r requirements.txt
python -m uvicorn app.main:app --reload
```

Backend docs: `http://localhost:8000/docs`
Health: `http://localhost:8000/api/health`

## 2. Frontend

Open a second PowerShell in `frontend`:

```powershell
npm install
npm run dev
```

Frontend: `http://localhost:5173`

## 3. Important

Run the commands from the folders shown above. Do not reuse an older `dataforge-v022` extraction or copy files between old versions.

The frontend uses `VITE_API_URL` from `frontend/.env` when provided. Otherwise it uses `http://localhost:8000`.

## 4. Cleaning workflow

The Clean page supports:
- Remove duplicate rows
- Remove completely empty rows
- Remove completely empty columns
- Remove rows containing missing values
- Fill numeric values: median, mean, zero
- Fill categorical values: Unknown, mode, forward fill, custom
- Trim whitespace
- Lowercase / Title Case / UPPERCASE
- Parse selected date columns
- Convert selected columns to numeric/string/date
- Rename selected columns
- Remove selected columns
- Preview changes
- Apply changes
- Before/after metrics and cleaning audit log
- CSV/XLSX export

Cleaning is non-destructive. Apply creates a new cleaned dataset and leaves the source dataset unchanged.

## 5. Test backend

From `backend`:

```powershell
pytest
```

The included pytest configuration sets the correct Python path automatically.
