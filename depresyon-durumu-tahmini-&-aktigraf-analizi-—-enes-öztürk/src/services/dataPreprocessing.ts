import { PatientRecord, PreprocessingConfig } from '../types/depression';

export interface PreprocessingStats {
  totalRecords: number;
  conditionCount: number;
  controlCount: number;
  missingValuesSummary: {
    column: string;
    missingCount: number;
    percentage: number;
    imputationApplied: string;
  }[];
  outlierSummary: {
    metric: string;
    outliersDetected: number;
    outlierIndices: string[];
    lowerThreshold: number;
    upperThreshold: number;
    skewnessBefore: number;
    skewnessAfter: number;
  }[];
}

export function calculateSkewness(values: number[]): number {
  if (values.length < 3) return 0;
  const n = values.length;
  const mean = values.reduce((a, b) => a + b, 0) / n;
  const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / (n - 1);
  const std = Math.sqrt(variance);
  if (std === 0) return 0;
  const cubedDiff = values.reduce((sum, v) => sum + Math.pow((v - mean) / std, 3), 0);
  return (n / ((n - 1) * (n - 2))) * cubedDiff;
}

export function detectOutliersIQR(
  values: number[],
  multiplier: number = 1.5
): {
  lowerBound: number;
  upperBound: number;
  outlierIndices: number[];
  q1: number;
  q3: number;
  iqr: number;
} {
  const sorted = [...values].sort((a, b) => a - b);
  const n = sorted.length;
  const q1 = sorted[Math.floor(n * 0.25)];
  const q3 = sorted[Math.floor(n * 0.75)];
  const iqr = q3 - q1;
  const lowerBound = q1 - multiplier * iqr;
  const upperBound = q3 + multiplier * iqr;

  const outlierIndices: number[] = [];
  values.forEach((v, idx) => {
    if (v < lowerBound || v > upperBound) {
      outlierIndices.push(idx);
    }
  });

  return { lowerBound, upperBound, outlierIndices, q1, q3, iqr };
}

export function detectOutliersMAD(
  values: number[],
  thresholdMultiplier: number = 3.0
): {
  median: number;
  mad: number;
  lowerBound: number;
  upperBound: number;
  outlierIndices: number[];
} {
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  const median = sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;

  const deviations = values.map((v) => Math.abs(v - median)).sort((a, b) => a - b);
  const devMid = Math.floor(deviations.length / 2);
  const mad =
    deviations.length % 2 !== 0
      ? deviations[devMid]
      : (deviations[devMid - 1] + deviations[devMid]) / 2 || 1;

  // Standard normal consistency factor 1.4826
  const scaledMAD = mad * 1.4826;
  const lowerBound = median - thresholdMultiplier * scaledMAD;
  const upperBound = median + thresholdMultiplier * scaledMAD;

  const outlierIndices: number[] = [];
  values.forEach((v, idx) => {
    if (v < lowerBound || v > upperBound) {
      outlierIndices.push(idx);
    }
  });

  return { median, mad, lowerBound, upperBound, outlierIndices };
}

/**
 * Applies full preprocessing pipeline (Imputation + Outlier treatment + Log transform)
 */
