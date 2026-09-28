import {
  DatasetProfile,
  DatasetQuality,
  CleaningOptions,
  CleaningPlanPreview,
  CleaningExecutionResult,
  VisualizationRecommendation,
  ChartDataResponse,
  DashboardResponse,
  DataPreviewResponse,
} from '../types/dataset';

const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:8000').replace(/\/$/, '');

function getEndpoint(path: string): string {
  return `${API_BASE_URL}${path}`;
}

async function requestJson<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(getEndpoint(path), init);
  if (!response.ok) {
    const text = await response.text();
    let message = `Request failed (${response.status}).`;
    try {
      const parsed = JSON.parse(text);
      message = parsed.detail || parsed.message || message;
    } catch {
      if (text) message = text;
    }
    throw new Error(message);
  }
  return response.json();
}

export async function uploadDataset(file: File) {
  const formData = new FormData();
  formData.append('file', file);
  const raw: any = await requestJson('/api/datasets/upload', { method: 'POST', body: formData });
  const dataset = raw.dataset || raw;
  return {
    dataset_id: dataset.id || dataset.dataset_id,
    name: dataset.filename || dataset.name || file.name,
    rows: dataset.rows,
    columns: dataset.columns,
    file_size: dataset.file_size || `${Math.round((dataset.file_size_bytes || file.size) / 1024)} KB`,
    format: (file.name.toLowerCase().endsWith('.xlsx') ? 'XLSX' : 'CSV') as 'CSV' | 'XLSX',
    status: 'ready',
  };
}

export async function loadSampleDataset() {
  return requestJson('/api/datasets/sample', { method: 'POST', headers: { 'Content-Type': 'application/json' } });
}

export async function getDatasetProfile(datasetId: string): Promise<DatasetProfile> {
  const raw: any = await requestJson(`/api/datasets/${datasetId}/profile`);
  const profile = raw.profile || raw;
  return profile.ui || profile;
}

export async function getDatasetQuality(datasetId: string): Promise<DatasetQuality> {
  const raw: any = await requestJson(`/api/datasets/${datasetId}/quality`);
  const quality = raw.quality || raw;
  return quality.ui || quality;
}

export async function getQualityScore(datasetId: string) {
  const raw: any = await requestJson(`/api/datasets/${datasetId}/quality-score`);
  return {
    dataset_id: datasetId,
    quality_score: raw.quality_score ?? raw.score ?? raw.quality?.score ?? 0,
    status: raw.status || 'calculated',
  };
}

export function optionsToOperations(options: CleaningOptions): any[] {
  const operations: any[] = [];
  if (options.remove_duplicates) operations.push({ type: 'remove_duplicates' });
  if (options.remove_empty_rows) operations.push({ type: 'remove_empty_rows' });
  if (options.remove_empty_columns) operations.push({ type: 'remove_empty_columns' });
  if (options.drop_missing_rows) operations.push({ type: 'remove_missing_rows' });

  // Never stage a missing-value operation unless the user explicitly selected
  // at least one target column. This prevents the UI defaults from silently
  // modifying every compatible column.
  if (options.missing_numeric_method !== 'drop' && (options.missing_numeric_columns || []).length) {
    operations.push({
      type: 'fill_missing_numeric',
      method: options.missing_numeric_method === 'zero' ? 'mean' : options.missing_numeric_method,
      columns: options.missing_numeric_columns,
      zero_fill: options.missing_numeric_method === 'zero',
    });
  }

  if ((options.missing_categorical_columns || []).length) {
    const value = options.missing_categorical_method === 'mode'
      ? '__MODE__'
      : options.missing_categorical_method === 'ffill'
        ? '__FFILL__'
        : options.missing_categorical_method === 'custom'
          ? (options.missing_categorical_custom_value ?? 'Unknown')
          : 'Unknown';
    operations.push({ type: 'fill_missing_categorical', value, columns: options.missing_categorical_columns });
  }

  if (options.trim_whitespace) operations.push({ type: 'trim_whitespace' });
  if (options.title_case) operations.push({ type: 'standardize_text', mode: 'title' });
  if (options.uppercase) operations.push({ type: 'standardize_text', mode: 'upper' });
  if (options.lowercase) operations.push({ type: 'standardize_text', mode: 'lower' });
  if (options.date_columns_to_iso?.length) operations.push({ type: 'parse_dates', columns: options.date_columns_to_iso });
  if (options.convert_type_columns?.length) operations.push({
    type: 'convert_types',
    target: options.convert_type_target || 'numeric',
    columns: options.convert_type_columns,
  });
  if (options.rename_mapping && Object.keys(options.rename_mapping).length) operations.push({ type: 'rename_columns', mapping: options.rename_mapping });
  if (options.remove_columns?.length) operations.push({ type: 'remove_columns', columns: options.remove_columns });
  return operations;
}

