import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateYieldPrediction, calculateCultivationFinance } from './agronomics.ts';
import { isValidOrderTransition } from './orderLifecycle.ts';

test('yield prediction applies soil, irrigation, and season bonuses accurately', () => {
  const result = calculateYieldPrediction({
    crop: 'Wheat',
    cultivatedAreaAcres: 5,
    season: 'Rabi',
    soilType: 'Alluvial',
    irrigationType: 'Drip',
    farmingMethod: 'Conventional',
  });

  // Base 18.5 * Alluvial(1.15) * Drip(1.25) * Rabi(1.1) = ~29.25 q/acre
  assert.ok(result.estimatedYieldQuintalsPerAcre > 25, 'Expected yield per acre should be elevated with drip and alluvial soil in Rabi');
  assert.equal(result.totalEstimatedYieldQuintals, Math.round(result.estimatedYieldQuintalsPerAcre * 5 * 10) / 10);
  assert.ok(result.confidenceScorePercent >= 80, 'Confidence score should be high with optimal irrigation');
  assert.ok(result.uncertaintyRangeQuintals[0] < result.totalEstimatedYieldQuintals);
  assert.ok(result.uncertaintyRangeQuintals[1] > result.totalEstimatedYieldQuintals);
});

test('cultivation finance calculates expenses, margins and break-even price correctly', () => {
  const result = calculateCultivationFinance({
    seedCost: 5000,
    fertilizerCost: 8000,
    irrigationCost: 3000,
    laborCost: 10000,
    machineryCost: 6000,
    transportCost: 2000,
    otherCost: 1000,
    expectedYieldQuintals: 100,
    expectedSellingPricePerQuintal: 2500,
  });

  assert.equal(result.totalExpense, 35000);
  assert.equal(result.costPerQuintal, 350);
  assert.equal(result.grossRevenue, 250000);
  assert.equal(result.netProfit, 215000);
  assert.equal(result.breakEvenPricePerQuintal, 350);
  assert.ok(result.profitMarginPercent > 80);
});

test('order state machine strictly enforces role authorizations and sequence', () => {
  // Farmer accepts requested order -> Valid
  const farmerAccept = isValidOrderTransition({
    currentStatus: 'requested',
    targetStatus: 'accepted',
    userRole: 'farmer',
    isBuyerOwner: false,
    isFarmerOwner: true,
  });
  assert.equal(farmerAccept.allowed, true);

  // Buyer tries to accept requested order -> Invalid
  const buyerCannotAccept = isValidOrderTransition({
    currentStatus: 'requested',
    targetStatus: 'accepted',
    userRole: 'buyer',
    isBuyerOwner: true,
    isFarmerOwner: false,
  });
  assert.equal(buyerCannotAccept.allowed, false);

  // Completed order cannot be transitioned backward by buyer or farmer
  const terminalCheck = isValidOrderTransition({
    currentStatus: 'completed',
    targetStatus: 'requested',
    userRole: 'farmer',
    isBuyerOwner: false,
    isFarmerOwner: true,
  });
  assert.equal(terminalCheck.allowed, false);
});
