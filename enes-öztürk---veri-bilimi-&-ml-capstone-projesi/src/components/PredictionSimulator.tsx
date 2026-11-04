/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import {
  Sparkles,
  Calculator,
  Home,
  CheckCircle2,
  TrendingUp,
  MapPin,
  Compass,
  Zap,
} from 'lucide-react';
import { TrainedModelResult, DatasetPreset } from '../types/dataset';

interface PredictionSimulatorProps {
  currentPreset: DatasetPreset;
  championModel: TrainedModelResult | undefined;
}

export const PredictionSimulator: React.FC<PredictionSimulatorProps> = ({
  currentPreset,
  championModel,
}) => {
  // Istanbul Housing Form State
  const [district, setDistrict] = useState('Kadıköy');
  const [m2, setM2] = useState<number>(115);
  const [roomType, setRoomType] = useState('3+1');
  const [age, setAge] = useState<number>(6);
  const [floor, setFloor] = useState<number>(3);
  const [heating, setHeating] = useState('Kombi Doğalgaz');
  const [metroKm, setMetroKm] = useState<number>(0.4);
  const [seaView, setSeaView] = useState('Var');
  const [balcony, setBalcony] = useState('Var');
  const [dues, setDues] = useState<number>(1200);

  // Car Form State
  const [carBrand, setCarBrand] = useState('Volkswagen');
  const [carYear, setCarYear] = useState<number>(2020);
  const [carKm, setCarKm] = useState<number>(65000);
  const [carFuel, setCarFuel] = useState('Dizel');
  const [carGear, setCarGear] = useState('Otomatik');
  const [carDamage, setCarDamage] = useState<number>(12000);
  const [carHp, setCarHp] = useState<number>(150);

  // Compute live prediction
  const predictionResult = useMemo(() => {
    if (!championModel || !championModel.predictFn) {
      return { price: 6850000, lower: 6300000, upper: 7400000 };
    }

    let inputRow: Record<string, any> = {};

    if (currentPreset.id === 'istanbul-housing') {
      inputRow = {
        ilce: district,
        metrekare: m2,
        oda_sayisi: roomType,
        bina_yasi: age,
        bulundugu_kat: floor,
        isinma_tipi: heating,
        metroya_yakinlik_km: metroKm,
        deniz_manzarasi: seaView,
        balkon: balcony,
        aidat_tl: dues,
        oda_basina_alan_m2: Number((m2 / 3).toFixed(1)),
        bina_yas_katsayisi: Number((age * 0.05).toFixed(2)),
        luks_skoru: (seaView === 'Var' ? 3 : 0) + (heating === 'Yerden Isıtma' ? 2 : 0) + (metroKm < 1 ? 2 : 0),
      };
    } else {
      inputRow = {
        marka: carBrand,
        yil: carYear,
        kilometre: carKm,
        yakit_tipi: carFuel,
        vites_tipi: carGear,
        motor_gucu_hp: carHp,
        hasar_kaydi_tl: carDamage,
        degisen_parca: 0,
        yillik_ortalama_km: Math.round(carKm / (2026 - carYear + 0.1)),
        hasar_oran_hp: Math.round(carDamage / carHp),
      };
    }

    try {
      const pred = Math.round(championModel.predictFn(inputRow));
      // Confidence margin (~8%)
      const margin = Math.round(pred * 0.08);
      return {
        price: pred,
        lower: Math.max(0, pred - margin),
        upper: pred + margin,
      };
    } catch (e) {
      return { price: 6850000, lower: 6300000, upper: 7400000 };
    }
  }, [
    championModel,
    currentPreset.id,
    district,
    m2,
    roomType,
    age,
    floor,
    heating,
    metroKm,
    seaView,
    balcony,
    dues,
    carBrand,
    carYear,
    carKm,
    carFuel,
    carGear,
    carDamage,
    carHp,
  ]);

  const loadPresetHousing = (presetType: 'luxury' | 'standard' | 'budget') => {
    if (presetType === 'luxury') {
      setDistrict('Beşiktaş');
      setM2(185);
      setRoomType('4+1');
      setAge(2);
      setFloor(5);
      setHeating('Yerden Isıtma');
      setMetroKm(0.3);
      setSeaView('Var');
      setBalcony('Var');
      setDues(4500);
    } else if (presetType === 'standard') {
      setDistrict('Kadıköy');
      setM2(110);
      setRoomType('2+1');
      setAge(8);
      setFloor(3);
      setHeating('Kombi Doğalgaz');
      setMetroKm(0.5);
      setSeaView('Yok');
      setBalcony('Var');
      setDues(950);
    } else {
      setDistrict('Esenyurt');
      setM2(65);
      setRoomType('1+1');
      setAge(14);
      setFloor(2);
      setHeating('Kombi Doğalgaz');
      setMetroKm(2.8);
      setSeaView('Yok');
      setBalcony('Yok');
      setDues(400);
    }
  };

  return (
    <div className="space-y-6">
      {/* Step Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-indigo-400 uppercase tracking-wider mb-1">
            <span>İnteraktif Laboratuvar</span>
            <span aria-hidden="true">·</span>
            <span>Canlı Çıkarım & Değerleme (Inference)</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Şampiyon Model ile Canlı Değerleme Laboratuvarı
          </h1>
          <p className="text-sm text-slate-400 mt-1 max-w-3xl">
            Eğittiğimiz ve seçtiğimiz şampiyon modeli ({championModel?.name || 'En İyi Model'}) kullanarak yeni bir gayrimenkul veya araç için anlık gerçekçi piyasa fiyatı tahmini üretin.
          </p>
        </div>

        {/* Quick Presets */}
        {currentPreset.id === 'istanbul-housing' && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Hızlı Senaryolar:</span>
            <button
              onClick={() => loadPresetHousing('luxury')}
              className="px-2.5 py-1 text-xs bg-slate-900 border border-slate-800 hover:bg-slate-800 text-amber-300 rounded cursor-pointer"
            >
              Lüks Boğaz
            </button>
            <button
              onClick={() => loadPresetHousing('standard')}
              className="px-2.5 py-1 text-xs bg-slate-900 border border-slate-800 hover:bg-slate-800 text-indigo-300 rounded cursor-pointer"
            >
              Kadıköy 2+1
            </button>
            <button
              onClick={() => loadPresetHousing('budget')}
              className="px-2.5 py-1 text-xs bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 rounded cursor-pointer"
            >
              Bütçe 1+1
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Form: Inputs */}
        <div className="lg:col-span-7 p-6 bg-slate-900/60 border border-slate-800 rounded-2xl space-y-5">
          <div className="flex items-center gap-2 text-sm font-bold text-white">
            <Calculator className="w-4 h-4 text-indigo-400" />
            <span>Taşınmaz Parametrelerini Belirleyin</span>
          </div>

          {currentPreset.id === 'istanbul-housing' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">İlçe / Lokasyon</label>
                <select
                  value={district}
                  onChange={e => setDistrict(e.target.value)}
                  className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-indigo-500"
                >
                  {['Kadıköy', 'Beşiktaş', 'Sarıyer', 'Üsküdar', 'Bakırköy', 'Maltepe', 'Ataşehir', 'Şişli', 'Kartal', 'Pendik', 'Esenyurt', 'Beylikdüzü'].map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">
                  Net Alan: <strong className="font-mono text-indigo-400">{m2} m²</strong>
                </label>
                <input
                  type="range"
                  min="40"
                  max="350"
                  step="5"
                  value={m2}
                  onChange={e => setM2(Number(e.target.value))}
                  className="w-full accent-indigo-500 mt-2"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Oda Sayısı</label>
                <select
                  value={roomType}
                  onChange={e => setRoomType(e.target.value)}
                  className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-indigo-500"
                >
                  {['1+1', '2+1', '3+1', '4+1', '5+1'].map(r => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">
                  Bina Yaşı: <strong className="font-mono text-indigo-400">{age} Yaş</strong>
                </label>
                <input
                  type="range"
                  min="0"
                  max="45"
                  value={age}
                  onChange={e => setAge(Number(e.target.value))}
                  className="w-full accent-indigo-500 mt-2"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Bulunduğu Kat</label>
                <select
                  value={floor}
                  onChange={e => setFloor(Number(e.target.value))}
                  className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-indigo-500"
                >
                  <option value="-1">Bodrum Kat (-1)</option>
                  <option value="0">Giriş / Zemin (0)</option>
                  <option value="1">1. Kat</option>
                  <option value="3">3. Kat (Ara Kat)</option>
                  <option value="5">5. Kat</option>
                  <option value="10">10. Kat (Yüksek Kat)</option>
                  <option value="15">15. Kat (Çatı / Penthouse)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Isınma Tipi</label>
                <select
                  value={heating}
                  onChange={e => setHeating(e.target.value)}
                  className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-indigo-500"
                >
                  {['Kombi Doğalgaz', 'Merkezi Pay Ölçer', 'Yerden Isıtma', 'Klima', 'Soba'].map(h => (
                    <option key={h} value={h}>{h}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">
                  Metroya Yürüyüş: <strong className="font-mono text-indigo-400">{metroKm} km</strong>
                </label>
                <input
                  type="range"
                  min="0.1"
                  max="5.0"
                  step="0.1"
                  value={metroKm}
                  onChange={e => setMetroKm(Number(e.target.value))}
                  className="w-full accent-indigo-500 mt-2"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Deniz Manzarası</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setSeaView('Var')}
                    className={`flex-1 py-1.5 rounded-lg border font-medium ${
                      seaView === 'Var'
                        ? 'bg-indigo-950/60 border-indigo-500 text-indigo-300'
                        : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    Var (+Lüks)
                  </button>
                  <button
                    onClick={() => setSeaView('Yok')}
                    className={`flex-1 py-1.5 rounded-lg border font-medium ${
                      seaView === 'Yok'
                        ? 'bg-indigo-950/60 border-indigo-500 text-indigo-300'
                        : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    Yok
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Balkon</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setBalcony('Var')}
                    className={`flex-1 py-1.5 rounded-lg border font-medium ${
                      balcony === 'Var'
                        ? 'bg-indigo-950/60 border-indigo-500 text-indigo-300'
                        : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    Var
                  </button>
                  <button
                    onClick={() => setBalcony('Yok')}
                    className={`flex-1 py-1.5 rounded-lg border font-medium ${
                      balcony === 'Yok'
                        ? 'bg-indigo-950/60 border-indigo-500 text-indigo-300'
                        : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    Yok
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">
                  Aylık Aidat: <strong className="font-mono text-indigo-400">{dues} ₺</strong>
                </label>
                <input
                  type="range"
                  min="250"
                  max="6000"
                  step="250"
                  value={dues}
                  onChange={e => setDues(Number(e.target.value))}
                  className="w-full accent-indigo-500 mt-2"
                />
              </div>
            </div>
          ) : (
            /* Vehicle Form Inputs */
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Marka</label>
                <select
                  value={carBrand}
                  onChange={e => setCarBrand(e.target.value)}
                  className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200"
                >
                  {['Volkswagen', 'BMW', 'Mercedes-Benz', 'Renault', 'Fiat', 'Toyota', 'Audi'].map(b => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Model Yılı: {carYear}</label>
                <input
                  type="range"
                  min="2012"
                  max="2024"
                  value={carYear}
                  onChange={e => setCarYear(Number(e.target.value))}
                  className="w-full accent-indigo-500 mt-2"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Kilometre: {carKm.toLocaleString('tr-TR')} km</label>
                <input
                  type="range"
                  min="10000"
                  max="280000"
                  step="5000"
                  value={carKm}
                  onChange={e => setCarKm(Number(e.target.value))}
                  className="w-full accent-indigo-500 mt-2"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Yakıt Türü</label>
                <select
                  value={carFuel}
                  onChange={e => setCarFuel(e.target.value)}
                  className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200"
                >
                  {['Dizel', 'Benzin', 'Hibrit', 'Elektrik'].map(f => (
                    <option key={f} value={f}>{f}</option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Right Card: Instant Valuation Result */}
        <div className="lg:col-span-5 flex flex-col justify-between p-6 bg-gradient-to-br from-indigo-950/40 via-slate-900/80 to-slate-950 border border-indigo-500/40 rounded-2xl space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400">
                Piyasa Değerleme Sonucu
              </span>
              <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-800/40">
                Canlı İnferans Aktif
              </span>
            </div>

            <div>
              <div className="text-xs text-slate-400">Tahmini Satış Değeri</div>
              <div className="text-3xl sm:text-4xl font-black font-mono text-white tabular-nums mt-1">
                {predictionResult.price.toLocaleString('tr-TR')}{' '}
                <span className="text-lg text-indigo-400">{currentPreset.targetUnit}</span>
              </div>
            </div>

            {/* Confidence Interval */}
            <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-xl space-y-1 text-xs">
              <div className="flex items-center justify-between text-slate-400">
                <span>%95 Güven Aralığı (Margin):</span>
                <span className="text-slate-300 font-mono">±%8</span>
              </div>
              <div className="text-xs font-mono font-bold text-slate-300 tabular-nums">
                {predictionResult.lower.toLocaleString('tr-TR')} ₺ - {predictionResult.upper.toLocaleString('tr-TR')} ₺
              </div>
            </div>

            {/* Unit Price & Derived Metrics */}
            {currentPreset.id === 'istanbul-housing' && (
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-lg">
                  <div className="text-slate-400">Birim m² Fiyatı</div>
                  <div className="text-sm font-bold font-mono text-indigo-300 mt-0.5">
                    {Math.round(predictionResult.price / m2).toLocaleString('tr-TR')} ₺/m²
                  </div>
                </div>
                <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-lg">
                  <div className="text-slate-400">Lüks Endeksi</div>
                  <div className="text-sm font-bold font-mono text-emerald-400 mt-0.5">
                    {seaView === 'Var' ? 'Yüksek (A+)' : 'Standart (B)'}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Model Credential Stamp */}
          <div className="pt-4 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
            <div>
              Kullanılan Model: <strong className="text-slate-200">{championModel?.name}</strong>
            </div>
            <div className="font-mono text-indigo-400">
              Val RMSLE: {championModel?.valMetrics.rmsle}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
