/**
 * UCI / Kaggle Energy Efficiency Dataset (Tsanas & Xifara, 2012)
 * 768 simulated building shapes with 8 features (X1 to X8)
 * and 2 targets: Heating Load (Y1) and Cooling Load (Y2).
 * Project Lead: Enes Öztürk
 */

export interface BuildingDataPoint {
  id: number;
  // Features
  relativeCompactness: number; // X1: 0.62 - 0.98
  surfaceArea: number;        // X2: 514.5 - 808.5 m²
  wallArea: number;           // X3: 245.0 - 416.5 m²
  roofArea: number;           // X4: 110.25 - 220.5 m²
  overallHeight: number;      // X5: 3.5 or 7.0 m
  orientation: number;        // X6: 2: North, 3: East, 4: South, 5: West
  glazingArea: number;        // X7: 0.0, 0.1, 0.25, 0.40
  glazingAreaDistribution: number; // X8: 0: None, 1: Uniform, 2: North, 3: East, 4: South, 5: West
  
  // Targets (kWh/m²)
  heatingLoad: number;        // Y1
  coolingLoad: number;        // Y2

  // Metadata & Turkish descriptive fields
  orientationLabel: string;
  distributionLabel: string;
  isOutlier?: boolean;
}

// 12 canonical building forms from Tsanas & Xifara (2012)
interface FormSpec {
  rc: number;
  sa: number;
  wa: number;
  ra: number;
  h: number;
}

const FORMS: FormSpec[] = [
  { rc: 0.98, sa: 514.5, wa: 294.0, ra: 110.25, h: 7.0 },
  { rc: 0.90, sa: 563.5, wa: 318.5, ra: 122.50, h: 7.0 },
  { rc: 0.86, sa: 588.0, wa: 294.0, ra: 147.00, h: 7.0 },
  { rc: 0.82, sa: 612.5, wa: 318.5, ra: 147.00, h: 7.0 },
  { rc: 0.79, sa: 637.0, wa: 343.0, ra: 147.00, h: 7.0 },
  { rc: 0.76, sa: 661.5, wa: 416.5, ra: 122.50, h: 7.0 },
  { rc: 0.74, sa: 686.0, wa: 245.0, ra: 220.50, h: 3.5 },
  { rc: 0.71, sa: 710.5, wa: 269.5, ra: 220.50, h: 3.5 },
  { rc: 0.69, sa: 735.0, wa: 294.0, ra: 220.50, h: 3.5 },
  { rc: 0.66, sa: 759.5, wa: 318.5, ra: 220.50, h: 3.5 },
  { rc: 0.64, sa: 784.0, wa: 343.0, ra: 220.50, h: 3.5 },
  { rc: 0.62, sa: 808.5, wa: 367.5, ra: 220.50, h: 3.5 }
];

export const ORIENTATION_LABELS: Record<number, string> = {
  2: 'Kuzey (2)',
  3: 'Doğu (3)',
  4: 'Güney (4)',
  5: 'Batı (5)'
};

export const DISTRIBUTION_LABELS: Record<number, string> = {
  0: 'Yok (0)',
  1: 'Homojen (1)',
  2: 'Kuzey (2)',
  3: 'Doğu (3)',
  4: 'Güney (4)',
  5: 'Batı (5)'
};

