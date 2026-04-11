import { evaluateAlerts } from "./alerts";
import { analyzeStock } from "./decision";
import { evaluateMarketEnvironment } from "./market";
import type { InvestmentWorkbench, InvestmentWorkbenchInput, StockAnalysisInput } from "./types";

function attachReminders(input: InvestmentWorkbenchInput): StockAnalysisInput[] {
  return input.stocks.map((stock) => {
    const workspaceWatchlist = input.watchlist.find((item) => item.stockId === stock.id);

    return {
      stock,
      watchlistItem: workspaceWatchlist,
      workspaceWatchlist,
      reminders: input.reminders.filter((reminder) => reminder.stockId === stock.id)
    };
  });
}

export function buildInvestmentWorkbench(input: InvestmentWorkbenchInput, snapshotDate: string): InvestmentWorkbench {
  const analyses = attachReminders(input).map((stockInput) => analyzeStock(stockInput));
  const analysesWithAlerts = analyses.map((analysis) => {
    const alerts = evaluateAlerts(analysis, snapshotDate);

    return {
      ...analysis,
      alerts,
      alertHistory: alerts
    };
  });

  const analysesByTicker = Object.fromEntries(
    analysesWithAlerts.map((analysis) => [analysis.stock.ticker, analysis])
  );
  const trackedAnalyses = analysesWithAlerts.filter((analysis) => analysis.workspaceWatchlist?.isTracked !== false);
  const alerts = analysesWithAlerts.flatMap((analysis) => analysis.alerts);

  return {
    analyses: analysesWithAlerts,
    analysesByTicker,
    trackedAnalyses,
    alerts,
    alertHistory: [...alerts].sort((left, right) => right.triggeredAt.localeCompare(left.triggeredAt)),
    marketOverview: evaluateMarketEnvironment(analysesWithAlerts)
  };
}

export * from "./config";
export * from "./decision";
export * from "./presentation";
export * from "./types";
