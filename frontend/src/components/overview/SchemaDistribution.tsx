import React from 'react';

interface SchemaDistributionProps {
  numericCount: number;
  categoricalCount: number;
  dateCount: number;
  totalColumns: number;
}

export const SchemaDistribution: React.FC<SchemaDistributionProps> = ({
  numericCount,
  categoricalCount,
  dateCount,
  totalColumns,
}) => {
  return (
    <div className="bg-[#141c2b] border border-[#243042] rounded-lg p-3 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div className="flex items-center gap-2">
        <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">
          Schema Distribution
        </span>
        <span className="text-slate-600 text-xs">•</span>
        <span className="text-xs text-slate-300 font-mono">
          {totalColumns} schema fields analyzed
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-cyan-950/50 text-cyan-300 border border-cyan-500/30 text-[11px] font-mono">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_6px_#22d3ee]"></span>
          {numericCount} Numeric
        </span>
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-purple-950/50 text-purple-300 border border-purple-500/30 text-[11px] font-mono">
          <span className="w-1.5 h-1.5 rounded-full bg-purple-400 shadow-[0_0_6px_#c084fc]"></span>
          {categoricalCount} Categorical
        </span>
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-950/50 text-emerald-300 border border-emerald-500/30 text-[11px] font-mono">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_#34d399]"></span>
          {dateCount} Date
        </span>
      </div>
    </div>
  );
};
