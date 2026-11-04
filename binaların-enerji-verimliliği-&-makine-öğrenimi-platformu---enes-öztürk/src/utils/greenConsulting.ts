/**
 * Green Building & Energy Efficiency Consulting Engine
 * Project Lead: Enes Öztürk
 *
 * Provides carbon footprint calculations, building energy labels (A+ to G),
 * renewable energy payback estimates, and ecological optimization strategies.
 */

export interface EnergyAuditReport {
  floorArea: number; // m²
  heatingLoad: number; // kWh/m²
  coolingLoad: number; // kWh/m²
  totalEnergyIntensity: number; // kWh/m²/year
  annualEnergyTotalMWh: number; // MWh/year
  carbonFootprintTons: number; // Tonnes CO₂e/year
  energyClass: 'A+' | 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G';
  energyClassColor: string;
  potentialSavingsPercent: number;
  potentialCarbonReductionTons: number;
  solarPvCapacityKw: number;
  solarAnnualGenerationMWh: number;
  solarOffsetPercent: number;
  estimatedAnnualCostSavingsUsd: number;
  estimatedInvestmentCostUsd: number;
  paybackPeriodYears: number;
  recommendations: ConsultingRecommendation[];
}

export interface ConsultingRecommendation {
  id: string;
  titleTr: string;
  category: 'Kabuk Yalıtımı' | 'Cam & Gölgeleme' | 'Yenilenebilir Enerji' | 'Pasif Tasarım';
  impactPercent: number;
  carbonReductionTons: number;
  costEstimateUsd: number;
  paybackYears: number;
  descriptionTr: string;
  practicalActionTr: string;
}

