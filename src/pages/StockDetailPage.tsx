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
  const primaryRisk =
    analysis.decision.riskFlags[0] ??
    analysis.decision.topNegativeDrivers[0] ??
    "目前沒有額外風險旗標。";
  const nextReminder = analysis.reminders[0];

  return (
    <div className="space-y-4">
      <div className="panel overflow-x-auto px-1.5 py-1.5">
        <div className="symbol-switcher">
          {stocks.map((candidate) => {
            const active = candidate.ticker === stock.ticker;

            return (
              <Link
                key={candidate.id}
                to={`/stocks/${candidate.ticker}`}
                className={`symbol-chip ${active ? "bg-ink-900 text-white" : "bg-white/[0.82] text-ink-900 hover:border-slate-300 hover:bg-white"}`}
              >
                <div className="flex items-center gap-2">
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
        eyebrow="個股研究"
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
          <div className="grid gap-2.5 sm:grid-cols-2 xl:grid-cols-5">
            <MetricCard
              label="目前價格"
              value={formatCurrency(stock.currentPrice, stock.currency)}
              hint={analysis.decision.currentPosition.label}
            />
            <MetricCard
              label="總分"
              value={analysis.overallScore.toFixed(0)}
              hint={actionDisplay.label}
              tone={actionDisplay.tone === "positive" ? "positive" : actionDisplay.tone === "negative" ? "warning" : "default"}
            />
            <MetricCard
              label="估值位置"
              value={valuationDisplay.label}
              hint={analysis.decision.currentPosition.valueLabel}
              tone={valuationDisplay.tone === "positive" ? "positive" : valuationDisplay.tone === "negative" ? "warning" : "default"}
            />
            <MetricCard label="Buffett" value={analysis.decision.buffettFit.toFixed(0)} hint={buffettDisplay.label} />
            <MetricCard label="Lynch" value={analysis.decision.lynchFit.toFixed(0)} hint={lynchDisplay.label} />
          </div>
        }
        aside={
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <DecisionPill label={actionDisplay.label} tone={actionDisplay.tone} />
              <DecisionPill label={valuationDisplay.label} tone={valuationDisplay.tone} />
              <DecisionPill label={`信心 ${confidenceDisplay.label}`} tone={confidenceDisplay.tone} />
            </div>

            <div className="rounded-lg border border-slate-200/75 bg-white/[0.72] px-4 py-3.5">
              <p className="eyebrow-label">判斷重點</p>
              <p className="mt-2 text-sm leading-6 text-slate-700">{analysis.decision.whyNow}</p>
              <p className="mt-2 text-xs leading-5 text-slate-500">
                <span className="font-medium text-slate-700">限制：</span>
                {analysis.decision.whyNotNow}
              </p>
            </div>

            <div className="facts-table">
              <div className="facts-row">
                <p className="text-xs font-medium uppercase tracking-[0.16em] text-slate-400">主要風險</p>
                <p className="text-sm leading-6 text-slate-700">{primaryRisk}</p>
              </div>
              <div className="facts-row">
                <p className="text-xs font-medium uppercase tracking-[0.16em] text-slate-400">下一步</p>
                <p className="text-sm leading-6 text-slate-700">
                  {nextReminder ? nextReminder.nextStep : "目前沒有新的追蹤事件。"}
                </p>
              </div>
              <div className="facts-row">
                <p className="text-xs font-medium uppercase tracking-[0.16em] text-slate-400">研究區間</p>
                <p className="text-sm leading-6 text-slate-700">{analysis.decision.targetZone.label}</p>
              </div>
              <div className="facts-row">
                <p className="text-xs font-medium uppercase tracking-[0.16em] text-slate-400">資料缺口</p>
                <p className="text-sm leading-6 text-slate-700">
                  {analysis.decision.missingDataFlags.length
                    ? analysis.decision.missingDataFlags.join("、")
                    : "目前沒有明顯缺口。"}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Link
                to={`/thesis/${stock.ticker}`}
                className="toolbar-button border-ink-900 bg-ink-900 text-white hover:bg-ink-800"
              >
                更新投資假設
              </Link>
              <Link
                to="/watchlist"
                className="toolbar-button border-slate-300 bg-white text-ink-900 hover:border-slate-400"
              >
                回觀察名單
              </Link>
            </div>
          </div>
        }
      />

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_300px]">
        <div className="space-y-5">
          <SectionBlock
            title="核心理由"
            subtitle="先看支持判斷的理由，再看限制與風格框架。"
            variant="plain"
          >
            <div className="grid gap-4 xl:grid-cols-[minmax(0,1.02fr)_0.98fr]">
              <div className="grid gap-3 lg:grid-cols-2">
                <div className="decision-panel px-4 py-3.5">
                  <p className="eyebrow-label">支持判斷</p>
                  <div className="mt-2 space-y-2.5">
                    {analysis.decision.topPositiveDrivers.map((driver) => (
                      <p key={driver} className="text-sm leading-6 text-slate-700">
                        {driver}
                      </p>
                    ))}
                  </div>
                </div>

                <div className="decision-panel px-4 py-3.5">
                  <p className="eyebrow-label">限制與顧慮</p>
                  <div className="mt-2 space-y-2.5">
                    {analysis.decision.topNegativeDrivers.map((driver) => (
                      <p key={driver} className="text-sm leading-6 text-slate-700">
                        {driver}
                      </p>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid gap-3 lg:grid-cols-2">
                <div className="decision-panel px-4 py-3.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-semibold text-ink-900">Buffett 框架</p>
                    <DecisionPill label={buffettDisplay.label} tone={buffettDisplay.tone} size="sm" />
                  </div>
                  <p className="mt-2 text-[1.3rem] font-semibold tracking-tight text-ink-900">
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
                    <p className="text-sm font-semibold text-ink-900">Lynch 框架</p>
                    <DecisionPill label={lynchDisplay.label} tone={lynchDisplay.tone} size="sm" />
                  </div>
                  <p className="mt-2 text-[1.3rem] font-semibold tracking-tight text-ink-900">
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
            </div>
          </SectionBlock>

          <SectionBlock
            title="評分拆解"
            subtitle="每個維度都來自規則與現有資料，不從畫面臨時拼結論。"
            variant="plain"
          >
            <div className="facts-table">
              {analysis.dimensionList.map((dimension) => (
                <ScoreRow
                  key={dimension.key}
                  label={dimension.label}
                  score={dimension.score}
                  note={`${dimension.summary} / coverage ${dimension.coverage}%`}
                />
              ))}
            </div>
          </SectionBlock>

          <SectionBlock
            title="關鍵數據"
            subtitle="估值位置與核心財務指標放在同一層看。"
            variant="plain"
          >
            <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_260px]">
              <div className="grid gap-3 md:grid-cols-3">
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
                    <Sparkline values={stock.valuationMetrics.pb.historical} stroke="#8c6747" />
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
                    <Sparkline values={stock.valuationMetrics.peg.historical} stroke="#395f82" />
                  </div>
                </div>
              </div>

              <div className="workspace-rail">
                <div className="facts-table">
                  <div className="facts-row">
                    <p className="text-xs font-medium uppercase tracking-[0.16em] text-slate-400">目前位置</p>
                    <p className="text-sm leading-6 text-slate-700">{analysis.decision.currentPosition.label}</p>
                  </div>
                  <div className="facts-row">
                    <p className="text-xs font-medium uppercase tracking-[0.16em] text-slate-400">數值</p>
                    <p className="text-sm leading-6 text-slate-700">{analysis.decision.currentPosition.valueLabel}</p>
                  </div>
                  <div className="facts-row">
                    <p className="text-xs font-medium uppercase tracking-[0.16em] text-slate-400">合理帶</p>
                    <p className="text-sm leading-6 text-slate-700">{analysis.decision.targetZone.label}</p>
                  </div>
                  <div className="facts-row">
                    <p className="text-xs font-medium uppercase tracking-[0.16em] text-slate-400">估值結論</p>
                    <p className="text-sm leading-6 text-slate-700">{stock.valuationMetrics.summary}</p>
                  </div>
                  <div className="facts-row">
                    <p className="text-xs font-medium uppercase tracking-[0.16em] text-slate-400">市值</p>
                    <p className="text-sm leading-6 text-slate-700">
                      {formatBillion(stock.marketCapBillion, stock.currency)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 grid gap-2.5 sm:grid-cols-2 xl:grid-cols-4">
              <MetricCard
                label="營收成長"
                value={formatPercent(stock.financialMetrics.revenueCagr3Y)}
                hint={`5Y ${formatPercent(stock.financialMetrics.revenueCagr5Y)} / 10Y ${formatPercent(stock.financialMetrics.revenueCagr10Y)}`}
                tone="positive"
              />
              <MetricCard
                label="EPS 成長"
                value={formatPercent(stock.financialMetrics.epsCagr3Y)}
                hint={`5Y ${formatPercent(stock.financialMetrics.epsCagr5Y)} / 10Y ${formatPercent(stock.financialMetrics.epsCagr10Y)}`}
                tone="positive"
              />
              <MetricCard label="ROE" value={formatPercent(stock.financialMetrics.roe)} hint="股東權益報酬率" />
              <MetricCard label="ROIC" value={formatPercent(stock.financialMetrics.roic)} hint="投入資本效率" />
              <MetricCard label="毛利率" value={formatPercent(stock.financialMetrics.grossMargin)} hint="產品與定價結構" />
              <MetricCard label="營業利益率" value={formatPercent(stock.financialMetrics.operatingMargin)} hint="營運效率" />
              <MetricCard label="負債比" value={stock.financialMetrics.debtToEquity.toFixed(2)} hint="Debt / equity" />
              <MetricCard
                label="自由現金流"
                value={formatBillion(stock.financialMetrics.freeCashFlowBillion, stock.currency)}
                hint="現金流安全邊際"
              />
            </div>
          </SectionBlock>

          <SectionBlock
            title="風險與監控"
            subtitle="先看會破壞 thesis 的項目，再看下一個檢查點。"
            variant="plain"
          >
            <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_300px]">
              <div className="facts-table">
                {[
                  { label: "產業風險", risk: stock.riskProfile.industryCycle },
                  { label: "政策風險", risk: stock.riskProfile.policy },
                  { label: "客戶集中", risk: stock.riskProfile.customerConcentration },
                  { label: "財務壓力", risk: stock.riskProfile.financial }
                ].map(({ label, risk }) => (
                  <div key={label} className="grid gap-2 py-3.5 md:grid-cols-[116px_minmax(0,1fr)_210px]">
                    <div>
                      <p className="text-sm font-medium text-ink-900">{label}</p>
                      <div className="mt-2">
                        <DecisionPill label={risk.level} tone={getRiskTone(risk.level)} size="sm" />
                      </div>
                    </div>
                    <p className="text-sm leading-6 text-slate-700">{risk.summary}</p>
                    <p className="text-xs leading-5 text-slate-500">{risk.watchpoint}</p>
                  </div>
                ))}
              </div>

              <div className="space-y-3">
                <div className="workspace-rail">
                  <p className="eyebrow-label">本輪監控</p>
                  <div className="mt-3 space-y-3">
                    {analysis.reminders.length ? (
                      analysis.reminders.map((reminder) => (
                        <div key={reminder.id} className="border-b border-slate-200/75 pb-3 last:border-b-0 last:pb-0">
                          <p className="text-sm font-medium text-ink-900">{reminder.title}</p>
                          <p className="mt-1 text-xs leading-5 text-slate-500">{reminder.affectsDecision}</p>
                          <p className="mt-1 text-xs leading-5 text-slate-600">{reminder.nextStep}</p>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-slate-600">目前沒有額外提醒。</p>
                    )}
                  </div>
                </div>

                <div className="workspace-rail">
                  <p className="eyebrow-label">風險旗標</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {analysis.decision.riskFlags.length ? (
                      analysis.decision.riskFlags.map((flag) => (
                        <DecisionPill key={flag} label={flag} tone="negative" size="sm" />
                      ))
                    ) : (
                      <DecisionPill label="目前無新增旗標" tone="neutral" size="sm" />
                    )}
                  </div>
                </div>
              </div>
            </div>
          </SectionBlock>

          <SectionBlock
            title="細節補充"
            subtitle="商業模式、收入結構與近期事件都放在支援層。"
            variant="plain"
          >
            <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_0.92fr]">
              <div className="space-y-4">
                <div className="workspace-rail">
                  <p className="eyebrow-label">公司概況</p>
                  <p className="mt-2 text-sm leading-7 text-slate-700">{stock.summary}</p>
                  <p className="mt-3 text-sm leading-7 text-slate-700">{stock.businessModel}</p>
                </div>

                <div className="workspace-rail">
                  <p className="eyebrow-label">收入結構</p>
                  <div className="mt-3 facts-table">
                    {stock.revenueSegments.map((segment) => (
                      <div key={segment.name} className="facts-row">
                        <p className="text-sm font-medium text-ink-900">
                          {segment.name} {segment.share}%
                        </p>
                        <p className="text-sm leading-6 text-slate-600">{segment.detail}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="workspace-rail">
                  <p className="eyebrow-label">產業定位與護城河</p>
                  <div className="mt-3 space-y-3">
                    {stock.moat.map((item) => (
                      <div key={item.label} className="border-b border-slate-200/75 pb-3 last:border-b-0 last:pb-0">
                        <div className="flex items-center justify-between gap-3">
                          <p className="text-sm font-medium text-ink-900">{item.label}</p>
                          <p className="text-sm font-semibold tracking-tight text-ink-900">{item.score}</p>
                        </div>
                        <p className="mt-1 text-sm leading-6 text-slate-600">{item.summary}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="workspace-rail">
                  <p className="eyebrow-label">近期事件</p>
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

                <div className="workspace-rail">
                  <p className="eyebrow-label">產業定位</p>
                  <div className="mt-3 space-y-2.5">
                    {stock.positioning.map((point) => (
                      <p key={point} className="text-sm leading-6 text-slate-600">
                        {point}
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </SectionBlock>
        </div>

        <aside className="space-y-4 xl:sticky xl:top-3 xl:self-start">
          <div className="workspace-rail">
            <div className="border-b border-slate-200/75 pb-3">
              <p className="eyebrow-label">研究摘要欄</p>
              <p className="mt-2 text-[1.4rem] font-semibold tracking-tight text-ink-900">{actionDisplay.label}</p>
              <p className="mt-1 text-sm leading-6 text-slate-600">{analysis.decision.summary}</p>
            </div>

            <div className="mt-3 facts-table">
              <div className="facts-row">
                <p className="text-xs font-medium uppercase tracking-[0.16em] text-slate-400">估值</p>
                <p className="text-sm leading-6 text-slate-700">{valuationDisplay.label}</p>
              </div>
              <div className="facts-row">
                <p className="text-xs font-medium uppercase tracking-[0.16em] text-slate-400">主要理由</p>
                <p className="text-sm leading-6 text-slate-700">{analysis.decision.reasons.join(" ")}</p>
              </div>
              <div className="facts-row">
                <p className="text-xs font-medium uppercase tracking-[0.16em] text-slate-400">主要風險</p>
                <p className="text-sm leading-6 text-slate-700">{primaryRisk}</p>
              </div>
              <div className="facts-row">
                <p className="text-xs font-medium uppercase tracking-[0.16em] text-slate-400">下一步</p>
                <p className="text-sm leading-6 text-slate-700">
                  {nextReminder ? nextReminder.title : "目前沒有新的追蹤事件。"}
                </p>
              </div>
            </div>
          </div>

          <div className="workspace-rail">
            <div className="border-b border-slate-200/75 pb-3">
              <p className="eyebrow-label">決策提醒</p>
              <p className="mt-1 text-sm leading-6 text-slate-600">提醒放在側欄，不和主判斷競爭首屏。</p>
            </div>
            <div className="mt-3">
              <AlertList alerts={analysis.alerts} variant="compact" emptyLabel="目前這檔沒有新的決策提醒。" />
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
