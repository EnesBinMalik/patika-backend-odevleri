/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  Sliders,
  Filter,
  Sparkles,
  Zap,
  CheckCircle2,
  AlertTriangle,
  Layers,
  HelpCircle,
  TrendingDown,
  Activity,
} from 'lucide-react';
import {
  PreprocessingConfig,
  OutlierMethod,
  MissingImputationMethod,
  CategoricalEncodingMethod,
  TargetTransformation,
  DataRow,
  DatasetPreset,
} from '../types/dataset';
import { PreprocessedDataResult } from '../utils/mlEngine';

interface PreprocessingLabProps {
  currentPreset: DatasetPreset;
  config: PreprocessingConfig;
  onChangeConfig: (newConfig: PreprocessingConfig) => void;
  preprocessingResult: PreprocessedDataResult;
  onProceedToMetrics: () => void;
}

export const PreprocessingLab: React.FC<PreprocessingLabProps> = ({
  currentPreset,
  config,
  onChangeConfig,
  preprocessingResult,
  onProceedToMetrics,
}) => {
  const { outlierSummary, missingSummary, featuresCreated } = preprocessingResult;

  const updateConfig = (partial: Partial<PreprocessingConfig>) => {
    onChangeConfig({ ...config, ...partial });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-indigo-400 uppercase tracking-wider mb-1">
            <span>Adım 2 / 5</span>
            <span aria-hidden="true">·</span>
            <span>Veri Temizleme & Özellik Mühendisliği</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Eksik Değer, Kategorik Değişken ve Aykırı Değer (Outlier) Laboratuvarı
          </h1>
          <p className="text-sm text-slate-400 mt-1 max-w-3xl">
            Derste gördüklerimizin üzerine çıkarak: Tukey IQR ve Winsorization ile aykırı değerleri kontrol altına alıyor, gruplanmış medyan ile eksik verileri tamamlıyor ve akıllı özellik türetimi (feature engineering) gerçekleştiriyoruz.
          </p>
        </div>
      </div>

      {/* Grid of Preprocessing Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Panel 1: Outlier Handling */}
        <div className="p-5 bg-slate-900/60 border border-slate-800 rounded-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-semibold text-white">
              <Filter className="w-4 h-4 text-amber-400" />
              <span>Aykırı Değer (Outlier) Stratejisi</span>
            </div>
            <span className="text-[11px] px-2 py-0.5 rounded bg-amber-950/40 text-amber-300 border border-amber-800/40">
              Derste Öğrenilenin Ötesinde
            </span>
          </div>

          <p className="text-xs text-slate-400">
            Fiyat verilerindeki ekstrem değerlerin katsayıları saptırmasını önlemek için istatistiksel sınır tespiti.
          </p>

          <div className="space-y-2">
            {[
              {
                id: 'iqr',
                title: "Tukey's IQR Fences (Çeyrekler Açıklığı)",
                desc: 'Q1 - 1.5×IQR ve Q3 + 1.5×IQR sınırları dışındakileri baskılar.',
              },
              {
                id: 'winsorize',
                title: 'Winsorization (%2 - %98 Persentil)',
                desc: 'En uçtaki %2 üst ve alt dilimleri sınırlara klamp eder.',
              },
              {
                id: 'zscore',
                title: 'Z-Score Yöntemi (|z| > 3.0σ)',
                desc: 'Ortalamadan 3 standart sapma uzaktaki gözlemleri yakalar.',
              },
              {
                id: 'none',
                title: 'Müdahale Etme (Ham Bırak)',
                desc: 'Tüm aykırı değerleri modele ham olarak besler.',
              },
            ].map(opt => (
              <label
                key={opt.id}
                onClick={() => updateConfig({ outlierMethod: opt.id as OutlierMethod })}
                className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                  config.outlierMethod === opt.id
                    ? 'bg-amber-950/20 border-amber-500/50 text-white'
                    : 'bg-slate-950/40 border-slate-800 text-slate-300 hover:bg-slate-800/40'
                }`}
              >
                <input
                  type="radio"
                  name="outlier"
                  checked={config.outlierMethod === opt.id}
                  onChange={() => {}}
                  className="mt-1 text-amber-500 focus:ring-0"
                />
                <div className="text-xs">
                  <div className="font-semibold text-slate-200">{opt.title}</div>
                  <div className="text-slate-400 mt-0.5">{opt.desc}</div>
                </div>
              </label>
            ))}
          </div>

          {config.outlierMethod === 'iqr' && (
            <div className="pt-2 border-t border-slate-800 space-y-1.5">
              <div className="flex items-center justify-between text-xs text-slate-300">
                <span>IQR Çarpanı (Eşik Katı):</span>
                <span className="font-mono text-amber-400 font-semibold">{config.outlierThreshold}x IQR</span>
              </div>
              <input
                type="range"
                min="1.0"
                max="3.0"
                step="0.5"
                value={config.outlierThreshold}
                onChange={e => updateConfig({ outlierThreshold: Number(e.target.value) })}
                className="w-full accent-amber-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>1.0x (Sıkı)</span>
                <span>1.5x (Standart)</span>
                <span>3.0x (Geniş)</span>
              </div>
            </div>
          )}

          {/* Outlier Impact Result Box */}
          <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-lg text-xs space-y-1">
            <div className="flex items-center justify-between text-slate-300">
              <span>Tespit Edilen Aykırı Sayısı:</span>
              <span className="font-mono font-bold text-amber-400 tabular-nums">
                {outlierSummary.identifiedCount} adet
              </span>
            </div>
            <div className="flex items-center justify-between text-slate-300">
              <span>Uygulanan Eşik Aralığı:</span>
              <span className="font-mono text-slate-300 text-[11px] truncate max-w-[180px]">
                {outlierSummary.thresholdApplied}
              </span>
            </div>
          </div>
        </div>

        {/* Panel 2: Missing Value Imputation */}
        <div className="p-5 bg-slate-900/60 border border-slate-800 rounded-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-semibold text-white">
              <Sliders className="w-4 h-4 text-indigo-400" />
              <span>Eksik Değer Tamamlama (Imputation)</span>
            </div>
          </div>

          <p className="text-xs text-slate-400">
            Boş hücrelerin (null) modele girmeden önce bilgi kaybı yaratmayacak biçimde doldurulması.
          </p>

          <div className="space-y-2">
            {[
              {
                id: 'grouped_median',
                title: 'Gruplanmış Medyan (İlçe/Kategori Bazlı)',
                desc: 'Eksik aidat ve metro mesafesini o ilçenin kendi medyanı ile doldurur.',
                badge: 'Gelişmiş',
              },
              {
                id: 'median',
                title: 'Genel Sütun Medyanı (Median)',
                desc: 'Aykırı değerlerin etkisinden korunaklı sağlam merkez değeri.',
              },
              {
                id: 'mean',
                title: 'Genel Sütun Ortalaması (Mean)',
                desc: 'Klasik aritmetik ortalama ile tamamlama.',
              },
            ].map(opt => (
              <label
                key={opt.id}
                onClick={() => updateConfig({ missingMethod: opt.id as MissingImputationMethod })}
                className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                  config.missingMethod === opt.id
                    ? 'bg-indigo-950/20 border-indigo-500/50 text-white'
                    : 'bg-slate-950/40 border-slate-800 text-slate-300 hover:bg-slate-800/40'
                }`}
              >
                <input
                  type="radio"
                  name="missing"
                  checked={config.missingMethod === opt.id}
                  onChange={() => {}}
                  className="mt-1 text-indigo-500 focus:ring-0"
                />
                <div className="text-xs flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-200">{opt.title}</span>
                    {opt.badge && (
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-indigo-900/50 text-indigo-300">
                        {opt.badge}
                      </span>
                    )}
                  </div>
                  <div className="text-slate-400 mt-0.5">{opt.desc}</div>
                </div>
              </label>
            ))}
          </div>

          {/* Missing stats box */}
          <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-lg text-xs space-y-1">
            <div className="flex items-center justify-between text-slate-300">
              <span>Doldurulan Hücre Sayısı:</span>
              <span className="font-mono font-bold text-indigo-400 tabular-nums">
                {missingSummary.imputedValuesCount} değer
              </span>
            </div>
            <div className="flex items-center justify-between text-slate-300">
              <span>İşlem Gören Sütunlar:</span>
              <span className="font-mono text-slate-300 text-[11px]">
                {missingSummary.imputedColumns.join(', ') || 'Yok'}
              </span>
            </div>
            <div className="text-[11px] text-slate-400 pt-1">
              *Modelin haberdar olması için otomatik <code className="text-indigo-300 font-mono">_is_imputed</code> gösterge bayrağı eklendi.
            </div>
          </div>
        </div>

        {/* Panel 3: Categorical & Feature Engineering */}
        <div className="p-5 bg-slate-900/60 border border-slate-800 rounded-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-semibold text-white">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span>Kategorik Kodlama & Özellik Türetimi</span>
            </div>
          </div>

          <p className="text-xs text-slate-400">
            Metinsel değişkenlerin matrise dönüştürülmesi ve ek öznitelikler üretilmesi.
          </p>

          <div className="space-y-3">
            <div>
              <div className="text-xs font-semibold text-slate-300 mb-1.5">Kategorik Kodlayıcı:</div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => updateConfig({ categoricalEncoding: 'one_hot' })}
                  className={`p-2 rounded-lg text-xs font-medium border text-left transition-colors cursor-pointer ${
                    config.categoricalEncoding === 'one_hot'
                      ? 'bg-emerald-950/30 border-emerald-500/50 text-emerald-300'
                      : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:bg-slate-800/40'
                  }`}
                >
                  <div className="font-semibold">One-Hot Encoding</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Kukla değişkenler (Dummy)</div>
                </button>
                <button
                  onClick={() => updateConfig({ categoricalEncoding: 'target_encoding' })}
                  className={`p-2 rounded-lg text-xs font-medium border text-left transition-colors cursor-pointer ${
                    config.categoricalEncoding === 'target_encoding'
                      ? 'bg-emerald-950/30 border-emerald-500/50 text-emerald-300'
                      : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:bg-slate-800/40'
                  }`}
                >
                  <div className="font-semibold">Target Encoding</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Smoothing hedef ortalaması</div>
                </button>
              </div>
            </div>

            {/* Feature engineering toggle */}
            <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-lg space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold text-slate-200">
                    Gelişmiş Özellik Türetimi (Feature Eng.)
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Oda başına m², lüks skoru, yaş katsayısı
                  </div>
                </div>
                <button
                  onClick={() =>
                    updateConfig({ enableFeatureEngineering: !config.enableFeatureEngineering })
                  }
                  className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    config.enableFeatureEngineering ? 'bg-emerald-600' : 'bg-slate-700'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      config.enableFeatureEngineering ? 'translate-x-4' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {config.enableFeatureEngineering && (
                <div className="pt-2 border-t border-slate-800/60 text-[11px] text-emerald-400 font-mono space-y-0.5">
                  <div>+ oda_basina_alan_m2 (metrekare / oda)</div>
                  <div>+ luks_skoru (deniz + yerden isıtma + metro)</div>
                  <div>+ bina_yas_katsayisi</div>
                </div>
              )}
            </div>

            {/* Target transformation */}
            <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-lg space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold text-slate-200">
                    Hedef Değişken Log1p Dönüşümü
                  </div>
                  <div className="text-[11px] text-slate-400">
                    y → ln(y+1) | RMSLE için optimize eder
                  </div>
                </div>
                <button
                  onClick={() =>
                    updateConfig({
                      targetTransformation: config.targetTransformation === 'log1p' ? 'none' : 'log1p',
                    })
                  }
                  className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    config.targetTransformation === 'log1p' ? 'bg-indigo-600' : 'bg-slate-700'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      config.targetTransformation === 'log1p' ? 'translate-x-4' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Preprocessing Pipeline Visual Flow */}
      <div className="p-5 bg-slate-900/40 border border-slate-800 rounded-xl space-y-4">
        <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
          <Activity className="w-4 h-4 text-indigo-400" />
          <span>Veri Akış Şeması (End-to-End Preprocessing Pipeline)</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
          <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-lg space-y-1">
            <span className="font-semibold text-indigo-400">1. Ham Veri Girişi</span>
            <p className="text-slate-400">
              {preprocessingResult.processedRows.length} satır, eksik hücreler ve ham kategorik alanlar.
            </p>
          </div>
          <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-lg space-y-1">
            <span className="font-semibold text-amber-400">2. Outlier Tedavisi</span>
            <p className="text-slate-400">
              {config.outlierMethod.toUpperCase()} ile {outlierSummary.identifiedCount} aykırı değer yakalandı ve baskılandı.
            </p>
          </div>
          <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-lg space-y-1">
            <span className="font-semibold text-blue-400">3. İmpütasyon & Kodlama</span>
            <p className="text-slate-400">
              {config.missingMethod} yöntemi ile {missingSummary.imputedValuesCount} değer tamamlandı, matris hazırlandı.
            </p>
          </div>
          <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-lg space-y-1">
            <span className="font-semibold text-emerald-400">4. Modele Hazır Veri</span>
            <p className="text-slate-400">
              {preprocessingResult.featureColumns.length} bağımsız öznitelik hazırlandı.
            </p>
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
            <div className="text-xs font-semibold text-indigo-300">2. Adım Tamamlandı: Veri Modele Beslenecek Kıvama Getirildi</div>
            <div className="text-xs text-slate-400">Sırada: Hata metriğine (RMSLE/RMSE) karar verme ve Train-Validation-Test bölme var.</div>
          </div>
        </div>

        <button
          onClick={onProceedToMetrics}
          className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors cursor-pointer shrink-0 shadow-sm shadow-indigo-600/20"
        >
          3. Adıma Geç (Metrik & Split) →
        </button>
      </div>
    </div>
  );
};
