import type { Stock, WatchlistItem, WorkspaceWatchlistItem } from "../../types/investment";
import type {
  CurrentPositionSummary,
  ManualTargetZone,
  ParsedTargetRange,
  PriorReferenceSnapshot,
  StockAnalysisInput,
  ValuationStatus
} from "./types";

export function parseTargetRange(targetRange?: string): ParsedTargetRange | null {
  if (!targetRange) return null;

  const match = targetRange.match(/^([A-Z]{3})\s+([\d.]+)\s*-\s*([\d.]+)$/);

  if (!match) return null;

  return {
    currency: match[1],
    low: Number(match[2]),
    high: Number(match[3])
  };
}

export function deriveTargetZone(stock: Stock, watchlistItem?: WatchlistItem): ManualTargetZone {
  const parsedTargetRange = parseTargetRange(watchlistItem?.targetRange);

  if (parsedTargetRange) {
    return {
      source: "watchlist_target",
      metric: "price",
      label: `${parsedTargetRange.currency} ${parsedTargetRange.low} - ${parsedTargetRange.high}`,
      currency: parsedTargetRange.currency,
      low: parsedTargetRange.low,
      high: parsedTargetRange.high
    };
  }

  return {
    source: "valuation_band",
    metric: "pe",
    label: `PE ${stock.valuationMetrics.pe.low.toFixed(1)}x - ${stock.valuationMetrics.pe.median.toFixed(1)}x`,
    low: stock.valuationMetrics.pe.low,
    high: stock.valuationMetrics.pe.median
  };
}

export function deriveCurrentPosition(stock: Stock, targetZone: ManualTargetZone): CurrentPositionSummary {
  if (targetZone.metric === "price" && typeof targetZone.low === "number" && typeof targetZone.high === "number") {
    if (stock.currentPrice < targetZone.low) {
      return {
        metric: "price",
        label: "低於 target zone",
        valueLabel: `${stock.currentPrice.toFixed(1)} / ${targetZone.currency ?? stock.currency}`,
        zone: "below_target"
      };
    }

    if (stock.currentPrice <= targetZone.high) {
      return {
        metric: "price",
        label: "位於 target zone",
        valueLabel: `${stock.currentPrice.toFixed(1)} / ${targetZone.currency ?? stock.currency}`,
        zone: "within_target"
      };
    }

    if (stock.currentPrice <= targetZone.high * 1.05) {
      return {
        metric: "price",
        label: "接近 target zone",
        valueLabel: `${stock.currentPrice.toFixed(1)} / ${targetZone.currency ?? stock.currency}`,
        zone: "near_target"
      };
    }

    return {
      metric: "price",
      label: "高於 target zone",
      valueLabel: `${stock.currentPrice.toFixed(1)} / ${targetZone.currency ?? stock.currency}`,
      zone: "above_target"
    };
  }

  if (typeof targetZone.low === "number" && typeof targetZone.high === "number") {
    const peCurrent = stock.valuationMetrics.pe.current;

    if (peCurrent <= targetZone.low) {
      return {
        metric: "pe",
        label: "低於 PE 合理帶",
        valueLabel: `${peCurrent.toFixed(1)}x`,
        zone: "below_target"
      };
    }

    if (peCurrent <= targetZone.high) {
      return {
        metric: "pe",
        label: "位於 PE 合理帶",
        valueLabel: `${peCurrent.toFixed(1)}x`,
        zone: "within_target"
      };
    }

    return {
      metric: "pe",
      label: "高於 PE 合理帶",
      valueLabel: `${peCurrent.toFixed(1)}x`,
      zone: "above_target"
    };
  }

  return {
    metric: "price",
    label: "缺少 target zone",
    valueLabel: "--",
    zone: "insufficient_data"
  };
}

export function derivePriorReferenceSnapshot(
  stock: Stock,
  _valuationStatus: ValuationStatus
): PriorReferenceSnapshot {
  return {
    overallScore: stock.scores.overall.score * 10,
    qualityScore: stock.scores.quality.score * 10,
    growthScore: stock.scores.growth.score * 10,
    valuationScore: stock.scores.valuation.score * 10,
    riskScore: stock.scores.risk.score * 10
  };
}

export function createStockAnalysisInputs(
  stocks: Stock[],
  watchlist: WorkspaceWatchlistItem[]
): StockAnalysisInput[] {
  const watchlistMap = Object.fromEntries(watchlist.map((item) => [item.stockId, item]));

  return stocks.map((stock) => ({
    stock,
    watchlistItem: watchlistMap[stock.id],
    workspaceWatchlist: watchlistMap[stock.id],
    reminders: []
  }));
}

export function getWatchlistLabel(item?: WorkspaceWatchlistItem) {
  if (!item) return "未加入觀察名單";
  return item.isTracked ? item.focusState : "未追蹤";
}
