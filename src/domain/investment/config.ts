export const scoringWeights = {
  businessQuality: 20,
  growth: 18,
  financialHealth: 15,
  profitability: 17,
  valuation: 20,
  stabilityRisk: 10
} as const;

export const fitThresholds = {
  strong: 75,
  moderate: 60
} as const;

export const coverageThresholds = {
  insufficientDimension: 60,
  highConfidence: 85,
  mediumConfidence: 65
} as const;

export const valuationThresholds = {
  undervaluedBandPosition: 0.38,
  fairBandPosition: 0.72,
  nearTargetPremium: 0.05
} as const;

export const alertThresholds = {
  overallDelta: 8,
  stabilityDelta: 7,
  valuationDelta: 10,
  recentEventWindowDays: 45
} as const;

export const marketEnvironmentThresholds = {
  riskOnStudyShare: 0.35,
  riskOnAverageOverall: 72,
  riskOnAverageValuation: 60,
  defensiveWaitAvoidShare: 0.5,
  defensiveOvervaluedShare: 0.45,
  defensiveAverageValuation: 48,
  defensiveAverageStability: 52,
  limitedSnapshotUniverse: 6
} as const;

export const missingDataWeights = {
  growth: {
    fcfGrowth: 15
  },
  financialHealth: {
    liquidityCoverage: 20
  },
  profitability: {
    netMargin: 10
  }
} as const;
