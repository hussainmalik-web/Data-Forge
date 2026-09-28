import React from 'react';
import { CleaningOptions, DatasetProfile } from '../../types/dataset';

interface Props {
  options: CleaningOptions;
  onChangeOptions: (next: CleaningOptions) => void;
  profile?: DatasetProfile;
  recipeTitle?: string;
  isStaged?: boolean;
}

type OperationKey =
  | 'remove_duplicates'
  | 'remove_empty_rows'
  | 'remove_empty_columns'
  | 'drop_missing_rows'
  | 'fill_missing_numeric'
  | 'fill_missing_categorical'
  | 'trim_whitespace'
  | 'standardize_text'
  | 'parse_dates'
  | 'convert_types'
  | 'rename_columns'
  | 'remove_columns';

const operations: Array<[OperationKey, string, string]> = [
  ['remove_duplicates', 'Remove duplicate rows', 'Keep the first exact duplicate row.'],
  ['remove_empty_rows', 'Remove completely empty rows', 'Delete rows where every cell is empty or missing.'],
  ['remove_empty_columns', 'Remove completely empty columns', 'Delete columns where every cell is empty or missing.'],
  ['drop_missing_rows', 'Remove rows containing missing values', 'Drop rows with any missing value after common missing tokens are normalized.'],
  ['fill_missing_numeric', 'Fill missing numeric values', 'Use median, mean, or zero for selected numeric columns.'],
  ['fill_missing_categorical', 'Fill missing categorical values', 'Use Unknown, most frequent value, forward fill, or a custom value.'],
  ['trim_whitespace', 'Trim whitespace', 'Remove leading/trailing spaces and turn whitespace-only cells into missing values.'],
  ['standardize_text', 'Standardize text case', 'Convert text to lowercase, Title Case, or UPPERCASE.'],
  ['parse_dates', 'Parse date columns', 'Convert selected columns to real datetime values.'],
  ['convert_types', 'Convert column data types', 'Convert selected columns to numeric, string, or date.'],
  ['rename_columns', 'Rename columns', 'Apply an explicit old-name → new-name mapping.'],
  ['remove_columns', 'Remove selected columns', 'Exclude selected columns from the cleaned copy.'],
];

const enabled = (options: CleaningOptions, key: OperationKey) =>
  Boolean(options._enabled_operations?.includes(key));

