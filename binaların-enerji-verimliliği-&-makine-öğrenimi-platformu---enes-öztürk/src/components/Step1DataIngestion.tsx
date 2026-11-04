import React, { useState, useMemo } from 'react';
import { BuildingDataPoint, ENERGY_DATASET, FEATURES_METADATA } from '../data/energyDataset';
import { Download, Search, CheckCircle2, Database, Table, BarChart } from 'lucide-react';

export const Step1DataIngestion: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 10;

  // Filter dataset based on search term
  const filteredData = useMemo(() => {
    if (!searchTerm.trim()) return ENERGY_DATASET;
    const term = searchTerm.toLowerCase();
    return ENERGY_DATASET.filter(d => 
      d.id.toString().includes(term) ||
      d.orientationLabel.toLowerCase().includes(term) ||
      d.distributionLabel.toLowerCase().includes(term) ||
      d.overallHeight.toString().includes(term)
    );
  }, [searchTerm]);

  const totalPages = Math.ceil(filteredData.length / pageSize);
  const paginatedData = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredData.slice(start, start + pageSize);
  }, [filteredData, page]);

  // Compute statistical summary
  const stats = useMemo(() => {
    return FEATURES_METADATA.map(meta => {
      const vals = ENERGY_DATASET.map(d => Number(d[meta.key as keyof BuildingDataPoint])).sort((a, b) => a - b);
      const sum = vals.reduce((a, b) => a + b, 0);
      const mean = sum / vals.length;
      const variance = vals.reduce((acc, v) => acc + Math.pow(v - mean, 2), 0) / vals.length;
      const std = Math.sqrt(variance);
      const min = vals[0];
      const max = vals[vals.length - 1];
      const p25 = vals[Math.floor(vals.length * 0.25)];
      const median = vals[Math.floor(vals.length * 0.50)];
      const p75 = vals[Math.floor(vals.length * 0.75)];

      return {
        ...meta,
        mean: Number(mean.toFixed(2)),
        std: Number(std.toFixed(2)),
        min: Number(min.toFixed(2)),
        p25: Number(p25.toFixed(2)),
        median: Number(median.toFixed(2)),
        p75: Number(p75.toFixed(2)),
        max: Number(max.toFixed(2))
      };
    });
  }, []);

  const downloadCSV = () => {
    const headers = [
      'ID',
      'X1_Relative_Compactness',
      'X2_Surface_Area',
      'X3_Wall_Area',
      'X4_Roof_Area',
      'X5_Overall_Height',
      'X6_Orientation',
      'X7_Glazing_Area',
      'X8_Glazing_Area_Distribution',
      'Y1_Heating_Load',
      'Y2_Cooling_Load'
    ];
    const rows = ENERGY_DATASET.map(d => [
      d.id,
      d.relativeCompactness,
      d.surfaceArea,
      d.wallArea,
      d.roofArea,
      d.overallHeight,
      d.orientation,
      d.glazingArea,
      d.glazingAreaDistribution,
      d.heatingLoad,
      d.coolingLoad
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'energy_efficiency_768_buildings_enes_ozturk.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8">
      {/* Step Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800">
              <span>ADIM 1</span>
              <span aria-hidden="true">·</span>
              <span>Kullanılacak Veriyi İndirme & Okuma</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 mt-1">
              UCI Energy Efficiency (768 Simüle Bina) Veri Seti
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Kaggle / UCI Tsanas & Xifara tarafından EnergyPlus yazılımı ile simüle edilmiş 12 farklı bina formu ve 768 kombinasyon.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={downloadCSV}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors cursor-pointer border border-emerald-200"
            >
              <Download className="w-4 h-4" />
              <span>Veriyi İndir (768 CSV)</span>
            </button>
          </div>
        </div>

        {/* Ingestion KPI Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <div className="p-4 rounded-lg bg-slate-50 border border-slate-200/80">
            <div className="text-xs text-slate-500 font-medium">Toplam Gözlem</div>
            <div className="text-2xl font-bold text-slate-900 font-mono tabular-nums mt-1">768</div>
            <div className="text-xs text-slate-500 mt-1">Bina simülasyon kaydı</div>
          </div>
          <div className="p-4 rounded-lg bg-slate-50 border border-slate-200/80">
            <div className="text-xs text-slate-500 font-medium">Giriş Özellikleri (X)</div>
            <div className="text-2xl font-bold text-slate-900 font-mono tabular-nums mt-1">8 Değişken</div>
            <div className="text-xs text-slate-500 mt-1">Geometri & Cam mimarisi</div>
          </div>
          <div className="p-4 rounded-lg bg-slate-50 border border-slate-200/80">
            <div className="text-xs text-slate-500 font-medium">Hedef Yükler (Y)</div>
            <div className="text-2xl font-bold text-slate-900 font-mono tabular-nums mt-1">2 Hedef</div>
            <div className="text-xs text-slate-500 mt-1">Isıtma (Y1) & Soğutma (Y2)</div>
          </div>
          <div className="p-4 rounded-lg bg-emerald-50/60 border border-emerald-200">
            <div className="text-xs text-emerald-800 font-medium flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Eksik Değer Durumu</span>
            </div>
            <div className="text-2xl font-bold text-emerald-900 font-mono tabular-nums mt-1">%0.0 Eksik</div>
            <div className="text-xs text-emerald-700 mt-1">Kayıp veri yok (Tam veri)</div>
          </div>
        </div>
      </div>

      {/* Statistical Summary Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Keşifçi Veri Analizi (EDA) - Betimsel İstatistikler</h3>
            <p className="text-xs text-slate-500">Her değişkenin ortalama, standart sapma, min, çeyreklik ve maks dağılımı</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 uppercase font-semibold">
              <tr>
                <th className="py-3 px-4">Kod</th>
                <th className="py-3 px-4">Özellik Adı</th>
                <th className="py-3 px-4">Birim</th>
                <th className="py-3 px-4 text-right">Ortalama</th>
                <th className="py-3 px-4 text-right">Std Sapma</th>
                <th className="py-3 px-4 text-right">Min</th>
                <th className="py-3 px-4 text-right">25% (Q1)</th>
                <th className="py-3 px-4 text-right">50% (Medyan)</th>
                <th className="py-3 px-4 text-right">75% (Q3)</th>
                <th className="py-3 px-4 text-right">Maks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {stats.map((s) => (
                <tr key={s.code} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-2.5 px-4 font-mono font-bold text-slate-900">{s.code}</td>
                  <td className="py-2.5 px-4">
                    <span className="font-semibold text-slate-800">{s.nameTr}</span>
                    <span className="text-[11px] text-slate-400 block">{s.nameEn}</span>
                  </td>
                  <td className="py-2.5 px-4 font-mono text-slate-500">{s.unit}</td>
                  <td className="py-2.5 px-4 text-right font-mono tabular-nums">{s.mean}</td>
                  <td className="py-2.5 px-4 text-right font-mono tabular-nums">{s.std}</td>
                  <td className="py-2.5 px-4 text-right font-mono tabular-nums">{s.min}</td>
                  <td className="py-2.5 px-4 text-right font-mono tabular-nums">{s.p25}</td>
                  <td className="py-2.5 px-4 text-right font-mono tabular-nums font-semibold text-emerald-700">{s.median}</td>
                  <td className="py-2.5 px-4 text-right font-mono tabular-nums">{s.p75}</td>
                  <td className="py-2.5 px-4 text-right font-mono tabular-nums">{s.max}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Raw Data Table with Search & Pagination */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Table className="w-4 h-4 text-slate-600" />
            <h3 className="text-sm font-bold text-slate-900">768 Bina Örneği Gezgini</h3>
            <span className="text-xs text-slate-400 font-mono">({filteredData.length} kayıt)</span>
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="ID, yön veya yük filtrele..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
              className="pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-600 w-56"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-semibold font-mono">
              <tr>
                <th className="py-2.5 px-3">#ID</th>
                <th className="py-2.5 px-3 text-right">X1 (Kompaktlık)</th>
                <th className="py-2.5 px-3 text-right">X2 (Yüzey m²)</th>
                <th className="py-2.5 px-3 text-right">X3 (Duvar m²)</th>
                <th className="py-2.5 px-3 text-right">X4 (Çatı m²)</th>
                <th className="py-2.5 px-3 text-right">X5 (Yükseklik m)</th>
                <th className="py-2.5 px-3">X6 (Yönelim)</th>
                <th className="py-2.5 px-3 text-right">X7 (Cam)</th>
                <th className="py-2.5 px-3">X8 (Cam Dağılımı)</th>
                <th className="py-2.5 px-3 text-right text-amber-700 bg-amber-50/50">Y1 Isıtma (kWh/m²)</th>
                <th className="py-2.5 px-3 text-right text-indigo-700 bg-indigo-50/50">Y2 Soğutma (kWh/m²)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {paginatedData.map((d) => (
                <tr key={d.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-2 px-3 text-slate-500">#{d.id}</td>
                  <td className="py-2 px-3 text-right tabular-nums">{d.relativeCompactness}</td>
                  <td className="py-2 px-3 text-right tabular-nums">{d.surfaceArea}</td>
                  <td className="py-2 px-3 text-right tabular-nums">{d.wallArea}</td>
                  <td className="py-2 px-3 text-right tabular-nums">{d.roofArea}</td>
                  <td className="py-2 px-3 text-right tabular-nums font-bold">{d.overallHeight}</td>
                  <td className="py-2 px-3 font-sans text-slate-700">{d.orientationLabel}</td>
                  <td className="py-2 px-3 text-right tabular-nums">{d.glazingArea}</td>
                  <td className="py-2 px-3 font-sans text-slate-700">{d.distributionLabel}</td>
                  <td className="py-2 px-3 text-right font-bold text-amber-800 bg-amber-50/30 tabular-nums">
                    {d.heatingLoad}
                  </td>
                  <td className="py-2 px-3 text-right font-bold text-indigo-800 bg-indigo-50/30 tabular-nums">
                    {d.coolingLoad}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination controls */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <div>
            Sayfa <span className="font-semibold text-slate-800 font-mono">{page}</span> / <span className="font-mono">{totalPages}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1 rounded bg-white border border-slate-200 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer font-medium"
            >
              Önceki
            </button>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-3 py-1 rounded bg-white border border-slate-200 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer font-medium"
            >
              Sonraki
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
