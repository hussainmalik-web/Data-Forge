# Data Forge — Deployment Preparation

This stage makes deployment-sensitive configuration environment-driven without changing the core analysis workflow.

## Environment variables

### Backend

- `MAX_UPLOAD_SIZE_MB` — upload limit in MB. Default: `10`.
- `PREVIEW_ROWS` — preview row count. Default: `25`.
- `STORAGE_DIR` — filesystem location for uploaded and generated files.
- `CORS_ORIGINS` — comma-separated browser origins allowed to call the API.

### Frontend

- `VITE_API_URL` — public backend API base URL. This is a build-time browser value and must not contain secrets.

## Local Docker

1. Copy `.env.example` to `.env`.
2. Keep `VITE_API_URL=http://localhost:8000`.
3. Keep the local CORS origins.
4. Run `docker compose up --build`.

The backend storage directory is mounted as the `data_forge_storage` Docker volume so local container restarts do not discard uploaded files.

## Public deployment

Set `VITE_API_URL` to the deployed backend URL and `CORS_ORIGINS` to the deployed frontend origin.

For a public host, the `STORAGE_DIR` must point to persistent storage. A platform's ephemeral container filesystem must not be treated as durable dataset storage.

## Security notes

- Do not commit `.env`.
- Do not put API secrets in `VITE_*` variables.
- Keep CORS restricted to the actual frontend origin(s).
- The current V1 data storage is filesystem-based; object storage/database-backed persistence is a separate hardening stage.
