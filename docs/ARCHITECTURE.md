# Data Forge — V1 Architecture

## User flow
Upload → Preview → Profile → Quality → Clean → Compare → Visualize → Export

## Application flow
Vite/React frontend → FastAPI REST API → pandas/NumPy/openpyxl processing → structured results → frontend/downloads.

## V1 storage
No persistent database is required initially. Uploaded data should be treated as temporary processing data. Persistent projects/accounts can be introduced later.

## Design rules
1. Calculations are deterministic.
2. User data is never silently changed.
3. Cleaning operations require explicit user confirmation.
4. Future AI features should interpret or explain results, not invent numerical results.
