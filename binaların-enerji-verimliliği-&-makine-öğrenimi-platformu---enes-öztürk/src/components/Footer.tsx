import React from 'react';
import { Building2, Github, ExternalLink, Leaf } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-slate-200 mt-16 py-10 text-xs text-slate-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold">
              <Leaf className="w-4 h-4" />
            </div>
            <div>
              <div className="font-bold text-slate-900 text-sm">
                Binaların Enerji Verimliliği & Yeşil Danışmanlık Platformu
              </div>
              <div className="text-slate-500 mt-0.5">
                Proje Yürütücüsü & Makine Öğrenimi Mimarisi: <strong className="text-slate-700">Enes Öztürk</strong>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-slate-600">
            <a
              href="https://www.kaggle.com/elikplim/eergy-efficiency-dataset"
              target="_blank"
              rel="noreferrer"
              className="hover:text-emerald-700 transition-colors flex items-center gap-1"
            >
              <span>Kaggle Veri Seti (UCI Tsanas & Xifara)</span>
              <ExternalLink className="w-3 h-3 text-slate-400" />
            </a>
            <span className="text-slate-300">·</span>
            <span>768 Bina Simülasyonu</span>
            <span className="text-slate-300">·</span>
            <span>9 Regresyon Modeli</span>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-400">
          <div>
            © 2026 Enes Öztürk. Ekolojik ve Çevresel Sorunlar İçin Veri Odaklı Çözümler.
          </div>
          <div className="font-mono">
            RMSE & RMSLE Optimizasyonlu Enerji Mühendisliği Modeli
          </div>
        </div>
      </div>
    </footer>
  );
};
