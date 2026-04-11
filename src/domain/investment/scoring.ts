import { coverageThresholds, missingDataWeights, scoringWeights } from "./config";
import { clamp, coverageFromContributions, listMissingFlags, normalizeScore, round, scoreFromContributions } from "./utils";
import type { Stock } from "../../types/investment";
import type { DimensionKey, ScoreContribution, ScoreDimensionResult } from "./types";

function inverseRiskScore(level: "低" | "中" | "高") {
  if (level === "低") return 85;
  if (level === "中") return 60;
  return 35;
}

function consistencyScore(values: number[]) {
  const validValues = values.filter((value) => Number.isFinite(value));

  if (validValues.length < 2) return 50;

  const max = Math.max(...validValues);
  const min = Math.min(...validValues);
  const average = validValues.reduce((sum, value) => sum + value, 0) / validValues.length;
  const dispersion = (max - min) / Math.max(Math.abs(average), 1);

  return round(clamp(100 - dispersion * 90, 20, 100), 1);
}

function summarizeDimension(
  key: DimensionKey,
  label: string,
  contributions: ScoreContribution[]
): ScoreDimensionResult {
  const score = scoreFromContributions(contributions);
  const coverage = coverageFromContributions(contributions);
  const missingFlags = listMissingFlags(contributions);
  const ranked = [...contributions].filter((item) => !item.missing).sort((left, right) => right.score - left.score);
  const strongest = ranked[0];
  const weakest = [...ranked].reverse()[0];

  const summaryParts = [
    strongest ? `${strongest.label}較強` : null,
    weakest && weakest !== strongest ? `${weakest.label}較弱` : null
  ].filter(Boolean);

  return {
    key,
    label,
    score,
    coverage,
    insufficientData: coverage < coverageThresholds.insufficientDimension,
    contributions,
    summary: summaryParts.join("，") || `${label}缺少可用資料。`,
    reasons: ranked.slice(0, 2).map((item) => `${item.label} ${round(item.score, 0)} 分`),
    missingFlags
  };
}

export function scoreBusinessQuality(stock: Stock) {
  const moatAverage =
    stock.moat.reduce((sum: number, moat: Stock["moat"][number]) => sum + moat.score, 0) /
    Math.max(stock.moat.length, 1);
  const grossOperatingBlend =
    normalizeScore(stock.financialMetrics.grossMargin, 20, 70) * 0.55 +
    normalizeScore(stock.financialMetrics.operatingMargin, 8, 45) * 0.45;
  const contributions: ScoreContribution[] = [
    {
      label: "護城河",
      score: round(moatAverage * 10, 1),
      weight: 40,
      detail: "以 moat 因子平均值作為商業優勢主體。"
    },
    {
      label: "客戶韌性",
      score: inverseRiskScore(stock.riskProfile.customerConcentration.level),
      weight: 15,
      detail: "以客戶集中風險反推需求韌性。"
    },
    {
      label: "利潤結構",
      score: round(grossOperatingBlend, 1),
      weight: 20,
      detail: "以毛利率與營業利益率近似盈利穩定性。"
    },
    {
      label: "資本效率",
      score: normalizeScore(stock.financialMetrics.roic, 5, 28),
      weight: 25,
      detail: "以 ROIC 近似長期資本回收能力。"
    }
  ];

  return summarizeDimension("businessQuality", "商業品質", contributions);
}

