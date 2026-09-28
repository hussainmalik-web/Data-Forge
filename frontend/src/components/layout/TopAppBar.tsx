import React from 'react';

interface TopAppBarProps {
  datasetName?: string;
  rowCount?: number;
  currentTab: string;
  onNavigateTab: (tab: string) => void;
  onOpenUpload: () => void;
  onExport: () => void;
  onGoHome: () => void;
}

export const TopAppBar: React.FC<TopAppBarProps> = ({
  datasetName,
  rowCount,
  currentTab,
  onNavigateTab,
  onOpenUpload,
  onExport,
  onGoHome,
}) => {
  return (
    <header className="flex justify-between items-center w-full px-4 h-14 sticky top-0 z-40 bg-[#0f172a]/95 backdrop-blur-md border-b border-slate-800/80 shadow-lg shadow-black/20">
      {/* Brand & Dataset Selector */}
      <div className="flex items-center gap-3">
        <button
          onClick={onGoHome}
          className="flex items-center gap-2.5 text-left group focus:outline-none"
          title="Data Forge Home"
        >
          <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 group-hover:border-cyan-400 transition-colors shadow-[0_0_12px_rgba(6,182,212,0.15)]">
            <span className="material-symbols-outlined text-xl">dataset</span>
          </div>
          <div className="flex flex-col">
            <span className="text-base font-bold text-slate-100 leading-none tracking-tight group-hover:text-cyan-300 transition-colors">
              Data Forge
            </span>
            {datasetName ? (
              <span className="text-[11px] font-mono text-slate-400 tracking-tight mt-0.5">
                {datasetName} • {rowCount ? `${rowCount.toLocaleString()} rows` : 'Loaded'}
              </span>
            ) : (
              <span className="text-[11px] text-slate-500 font-mono">
                From raw data to meaningful insights
              </span>
            )}
          </div>
        </button>

        {datasetName && (
          <span className="hidden lg:inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-950/60 text-emerald-400 text-xs font-semibold border border-emerald-500/30 shadow-[0_0_8px_rgba(16,185,129,0.15)] ml-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            Ready
          </span>
        )}
      </div>

      {/* Desktop Main Navigation Links */}
      <nav className="hidden md:flex items-center gap-6 h-full text-xs font-medium">
        <button
          onClick={() => onNavigateTab('overview')}
          className={`h-full flex items-center px-1 border-b-2 transition-colors ${
            currentTab === 'overview'
              ? 'text-cyan-400 border-cyan-400 font-semibold shadow-[0_2px_10px_rgba(56,189,248,0.15)]'
              : 'text-slate-400 hover:text-slate-200 border-transparent'
          }`}
        >
          Overview
        </button>
        <button
          onClick={() => onNavigateTab('quality')}
          className={`h-full flex items-center gap-1 px-1 border-b-2 transition-colors ${
            currentTab === 'quality'
              ? 'text-cyan-400 border-cyan-400 font-semibold shadow-[0_2px_10px_rgba(56,189,248,0.15)]'
              : 'text-slate-400 hover:text-slate-200 border-transparent'
          }`}
        >
          <span className="material-symbols-outlined text-[15px]">verified</span>
          Quality
        </button>
        <button
          onClick={() => onNavigateTab('clean')}
          className={`h-full flex items-center gap-1 px-1 border-b-2 transition-colors ${
            currentTab === 'clean'
              ? 'text-cyan-400 border-cyan-400 font-semibold shadow-[0_2px_10px_rgba(56,189,248,0.15)]'
              : 'text-slate-400 hover:text-slate-200 border-transparent'
          }`}
        >
          <span className="material-symbols-outlined text-[15px]">auto_fix_high</span>
          Clean
        </button>
        <button
          onClick={() => onNavigateTab('explore')}
          className={`h-full flex items-center px-1 border-b-2 transition-colors ${
            currentTab === 'explore'
              ? 'text-cyan-400 border-cyan-400 font-semibold shadow-[0_2px_10px_rgba(56,189,248,0.15)]'
              : 'text-slate-400 hover:text-slate-200 border-transparent'
          }`}
        >
          Explore
        </button>
        <button
          onClick={() => onNavigateTab('visualize')}
          className={`h-full flex items-center px-1 border-b-2 transition-colors ${
            currentTab === 'visualize'
              ? 'text-cyan-400 border-cyan-400 font-semibold shadow-[0_2px_10px_rgba(56,189,248,0.15)]'
              : 'text-slate-400 hover:text-slate-200 border-transparent'
          }`}
        >
          Visualize
        </button>
        <button
          onClick={() => onNavigateTab('dashboard')}
          className={`h-full flex items-center px-1 border-b-2 transition-colors ${
            currentTab === 'dashboard'
              ? 'text-cyan-400 border-cyan-400 font-semibold shadow-[0_2px_10px_rgba(56,189,248,0.15)]'
              : 'text-slate-400 hover:text-slate-200 border-transparent'
          }`}
        >
          Dashboard
        </button>
      </nav>

      {/* Trailing Quick Actions & Analyst Profile */}
      <div className="flex items-center gap-2.5">
        <button
          onClick={onOpenUpload}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700 hover:border-cyan-500/40 text-xs font-semibold transition-all shadow-sm active:scale-95"
          title="Upload or Change Dataset"
        >
          <span className="material-symbols-outlined text-sm text-cyan-400">upload</span>
          <span className="hidden sm:inline">Upload</span>
        </button>

        {datasetName && (
          <button
            onClick={onExport}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#182238] border border-cyan-500/30 hover:border-cyan-400 text-cyan-300 hover:text-white text-xs font-semibold transition-all shadow-sm active:scale-95"
            title="Export Dataset"
          >
            <span className="material-symbols-outlined text-sm text-cyan-400">file_download</span>
            <span className="hidden sm:inline">Export</span>
          </button>
        )}

        {/* Analyst Profile Avatar */}
        <div
          className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-950 to-slate-800 text-cyan-300 flex items-center justify-center text-xs font-bold border border-cyan-500/40 shadow-inner select-none"
          title="Data Forge workspace"
        >
          AM
        </div>
      </div>
    </header>
  );
};
