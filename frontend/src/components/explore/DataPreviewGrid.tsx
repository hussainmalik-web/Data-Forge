import React, { useState, useEffect } from 'react';
import { getDataPreview } from '../../services/api';
import { DataPreviewResponse } from '../../types/dataset';

interface DataPreviewGridProps {
  datasetId: string;
}

export const DataPreviewGrid: React.FC<DataPreviewGridProps> = ({ datasetId }) => {
  const [data, setData] = useState<DataPreviewResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [sortBy, setSortBy] = useState('');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 250);
    return () => clearTimeout(timer);
  }, [search]);

  // Load preview data
  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);

    getDataPreview(datasetId, page, pageSize, debouncedSearch, sortBy, sortDir)
      .then((res) => {
        if (isMounted) {
          setData(res);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err.message || 'Failed to fetch preview records.');
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [datasetId, page, pageSize, debouncedSearch, sortBy, sortDir]);

  const handleSort = (col: string) => {
    if (sortBy === col) {
      setSortDir((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(col);
      setSortDir('asc');
    }
    setPage(1);
  };

  return (
    <div className="bg-[#141c2b] border border-[#243042] rounded-xl shadow-md overflow-hidden">
      {/* Controls Bar */}
      <div className="p-3 border-b border-[#243042] bg-[#162030] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-md bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <span className="material-symbols-outlined text-base">table_chart</span>
          </div>
          <div>
            <h3 className="text-xs font-semibold text-slate-100">
              Interactive Data Exploration Grid
            </h3>
            <span className="text-[11px] text-slate-400 font-mono">
              {data ? `${data.total_rows.toLocaleString()} filtered records` : 'Loading...'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Search */}
          <div className="relative w-full sm:w-56">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search records..."
              className="w-full h-8 pl-8 pr-2 bg-[#0e1422] border border-[#2d3a4f] rounded text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-cyan-400 transition-colors"
            />
            <span className="material-symbols-outlined text-[16px] text-slate-500 absolute left-2 top-2">
              search
            </span>
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-2 top-2 text-slate-400 hover:text-white"
              >
                <span className="material-symbols-outlined text-[14px]">close</span>
              </button>
            )}
          </div>

          {/* Page Size */}
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <span className="hidden sm:inline">Rows:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setPage(1);
              }}
              className="h-8 bg-[#0e1422] border border-[#2d3a4f] rounded px-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-400"
            >
              <option value="15">15</option>
              <option value="25">25</option>
              <option value="50">50</option>
              <option value="100">100</option>
            </select>
          </div>
        </div>
      </div>

      {/* Grid Canvas */}
      <div className="overflow-x-auto relative min-h-[350px]">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-3">
            <span className="material-symbols-outlined text-3xl text-cyan-400 animate-spin">
              progress_activity
            </span>
            <span className="text-xs font-mono">Streaming slice into viewport...</span>
          </div>
        ) : error ? (
          <div className="p-8 text-center text-xs text-rose-400">
            <span className="material-symbols-outlined text-2xl mb-1">error_outline</span>
            <p>{error}</p>
          </div>
        ) : data && data.rows.length > 0 ? (
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#0e1422] border-b border-[#243042] text-[11px] text-slate-400 uppercase tracking-wider font-semibold">
                <th className="sticky left-0 bg-[#0e1422] px-3 py-2.5 z-20 shadow-[1px_0_0_0_#243042] w-12 text-center">
                  #
                </th>
                {data.columns.map((col) => (
                  <th
                    key={col}
                    onClick={() => handleSort(col)}
                    className="px-3 py-2.5 cursor-pointer hover:text-cyan-300 transition-colors whitespace-nowrap select-none"
                  >
                    <div className="flex items-center gap-1">
                      <span>{col}</span>
                      {sortBy === col && (
                        <span className="material-symbols-outlined text-xs text-cyan-400">
                          {sortDir === 'asc' ? 'arrow_upward' : 'arrow_downward'}
                        </span>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e293b]">
              {data.rows.map((row, idx) => {
                const rowIndex = (page - 1) * pageSize + idx + 1;
                const isEven = idx % 2 === 0;

                return (
                  <tr
                    key={idx}
                    className={`transition-colors group ${
                      isEven ? 'bg-[#141c2b] hover:bg-[#1a2538]' : 'bg-[#101724] hover:bg-[#1a2538]'
                    }`}
                  >
                    <td
                      className={`sticky left-0 px-3 py-2 text-center font-mono text-[11px] text-slate-500 z-10 shadow-[1px_0_0_0_#243042] ${
                        isEven ? 'bg-[#141c2b] group-hover:bg-[#1a2538]' : 'bg-[#101724] group-hover:bg-[#1a2538]'
                      }`}
                    >
                      {rowIndex}
                    </td>
                    {data.columns.map((col) => {
                      const val = row[col];
                      const isNull = val === null || val === undefined || val === 'null';
                      const isNumber = typeof val === 'number';

                      return (
                        <td
                          key={col}
                          className={`px-3 py-2 whitespace-nowrap ${
                            isNumber ? 'font-mono text-right tabular-nums' : ''
                          }`}
                        >
                          {isNull ? (
                            <span className="text-[10px] font-mono text-amber-500/80 bg-amber-950/40 px-1 py-0.5 rounded border border-amber-900/40">
                              NULL
                            </span>
                          ) : isNumber ? (
                            <span className="text-slate-200">
                              {col.includes('revenue') || col.includes('profit')
                                ? `$${val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                                : col.includes('discount')
                                ? `${(val * 100).toFixed(0)}%`
                                : val.toLocaleString()}
                            </span>
                          ) : (
                            <span className="text-slate-300">{String(val)}</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <div className="py-16 text-center text-xs text-slate-400">
            No rows match your current search query.
          </div>
        )}
      </div>

      {/* Pagination Footer */}
      {data && (
        <div className="px-3 py-2.5 border-t border-[#243042] bg-[#101724] flex items-center justify-between">
          <span className="text-xs text-slate-400">
            Page <strong className="text-slate-200 font-mono">{page}</strong> of{' '}
            <strong className="text-slate-200 font-mono">{data.total_pages}</strong> (
            {data.total_rows.toLocaleString()} total rows)
          </span>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage(1)}
              disabled={page <= 1}
              className="p-1 rounded border border-[#2d3a4f] text-slate-300 hover:bg-[#223046] disabled:opacity-40 disabled:cursor-not-allowed bg-[#162030]"
              title="First Page"
            >
              <span className="material-symbols-outlined text-[16px]">first_page</span>
            </button>
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="p-1 rounded border border-[#2d3a4f] text-slate-300 hover:bg-[#223046] disabled:opacity-40 disabled:cursor-not-allowed bg-[#162030]"
              title="Previous Page"
            >
              <span className="material-symbols-outlined text-[16px]">chevron_left</span>
            </button>
            <span className="text-xs font-semibold px-2 text-slate-300 font-mono">
              {page}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(data.total_pages, p + 1))}
              disabled={page >= data.total_pages}
              className="p-1 rounded border border-[#2d3a4f] text-slate-300 hover:bg-[#223046] disabled:opacity-40 disabled:cursor-not-allowed bg-[#162030]"
              title="Next Page"
            >
              <span className="material-symbols-outlined text-[16px]">chevron_right</span>
            </button>
            <button
              onClick={() => setPage(data.total_pages)}
              disabled={page >= data.total_pages}
              className="p-1 rounded border border-[#2d3a4f] text-slate-300 hover:bg-[#223046] disabled:opacity-40 disabled:cursor-not-allowed bg-[#162030]"
              title="Last Page"
            >
              <span className="material-symbols-outlined text-[16px]">last_page</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
