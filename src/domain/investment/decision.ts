import { coverageThresholds, scoringWeights, valuationThresholds } from "./config";
import { deriveCurrentPosition, derivePriorReferenceSnapshot, deriveTargetZone } from "./adapters";
import {
  computeOverallScore,
  getCriticalDimensionMissing,
  scoreBusinessQuality,
  scoreFinancialHealth,
  scoreGrowth,
  scoreProfitability,
  scoreStabilityRisk,
  scoreValuation
} from "./scoring";
import { clamp, getConfidenceLevel, getFitLevel, round } from "./utils";
import type { Stock } from "../../types/investment";
import type {
  ConfidenceLevel,
  CurrentPositionSummary,
  DecisionAction,
  DimensionKey,
  ManualTargetZone,
  ScoreDimensionResult,
  StockAnalysisInput,
  StockAnalysisRecord,
  StyleFitSummary,
  ValuationStatus
} from "./types";

function getTargetZoneScore(currentPosition: CurrentPositionSummary) {
  switch (currentPosition.zone) {
    case "below_target":
      return 92;
    case "within_target":
      return 84;
    case "near_target":
      return 62;
    case "above_target":
      return 28;
    default:
      return 50;
  }
}

function getCompositeBandPosition(stock: Stock) {
  const bands = [
    stock.valuationMetrics.pe,
    stock.valuationMetrics.pb,
    stock.valuationMetrics.peg
  ];
  const positions = bands.map((band) =>
    clamp((band.current - band.low) / (band.high - band.low || 1), 0, 1)
  );

  return round(positions.reduce((sum, position) => sum + position, 0) / positions.length, 2);
}

export function deriveValuationStatus(
  valuationScore: number,
  bandPosition: number | null,
  currentPosition: CurrentPositionSummary
): ValuationStatus {
  if (bandPosition === null) return "insufficient_data";

  if (currentPosition.zone === "below_target" || currentPosition.zone === "within_target") {
    return "undervalued";
  }

  if (
    currentPosition.zone === "near_target" ||
    (valuationScore >= 58 && bandPosition <= valuationThresholds.fairBandPosition)
  ) {
    return "fair";
  }

  if (bandPosition <= valuationThresholds.undervaluedBandPosition && valuationScore >= 68) {
    return "undervalued";
  }

  return bandPosition > valuationThresholds.fairBandPosition || valuationScore < 45
    ? "overvalued"
    : "fair";
}

function summarizeStyleFit(score: number, reasons: string[]): StyleFitSummary {
  return {
    score: round(score, 1),
    level: getFitLevel(score),
    reasons
  };
}

function buildStyleFit(dimensions: Record<DimensionKey, ScoreDimensionResult>) {
  const businessQuality = dimensions.businessQuality.score;
  const financialHealth = dimensions.financialHealth.score;
  const profitability = dimensions.profitability.score;
  const valuation = dimensions.valuation.score;
  const stabilityRisk = dimensions.stabilityRisk.score;
  const growth = dimensions.growth.score;

  const buffettScore =
    0.35 * businessQuality +
    0.2 * financialHealth +
    0.2 * profitability +
    0.15 * stabilityRisk +
    0.1 * valuation;
  const lynchScore =
    0.3 * growth +
    0.25 * valuation +
    0.15 * businessQuality +
    0.15 * profitability +
    0.15 * stabilityRisk;

  return {
    buffett: summarizeStyleFit(buffettScore, [
      businessQuality >= 75 ? "商業品質高" : "商業品質仍需驗證",
      financialHealth >= 70 ? "財務結構穩健" : "財務安全邊際普通",
      valuation >= 60 ? "估值仍可接受" : "估值不便宜"
    ]),
    lynch: summarizeStyleFit(lynchScore, [
      growth >= 75 ? "多年成長動能明確" : "成長節奏偏穩或放緩",
      valuation >= 58 ? "估值仍有研究空間" : "估值對成長股不夠友善",
      stabilityRisk >= 60 ? "波動仍在可接受範圍" : "波動容忍度要保守"
    ])
  };
}

function deriveRiskFlags(stock: Stock, dimensions: Record<DimensionKey, ScoreDimensionResult>, valuationStatus: ValuationStatus) {
  const flags: string[] = [];

  if (stock.riskProfile.policy.level === "高") {
    flags.push("政策 / 地緣風險高");
  }

  if (stock.riskProfile.industryCycle.level === "高") {
    flags.push("產業循環波動高");
  }

  if (stock.riskProfile.customerConcentration.level === "高") {
    flags.push("客戶集中風險高");
  }

  if (dimensions.financialHealth.score < 50) {
    flags.push("財務安全邊際偏弱");
  }

  if (dimensions.stabilityRisk.score < 55) {
    flags.push("穩定度不足");
  }

  if (valuationStatus === "overvalued") {
    flags.push("估值高於合理帶");
  }

  return flags;
}

