/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface DataRow {
  id: string | number;
  [key: string]: any;
}

export interface ColumnMetadata {
  name: string;
  label: string;
  type: 'numeric' | 'categorical';
  missingCount: number;
  missingPercentage: number;
  uniqueValues?: number;
  min?: number;
  max?: number;
  mean?: number;
  median?: number;
  std?: number;
  categories?: { label: string; count: number }[];
}

export type OutlierMethod = 'none' | 'iqr' | 'winsorize' | 'zscore';
export type MissingImputationMethod = 'mean' | 'median' | 'grouped_median' | 'mode' | 'knn_simple';
export type CategoricalEncodingMethod = 'one_hot' | 'target_encoding' | 'ordinal';
export type TargetTransformation = 'none' | 'log1p' | 'sqrt';

export interface PreprocessingConfig {
  outlierMethod: OutlierMethod;
  outlierThreshold: number; // e.g. 1.5 for IQR or 3.0 for z-score
  missingMethod: MissingImputationMethod;
  categoricalEncoding: CategoricalEncodingMethod;
  targetTransformation: TargetTransformation;
  rareThreshold: number; // e.g. 0.05
  enableFeatureEngineering: boolean;
}

export type ErrorMetric = 'RMSLE' | 'RMSE' | 'MAE' | 'MAPE' | 'R2';

export interface SplitConfig {
  trainRatio: number; // e.g. 0.70
  valRatio: number;   // e.g. 0.15
  testRatio: number;  // e.g. 0.15
  randomSeed: number;
  stratifyColumn?: string;
}

export interface ModelMetricResults {
  rmse: number;
  rmsle: number;
  mae: number;
  mape: number;
  r2: number;
}

export interface TrainedModelResult {
  id: string;
  name: string;
  family: string;
  description: string;
  hyperparameters: Record<string, string | number>;
  trainMetrics: ModelMetricResults;
  valMetrics: ModelMetricResults;
  testMetrics: ModelMetricResults;
  trainingTimeMs: number;
  isChampion?: boolean;
  featureImportances?: { feature: string; importance: number }[];
  samplePredictions?: { actual: number; predicted: number; residual: number }[];
  predictFn?: (features: Record<string, any>) => number;
}

export interface DatasetPreset {
  id: string;
  title: string;
  category: string;
  targetColumn: string;
  targetLabel: string;
  targetUnit: string;
  recommendedMetric: ErrorMetric;
  metricRationale: string;
  description: string;
  defaultData: DataRow[];
}
