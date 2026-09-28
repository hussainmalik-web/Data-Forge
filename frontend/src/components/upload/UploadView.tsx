import React, { useState, useRef } from 'react';
import { uploadDataset, loadSampleDataset } from '../../services/api';

interface UploadViewProps {
  onDatasetLoaded: (datasetId: string, name: string) => void;
  onCancel?: () => void;
}

export const UploadView: React.FC<UploadViewProps> = ({ onDatasetLoaded, onCancel }) => {
  const [dragActive, setDragActive] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<
    'idle' | 'uploading' | 'processing' | 'profiling' | 'ready' | 'error'
  >('idle');
  const [progressPercent, setProgressPercent] = useState(0);
  const [activeFilename, setActiveFilename] = useState('');
  const [activeFileSize, setActiveFileSize] = useState('');
  const [datasetResult, setDatasetResult] = useState<{
    id: string;
    name: string;
    rows: number;
    columns: number;
  } | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleProcessFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleProcessFile(e.target.files[0]);
    }
  };

  const handleProcessFile = async (file: File) => {
    setActiveFilename(file.name);
    const sizeKb = file.size / 1024;
    setActiveFileSize(sizeKb > 1024 ? `${(sizeKb / 1024).toFixed(1)} MB` : `${Math.round(sizeKb)} KB`);
    setErrorMessage(null);
    setUploadStatus('uploading');
    setProgressPercent(25);

    try {
      // Step 1: Upload
      const res = await uploadDataset(file);
      setUploadStatus('processing');
      setProgressPercent(50);

      setTimeout(() => {
        setUploadStatus('profiling');
        setProgressPercent(82);

        setTimeout(() => {
          setUploadStatus('ready');
          setProgressPercent(100);
          setDatasetResult({
            id: res.dataset_id,
            name: res.name,
            rows: res.rows,
            columns: res.columns,
          });
        }, 600);
      }, 500);
    } catch (err: any) {
      setUploadStatus('error');
      setErrorMessage(err.message || 'Failed to upload or parse dataset.');
    }
  };

  const handleLoadSample = async () => {
    setActiveFilename('sales_data.csv');
    setActiveFileSize('Sample dataset');
    setErrorMessage(null);
    setUploadStatus('uploading');
    setProgressPercent(30);

    try {
      const res = await loadSampleDataset();
      setUploadStatus('processing');
      setProgressPercent(60);

      setTimeout(() => {
        setUploadStatus('profiling');
        setProgressPercent(88);

        setTimeout(() => {
          setUploadStatus('ready');
          setProgressPercent(100);
          setDatasetResult({
            id: res.dataset_id,
            name: res.name,
            rows: res.rows,
            columns: res.columns,
          });
        }, 500);
      }, 400);
    } catch (err: any) {
      setUploadStatus('error');
      setErrorMessage(err.message || 'Failed to load sample dataset.');
    }
  };

  return (
    <div className="max-w-xl mx-auto space-y-4 pb-12">
      {/* Hero / Stage Introduction Card */}
      <div className="bg-[#141d2e] rounded-xl border border-slate-800 p-4 shadow-xl shadow-black/30">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-base font-semibold text-slate-100">Upload your dataset</h2>
            <p className="text-xs text-slate-400 mt-1">
              Upload a CSV or Excel file to start your analysis. Automatic profiling, schema validation, and statistical null inference will trigger automatically.
            </p>
          </div>
          {onCancel && (
            <button
              onClick={onCancel}
              className="text-slate-500 hover:text-slate-300 p-1"
              title="Close Upload"
            >
              <span className="material-symbols-outlined text-base">close</span>
            </button>
          )}
        </div>

        {/* Drag & Drop Upload Zone */}
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`mt-4 relative border-2 border-dashed rounded-xl p-6 text-center transition-all cursor-pointer group shadow-inner ${
            dragActive
              ? 'border-cyan-400 bg-cyan-950/20'
              : 'border-slate-800 hover:border-cyan-500/80 bg-[#0f172a]/80 hover:bg-[#182238]/60'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv, .xlsx"
            onChange={handleFileInputChange}
            className="hidden"
          />

          <div className="flex flex-col items-center justify-center space-y-2.5">
            <div className="w-12 h-12 rounded-full bg-[#182238] border border-slate-700 text-cyan-400 flex items-center justify-center shadow-lg group-hover:scale-105 group-hover:border-cyan-400/50 group-hover:shadow-cyan-500/20 transition-all duration-200">
              <span className="material-symbols-outlined text-[26px]">cloud_upload</span>
            </div>
            <div className="space-y-1">
              <p className="text-xs font-semibold text-slate-100">
                Drag &amp; drop your file here or{' '}
                <span className="text-cyan-400 underline hover:text-cyan-300">
                  tap to Browse Files
                </span>
              </p>
              <p className="text-[11px] text-slate-400">
                Quickly import structured tables for exploratory analysis
              </p>
            </div>

            {/* Format Pills */}
            <div className="flex items-center gap-2 pt-1 flex-wrap justify-center">
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-mono bg-[#141d2e] text-slate-400 border border-slate-700 font-medium">
                CSV
              </span>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-mono bg-[#141d2e] text-slate-400 border border-slate-700 font-medium">
                XLSX
              </span>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-mono bg-cyan-950/60 border border-cyan-500/30 text-cyan-400 font-medium">
                Max file size: 10 MB
              </span>
            </div>
          </div>
        </div>

        {/* Sample Dataset Button Box */}
        <div className="mt-4 p-3 bg-[#0f172a] rounded-lg border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-md bg-[#182238] flex items-center justify-center text-cyan-400 shrink-0 border border-slate-700">
              <span className="material-symbols-outlined text-[18px]">analytics</span>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-200">Don't have a dataset?</p>
              <p className="text-[11px] text-slate-400">
                Try the bundled sample sales dataset
              </p>
            </div>
          </div>

          <button
            onClick={handleLoadSample}
            disabled={uploadStatus === 'uploading' || uploadStatus === 'processing'}
            className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#182238] border border-slate-700 hover:border-cyan-500/60 text-cyan-300 hover:text-white text-xs font-medium transition-all shadow-sm active:scale-[0.98] disabled:opacity-50"
            type="button"
          >
            <span className="material-symbols-outlined text-[15px]">download</span>
            <span>Load Sample Dataset</span>
          </button>
        </div>
      </div>

      {/* Active Upload & Processing State Card */}
      {(uploadStatus === 'uploading' ||
        uploadStatus === 'processing' ||
        uploadStatus === 'profiling') && (
        <div className="bg-[#141d2e] rounded-xl border border-slate-800 p-4 shadow-xl shadow-black/30 relative overflow-hidden">
          {/* Top Accent Progress Bar */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-slate-900">
            <div
              style={{ width: `${progressPercent}%` }}
              className="h-full bg-gradient-to-r from-cyan-500 to-sky-400 transition-all duration-300 shadow-sm shadow-cyan-500/50"
            ></div>
          </div>

          <div className="flex items-start justify-between pt-1">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#0f172a] border border-slate-800 flex items-center justify-center text-cyan-400 font-bold shadow-inner">
                <span className="material-symbols-outlined text-[20px]">description</span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xs font-semibold text-slate-100">{activeFilename}</h3>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-mono bg-[#0f172a] text-slate-400 border border-slate-800">
                    {activeFileSize} • CSV
                  </span>
                </div>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-400"></span>
                  </span>
                  <span className="text-xs font-semibold text-cyan-400">
                    {uploadStatus === 'uploading'
                      ? 'Uploading payload to in-memory sandbox...'
                      : uploadStatus === 'processing'
                      ? 'Parsing tabular structure...'
                      : 'Profiling Schema & Quality Metrics...'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Stepper Progress */}
          <div className="mt-4 pt-2">
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="text-slate-400 font-medium">Pipeline Progress</span>
              <span className="font-mono text-xs font-semibold text-cyan-400">
                {progressPercent}% complete
              </span>
            </div>
            <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-slate-800">
              <div
                style={{ width: `${progressPercent}%` }}
                className="bg-gradient-to-r from-cyan-500 to-sky-400 h-full rounded-full transition-all duration-300"
              ></div>
            </div>

            {/* 4 Sequential Stages */}
            <div className="grid grid-cols-4 gap-1 mt-3">
              <div className="flex flex-col items-center text-center">
                <div className="w-6 h-6 rounded-full bg-emerald-950/80 border border-emerald-500/50 text-emerald-400 flex items-center justify-center text-xs mb-1">
                  <span className="material-symbols-outlined text-[14px]">check</span>
                </div>
                <span className="text-[11px] font-semibold text-slate-200">Uploading</span>
                <span className="text-[10px] font-mono text-emerald-400">Done</span>
              </div>

              <div className="flex flex-col items-center text-center">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs mb-1 ${
                    uploadStatus === 'processing' || uploadStatus === 'profiling'
                      ? 'bg-emerald-950/80 border border-emerald-500/50 text-emerald-400'
                      : 'bg-slate-900 border border-slate-800 text-slate-600'
                  }`}
                >
                  <span className="material-symbols-outlined text-[14px]">check</span>
                </div>
                <span className="text-[11px] font-semibold text-slate-200">Processing</span>
                <span className="text-[10px] font-mono text-emerald-400">Done</span>
              </div>

              <div className="flex flex-col items-center text-center">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center mb-1 ${
                    uploadStatus === 'profiling'
                      ? 'bg-cyan-950/80 border border-cyan-400 text-cyan-400 shadow-sm shadow-cyan-500/30'
                      : 'bg-slate-900 border border-slate-800 text-slate-600'
                  }`}
                >
                  {uploadStatus === 'profiling' ? (
                    <span className="material-symbols-outlined text-[14px] animate-spin">
                      progress_activity
                    </span>
                  ) : (
                    <span className="text-[11px] font-mono">3</span>
                  )}
                </div>
                <span className="text-[11px] font-semibold text-cyan-400">Profiling</span>
                <span className="text-[10px] font-mono text-cyan-400 animate-pulse">Running</span>
              </div>

              <div className="flex flex-col items-center text-center opacity-40">
                <div className="w-6 h-6 rounded-full bg-slate-900 border border-slate-800 text-slate-500 flex items-center justify-center text-xs mb-1 font-mono">
                  4
                </div>
                <span className="text-[11px] font-medium text-slate-400">Ready</span>
                <span className="text-[10px] font-mono text-slate-500">Pending</span>
              </div>
            </div>
          </div>

          <div className="mt-3 p-2 bg-[#0f172a] rounded-lg border border-slate-800 flex items-center justify-between text-xs font-mono text-slate-400">
            <span className="flex items-center gap-1.5 text-cyan-400">
              <span className="material-symbols-outlined text-[15px]">schema</span>
              Schema will be inferred after upload
            </span>
            <span className="text-slate-300">Rows and columns are read from the file</span>
          </div>
        </div>
      )}

      {/* Success Ready Notification Card */}
      {uploadStatus === 'ready' && datasetResult && (
        <div className="bg-[#141d2e] rounded-xl border border-emerald-500/40 p-4 shadow-xl shadow-black/30">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-xl">check_circle</span>
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between flex-wrap gap-1">
                <h4 className="text-xs font-semibold text-slate-100">
                  Dataset ready • {datasetResult.name}
                </h4>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-emerald-950/70 border border-emerald-500/40 text-emerald-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  Analysis complete
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                {datasetResult.rows.toLocaleString()} rows profiled across {datasetResult.columns}{' '}
                columns. Review the quality report before making any cleaning changes.
              </p>

              <div className="mt-3">
                <button
                  onClick={() => onDatasetLoaded(datasetResult.id, datasetResult.name)}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-sky-500 hover:from-cyan-400 hover:to-sky-400 text-slate-950 font-semibold text-xs transition-all shadow-lg shadow-cyan-500/25 active:scale-[0.98]"
                >
                  <span>Open Dataset Workspace</span>
                  <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Error Card */}
      {uploadStatus === 'error' && (
        <div className="bg-[#141d2e] rounded-xl border border-rose-500/50 p-4 shadow-xl text-xs space-y-2">
          <div className="flex items-center gap-2 text-rose-400 font-semibold">
            <span className="material-symbols-outlined text-lg">error</span>
            <span>Upload Failure</span>
          </div>
          <p className="text-slate-300">
            {errorMessage || 'Unable to parse the dataset. Please check that it is a valid CSV or XLSX file.'}
          </p>
          <button
            onClick={() => setUploadStatus('idle')}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-xs"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Troubleshooting Guidelines Box */}
      <div className="rounded-xl border border-slate-800 bg-[#141d2e] p-4 shadow-xl shadow-black/30">
        <div className="flex items-center gap-2 mb-2">
          <span className="material-symbols-outlined text-slate-400 text-base">info</span>
          <h5 className="text-xs font-semibold text-slate-200">
            File requirements &amp; troubleshooting
          </h5>
        </div>
        <p className="text-[11px] text-slate-400 leading-relaxed">
          File requirements: CSV or XLSX up to 10MB with header row. First row must contain valid column names. Ensure UTF-8 character encoding to prevent corrupting accented text or currency symbols.
        </p>
        <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
          <div className="p-2 rounded bg-[#0f172a] border border-slate-800 flex items-center gap-2">
            <span className="material-symbols-outlined text-emerald-400 text-[15px]">
              check_circle
            </span>
            <span className="text-slate-300 text-[11px]">UTF-8 / ASCII Encoded</span>
          </div>
          <div className="p-2 rounded bg-[#0f172a] border border-slate-800 flex items-center gap-2">
            <span className="material-symbols-outlined text-emerald-400 text-[15px]">
              check_circle
            </span>
            <span className="text-slate-300 text-[11px]">Header row defined</span>
          </div>
        </div>
      </div>
    </div>
  );
};
