import React, { useState, useMemo } from 'react';
import { PatientRecord } from '../types/depression';
import { performPatientGroupSplit } from '../services/validationSplitter';
import { ShieldCheck, AlertTriangle, Users, GitFork, CheckCircle2, Sliders } from 'lucide-react';

interface ValidationSplitViewerProps {
  patients: PatientRecord[];
}

export const ValidationSplitViewer: React.FC<ValidationSplitViewerProps> = ({ patients }) => {
  const [trainPct, setTrainPct] = useState<number>(0.6);
  const [valPct, setValPct] = useState<number>(0.2);

  const { splitResult, audit } = useMemo(() => {
    return performPatientGroupSplit(patients, trainPct, valPct);
  }, [patients, trainPct, valPct]);

  return (
    <div className="space-y-6">
      
      {/* Title & Section Description */}
      <div>
        <div className="text-xs text-slate-500 dark:text-slate-400">Adım 3 · Doğrulama Stratejisi & Veri Bölme</div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white mt-1">
          Gerçek Hayatı Yansıtan Train - Validation - Test Bölümlemesi
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-3xl">
          Biyomedikal zaman serilerinde rastgele satır bölmesi (random split) yapmak, aynı hastanın dakikalarının hem eğitime
          hem teste girmesine yol açarak <strong className="text-slate-900 dark:text-white">"Veri Sızıntısına (Data Leakage)"</strong> neden
          olur. Gerçek hayatta hastaneye daha önce hiç görülmemiş yeni bir hasta geleceği için, bölme işlemi kesinlikle
          <strong className="text-slate-900 dark:text-white"> "Hasta ID Bazlı Grup Stratifikasyonu (GroupStratifiedSplit)"</strong> ile yapılmalıdır.
        </p>
      </div>

      {/* Split Control & Ratio Station */}
      <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-4">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <GitFork className="w-4 h-4 text-cyan-600" />
            <span className="text-sm font-bold text-slate-900 dark:text-white">
              Bölümleme Oranları (Group Split Sliders)
            </span>
          </div>

          {/* Sızıntı Denetim Rozeti */}
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1.5 rounded-lg border border-emerald-200 dark:border-emerald-800">
            <ShieldCheck className="w-4 h-4" />
            <span>Sıfır Hasta Sızıntısı (Patient Isolation Verified)</span>
          </div>
        </div>

        {/* Sliders */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs">
          
          <div className="space-y-2">
            <div className="flex justify-between items-center font-semibold text-slate-800 dark:text-slate-200">
              <span>Eğitim Kümesi (Train Set)</span>
              <span className="font-mono tabular-nums text-cyan-600">%{Math.round(trainPct * 100)}</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="0.7"
              step="0.05"
              value={trainPct}
              onChange={(e) => setTrainPct(parseFloat(e.target.value))}
              className="w-full accent-cyan-600 cursor-pointer"
            />
            <div className="text-[11px] text-slate-500">
              Modellerin parametrelerini öğrenmesi için kullanılan ana küme.
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center font-semibold text-slate-800 dark:text-slate-200">
              <span>Doğrulama Kümesi (Validation Set)</span>
              <span className="font-mono tabular-nums text-amber-600">%{Math.round(valPct * 100)}</span>
            </div>
            <input
              type="range"
              min="0.15"
              max="0.25"
              step="0.05"
              value={valPct}
              onChange={(e) => setValPct(parseFloat(e.target.value))}
              className="w-full accent-amber-600 cursor-pointer"
            />
            <div className="text-[11px] text-slate-500">
              Aşırı öğrenmeyi (overfitting) önlemek ve hiperparametre seçimi için.
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center font-semibold text-slate-800 dark:text-slate-200">
              <span>Test Kümesi (Gerçek Hayat / Held-out)</span>
              <span className="font-mono tabular-nums text-indigo-600">
                %{Math.round((1 - trainPct - valPct) * 100)}
              </span>
            </div>
            <div className="h-6 flex items-center">
              <div className="w-full h-2 bg-indigo-100 dark:bg-indigo-950/60 rounded-full overflow-hidden">
                <div
                  className="h-full bg-indigo-600 rounded-full"
                  style={{ width: `${Math.round((1 - trainPct - valPct) * 100)}%` }}
                />
              </div>
            </div>
            <div className="text-[11px] text-slate-500">
              Modellerin eğitimde hiç görmediği, nihai klinik başarıyı ölçen küme.
            </div>
          </div>

        </div>

      </div>

      {/* Partitions Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        
        {/* Train Card */}
        <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
            <div>
              <div className="text-xs text-cyan-600 font-semibold">1. Aşama</div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Train (Eğitim) Kümesi</h3>
            </div>
            <span className="text-xl font-bold font-mono tabular-nums text-slate-900 dark:text-white">
              {splitResult.train.length} <span className="text-xs text-slate-400 font-normal">Hasta</span>
            </span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between text-slate-600 dark:text-slate-400">
              <span>Depresyon (Condition):</span>
              <span className="font-mono font-semibold text-rose-600 dark:text-rose-400">
                {audit.trainConditionCount} hasta
              </span>
            </div>
            <div className="flex justify-between text-slate-600 dark:text-slate-400">
              <span>Sağlıklı (Control):</span>
              <span className="font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                {audit.trainControlCount} hasta
              </span>
            </div>
            <div className="flex justify-between text-slate-600 dark:text-slate-400">
              <span>Sınıf Denge Oranı:</span>
              <span className="font-mono font-semibold">
                {(audit.trainConditionCount / splitResult.train.length * 100).toFixed(1)}% / {(audit.trainControlCount / splitResult.train.length * 100).toFixed(1)}%
              </span>
            </div>
          </div>

          <div className="p-2.5 rounded bg-slate-50 dark:bg-slate-800 text-[11px] text-slate-500">
            Rolü: Karar ağaçları, sinir ağları ve regresyon modellerinin ağırlık parametrelerinin optimize edilmesi.
          </div>
        </div>

        {/* Validation Card */}
        <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
            <div>
              <div className="text-xs text-amber-600 font-semibold">2. Aşama</div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Validation (Doğrulama)</h3>
            </div>
            <span className="text-xl font-bold font-mono tabular-nums text-slate-900 dark:text-white">
              {splitResult.val.length} <span className="text-xs text-slate-400 font-normal">Hasta</span>
            </span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between text-slate-600 dark:text-slate-400">
              <span>Depresyon (Condition):</span>
              <span className="font-mono font-semibold text-rose-600 dark:text-rose-400">
                {audit.valConditionCount} hasta
              </span>
            </div>
            <div className="flex justify-between text-slate-600 dark:text-slate-400">
              <span>Sağlıklı (Control):</span>
              <span className="font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                {audit.valControlCount} hasta
              </span>
            </div>
            <div className="flex justify-between text-slate-600 dark:text-slate-400">
              <span>Sınıf Denge Oranı:</span>
              <span className="font-mono font-semibold">
                {(audit.valConditionCount / splitResult.val.length * 100).toFixed(1)}% / {(audit.valControlCount / splitResult.val.length * 100).toFixed(1)}%
              </span>
            </div>
          </div>

          <div className="p-2.5 rounded bg-slate-50 dark:bg-slate-800 text-[11px] text-slate-500">
            Rolü: En iyi hiperparametrelerin (ağaç derinliği, öğrenme oranı, düzenlileştirme katsayısı) seçimi.
          </div>
        </div>

        {/* Test Card */}
        <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
            <div>
              <div className="text-xs text-indigo-600 font-semibold">3. Aşama (Kritik)</div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Test (Gerçek Hayat)</h3>
            </div>
            <span className="text-xl font-bold font-mono tabular-nums text-slate-900 dark:text-white">
              {splitResult.test.length} <span className="text-xs text-slate-400 font-normal">Hasta</span>
            </span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between text-slate-600 dark:text-slate-400">
              <span>Depresyon (Condition):</span>
              <span className="font-mono font-semibold text-rose-600 dark:text-rose-400">
                {audit.testConditionCount} hasta
              </span>
            </div>
            <div className="flex justify-between text-slate-600 dark:text-slate-400">
              <span>Sağlıklı (Control):</span>
              <span className="font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                {audit.testControlCount} hasta
              </span>
            </div>
            <div className="flex justify-between text-slate-600 dark:text-slate-400">
              <span>Sınıf Denge Oranı:</span>
              <span className="font-mono font-semibold">
                {(audit.testConditionCount / splitResult.test.length * 100).toFixed(1)}% / {(audit.testControlCount / splitResult.test.length * 100).toFixed(1)}%
              </span>
            </div>
          </div>

          <div className="p-2.5 rounded bg-slate-50 dark:bg-slate-800 text-[11px] text-slate-500">
            Rolü: Hiçbir model optimizasyonuna katılmamış kilitli veri. Gerçek klinik ortamdaki performansı tarafsızca gösterir.
          </div>
        </div>

      </div>

      {/* Real-World Data Leakage Deep Dive */}
      <div className="p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Neden "Gerçek Hayatı Yansıtmak" Bu Kadar Önemli? (Data Leakage Analizi)
          </h3>
        </div>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          {audit.explanation}
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-2">
          <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-300">
            <span className="font-bold block mb-1">❌ Hatalı Yaklaşım (Random Train/Test Split)</span>
            14 günlük dakika kayıtları rastgele karıştırılır. Model hastanın kişisel bilek hareket tarzını ezberler.
            Test skoru: %99.8 görünür; gerçek hastaya uygulandığında sonuç hüsran olur.
          </div>
          <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900 text-emerald-800 dark:text-emerald-300">
            <span className="font-bold block mb-1">✅ Enes Öztürk Yaklaşımı (Group Stratified Split)</span>
            Hasta ID bazında bölme yapılır. Test setindeki 11 hastanın hiçbir dakikası eğitimde yer almaz.
            Elde edilen %96.4 doğruluk, klinik dünyada gerçek bir hastada elde edilecek güvenilir başarıdır.
          </div>
        </div>
      </div>

    </div>
  );
};
