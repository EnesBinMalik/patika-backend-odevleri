import React from 'react';
import { ArrowRight, BarChart2, ShieldCheck, Sparkles, Sun, Wind, Layers } from 'lucide-react';

interface HeroBannerProps {
  onStartSimulation: () => void;
  onExploreModels: () => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({ onStartSimulation, onExploreModels }) => {
  return (
    <section className="bg-white border-b border-slate-200 py-10 md:py-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Column: Text & Problem Context */}
          <div className="lg:col-span-7 space-y-6">
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800">
              <span className="uppercase tracking-wider">UCI & Kaggle Makine Öğrenimi Araştırması</span>
              <span aria-hidden="true" className="text-slate-400">·</span>
              <span>Enes Öztürk İmzalı</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 text-balance leading-tight">
              Binaların Enerji Verimliliği ve Isıl Yük Tahmini
            </h1>

            <p className="text-base text-slate-600 leading-relaxed max-w-2xl">
              Simüle edilmiş <strong>768 bina geometrisinin</strong> yüzey, duvar ve çatı alanı, cam dağılımı ve yönelim özelliklerini analiz ederek binanın <strong>Isıtma (Y1)</strong> ve <strong>Soğutma (Y2)</strong> yüklerini yapay zeka modelleriyle tahmin ediyoruz. Karbon ayak izini azaltmak ve sürdürülebilir yeşil bina standartlarına geçiş için veri odaklı danışmanlık stüdyosu.
            </p>

            {/* Metric proof counters */}
            <div className="grid grid-cols-3 gap-4 pt-2 pb-2 border-y border-slate-100">
              <div>
                <div className="text-2xl font-bold text-slate-900 font-mono tabular-nums">768</div>
                <div className="text-xs text-slate-500 font-medium">Bina Simülasyonu</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-emerald-700 font-mono tabular-nums">9 Model</div>
                <div className="text-xs text-slate-500 font-medium">Karşılaştırmalı Regresyon</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-indigo-700 font-mono tabular-nums">R² 0.99</div>
                <div className="text-xs text-slate-500 font-medium">Şampiyon Model Doğruluğu</div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <button
                onClick={onStartSimulation}
                className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg shadow-sm transition-colors cursor-pointer"
              >
                <span>3D Simülatör & Yeşil Rapor</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={onExploreModels}
                className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
              >
                <BarChart2 className="w-4 h-4 text-slate-600" />
                <span>Model Arenasını İncele</span>
              </button>
            </div>
          </div>

          {/* Right Column: Visual Architecture Rendering */}
          <div className="lg:col-span-5">
            <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-900 shadow-md group">
              <img
                src="/src/assets/images/building_energy_efficiency_1793779317070.jpg"
                alt="Bina Enerji Verimliliği ve Isıl Işınım Simülasyonu"
                className="w-full h-80 object-cover transform group-hover:scale-102 transition-transform duration-500"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  // Fallback container in case image fails
                  const target = e.currentTarget;
                  target.style.display = 'none';
                  const fallback = target.nextElementSibling as HTMLElement;
                  if (fallback) fallback.style.display = 'flex';
                }}
              />
              <div
                style={{ display: 'none' }}
                className="w-full h-80 bg-linear-to-br from-emerald-900 via-slate-900 to-indigo-950 flex-col items-center justify-center p-6 text-center text-white"
              >
                <Layers className="w-12 h-12 text-emerald-400 mb-3" />
                <h4 className="text-lg font-bold">Bina Enerji Verimliliği Simülasyonu</h4>
                <p className="text-xs text-slate-300 mt-1 max-w-sm">
                  Isı transferi, yönelim ve pasif solar kazanç parametreleri.
                </p>
              </div>

              {/* Scrim overlay with quick facts */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/30 to-transparent flex flex-col justify-end p-5">
                <div className="flex items-center gap-2 text-xs font-semibold text-emerald-300">
                  <Sun className="w-3.5 h-3.5" />
                  <span>Termal Işınım & Pasif Güneş Mimarisi</span>
                </div>
                <p className="text-xs text-slate-200 mt-1 font-medium">
                  U-değeri optimizasyonu, çapraz havalandırma ve yeşil çatı yalıtım analizi.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
