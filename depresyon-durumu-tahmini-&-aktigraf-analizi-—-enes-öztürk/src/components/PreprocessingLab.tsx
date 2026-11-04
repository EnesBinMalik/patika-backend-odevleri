import React, { useState, useMemo } from 'react';
import { PatientRecord, PreprocessingConfig } from '../types/depression';
import { preprocessDataset, detectOutliersIQR, detectOutliersMAD } from '../services/dataPreprocessing';
import { Sliders, AlertCircle, CheckCircle, BarChart3, RefreshCw, Layers } from 'lucide-react';

interface PreprocessingLabProps {
  rawPatients: PatientRecord[];
}

export const PreprocessingLab: React.FC<PreprocessingLabProps> = ({ rawPatients }) => {
  const [config, setConfig] = useState<PreprocessingConfig>({
    imputationStrategy: 'median',
    outlierStrategy: 'iqr_clip',
    iqrMultiplier: 1.5,
    clipPercentiles: [5, 95],
    featureScaling: 'robust',
    applyLogTransform: false,
  });

  const { processedPatients, stats } = useMemo(() => {
    return preprocessDataset(rawPatients, config);
  }, [rawPatients, config]);

  // Histogram calculation for 24h activity before and after
  const binCount = 10;
  const rawValues = rawPatients.map((p) => p.meanActivity24h);
  const procValues = processedPatients.map((p) => p.meanActivity24h);

  const minVal = Math.min(...rawValues);
  const maxVal = Math.max(...rawValues);
  const binSize = (maxVal - minVal) / binCount;

  const rawBins = Array.from({ length: binCount }, (_, i) => {
    const start = minVal + i * binSize;
    const end = start + binSize;
    const count = rawValues.filter((v) => v >= start && (i === binCount - 1 ? v <= end : v < end)).length;
    return { bin: `${Math.round(start)}-${Math.round(end)}`, count };
  });

  const procBins = Array.from({ length: binCount }, (_, i) => {
    const start = minVal + i * binSize;
    const end = start + binSize;
    const count = procValues.filter((v) => v >= start && (i === binCount - 1 ? v <= end : v < end)).length;
    return { bin: `${Math.round(start)}-${Math.round(end)}`, count };
  });

  const maxBinCount = Math.max(
    ...rawBins.map((b) => b.count),
    ...procBins.map((b) => b.count)
  );

  return (
    <div className="space-y-6">
      
      {/* Title & Description */}
      <div>
        <div className="text-xs text-slate-500 dark:text-slate-400">Adım 2 · Veri Ön İşleme & Outlier Yönetimi</div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white mt-1">
          Eksik Değerler, Kategorik Kodlama ve Aykırı Değer (Outlier) Laboratuvarı
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-3xl">
          Biyolojik aktigraf verileri el bileği sensörünün sarsılması, aşırı hareket veya yatakta bırakılması sebebiyle
          yüksek aykırı değerlere (outliers) ve sağa çarpık (skewed) dağılıma sahiptir. Aşağıdaki kontrollerle farklı
          outlier temizleme ve dönüştürme yöntemlerini canlı olarak test edin.
        </p>
      </div>

      {/* Control Station: Preprocessing Parameters */}
      <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-4">
        
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-cyan-600" />
            <span className="text-sm font-bold text-slate-900 dark:text-white">
              Ön İşleme Konfigürasyon Paneli (Enes Öztürk Pipeline)
            </span>
          </div>
          <button
            onClick={() =>
              setConfig({
                imputationStrategy: 'median',
                outlierStrategy: 'iqr_clip',
                iqrMultiplier: 1.5,
                clipPercentiles: [5, 95],
                featureScaling: 'robust',
                applyLogTransform: false,
              })
            }
            className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-900 dark:hover:text-white cursor-pointer"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Varsayılana Sıfırla</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
          
          {/* Outlier Strategy */}
          <div className="space-y-2">
            <label className="font-semibold text-slate-800 dark:text-slate-200 block">
              Aykırı Değer (Outlier) Stratejisi
            </label>
            <div className="space-y-1.5">
              {[
                { id: 'iqr_clip', label: 'IQR Kırpma (Winsorization: Q1 - 1.5*IQR)', desc: 'Tavsiye edilen robust yöntem' },
                { id: 'mad_clip', label: 'MAD Kırpma (Median Absolute Dev)', desc: 'Aşırı uç değerlere karşı en dayanıklı' },
                { id: 'log_transform', label: 'Log(1 + x) Dönüşümü', desc: 'Sağa çarpıklığı (skewness) normalize eder' },
              ].map((opt) => (
                <label
                  key={opt.id}
                  className={`flex items-start gap-2 p-2 rounded-lg border cursor-pointer transition-colors ${
                    config.outlierStrategy === opt.id
                      ? 'border-cyan-500 bg-cyan-50/50 dark:bg-cyan-950/30 text-slate-900 dark:text-white'
                      : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                  }`}
                >
                  <input
                    type="radio"
                    name="outlier_opt"
                    checked={config.outlierStrategy === opt.id}
                    onChange={() => setConfig({ ...config, outlierStrategy: opt.id as any })}
                    className="mt-0.5 text-cyan-600 focus:ring-cyan-500"
                  />
                  <div>
                    <div className="font-medium">{opt.label}</div>
                    <div className="text-[10px] text-slate-500">{opt.desc}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* IQR Multiplier Slider */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="font-semibold text-slate-800 dark:text-slate-200">
                IQR Çarpanı (Multiplier)
              </label>
              <span className="font-mono tabular-nums font-bold text-cyan-600 dark:text-cyan-400">
                {config.iqrMultiplier.toFixed(1)} × IQR
              </span>
            </div>
            <input
              type="range"
              min="1.0"
              max="3.0"
              step="0.1"
              value={config.iqrMultiplier}
              onChange={(e) => setConfig({ ...config, iqrMultiplier: parseFloat(e.target.value) })}
              className="w-full accent-cyan-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-mono">
              <span>1.0× (Katı / Agresif)</span>
              <span>1.5× (Tukey Standart)</span>
              <span>3.0× (Aşırı Uçlar)</span>
            </div>

            <div className="pt-3">
              <label className="font-semibold text-slate-800 dark:text-slate-200 block mb-1">
                Eksik Değer İmpütasyonu
              </label>
              <select
                value={config.imputationStrategy}
                onChange={(e) => setConfig({ ...config, imputationStrategy: e.target.value as any })}
                className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
              >
                <option value="median">Medyan İmpütasyonu (Outlier-Dirençli)</option>
                <option value="knn_mode">KNN En Yakın Komşu İmpütasyonu</option>
                <option value="mean">Aritmetik Ortalama İmpütasyonu</option>
              </select>
            </div>
          </div>

          {/* Skewness & Impact Result Badge */}
          <div className="space-y-2 bg-slate-50 dark:bg-slate-800/50 p-3.5 rounded-lg border border-slate-200 dark:border-slate-800">
            <span className="font-semibold text-slate-900 dark:text-white block">
              Dağılım & Çarpıklık (Skewness) İyileşmesi
            </span>
            <div className="space-y-2 pt-1 font-mono tabular-nums">
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Ham Veri Çarpıklığı:</span>
                <span className="font-bold text-rose-600 dark:text-rose-400">
                  +{stats.outlierSummary[0].skewnessBefore} (Sağa Çarpık)
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">İşlem Sonrası Çarpıklık:</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">
                  +{stats.outlierSummary[0].skewnessAfter} (Normalize)
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Tespit Edilen Uç Değerler:</span>
                <span className="font-bold text-amber-600 dark:text-amber-400">
                  {stats.outlierSummary[0].outliersDetected} Hasta Kaydı
                </span>
              </div>
            </div>
            <div className="text-[11px] text-slate-500 pt-2 border-t border-slate-200 dark:border-slate-700">
              Not: Uç değerler doğrudan veri setinden silinmeyip "Kırpma / Winsorize" yöntemiyle üst sınıra çekilmiştir;
              bu sayede değerli klinik örneklem boyutu korunmuştur.
            </div>
          </div>

        </div>

      </div>

      {/* Visual Histogram: Before vs After Outlier Treatment */}
      <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-4">
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-cyan-600" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              24 Saatlik Ortalama Motor Aktivite Dağılımı (Histogram Kıyaslaması)
            </h3>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 bg-slate-300 dark:bg-slate-700 rounded-sm" />
              <span className="text-slate-500">Ham Veri (Outlier İçeren)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 bg-cyan-600 rounded-sm" />
              <span className="text-cyan-600 font-semibold">Ön İşleme Sonrası (Kırpılmış)</span>
            </div>
          </div>
        </div>

        {/* Histogram Bars */}
        <div className="space-y-3 pt-2">
          {rawBins.map((rawBin, i) => {
            const procBin = procBins[i];
            const rawWidthPct = Math.round((rawBin.count / maxBinCount) * 100);
            const procWidthPct = Math.round((procBin.count / maxBinCount) * 100);

            return (
              <div key={rawBin.bin} className="space-y-1 text-xs">
                <div className="flex justify-between text-slate-500 font-mono text-[11px]">
                  <span>{rawBin.bin} cnt/dk</span>
                  <span>Ham: {rawBin.count} · İşlenmiş: {procBin.count}</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded overflow-hidden">
                    <div
                      className="h-full bg-slate-400 dark:bg-slate-600 transition-all duration-300"
                      style={{ width: `${rawWidthPct}%` }}
                    />
                  </div>
                  <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded overflow-hidden">
                    <div
                      className="h-full bg-cyan-600 transition-all duration-300"
                      style={{ width: `${procWidthPct}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

      </div>

      {/* Missing Values & Categorical Pipeline Audit */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Eksik Değer Yönetimi & Kategorik Değişken Dönüşümleri Raporu
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            scores.csv dosyasındaki yapısal eksikliklerin veri sızıntısı oluşturmadan doldurulması.
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 font-semibold border-b border-slate-100 dark:border-slate-800">
              <tr>
                <th className="py-2.5 px-4">Değişken Adı</th>
                <th className="py-2.5 px-4">Eksik Sayısı (NaN)</th>
                <th className="py-2.5 px-4">Eksiklik Oranı</th>
                <th className="py-2.5 px-4">Uygulanan Ön İşleme Tekniği</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
              {stats.missingValuesSummary.map((item) => (
                <tr key={item.column}>
                  <td className="py-2.5 px-4 font-mono font-medium">{item.column}</td>
                  <td className="py-2.5 px-4 font-mono tabular-nums">{item.missingCount} kayıt</td>
                  <td className="py-2.5 px-4 font-mono tabular-nums">{item.percentage}%</td>
                  <td className="py-2.5 px-4 text-emerald-600 dark:text-emerald-400 font-medium">
                    {item.imputationApplied}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
