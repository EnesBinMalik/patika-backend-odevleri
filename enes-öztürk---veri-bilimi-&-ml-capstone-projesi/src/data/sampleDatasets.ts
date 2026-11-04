/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { DatasetPreset, DataRow } from '../types/dataset';

// Helper generator to create rich, realistic rows with intentional missing values and outliers
function generateIstanbulHousingData(): DataRow[] {
  const districts = [
    { name: 'Kadıköy', basePriceM2: 78000, luxuryProb: 0.25 },
    { name: 'Beşiktaş', basePriceM2: 95000, luxuryProb: 0.35 },
    { name: 'Sarıyer', basePriceM2: 110000, luxuryProb: 0.40 },
    { name: 'Üsküdar', basePriceM2: 65000, luxuryProb: 0.20 },
    { name: 'Bakırköy', basePriceM2: 72000, luxuryProb: 0.20 },
    { name: 'Maltepe', basePriceM2: 52000, luxuryProb: 0.12 },
    { name: 'Ataşehir', basePriceM2: 62000, luxuryProb: 0.18 },
    { name: 'Şişli', basePriceM2: 82000, luxuryProb: 0.28 },
    { name: 'Kartal', basePriceM2: 44000, luxuryProb: 0.10 },
    { name: 'Pendik', basePriceM2: 38000, luxuryProb: 0.08 },
    { name: 'Esenyurt', basePriceM2: 26000, luxuryProb: 0.03 },
    { name: 'Beylikdüzü', basePriceM2: 34000, luxuryProb: 0.05 },
  ];

  const roomTypes = [
    { type: '1+1', baseM2: 58, m2Var: 12 },
    { type: '2+1', baseM2: 92, m2Var: 18 },
    { type: '3+1', baseM2: 135, m2Var: 25 },
    { type: '4+1', baseM2: 195, m2Var: 35 },
    { type: '5+1', baseM2: 270, m2Var: 50 },
  ];

  const heatingTypes = ['Kombi Doğalgaz', 'Merkezi Pay Ölçer', 'Yerden Isıtma', 'Klima', 'Soba'];

  const rows: DataRow[] = [];

  // Deterministic pseudorandom generator for reproducible consistency
  let seed = 42;
  function rand() {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  }

  for (let i = 1; i <= 140; i++) {
    const dist = districts[Math.floor(rand() * districts.length)];
    const room = roomTypes[Math.floor(rand() * roomTypes.length)];
    const m2 = Math.round(room.baseM2 + (rand() * 2 - 1) * room.m2Var);
    const age = Math.floor(rand() * 35);
    const floor = Math.floor(rand() * 16) - 1; // -1 basement up to 15
    const heating = heatingTypes[Math.floor(rand() * (heatingTypes.length - (dist.basePriceM2 > 70000 ? 1 : 0)))];
    
    // Intentional missing values in metro distance (approx 8%) and dues (approx 10%)
    const metroKm = rand() < 0.09 ? null : Number((0.2 + rand() * 4.5).toFixed(2));
    const seaView = rand() < (dist.luxuryProb + 0.05) ? 'Var' : 'Yok';
    const balcony = rand() < 0.82 ? 'Var' : 'Yok';
    const dues = rand() < 0.11 ? null : Math.round(350 + (m2 * (dist.basePriceM2 / 20000)) * (1 + rand() * 0.4));

    // Calculate realistic price formula + noise
    let priceM2 = dist.basePriceM2;
    // Age penalty (newer = more expensive)
    priceM2 *= Math.max(0.65, 1 - (age * 0.012));
    // Heating bonus
    if (heating === 'Yerden Isıtma') priceM2 *= 1.15;
    else if (heating === 'Merkezi Pay Ölçer') priceM2 *= 1.05;
    else if (heating === 'Soba') priceM2 *= 0.72;
    // Sea view bonus
    if (seaView === 'Var') priceM2 *= 1.38;
    // Metro proximity bonus
    if (metroKm !== null) {
      if (metroKm < 0.6) priceM2 *= 1.12;
      else if (metroKm > 3.0) priceM2 *= 0.92;
    }
    // Floor factor
    if (floor === -1) priceM2 *= 0.75;
    else if (floor >= 1 && floor <= 5) priceM2 *= 1.05;
    else if (floor > 8) priceM2 *= 1.10;

    let basePrice = m2 * priceM2;
    // Random market variance +- 12%
    basePrice *= (0.88 + rand() * 0.24);

    let finalPrice = Math.round(basePrice / 10000) * 10000;

    // Intentional Outliers (to demonstrate Tukey IQR and Winsorization as instructed!)
    if (i === 17) {
      // Bosphorus luxury historic mansion outlier
      finalPrice = 98500000;
    } else if (i === 63) {
      // Penthouse ultra luxury outlier
      finalPrice = 74000000;
    } else if (i === 112) {
      // Extremely low distressed emergency sale outlier
      finalPrice = 850000;
    }

    rows.push({
      id: i,
      ilce: dist.name,
      metrekare: m2,
      oda_sayisi: room.type,
      bina_yasi: age,
      bulundugu_kat: floor,
      isinma_tipi: heating,
      metroya_yakinlik_km: metroKm,
      deniz_manzarasi: seaView,
      balkon: balcony,
      aidat_tl: dues,
      fiyat_tl: finalPrice,
    });
  }

  return rows;
}

