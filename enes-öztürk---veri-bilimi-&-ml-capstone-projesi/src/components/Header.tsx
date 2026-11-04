/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Database, GitBranch, Play, Sliders, LineChart, Code2, Sparkles, CheckCircle2 } from 'lucide-react';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenGitHubModal: () => void;
  datasetName: string;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onOpenGitHubModal,
  datasetName,
}) => {
  const navItems = [
    { id: 'eda', label: '1. Veri Keşfi (EDA)', icon: Database },
    { id: 'preprocess', label: '2. Önişleme & Outlier', icon: Sliders },
    { id: 'metrics', label: '3. Metrik & Split', icon: LineChart },
    { id: 'models', label: '4. Model Yarışı (10 Model)', icon: Play },
    { id: 'simulator', label: '5. Canlı Tahmin Laboratuvarı', icon: Sparkles },
  ];

  return (
    <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-8 h-16">
          {/* Zone 1: Single element brand wordmark signed by Enes Öztürk */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-9 h-9 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-bold">
              EÖ
            </div>
            <div className="flex flex-col">
              <span className="text-base font-bold tracking-tight text-white whitespace-nowrap">
                Enes Öztürk
              </span>
              <span className="text-xs text-slate-400 whitespace-nowrap hidden sm:inline">
                Veri Bilimi & ML Capstone Projesi
              </span>
            </div>
          </div>

          {/* Zone 2: Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                    isActive
                      ? 'bg-slate-800 text-indigo-400 border border-slate-700 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Zone 3: 1 Primary Action (GitHub Repo & Code Explorer) */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={onOpenGitHubModal}
              className="flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold text-slate-100 bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors whitespace-nowrap shrink-0 shadow-sm shadow-indigo-600/20 cursor-pointer"
            >
              <GitBranch className="w-4 h-4" />
              <span>GitHub Reposu & Kodlar</span>
            </button>
          </div>
        </div>

        {/* Mobile secondary tab strip */}
        <div className="lg:hidden flex items-center gap-1 pb-3 overflow-x-auto no-scrollbar border-t border-slate-900 pt-2">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md whitespace-nowrap shrink-0 ${
                  isActive
                    ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icon className="w-3 h-3" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
