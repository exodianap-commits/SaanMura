import type { ContributorTier } from '@saanmura/shared-types';

export interface PriceDeltaResult {
  difference: number;
  percentageChange: number;
  direction: 'increase' | 'decrease' | 'unchanged';
  formattedDifference: string;
  formattedPercentage: string;
}

/**
 * Calculates the difference and percentage change between an observed price and previous verified price.
 * Example: Previous: ₱85.00, New: ₱79.00 -> difference: -₱6.00, percentage: -7.06%
 */
export function calculatePriceDelta(
  newPrice: number,
  previousPrice?: number | null
): PriceDeltaResult {
  if (previousPrice == null || previousPrice <= 0) {
    return {
      difference: 0,
      percentageChange: 0,
      direction: 'unchanged',
      formattedDifference: '₱0.00',
      formattedPercentage: '0.00%',
    };
  }

  const diff = Number((newPrice - previousPrice).toFixed(2));
  const percent = Number(((diff / previousPrice) * 100).toFixed(2));

  let direction: 'increase' | 'decrease' | 'unchanged' = 'unchanged';
  if (diff > 0) direction = 'increase';
  else if (diff < 0) direction = 'decrease';

  const sign = diff > 0 ? '+' : diff < 0 ? '-' : '';
  const absDiff = Math.abs(diff).toFixed(2);
  const absPercent = Math.abs(percent).toFixed(2);

  return {
    difference: diff,
    percentageChange: percent,
    direction,
    formattedDifference: `${sign}₱${absDiff}`,
    formattedPercentage: `${sign}${absPercent}%`,
  };
}

export interface SrpEvaluationResult {
  status: 'below_srp' | 'at_srp' | 'above_srp' | 'no_srp';
  difference: number;
  percentageDiff: number;
  badgeLabel: string;
  badgeColor: 'emerald' | 'amber' | 'crimson' | 'slate';
}

/**
 * Compares an observed or verified price against the official DTI Suggested Retail Price (SRP).
 */
export function evaluateSrpStatus(
  price: number,
  srpPrice?: number | null
): SrpEvaluationResult {
  if (srpPrice == null || srpPrice <= 0) {
    return {
      status: 'no_srp',
      difference: 0,
      percentageDiff: 0,
      badgeLabel: 'NO OFFICIAL SRP',
      badgeColor: 'slate',
    };
  }

  const diff = Number((price - srpPrice).toFixed(2));
  const percent = Number(((diff / srpPrice) * 100).toFixed(2));

  if (diff < -0.05) {
    return {
      status: 'below_srp',
      difference: diff,
      percentageDiff: percent,
      badgeLabel: `▼ ₱${Math.abs(diff).toFixed(2)} BELOW SRP`,
      badgeColor: 'emerald',
    };
  } else if (diff > 0.05) {
    return {
      status: 'above_srp',
      difference: diff,
      percentageDiff: percent,
      badgeLabel: `▲ +₱${Math.abs(diff).toFixed(2)} (+${Math.abs(percent)}%) ABOVE SRP`,
      badgeColor: 'crimson',
    };
  } else {
    return {
      status: 'at_srp',
      difference: 0,
      percentageDiff: 0,
      badgeLabel: 'EXACT DTI SRP',
      badgeColor: 'emerald',
    };
  }
}

/**
 * Standard Philippine Peso currency formatter
 */
export function formatPeso(amount: number | null | undefined): string {
  if (amount == null || isNaN(amount)) return '₱0.00';
  return `₱${amount.toLocaleString('en-PH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

/**
 * Checks if a price observation is older than a threshold (default 14 days), signaling a stale price.
 */
export function isObservationStale(
  observationDate: string | Date,
  thresholdDays: number = 14
): boolean {
  const date = typeof observationDate === 'string' ? new Date(observationDate) : observationDate;
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays > thresholdDays;
}

/**
 * Contributor XP and Tier Progression Calculator
 */
export function getTierInfo(xpPoints: number): {
  tier: ContributorTier;
  label: string;
  currentXp: number;
  nextTierXp: number;
  progressPercentage: number;
  badgeTitle: string;
} {
  if (xpPoints < 500) {
    return {
      tier: 'tier_1_scout',
      label: 'Citizen Scout',
      currentXp: xpPoints,
      nextTierXp: 500,
      progressPercentage: Math.min(100, Math.round((xpPoints / 500) * 100)),
      badgeTitle: 'Tier-1 Scout',
    };
  } else if (xpPoints < 1500) {
    return {
      tier: 'tier_2_palengke_verifier',
      label: 'Palengke Verifier',
      currentXp: xpPoints,
      nextTierXp: 1500,
      progressPercentage: Math.min(100, Math.round(((xpPoints - 500) / 1000) * 100)),
      badgeTitle: 'Tier-2 Civic Scout',
    };
  } else {
    return {
      tier: 'tier_3_inspector',
      label: 'DTI Inspector Delegate',
      currentXp: xpPoints,
      nextTierXp: 3000,
      progressPercentage: Math.min(100, Math.round(((xpPoints - 1500) / 1500) * 100)),
      badgeTitle: 'Tier-3 Inspector Delegate',
    };
  }
}