export const ActiveOperationRecipe: React.FC<Props> = ({
  options,
  onChangeOptions,
  profile,
  recipeTitle = 'Cleaning Operations',
  isStaged = true,
}) => {
  const numerical = profile?.numerical_columns || [];
  const categorical = profile?.categorical_columns || [];
  const allColumns = profile?.schema.map((c) => c.name) || [];

  const set = (patch: Partial<CleaningOptions>) => onChangeOptions({ ...options, ...patch });

  const setEnabled = (key: OperationKey, value: boolean) => {
    const current = options._enabled_operations || [];
    const nextEnabled = value
      ? Array.from(new Set([...current, key]))
      : current.filter((item) => item !== key);

    const patch: Partial<CleaningOptions> = { _enabled_operations: nextEnabled };

    if (!value) {
      if (key === 'remove_duplicates') patch.remove_duplicates = false;
      if (key === 'remove_empty_rows') patch.remove_empty_rows = false;
      if (key === 'remove_empty_columns') patch.remove_empty_columns = false;
      if (key === 'drop_missing_rows') patch.drop_missing_rows = false;
      if (key === 'fill_missing_numeric') {
        patch.missing_numeric_columns = [];
        patch.missing_numeric_method = 'drop';
      }
      if (key === 'fill_missing_categorical') patch.missing_categorical_columns = [];
      if (key === 'trim_whitespace') patch.trim_whitespace = false;
      if (key === 'standardize_text') {
        patch.title_case = false;
        patch.uppercase = false;
        patch.lowercase = false;
      }
      if (key === 'parse_dates') patch.date_columns_to_iso = [];
      if (key === 'convert_types') patch.convert_type_columns = [];
      if (key === 'rename_columns') patch.rename_mapping = {};
      if (key === 'remove_columns') patch.remove_columns = [];
      set(patch);
      return;
    }

    if (key === 'remove_duplicates') patch.remove_duplicates = true;
    if (key === 'remove_empty_rows') patch.remove_empty_rows = true;
    if (key === 'remove_empty_columns') patch.remove_empty_columns = true;
    if (key === 'drop_missing_rows') patch.drop_missing_rows = true;
    if (key === 'fill_missing_numeric') {
      patch.missing_numeric_method = 'median';
      patch.missing_numeric_columns = options.missing_numeric_columns.length
        ? options.missing_numeric_columns
        : numerical;
    }
    if (key === 'fill_missing_categorical') {
      patch.missing_categorical_columns = options.missing_categorical_columns.length
        ? options.missing_categorical_columns
        : categorical;
    }
    if (key === 'trim_whitespace') patch.trim_whitespace = true;
    if (key === 'standardize_text') {
      patch.title_case = true;
      patch.uppercase = false;
      patch.lowercase = false;
    }
    // Do not auto-select all date columns. This makes explicit date parsing
    // safe for mixed datasets and gives the user a real selection step.
    if (key === 'parse_dates') patch.date_columns_to_iso = options.date_columns_to_iso || [];
    if (key === 'convert_types') patch.convert_type_columns = options.convert_type_columns || [];
    if (key === 'rename_columns') patch.rename_mapping = options.rename_mapping || {};
    if (key === 'remove_columns') patch.remove_columns = options.remove_columns || [];

    set(patch);
  };

  const toggleColumn = (
    key: 'missing_numeric_columns' | 'missing_categorical_columns' | 'date_columns_to_iso' | 'convert_type_columns' | 'remove_columns',
    col: string,
  ) => {
    const current = [...((options[key] || []) as string[])];
    const next = current.includes(col) ? current.filter((x) => x !== col) : [...current, col];
    set({ [key]: next } as Partial<CleaningOptions>);
  };

  const setAll = (
    key: 'missing_numeric_columns' | 'missing_categorical_columns' | 'date_columns_to_iso' | 'convert_type_columns' | 'remove_columns',
    cols: string[],
  ) => set({ [key]: cols } as Partial<CleaningOptions>);

  return (
    <section className="bg-[#141d2e] border border-slate-800 rounded-lg p-4 shadow-lg shadow-black/30 space-y-3">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-md bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <span className="material-symbols-outlined text-base">auto_fix_high</span>
          </div>
          <div>
            <h3 className="text-xs font-semibold text-slate-100">{recipeTitle}</h3>
            <p className="text-[11px] text-slate-400">Select an operation, configure it, preview the impact, then apply.</p>
          </div>
        </div>
        <span className="text-[10px] font-mono font-semibold px-2.5 py-0.5 rounded bg-cyan-950/70 border border-cyan-500/30 text-cyan-300">
          {isStaged ? 'Staged (Ready)' : 'Configured'}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        {operations.map(([key, title, description]) => {
          const checked = enabled(options, key);
          return (
            <label key={key} className={`p-3 rounded-lg border cursor-pointer transition ${checked ? 'border-cyan-500/50 bg-cyan-500/5' : 'border-slate-800 bg-[#0f172a] hover:border-slate-700'}`}>
              <div className="flex items-start gap-2">
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={(e) => setEnabled(key, e.target.checked)}
                  className="mt-0.5 w-4 h-4 accent-cyan-500"
                />
                <span>
                  <span className="text-xs font-semibold text-slate-200 block">{title}</span>
                  <span className="text-[11px] text-slate-400">{description}</span>
                </span>
              </div>
            </label>
          );
        })}
      </div>

      {enabled(options, 'fill_missing_numeric') && (
        <ConfigBox title="Numeric missing values" columns={numerical} selected={options.missing_numeric_columns} onToggle={(c) => toggleColumn('missing_numeric_columns', c)} onAll={() => setAll('missing_numeric_columns', numerical)} onNone={() => setAll('missing_numeric_columns', [])}>
          <select value={options.missing_numeric_method} onChange={(e) => set({ missing_numeric_method: e.target.value as CleaningOptions['missing_numeric_method'] })} className="bg-[#141d2e] border border-slate-700 rounded px-2 py-1.5 text-xs text-slate-200">
            <option value="median">Median</option>
            <option value="mean">Mean</option>
            <option value="zero">Zero fill</option>
          </select>
        </ConfigBox>
      )}

      {enabled(options, 'fill_missing_categorical') && (
        <ConfigBox title="Categorical missing values" columns={categorical} selected={options.missing_categorical_columns} onToggle={(c) => toggleColumn('missing_categorical_columns', c)} onAll={() => setAll('missing_categorical_columns', categorical)} onNone={() => setAll('missing_categorical_columns', [])}>
          <select value={options.missing_categorical_method} onChange={(e) => set({ missing_categorical_method: e.target.value as CleaningOptions['missing_categorical_method'] })} className="bg-[#141d2e] border border-slate-700 rounded px-2 py-1.5 text-xs text-slate-200">
            <option value="unknown">Unknown</option>
            <option value="mode">Most frequent (mode)</option>
            <option value="ffill">Forward fill</option>
            <option value="custom">Custom value</option>
          </select>
        </ConfigBox>
      )}

      {enabled(options, 'fill_missing_categorical') && options.missing_categorical_method === 'custom' && (
        <div className="p-3 rounded-lg border border-slate-800 bg-[#0f172a]">
          <label className="text-xs font-semibold text-slate-200 block mb-2">Custom replacement value</label>
          <input value={options.missing_categorical_custom_value || ''} onChange={(e) => set({ missing_categorical_custom_value: e.target.value })} placeholder="e.g. Unknown" className="w-full bg-[#141d2e] border border-slate-700 rounded px-2 py-1.5 text-xs text-slate-200" />
        </div>
      )}

      {enabled(options, 'standardize_text') && (
        <div className="p-3 rounded-lg border border-slate-800 bg-[#0f172a] flex flex-wrap gap-2 items-center">
          <span className="text-xs text-slate-300 font-semibold">Case:</span>
          {([['lowercase', 'lowercase'], ['title_case', 'Title Case'], ['uppercase', 'UPPERCASE']] as const).map(([k, label]) => (
            <button type="button" key={k} onClick={() => set({ title_case: k === 'title_case', uppercase: k === 'uppercase', lowercase: k === 'lowercase' })} className={`px-2.5 py-1 rounded text-xs border ${Boolean(options[k]) ? 'border-cyan-500 bg-cyan-500/10 text-cyan-300' : 'border-slate-700 text-slate-400'}`}>
              {label}
            </button>
          ))}
        </div>
      )}

      {enabled(options, 'parse_dates') && (
        <ColumnBox title="Date columns to parse" columns={allColumns} selected={options.date_columns_to_iso || []} onToggle={(c) => toggleColumn('date_columns_to_iso', c)} onAll={() => setAll('date_columns_to_iso', allColumns)} onNone={() => setAll('date_columns_to_iso', [])} />
      )}

      {enabled(options, 'convert_types') && (
        <ColumnBox title="Columns to convert" columns={allColumns} selected={options.convert_type_columns || []} onToggle={(c) => toggleColumn('convert_type_columns', c)} onAll={() => setAll('convert_type_columns', allColumns)} onNone={() => setAll('convert_type_columns', [])}>
          <select value={options.convert_type_target || 'numeric'} onChange={(e) => set({ convert_type_target: e.target.value as CleaningOptions['convert_type_target'] })} className="bg-[#141d2e] border border-slate-700 rounded px-2 py-1.5 text-xs text-slate-200">
            <option value="numeric">Numeric</option>
            <option value="string">String</option>
            <option value="date">Date</option>
          </select>
        </ColumnBox>
      )}

      {enabled(options, 'remove_columns') && (
        <ColumnBox title="Columns to remove" columns={allColumns} selected={options.remove_columns || []} onToggle={(c) => toggleColumn('remove_columns', c)} onAll={() => setAll('remove_columns', allColumns)} onNone={() => setAll('remove_columns', [])} />
      )}

      {enabled(options, 'rename_columns') && (
        <div className="p-3 rounded-lg border border-slate-800 bg-[#0f172a]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-200">Rename columns</span>
            <button type="button" onClick={() => set({ rename_mapping: {} })} className="text-[11px] text-slate-400 hover:text-white">Clear</button>
          </div>
          <div className="mt-2 grid gap-2">
            {(profile?.schema || []).map((c) => (
              <div key={c.name} className="grid grid-cols-[1fr_auto_1fr] gap-2 items-center">
                <span className="text-[11px] text-slate-400 truncate">{c.name}</span>
                <span className="text-slate-600">→</span>
                <input value={options.rename_mapping?.[c.name] || ''} onChange={(e) => set({ rename_mapping: { ...(options.rename_mapping || {}), [c.name]: e.target.value } })} placeholder="new name" className="bg-[#141d2e] border border-slate-700 rounded px-2 py-1.5 text-xs text-slate-200" />
              </div>
            ))}
          </div>
          <p className="mt-2 text-[11px] text-slate-500">Enter a new name for at least one column before applying.</p>
        </div>
      )}
    </section>
  );
};

