import React from 'react';

interface CleaningActionBarProps {
  onCancel: () => void;
  onPreview: () => void;
  onApply: () => void;
  isApplying?: boolean;
  canApply?: boolean;
  error?: string | null;
}

export const CleaningActionBar: React.FC<CleaningActionBarProps> = ({
  onCancel,
  onPreview,
  onApply,
  isApplying = false,
  canApply = true,
  error = null,
}) => {
  return (
    <section className="bg-[#141d2e] rounded-lg p-3.5 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-lg shadow-black/30">
      <div className="flex items-center gap-2 text-slate-400 text-xs">
        <span className="material-symbols-outlined text-slate-400 text-base">lock_clock</span>
        <span>Non-destructive. Reversible at any time with snapshot restore.</span>
      </div>

      <div className="flex flex-col items-stretch gap-2 w-full sm:w-auto">
        {error && (
          <div role="alert" className="rounded border border-rose-500/40 bg-rose-500/10 px-3 py-2 text-[11px] text-rose-200 max-w-xl">
            {error}
          </div>
        )}
        <div className="flex items-center gap-2 w-full sm:w-auto">
        <button
          onClick={onCancel}
          disabled={isApplying}
          className="flex-1 sm:flex-initial px-4 py-2 border border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-slate-300 rounded font-semibold text-xs transition-colors disabled:opacity-50"
          type="button"
        >
          Cancel
        </button>
        <button
          onClick={onPreview}
          disabled={isApplying}
          className="flex-1 sm:flex-initial px-4 py-2 border border-cyan-500/40 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 rounded font-semibold text-xs transition-colors disabled:opacity-50"
          type="button"
        >
          Preview Changes
        </button>
        <button
          onClick={(event) => {
            event.preventDefault();
            if (!isApplying && canApply) void onApply();
          }}
          disabled={isApplying || !canApply}
          title={!canApply ? 'Select at least one cleaning operation first' : 'Apply the staged cleaning operations'}
          className={`flex-1 sm:flex-initial px-5 ${!canApply ? 'cursor-not-allowed' : ''} py-2 bg-gradient-to-r from-cyan-500 to-sky-500 hover:from-cyan-400 hover:to-sky-400 text-slate-950 rounded font-semibold text-xs transition-all shadow-[0_0_15px_rgba(6,182,212,0.35)] flex items-center justify-center gap-1.5 active:scale-95 disabled:opacity-50`}
          type="button"
        >
          <span className={`material-symbols-outlined text-base ${isApplying ? 'animate-spin' : ''}`}>
            {isApplying ? 'sync' : 'publish'}
          </span>
          <span>{isApplying ? 'Applying Pipeline...' : 'Apply Changes (Creates v2)'}</span>
        </button>
        </div>
      </div>
    </section>
  );
};
