import React from 'react';
import { DatasetQuality } from '../../types/dataset';

interface AnomalyDistributionProps {
  anomalies: DatasetQuality['anomalies'];
  totalColumns?: number;
}

export const AnomalyDistribution: React.FC<AnomalyDistributionProps> = ({
  anomalies,
  totalColumns = 18,
}) => {
  return (
    <section className="bg-[#141d2e] border border-slate-800 rounded-lg p-4 shadow-lg shadow-black/30 space-y-3">
      <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-cyan-400 text-lg">troubleshoot</span>
          <div>
            <h3 className="text-xs font-semibold text-slate-100">
              Anomaly &amp; Outlier Distribution
            </h3>
            <p className="text-[11px] text-slate-400 font-mono">
              Automated statistical profile across {totalColumns} dataset columns
            </p>
          </div>
        </div>
        <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-900 border border-slate-700/80 text-cyan-300 font-mono">
          Heuristic Scan: Complete
        </span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
        {/* Z-Score Outliers */}
        <div className="p-3 rounded-lg border border-slate-800/80 bg-[#0f172a] flex flex-col justify-between">
          <span className="text-[10px] text-slate-400 uppercase font-semibold">
            Z-Score Outliers
          </span>
          <div className="flex items-baseline gap-1.5 mt-1.5">
            <span className="text-xl font-bold font-mono text-slate-100">
              {anomalies.z_score_outliers.count}
            </span>
            <span className="text-[11px] text-slate-400 font-mono">
              in {anomalies.z_score_outliers.column}
            </span>
          </div>
          <span className="text-[10px] text-rose-400 mt-1 font-mono">
            {anomalies.z_score_outliers.note}
          </span>
        </div>

        {/* Type Mismatches */}
        <div className="p-3 rounded-lg border border-slate-800/80 bg-[#0f172a] flex flex-col justify-between">
          <span className="text-[10px] text-slate-400 uppercase font-semibold">
            Type Mismatches
          </span>
          <div className="flex items-baseline gap-1.5 mt-1.5">
            <span className="text-xl font-bold font-mono text-slate-100">
              {anomalies.type_mismatches.count}
            </span>
            <span className="text-[11px] text-slate-400 font-mono">
              in {anomalies.type_mismatches.column}
            </span>
          </div>
          <span className="text-[10px] text-amber-400 mt-1 font-mono">
            {anomalies.type_mismatches.note}
          </span>
        </div>

        {/* Primary Key Clones */}
        <div className="p-3 rounded-lg border border-slate-800/80 bg-[#0f172a] flex flex-col justify-between">
          <span className="text-[10px] text-slate-400 uppercase font-semibold">
            Primary Key Clones
          </span>
          <div className="flex items-baseline gap-1.5 mt-1.5">
            <span className="text-xl font-bold font-mono text-slate-100">
              {anomalies.primary_key_clones.count}
            </span>
            <span className="text-[11px] text-slate-400 font-mono">
              {anomalies.primary_key_clones.note}
            </span>
          </div>
          <span className="text-[10px] text-rose-400 mt-1 font-mono">
            {anomalies.primary_key_clones.rate}
          </span>
        </div>

        {/* Null Saturation */}
        <div className="p-3 rounded-lg border border-slate-800/80 bg-[#0f172a] flex flex-col justify-between">
          <span className="text-[10px] text-slate-400 uppercase font-semibold">
            Null Saturation
          </span>
          <div className="flex items-baseline gap-1.5 mt-1.5">
            <span className="text-xl font-bold font-mono text-slate-100">
              {anomalies.null_saturation.rate}
            </span>
            <span className="text-[11px] text-slate-400 font-mono">dataset avg</span>
          </div>
          <span className="text-[10px] text-emerald-400 mt-1 font-mono">
            {anomalies.null_saturation.note}
          </span>
        </div>
      </div>
    </section>
  );
};
