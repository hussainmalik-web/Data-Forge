import React, { useEffect, useState } from 'react';
import { QualityIssue } from '../../types/dataset';

interface IssuesDetectedAccordionProps {
  issues: QualityIssue[];
  onAutoConfigureFix: (issue: QualityIssue) => void;
  onInspectIssueRows: (issueId: string) => void;
}

export const IssuesDetectedAccordion: React.FC<IssuesDetectedAccordionProps> = ({
  issues,
  onAutoConfigureFix,
  onInspectIssueRows,
}) => {
  const [openIds, setOpenIds] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (issues.length > 0) {
      setOpenIds((prev) => (Object.keys(prev).length ? prev : { [issues[0].id]: true }));
    }
  }, [issues]);

  const toggle = (id: string) => {
    setOpenIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <section className="space-y-2">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
          Issues Detected
          <span className="px-2 py-0.5 rounded-full bg-rose-950/80 border border-rose-500/40 text-rose-300 text-[11px] font-mono font-semibold shadow-sm">
            {issues.length} Actionable
          </span>
        </h2>
        <span className="text-[11px] text-slate-400">Ranked by forensic priority</span>
      </div>

      <div className="space-y-2">
        {issues.map((issue) => {
          const isOpen = !!openIds[issue.id];

          return (
            <div
              key={issue.id}
              className="bg-[#141d2e] border border-slate-800 rounded-lg overflow-hidden transition-all duration-150 shadow-md shadow-black/20"
            >
              {/* Header / Summary */}
              <div
                onClick={() => toggle(issue.id)}
                className="flex items-center justify-between p-3.5 cursor-pointer select-none hover:bg-slate-800/40 transition-colors"
              >
                <div className="flex items-center gap-3">
                  {issue.severity === 'high' && (
                    <span className="w-2 h-2 rounded-full bg-rose-500 shadow-[0_0_6px_rgba(244,63,94,0.8)]"></span>
                  )}
                  {issue.severity === 'medium' && (
                    <span className="w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_6px_rgba(251,191,36,0.8)]"></span>
                  )}
                  {issue.severity === 'low' && (
                    <span className="w-2 h-2 rounded-full bg-slate-500"></span>
                  )}

                  <div className="flex flex-col">
                    <span className="text-xs font-semibold text-slate-100 flex items-center gap-2">
                      {issue.title}
                      <span
                        className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${
                          issue.severity === 'high'
                            ? 'text-rose-300 bg-rose-950/70 border-rose-500/30'
                            : issue.severity === 'medium'
                            ? 'text-amber-300 bg-amber-950/60 border-amber-500/30'
                            : 'text-slate-300 bg-slate-900 border-slate-700'
                        }`}
                      >
                        {issue.count_label}
                      </span>
                    </span>
                    <span className="text-[11px] text-slate-400">{issue.description}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${
                      issue.severity === 'high'
                        ? 'text-rose-400 bg-rose-950/50 border-rose-800/40'
                        : issue.severity === 'medium'
                        ? 'text-amber-400 bg-amber-950/50 border-amber-800/40'
                        : 'text-slate-400 bg-slate-800/80 border-slate-700/60'
                    }`}
                  >
                    {issue.severity === 'high'
                      ? 'High Severity'
                      : issue.severity === 'medium'
                      ? 'Medium Severity'
                      : 'Low Severity'}
                  </span>
                  <span
                    className={`material-symbols-outlined text-slate-400 transition-transform ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                  >
                    expand_more
                  </span>
                </div>
              </div>

              {/* Accordion Content */}
              {isOpen && (
                <div className="px-3.5 pb-3.5 pt-2 border-t border-slate-800/90 bg-[#0f172a] text-xs space-y-3">
                  <p className="text-slate-300 leading-relaxed">{issue.details}</p>

                  <div className="flex flex-wrap gap-2 pt-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onAutoConfigureFix(issue);
                      }}
                      className="px-3 py-1.5 rounded border border-cyan-500/40 bg-cyan-600 hover:bg-cyan-500 text-slate-950 text-xs font-semibold transition-all shadow-[0_0_12px_rgba(6,182,212,0.3)] flex items-center gap-1 active:scale-95"
                    >
                      <span className="material-symbols-outlined text-sm">auto_fix_high</span>
                      Auto-Configure Fix
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onInspectIssueRows(issue.id);
                      }}
                      className="px-3 py-1.5 rounded border border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-xs transition-colors active:scale-95"
                    >
                      Inspect {issue.count_label}
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};
