export type RiskLevel = "低" | "中" | "高";
export type ReminderType = "財報" | "營收" | "新聞" | "估值" | "Thesis";
export type ReminderStatus = "即將到來" | "需處理" | "已完成";
export type ReminderActionEmphasis = "primary" | "secondary" | "ghost";
export type ReminderProgress = "未開始" | "處理中" | "已完成";
export type WatchlistFocusState = "本輪研究" | "等待事件" | "等待估值" | "維持追蹤";

export interface ReminderAction {
  label: string;
  to: string;
  emphasis?: ReminderActionEmphasis;
}

export interface FinancialMetrics {
  revenueCagr3Y: number;
  revenueCagr5Y: number;
  revenueCagr10Y: number;
  epsCagr3Y: number;
  epsCagr5Y: number;
  epsCagr10Y: number;
  grossMargin: number;
  operatingMargin: number;
  roe: number;
  roic: number;
  freeCashFlowBillion: number;
  debtToEquity: number;
}

export interface ValuationBand {
  low: number;
  median: number;
  high: number;
  current: number;
  historical: number[];
}

export interface ValuationMetrics {
  pe: ValuationBand;
  pb: ValuationBand;
  peg: ValuationBand;
  summary: string;
}

export interface RiskItem {
  level: RiskLevel;
  summary: string;
  watchpoint: string;
}

export interface RiskProfile {
  industryCycle: RiskItem;
  policy: RiskItem;
  customerConcentration: RiskItem;
  financial: RiskItem;
}

export interface RevenueSegment {
  name: string;
  share: number;
  detail: string;
}

export interface MoatFactor {
  label: string;
  score: number;
  summary: string;
}

export interface EventItem {
  id: string;
  date: string;
  title: string;
  summary: string;
  category: "財報" | "產品" | "資本配置" | "法規" | "需求";
  impact: "正向" | "中性" | "需留意";
}

export interface DecisionScore {
  label: string;
  score: number;
  summary: string;
}

export interface Stock {
  id: string;
  ticker: string;
  companyName: string;
  market: string;
  sector: string;
  industry: string;
  region: string;
  headquarters: string;
  foundedYear: number;
  website: string;
  currency: string;
  currentPrice: number;
  marketCapBillion: number;
  summary: string;
  businessModel: string;
  revenueSegments: RevenueSegment[];
  positioning: string[];
  moat: MoatFactor[];
  financialMetrics: FinancialMetrics;
  valuationMetrics: ValuationMetrics;
  riskProfile: RiskProfile;
  recentEvents: EventItem[];
  scores: {
    quality: DecisionScore;
    growth: DecisionScore;
    valuation: DecisionScore;
    risk: DecisionScore;
    overall: DecisionScore;
  };
  conclusion: string;
  lastReviewed: string;
}

export interface InvestmentThesis {
  id: string;
  stockId: string;
  ticker: string;
  companyName: string;
  whyOwn: string;
  growthDrivers: string[];
  keyRisks: string[];
  expectedHoldingPeriod: string;
  invalidationConditions: string[];
  addConditions: string[];
  trimConditions: string[];
  sellConditions: string[];
  reviewCadence: string;
  createdAt: string;
  updatedAt: string;
  lastReviewed: string;
}

export interface PortfolioHolding {
  id: string;
  stockId: string;
  ticker: string;
  companyName: string;
  shares: number;
  avgCost: number;
  currentPrice: number;
  marketValue: number;
  costBasis: number;
  weight: number;
  sector: string;
  region: string;
  thesisStatus: "符合預期" | "需追蹤" | "估值偏高";
  note: string;
}

export interface WatchlistItem {
  id: string;
  stockId: string;
  ticker: string;
  companyName: string;
  currentPrice: number;
  targetRange: string;
  valuationSignal: "低估待研究" | "合理區間" | "偏高觀察";
  tags: string[];
  qualityScore: number;
  nextCatalyst: string;
  lastReviewed: string;
}

export interface EventReminder {
  id: string;
  stockId: string;
  ticker: string;
  title: string;
  type: ReminderType;
  date: string;
  status: ReminderStatus;
  note: string;
  reason: string;
  verificationFocus: string[];
  affectsDecision: string;
  nextStep: string;
  actions: ReminderAction[];
}

export interface ReminderWorkspaceState {
  progress: ReminderProgress;
  updatedAt: string;
}

export interface WorkspaceReminder extends EventReminder {
  progress: ReminderProgress;
  progressUpdatedAt?: string;
}

export interface WatchlistWorkspaceState {
  focusState: WatchlistFocusState;
  updatedAt: string;
}

export interface WorkspaceWatchlistItem extends WatchlistItem {
  focusState: WatchlistFocusState;
  focusUpdatedAt?: string;
}

export interface MarketSummaryItem {
  id: string;
  title: string;
  takeaway: string;
  implication: string;
}

export interface MockSnapshotInfo {
  asOfDate: string;
  label: string;
  marketDataNote: string;
  thesisStorageNote: string;
  freshnessNote: string;
}
