import React, { useState, useEffect } from 'react';
import {
  getDatasetProfile,
  getDatasetQuality,
  previewCleaningPlan,
  applyCleaning,
  optionsToOperations,
} from '../services/api';
import {
  DatasetProfile,
  DatasetQuality,
  QualityIssue,
  CleaningOptions,
  CleaningPlanPreview,
  AuditLogEntry,
} from '../types/dataset';
import { SubNav } from '../components/layout/SubNav';
import { MetadataBanner } from '../components/overview/MetadataBanner';
import { SchemaDistribution } from '../components/overview/SchemaDistribution';
import { KPIScorecards } from '../components/overview/KPIScorecards';
import { ColumnOverviewTable } from '../components/overview/ColumnOverviewTable';
import { QuickHygienePanel } from '../components/overview/QuickHygienePanel';
import { SandboxNotice } from '../components/quality/SandboxNotice';
import { DatasetHealthRadial } from '../components/quality/DatasetHealthRadial';
import { QualityDimensions } from '../components/quality/QualityDimensions';
import { IssuesDetectedAccordion } from '../components/quality/IssuesDetectedAccordion';
import { AnomalyDistribution } from '../components/quality/AnomalyDistribution';
import { ActiveOperationRecipe } from '../components/clean/ActiveOperationRecipe';
import { BeforeAfterDiffCard } from '../components/clean/BeforeAfterDiffCard';
import { CleaningActionBar } from '../components/clean/CleaningActionBar';
import { CleaningAuditLog } from '../components/clean/CleaningAuditLog';
import { DataPreviewGrid } from '../components/explore/DataPreviewGrid';
import { VisualizationsView } from '../components/visualize/VisualizationsView';
import { ExecutiveDashboardView } from '../components/dashboard/ExecutiveDashboardView';
import { ExportPanel } from '../components/export/ExportPanel';

interface WorkspacePageProps {
  datasetId: string;
  initialTab?: string;
  onOpenUpload: () => void;
  onExportTrigger: () => void;
}