export function generateGreenConsultingReport(params: {
  surfaceArea: number;
  wallArea: number;
  roofArea: number;
  overallHeight: number;
  glazingArea: number;
  heatingLoad: number;
  coolingLoad: number;
}): EnergyAuditReport {
  // Approximate floor area based on height and roof area
  const stories = params.overallHeight >= 5.0 ? 2 : 1;
  const floorArea = params.roofArea * stories;

  // Annual thermal demand (Heating + Cooling with COP/EER system efficiency factors)
  // Heating SCOP ~ 3.2, Cooling SEER ~ 3.8
  const heatingElectricity = (params.heatingLoad / 3.0);
  const coolingElectricity = (params.coolingLoad / 3.4);
  const lightingAndAppliances = 18.0; // Base kWh/m²/year
  const totalEnergyIntensity = Number((heatingElectricity + coolingElectricity + lightingAndAppliances).toFixed(1));

  const annualEnergyTotalMWh = Number(((totalEnergyIntensity * floorArea) / 1000).toFixed(2));

  // Carbon factor: 0.44 kg CO₂e / kWh (typical grid intensity)
  const carbonFootprintTons = Number(((annualEnergyTotalMWh * 1000 * 0.44) / 1000).toFixed(2));

  // Determine Energy Efficiency Class
  let energyClass: 'A+' | 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' = 'D';
  let energyClassColor = '#eab308';

  if (totalEnergyIntensity < 25) {
    energyClass = 'A+';
    energyClassColor = '#15803d'; // Dark Green
  } else if (totalEnergyIntensity < 35) {
    energyClass = 'A';
    energyClassColor = '#16a34a'; // Green
  } else if (totalEnergyIntensity < 48) {
    energyClass = 'B';
    energyClassColor = '#65a30d'; // Lime
  } else if (totalEnergyIntensity < 65) {
    energyClass = 'C';
    energyClassColor = '#ca8a04'; // Yellow-Amber
  } else if (totalEnergyIntensity < 85) {
    energyClass = 'D';
    energyClassColor = '#ea580c'; // Orange
  } else if (totalEnergyIntensity < 110) {
    energyClass = 'E';
    energyClassColor = '#dc2626'; // Red
  } else if (totalEnergyIntensity < 140) {
    energyClass = 'F';
    energyClassColor = '#b91c1c'; // Deep Red
  } else {
    energyClass = 'G';
    energyClassColor = '#7f1d1d'; // Crimson
  }

  // Solar Rooftop Potential: ~60% usable roof area, 200W/m² capacity
  const usableRoof = params.roofArea * 0.65;
  const solarPvCapacityKw = Number(((usableRoof * 0.20)).toFixed(1));
  const solarAnnualGenerationMWh = Number(((solarPvCapacityKw * 1350) / 1000).toFixed(2));
  const solarOffsetPercent = Math.min(100, Number(((solarAnnualGenerationMWh / (annualEnergyTotalMWh || 1)) * 100).toFixed(1)));

  // Recommendations tailored to current building parameters
  const recommendations: ConsultingRecommendation[] = [];

  if (params.glazingArea >= 0.25) {
    recommendations.push({
      id: 'glazing_upgrade',
      titleTr: 'Low-E Çift/Üçlü Cam ve Otomatik Dış Jaluzi',
      category: 'Cam & Gölgeleme',
      impactPercent: 18,
      carbonReductionTons: Number((carbonFootprintTons * 0.18).toFixed(2)),
      costEstimateUsd: Math.round(floorArea * 22),
      paybackYears: 3.8,
      descriptionTr: 'Yüksek cam oranlarında yaz aylarında aşırı ısınmayı önlemek ve kışın kondüksiyon kaybını %60 düşürmek için U-değeri 0.8 W/m²K olan gaz dolgulu Low-E cam.',
      practicalActionTr: 'Özellikle Güney ve Batı cephelerine entegre motorlu panjur veya lamel saçak monte edilmeli.'
    });
  }

  recommendations.push({
    id: 'solar_pv_system',
    titleTr: 'Çatı Üstü Güneş Enerjisi (PV) Santrali Kurulumu',
    category: 'Yenilenebilir Enerji',
    impactPercent: Math.min(50, Math.round(solarOffsetPercent)),
    carbonReductionTons: Number((solarAnnualGenerationMWh * 0.44).toFixed(2)),
    costEstimateUsd: Math.round(solarPvCapacityKw * 850),
    paybackYears: 4.2,
    descriptionTr: `Çatı alanının %65'ine kurulacak ${solarPvCapacityKw} kWp kurulu güç ile yıllık ${solarAnnualGenerationMWh} MWh temiz elektrik üretimi.`,
    practicalActionTr: 'Çift yönlü sayaç ile mahsuplaşma ve mikro-inverter tabanlı çatı PV sistemi devreye alınmalı.'
  });

  recommendations.push({
    id: 'envelope_insulation',
    titleTr: 'Dış Cephe Taşyünü Yalıtım Mantolama (10cm)',
    category: 'Kabuk Yalıtımı',
    impactPercent: 15,
    carbonReductionTons: Number((carbonFootprintTons * 0.15).toFixed(2)),
    costEstimateUsd: Math.round(params.wallArea * 30),
    paybackYears: 4.5,
    descriptionTr: 'Duvar alanının ısı iletim katsayısını 0.22 W/m²K seviyesine düşürerek ısıtma yükünü doğrudan azaltır.',
    practicalActionTr: 'Isı köprüleri (balkon bağlantıları ve pencere söveleri) yalıtım membranları ile kesintisiz kaplanmalı.'
  });

  if (params.roofArea >= 140) {
    recommendations.push({
      id: 'green_roof',
      titleTr: 'Kapsamlı Yeşil Çatı ve Yağmur Suyu Hasadı',
      category: 'Pasif Tasarım',
      impactPercent: 10,
      carbonReductionTons: Number((carbonFootprintTons * 0.10).toFixed(2)),
      costEstimateUsd: Math.round(params.roofArea * 45),
      paybackYears: 5.6,
      descriptionTr: 'Güneş ışınımını absorbe eden sedum bitki örtüsü çatı yüzey sıcaklığını yazın 60°C\'den 25°C\'ye indirir.',
      practicalActionTr: 'Drenaj katmanı üzerine kuraklığa dayanıklı sukulent örtü ve 10 m³ yağmur suyu deposu bağlanmalı.'
    });
  }

  const potentialSavingsPercent = 38;
  const potentialCarbonReductionTons = Number((carbonFootprintTons * 0.38).toFixed(2));
  const estimatedAnnualCostSavingsUsd = Math.round(annualEnergyTotalMWh * 1000 * 0.14 * 0.38);
  const estimatedInvestmentCostUsd = recommendations.reduce((acc, r) => acc + r.costEstimateUsd, 0);
  const paybackPeriodYears = Number((estimatedInvestmentCostUsd / (estimatedAnnualCostSavingsUsd || 1)).toFixed(1));

  return {
    floorArea,
    heatingLoad: params.heatingLoad,
    coolingLoad: params.coolingLoad,
    totalEnergyIntensity,
    annualEnergyTotalMWh,
    carbonFootprintTons,
    energyClass,
    energyClassColor,
    potentialSavingsPercent,
    potentialCarbonReductionTons,
    solarPvCapacityKw,
    solarAnnualGenerationMWh,
    solarOffsetPercent,
    estimatedAnnualCostSavingsUsd,
    estimatedInvestmentCostUsd,
    paybackPeriodYears,
    recommendations
  };
}
