from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_upload_csv():
    content = b"name,age,sales\nAlice,21,100\nBob,25,200\n"
    response = client.post(
        "/api/datasets/upload",
        files={"file": ("sample.csv", content, "text/csv")},
    )
    assert response.status_code == 200
    data = response.json()["dataset"]
    assert data["rows"] == 2
    assert data["columns"] == 3
    assert len(data["preview_rows"]) == 2


def test_rejects_unsupported_extension():
    response = client.post(
        "/api/datasets/upload",
        files={"file": ("sample.txt", b"hello", "text/plain")},
    )
    assert response.status_code == 400
    assert "CSV or XLSX" in response.json()["detail"]


def test_profile_dataset():
    content = b"name,age,sales,joined\nAlice,21,100,2026-01-01\nBob,25,200,2026-01-03\nBob,25,200,2026-01-03\nCara,30,,2026-01-05\n"
    upload = client.post("/api/datasets/upload", files={"file": ("profile.csv", content, "text/csv")})
    assert upload.status_code == 200
    dataset_id = upload.json()["dataset"]["id"]

    response = client.get(f"/api/datasets/{dataset_id}/profile")
    assert response.status_code == 200
    profile = response.json()["profile"]
    assert profile["rows"] == 4
    assert profile["columns"] == 4
    assert profile["missing_cells"] == 1
    assert profile["duplicate_rows"] == 1
    assert profile["numerical_columns"] == 2
    assert profile["date_columns"] == 1
    assert profile["categorical_columns"] == 1


def test_quality_report_detects_common_issues():
    content = b"name,age,city,joined\n Alice,21,Indore,2026-01-01\nAlice,21,indore,2026-01-01\nBob,,Ujjain,not-a-date\nBob,,Ujjain,not-a-date\n,,,\n"
    upload = client.post("/api/datasets/upload", files={"file": ("quality.csv", content, "text/csv")})
    assert upload.status_code == 200
    dataset_id = upload.json()["dataset"]["id"]

    response = client.get(f"/api/datasets/{dataset_id}/quality")
    assert response.status_code == 200
    quality = response.json()["quality"]
    assert quality["issue_count"] > 0
    assert quality["summary"]["duplicate_rows"] >= 1
    assert quality["summary"]["missing_values"] >= 1
    assert quality["summary"]["leading_trailing_spaces"] >= 1
    assert quality["summary"]["inconsistent_capitalization"] >= 1
    assert quality["summary"]["invalid_dates"] >= 1
    assert "disclaimer" in quality


def test_quality_does_not_modify_source_data():
    content = b"name,value\nA,10\nA,10\n"
    upload = client.post("/api/datasets/upload", files={"file": ("unchanged.csv", content, "text/csv")})
    dataset_id = upload.json()["dataset"]["id"]
    first = client.get(f"/api/datasets/{dataset_id}/profile").json()["profile"]
    client.get(f"/api/datasets/{dataset_id}/quality")
    second = client.get(f"/api/datasets/{dataset_id}/profile").json()["profile"]
    assert first == second


def test_cleaning_fills_numeric_and_categorical_missing_values():
    content = b"name,age,sales,city\nAlice,20,100,Indore\nBob,,200,\nCara,30,,Ujjain\n"
    upload = client.post("/api/datasets/upload", files={"file": ("clean.csv", content, "text/csv")})
    assert upload.status_code == 200
    dataset_id = upload.json()["dataset"]["id"]

    payload = {
        "operations": [
            {"type": "fill_missing_numeric", "method": "median"},
            {"type": "fill_missing_categorical", "value": "Unknown"},
        ]
    }
    plan = client.post(f"/api/datasets/{dataset_id}/clean/plan", json=payload)
    assert plan.status_code == 200
    cleaning = plan.json()["cleaning"]
    assert cleaning["before"]["missing_cells"] == 3
    assert cleaning["after"]["missing_cells"] == 0
    assert cleaning["preview_rows"][1]["age"] == 25
    assert cleaning["preview_rows"][1]["city"] == "Unknown"
    assert cleaning["preview_rows"][2]["sales"] == 150

    applied = client.post(f"/api/datasets/{dataset_id}/clean", json=payload)
    assert applied.status_code == 200
    assert applied.json()["cleaning"]["cleaned_id"]