function generateCarResaleData(): DataRow[] {
  const brands = [
    { name: 'Volkswagen', models: ['Golf', 'Passat', 'Polo'], basePrice: 1250000 },
    { name: 'BMW', models: ['320i', '520i', '118i'], basePrice: 2200000 },
    { name: 'Mercedes-Benz', models: ['C200', 'E250', 'A180'], basePrice: 2450000 },
    { name: 'Renault', models: ['Clio', 'Megane', 'Talisman'], basePrice: 850000 },
    { name: 'Fiat', models: ['Egea', 'Tipo', '500X'], basePrice: 720000 },
    { name: 'Toyota', models: ['Corolla', 'Yaris', 'C-HR'], basePrice: 1150000 },
    { name: 'Audi', models: ['A3', 'A4', 'A6'], basePrice: 2100000 },
  ];

  const fuelTypes = ['Dizel', 'Benzin', 'Hibrit', 'Elektrik'];
  const gearTypes = ['Otomatik', 'Manuel'];

  const rows: DataRow[] = [];
  let seed = 1337;
  function rand() {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  }

  for (let i = 1; i <= 120; i++) {
    const brand = brands[Math.floor(rand() * brands.length)];
    const model = brand.models[Math.floor(rand() * brand.models.length)];
    const year = 2012 + Math.floor(rand() * 12); // 2012 to 2023
    const carAge = 2026 - year;
    const km = Math.round(15000 + (carAge * 16000) * (0.6 + rand() * 0.8));
    const fuel = fuelTypes[Math.floor(rand() * fuelTypes.length)];
    const gear = rand() < 0.68 ? 'Otomatik' : 'Manuel';
    const hp = Math.round(95 + rand() * 160);
    const damageRecord = rand() < 0.12 ? null : (rand() < 0.4 ? 0 : Math.round(5000 + rand() * 65000));
    const changedParts = rand() < 0.5 ? 0 : Math.floor(rand() * 4);

    let price = brand.basePrice;
    price *= Math.max(0.35, 1 - (carAge * 0.055));
    price *= Math.max(0.55, 1 - ((km / 100000) * 0.14));
    if (gear === 'Otomatik') price *= 1.12;
    if (fuel === 'Hibrit') price *= 1.15;
    if (damageRecord && damageRecord > 30000) price *= 0.86;
    price -= (changedParts * 25000);

    price *= (0.92 + rand() * 0.16);
    let finalPrice = Math.round(price / 5000) * 5000;

    // Outlier
    if (i === 11) finalPrice = 5800000; // Collector car
    if (i === 55) finalPrice = 190000;  // Severely damaged salvage

    rows.push({
      id: i,
      marka: brand.name,
      model: model,
      yil: year,
      kilometre: km,
      yakit_tipi: fuel,
      vites_tipi: gear,
      motor_gucu_hp: hp,
      hasar_kaydi_tl: damageRecord,
      degisen_parca: changedParts,
      fiyat_tl: finalPrice,
    });
  }

  return rows;
}

export const DATASET_PRESETS: DatasetPreset[] = [
  {
    id: 'istanbul-housing',
    title: 'İstanbul Konut & Gayrimenkul Değerleme Veri Seti',
    category: 'Regresyon / Gayrimenkul Analitiği',
    targetColumn: 'fiyat_tl',
    targetLabel: 'Konut Satış Fiyatı',
    targetUnit: '₺ (TRY)',
    recommendedMetric: 'RMSLE',
    metricRationale: 'Gayrimenkul fiyatları sağa çarpık (right-skewed) ve geniş basamaklıdır (1.5M - 100M TL). Normal RMSE yüksek fiyatlı lüks villalara aşırı ceza yazarken, RMSLE yüzdesel bağıl hatayı optimize eder ve gerçekçi piyasa değerlemesi sağlar.',
    description: 'İstanbul\'un farklı ilçelerindeki dairelerin metrekare, oda sayısı, bina yaşı, kat, ısıtma, metro mesafesi ve aidat gibi özelliklerini barındıran; eksik veriler ve gerçekçi aykırı değerler (outliers) içeren kapsamlı veri seti.',
    defaultData: generateIstanbulHousingData(),
  },
  {
    id: 'car-resale',
    title: 'İkinci El Otomobil Piyasa Fiyatı Tahmini',
    category: 'Regresyon / Otomotiv Fiyatlandırma',
    targetColumn: 'fiyat_tl',
    targetLabel: 'Araç Satış Fiyatı',
    targetUnit: '₺ (TRY)',
    recommendedMetric: 'RMSLE',
    metricRationale: 'Araç piyasasında 500.000 TL\'lik bir arabada 50.000 TL hata ile 3.000.000 TL\'lik araçtaki 50.000 TL hata aynı ağırlıkta olmamalıdır. RMSLE logaritmik ölçekte adil ceza dağılımı sunar.',
    description: 'Marka, model yılı, kilometre, yakıt türü, vites tipi, hasar kaydı ve değişen parça sayısı gibi kritik ekspertiz değişkenlerini içeren dinamik araç veri seti.',
    defaultData: generateCarResaleData(),
  },
];
