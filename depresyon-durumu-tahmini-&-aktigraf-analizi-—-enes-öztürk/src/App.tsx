import React, { useState, useEffect } from 'react';
import { TopNavigation } from './components/TopNavigation';
import { HeroBanner } from './components/HeroBanner';
import { DatasetExplorer } from './components/DatasetExplorer';
import { ActigraphViewer } from './components/ActigraphViewer';
import { PreprocessingLab } from './components/PreprocessingLab';
import { ValidationSplitViewer } from './components/ValidationSplitViewer';
import { ModelBenchmarkArena } from './components/ModelBenchmarkArena';
import { DiagnosticAssessment } from './components/DiagnosticAssessment';
import { GithubReportModal } from './components/GithubReportModal';
import { ProjectSignatureFooter } from './components/ProjectSignatureFooter';
import { RAW_PATIENTS_DATA } from './data/depressionDataset';
import { ArrowRight, Brain, Activity, Sliders, GitFork, ClipboardCheck, Sparkles, Database, FileSpreadsheet } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [selectedPatientId, setSelectedPatientId] = useState<string>('condition_1');
  const [isReportOpen, setIsReportOpen] = useState<boolean>(false);
  const [isDark, setIsDark] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  const handleSelectPatientForWave = (patientId: string) => {
    setSelectedPatientId(patientId);
    setActiveTab('actigraph');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-white transition-colors">
      
      {/* 3-Zone Top Bar */}
      <TopNavigation
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenReport={() => setIsReportOpen(true)}
        isDark={isDark}
        setIsDark={setIsDark}
      />

      <main className="flex-1 w-full">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-10">
            <HeroBanner
              onStartDiagnostic={() => {
                setActiveTab('diagnostic');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onExploreModels={() => {
                setActiveTab('models');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onViewData={() => {
                setActiveTab('eda');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />

            {/* 5-Step Pipeline Grid (Adım Adım Yol Haritası) */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
              <div className="border-b border-slate-200 dark:border-slate-800 pb-3">
                <div className="text-xs text-cyan-600 dark:text-cyan-400 font-semibold uppercase tracking-wider">
                  Ders Yönergelerine Uygun Mimari Akış
                </div>
                <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white mt-1">
                  Uçtan Uca Makine Öğrenmesi Proje Pipeline'ı
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
                  Kaggle veri setinin okunmasından başlayıp, aykırı değer temizliği, hasta izolasyonlu bölümleme,
                  RMSE/RMSLE hata metrikleriyle çoklu model eğitimi ve interaktif tanı testine uzanan eksiksiz akış.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                
                {/* Step 1 */}
                <div
                  onClick={() => setActiveTab('eda')}
                  className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-cyan-500 dark:hover:border-cyan-500 transition-all cursor-pointer shadow-sm group"
                >
                  <div className="w-9 h-9 rounded-lg bg-cyan-50 dark:bg-cyan-950/60 text-cyan-600 flex items-center justify-center font-bold mb-3 group-hover:scale-105 transition-transform">
                    <Database className="w-5 h-5" />
                  </div>
                  <div className="text-xs font-semibold text-slate-400">1. Adım</div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white mt-0.5 group-hover:text-cyan-600 transition-colors">
                    Veriyi İndirme & Okuma
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1.5 leading-relaxed">
                    23 klinik depresyon (condition) ve 32 sağlıklı kontrol hastasının dakikalık ivmeölçer verileri ve
                    scores.csv klinik puanları.
                  </p>
                  <div className="flex items-center gap-1 text-xs font-semibold text-cyan-600 mt-3">
                    <span>Veri Setini İncele</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>

                {/* Step 2 */}
                <div
                  onClick={() => setActiveTab('eda')}
                  className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-cyan-500 dark:hover:border-cyan-500 transition-all cursor-pointer shadow-sm group"
                >
                  <div className="w-9 h-9 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600 flex items-center justify-center font-bold mb-3 group-hover:scale-105 transition-transform">
                    <Sliders className="w-5 h-5" />
                  </div>
                  <div className="text-xs font-semibold text-slate-400">2. Adım</div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white mt-0.5 group-hover:text-amber-600 transition-colors">
                    Eksik Değerler & Outlier Yönetimi
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1.5 leading-relaxed">
                    IQR Winsorization (1.5×IQR kırpma), MAD ve Log(1+x) dönüşümü ile çarpık aktigraf dağılımının
                    normalizasyonu.
                  </p>
                  <div className="flex items-center gap-1 text-xs font-semibold text-amber-600 mt-3">
                    <span>Laboratuvara Git</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>

                {/* Step 3 */}
                <div
                  onClick={() => setActiveTab('validation')}
                  className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-cyan-500 dark:hover:border-cyan-500 transition-all cursor-pointer shadow-sm group"
                >
                  <div className="w-9 h-9 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 flex items-center justify-center font-bold mb-3 group-hover:scale-105 transition-transform">
                    <GitFork className="w-5 h-5" />
                  </div>
                  <div className="text-xs font-semibold text-slate-400">3. Adım</div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white mt-0.5 group-hover:text-indigo-600 transition-colors">
                    Gerçek Hayatı Yansıtan Bölümleme
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1.5 leading-relaxed">
                    Veri sızıntısını (Data Leakage) önlemek için hasta ID bazında GroupStratifiedSplit (%60 Train, %20 Val, %20 Test).
                  </p>
                  <div className="flex items-center gap-1 text-xs font-semibold text-indigo-600 mt-3">
                    <span>Bölümleme Şemasını Gör</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>

                {/* Step 4 */}
                <div
                  onClick={() => setActiveTab('models')}
                  className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-cyan-500 dark:hover:border-cyan-500 transition-all cursor-pointer shadow-sm group"
                >
                  <div className="w-9 h-9 rounded-lg bg-rose-50 dark:bg-rose-950/60 text-rose-600 flex items-center justify-center font-bold mb-3 group-hover:scale-105 transition-transform">
                    <Brain className="w-5 h-5" />
                  </div>
                  <div className="text-xs font-semibold text-slate-400">4. Adım</div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white mt-0.5 group-hover:text-rose-600 transition-colors">
                    RMSE / RMSLE ile 7 Modelin Kıyaslanması
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1.5 leading-relaxed">
                    LightGBM, Stacking Ensemble, RF, SVM, YSA, Lojistik ve KNN modellerinin yarışması ve şampiyon seçimi.
                  </p>
                  <div className="flex items-center gap-1 text-xs font-semibold text-rose-600 mt-3">
                    <span>Modelleri Karşılaştır</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>

                {/* Step 5 */}
                <div
                  onClick={() => setActiveTab('actigraph')}
                  className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-cyan-500 dark:hover:border-cyan-500 transition-all cursor-pointer shadow-sm group"
                >
                  <div className="w-9 h-9 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center font-bold mb-3 group-hover:scale-105 transition-transform">
                    <Activity className="w-5 h-5" />
                  </div>
                  <div className="text-xs font-semibold text-slate-400">Görselleştirme</div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white mt-0.5 group-hover:text-emerald-600 transition-colors">
                    24 Saatlik Biyolojik Dalga Formları
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1.5 leading-relaxed">
                    Depresyon ve kontrol hastalarının gece-gündüz motor hareket dalgalarını yan yana interaktif inceleyin.
                  </p>
                  <div className="flex items-center gap-1 text-xs font-semibold text-emerald-600 mt-3">
                    <span>Sinyalleri İncele</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>

                {/* Step 6 */}
                <div
                  onClick={() => setActiveTab('diagnostic')}
                  className="p-5 rounded-xl border-2 border-cyan-500 bg-cyan-50/20 dark:bg-cyan-950/30 hover:bg-cyan-50/40 transition-all cursor-pointer shadow-sm group"
                >
                  <div className="w-9 h-9 rounded-lg bg-cyan-600 text-white flex items-center justify-center font-bold mb-3 group-hover:scale-105 transition-transform">
                    <ClipboardCheck className="w-5 h-5" />
                  </div>
                  <div className="text-xs font-bold text-cyan-600 dark:text-cyan-400">İnteraktif Uygulama</div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
                    Klinik Depresyon Tanı Testi
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1.5 leading-relaxed">
                    Kullanıcının yanıtlarına ve el bileği aktivite verilerine bağlı olarak otomatik depresyon teşhisi ve MADRS skoru tahmini.
                  </p>
                  <div className="flex items-center gap-1 text-xs font-bold text-cyan-600 mt-3">
                    <span>Testi Başlat</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>

              </div>

            </div>

            {/* Quick Actigraph Preview on Overview */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <ActigraphViewer
                patients={RAW_PATIENTS_DATA}
                selectedPatientId={selectedPatientId}
                onSelectPatientId={setSelectedPatientId}
              />
            </div>
          </div>
        )}

        {/* Tab 2: Veri & Outlier Analizi */}
        {activeTab === 'eda' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
            <PreprocessingLab rawPatients={RAW_PATIENTS_DATA} />
            <DatasetExplorer
              patients={RAW_PATIENTS_DATA}
              onSelectPatient={handleSelectPatientForWave}
            />
          </div>
        )}

        {/* Tab 3: Aktigraf Dalgaları */}
        {activeTab === 'actigraph' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <ActigraphViewer
              patients={RAW_PATIENTS_DATA}
              selectedPatientId={selectedPatientId}
              onSelectPatientId={setSelectedPatientId}
            />
          </div>
        )}

        {/* Tab 4: Train-Val-Test Bölümleme */}
        {activeTab === 'validation' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <ValidationSplitViewer patients={RAW_PATIENTS_DATA} />
          </div>
        )}

        {/* Tab 5: Model Kıyaslaması & Metrikler */}
        {activeTab === 'models' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <ModelBenchmarkArena />
          </div>
        )}

        {/* Tab 6: İnteraktif Klinik Tanı Testi */}
        {activeTab === 'diagnostic' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <DiagnosticAssessment />
          </div>
        )}
      </main>

      {/* Signature & Academic Footer */}
      <ProjectSignatureFooter
        onOpenReport={() => setIsReportOpen(true)}
        onNavigateTab={(tab) => {
          setActiveTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      {/* GitHub Documentation & Python Script Modal */}
      <GithubReportModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
      />

    </div>
  );
}
