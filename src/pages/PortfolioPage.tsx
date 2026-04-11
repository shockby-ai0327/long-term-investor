import { Link } from "react-router-dom";
import { Badge } from "../components/Badge";
import { DecisionPill } from "../components/DecisionPill";
import { PageHeader } from "../components/PageHeader";
import { SectionBlock } from "../components/SectionBlock";
import {
  getActionDisplay,
  getAlertSeverityDisplay,
  getConfidenceDisplay,
  getValuationDisplay,
  type InvestmentAlert,
  type StockAnalysisRecord
} from "../domain/investment";
import { cashPosition, mockSnapshot, portfolioHoldings, portfolioNotes } from "../data/mockData";
import { useWorkspaceState } from "../state/WorkspaceStateProvider";
import type { PortfolioHolding } from "../types/investment";
import { formatCurrency, formatPercent } from "../utils/format";

function groupByWeight(items: { key: string; weight: number }[]) {
  return items.reduce<Record<string, number>>((accumulator, item) => {
    accumulator[item.key] = (accumulator[item.key] ?? 0) + item.weight;
    return accumulator;
  }, {});
}

function getPnLTone(value: number) {
  if (value >= 15) return "positive" as const;
  if (value >= 0) return "neutral" as const;
  return "negative" as const;
}

function getNextHoldingStep(holding: PortfolioHolding, analysis: StockAnalysisRecord, topAlert?: InvestmentAlert) {
  if (topAlert) {
    switch (topAlert.rule) {
      case "valuation_status_change":
      case "target_zone":
        return "先回到估值區與 fair zone，確認這檔還適不適合新增資金。";
      case "overall_score_change":
        return "先看評分拆解，再決定這次變動是否已改變持有理由。";
      case "stability_deterioration":
        return "先處理風險與集中度，必要時下修這檔在組合中的耐受度。";
      case "data_update_reprice":
        return "把事件後的變化寫回 Thesis，再決定要不要調整部位節奏。";
      case "style_fit":
        return "重看這檔目前更適合哪種研究框架，不要把好公司直接等同於好配置。";
      default:
        return topAlert.reason;
    }
  }

  if (analysis.decision.action === "wait_for_better_price") {
    return "維持部位，但新增資金先保留給更好的價格帶。";
  }

  if (analysis.decision.action === "avoid_for_now") {
    return "先回頭看風險與持有理由，不把既有部位視為理所當然。";
  }

  if (holding.weight >= 20) {
    return "這檔已是組合核心，優先回頭確認 thesis 是否仍支撐高集中度。";
  }

  return "維持持有，按既定節奏回頭檢查估值、風險與 thesis。";
}

function getPriorityLabel(holding: PortfolioHolding, analysis: StockAnalysisRecord, topAlert?: InvestmentAlert) {
  if (holding.weight >= 20) return "集中度";
  if (topAlert?.severity === "negative") return "風險";
  if (analysis.decision.valuationStatus === "overvalued") return "估值";
  if (topAlert) return "提醒";
  return "配置";
}

function getPriorityTone(holding: PortfolioHolding, analysis: StockAnalysisRecord, topAlert?: InvestmentAlert) {
  if (holding.weight >= 20) return "warning" as const;
  if (topAlert?.severity === "negative") return "negative" as const;
  if (analysis.decision.valuationStatus === "overvalued") return "negative" as const;
  if (topAlert?.severity === "positive") return "positive" as const;
  return "info" as const;
}

function getPriorityScore(holding: PortfolioHolding, analysis: StockAnalysisRecord, topAlert?: InvestmentAlert) {
  let score = 0;

  if (holding.weight >= 20) score += 30;
  if (analysis.decision.action === "avoid_for_now") score += 25;
  if (analysis.decision.action === "wait_for_better_price") score += 18;
  if (analysis.decision.valuationStatus === "overvalued") score += 15;
  if (topAlert?.state === "active") score += 20;
  if (topAlert?.severity === "negative") score += 12;
  if (analysis.decision.riskFlags.length) score += 8;

  return score;
}

