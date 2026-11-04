import React from 'react';
import { Target, Check, AlertCircle, Compass, Scale, Calculator } from 'lucide-react';

export const Step3MetricsGuide: React.FC = () => {
  const metrics = [
    {
      code: 'RMSE',
      nameTr: 'Kök Ortalama Kare Hata (Root Mean Squared Error)',
      formula: 'RMSE = √ [ (1/N) Σ (y_i - ŷ_i)² ]',
      unit: 'kWh/m²',
      role: 'Birincil Karar Metriği (Şampiyon Seçimi)',
      highlight: true,
      reason: 'Bina iklimlendirme (HVAC) tasarımında pik yüklerdeki büyük hatalar, kazan veya soğutma grubu kapasitesinin yetersiz kalmasına ve binanın donmasına/aşırı ısınmasına yol açar. RMSE, karesel ceza uygulayarak büyük sapmaları en sert cezalandıran metriktir.',
      pros: 'Büyük sapmaları affetmez, birimi hedefle aynıdır (kWh/m²).'
    },
    {
      code: 'RMSLE',
      nameTr: 'Kök Ortalama Logaritmik Kare Hata (RMSLE)',
      formula: 'RMSLE = √ [ (1/N) Σ (ln(y_i + 1) - ln(ŷ_i + 1))² ]',
      unit: 'Boyutsuz (Log Oranı)',
      role: 'İkincil Güvenlik Metriği (Underestimation Koruması)',
      highlight: true,
      reason: 'Yük tahmininde binanın ihtiyacını eksik tahmin etmek (underestimation), fazla tahmin etmekten (overestimation) çok daha tehlikelidir. RMSLE logaritmik dönüşümü sayesinde eksik tahminleri daha ağır cezalandırır ve göreceli yüzdesel farkı ölçer.',
      pros: 'Eksik tahminleri sert cezalandırır, uç değerlere karşı dayanıklıdır.'
    },
    {
      code: 'MAE',
      nameTr: 'Ortalama Mutlak Hata (Mean Absolute Error)',
      formula: 'MAE = (1/N) Σ |y_i - ŷ_i|',
      unit: 'kWh/m²',
      role: 'Doğrudan Yorumlanabilir Fiziksel Sapma',
      highlight: false,
      reason: 'Tüm binalardaki mutlak hata miktarının aritmetik ortalamasıdır. Aykırı değerlerden RMSE kadar etkilenmez. Danışmanlık müşterilerine "Ortalama olarak tahminimiz ±1.2 kWh/m² sapmaktadır" demek için en şeffaf metriktir.',
      pros: 'Yorumlanması son derece basittir, karesel şişme yapmaz.'
    },
    {
      code: 'R²',
      nameTr: 'Belirlilik Katsayısı (Coefficient of Determination)',
      formula: 'R² = 1 - [ Σ(y_i - ŷ_i)² / Σ(y_i - ȳ)² ]',
      unit: '0 ile 1 arası (veya %)',
      role: 'Varyans Açıklama Gücü',
      highlight: false,
      reason: 'Binaların ısıtma/soğutma yüklerindeki değişimin yüzde kaçının model tarafından açıklanabildiğini gösterir. R² > 0.95 olan bir model, bina geometrisi ile yük arasındaki fizik kurallarını kusursuz öğrenmiş demektir.',
      pros: 'Modelin genel başarısını evrensel olarak kıyaslamaya yarar.'
    },
    {
      code: 'MAPE',
      nameTr: 'Ortalama Mutlak Yüzde Hata (MAPE)',
      formula: 'MAPE = (100% / N) Σ |(y_i - ŷ_i) / y_i|',
      unit: '% Yüzde',
      role: 'Yüzdesel Doğruluk İndeksi',
      highlight: false,
      reason: 'Küçük ve büyük yükteki binalar arasındaki ölçek farkını ortadan kaldırarak hatayı yüzde cinsinden verir. Örneğin %4 MAPE, modelin ortalama %96 doğrulukla çalıştığını belirtir.',
      pros: 'Yüzdesel sunumlar ve yatırımcı raporları için idealdir.'
    }
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
        <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800">
          <span>ADIM 3</span>
          <span aria-hidden="true">·</span>
          <span>Hata Metriklerinin Seçimi & Mühendislik Gerekçesi</span>
        </div>
        <h2 className="text-xl font-bold text-slate-900 mt-1">
          Neden RMSE ve RMSLE Tercih Edildi?
        </h2>
        <p className="text-sm text-slate-500 mt-1 max-w-3xl">
          Makine öğrenimi projesinde rastgele bir metrik seçmek yerine, bina fiziğinin ve iklimlendirme sistemlerinin risk profiline göre karar verildi.
        </p>
      </div>

      {/* Primary Decision Banner */}
      <div className="bg-emerald-900 text-white rounded-xl p-6 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-lg bg-emerald-700 flex items-center justify-center shrink-0">
            <Scale className="w-5 h-5 text-emerald-200" />
          </div>
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-300">
              <span>Proje Karar Raporu (Enes Öztürk)</span>
            </div>
            <h3 className="text-lg font-bold">
              Şampiyon Model Seçim Kriteri: Minimum Test RMSE & Dengeli RMSLE
            </h3>
            <p className="text-xs text-emerald-100 leading-relaxed max-w-4xl">
              1. <strong>Büyük Hata Cezası (RMSE):</strong> Bir binanın pik ısıtma yükü 35 kWh/m² iken model 20 kWh/m² tahmin ederse, kurulacak kazan sistemi yetersiz kalır ve bina donar. RMSE karesel çalıştığı için bu tehlikeli sapmaları minimuma indiren modeli şampiyon yapar.
              <br />
              2. <strong>Eksik Yük Cezası (RMSLE):</strong> Logaritmik oranlama sayesinde düşük yükteki tek katlı binalar ile yüksek yükteki iki katlı binalar arasındaki oran farkını dengeler.
            </p>
          </div>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {metrics.map((m) => (
          <div
            key={m.code}
            className={`rounded-xl border p-5 shadow-xs flex flex-col justify-between ${
              m.highlight
                ? 'bg-white border-emerald-300 ring-1 ring-emerald-200'
                : 'bg-white border-slate-200'
            }`}
          >
            <div>
              <div className="flex items-center justify-between">
                <span className={`px-2 py-0.5 rounded text-xs font-bold font-mono ${
                  m.highlight ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-700'
                }`}>
                  {m.code}
                </span>
                <span className="text-[11px] text-slate-400 font-mono">{m.unit}</span>
              </div>

              <h4 className="text-sm font-bold text-slate-900 mt-2">{m.nameTr}</h4>
              <div className="text-[11px] font-semibold text-emerald-700 mt-0.5">{m.role}</div>

              {/* Formula box */}
              <div className="my-3 p-2.5 rounded-lg bg-slate-50 border border-slate-200 font-mono text-[11px] text-slate-700 text-center">
                {m.formula}
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">
                {m.reason}
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-500 flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>{m.pros}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
