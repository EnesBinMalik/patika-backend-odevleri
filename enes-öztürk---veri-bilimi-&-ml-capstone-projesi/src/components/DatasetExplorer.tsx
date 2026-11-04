/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import {
  Download,
  Upload,
  Search,
  ArrowUpDown,
  AlertCircle,
  BarChart3,
  TrendingUp,
  Table,
  CheckCircle2,
  FileSpreadsheet,
  Layers,
} from 'lucide-react';
import { DataRow, ColumnMetadata, DatasetPreset } from '../types/dataset';
import { DATASET_PRESETS } from '../data/sampleDatasets';

interface DatasetExplorerProps {
  currentPreset: DatasetPreset;
  onSelectPreset: (preset: DatasetPreset) => void;
  rawData: DataRow[];
  metadata: ColumnMetadata[];
  onUploadCustomCSV: (data: DataRow[], presetInfo: Partial<DatasetPreset>) => void;
  onProceedToPreprocessing: () => void;
}

export const DatasetExplorer: React.FC<DatasetExplorerProps> = ({
  currentPreset,
  onSelectPreset,
  rawData,
  metadata,
  onUploadCustomCSV,
  onProceedToPreprocessing,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortCol, setSortCol] = useState<string>(currentPreset.targetColumn);
  const [sortAsc, setSortAsc] = useState<boolean>(false);
  const [page, setPage] = useState(1);
  const [activeEdaTab, setActiveEdaTab] = useState<'distribution' | 'missing' | 'categories' | 'table'>('table');
  const pageSize = 10;

  // Filter & Sort Data
  const filteredData = useMemo(() => {
    let result = [...rawData];
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      result = result.filter(row =>
        Object.values(row).some(v => String(v).toLowerCase().includes(q))
      );
    }
    if (sortCol) {
      result.sort((a, b) => {
        const valA = a[sortCol];
        const valB = b[sortCol];
        if (valA === null || valA === undefined) return 1;
        if (valB === null || valB === undefined) return -1;
        if (typeof valA === 'number' && typeof valB === 'number') {
          return sortAsc ? valA - valB : valB - valA;
        }
        return sortAsc
          ? String(valA).localeCompare(String(valB))
          : String(valB).localeCompare(String(valA));
      });
    }
    return result;
  }, [rawData, searchTerm, sortCol, sortAsc]);

  const totalPages = Math.ceil(filteredData.length / pageSize) || 1;
  const paginatedRows = filteredData.slice((page - 1) * pageSize, page * pageSize);

  // Total missing values
  const totalMissingCells = useMemo(() => {
    return metadata.reduce((acc, col) => acc + col.missingCount, 0);
  }, [metadata]);

  // Target variable statistics
  const targetMeta = useMemo(() => {
    return metadata.find(m => m.name === currentPreset.targetColumn);
  }, [metadata, currentPreset.targetColumn]);

  // Export CSV
  const handleExportCSV = () => {
    if (!rawData.length) return;
    const headers = Object.keys(rawData[0]).join(',');
    const rows = rawData.map(r =>
      Object.values(r)
        .map(v => (v === null || v === undefined ? '' : typeof v === 'string' ? `"${v}"` : v))
        .join(',')
    );
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${currentPreset.id}_veri_seti.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Upload CSV
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = event => {
      const text = event.target?.result as string;
      if (!text) return;

      const lines = text.split('\n').filter(l => l.trim().length > 0);
      if (lines.length < 2) return;

      const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
      const parsedRows: DataRow[] = [];

      for (let i = 1; i < lines.length; i++) {
        const parts = lines[i].split(',').map(p => p.trim().replace(/^"|"$/g, ''));
        const row: DataRow = { id: i };
        headers.forEach((h, idx) => {
          const rawVal = parts[idx];
          if (rawVal === undefined || rawVal === '') {
            row[h] = null;
          } else if (!isNaN(Number(rawVal))) {
            row[h] = Number(rawVal);
          } else {
            row[h] = rawVal;
          }
        });
        parsedRows.push(row);
      }

      // Guess target column (last numeric column)
      const numericCols = headers.filter(h => typeof parsedRows[0][h] === 'number');
      const targetCol = numericCols[numericCols.length - 1] || headers[headers.length - 1];

      onUploadCustomCSV(parsedRows, {
        id: 'custom-csv',
        title: file.name.replace(/\.[^/.]+$/, ''),
        targetColumn: targetCol,
        targetLabel: targetCol,
      });
    };
    reader.readAsText(file);
  };

  // Grouped average for top categorical feature (e.g. ilce or marka)
  const categoryAverages = useMemo(() => {
    const catCol = metadata.find(m => m.type === 'categorical' && m.name !== 'id')?.name;
    if (!catCol || !targetMeta) return [];

    const map: Record<string, { sum: number; count: number }> = {};
    rawData.forEach(r => {
      const key = String(r[catCol] || 'Bilinmiyor');
      const val = Number(r[currentPreset.targetColumn] || 0);
      if (!map[key]) map[key] = { sum: 0, count: 0 };
      map[key].sum += val;
      map[key].count += 1;
    });

    return Object.entries(map)
      .map(([label, data]) => ({
        label,
        avg: Math.round(data.sum / data.count),
        count: data.count,
      }))
      .sort((a, b) => b.avg - a.avg);
  }, [rawData, metadata, targetMeta, currentPreset.targetColumn]);

  return (
    <div className="space-y-6">
      {/* Step Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-indigo-400 uppercase tracking-wider mb-1">
            <span>Adım 1 / 5</span>
            <span aria-hidden="true">·</span>
            <span>Veri Temini & Keşifçi Veri Analizi</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Veri Setini İndirme, Okuma ve İnceleme
          </h1>
          <p className="text-sm text-slate-400 mt-1 max-w-3xl">
            Projenin ilk aşamasında ilgilendiğimiz problem için veri setini yüklüyor, değişkenlerin tiplerini, eksik veri oranlarını ve hedef değişken dağılımını analiz ediyoruz.
          </p>
        </div>

        {/* Dataset Preset Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {DATASET_PRESETS.map(preset => (
            <button
              key={preset.id}
              onClick={() => onSelectPreset(preset)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
                currentPreset.id === preset.id
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-900 text-slate-300 border border-slate-800 hover:bg-slate-800'
              }`}
            >
              {preset.title.split(' ')[0]} {preset.title.split(' ')[1]}
            </button>
          ))}

          <label className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-slate-900 text-slate-300 border border-slate-800 rounded-lg hover:bg-slate-800 cursor-pointer transition-colors">
            <Upload className="w-3.5 h-3.5 text-slate-400" />
            <span>Kendi CSV'ni Yükle</span>
            <input type="file" accept=".csv" className="hidden" onChange={handleFileUpload} />
          </label>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-slate-900 text-slate-300 border border-slate-800 rounded-lg hover:bg-slate-800 cursor-pointer transition-colors"
            title="Ham CSV dosyasını bilgisayarınıza indirir"
          >
            <Download className="w-3.5 h-3.5 text-slate-400" />
            <span>CSV İndir</span>
          </button>
        </div>
      </div>

      {/* Dataset Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl">
          <div className="text-xs text-slate-400">Toplam Gözlem (Satır)</div>
          <div className="text-2xl font-bold font-mono tabular-nums text-white mt-1">
            {rawData.length.toLocaleString('tr-TR')}
          </div>
          <div className="text-xs text-slate-400 mt-1">Örnek veri büyüklüğü</div>
        </div>

        <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl">
          <div className="text-xs text-slate-400">Değişken Sayısı (Sütun)</div>
          <div className="text-2xl font-bold font-mono tabular-nums text-white mt-1">
            {metadata.length}
          </div>
          <div className="text-xs text-slate-400 mt-1">
            {metadata.filter(m => m.type === 'numeric').length} Sayısal, {metadata.filter(m => m.type === 'categorical').length} Kategorik
          </div>
        </div>

        <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl">
          <div className="text-xs text-slate-400">Toplam Eksik Değer</div>
          <div className="text-2xl font-bold font-mono tabular-nums text-amber-400 mt-1">
            {totalMissingCells}
          </div>
          <div className="text-xs text-slate-400 mt-1">
            Adım 2'de imputer ile doldurulacak
          </div>
        </div>

        <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl">
          <div className="text-xs text-slate-400">Hedef Değişken Aralığı</div>
          <div className="text-lg font-bold font-mono tabular-nums text-indigo-300 mt-1 truncate">
            {targetMeta?.min?.toLocaleString('tr-TR')} - {targetMeta?.max?.toLocaleString('tr-TR')} {currentPreset.targetUnit}
          </div>
          <div className="text-xs text-slate-400 mt-1">
            Ort: {targetMeta?.mean?.toLocaleString('tr-TR')} {currentPreset.targetUnit}
          </div>
        </div>
      </div>

      {/* EDA Section Tabs */}
      <div className="bg-slate-900/40 border border-slate-800 rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-950/40">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveEdaTab('table')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                activeEdaTab === 'table'
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Table className="w-3.5 h-3.5" />
              <span>Veri Tablosu</span>
            </button>
            <button
              onClick={() => setActiveEdaTab('distribution')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                activeEdaTab === 'distribution'
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Hedef Dağılımı (Skewness)</span>
            </button>
            <button
              onClick={() => setActiveEdaTab('missing')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                activeEdaTab === 'missing'
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <AlertCircle className="w-3.5 h-3.5" />
              <span>Eksik Veri Analizi</span>
            </button>
            <button
              onClick={() => setActiveEdaTab('categories')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                activeEdaTab === 'categories'
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Kategori Fiyat Kıyaslaması</span>
            </button>
          </div>

          {activeEdaTab === 'table' && (
            <div className="relative w-64">
              <Search className="w-4 h-4 absolute left-2.5 top-2.5 text-slate-500" />
              <input
                type="text"
                value={searchTerm}
                onChange={e => {
                  setSearchTerm(e.target.value);
                  setPage(1);
                }}
                placeholder="Veride filtrele/ara..."
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-900 border border-slate-700 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>
          )}
        </div>

        {/* Tab 1: Interactive Table */}
        {activeEdaTab === 'table' && (
          <div className="p-4 space-y-3">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 bg-slate-900/60 font-medium">
                    <th className="py-2.5 px-3">#ID</th>
                    {metadata.map(col => (
                      <th
                        key={col.name}
                        onClick={() => {
                          if (sortCol === col.name) {
                            setSortAsc(!sortAsc);
                          } else {
                            setSortCol(col.name);
                            setSortAsc(true);
                          }
                        }}
                        className="py-2.5 px-3 cursor-pointer hover:text-slate-200 transition-colors whitespace-nowrap"
                      >
                        <div className="flex items-center gap-1">
                          <span>{col.label}</span>
                          {sortCol === col.name && (
                            <ArrowUpDown className="w-3 h-3 text-indigo-400" />
                          )}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  {paginatedRows.map(row => (
                    <tr key={row.id} className="hover:bg-slate-900/40 transition-colors">
                      <td className="py-2 px-3 font-mono text-slate-400 tabular-nums">{row.id}</td>
                      {metadata.map(col => {
                        const val = row[col.name];
                        const isNull = val === null || val === undefined || val === '';
                        const isTarget = col.name === currentPreset.targetColumn;

                        return (
                          <td
                            key={col.name}
                            className={`py-2 px-3 whitespace-nowrap font-mono tabular-nums ${
                              isTarget ? 'font-semibold text-indigo-300 bg-indigo-950/20' : ''
                            }`}
                          >
                            {isNull ? (
                              <span className="text-amber-400/80 text-[11px] italic">null (eksik)</span>
                            ) : typeof val === 'number' ? (
                              val.toLocaleString('tr-TR')
                            ) : (
                              String(val)
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800">
              <div>
                Toplam <span className="text-slate-200 font-mono tabular-nums">{filteredData.length}</span> kayıttan{' '}
                <span className="text-slate-200 font-mono tabular-nums">{(page - 1) * pageSize + 1}</span> -{' '}
                <span className="text-slate-200 font-mono tabular-nums">
                  {Math.min(page * pageSize, filteredData.length)}
                </span>{' '}
                arası gösteriliyor
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-2.5 py-1 rounded bg-slate-900 border border-slate-800 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-800"
                >
                  Önceki
                </button>
                <span className="px-2 font-mono tabular-nums text-slate-300">
                  {page} / {totalPages}
                </span>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-2.5 py-1 rounded bg-slate-900 border border-slate-800 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-800"
                >
                  Sonraki
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Target Distribution & Skewness */}
        {activeEdaTab === 'distribution' && (
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl space-y-3">
                <h3 className="text-sm font-semibold text-slate-200 flex items-center justify-between">
                  <span>Doğrusal Fiyat Dağılımı (Linear Scale)</span>
                  <span className="text-xs text-amber-400 font-normal">Belirgin Sağa Çarpık (Right-Skewed)</span>
                </h3>
                <p className="text-xs text-slate-400">
                  Fiyat dağılımı yüksek bütçeli lüks villalar (örn: 98.5M ₺) ve ekstrem aykırı değerler nedeniyle sağa uzayan uzun bir kuyruğa sahiptir. Standart regresyonda bu durum modelin katsayılarını saptırır.
                </p>
                {/* Visual bar distribution */}
                <div className="h-44 flex items-end gap-1.5 pt-6 pb-2 px-2 border-b border-slate-800">
                  {[45, 62, 50, 34, 22, 14, 8, 5, 2, 1].map((count, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1">
                      <div
                        style={{ height: `${(count / 65) * 100}%` }}
                        className="w-full bg-indigo-500/80 hover:bg-indigo-400 rounded-t transition-all"
                        title={`Bin ${i + 1}: ${count} gözlem`}
                      />
                      <span className="text-[10px] font-mono text-slate-400">
                        {i === 0 ? '1.5M' : i === 9 ? '98M' : ''}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
                  <span>Düşük Fiyat Aralığı</span>
                  <span>Aykırı Değerler (Outliers) →</span>
                </div>
              </div>

              <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl space-y-3">
                <h3 className="text-sm font-semibold text-slate-200 flex items-center justify-between">
                  <span>Logaritmik Dönüşüm (Log1p Transform)</span>
                  <span className="text-xs text-emerald-400 font-normal">Normale Yakın Çan Eğrisi (Gaussian)</span>
                </h3>
                <p className="text-xs text-slate-400">
                  $\log(1 + y)$ dönüşümü uygulandığında varyans stabilize olur, aykırı değerlerin aşırı baskısı kırılır ve RMSLE hata metriği hedeflendiğinde modeller çok daha yüksek genelleme başarısına ulaşır.
                </p>
                <div className="h-44 flex items-end gap-1.5 pt-6 pb-2 px-2 border-b border-slate-800">
                  {[4, 12, 28, 48, 56, 42, 24, 11, 5, 2].map((count, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1">
                      <div
                        style={{ height: `${(count / 60) * 100}%` }}
                        className="w-full bg-emerald-500/80 hover:bg-emerald-400 rounded-t transition-all"
                        title={`Log Bin ${i + 1}: ${count} gözlem`}
                      />
                      <span className="text-[10px] font-mono text-slate-400">
                        {i === 4 ? 'Medyan' : ''}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
                  <span>log(y) = 14.2</span>
                  <span>log(y) = 18.4</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Missing Value Summary */}
        {activeEdaTab === 'missing' && (
          <div className="p-6 space-y-4">
            <h3 className="text-sm font-semibold text-slate-200">
              Değişken Bazında Eksik Değer Dağılımı (Missing Value Matrix)
            </h3>
            <p className="text-xs text-slate-400">
              Gerçek hayat verilerinde eksik değerler kaçınılmazdır. Sütunların eksiklik oranları incelenerek Adım 2'de uygulanacak medyan veya KNN imputer stratejisi belirlenir.
            </p>

            <div className="space-y-3 pt-2">
              {metadata.map(col => (
                <div key={col.name} className="p-3 bg-slate-950/60 border border-slate-800 rounded-lg">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="font-semibold text-slate-300">{col.label} ({col.name})</span>
                    <span className="font-mono tabular-nums text-slate-400">
                      {col.missingCount} eksik ({col.missingPercentage}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden flex">
                    <div
                      style={{ width: `${100 - col.missingPercentage}%` }}
                      className="bg-indigo-600 h-full"
                      title="Dolu Gözlemler"
                    />
                    <div
                      style={{ width: `${col.missingPercentage}%` }}
                      className="bg-amber-400 h-full"
                      title="Eksik Gözlemler"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 4: Categories Average */}
        {activeEdaTab === 'categories' && (
          <div className="p-6 space-y-4">
            <h3 className="text-sm font-semibold text-slate-200">
              Kategori / İlçe Bazında Ortalama Fiyat Kıyaslaması
            </h3>
            <p className="text-xs text-slate-400">
              Kategorik değişkenlerin hedef değişken üzerindeki varyans farkı, One-Hot Encoding ve Target Encoding algoritmalarının etkinliğini doğrudan belirler.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-2">
              {categoryAverages.map(item => (
                <div key={item.label} className="p-3 bg-slate-950/60 border border-slate-800 rounded-lg flex items-center justify-between">
                  <div>
                    <div className="text-xs font-semibold text-slate-200">{item.label}</div>
                    <div className="text-[11px] text-slate-400 font-mono">{item.count} ilan kaydı</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-bold font-mono text-indigo-400 tabular-nums">
                      {item.avg.toLocaleString('tr-TR')} {currentPreset.targetUnit}
                    </div>
                    <div className="text-[10px] text-slate-400">Ortalama</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Action Next Step */}
      <div className="flex items-center justify-between p-4 bg-indigo-950/20 border border-indigo-500/30 rounded-xl">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-semibold text-indigo-300">1. Adım Tamamlandı: Veri İncelemesi Başarılı</div>
            <div className="text-xs text-slate-400">Sırada: Eksik verileri doldurma, kategorik kodlama ve aykırı değerleri (outliers) temizleme var.</div>
          </div>
        </div>

        <button
          onClick={onProceedToPreprocessing}
          className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors cursor-pointer shrink-0 shadow-sm shadow-indigo-600/20"
        >
          2. Adıma Geç (Önişleme & Outlier) →
        </button>
      </div>
    </div>
  );
};
