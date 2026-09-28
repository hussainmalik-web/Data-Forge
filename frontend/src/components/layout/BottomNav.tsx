import React from 'react';

interface BottomNavProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentTab, onSelectTab }) => {
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
    <nav className="fixed bottom-0 left-0 w-full z-50 flex overflow-x-auto items-center px-2 py-1 h-14 bg-[#0f172a]/95 backdrop-blur-md border-t border-slate-800 shadow-2xl md:hidden">
      {tabs.map((tab) => {
        const isActive = currentTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onSelectTab(tab.id)}
            className={`flex flex-col items-center justify-center py-1 min-w-[76px] transition-all active:scale-95 ${
              isActive
                ? 'text-cyan-400 font-semibold drop-shadow-[0_0_8px_rgba(56,189,248,0.4)]'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span
              className={`material-symbols-outlined text-[20px] ${
                isActive ? 'text-cyan-400' : 'text-slate-400'
              }`}
            >
              {tab.icon}
            </span>
            <span className="text-[10px] mt-0.5">{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
};
