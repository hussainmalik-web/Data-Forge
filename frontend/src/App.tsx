/**
 * Data Forge - Core Application Entry Point
 * Tagline: From raw data to meaningful insights.
 */

import React, { useEffect, useState } from 'react';
import { TopAppBar } from './components/layout/TopAppBar';
import { BottomNav } from './components/layout/BottomNav';
import { Footer } from './components/layout/Footer';
import { LandingPage } from './pages/LandingPage';
import { UploadView } from './components/upload/UploadView';
import { WorkspacePage } from './pages/WorkspacePage';
import {
  loadSampleDataset,
  wakeBackend,
} from './services/api';

export default function App() {
  // Wake the Render backend when Data Forge opens.
  // This helps reduce the cold-start delay before
  // the user performs an upload or other operation.
  useEffect(() => {
    void wakeBackend();
  }, []);

  const [currentView, setCurrentView] = useState<
    'landing' | 'upload' | 'workspace'
  >('landing');

  const [currentTab, setCurrentTab] =
    useState<string>('overview');

  const [datasetId, setDatasetId] =
    useState<string>('');

  const [datasetName, setDatasetName] =
    useState<string>('');

  const [rowCount, setRowCount] =
    useState<number>(0);

  const [pendingTab, setPendingTab] =
    useState<string>('overview');

  const handleDatasetLoaded = (
    newId: string,
    name: string
  ) => {
    setDatasetId(newId);
    setDatasetName(name);
    setCurrentView('workspace');
    setRowCount(0);
    setCurrentTab(pendingTab);
    setPendingTab('overview');
  };

  const handleStartUpload = () => {
    setCurrentView('upload');
  };

  const handleTrySample = async () => {
    try {
      const sample = await loadSampleDataset();

      setDatasetId(sample.dataset_id);
      setDatasetName(sample.name);
      setRowCount(sample.rows);
      setCurrentView('workspace');
      setCurrentTab('overview');
    } catch (error) {
      setCurrentView('upload');
    }
  };

  const handleNavigateTab = (tab: string) => {
    if (!datasetId) {
      setPendingTab(tab);
      setCurrentView('upload');
      return;
    }

    setCurrentTab(tab);
    setCurrentView('workspace');
  };

  const handleExport = () => {
    setCurrentView('workspace');
    setCurrentTab('export');
  };

  return (
    <div className="min-h-screen bg-[#0b0f17] text-slate-100 flex flex-col font-sans selection:bg-cyan-500/20 selection:text-cyan-300">

      {/* Top Application Bar */}
      <TopAppBar
        datasetName={
          currentView === 'workspace'
            ? datasetName
            : undefined
        }
        rowCount={
          currentView === 'workspace'
            ? rowCount
            : undefined
        }
        currentTab={
          currentView === 'workspace'
            ? currentTab
            : ''
        }
        onNavigateTab={handleNavigateTab}
        onOpenUpload={handleStartUpload}
        onExport={handleExport}
        onGoHome={() =>
          setCurrentView('landing')
        }
      />

      {/* Main Body Routing */}
      <div className="flex-1 flex flex-col">

        {currentView === 'landing' && (
          <LandingPage
            onStartUpload={handleStartUpload}
            onTrySample={handleTrySample}
            onNavigateSection={(section) => {
              if (section === 'upload') {
                setCurrentView('upload');
              } else if (section === 'profile') {
                handleNavigateTab('overview');
              } else if (
                section === 'check-quality'
              ) {
                handleNavigateTab('quality');
              } else if (
                section === 'analyze' ||
                section === 'insights'
              ) {
                handleNavigateTab('dashboard');
              } else {
                handleNavigateTab(section);
              }
            }}
          />
        )}

        {currentView === 'upload' && (
          <div className="p-4 flex-1 flex flex-col justify-center">
            <UploadView
              onDatasetLoaded={
                handleDatasetLoaded
              }
              onCancel={() =>
                setCurrentView('landing')
              }
            />
          </div>
        )}

        {currentView === 'workspace' && (
          <WorkspacePage
            key={datasetId}
            datasetId={datasetId}
            initialTab={currentTab}
            onOpenUpload={handleStartUpload}
            onExportTrigger={handleExport}
          />
        )}

      </div>

      {/* Persistent Footer */}
      <Footer />

      {/* Bottom Mobile Navigation */}
      {currentView === 'workspace' && (
        <BottomNav
          currentTab={currentTab}
          onSelectTab={setCurrentTab}
        />
      )}

    </div>
  );
}