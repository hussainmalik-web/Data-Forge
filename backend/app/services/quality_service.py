from __future__ import annotations

from pathlib import Path
import re

import numpy as np
import pandas as pd

from app.core.config import STORAGE_DIR
from app.services.dataset_service import DatasetError


class QualityService:
    """Deterministic data-quality checks. Never modifies the source dataset."""

    def quality_report(self, dataset_id: str) -> dict:
        path = self._find_dataset(dataset_id)
        try:
            df = self._read(path)
        except Exception as exc:
            raise DatasetError("We couldn't read this dataset for quality checks.") from exc

        issues: list[dict] = []
        column_issues: list[dict] = []

        # Dataset-level checks
        missing_cells = int(df.isna().sum().sum())
        duplicate_rows = int(df.duplicated().sum())
        empty_rows = int(df.isna().all(axis=1).sum()) if len(df.columns) else int(len(df))
        empty_columns = [str(c) for c in df.columns if df[c].isna().all()]

        if missing_cells:
            issues.append(self._issue("missing_values", "Missing values", "warning", missing_cells,
                                      f"{missing_cells:,} missing cells detected."))
        if duplicate_rows:
            issues.append(self._issue("duplicate_rows", "Duplicate rows", "warning", duplicate_rows,
                                      f"{duplicate_rows:,} duplicate rows detected."))
        if empty_rows:
            issues.append(self._issue("empty_rows", "Empty rows", "warning", empty_rows,
                                      f"{empty_rows:,} completely empty rows detected."))
        if empty_columns:
            issues.append(self._issue("empty_columns", "Empty columns", "warning", len(empty_columns),
                                      f"{len(empty_columns):,} completely empty columns detected.", empty_columns))

        for col in df.columns:
            s = df[col]
            name = str(col)
            missing = int(s.isna().sum())
            unique = int(s.nunique(dropna=True))
            non_null = int(s.notna().sum())
            col_results = []

            if len(df) and missing:
                col_results.append({"type": "missing_values", "count": missing,
                                    "message": f"{missing:,} missing values ({missing / len(df) * 100:.2f}%)."})

            if non_null and unique <= 1:
                col_results.append({"type": "constant_column", "count": unique,
                                    "message": "Column contains only one distinct non-null value."})

            # Whitespace / capitalization consistency for text-like columns.
            if s.dtype == object:
                values = s.dropna().astype(str)
                whitespace_count = int(values.str.match(r"^\s|.*\s$", na=False).sum())
                normalized = values.str.strip()
                capitalization_groups = {}
                for value in normalized:
                    capitalization_groups.setdefault(value.casefold(), set()).add(value)
                inconsistent_case = [sorted(v) for v in capitalization_groups.values() if len(v) > 1]
                if whitespace_count:
                    col_results.append({"type": "leading_trailing_spaces", "count": whitespace_count,
                                        "message": f"{whitespace_count:,} text values have leading or trailing spaces."})
                case_count = sum(len(group) - 1 for group in inconsistent_case)
                if case_count:
                    col_results.append({"type": "inconsistent_capitalization", "count": case_count,
                                        "message": "Text values differ only by capitalization after trimming."})

                parsed = pd.to_datetime(values, errors="coerce", format="mixed")
                date_hint = bool(re.search(r"date|time|dob|joined|created|updated", name, flags=re.I))
                date_like = len(values) > 0 and parsed.notna().any() and (parsed.notna().mean() >= 0.5 or date_hint)
                if date_like and parsed.isna().any():
                    invalid = int(parsed.isna().sum())
                    col_results.append({"type": "invalid_dates", "count": invalid,
                                        "message": f"{invalid:,} values could not be parsed as dates."})

            # Potential numerical outliers: IQR rule, only when enough observations exist.
            if pd.api.types.is_numeric_dtype(s):
                numeric = pd.to_numeric(s, errors="coerce").dropna()
                if len(numeric) >= 4 and numeric.nunique() > 1:
                    q1, q3 = numeric.quantile([0.25, 0.75])
                    iqr = q3 - q1
                    if iqr > 0:
                        lower, upper = q1 - 1.5 * iqr, q3 + 1.5 * iqr
                        outliers = int(((numeric < lower) | (numeric > upper)).sum())
                        if outliers:
                            col_results.append({"type": "potential_outliers", "count": outliers,
                                                "message": f"{outliers:,} values fall outside the 1.5×IQR range.",
                                                "method": "IQR", "lower_bound": self._number(lower),
                                                "upper_bound": self._number(upper)})

            if col_results:
                column_issues.append({"column": name, "issues": col_results})
                for item in col_results:
                    issues.append(self._issue(item["type"], f"{name}: {item['type'].replace('_', ' ').title()}",
                                              "warning", item["count"], item["message"], [name]))

        # Sparse columns: more than 50% missing. Keep this separate from generic missing values.
        sparse = []
        if len(df):
            for col in df.columns:
                pct = float(df[col].isna().mean() * 100)
                if pct > 50:
                    sparse.append(str(col))
        if sparse:
            issues.append(self._issue("sparse_columns", "Highly sparse columns", "warning", len(sparse),
                                      f"{len(sparse):,} columns contain more than 50% missing values.", sparse))

        # A simple deterministic validity signal: checks only, not a claim that data is correct.
        categories = {"missing_values", "duplicate_rows", "empty_rows", "empty_columns", "invalid_dates",
                      "leading_trailing_spaces", "inconsistent_capitalization", "constant_column", "potential_outliers", "sparse_columns"}
        counts = {category: sum(1 for i in issues if i["type"] == category) for category in categories}

        return {
            "dataset_id": dataset_id,
            "rows": int(len(df)),
            "columns": int(len(df.columns)),
            "issue_count": len(issues),
            "issues": issues,
            "column_issues": column_issues,
            "summary": counts,
            "disclaimer": "This report identifies detectable patterns; it does not guarantee that the dataset is error-free.",
        }

    @staticmethod
    def _issue(issue_type, title, severity, count, message, columns=None):
        return {"type": issue_type, "title": title, "severity": severity, "count": int(count),
                "message": message, "columns": columns or []}

    @staticmethod
    def _number(value):
        if pd.isna(value) or not np.isfinite(value):
            return None
        return float(value)

    @staticmethod
    def _find_dataset(dataset_id: str) -> Path:
        if not re.fullmatch(r"[0-9a-fA-F-]{36}", dataset_id):
            raise DatasetError("Invalid dataset ID.")
        matches = list(STORAGE_DIR.glob(f"{dataset_id}.*"))
        if not matches:
            raise DatasetError("Dataset not found. Please upload it again.")
        return matches[0]

    @staticmethod
    def _read(path: Path) -> pd.DataFrame:
        if path.suffix.lower() == ".csv":
            return pd.read_csv(path)
        return pd.read_excel(path, engine="openpyxl")
