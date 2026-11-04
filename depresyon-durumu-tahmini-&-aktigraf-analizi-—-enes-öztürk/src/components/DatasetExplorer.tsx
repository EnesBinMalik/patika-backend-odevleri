import React, { useState, useMemo } from 'react';
import { PatientRecord } from '../types/depression';
import { Search, Filter, ArrowUpDown, ChevronRight, Activity, Download, ExternalLink } from 'lucide-react';

interface DatasetExplorerProps {
  patients: PatientRecord[];
  onSelectPatient: (patientId: string) => void;
}

export const DatasetExplorer: React.FC<DatasetExplorerProps> = ({
  patients,
  onSelectPatient,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterGroup, setFilterGroup] = useState<'all' | 'condition' | 'control'>('all');
  const [sortField, setSortField] = useState<keyof PatientRecord>('madrs1');
  const [sortAsc, setSortAsc] = useState<boolean>(false);

  const filteredPatients = useMemo(() => {
    return patients
      .filter((p) => {
        if (filterGroup !== 'all' && p.group !== filterGroup) return false;
        if (searchTerm) {
          const term = searchTerm.toLowerCase();
          return (
            p.id.toLowerCase().includes(term) ||
            p.genderLabel.toLowerCase().includes(term) ||
            p.afftypeLabel.toLowerCase().includes(term) ||
            p.ageGroup.includes(term)
          );
        }
        return true;
      })
      .sort((a, b) => {
        const valA = a[sortField];
        const valB = b[sortField];
        if (valA === undefined || valA === null) return 1;
        if (valB === undefined || valB === null) return -1;
        if (typeof valA === 'number' && typeof valB === 'number') {
          return sortAsc ? valA - valB : valB - valA;
        }
        return sortAsc
          ? String(valA).localeCompare(String(valB))
          : String(valB).localeCompare(String(valA));
      });
  }, [patients, filterGroup, searchTerm, sortField, sortAsc]);

  const handleSort = (field: keyof PatientRecord) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  // Group statistics
  const conditionStats = useMemo(() => {
    const list = patients.filter((p) => p.group === 'condition');
    const avgAct = list.reduce((acc, p) => acc + p.meanActivity24h, 0) / list.length;
    const avgMadrs = list.reduce((acc, p) => acc + p.madrs1, 0) / list.length;
    const avgRatio = list.reduce((acc, p) => acc + p.restActivityRatio, 0) / list.length;
    return { count: list.length, avgAct: Math.round(avgAct), avgMadrs: Math.round(avgMadrs * 10) / 10, avgRatio: Math.round(avgRatio * 1000) / 1000 };
  }, [patients]);

  const controlStats = useMemo(() => {
    const list = patients.filter((p) => p.group === 'control');
    const avgAct = list.reduce((acc, p) => acc + p.meanActivity24h, 0) / list.length;
    const avgMadrs = list.reduce((acc, p) => acc + p.madrs1, 0) / list.length;
    const avgRatio = list.reduce((acc, p) => acc + p.restActivityRatio, 0) / list.length;
    return { count: list.length, avgAct: Math.round(avgAct), avgMadrs: Math.round(avgMadrs * 10) / 10, avgRatio: Math.round(avgRatio * 1000) / 1000 };
  }, [patients]);

  const downloadCSV = () => {
    const headers = [
      'id',
      'group',
      'gender',
      'ageGroup',
      'afftype',
      'madrs1',
      'madrs2',
      'meanActivity24h',
      'meanDayActivity',
      'meanNightActivity',
      'restActivityRatio',
      'zeroActivityRatio',
      'interdailyStability',
      'intradailyVariability',
    ];
    const rows = filteredPatients.map((p) => [
      p.id,
      p.group,
      p.genderLabel,
      p.ageGroup,
      p.afftypeLabel,
      p.madrs1,
      p.madrs2,
      p.meanActivity24h,
      p.meanDayActivity,
      p.meanNightActivity,
      p.restActivityRatio,
      p.zeroActivityRatio,
      p.interdailyStability,
      p.intradailyVariability,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'kaggle_depression_dataset_scores.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      
      {/* Title & Section Description */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs text-slate-500 dark:text-slate-400">Adım 1 · Veriyi İndirme & Okuma</div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white mt-1">
            The Depression Dataset (Kaggle) ve Klinik Öznitelikler
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-3xl">
            Kaggle üzerindeki Arashnic / Garcia-Ceja et al. veri seti, 23 klinik depresyon teşhisi konmuş hasta ile
            32 sağlıklı kontrol bireyinin günlerce kaydedilen aktimetre verilerini ve klinik MADRS skorlarını içerir.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <a
            href="https://www.kaggle.com/arashnic/the-depression-dataset"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-lg transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Kaggle Sayfası</span>
          </a>

          <button
            onClick={downloadCSV}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-white bg-slate-900 dark:bg-slate-100 dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-white rounded-lg transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>CSV Olarak İndir</span>
          </button>
        </div>
      </div>

      {/* Group Comparison Benchmark Strip */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Depresyon / Condition Grubu */}
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
              <span className="text-sm font-bold text-slate-900 dark:text-white">Depresyon Grubu (Condition)</span>
            </div>
            <span className="text-xs font-mono text-slate-500">{conditionStats.count} Katılımcı</span>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center pt-1 border-t border-slate-100 dark:border-slate-800">
            <div>
              <div className="text-[11px] text-slate-500">Ort. 24s Aktivite</div>
              <div className="text-base font-bold font-mono tabular-nums text-rose-600 dark:text-rose-400">
                {conditionStats.avgAct} <span className="text-[10px] text-slate-400">cnt/dk</span>
              </div>
            </div>
            <div>
              <div className="text-[11px] text-slate-500">Ort. MADRS Skoru</div>
              <div className="text-base font-bold font-mono tabular-nums text-rose-600 dark:text-rose-400">
                {conditionStats.avgMadrs} <span className="text-[10px] text-slate-400">/60</span>
              </div>
            </div>
            <div>
              <div className="text-[11px] text-slate-500">Gece/Gündüz Oranı</div>
              <div className="text-base font-bold font-mono tabular-nums text-rose-600 dark:text-rose-400">
                {conditionStats.avgRatio}
              </div>
            </div>
          </div>
          <div className="text-xs text-slate-500">
            Klinik Bulgusu: Ağır psikomotor yavaşlama (düşük gündüz aktivitesi) ve gece huzursuzluğu nedeniyle yüksek Gece/Gündüz oranı.
          </div>
        </div>

        {/* Kontrol Grubu */}
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span className="text-sm font-bold text-slate-900 dark:text-white">Kontrol Grubu (Sağlıklı)</span>
            </div>
            <span className="text-xs font-mono text-slate-500">{controlStats.count} Katılımcı</span>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center pt-1 border-t border-slate-100 dark:border-slate-800">
            <div>
              <div className="text-[11px] text-slate-500">Ort. 24s Aktivite</div>
              <div className="text-base font-bold font-mono tabular-nums text-emerald-600 dark:text-emerald-400">
                {controlStats.avgAct} <span className="text-[10px] text-slate-400">cnt/dk</span>
              </div>
            </div>
            <div>
              <div className="text-[11px] text-slate-500">Ort. MADRS Skoru</div>
              <div className="text-base font-bold font-mono tabular-nums text-emerald-600 dark:text-emerald-400">
                {controlStats.avgMadrs} <span className="text-[10px] text-slate-400">/60</span>
              </div>
            </div>
            <div>
              <div className="text-[11px] text-slate-500">Gece/Gündüz Oranı</div>
              <div className="text-base font-bold font-mono tabular-nums text-emerald-600 dark:text-emerald-400">
                {controlStats.avgRatio}
              </div>
            </div>
          </div>
          <div className="text-xs text-slate-500">
            Klinik Bulgusu: Sağlıklı sirkadiyen döngü, belirgin gündüz hareket piki ve derin gece motor istirahati (düşük gece oranı).
          </div>
        </div>

      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
        
        {/* Interactive Segmented Filter (Allowed functional button tabs) */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
          <button
            onClick={() => setFilterGroup('all')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap ${
              filterGroup === 'all'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Tüm Hastalar ({patients.length})
          </button>
          <button
            onClick={() => setFilterGroup('condition')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap ${
              filterGroup === 'condition'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Depresyon (23)
          </button>
          <button
            onClick={() => setFilterGroup('control')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap ${
              filterGroup === 'control'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Kontrol (32)
          </button>
        </div>

        {/* Search Input */}
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Hasta ID, yaş, cinsiyet ara..."
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-cyan-500"
          />
        </div>

      </div>

      {/* Dataset Table with Tabular Numerals */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden bg-white dark:bg-slate-900 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 select-none">
              <tr>
                <th
                  onClick={() => handleSort('id')}
                  className="py-3 px-4 font-semibold cursor-pointer hover:text-slate-900 dark:hover:text-white"
                >
                  <div className="flex items-center gap-1">
                    <span>Hasta ID</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3 px-4 font-semibold">Grup / Durum</th>
                <th className="py-3 px-4 font-semibold">Cinsiyet & Yaş</th>
                <th className="py-3 px-4 font-semibold">Duygudurum Tipi</th>
                <th
                  onClick={() => handleSort('madrs1')}
                  className="py-3 px-4 font-semibold cursor-pointer hover:text-slate-900 dark:hover:text-white"
                >
                  <div className="flex items-center gap-1">
                    <span>MADRS-1 Skoru</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('meanActivity24h')}
                  className="py-3 px-4 font-semibold cursor-pointer hover:text-slate-900 dark:hover:text-white"
                >
                  <div className="flex items-center gap-1">
                    <span>24s Ortalama Aktivite</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('restActivityRatio')}
                  className="py-3 px-4 font-semibold cursor-pointer hover:text-slate-900 dark:hover:text-white"
                >
                  <div className="flex items-center gap-1">
                    <span>Gece/Gündüz Oranı</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3 px-4 font-semibold">Sirkadiyen IV / IS</th>
                <th className="py-3 px-4 font-semibold text-right">Aktigraf İncele</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
              {filteredPatients.map((p) => {
                const isCondition = p.group === 'condition';
                return (
                  <tr
                    key={p.id}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors"
                  >
                    <td className="py-3 px-4 font-mono font-medium text-slate-900 dark:text-white">
                      {p.id}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`font-medium ${isCondition ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                        {isCondition ? 'Depresyon' : 'Kontrol'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span>{p.genderLabel}</span>
                      <span className="text-slate-400 mx-1">·</span>
                      <span className="font-mono">{p.ageGroup}</span>
                    </td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                      {p.afftypeLabel}
                    </td>
                    <td className="py-3 px-4 font-mono tabular-nums font-semibold">
                      <span className={p.madrs1 > 20 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-700 dark:text-slate-300'}>
                        {p.madrs1}
                      </span>
                      <span className="text-slate-400 text-[10px] ml-1">/ 60</span>
                    </td>
                    <td className="py-3 px-4 font-mono tabular-nums">
                      {p.meanActivity24h} <span className="text-slate-400 text-[10px]">cnt</span>
                    </td>
                    <td className="py-3 px-4 font-mono tabular-nums">
                      <span className={p.restActivityRatio > 0.3 ? 'text-amber-600 dark:text-amber-400 font-semibold' : ''}>
                        {p.restActivityRatio}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono tabular-nums text-slate-500">
                      IV: {p.intradailyVariability} · IS: {p.interdailyStability}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => onSelectPatient(p.id)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-cyan-600 dark:text-cyan-400 hover:text-cyan-700 hover:bg-cyan-50 dark:hover:bg-cyan-950/60 rounded-md transition-colors cursor-pointer"
                      >
                        <Activity className="w-3.5 h-3.5" />
                        <span>Dalgayı Gör</span>
                        <ChevronRight className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