function isCriticalRisk(stock: Stock, dimensions: Record<DimensionKey, ScoreDimensionResult>) {
  const highRiskCount = [
    stock.riskProfile.policy,
    stock.riskProfile.industryCycle,
    stock.riskProfile.customerConcentration,
    stock.riskProfile.financial
  ].filter((risk) => risk.level === "高").length;

  return dimensions.financialHealth.score < 45 || dimensions.stabilityRisk.score < 40 || highRiskCount >= 2;
}

function deriveAction(
  overallScore: number,
  valuationStatus: ValuationStatus,
  dimensions: Record<DimensionKey, ScoreDimensionResult>,
  styleFit: ReturnType<typeof buildStyleFit>,
  confidenceLevel: ConfidenceLevel,
  stock: Stock
): DecisionAction {
  if (confidenceLevel === "low" || getCriticalDimensionMissing(dimensions)) {
    return "insufficient_data";
  }

  if (
    overallScore < 60 ||
    dimensions.financialHealth.score < 45 ||
    dimensions.stabilityRisk.score < 40 ||
    isCriticalRisk(stock, dimensions)
  ) {
    return "avoid_for_now";
  }

  if (
    overallScore >= 75 &&
    (valuationStatus === "undervalued" || valuationStatus === "fair") &&
    !isCriticalRisk(stock, dimensions) &&
    (styleFit.buffett.score >= 70 || styleFit.lynch.score >= 70)
  ) {
    return "study_now";
  }

  if (overallScore >= 70 && valuationStatus === "overvalued") {
    return "wait_for_better_price";
  }

  return "watch";
}

function buildReasons(
  dimensions: Record<DimensionKey, ScoreDimensionResult>,
  valuationStatus: ValuationStatus,
  action: DecisionAction
) {
  const reasons: string[] = [];

  if (dimensions.businessQuality.score >= 75) {
    reasons.push("商業品質與護城河分數高。");
  }

  if (dimensions.growth.score >= 70) {
    reasons.push("多年營收 / EPS 成長仍維持在高檔。");
  }

  if (dimensions.profitability.score >= 72) {
    reasons.push("ROE、ROIC 與利潤結構支撐長線品質。");
  }

  if (valuationStatus === "undervalued") {
    reasons.push("估值已進入可研究的區間。");
  }

  if (valuationStatus === "overvalued") {
    reasons.push("估值仍高於合理帶，風險報酬比不佳。");
  }

  if (dimensions.stabilityRisk.score < 55) {
    reasons.push("風險輪廓偏高，波動容忍度要保守。");
  }

  if (dimensions.financialHealth.score < 55) {
    reasons.push("財務安全邊際不夠強。");
  }

  if (!reasons.length) {
    reasons.push(action === "watch" ? "品質足以持續觀察，但理由還不足以升級為立即研究。" : "現有資料只能支持保守判斷。");
  }

  return reasons.slice(0, 4);
}

function buildSummary(companyName: string, action: DecisionAction, valuationStatus: ValuationStatus) {
  switch (action) {
    case "study_now":
      return `${companyName} 的品質與成長已達研究門檻，估值仍在可接受區間。`;
    case "wait_for_better_price":
      return `${companyName} 的基本面不差，但目前價格仍高於理想研究區。`;
    case "avoid_for_now":
      return `${companyName} 目前的分數與風險條件不支持新增研究或部位。`;
    case "insufficient_data":
      return `${companyName} 的關鍵資料覆蓋不足，暫時不給過強結論。`;
    default:
      return valuationStatus === "fair"
        ? `${companyName} 具備追蹤價值，但目前更像持續觀察名單。`
        : `${companyName} 先維持觀察，等更清楚的價格或風險報酬比。`;
  }
}

function buildWhyNow(action: DecisionAction, reasons: string[]) {
  if (action === "study_now") return reasons[0] ?? "品質與估值同時達到研究門檻。";
  if (action === "watch") return "理由足以持續追蹤，但還不到立即投入研究資源。";
  if (action === "wait_for_better_price") return "公司本身值得追蹤，但價格還沒提供足夠安全邊際。";
  if (action === "avoid_for_now") return "風險與分數組合不足以支持新增研究或部位。";
  return "關鍵資料尚未補齊。";
}

