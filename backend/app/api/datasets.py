from pathlib import Path
import pandas as pd
from fastapi import APIRouter, File, HTTPException, UploadFile, Query
from fastapi.responses import FileResponse

from app.core.config import STORAGE_DIR
from app.services.dataset_service import DatasetError, DatasetService
from app.services.profile_service import ProfileService
from app.services.quality_service import QualityService
from app.services.score_service import ScoreService
from app.services.clean_service import CleanService
from app.services.analysis_service import AnalysisService
from app.services.export_service import ExportService

router = APIRouter(prefix="/api/datasets", tags=["datasets"])
service = DatasetService()
profile_service = ProfileService()
quality_service = QualityService()
score_service = ScoreService()
clean_service = CleanService()
analysis_service = AnalysisService()
export_service = ExportService()


def _dataset_path(dataset_id: str) -> Path:
    matches = [p for p in STORAGE_DIR.glob(f"{dataset_id}.*") if p.suffix.lower() in {".csv", ".xlsx"}]
    if not matches:
        raise DatasetError("Dataset not found. Please upload it again.")
    return matches[0]


def _read(path: Path) -> pd.DataFrame:
    return pd.read_csv(path) if path.suffix.lower() == ".csv" else pd.read_excel(path, engine="openpyxl")


def _cleaning_operations(payload: dict) -> list[dict]:
    # Studio UI already sends the normalized operation format.
    return payload.get("operations", []) if isinstance(payload, dict) else []


def _quality_ui(dataset_id: str) -> dict:
    report = quality_service.quality_report(dataset_id)
    score = score_service.score(dataset_id)
    components = score["components"]
    issue_rows = []
    for idx, issue in enumerate(report["issues"], 1):
        issue_type = issue["type"]
        if issue_type in {"leading_trailing_spaces", "inconsistent_capitalization"}:
            ui_type = "whitespace_casing"
        elif issue_type == "duplicate_rows":
            ui_type = "duplicates"
        elif issue_type == "invalid_dates":
            ui_type = "invalid_dates"
        else:
            ui_type = "missing"
        sev = "medium" if issue["severity"] == "warning" else issue["severity"]
        issue_rows.append({
            "id": f"iss-{idx}",
            "type": ui_type,
            "title": issue["title"],
            "severity": sev,
            "count": issue["count"],
            "count_label": f"{issue['count']:,}",
            "description": issue["message"],
            "details": issue["message"],
            "affected_columns": issue.get("columns", []),
            "recommended_action": "Review the detected records before applying a cleaning operation.",
        })
    return {
        "dataset_id": dataset_id,
        "overall_score": score["score"],
        "status": "Healthy" if score["score"] >= 90 else "Needs attention",
        "action_recommended": "Review detected issues and stage cleaning operations before applying changes." if issue_rows else "No detectable quality issues require action.",
        "dimensions": {
            k: {"score": components[k], "count_label": "detected patterns", "description": f"{k.title()} assessment based on deterministic quality checks."}
            for k in ("completeness", "consistency", "uniqueness", "validity")
        },
        "issues": issue_rows,
        "anomalies": {
            "z_score_outliers": {"count": sum(i["count"] for i in report["issues"] if i["type"] == "potential_outliers"), "column": "", "note": "Potential outliers detected with an IQR rule."},
            "type_mismatches": {"count": 0, "column": "", "note": "No separate type mismatch count is produced by the current engine."},
            "primary_key_clones": {"count": report["summary"].get("duplicate_rows", 0), "rate": "", "note": "Duplicate rows detected."},
            "null_saturation": {"rate": f"{components['completeness']:.2f}% complete", "note": "Completeness is calculated from missing cells."},
        },
    }


@router.post("/upload")
async def upload_dataset(file: UploadFile = File(...)) -> dict:
    if not file.filename:
        raise HTTPException(status_code=400, detail="Please choose a file to upload.")
    content = await file.read()
    try:
        result = service.process_upload(file.filename, content)
    except DatasetError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    return {"message": "Dataset uploaded successfully.", "dataset": result}


@router.post("/sample")
async def sample_dataset() -> dict:
    sample_path = Path(__file__).resolve().parents[3] / "sample-data" / "sample_sales.csv"
    if not sample_path.exists():
        raise HTTPException(status_code=404, detail="Sample dataset is not available.")
    try:
        result = service.process_upload(sample_path.name, sample_path.read_bytes())
    except DatasetError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    return {"dataset_id": result["id"], "name": result["filename"], "rows": result["rows"], "columns": result["columns"], "file_size": f"{result['file_size_bytes'] / 1024:.1f} KB", "format": "CSV", "status": "ready"}


