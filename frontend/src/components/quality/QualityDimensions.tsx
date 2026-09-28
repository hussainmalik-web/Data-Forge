import React from 'react';
import { DatasetQuality } from '../../types/dataset';

interface QualityDimensionsProps {
  dimensions: DatasetQuality['dimensions'];
  onRecalculate?: () => void;
  isRecalculating?: boolean;
}

export const QualityDimensions: React.FC<QualityDimensionsProps> = ({
  dimensions,
  onRecalculate,
  isRecalculating = false,
}) => {
  return (
    <div className="bg-[#141d2e] border border-slate-800 rounded-lg p-4 shadow-lg shadow-black/30 flex flex-col justify-between">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">
          Quality Dimensions
        </span>
        <button
          onClick={onRecalculate}
          disabled={isRecalculating}
          className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors flex items-center gap-1 disabled:opacity-50"
        >
          <span className={`material-symbols-outlined text-xs ${isRecalculating ? 'animate-spin' : ''}`}>
            refresh
          </span>
          {isRecalculating ? 'Auditing...' : 'Recalculate'}
        </button>
      </div>

      <div className="space-y-3">
        {/* Completeness */}
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="font-medium text-slate-200 flex items-center gap-1.5">
              Completeness
              <span className="text-slate-400 text-[11px]">
                ({dimensions.completeness.count_label || '382 missing cells'})
              </span>
            </span>
            <span className="font-mono text-cyan-300 font-semibold">
              {dimensions.completeness.score}%
            </span>
          </div>
          <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden border border-slate-800/80">
            <div
              className="bg-cyan-500 h-1.5 rounded-full shadow-[0_0_8px_rgba(6,182,212,0.6)] transition-all duration-700"
              style={{ width: `${dimensions.completeness.score}%` }}
            ></div>
          </div>
        </div>

        {/* Consistency */}
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="font-medium text-slate-200 flex items-center gap-1.5">
              Consistency
              <span className="text-slate-400 text-[11px]">
                ({dimensions.consistency.count_label || 'Casing & format shifts'})
              </span>
            </span>
            <span className="font-mono text-cyan-300 font-semibold">
              {dimensions.consistency.score}%
            </span>
          </div>
          <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden border border-slate-800/80">
            <div
              className="bg-cyan-500 h-1.5 rounded-full shadow-[0_0_8px_rgba(6,182,212,0.6)] transition-all duration-700"
              style={{ width: `${dimensions.consistency.score}%` }}
            ></div>
          </div>
        </div>

        {/* Uniqueness */}
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="font-medium text-slate-200 flex items-center gap-1.5">
              Uniqueness
              <span className="text-slate-400 text-[11px]">
                ({dimensions.uniqueness.count_label || '27 duplicate rows'})
              </span>
            </span>
            <span className="font-mono text-emerald-400 font-semibold">
              {dimensions.uniqueness.score}%
            </span>
          </div>
          <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden border border-slate-800/80">
            <div
              className="bg-emerald-500 h-1.5 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.6)] transition-all duration-700"
              style={{ width: `${dimensions.uniqueness.score}%` }}
            ></div>
          </div>
        </div>

        {/* Validity */}
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="font-medium text-slate-200 flex items-center gap-1.5">
              Validity
              <span className="text-slate-400 text-[11px]">
                ({dimensions.validity.count_label || '3 invalid dates, 15 outliers'})
              </span>
            </span>
            <span className="font-mono text-amber-400 font-semibold">
              {dimensions.validity.score}%
            </span>
          </div>
          <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden border border-slate-800/80">
            <div
              className="bg-amber-500 h-1.5 rounded-full shadow-[0_0_8px_rgba(245,158,11,0.6)] transition-all duration-700"
              style={{ width: `${dimensions.validity.score}%` }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
};
