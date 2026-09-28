from __future__ import annotations
from pathlib import Path
import re
import pandas as pd
from app.core.config import STORAGE_DIR
from app.services.dataset_service import DatasetError

class AnalysisService:
    def recommendations(self, dataset_id: str) -> dict:
        df = self._load(dataset_id)
        numeric = [str(c) for c in df.columns if pd.api.types.is_numeric_dtype(df[c])]
        dates = [str(c) for c in df.columns if self._is_date(df[c])]
        categorical = [str(c) for c in df.columns if c not in numeric and c not in dates]
        charts=[]
        if dates and numeric: charts.append({"type":"line","x":dates[0],"y":numeric[0],"reason":f"{dates[0]} is a date-like variable and {numeric[0]} is numerical, so a line chart can show change over time."})
        if categorical and numeric: charts.append({"type":"bar","x":categorical[0],"y":numeric[0],"reason":f"{categorical[0]} is categorical and {numeric[0]} is numerical, so a bar chart can compare groups."})
        if len(numeric)>=2: charts.append({"type":"scatter","x":numeric[0],"y":numeric[1],"reason":f"Both {numeric[0]} and {numeric[1]} are numerical, so a scatter plot can reveal their relationship."})
        if numeric: charts.append({"type":"histogram","x":numeric[0],"reason":f"{numeric[0]} is numerical, so a histogram can show its distribution."})
        return {"dataset_id":dataset_id,"numeric_columns":numeric,"categorical_columns":categorical,"date_columns":dates,"recommendations":charts}

    def dashboard(self,dataset_id:str)->dict:
        df=self._load(dataset_id); numeric=[c for c in df.columns if pd.api.types.is_numeric_dtype(df[c])]
        metrics=[]
        for c in numeric[:6]:
            metrics.append({"name":str(c),"value":self._num(df[c].sum()),"aggregation":"sum"})
        if len(df): metrics.append({"name":"Rows","value":int(len(df)),"aggregation":"count"})
        return {"dataset_id":dataset_id,"metrics":metrics}

    def chart_data(self, dataset_id: str, chart_type: str, x: str, y: str | None = None) -> dict:
        df=self._load(dataset_id)
        if x not in df.columns or (y and y not in df.columns): raise DatasetError("Selected chart columns were not found.")
        if chart_type in {"line","scatter"}:
            work=df[[x]+([y] if y else [])].copy()
            if chart_type=="line":
                work[x]=pd.to_datetime(work[x],errors="coerce",format="mixed")
                work[y]=pd.to_numeric(work[y],errors="coerce")
                work=work.dropna().sort_values(x).head(200)
                points=[{"x":str(r[x].date() if hasattr(r[x],"date") else r[x]),"y":float(r[y])} for _,r in work.iterrows()]
            else:
                work[x]=pd.to_numeric(work[x],errors="coerce"); work[y]=pd.to_numeric(work[y],errors="coerce"); work=work.dropna().head(300)
                points=[{"x":float(r[x]),"y":float(r[y])} for _,r in work.iterrows()]
            return {"type":chart_type,"x":x,"y":y,"points":points}
        if chart_type=="bar":
            work=df[[x,y]].copy(); work[y]=pd.to_numeric(work[y],errors="coerce"); work=work.dropna(); grouped=work.groupby(x,dropna=False)[y].sum().sort_values(ascending=False).head(12)
            return {"type":"bar","x":x,"y":y,"points":[{"x":str(k),"y":float(v)} for k,v in grouped.items()]}
        if chart_type=="histogram":
            vals=pd.to_numeric(df[x],errors="coerce").dropna()
            if vals.empty: return {"type":"histogram","x":x,"points":[]}
            bins_count=min(12,max(5,int(vals.nunique())))
            intervals=pd.cut(vals,bins=bins_count,include_lowest=True).value_counts().sort_index()
            return {"type":"histogram","x":x,"points":[{"x":str(interval),"y":int(count)} for interval,count in intervals.items()]}
        raise DatasetError("Unsupported chart type.")

    @staticmethod
    def _is_date(s):
        if pd.api.types.is_datetime64_any_dtype(s): return True
        if s.dtype==object and s.notna().any():
            name=str(s.name)
            parsed=pd.to_datetime(s.dropna().astype(str),errors="coerce",format="mixed")
            return len(parsed)>0 and (parsed.notna().mean()>=.9 or bool(re.search(r"date|time|dob|created|updated|joined",name,re.I)))
        return False
    @staticmethod
    def _num(v):
        return float(v) if pd.notna(v) else None
    @staticmethod
    def _load(dataset_id):
        if not re.fullmatch(r"[0-9a-fA-F-]{36}",dataset_id): raise DatasetError("Invalid dataset ID.")
        m=[p for p in STORAGE_DIR.glob(f"{dataset_id}.*") if p.suffix.lower() in {".csv",".xlsx"}]
        if not m: raise DatasetError("Dataset not found. Please upload it again.")
        p=m[0]; return pd.read_csv(p) if p.suffix.lower()==".csv" else pd.read_excel(p,engine="openpyxl")
