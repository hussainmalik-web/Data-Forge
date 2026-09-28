/**
 * Data Forge - TypeScript Types & API Contracts
 * Aligned with FastAPI backend specifications and Stitch UI designs
 */

export type ColumnType = 'NUM' | 'TXT' | 'DATE';

export interface ColumnSchema {
  name: string;
  type: ColumnType;
  unique_count: number;
  missing_count: number;
  missing_percentage: number;
  min?: number | string;
  max?: number | string;
  mean?: number;
  median?: number;
  std_dev?: number;
  sample_values?: string[];
  top_values?: Array<{ value: string; count: number }>;
}

export interface DatasetSummary {
  dataset_id: string;
  name: string;
  rows: number;
  columns: number;
  file_size: string;
  format: 'CSV' | 'XLSX';
  last_updated: string;
  status: 'ready' | 'processing' | 'error';
  version: string;
}

export interface DatasetProfile {
  dataset_id: string;
  name: string;
  rows: number;
  columns: number;
  file_size: string;
  numerical_columns: string[];
  categorical_columns: string[];
  date_columns: string[];
  missing_cells: number;
  total_cells: number;
  missing_percentage: number;
  duplicate_rows: number;
  duplicate_percentage: number;
  cleanliness_percentage: number;
  empty_rows: number;
  empty_columns: number;
  schema: ColumnSchema[];
}

export interface QualityDimension {
  score: number;
  count_label?: string;
  description: string;
}

export interface QualityIssue {
  id: string;
  type: 'duplicates' | 'missing' | 'invalid_dates' | 'whitespace_casing';
  title: string;
  severity: 'high' | 'medium' | 'low';
  count: number;
  count_label: string;
  description: string;
  details: string;
  affected_columns: string[];
  affected_rows_sample?: number[];
  recommended_action: string;
}

export interface DatasetQuality {
  dataset_id: string;
  overall_score: number;
  status: string;
  action_recommended: string;
  dimensions: {
    completeness: QualityDimension;
    consistency: QualityDimension;
    uniqueness: QualityDimension;
    validity: QualityDimension;
  };
  issues: QualityIssue[];
  anomalies: {
    z_score_outliers: { count: number; column: string; note: string };
    type_mismatches: { count: number; column: string; note: string };
    primary_key_clones: { count: number; rate: string; note: string };
    null_saturation: { rate: string; note: string };
  };
}

export interface CleaningOptions {
  remove_duplicates: boolean;
  missing_numeric_method: 'median' | 'mean' | 'zero' | 'drop';
  missing_numeric_columns: string[];
  missing_categorical_method: 'unknown' | 'mode' | 'ffill' | 'custom';
  missing_categorical_custom_value?: string;
  missing_categorical_columns: string[];
  trim_whitespace: boolean;
  title_case: boolean;
  uppercase?: boolean;
  lowercase?: boolean;
  remove_empty_rows?: boolean;
  rename_mapping?: Record<string, string>;
  remove_columns?: string[];
  convert_type_columns?: string[];
  convert_type_target?: 'numeric' | 'string' | 'date';
  remove_empty_columns?: boolean;
  drop_missing_rows?: boolean;
  date_columns_to_iso?: string[];
  /** UI-only operation selection state; never sent to the backend. */
  _enabled_operations?: string[];
}

export interface DiffMetrics {
  rows: number;
  missing_cells: number;
  duplicate_rows: number;
  columns: number;
  version: string;
}

export interface CleaningPlanPreview {
  dataset_id: string;
  original: DiffMetrics;
  transformed: DiffMetrics;
  net_difference: {
    duplicate_rows_removed: number;
    cells_imputed: number;
    text_cleaned_cells: number;
    summary: string;
    validation_status: string;
  };
  operations_staged: Array<{
    operation: string;
    target: string;
    method: string;
  }>;
}

export interface AuditLogEntry {
  id: string;
  operation: string;
  column: string;
  cells_affected: number;
  timestamp: string;
  status: 'cleaned' | 'transformed' | 'dropped';
}

export interface CleaningExecutionResult {
  success: boolean;
  dataset_id: string;
  new_version: string;
  before: DiffMetrics;
  after: DiffMetrics;
  audit_log: AuditLogEntry[];
  message: string;
}

export interface VisualizationRecommendation {
  id: string;
  title: string;
  type: 'bar' | 'line' | 'scatter' | 'histogram';
  x_axis: string;
  y_axis: string;
  reason: string;
  suitability_score?: number;
}

export interface ChartDataResponse {
  chart_id: string;
  title: string;
  type: 'bar' | 'line' | 'scatter' | 'histogram';
  x_axis: string;
  y_axis: string;
  data: Array<{
    x: string | number;
    y: number;
    label?: string;
  }>;
}

export interface DashboardMetric {
  id: string;
  label: string;
  value: string | number;
  subtext?: string;
  trend?: string;
  status?: 'positive' | 'warning' | 'neutral';
}

export interface DashboardInsight {
  id: string;
  title: string;
  finding: string;
  category: string;
}

export interface DashboardResponse {
  dataset_id: string;
  kpis: DashboardMetric[];
  charts: ChartDataResponse[];
  insights: DashboardInsight[];
}

export interface DataPreviewResponse {
  rows: Record<string, any>[];
  total_rows: number;
  page: number;
  page_size: number;
  total_pages: number;
  columns: string[];
}
