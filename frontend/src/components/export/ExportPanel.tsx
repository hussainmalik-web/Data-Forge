import React, { useState } from 'react';
import { getExportDownloadUrl } from '../../services/api';
import { DatasetProfile, DatasetQuality } from '../../types/dataset';

interface ExportPanelProps {
  datasetId: string;
  cleanedId?: string;
  profile: DatasetProfile;
  quality: DatasetQuality;
}

export const ExportPanel: React.FC<ExportPanelProps> = ({
  datasetId,
  cleanedId,
  profile,
  quality,
}) => {
  const [downloadingFormat, setDownloadingFormat] = useState<string | null>(null);

  const handleDownload = (format: 'csv' | 'xlsx') => {
    setDownloadingFormat(format);
    const url = getExportDownloadUrl(datasetId, format, cleanedId);
    window.location.href = url;
    setTimeout(() => {
      setDownloadingFormat(null);
    }, 1200);
  };

  const handleDownloadAuditReport = () => {
    const report = {
      platform: 'Data Forge',
      generated_at: new Date().toISOString(),
      dataset_id: datasetId,
      dataset_name: profile.name,
      rows: profile.rows,
      columns: profile.columns,
      cleanliness_score: `${profile.cleanliness_percentage}%`,
      quality_score: `${quality.overall_score}/100`,
      dimensions: quality.dimensions,
      actionable_issues: quality.issues,
      schema_breakdown: profile.schema.map((s) => ({
        column: s.name,
        type: s.type,
        unique: s.unique_count,
        missing: s.missing_count,
      })),
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `data_forge_quality_report_${datasetId}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      {/* Top Banner */}
      <div className="bg-[#141c2b] border border-[#243042] rounded-xl p-4 shadow-md flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <span className="material-symbols-outlined text-2xl">output</span>
          </div>
          <div>
            <h2 className="text-sm font-semibold text-slate-100">
              Pipeline Export &amp; Quality Report
            </h2>
            <p className="text-xs text-slate-400">
              Download the source dataset or the cleaned version after an approved cleaning run.
            </p>
          </div>
        </div>

        <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-semibold bg-emerald-950/70 border border-emerald-500/40 text-emerald-400">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          Dataset Ready
        </span>
      </div>

      {/* Export Format Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* CSV Card */}
        <div className="bg-[#141d2e] border border-slate-800 rounded-xl p-4 flex flex-col justify-between space-y-4 hover:border-cyan-500/40 transition-colors">
          <div>
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-bold text-cyan-400 bg-cyan-950/60 border border-cyan-500/30 px-2 py-0.5 rounded">
                CSV FORMAT
              </span>
              <span className="text-[11px] font-mono text-slate-400">{profile.file_size}</span>
            </div>
            <h3 className="text-sm font-semibold text-slate-100 mt-2">{cleanedId ? 'Cleaned CSV' : 'Source CSV'}</h3>
            <p className="text-[11px] text-slate-400 mt-1">
              Download the {cleanedId ? 'cleaned' : 'source'} dataset as CSV.
            </p>
          </div>
          <button
            onClick={() => handleDownload('csv')}
            disabled={downloadingFormat === 'csv'}
            className="w-full py-2 px-3 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shadow-[0_0_12px_rgba(6,182,212,0.3)] active:scale-95 disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-base">download</span>
            <span>{downloadingFormat === 'csv' ? 'Preparing CSV...' : 'Download CSV'}</span>
          </button>
        </div>

        {/* XLSX Card */}
        <div className="bg-[#141d2e] border border-slate-800 rounded-xl p-4 flex flex-col justify-between space-y-4 hover:border-cyan-500/40 transition-colors">
          <div>
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded">
                EXCEL WORKBOOK
              </span>
              <span className="text-[11px] font-mono text-slate-400">XLSX</span>
            </div>
            <h3 className="text-sm font-semibold text-slate-100 mt-2">{cleanedId ? 'Cleaned Excel XLSX' : 'Source Excel XLSX'}</h3>
            <p className="text-[11px] text-slate-400 mt-1">
              Download the {cleanedId ? 'cleaned' : 'source'} dataset as an Excel workbook.
            </p>
          </div>
          <button
            onClick={() => handleDownload('xlsx')}
            disabled={downloadingFormat === 'xlsx'}
            className="w-full py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 hover:border-emerald-500/50 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all active:scale-95 disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-base text-emerald-400">table_view</span>
            <span>{downloadingFormat === 'xlsx' ? 'Building XLSX...' : 'Download XLSX'}</span>
          </button>
        </div>

        {/* Quality Report */}
        <div className="bg-[#141d2e] border border-slate-800 rounded-xl p-4 flex flex-col justify-between space-y-4 hover:border-cyan-500/40 transition-colors">
          <div>
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-bold text-purple-400 bg-purple-950/60 border border-purple-500/30 px-2 py-0.5 rounded">
                AUDIT TELEMETRY
              </span>
              <span className="text-[11px] font-mono text-slate-400">JSON</span>
            </div>
            <h3 className="text-sm font-semibold text-slate-100 mt-2">Quality &amp; Hygiene Ledger</h3>
            <p className="text-[11px] text-slate-400 mt-1">
              Download the generated quality report with detected issues and quality metrics.
            </p>
          </div>
          <button
            onClick={handleDownloadAuditReport}
            className="w-full py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 hover:border-purple-500/50 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all active:scale-95"
          >
            <span className="material-symbols-outlined text-base text-purple-400">description</span>
            <span>Export Quality JSON</span>
          </button>
        </div>
      </div>

      {/* Export integrity summary */}
      <div className="bg-[#141d2e] border border-slate-800 rounded-xl p-4 space-y-3">
        <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider">
          Export Integrity
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
          <div className="p-2.5 rounded bg-[#0f172a] border border-slate-800 flex items-center gap-2">
            <span className="material-symbols-outlined text-emerald-400 text-base">check_circle</span>
            <span className="text-slate-300">Original source remains unchanged by export.</span>
          </div>
          <div className="p-2.5 rounded bg-[#0f172a] border border-slate-800 flex items-center gap-2">
            <span className="material-symbols-outlined text-emerald-400 text-base">description</span>
            <span className="text-slate-300">Choose CSV or XLSX for the available dataset version.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
