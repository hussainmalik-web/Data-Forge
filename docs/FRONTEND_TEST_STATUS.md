# Frontend Test Status — v0.18 Release Candidate

## Environment result

The Vite/React frontend source was reviewed against the backend API routes and the configured environment variable.

### Verified statically
- Vite + React source structure is present.
- `VITE_API_URL` is supported with `http://localhost:8000` as the local fallback.
- Upload uses `POST /api/datasets/upload`.
- Profile, quality, quality score, visualization recommendations, and dashboard endpoints match the backend routes.
- Cleaning plan and apply endpoints match the backend routes.
- Visualization data endpoint is used with encoded chart parameters.
- Source export and quality-report links match the backend routes.
- Cleaned CSV/XLSX export links use the supported `format=csv` and `format=xlsx` values.

## Environment limitation

A production frontend build could not be executed in this environment because `npm install --no-audit --no-fund` timed out before dependencies were installed. Running `tsc` directly also cannot provide a valid application type-check without the project's installed Vite/React type packages.

Therefore this release does **not** claim that browser/frontend testing has passed.

## Backend regression

From the tested backend environment:

- Pytest: **6 passed**
- End-to-end API checks: **22 / 22 passed** after three bug fixes
- Python application compile check: **passed**

## Required local browser test

1. Start backend:
   ```bash
   cd backend
   python -m venv venv
   # Windows PowerShell:
   .\venv\Scripts\Activate.ps1
   pip install -r requirements.txt
   uvicorn app.main:app --reload
   ```
2. In a second terminal start frontend:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
3. Open `http://localhost:5173`.
4. Test the complete workflow:
   - Upload CSV
   - Upload XLSX
   - Confirm dataset preview
   - Confirm profile statistics
   - Confirm quality issues and score
   - Select cleaning operations
   - Preview changes
   - Apply changes
   - Confirm before/after metrics
   - Confirm cleaning log
   - Download cleaned CSV
   - Download cleaned XLSX
   - Download source file
   - Download quality report
   - Open each recommended visualization
   - Confirm automatic dashboard
   - Click New dataset and repeat upload
5. Test an invalid/unsupported file and confirm a readable error is shown.
6. Resize the browser to desktop/tablet/mobile widths and check that the interface remains usable.

## Release decision

**Backend: PASS**  
**Frontend static/API integration review: PASS**  
**Frontend browser/build certification: PENDING LOCAL TEST**  
**Overall project: Release Candidate, not yet fully certified V1**
