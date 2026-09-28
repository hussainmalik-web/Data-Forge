import React from 'react';

interface SubNavProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
}

export const SubNav: React.FC<SubNavProps> = ({ currentTab, onSelectTab }) => {
  const tabs = [
    { id: 'overview', label: 'Overview', icon: 'dashboard' },
    { id: 'quality', label: 'Quality', icon: 'verified' },
    { id: 'clean', label: 'Clean', icon: 'auto_fix_high' },
    { id: 'explore', label: 'Explore', icon: 'table_chart' },
    { id: 'visualize', label: 'Visualize', icon: 'bar_chart' },
    { id: 'dashboard', label: 'Dashboard', icon: 'insights' },
    { id: 'export', label: 'Export', icon: 'output' },
  ];

  return (
    <nav className="sticky top-14 z-30 bg-[#0b0f17]/95 backdrop-blur-md border-b border-slate-800/80 px-4 overflow-x-auto flex gap-4 whitespace-nowrap scrollbar-none">
      {tabs.map((tab) => {
        const isActive = currentTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onSelectTab(tab.id)}
            className={`py-2.5 text-xs font-medium whitespace-nowrap flex items-center gap-1.5 transition-colors ${
              isActive
                ? 'text-cyan-400 font-semibold border-b-2 border-cyan-400 shadow-[0_2px_10px_rgba(56,189,248,0.15)]'
                : 'text-slate-400 hover:text-slate-200 border-b-2 border-transparent'
            }`}
          >
            <span
              className={`material-symbols-outlined text-[16px] ${
                isActive ? 'text-cyan-400' : 'text-slate-500'
              }`}
            >
              {tab.icon}
            </span>
            <span>{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
};
