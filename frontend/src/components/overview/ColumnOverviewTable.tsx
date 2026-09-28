import React, { useState, useMemo } from 'react';
import { ColumnSchema } from '../../types/dataset';

interface ColumnOverviewTableProps {
  schema: ColumnSchema[];
  onInspectColumn?: (colName: string) => void;
}

export const ColumnOverviewTable: React.FC<ColumnOverviewTableProps> = ({
  schema,
  onInspectColumn,
}) => {
  const [filterText, setFilterText] = useState('');
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'NUM' | 'TXT' | 'DATE'>('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 7;

  const filteredSchema = useMemo(() => {
    return schema.filter((col) => {
      const matchesSearch = col.name.toLowerCase().includes(filterText.toLowerCase());
      const matchesType = typeFilter === 'ALL' || col.type === typeFilter;
      return matchesSearch && matchesType;
    });
  }, [schema, filterText, typeFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredSchema.length / pageSize));
  const pagedColumns = filteredSchema.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <section className="bg-[#141c2b] border border-[#243042] rounded-xl shadow-md overflow-hidden">
      {/* Table Header & Controls */}
      <div className="p-3 border-b border-[#243042] flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#162030]">
        <div>
          <h2 className="text-sm font-semibold text-white flex items-center gap-2">
            <span>Column Overview</span>
            <span className="text-[11px] font-mono bg-cyan-950/60 text-cyan-300 border border-cyan-500/30 px-2 py-0.5 rounded font-semibold">
              {schema.length} Columns
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Statistical profile, data hygiene rates, and key distributions.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Quick type filter pills */}
          <div className="hidden md:flex items-center bg-[#0e1422] p-0.5 rounded border border-[#2d3a4f] text-[11px]">
            <button
              onClick={() => { setTypeFilter('ALL'); setCurrentPage(1); }}
              className={`px-2 py-1 rounded transition-colors ${
                typeFilter === 'ALL' ? 'bg-cyan-500/20 text-cyan-300 font-semibold' : 'text-slate-400 hover:text-white'
              }`}
            >
              All
            </button>
            <button
              onClick={() => { setTypeFilter('NUM'); setCurrentPage(1); }}
              className={`px-2 py-1 rounded transition-colors ${
                typeFilter === 'NUM' ? 'bg-cyan-500/20 text-cyan-300 font-semibold' : 'text-slate-400 hover:text-white'
              }`}
            >
              NUM
            </button>
            <button
              onClick={() => { setTypeFilter('TXT'); setCurrentPage(1); }}
              className={`px-2 py-1 rounded transition-colors ${
                typeFilter === 'TXT' ? 'bg-purple-500/20 text-purple-300 font-semibold' : 'text-slate-400 hover:text-white'
              }`}
            >
              TXT
            </button>
            <button
              onClick={() => { setTypeFilter('DATE'); setCurrentPage(1); }}
              className={`px-2 py-1 rounded transition-colors ${
                typeFilter === 'DATE' ? 'bg-emerald-500/20 text-emerald-300 font-semibold' : 'text-slate-400 hover:text-white'
              }`}
            >
              DATE
            </button>
          </div>

          <div className="relative w-full sm:w-48">
            <input
              type="text"
              value={filterText}
              onChange={(e) => {
                setFilterText(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Filter columns..."
              className="w-full h-8 pl-8 pr-2 bg-[#0e1422] border border-[#2d3a4f] rounded text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-cyan-400 transition-colors"
            />
            <span className="material-symbols-outlined text-[16px] text-slate-500 absolute left-2 top-2">
              filter_list
            </span>
          </div>
        </div>
      </div>

      {/* Horizontally Scrollable Table */}
      <div className="overflow-x-auto relative">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#0e1422] border-b border-[#243042] text-[11px] text-slate-400 uppercase tracking-wider font-semibold">
              <th scope="col" className="sticky left-0 bg-[#0e1422] px-3 py-2.5 z-20 shadow-[1px_0_0_0_#243042]">
                Column Name
              </th>
              <th scope="col" className="px-3 py-2.5">Type</th>
              <th scope="col" className="px-3 py-2.5 text-right">Unique</th>
              <th scope="col" className="px-3 py-2.5 text-right">Missing</th>
              <th scope="col" className="px-3 py-2.5 text-right">Missing %</th>
              <th scope="col" className="px-3 py-2.5">Distribution / Range</th>
              <th scope="col" className="px-3 py-2.5 text-right">Mean</th>
              <th scope="col" className="px-3 py-2.5 text-right">Median</th>
              <th scope="col" className="px-3 py-2.5 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1e293b] text-xs">
            {pagedColumns.map((col, idx) => {
              const isEven = idx % 2 === 0;
              const hasMissing = col.missing_count > 0;

              return (
                <tr
                  key={col.name}
                  className={`transition-colors group ${
                    isEven ? 'bg-[#141c2b] hover:bg-[#1a2538]' : 'bg-[#101724] hover:bg-[#1a2538]'
                  }`}
                >
                  <td
                    className={`sticky left-0 px-3 py-2.5 font-mono text-slate-200 font-semibold z-10 shadow-[1px_0_0_0_#243042] ${
                      isEven ? 'bg-[#141c2b] group-hover:bg-[#1a2538]' : 'bg-[#101724] group-hover:bg-[#1a2538]'
                    }`}
                  >
                    {col.name}
                  </td>
                  <td className="px-3 py-2.5">
                    {col.type === 'NUM' && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded bg-cyan-950/60 text-cyan-300 border border-cyan-500/30 text-[10px] font-mono font-semibold">
                        NUM
                      </span>
                    )}
                    {col.type === 'DATE' && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-300 border border-emerald-500/30 text-[10px] font-mono font-semibold">
                        DATE
                      </span>
                    )}
                    {col.type === 'TXT' && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded bg-purple-950/60 text-purple-300 border border-purple-500/30 text-[10px] font-mono font-semibold">
                        TXT
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-2.5 text-right font-mono tabular-nums text-slate-200">
                    {col.unique_count.toLocaleString()}
                  </td>
                  <td
                    className={`px-3 py-2.5 text-right font-mono tabular-nums ${
                      hasMissing ? 'text-amber-400 font-semibold' : 'text-slate-400'
                    }`}
                  >
                    {col.missing_count}
                  </td>
                  <td className="px-3 py-2.5 text-right font-mono">
                    <span className={hasMissing ? 'text-amber-400' : 'text-emerald-400'}>
                      {col.missing_percentage}%
                    </span>
                  </td>
                  <td className="px-3 py-2.5">
                    {col.type === 'NUM' && col.min !== undefined && col.max !== undefined && (
                      <div className="flex items-center gap-1.5 font-mono text-[11px] text-slate-400">
                        <span className="text-slate-300 font-medium">
                          {typeof col.min === 'number' ? col.min.toLocaleString() : col.min}
                        </span>
                        <span className="text-cyan-500">→</span>
                        <span className="text-slate-300 font-medium">
                          {typeof col.max === 'number' ? col.max.toLocaleString() : col.max}
                        </span>
                      </div>
                    )}
                    {col.type === 'DATE' && (
                      <div className="flex items-center gap-1.5 font-mono text-[11px] text-slate-400">
                        <span className="text-slate-200 font-medium">{String(col.min || '2023-01-01')}</span>
                        <span className="text-emerald-500">→</span>
                        <span className="text-slate-200 font-medium">{String(col.max || '2024-12-31')}</span>
                      </div>
                    )}
                    {col.type === 'TXT' && (
                      <span className="text-slate-400 text-[11px] truncate max-w-xs block">
                        {col.top_values && col.top_values.length > 0
                          ? col.top_values.map((v) => v.value).join(', ')
                          : col.sample_values?.join(', ') || '-'}
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-2.5 text-right font-mono tabular-nums text-cyan-300 font-medium">
                    {col.mean !== undefined && col.mean !== null ? col.mean.toLocaleString() : '-'}
                  </td>
                  <td className="px-3 py-2.5 text-right font-mono tabular-nums text-cyan-300 font-medium">
                    {col.median !== undefined && col.median !== null ? col.median.toLocaleString() : '-'}
                  </td>
                  <td className="px-3 py-2.5 text-center">
                    <button
                      onClick={() => onInspectColumn && onInspectColumn(col.name)}
                      className="p-1 hover:bg-[#223046] rounded text-slate-400 hover:text-slate-200 transition-colors"
                      title="Inspect column telemetry"
                    >
                      <span className="material-symbols-outlined text-[16px]">more_horiz</span>
                    </button>
                  </td>
                </tr>
              );
            })}
            {pagedColumns.length === 0 && (
              <tr>
                <td colSpan={9} className="text-center py-8 text-slate-400">
                  No columns match your search query.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="px-3 py-2.5 border-t border-[#243042] bg-[#101724] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">
            Showing {filteredSchema.length > 0 ? (currentPage - 1) * pageSize + 1 : 0}-
            {Math.min(currentPage * pageSize, filteredSchema.length)} of {filteredSchema.length} columns
          </span>
          <div className="hidden sm:flex items-center gap-1 font-mono text-[11px] text-slate-500">
            <span className="material-symbols-outlined text-[14px]">swap_horiz</span>
            <span>Scroll horizontally for full profile metrics</span>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage <= 1}
            className="p-1 rounded border border-[#2d3a4f] text-slate-300 hover:bg-[#223046] disabled:opacity-40 disabled:cursor-not-allowed bg-[#162030] transition-colors"
          >
            <span className="material-symbols-outlined text-[16px]">chevron_left</span>
          </button>
          <span className="text-xs font-semibold px-2 text-slate-300 font-mono">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage >= totalPages}
            className="p-1 rounded border border-[#2d3a4f] text-slate-300 hover:bg-[#223046] disabled:opacity-40 disabled:cursor-not-allowed bg-[#162030] transition-colors"
          >
            <span className="material-symbols-outlined text-[16px]">chevron_right</span>
          </button>
        </div>
      </div>
    </section>
  );
};
