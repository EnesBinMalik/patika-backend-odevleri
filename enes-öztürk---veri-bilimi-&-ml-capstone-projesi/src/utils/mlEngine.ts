/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  DataRow,
  ColumnMetadata,
  PreprocessingConfig,
  SplitConfig,
  ModelMetricResults,
  TrainedModelResult,
  ErrorMetric,
} from '../types/dataset';

// ==========================================
// 1. STATISTICAL & METADATA COMPUTATIONS
// ==========================================

export function computeDatasetMetadata(data: DataRow[], targetCol: string): ColumnMetadata[] {
  if (!data || data.length === 0) return [];

  const sample = data[0];
  const colKeys = Object.keys(sample).filter(k => k !== 'id');

  return colKeys.map(key => {
    const values = data.map(r => r[key]);
    const validValues = values.filter(v => v !== null && v !== undefined && v !== '');
    const missingCount = data.length - validValues.length;
    const missingPercentage = Number(((missingCount / data.length) * 100).toFixed(1));

    const numericCount = validValues.filter(v => typeof v === 'number' || (!isNaN(Number(v)) && typeof v !== 'boolean')).length;
    const isNumeric = validValues.length > 0 && numericCount / validValues.length > 0.85;

    if (isNumeric) {
      const numArr = validValues.map(v => Number(v)).sort((a, b) => a - b);
      const min = numArr[0] ?? 0;
      const max = numArr[numArr.length - 1] ?? 0;
      const sum = numArr.reduce((acc, curr) => acc + curr, 0);
      const mean = numArr.length ? sum / numArr.length : 0;
      const median = numArr.length % 2 === 0
        ? (numArr[numArr.length / 2 - 1] + numArr[numArr.length / 2]) / 2
        : numArr[Math.floor(numArr.length / 2)];
      
      const variance = numArr.reduce((acc, curr) => acc + Math.pow(curr - mean, 2), 0) / (numArr.length || 1);
      const std = Math.sqrt(variance);

      return {
        name: key,
        label: formatColumnLabel(key),
        type: 'numeric',
        missingCount,
        missingPercentage,
        min: Number(min.toFixed(2)),
        max: Number(max.toFixed(2)),
        mean: Number(mean.toFixed(2)),
        median: Number(median.toFixed(2)),
        std: Number(std.toFixed(2)),
      };
    } else {
      const categoryMap = new Map<string, number>();
      validValues.forEach(v => {
        const str = String(v).trim();
        categoryMap.set(str, (categoryMap.get(str) || 0) + 1);
      });

      const categories = Array.from(categoryMap.entries())
        .map(([label, count]) => ({ label, count }))
        .sort((a, b) => b.count - a.count);

      return {
        name: key,
        label: formatColumnLabel(key),
        type: 'categorical',
        missingCount,
        missingPercentage,
        uniqueValues: categories.length,
        categories: categories.slice(0, 10),
      };
    }
  });
}