function SummaryMetric({
  label,
  value,
  note
}: {
  label: string;
  value: string | number;
  note: string;
}) {
  return (
    <div className="summary-metric">
      <p className="eyebrow-label">{label}</p>
      <p className="mt-1.5 text-[1.35rem] font-semibold tracking-tight text-ink-900">{value}</p>
      <p className="mt-1 text-xs leading-5 text-slate-500">{note}</p>
    </div>
  );
}

export function PortfolioPage() {
  const { getAnalysisByTicker } = useWorkspaceState();
  const investedValue = portfolioHoldings.reduce((sum, holding) => sum + holding.marketValue, 0);
  const totalValue = investedValue + cashPosition.value;
  const sortedHoldings = [...portfolioHoldings].sort((left, right) => right.weight - left.weight);
  const holdingsWithAnalysis = sortedHoldings.map((holding) => {
    const analysis = getAnalysisByTicker(holding.ticker);
    const topAlert = analysis.alerts.find((alert) => alert.state === "active") ?? analysis.alerts[0];
    const gainValue = holding.marketValue - holding.costBasis;
    const gainPercent = (gainValue / holding.costBasis) * 100;

    return {
      holding,
      analysis,
      topAlert,
      gainValue,
      gainPercent,
      priorityScore: getPriorityScore(holding, analysis, topAlert),
      nextStep: getNextHoldingStep(holding, analysis, topAlert)
    };
  });
  const reviewQueue = [...holdingsWithAnalysis].sort((left, right) => right.priorityScore - left.priorityScore);
  const reviewNeededCount = holdingsWithAnalysis.filter((item) => item.priorityScore >= 18).length;
  const topHolding = sortedHoldings[0]!;
  const topHoldingAnalysis = getAnalysisByTicker(topHolding.ticker);
  const topThreeWeight = sortedHoldings.slice(0, 3).reduce((sum, holding) => sum + holding.weight, 0);
  const sectorAllocation = groupByWeight(
    portfolioHoldings.map((holding) => ({ key: holding.sector, weight: holding.weight }))
  );
  const regionAllocation = {
    ...groupByWeight(portfolioHoldings.map((holding) => ({ key: holding.region, weight: holding.weight }))),
    現金: cashPosition.weight
  };
  const [largestSectorLabel, largestSectorWeight] = Object.entries(sectorAllocation).sort(
    ([, left], [, right]) => right - left
  )[0]!;
  const [largestRegionLabel, largestRegionWeight] = Object.entries(regionAllocation).sort(
    ([, left], [, right]) => right - left
  )[0]!;
  const actionDistribution = {
    study: holdingsWithAnalysis.filter((item) => item.analysis.decision.action === "study_now").length,
    watch: holdingsWithAnalysis.filter((item) => item.analysis.decision.action === "watch").length,
    waitOrAvoid: holdingsWithAnalysis.filter((item) =>
      ["wait_for_better_price", "avoid_for_now"].includes(item.analysis.decision.action)
    ).length
  };
  const negativeAlertCount = holdingsWithAnalysis.filter((item) => item.topAlert?.severity === "negative").length;

  return (
    <div className="space-y-4">
      <PageHeader
        eyebrow="Portfolio"
        title="投資組合工作台"
        description="先看哪個部位要回頭，再看配置是否過度集中。這一頁把持股決策與配置風險放在同一張工作台。"
        actions={
          <>
            <Link
              to="/tracking"
              className="toolbar-button border-slate-300 bg-white text-ink-900 hover:border-slate-400"
            >
              看 Alerts
            </Link>
            <Link
              to="/watchlist"
              className="toolbar-button border-ink-900 bg-ink-900 text-white hover:bg-ink-800"
            >
              看 Watchlist
            </Link>
          </>
        }
      />

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.16fr)_320px]">
        <SectionBlock
          title="先回頭的部位"
          subtitle={`依 ${mockSnapshot.asOfDate} snapshot 的 alert、估值與集中度排序，先處理最容易改變配置判斷的持股。`}
        >
          <div className="space-y-3">
            {reviewQueue.slice(0, 3).map(({ holding, analysis, topAlert, nextStep }) => {
              const actionDisplay = getActionDisplay(analysis.decision.action);
              const valuationDisplay = getValuationDisplay(analysis.decision.valuationStatus);
              const confidenceDisplay = getConfidenceDisplay(analysis.decision.confidenceLevel);
              const alertSeverity = topAlert ? getAlertSeverityDisplay(topAlert.severity) : null;

              return (
                <article key={holding.id} className="rounded-xl border border-slate-200/75 bg-white/[0.86] px-4 py-4">
                  <div className="grid gap-4 xl:grid-cols-[minmax(0,1.02fr)_minmax(0,0.98fr)_176px] xl:items-start">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge tone={getPriorityTone(holding, analysis, topAlert)}>
                          {getPriorityLabel(holding, analysis, topAlert)}
                        </Badge>
                        <DecisionPill label={actionDisplay.label} tone={actionDisplay.tone} />
                        <DecisionPill label={valuationDisplay.label} tone={valuationDisplay.tone} />
                        {alertSeverity ? (
                          <DecisionPill label={alertSeverity.label} tone={alertSeverity.tone} />
                        ) : null}
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-600">
                          {holding.ticker}
                        </p>
                      </div>

                      <h3 className="mt-2 text-[1.02rem] font-semibold tracking-tight text-ink-900">
                        {holding.companyName}
                      </h3>
                      <p className="mt-2 text-sm leading-6 text-slate-700">{analysis.decision.summary}</p>
                    </div>

                    <div className="grid gap-2">
                      <div className="rounded-lg border border-slate-200/75 bg-slate-50/70 px-3.5 py-3">
                        <p className="eyebrow-label">目前狀態</p>
                        <div className="mt-2 flex flex-wrap gap-2">
                          <DecisionPill label={`權重 ${holding.weight}%`} tone={holding.weight >= 20 ? "negative" : "neutral"} />
                          <DecisionPill label={`信心 ${confidenceDisplay.label}`} tone={confidenceDisplay.tone} />
                        </div>
                        <p className="mt-2 text-sm leading-6 text-slate-700">{analysis.decision.whyNotNow}</p>
                      </div>

                      <div className="rounded-lg border border-slate-200/75 bg-white/80 px-3.5 py-3">
                        <p className="eyebrow-label">下一步</p>
                        <p className="mt-1.5 text-sm leading-6 text-slate-700">{nextStep}</p>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      <Link
                        to={`/stocks/${holding.ticker}`}
                        className="toolbar-button border-ink-900 bg-ink-900 text-white hover:bg-ink-800"
                      >
                        看個股
                      </Link>
                      <Link
                        to={`/thesis/${holding.ticker}`}
                        className="toolbar-button border-slate-300 bg-white text-ink-900 hover:border-slate-400"
                      >
                        看 Thesis
                      </Link>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </SectionBlock>

        <aside className="panel px-4 py-4 sm:px-5">
          <div className="border-b border-slate-200/75 pb-3">
            <h2 className="section-title">關鍵狀態</h2>
            <p className="mt-1 muted-copy">先掃過集中度、持股動作分布與最大曝險，再決定配置下一步。</p>
          </div>

          <div className="mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-1">
            <SummaryMetric label="組合總值" value={formatCurrency(totalValue)} note={`已投資 ${formatCurrency(investedValue)}`} />
            <SummaryMetric label="需回頭部位" value={reviewNeededCount} note="高集中、估值偏高或有 active alert" />
            <SummaryMetric label="前 3 大持股" value={`${topThreeWeight}%`} note="集中度決定 thesis 檢查頻率" />
            <SummaryMetric label="現金部位" value={`${cashPosition.weight}%`} note="保留給更好的風險報酬比" />
          </div>

          <div className="mt-4 space-y-3">
            <div className="decision-panel px-4 py-3.5">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-medium text-ink-900">最高持股</p>
                <Badge tone={topHolding.weight >= 20 ? "warning" : "neutral"}>{topHolding.weight}%</Badge>
              </div>
              <p className="mt-2 text-base font-semibold text-ink-900">{topHolding.companyName}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                <DecisionPill
                  label={getActionDisplay(topHoldingAnalysis.decision.action).label}
                  tone={getActionDisplay(topHoldingAnalysis.decision.action).tone}
                />
                <DecisionPill
                  label={getValuationDisplay(topHoldingAnalysis.decision.valuationStatus).label}
                  tone={getValuationDisplay(topHoldingAnalysis.decision.valuationStatus).tone}
                />
              </div>
            </div>

            <div className="decision-panel px-4 py-3.5">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-medium text-ink-900">持股動作分布</p>
                <Badge tone="neutral">{holdingsWithAnalysis.length} 檔</Badge>
              </div>
              <div className="mt-3 space-y-2 text-sm">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-slate-700">值得研究</p>
                  <p className="font-medium text-ink-900">{actionDistribution.study}</p>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <p className="text-slate-700">持續觀察</p>
                  <p className="font-medium text-ink-900">{actionDistribution.watch}</p>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <p className="text-slate-700">等價格 / 先不要碰</p>
                  <p className="font-medium text-ink-900">{actionDistribution.waitOrAvoid}</p>
                </div>
              </div>
            </div>

            <div className="decision-panel px-4 py-3.5">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-medium text-ink-900">最大曝險</p>
                <Badge tone={negativeAlertCount ? "negative" : "info"}>{negativeAlertCount} 則警示</Badge>
              </div>
              <div className="mt-3 space-y-2 text-sm">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-slate-700">最大產業</p>
                  <p className="font-medium text-ink-900">{largestSectorLabel} {largestSectorWeight}%</p>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <p className="text-slate-700">最大地區</p>
                  <p className="font-medium text-ink-900">{largestRegionLabel} {largestRegionWeight}%</p>
                </div>
              </div>
            </div>
          </div>
        </aside>
      </div>

      <SectionBlock
        title="持股決策清單"
        subtitle="每列都同時回答目前狀態、為什麼還持有、為什麼現在不要更激進。"
      >
        <div className="space-y-0 divide-y divide-slate-200/75">
          {holdingsWithAnalysis.map(({ holding, analysis, topAlert, gainValue, gainPercent, nextStep }) => {
            const actionDisplay = getActionDisplay(analysis.decision.action);
            const valuationDisplay = getValuationDisplay(analysis.decision.valuationStatus);
            const confidenceDisplay = getConfidenceDisplay(analysis.decision.confidenceLevel);

            return (
              <article
                key={holding.id}
                className="grid gap-4 py-4 xl:grid-cols-[160px_120px_150px_150px_minmax(0,1fr)_196px] xl:items-start"
              >
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-ink-900">{holding.ticker}</p>
                  <p className="mt-1 text-sm text-slate-600">{holding.companyName}</p>
                  <p className="mt-1 text-xs text-slate-500">{holding.sector} / {holding.region}</p>
                </div>

                <div>
                  <p className="eyebrow-label">部位</p>
                  <p className="mt-1.5 text-[1.1rem] font-semibold tracking-tight text-ink-900">{holding.weight}%</p>
                  <p className="mt-1 text-xs text-slate-500">{formatCurrency(holding.marketValue)}</p>
                  <p className={`mt-1 text-xs ${getPnLTone(gainPercent) === "positive" ? "text-emerald-700" : getPnLTone(gainPercent) === "negative" ? "text-rose-700" : "text-slate-600"}`}>
                    未實現 {gainValue >= 0 ? "+" : ""}{formatCurrency(gainValue)} / {gainValue >= 0 ? "+" : ""}{formatPercent(gainPercent)}
                  </p>
                </div>

                <div>
                  <p className="eyebrow-label">決策</p>
                  <div className="mt-1.5 flex flex-wrap gap-2">
                    <DecisionPill label={actionDisplay.label} tone={actionDisplay.tone} />
                    <DecisionPill label={valuationDisplay.label} tone={valuationDisplay.tone} />
                  </div>
                </div>

                <div>
                  <p className="eyebrow-label">警示 / 信心</p>
                  <div className="mt-1.5 flex flex-wrap gap-2">
                    {topAlert ? (
                      <DecisionPill
                        label={getAlertSeverityDisplay(topAlert.severity).label}
                        tone={getAlertSeverityDisplay(topAlert.severity).tone}
                      />
                    ) : (
                      <DecisionPill label="無新警示" tone="neutral" />
                    )}
                    <DecisionPill label={`信心 ${confidenceDisplay.label}`} tone={confidenceDisplay.tone} />
                  </div>
                </div>

                <div className="min-w-0">
                  <p className="text-sm font-medium text-ink-900">{analysis.decision.summary}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-700">
                    <span className="font-medium text-ink-900">為什麼還持有：</span> {analysis.decision.whyNow}
                  </p>
                  <p className="mt-1 text-sm leading-6 text-slate-600">
                    <span className="font-medium text-ink-900">為什麼現在不更激進：</span> {analysis.decision.whyNotNow}
                  </p>
                  {analysis.decision.riskFlags.length ? (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {analysis.decision.riskFlags.slice(0, 2).map((flag) => (
                        <DecisionPill key={flag} label={flag} tone="negative" />
                      ))}
                    </div>
                  ) : null}
                </div>

                <div className="flex flex-col gap-2">
                  <div className="rounded-lg border border-slate-200/75 bg-slate-50/70 px-3 py-2.5">
                    <p className="eyebrow-label">下一個檢查點</p>
                    <p className="mt-1.5 text-sm leading-6 text-slate-700">{nextStep}</p>
                  </div>
                  <Link
                    to={`/stocks/${holding.ticker}`}
                    className="toolbar-button border-ink-900 bg-ink-900 text-white hover:bg-ink-800"
                  >
                    看個股
                  </Link>
                  <Link
                    to={`/thesis/${holding.ticker}`}
                    className="toolbar-button border-slate-300 bg-white text-ink-900 hover:border-slate-400"
                  >
                    看 Thesis
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      </SectionBlock>

      <div className="grid gap-4 lg:grid-cols-2">
        <SectionBlock title="產業配置" subtitle="先確認是否過度暴露在同一種經濟驅動。">
          <div className="space-y-3">
            {Object.entries(sectorAllocation)
              .sort(([, left], [, right]) => right - left)
              .map(([sector, weight]) => (
                <div key={sector} className="decision-panel px-4 py-3.5">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-medium text-ink-900">{sector}</p>
                    <p className="text-sm font-medium text-slate-700">{weight}%</p>
                  </div>
                  <div className="mt-2 h-2 rounded-full bg-slate-100">
                    <div className="h-full rounded-full bg-ink-900" style={{ width: `${weight}%` }} />
                  </div>
                </div>
              ))}
          </div>
        </SectionBlock>

        <SectionBlock title="地區配置" subtitle="地區暴露要和政策、匯率與供應鏈一起看。">
          <div className="space-y-3">
            {Object.entries(regionAllocation)
              .sort(([, left], [, right]) => right - left)
              .map(([region, weight]) => (
                <div key={region} className="decision-panel px-4 py-3.5">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-medium text-ink-900">{region}</p>
                    <p className="text-sm font-medium text-slate-700">{weight}%</p>
                  </div>
                  <div className="mt-2 h-2 rounded-full bg-slate-100">
                    <div className="h-full rounded-full bg-rust-500" style={{ width: `${weight}%` }} />
                  </div>
                </div>
              ))}
          </div>
        </SectionBlock>
      </div>

      <SectionBlock title="配置理由" subtitle="保留配置原則，避免最後只剩下持股與漲跌幅。">
        <div className="grid gap-3 md:grid-cols-2">
          {portfolioNotes.map((note) => (
            <div key={note} className="decision-panel px-4 py-4">
              <p className="text-sm leading-6 text-slate-700">{note}</p>
            </div>
          ))}
        </div>
      </SectionBlock>
    </div>
  );
}
