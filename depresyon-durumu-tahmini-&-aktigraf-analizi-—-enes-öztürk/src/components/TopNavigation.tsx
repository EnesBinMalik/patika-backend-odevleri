import React from 'react';
import { Activity, Github, Sun, Moon } from 'lucide-react';

interface TopNavigationProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenReport: () => void;
  isDark: boolean;
  setIsDark: (dark: boolean) => void;
}

export const TopNavigation: React.FC<TopNavigationProps> = ({
  activeTab,
  setActiveTab,
  onOpenReport,
  isDark,
  setIsDark,
}) => {
  const navItems = [
    { id: 'overview', label: 'Genel Bakış' },
    { id: 'eda', label: 'Veri & Outlier Analizi' },
    { id: 'actigraph', label: 'Aktigraf Dalgaları' },
    { id: 'validation', label: 'Train-Val-Test Bölümleme' },
    { id: 'models', label: 'Model Kıyaslaması & Metrikler' },
    { id: 'diagnostic', label: 'İnteraktif Klinik Tanı Testi' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-8 h-16">
          
          {/* Zone 1: Single text element wordmark */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-9 h-9 rounded-lg bg-cyan-600 text-white flex items-center justify-center font-bold">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <button
              onClick={() => setActiveTab('overview')}
              className="text-left group cursor-pointer focus:outline-none"
            >
              <div className="text-base font-bold tracking-tight text-slate-900 dark:text-white whitespace-nowrap">
                DepresyonML
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">
                Enes Öztürk
              </div>
            </button>
          </div>

          {/* Zone 2: Clean single-line text navigation links */}
          <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-slate-600 dark:text-slate-300">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`relative py-1 text-xs sm:text-sm font-medium transition-colors whitespace-nowrap cursor-pointer ${
                    isActive
                      ? 'text-cyan-600 dark:text-cyan-400 font-semibold'
                      : 'hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {item.label}
                  {isActive && (
                    <span className="absolute bottom-[-1.15rem] left-0 right-0 h-0.5 bg-cyan-600 dark:bg-cyan-400" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Zone 3: 1 primary action + Theme toggle */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setIsDark(!isDark)}
              aria-label="Tema Değiştir"
              className="p-2 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            <button
              onClick={onOpenReport}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-slate-900 dark:bg-slate-100 dark:text-slate-900 rounded-lg hover:bg-slate-800 dark:hover:bg-white transition-colors whitespace-nowrap cursor-pointer shadow-sm"
            >
              <Github className="w-4 h-4" />
              <span>Proje Raporu & GitHub</span>
            </button>
          </div>

        </div>

        {/* Mobile Navigation Row */}
        <div className="flex lg:hidden overflow-x-auto py-2.5 gap-2 border-t border-slate-100 dark:border-slate-800 scrollbar-none">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-cyan-50 dark:bg-cyan-950/60 text-cyan-700 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>

      </div>
    </header>
  );
};
