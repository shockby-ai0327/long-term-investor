import { alertThresholds } from "./config";
import { deriveValuationStatus } from "./decision";
import { clamp, daysBetween, round } from "./utils";
import type {
  InvestmentAlert,
  StockAnalysisRecord,
  ValuationStatus
} from "./types";

function getPreviousValuationStatus(record: StockAnalysisRecord): ValuationStatus {
  const peHistory = record.stock.valuationMetrics.pe.historical;
  const pbHistory = record.stock.valuationMetrics.pb.historical;
  const pegHistory = record.stock.valuationMetrics.peg.historical;

  if (peHistory.length < 2 || pbHistory.length < 2 || pegHistory.length < 2) {
    return record.decision.valuationStatus;
  }

  const previousPosition =
    (clamp(
      (peHistory[peHistory.length - 2] - record.stock.valuationMetrics.pe.low) /
        (record.stock.valuationMetrics.pe.high - record.stock.valuationMetrics.pe.low || 1),
      0,
      1
    ) +
      clamp(
        (pbHistory[pbHistory.length - 2] - record.stock.valuationMetrics.pb.low) /
          (record.stock.valuationMetrics.pb.high - record.stock.valuationMetrics.pb.low || 1),
        0,
        1
      ) +
      clamp(
        (pegHistory[pegHistory.length - 2] - record.stock.valuationMetrics.peg.low) /
          (record.stock.valuationMetrics.peg.high - record.stock.valuationMetrics.peg.low || 1),
        0,
        1
      )) /
    3;

  return deriveValuationStatus(record.legacyFallback.valuationScore, round(previousPosition, 2), record.decision.currentPosition);
}

function createAlert(
  record: StockAnalysisRecord,
  partial: Omit<InvestmentAlert, "id" | "stockId" | "ticker">
): InvestmentAlert {
  return {
    id: `${record.stock.id}-${partial.rule}`,
    stockId: record.stock.id,
    ticker: record.stock.ticker,
    ...partial
  };
}

export function evaluateAlerts(record: StockAnalysisRecord, snapshotDate: string) {
  const alerts: InvestmentAlert[] = [];
  const latestEvent = [...record.stock.recentEvents].sort((left, right) => right.date.localeCompare(left.date))[0];
  const previousValuationStatus = getPreviousValuationStatus(record);
  const overallDelta = record.overallScore - record.legacyFallback.overallScore;
  const stabilityDelta = record.dimensions.stabilityRisk.score - record.legacyFallback.riskScore;
  const valuationDelta = record.valuationScore - record.legacyFallback.valuationScore;

  if (record.decision.currentPosition.zone === "within_target" || record.decision.currentPosition.zone === "below_target") {
    alerts.push(
      createAlert(record, {
        rule: "target_zone",
        state: "active",
        severity: "positive",
        title: "進入 target zone",
        summary: `${record.stock.ticker} 已進入既有研究價格帶。`,
        reason: "現在的價格位置已達到手動設定的研究區間。",
        triggeredAt: snapshotDate,
        actionLabel: "查看個股",
        actionTo: `/stocks/${record.stock.ticker}`
      })
    );
  } else if (record.decision.currentPosition.zone === "near_target") {
    alerts.push(
      createAlert(record, {
        rule: "target_zone",
        state: "monitoring",
        severity: "neutral",
        title: "接近 target zone",
        summary: `${record.stock.ticker} 已接近研究價格帶。`,
        reason: "價格距離 target zone 已縮小到 5% 內。",
        triggeredAt: snapshotDate,
        actionLabel: "看觀察名單",
        actionTo: "/watchlist"
      })
    );
  }

  if (previousValuationStatus !== record.decision.valuationStatus) {
    alerts.push(
      createAlert(record, {
        rule: "valuation_status_change",
        state: "active",
        severity: record.decision.valuationStatus === "overvalued" ? "negative" : "positive",
        title: "估值狀態改變",
        summary: `${record.stock.ticker} 由 ${previousValuationStatus} 轉為 ${record.decision.valuationStatus}。`,
        reason: "以歷史估值帶前一個觀測點與目前位置比較。",
        triggeredAt: snapshotDate,
        actionLabel: "查看估值",
        actionTo: `/stocks/${record.stock.ticker}`
      })
    );
  }

  if (Math.abs(overallDelta) >= alertThresholds.overallDelta) {
    alerts.push(
      createAlert(record, {
        rule: "overall_score_change",
        state: "active",
        severity: overallDelta > 0 ? "positive" : "negative",
        title: "總分顯著變動",
        summary: `${record.stock.ticker} 的總分變動 ${overallDelta > 0 ? "+" : ""}${overallDelta.toFixed(1)} 分。`,
        reason: "以舊版 mock 分數作為 prior snapshot fallback 比對。",
        triggeredAt: snapshotDate,
        actionLabel: "查看拆解",
        actionTo: `/stocks/${record.stock.ticker}`
      })
    );
  }

  if (stabilityDelta <= -alertThresholds.stabilityDelta) {
    alerts.push(
      createAlert(record, {
        rule: "stability_deterioration",
        state: "active",
        severity: "negative",
        title: "穩定度惡化",
        summary: `${record.stock.ticker} 的 Stability / Risk 下降 ${Math.abs(stabilityDelta).toFixed(1)} 分。`,
        reason: "目前風險輪廓明顯弱於舊版 fallback snapshot。",
        triggeredAt: snapshotDate,
        actionLabel: "查看風險",
        actionTo: `/stocks/${record.stock.ticker}`
      })
    );
  }

  if (
    latestEvent &&
    daysBetween(snapshotDate, latestEvent.date) >= -alertThresholds.recentEventWindowDays &&
    (Math.abs(overallDelta) >= 6 || Math.abs(valuationDelta) >= alertThresholds.valuationDelta)
  ) {
    alerts.push(
      createAlert(record, {
        rule: "data_update_reprice",
        state: "active",
        severity: valuationDelta < 0 ? "negative" : "neutral",
        title: "事件後評分重估",
        summary: `${record.stock.ticker} 在 ${latestEvent.title} 後出現明顯評分變化。`,
        reason: "用近期事件日期當作觸發點，提醒重新寫回 thesis。",
        triggeredAt: latestEvent.date,
        actionLabel: "更新 Thesis",
        actionTo: `/thesis/${record.stock.ticker}`
      })
    );
  }

  const fitDelta = Math.abs(record.decision.buffettFit - record.decision.lynchFit);

  if (Math.max(record.decision.buffettFit, record.decision.lynchFit) >= 75 && fitDelta >= 6) {
    const styleName = record.decision.buffettFit > record.decision.lynchFit ? "Buffett" : "Lynch";

    alerts.push(
      createAlert(record, {
        rule: "style_fit",
        state: "active",
        severity: "positive",
        title: `風格匹配偏向 ${styleName}`,
        summary: `${record.stock.ticker} 目前更符合 ${styleName} 框架。`,
        reason: "Style fit 分數差距已高於 6 分。",
        triggeredAt: snapshotDate,
        actionLabel: "查看個股",
        actionTo: `/stocks/${record.stock.ticker}`
      })
    );
  }

  return alerts.sort((left, right) => right.triggeredAt.localeCompare(left.triggeredAt));
}
