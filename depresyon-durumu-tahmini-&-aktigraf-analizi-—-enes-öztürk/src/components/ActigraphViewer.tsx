import React, { useState, useMemo } from 'react';
import { PatientRecord } from '../types/depression';
import { generate24HourActigraphWave } from '../data/depressionDataset';
import { Activity, Clock, Moon, Sun, Sliders, Info, SplitSquareVertical } from 'lucide-react';

interface ActigraphViewerProps {
  patients: PatientRecord[];
  selectedPatientId: string;
  onSelectPatientId: (id: string) => void;
}

export const ActigraphViewer: React.FC<ActigraphViewerProps> = ({
  patients,
  selectedPatientId,
  onSelectPatientId,
}) => {
  const [compareWithControl, setCompareWithControl] = useState<boolean>(true);
  const [benchmarkControlId, setBenchmarkControlId] = useState<string>('control_1');

  const selectedPatient = useMemo(() => {
    return patients.find((p) => p.id === selectedPatientId) || patients[0];
  }, [patients, selectedPatientId]);

  const benchmarkPatient = useMemo(() => {
    return patients.find((p) => p.id === benchmarkControlId) || patients.find((p) => p.group === 'control') || patients[23];
  }, [patients, benchmarkControlId]);

  const patientWave = useMemo(() => {
    return generate24HourActigraphWave(selectedPatient);
  }, [selectedPatient]);

  const benchmarkWave = useMemo(() => {
    return generate24HourActigraphWave(benchmarkPatient);
  }, [benchmarkPatient]);

  // SVG Chart Dimensions
  const chartWidth = 900;
  const chartHeight = 280;
  const padding = { top: 20, right: 30, bottom: 40, left: 55 };
  const innerWidth = chartWidth - padding.left - padding.right;
  const innerHeight = chartHeight - padding.top - padding.bottom;

  // Max scale calculation
  const maxActivity = 800;

  // Build SVG path strings
  const getPath = (wave: ReturnType<typeof generate24HourActigraphWave>) => {
    return wave.reduce((acc, pt, i) => {
      const x = padding.left + (i / (wave.length - 1)) * innerWidth;
      const y = padding.top + innerHeight - (Math.min(pt.activity, maxActivity) / maxActivity) * innerHeight;
      return `${acc} ${i === 0 ? 'M' : 'L'} ${x} ${y}`;
    }, '');
  };

  const getAreaPath = (wave: ReturnType<typeof generate24HourActigraphWave>) => {
    const linePath = getPath(wave);
    const startX = padding.left;
    const endX = padding.left + innerWidth;
    const bottomY = padding.top + innerHeight;
    return `${linePath} L ${endX} ${bottomY} L ${startX} ${bottomY} Z`;
  };

  const isCondition = selectedPatient.group === 'condition';

  return (
    <div className="space-y-6">
      
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs text-slate-500 dark:text-slate-400">Aktigrafik Zaman Serisi Görselleştirmesi</div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white mt-1">
            24 Saatlik Sirkadiyen Motor Aktivite Dalgası
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-3xl">
            Aktiwatch el bileği ivmeölçerinden elde edilen dakika bazlı aktivite konturları. Depresyon hastalarında
            belirginleşen diurnal aktivite küntleşmesi (blunted daytime peak) ve gece motor huzursuzluğunu görselleştirin.
          </p>
        </div>

        {/* Patient Selection Dropdown */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-white dark:bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-xs">
            <span className="text-slate-500 font-medium">Hasta:</span>
            <select
              value={selectedPatient.id}
              onChange={(e) => onSelectPatientId(e.target.value)}
              className="bg-transparent font-mono font-semibold text-slate-900 dark:text-white focus:outline-none cursor-pointer"
            >
              <optgroup label="Depresyon Grubu (Condition)">
                {patients
                  .filter((p) => p.group === 'condition')
                  .map((p) => (
                    <option key={p.id} value={p.id} className="text-slate-900 dark:text-slate-900">
                      {p.id} ({p.genderLabel}, {p.ageGroup}, MADRS: {p.madrs1})
                    </option>
                  ))}
              </optgroup>
              <optgroup label="Kontrol Grubu (Sağlıklı)">
                {patients
                  .filter((p) => p.group === 'control')
                  .map((p) => (
                    <option key={p.id} value={p.id} className="text-slate-900 dark:text-slate-900">
                      {p.id} ({p.genderLabel}, {p.ageGroup})
                    </option>
                  ))}
              </optgroup>
            </select>
          </div>

          <button
            onClick={() => setCompareWithControl(!compareWithControl)}
            className={`inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              compareWithControl
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
            }`}
          >
            <SplitSquareVertical className="w-3.5 h-3.5" />
            <span>Sağlıklı Kontrol ile Kıyasla</span>
          </button>
        </div>
      </div>

      {/* Main Signal Display Canvas Container */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 sm:p-6 shadow-sm space-y-4">
        
        {/* Signal Meta Ribbon */}
        <div className="flex flex-wrap items-center justify-between gap-4 text-xs border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className={`w-3 h-3 rounded-full ${isCondition ? 'bg-rose-500' : 'bg-emerald-500'}`} />
              <span className="font-bold text-slate-900 dark:text-white">
                {selectedPatient.id} ({isCondition ? 'Depresyon' : 'Sağlıklı'})
              </span>
            </div>
            {compareWithControl && (
              <div className="flex items-center gap-2">
                <span className="w-3 h-0.5 bg-emerald-500" />
                <span className="text-slate-600 dark:text-slate-400 font-medium">
                  Referans Kontrol: {benchmarkPatient.id}
                </span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-4 text-slate-500">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 bg-indigo-500/10 dark:bg-indigo-500/20 border border-indigo-400/30 rounded-sm" />
              <span>Gece Penceresi (23:00 - 07:00)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 bg-amber-500/10 dark:bg-amber-500/20 border border-amber-400/30 rounded-sm" />
              <span>Gündüz Penceresi (08:00 - 21:00)</span>
            </div>
          </div>
        </div>

        {/* SVG Time-Series Chart */}
        <div className="w-full overflow-x-auto">
          <svg
            viewBox={`0 0 ${chartWidth} ${chartHeight}`}
            className="w-full h-auto select-none"
            style={{ minWidth: '600px' }}
          >
            <defs>
              {/* Gradients */}
              <linearGradient id="conditionGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#f43f5e" stopOpacity="0.0" />
              </linearGradient>
              <linearGradient id="controlGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" stopOpacity="0.2" />
                <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Shaded Night Windows */}
            {/* 00:00 to 07:00 */}
            <rect
              x={padding.left}
              y={padding.top}
              width={(7 / 24) * innerWidth}
              height={innerHeight}
              className="fill-indigo-500/10 dark:fill-indigo-500/15"
            />
            {/* 23:00 to 24:00 */}
            <rect
              x={padding.left + (23 / 24) * innerWidth}
              y={padding.top}
              width={(1 / 24) * innerWidth}
              height={innerHeight}
              className="fill-indigo-500/10 dark:fill-indigo-500/15"
            />

            {/* Grid lines */}
            {[0, 200, 400, 600, 800].map((tick) => {
              const y = padding.top + innerHeight - (tick / maxActivity) * innerHeight;
              return (
                <g key={tick}>
                  <line
                    x1={padding.left}
                    y1={y}
                    x2={padding.left + innerWidth}
                    y2={y}
                    className="stroke-slate-100 dark:stroke-slate-800"
                    strokeDasharray="4 4"
                  />
                  <text
                    x={padding.left - 8}
                    y={y + 4}
                    textAnchor="end"
                    className="text-[10px] font-mono fill-slate-400"
                  >
                    {tick}
                  </text>
                </g>
              );
            })}

            {/* Hour X-Axis Marks */}
            {[0, 3, 6, 9, 12, 15, 18, 21, 24].map((hour) => {
              const x = padding.left + (hour / 24) * innerWidth;
              const label = `${hour.toString().padStart(2, '0')}:00`;
              return (
                <g key={hour}>
                  <line
                    x1={x}
                    y1={padding.top + innerHeight}
                    x2={x}
                    y2={padding.top + innerHeight + 5}
                    className="stroke-slate-300 dark:stroke-slate-700"
                  />
                  <text
                    x={x}
                    y={padding.top + innerHeight + 18}
                    textAnchor="middle"
                    className="text-[10px] font-mono fill-slate-500 dark:fill-slate-400"
                  >
                    {label}
                  </text>
                </g>
              );
            })}

            {/* Benchmark Control Curve (if toggled) */}
            {compareWithControl && (
              <path
                d={getPath(benchmarkWave)}
                fill="none"
                stroke="#10b981"
                strokeWidth="1.8"
                strokeDasharray="4 2"
                opacity="0.85"
              />
            )}

            {/* Selected Patient Area Fill & Stroke */}
            <path
              d={getAreaPath(patientWave)}
              fill={isCondition ? 'url(#conditionGrad)' : 'url(#controlGrad)'}
            />
            <path
              d={getPath(patientWave)}
              fill="none"
              stroke={isCondition ? '#f43f5e' : '#10b981'}
              strokeWidth="2.2"
            />
          </svg>
        </div>

        {/* Circadian Parameter Grid (Tabular Numerals) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
          
          <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-lg">
            <div className="text-[11px] text-slate-500 dark:text-slate-400">Gece / Gündüz Oranı</div>
            <div className="text-xl font-bold font-mono tabular-nums text-slate-900 dark:text-white mt-1">
              {selectedPatient.restActivityRatio}
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">
              Normal Referans: &lt; 0.20
            </div>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-lg">
            <div className="text-[11px] text-slate-500 dark:text-slate-400">Ort. Gündüz Hareketi</div>
            <div className="text-xl font-bold font-mono tabular-nums text-slate-900 dark:text-white mt-1">
              {selectedPatient.meanDayActivity} <span className="text-xs text-slate-400 font-normal">cnt/dk</span>
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">
              Normal Referans: &gt; 400 cnt
            </div>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-lg">
            <div className="text-[11px] text-slate-500 dark:text-slate-400">Gece Motor Huzursuzluğu</div>
            <div className="text-xl font-bold font-mono tabular-nums text-slate-900 dark:text-white mt-1">
              {selectedPatient.meanNightActivity} <span className="text-xs text-slate-400 font-normal">cnt/dk</span>
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">
              Normal Referans: &lt; 40 cnt
            </div>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-lg">
            <div className="text-[11px] text-slate-500 dark:text-slate-400">Sirkadiyen Stabilite (IS)</div>
            <div className="text-xl font-bold font-mono tabular-nums text-slate-900 dark:text-white mt-1">
              {selectedPatient.interdailyStability}
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">
              IV: {selectedPatient.intradailyVariability}
            </div>
          </div>

        </div>

      </div>

      {/* Biological Explanation & Clinical Interpretation Card */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        
        <div className="md:col-span-4 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-800">
          <img
            src="/src/assets/images/actigraph_signal_analysis_1793780137823.jpg"
            alt="Aktigraf sinyal analizi ve sirkadiyen güç spektrumu"
            className="w-full h-auto object-cover aspect-4/3"
            referrerPolicy="no-referrer"
          />
        </div>

        <div className="md:col-span-8 space-y-3">
          <div className="text-xs font-semibold text-cyan-600 dark:text-cyan-400">
            Nörobiyolojik Mekanizma & Kronobiyoloji
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            Aktigraf Sinyalleri Neden Depresyonu %95+ Doğrulukla Tahmin Edebiliyor?
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            Major depresyon sadece psikolojik bir duygudurum bozukluğu değil; suprakiazmatik çekirdek (SCN)
            aracılı sirkadiyen ritim regülasyonunun ve motor korteks dopaminerjik aktivasyonunun bozulduğu sistemik bir
            rahatsızlıktır.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-600 dark:text-slate-400 pt-1">
            <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/50">
              <span className="font-semibold text-slate-900 dark:text-white block mb-0.5">Psikomotor Retardasyon</span>
              Gündüz piki (%45-60 azalma): Hasta uyanık olsa bile motor korteks inhibisyonu sebebiyle hareket frekansı düşer.
            </div>
            <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/50">
              <span className="font-semibold text-slate-900 dark:text-white block mb-0.5">Gece Motor Huzursuzluğu</span>
              REM uykusu parçalanması ve nocturnal uyanışlar gece aktivitesini sağlıklı bireylerin 2-3 katına çıkarır.
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
