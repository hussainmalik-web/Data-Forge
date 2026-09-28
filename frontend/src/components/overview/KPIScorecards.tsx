import React from 'react';

interface KPIScorecardsProps {
  totalRows: number;
  totalColumns: number;
  missingCells: number;
  totalCells: number;
  duplicateRows: number;
  numericCount: number;
  categoricalCount: number;
  dateCount: number;
}

export const KPIScorecards: React.FC<KPIScorecardsProps> = ({
  totalRows,
  totalColumns,
  missingCells,
  totalCells,
  duplicateRows,
  numericCount,
  categoricalCount,
  dateCount,
}) => {
  const missingPct = Math.round((missingCells / Math.max(1, totalCells)) * 1000) / 10;
  const dupPct = Math.round((duplicateRows / Math.max(1, totalRows)) * 1000) / 10;

  return (
    <section className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {/* Card 1: Total Rows */}
      <div className="bg-[#141c2b] border border-[#243042] rounded-xl p-3.5 shadow-md flex flex-col justify-between hover:border-cyan-500/40 hover:shadow-[0_0_15px_rgba(6,182,212,0.1)] transition-all">
        <div className="flex items-center justify-between text-slate-400">
          <span className="text-[11px] uppercase font-semibold text-slate-400 tracking-wider">
            Total Rows
          </span>
          <span className="material-symbols-outlined text-[18px] text-cyan-400">table_rows</span>
        </div>
        <div className="mt-2">
          <div className="text-2xl font-bold font-mono text-white tabular-nums">
            {totalRows.toLocaleString()}
          </div>
          <div className="mt-1 text-[11px] text-slate-400">Rows detected in uploaded dataset</div>
        </div>
      </div>

      {/* Card 2: Total Columns */}
      <div className="bg-[#141c2b] border border-[#243042] rounded-xl p-3.5 shadow-md flex flex-col justify-between hover:border-cyan-500/40 hover:shadow-[0_0_15px_rgba(6,182,212,0.1)] transition-all">
        <div className="flex items-center justify-between text-slate-400">
          <span className="text-[11px] uppercase font-semibold text-slate-400 tracking-wider">
            Total Columns
          </span>
          <span className="material-symbols-outlined text-[18px] text-cyan-400">view_column</span>
        </div>
        <div className="mt-2">
          <div className="text-2xl font-bold font-mono text-white tabular-nums">
            {totalColumns}
          </div>
          <div className="mt-1 flex items-center text-[11px] font-mono text-slate-400 truncate">
            <span>
              {numericCount} Num • {categoricalCount} Cat • {dateCount} Date
            </span>
          </div>
        </div>
      </div>

      {/* Card 3: Missing Cells */}
      <div className="bg-[#141c2b] border border-[#243042] rounded-xl p-3.5 shadow-md flex flex-col justify-between hover:border-amber-500/40 hover:shadow-[0_0_15px_rgba(245,158,11,0.1)] transition-all">
        <div className="flex items-center justify-between text-slate-400">
          <span className="text-[11px] uppercase font-semibold text-slate-400 tracking-wider">
            Missing Cells
          </span>
          <span className="material-symbols-outlined text-[18px] text-amber-400">warning</span>
        </div>
        <div className="mt-2">
          <div className="text-2xl font-bold font-mono text-white tabular-nums">
            {missingCells.toLocaleString()}
          </div>
          <div className="mt-1 flex items-center gap-1.5">
            <span className="inline-flex items-center gap-1 text-[11px] font-mono text-amber-300 bg-amber-950/60 border border-amber-500/30 px-1.5 py-0.5 rounded font-medium">
              {missingPct}% of total
            </span>
            <span className="text-[11px] text-slate-400 hidden sm:inline">
              {(totalCells / 1000).toFixed(0)}k total cells
            </span>
          </div>
        </div>
      </div>

      {/* Card 4: Duplicate Rows */}
      <div className="bg-[#141c2b] border border-[#243042] rounded-xl p-3.5 shadow-md flex flex-col justify-between hover:border-rose-500/40 hover:shadow-[0_0_15px_rgba(244,63,94,0.1)] transition-all">
        <div className="flex items-center justify-between text-slate-400">
          <span className="text-[11px] uppercase font-semibold text-slate-400 tracking-wider">
            Duplicate Rows
          </span>
          <span className="material-symbols-outlined text-[18px] text-rose-400">content_copy</span>
        </div>
        <div className="mt-2">
          <div className="text-2xl font-bold font-mono text-white tabular-nums">
            {duplicateRows}
          </div>
          <div className="mt-1 flex items-center gap-1.5">
            <span className="inline-flex items-center gap-1 text-[11px] font-mono text-rose-300 bg-rose-950/60 border border-rose-500/30 px-1.5 py-0.5 rounded font-medium">
              {dupPct}% flagged
            </span>
            <span className="text-[11px] text-slate-400 hidden sm:inline">
              auto-dedupe ready
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};