export function scoreGrowth(stock: Stock) {
  const revenueBlend =
    stock.financialMetrics.revenueCagr3Y * 0.45 +
    stock.financialMetrics.revenueCagr5Y * 0.35 +
    stock.financialMetrics.revenueCagr10Y * 0.2;
  const epsBlend =
    stock.financialMetrics.epsCagr3Y * 0.45 +
    stock.financialMetrics.epsCagr5Y * 0.35 +
    stock.financialMetrics.epsCagr10Y * 0.2;
  const consistency = averageGrowthConsistency(stock);

  const contributions: ScoreContribution[] = [
    {
      label: "營收成長",
      score: normalizeScore(revenueBlend, 3, 28),
      weight: 35,
      detail: "3Y / 5Y / 10Y 營收 CAGR 加權。"
    },
    {
      label: "EPS 成長",
      score: normalizeScore(epsBlend, 3, 30),
      weight: 35,
      detail: "3Y / 5Y / 10Y EPS CAGR 加權。"
    },
    {
      label: "成長一致性",
      score: consistency,
      weight: 15,
      detail: "成長分散度越低，分數越高。"
    },
    {
      label: "FCF 成長",
      score: 0,
      weight: missingDataWeights.growth.fcfGrowth,
      detail: "缺少多年 FCF 成長資料。",
      missing: true,
      missingFlag: "fcf_growth"
    }
  ];

  return summarizeDimension("growth", "成長", contributions);
}

function averageGrowthConsistency(stock: Stock) {
  return round(
    (
      consistencyScore([
        stock.financialMetrics.revenueCagr3Y,
        stock.financialMetrics.revenueCagr5Y,
        stock.financialMetrics.revenueCagr10Y
      ]) +
      consistencyScore([
        stock.financialMetrics.epsCagr3Y,
        stock.financialMetrics.epsCagr5Y,
        stock.financialMetrics.epsCagr10Y
      ])
    ) /
      2,
    1
  );
}

export function scoreFinancialHealth(stock: Stock) {
  const fcfYield = (stock.financialMetrics.freeCashFlowBillion / stock.marketCapBillion) * 100;
  const contributions: ScoreContribution[] = [
    {
      label: "負債比",
      score: normalizeScore(stock.financialMetrics.debtToEquity, 0.1, 1.5, true),
      weight: 40,
      detail: "以 debt / equity 作為槓桿近似。"
    },
    {
      label: "FCF 安全邊際",
      score: normalizeScore(fcfYield, 1, 6),
      weight: 20,
      detail: "以 FCF yield 近似現金流安全性。"
    },
    {
      label: "財務風險",
      score: inverseRiskScore(stock.riskProfile.financial.level),
      weight: 20,
      detail: "以現有財務風險質化欄位補足 balance sheet 訊號。"
    },
    {
      label: "流動性 / 利息覆蓋",
      score: 0,
      weight: missingDataWeights.financialHealth.liquidityCoverage,
      detail: "缺少 cash position、current ratio、interest coverage。",
      missing: true,
      missingFlag: "liquidity_coverage"
    }
  ];

  return summarizeDimension("financialHealth", "財務體質", contributions);
}

export function scoreProfitability(stock: Stock) {
  const contributions: ScoreContribution[] = [
    {
      label: "毛利率",
      score: normalizeScore(stock.financialMetrics.grossMargin, 20, 70),
      weight: 25,
      detail: "高毛利代表定價與產品組合韌性。"
    },
    {
      label: "營業利益率",
      score: normalizeScore(stock.financialMetrics.operatingMargin, 5, 45),
      weight: 25,
      detail: "以 operating margin 反映營運效率。"
    },
    {
      label: "ROE",
      score: normalizeScore(stock.financialMetrics.roe, 8, 35),
      weight: 20,
      detail: "股東權益報酬。"
    },
    {
      label: "ROIC",
      score: normalizeScore(stock.financialMetrics.roic, 6, 30),
      weight: 20,
      detail: "資本回收效率。"
    },
    {
      label: "淨利率",
      score: 0,
      weight: missingDataWeights.profitability.netMargin,
      detail: "缺少 net margin。",
      missing: true,
      missingFlag: "net_margin"
    }
  ];

  return summarizeDimension("profitability", "獲利能力", contributions);
}

function bandAttractiveness(current: number, low: number, high: number) {
  return round(normalizeScore((current - low) / (high - low || 1), 0, 1, true), 1);
}

