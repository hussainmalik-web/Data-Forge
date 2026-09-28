import React from 'react';

interface MetadataBannerProps {
  filename: string;
  format: string;
  rowCount: number;
  columnCount: number;
  fileSize: string;
  version?: string;
}

export const MetadataBanner: React.FC<MetadataBannerProps> = ({
  filename,
  format,
  rowCount,
  columnCount,
  fileSize,
  version = 'v1.0',
}) => {
  return (
    <div className="w-full bg-[#141c2b] border border-[#243042] rounded-xl p-3 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
        <span className="inline-flex items-center gap-1 font-mono text-[11px] bg-[#1c2638] px-2 py-0.5 rounded text-cyan-300 font-medium border border-cyan-500/20">
          <span className="material-symbols-outlined text-[13px] text-cyan-400">description</span>
          {filename}
        </span>
        <span className="text-slate-600">•</span>
        <span className="font-mono text-[11px] bg-[#182233] px-1.5 py-0.5 rounded text-slate-300 border border-[#2a374c]">
          {format}
        </span>
        <span className="text-slate-600">•</span>
        <span className="font-medium text-slate-200">{rowCount.toLocaleString()} rows</span>
        <span className="text-slate-600">•</span>
        <span className="font-medium text-slate-200">{columnCount} columns</span>
        <span className="text-slate-600">•</span>
        <span className="flex items-center gap-1 text-slate-400 text-[11px]">
          <span className="material-symbols-outlined text-[13px] text-slate-500">schedule</span>
          Last synced recently
        </span>
      </div>

      <div className="flex items-center gap-2">
        <span className="font-mono text-[11px] text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-500/30 font-semibold">
          {version}
        </span>
        <span className="font-mono text-[11px] text-slate-300 bg-[#182233] px-2 py-0.5 rounded border border-[#2a374c]">
          {fileSize}
        </span>
      </div>
    </div>
  );
};
