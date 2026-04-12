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
import { cashPosition, portfolioHoldings, portfolioNotes } from "../data/mockData";
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
        return "先回到估值區與合理帶，確認是否還適合新增資金。";
      case "overall_score_change":
        return "先看評分拆解，再決定這次變動是否真的改變持有理由。";
      case "stability_deterioration":
        return "先處理風險與集中度，必要時下修這檔在組合中的耐受度。";
      case "data_update_reprice":
        return "把事件後變化寫回投資假設，再決定部位節奏。";
      case "style_fit":
        return "重看這檔目前更適合哪種研究框架，不把好公司直接等同好配置。";
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
    return "這檔已是核心部位，先確認 thesis 是否仍支撐高集中度。";
  }

  return "維持持有，按節奏回頭檢查估值、風險與投資假設。";
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
      <p className="mt-1 text-[1.3rem] font-semibold tracking-tight text-ink-900">{value}</p>
      <p className="mt-1 text-xs leading-5 text-slate-500">{note}</p>
    </div>
  );
}

function AllocationRow({ label, weight, accent = "bg-ink-900" }: { label: string; weight: number; accent?: string }) {
  return (
    <div className="decision-row grid-cols-[minmax(0,1fr)_64px] items-center">
      <div className="min-w-0">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm font-medium text-ink-900">{label}</p>
          <p className="text-sm font-medium text-slate-700">{weight}%</p>
        </div>
        <div className="mt-2 bar-track">
          <div className={`bar-fill ${accent}`} style={{ width: `${weight}%` }} />
        </div>
      </div>
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
        eyebrow="投資組合"
        title="先處理最可能改變配置判斷的部位"
        description="先看集中度、估值與風險提醒，再決定新增資金與檢查順序。"
        actions={
          <>
            <Link
              to="/tracking"
              className="toolbar-button border-slate-300 bg-white text-ink-900 hover:border-slate-400"
            >
              看追蹤工作台
            </Link>
            <Link
              to="/watchlist"
              className="toolbar-button border-ink-900 bg-ink-900 text-white hover:bg-ink-800"
            >
              看觀察名單
            </Link>
          </>
        }
      />

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.16fr)_320px] xl:items-start">
        <SectionBlock
          title="先回頭的部位"
          subtitle="先處理最容易改變配置判斷的持股，不把每一檔都用同樣力氣看。"
          className="self-start"
        >
          <div className="space-y-0 divide-y divide-slate-200/75">
            {reviewQueue.slice(0, 4).map(({ holding, analysis, topAlert, nextStep }, index) => {
              const actionDisplay = getActionDisplay(analysis.decision.action);
              const valuationDisplay = getValuationDisplay(analysis.decision.valuationStatus);
              const confidenceDisplay = getConfidenceDisplay(analysis.decision.confidenceLevel);
              const alertSeverity = topAlert ? getAlertSeverityDisplay(topAlert.severity) : null;

              return (
                <article
                  key={holding.id}
                  className="decision-row xl:grid-cols-[56px_160px_minmax(0,1fr)_210px] xl:items-start"
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-300 bg-white text-sm font-semibold text-ink-900">
                    {index + 1}
                  </div>

                  <div>
                    <Badge tone={getPriorityTone(holding, analysis, topAlert)}>{getPriorityLabel(holding, analysis, topAlert)}</Badge>
                    <p className="mt-2 text-sm font-semibold text-ink-900">{holding.ticker}</p>
                    <p className="mt-1 text-sm text-slate-600">{holding.companyName}</p>
                    <p className="mt-1 text-xs text-slate-500">權重 {holding.weight}%</p>
                  </div>

                  <div className="min-w-0">
                    <div className="flex flex-wrap gap-2">
                      <DecisionPill label={actionDisplay.label} tone={actionDisplay.tone} size="sm" />
                      <DecisionPill label={valuationDisplay.label} tone={valuationDisplay.tone} size="sm" />
                      <DecisionPill label={`信心 ${confidenceDisplay.label}`} tone={confidenceDisplay.tone} size="sm" />
                      {alertSeverity ? <DecisionPill label={alertSeverity.label} tone={alertSeverity.tone} size="sm" /> : null}
                    </div>
                    <p className="mt-2 text-sm font-medium leading-6 text-ink-900">{analysis.decision.summary}</p>
                    <p className="mt-1 text-xs leading-5 text-slate-600">{analysis.decision.whyNotNow}</p>
                    <p className="mt-1 text-xs leading-5 text-slate-500">{nextStep}</p>
                  </div>

                  <div className="space-y-2">
                    <Link
                      to={`/stocks/${holding.ticker}`}
                      className="toolbar-button w-full border-ink-900 bg-ink-900 text-white hover:bg-ink-800"
                    >
                      看個股
                    </Link>
                    <Link
                      to={`/thesis/${holding.ticker}`}
                      className="toolbar-button w-full border-slate-300 bg-white text-ink-900 hover:border-slate-400"
                    >
                      看投資假設
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        </SectionBlock>

        <aside className="workspace-rail self-start">
          <div className="border-b border-slate-200/75 pb-2.5">
            <h2 className="section-title">配置摘要</h2>
            <p className="mt-1 compact-note">先掃過總值、集中度與主要曝險，再決定資金要往哪裡放。</p>
          </div>

          <div className="mt-3 grid gap-2 sm:grid-cols-2 xl:grid-cols-1">
            <SummaryMetric label="組合總值" value={formatCurrency(totalValue)} note={`已投資 ${formatCurrency(investedValue)}`} />
            <SummaryMetric label="需回頭部位" value={reviewNeededCount} note="集中、估值偏高或有新警示" />
            <SummaryMetric label="前三大持股" value={`${topThreeWeight}%`} note="集中度決定檢查頻率" />
            <SummaryMetric label="現金部位" value={`${cashPosition.weight}%`} note="保留給更佳風險報酬比" />
          </div>

          <div className="mt-3 space-y-3">
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
                  size="sm"
                />
                <DecisionPill
                  label={getValuationDisplay(topHoldingAnalysis.decision.valuationStatus).label}
                  tone={getValuationDisplay(topHoldingAnalysis.decision.valuationStatus).tone}
                  size="sm"
                />
              </div>
            </div>

            <div className="decision-panel px-4 py-3.5">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-medium text-ink-900">動作分布</p>
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
                  <p className="text-slate-700">等價格 / 暫避</p>
                  <p className="font-medium text-ink-900">{actionDistribution.waitOrAvoid}</p>
                </div>
              </div>
            </div>

            <div className="decision-panel px-4 py-3.5">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-medium text-ink-900">主要曝險</p>
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
        subtitle="每列都只回答三件事：目前怎麼看、為什麼還持有、下一個檢查點在哪。"
      >
        <div className="space-y-0 divide-y divide-slate-200/75">
          {holdingsWithAnalysis.map(({ holding, analysis, topAlert, gainValue, gainPercent, nextStep }) => {
            const actionDisplay = getActionDisplay(analysis.decision.action);
            const valuationDisplay = getValuationDisplay(analysis.decision.valuationStatus);
            const confidenceDisplay = getConfidenceDisplay(analysis.decision.confidenceLevel);

            return (
              <article
                key={holding.id}
                className="decision-row xl:grid-cols-[150px_118px_168px_minmax(0,1fr)_210px] xl:items-start"
              >
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-ink-900">{holding.ticker}</p>
                  <p className="mt-1 text-sm text-slate-600">{holding.companyName}</p>
                  <p className="mt-1 text-xs text-slate-500">{holding.sector} / {holding.region}</p>
                </div>

                <div>
                  <p className="text-[1.06rem] font-semibold tracking-tight text-ink-900">{holding.weight}%</p>
                  <p className="mt-1 text-xs text-slate-500">{formatCurrency(holding.marketValue)}</p>
                  <p
                    className={`mt-1 text-xs ${
                      getPnLTone(gainPercent) === "positive"
                        ? "text-emerald-700"
                        : getPnLTone(gainPercent) === "negative"
                          ? "text-rose-700"
                          : "text-slate-600"
                    }`}
                  >
                    未實現 {gainValue >= 0 ? "+" : ""}
                    {formatCurrency(gainValue)} / {gainValue >= 0 ? "+" : ""}
                    {formatPercent(gainPercent)}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2 xl:flex-col xl:items-start">
                  <DecisionPill label={actionDisplay.label} tone={actionDisplay.tone} size="sm" />
                  <DecisionPill label={valuationDisplay.label} tone={valuationDisplay.tone} size="sm" />
                  <DecisionPill label={`信心 ${confidenceDisplay.label}`} tone={confidenceDisplay.tone} size="sm" />
                  {topAlert ? (
                    <DecisionPill
                      label={getAlertSeverityDisplay(topAlert.severity).label}
                      tone={getAlertSeverityDisplay(topAlert.severity).tone}
                      size="sm"
                    />
                  ) : (
                    <DecisionPill label="暫無新警示" tone="neutral" size="sm" />
                  )}
                </div>

                <div className="min-w-0">
                  <p className="text-sm font-medium leading-6 text-ink-900">{analysis.decision.summary}</p>
                  <p className="mt-1 text-xs leading-5 text-slate-600">
                    <span className="font-medium text-slate-700">持有理由：</span>
                    {analysis.decision.whyNow}
                  </p>
                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    <span className="font-medium text-slate-700">限制：</span>
                    {analysis.decision.whyNotNow}
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="rounded-lg border border-slate-200/75 bg-slate-50/70 px-3 py-2.5">
                    <p className="eyebrow-label">下一個檢查點</p>
                    <p className="mt-1.5 text-xs leading-5 text-slate-700">{nextStep}</p>
                  </div>
                  <div className="flex flex-wrap gap-2 xl:justify-end">
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
                      看假設
                    </Link>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </SectionBlock>

      <div className="grid gap-4 lg:grid-cols-2">
        <SectionBlock title="產業配置" subtitle="先確認是否把太多風險壓在同一種經濟驅動。">
          <div className="space-y-0 divide-y divide-slate-200/75">
            {Object.entries(sectorAllocation)
              .sort(([, left], [, right]) => right - left)
              .map(([sector, weight]) => (
                <AllocationRow key={sector} label={sector} weight={weight} />
              ))}
          </div>
        </SectionBlock>

        <SectionBlock title="地區配置" subtitle="地區暴露要和政策、匯率與供應鏈一起看。">
          <div className="space-y-0 divide-y divide-slate-200/75">
            {Object.entries(regionAllocation)
              .sort(([, left], [, right]) => right - left)
              .map(([region, weight]) => (
                <AllocationRow key={region} label={region} weight={weight} accent="bg-rust-500" />
              ))}
          </div>
        </SectionBlock>
      </div>

      <SectionBlock title="配置原則" subtitle="保留配置理由，避免最後只剩下持股與漲跌幅。">
        <div className="space-y-0 divide-y divide-slate-200/75">
          {portfolioNotes.map((note) => (
            <article key={note} className="decision-row xl:grid-cols-[120px_minmax(0,1fr)] xl:items-start">
              <p className="eyebrow-label">配置理由</p>
              <p className="text-sm leading-6 text-slate-700">{note}</p>
            </article>
          ))}
        </div>
      </SectionBlock>
    </div>
  );
}
