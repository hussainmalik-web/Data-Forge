import React, { useState, useEffect } from 'react';
import { getDashboard } from '../../services/api';
import { DashboardResponse } from '../../types/dataset';

interface ExecutiveDashboardViewProps {
  datasetId: string;
}

export const ExecutiveDashboardView: React.FC<ExecutiveDashboardViewProps> = ({ datasetId }) => {
  const [dashboard, setDashboard] = useState<DashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    getDashboard(datasetId)
      .then((data) => {
        if (isMounted) {
          setDashboard(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err.message || 'Failed to load executive dashboard.');
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [datasetId]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-slate-400 gap-3">
        <span className="material-symbols-outlined text-3xl text-cyan-400 animate-spin">
          progress_activity
        </span>
        <span className="text-xs font-mono">Synthesizing executive KPI telemetry...</span>
      </div>
    );
  }

  if (error || !dashboard) {
    return (
      <div className="p-8 text-center text-xs text-rose-400">
        <span className="material-symbols-outlined text-2xl mb-1">error_outline</span>
        <p>{error || 'Unable to build dashboard.'}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Top KPI Scorecards */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {dashboard.kpis.map((kpi) => (
          <div
            key={kpi.id}
            className="bg-[#141c2b] border border-[#243042] rounded-xl p-3.5 shadow-md flex flex-col justify-between hover:border-cyan-500/40 transition-all"
          >
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[11px] uppercase font-semibold text-slate-400 tracking-wider">
                {kpi.label}
              </span>
              <span className="material-symbols-outlined text-[18px] text-cyan-400">
                insights
              </span>
            </div>
            <div className="mt-2">
              <div className="text-xl font-bold font-mono text-white tabular-nums">
                {kpi.value}
              </div>
              <div className="mt-1 flex items-center justify-between text-[11px]">
                <span className="font-mono text-slate-300 font-semibold bg-slate-800 px-1.5 py-0.5 rounded border border-slate-700">
                  {kpi.trend}
                </span>
                <span className="text-slate-400 truncate max-w-[120px]">{kpi.subtext}</span>
              </div>
            </div>
          </div>
        ))}
      </section>

      {/* Analytical Charts Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {dashboard.charts.map((chart, idx) => {
          const maxY = Math.max(...chart.data.map((p) => p.y), 1);

          return (
            <div
              key={idx}
              className="bg-[#141d2e] border border-slate-800 rounded-xl p-4 shadow-lg flex flex-col justify-between"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-2.5 mb-3">
                <span className="text-xs font-semibold text-slate-100 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-sm text-cyan-400">
                    bar_chart
                  </span>
                  {chart.title}
                </span>
                <span className="text-[10px] font-mono text-slate-400">
                  {chart.x_axis} vs {chart.y_axis}
                </span>
              </div>

              {/* Chart Bars */}
              <div className="flex items-end justify-between gap-2 h-44 pt-4 px-2 border-b border-l border-slate-800 bg-[#0a0e17] rounded-lg">
                {chart.data.map((pt, pIdx) => {
                  const heightPct = Math.round((pt.y / maxY) * 100);
                  return (
                    <div
                      key={pIdx}
                      className="flex-1 flex flex-col items-center h-full justify-end group"
                    >
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 border border-slate-700 px-1.5 py-0.5 rounded text-[9px] text-cyan-300 font-mono mb-1 pointer-events-none whitespace-nowrap">
                        {pt.y.toLocaleString()}
                      </div>
                      <div
                        style={{ height: `${Math.max(8, heightPct)}%` }}
                        className="w-full max-w-[40px] bg-gradient-to-t from-cyan-600 to-cyan-400 group-hover:from-cyan-500 rounded-t transition-all"
                      ></div>
                      <span className="text-[9px] text-slate-400 font-mono mt-1.5 truncate max-w-[60px] text-center">
                        {pt.x}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </section>

      {/* Automated Key Findings & Business Insights */}
      <section className="bg-[#141d2e] border border-slate-800 rounded-xl p-4 shadow-lg space-y-3">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-amber-400 text-lg">lightbulb</span>
            <h3 className="text-xs font-semibold text-slate-100">
              Dataset-driven Insights
            </h3>
          </div>
          <span className="text-[10px] font-mono text-cyan-300 bg-cyan-950/60 border border-cyan-500/30 px-2 py-0.5 rounded font-semibold">
            Deterministic summary
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {dashboard.insights.map((item) => (
            <div
              key={item.id}
              className="bg-[#0f172a] p-3 rounded-lg border border-slate-800 space-y-1.5"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-mono font-semibold text-cyan-400">
                  {item.category}
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
              </div>
              <h4 className="text-xs font-semibold text-slate-200">{item.title}</h4>
              <p className="text-[11px] text-slate-400 leading-relaxed">{item.finding}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
