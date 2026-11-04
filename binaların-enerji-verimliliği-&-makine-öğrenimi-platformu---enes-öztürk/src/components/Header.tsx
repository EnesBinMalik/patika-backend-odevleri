import React from 'react';
import { Leaf, Code, Sparkles, Building2, BarChart3 } from 'lucide-react';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenCodeModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab, onOpenCodeModal }) => {
  const navItems = [
    { id: 'overview', label: 'Genel Bakış & Veri' },
    { id: 'pipeline', label: 'Ön İşleme & Aykırı Değer' },
    { id: 'metrics', label: 'Hata Metrikleri' },
    { id: 'models', label: 'Model Arenası & Şampiyon' },
    { id: 'simulator', label: 'Bina Simülatörü & Danışmanlık' }
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Single text element wordmark */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="w-9 h-9 rounded-lg bg-emerald-600 text-white flex items-center justify-center shadow-xs">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-base font-bold tracking-tight text-slate-900 whitespace-nowrap">
              Enerji Verimliliği ML Studio
            </span>
            <div className="text-[11px] text-slate-500 font-medium">
              Enes Öztürk İmzalı Proje
            </div>
          </div>
        </div>

        {/* Zone 2: Clean single-line nav links */}
        <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                activeTab === item.id
                  ? 'bg-emerald-50 text-emerald-800 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>

        {/* Zone 3: 1 primary action */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onOpenCodeModal}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Code className="w-3.5 h-3.5 text-slate-600" />
            <span>Python / Notebook Kodu</span>
          </button>
          <button
            onClick={() => setActiveTab('simulator')}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg shadow-xs transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Leaf className="w-3.5 h-3.5" />
            <span>Yeşil Danışmanlık</span>
          </button>
        </div>
      </div>
    </header>
  );
};
