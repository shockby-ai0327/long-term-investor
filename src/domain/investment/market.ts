import { coverageThresholds, marketEnvironmentThresholds } from "./config";
import { getConfidenceLevel, round } from "./utils";
import type { DecisionAction, MarketOverviewHeuristics, MarketOverviewState, StockAnalysisRecord, ValuationStatus } from "./types";

function emptyDistribution<T extends string>(keys: readonly T[]) {
  return Object.fromEntries(keys.map((key) => [key, 0])) as Record<T, number>;
}

function buildHeuristics(analyses: StockAnalysisRecord[]): MarketOverviewHeuristics {
  const actionDistribution = emptyDistribution<DecisionAction>([
    "study_now",
    "watch",
    "wait_for_better_price",
    "avoid_for_now",
    "insufficient_data"
  ]);
  const valuationDistribution = emptyDistribution<ValuationStatus>([
    "undervalued",
    "fair",
    "overvalued",
    "insufficient_data"
  ]);

  analyses.forEach((analysis) => {
    actionDistribution[analysis.decision.action] += 1;
    valuationDistribution[analysis.decision.valuationStatus] += 1;
  });

  const totalRiskFlags = analyses.reduce((sum, analysis) => sum + analysis.decision.riskFlags.length, 0);

  return {
    averageOverallScore: round(
      analyses.reduce((sum, analysis) => sum + analysis.overallScore, 0) / Math.max(analyses.length, 1),
      1
    ),
    averageValuationScore: round(
      analyses.reduce((sum, analysis) => sum + analysis.valuationScore, 0) / Math.max(analyses.length, 1),
      1
    ),
    averageBusinessQuality: round(
      analyses.reduce((sum, analysis) => sum + analysis.dimensions.businessQuality.score, 0) / Math.max(analyses.length, 1),
      1
    ),
    averageGrowthScore: round(
      analyses.reduce((sum, analysis) => sum + analysis.dimensions.growth.score, 0) / Math.max(analyses.length, 1),
      1
    ),
    averageStabilityScore: round(
      analyses.reduce((sum, analysis) => sum + analysis.dimensions.stabilityRisk.score, 0) / Math.max(analyses.length, 1),
      1
    ),
    actionDistribution,
    valuationDistribution,
    activeAlertCount: analyses.reduce((sum, analysis) => sum + analysis.alerts.length, 0),
    riskFlagDensity: round(totalRiskFlags / Math.max(analyses.length, 1), 1),
    universeSize: analyses.length
  };
}

export function evaluateMarketEnvironment(analyses: StockAnalysisRecord[]): MarketOverviewState {
  const heuristics = buildHeuristics(analyses);
  const universeSize = Math.max(analyses.length, 1);
  const studyShare = heuristics.actionDistribution.study_now / universeSize;
  const waitAvoidShare =
    (heuristics.actionDistribution.wait_for_better_price + heuristics.actionDistribution.avoid_for_now) /
    universeSize;
  const overvaluedShare = heuristics.valuationDistribution.overvalued / universeSize;
  const limitedSnapshot = heuristics.universeSize < marketEnvironmentThresholds.limitedSnapshotUniverse;
  const weightedCoverage = round(
    analyses.reduce((sum, analysis) => sum + analysis.weightedCoverage, 0) / Math.max(analyses.length, 1),
    1
  );
  const confidenceLevel = getConfidenceLevel(
    weightedCoverage,
    analyses.some((analysis) => analysis.decision.confidenceLevel === "low")
  );

  if (confidenceLevel === "low") {
    return {
      state: "insufficient_data",
      confidenceLevel,
      limitedSnapshot,
      summary: "可用樣本與資料覆蓋不足，先把判斷維持在有限快照層級。",
      posture: "有限快照 / 資料不足",
      buffettView: "資料不足，暫不對 Buffett 風格做過強解讀。",
      lynchView: "資料不足，暫不對 Lynch 風格做過強解讀。",
      recommendations: ["先補足個股資料與研究區間，再提高自動結論權重。"],
      heuristics,
      topIdeas: []
    };
  }

  const state =
    studyShare >= marketEnvironmentThresholds.riskOnStudyShare &&
    heuristics.averageOverallScore >= marketEnvironmentThresholds.riskOnAverageOverall &&
    heuristics.averageValuationScore >= marketEnvironmentThresholds.riskOnAverageValuation &&
    overvaluedShare < 0.35
      ? "risk_on"
      : waitAvoidShare >= marketEnvironmentThresholds.defensiveWaitAvoidShare ||
          overvaluedShare >= marketEnvironmentThresholds.defensiveOvervaluedShare ||
          heuristics.averageValuationScore <= marketEnvironmentThresholds.defensiveAverageValuation ||
          heuristics.averageStabilityScore <= marketEnvironmentThresholds.defensiveAverageStability
        ? "defensive"
        : "neutral";

  const posture =
    state === "risk_on"
      ? "可逐步布局"
      : state === "defensive"
        ? "等待更好風險報酬比"
        : "偏觀察";
  const summary =
    state === "risk_on"
      ? "目前高品質名單中，可研究標的比例提升，估值壓力尚未全面失控。"
      : state === "defensive"
        ? "品質仍在，但估值與風險折價不夠友善，先保留耐心。"
        : "環境沒有壞到全面回避，但也不足以全面進攻，重點是挑標的。";
  const buffettView =
    heuristics.averageBusinessQuality >= 75 && heuristics.averageValuationScore >= 55
      ? "Buffett 風格仍可用，但更適合挑品質高且估值沒有失控的公司。"
      : "Buffett 風格目前的難點在估值，不在品質。";
  const lynchView =
    heuristics.averageGrowthScore >= 70 && heuristics.averageValuationScore >= 55
      ? "Lynch 風格仍有可研究標的，但要接受成長股估值分化。"
      : "Lynch 風格目前更需要價格紀律，不能只看成長敘事。";

  const topIdeas = [...analyses]
    .sort((left, right) => right.overallScore - left.overallScore)
    .slice(0, 3)
    .map((analysis) => ({
      ticker: analysis.stock.ticker,
      companyName: analysis.stock.companyName,
      action: analysis.decision.action,
      summary: analysis.decision.summary,
      score: analysis.overallScore
    }));

  return {
    state,
    confidenceLevel,
    limitedSnapshot,
    summary,
    posture,
    buffettView,
    lynchView,
    recommendations:
      state === "risk_on"
        ? ["優先研究值得研究名單。", "估值合理帶內可分批研究，不追逐最強敘事。"]
        : state === "defensive"
          ? ["先保留現金與等待名單。", "品質高但估值過熱的標的不升級研究。"]
          : ["先把持續觀察名單排序。", "用提醒與研究區間管節奏，而不是擴張持股數。"],
    heuristics,
    topIdeas
  };
}
