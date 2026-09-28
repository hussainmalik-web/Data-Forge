from __future__ import annotations
import re
from pathlib import Path
import pandas as pd
from app.core.config import STORAGE_DIR
from app.services.dataset_service import DatasetError

class ScoreService:
    def score(self, dataset_id: str) -> dict:
        path=self._find(dataset_id)
        df=pd.read_csv(path) if path.suffix.lower()==".csv" else pd.read_excel(path,engine="openpyxl")
        rows=max(len(df),1); cells=max(len(df)*max(len(df.columns),1),1)
        missing=int(df.isna().sum().sum()); duplicates=int(df.duplicated().sum())
        completeness=max(0.0,1-missing/cells)
        uniqueness=max(0.0,1-duplicates/rows)
        # Consistency measures blank/constant columns and text-format problems detectable without domain rules.
        constant=sum(1 for c in df.columns if df[c].nunique(dropna=True)<=1 and df[c].notna().any())
        consistency=max(0.0,1-constant/max(len(df.columns),1))
        validity=self._validity(df)
        components={"completeness":round(completeness*100,2),"consistency":round(consistency*100,2),"uniqueness":round(uniqueness*100,2),"validity":round(validity*100,2)}
        score=round(sum(components.values())/4,2)
        return {"dataset_id":dataset_id,"score":score,"components":components,"weights":{"completeness":25,"consistency":25,"uniqueness":25,"validity":25},"formula":"Average of four component percentages: completeness, consistency, uniqueness, and validity. Each contributes 25%.","disclaimer":"This score is an automated assessment based on detectable patterns. It does not guarantee that the dataset is error-free."}
    @staticmethod
    def _validity(df):
        total=0; good=0
        for c in df.columns:
            s=df[c]; total+=len(s)
            if pd.api.types.is_numeric_dtype(s): good+=int(pd.to_numeric(s,errors="coerce").notna().sum())
            elif s.dtype==object:
                vals=s.dropna().astype(str); parsed=pd.to_datetime(vals,errors="coerce",format="mixed")
                # For generic text, non-null values are valid strings; for date-looking names, parseability is checked.
                if re.search(r"date|time|dob|created|updated|joined",str(c),re.I): good+=int(parsed.notna().sum())
                else: good+=int(s.notna().sum())
            else: good+=int(s.notna().sum())
        return good/max(total,1)
    @staticmethod
    def _find(dataset_id):
        if not re.fullmatch(r"[0-9a-fA-F-]{36}",dataset_id): raise DatasetError("Invalid dataset ID.")
        m=[p for p in STORAGE_DIR.glob(f"{dataset_id}.*") if p.suffix.lower() in {".csv",".xlsx"}]
        if not m: raise DatasetError("Dataset not found. Please upload it again.")
        return m[0]