def test_cleaning_handles_numeric_values_stored_as_text():
    content = b"item,amount\nA,100\nB,\nC,300\n"
    upload = client.post("/api/datasets/upload", files={"file": ("textnum.csv", content, "text/csv")})
    assert upload.status_code == 200
    dataset_id = upload.json()["dataset"]["id"]

    plan = client.post(
        f"/api/datasets/{dataset_id}/clean/plan",
        json={"operations": [{"type": "fill_missing_numeric", "method": "median"}]},
    )
    assert plan.status_code == 200
    result = plan.json()["cleaning"]
    assert result["after"]["missing_cells"] == 0
    assert result["preview_rows"][1]["amount"] == 200


def test_cleaning_text_and_duplicates():
    content = b"name,city\n Alice ,Indore\nAlice,Indore\nBob, Ujjain \n"
    upload = client.post("/api/datasets/upload", files={"file": ("textclean.csv", content, "text/csv")})
    assert upload.status_code == 200
    dataset_id = upload.json()["dataset"]["id"]

    payload = {
        "operations": [
            {"type": "trim_whitespace"},
            {"type": "standardize_text", "mode": "lower"},
            {"type": "remove_duplicates"},
        ]
    }
    plan = client.post(f"/api/datasets/{dataset_id}/clean/plan", json=payload)
    assert plan.status_code == 200
    result = plan.json()["cleaning"]
    assert result["after"]["rows"] == 2
    assert result["preview_rows"][0]["name"] == "alice"
    assert result["preview_rows"][0]["city"] == "indore"


def test_studio_compatibility_profile_quality_and_score_contracts():
    content = b"name,age,city\nAlice,20,Indore\nBob,,Ujjain\n"
    upload = client.post("/api/datasets/upload", files={"file": ("contract.csv", content, "text/csv")})
    assert upload.status_code == 200
    dataset_id = upload.json()["dataset"]["id"]

    profile = client.get(f"/api/datasets/{dataset_id}/profile")
    assert profile.status_code == 200
    assert profile.json()["profile"]["ui"]["schema"]

    quality = client.get(f"/api/datasets/{dataset_id}/quality")
    assert quality.status_code == 200
    assert "dimensions" in quality.json()["quality"]["ui"]

    score = client.get(f"/api/datasets/{dataset_id}/quality-score")
    assert score.status_code == 200
    assert "quality_score" in score.json()


def test_cleaning_supports_zero_mode_and_forward_fill():
    content = b"amount,city\n10,Indore\n,Indore\n20,\n"
    upload = client.post("/api/datasets/upload", files={"file": ("methods.csv", content, "text/csv")})
    assert upload.status_code == 200
    dataset_id = upload.json()["dataset"]["id"]

    zero = client.post(
        f"/api/datasets/{dataset_id}/clean/plan",
        json={"operations": [{"type": "fill_missing_numeric", "method": "mean", "zero_fill": True}]},
    )
    assert zero.status_code == 200
    assert zero.json()["cleaning"]["preview_rows"][1]["amount"] == 0

    mode = client.post(
        f"/api/datasets/{dataset_id}/clean/plan",
        json={"operations": [{"type": "fill_missing_categorical", "value": "__MODE__", "columns": ["city"]}]},
    )
    assert mode.status_code == 200
    assert mode.json()["cleaning"]["preview_rows"][2]["city"] == "Indore"

    ffill = client.post(
        f"/api/datasets/{dataset_id}/clean/plan",
        json={"operations": [{"type": "fill_missing_categorical", "value": "__FFILL__", "columns": ["city"]}]},
    )
    assert ffill.status_code == 200
    assert ffill.json()["cleaning"]["preview_rows"][2]["city"] == "Indore"


