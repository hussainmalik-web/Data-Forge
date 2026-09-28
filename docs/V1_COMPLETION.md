# Data Forge V1 Completion

## V1 workflow
Upload CSV/XLSX → Preview → Profile → Quality Checks → Quality Score → Cleaning Plan → Approval → Before/After → Cleaning Log → Visual Recommendations → Dashboard → Export.

## Design principles
- Deterministic calculations with pandas/NumPy.
- No AI or paid API is required for V1.
- Original uploads are not overwritten by cleaning.
- Cleaning is explicit and user-approved.
- Quality score is transparent and not presented as proof of correctness.
- V1 uses temporary local storage rather than a database.

## Implemented API
- `POST /api/datasets/upload`
- `GET /api/datasets/{id}/profile`
- `GET /api/datasets/{id}/quality`
- `GET /api/datasets/{id}/quality-score`
- `POST /api/datasets/{id}/clean/plan`
- `POST /api/datasets/{id}/clean`
- `GET /api/datasets/{id}/visualizations/recommend`
- `GET /api/datasets/{id}/visualizations/data`
- `GET /api/datasets/{id}/dashboard`
- `GET /api/datasets/{id}/export`
- `GET /api/datasets/{id}/quality-report`
- `GET /api/datasets/cleaned/{id}/export?format=csv|xlsx`
- `GET /api/health`

## Deliberately not in V1
Accounts, PostgreSQL projects, Ask Your Data, SQL assistant, Python assistant, advanced BA toolkit, external LLM integration.
