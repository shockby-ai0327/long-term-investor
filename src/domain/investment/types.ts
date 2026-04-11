import type {
  EventReminder,
  ReminderAction,
  Stock,
  WatchlistItem,
  WorkspaceReminder,
  WorkspaceWatchlistItem
} from "../../types/investment";

export type DimensionKey =
  | "businessQuality"
  | "growth"
  | "financialHealth"
  | "profitability"
  | "valuation"
  | "stabilityRisk";

export type DecisionAction =
  | "study_now"
  | "watch"
  | "wait_for_better_price"
  | "avoid_for_now"
  | "insufficient_data";

export type ValuationStatus = "undervalued" | "fair" | "overvalued" | "insufficient_data";
export type ConfidenceLevel = "high" | "medium" | "low";
export type FitLevel = "strong_fit" | "moderate_fit" | "weak_fit";
export type MarketEnvironmentState = "risk_on" | "neutral" | "defensive" | "insufficient_data";
export type AlertRuleType =
  | "target_zone"
  | "valuation_status_change"
  | "overall_score_change"
  | "stability_deterioration"
  | "data_update_reprice"
  | "style_fit";
export type AlertSeverity = "positive" | "neutral" | "negative";
export type AlertState = "active" | "monitoring";
export type DisplayTone = "positive" | "neutral" | "negative" | "info";

export interface ManualTargetZone {
  source: "watchlist_target" | "valuation_band";
  metric: "price" | "pe";
  label: string;
  currency?: string;
  low?: number;
  high?: number;
}

export interface CurrentPositionSummary {
  metric: "price" | "pe";
  label: string;
  valueLabel: string;
  zone: "below_target" | "within_target" | "near_target" | "above_target" | "insufficient_data";
}

export interface ScoreContribution {
  label: string;
  score: number;
  weight: number;
  detail: string;
  missing?: boolean;
  missingFlag?: string;
}

export interface ScoreDimensionResult {
  key: DimensionKey;
  label: string;
  score: number;
  coverage: number;
  insufficientData: boolean;
  contributions: ScoreContribution[];
  summary: string;
  reasons: string[];
  missingFlags: string[];
}

export interface StyleFitSummary {
  score: number;
  level: FitLevel;
  reasons: string[];
}

export interface StockDecisionSummary {
  overallScore: number;
  valuationStatus: ValuationStatus;
  buffettFit: number;
  lynchFit: number;
  action: DecisionAction;
  summary: string;
  reasons: string[];
  riskFlags: string[];
  targetZone: ManualTargetZone;
  currentPosition: CurrentPositionSummary;
  confidenceLevel: ConfidenceLevel;
  topPositiveDrivers: string[];
  topNegativeDrivers: string[];
  missingDataFlags: string[];
  whyNow: string;
  whyNotNow: string;
}

export interface InvestmentAlert {
  id: string;
  stockId: string;
  ticker: string;
  rule: AlertRuleType;
  state: AlertState;
  severity: AlertSeverity;
  title: string;
  summary: string;
  reason: string;
  triggeredAt: string;
  actionLabel: string;
  actionTo: string;
}

export interface StockAnalysisRecord {
  stock: Stock;
  watchlistItem?: WatchlistItem;
  workspaceWatchlist?: WorkspaceWatchlistItem;
  reminders: WorkspaceReminder[];
  dimensions: Record<DimensionKey, ScoreDimensionResult>;
  dimensionList: ScoreDimensionResult[];
  overallScore: number;
  weightedCoverage: number;
  valuationScore: number;
  valuationBandPosition: number | null;
  styleFit: {
    buffett: StyleFitSummary;
    lynch: StyleFitSummary;
  };
  decision: StockDecisionSummary;
  alerts: InvestmentAlert[];
  alertHistory: InvestmentAlert[];
  legacyFallback: {
    overallScore: number;
    qualityScore: number;
    growthScore: number;
    valuationScore: number;
    riskScore: number;
  };
}

export interface MarketOverviewHeuristics {
  averageOverallScore: number;
  averageValuationScore: number;
  averageBusinessQuality: number;
  averageGrowthScore: number;
  averageStabilityScore: number;
  actionDistribution: Record<DecisionAction, number>;
  valuationDistribution: Record<ValuationStatus, number>;
  activeAlertCount: number;
  riskFlagDensity: number;
  universeSize: number;
}

export interface MarketOverviewState {
  state: MarketEnvironmentState;
  confidenceLevel: ConfidenceLevel;
  limitedSnapshot: boolean;
  summary: string;
  posture: string;
  buffettView: string;
  lynchView: string;
  recommendations: string[];
  heuristics: MarketOverviewHeuristics;
  topIdeas: Array<{
    ticker: string;
    companyName: string;
    action: DecisionAction;
    summary: string;
    score: number;
  }>;
}

export interface InvestmentWorkbench {
  analyses: StockAnalysisRecord[];
  analysesByTicker: Record<string, StockAnalysisRecord>;
  trackedAnalyses: StockAnalysisRecord[];
  alerts: InvestmentAlert[];
  alertHistory: InvestmentAlert[];
  marketOverview: MarketOverviewState;
}

export interface InvestmentWorkbenchInput {
  stocks: Stock[];
  reminders: WorkspaceReminder[];
  watchlist: WorkspaceWatchlistItem[];
}

export interface ActionDisplay {
  label: string;
  tone: DisplayTone;
  description: string;
}

export interface ValuationDisplay {
  label: string;
  tone: DisplayTone;
  description: string;
}

export interface ConfidenceDisplay {
  label: string;
  tone: DisplayTone;
}

export interface FitDisplay {
  label: string;
  tone: DisplayTone;
}

export interface MarketEnvironmentDisplay {
  label: string;
  tone: DisplayTone;
}

export interface AlertRuleDefinition {
  type: AlertRuleType;
  title: string;
  defaultAction: ReminderAction["label"];
}

export interface StockAnalysisInput {
  stock: Stock;
  watchlistItem?: WatchlistItem;
  workspaceWatchlist?: WorkspaceWatchlistItem;
  reminders: WorkspaceReminder[];
}

export interface ParsedTargetRange {
  low: number;
  high: number;
  currency: string;
}

export interface PriorReferenceSnapshot {
  overallScore: number;
  qualityScore: number;
  growthScore: number;
  valuationScore: number;
  riskScore: number;
}

export type EventReminderRecord = EventReminder;
