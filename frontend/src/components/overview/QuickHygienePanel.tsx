import React from 'react';

interface QuickHygienePanelProps {
  qualityScore: number;
  issueCount: number;
  recommendation: string;
  onReviewQualityFlags: () => void;
  onAutoClean: () => void;
}

export const QuickHygienePanel: React.FC<QuickHygienePanelProps> = ({
  qualityScore,
  issueCount,
  recommendation,
  onReviewQualityFlags,
  onAutoClean,
}) => {
  return (
    <div className="bg-[#141c2b] border border-[#243042] rounded-xl p-3 shadow-md flex flex-col sm:flex-row items-center justify-between gap-3">
      <div className="flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]"></span>
        <span className="text-xs text-slate-200">
          Quality Score: <span className="font-semibold text-emerald-400 font-mono">{qualityScore}%</span>
        </span>
        <span className="text-slate-600 text-xs hidden sm:inline">•</span>
        <span className="text-xs text-slate-400 truncate max-w-md">
          Recommended: {recommendation}
        </span>
      </div>

      <div className="flex items-center gap-2 w-full sm:w-auto">
        <button
          onClick={onReviewQualityFlags}
          className="flex-1 sm:flex-none px-3 py-1.5 rounded bg-[#1e293b] border border-[#334155] text-cyan-300 text-xs font-semibold hover:bg-[#28354b] hover:border-cyan-500/40 transition-colors text-center shadow-sm"
        >
          Review {issueCount} Quality Flags
        </button>
        <button
          onClick={onAutoClean}
          className="flex-1 sm:flex-none px-3.5 py-1.5 rounded bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-semibold transition-all text-center shadow-[0_0_15px_rgba(6,182,212,0.35)] active:scale-95"
        >
          Auto Clean Dataset
        </button>
      </div>
    </div>
  );
};
