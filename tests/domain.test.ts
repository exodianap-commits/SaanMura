import { calculatePriceDelta, evaluateSrpStatus, formatPeso, isObservationStale, getTierInfo } from '../packages/domain/src/index';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
}

console.log('--- Running SaanMura Domain Logic Unit Tests ---');

// Test 1: Price Delta Calculation (Requirement 8 example: ₱85.00 -> ₱79.00 = -₱6.00 / -7.06%)
const delta1 = calculatePriceDelta(79.00, 85.00);
console.log('Test 1 (Price Decrease):', delta1);
assert(delta1.difference === -6.00, 'Difference should be -6.00');
assert(delta1.percentageChange === -7.06, 'Percentage change should be -7.06%');
assert(delta1.direction === 'decrease', 'Direction should be decrease');
assert(delta1.formattedDifference === '-₱6.00', 'Formatted diff should be -₱6.00');
assert(delta1.formattedPercentage === '-7.06%', 'Formatted percent should be -7.06%');

// Test 2: Price Increase
const delta2 = calculatePriceDelta(42.00, 41.50);
console.log('Test 2 (Price Increase):', delta2);
assert(delta2.difference === 0.50, 'Difference should be +0.50');
assert(delta2.direction === 'increase', 'Direction should be increase');
assert(delta2.formattedDifference === '+₱0.50', 'Formatted diff should be +₱0.50');

// Test 3: SRP Evaluation
const srpBelow = evaluateSrpStatus(39.50, 41.50);
console.log('Test 3 (Below SRP):', srpBelow);
assert(srpBelow.status === 'below_srp', 'Status should be below_srp');
assert(srpBelow.badgeColor === 'emerald', 'Badge color should be emerald');

const srpAbove = evaluateSrpStatus(42.80, 41.50);
console.log('Test 4 (Above SRP Spike):', srpAbove);
assert(srpAbove.status === 'above_srp', 'Status should be above_srp');
assert(srpAbove.badgeColor === 'crimson', 'Badge color should be crimson');

// Test 5: Currency Formatter
assert(formatPeso(142.5) === '₱142.50', 'Format 142.5 to ₱142.50');
assert(formatPeso(0) === '₱0.00', 'Format 0 to ₱0.00');

// Test 6: Tier and XP progression
const tierScout = getTierInfo(450);
assert(tierScout.tier === 'tier_1_scout', 'Tier should be scout');

const tierPalengke = getTierInfo(850);
assert(tierPalengke.tier === 'tier_2_palengke_verifier', 'Tier should be palengke verifier');

console.log('✅ All Domain Unit Tests Passed Successfully!\n');
