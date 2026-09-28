import React from 'react';

interface DatasetHealthRadialProps {
  score: number;
  totalColumns: number;
  cleanliness: number;
  statusText?: string;
  actionRecommendation?: string;
}

export const DatasetHealthRadial: React.FC<DatasetHealthRadialProps> = ({
  score,
  totalColumns,
  cleanliness,
  statusText = 'Good Quality',
  actionRecommendation = 'Action Recommended prior to production ETL pipeline.',
}) => {
  // SVG circumference: 2 * PI * 15.9155 ≈ 100
  const strokeDashoffset = 100 - score;

  return (
    <div className="bg-[#141d2e] border border-slate-800 rounded-lg p-4 flex flex-col justify-between shadow-lg shadow-black/30">
      <div>
        <div className="flex items-center justify-between">
          <span className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">
            Dataset Health
          </span>
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-900/80 border border-slate-700/60 text-slate-400">
            Quality Score
          </span>
        </div>

        <div className="flex items-center gap-4 mt-3">
          {/* Radial SVG Gauge */}
          <div className="relative w-20 h-20 flex-shrink-0 flex items-center justify-center">
            <svg className="w-full h-full -rotate-90 drop-shadow-[0_0_8px_rgba(56,189,248,0.25)]" viewBox="0 0 36 36">
              <path
                className="text-slate-800 stroke-current"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                strokeWidth="3.5"
              />
              <path
                className="text-cyan-400 stroke-current transition-all duration-1000 ease-out"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                strokeDasharray="100"
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                strokeWidth="3.5"
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center text-center">
              <span className="text-xl font-mono font-bold text-slate-100 drop-shadow">
                {score}
              </span>
              <span className="text-[9px] text-slate-400 font-mono -mt-1">/100</span>
            </div>
          </div>

          {/* Health Status Descriptor */}
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-950/60 border border-emerald-500/30 text-emerald-400 text-[11px] font-semibold shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)] animate-pulse"></span>
              {statusText}
            </div>
            <p className="text-xs text-slate-300 leading-tight">
              {actionRecommendation}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
        <span className="text-slate-400">
          Total Columns: <strong className="text-slate-200 font-mono">{totalColumns}</strong>
        </span>
        <span className="text-slate-400">
          Cleanliness: <strong className="text-emerald-400 font-mono font-semibold">{cleanliness}%</strong>
        </span>
      </div>
    </div>
  );
};