def test_preview_visualization_dashboard_and_export_contracts():
    content = b"category,value\nA,10\nB,20\nA,30\n"
    upload = client.post("/api/datasets/upload", files={"file": ("explore.csv", content, "text/csv")})
    assert upload.status_code == 200
    dataset_id = upload.json()["dataset"]["id"]

    preview = client.get(f"/api/datasets/{dataset_id}/preview?page=1&page_size=2")
    assert preview.status_code == 200
    assert preview.json()["total_rows"] == 3
    assert len(preview.json()["rows"]) == 2

    recs = client.get(f"/api/datasets/{dataset_id}/visualizations/recommend")
    assert recs.status_code == 200
    assert recs.json()["visualizations"]

    rec = recs.json()["visualizations"][0]
    chart = client.get(
        f"/api/datasets/{dataset_id}/visualizations/data",
        params={"chart_type": rec["type"], "x": rec["x_axis"], "y": rec.get("y_axis") or None},
    )
    assert chart.status_code == 200
    assert "chart" in chart.json()

    dashboard = client.get(f"/api/datasets/{dataset_id}/dashboard")
    assert dashboard.status_code == 200
    assert "kpis" in dashboard.json()["dashboard"]

    exported = client.get(f"/api/datasets/{dataset_id}/export?format=csv")
    assert exported.status_code == 200
    assert exported.headers["content-type"].startswith("text/csv")


def test_sample_dataset_endpoint_creates_a_real_dataset():
    response = client.post("/api/datasets/sample")
    assert response.status_code == 200
    body = response.json()
    assert body["dataset_id"]
    assert body["rows"] > 0
    assert body["columns"] > 0


def test_cleaning_supports_full_operation_set_and_preserves_source():
    content = b"amount,city,joined,empty,remove_me\n10, Indore ,2026-01-01,,x\n,,not-a-date,,y\n20,Ujjain,2026-01-03,,z\n20,Ujjain,2026-01-03,,z\n"
    upload = client.post("/api/datasets/upload", files={"file": ("fullclean.csv", content, "text/csv")})
    assert upload.status_code == 200
    dataset_id = upload.json()["dataset"]["id"]

    operations = [
        {"type": "remove_duplicates"},
        {"type": "fill_missing_numeric", "method": "median", "columns": ["amount"]},
        {"type": "fill_missing_categorical", "value": "Unknown", "columns": ["city"]},
        {"type": "trim_whitespace"},
        {"type": "standardize_text", "mode": "title"},
        {"type": "parse_dates", "columns": ["joined"]},
        {"type": "remove_empty_columns"},
        {"type": "remove_columns", "columns": ["remove_me"]},
        {"type": "rename_columns", "mapping": {"amount": "revenue"}},
    ]
    plan = client.post(f"/api/datasets/{dataset_id}/clean/plan", json={"operations": operations})
    assert plan.status_code == 200
    result = plan.json()["cleaning"]
    assert result["before"]["rows"] == 4
    assert result["after"]["rows"] == 3
    assert result["after"]["columns"] == 3
    assert result["preview_rows"][0]["city"] == "Indore"
    assert "revenue" in result["preview_rows"][0]

    source = client.get(f"/api/datasets/{dataset_id}/profile")
    assert source.status_code == 200
    assert source.json()["profile"]["columns"] == 5


def test_cleaned_copy_reflects_parse_rename_and_remove_operations():
    content = b"order_date,amount,keep_me,remove_me\n2026-01-05,10,A,x\n2026-02-10,20,B,y\n"
    upload = client.post("/api/datasets/upload", files={"file": ("targeted.csv", content, "text/csv")})
    assert upload.status_code == 200
    dataset_id = upload.json()["dataset"]["id"]

    response = client.post(
        f"/api/datasets/{dataset_id}/clean",
        json={"operations": [
            {"type": "parse_dates", "columns": ["order_date"]},
            {"type": "rename_columns", "mapping": {"amount": "revenue"}},
            {"type": "remove_columns", "columns": ["remove_me"]},
        ]},
    )
    assert response.status_code == 200
    cleaned_id = response.json()["cleaning"]["cleaned_id"]

    profile = client.get(f"/api/datasets/{cleaned_id}/profile")
    assert profile.status_code == 200
    ui = profile.json()["profile"]["ui"]
    names = [column["name"] for column in ui["schema"]]
    assert "order_date" in names
    assert "revenue" in names
    assert "remove_me" not in names
    assert "order_date" in ui["date_columns"]


def test_cleaning_rejects_empty_operation_list():
    content = b"a,b\n1,2\n"
    upload = client.post("/api/datasets/upload", files={"file": ("noop.csv", content, "text/csv")})
    dataset_id = upload.json()["dataset"]["id"]
    response = client.post(f"/api/datasets/{dataset_id}/clean", json={"operations": []})
    assert response.status_code == 400
    assert "Select at least one" in response.json()["detail"]
