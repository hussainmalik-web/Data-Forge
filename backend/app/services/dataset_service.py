from __future__ import annotations

from io import BytesIO
from pathlib import Path
from uuid import uuid4

import pandas as pd

from app.core.config import ALLOWED_EXTENSIONS, MAX_FILE_SIZE_BYTES, PREVIEW_ROWS, STORAGE_DIR


class DatasetError(Exception):
    """Expected dataset-processing error shown to the API client."""


class DatasetService:
    def __init__(self) -> None:
        STORAGE_DIR.mkdir(parents=True, exist_ok=True)

    def process_upload(self, filename: str, content: bytes) -> dict:
        suffix = Path(filename).suffix.lower()
        if suffix not in ALLOWED_EXTENSIONS:
            raise DatasetError("Unsupported file type. Please upload a CSV or XLSX file.")
        if not content:
            raise DatasetError("The uploaded file is empty.")
        if len(content) > MAX_FILE_SIZE_BYTES:
            raise DatasetError("The file is too large. The V1 upload limit is 10 MB.")

        try:
            dataframe = self._read_dataframe(suffix, content)
        except DatasetError:
            raise
        except Exception as exc:
            raise DatasetError(
                "We couldn't process this file. Check that it is a valid CSV/XLSX file and try again."
            ) from exc

        dataset_id = str(uuid4())
        stored_path = STORAGE_DIR / f"{dataset_id}{suffix}"
        stored_path.write_bytes(content)

        preview = dataframe.head(PREVIEW_ROWS).where(pd.notna(dataframe.head(PREVIEW_ROWS)), None)
        columns = [
            {"name": str(column), "dtype": str(dataframe[column].dtype)}
            for column in dataframe.columns
        ]

        return {
            "id": dataset_id,
            "filename": filename,
            "file_size_bytes": len(content),
            "rows": int(len(dataframe)),
            "columns": int(len(dataframe.columns)),
            "column_details": columns,
            "preview_rows": preview.to_dict(orient="records"),
        }

    @staticmethod
    def _read_dataframe(suffix: str, content: bytes) -> pd.DataFrame:
        stream = BytesIO(content)
        if suffix == ".csv":
            return pd.read_csv(stream)
        return pd.read_excel(stream, engine="openpyxl")
