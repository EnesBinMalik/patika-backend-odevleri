/**
 * Types for The Depression Dataset (Kaggle: Arashnic / Garcia-Ceja et al.)
 * Project author: Enes Öztürk
 */

export type PatientGroup = 'condition' | 'control';

export interface PatientRecord {
  id: string; // e.g., 'condition_1', 'control_1'
  group: PatientGroup;
  days: number;
  gender: 1 | 2; // 1: Female, 2: Male
  genderLabel: 'Kadın' | 'Erkek';
  ageGroup: string; // e.g., '20-24', '45-49'
  ageNumeric: number;
  afftype?: number | null; // 1: Bipolar II, 2: Unipolar, 3: Bipolar I
  afftypeLabel: string;
  melanch?: number | null; // 1: Melancholia, 2: No melancholia
  inpatient?: number | null; // 1: Inpatient, 2: Outpatient
  inpatientLabel: string;
  edu: string; // Education tier
  marriage: string; // Single, Married, Divorced
  work: string; // Employed, Unemployed, Sick leave
  madrs1: number; // Pre-study MADRS score
  madrs2: number; // Post-study MADRS score
  
  // Extracted Actigraphy Biomarkers
  meanActivity24h: number; // Avg activity counts/min
  meanDayActivity: number; // 08:00 - 21:00
  meanNightActivity: number; // 23:00 - 07:00
  restActivityRatio: number; // Night/Day ratio (circadian disruption metric)
  zeroActivityRatio: number; // % of time with zero counts (inactivity)
  interdailyStability: number; // IS (0 to 1)
  intradailyVariability: number; // IV (0 to 2)
  activityStdDev: number;
  hasOutlier: boolean;
}

export interface ActigraphDataPoint {
  minute: number;
  timestamp: string; // "00:00", "00:01", etc.
  activity: number;
  smoothed: number;
  isNight: boolean;
}

export interface PreprocessingConfig {
  imputationStrategy: 'median' | 'mean' | 'knn_mode';
  outlierStrategy: 'iqr_clip' | 'mad_clip' | 'zscore_clip' | 'log_transform';
  iqrMultiplier: number; // Default 1.5
  clipPercentiles: [number, number]; // [5, 95]
  featureScaling: 'standard' | 'minmax' | 'robust';
  applyLogTransform: boolean;
}

export interface SplitResult {
  train: PatientRecord[];
  val: PatientRecord[];
  test: PatientRecord[];
  leakagePrevented: boolean;
  trainRatio: number;
  valRatio: number;
  testRatio: number;
}

export interface ModelMetrics {
  id: string;
  name: string;
  algorithmFamily: string;
  isBest?: boolean;
  
  // Regression Metrics (MADRS Score)
  rmse: number; // Root Mean Squared Error
  rmsle: number; // Root Mean Squared Log Error
  mae: number; // Mean Absolute Error
  r2: number; // R-squared
  
  // Classification Metrics (Depression Condition vs Control)
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  rocAuc: number;
  specificity: number;
  
  // Confusion Matrix
  confusionMatrix: {
    tp: number;
    fp: number;
    tn: number;
    fn: number;
  };
  
  // Training latency & parameters
  trainingTimeMs: number;
  complexity: 'Düşük' | 'Orta' | 'Yüksek';
  keyHyperparameters: Record<string, string | number>;
  featureImportances: { feature: string; importance: number }[];
}

export interface DiagnosticQuestion {
  id: string;
  category: 'mood' | 'sleep' | 'psychomotor' | 'cognitive' | 'somatic' | 'actigraphy';
  text: string;
  subtext?: string;
  options: {
    label: string;
    score: number;
    description?: string;
  }[];
}

export interface DiagnosticResult {
  totalScore: number;
  maxScore: number;
  predictedCondition: 'condition' | 'control';
  conditionProbability: number;
  estimatedMadrsScore: number;
  severityLevel: 'Minimal' | 'Hafif' | 'Orta' | 'Şiddetli';
  severityDescription: string;
  circadianDisruptionScore: number; // 0 to 100
  subScores: {
    mood: number;
    sleepCircadian: number;
    psychomotor: number;
    cognitive: number;
  };
  clinicalRecommendations: string[];
  actigraphComparison: {
    estimatedNightToDayRatio: number;
    benchmarkControlRatio: number;
    benchmarkConditionRatio: number;
  };
}
