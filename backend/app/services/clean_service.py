from __future__ import annotations

import json
import re
from pathlib import Path
from uuid import uuid4

import numpy as np
import pandas as pd

from app.core.config import STORAGE_DIR
from app.services.dataset_service import DatasetError


class CleanService:
    """Deterministic, approval-based dataframe cleaning service."""

    MISSING_TEXT = {"", "na", "n/a", "null", "none", "nan", "-", "--", "?", "unknown"}

    def __init__(self):
        STORAGE_DIR.mkdir(parents=True, exist_ok=True)

    def plan(self, dataset_id: str, operations: list[dict]) -> dict:
        df, _ = self._load(dataset_id)
        cleaned, log = self._apply(df.copy(), operations)
        return {
            "dataset_id": dataset_id,
            "before": self._stats(df),
            "after": self._stats(cleaned),
            "operations": log,
            "preview_rows": self._preview(cleaned),
        }

    def apply(self, dataset_id: str, operations: list[dict]) -> dict:
        df, original_path = self._load(dataset_id)
        cleaned, log = self._apply(df.copy(), operations)

        cleaned_id = str(uuid4())
        path = STORAGE_DIR / f"{cleaned_id}.csv"
        cleaned.to_csv(path, index=False)

        meta = {
            "cleaned_id": cleaned_id,
            "dataset_id": dataset_id,
            "source_filename": original_path.name,
            "operations": log,
        }
        (STORAGE_DIR / f"{cleaned_id}.json").write_text(
            json.dumps(meta, indent=2, default=str), encoding="utf-8"
        )

        return {
            "cleaned_id": cleaned_id,
            "dataset_id": dataset_id,
            "before": self._stats(df),
            "after": self._stats(cleaned),
            "operations": log,
            "preview_rows": self._preview(cleaned),
        }

    def _apply(self, df: pd.DataFrame, operations: list[dict]):
        log = []

        if not operations:
            raise DatasetError("Select at least one cleaning operation.")

        for op in operations:
            name = op.get("type")
            before = self._stats(df)

            if name == "remove_duplicates":
                df = df.drop_duplicates().reset_index(drop=True)

            elif name == "remove_empty_rows":
                df = self._replace_common_missing(df)
                df = df.dropna(how="all").reset_index(drop=True)

            elif name == "remove_empty_columns":
                df = self._replace_common_missing(df)
                df = df.dropna(axis=1, how="all")

            elif name == "fill_missing_numeric":
                method = str(op.get("method", "median")).lower()
                if method not in {"median", "mean"}:
                    raise DatasetError("Numeric fill method must be median or mean.")

                # Work with both true numeric columns and numeric-looking text columns.
                cols = op.get("columns") or self._numeric_like_columns(df)
                filled = []
                for c in cols:
                    if c not in df.columns:
                        continue
                    numeric = pd.to_numeric(
                        self._missing_text_to_nan(df[c]), errors="coerce"
                    )
                    if numeric.notna().sum() == 0:
                        continue
                    if bool(op.get("zero_fill")):
                        df[c] = numeric.fillna(0)
                        filled.append(c)
                        continue
                    fill_value = (
                        numeric.median() if method == "median" else numeric.mean()
                    )
                    if pd.notna(fill_value):
                        df[c] = numeric.fillna(fill_value)
                        filled.append(c)

                if not filled:
                    raise DatasetError(
                        "No numeric columns with missing values were found."
                    )

            elif name == "fill_missing_categorical":
                value = str(op.get("value", "Unknown"))
                cols = op.get("columns") or [
                    c for c in df.columns if c not in self._numeric_like_columns(df)
                ]
                filled = []
                for c in cols:
                    if c not in df.columns:
                        continue
                    series = self._missing_text_to_nan(df[c])
                    if series.isna().any():
                        if value == "__MODE__":
                            mode = series.dropna().mode()
                            replacement = mode.iloc[0] if not mode.empty else "Unknown"
                            df[c] = series.fillna(replacement)
                        elif value == "__FFILL__":
                            df[c] = series.ffill().fillna("Unknown")
                        else:
                            df[c] = series.fillna(value)
                        filled.append(c)

                if not filled:
                    raise DatasetError(
                        "No categorical columns with missing values were found."
                    )

            elif name == "remove_missing_rows":
                df = self._replace_common_missing(df)
                df = df.dropna().reset_index(drop=True)

            elif name == "trim_whitespace":
                for c in df.select_dtypes(include=["object", "string"]).columns:
                    df[c] = df[c].map(
                        lambda x: x.strip() if isinstance(x, str) else x
                    )
                    # Whitespace-only cells become missing values.
                    df[c] = df[c].replace(r"^\s*$", np.nan, regex=True)

            elif name == "standardize_text":
                mode = str(op.get("mode", "lower")).lower()
                if mode not in {"lower", "upper", "title"}:
                    raise DatasetError("Text mode must be lower, upper, or title.")
                for c in df.select_dtypes(include=["object", "string"]).columns:
                    if mode == "upper":
                        df[c] = df[c].map(
                            lambda x: x.upper() if isinstance(x, str) else x
                        )
                    elif mode == "title":
                        df[c] = df[c].map(
                            lambda x: x.title() if isinstance(x, str) else x
                        )
                    else:
                        df[c] = df[c].map(
                            lambda x: x.lower() if isinstance(x, str) else x
                        )

            elif name == "parse_dates":
                cols = op.get("columns") or self._date_like_columns(df)
                parsed = []
                failed = []
                for c in cols:
                    if c not in df.columns:
                        continue
                    converted = pd.to_datetime(
                        df[c], errors="coerce", format="mixed"
                    )
                    # Explicitly selected columns are allowed to contain some
                    # invalid values, but at least one non-missing value must
                    # parse successfully. This prevents a silent all-NaT result.
                    source_non_missing = df[c].notna().sum()
                    if source_non_missing and converted.notna().sum() == 0:
                        failed.append(str(c))
                        continue
                    df[c] = converted
                    parsed.append(c)
                if failed:
                    raise DatasetError(
                        "Could not parse any date values in: " + ", ".join(failed)
                    )
                if not parsed:
                    raise DatasetError("No date columns were selected or detected.")

            elif name == "convert_types":
                cols = op.get("columns") or []
                target = str(op.get("target", "string")).lower()
                if target not in {"numeric", "string", "date"}:
                    raise DatasetError("Target type must be numeric, string, or date.")
                if not cols:
                    raise DatasetError("Select at least one column for type conversion.")

                for c in cols:
                    if c not in df.columns:
                        continue
                    if target == "numeric":
                        df[c] = pd.to_numeric(
                            self._missing_text_to_nan(df[c]), errors="coerce"
                        )
                    elif target == "string":
                        df[c] = df[c].astype("string")
                    else:
                        df[c] = pd.to_datetime(
                            df[c], errors="coerce", format="mixed"
                        )

            elif name == "rename_columns":
                mapping = op.get("mapping", {})
                if not isinstance(mapping, dict) or not mapping:
                    raise DatasetError("Provide a column rename mapping.")
                safe_mapping = {
                    str(k): str(v).strip()
                    for k, v in mapping.items()
                    if str(k) in df.columns and str(v).strip()
                }
                if not safe_mapping:
                    raise DatasetError("No valid column names were supplied.")
                targets = list(safe_mapping.values())
                if len(set(targets)) != len(targets):
                    raise DatasetError("Each renamed column must have a unique new name.")
                untouched = set(df.columns) - set(safe_mapping.keys())
                collisions = sorted(set(targets) & untouched)
                if collisions:
                    raise DatasetError(
                        "New column name already exists: " + ", ".join(collisions)
                    )
                df = df.rename(columns=safe_mapping)

            elif name == "remove_columns":
                cols = [c for c in op.get("columns", []) if c in df.columns]
                if not cols:
                    raise DatasetError("No valid columns were selected for removal.")
                df = df.drop(columns=cols)

            else:
                raise DatasetError(f"Unsupported cleaning operation: {name}")

            after = self._stats(df)
            log.append(
                {
                    "type": name,
                    "description": self._description(name, op),
                    "before": before,
                    "after": after,
                    "changed_rows": before["rows"] - after["rows"],
                    "changed_columns": before["columns"] - after["columns"],
                    "changed_missing_cells": before["missing_cells"]
                    - after["missing_cells"],
                }
            )

        return df, log

    @classmethod
    def _replace_common_missing(cls, df: pd.DataFrame) -> pd.DataFrame:
        result = df.copy()
        for c in result.columns:
            if pd.api.types.is_object_dtype(result[c]) or pd.api.types.is_string_dtype(
                result[c]
            ):
                result[c] = cls._missing_text_to_nan(result[c])
        return result

    @classmethod
    def _missing_text_to_nan(cls, series: pd.Series) -> pd.Series:
        result = series.copy()
        if pd.api.types.is_object_dtype(result) or pd.api.types.is_string_dtype(result):
            text = result.astype("string").str.strip()
            result = result.mask(text.str.lower().isin(cls.MISSING_TEXT))
            # Preserve non-string values where possible.
            result = result.mask(text.eq(""))
        return result

    @classmethod
    def _numeric_like_columns(cls, df: pd.DataFrame) -> list[str]:
        cols = []
        for c in df.columns:
            if pd.api.types.is_numeric_dtype(df[c]):
                cols.append(c)
                continue
            cleaned = pd.to_numeric(
                cls._missing_text_to_nan(df[c]), errors="coerce"
            )
            non_missing = cls._missing_text_to_nan(df[c]).notna().sum()
            if non_missing and (cleaned.notna().sum() / non_missing) >= 0.8:
                cols.append(c)
        return cols

    @classmethod
    def _date_like_columns(cls, df: pd.DataFrame) -> list[str]:
        cols = []
        for c in df.columns:
            name = str(c).lower()
            if any(token in name for token in ("date", "time", "dob", "joined", "created")):
                cols.append(c)
        return cols

    @staticmethod
    def _description(name, op):
        labels = {
            "remove_duplicates": "Remove duplicate rows",
            "remove_empty_rows": "Remove completely empty rows",
            "remove_empty_columns": "Remove completely empty columns",
            "fill_missing_numeric": f"Fill numeric missing values ({op.get('method', 'median')})",
            "fill_missing_categorical": f"Fill categorical missing values ({op.get('value', 'Unknown')})",
            "remove_missing_rows": "Remove rows containing missing values",
            "trim_whitespace": "Trim leading/trailing whitespace",
            "standardize_text": f"Standardize text ({op.get('mode', 'lower')})",
            "parse_dates": "Parse selected/detected columns as dates",
            "convert_types": f"Convert selected columns to {op.get('target', 'string')}",
            "rename_columns": "Rename selected columns",
            "remove_columns": "Remove selected columns",
        }
        return labels.get(name, name)

    @staticmethod
    def _stats(df):
        return {
            "rows": int(len(df)),
            "columns": int(len(df.columns)),
            "missing_cells": int(df.isna().sum().sum()),
            "duplicate_rows": int(df.duplicated().sum()),
        }

    @staticmethod
    def _preview(df):
        x = df.head(25).copy()
        records = []
        for row in x.to_dict(orient="records"):
            clean_row = {}
            for key, value in row.items():
                if pd.isna(value):
                    clean_row[key] = None
                elif isinstance(value, pd.Timestamp):
                    clean_row[key] = value.isoformat()
                else:
                    clean_row[key] = (
                        value.item() if isinstance(value, np.generic) else value
                    )
            records.append(clean_row)
        return records

    @staticmethod
    def _load(dataset_id):
        if not re.fullmatch(r"[0-9a-fA-F-]{36}", dataset_id):
            raise DatasetError("Invalid dataset ID.")
        matches = [
            p
            for p in STORAGE_DIR.glob(f"{dataset_id}.*")
            if p.suffix.lower() in {".csv", ".xlsx"}
        ]
        if not matches:
            raise DatasetError("Dataset not found. Please upload it again.")
        path = matches[0]
        try:
            df = (
                pd.read_csv(path)
                if path.suffix.lower() == ".csv"
                else pd.read_excel(path, engine="openpyxl")
            )
        except Exception as exc:
            raise DatasetError("We couldn't read this dataset.") from exc
        return df, path
