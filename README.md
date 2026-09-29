# Data Forge

**From raw data to meaningful insights.**

Data Forge is an analyst productivity platform that helps users turn CSV and XLSX datasets into analysis-ready information through profiling, data-quality analysis, deterministic cleaning, exploration, visualization, dashboards, and exports.

## Live Demo

**Website:** https://data-forge-lovat.vercel.app/

**Backend API:** https://data-forge-1-2bg9.onrender.com/

**API Documentation:** https://data-forge-1-2bg9.onrender.com/docs

---

## What Data Forge Does

Data Forge provides a structured workflow for working with raw datasets:

```text
RAW DATA
   ↓
UPLOAD
   ↓
PROFILE
   ↓
DATA QUALITY
   ↓
QUALITY SCORE
   ↓
CLEAN
   ↓
BEFORE / AFTER
   ↓
EXPLORE
   ↓
VISUALIZE
   ↓
DASHBOARD
   ↓
EXPORT
```

The goal is to make common data-analysis preparation tasks faster, more transparent, and reproducible without silently modifying the user's original dataset.

---

## Key Features

### Dataset Upload

* CSV and XLSX support
* Drag-and-drop upload
* File validation
* 10 MB upload limit
* Dataset metadata
* Sample dataset option
* Separate dataset storage

### Automatic Data Profiling

Data Forge automatically analyzes the uploaded dataset and reports:

* Number of rows
* Number of columns
* Numerical columns
* Categorical columns
* Date columns
* Missing cells
* Duplicate rows
* Empty rows
* Empty columns
* File size
* Column-level statistics

For numerical columns:

* Minimum
* Maximum
* Mean
* Median
* Standard deviation
* Unique values
* Missing values
* Top values

For date columns:

* Minimum date
* Maximum date
* Date range
* Missing values

### Data Quality Analysis

The quality engine checks for common dataset problems, including:

* Missing values
* Duplicate rows
* Empty rows
* Empty columns
* Incorrect data types
* Invalid dates
* Whitespace issues
* Text inconsistencies
* Outliers
* Constant columns
* Sparse columns
* Invalid categorical values

Data Quality checks identify issues but do not silently modify the source dataset.

### Quality Score

Data Forge provides a transparent quality score based on multiple dimensions of data quality, including:

* Completeness
* Consistency
* Uniqueness
* Validity

The score is intended as a practical indicator of dataset readiness rather than a replacement for analyst judgment.

### Data Cleaning

Supported cleaning operations include:

* Remove duplicate rows
* Remove empty rows
* Remove empty columns
* Remove rows with missing values
* Fill missing numerical values
* Fill missing categorical values
* Trim whitespace
* Standardize text capitalization
* Convert data types
* Parse dates
* Rename columns
* Remove selected columns

Cleaning operations can be previewed before they are applied.

The original dataset is not silently overwritten. Applying cleaning creates a separate cleaned dataset.

### Before / After Analysis

After cleaning, Data Forge provides comparison information such as:

* Row count before and after
* Column count before and after
* Missing values before and after
* Duplicate rows before and after
* Cleaning operations performed

### Cleaning Log

Each applied cleaning workflow records the operations performed so the transformation process remains understandable and reproducible.

### Data Exploration

Data Forge provides tools for exploring uploaded datasets through:

* Dataset preview
* Search
* Sorting
* Filtering
* Pagination
* Column-level information

### Visualization

Data Forge can recommend and generate visualizations based on the dataset.

Supported chart types include:

* Bar charts
* Line charts
* Scatter plots
* Histograms

Visualization recommendations are based on available data types and columns rather than hardcoded business assumptions.

### Automatic Dashboard

Data Forge can generate a dashboard from the uploaded dataset.

Depending on the available data, dashboards can include:

* KPI cards
* Trends
* Category analysis
* Regional analysis
* Distributions
* Interactive filters

Business metrics are generated from the available dataset rather than being hardcoded to one specific business domain.

### Export

Data Forge supports exporting analysis results and cleaned datasets.

The platform is designed so users can move from raw data to cleaned and analyzed outputs without manually rebuilding the workflow elsewhere.

---

## Technology Stack

### Frontend

* React
* TypeScript
* Vite
* Tailwind CSS
* Recharts

### Backend

* Python
* FastAPI
* pandas
* NumPy
* openpyxl

### API

* REST API
* OpenAPI
* FastAPI Swagger documentation

### Deployment

* Vercel — frontend
* Render — backend API
* GitHub — source code and version control

### Storage

The current V1 implementation uses file-based storage.

PostgreSQL and persistent/object storage can be introduced in future versions when persistent multi-user workspaces and larger-scale storage requirements are added.

---

## Architecture

```text
                 DATA FORGE
                     │
          ┌──────────┴──────────┐
          │                     │
          ▼                     ▼
   React + Vite            FastAPI REST API
   TypeScript              Python
   Tailwind CSS            pandas / NumPy
   Recharts                openpyxl
          │                     │
          └──────────┬──────────┘
                     │
                     ▼
              Dataset Pipeline
                     │
       ┌─────────────┼─────────────┐
       ▼             ▼             ▼
    Profile       Quality       Cleaning
       │             │             │
       └─────────────┼─────────────┘
                     ▼
               Exploration
                     │
                     ▼
              Visualization
                     │
                     ▼
                Dashboard
                     │
                     ▼
                  Export
```