function buildWhyNotNow(action: DecisionAction, valuationStatus: ValuationStatus, dimensions: Record<DimensionKey, ScoreDimensionResult>) {
  if (action === "study_now") {
    return valuationStatus === "fair" ? "估值沒有明顯折價，研究後仍要保留價格紀律。" : "需持續盯住風險變數。";
  }

  if (action === "wait_for_better_price") {
    return "主要問題是估值，不是公司品質。";
  }

  if (action === "avoid_for_now") {
    return dimensions.financialHealth.score < 45
      ? "財務安全邊際不足。"
      : "風險輪廓偏高。";
  }

  if (action === "watch") {
    return valuationStatus === "overvalued"
      ? "估值還不夠友善。"
      : "綜合分數尚未高到立即升級研究。";
  }

  return "資料不足。";
}

function deriveTopDrivers(dimensions: Record<DimensionKey, ScoreDimensionResult>) {
  const dimensionList = Object.values(dimensions);
  const ranked = [...dimensionList].sort((left, right) => right.score - left.score);

  return {
    topPositiveDrivers: ranked.slice(0, 3).map((dimension) => `${dimension.label} ${dimension.score.toFixed(1)}`),
    topNegativeDrivers: [...ranked]
      .reverse()
      .slice(0, 3)
      .map((dimension) => `${dimension.label} ${dimension.score.toFixed(1)}`)
  };
}

export function analyzeStock(input: StockAnalysisInput): StockAnalysisRecord {
  const targetZone = deriveTargetZone(input.stock, input.watchlistItem);
  const currentPosition = deriveCurrentPosition(input.stock, targetZone);
  const targetZoneScore = getTargetZoneScore(currentPosition);

  const dimensions = {
    businessQuality: scoreBusinessQuality(input.stock),
    growth: scoreGrowth(input.stock),
    financialHealth: scoreFinancialHealth(input.stock),
    profitability: scoreProfitability(input.stock),
    valuation: scoreValuation(input.stock, targetZoneScore),
    stabilityRisk: scoreStabilityRisk(input.stock)
  };
  const { overallScore, weightedCoverage } = computeOverallScore(dimensions);
  const valuationBandPosition = getCompositeBandPosition(input.stock);
  const valuationStatus = deriveValuationStatus(dimensions.valuation.score, valuationBandPosition, currentPosition);
  const styleFit = buildStyleFit(dimensions);
  const missingDataFlags = [
    ...new Set(Object.values(dimensions).flatMap((dimension) => dimension.missingFlags))
  ];
  const confidenceLevel = getConfidenceLevel(
    weightedCoverage,
    getCriticalDimensionMissing(dimensions) || missingDataFlags.some((flag) => flag === "liquidity_coverage")
  );
  const action = deriveAction(overallScore, valuationStatus, dimensions, styleFit, confidenceLevel, input.stock);
  const reasons = buildReasons(dimensions, valuationStatus, action);
  const riskFlags = deriveRiskFlags(input.stock, dimensions, valuationStatus);
  const { topPositiveDrivers, topNegativeDrivers } = deriveTopDrivers(dimensions);
  const priorReference = derivePriorReferenceSnapshot(input.stock, valuationStatus);

  return {
    stock: input.stock,
    watchlistItem: input.watchlistItem,
    workspaceWatchlist: input.workspaceWatchlist,
    reminders: input.reminders,
    dimensions,
    dimensionList: Object.values(dimensions),
    overallScore,
    weightedCoverage,
    valuationScore: dimensions.valuation.score,
    valuationBandPosition,
    styleFit,
    decision: {
      overallScore,
      valuationStatus,
      buffettFit: styleFit.buffett.score,
      lynchFit: styleFit.lynch.score,
      action,
      summary: buildSummary(input.stock.companyName, action, valuationStatus),
      reasons,
      riskFlags,
      targetZone,
      currentPosition,
      confidenceLevel,
      topPositiveDrivers,
      topNegativeDrivers,
      missingDataFlags,
      whyNow: buildWhyNow(action, reasons),
      whyNotNow: buildWhyNotNow(action, valuationStatus, dimensions)
    },
    alerts: [],
    alertHistory: [],
    legacyFallback: priorReference
  };
}

export function getDimensionWeightLabel(key: DimensionKey) {
  return `${scoringWeights[key]}%`;
}
