import React from 'react';
import { Github, ExternalLink, Heart, Shield, BookOpen } from 'lucide-react';

interface ProjectSignatureFooterProps {
  onOpenReport: () => void;
  onNavigateTab: (tab: string) => void;
}

export const ProjectSignatureFooter: React.FC<ProjectSignatureFooterProps> = ({
  onOpenReport,
  onNavigateTab,
}) => {
  return (
    <footer className="w-full bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 text-xs py-10 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          
          {/* Brand & Signature Column */}
          <div className="md:col-span-5 space-y-3">
            <div className="text-base font-bold text-slate-900 dark:text-white">
              Depresyon Durumu Tahmini & Aktigraf Analizi
            </div>
            <p className="text-xs leading-relaxed max-w-sm">
              Kaggle The Depression Dataset üzerinde makine öğrenmesi modelleriyle sirkadiyen ritim ve
              hareket biyobelirteçlerinin analizi. Aykırı değer yönetimi, veri sızıntısız bölümleme ve
              interaktif klinik tanı testi.
            </p>
            <div className="pt-2">
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                Proje Sahibi & Geliştirici: Enes Öztürk
              </span>
            </div>
          </div>

          {/* Quick Nav Links */}
          <div className="md:col-span-3 space-y-2">
            <div className="font-semibold text-slate-900 dark:text-white uppercase tracking-wider text-[11px]">
              Proje Modülleri
            </div>
            <ul className="space-y-1.5 text-xs">
              <li>
                <button
                  onClick={() => onNavigateTab('overview')}
                  className="hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors cursor-pointer"
                >
                  Genel Bakış & Özet
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigateTab('eda')}
                  className="hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors cursor-pointer"
                >
                  Veri Seti & Outlier Analizi
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigateTab('actigraph')}
                  className="hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors cursor-pointer"
                >
                  24 Saatlik Aktigraf Dalgaları
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigateTab('validation')}
                  className="hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors cursor-pointer"
                >
                  Train-Val-Test Bölümlemesi
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigateTab('models')}
                  className="hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors cursor-pointer"
                >
                  Model Kıyaslaması (RMSE / RMSLE)
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigateTab('diagnostic')}
                  className="hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors cursor-pointer"
                >
                  İnteraktif Klinik Tanı Testi
                </button>
              </li>
            </ul>
          </div>

          {/* References & Links */}
          <div className="md:col-span-4 space-y-2">
            <div className="font-semibold text-slate-900 dark:text-white uppercase tracking-wider text-[11px]">
              Bilimsel Referanslar
            </div>
            <p className="text-xs leading-relaxed">
              Garcia-Ceja, E., et al. "Depresjon: A Motor Activity Database of Depression Episodes in Unipolar and Bipolar Patients."
              Kaggle / University of Bergen Biomedical Informatics.
            </p>
            <div className="pt-2 flex flex-wrap items-center gap-2">
              <a
                href="https://www.kaggle.com/arashnic/the-depression-dataset"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors"
              >
                <span>Kaggle Dataset</span>
                <ExternalLink className="w-3 h-3" />
              </a>
              <span aria-hidden="true">·</span>
              <button
                onClick={onOpenReport}
                className="hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors cursor-pointer"
              >
                GitHub Dokümantasyonu
              </button>
            </div>
          </div>

        </div>

        {/* Bottom copyright line without pill badges */}
        <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-2">
            <span>© 2026 Enes Öztürk</span>
            <span aria-hidden="true">·</span>
            <span>Makine Öğrenmesi Dersi Proje Ödevi</span>
            <span aria-hidden="true">·</span>
            <span>Tüm Hakları Saklıdır</span>
          </div>

          <div className="text-slate-400 text-[11px]">
            Akademik Amaçlı Sağlık Bilişimi ve Aktigrafi Modellemesi
          </div>
        </div>

      </div>
    </footer>
  );
};
