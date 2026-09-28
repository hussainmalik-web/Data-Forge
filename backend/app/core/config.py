"""Runtime configuration for Data Forge.

All deployment-sensitive values can be supplied through environment variables.
Defaults remain local-development friendly.
"""

import os
from pathlib import Path


def _csv_env(name: str, default: str) -> list[str]:
    raw = os.getenv(name, default)
    return [item.strip() for item in raw.split(",") if item.strip()]


MAX_UPLOAD_SIZE_MB = int(os.getenv("MAX_UPLOAD_SIZE_MB", "10"))
MAX_FILE_SIZE_BYTES = MAX_UPLOAD_SIZE_MB * 1024 * 1024
PREVIEW_ROWS = int(os.getenv("PREVIEW_ROWS", "25"))
ALLOWED_EXTENSIONS = {".csv", ".xlsx"}

# Local filesystem is the default for development. Production hosts should
# point this at a persistent mounted volume or replace storage with an object
# storage service in a later deployment stage.
_default_storage = Path(__file__).resolve().parents[2] / "storage"
STORAGE_DIR = Path(os.getenv("STORAGE_DIR", str(_default_storage))).expanduser()

CORS_ORIGINS = _csv_env(
    "CORS_ORIGINS",
    "http://localhost:3000,http://localhost:5173,http://127.0.0.1:5173",
)
