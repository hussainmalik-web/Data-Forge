from __future__ import annotations

from pathlib import Path

import numpy as np
import pandas as pd

from app.core.config import STORAGE_DIR
from app.services.dataset_service import DatasetError


class ProfileService:
    """Build deterministic, JSON-safe dataset profiling results."""

    def profile(self, dataset_id: str) -> dict:
        path = self._find_dataset(dataset_id)
        try:
            dataframe = self._read(path)
        except Exception as exc:
            raise DatasetError("We couldn't read this dataset for profiling.") from exc

        missing_cells = int(dataframe.isna().sum().sum())
        duplicate_rows = int(dataframe.duplicated().sum())
        empty_columns = [str(c) for c in dataframe.columns if dataframe[c].isna().all()]
        empty_rows = int(dataframe.isna().all(axis=1).sum()) if len(dataframe.columns) else int(len(dataframe))

        columns = []
        numerical_count = categorical_count = date_count = 0
        for column in dataframe.columns:
            series = dataframe[column]
            kind = self._classify(series)
            if kind == "numerical": numerical_count += 1
            elif kind == "date": date_count += 1
            else: categorical_count += 1
            columns.append(self._column_profile(series, kind))

        return {
            "dataset_id": dataset_id,
            "rows": int(len(dataframe)),
            "columns": int(len(dataframe.columns)),
            "numerical_columns": numerical_count,
            "categorical_columns": categorical_count,
            "date_columns": date_count,
            "missing_cells": missing_cells,
            "duplicate_rows": duplicate_rows,
            "empty_rows": empty_rows,
            "empty_columns": len(empty_columns),
            "empty_column_names": empty_columns,
            "column_profiles": columns,
        }

    @staticmethod
    def _find_dataset(dataset_id: str) -> Path:
        matches = [p for p in STORAGE_DIR.glob(f"{dataset_id}.*") if p.suffix.lower() in {".csv", ".xlsx"}]
        if not matches:
            raise DatasetError("Dataset not found. Please upload it again.")
        return matches[0]

    @staticmethod
    def _read(path: Path) -> pd.DataFrame:
        if path.suffix.lower() == ".csv":
            return pd.read_csv(path)
        return pd.read_excel(path, engine="openpyxl")

    @staticmethod
    def _classify(series: pd.Series) -> str:
        if pd.api.types.is_numeric_dtype(series):
            return "numerical"
        if pd.api.types.is_datetime64_any_dtype(series):
            return "date"
        if series.dtype == object and series.notna().any():
            sample = series.dropna().astype(str)
            parsed = pd.to_datetime(sample, errors="coerce", format="mixed")
            if len(sample) and parsed.notna().mean() >= 0.9:
                return "date"
        return "categorical"

    @classmethod
    def _column_profile(cls, series: pd.Series, kind: str) -> dict:
        result = {
            "name": str(series.name),
            "dtype": str(series.dtype),
            "detected_type": kind,
            "unique_values": int(series.nunique(dropna=True)),
            "missing_values": int(series.isna().sum()),
            "missing_percentage": round(float(series.isna().mean() * 100), 2) if len(series) else 0.0,
        }
        if kind == "numerical":
            numeric = pd.to_numeric(series, errors="coerce").dropna()
            result.update({
                "minimum": cls._safe_number(numeric.min()) if len(numeric) else None,
                "maximum": cls._safe_number(numeric.max()) if len(numeric) else None,
                "mean": cls._safe_number(numeric.mean()) if len(numeric) else None,
                "median": cls._safe_number(numeric.median()) if len(numeric) else None,
                "standard_deviation": cls._safe_number(numeric.std()) if len(numeric) else None,
            })
        elif kind == "date":
            dates = pd.to_datetime(series, errors="coerce", format="mixed").dropna()
            result.update({
                "minimum_date": dates.min().date().isoformat() if len(dates) else None,
                "maximum_date": dates.max().date().isoformat() if len(dates) else None,
                "date_range_days": int((dates.max() - dates.min()).days) if len(dates) else None,
            })
        else:
            counts = series.dropna().astype(str).value_counts().head(5)
            result["top_values"] = [{"value": str(index), "count": int(count)} for index, count in counts.items()]
        return result

    @staticmethod
    def _safe_number(value):
        if pd.isna(value) or not np.isfinite(value):
            return None
        return float(value) if isinstance(value, (np.floating, float)) else int(value)