export function scoreValuation(stock: Stock, targetZoneScore: number) {
  const fcfYield = (stock.financialMetrics.freeCashFlowBillion / stock.marketCapBillion) * 100;
  const contributions: ScoreContribution[] = [
    {
      label: "PE",
      score: bandAttractiveness(
        stock.valuationMetrics.pe.current,
        stock.valuationMetrics.pe.low,
        stock.valuationMetrics.pe.high
      ),
      weight: 35,
      detail: "PE 相對歷史區間位置。"
    },
    {
      label: "PEG",
      score: bandAttractiveness(
        stock.valuationMetrics.peg.current,
        stock.valuationMetrics.peg.low,
        stock.valuationMetrics.peg.high
      ),
      weight: 20,
      detail: "PEG 相對歷史區間位置。"
    },
    {
      label: "PB",
      score: bandAttractiveness(
        stock.valuationMetrics.pb.current,
        stock.valuationMetrics.pb.low,
        stock.valuationMetrics.pb.high
      ),
      weight: 10,
      detail: "PB 相對歷史區間位置。"
    },
    {
      label: "現金流殖利率",
      score: normalizeScore(fcfYield, 1, 6),
      weight: 15,
      detail: "以 FCF yield 補足估值吸引力。"
    },
    {
      label: "價格區間",
      score: targetZoneScore,
      weight: 20,
      detail: "以既有 watchlist target range 作為價格位置參考。"
    }
  ];

  return summarizeDimension("valuation", "估值", contributions);
}

export function scoreStabilityRisk(stock: Stock) {
  const averageRisk =
    inverseRiskScore(stock.riskProfile.industryCycle.level) * 0.2 +
    inverseRiskScore(stock.riskProfile.policy.level) * 0.25 +
    inverseRiskScore(stock.riskProfile.customerConcentration.level) * 0.15 +
    inverseRiskScore(stock.riskProfile.financial.level) * 0.2;
  const revenueConcentration = Math.max(
    ...stock.revenueSegments.map((segment: Stock["revenueSegments"][number]) => segment.share)
  );
  const contributions: ScoreContribution[] = [
    {
      label: "風險輪廓",
      score: round(averageRisk, 1),
      weight: 60,
      detail: "由產業、政策、客戶與財務風險加權。"
    },
    {
      label: "槓桿壓力",
      score: normalizeScore(stock.financialMetrics.debtToEquity, 0.1, 1.4, true),
      weight: 15,
      detail: "高負債降低穩定度。"
    },
    {
      label: "成長穩定",
      score: averageGrowthConsistency(stock),
      weight: 10,
      detail: "多年成長曲線越穩定越高分。"
    },
    {
      label: "單一題材依賴",
      score: normalizeScore(revenueConcentration, 25, 75, true),
      weight: 15,
      detail: "單一收入來源占比越高，穩定度越低。"
    }
  ];

  return summarizeDimension("stabilityRisk", "穩定度 / 風險", contributions);
}

export function computeOverallScore(dimensions: Record<DimensionKey, ScoreDimensionResult>) {
  const dimensionEntries = Object.entries(scoringWeights).map(([key, weight]) => ({
    key: key as DimensionKey,
    weight,
    dimension: dimensions[key as DimensionKey]
  }));
  const availableWeight = dimensionEntries
    .filter((entry) => !entry.dimension.insufficientData)
    .reduce((sum, entry) => sum + entry.weight, 0);
  const overallScore = availableWeight
    ? dimensionEntries
        .filter((entry) => !entry.dimension.insufficientData)
        .reduce((sum, entry) => sum + entry.dimension.score * entry.weight, 0) / availableWeight
    : 0;
  const weightedCoverage =
    dimensionEntries.reduce((sum, entry) => sum + entry.dimension.coverage * entry.weight, 0) /
    dimensionEntries.reduce((sum, entry) => sum + entry.weight, 0);

  return {
    overallScore: round(overallScore, 1),
    weightedCoverage: round(weightedCoverage, 1)
  };
}

export function getCriticalDimensionMissing(dimensions: Record<DimensionKey, ScoreDimensionResult>) {
  return ["businessQuality", "financialHealth", "valuation"].some(
    (key) => dimensions[key as DimensionKey].insufficientData
  );
}