---

## Project Structure

```text
Data-Forge/
│
├── backend/
│   ├── app/
│   │   ├── api/
│   │   ├── core/
│   │   ├── models/
│   │   ├── schemas/
│   │   └── services/
│   │
│   ├── tests/
│   ├── storage/
│   ├── requirements.txt
│   └── runtime.txt
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   └── App.tsx
│   │
│   ├── package.json
│   └── vite.config.ts
│
├── docs/
│   ├── architecture/
│   ├── stages/
│   └── ...
│
├── sample-data/
│
├── .env.example
├── .gitignore
├── .python-version
├── LICENSE
└── README.md
```

---

## API Overview

The backend exposes REST endpoints for the main Data Forge workflow.

### Dataset

```text
POST /api/datasets/upload
POST /api/datasets/sample
GET  /api/datasets/{dataset_id}/profile
GET  /api/datasets/{dataset_id}/quality
GET  /api/datasets/{dataset_id}/quality-score
GET  /api/datasets/{dataset_id}/preview
```

### Cleaning

```text
POST /api/datasets/{dataset_id}/clean/plan
POST /api/datasets/{dataset_id}/clean
```

### Visualization

```text
GET /api/datasets/{dataset_id}/visualization/recommend
GET /api/datasets/{dataset_id}/visualization/data
GET /api/datasets/{dataset_id}/dashboard
```

### Export

```text
GET /api/datasets/{dataset_id}/export
GET /api/datasets/{dataset_id}/cleaned/export
```

### Health

```text
GET /api/health
```

Interactive API documentation is available at:

`https://data-forge-1-2bg9.onrender.com/docs`

---

## Run Locally on Windows

### Requirements

Install:

* Python 3.13+
* Node.js
* npm
* Git

### 1. Clone the repository

```powershell
git clone https://github.com/hussainmalik-web/Data-Forge.git
cd Data-Forge
```

### 2. Start the backend

Open PowerShell inside the `backend` directory:

```powershell
cd backend
python -m pip install -r requirements.txt
python -m uvicorn app.main:app --reload
```

The backend will run at:

```text
http://localhost:8000
```

API documentation:

```text
http://localhost:8000/docs
```

### 3. Start the frontend

Open a second PowerShell window:

```powershell
cd frontend
npm install
npm run dev
```

The frontend will run at:

```text
http://localhost:5173
```

### 4. Test the backend

From the `backend` directory:

```powershell
pytest
```

---

## Environment Variables

Configuration is handled through environment variables.

Example configuration:

```env
BACKEND_HOST=0.0.0.0
BACKEND_PORT=8000
MAX_UPLOAD_SIZE_MB=10
PREVIEW_ROWS=25
STORAGE_DIR=/app/storage
CORS_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
VITE_API_URL=http://localhost:8000
```

Use `.env.example` as the starting point for local configuration.

Do not commit real secrets or private credentials to the repository.

---

## Data Handling Principles

Data Forge follows several important principles:

* The original dataset should not be silently overwritten.
* Cleaning operations require explicit application.
* Cleaning changes are recorded in a cleaning log.
* Quality checks are separated from data modification.
* Calculations are deterministic wherever possible.
* The platform should not fabricate statistics or insights.
* Analysis should be based on the uploaded dataset.
* API and frontend errors should be surfaced clearly to the user.

The current V1 implementation uses temporary/file-based storage and is not designed as a permanent enterprise data warehouse.

Users should avoid uploading confidential or sensitive information to a public deployment unless the deployment has been configured with appropriate security and data-retention controls.

---

## Current V1 Scope

The current V1 focuses on the core analyst workflow:

* CSV/XLSX upload
* Dataset preview
* Automatic profiling
* Data-quality detection
* Quality scoring
* Cleaning operations
* Cleaning preview
* User-approved cleaning
* Before/after comparison
* Cleaning log
* Visualization recommendations
* Charts
* Automatic dashboard
* Dataset exports
* Quality reports
* REST API
* Swagger/OpenAPI documentation

---

## Future Development

Planned areas for future versions include:

* Persistent project workspaces
* Database-backed storage
* Larger dataset handling
* Advanced visualization controls
* Ask Your Data
* Natural-language data analysis
* SQL Assistant
* Python Assistant
* Business Analyst toolkit
* Automated reporting
* More export formats
* Advanced data-quality rules
* Authentication and user accounts
* Improved privacy and security controls
* Collaboration features

Future AI functionality will be designed to assist with language understanding, planning, explanations, and workflow assistance while keeping numerical analysis grounded in the underlying dataset.

---

## Development Philosophy

Data Forge is designed around a simple principle:

> **Raw data should become understandable before it becomes actionable.**

The platform separates:

```text
Data
 ↓
Information
 ↓
Analysis
 ↓
Insights
 ↓
Decision Support
```

This separation helps keep the workflow explainable and reduces the risk of hidden transformations or unsupported conclusions.

---

## License

This project is licensed under the **MIT License**.

See [LICENSE](LICENSE) for the complete license text.

---

## Project Status

**Current status: V1 deployed**

Frontend:

**Vercel**

Backend:

**Render**

Source code:

**GitHub**

Live application:

**https://data-forge-lovat.vercel.app/**

---

## Author

**Hussain**

GitHub:
https://github.com/hussainmalik-web