function ConfigBox({ title, columns, selected, onToggle, onAll, onNone, children }: { title: string; columns: string[]; selected: string[]; onToggle: (c: string) => void; onAll: () => void; onNone: () => void; children: React.ReactNode }) {
  return (
    <div className="p-3 rounded-lg border border-slate-800 bg-[#0f172a] space-y-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-xs font-semibold text-slate-200">{title}</span>
        <div className="flex gap-2">{children}<button type="button" onClick={onAll} className="text-[11px] text-cyan-400">All</button><button type="button" onClick={onNone} className="text-[11px] text-slate-400">None</button></div>
      </div>
      <div className="flex flex-wrap gap-2">{columns.length ? columns.map((c) => <button type="button" key={c} onClick={() => onToggle(c)} className={`px-2 py-1 rounded border text-[11px] ${selected.includes(c) ? 'border-cyan-500/50 bg-cyan-500/10 text-cyan-300' : 'border-slate-700 text-slate-400'}`}>{c}</button>) : <span className="text-[11px] text-slate-500">No compatible columns detected.</span>}</div>
    </div>
  );
}

function ColumnBox({ title, columns, selected, onToggle, onAll, onNone, children }: { title: string; columns: string[]; selected: string[]; onToggle: (c: string) => void; onAll: () => void; onNone: () => void; children?: React.ReactNode }) {
  return (
    <div className="p-3 rounded-lg border border-slate-800 bg-[#0f172a] space-y-2">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-semibold text-slate-200">{title}</span>
        <div className="flex gap-2 items-center">{children}<button type="button" onClick={onAll} className="text-[11px] text-cyan-400">All</button><button type="button" onClick={onNone} className="text-[11px] text-slate-400">None</button></div>
      </div>
      <div className="flex flex-wrap gap-2">{columns.map((c) => <button type="button" key={c} onClick={() => onToggle(c)} className={`px-2 py-1 rounded border text-[11px] ${selected.includes(c) ? 'border-cyan-500/50 bg-cyan-500/10 text-cyan-300' : 'border-slate-700 text-slate-400'}`}>{c}</button>)}</div>
    </div>
  );
}
