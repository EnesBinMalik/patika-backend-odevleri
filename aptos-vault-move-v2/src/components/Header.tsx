import React from 'react';
import { Shield, Sparkles, FileText, Download } from 'lucide-react';

interface HeaderProps {
  activeView: 'diff' | 'simulator' | 'code' | 'deployment' | 'report';
  setActiveView: (view: 'diff' | 'simulator' | 'code' | 'deployment' | 'report') => void;
  onQuickAction: () => void;
}

export const Header: React.FC<HeaderProps> = ({ activeView, setActiveView, onQuickAction }) => {
  return (
    <header className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-8 h-16">
          {/* Zone 1: Single text element wordmark */}
          <button
            onClick={() => setActiveView('diff')}
            className="text-base sm:text-lg font-bold tracking-tight text-slate-100 whitespace-nowrap shrink-0 hover:text-cyan-400 transition-colors flex items-center gap-2"
          >
            <span className="w-2 h-2 rounded-full bg-cyan-400" />
            <span>Aptos Vault Move v2</span>
          </button>

          {/* Zone 2: 4–5 clean single-line navigation links/tabs */}
          <nav className="hidden md:flex items-center gap-1 sm:gap-2 text-xs font-medium">
            <button
              onClick={() => setActiveView('diff')}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap shrink-0 transition-colors ${
                activeView === 'diff'
                  ? 'bg-slate-800 text-cyan-300 font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Mimari Dönüşüm
            </button>

            <button
              onClick={() => setActiveView('simulator')}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap shrink-0 transition-colors ${
                activeView === 'simulator'
                  ? 'bg-slate-800 text-cyan-300 font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              İnteraktif Simülatör
            </button>

            <button
              onClick={() => setActiveView('code')}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap shrink-0 transition-colors ${
                activeView === 'code'
                  ? 'bg-slate-800 text-cyan-300 font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Sözleşme Kodları
            </button>

            <button
              onClick={() => setActiveView('deployment')}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap shrink-0 transition-colors ${
                activeView === 'deployment'
                  ? 'bg-slate-800 text-cyan-300 font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Dağıtım & Testnet
            </button>

            <button
              onClick={() => setActiveView('report')}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap shrink-0 transition-colors ${
                activeView === 'report'
                  ? 'bg-slate-800 text-cyan-300 font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Teslim Raporu (İmzalı)
            </button>
          </nav>

          {/* Zone 3: 1 primary action */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={onQuickAction}
              className="px-3.5 py-2 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-lg transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 shadow-sm"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>İmzalı Raporu Gör</span>
            </button>
          </div>
        </div>

        {/* Mobile secondary tab strip */}
        <div className="flex md:hidden overflow-x-auto py-2 border-t border-slate-800/80 gap-1 text-xs font-medium">
          <button
            onClick={() => setActiveView('diff')}
            className={`px-2.5 py-1 rounded whitespace-nowrap shrink-0 ${
              activeView === 'diff' ? 'bg-slate-800 text-cyan-300' : 'text-slate-400'
            }`}
          >
            Mimari
          </button>
          <button
            onClick={() => setActiveView('simulator')}
            className={`px-2.5 py-1 rounded whitespace-nowrap shrink-0 ${
              activeView === 'simulator' ? 'bg-slate-800 text-cyan-300' : 'text-slate-400'
            }`}
          >
            Simülatör
          </button>
          <button
            onClick={() => setActiveView('code')}
            className={`px-2.5 py-1 rounded whitespace-nowrap shrink-0 ${
              activeView === 'code' ? 'bg-slate-800 text-cyan-300' : 'text-slate-400'
            }`}
          >
            Kodlar
          </button>
          <button
            onClick={() => setActiveView('deployment')}
            className={`px-2.5 py-1 rounded whitespace-nowrap shrink-0 ${
              activeView === 'deployment' ? 'bg-slate-800 text-cyan-300' : 'text-slate-400'
            }`}
          >
            Dağıtım
          </button>
          <button
            onClick={() => setActiveView('report')}
            className={`px-2.5 py-1 rounded whitespace-nowrap shrink-0 ${
              activeView === 'report' ? 'bg-slate-800 text-cyan-300' : 'text-slate-400'
            }`}
          >
            Rapor
          </button>
        </div>
      </div>
    </header>
  );
};
