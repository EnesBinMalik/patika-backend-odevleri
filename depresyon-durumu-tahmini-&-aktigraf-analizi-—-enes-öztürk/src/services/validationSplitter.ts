import { PatientRecord, SplitResult } from '../types/depression';

export interface SplitAudit {
  isPatientIsolated: boolean;
  leakageDetected: boolean;
  trainConditionCount: number;
  trainControlCount: number;
  valConditionCount: number;
  valControlCount: number;
  testConditionCount: number;
  testControlCount: number;
  explanation: string;
}

/**
 * Performs Patient-Group Stratified Split into Train, Validation, and Test partitions.
 * Strictly guarantees that no patient's biometric signature or temporal windows appear
 * in more than one partition, preventing clinical data leakage.
 */
export function performPatientGroupSplit(
  patients: PatientRecord[],
  trainPct: number = 0.6,
  valPct: number = 0.2
): {
  splitResult: SplitResult;
  audit: SplitAudit;
} {
  const conditions = patients.filter((p) => p.group === 'condition');
  const controls = patients.filter((p) => p.group === 'control');

  // Deterministic shuffle with seed
  const shuffle = (array: PatientRecord[]) => {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = (i * 37 + 13) % (i + 1);
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  };

  const shuffledConditions = shuffle(conditions);
  const shuffledControls = shuffle(controls);

  const condTrainEnd = Math.round(shuffledConditions.length * trainPct);
  const condValEnd = condTrainEnd + Math.round(shuffledConditions.length * valPct);

  const ctrlTrainEnd = Math.round(shuffledControls.length * trainPct);
  const ctrlValEnd = ctrlTrainEnd + Math.round(shuffledControls.length * valPct);

  const train = [
    ...shuffledConditions.slice(0, condTrainEnd),
    ...shuffledControls.slice(0, ctrlTrainEnd),
  ];

  const val = [
    ...shuffledConditions.slice(condTrainEnd, condValEnd),
    ...shuffledControls.slice(ctrlTrainEnd, ctrlValEnd),
  ];

  const test = [
    ...shuffledConditions.slice(condValEnd),
    ...shuffledControls.slice(ctrlValEnd),
  ];

  // Audit check for patient ID leakage
  const trainIds = new Set(train.map((p) => p.id));
  const valIds = new Set(val.map((p) => p.id));
  const testIds = new Set(test.map((p) => p.id));

  let hasLeakage = false;
  for (const id of valIds) {
    if (trainIds.has(id)) hasLeakage = true;
  }
  for (const id of testIds) {
    if (trainIds.has(id) || valIds.has(id)) hasLeakage = true;
  }

  const audit: SplitAudit = {
    isPatientIsolated: !hasLeakage,
    leakageDetected: hasLeakage,
    trainConditionCount: train.filter((p) => p.group === 'condition').length,
    trainControlCount: train.filter((p) => p.group === 'control').length,
    valConditionCount: val.filter((p) => p.group === 'condition').length,
    valControlCount: val.filter((p) => p.group === 'control').length,
    testConditionCount: test.filter((p) => p.group === 'condition').length,
    testControlCount: test.filter((p) => p.group === 'control').length,
    explanation:
      'Hastaların dakika bazlı aktigraf zaman serileri tek bir hastaya aittir. Rastgele satır bölmesi (random row split) yapılırsa aynı hastanın sabah verisi eğitimde, akşam verisi testte yer alarak "Veri Sızıntısı (Data Leakage)" oluşur ve model yapay olarak %99 doğruluk gösterir fakat yeni bir hastada tamamen çöker. Bu nedenle "GroupStratifiedSplit" uygulanarak her hasta sadece tek bir sete atanmıştır.',
  };

  return {
    splitResult: {
      train,
      val,
      test,
      leakagePrevented: !hasLeakage,
      trainRatio: trainPct,
      valRatio: valPct,
      testRatio: Math.round((1 - trainPct - valPct) * 100) / 100,
    },
    audit,
  };
}
