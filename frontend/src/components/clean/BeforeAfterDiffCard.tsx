import React from 'react';
import { CleaningPlanPreview } from '../../types/dataset';

interface BeforeAfterDiffCardProps {
  preview: CleaningPlanPreview;
}

export const BeforeAfterDiffCard: React.FC<BeforeAfterDiffCardProps> = ({ preview }) => {
  const { original, transformed, net_difference } = preview;
  const rowsDelta = transformed.rows - original.rows;
  const missingDelta = transformed.missing_cells - original.missing_cells;

  return (
    <section className="bg-[#141d2e] border border-slate-800 rounded-lg p-4 shadow-lg shadow-black/30 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-cyan-400 text-lg">difference</span>
          <div>
            <h3 className="text-xs font-semibold text-slate-100">
              Impact Preview (Staged Run)
            </h3>
            <span className="text-[11px] text-slate-400">Synchronized Diff Engine</span>
          </div>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400">
          {original.version} → {transformed.version}
        </span>
      </div>

      {/* Original Raw Card */}
      <div className="p-3 rounded-lg border border-slate-800 bg-[#0a0e17] font-mono space-y-1.5">
        <div className="flex justify-between items-center text-slate-400">
          <span className="uppercase tracking-wider text-[10px] font-semibold text-slate-400">
            Original (Raw)
          </span>
          <span className="text-slate-400 text-xs">{original.version}</span>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold text-slate-200">
            {original.rows.toLocaleString()}
          </span>
          <span className="text-xs text-slate-400 font-sans">Rows</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-rose-400 pt-0.5">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
          <span>
            {original.missing_cells.toLocaleString()} Missing Cells across {original.columns} columns
          </span>
        </div>
      </div>

      {/* Transformed Cleaned Card */}
      <div className="p-3 rounded-lg border border-emerald-500/30 bg-[#0a161f] font-mono space-y-1.5 shadow-[0_0_15px_rgba(16,185,129,0.06)]">
        <div className="flex justify-between items-center">
          <span className="uppercase tracking-wider text-[10px] font-semibold text-emerald-400">
            Transformed (Cleaned)
          </span>
          <span className="text-emerald-400 text-[10px] font-semibold px-1.5 py-0.5 rounded bg-emerald-950/80 border border-emerald-500/40">
            {transformed.version} STAGED
          </span>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold text-emerald-300">
            {transformed.rows.toLocaleString()}
          </span>
          {rowsDelta !== 0 && (
            <span className="text-xs text-rose-400 font-semibold">
              {rowsDelta > 0 ? `+${rowsDelta}` : `${rowsDelta}`} rows
            </span>
          )}
        </div>
        <div className="flex items-center gap-1.5 text-xs text-emerald-400 pt-0.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]"></span>
          <span>
            {transformed.missing_cells} Missing Cells ({missingDelta} imputed)
          </span>
        </div>
      </div>

      {/* Net Difference Summary */}
      <div className="p-3 rounded-lg border border-slate-800 bg-[#0f172a] flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-emerald-400 text-base">
            check_circle
          </span>
          <div>
            <span className="text-slate-200 font-medium block text-xs">Net Difference:</span>
            <span className="text-slate-400 text-[11px] font-mono">
              {net_difference.summary}
            </span>
          </div>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 font-semibold whitespace-nowrap">
          {net_difference.validation_status || 'Preview generated from deterministic calculations'}
        </span>
      </div>
    </section>
  );
};
