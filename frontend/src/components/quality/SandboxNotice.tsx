import React from 'react';

interface SandboxNoticeProps {
  version?: string;
}

export const SandboxNotice: React.FC<SandboxNoticeProps> = ({ version = 'v1.0' }) => {
  return (
    <div className="bg-[#10192a] border border-cyan-900/40 rounded-lg p-3 flex items-start gap-3 shadow-md shadow-black/20">
      <span className="material-symbols-outlined text-cyan-400 text-lg mt-0.5">info</span>
      <div className="flex-1">
        <p className="text-xs text-slate-200 font-semibold">Staged Sandbox Environment</p>
        <p className="text-[11px] text-slate-400">
          No changes have been made to your raw dataset. Review operations and verify impact before applying.
        </p>
      </div>
      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950/80 border border-cyan-500/30 text-cyan-300 font-semibold tracking-wider whitespace-nowrap">
        READ-ONLY {version}
      </span>
    </div>
  );
};
