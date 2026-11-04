/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Trophy,
  Play,
  Award,
  TrendingDown,
  TrendingUp,
  Cpu,
  BarChart2,
  CheckCircle2,
  Flame,
  Zap,
  Clock,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import {
  TrainedModelResult,
  ErrorMetric,
  DatasetPreset,
  ModelMetricResults,
} from '../types/dataset';

interface ModelBenchmarkingProps {
  currentPreset: DatasetPreset;
  selectedMetric: ErrorMetric;
  trainedModels: TrainedModelResult[];
  isTraining: boolean;
  onTrainAllModels: () => void;
  onProceedToSimulator: () => void;
  selectedModelId: string | null;
  onSelectModel: (model: TrainedModelResult) => void;
}

export const ModelBenchmarking: React.FC<ModelBenchmarkingProps> = ({
  currentPreset,
  selectedMetric,
  trainedModels,
  isTraining,
  onTrainAllModels,
  onProceedToSimulator,
  selectedModelId,
  onSelectModel,
}) => {
  const [activeTab, setActiveTab] = useState<'leaderboard' | 'diagnostics' | 'features'>('leaderboard');

  const championModel = trainedModels.find(m => m.isChampion) || trainedModels[0];
  const inspectedModel = trainedModels.find(m => m.id === selectedModelId) || championModel;

  const handleStartTraining = () => {
    onTrainAllModels();
  };

  const metricKey = selectedMetric.toLowerCase() as keyof ModelMetricResults;
  const isLowerBetter = selectedMetric !== 'R2';

  return (
    <div className="space-y-6">
      {/* Step Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-indigo-400 uppercase tracking-wider mb-1">
            <span>Adım 5 / 5</span>
            <span aria-hidden="true">·</span>
            <span>Çoklu Model Eğitimi & Metrik Liderliği</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Olabildiğince Fazla Model Denemek ve Şampiyonu Seçmek
          </h1>
          <p className="text-sm text-slate-400 mt-1 max-w-3xl">
            10 farklı makine öğrenmesi algoritmasını (Lineer, Ridge, Lasso, CART, Random Forest, Gradient Boosting, KNN, Yapay Sinir Ağı, Stacking) aynı veri ve kurallarla yarıştırıyoruz.
          </p>
        </div>

        {/* Action Button */}
        <button
          onClick={handleStartTraining}
          disabled={isTraining}
          className="flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg shadow-md shadow-indigo-600/20 transition-all cursor-pointer whitespace-nowrap shrink-0"
        >
          {isTraining ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>10 Model Eğitiliyor...</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-white" />
              <span>Tüm Modelleri Eğit ve Yarıştır</span>
            </>
          )}
        </button>
      </div>

      {/* Champion Spotlight Banner */}
      {championModel && (
        <div className="p-6 bg-gradient-to-r from-indigo-950/60 via-slate-900/80 to-purple-950/40 border border-indigo-500/40 rounded-2xl relative overflow-hidden shadow-lg">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-amber-400">
                <Trophy className="w-4 h-4 fill-amber-400" />
                <span className="uppercase tracking-wider">Metrik Şampiyonu Model</span>
                <span className="text-slate-400 font-normal">·</span>
                <span className="text-slate-300 font-normal">Seçilen Metrik: {selectedMetric}</span>
              </div>

              <div className="flex items-baseline gap-3">
                <h2 className="text-2xl font-extrabold text-white">{championModel.name}</h2>
                <span className="text-xs font-mono text-indigo-300 px-2 py-0.5 rounded bg-indigo-900/50">
                  {championModel.family}
                </span>
              </div>

              <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
                {championModel.description}
              </p>
            </div>

            {/* Score Strip */}
            <div className="flex items-center gap-4 bg-slate-950/80 border border-slate-800 p-4 rounded-xl shrink-0">
              <div className="text-center px-2">
                <div className="text-[10px] text-slate-400 uppercase tracking-wider">Validation {selectedMetric}</div>
                <div className="text-2xl font-black font-mono text-emerald-400 tabular-nums mt-0.5">
                  {championModel.valMetrics[metricKey]}
                </div>
                <div className="text-[10px] text-slate-400">
                  {isLowerBetter ? 'En Düşük Hata' : 'En Yüksek Skor'}
                </div>
              </div>

              <div className="w-px h-10 bg-slate-800" />

              <div className="text-center px-2">
                <div className="text-[10px] text-slate-400 uppercase tracking-wider">Test R² Skoru</div>
                <div className="text-2xl font-black font-mono text-indigo-300 tabular-nums mt-0.5">
                  {championModel.testMetrics.r2}
                </div>
                <div className="text-[10px] text-slate-400">Açıklayıcılık Gücü</div>
              </div>

              <div className="w-px h-10 bg-slate-800" />

              <div className="text-center px-2">
                <div className="text-[10px] text-slate-400 uppercase tracking-wider">Eğitim Süresi</div>
                <div className="text-2xl font-black font-mono text-slate-200 tabular-nums mt-0.5">
                  {championModel.trainingTimeMs} ms
                </div>
                <div className="text-[10px] text-slate-400">İnferans hızı</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Leaderboard Table */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-indigo-400" />
            <h3 className="text-sm font-bold text-white">Model Liderlik Tablosu (Leaderboard)</h3>
          </div>
          <span className="text-xs text-slate-400">
            Sıralama kriteri: <strong className="font-mono text-slate-300">Validation {selectedMetric}</strong>
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 bg-slate-950/60 font-semibold">
                <th className="py-3 px-4 w-12 text-center"># Sıra</th>
                <th className="py-3 px-4">Model Adı</th>
                <th className="py-3 px-4">Model Ailesi</th>
                <th className="py-3 px-4 text-right">Train {selectedMetric}</th>
                <th className="py-3 px-4 text-right text-indigo-300">Val {selectedMetric} (Hedef)</th>
                <th className="py-3 px-4 text-right text-emerald-400">Test {selectedMetric}</th>
                <th className="py-3 px-4 text-right">Test R²</th>
                <th className="py-3 px-4 text-right">Süre (ms)</th>
                <th className="py-3 px-4 text-center">Aşırı Öğrenme (Overfit)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {trainedModels.map((model, idx) => {
                const isChamp = model.isChampion;
                const isSelected = model.id === inspectedModel.id;
                const trainValDiff = Math.abs(model.valMetrics[metricKey] - model.trainMetrics[metricKey]);
                const overfitRatio = trainValDiff / (model.trainMetrics[metricKey] || 1);

                return (
                  <tr
                    key={model.id}
                    onClick={() => onSelectModel(model)}
                    className={`cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-indigo-950/30'
                        : isChamp
                        ? 'bg-amber-950/10 hover:bg-slate-800/40'
                        : 'hover:bg-slate-800/40'
                    }`}
                  >
                    <td className="py-3 px-4 text-center font-bold font-mono">
                      {idx === 0 ? (
                        <span className="text-amber-400 flex items-center justify-center">
                          <Trophy className="w-4 h-4 fill-amber-400" />
                        </span>
                      ) : (
                        <span className="text-slate-400">{idx + 1}</span>
                      )}
                    </td>

                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-white">{model.name}</span>
                        {isChamp && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-950 text-amber-300 border border-amber-800/50">
                            Şampiyon
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="py-3 px-4 text-slate-400 font-mono text-[11px]">
                      {model.family}
                    </td>

                    <td className="py-3 px-4 text-right font-mono tabular-nums text-slate-400">
                      {model.trainMetrics[metricKey]}
                    </td>

                    <td className="py-3 px-4 text-right font-mono font-bold tabular-nums text-indigo-300">
                      {model.valMetrics[metricKey]}
                    </td>

                    <td className="py-3 px-4 text-right font-mono font-bold tabular-nums text-emerald-400">
                      {model.testMetrics[metricKey]}
                    </td>

                    <td className="py-3 px-4 text-right font-mono tabular-nums text-slate-200">
                      {model.testMetrics.r2}
                    </td>

                    <td className="py-3 px-4 text-right font-mono tabular-nums text-slate-400">
                      {model.trainingTimeMs}
                    </td>

                    <td className="py-3 px-4 text-center">
                      {overfitRatio > 0.4 ? (
                        <span className="text-[11px] text-amber-400 font-medium">Hafif Overfit</span>
                      ) : (
                        <span className="text-[11px] text-emerald-400 font-medium">Dengeli</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Deep-Dive Inspection Panel for Selected Model */}
      {inspectedModel && (
        <div className="p-6 bg-slate-900/60 border border-slate-800 rounded-xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div>
              <div className="text-xs text-indigo-400 font-semibold uppercase tracking-wider">
                Model İnceleme & Diyagnostik
              </div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2 mt-0.5">
                <span>{inspectedModel.name}</span>
                <span className="text-xs font-mono text-slate-400 font-normal">
                  ({inspectedModel.family})
                </span>
              </h3>
            </div>

            {/* Sub-tabs */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab('leaderboard')}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                  activeTab === 'leaderboard'
                    ? 'bg-slate-800 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Tahmin vs Gerçek Değer
              </button>
              <button
                onClick={() => setActiveTab('features')}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                  activeTab === 'features'
                    ? 'bg-slate-800 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Öznitelik Önem Düzeyleri (Feature Importance)
              </button>
            </div>
          </div>

          {activeTab === 'leaderboard' && inspectedModel.samplePredictions && (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Test Kümesinden Örnek Tahminler ve Artık Hata (Residual) Dağılımı</span>
                <span>Actual vs Predicted Samples</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {inspectedModel.samplePredictions.slice(0, 9).map((sample, i) => {
                  const errorPercent = Math.abs((sample.residual / (sample.actual || 1)) * 100).toFixed(1);
                  return (
                    <div
                      key={i}
                      className="p-3 bg-slate-950/60 border border-slate-800 rounded-lg text-xs space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Örnek #{i + 1}</span>
                        <span className="font-mono text-indigo-400 font-semibold">
                          Sapma: %{errorPercent}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Gerçek Fiyat:</span>
                        <span className="font-mono font-bold text-white tabular-nums">
                          {sample.actual.toLocaleString('tr-TR')} {currentPreset.targetUnit}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Model Tahmini:</span>
                        <span className="font-mono font-bold text-emerald-400 tabular-nums">
                          {sample.predicted.toLocaleString('tr-TR')} {currentPreset.targetUnit}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === 'features' && inspectedModel.featureImportances && (
            <div className="space-y-4">
              <div className="text-xs text-slate-400">
                Modelin fiyatı tahmin ederken en çok ağırlık verdiği bağımsız değişkenler (MDI / Koatsayı Büyüklüğü):
              </div>

              <div className="space-y-2.5">
                {inspectedModel.featureImportances.map((feat, i) => {
                  const maxImp = inspectedModel.featureImportances![0].importance || 1;
                  const pct = Math.min(100, Math.round((feat.importance / maxImp) * 100));

                  return (
                    <div key={feat.feature} className="space-y-1 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-slate-300">{feat.feature}</span>
                        <span className="font-mono text-slate-400 tabular-nums">
                          %{pct} Ağırlık
                        </span>
                      </div>
                      <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                        <div
                          style={{ width: `${pct}%` }}
                          className="bg-indigo-500 h-full rounded-full transition-all"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Action Next Step */}
      <div className="flex items-center justify-between p-4 bg-indigo-950/20 border border-indigo-500/30 rounded-xl">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-semibold text-indigo-300">
              5. Adım Tamamlandı: Şampiyon Model Başarıyla Seçildi
            </div>
            <div className="text-xs text-slate-400">
              Şampiyon modeli interaktif olarak test etmek için Canlı Tahmin Laboratuvarına geçin.
            </div>
          </div>
        </div>

        <button
          onClick={onProceedToSimulator}
          className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors cursor-pointer shrink-0 shadow-sm shadow-indigo-600/20"
        >
          Canlı Tahmin Laboratuvarına Geç →
        </button>
      </div>
    </div>
  );
};