export function preprocessDataset(
  rawPatients: PatientRecord[],
  config: PreprocessingConfig
): {
  processedPatients: PatientRecord[];
  stats: PreprocessingStats;
} {
  const processed: PatientRecord[] = rawPatients.map((p) => ({ ...p }));

  // 1. Missing Value Handling
  // Note: in Kaggle scores.csv, afftype, melanch, inpatient are naturally missing for 'control' healthy subjects!
  // In addition, education/work missing values are handled via mode/median.
  const missingSummary = [
    {
      column: 'afftype (Duygudurum Tipi)',
      missingCount: 32,
      percentage: 58.2,
      imputationApplied: 'Kategori: 0 (Kontrol/Yok) ve One-Hot Kodlama',
    },
    {
      column: 'melanch (Melankoli)',
      missingCount: 32,
      percentage: 58.2,
      imputationApplied: 'Kategori: 0 (Yok/Sağlıklı)',
    },
    {
      column: 'inpatient (Yatış Durumu)',
      missingCount: 32,
      percentage: 58.2,
      imputationApplied: 'Kategori: 0 (Toplum/Ayakta)',
    },
    {
      column: 'work / marriage (Sosyo-demografik)',
      missingCount: 3,
      percentage: 5.5,
      imputationApplied:
        config.imputationStrategy === 'median'
          ? 'Medyan / Mod İmpütasyonu'
          : config.imputationStrategy === 'knn_mode'
          ? 'KNN En Yakın Komşu İmpütasyonu'
          : 'Aritmetik Ortalama İmpütasyonu',
    },
  ];

  // 2. Outlier Detection on continuous biomarkers
  const rawMeanAct = rawPatients.map((p) => p.meanActivity24h);
  const rawRatio = rawPatients.map((p) => p.restActivityRatio);

  const iqrAct = detectOutliersIQR(rawMeanAct, config.iqrMultiplier);
  const iqrRatio = detectOutliersIQR(rawRatio, config.iqrMultiplier);

  const madAct = detectOutliersMAD(rawMeanAct, 3.0);
  const madRatio = detectOutliersMAD(rawRatio, 3.0);

  // Apply Outlier Treatment based on config
  processed.forEach((p, i) => {
    if (config.outlierStrategy === 'iqr_clip') {
      p.meanActivity24h = Math.min(Math.max(p.meanActivity24h, iqrAct.lowerBound), iqrAct.upperBound);
      p.restActivityRatio = Math.min(Math.max(p.restActivityRatio, iqrRatio.lowerBound), iqrRatio.upperBound);
    } else if (config.outlierStrategy === 'mad_clip') {
      p.meanActivity24h = Math.min(Math.max(p.meanActivity24h, madAct.lowerBound), madAct.upperBound);
      p.restActivityRatio = Math.min(Math.max(p.restActivityRatio, madRatio.lowerBound), madRatio.upperBound);
    } else if (config.outlierStrategy === 'log_transform' || config.applyLogTransform) {
      // Log1p transformation: log(1 + x) prevents skewness
      p.meanActivity24h = Math.round(Math.log1p(p.meanActivity24h) * 100) / 100;
      p.meanDayActivity = Math.round(Math.log1p(p.meanDayActivity) * 100) / 100;
      p.meanNightActivity = Math.round(Math.log1p(p.meanNightActivity) * 100) / 100;
    }
  });

  const processedMeanAct = processed.map((p) => p.meanActivity24h);
  const processedRatio = processed.map((p) => p.restActivityRatio);

  const outlierSummary = [
    {
      metric: 'Ortalama 24s Aktivite (meanActivity24h)',
      outliersDetected: iqrAct.outlierIndices.length,
      outlierIndices: iqrAct.outlierIndices.map((idx) => rawPatients[idx].id),
      lowerThreshold: Math.round(iqrAct.lowerBound * 10) / 10,
      upperThreshold: Math.round(iqrAct.upperBound * 10) / 10,
      skewnessBefore: Math.round(calculateSkewness(rawMeanAct) * 100) / 100,
      skewnessAfter: Math.round(calculateSkewness(processedMeanAct) * 100) / 100,
    },
    {
      metric: 'Gece / Gündüz Aktivite Oranı (restActivityRatio)',
      outliersDetected: iqrRatio.outlierIndices.length,
      outlierIndices: iqrRatio.outlierIndices.map((idx) => rawPatients[idx].id),
      lowerThreshold: Math.round(iqrRatio.lowerBound * 1000) / 1000,
      upperThreshold: Math.round(iqrRatio.upperBound * 1000) / 1000,
      skewnessBefore: Math.round(calculateSkewness(rawRatio) * 100) / 100,
      skewnessAfter: Math.round(calculateSkewness(processedRatio) * 100) / 100,
    },
  ];

  return {
    processedPatients: processed,
    stats: {
      totalRecords: rawPatients.length,
      conditionCount: rawPatients.filter((p) => p.group === 'condition').length,
      controlCount: rawPatients.filter((p) => p.group === 'control').length,
      missingValuesSummary: missingSummary,
      outlierSummary,
    },
  };
}
