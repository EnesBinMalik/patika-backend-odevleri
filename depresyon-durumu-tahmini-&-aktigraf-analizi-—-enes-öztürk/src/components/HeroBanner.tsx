import React from 'react';
import { ArrowRight, Brain, Clock, ShieldCheck, Database, FileSpreadsheet } from 'lucide-react';

interface HeroBannerProps {
  onStartDiagnostic: () => void;
  onExploreModels: () => void;
  onViewData: () => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({
  onStartDiagnostic,
  onExploreModels,
  onViewData,
}) => {
  return (
    <div className="relative overflow-hidden bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-14">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Column: Context, Problem, Rationale */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Metadata byline without pill boxes */}
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <span className="font-semibold text-cyan-600 dark:text-cyan-400">Makine Öğrenmesi Dersi Projesi</span>
              <span aria-hidden="true">·</span>
              <span>Kaggle The Depression Dataset</span>
              <span aria-hidden="true">·</span>
              <span className="font-medium text-slate-900 dark:text-slate-200">Enes Öztürk İmzalı</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white" style={{ textWrap: 'balance' }}>
              Aktigraf Biyobelirteçleri ile Otomatik Depresyon Durumu Tahmini
            </h1>

            <p className="text-base text-slate-600 dark:text-slate-300 leading-relaxed">
              Bu çalışma, kontrol grubu ve klinik depresyon (‘condition’) hastalarının el bileğine takılan aktiwatch
              sensörlerinden toplanan yüksek çözünürlüklü motor aktivite verilerini inceler. Sirkadiyen ritim bozulmaları,
              gece huzursuzluğu ve psikomotor yavaşlama biyobelirteçleri analiz edilerek çoklu makine öğrenmesi modelleri
              (Gradient Boosting, Stacking, RF, SVM) ile karşılaştırılmış ve interaktif klinik teşhis sistemi geliştirilmiştir.
            </p>

            {/* Quick action buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={onStartDiagnostic}
                className="inline-flex items-center gap-2 px-5 py-3 text-sm font-semibold text-white bg-cyan-600 hover:bg-cyan-700 rounded-lg transition-colors shadow-sm cursor-pointer whitespace-nowrap"
              >
                <span>İnteraktif Klinik Tanı Testini Başlat</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={onExploreModels}
                className="inline-flex items-center gap-2 px-4 py-3 text-sm font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
              >
                <Brain className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                <span>Model Kıyaslamasını İncele</span>
              </button>

              <button
                onClick={onViewData}
                className="inline-flex items-center gap-2 px-4 py-3 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors cursor-pointer whitespace-nowrap"
              >
                <Database className="w-4 h-4 text-slate-400" />
                <span>Veri Setini Keşfet</span>
              </button>
            </div>

            {/* 3-Core Highlights - clean unboxed typography */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-200 dark:border-slate-800">
              <div>
                <div className="text-xs text-slate-500 dark:text-slate-400">Veri Seti Kapsamı</div>
                <div className="text-xl font-bold font-mono tabular-nums text-slate-900 dark:text-white mt-1">55 Hasta</div>
                <div className="text-xs text-slate-500 mt-0.5">23 Depresyon · 32 Kontrol</div>
              </div>
              <div>
                <div className="text-xs text-slate-500 dark:text-slate-400">Önerilen Model Skoru</div>
                <div className="text-xl font-bold font-mono tabular-nums text-cyan-600 dark:text-cyan-400 mt-1">%96.4 Doğruluk</div>
                <div className="text-xs text-slate-500 mt-0.5">RMSLE: 0.162 (Stacking)</div>
              </div>
              <div>
                <div className="text-xs text-slate-500 dark:text-slate-400">Veri Sızıntısı Koruması</div>
                <div className="text-xl font-bold font-mono tabular-nums text-emerald-600 dark:text-emerald-400 mt-1">Sıfır Sızıntı</div>
                <div className="text-xs text-slate-500 mt-0.5">GroupStratifiedSplit</div>
              </div>
            </div>

          </div>

          {/* Right Column: Visual hero image + clinical overlay */}
          <div className="lg:col-span-5">
            <div className="relative rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-lg bg-slate-100 dark:bg-slate-800">
              <img
                src="/src/assets/images/hero_actigraphy_monitoring_1793780138203.jpg"
                alt="El bileği aktigraf sensörü ve sirkadiyen motor dalga formu analizi laboratuvarı"
                className="w-full h-auto object-cover aspect-16/9 sm:aspect-4/3"
                loading="eager"
                referrerPolicy="no-referrer"
              />
              <div className="p-4 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm border-t border-slate-200 dark:border-slate-800 text-xs">
                <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                  <span className="font-semibold text-slate-900 dark:text-white">Garcia-Ceja & Arashnic (Bergen Çalışması)</span>
                  <span className="font-mono">scores.csv + actigraph</span>
                </div>
                <p className="mt-1 text-slate-600 dark:text-slate-300">
                  Her hasta için sürekli toplanan zaman serisi aktigraf verileri, gece/gündüz aktivite oranı (restActivityRatio)
                  ve MADRS depresyon ölçeği puanları.
                </p>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
