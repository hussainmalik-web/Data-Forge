import React from 'react';
import { AuditLogEntry } from '../../types/dataset';

interface CleaningAuditLogProps {
  entries: AuditLogEntry[];
  onViewFullLedger?: () => void;
}

export const CleaningAuditLog: React.FC<CleaningAuditLogProps> = ({
  entries,
  onViewFullLedger,
}) => {
  return (
    <section className="bg-[#141d2e] border border-slate-800 rounded-lg p-4 shadow-lg shadow-black/30">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[11px] text-slate-400 uppercase font-semibold">
          Recent Cleaning Audit Log
        </span>
        <button
          onClick={onViewFullLedger}
          className="text-[11px] text-cyan-400 hover:text-cyan-300 transition-colors"
        >
          View Full Ledger
        </button>
      </div>

      <div className="divide-y divide-slate-800">
        {entries.map((entry) => (
          <div
            key={entry.id}
            className="py-2.5 flex items-center justify-between text-xs"
          >
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-slate-400 text-base">code</span>
              <span className="font-medium text-slate-200">'{entry.operation}'</span>
              <span className="text-slate-400 text-[11px]">on {entry.column}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-mono text-[11px] text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-1.5 py-0.5 rounded">
                {entry.cells_affected.toLocaleString()} cells {entry.status}
              </span>
              <span className="text-[11px] text-slate-400 font-mono">{entry.timestamp}</span>
            </div>
          </div>
        ))}
        {entries.length === 0 && (
          <div className="py-4 text-center text-xs text-slate-500">
            No transformations recorded yet in this session.
          </div>
        )}
      </div>
    </section>
  );
};
