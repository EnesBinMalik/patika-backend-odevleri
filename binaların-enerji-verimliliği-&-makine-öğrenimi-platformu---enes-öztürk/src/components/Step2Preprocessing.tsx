import React from 'react';
import { TargetKey, MLPipelineConfig, detectOutliersIQR, detectOutliersZScore } from '../utils/mlEngine';
import { ENERGY_DATASET } from '../data/energyDataset';
import { Sliders, Filter, ArrowUpDown, Sparkles, AlertTriangle, Layers } from 'lucide-react';

interface Step2PreprocessingProps {
  config: MLPipelineConfig;
  setConfig: React.Dispatch<React.SetStateAction<MLPipelineConfig>>;
}

export const Step2Preprocessing: React.FC<Step2PreprocessingProps> = ({ config, setConfig }) => {
  // Outlier detection calculation
  const iqrResults = detectOutliersIQR(ENERGY_DATASET, config.target);
  const zscoreResults = detectOutliersZScore(ENERGY_DATASET, config.target, 2.5);

  // Correlation matrix calculation with Heating and Cooling load
  const correlations = [
    { feature: 'X1: Göreceli Kompaktlık', heating: 0.622, cooling: 0.634, desc: 'Pozitif yüksek korelasyon. Kompakt binalarda kat yüksekliği genelde 7m.' },
    { feature: 'X2: Yüzey Alanı (m²)', heating: -0.658, cooling: -0.673, desc: 'Negatif korelasyon. Büyük yüzey alanı olan binalar genellikle tek katlı (3.5m).' },
    { feature: 'X3: Duvar Alanı (m²)', heating: 0.456, cooling: 0.427, desc: 'Düşey dış kabuk ısı transferi.' },
    { feature: 'X4: Çatı Alanı (m²)', heating: -0.862, cooling: -0.863, desc: 'Çok güçlü negatif korelasyon (tek katlı geniş çatı vs 2 katlı kompakt çatı).' },
    { feature: 'X5: Bina Yüksekliği (m)', heating: 0.889, cooling: 0.896, desc: 'En belirleyici özellik! 7m iki katlı binaların yükü tek katlılara göre 2-3 kat fazla.' },
    { feature: 'X6: Yönelim (K/D/G/B)', heating: -0.003, cooling: 0.014, desc: 'Düşük doğrusal korelasyon; yön etkisi simetrik dağıldığından doğrusal olmayan etkiye sahip.' },
    { feature: 'X7: Cam Alanı Oranı', heating: 0.270, cooling: 0.208, desc: 'Güneş ışınımı ve pencere ısı kaybı/kazancı.' },
    { feature: 'X8: Cam Dağılımı', heating: 0.087, cooling: 0.051, desc: 'Pencerelerin cephelere göre dağılım dengesi.' }
  ];

  return (
    <div className="space-y-8">
      {/* Header card */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
        <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800">
          <span>ADIM 2</span>
          <span aria-hidden="true">·</span>
          <span>Veri Ön İşleme & Aykırı Değer (Outlier) Mühendisliği</span>
        </div>
        <h2 className="text-xl font-bold text-slate-900 mt-1">
          Kategorik Değişkenler, Ölçekleme ve Aykırı Değer Temizliği
        </h2>
        <p className="text-sm text-slate-500 mt-1 max-w-3xl">
          Modellerin genelleme yeteneğini artırmak için aykırı simülasyon uç noktaları filtrelenir, sayısal özellikler normalize edilir ve kategorik değişkenler One-Hot Encoding ile vektörel uzaya dönüştürülür.
        </p>

        {/* Target selector toggle */}
        <div className="mt-6 flex flex-wrap items-center gap-4 p-4 rounded-lg bg-slate-50 border border-slate-200">
          <span className="text-xs font-bold text-slate-700">İncelenen Hedef Değişken:</span>
          <div className="inline-flex rounded-lg p-1 bg-white border border-slate-200 shadow-2xs">
            <button
              onClick={() => setConfig(prev => ({ ...prev, target: 'heatingLoad' }))}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                config.target === 'heatingLoad'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Isıtma Yükü - Y1 (Heating Load)
            </button>
            <button
              onClick={() => setConfig(prev => ({ ...prev, target: 'coolingLoad' }))}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                config.target === 'coolingLoad'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Soğutma Yükü - Y2 (Cooling Load)
            </button>
          </div>
        </div>
      </div>

      {/* Grid of 3 controls: Outlier, Scaler, Encoding */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Control 1: Outlier Detection */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase text-slate-500">1. Aykırı Değer (Outlier) Filtresi</span>
              <AlertTriangle className="w-4 h-4 text-amber-500" />
            </div>
            <h4 className="text-base font-bold text-slate-900 mt-1">Uç Değer Temizleme</h4>
            <p className="text-xs text-slate-500 mt-1">
              Verideki simülasyon anomalilerini temizlemek için yöntem seçin:
            </p>

            <div className="space-y-2 mt-4">
              <label className="flex items-center gap-2 p-2.5 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer text-xs">
                <input
                  type="radio"
                  name="outlierMethod"
                  checked={config.outlierMethod === 'none'}
                  onChange={() => setConfig(prev => ({ ...prev, outlierMethod: 'none' }))}
                  className="text-emerald-600 focus:ring-emerald-500"
                />
                <div>
                  <div className="font-semibold text-slate-800">Ham Veri (Tüm 768 Gözlem)</div>
                  <div className="text-[11px] text-slate-400">Hiçbir aykırı değer filtrelenmez</div>
                </div>
              </label>

              <label className="flex items-center gap-2 p-2.5 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer text-xs">
                <input
                  type="radio"
                  name="outlierMethod"
                  checked={config.outlierMethod === 'iqr'}
                  onChange={() => setConfig(prev => ({ ...prev, outlierMethod: 'iqr' }))}
                  className="text-emerald-600 focus:ring-emerald-500"
                />
                <div>
                  <div className="font-semibold text-slate-800">IQR Yöntemi (Q1 - 1.5*IQR)</div>
                  <div className="text-[11px] text-emerald-700 font-medium">
                    {iqrResults.outlierCount} aykırı nokta tespit edildi
                  </div>
                </div>
              </label>

              <label className="flex items-center gap-2 p-2.5 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer text-xs">
                <input
                  type="radio"
                  name="outlierMethod"
                  checked={config.outlierMethod === 'zscore'}
                  onChange={() => setConfig(prev => ({ ...prev, outlierMethod: 'zscore' }))}
                  className="text-emerald-600 focus:ring-emerald-500"
                />
                <div>
                  <div className="font-semibold text-slate-800">Z-Score (|z| &gt; 2.5)</div>
                  <div className="text-[11px] text-indigo-700 font-medium">
                    {zscoreResults.outlierCount} anomali tespit edildi
                  </div>
                </div>
              </label>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-500">
            Aktif Veri Sayısı: <span className="font-mono font-bold text-slate-900">
              {config.outlierMethod === 'iqr' ? iqrResults.cleaned.length : config.outlierMethod === 'zscore' ? zscoreResults.cleaned.length : 768}
            </span> / 768
          </div>
        </div>

        {/* Control 2: Scaler */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase text-slate-500">2. Özellik Ölçekleme (Scaler)</span>
              <ArrowUpDown className="w-4 h-4 text-emerald-600" />
            </div>
            <h4 className="text-base font-bold text-slate-900 mt-1">Normalizasyon / Standardizasyon</h4>
            <p className="text-xs text-slate-500 mt-1">
              Farklı birimlerdeki yüzey (800 m²) ve kompaktlık (0.6) özelliklerini dengeler:
            </p>

            <div className="space-y-2 mt-4">
              <label className="flex items-center gap-2 p-2.5 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer text-xs">
                <input
                  type="radio"
                  name="scaler"
                  checked={config.scaler === 'standard'}
                  onChange={() => setConfig(prev => ({ ...prev, scaler: 'standard' }))}
                  className="text-emerald-600 focus:ring-emerald-500"
                />
                <div>
                  <div className="font-semibold text-slate-800">StandardScaler (Z-Score)</div>
                  <div className="text-[11px] text-slate-400">Ortalama = 0, Std = 1 (Önerilen)</div>
                </div>
              </label>

              <label className="flex items-center gap-2 p-2.5 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer text-xs">
                <input
                  type="radio"
                  name="scaler"
                  checked={config.scaler === 'minmax'}
                  onChange={() => setConfig(prev => ({ ...prev, scaler: 'minmax' }))}
                  className="text-emerald-600 focus:ring-emerald-500"
                />
                <div>
                  <div className="font-semibold text-slate-800">MinMaxScaler [0, 1]</div>
                  <div className="text-[11px] text-slate-400">Tüm değerler 0 ile 1 arasına sıkıştırılır</div>
                </div>
              </label>

              <label className="flex items-center gap-2 p-2.5 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer text-xs">
                <input
                  type="radio"
                  name="scaler"
                  checked={config.scaler === 'none'}
                  onChange={() => setConfig(prev => ({ ...prev, scaler: 'none' }))}
                  className="text-emerald-600 focus:ring-emerald-500"
                />
                <div>
                  <div className="font-semibold text-slate-800">Ölçekleme Yok (Raw Scale)</div>
                  <div className="text-[11px] text-slate-400">Ağaç tabanlı modeller için uygun</div>
                </div>
              </label>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-500">
            Dönüşüm: <span className="font-semibold text-slate-900">
              {config.scaler === 'standard' ? 'z = (x - μ) / σ' : config.scaler === 'minmax' ? 'x_norm = (x - min) / (max - min)' : 'x = x'}
            </span>
          </div>
        </div>

        {/* Control 3: Categorical Encoding */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase text-slate-500">3. Kategorik Kodlama</span>
              <Layers className="w-4 h-4 text-indigo-600" />
            </div>
            <h4 className="text-base font-bold text-slate-900 mt-1">One-Hot Encoding</h4>
            <p className="text-xs text-slate-500 mt-1">
              X6 Yönelim (K, D, G, B) ve X8 Cam Dağılımı kategorik değişkenlerinin işlenmesi:
            </p>

            <div className="mt-4 p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-700">One-Hot Dummy Değişkenler:</span>
                <button
                  onClick={() => setConfig(prev => ({ ...prev, includeCategoricalEncoding: !prev.includeCategoricalEncoding }))}
                  className={`px-3 py-1 text-xs font-bold rounded cursor-pointer transition-colors ${
                    config.includeCategoricalEncoding
                      ? 'bg-emerald-700 text-white'
                      : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {config.includeCategoricalEncoding ? 'Aktif (16 Özellik)' : 'Kapalı (8 Özellik)'}
                </button>
              </div>
              <p className="text-[11px] text-slate-500">
                Açık olduğunda X6 için 4 dummy sütun (Kuzey, Doğu, Güney, Batı) ve X8 için 6 dummy sütun eklenir. Yapay sıralama hatasını önler.
              </p>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-500">
            Model Giriş Boyutu: <span className="font-mono font-bold text-slate-900">{config.includeCategoricalEncoding ? '16 Sütun' : '8 Sütun'}</span>
          </div>
        </div>
      </div>

      {/* Correlation Matrix with Heating & Cooling Load */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Özellik Korelasyon Matrisi & Isıl İlişki Analizi</h3>
            <p className="text-xs text-slate-500">Pearson korelasyon katsayısı (r) ve yükler üzerindeki fiziksel etkisi</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 uppercase font-semibold">
              <tr>
                <th className="py-3 px-4">Özellik</th>
                <th className="py-3 px-4 text-center">Isıtma Yükü (r)</th>
                <th className="py-3 px-4 text-center">Soğutma Yükü (r)</th>
                <th className="py-3 px-4">Görsel Bar</th>
                <th className="py-3 px-4">Fiziksel & Mühendislik Anlamı</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {correlations.map((c, i) => (
                <tr key={i} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-4 font-semibold text-slate-800">{c.feature}</td>
                  <td className="py-3 px-4 text-center font-mono font-bold tabular-nums">
                    <span className={c.heating > 0 ? 'text-amber-700' : 'text-blue-700'}>
                      {c.heating > 0 ? `+${c.heating}` : c.heating}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center font-mono font-bold tabular-nums">
                    <span className={c.cooling > 0 ? 'text-indigo-700' : 'text-blue-700'}>
                      {c.cooling > 0 ? `+${c.cooling}` : c.cooling}
                    </span>
                  </td>
                  <td className="py-3 px-4 w-44">
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden flex">
                      <div
                        className={`h-full ${c.heating >= 0 ? 'bg-amber-500' : 'bg-blue-500'}`}
                        style={{ width: `${Math.abs(c.heating) * 100}%` }}
                      />
                    </div>
                  </td>
                  <td className="py-3 px-4 text-slate-600 text-[11px] leading-relaxed">
                    {c.desc}
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
