import React from 'react';

interface LandingPageProps {
  onStartUpload: () => void;
  onTrySample: () => void;
  onNavigateSection: (section: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onStartUpload,
  onTrySample,
  onNavigateSection,
}) => {
  return (
    <div className="flex flex-col items-center w-full">
      {/* Hero Section */}
      <section className="w-full max-w-4xl px-4 pt-10 pb-8 text-center flex flex-col items-center">
        {/* Engine Status Pill Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#181f2e] border border-[#2d3748] mb-6 shadow-sm">
          <span className="w-2 h-2 rounded-full bg-[#10b981] animate-pulse shadow-[0_0_8px_#10b981]"></span>
          <span className="font-mono text-xs text-cyan-400 font-semibold tracking-wide">
            DATA FORGE V1 WORKFLOW
          </span>
          <span className="text-slate-600">|</span>
          <span className="text-xs text-slate-400">Deterministic analyst workflow</span>
        </div>

        {/* Main Headline & Subtitle */}
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-slate-100 tracking-tight mb-4 max-w-2xl leading-tight">
          From raw data to meaningful insights.
        </h1>
        <p className="text-sm sm:text-base text-slate-400 max-w-2xl mb-8 leading-relaxed">
          Upload your dataset, understand its quality, clean it, explore patterns, build visualizations, and turn your data into useful insights — all in one workspace.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full sm:w-auto mb-10">
          <button
            onClick={onStartUpload}
            className="w-full sm:w-auto h-11 px-6 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold text-xs flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 transition-all duration-150 active:scale-95 cursor-pointer"
          >
            <span className="material-symbols-outlined text-lg">upload</span>
            <span>Upload Dataset</span>
          </button>
          <button
            onClick={onTrySample}
            className="w-full sm:w-auto h-11 px-6 rounded-lg bg-[#181f2e] hover:bg-[#1e293b] border border-[#2d3748] text-slate-200 text-xs flex items-center justify-center gap-2 shadow-sm transition-all duration-150 active:scale-95 cursor-pointer"
          >
            <span className="material-symbols-outlined text-cyan-400 text-lg">play_circle</span>
            <span>Try Sample Dataset</span>
          </button>
        </div>

        {/* Quick Session Metrics Preview Strip */}
        <div className="w-full grid grid-cols-2 md:grid-cols-4 gap-3 p-3 bg-[#181f2e] border border-[#2d3748] rounded-xl shadow-md text-left">
          <div className="p-2 border-r border-[#2d3748] last:border-r-0">
            <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
              Profiling Latency
            </p>
            <p className="text-sm font-bold text-slate-100 font-mono mt-0.5">Profile on upload</p>
          </div>
          <div className="p-2 border-r border-[#2d3748] last:border-r-0">
            <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
              Quality Rules
            </p>
            <p className="text-sm font-bold text-slate-100 font-mono mt-0.5">Quality checks</p>
          </div>
          <div className="p-2 border-r border-[#2d3748] last:border-r-0">
            <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
              Transformations
            </p>
            <p className="text-sm font-bold text-slate-100 font-mono mt-0.5">Preview before apply</p>
          </div>
          <div className="p-2">
            <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
              Storage State
            </p>
            <p className="text-sm font-bold text-emerald-400 font-mono flex items-center gap-1 mt-0.5">
              <span className="material-symbols-outlined text-xs">folder</span> Local backend storage
            </p>
          </div>
        </div>
      </section>

      {/* End-to-End Workflow Pipeline Stepper */}
      <section className="w-full max-w-5xl px-4 py-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-semibold text-slate-100">End-to-End Workflow Pipeline</h2>
            <p className="text-xs text-slate-400">
              Deterministic progression from raw stream to analytical synthesis.
            </p>
          </div>
          <span className="hidden sm:inline-flex items-center gap-1 font-mono text-[11px] text-cyan-400 bg-[#181f2e] border border-[#2d3748] px-2 py-0.5 rounded">
            <span className="material-symbols-outlined text-xs">sync</span> 9 Continuous Stages
          </span>
        </div>

        {/* Stepper Container */}
        <div className="bg-[#181f2e] border border-[#2d3748] rounded-xl p-4 shadow-md overflow-x-auto scrollbar-none">
          <div className="flex items-center min-w-[760px] justify-between py-2">
            {[
              { id: 'upload', label: 'Upload', icon: 'upload_file' },
              { id: 'profile', label: 'Profile', icon: 'analytics' },
              { id: 'quality', label: 'Check Quality', icon: 'verified' },
              { id: 'clean', label: 'Clean', icon: 'auto_fix_high' },
              { id: 'explore', label: 'Explore', icon: 'explore' },
              { id: 'visualize', label: 'Visualize', icon: 'bar_chart' },
              { id: 'analyze', label: 'Analyze', icon: 'query_stats' },
              { id: 'insights', label: 'Insights', icon: 'lightbulb' },
              { id: 'export', label: 'Export', icon: 'output' },
            ].map((step, i, arr) => (
              <React.Fragment key={step.id}>
                <div
                  onClick={() => onNavigateSection(step.id)}
                  className="flex flex-col items-center group cursor-pointer"
                >
                  <div className="w-9 h-9 rounded-full bg-[#1e293b] text-slate-400 border border-[#334155] flex items-center justify-center text-xs group-hover:border-cyan-400 group-hover:text-cyan-300 transition-colors">
                    <span className="material-symbols-outlined text-sm">{step.icon}</span>
                  </div>
                  <span className="mt-2 text-[11px] font-medium text-slate-400 group-hover:text-slate-200 transition-colors whitespace-nowrap">
                    {step.label}
                  </span>
                </div>
                {i < arr.length - 1 && (
                  <div className="flex-1 h-[2px] bg-[#2d3748] mx-2"></div>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </section>

      {/* Integrated Intelligence Stack Bento Grid */}
      <section className="w-full max-w-5xl px-4 py-6" id="features">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-slate-100">Integrated Intelligence Stack</h2>
          <p className="text-xs text-slate-400">
            Modular tools built with forensic precision for data analysts and engineers.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Card 1: Data Profiling */}
          <div className="md:col-span-2 bg-[#181f2e] border border-[#2d3748] rounded-xl p-5 shadow-sm hover:border-cyan-500/40 transition-colors flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="p-2 rounded-lg bg-[#0f172a] text-cyan-400 border border-[#2d3748] material-symbols-outlined text-xl">
                    dataset
                  </span>
                  <h3 className="text-sm font-semibold text-slate-100">Data Profiling</h3>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-cyan-950/60 text-cyan-400 border border-cyan-800/50 font-semibold">
                  NUM + TXT + DATE
                </span>
              </div>
              <p className="text-xs text-slate-400 mb-4">
                Automatically understand rows, columns, data types, missing values, duplicates, and statistics.
              </p>
            </div>

            <div className="bg-[#0f172a] rounded-lg p-3 border border-[#2d3748] font-mono text-[11px]">
              <div className="flex items-center gap-2 text-slate-300">
                <span className="material-symbols-outlined text-cyan-400 text-base">verified</span>
                <span>Metrics are calculated from the dataset you upload.</span>
              </div>
              <p className="mt-2 text-slate-500 leading-relaxed">
                Data Forge does not display placeholder business numbers on the workspace.
              </p>
            </div>
          </div>

          {/* Card 2: Data Quality */}
          <div className="bg-[#181f2e] border border-[#2d3748] rounded-xl p-5 shadow-sm hover:border-emerald-500/40 transition-colors flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="p-2 rounded-lg bg-[#0f172a] text-emerald-400 border border-[#2d3748] material-symbols-outlined text-xl">
                    verified
                  </span>
                  <h3 className="text-sm font-semibold text-slate-100">Data Quality</h3>
                </div>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#10b981]"></span>
              </div>
              <p className="text-xs text-slate-400 mb-4">
                Detect missing values, duplicates, invalid dates, inconsistent text, outliers, and quality issues.
              </p>
            </div>
            <div className="flex flex-wrap gap-1.5 pt-2">
              <span className="px-2.5 py-1 rounded-full text-[10px] font-mono bg-amber-950/40 border border-amber-700/50 text-amber-400 font-medium flex items-center gap-1">
                <span className="material-symbols-outlined text-xs">warning</span> 14 Anomalies
              </span>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-mono bg-emerald-950/40 border border-emerald-700/50 text-emerald-400 font-medium">
                0 Type Drift
              </span>
            </div>
          </div>

          {/* Card 3: Smart Cleaning */}
          <div className="bg-[#181f2e] border border-[#2d3748] rounded-xl p-5 shadow-sm hover:border-cyan-500/40 transition-colors flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="p-2 rounded-lg bg-[#0f172a] text-cyan-400 border border-[#2d3748] material-symbols-outlined text-xl">
                  auto_fix_high
                </span>
                <h3 className="text-sm font-semibold text-slate-100">Smart Cleaning</h3>
              </div>
              <p className="text-xs text-slate-400 mb-4">
                Choose cleaning operations, preview their impact, and apply changes only after approval.
              </p>
            </div>
            <div className="bg-[#0f172a] p-2.5 rounded-lg border border-[#2d3748] text-xs space-y-1.5 font-mono">
              <div className="flex items-center justify-between text-slate-200">
                <span className="text-cyan-400 text-[11px]">01. Trim Whitespace</span>
                <span className="text-emerald-400 font-semibold text-[10px]">Ready</span>
              </div>
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-[11px]">02. Impute Median (age)</span>
                <span className="text-slate-400 text-[10px]">Pending</span>
              </div>
            </div>
          </div>

          {/* Card 4: Data Exploration */}
          <div className="bg-[#181f2e] border border-[#2d3748] rounded-xl p-5 shadow-sm hover:border-cyan-500/40 transition-colors flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="p-2 rounded-lg bg-[#0f172a] text-cyan-400 border border-[#2d3748] material-symbols-outlined text-xl">
                  scatter_plot
                </span>
                <h3 className="text-sm font-semibold text-slate-100">Data Exploration</h3>
              </div>
              <p className="text-xs text-slate-400 mb-4">
                Understand distributions, statistics, relationships, and patterns.
              </p>
            </div>
            <div className="flex items-center justify-between text-xs border-t border-[#2d3748] pt-3 text-slate-400">
              <span>Correlation Heatmap</span>
              <span className="material-symbols-outlined text-sm text-cyan-400">north_east</span>
            </div>
          </div>

          {/* Card 5: Visual Analytics */}
          <div className="bg-[#181f2e] border border-[#2d3748] rounded-xl p-5 shadow-sm hover:border-cyan-500/40 transition-colors flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="p-2 rounded-lg bg-[#0f172a] text-cyan-400 border border-[#2d3748] material-symbols-outlined text-xl">
                  insert_chart
                </span>
                <h3 className="text-sm font-semibold text-slate-100">Visual Analytics</h3>
              </div>
              <p className="text-xs text-slate-400 mb-4">
                Create charts and automatically recommended visualizations.
              </p>
            </div>
            <div className="flex items-center justify-between text-xs border-t border-[#2d3748] pt-3 text-slate-400">
              <span>Auto-chart Engine</span>
              <span className="font-mono text-[10px] text-emerald-400 flex items-center gap-1 font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>Active
              </span>
            </div>
          </div>

          {/* Card 6: Business Insights */}
          <div className="md:col-span-2 bg-[#181f2e] border border-[#2d3748] rounded-xl p-5 shadow-sm hover:border-indigo-500/40 transition-colors flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="p-2 rounded-lg bg-[#0f172a] text-indigo-400 border border-[#2d3748] material-symbols-outlined text-xl">
                  insights
                </span>
                <h3 className="text-sm font-semibold text-slate-100">Business Insights</h3>
              </div>
              <p className="text-xs text-slate-400 mb-4">
                Turn analysis into clear findings and forensic explanations.
              </p>
            </div>
            <div className="bg-[#0f172a] p-3 rounded-lg border border-[#2d3748] text-xs text-slate-200 flex items-start gap-3">
              <span className="material-symbols-outlined text-amber-400 mt-0.5">lightbulb</span>
              <div>
                <span className="font-semibold block text-slate-100">Dataset-driven findings</span>
                <span className="text-slate-400">
                  The dashboard summarizes only values and patterns calculated from the uploaded dataset.
                </span>
              </div>
            </div>
          </div>

          {/* Card 7: Export */}
          <div className="bg-[#181f2e] border border-[#2d3748] rounded-xl p-5 shadow-sm hover:border-cyan-500/40 transition-colors flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="p-2 rounded-lg bg-[#0f172a] text-cyan-400 border border-[#2d3748] material-symbols-outlined text-xl">
                  file_download
                </span>
                <h3 className="text-sm font-semibold text-slate-100">Export</h3>
              </div>
              <p className="text-xs text-slate-400 mb-4">
                Download cleaned datasets and the generated quality report.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded text-[10px] font-mono bg-[#0f172a] text-slate-300 font-semibold border border-[#2d3748]">
                CSV
              </span>
              <span className="px-2.5 py-1 rounded text-[10px] font-mono bg-[#0f172a] text-slate-300 font-semibold border border-[#2d3748]">
                XLSX
              </span>
              <span className="px-2.5 py-1 rounded text-[10px] font-mono bg-[#0f172a] text-slate-300 font-semibold border border-[#2d3748]">
                JSON
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Privacy & Trust Section */}
      <section className="w-full max-w-5xl px-4 py-8">
        <div className="bg-[#181f2e] border border-[#2d3748] rounded-xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 shadow-md">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-lg bg-[#0f172a] border border-[#2d3748] flex items-center justify-center flex-shrink-0 text-cyan-400">
              <span className="material-symbols-outlined text-2xl">shield</span>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-100 mb-1">Your data stays yours.</h3>
              <p className="text-xs text-slate-400 max-w-xl leading-relaxed">
                On this local V1 setup, uploaded datasets are processed by the FastAPI backend and stored under its local storage directory until the project data is removed.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="px-3.5 py-2 rounded-lg bg-[#0f172a] border border-[#2d3748] text-xs text-slate-200 font-medium flex items-center gap-1.5 whitespace-nowrap shadow-sm">
              <span className="material-symbols-outlined text-emerald-400 text-sm">
                check_circle
              </span>
              Local backend storage
            </span>
          </div>
        </div>
      </section>
    </div>
  );
};