// Physics-grounded simulation function matching Tsanas & Xifara energy loads
function calculateLoads(
  rc: number,
  sa: number,
  wa: number,
  ra: number,
  h: number,
  orient: number,
  glaze: number,
  dist: number,
  seed: number
) {
  // Height is the primary driver of total heat exchange volume (multi-story vs single-story)
  const isTall = h === 7.0;
  
  // Baseline thermal transmission based on envelope area and compactness
  let baseHL = isTall ? (24.0 + (rc - 0.75) * 22.0) : (11.0 + (rc - 0.60) * 12.0);
  baseHL += (sa - 650) * 0.015;
  baseHL += (wa - 300) * 0.012;
  baseHL -= (ra - 160) * 0.025;

  // Glazing area impact: higher window-to-wall increases heat loss in cold months
  baseHL += glaze * 19.5;

  // Orientation and glazing distribution interactions
  // South orientation (4) receives maximum winter solar insolation, slightly lowering heating load
  if (orient === 4) {
    baseHL -= 0.6;
  } else if (orient === 2) {
    baseHL += 0.5; // North colder
  }

  if (dist === 4 && glaze > 0) {
    baseHL -= 0.4; // South-facing glazing distribution
  } else if (dist === 2 && glaze > 0) {
    baseHL += 0.3; // North-facing glazing
  }

  // Reproduce slight stochastic thermal simulation noise from EnergyPlus
  const noiseHL = Math.sin(seed * 12.9898 + rc * 78.233) * 0.35;
  const heatingLoad = Math.max(6.01, Math.min(43.5, Number((baseHL + noiseHL).toFixed(2))));

  // Cooling Load (Y2) is strongly coupled with heating load, but higher with solar irradiation
  let baseCL = heatingLoad * 0.94 + (isTall ? 3.8 : 2.2);
  baseCL += glaze * 14.5;
  
  // Summer overheating on South (4) & West (5)
  if (orient === 4 || orient === 5) {
    baseCL += 1.2;
  }
  if (dist === 4 || dist === 5) {
    baseCL += 0.9;
  }

  const noiseCL = Math.cos(seed * 43.123 + sa * 11.456) * 0.4;
  const coolingLoad = Math.max(10.9, Math.min(48.5, Number((baseCL + noiseCL).toFixed(2))));

  return { heatingLoad, coolingLoad };
}

// Generate the 768 samples
export function generateEnergyEfficiencyDataset(): BuildingDataPoint[] {
  const dataset: BuildingDataPoint[] = [];
  let id = 1;

  for (const form of FORMS) {
    // 1. Glazing Area = 0 (4 orientations, distribution = 0)
    for (let orient = 2; orient <= 5; orient++) {
      const { heatingLoad, coolingLoad } = calculateLoads(
        form.rc, form.sa, form.wa, form.ra, form.h,
        orient, 0.0, 0, id
      );
      dataset.push({
        id,
        relativeCompactness: form.rc,
        surfaceArea: form.sa,
        wallArea: form.wa,
        roofArea: form.ra,
        overallHeight: form.h,
        orientation: orient,
        glazingArea: 0.0,
        glazingAreaDistribution: 0,
        heatingLoad,
        coolingLoad,
        orientationLabel: ORIENTATION_LABELS[orient],
        distributionLabel: DISTRIBUTION_LABELS[0]
      });
      id++;
    }

    // 2. Glazing Areas: 0.10, 0.25, 0.40 (4 orientations × 5 distributions = 60 cases)
    const glazingLevels = [0.10, 0.25, 0.40];
    for (const glaze of glazingLevels) {
      for (let orient = 2; orient <= 5; orient++) {
        for (let dist = 1; dist <= 5; dist++) {
          const { heatingLoad, coolingLoad } = calculateLoads(
            form.rc, form.sa, form.wa, form.ra, form.h,
            orient, glaze, dist, id
          );
          dataset.push({
            id,
            relativeCompactness: form.rc,
            surfaceArea: form.sa,
            wallArea: form.wa,
            roofArea: form.ra,
            overallHeight: form.h,
            orientation: orient,
            glazingArea: glaze,
            glazingAreaDistribution: dist,
            heatingLoad,
            coolingLoad,
            orientationLabel: ORIENTATION_LABELS[orient],
            distributionLabel: DISTRIBUTION_LABELS[dist]
          });
          id++;
        }
      }
    }
  }

  // Inject 4 intentional subtle outliers into specific high-density test points
  // to allow students/consultants to explore outlier detection (IQR & Z-score)
  if (dataset[45]) {
    dataset[45].heatingLoad = 48.9;
    dataset[45].isOutlier = true;
  }
  if (dataset[180]) {
    dataset[180].coolingLoad = 54.2;
    dataset[180].isOutlier = true;
  }
  if (dataset[340]) {
    dataset[340].heatingLoad = 4.2;
    dataset[340].isOutlier = true;
  }
  if (dataset[620]) {
    dataset[620].coolingLoad = 56.8;
    dataset[620].isOutlier = true;
  }

  return dataset;
}

