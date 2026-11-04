import React, { useState } from 'react';
import { Header } from './components/Header';
import { HeroBanner } from './components/HeroBanner';
import { Step1DataIngestion } from './components/Step1DataIngestion';
import { Step2Preprocessing } from './components/Step2Preprocessing';
import { Step3MetricsGuide } from './components/Step3MetricsGuide';
import { Step4TrainTestSplit } from './components/Step4TrainTestSplit';
import { Step5ModelArena } from './components/Step5ModelArena';
import { BuildingSimulator } from './components/BuildingSimulator';
import { PythonNotebookModal } from './components/PythonNotebookModal';
import { Footer } from './components/Footer';
import { MLPipelineConfig } from './utils/mlEngine';
import { Database, Filter, Target, Split, Trophy, Building, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [isCodeModalOpen, setIsCodeModalOpen] = useState<boolean>(false);

  // Global ML Pipeline configuration state
  const [pipelineConfig, setPipelineConfig] = useState<MLPipelineConfig>({
    target: 'heatingLoad',
    outlierMethod: 'iqr',
    scaler: 'standard',
    trainRatio: 0.70,
    valRatio: 0.15,
    testRatio: 0.15,
    includeCategoricalEncoding: true
  });

  const steps = [
    { id: 'overview', stepNum: 'Adım 1', label: 'Veri & EDA', icon: Database },
    { id: 'pipeline', stepNum: 'Adım 2', label: 'Ön İşleme & Outlier', icon: Filter },
    { id: 'metrics', stepNum: 'Adım 3', label: 'Hata Metrikleri', icon: Target },
    { id: 'split', stepNum: 'Adım 4', label: 'Train / Val / Test', icon: Split },
    { id: 'models', stepNum: 'Adım 5', label: 'Model Arenası & Şampiyon', icon: Trophy },
    { id: 'simulator', stepNum: 'Danışmanlık', label: '3D Simülatör & Yeşil Rapor', icon: Building }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      {/* Top Bar Contract Compliant Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenCodeModal={() => setIsCodeModalOpen(true)}
      />

      {/* Hero Showcase with problem statement & architectural image */}
      <HeroBanner
        onStartSimulation={() => setActiveTab('simulator')}
        onExploreModels={() => setActiveTab('models')}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-8">
        {/* Step-by-Step Navigation Bar */}
        <section aria-label="Proje Adımları" className="bg-white rounded-xl border border-slate-200 p-2 shadow-xs">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-1.5">
            {steps.map((s) => {
              const Icon = s.icon;
              const isActive = activeTab === s.id;

              return (
                <button
                  key={s.id}
                  onClick={() => setActiveTab(s.id)}
                  className={`flex flex-col items-start p-3 rounded-lg text-left transition-all cursor-pointer ${
                    isActive
                      ? 'bg-emerald-50 border border-emerald-300 text-emerald-900 shadow-2xs'
                      : 'hover:bg-slate-50 text-slate-600 border border-transparent'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className={`text-[10px] font-bold font-mono tracking-wider ${
                      isActive ? 'text-emerald-700' : 'text-slate-400'
                    }`}>
                      {s.stepNum}
                    </span>
                    <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-emerald-700' : 'text-slate-400'}`} />
                  </div>
                  <span className={`text-xs font-bold mt-1 line-clamp-1 ${
                    isActive ? 'text-emerald-950 font-extrabold' : 'text-slate-700'
                  }`}>
                    {s.label}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        {/* Tab Content Rendering */}
        <div className="transition-opacity duration-300">
          {activeTab === 'overview' && <Step1DataIngestion />}
          {activeTab === 'pipeline' && (
            <Step2Preprocessing
              config={pipelineConfig}
              setConfig={setPipelineConfig}
            />
          )}
          {activeTab === 'metrics' && <Step3MetricsGuide />}
          {activeTab === 'split' && (
            <Step4TrainTestSplit
              config={pipelineConfig}
              setConfig={setPipelineConfig}
            />
          )}
          {activeTab === 'models' && (
            <Step5ModelArena config={pipelineConfig} />
          )}
          {activeTab === 'simulator' && <BuildingSimulator />}
        </div>
      </main>

      {/* Code Export Modal (Python / Jupyter Notebook) */}
      <PythonNotebookModal
        isOpen={isCodeModalOpen}
        onClose={() => setIsCodeModalOpen(false)}
      />

      {/* Quiet, branded footer */}
      <Footer />
    </div>
  );
}