@router.get("/{dataset_id}/profile")
async def profile_dataset(dataset_id: str) -> dict:
    try:
        raw = profile_service.profile(dataset_id)
        path = _dataset_path(dataset_id)
        total_cells = max(1, raw["rows"] * raw["columns"])
        schema = []
        numeric_names, categorical_names, date_names = [], [], []
        for col in raw["column_profiles"]:
            kind = col["detected_type"]
            if kind == "numerical":
                typ = "NUM"; numeric_names.append(col["name"])
            elif kind == "date":
                typ = "DATE"; date_names.append(col["name"])
            else:
                typ = "TXT"; categorical_names.append(col["name"])
            schema.append({
                "name": col["name"], "type": typ, "unique_count": col["unique_values"],
                "missing_count": col["missing_values"], "missing_percentage": col["missing_percentage"],
                "min": col.get("minimum") if col.get("minimum") is not None else col.get("minimum_date"), "max": col.get("maximum") if col.get("maximum") is not None else col.get("maximum_date"),
                "mean": col.get("mean"), "median": col.get("median"), "std_dev": col.get("standard_deviation"),
                "top_values": col.get("top_values", []),
            })
        ui_profile = {
            "dataset_id": dataset_id, "name": path.name, "rows": raw["rows"], "columns": raw["columns"],
            "file_size": f"{path.stat().st_size / (1024 * 1024):.2f} MB", "numerical_columns": numeric_names,
            "categorical_columns": categorical_names, "date_columns": date_names, "missing_cells": raw["missing_cells"],
            "total_cells": total_cells, "missing_percentage": round(raw["missing_cells"] / total_cells * 100, 2),
            "duplicate_rows": raw["duplicate_rows"], "duplicate_percentage": round(raw["duplicate_rows"] / max(1, raw["rows"]) * 100, 2),
            "cleanliness_percentage": round(max(0, 100 - raw["missing_cells"] / total_cells * 100 - raw["duplicate_rows"] / max(1, raw["rows"]) * 100), 2),
            "empty_rows": raw["empty_rows"], "empty_columns": raw["empty_columns"], "schema": schema,
        }
        raw["ui"] = ui_profile
        return {"profile": raw}
    except DatasetError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc


@router.get("/{dataset_id}/quality")
async def quality_dataset(dataset_id: str) -> dict:
    try:
        raw = quality_service.quality_report(dataset_id)
        ui = _quality_ui(dataset_id)
        raw["ui"] = ui
        return {"quality": raw}
    except DatasetError as exc: raise HTTPException(status_code=404, detail=str(exc)) from exc


@router.get("/{dataset_id}/quality-score")
async def quality_score(dataset_id: str) -> dict:
    try:
        result = score_service.score(dataset_id)
        return {"dataset_id": dataset_id, "quality_score": result["score"], "status": "calculated", "components": result["components"]}
    except DatasetError as exc: raise HTTPException(status_code=404, detail=str(exc)) from exc


@router.post("/{dataset_id}/clean/plan")
async def clean_plan(dataset_id: str, payload: dict) -> dict:
    try: return {"cleaning": clean_service.plan(dataset_id, _cleaning_operations(payload))}
    except DatasetError as exc: raise HTTPException(status_code=400, detail=str(exc)) from exc


@router.post("/{dataset_id}/clean")
async def clean_apply(dataset_id: str, payload: dict) -> dict:
    try: return {"cleaning": clean_service.apply(dataset_id, _cleaning_operations(payload))}
    except DatasetError as exc: raise HTTPException(status_code=400, detail=str(exc)) from exc


@router.get("/{dataset_id}/visualizations/recommend")
async def visualization_recommend(dataset_id: str) -> dict:
    try:
        raw = analysis_service.recommendations(dataset_id)
        recs = []
        for i, item in enumerate(raw["recommendations"]):
            recs.append({"id": f"chart-{i}", "title": f"{item['type'].title()} — {item['x']}{' vs ' + item['y'] if item.get('y') else ''}", "type": item["type"], "x_axis": item["x"], "y_axis": item.get("y", ""), "reason": item["reason"]})
        return {"visualizations": recs}
    except DatasetError as exc: raise HTTPException(status_code=404, detail=str(exc)) from exc


@router.get("/{dataset_id}/visualizations/data")
async def visualization_data(dataset_id: str, chart_type: str, x: str, y: str | None = None) -> dict:
    try: return {"chart": analysis_service.chart_data(dataset_id, chart_type, x, y)}
    except DatasetError as exc: raise HTTPException(status_code=400, detail=str(exc)) from exc


