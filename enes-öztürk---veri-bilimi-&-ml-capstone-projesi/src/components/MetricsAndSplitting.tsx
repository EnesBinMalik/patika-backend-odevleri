/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  CheckCircle2,
  HelpCircle,
  ShieldCheck,
  Split,
  Percent,
  Layers,
  Sparkles,
  Info,
  Scale,
} from 'lucide-react';
import { ErrorMetric, SplitConfig, DatasetPreset } from '../types/dataset';
import { SplitResult } from '../utils/mlEngine';

interface MetricsAndSplittingProps {
  currentPreset: DatasetPreset;
  selectedMetric: ErrorMetric;
  onSelectMetric: (metric: ErrorMetric) => void;
  splitConfig: SplitConfig;
  onChangeSplitConfig: (config: SplitConfig) => void;
  splitResult: SplitResult;
  onProceedToTraining: () => void;
}

export const MetricsAndSplitting: React.FC<MetricsAndSplittingProps> = ({
  currentPreset,
  selectedMetric,
  onSelectMetric,
  splitConfig,
  onChangeSplitConfig,
  splitResult,
  onProceedToTraining,
}) => {
  const { stats } = splitResult;

  const metricsData: {
    id: ErrorMetric;
    name: string;
    formula: string;
    desc: string;
    whyUse: string;
    isRecommended?: boolean;
  }[] = [
    {
      id: 'RMSLE',
      name: 'Root Mean Squared Logarithmic Error (RMSLE)',
      formula: 'RMSLE = √[ (1/N) Σ (ln(yᵢ + 1) - ln(ŷᵢ + 1))² ]',
      desc: 'Hedef ve tahmin değerlerinin logaritmik farklarının karesinin karekökü.',
      whyUse:
        'Gayrimenkul ve otomotiv gibi geniş fiyat yelpazeli problemlerde yüzdesel bağıl hatayı optimize eder. 2 milyonluk dairedeki 200 bin TL hata ile 20 milyonluk villadaki 200 bin TL hatayı eşit tutmaz; ölçekten bağımsız adil ceza verir.',
      isRecommended: true,
    },
    {
      id: 'RMSE',
      name: 'Root Mean Squared Error (RMSE)',
      formula: 'RMSE = √[ (1/N) Σ (yᵢ - ŷᵢ)² ]',
      desc: 'Gerçek ile tahmin arasındaki farkların karelerinin ortalamasının karekökü.',
      whyUse:
        'Büyük hataları kareleri nedeniyle orantısız biçimde ağır cezalandırır. Uç hatalara karşı son derece hassastır ancak lüks konutların loss fonksiyonunu domine etmesine yol açabilir.',
    },
    {
      id: 'MAE',
      name: 'Mean Absolute Error (MAE)',
      formula: 'MAE = (1/N) Σ |yᵢ - ŷᵢ|',
      desc: 'Tahmin hatalarının mutlak değerlerinin aritmetik ortalaması.',
      whyUse:
        'Aykırı değerlere karşı en dirençli (robust) metriklerden biridir. Doğrudan TL cinsinden ortalama ne kadar saptığınızı söyler (Örn: Ortalama ±145.000 TL hata).',
    },
    {
      id: 'MAPE',
      name: 'Mean Absolute Percentage Error (MAPE)',
      formula: 'MAPE = (100% / N) Σ |(yᵢ - ŷᵢ) / yᵢ|',
      desc: 'Hatanın gerçek değere oranının ortalama yüzdesel karşılığı.',
      whyUse:
        'İş birimlerine ve yönetici sunumlarına en kolay anlatılan metrik: "Modelimiz fiyatları ortalama %6.4 hata payı ile tahmin ediyor".',
    },
    {
      id: 'R2',
      name: 'R-Squared / Belirleme Katsayısı (R²)',
      formula: 'R² = 1 - [ Σ(yᵢ - ŷᵢ)² / Σ(yᵢ - ȳ)² ]',
      desc: 'Hedef değişkendeki varyansın bağımsız değişkenler tarafından açıklanma oranı (0 ile 1 arası).',
      whyUse:
        '1.0 mükemmel tahmini, 0 ise basit ortalamayı temsil eder. Modelin genel açıklayıcılık gücünü doğrulamak için idealdir.',
    },
  ];

  const handleTrainSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const trainRatio = Number(e.target.value);
    const remaining = 1 - trainRatio;
    const valRatio = Number((remaining / 2).toFixed(2));
    const testRatio = Number((remaining - valRatio).toFixed(2));
    onChangeSplitConfig({
      ...splitConfig,
      trainRatio,
      valRatio,
      testRatio,
    });
  };

  return (
    <div className="space-y-6">
      {/* Step Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-indigo-400 uppercase tracking-wider mb-1">
            <span>Adım 3 & 4 / 5</span>
            <span aria-hidden="true">·</span>
            <span>Metrik Tayini & Veri Kümesi Bölümleme</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Hata Metriği (Error Metric) Kararı ve Gerçek Hayatı Yansıtan Split
          </h1>
          <p className="text-sm text-slate-400 mt-1 max-w-3xl">
            Regresyon problemimize en uygun değerlendirme metriğini (RMSLE vs RMSE) belirliyor, veri sızıntısını (data leakage) engelleyerek Train, Validation ve Test kümelerini oluşturuyoruz.
          </p>
        </div>
      </div>

      {/* SECTION 1: Error Metric Decision */}
      <div className="p-6 bg-slate-900/60 border border-slate-800 rounded-xl space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-base font-bold text-white">
            <Scale className="w-5 h-5 text-indigo-400" />
            <span>Problem İçin Error Metriğine Karar Vermek</span>
          </div>
          <span className="text-xs text-indigo-400">
            Önerilen Metrik: <strong className="font-mono">{currentPreset.recommendedMetric}</strong>
          </span>
        </div>

        {/* Deep Explanation Callout */}
        <div className="p-4 bg-indigo-950/30 border border-indigo-500/30 rounded-xl space-y-2">
          <div className="text-xs font-semibold text-indigo-300 flex items-center gap-2">
            <Info className="w-4 h-4 text-indigo-400 shrink-0" />
            <span>Derste Gördüğümüz RMSE vs RMSLE Arasındaki Kritik Fark:</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            {currentPreset.metricRationale}
          </p>
        </div>

        {/* Metric Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {metricsData.map(metric => {
            const isSelected = selectedMetric === metric.id;
            return (
              <div
                key={metric.id}
                onClick={() => onSelectMetric(metric.id)}
                className={`p-4 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                  isSelected
                    ? 'bg-indigo-950/40 border-indigo-500 ring-1 ring-indigo-500/50 shadow-sm'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900/60'
                }`}
              >
                <div className="space-y-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-sm font-bold text-white">{metric.name}</span>
                    {metric.isRecommended && (
                      <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-900/60 text-indigo-300 font-semibold uppercase tracking-wider shrink-0">
                        Önerilen
                      </span>
                    )}
                  </div>

                  <div className="p-2 bg-slate-900 rounded font-mono text-[11px] text-indigo-300 overflow-x-auto whitespace-nowrap">
                    {metric.formula}
                  </div>

                  <p className="text-xs text-slate-400 leading-relaxed">{metric.whyUse}</p>
                </div>

                <div className="pt-3 mt-3 border-t border-slate-800/80 flex items-center justify-between">
                  <span className="text-xs text-slate-400">
                    {isSelected ? '✓ Aktif Şampiyon Metriği' : 'Seçmek İçin Tıkla'}
                  </span>
                  <div
                    className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                      isSelected
                        ? 'border-indigo-500 bg-indigo-600'
                        : 'border-slate-700 bg-transparent'
                    }`}
                  >
                    {isSelected && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* SECTION 2: Train - Validation - Test Splitting */}
      <div className="p-6 bg-slate-900/60 border border-slate-800 rounded-xl space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-base font-bold text-white">
            <Split className="w-5 h-5 text-indigo-400" />
            <span>Train - Validation - Test Bölümleme Stratejisi</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-950/30 border border-emerald-800/30 px-2.5 py-1 rounded-md">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Sıfır Veri Sızıntısı (Zero Data Leakage)</span>
          </div>
        </div>

        <p className="text-xs text-slate-400 max-w-4xl">
          Validation ve Test kümeleri eğitilen modelin daha önce hiç karşılaşmadığı gerçek hayat senaryolarını temsil eder. İstatistiksel sızıntıyı önlemek amacıyla tüm ölçekleme (scaling) ve imputer parametreleri <strong>yalnızca Train kümesinde</strong> hesaplanır; Validation ve Test'e ise sadece dönüştürme uygulanır.
        </p>

        {/* Split Visualizer Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-300">
            <span>Veri Kümesi Ayrım Oranı</span>
            <span className="font-mono font-bold text-indigo-300">
              %{Math.round(splitConfig.trainRatio * 100)} Train / %{Math.round(splitConfig.valRatio * 100)} Val / %{Math.round(splitConfig.testRatio * 100)} Test
            </span>
          </div>

          <div className="w-full h-8 rounded-lg overflow-hidden flex font-mono text-xs font-semibold text-white">
            <div
              style={{ width: `${splitConfig.trainRatio * 100}%` }}
              className="bg-indigo-600 flex items-center justify-center transition-all px-2 truncate"
              title="Train Kümesi: Model katsayılarını eğitir"
            >
              Train ({stats.trainCount} gözlem)
            </div>
            <div
              style={{ width: `${splitConfig.valRatio * 100}%` }}
              className="bg-purple-600 flex items-center justify-center transition-all px-2 truncate"
              title="Validation Kümesi: Hiperparametre ve model seçimi"
            >
              Val ({stats.valCount} gözlem)
            </div>
            <div
              style={{ width: `${splitConfig.testRatio * 100}%` }}
              className="bg-emerald-600 flex items-center justify-center transition-all px-2 truncate"
              title="Test Kümesi: Bağımsız nihai değerlendirme"
            >
              Test ({stats.testCount} gözlem)
            </div>
          </div>

          <div className="pt-2">
            <input
              type="range"
              min="0.60"
              max="0.80"
              step="0.05"
              value={splitConfig.trainRatio}
              onChange={handleTrainSliderChange}
              className="w-full accent-indigo-500 cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-slate-400">
              <span>%60 Train (Daha geniş test)</span>
              <span>%70 Train (Standart Altın Oran)</span>
              <span>%80 Train (Büyük eğitim seti)</span>
            </div>
          </div>
        </div>

        {/* Distribution Overlap Verification Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl space-y-2">
            <div className="flex items-center justify-between text-xs text-indigo-300">
              <span className="font-semibold">Eğitim Kümesi (Train)</span>
              <span className="font-mono">{stats.trainCount} Satır</span>
            </div>
            <div className="text-xl font-bold font-mono text-white tabular-nums">
              {stats.trainTargetMean.toLocaleString('tr-TR')} {currentPreset.targetUnit}
            </div>
            <div className="text-[11px] text-slate-400">Hedef Değişken Ortalaması</div>
          </div>

          <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl space-y-2">
            <div className="flex items-center justify-between text-xs text-purple-300">
              <span className="font-semibold">Doğrulama Kümesi (Validation)</span>
              <span className="font-mono">{stats.valCount} Satır</span>
            </div>
            <div className="text-xl font-bold font-mono text-white tabular-nums">
              {stats.valTargetMean.toLocaleString('tr-TR')} {currentPreset.targetUnit}
            </div>
            <div className="text-[11px] text-slate-400">Hedef Değişken Ortalaması</div>
          </div>

          <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl space-y-2">
            <div className="flex items-center justify-between text-xs text-emerald-300">
              <span className="font-semibold">Test Kümesi (Out-of-Sample)</span>
              <span className="font-mono">{stats.testCount} Satır</span>
            </div>
            <div className="text-xl font-bold font-mono text-white tabular-nums">
              {stats.testTargetMean.toLocaleString('tr-TR')} {currentPreset.targetUnit}
            </div>
            <div className="text-[11px] text-slate-400">Hedef Değişken Ortalaması</div>
          </div>
        </div>

        {/* Verification Certificate */}
        <div className="p-3 bg-slate-950/90 border border-slate-800 rounded-lg flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-slate-300">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>
              Kümeler arası dağılım tutarlılık skoru:{' '}
              <strong className="font-mono text-emerald-400">
                %{stats.distributionSimilarityScore} (Yüksek Temsil Yeteneği)
              </strong>
            </span>
          </div>
          <div className="text-slate-400 hidden sm:block">
            5-Fold Cross Validation uyumlu
          </div>
        </div>
      </div>

      {/* Action Next Step */}
      <div className="flex items-center justify-between p-4 bg-indigo-950/20 border border-indigo-500/30 rounded-xl">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-semibold text-indigo-300">3 & 4. Adım Tamamlandı: Metrik ve Kümeler Hazır</div>
            <div className="text-xs text-slate-400">
              Seçilen Metrik: <strong className="font-mono text-white">{selectedMetric}</strong>. Şimdi olabildiğince fazla model (10 farklı algoritma) yarıştırılacak!
            </div>
          </div>
        </div>

        <button
          onClick={onProceedToTraining}
          className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors cursor-pointer shrink-0 shadow-sm shadow-indigo-600/20"
        >
          4. Adıma Geç (10 Modeli Eğit & Yarıştır) →
        </button>
      </div>
    </div>
  );
};
