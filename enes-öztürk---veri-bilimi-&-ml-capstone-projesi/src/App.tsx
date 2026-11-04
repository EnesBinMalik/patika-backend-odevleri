/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import confetti from 'canvas-confetti';
import {
  DataRow,
  DatasetPreset,
  ColumnMetadata,
  PreprocessingConfig,
  SplitConfig,
  ErrorMetric,
  TrainedModelResult,
} from './types/dataset';
import { DATASET_PRESETS } from './data/sampleDatasets';
import {
  computeDatasetMetadata,
  runDataPreprocessing,
  splitDataset,
  vectorizeDataset,
  trainAllCandidateModels,
} from './utils/mlEngine';
import { Header } from './components/Header';
import { DatasetExplorer } from './components/DatasetExplorer';
import { PreprocessingLab } from './components/PreprocessingLab';
import { MetricsAndSplitting } from './components/MetricsAndSplitting';
import { ModelBenchmarking } from './components/ModelBenchmarking';
import { PredictionSimulator } from './components/PredictionSimulator';
import { GitHubRepoModal } from './components/GitHubRepoModal';
import { GitBranch, ShieldCheck, Trophy, Sparkles, BookOpen } from 'lucide-react';

export default function App() {
  // 1. Preset & Raw Data State
  const [currentPreset, setCurrentPreset] = useState<DatasetPreset>(DATASET_PRESETS[0]);
  const [rawData, setRawData] = useState<DataRow[]>(DATASET_PRESETS[0].defaultData);

  // 2. Navigation State
  const [activeTab, setActiveTab] = useState<string>('eda');
  const [isGitHubModalOpen, setIsGitHubModalOpen] = useState<boolean>(false);

  // 3. Preprocessing Config State (Outliers, Imputation, Encoders, Feature Eng.)
  const [preprocessingConfig, setPreprocessingConfig] = useState<PreprocessingConfig>({
    outlierMethod: 'iqr',
    outlierThreshold: 1.5,
    missingMethod: 'grouped_median',
    categoricalEncoding: 'one_hot',
    targetTransformation: 'log1p',
    rareThreshold: 0.05,
    enableFeatureEngineering: true,
  });

  // 4. Metric & Splitting Config
  const [selectedMetric, setSelectedMetric] = useState<ErrorMetric>('RMSLE');
  const [splitConfig, setSplitConfig] = useState<SplitConfig>({
    trainRatio: 0.70,
    valRatio: 0.15,
    testRatio: 0.15,
    randomSeed: 42,
  });

  // 5. Training State
  const [trainedModels, setTrainedModels] = useState<TrainedModelResult[]>([]);
  const [selectedModelId, setSelectedModelId] = useState<string | null>(null);
  const [isTraining, setIsTraining] = useState<boolean>(false);

  // Recompute Metadata whenever raw data changes
  const metadata: ColumnMetadata[] = useMemo(() => {
    return computeDatasetMetadata(rawData, currentPreset.targetColumn);
  }, [rawData, currentPreset.targetColumn]);

  // Run Preprocessing Pipeline
  const preprocessingResult = useMemo(() => {
    return runDataPreprocessing(rawData, currentPreset.targetColumn, preprocessingConfig);
  }, [rawData, currentPreset.targetColumn, preprocessingConfig]);

  // Run Train - Val - Test Split
  const splitResult = useMemo(() => {
    return splitDataset(
      preprocessingResult.processedRows,
      currentPreset.targetColumn,
      splitConfig
    );
  }, [preprocessingResult.processedRows, currentPreset.targetColumn, splitConfig]);

  // Vectorize and Scale Data strictly from Train set
  const vectorizedDataset = useMemo(() => {
    return vectorizeDataset(
      splitResult.trainRows,
      splitResult.valRows,
      splitResult.testRows,
      currentPreset.targetColumn,
      preprocessingConfig
    );
  }, [
    splitResult.trainRows,
    splitResult.valRows,
    splitResult.testRows,
    currentPreset.targetColumn,
    preprocessingConfig,
  ]);

  // Training Handler
  const executeTraining = useCallback(async () => {
    setIsTraining(true);
    // Give UI time to update spinner
    await new Promise(r => setTimeout(r, 600));

    try {
      const results = await trainAllCandidateModels(vectorizedDataset, selectedMetric);
      setTrainedModels(results);
      if (results.length > 0) {
        setSelectedModelId(results[0].id);
      }
      // Celebrate champion model selection
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
      });
    } catch (e) {
      console.error('Model training error:', e);
    } finally {
      setIsTraining(false);
    }
  }, [vectorizedDataset, selectedMetric]);

  // Train models on initial mount and when vectorized data or metric significantly changes
  useEffect(() => {
    executeTraining();
  }, [executeTraining]);

  // Handle Preset Switching
  const handleSelectPreset = (preset: DatasetPreset) => {
    setCurrentPreset(preset);
    setRawData(preset.defaultData);
    setSelectedMetric(preset.recommendedMetric);
    setActiveTab('eda');
  };

  // Handle Custom CSV
  const handleUploadCustomCSV = (customRows: DataRow[], presetInfo: Partial<DatasetPreset>) => {
    const customPreset: DatasetPreset = {
      id: presetInfo.id || 'custom-csv',
      title: presetInfo.title || 'Özel Yüklenen Veri Seti',
      category: 'Özel Regresyon Verisi',
      targetColumn: presetInfo.targetColumn || 'target',
      targetLabel: presetInfo.targetLabel || 'Hedef Değişken',
      targetUnit: 'Birim',
      recommendedMetric: 'RMSE',
      metricRationale: 'Özel yüklenen veri seti için varsayılan RMSE veya RMSLE seçilebilir.',
      description: 'Kullanıcı tarafından CSV formatında yüklenen veri seti.',
      defaultData: customRows,
    };
    setCurrentPreset(customPreset);
    setRawData(customRows);
    setActiveTab('eda');
  };

  const championModel = trainedModels.find(m => m.isChampion) || trainedModels[0];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Universal Header Signed by Enes Öztürk */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenGitHubModal={() => setIsGitHubModalOpen(true)}
        datasetName={currentPreset.title}
      />

      {/* Hero Announcement & Project Signature Banner */}
      <section className="bg-gradient-to-b from-indigo-950/30 to-transparent border-b border-slate-900 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
                <span>Veri Bilimi & Makine Öğrenmesi Dersi</span>
                <span aria-hidden="true">·</span>
                <span className="text-indigo-400">Dönem Sonu Bitirme Projesi (Capstone)</span>
                <span aria-hidden="true">·</span>
                <span>Enes Öztürk</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white">
                {currentPreset.title}
              </h1>
              <p className="text-xs text-slate-400 max-w-3xl">
                Öğrenilenlerin ötesinde: Tukey IQR ve Winsorization outlier analizi, gruplanmış medyan imputer, RMSLE metrik minimizasyonu, gerçek hayatı yansıtan Train-Val-Test ayrımı ve 10 farklı modelin kıyasıya yarışı.
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <button
                onClick={() => setIsGitHubModalOpen(true)}
                className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-slate-200 bg-slate-900 border border-slate-800 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
              >
                <GitBranch className="w-3.5 h-3.5 text-indigo-400" />
                <span>GitHub Reposu</span>
              </button>

              {championModel && (
                <div className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-amber-300 bg-amber-950/40 border border-amber-800/40 rounded-lg">
                  <Trophy className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span>Şampiyon: <strong>{championModel.name.split(' ')[0]}</strong></span>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Main Workspace Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'eda' && (
          <DatasetExplorer
            currentPreset={currentPreset}
            onSelectPreset={handleSelectPreset}
            rawData={rawData}
            metadata={metadata}
            onUploadCustomCSV={handleUploadCustomCSV}
            onProceedToPreprocessing={() => setActiveTab('preprocess')}
          />
        )}

        {activeTab === 'preprocess' && (
          <PreprocessingLab
            currentPreset={currentPreset}
            config={preprocessingConfig}
            onChangeConfig={setPreprocessingConfig}
            preprocessingResult={preprocessingResult}
            onProceedToMetrics={() => setActiveTab('metrics')}
          />
        )}

        {activeTab === 'metrics' && (
          <MetricsAndSplitting
            currentPreset={currentPreset}
            selectedMetric={selectedMetric}
            onSelectMetric={setSelectedMetric}
            splitConfig={splitConfig}
            onChangeSplitConfig={setSplitConfig}
            splitResult={splitResult}
            onProceedToTraining={() => setActiveTab('models')}
          />
        )}

        {activeTab === 'models' && (
          <ModelBenchmarking
            currentPreset={currentPreset}
            selectedMetric={selectedMetric}
            trainedModels={trainedModels}
            isTraining={isTraining}
            onTrainAllModels={executeTraining}
            onProceedToSimulator={() => setActiveTab('simulator')}
            selectedModelId={selectedModelId}
            onSelectModel={m => setSelectedModelId(m.id)}
          />
        )}

        {activeTab === 'simulator' && (
          <PredictionSimulator
            currentPreset={currentPreset}
            championModel={championModel}
          />
        )}
      </main>

      {/* Footer Signature */}
      <footer className="mt-auto border-t border-slate-900 bg-slate-950 py-8 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-200">Enes Öztürk</span>
            <span aria-hidden="true">·</span>
            <span>Veri Bilimi & Makine Öğrenmesi Bitirme Projesi</span>
            <span aria-hidden="true">·</span>
            <span>2026</span>
          </div>

          <div className="flex items-center gap-4 text-slate-400">
            <button
              onClick={() => setIsGitHubModalOpen(true)}
              className="hover:text-indigo-400 transition-colors cursor-pointer"
            >
              GitHub Reposu & Kaynak Kodları
            </button>
            <span aria-hidden="true">·</span>
            <span>RMSE & RMSLE Benchmark</span>
          </div>
        </div>
      </footer>

      {/* GitHub Repository Modal */}
      <GitHubRepoModal
        isOpen={isGitHubModalOpen}
        onClose={() => setIsGitHubModalOpen(false)}
        currentPreset={currentPreset}
        selectedMetric={selectedMetric}
        trainedModels={trainedModels}
      />
    </div>
  );
}