export const WorkspacePage: React.FC<WorkspacePageProps> = ({
  datasetId,
  initialTab = 'overview',
  onOpenUpload,
}) => {
  const [currentTab, setCurrentTab] = useState<string>(initialTab);
  // The prop is the immutable source dataset. After an approved cleaning run,
  // the workspace switches to the newly-created cleaned copy so rename/remove/
  // parse-date changes are immediately visible everywhere without overwriting
  // the original dataset.
  const [activeDatasetId, setActiveDatasetId] = useState<string>(datasetId);
  const [profile, setProfile] = useState<DatasetProfile | null>(null);
  const [quality, setQuality] = useState<DatasetQuality | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Cleaning options and diff preview state
  const [cleaningOptions, setCleaningOptions] = useState<CleaningOptions>({
    remove_duplicates: false,
    missing_numeric_method: 'drop',
    missing_numeric_columns: [],
    missing_categorical_method: 'unknown',
    missing_categorical_custom_value: 'Unknown',
    missing_categorical_columns: [],
    trim_whitespace: false,
    title_case: false,
    uppercase: false,
    lowercase: false,
    remove_empty_rows: false,
    remove_empty_columns: false,
    drop_missing_rows: false,
    date_columns_to_iso: [],
    convert_type_columns: [],
    convert_type_target: 'numeric',
    rename_mapping: {},
    remove_columns: [],
    _enabled_operations: [],
  });

  const [cleaningPreview, setCleaningPreview] = useState<CleaningPlanPreview | null>(null);
  const [isApplyingCleaning, setIsApplyingCleaning] = useState(false);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [currentVersion, setCurrentVersion] = useState('v1.0');
  const [cleanedDatasetId, setCleanedDatasetId] = useState<string | undefined>(undefined);
  const [recalculatingQuality, setRecalculatingQuality] = useState(false);
  const [cleaningSuccess, setCleaningSuccess] = useState<string | null>(null);
  const [cleaningActionError, setCleaningActionError] = useState<string | null>(null);

  // Initial load may show the loading screen. Refreshes must not blank the
  // workspace while a cleaning operation is being committed.
  const refreshData = async (id: string = activeDatasetId) => {
    const [profData, qualData] = await Promise.all([
      getDatasetProfile(id),
      getDatasetQuality(id),
    ]);
    setProfile(profData);
    setQuality(qualData);
  };

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      setActiveDatasetId(datasetId);
      await refreshData(datasetId);
    } catch (err: any) {
      setError(err.message || 'Failed to load dataset details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setCurrentTab(initialTab);
  }, [initialTab]);

  useEffect(() => {
    loadData();
  }, [datasetId]);

  // Recalculate cleaning plan preview whenever cleaning options change

  // Handle auto-configure fix triggered from quality issue cards
  const handleAutoConfigureFix = (issue: QualityIssue) => {
    if (issue.type === 'duplicates') {
      setCleaningOptions((prev) => ({ ...prev, remove_duplicates: true, _enabled_operations: [...new Set([...(prev._enabled_operations || []), 'remove_duplicates'])] }));
    } else if (issue.type === 'missing') {
      const numeric = issue.affected_columns.filter((column) => profile?.numerical_columns.includes(column));
      const categorical = issue.affected_columns.filter((column) => profile?.categorical_columns.includes(column));
      setCleaningOptions((prev) => ({
        ...prev,
        missing_numeric_method: 'median',
        missing_numeric_columns: numeric.length ? numeric : prev.missing_numeric_columns,
        missing_categorical_method: 'unknown',
        missing_categorical_custom_value: 'Unknown',
        missing_categorical_columns: categorical.length ? categorical : prev.missing_categorical_columns,
        _enabled_operations: [...new Set([...(prev._enabled_operations || []), ...(numeric.length ? ['fill_missing_numeric'] : []), ...(categorical.length ? ['fill_missing_categorical'] : [])])],
      }));
    } else if (issue.type === 'whitespace_casing') {
      setCleaningOptions((prev) => ({
        ...prev,
        trim_whitespace: true,
        title_case: true,
        uppercase: false,
        lowercase: false,
      }));
    } else if (issue.type === 'invalid_dates') {
      const dateColumns = issue.affected_columns;
      setCleaningOptions((prev) => ({
        ...prev,
        date_columns_to_iso: dateColumns.length ? dateColumns : prev.date_columns_to_iso,
        _enabled_operations: [...new Set([...(prev._enabled_operations || []), 'parse_dates'])],
      }));
    }
    setCurrentTab('clean');
  };

  const hasCleaningOperations = optionsToOperations(cleaningOptions).length > 0;

  const handlePreviewCleaning = async () => {
    setError(null);
    if (!hasCleaningOperations) {
      setError('Select at least one cleaning operation and target before previewing.');
      return;
    }
    setIsApplyingCleaning(true);
    try {
      const prev = await previewCleaningPlan(activeDatasetId, cleaningOptions);
      setCleaningPreview(prev);
    } catch (err: any) {
      setError(err.message || 'Failed to preview cleaning changes.');
    } finally {
      setIsApplyingCleaning(false);
    }
  };

  const handleApplyCleaning = async () => {
    setError(null);
    setCleaningActionError(null);

    // Freeze the exact operation payload at click time. This avoids a React
    // state update racing with the network request and makes Apply completely
    // independent from Preview.
    const operations = optionsToOperations(cleaningOptions);
    if (!operations.length) {
      setCleaningActionError('Select at least one cleaning operation and target before applying changes.');
      setError('Select at least one cleaning operation and target before applying changes.');
      return;
    }

    setIsApplyingCleaning(true);
    try {
      const sourceDatasetId = activeDatasetId;
      const res = await applyCleaning(sourceDatasetId, cleaningOptions);
      setCurrentVersion(res.new_version || 'v2.0');
      if (res.audit_log) setAuditLogs(res.audit_log);

      // The commit itself is the important operation. Refreshing the UI is a
      // separate step and must never make a successful Apply look like a
      // failed cleaning operation.
      let refreshMessage = '';
      if (res.cleaned_id) {
        setCleanedDatasetId(res.cleaned_id);
        setActiveDatasetId(res.cleaned_id);
        try {
          const [nextProfile, nextQuality] = await Promise.all([
            getDatasetProfile(res.cleaned_id),
            getDatasetQuality(res.cleaned_id),
          ]);
          setProfile(nextProfile);
          setQuality(nextQuality);
        } catch (refreshErr: any) {
          refreshMessage = ` The cleaned copy was created (${res.cleaned_id}), but the workspace refresh failed: ${refreshErr?.message || 'please reload the dataset view.'}`;
        }
      }
      setCleaningPreview({
        dataset_id: sourceDatasetId,
        original: res.before,
        transformed: res.after,
        net_difference: {
          duplicate_rows_removed: Math.max(0, res.before.duplicate_rows - res.after.duplicate_rows),
          cells_imputed: Math.max(0, res.before.missing_cells - res.after.missing_cells),
          text_cleaned_cells: 0,
          summary: `Cleaning applied successfully. ${res.cleaned_id ? `Cleaned dataset ID: ${res.cleaned_id}` : 'A cleaned copy was created.'}`,
          validation_status: 'Applied successfully — original source dataset remains unchanged.',
        },
        operations_staged: operations.map((op: any) => ({
          operation: op.type,
          target: (op.columns || []).join(', ') || 'Dataset',
          method: op.method || op.mode || op.value || op.target || 'default',
        })),
      });
      setCleaningSuccess(`Cleaning applied successfully${res.cleaned_id ? ` — cleaned dataset ${res.cleaned_id}` : ''}.${refreshMessage}`);
      setCleaningOptions({
        remove_duplicates: false,
        missing_numeric_method: 'drop',
        missing_numeric_columns: [],
        missing_categorical_method: 'unknown',
        missing_categorical_custom_value: 'Unknown',
        missing_categorical_columns: [],
        trim_whitespace: false,
        title_case: false,
        uppercase: false,
        lowercase: false,
        remove_empty_rows: false,
        remove_empty_columns: false,
        drop_missing_rows: false,
        date_columns_to_iso: [],
        convert_type_columns: [],
        convert_type_target: 'numeric',
        rename_mapping: {},
        remove_columns: [],
        _enabled_operations: [],
      });
      setCurrentTab('clean');
    } catch (err: any) {
      const message = err?.message || 'Failed to execute cleaning pipeline.';
      setCleaningActionError(message);
      setError(message);
    } finally {
      setIsApplyingCleaning(false);
    }
  };

  const handleRecalculateQuality = async () => {
    setRecalculatingQuality(true);
    try {
      const updatedQuality = await getDatasetQuality(activeDatasetId);
      setQuality(updatedQuality);
    } finally {
      setTimeout(() => setRecalculatingQuality(false), 500);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-slate-400 gap-3">
        <span className="material-symbols-outlined text-4xl text-cyan-400 animate-spin">
          progress_activity
        </span>
        <span className="text-xs font-mono">Initializing forensic dataset telemetry...</span>
      </div>
    );
  }

  if (error && !profile) {
    return (
      <div className="max-w-xl mx-auto my-12 p-6 bg-[#141d2e] border border-rose-500/40 rounded-xl text-center space-y-4">
        <span className="material-symbols-outlined text-3xl text-rose-400">error</span>
        <h3 className="text-sm font-semibold text-slate-100">Dataset Loading Error</h3>
        <p className="text-xs text-slate-300">{error}</p>
        <div className="flex justify-center gap-3">
          <button
            onClick={loadData}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-xs"
          >
            Retry
          </button>
          <button
            onClick={onOpenUpload}
            className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold rounded text-xs"
          >
            Upload New Dataset
          </button>
        </div>
      </div>
    );
  }

  if (!profile || !quality) return null;

  return (
    <div className="w-full">
      {/* Contextual Sub-Nav Bar */}
      <SubNav currentTab={currentTab} onSelectTab={setCurrentTab} />

      <main className="max-w-5xl mx-auto p-4 space-y-4 pb-20">
        {error && (
          <div role="alert" className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-xs text-rose-200 flex items-start justify-between gap-3">
            <div><span className="font-semibold">Operation failed:</span> {error}</div>
            <button type="button" onClick={() => setError(null)} className="text-rose-300 hover:text-white">Dismiss</button>
          </div>
        )}
        {/* ===================== TAB: OVERVIEW ===================== */}
        {currentTab === 'overview' && (
          <div className="space-y-4">
            {/* Metadata Context Banner */}
            <MetadataBanner
              filename={profile.name}
              format={profile.name.toLowerCase().endsWith('.xlsx') ? 'XLSX' : 'CSV'}
              rowCount={profile.rows}
              columnCount={profile.columns}
              fileSize={profile.file_size}
              version={currentVersion}
            />

            {/* Schema Distribution Strip */}
            <SchemaDistribution
              numericCount={profile.numerical_columns.length}
              categoricalCount={profile.categorical_columns.length}
              dateCount={profile.date_columns.length}
              totalColumns={profile.columns}
            />

            {/* KPI Scorecards Grid */}
            <KPIScorecards
              totalRows={profile.rows}
              totalColumns={profile.columns}
              missingCells={profile.missing_cells}
              totalCells={profile.total_cells}
              duplicateRows={profile.duplicate_rows}
              numericCount={profile.numerical_columns.length}
              categoricalCount={profile.categorical_columns.length}
              dateCount={profile.date_columns.length}
            />

            {/* Column Overview Table */}
            <ColumnOverviewTable
              schema={profile.schema}
              onInspectColumn={() => setCurrentTab('explore')}
            />

            {/* Quick Hygiene Actions Footer Panel */}
            <QuickHygienePanel
              qualityScore={quality.overall_score}
              issueCount={quality.issues.length}
              recommendation={quality.action_recommended}
              onReviewQualityFlags={() => setCurrentTab('quality')}
              onAutoClean={() => setCurrentTab('clean')}
            />
          </div>
        )}

        {/* ===================== TAB: QUALITY ===================== */}
        {currentTab === 'quality' && (
          <div className="space-y-4">
            {/* Notice Banner */}
            <SandboxNotice version={currentVersion} />

            {/* Top Section: Health & Quality Dimensions */}
            <section className="grid grid-cols-1 md:grid-cols-12 gap-4">
              <div className="md:col-span-5">
                <DatasetHealthRadial
                  score={quality.overall_score}
                  totalColumns={profile.columns}
                  cleanliness={profile.cleanliness_percentage}
                  statusText={quality.status}
                  actionRecommendation={quality.action_recommended}
                />
              </div>
              <div className="md:col-span-7">
                <QualityDimensions
                  dimensions={quality.dimensions}
                  onRecalculate={handleRecalculateQuality}
                  isRecalculating={recalculatingQuality}
                />
              </div>
            </section>

            {/* Forensic Issues Detected Accordion */}
            <IssuesDetectedAccordion
              issues={quality.issues}
              onAutoConfigureFix={handleAutoConfigureFix}
              onInspectIssueRows={() => setCurrentTab('explore')}
            />

            {/* Active Operation Panel */}
            <ActiveOperationRecipe
              options={cleaningOptions}
              onChangeOptions={(next) => { setCleaningOptions(next); setCleaningSuccess(null); setCleaningActionError(null); setCleaningPreview(null); }}
              profile={profile}
            />

            {/* Anomaly & Outlier Distribution Grid */}
            <AnomalyDistribution
              anomalies={quality.anomalies}
              totalColumns={profile.columns}
            />

            {/* Impact Preview Staged Run */}
            {cleaningPreview && <BeforeAfterDiffCard preview={cleaningPreview} />}

            {/* Action Bar & Commit Controls */}
            <CleaningActionBar
              onCancel={() => setCurrentTab('overview')}
              onPreview={handlePreviewCleaning}
              onApply={handleApplyCleaning}
              isApplying={isApplyingCleaning}
              canApply={hasCleaningOperations}
              error={cleaningActionError}
            />

            {/* Recent Cleaning Audit Log */}
            <CleaningAuditLog
              entries={auditLogs}
              onViewFullLedger={() => setCurrentTab('clean')}
            />
          </div>
        )}

        {/* ===================== TAB: CLEAN ===================== */}
        {currentTab === 'clean' && (
          <div className="space-y-4">
            <SandboxNotice version={currentVersion} />

            {/* Active Recipe Configuration */}
            <ActiveOperationRecipe
              options={cleaningOptions}
              onChangeOptions={(next) => { setCleaningOptions(next); setCleaningSuccess(null); setCleaningActionError(null); setCleaningPreview(null); }}
              profile={profile}
            />

            {/* Before / After Synchronized Diff Engine */}
            {cleaningPreview && <BeforeAfterDiffCard preview={cleaningPreview} />}

            {cleaningSuccess && (
              <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-xs text-emerald-300">
                {cleaningSuccess}
              </div>
            )}

            {/* Commit Action Bar */}
            <CleaningActionBar
              onCancel={() => setCurrentTab('overview')}
              onPreview={handlePreviewCleaning}
              onApply={handleApplyCleaning}
              isApplying={isApplyingCleaning}
              canApply={hasCleaningOperations}
              error={cleaningActionError}
            />

            {/* Cleaning Audit Ledger */}
            <CleaningAuditLog entries={auditLogs} />
          </div>
        )}

        {/* ===================== TAB: EXPLORE ===================== */}
        {currentTab === 'explore' && <DataPreviewGrid datasetId={activeDatasetId} />}

        {/* ===================== TAB: VISUALIZE ===================== */}
        {currentTab === 'visualize' && <VisualizationsView datasetId={activeDatasetId} />}

        {/* ===================== TAB: DASHBOARD ===================== */}
        {currentTab === 'dashboard' && <ExecutiveDashboardView datasetId={activeDatasetId} />}

        {/* ===================== TAB: EXPORT ===================== */}
        {currentTab === 'export' && (
          <ExportPanel datasetId={activeDatasetId} cleanedId={cleanedDatasetId} profile={profile} quality={quality} />
        )}
      </main>
    </div>
  );
};
