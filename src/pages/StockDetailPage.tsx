import { Link, useParams } from "react-router-dom";
import { AlertList } from "../components/AlertList";
import { DecisionPill } from "../components/DecisionPill";
import { MetricCard } from "../components/MetricCard";
import { PageHeader } from "../components/PageHeader";
import { ScoreRow } from "../components/ScoreRow";
import { SectionBlock } from "../components/SectionBlock";
import { Sparkline } from "../components/Sparkline";
import { ValuationBand } from "../components/ValuationBand";
import {
  getActionDisplay,
  getConfidenceDisplay,
  getFitDisplay,
  getValuationDisplay
} from "../domain/investment";
import { stocks } from "../data/mockData";
import { useWorkspaceState } from "../state/WorkspaceStateProvider";
import { formatBillion, formatCurrency, formatDate, formatPercent } from "../utils/format";

function getRiskTone(level: "低" | "中" | "高") {
  if (level === "低") return "positive" as const;
  if (level === "中") return "neutral" as const;
  return "negative" as const;
}

export function StockDetailPage() {
  const params = useParams();
  const { getAnalysisByTicker } = useWorkspaceState();
  const analysis = getAnalysisByTicker(params.ticker);
  const stock = analysis.stock;
  const actionDisplay = getActionDisplay(analysis.decision.action);
  const valuationDisplay = getValuationDisplay(analysis.decision.valuationStatus);
  const confidenceDisplay = getConfidenceDisplay(analysis.decision.confidenceLevel);
  const buffettDisplay = getFitDisplay(analysis.styleFit.buffett.level);
  const lynchDisplay = getFitDisplay(analysis.styleFit.lynch.level);

  return (
    <div className="space-y-4">
      <div className="panel overflow-x-auto p-1.5">
        <div className="flex min-w-max gap-1.5">
          {stocks.map((candidate) => {
            const active = candidate.ticker === stock.ticker;

            return (
              <Link
                key={candidate.id}
                to={`/stocks/${candidate.ticker}`}
                className={`rounded-[10px] px-3 py-2.5 transition ${
                  active
                    ? "bg-ink-900 text-white"
                    : "border border-transparent bg-white/70 text-ink-900 hover:border-slate-200 hover:bg-white"
                }`}
              >
                <div className="flex items-baseline gap-2">
                  <p className="text-sm font-semibold">{candidate.ticker}</p>
                  <p className={`text-[11px] ${active ? "text-white/70" : "text-slate-500"}`}>
                    {candidate.companyName}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      <PageHeader
        variant="research"
        eyebrow="Stock Decision"
        title={`${stock.companyName} · ${stock.ticker}`}
        description={analysis.decision.summary}
        meta={
          <>
            <span>{stock.market}</span>
            <span>{stock.sector}</span>
            <span>{stock.industry}</span>
            <span>最後檢查 {formatDate(stock.lastReviewed)}</span>
          </>
        }
        details={
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
            <MetricCard label="目前價格" value={formatCurrency(stock.currentPrice, stock.currency)} hint={analysis.decision.currentPosition.label} />
            <MetricCard label="Overall" value={analysis.overallScore.toFixed(1)} hint={actionDisplay.label} tone={actionDisplay.tone === "positive" ? "positive" : actionDisplay.tone === "negative" ? "warning" : "default"} />
            <MetricCard label="估值狀態" value={valuationDisplay.label} hint={analysis.decision.currentPosition.valueLabel} tone={valuationDisplay.tone === "positive" ? "positive" : valuationDisplay.tone === "negative" ? "warning" : "default"} />
            <MetricCard label="Buffett fit" value={analysis.decision.buffettFit.toFixed(0)} hint={buffettDisplay.label} />
            <MetricCard label="Lynch fit" value={analysis.decision.lynchFit.toFixed(0)} hint={lynchDisplay.label} />
          </div>
        }
        aside={
          <div className="space-y-4">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <DecisionPill label={actionDisplay.label} tone={actionDisplay.tone} />
                <DecisionPill label={valuationDisplay.label} tone={valuationDisplay.tone} />
                <DecisionPill label={`信心 ${confidenceDisplay.label}`} tone={confidenceDisplay.tone} />
              </div>
              <p className="mt-3 text-sm leading-6 text-slate-600">{analysis.decision.whyNow}</p>
              <p className="mt-1 text-sm leading-6 text-slate-500">{analysis.decision.whyNotNow}</p>
            </div>

            <div className="flex flex-wrap gap-2">
              <Link
                to={`/thesis/${stock.ticker}`}
                className="toolbar-button border-ink-900 bg-ink-900 text-white hover:bg-ink-800"
              >
                更新 Thesis
              </Link>
              <Link
                to="/watchlist"
                className="toolbar-button border-slate-300 bg-white text-ink-900 hover:border-slate-400"
              >
                回 Watchlist
              </Link>
            </div>
          </div>
        }
      />

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-4">
          <SectionBlock title="決策摘要卡">
            <div className="grid gap-4 xl:grid-cols-[minmax(0,1.15fr)_0.85fr]">
              <div className="space-y-3">
                <div className="decision-panel px-4 py-3.5">
                  <p className="eyebrow-label">Summary</p>
                  <p className="mt-2 text-sm leading-6 text-slate-700">{analysis.decision.summary}</p>
                </div>
                <div className="decision-panel px-4 py-3.5">
                  <p className="eyebrow-label">Core reasons</p>
                  <div className="mt-2 space-y-2">
                    {analysis.decision.reasons.map((reason) => (
                      <p key={reason} className="text-sm leading-6 text-slate-700">
                        {reason}
                      </p>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="decision-panel px-4 py-3.5">
                  <p className="eyebrow-label">Target zone</p>
                  <p className="mt-2 text-sm font-medium text-ink-900">{analysis.decision.targetZone.label}</p>
                  <p className="mt-1 text-xs leading-5 text-slate-500">{analysis.decision.currentPosition.label}</p>
                </div>
                <div className="decision-panel px-4 py-3.5">
                  <p className="eyebrow-label">Missing data</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {analysis.decision.missingDataFlags.length ? (
                      analysis.decision.missingDataFlags.map((flag) => (
                        <DecisionPill key={flag} label={flag} tone="info" />
                      ))
                    ) : (
                      <DecisionPill label="none" tone="neutral" />
                    )}
                  </div>
                </div>
              </div>
            </div>
          </SectionBlock>

          <SectionBlock title="Buffett / Lynch">
            <div className="grid gap-4 xl:grid-cols-2">
              <div className="decision-panel px-4 py-3.5">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-semibold text-ink-900">Buffett fit</p>
                  <DecisionPill label={buffettDisplay.label} tone={buffettDisplay.tone} />
                </div>
                <p className="mt-2 text-[1.45rem] font-semibold tracking-tight text-ink-900">
                  {analysis.decision.buffettFit.toFixed(1)}
                </p>
                <div className="mt-3 space-y-2">
                  {analysis.styleFit.buffett.reasons.map((reason) => (
                    <p key={reason} className="text-sm leading-6 text-slate-700">
                      {reason}
                    </p>
                  ))}
                </div>
              </div>

              <div className="decision-panel px-4 py-3.5">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-semibold text-ink-900">Lynch fit</p>
                  <DecisionPill label={lynchDisplay.label} tone={lynchDisplay.tone} />
                </div>
                <p className="mt-2 text-[1.45rem] font-semibold tracking-tight text-ink-900">
                  {analysis.decision.lynchFit.toFixed(1)}
                </p>
                <div className="mt-3 space-y-2">
                  {analysis.styleFit.lynch.reasons.map((reason) => (
                    <p key={reason} className="text-sm leading-6 text-slate-700">
                      {reason}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          </SectionBlock>

          <SectionBlock title="評分拆解">
            <div className="divide-y divide-slate-200/75">
              {analysis.dimensionList.map((dimension) => (
                <div key={dimension.key} className="py-3 first:pt-0 last:pb-0">
                  <ScoreRow label={dimension.label} score={dimension.score} note={`${dimension.summary} / coverage ${dimension.coverage}%`} />
                </div>
              ))}
            </div>
          </SectionBlock>

          <SectionBlock title="關鍵數據">
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <MetricCard label="Revenue CAGR" value={formatPercent(stock.financialMetrics.revenueCagr3Y)} hint={`5Y ${formatPercent(stock.financialMetrics.revenueCagr5Y)} / 10Y ${formatPercent(stock.financialMetrics.revenueCagr10Y)}`} tone="positive" />
              <MetricCard label="EPS CAGR" value={formatPercent(stock.financialMetrics.epsCagr3Y)} hint={`5Y ${formatPercent(stock.financialMetrics.epsCagr5Y)} / 10Y ${formatPercent(stock.financialMetrics.epsCagr10Y)}`} tone="positive" />
              <MetricCard label="ROE" value={formatPercent(stock.financialMetrics.roe)} hint="股東權益報酬" />
              <MetricCard label="ROIC" value={formatPercent(stock.financialMetrics.roic)} hint="資本回收效率" />
              <MetricCard label="Gross margin" value={formatPercent(stock.financialMetrics.grossMargin)} hint="產品與定價結構" />
              <MetricCard label="Operating margin" value={formatPercent(stock.financialMetrics.operatingMargin)} hint="營運效率" />
              <MetricCard label="Debt / equity" value={stock.financialMetrics.debtToEquity.toFixed(2)} hint="槓桿近似" />
              <MetricCard label="FCF" value={formatBillion(stock.financialMetrics.freeCashFlowBillion, stock.currency)} hint="現金流安全邊際" />
            </div>
          </SectionBlock>

          <SectionBlock title="價格與估值區">
            <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_280px]">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="decision-panel p-4">
                  <ValuationBand
                    label="PE"
                    low={stock.valuationMetrics.pe.low}
                    median={stock.valuationMetrics.pe.median}
                    high={stock.valuationMetrics.pe.high}
                    current={stock.valuationMetrics.pe.current}
                  />
                  <div className="mt-4 border-t border-slate-200/75 pt-3">
                    <Sparkline values={stock.valuationMetrics.pe.historical} />
                  </div>
                </div>
                <div className="decision-panel p-4">
                  <ValuationBand
                    label="PB"
                    low={stock.valuationMetrics.pb.low}
                    median={stock.valuationMetrics.pb.median}
                    high={stock.valuationMetrics.pb.high}
                    current={stock.valuationMetrics.pb.current}
                  />
                  <div className="mt-4 border-t border-slate-200/75 pt-3">
                    <Sparkline values={stock.valuationMetrics.pb.historical} stroke="#9c6a49" />
                  </div>
                </div>
                <div className="decision-panel p-4">
                  <ValuationBand
                    label="PEG"
                    low={stock.valuationMetrics.peg.low}
                    median={stock.valuationMetrics.peg.median}
                    high={stock.valuationMetrics.peg.high}
                    current={stock.valuationMetrics.peg.current}
                  />
                  <div className="mt-4 border-t border-slate-200/75 pt-3">
                    <Sparkline values={stock.valuationMetrics.peg.historical} stroke="#2f5c85" />
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="decision-panel px-4 py-3.5">
                  <p className="eyebrow-label">Current position</p>
                  <p className="mt-2 text-sm font-medium text-ink-900">{analysis.decision.currentPosition.label}</p>
                  <p className="mt-1 text-xs leading-5 text-slate-500">{analysis.decision.currentPosition.valueLabel}</p>
                </div>
                <div className="decision-panel px-4 py-3.5">
                  <p className="eyebrow-label">Fair zone</p>
                  <p className="mt-2 text-sm font-medium text-ink-900">{analysis.decision.targetZone.label}</p>
                  <p className="mt-1 text-xs leading-5 text-slate-500">來源：watchlist target range / valuation band</p>
                </div>
                <div className="decision-panel px-4 py-3.5">
                  <p className="eyebrow-label">Valuation stance</p>
                  <p className="mt-2 text-sm leading-6 text-slate-700">{stock.valuationMetrics.summary}</p>
                </div>
              </div>
            </div>
          </SectionBlock>

          <SectionBlock title="風險與監控">
            <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
              <div className="space-y-0 divide-y divide-slate-200/75">
                {[
                  { label: "產業風險", risk: stock.riskProfile.industryCycle },
                  { label: "政策風險", risk: stock.riskProfile.policy },
                  { label: "客戶集中", risk: stock.riskProfile.customerConcentration },
                  { label: "財務壓力", risk: stock.riskProfile.financial }
                ].map(({ label, risk }) => (
                  <div key={label} className="grid gap-2 py-4 md:grid-cols-[120px_minmax(0,1fr)_220px]">
                    <div>
                      <p className="text-sm font-medium text-ink-900">{label}</p>
                      <div className="mt-2">
                        <DecisionPill label={risk.level} tone={getRiskTone(risk.level)} />
                      </div>
                    </div>
                    <p className="text-sm leading-6 text-slate-600">{risk.summary}</p>
                    <p className="text-xs leading-5 text-slate-500">{risk.watchpoint}</p>
                  </div>
                ))}
              </div>

              <div className="space-y-3">
                <div className="decision-panel px-4 py-3.5">
                  <p className="eyebrow-label">Risk flags</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {analysis.decision.riskFlags.length ? (
                      analysis.decision.riskFlags.map((flag) => (
                        <DecisionPill key={flag} label={flag} tone="negative" />
                      ))
                    ) : (
                      <DecisionPill label="none" tone="neutral" />
                    )}
                  </div>
                </div>
                <div className="decision-panel px-4 py-3.5">
                  <p className="eyebrow-label">Top positive drivers</p>
                  <div className="mt-2 space-y-2">
                    {analysis.decision.topPositiveDrivers.map((driver) => (
                      <p key={driver} className="text-sm leading-6 text-slate-700">{driver}</p>
                    ))}
                  </div>
                </div>
                <div className="decision-panel px-4 py-3.5">
                  <p className="eyebrow-label">Top negative drivers</p>
                  <div className="mt-2 space-y-2">
                    {analysis.decision.topNegativeDrivers.map((driver) => (
                      <p key={driver} className="text-sm leading-6 text-slate-700">{driver}</p>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </SectionBlock>

          <SectionBlock title="細節補充">
            <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_0.92fr]">
              <div className="space-y-4">
                <div className="decision-panel px-4 py-3.5">
                  <p className="eyebrow-label">Business model</p>
                  <p className="mt-2 text-sm leading-7 text-slate-700">{stock.businessModel}</p>
                </div>
                <div className="decision-panel px-4 py-3.5">
                  <p className="eyebrow-label">Moat / positioning</p>
                  <div className="mt-2 space-y-2">
                    {stock.positioning.map((point) => (
                      <p key={point} className="text-sm leading-6 text-slate-700">{point}</p>
                    ))}
                  </div>
                </div>
              </div>

              <div className="decision-panel px-4 py-3.5">
                <p className="eyebrow-label">Recent developments</p>
                <div className="mt-3 space-y-3">
                  {stock.recentEvents.map((event) => (
                    <div key={event.id} className="border-b border-slate-200/75 pb-3 last:border-b-0 last:pb-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-medium text-ink-900">{event.title}</p>
                        <p className="text-xs text-slate-500">{formatDate(event.date)}</p>
                      </div>
                      <p className="mt-1 text-sm leading-6 text-slate-600">{event.summary}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </SectionBlock>
        </div>

        <div className="xl:sticky xl:top-4 xl:self-start">
          <div className="panel px-4 py-4 sm:px-5">
            <div className="border-b border-slate-200/75 pb-4">
              <p className="eyebrow-label">Action rail</p>
              <p className="mt-2 text-[1.55rem] font-semibold tracking-tight text-ink-900">{actionDisplay.label}</p>
              <p className="mt-1 text-sm leading-6 text-slate-600">{analysis.decision.summary}</p>
            </div>

            <div className="mt-4 border-b border-slate-200/75 pb-4">
              <p className="eyebrow-label">Active alerts</p>
              <div className="mt-3">
                <AlertList alerts={analysis.alerts} emptyLabel="目前這檔沒有新的 active alerts。" />
              </div>
            </div>

            <div className="mt-4">
              <p className="eyebrow-label">Monitoring</p>
              <div className="mt-3 space-y-3">
                {analysis.reminders.length ? (
                  analysis.reminders.map((reminder) => (
                    <div key={reminder.id} className="decision-panel px-4 py-3.5">
                      <p className="text-sm font-medium text-ink-900">{reminder.title}</p>
                      <p className="mt-1 text-xs leading-5 text-slate-500">{reminder.affectsDecision}</p>
                    </div>
                  ))
                ) : (
                  <div className="decision-panel px-4 py-3.5 text-sm text-slate-600">目前沒有額外提醒。</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