function mapCleaningPlan(raw: any, options: CleaningOptions): CleaningPlanPreview {
  const c = raw.cleaning || raw;
  const before = c.before || { rows: 0, columns: 0, missing_cells: 0, duplicate_rows: 0 };
  const after = c.after || before;
  const operations = c.operations || [];
  const duplicateRemoved = Math.max(0, before.duplicate_rows - after.duplicate_rows);
  const cellsImputed = Math.max(0, before.missing_cells - after.missing_cells);
  const textCleaned = operations
    .filter((op: any) => ['trim_whitespace', 'standardize_text'].includes(op.type))
    .reduce((sum: number, op: any) => sum + Math.max(0, op.changed_missing_cells || 0), 0);
  return {
    dataset_id: c.dataset_id,
    original: { ...before, version: 'v1.0' },
    transformed: { ...after, version: 'v1.1-preview' },
    net_difference: {
      duplicate_rows_removed: duplicateRemoved,
      cells_imputed: cellsImputed,
      text_cleaned_cells: textCleaned,
      summary: `Previewed ${operations.length} staged operation${operations.length === 1 ? '' : 's'} without changing the source dataset.`,
      validation_status: 'Preview only — source dataset unchanged.',
    },
    operations_staged: optionsToOperations(options).map((op: any) => ({
      operation: op.type,
      target: (op.columns || []).join(', ') || 'Detected columns',
      method: op.method || op.mode || op.value || 'default',
    })),
  };
}

export async function previewCleaningPlan(datasetId: string, options: CleaningOptions): Promise<CleaningPlanPreview> {
  const raw = await requestJson(`/api/datasets/${datasetId}/clean/plan`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ operations: optionsToOperations(options) }),
  });
  return mapCleaningPlan(raw, options);
}

export async function applyCleaning(datasetId: string, options: CleaningOptions): Promise<CleaningExecutionResult & { cleaned_id?: string }> {
  const raw: any = await requestJson(`/api/datasets/${datasetId}/clean`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ operations: optionsToOperations(options) }),
  });
  const c = raw.cleaning || raw;
  const before = c.before || { rows: 0, columns: 0, missing_cells: 0, duplicate_rows: 0 };
  const after = c.after || before;
  return {
    success: true,
    dataset_id: datasetId,
    cleaned_id: c.cleaned_id,
    new_version: 'v2.0',
    before: { ...before, version: 'v1.0' },
    after: { ...after, version: 'v2.0' },
    audit_log: (c.operations || []).map((op: any, i: number) => ({
      id: `log-${i + 1}`,
      operation: op.description || op.type,
      column: (op.columns || []).join(', ') || 'Dataset',
      cells_affected: Math.max(0, op.changed_missing_cells || 0),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: op.changed_columns < 0 || op.changed_rows < 0 ? 'dropped' : 'cleaned',
    })),
    message: `Cleaning applied successfully. Created cleaned dataset ${c.cleaned_id || ''}`.trim(),
  };
}

export async function getVisualizationRecommendations(datasetId: string): Promise<VisualizationRecommendation[]> {
  const raw: any = await requestJson(`/api/datasets/${datasetId}/visualizations/recommend`);
  const list = raw.visualizations || raw.recommendations || [];
  return list.map((item: any, index: number) => ({
    id: item.id || `chart-${index}`,
    title: item.title || `${String(item.type || 'chart').toUpperCase()} — ${item.x}${item.y ? ` vs ${item.y}` : ''}`,
    type: item.type,
    x_axis: item.x_axis || item.x,
    y_axis: item.y_axis || item.y || '',
    reason: item.reason || 'Recommended from detected dataset column types.',
  }));
}

export async function getVisualizationData(datasetId: string, chartId: string): Promise<ChartDataResponse> {
  const recommendations = await getVisualizationRecommendations(datasetId);
  const rec = recommendations.find((r) => r.id === chartId) || recommendations[0];
  if (!rec) throw new Error('No visualization recommendation is available for this dataset.');
  const query = new URLSearchParams({ chart_type: rec.type, x: rec.x_axis });
  if (rec.y_axis) query.set('y', rec.y_axis);
  const raw: any = await requestJson(`/api/datasets/${datasetId}/visualizations/data?${query.toString()}`);
  const chart = raw.chart || raw;
  return {
    chart_id: chartId,
    title: rec.title,
    type: chart.type,
    x_axis: chart.x_axis || chart.x,
    y_axis: chart.y_axis || chart.y || '',
    data: (chart.points || chart.data || []).map((p: any) => ({ x: p.x, y: Number(p.y), label: p.label })),
  };
}

export async function getDashboard(datasetId: string): Promise<DashboardResponse> {
  const raw: any = await requestJson(`/api/datasets/${datasetId}/dashboard`);
  const dashboard = raw.dashboard || raw;
  return dashboard;
}

export async function getDataPreview(
  datasetId: string,
  page = 1,
  pageSize = 15,
  search = '',
  sortBy = '',
  sortDir = 'asc'
): Promise<DataPreviewResponse> {
  const query = new URLSearchParams({
    page: String(page), page_size: String(pageSize), search,
    sort_by: sortBy, sort_dir: sortDir,
  });
  return requestJson(`/api/datasets/${datasetId}/preview?${query.toString()}`);
}

export function getExportDownloadUrl(datasetId: string, format: 'csv' | 'xlsx', cleanedId?: string): string {
  const target = cleanedId ? `/api/datasets/cleaned/${cleanedId}/export?format=${format}` : `/api/datasets/${datasetId}/export?format=${format}`;
  return getEndpoint(target);
}