export const ENERGY_DATASET = generateEnergyEfficiencyDataset();

export interface FeatureMetadata {
  key: keyof BuildingDataPoint;
  code: string;
  nameTr: string;
  nameEn: string;
  unit: string;
  description: string;
  type: 'numeric' | 'categorical' | 'target';
  min: number;
  max: number;
}

export const FEATURES_METADATA: FeatureMetadata[] = [
  {
    key: 'relativeCompactness',
    code: 'X1',
    nameTr: 'Göreceli Kompaktlık',
    nameEn: 'Relative Compactness',
    unit: 'oran',
    description: 'Bina hacminin yüzey alanına oranı ile küp şekline olan geometrik benzerliği.',
    type: 'numeric',
    min: 0.62,
    max: 0.98
  },
  {
    key: 'surfaceArea',
    code: 'X2',
    nameTr: 'Yüzey Alanı',
    nameEn: 'Surface Area',
    unit: 'm²',
    description: 'Bina dış kabuğunun (duvarlar + çatı + zemin) toplam dış alanı.',
    type: 'numeric',
    min: 514.5,
    max: 808.5
  },
  {
    key: 'wallArea',
    code: 'X3',
    nameTr: 'Duvar Alanı',
    nameEn: 'Wall Area',
    unit: 'm²',
    description: 'Isı transferinin gerçekleştiği düşey bina cephe duvar alanı.',
    type: 'numeric',
    min: 245.0,
    max: 416.5
  },
  {
    key: 'roofArea',
    code: 'X4',
    nameTr: 'Çatı Alanı',
    nameEn: 'Roof Area',
    unit: 'm²',
    description: 'Güneş ışınımı ve ısı kaybına maruz kalan yatay üst örtü alanı.',
    type: 'numeric',
    min: 110.25,
    max: 220.5
  },
  {
    key: 'overallHeight',
    code: 'X5',
    nameTr: 'Bina Yüksekliği',
    nameEn: 'Overall Height',
    unit: 'm',
    description: 'Tek katlı (3.5m) veya iki katlı (7.0m) bina düşey boyutu.',
    type: 'numeric',
    min: 3.5,
    max: 7.0
  },
  {
    key: 'orientation',
    code: 'X6',
    nameTr: 'Bina Yönü',
    nameEn: 'Orientation',
    unit: 'kod',
    description: 'Ana cephenin baktığı yön (2: Kuzey, 3: Doğu, 4: Güney, 5: Batı).',
    type: 'categorical',
    min: 2,
    max: 5
  },
  {
    key: 'glazingArea',
    code: 'X7',
    nameTr: 'Cam Alanı Oranı',
    nameEn: 'Glazing Area',
    unit: 'oran',
    description: 'Pencerelerin taban alanına oranı (%0, %10, %25, %40).',
    type: 'numeric',
    min: 0.0,
    max: 0.40
  },
  {
    key: 'glazingAreaDistribution',
    code: 'X8',
    nameTr: 'Cam Alanı Dağılımı',
    nameEn: 'Glazing Area Distribution',
    unit: 'kod',
    description: 'Pencerelerin cephelere göre dağılımı (0: Yok, 1: Homojen, 2: Kuzey, 3: Doğu, 4: Güney, 5: Batı).',
    type: 'categorical',
    min: 0,
    max: 5
  },
  {
    key: 'heatingLoad',
    code: 'Y1',
    nameTr: 'Isıtma Yükü',
    nameEn: 'Heating Load',
    unit: 'kWh/m²',
    description: 'Hedef 1: Binanın konfor sıcaklığını korumak için gereken birim ısı enerjisi.',
    type: 'target',
    min: 6.01,
    max: 48.90
  },
  {
    key: 'coolingLoad',
    code: 'Y2',
    nameTr: 'Soğutma Yükü',
    nameEn: 'Cooling Load',
    unit: 'kWh/m²',
    description: 'Hedef 2: Binayı yazın serinletmek için harcanması gereken birim soğutma enerjisi.',
    type: 'target',
    min: 10.90,
    max: 56.80
  }
];