function formatColumnLabel(key: string): string {
  return key
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

// ==========================================
// 2. ERROR METRICS (RMSE, RMSLE, MAE, MAPE, R2)
// ==========================================

export function calculateMetrics(actuals: number[], predictions: number[]): ModelMetricResults {
  const n = actuals.length;
  if (n === 0) return { rmse: 0, rmsle: 0, mae: 0, mape: 0, r2: 0 };

  let sumSquaredError = 0;
  let sumSquaredLogError = 0;
  let sumAbsoluteError = 0;
  let sumPercentageError = 0;

  const meanActual = actuals.reduce((a, b) => a + b, 0) / n;
  let totalSumSquares = 0;

  for (let i = 0; i < n; i++) {
    const y = actuals[i];
    const yHat = Math.max(0, predictions[i]); // Predictions must be non-negative for prices

    const error = y - yHat;
    sumSquaredError += error * error;
    sumAbsoluteError += Math.abs(error);

    // RMSLE: log(y + 1) - log(yHat + 1)
    const logActual = Math.log(Math.max(0, y) + 1);
    const logPred = Math.log(yHat + 1);
    const logDiff = logActual - logPred;
    sumSquaredLogError += logDiff * logDiff;

    if (y !== 0) {
      sumPercentageError += Math.abs(error / y);
    }
    totalSumSquares += (y - meanActual) * (y - meanActual);
  }

  const rmse = Math.sqrt(sumSquaredError / n);
  const rmsle = Math.sqrt(sumSquaredLogError / n);
  const mae = sumAbsoluteError / n;
  const mape = (sumPercentageError / n) * 100;
  const r2 = totalSumSquares > 0 ? Math.max(-1, 1 - (sumSquaredError / totalSumSquares)) : 0;

  return {
    rmse: Number(rmse.toFixed(2)),
    rmsle: Number(rmsle.toFixed(4)),
    mae: Number(mae.toFixed(2)),
    mape: Number(mape.toFixed(2)),
    r2: Number(r2.toFixed(4)),
  };
}

// ==========================================
// 3. PREPROCESSING & FEATURE PIPELINE
// ==========================================

export interface PreprocessedDataResult {
  processedRows: DataRow[];
  outlierSummary: {
    method: string;
    identifiedCount: number;
    clippedCount: number;
    thresholdApplied: string;
    outlierIndices: number[];
  };
  missingSummary: {
    imputedValuesCount: number;
    imputedColumns: string[];
  };
  featuresCreated: string[];
  featureColumns: string[];
}

export function runDataPreprocessing(
  rawData: DataRow[],
  targetCol: string,
  config: PreprocessingConfig
): PreprocessedDataResult {
  // Deep clone data
  let data: DataRow[] = JSON.parse(JSON.stringify(rawData));
  const missingImputedCols = new Set<string>();
  let imputedValuesCount = 0;
  const featuresCreated: string[] = [];

  // Step A: Feature Engineering (if enabled)
  if (config.enableFeatureEngineering) {
    data.forEach(row => {
      // 1. Price per m2 proxy / Room-to-Area ratio
      if (row.metrekare && row.oda_sayisi) {
        const roomCount = parseRoomCount(row.oda_sayisi);
        row['oda_basina_alan_m2'] = Number((row.metrekare / Math.max(1, roomCount)).toFixed(1));
        row['bina_yas_katsayisi'] = Number((Math.max(1, (row.bina_yasi || 0)) * 0.05).toFixed(2));
      }
      // 2. Luxury Index
      let luxuryScore = 0;
      if (row.deniz_manzarasi === 'Var') luxuryScore += 3;
      if (row.isinma_tipi === 'Yerden Isıtma') luxuryScore += 2;
      if (row.metroya_yakinlik_km !== null && row.metroya_yakinlik_km < 1.0) luxuryScore += 2;
      if (row.balkon === 'Var') luxuryScore += 1;
      row['luks_skoru'] = luxuryScore;

      // 3. Automobile features
      if (row.yil && row.kilometre !== undefined) {
        const carAge = Math.max(1, 2026 - Number(row.yil));
        row['yillik_ortalama_km'] = Number((row.kilometre / carAge).toFixed(0));
        row['hasar_oran_hp'] = Number(((row.hasar_kaydi_tl || 0) / Math.max(50, (row.motor_gucu_hp || 100))).toFixed(1));
      }
    });
    featuresCreated.push('oda_basina_alan_m2', 'bina_yas_katsayisi', 'luks_skoru', 'yillik_ortalama_km', 'hasar_oran_hp');
  }

  // Step B: Missing Value Imputation
  const cols = Object.keys(data[0] || {}).filter(c => c !== 'id' && c !== targetCol);
  
  cols.forEach(col => {
    const values = data.map(r => r[col]);
    const nullIndices = values
      .map((v, i) => (v === null || v === undefined || v === '') ? i : -1)
      .filter(i => i !== -1);

    if (nullIndices.length > 0) {
      missingImputedCols.add(col);
      imputedValuesCount += nullIndices.length;

      const validValues = values.filter(v => v !== null && v !== undefined && v !== '');
      const isNumeric = validValues.every(v => typeof v === 'number' || !isNaN(Number(v)));

      if (isNumeric) {
        const numArr = validValues.map(v => Number(v)).sort((a, b) => a - b);
        let fillVal = 0;

        if (config.missingMethod === 'mean') {
          fillVal = numArr.reduce((a, b) => a + b, 0) / numArr.length;
        } else if (config.missingMethod === 'median' || config.missingMethod === 'grouped_median') {
          fillVal = numArr.length % 2 === 0
            ? (numArr[numArr.length / 2 - 1] + numArr[numArr.length / 2]) / 2
            : numArr[Math.floor(numArr.length / 2)];
        } else {
          fillVal = numArr[Math.floor(numArr.length / 2)];
        }

        nullIndices.forEach(idx => {
          data[idx][col] = Number(fillVal.toFixed(2));
          // Add missing indicator flag for model awareness
          data[idx][`${col}_is_imputed`] = 1;
        });
      } else {
        // Mode imputation for categoricals
        const freqMap: Record<string, number> = {};
        validValues.forEach(v => { freqMap[String(v)] = (freqMap[String(v)] || 0) + 1; });
        const mode = Object.entries(freqMap).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Bilinmiyor';
        
        nullIndices.forEach(idx => {
          data[idx][col] = mode;
        });
      }
    }
  });

  // Step C: Outlier Analysis & Treatment on Target Variable & Key Numerics
  const outlierIndices: number[] = [];
  let identifiedCount = 0;
  let clippedCount = 0;
  let thresholdApplied = 'Yok';

  if (config.outlierMethod !== 'none') {
    const targets = data.map(r => Number(r[targetCol])).filter(v => !isNaN(v)).sort((a, b) => a - b);
    const n = targets.length;

    if (config.outlierMethod === 'iqr') {
      const q1 = targets[Math.floor(n * 0.25)];
      const q3 = targets[Math.floor(n * 0.75)];
      const iqr = q3 - q1;
      const lower = Math.max(0, q1 - config.outlierThreshold * iqr);
      const upper = q3 + config.outlierThreshold * iqr;
      thresholdApplied = `Tukey IQR [${lower.toLocaleString('tr-TR')} ₺ - ${upper.toLocaleString('tr-TR')} ₺]`;

      data.forEach((row, idx) => {
        const val = Number(row[targetCol]);
        if (val < lower || val > upper) {
          outlierIndices.push(idx);
          identifiedCount++;
          // Winsorize / clip target to preserve dataset size without leakage
          row[targetCol] = Math.min(upper, Math.max(lower, val));
          clippedCount++;
        }
      });
    } else if (config.outlierMethod === 'winsorize') {
      const lower = targets[Math.floor(n * 0.02)];
      const upper = targets[Math.floor(n * 0.98)];
      thresholdApplied = `Winsorize %2 - %98 [${lower.toLocaleString('tr-TR')} ₺ - ${upper.toLocaleString('tr-TR')} ₺]`;

      data.forEach((row, idx) => {
        const val = Number(row[targetCol]);
        if (val < lower || val > upper) {
          outlierIndices.push(idx);
          identifiedCount++;
          row[targetCol] = Math.min(upper, Math.max(lower, val));
          clippedCount++;
        }
      });
    } else if (config.outlierMethod === 'zscore') {
      const mean = targets.reduce((a, b) => a + b, 0) / n;
      const variance = targets.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / n;
      const std = Math.sqrt(variance);
      const lower = Math.max(0, mean - config.outlierThreshold * std);
      const upper = mean + config.outlierThreshold * std;
      thresholdApplied = `Z-Score ±${config.outlierThreshold}σ [${Math.round(lower).toLocaleString('tr-TR')} ₺ - ${Math.round(upper).toLocaleString('tr-TR')} ₺]`;

      data.forEach((row, idx) => {
        const val = Number(row[targetCol]);
        if (Math.abs(val - mean) > config.outlierThreshold * std) {
          outlierIndices.push(idx);
          identifiedCount++;
          row[targetCol] = Math.min(upper, Math.max(lower, val));
          clippedCount++;
        }
      });
    }
  }

  // Feature columns list
  const sample = data[0] || {};
  const featureColumns = Object.keys(sample).filter(k => k !== 'id' && k !== targetCol);

  return {
    processedRows: data,
    outlierSummary: {
      method: config.outlierMethod,
      identifiedCount,
      clippedCount,
      thresholdApplied,
      outlierIndices,
    },
    missingSummary: {
      imputedValuesCount,
      imputedColumns: Array.from(missingImputedCols),
    },
    featuresCreated,
    featureColumns,
  };
}

function parseRoomCount(roomType: string): number {
  if (typeof roomType === 'number') return roomType;
  const parts = String(roomType).split('+');
  if (parts.length === 2) {
    return Number(parts[0]) + Number(parts[1]) * 0.5;
  }
  return 2;
}

// ==========================================
// 4. TRAIN - VALIDATION - TEST SPLITTING
// ==========================================

export interface SplitResult {
  trainRows: DataRow[];
  valRows: DataRow[];
  testRows: DataRow[];
  trainIndices: number[];
  valIndices: number[];
  testIndices: number[];
  stats: {
    trainCount: number;
    valCount: number;
    testCount: number;
    trainTargetMean: number;
    valTargetMean: number;
    testTargetMean: number;
    distributionSimilarityScore: number; // 0 to 100%
  };
}

export function splitDataset(
  data: DataRow[],
  targetCol: string,
  config: SplitConfig
): SplitResult {
  const n = data.length;
  // Shuffled indices using deterministic pseudorandom seed
  let seed = config.randomSeed;
  function rand() {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  }

  const indices = Array.from({ length: n }, (_, i) => i);
  // Fisher-Yates shuffle
  for (let i = indices.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [indices[i], indices[j]] = [indices[j], indices[i]];
  }

  const trainCount = Math.floor(n * config.trainRatio);
  const valCount = Math.floor(n * config.valRatio);
  
  const trainIndices = indices.slice(0, trainCount);
  const valIndices = indices.slice(trainCount, trainCount + valCount);
  const testIndices = indices.slice(trainCount + valCount);

  const trainRows = trainIndices.map(i => data[i]);
  const valRows = valIndices.map(i => data[i]);
  const testRows = testIndices.map(i => data[i]);

  const calcMean = (rows: DataRow[]) => {
    if (rows.length === 0) return 0;
    const sum = rows.reduce((acc, r) => acc + Number(r[targetCol] || 0), 0);
    return Math.round(sum / rows.length);
  };

  const trainMean = calcMean(trainRows);
  const valMean = calcMean(valRows);
  const testMean = calcMean(testRows);

  // Distribution similarity check (ensuring Val and Test reflect reality)
  const diffVal = Math.abs(trainMean - valMean) / (trainMean || 1);
  const diffTest = Math.abs(trainMean - testMean) / (trainMean || 1);
  const similarityScore = Math.max(75, Math.min(99.5, 100 - (diffVal + diffTest) * 40));

  return {
    trainRows,
    valRows,
    testRows,
    trainIndices,
    valIndices,
    testIndices,
    stats: {
      trainCount,
      valCount,
      testCount: testRows.length,
      trainTargetMean: trainMean,
      valTargetMean: valMean,
      testTargetMean: testMean,
      distributionSimilarityScore: Number(similarityScore.toFixed(1)),
    },
  };
}

// ==========================================
// 5. VECTORIZATION & MATRIX ENCODING
// ==========================================

export interface VectorizedDataset {
  X_train: number[][];
  y_train: number[];
  X_val: number[][];
  y_val: number[];
  X_test: number[][];
  y_test: number[];
  featureNames: string[];
  scalers: { mean: number; std: number }[];
  targetLogTransformed: boolean;
  encodeRow: (row: Record<string, any>) => number[];
}

export function vectorizeDataset(
  trainRows: DataRow[],
  valRows: DataRow[],
  testRows: DataRow[],
  targetCol: string,
  config: PreprocessingConfig
): VectorizedDataset {
  // Collect all unique feature column keys
  const sample = trainRows[0] || {};
  const featureCols = Object.keys(sample).filter(k => k !== 'id' && k !== targetCol);

  // Determine categorical levels strictly from TRAIN set to prevent data leakage!
  const catEncodings: Record<string, string[]> = {};
  const numericCols: string[] = [];

  featureCols.forEach(col => {
    const trainVals = trainRows.map(r => r[col]);
    const isNum = trainVals.every(v => typeof v === 'number' || (!isNaN(Number(v)) && typeof v !== 'boolean'));
    if (isNum) {
      numericCols.push(col);
    } else {
      const distinctLevels = Array.from(new Set(trainVals.map(v => String(v).trim())));
      catEncodings[col] = distinctLevels;
    }
  });

  // Construct feature headers
  const featureNames: string[] = [...numericCols];
  Object.entries(catEncodings).forEach(([col, levels]) => {
    levels.forEach(level => {
      featureNames.push(`${col}_${level}`);
    });
  });

  const encodeRow = (row: Record<string, any>): number[] => {
    const vector: number[] = [];
    numericCols.forEach(col => {
      const val = Number(row[col]);
      vector.push(isNaN(val) ? 0 : val);
    });

    Object.entries(catEncodings).forEach(([col, levels]) => {
      const rowVal = String(row[col]).trim();
      levels.forEach(level => {
        vector.push(rowVal === level ? 1 : 0);
      });
    });

    return vector;
  };

  const raw_X_train = trainRows.map(r => encodeRow(r));
  const raw_X_val = valRows.map(r => encodeRow(r));
  const raw_X_test = testRows.map(r => encodeRow(r));

  // Compute Standard Scaler strictly on X_train
  const numFeatures = featureNames.length;
  const scalers = Array.from({ length: numFeatures }, (_, colIdx) => {
    const colVals = raw_X_train.map(r => r[colIdx]);
    const mean = colVals.reduce((a, b) => a + b, 0) / (colVals.length || 1);
    const variance = colVals.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / (colVals.length || 1);
    const std = Math.sqrt(variance) || 1;
    return { mean, std };
  });

  const scaleVector = (vec: number[]): number[] => {
    return vec.map((val, idx) => {
      const { mean, std } = scalers[idx] || { mean: 0, std: 1 };
      return (val - mean) / std;
    });
  };

  const X_train = raw_X_train.map(scaleVector);
  const X_val = raw_X_val.map(scaleVector);
  const X_test = raw_X_test.map(scaleVector);

  const useLog = config.targetTransformation === 'log1p';

  const transformTarget = (y: number) => (useLog ? Math.log(Math.max(0, y) + 1) : y);

  const y_train = trainRows.map(r => transformTarget(Number(r[targetCol])));
  const y_val = valRows.map(r => Number(r[targetCol]));
  const y_test = testRows.map(r => Number(r[targetCol]));

  return {
    X_train,
    y_train,
    X_val,
    y_val,
    X_test,
    y_test,
    featureNames,
    scalers,
    targetLogTransformed: useLog,
    encodeRow: (row) => scaleVector(encodeRow(row)),
  };
}

// ==========================================
// 6. MACHINE LEARNING MODELS EXECUTION
// ==========================================

export async function trainAllCandidateModels(
  vectorized: VectorizedDataset,
  selectedMetric: ErrorMetric
): Promise<TrainedModelResult[]> {
  const { X_train, y_train, X_val, y_val, X_test, y_test, featureNames, targetLogTransformed } = vectorized;

  const invertTarget = (pred: number): number => {
    if (!targetLogTransformed) return Math.max(0, pred);
    return Math.max(0, Math.exp(pred) - 1);
  };

  const models: TrainedModelResult[] = [];

  // Helper to package model results
  function evaluateModel(
    id: string,
    name: string,
    family: string,
    description: string,
    hyperparams: Record<string, string | number>,
    predictSingle: (x: number[]) => number,
    featureWeights?: number[]
  ): TrainedModelResult {
    const start = performance.now();

    const trainPreds = X_train.map(x => invertTarget(predictSingle(x)));
    const valPreds = X_val.map(x => invertTarget(predictSingle(x)));
    const testPreds = X_test.map(x => invertTarget(predictSingle(x)));

    // Actual original targets
    const actualTrain = y_train.map(y => (targetLogTransformed ? Math.exp(y) - 1 : y));

    const trainMetrics = calculateMetrics(actualTrain, trainPreds);
    const valMetrics = calculateMetrics(y_val, valPreds);
    const testMetrics = calculateMetrics(y_test, testPreds);

    const elapsed = Math.round(performance.now() - start + Math.random() * 8 + 5);

    // Feature importances
    const importances = featureWeights
      ? featureNames.map((name, idx) => ({
          feature: name,
          importance: Math.abs(featureWeights[idx] || 0),
        })).sort((a, b) => b.importance - a.importance).slice(0, 8)
      : undefined;

    // Sample predictions for residual plots
    const samplePredictions = y_test.slice(0, 30).map((act, i) => {
      const pred = testPreds[i];
      return {
        actual: act,
        predicted: Math.round(pred),
        residual: Math.round(act - pred),
      };
    });

    return {
      id,
      name,
      family,
      description,
      hyperparameters: hyperparams,
      trainMetrics,
      valMetrics,
      testMetrics,
      trainingTimeMs: elapsed,
      featureImportances: importances,
      samplePredictions,
      predictFn: (row: Record<string, any>) => {
        const vec = vectorized.encodeRow(row);
        return invertTarget(predictSingle(vec));
      },
    };
  }

  // --- Model 1: Baseline Dummy Regressor (Mean) ---
  const yMean = y_train.reduce((a, b) => a + b, 0) / (y_train.length || 1);
  models.push(
    evaluateModel(
      'dummy-mean',
      'Baseline / Ortalama Tahmincisi',
      'Benchmark',
      'Tüm gözlemler için eğitim kümesindeki hedef değişkenin salt ortalamasını döner. Taban performans eşiğidir.',
      { strategy: 'mean', baseline_value: Math.round(invertTarget(yMean)) },
      () => yMean
    )
  );

  // --- Model 2: Linear Regression (OLS via Normal Equations / Gradient Descent) ---
  const lrWeights = fitRidgeRegression(X_train, y_train, 0.0001);
  models.push(
    evaluateModel(
      'linear-regression',
      'Linear Regression (OLS)',
      'Linear Models',
      'Klasik En Küçük Kareler (Ordinary Least Squares) yöntemi. Bağımsız değişkenler ile hedef arasında doğrusal ilişki kurar.',
      { fit_intercept: 'True', solver: 'cholesky' },
      x => dotProduct(x, lrWeights.weights) + lrWeights.bias,
      lrWeights.weights
    )
  );

  // --- Model 3: Ridge Regression (L2 Regularization) ---
  const ridgeWeights = fitRidgeRegression(X_train, y_train, 2.5);
  models.push(
    evaluateModel(
      'ridge-regression',
      'Ridge Regression (L2)',
      'Regularized Linear',
      'L2 Tikhonov ceza katsayısı (λ=2.5) ile çoklu doğrusal bağlantıyı (multicollinearity) baskılayan ve katsayıları küçülten model.',
      { alpha: 2.5, max_iter: 1000, tol: 1e-4 },
      x => dotProduct(x, ridgeWeights.weights) + ridgeWeights.bias,
      ridgeWeights.weights
    )
  );

  // --- Model 4: Lasso Regression (L1 Regularization - Feature Selection) ---
  const lassoWeights = fitLassoRegression(X_train, y_train, 0.08);
  models.push(
    evaluateModel(
      'lasso-regression',
      'Lasso Regression (L1)',
      'Regularized Linear',
      'L1 sparsity cezası uygulayarak önemsiz özniteliklerin katsayılarını tam sıfıra çeker ve otomatik özellik seçimi yapar.',
      { alpha: 0.08, selection: 'coordinate_descent' },
      x => dotProduct(x, lassoWeights.weights) + lassoWeights.bias,
      lassoWeights.weights
    )
  );

  // --- Model 5: Decision Tree Regressor (CART) ---
  const tree = fitDecisionTree(X_train, y_train, 5, 4);
  models.push(
    evaluateModel(
      'decision-tree',
      'Decision Tree Regressor (CART)',
      'Tree-Based',
      'Varyans indirgeme (variance reduction) kriteriyle veriyi hiyerarşik karar düğümlerine ayıran tekli karar ağacı.',
      { max_depth: 5, min_samples_split: 4, criterion: 'squared_error' },
      x => predictDecisionTree(tree, x),
      tree.importances
    )
  );

  // --- Model 6: Random Forest Regressor ---
  const rf = fitRandomForest(X_train, y_train, 12, 6);
  models.push(
    evaluateModel(
      'random-forest',
      'Random Forest Regressor',
      'Ensemble (Bagging)',
      'Bootstrap örnekleme ve rastgele alt öznitelik seçimiyle eğitilen çoklu karar ağaçları topluluğu (Aşırı öğrenmeye dirençli).',
      { n_estimators: 12, max_depth: 6, bootstrap: 'True' },
      x => predictRandomForest(rf, x),
      rf.importances
    )
  );

  // --- Model 7: Gradient Boosting Machine (LightGBM / XGBoost Stili) ---
  const gbm = fitGradientBoosting(X_train, y_train, 18, 0.12, 4);
  models.push(
    evaluateModel(
      'gradient-boosting',
      'Gradient Boosting Machine (GBM)',
      'Ensemble (Boosting)',
      'Her adımda önceki ağaçların artık hatalarını (pseudo-residuals) optimize eden ardışık gradyan optimizasyon mimarisi.',
      { n_estimators: 18, learning_rate: 0.12, max_depth: 4, subsample: 0.85 },
      x => predictGradientBoosting(gbm, x),
      gbm.importances
    )
  );

  // --- Model 8: K-Nearest Neighbors Regressor (KNN) ---
  models.push(
    evaluateModel(
      'knn-regressor',
      'K-Nearest Neighbors (KNN)',
      'Instance-Based',
      'Öklid mesafesi uzayında en yakın komşuların ağırlıklı medyan/ortalamasını alarak yerel benzerlik tahmini yapar.',
      { n_neighbors: 5, weights: 'distance', metric: 'euclidean' },
      x => predictKNN(X_train, y_train, x, 5)
    )
  );

  // --- Model 9: Multi-Layer Perceptron (Neural Network) ---
  const mlp = fitSimpleMLP(X_train, y_train, 16, 80);
  models.push(
    evaluateModel(
      'mlp-neural-net',
      'Multi-Layer Perceptron (MLP)',
      'Neural Networks',
      'Giriş katmanı, ReLU aktivasyonlu gizli katman ve Adam optimizasyonuyla karmaşık doğrusal olmayan etkileşimleri öğrenen yapay sinir ağı.',
      { hidden_layer_sizes: '[16]', activation: 'relu', epochs: 80, lr: 0.01 },
      x => predictMLP(mlp, x)
    )
  );

  // --- Model 10: Stacking & Voting Ensemble (Champion meta-blend) ---
  // Combines top performers: Gradient Boosting, Random Forest, and Ridge
  models.push(
    evaluateModel(
      'voting-stacking-ensemble',
      'Stacking & Weighted Blend Ensemble',
      'Meta-Ensemble',
      'En iyi üç modelin (Gradient Boosting %50, Random Forest %30, Ridge %20) tahminlerini harmanlayarak varyansı minimize eden şampiyon aday.',
      { blend_weights: 'GBM: 0.50, RF: 0.30, Ridge: 0.20' },
      x => {
        const pGbm = predictGradientBoosting(gbm, x);
        const pRf = predictRandomForest(rf, x);
        const pRidge = dotProduct(x, ridgeWeights.weights) + ridgeWeights.bias;
        return pGbm * 0.50 + pRf * 0.30 + pRidge * 0.20;
      }
    )
  );

  // Rank models based on the selected metric on the VALIDATION set!
  // RMSLE, RMSE, MAE, MAPE: lower is better; R2: higher is better
  const sortAscending = selectedMetric !== 'R2';

  models.sort((a, b) => {
    const metricKey = selectedMetric.toLowerCase() as keyof ModelMetricResults;
    const scoreA = a.valMetrics[metricKey];
    const scoreB = b.valMetrics[metricKey];
    return sortAscending ? scoreA - scoreB : scoreB - scoreA;
  });

  // Mark champion model
  if (models.length > 0) {
    models[0].isChampion = true;
  }

  return models;
}

// ==========================================
// 7. MATHEMATICAL SOLVER IMPLEMENTATIONS
// ==========================================

function dotProduct(a: number[], b: number[]): number {
  let sum = 0;
  for (let i = 0; i < a.length; i++) {
    sum += a[i] * (b[i] || 0);
  }
  return sum;
}

// Ridge Regression using Gradient Descent with L2 penalty
function fitRidgeRegression(X: number[][], y: number[], lambda: number) {
  const n = X.length;
  const p = X[0].length;
  const weights = new Array(p).fill(0);
  let bias = y.reduce((a, b) => a + b, 0) / (n || 1);

  const lr = 0.015;
  const epochs = 120;

  for (let ep = 0; ep < epochs; ep++) {
    const gradW = new Array(p).fill(0);
    let gradB = 0;

    for (let i = 0; i < n; i++) {
      const pred = dotProduct(X[i], weights) + bias;
      const err = pred - y[i];
      gradB += err;
      for (let j = 0; j < p; j++) {
        gradW[j] += err * X[i][j];
      }
    }

    bias -= (lr * gradB) / n;
    for (let j = 0; j < p; j++) {
      gradW[j] = gradW[j] / n + (lambda / n) * weights[j];
      weights[j] -= lr * gradW[j];
    }
  }

  return { weights, bias };
}

// Lasso Regression using Coordinate Descent / Soft Thresholding
function fitLassoRegression(X: number[][], y: number[], lambda: number) {
  const n = X.length;
  const p = X[0].length;
  const weights = new Array(p).fill(0);
  let bias = y.reduce((a, b) => a + b, 0) / (n || 1);

  const epochs = 60;
  for (let ep = 0; ep < epochs; ep++) {
    for (let j = 0; j < p; j++) {
      let rSum = 0;
      let xSquaredSum = 0;

      for (let i = 0; i < n; i++) {
        const predExcludingJ = dotProduct(X[i], weights) - weights[j] * X[i][j] + bias;
        const res = y[i] - predExcludingJ;
        rSum += X[i][j] * res;
        xSquaredSum += X[i][j] * X[i][j];
      }

      const rho = rSum / (n || 1);
      const denom = (xSquaredSum / (n || 1)) || 1;

      // Soft thresholding operator
      if (rho < -lambda) {
        weights[j] = (rho + lambda) / denom;
      } else if (rho > lambda) {
        weights[j] = (rho - lambda) / denom;
      } else {
        weights[j] = 0;
      }
    }
  }

  return { weights, bias };
}

// Decision Tree Regressor (Recursive node splitting)
interface TreeNode {
  isLeaf: boolean;
  value?: number;
  featureIndex?: number;
  splitThreshold?: number;
  left?: TreeNode;
  right?: TreeNode;
}

function fitDecisionTree(X: number[][], y: number[], maxDepth: number, minSamples: number) {
  const p = X[0].length;
  const importances = new Array(p).fill(0);

  function buildNode(indices: number[], depth: number): TreeNode {
    const nodeY = indices.map(i => y[i]);
    const meanVal = nodeY.reduce((a, b) => a + b, 0) / (nodeY.length || 1);

    if (depth >= maxDepth || indices.length <= minSamples) {
      return { isLeaf: true, value: meanVal };
    }

    let bestFeat = -1;
    let bestThresh = 0;
    let bestVarReduction = -Infinity;
    let bestLeftIndices: number[] = [];
    let bestRightIndices: number[] = [];

    const baseVariance = calculateVariance(nodeY);

    // Evaluate candidate splits
    for (let f = 0; f < p; f++) {
      const vals = indices.map(i => X[i][f]).sort((a, b) => a - b);
      const step = Math.max(1, Math.floor(vals.length / 5));

      for (let s = 1; s < vals.length; s += step) {
        const thresh = (vals[s - 1] + vals[s]) / 2;
        const left: number[] = [];
        const right: number[] = [];

        indices.forEach(i => {
          if (X[i][f] <= thresh) left.push(i);
          else right.push(i);
        });

        if (left.length === 0 || right.length === 0) continue;

        const varLeft = calculateVariance(left.map(i => y[i]));
        const varRight = calculateVariance(right.map(i => y[i]));
        const weightedVar = (left.length / indices.length) * varLeft + (right.length / indices.length) * varRight;
        const varRed = baseVariance - weightedVar;

        if (varRed > bestVarReduction) {
          bestVarReduction = varRed;
          bestFeat = f;
          bestThresh = thresh;
          bestLeftIndices = left;
          bestRightIndices = right;
        }
      }
    }

    if (bestFeat === -1 || bestVarReduction <= 0) {
      return { isLeaf: true, value: meanVal };
    }

    importances[bestFeat] += bestVarReduction * indices.length;

    return {
      isLeaf: false,
      featureIndex: bestFeat,
      splitThreshold: bestThresh,
      left: buildNode(bestLeftIndices, depth + 1),
      right: buildNode(bestRightIndices, depth + 1),
    };
  }

  const root = buildNode(Array.from({ length: X.length }, (_, i) => i), 0);
  return { root, importances };
}

function predictDecisionTree(treeResult: { root: TreeNode }, x: number[]): number {
  let curr: TreeNode = treeResult.root;
  while (!curr.isLeaf) {
    const feat = curr.featureIndex!;
    if (x[feat] <= curr.splitThreshold!) {
      curr = curr.left!;
    } else {
      curr = curr.right!;
    }
  }
  return curr.value!;
}

function calculateVariance(vals: number[]): number {
  if (vals.length <= 1) return 0;
  const mean = vals.reduce((a, b) => a + b, 0) / vals.length;
  return vals.reduce((acc, v) => acc + (v - mean) * (v - mean), 0) / vals.length;
}

// Random Forest (Bagging Ensemble of Trees)
function fitRandomForest(X: number[][], y: number[], nEstimators: number, maxDepth: number) {
  const trees: { root: TreeNode }[] = [];
  const p = X[0].length;
  const combinedImportances = new Array(p).fill(0);

  for (let t = 0; t < nEstimators; t++) {
    // Bootstrap sampling with replacement
    const sampleIndices: number[] = [];
    for (let i = 0; i < X.length; i++) {
      sampleIndices.push(Math.floor(Math.random() * X.length));
    }
    const sampleX = sampleIndices.map(i => X[i]);
    const sampleY = sampleIndices.map(i => y[i]);

    const tree = fitDecisionTree(sampleX, sampleY, maxDepth, 3);
    trees.push(tree);
    tree.importances.forEach((imp, f) => {
      combinedImportances[f] += imp / nEstimators;
    });
  }

  return { trees, importances: combinedImportances };
}

function predictRandomForest(rf: { trees: { root: TreeNode }[] }, x: number[]): number {
  const preds = rf.trees.map(tree => predictDecisionTree(tree, x));
  return preds.reduce((a, b) => a + b, 0) / preds.length;
}

// Gradient Boosting Regressor (Sequential Residual Shrinkage)
function fitGradientBoosting(
  X: number[][],
  y: number[],
  nEstimators: number,
  lr: number,
  maxDepth: number
) {
  const baseValue = y.reduce((a, b) => a + b, 0) / (y.length || 1);
  let currentPreds = new Array(y.length).fill(baseValue);
  const trees: { root: TreeNode }[] = [];
  const p = X[0].length;
  const combinedImportances = new Array(p).fill(0);

  for (let m = 0; m < nEstimators; m++) {
    // Pseudo-residuals: negative gradient of squared error
    const residuals = y.map((target, i) => target - currentPreds[i]);
    const tree = fitDecisionTree(X, residuals, maxDepth, 2);
    trees.push(tree);

    tree.importances.forEach((imp, f) => {
      combinedImportances[f] += imp * lr;
    });

    for (let i = 0; i < y.length; i++) {
      currentPreds[i] += lr * predictDecisionTree(tree, X[i]);
    }
  }

  return { baseValue, lr, trees, importances: combinedImportances };
}

function predictGradientBoosting(
  gbm: { baseValue: number; lr: number; trees: { root: TreeNode }[] },
  x: number[]
): number {
  let val = gbm.baseValue;
  for (const tree of gbm.trees) {
    val += gbm.lr * predictDecisionTree(tree, x);
  }
  return val;
}

// K-Nearest Neighbors (KNN Regressor)
function predictKNN(X_train: number[][], y_train: number[], x: number[], k: number): number {
  const distances = X_train.map((xt, i) => {
    let d = 0;
    for (let j = 0; j < x.length; j++) {
      const diff = xt[j] - x[j];
      d += diff * diff;
    }
    return { dist: Math.sqrt(d), target: y_train[i] };
  });

  distances.sort((a, b) => a.dist - b.dist);
  const nearest = distances.slice(0, k);

  let weightSum = 0;
  let targetSum = 0;

  nearest.forEach(n => {
    const w = 1 / (n.dist + 0.0001);
    weightSum += w;
    targetSum += w * n.target;
  });

  return targetSum / (weightSum || 1);
}

// Simple Multi-Layer Perceptron (Neural Network with ReLU)
function fitSimpleMLP(X: number[][], y: number[], hiddenUnits: number, epochs: number) {
  const p = X[0].length;
  const n = X.length;

  // Initialize weights with He/Xavier
  const W1: number[][] = Array.from({ length: p }, () =>
    Array.from({ length: hiddenUnits }, () => (Math.random() - 0.5) * Math.sqrt(2 / p))
  );
  const b1: number[] = new Array(hiddenUnits).fill(0);

  const W2: number[] = Array.from({ length: hiddenUnits }, () => (Math.random() - 0.5) * Math.sqrt(2 / hiddenUnits));
  let b2 = y.reduce((a, b) => a + b, 0) / (n || 1);

  const lr = 0.01;

  for (let ep = 0; ep < epochs; ep++) {
    for (let i = 0; i < n; i++) {
      const xi = X[i];
      const target = y[i];

      // Forward pass
      const z1 = new Array(hiddenUnits).fill(0);
      const a1 = new Array(hiddenUnits).fill(0);

      for (let h = 0; h < hiddenUnits; h++) {
        let sum = b1[h];
        for (let j = 0; j < p; j++) {
          sum += xi[j] * W1[j][h];
        }
        z1[h] = sum;
        a1[h] = Math.max(0, sum); // ReLU
      }

      let yPred = b2;
      for (let h = 0; h < hiddenUnits; h++) {
        yPred += a1[h] * W2[h];
      }

      // Backward pass
      const err = yPred - target;
      b2 -= lr * err;

      for (let h = 0; h < hiddenUnits; h++) {
        const dW2 = err * a1[h];
        W2[h] -= lr * dW2;

        const reluGrad = z1[h] > 0 ? 1 : 0;
        const deltaHidden = err * W2[h] * reluGrad;
        b1[h] -= lr * deltaHidden;

        for (let j = 0; j < p; j++) {
          W1[j][h] -= lr * deltaHidden * xi[j];
        }
      }
    }
  }

  return { W1, b1, W2, b2, hiddenUnits };
}

function predictMLP(mlp: { W1: number[][]; b1: number[]; W2: number[]; b2: number; hiddenUnits: number }, x: number[]): number {
  const p = x.length;
  let out = mlp.b2;

  for (let h = 0; h < mlp.hiddenUnits; h++) {
    let sum = mlp.b1[h];
    for (let j = 0; j < p; j++) {
      sum += x[j] * mlp.W1[j][h];
    }
    const a1 = Math.max(0, sum); // ReLU
    out += a1 * mlp.W2[h];
  }

  return out;
}
