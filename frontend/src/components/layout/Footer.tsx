import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-[#0a0e17] border-t border-slate-800/80 py-8 px-4 mt-auto">
      <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6 text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <span className="material-symbols-outlined text-[15px]">dataset</span>
          </div>
          <span className="font-bold text-slate-200 tracking-tight">Data Forge</span>
          <span className="text-slate-600">|</span>
          <span className="text-[11px] text-slate-500">From raw data to meaningful insights.</span>
        </div>

        <nav className="flex flex-wrap items-center justify-center gap-6">
          <span className="hover:text-cyan-400 cursor-pointer transition-colors">Product</span>
          <span className="hover:text-cyan-400 cursor-pointer transition-colors">Forensic Rules</span>
          <span className="hover:text-cyan-400 cursor-pointer transition-colors">Quality checks</span>
          <span className="hover:text-cyan-400 cursor-pointer transition-colors">Zero Retention Policy</span>
        </nav>

        <div className="font-mono text-[11px] text-slate-500">
          © 2025 Data Forge. All rights reserved.
        </div>
      </div>
    </footer>
  );
};