@router.get("/{dataset_id}/dashboard")
async def dashboard(dataset_id: str) -> dict:
    try:
        raw = analysis_service.dashboard(dataset_id)
        recs = (await visualization_recommend(dataset_id))["visualizations"]
        charts = []
        for rec in recs[:2]:
            chart = analysis_service.chart_data(dataset_id, rec["type"], rec["x_axis"], rec.get("y_axis") or None)
            charts.append({"chart_id": rec["id"], "title": rec["title"], "type": chart["type"], "x_axis": chart["x"], "y_axis": chart.get("y", ""), "data": chart["points"]})
        kpis = [{"id": f"metric-{i}", "label": m["name"], "value": m["value"], "trend": "Dataset total", "subtext": m["aggregation"]} for i, m in enumerate(raw["metrics"][:4])]
        insights = [{"id": "insight-1", "title": "Deterministic dataset summary", "finding": f"The dataset contains {sum(1 for _ in _read(_dataset_path(dataset_id)).columns)} columns and {len(_read(_dataset_path(dataset_id)))} rows. Findings are generated from the uploaded data only.", "category": "Data Summary"}]
        return {"dashboard": {"dataset_id": dataset_id, "kpis": kpis, "charts": charts, "insights": insights}}
    except DatasetError as exc: raise HTTPException(status_code=404, detail=str(exc)) from exc


@router.get("/{dataset_id}/preview")
async def preview_dataset(dataset_id: str, page: int = Query(1, ge=1), page_size: int = Query(15, ge=1, le=100), search: str = "", sort_by: str = "", sort_dir: str = "asc") -> dict:
    try:
        df = _read(_dataset_path(dataset_id))
        if search:
            mask = df.astype(str).apply(lambda col: col.str.contains(search, case=False, na=False, regex=False)).any(axis=1)
            df = df.loc[mask]
        if sort_by and sort_by in df.columns:
            df = df.sort_values(sort_by, ascending=sort_dir.lower() != "desc", na_position="last")
        total = len(df); total_pages = max(1, (total + page_size - 1) // page_size)
        page = min(page, total_pages)
        start = (page - 1) * page_size
        rows = []
        for record in df.iloc[start:start + page_size].to_dict(orient="records"):
            clean = {}
            for k, v in record.items():
                if pd.isna(v): clean[k] = None
                elif hasattr(v, "isoformat"): clean[k] = v.isoformat()
                elif hasattr(v, "item"): clean[k] = v.item()
                else: clean[k] = v
            rows.append(clean)
        return {"rows": rows, "total_rows": total, "page": page, "page_size": page_size, "total_pages": total_pages, "columns": [str(c) for c in df.columns]}
    except DatasetError as exc: raise HTTPException(status_code=404, detail=str(exc)) from exc


@router.get("/{dataset_id}/export")
async def export_dataset(dataset_id: str, format: str = "csv"):
    try:
        path = _dataset_path(dataset_id)
        fmt = format.lower()
        if fmt == "csv": return FileResponse(path if path.suffix.lower() == ".csv" else path.with_suffix(".csv"), media_type="text/csv", filename=f"data-forge-{dataset_id}.csv") if path.suffix.lower() == ".csv" else _export_source_as(path, dataset_id, "csv")
        if fmt == "xlsx": return _export_source_as(path, dataset_id, "xlsx")
        raise DatasetError("Unsupported export format. Use csv or xlsx.")
    except DatasetError as exc: raise HTTPException(status_code=400, detail=str(exc)) from exc


def _export_source_as(path: Path, dataset_id: str, fmt: str):
    df = _read(path)
    out = STORAGE_DIR / f"{dataset_id}-export.{fmt}"
    if fmt == "csv":
        df.to_csv(out, index=False)
        return FileResponse(out, media_type="text/csv", filename=f"data-forge-{dataset_id}.csv")
    df.to_excel(out, index=False, engine="openpyxl")
    return FileResponse(out, media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", filename=f"data-forge-{dataset_id}.xlsx")


@router.get("/cleaned/{cleaned_id}/export")
async def export_cleaned(cleaned_id: str, format: str = "csv"):
    if format.lower() not in {"csv", "xlsx"}: raise HTTPException(status_code=400, detail="Unsupported export format. Use csv or xlsx.")
    try: return export_service.cleaned_file(cleaned_id, format)
    except DatasetError as exc: raise HTTPException(status_code=404, detail=str(exc)) from exc
