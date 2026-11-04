import React, { useState } from 'react';
import { CLINICAL_QUESTIONS } from '../data/diagnosticQuestions';
import { predictPatientState } from '../services/modelEngine';
import { DiagnosticResult } from '../types/depression';
import { ArrowRight, CheckCircle2, AlertTriangle, RotateCcw, Activity, Heart, Shield, Sparkles, Printer } from 'lucide-react';

export const DiagnosticAssessment: React.FC = () => {
  // Answers map: questionId -> selected score (0 to 3)
  const [answers, setAnswers] = useState<Record<string, number>>({});
  
  // Wearable / Lifestyle sliders
  const [dailySteps, setDailySteps] = useState<number>(6500);
  const [nightAwakenings, setNightAwakenings] = useState<number>(1);
  const [sedentaryHours, setSedentaryHours] = useState<number>(8);

  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [result, setResult] = useState<DiagnosticResult | null>(null);

  const totalQuestions = CLINICAL_QUESTIONS.length;
  const answeredCount = Object.keys(answers).length;
  const progressPct = Math.round((answeredCount / totalQuestions) * 100);

  const handleSelectOption = (questionId: string, score: number) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: score,
    }));
  };

  const calculateResults = () => {
    // Total question score (0 to 24)
    const questionSum = Object.values(answers).reduce((a, b) => a + b, 0);

    // Derived actigraphy parameters from questionnaire + wearable inputs:
    // Daily steps convert to mean activity counts/min (~100 cnt per 2500 steps)
    const simulated24hActivity = Math.round((dailySteps / 10000) * 320 + (14 - sedentaryHours) * 8);
    // Night awakenings and sedentary hours boost restActivityRatio
    const simulatedNightDayRatio = Math.max(
      0.08,
      Math.min(0.65, 0.12 + (nightAwakenings * 0.075) + (questionSum / 24) * 0.22)
    );
    const simulatedZeroRatio = Math.min(0.60, 0.20 + (sedentaryHours / 16) * 0.35);
    const simulatedIV = 0.8 + (nightAwakenings * 0.15) + (questionSum / 24) * 0.5;
    const simulatedIS = Math.max(0.2, 0.75 - (questionSum / 24) * 0.4);

    // Call ML prediction engine
    const prediction = predictPatientState({
      meanActivity24h: simulated24hActivity,
      restActivityRatio: simulatedNightDayRatio,
      zeroActivityRatio: simulatedZeroRatio,
      interdailyStability: simulatedIS,
      intradailyVariability: simulatedIV,
      reportedMadrsTotal: Math.round((questionSum / 24) * 45),
    });

    const estimatedMadrs = prediction.predictedMadrs;
    let severity: 'Minimal' | 'Hafif' | 'Orta' | 'Şiddetli' = 'Minimal';
    let severityDescription = 'Duygudurum ve sirkadiyen ritim sağlıklı sınırlar içerisindedir.';

    if (estimatedMadrs >= 35) {
      severity = 'Şiddetli';
      severityDescription = 'Şiddetli düzeyde depresif çökkünlük ve ağır sirkadiyen ritim düzensizliği.';
    } else if (estimatedMadrs >= 20) {
      severity = 'Orta';
      severityDescription = 'Orta derecede depresyon tablosu, psikomotor yavaşlama ve uyku mimarisinde bozulma.';
    } else if (estimatedMadrs >= 7) {
      severity = 'Hafif';
      severityDescription = 'Hafif düzeyde dönemsel keder ve yorgunluk; klinik müdahale gerektirmeyebilir.';
    }

    const recommendations: string[] = [];
    if (estimatedMadrs >= 20) {
      recommendations.push('Bir psikiyatrist veya yetkili klinik psikolog ile kapsamlı yüz yüze değerlendirme yapılması önerilir.');
      recommendations.push('Uyku-uyanıklık saatlerini sabitleyin (Kronobiyoloji: her sabah aynı saatte 20 dk doğal güneş ışığı).');
      recommendations.push('Psikomotor retardasyonu kırmak için her gün minimum 30 dakika açık hava yürüyüşü planlayın.');
    } else if (estimatedMadrs >= 7) {
      recommendations.push('Düzenli egzersiz ve sabah gün ışığı maruziyeti ile sirkadiyen ritmi güçlendirin.');
      recommendations.push('Mavi ışık filtresi ve yatmadan 2 saat önce ekran temasını keserek gece uyanmalarını azaltın.');
      recommendations.push('Sosyal etkileşimleri ve sizi motive eden hafif hobileri rutininize ekleyin.');
    } else {
      recommendations.push('Mevcut sağlıklı uyku ve aktif hareket rutininizi korumaya devam edin.');
      recommendations.push('Haftalık 150 dakika orta yoğunluklu aerobik egzersiz beyin nöroplastisitesini destekler.');
    }

    const res: DiagnosticResult = {
      totalScore: questionSum,
      maxScore: totalQuestions * 3,
      predictedCondition: prediction.predictedClass,
      conditionProbability: prediction.conditionProbability,
      estimatedMadrsScore: estimatedMadrs,
      severityLevel: severity,
      severityDescription,
      circadianDisruptionScore: Math.round(100 - prediction.circadianHealthScore),
      subScores: {
        mood: ((answers['q1_mood'] || 0) + (answers['q2_anhedonia'] || 0) + (answers['q8_pessimism'] || 0)),
        sleepCircadian: (answers['q3_sleep_latency'] || 0) + (nightAwakenings >= 2 ? 2 : 1),
        psychomotor: ((answers['q4_daytime_activity'] || 0) + (answers['q5_psychomotor'] || 0)),
        cognitive: (answers['q7_concentration'] || 0),
      },
      clinicalRecommendations: recommendations,
      actigraphComparison: {
        estimatedNightToDayRatio: Math.round(simulatedNightDayRatio * 1000) / 1000,
        benchmarkControlRatio: 0.12,
        benchmarkConditionRatio: 0.44,
      },
    };

    setResult(res);
    setIsCompleted(true);
  };

  const handleReset = () => {
    setAnswers({});
    setIsCompleted(false);
    setResult(null);
  };

  return (
    <div className="space-y-6">
      
      {/* Title & Section Description */}
      <div>
        <div className="text-xs text-slate-500 dark:text-slate-400">Adım 5 · İnteraktif Klinik Tanı & Risk Hesaplayıcı</div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white mt-1">
          Kişiselleştirilmiş Depresyon Durumu & Sirkadiyen Risk Değerlendirmesi
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-3xl">
          Kullanıcının sorulara verdiği klinik yanıtlar (MADRS ve PHQ-9 ölçekleri) ile günlük aktivite ve uyku alışkanlıkları
          makine öğrenmesi modeline beslenerek otomatik depresyon teşhisi, MADRS şiddet skoru ve sirkadiyen bozulma düzeyi tahmin edilir.
        </p>
      </div>

      {!isCompleted ? (
        <div className="space-y-6">
          
          {/* Progress Ribbon */}
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <span className="w-8 h-8 rounded-lg bg-cyan-100 dark:bg-cyan-950/60 text-cyan-600 flex items-center justify-center font-bold text-xs font-mono">
                {answeredCount}/{totalQuestions}
              </span>
              <div>
                <div className="text-xs font-bold text-slate-900 dark:text-white">
                  Klinik Değerlendirme İlerlemesi
                </div>
                <div className="text-[11px] text-slate-500">
                  {totalQuestions - answeredCount === 0 ? 'Tüm sorular yanıtlandı!' : `${totalQuestions - answeredCount} soru kaldı`}
                </div>
              </div>
            </div>

            <div className="w-full sm:w-64 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-cyan-600 transition-all duration-300 rounded-full"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>

          {/* Wearable Lifestyle Parameters (Aktigraf Simülasyonu) */}
          <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
              <Activity className="w-4 h-4 text-cyan-600" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                El Bileği Aktigraf & Yaşam Tarzı Parametreleri
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs">
              
              <div className="space-y-2">
                <div className="flex justify-between items-center font-semibold text-slate-800 dark:text-slate-200">
                  <span>Günlük Ortalama Adım</span>
                  <span className="font-mono tabular-nums text-cyan-600 font-bold">
                    {dailySteps.toLocaleString()} adım
                  </span>
                </div>
                <input
                  type="range"
                  min="1000"
                  max="16000"
                  step="500"
                  value={dailySteps}
                  onChange={(e) => setDailySteps(parseInt(e.target.value))}
                  className="w-full accent-cyan-600 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                  <span>1.000 (Sedanter)</span>
                  <span>16.000 (Çok Aktif)</span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center font-semibold text-slate-800 dark:text-slate-200">
                  <span>Gece Uyanma Sayısı</span>
                  <span className="font-mono tabular-nums text-indigo-600 font-bold">
                    {nightAwakenings} kez
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="5"
                  step="1"
                  value={nightAwakenings}
                  onChange={(e) => setNightAwakenings(parseInt(e.target.value))}
                  className="w-full accent-indigo-600 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                  <span>0 (Deliksiz)</span>
                  <span>5+ (Sık Parçalanma)</span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center font-semibold text-slate-800 dark:text-slate-200">
                  <span>Gün İçi Hareketsiz Süre</span>
                  <span className="font-mono tabular-nums text-amber-600 font-bold">
                    {sedentaryHours} saat/gün
                  </span>
                </div>
                <input
                  type="range"
                  min="2"
                  max="16"
                  step="1"
                  value={sedentaryHours}
                  onChange={(e) => setSedentaryHours(parseInt(e.target.value))}
                  className="w-full accent-amber-600 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                  <span>2 saat (Dinamik)</span>
                  <span>16 saat (Yatak/Koltuk)</span>
                </div>
              </div>

            </div>
          </div>

          {/* Questions List */}
          <div className="space-y-4">
            {CLINICAL_QUESTIONS.map((q) => {
              const currentScore = answers[q.id];

              return (
                <div
                  key={q.id}
                  className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-3"
                >
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      {q.text}
                    </h3>
                    {q.subtext && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        {q.subtext}
                      </p>
                    )}
                  </div>

                  {/* 4 Multi-Choice Options */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                    {q.options.map((opt) => {
                      const isSelected = currentScore === opt.score;

                      return (
                        <button
                          key={opt.score}
                          type="button"
                          onClick={() => handleSelectOption(q.id, opt.score)}
                          className={`text-left p-3 rounded-lg border transition-all cursor-pointer ${
                            isSelected
                              ? 'border-cyan-600 bg-cyan-50/60 dark:bg-cyan-950/40 text-slate-900 dark:text-white shadow-xs'
                              : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <span className="text-xs font-semibold">{opt.label}</span>
                            <span className="text-[10px] font-mono text-slate-400">
                              {opt.score} puan
                            </span>
                          </div>
                          {opt.description && (
                            <div className="text-[11px] text-slate-500 mt-1 leading-snug">
                              {opt.description}
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Submit Action Strip */}
          <div className="flex items-center justify-between p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
            <div className="text-xs text-slate-500">
              {answeredCount === totalQuestions
                ? 'Tüm sorular eksiksiz yanıtlandı. Analizi tamamlayabilirsiniz.'
                : 'Lütfen doğru sonuç için tüm soruları yanıtlayınız.'}
            </div>

            <button
              onClick={calculateResults}
              disabled={answeredCount < totalQuestions}
              className={`inline-flex items-center gap-2 px-6 py-2.5 rounded-lg text-xs font-bold transition-colors cursor-pointer shadow-sm ${
                answeredCount === totalQuestions
                  ? 'bg-cyan-600 hover:bg-cyan-700 text-white'
                  : 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
              }`}
            >
              <span>Makine Öğrenmesi ile Teşhis Koy & Raporla</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </div>
      ) : (
        /* Results Section */
        result && (
          <div className="space-y-6">
            
            {/* Main Diagnostic Banner */}
            <div
              className={`p-6 rounded-xl border-2 shadow-sm ${
                result.predictedCondition === 'condition'
                  ? 'border-rose-500 bg-rose-50/30 dark:bg-rose-950/30'
                  : 'border-emerald-500 bg-emerald-50/30 dark:bg-emerald-950/30'
              }`}
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
                <div className="space-y-1">
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Otomatik Teşhis Sonucu (Enes Öztürk ML Modeli)
                  </div>
                  <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white">
                    {result.predictedCondition === 'condition'
                      ? 'Depresif Durum / Klinik Depresyon Riski Saptandı'
                      : 'Normal Sınırlar / Sağlıklı Kontrol Grubu Profili'}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    {result.severityDescription}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => window.print()}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 cursor-pointer hover:bg-slate-50"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Yazdır / PDF</span>
                  </button>
                  <button
                    onClick={handleReset}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-cyan-600 text-white text-xs font-semibold cursor-pointer hover:bg-cyan-700"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Testi Yeniden Çöz</span>
                  </button>
                </div>
              </div>

              {/* 4 Score Badges Strip */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 text-center">
                
                <div className="p-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
                  <div className="text-[11px] text-slate-500">Tahmini MADRS Skoru</div>
                  <div className="text-2xl font-bold font-mono tabular-nums text-slate-900 dark:text-white mt-0.5">
                    {result.estimatedMadrsScore} <span className="text-xs font-normal text-slate-400">/ 60</span>
                  </div>
                  <div className="text-[11px] font-semibold text-cyan-600 dark:text-cyan-400 mt-0.5">
                    {result.severityLevel} Düzey
                  </div>
                </div>

                <div className="p-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
                  <div className="text-[11px] text-slate-500">Depresyon Olasılığı</div>
                  <div className="text-2xl font-bold font-mono tabular-nums text-slate-900 dark:text-white mt-0.5">
                    %{result.conditionProbability}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    GBM + Stacking Olasılığı
                  </div>
                </div>

                <div className="p-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
                  <div className="text-[11px] text-slate-500">Sirkadiyen Bozulma İndeksi</div>
                  <div className="text-2xl font-bold font-mono tabular-nums text-slate-900 dark:text-white mt-0.5">
                    %{result.circadianDisruptionScore}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    Uyku & Motor Ritim
                  </div>
                </div>

                <div className="p-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
                  <div className="text-[11px] text-slate-500">Gece / Gündüz Motor Oranı</div>
                  <div className="text-2xl font-bold font-mono tabular-nums text-slate-900 dark:text-white mt-0.5">
                    {result.actigraphComparison.estimatedNightToDayRatio}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    Kontrol Normu: ~0.12
                  </div>
                </div>

              </div>

            </div>

            {/* Biomarker Sub-Scores & Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  Klinik Belirti Alanları Dağılımı
                </h4>
                
                <div className="space-y-3 pt-1 text-xs">
                  <div>
                    <div className="flex justify-between text-slate-600 dark:text-slate-400 mb-1">
                      <span>Duygudurum & Keder (Mood / Pessimism)</span>
                      <span className="font-mono font-bold">{result.subScores.mood} / 9</span>
                    </div>
                    <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-cyan-600 rounded-full"
                        style={{ width: `${(result.subScores.mood / 9) * 100}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-slate-600 dark:text-slate-400 mb-1">
                      <span>Uyku & Sirkadiyen Ritim Parçalanması</span>
                      <span className="font-mono font-bold">{result.subScores.sleepCircadian} / 5</span>
                    </div>
                    <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-indigo-600 rounded-full"
                        style={{ width: `${(result.subScores.sleepCircadian / 5) * 100}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-slate-600 dark:text-slate-400 mb-1">
                      <span>Psikomotor Retardasyon & Hareketsizlik</span>
                      <span className="font-mono font-bold">{result.subScores.psychomotor} / 6</span>
                    </div>
                    <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-rose-600 rounded-full"
                        style={{ width: `${(result.subScores.psychomotor / 6) * 100}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-slate-600 dark:text-slate-400 mb-1">
                      <span>Bilişsel Odaklanma & Karar Verme</span>
                      <span className="font-mono font-bold">{result.subScores.cognitive} / 3</span>
                    </div>
                    <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-amber-600 rounded-full"
                        style={{ width: `${(result.subScores.cognitive / 3) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Actionable Clinical Recommendations */}
              <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  Kronobiyolojik & Yaşam Tarzı Önerileri
                </h4>
                <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
                  {result.clinicalRecommendations.map((rec, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-cyan-600 shrink-0 mt-0.5" />
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>

                <div className="text-[11px] text-slate-400 border-t border-slate-100 dark:border-slate-800 pt-3">
                  ⚠️ <strong className="text-slate-600 dark:text-slate-300">Yasal Uyarı:</strong> Bu uygulama bir araştırma ve eğitim projesidir (Enes Öztürk).
                  Kesin tıbbi teşhis yerine geçmez. Lütfen klinik değerlendirme için sağlık kuruluşuna başvurunuz.
                </div>
              </div>

            </div>

          </div>
        )
      )}

    </div>
  );
};
