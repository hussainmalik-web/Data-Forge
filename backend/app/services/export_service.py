from __future__ import annotations
from pathlib import Path
import re
import pandas as pd
from fastapi.responses import FileResponse
from app.core.config import STORAGE_DIR
from app.services.dataset_service import DatasetError

class ExportService:
    def dataset_file(self, dataset_id:str):
        if not re.fullmatch(r"[0-9a-fA-F-]{36}",dataset_id): raise DatasetError("Invalid dataset ID.")
        m=[p for p in STORAGE_DIR.glob(f"{dataset_id}.*") if p.suffix.lower() in {".csv",".xlsx"}]
        if not m: raise DatasetError("Dataset not found. Please upload it again.")
        p=m[0]
        if p.suffix.lower()==".csv": return FileResponse(p,media_type="text/csv",filename=f"data-forge-{dataset_id}.csv")
        return FileResponse(p,media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",filename=f"data-forge-{dataset_id}.xlsx")
    def cleaned_file(self, cleaned_id:str, fmt:str="csv"):
        if not re.fullmatch(r"[0-9a-fA-F-]{36}",cleaned_id): raise DatasetError("Invalid cleaned dataset ID.")
        csv=STORAGE_DIR/f"{cleaned_id}.csv"
        if not csv.exists(): raise DatasetError("Cleaned dataset not found.")
        normalized = fmt.lower()
        if normalized == "xlsx":
            xlsx=STORAGE_DIR/f"{cleaned_id}.xlsx"
            pd.read_csv(csv).to_excel(xlsx,index=False,engine="openpyxl")
            return FileResponse(xlsx,media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",filename=f"data-forge-cleaned-{cleaned_id}.xlsx")
        if normalized == "csv":
            return FileResponse(csv,media_type="text/csv",filename=f"data-forge-cleaned-{cleaned_id}.csv")
        raise DatasetError("Unsupported export format. Use csv or xlsx.")

    def quality_report(self,dataset_id:str,quality:dict):
        path=STORAGE_DIR/f"{dataset_id}-quality.txt"; lines=["DATA FORGE — DATA QUALITY REPORT","",f"Dataset ID: {dataset_id}",f"Rows: {quality['rows']}",f"Columns: {quality['columns']}",f"Issues: {quality['issue_count']}","", "ISSUES"]
        for i in quality["issues"]: lines.append(f"- [{i['severity'].upper()}] {i['title']}: {i['message']}")
        lines += ["",quality["disclaimer"]]; path.write_text("\n".join(lines),encoding="utf-8")
        return FileResponse(path,media_type="text/plain",filename=f"data-forge-quality-{dataset_id}.txt")
