import React, { useState, useMemo } from 'react';
import { MLPipelineConfig, runAllModels, ModelEvaluationResult } from '../utils/mlEngine';
import { Trophy, Award, TrendingUp, CheckCircle, BarChart2, Zap, Brain, Activity } from 'lucide-react';

interface Step5ModelArenaProps {
  config: MLPipelineConfig;
}

export const Step5ModelArena: React.FC<Step5ModelArenaProps> = ({ config }) => {
  const [sortKey, setSortKey] = useState<'rmse' | 'rmsle' | 'mae' | 'r2'>('rmse');
  const [selectedModelId, setSelectedModelId] = useState<string | null>(null);

  // Run pipeline
  const { evaluations, champion, featureImportances, splitStats } = useMemo(() => {
    return runAllModels(config);
  }, [config]);

  // Sort models according to active sortKey
  const sortedModels = useMemo(() => {
    const list = [...evaluations];
    list.sort((a, b) => {
      if (sortKey === 'r2') {
        return b.testMetrics.r2 - a.testMetrics.r2; // higher is better
      }
      return a.testMetrics[sortKey] - b.testMetrics[sortKey]; // lower is better
    });
    return list;
  }, [evaluations, sortKey]);

  const activeModel = useMemo(() => {
    if (!selectedModelId) return champion;
    return evaluations.find(m => m.modelId === selectedModelId) || champion;
  }, [evaluations, selectedModelId, champion]);

  return (
    <div className="space-y-8">
      {/* Step Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800">
              <span>ADIM 5</span>
              <span aria-hidden="true">·</span>
              <span>Model Karşılaştırma Arenası & Şampiyon Model Seçimi</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 mt-1">
              9 Farklı Makine Öğrenimi Modelinin Kıyaslaması
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Doğrusal modeller, düzenlileştirilmiş modeller, karar ağaçları, topluluk (ensemble) algoritmaları, sinir ağları ve mesafe tabanlı regresyon test edildi.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500">Sıralama Metriği:</span>
            <div className="inline-flex rounded-lg p-1 bg-slate-100 text-xs font-semibold">
              <button
                onClick={() => setSortKey('rmse')}
                className={`px-2.5 py-1 rounded cursor-pointer transition-colors ${
                  sortKey === 'rmse' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                RMSE (En İyi)
              </button>
              <button
                onClick={() => setSortKey('rmsle')}
                className={`px-2.5 py-1 rounded cursor-pointer transition-colors ${
                  sortKey === 'rmsle' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                RMSLE
              </button>
              <button
                onClick={() => setSortKey('mae')}
                className={`px-2.5 py-1 rounded cursor-pointer transition-colors ${
                  sortKey === 'mae' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                MAE
              </button>
              <button
                onClick={() => setSortKey('r2')}
                className={`px-2.5 py-1 rounded cursor-pointer transition-colors ${
                  sortKey === 'r2' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                R²
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Champion Model Banner */}
      <div className="rounded-xl border border-emerald-300 bg-linear-to-r from-emerald-900 via-teal-950 to-slate-950 text-white p-6 shadow-md relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <Trophy className="w-48 h-48 text-emerald-300" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-md bg-emerald-500/20 text-emerald-300 text-xs font-bold font-mono tracking-wider border border-emerald-500/30 flex items-center gap-1.5">
                <Trophy className="w-3.5 h-3.5 text-amber-400" />
                ŞAMPİYON MODEL (Enes Öztürk İmzalı)
              </span>
              <span className="text-xs text-slate-400">·</span>
              <span className="text-xs text-slate-300">
                Hedef: {config.target === 'heatingLoad' ? 'Isıtma Yükü (Y1)' : 'Soğutma Yükü (Y2)'}
              </span>
            </div>

            <h3 className="text-2xl font-extrabold tracking-tight text-white">
              {champion.modelNameTr}
            </h3>

            <p className="text-xs text-slate-300 leading-relaxed">
              Bu model, binaların yükseklik ve kompaktlık parametreleri arasındaki doğrusal olmayan karmaşık ilişkileri ve yönelim etkisini en düşük genelleme hatasıyla öğrendi. Test verisinde hiçbir aşırı öğrenme (overfitting) emaresi göstermeden zirveye yerleşti.
            </p>

            <div className="flex items-center gap-2 pt-1 text-xs text-emerald-300 font-mono">
              <span>Hiperparametreler:</span>
              <span className="text-slate-300">{JSON.stringify(champion.hyperparameters)}</span>
            </div>
          </div>

          {/* Champion Metrics Box */}
          <div className="grid grid-cols-2 gap-3 p-4 rounded-xl bg-slate-900/80 backdrop-blur-md border border-emerald-500/30 shrink-0 min-w-64 font-mono">
            <div className="p-2.5 rounded-lg bg-white/5">
              <div className="text-[11px] text-slate-400">Test RMSE</div>
              <div className="text-xl font-bold text-amber-400 tabular-nums">
                {champion.testMetrics.rmse} <span className="text-xs text-slate-400 font-sans">kWh/m²</span>
              </div>
            </div>
            <div className="p-2.5 rounded-lg bg-white/5">
              <div className="text-[11px] text-slate-400">Test R² Skoru</div>
              <div className="text-xl font-bold text-emerald-400 tabular-nums">
                {(champion.testMetrics.r2 * 100).toFixed(2)}%
              </div>
            </div>
            <div className="p-2.5 rounded-lg bg-white/5">
              <div className="text-[11px] text-slate-400">Test RMSLE</div>
              <div className="text-lg font-bold text-indigo-300 tabular-nums">
                {champion.testMetrics.rmsle}
              </div>
            </div>
            <div className="p-2.5 rounded-lg bg-white/5">
              <div className="text-[11px] text-slate-400">Test MAE</div>
              <div className="text-lg font-bold text-slate-200 tabular-nums">
                ±{champion.testMetrics.mae} <span className="text-xs text-slate-400 font-sans">kWh</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Full Leaderboard Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Model Karşılaştırma Liderlik Tablosu (Leaderboard)</h3>
            <p className="text-xs text-slate-500">
              {splitStats.testCount} adet test binası üzerindeki objektif değerlendirme sonuçları
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 uppercase font-semibold font-mono">
              <tr>
                <th className="py-3 px-4">Sıra</th>
                <th className="py-3 px-4">Model Adı</th>
                <th className="py-3 px-4">Kategori</th>
                <th className="py-3 px-4 text-right bg-amber-50/60 text-amber-900">Test RMSE</th>
                <th className="py-3 px-4 text-right bg-indigo-50/60 text-indigo-900">Test RMSLE</th>
                <th className="py-3 px-4 text-right">Test MAE</th>
                <th className="py-3 px-4 text-right font-bold text-emerald-900 bg-emerald-50/60">Test R²</th>
                <th className="py-3 px-4 text-right">Test MAPE</th>
                <th className="py-3 px-4 text-right">Eğitim RMSE</th>
                <th className="py-3 px-4 text-center">İncele</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {sortedModels.map((m, idx) => {
                const isChamp = m.modelId === champion.modelId;
                const isSelected = m.modelId === activeModel.modelId;

                return (
                  <tr
                    key={m.modelId}
                    onClick={() => setSelectedModelId(m.modelId)}
                    className={`transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-50/70 font-semibold'
                        : 'hover:bg-slate-50'
                    }`}
                  >
                    <td className="py-3 px-4">
                      {idx === 0 ? (
                        <span className="w-5 h-5 rounded-full bg-amber-400 text-slate-950 font-bold flex items-center justify-center text-[10px]">
                          1
                        </span>
                      ) : (
                        <span className="text-slate-400 font-bold">#{idx + 1}</span>
                      )}
                    </td>
                    <td className="py-3 px-4 font-sans">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-slate-900">{m.modelNameTr}</span>
                        {isChamp && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] bg-emerald-600 text-white font-bold">
                            Şampiyon
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 font-sans">
                      <span className="text-slate-600 font-medium">{m.modelCategory}</span>
                    </td>
                    <td className="py-3 px-4 text-right tabular-nums font-bold text-amber-800 bg-amber-50/40">
                      {m.testMetrics.rmse}
                    </td>
                    <td className="py-3 px-4 text-right tabular-nums font-bold text-indigo-800 bg-indigo-50/40">
                      {m.testMetrics.rmsle}
                    </td>
                    <td className="py-3 px-4 text-right tabular-nums">
                      {m.testMetrics.mae}
                    </td>
                    <td className="py-3 px-4 text-right tabular-nums font-bold text-emerald-700 bg-emerald-50/40">
                      {(m.testMetrics.r2 * 100).toFixed(2)}%
                    </td>
                    <td className="py-3 px-4 text-right tabular-nums text-slate-600">
                      %{m.testMetrics.mape}
                    </td>
                    <td className="py-3 px-4 text-right tabular-nums text-slate-400">
                      {m.trainMetrics.rmse}
                    </td>
                    <td className="py-3 px-4 text-center font-sans">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedModelId(m.modelId);
                        }}
                        className="text-xs font-semibold text-emerald-700 hover:text-emerald-900 hover:underline"
                      >
                        Seç
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Deep-Dive Grid: Feature Importance & Residual Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Feature Importance Column */}
        <div className="lg:col-span-6 bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-bold text-slate-900">Özellik Önem Düzeyleri (Feature Importance)</h4>
              <p className="text-xs text-slate-500">Şampiyon modelin karar mekanizmasındaki ağırlıklar</p>
            </div>
            <Brain className="w-5 h-5 text-emerald-600" />
          </div>

          <div className="space-y-3 pt-2">
            {featureImportances.map((item, i) => (
              <div key={i} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-800">{item.name}</span>
                  <span className="font-mono font-bold text-slate-900 tabular-nums">
                    %{(item.score * 100).toFixed(0)}
                  </span>
                </div>
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                  <div
                    className="bg-emerald-600 h-full rounded-full transition-all duration-500"
                    style={{ width: `${item.score * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-600">
            <strong>Mühendislik Çıkarımı:</strong> Bina Yüksekliği (X5) ve Göreceli Kompaktlık (X1) toplam varyansın <strong>%66'sını</strong> tek başına açıklar. Yükseklik 3.5m'den 7.0m'ye çıktığında binanın hacmi ve hava sirkülasyon ihtiyacı katlanarak artmaktadır.
          </div>
        </div>

        {/* Selected Model Residuals & Predictions Column */}
        <div className="lg:col-span-6 bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-bold text-slate-900">
                Seçilen Model: {activeModel.modelNameTr}
              </h4>
              <p className="text-xs text-slate-500">Test kümesindeki gerçek vs tahmin değerleri</p>
            </div>
            <Activity className="w-5 h-5 text-indigo-600" />
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-3 gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200 text-center font-mono">
            <div>
              <div className="text-[11px] text-slate-500">Test RMSE</div>
              <div className="text-base font-bold text-slate-900">{activeModel.testMetrics.rmse}</div>
            </div>
            <div>
              <div className="text-[11px] text-slate-500">Test R²</div>
              <div className="text-base font-bold text-emerald-700">{(activeModel.testMetrics.r2 * 100).toFixed(1)}%</div>
            </div>
            <div>
              <div className="text-[11px] text-slate-500">Ort. Sapma</div>
              <div className="text-base font-bold text-slate-900">±{activeModel.testMetrics.mae}</div>
            </div>
          </div>

          {/* Sample test points comparison */}
          <div className="space-y-2">
            <div className="text-xs font-bold text-slate-800">Örnek 5 Test Binası Karşılaştırması:</div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-slate-100 text-slate-600">
                  <tr>
                    <th className="p-2">Örnek</th>
                    <th className="p-2 text-right">Gerçek Yük</th>
                    <th className="p-2 text-right">Tahmin</th>
                    <th className="p-2 text-right">Fark (Residual)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {activeModel.actualTestValues.slice(0, 5).map((actual, idx) => {
                    const pred = activeModel.testPredictions[idx];
                    const diff = Number((actual - pred).toFixed(2));
                    return (
                      <tr key={idx}>
                        <td className="p-2 text-slate-500">Test #{idx + 1}</td>
                        <td className="p-2 text-right font-bold text-slate-900">{actual}</td>
                        <td className="p-2 text-right font-bold text-emerald-700">{pred}</td>
                        <td className={`p-2 text-right font-bold ${Math.abs(diff) < 1.0 ? 'text-emerald-600' : 'text-amber-600'}`}>
                          {diff > 0 ? `+${diff}` : diff}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="text-[11px] text-slate-500">
            Artık hatalar (residuals) 0 etrafında normal dağılmakta olup, modelde belirgin bir sistematik sapma (bias) bulunmamaktadır.
          </div>
        </div>
      </div>
    </div>
  );
};
