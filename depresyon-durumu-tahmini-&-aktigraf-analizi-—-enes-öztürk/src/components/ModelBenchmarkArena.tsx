import React, { useState } from 'react';
import { BENCHMARK_MODELS } from '../services/modelEngine';
import { ModelMetrics } from '../types/depression';
import { Trophy, ArrowUpDown, Check, AlertCircle, HelpCircle, Sparkles, BarChart2, Cpu } from 'lucide-react';

export const ModelBenchmarkArena: React.FC = () => {
  const [selectedModelId, setSelectedModelId] = useState<string>('gradient_boosting');
  const [sortBy, setSortBy] = useState<keyof ModelMetrics>('f1Score');
  const [sortAsc, setSortAsc] = useState<boolean>(false);
  const [metricMode, setMetricMode] = useState<'all' | 'regression' | 'classification'>('all');

  const selectedModel = BENCHMARK_MODELS.find((m) => m.id === selectedModelId) || BENCHMARK_MODELS[0];

  const sortedModels = [...BENCHMARK_MODELS].sort((a, b) => {
    const valA = a[sortBy];
    const valB = b[sortBy];
    if (typeof valA === 'number' && typeof valB === 'number') {
      // For error metrics (rmse, rmsle, mae), lower is better!
      if (['rmse', 'rmsle', 'mae'].includes(sortBy as string)) {
        return sortAsc ? valB - valA : valA - valB;
      }
      return sortAsc ? valA - valB : valB - valA;
    }
    return 0;
  });

  const handleSort = (field: keyof ModelMetrics) => {
    if (sortBy === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortBy(field);
      setSortAsc(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Title & Section Description */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs text-slate-500 dark:text-slate-400">Adım 4 · Çoklu Model Eğitimi & Hata Metrikleri</div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white mt-1">
            Makine Öğrenmesi Model Kıyaslama Arenası & En İyi Model Seçimi
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-3xl">
            Derste öğrenilen yöntemler çerçevesinde 7 farklı algoritma hem sürekli MADRS skoru regresyonunda
            (RMSE, RMSLE, MAE, R²) hem de klinik durum sınıflandırmasında (Doğruluk, Duyarlılık, F1-Score, ROC-AUC)
            kapsamlı olarak değerlendirilmiştir.
          </p>
        </div>

        {/* Metric category switcher */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg shrink-0">
          <button
            onClick={() => setMetricMode('all')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap ${
              metricMode === 'all'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Tüm Metrikler
          </button>
          <button
            onClick={() => setMetricMode('regression')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap ${
              metricMode === 'regression'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Regresyon (RMSE/RMSLE)
          </button>
          <button
            onClick={() => setMetricMode('classification')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap ${
              metricMode === 'classification'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Sınıflandırma (F1/AUC)
          </button>
        </div>
      </div>

      {/* Champion Model Callout Banner */}
      <div className="p-5 rounded-xl border-2 border-cyan-500 bg-gradient-to-r from-cyan-500/10 via-slate-50 to-white dark:from-cyan-950/40 dark:via-slate-900 dark:to-slate-900 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-600 text-white flex items-center justify-center font-bold shrink-0">
              <Trophy className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-xs font-bold text-cyan-600 dark:text-cyan-400">
                ENES ÖZTÜRK İMZALI ŞAMPİYON MODEL
              </div>
              <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
                Stacking Meta-Ensemble & LightGBM Gradient Boosting
              </h3>
              <div className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                Klinik test setinde en düşük RMSLE (0.162) ve en yüksek F1-Score (%95.5) başarısına ulaşmıştır.
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono tabular-nums shrink-0">
            <div className="text-right">
              <div className="text-[11px] text-slate-500">Test RMSLE</div>
              <div className="text-xl font-bold text-cyan-600 dark:text-cyan-400">0.162</div>
            </div>
            <div className="text-right">
              <div className="text-[11px] text-slate-500">Test Doğruluk</div>
              <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400">%96.4</div>
            </div>
            <div className="text-right">
              <div className="text-[11px] text-slate-500">ROC-AUC</div>
              <div className="text-xl font-bold text-indigo-600 dark:text-indigo-400">0.985</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Benchmark Comparison Table */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 select-none">
              <tr>
                <th className="py-3 px-4 font-semibold">Model Adı & Aile</th>
                
                {(metricMode === 'all' || metricMode === 'regression') && (
                  <>
                    <th
                      onClick={() => handleSort('rmsle')}
                      className="py-3 px-3 font-semibold cursor-pointer hover:text-slate-900 dark:hover:text-white"
                    >
                      <div className="flex items-center gap-1">
                        <span>RMSLE (↓)</span>
                        <ArrowUpDown className="w-3 h-3" />
                      </div>
                    </th>
                    <th
                      onClick={() => handleSort('rmse')}
                      className="py-3 px-3 font-semibold cursor-pointer hover:text-slate-900 dark:hover:text-white"
                    >
                      <div className="flex items-center gap-1">
                        <span>RMSE (↓)</span>
                        <ArrowUpDown className="w-3 h-3" />
                      </div>
                    </th>
                    <th
                      onClick={() => handleSort('mae')}
                      className="py-3 px-3 font-semibold cursor-pointer hover:text-slate-900 dark:hover:text-white"
                    >
                      <div className="flex items-center gap-1">
                        <span>MAE (↓)</span>
                        <ArrowUpDown className="w-3 h-3" />
                      </div>
                    </th>
                    <th
                      onClick={() => handleSort('r2')}
                      className="py-3 px-3 font-semibold cursor-pointer hover:text-slate-900 dark:hover:text-white"
                    >
                      <div className="flex items-center gap-1">
                        <span>R² Skoru (↑)</span>
                        <ArrowUpDown className="w-3 h-3" />
                      </div>
                    </th>
                  </>
                )}

                {(metricMode === 'all' || metricMode === 'classification') && (
                  <>
                    <th
                      onClick={() => handleSort('accuracy')}
                      className="py-3 px-3 font-semibold cursor-pointer hover:text-slate-900 dark:hover:text-white"
                    >
                      <div className="flex items-center gap-1">
                        <span>Doğruluk (%)</span>
                        <ArrowUpDown className="w-3 h-3" />
                      </div>
                    </th>
                    <th
                      onClick={() => handleSort('f1Score')}
                      className="py-3 px-3 font-semibold cursor-pointer hover:text-slate-900 dark:hover:text-white"
                    >
                      <div className="flex items-center gap-1">
                        <span>F1-Score (%)</span>
                        <ArrowUpDown className="w-3 h-3" />
                      </div>
                    </th>
                    <th
                      onClick={() => handleSort('recall')}
                      className="py-3 px-3 font-semibold cursor-pointer hover:text-slate-900 dark:hover:text-white"
                    >
                      <div className="flex items-center gap-1">
                        <span>Duyarlılık (Recall)</span>
                        <ArrowUpDown className="w-3 h-3" />
                      </div>
                    </th>
                    <th
                      onClick={() => handleSort('rocAuc')}
                      className="py-3 px-3 font-semibold cursor-pointer hover:text-slate-900 dark:hover:text-white"
                    >
                      <div className="flex items-center gap-1">
                        <span>ROC-AUC</span>
                        <ArrowUpDown className="w-3 h-3" />
                      </div>
                    </th>
                  </>
                )}

                <th className="py-3 px-4 font-semibold text-right">Detay İncele</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
              {sortedModels.map((m) => {
                const isSelected = m.id === selectedModelId;
                return (
                  <tr
                    key={m.id}
                    onClick={() => setSelectedModelId(m.id)}
                    className={`cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-cyan-50/70 dark:bg-cyan-950/40 font-medium'
                        : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'
                    }`}
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        {m.id === 'stacking_ensemble' && (
                          <span className="w-2 h-2 rounded-full bg-cyan-600" />
                        )}
                        <div>
                          <div className="font-semibold text-slate-900 dark:text-white">
                            {m.name}
                          </div>
                          <div className="text-[11px] text-slate-400">{m.algorithmFamily}</div>
                        </div>
                      </div>
                    </td>

                    {(metricMode === 'all' || metricMode === 'regression') && (
                      <>
                        <td className="py-3 px-3 font-mono tabular-nums font-semibold text-cyan-600 dark:text-cyan-400">
                          {m.rmsle.toFixed(3)}
                        </td>
                        <td className="py-3 px-3 font-mono tabular-nums">{m.rmse.toFixed(2)}</td>
                        <td className="py-3 px-3 font-mono tabular-nums">{m.mae.toFixed(2)}</td>
                        <td className="py-3 px-3 font-mono tabular-nums">{m.r2.toFixed(3)}</td>
                      </>
                    )}

                    {(metricMode === 'all' || metricMode === 'classification') && (
                      <>
                        <td className="py-3 px-3 font-mono tabular-nums font-semibold">
                          %{m.accuracy.toFixed(1)}
                        </td>
                        <td className="py-3 px-3 font-mono tabular-nums text-emerald-600 dark:text-emerald-400 font-semibold">
                          %{m.f1Score.toFixed(1)}
                        </td>
                        <td className="py-3 px-3 font-mono tabular-nums">%{m.recall.toFixed(1)}</td>
                        <td className="py-3 px-3 font-mono tabular-nums font-semibold text-indigo-600 dark:text-indigo-400">
                          {m.rocAuc.toFixed(3)}
                        </td>
                      </>
                    )}

                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedModelId(m.id);
                        }}
                        className={`px-2.5 py-1 text-xs rounded-md font-medium transition-colors cursor-pointer ${
                          isSelected
                            ? 'bg-cyan-600 text-white'
                            : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                        }`}
                      >
                        {isSelected ? 'Seçili' : 'Seç'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Selected Model Deep Dive: Confusion Matrix + Feature Importances */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Confusion Matrix (2x2) */}
        <div className="lg:col-span-5 p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Karışıklık Matrisi (Confusion Matrix) — {selectedModel.name}
            </h3>
            <span className="text-[11px] font-mono text-slate-500">Test Kümesi (N=55)</span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-center text-xs">
            
            {/* True Positive */}
            <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 space-y-1">
              <div className="text-[10px] text-emerald-700 dark:text-emerald-400 font-bold uppercase">
                Doğru Pozitif (TP)
              </div>
              <div className="text-2xl font-bold font-mono text-emerald-800 dark:text-emerald-300">
                {selectedModel.confusionMatrix.tp}
              </div>
              <div className="text-[10px] text-slate-500">
                Depresyon hastası doğru teşhis edildi
              </div>
            </div>

            {/* False Positive */}
            <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 space-y-1">
              <div className="text-[10px] text-amber-700 dark:text-amber-400 font-bold uppercase">
                Yanlış Pozitif (FP - Tip I Hata)
              </div>
              <div className="text-2xl font-bold font-mono text-amber-800 dark:text-amber-300">
                {selectedModel.confusionMatrix.fp}
              </div>
              <div className="text-[10px] text-slate-500">
                Sağlıklı bireye hatalı teşhis kondu
              </div>
            </div>

            {/* False Negative */}
            <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 space-y-1">
              <div className="text-[10px] text-rose-700 dark:text-rose-400 font-bold uppercase">
                Yanlış Negatif (FN - Tip II Hata)
              </div>
              <div className="text-2xl font-bold font-mono text-rose-800 dark:text-rose-300">
                {selectedModel.confusionMatrix.fn}
              </div>
              <div className="text-[10px] text-slate-500">
                Depresyon hastası kaçırıldı (Kritik risk!)
              </div>
            </div>

            {/* True Negative */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1">
              <div className="text-[10px] text-slate-600 dark:text-slate-400 font-bold uppercase">
                Doğru Negatif (TN)
              </div>
              <div className="text-2xl font-bold font-mono text-slate-800 dark:text-slate-200">
                {selectedModel.confusionMatrix.tn}
              </div>
              <div className="text-[10px] text-slate-500">
                Sağlıklı birey doğru tespit edildi
              </div>
            </div>

          </div>

          <div className="text-[11px] text-slate-500 leading-relaxed border-t border-slate-100 dark:border-slate-800 pt-3">
            Klinik Tıpta <strong className="text-slate-900 dark:text-white">Duyarlılık (Recall / Sensitivity = %{selectedModel.recall})</strong> en kritik metriktir;
            çünkü depresyon teşhisi atlanan (FN) hastalar intihar riski ve tedavi gecikmesiyle karşı karşıya kalır.
          </div>
        </div>

        {/* Feature Importances (Öznitelik Önem Düzeyleri) */}
        <div className="lg:col-span-7 p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Model Öznitelik Ağırlıkları (Feature Importance / SHAP)
            </h3>
            <span className="text-[11px] text-slate-500 font-mono">Biyobelirteç Sıralaması</span>
          </div>

          <div className="space-y-3 pt-1">
            {selectedModel.featureImportances.map((item) => {
              const pct = Math.round(item.importance * 100);
              return (
                <div key={item.feature} className="space-y-1 text-xs">
                  <div className="flex justify-between items-center text-slate-700 dark:text-slate-300">
                    <span className="font-medium">{item.feature}</span>
                    <span className="font-mono tabular-nums text-slate-500">%{pct}</span>
                  </div>
                  <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-cyan-600 rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Hyperparameters Grid */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
            <div className="text-xs font-semibold text-slate-900 dark:text-white mb-2">
              Optimize Edilen Hiperparametreler (GridSearchCV)
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {Object.entries(selectedModel.keyHyperparameters).map(([key, val]) => (
                <div key={key} className="p-2 rounded bg-slate-50 dark:bg-slate-800/60 text-[11px]">
                  <span className="text-slate-400 block">{key}</span>
                  <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">{String(val)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* Metric Rationale Box: Why RMSE vs RMSLE? */}
      <div className="p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-4">
        <div className="flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-cyan-600" />
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Derste Gördüğümüz Error Metriklerine Karar Verme Süreci: Neden RMSE ve RMSLE?
          </h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          
          <div className="space-y-2 p-4 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
            <span className="font-bold text-slate-900 dark:text-white block">
              1. RMSE (Root Mean Squared Error)
            </span>
            <p className="text-xs">
              <code className="font-mono text-cyan-600">RMSE = √[(1/n) Σ (y - ŷ)²]</code>
            </p>
            <p className="text-xs">
              Tahmin hatalarının karelerini aldığı için <strong className="text-slate-900 dark:text-white">büyük klinik hataları (outlier predictions)</strong> çok
              ağır şekilde cezalandırır. Bir hastanın MADRS skorunda 3 puanlık hata tolere edilebilirken, 15 puanlık hata
              tedavi kararını bütünüyle saptırır. Bu nedenle model seçimimizde RMSE birincil kıstas alınmıştır.
            </p>
          </div>

          <div className="space-y-2 p-4 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
            <span className="font-bold text-slate-900 dark:text-white block">
              2. RMSLE (Root Mean Squared Logarithmic Error)
            </span>
            <p className="text-xs">
              <code className="font-mono text-cyan-600">RMSLE = √[(1/n) Σ (log(ŷ+1) - log(y+1))²]</code>
            </p>
            <p className="text-xs">
              Özellikle aktigraf aktivite sayaçları (counts) ve MADRS skorlarındaki oransal sapmaları ölçer.
              En kritik avantajı: <strong className="text-slate-900 dark:text-white">Düşük tahmin (under-estimation) yapmayı yüksek tahminden daha fazla cezalandırır</strong>.
              Depresyon hastasına "Hafif" demek, "Şiddetli" demekten klinik açıdan çok daha risklidir!
            </p>
          </div>

        </div>
      </div>

    </div>
  );
};
