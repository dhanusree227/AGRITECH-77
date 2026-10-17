/**
 * Agronomic calculations, yield prediction formulas, and farm financial estimations.
 * Decoupled pure logic with deterministic behavior for unit testing.
 */

export interface YieldPredictionInput {
  crop: string;
  cultivatedAreaAcres: number;
  season: 'Kharif' | 'Rabi' | 'Zaid';
  soilType: 'Alluvial' | 'Black' | 'Red' | 'Clay' | 'Sandy' | 'Loamy';
  irrigationType: 'Drip' | 'Canal' | 'Rainfed' | 'Sprinkler' | 'Borewell';
  farmingMethod: 'Organic' | 'Conventional' | 'Natural';
  historicalYieldQuintalsPerAcre?: number;
}

export interface YieldPredictionOutput {
  estimatedYieldQuintalsPerAcre: number;
  totalEstimatedYieldQuintals: number;
  confidenceScorePercent: number;
  uncertaintyRangeQuintals: [number, number];
  primaryFactors: string[];
}

export interface CultivationFinanceInput {
  seedCost: number;
  fertilizerCost: number;
  irrigationCost: number;
  laborCost: number;
  machineryCost: number;
  transportCost: number;
  otherCost: number;
  expectedYieldQuintals: number;
  expectedSellingPricePerQuintal: number;
}

export interface CultivationFinanceOutput {
  totalExpense: number;
  costPerQuintal: number;
  grossRevenue: number;
  netProfit: number;
  profitMarginPercent: number;
  breakEvenPricePerQuintal: number;
  roiPercent: number;
}

// Base yield constants in Quintals per acre (Indian agricultural benchmarks from ICAR / Agmarknet averages)
const BASE_YIELDS_QUINTALS_PER_ACRE: Record<string, number> = {
  Wheat: 18.5,
  Paddy: 22.0,
  Rice: 22.0,
  Cotton: 8.5,
  Soybean: 10.2,
  Tomato: 140.0,
  Onion: 110.0,
  Potato: 120.0,
  Maize: 24.0,
  Sugarcane: 320.0,
  Mustard: 7.5,
  Chilli: 9.0,
  Turmeric: 28.0,
};

const SOIL_MULTIPLIERS: Record<string, number> = {
  Alluvial: 1.15,
  Loamy: 1.12,
  Black: 1.08,
  Red: 0.95,
  Clay: 0.92,
  Sandy: 0.82,
};

const IRRIGATION_MULTIPLIERS: Record<string, number> = {
  Drip: 1.25,
  Sprinkler: 1.15,
  Borewell: 1.05,
  Canal: 1.0,
  Rainfed: 0.72,
};

const METHOD_MULTIPLIERS: Record<string, number> = {
  Conventional: 1.0,
  Organic: 0.88, // Typically lower initial biomass yield, offset by premium price
  Natural: 0.82,
};

export function calculateYieldPrediction(input: YieldPredictionInput): YieldPredictionOutput {
  const baseYield = BASE_YIELDS_QUINTALS_PER_ACRE[input.crop] || 15.0;
  const soilMult = SOIL_MULTIPLIERS[input.soilType] || 1.0;
  const irrMult = IRRIGATION_MULTIPLIERS[input.irrigationType] || 1.0;
  const methodMult = METHOD_MULTIPLIERS[input.farmingMethod] || 1.0;

  // Season suitability penalty/bonus
  let seasonMult = 1.0;
  if (input.season === 'Kharif' && ['Paddy', 'Rice', 'Cotton', 'Soybean', 'Maize'].includes(input.crop)) {
    seasonMult = 1.08;
  } else if (input.season === 'Rabi' && ['Wheat', 'Mustard', 'Potato', 'Onion'].includes(input.crop)) {
    seasonMult = 1.1;
  } else if (input.season === 'Zaid' && ['Tomato', 'Chilli'].includes(input.crop)) {
    seasonMult = 0.95;
  }

  let calculatedYieldPerAcre = baseYield * soilMult * irrMult * methodMult * seasonMult;

  // Weight in historical yield if provided
  if (input.historicalYieldQuintalsPerAcre && input.historicalYieldQuintalsPerAcre > 0) {
    calculatedYieldPerAcre = calculatedYieldPerAcre * 0.6 + input.historicalYieldQuintalsPerAcre * 0.4;
  }

  calculatedYieldPerAcre = Math.round(calculatedYieldPerAcre * 10) / 10;
  const totalEstimatedYield = Math.round(calculatedYieldPerAcre * input.cultivatedAreaAcres * 10) / 10;

  // Calibrate confidence score
  let confidence = 78;
  if (input.historicalYieldQuintalsPerAcre) confidence += 10;
  if (input.irrigationType === 'Drip') confidence += 5;
  if (input.irrigationType === 'Rainfed') confidence -= 12;
  confidence = Math.min(95, Math.max(50, confidence));

  const marginOfError = (100 - confidence) / 100 * 0.4;
  const lowerBound = Math.round(totalEstimatedYield * (1 - marginOfError) * 10) / 10;
  const upperBound = Math.round(totalEstimatedYield * (1 + marginOfError) * 10) / 10;

  const primaryFactors: string[] = [
    `${input.irrigationType} irrigation (${irrMult >= 1.1 ? '+Yield boost' : irrMult < 1.0 ? '-Water stress risk' : 'Standard flow'})`,
    `${input.soilType} soil structure with ${soilMult >= 1.0 ? 'optimal nutrient retention' : 'sandy/clay drain adjustment'}`,
    `${input.farmingMethod} farming standard (${methodMult < 1.0 ? 'premium organic value' : 'high-intensity input'})`,
    `${input.season} season climate compatibility for ${input.crop}`
  ];

  return {
    estimatedYieldQuintalsPerAcre: calculatedYieldPerAcre,
    totalEstimatedYieldQuintals: totalEstimatedYield,
    confidenceScorePercent: confidence,
    uncertaintyRangeQuintals: [lowerBound, upperBound],
    primaryFactors,
  };
}

export function calculateCultivationFinance(input: CultivationFinanceInput): CultivationFinanceOutput {
  const totalExpense =
    (input.seedCost || 0) +
    (input.fertilizerCost || 0) +
    (input.irrigationCost || 0) +
    (input.laborCost || 0) +
    (input.machineryCost || 0) +
    (input.transportCost || 0) +
    (input.otherCost || 0);

  const yieldQty = Math.max(0.1, input.expectedYieldQuintals || 1);
  const costPerQuintal = Math.round((totalExpense / yieldQty) * 100) / 100;
  const grossRevenue = Math.round((input.expectedYieldQuintals * input.expectedSellingPricePerQuintal) * 100) / 100;
  const netProfit = Math.round((grossRevenue - totalExpense) * 100) / 100;
  const profitMarginPercent = grossRevenue > 0 ? Math.round((netProfit / grossRevenue) * 1000) / 10 : 0;
  const breakEvenPricePerQuintal = costPerQuintal;
  const roiPercent = totalExpense > 0 ? Math.round((netProfit / totalExpense) * 1000) / 10 : 0;

  return {
    totalExpense,
    costPerQuintal,
    grossRevenue,
    netProfit,
    profitMarginPercent,
    breakEvenPricePerQuintal,
    roiPercent,
  };
}
