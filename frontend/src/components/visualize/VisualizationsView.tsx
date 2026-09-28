import React, { useState, useEffect } from 'react';
import {
  getVisualizationRecommendations,
  getVisualizationData,
} from '../../services/api';
import { VisualizationRecommendation, ChartDataResponse } from '../../types/dataset';

interface VisualizationsViewProps {
  datasetId: string;
}

export const VisualizationsView: React.FC<VisualizationsViewProps> = ({ datasetId }) => {
  const [recommendations, setRecommendations] = useState<VisualizationRecommendation[]>([]);
  const [activeChartId, setActiveChartId] = useState<string>('');
  const [chartData, setChartData] = useState<ChartDataResponse | null>(null);
  const [loadingRecs, setLoadingRecs] = useState(true);
  const [loadingChart, setLoadingChart] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    setLoadingRecs(true);
    getVisualizationRecommendations(datasetId)
      .then((recs) => {
        if (isMounted) {
          setRecommendations(recs);
          if (recs.length > 0) {
            setActiveChartId(recs[0].id);
          }
          setLoadingRecs(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err.message);
          setLoadingRecs(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [datasetId]);

  useEffect(() => {
    if (!activeChartId) return;
    let isMounted = true;
    setLoadingChart(true);

    getVisualizationData(datasetId, activeChartId)
      .then((data) => {
        if (isMounted) {
          setChartData(data);
          setLoadingChart(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err.message);
          setLoadingChart(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [datasetId, activeChartId]);

  const activeRec = recommendations.find((r) => r.id === activeChartId);

  // Render SVG charts
  const renderChart = () => {
    if (!chartData || !chartData.data || chartData.data.length === 0) {
      return (
        <div className="py-20 text-center text-xs text-slate-400">
          No visualization data available for this chart configuration.
        </div>
      );
    }

    const points = chartData.data;

    // BAR CHART / HISTOGRAM
    if (chartData.type === 'bar' || chartData.type === 'histogram') {
      const maxY = Math.max(...points.map((p) => p.y), 1);
      const chartHeight = 240;

      return (
        <div className="space-y-4">
          <div className="flex items-end justify-between gap-3 h-[260px] pt-8 px-4 border-b border-l border-slate-800 bg-[#0a0e17] rounded-lg">
            {points.map((pt, i) => {
              const heightPct = Math.round((pt.y / maxY) * 100);
              return (
                <div key={i} className="flex-1 flex flex-col items-center h-full justify-end group">
                  {/* Tooltip on hover */}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 border border-slate-700 px-2 py-1 rounded text-[10px] text-cyan-300 font-mono mb-1 pointer-events-none whitespace-nowrap shadow-md">
                    {pt.x}: {pt.y.toLocaleString()}
                  </div>
                  {/* Bar */}
                  <div
                    style={{ height: `${Math.max(6, heightPct)}%` }}
                    className="w-full max-w-[48px] bg-gradient-to-t from-cyan-600 to-cyan-400 group-hover:from-cyan-500 group-hover:to-cyan-300 rounded-t transition-all shadow-[0_0_12px_rgba(6,182,212,0.2)]"
                  ></div>
                  {/* Label */}
                  <span className="text-[10px] text-slate-400 font-mono mt-2 truncate max-w-[70px] text-center">
                    {pt.x}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-400 px-2">
            <span>X-Axis: {chartData.x_axis}</span>
            <span>Y-Axis: {chartData.y_axis} (Max: {maxY.toLocaleString()})</span>
          </div>
        </div>
      );
    }

    // SCATTER PLOT
    if (chartData.type === 'scatter') {
      const maxX = Math.max(...points.map((p) => Number(p.x)), 1);
      const maxY = Math.max(...points.map((p) => p.y), 1);
      const minY = Math.min(...points.map((p) => p.y), 0);
      const yRange = Math.max(1, maxY - minY);

      return (
        <div className="space-y-4">
          <div className="relative h-[260px] p-4 border-b border-l border-slate-800 bg-[#0a0e17] rounded-lg overflow-hidden">
            {points.map((pt, i) => {
              const leftPct = (Number(pt.x) / maxX) * 90 + 5;
              const bottomPct = ((pt.y - minY) / yRange) * 85 + 5;

              return (
                <div
                  key={i}
                  style={{ left: `${leftPct}%`, bottom: `${bottomPct}%` }}
                  title={`${chartData.x_axis}: ${pt.x}, ${chartData.y_axis}: ${pt.y}`}
                  className="absolute w-2.5 h-2.5 rounded-full bg-cyan-400 border border-slate-900 shadow-[0_0_6px_#22d3ee] hover:scale-150 transition-transform cursor-pointer"
                ></div>
              );
            })}
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-400 px-2">
            <span>X: {chartData.x_axis} (Range: 0 → {maxX})</span>
            <span>Y: {chartData.y_axis} (Range: {minY} → {maxY})</span>
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
      {/* Chart Selector Sidebar */}
      <div className="md:col-span-4 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-semibold uppercase text-slate-400 tracking-wider">
            Recommended Charts
          </h3>
          <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/60 border border-cyan-500/30 px-2 py-0.5 rounded font-semibold">
            Auto-Detected
          </span>
        </div>

        {loadingRecs ? (
          <div className="p-8 text-center text-xs text-slate-400">
            <span className="material-symbols-outlined text-xl animate-spin mb-1 text-cyan-400">
              progress_activity
            </span>
            <p>Scanning schema for visual distributions...</p>
          </div>
        ) : (
          <div className="space-y-2">
            {recommendations.map((rec) => {
              const isSelected = rec.id === activeChartId;
              return (
                <button
                  key={rec.id}
                  onClick={() => setActiveChartId(rec.id)}
                  className={`w-full text-left p-3 rounded-lg border transition-all ${
                    isSelected
                      ? 'bg-[#182335] border-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.15)]'
                      : 'bg-[#141d2e] border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-100 flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-sm text-cyan-400">
                        {rec.type === 'bar'
                          ? 'bar_chart'
                          : rec.type === 'scatter'
                          ? 'scatter_plot'
                          : 'insert_chart'}
                      </span>
                      {rec.title}
                    </span>
                    <span className="text-[10px] font-mono font-semibold text-cyan-300 bg-cyan-950/60 px-1.5 py-0.5 rounded border border-cyan-500/30">
                      Recommended
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1 leading-snug">{rec.reason}</p>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Main Chart Viewer Canvas */}
      <div className="md:col-span-8 bg-[#141d2e] border border-slate-800 rounded-xl p-4 shadow-lg flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
            <div>
              <h2 className="text-sm font-semibold text-slate-100">
                {activeRec?.title || 'Visual Analytics'}
              </h2>
              <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                {activeRec ? `${activeRec.x_axis} vs ${activeRec.y_axis}` : ''}
              </p>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-[11px] font-mono text-emerald-400 font-semibold">
                Live Data Grounded
              </span>
            </div>
          </div>

          {loadingChart ? (
            <div className="flex flex-col items-center justify-center py-24 text-slate-400 gap-2">
              <span className="material-symbols-outlined text-2xl text-cyan-400 animate-spin">
                progress_activity
              </span>
              <span className="text-xs font-mono">Aggregating dataset points...</span>
            </div>
          ) : error ? (
            <div className="p-8 text-center text-xs text-rose-400">{error}</div>
          ) : (
            renderChart()
          )}
        </div>

        <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
          <span>Deterministic aggregation from in-session pandas DataFrame.</span>
          <span className="text-cyan-400 font-mono">Deterministic recommendation</span>
        </div>
      </div>
    </div>
  );
};
