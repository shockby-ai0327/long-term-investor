import { Link } from "react-router-dom";
import { AlertList } from "../components/AlertList";
import { DecisionPill } from "../components/DecisionPill";
import { PageHeader } from "../components/PageHeader";
import { SectionBlock } from "../components/SectionBlock";
import {
  getActionDisplay,
  getConfidenceDisplay,
  getMarketEnvironmentDisplay,
  getValuationDisplay
} from "../domain/investment";
import { marketSummary, mockSnapshot } from "../data/mockData";
import { useWorkspaceState } from "../state/WorkspaceStateProvider";

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
      <p className="mt-1.5 text-[1.45rem] font-semibold tracking-tight text-ink-900">{value}</p>
      <p className="mt-1 text-xs leading-5 text-slate-500">{note}</p>
    </div>
  );
}

export function DashboardPage() {
  const { alerts, marketOverview, trackedAnalyses } = useWorkspaceState();
  const marketDisplay = getMarketEnvironmentDisplay(marketOverview.state);
  const confidenceDisplay = getConfidenceDisplay(marketOverview.confidenceLevel);
  const actionDistribution = marketOverview.heuristics.actionDistribution;
  const studyNow = trackedAnalyses.filter((analysis) => analysis.decision.action === "study_now");
  const watch = trackedAnalyses.filter((analysis) => analysis.decision.action === "watch");
  const wait = trackedAnalyses.filter((analysis) =>
    ["wait_for_better_price", "avoid_for_now"].includes(analysis.decision.action)
  );

  return (
    <div className="space-y-4">
      <PageHeader
        eyebrow="Market Overview"
        title="長線策略環境"
        description="先看現在應該提高研究強度，還是維持觀察與等待。"
        meta={
          <>
            <span>{mockSnapshot.label}</span>
            <span>{mockSnapshot.asOfDate}</span>
            <span>{marketOverview.limitedSnapshot ? "limited snapshot" : "decision snapshot"}</span>
          </>
        }
        actions={
          <>
            <Link
              to="/watchlist"
              className="toolbar-button border-ink-900 bg-ink-900 text-white hover:bg-ink-800"
            >
              打開 Watchlist
            </Link>
            <Link
              to="/tracking"
              className="toolbar-button border-slate-300 bg-white text-ink-900 hover:border-slate-400"
            >
              看 Alerts
            </Link>
          </>
        }
      />

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.18fr)_320px]">
        <section className="panel px-4 py-4 sm:px-5">
          <div className="flex flex-wrap items-center gap-2">
            <DecisionPill label={marketDisplay.label} tone={marketDisplay.tone} />
            <DecisionPill label={`信心 ${confidenceDisplay.label}`} tone={confidenceDisplay.tone} />
          </div>
          <h2 className="mt-3 text-[1.4rem] font-semibold tracking-tight text-ink-900">{marketOverview.posture}</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{marketOverview.summary}</p>

          <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <SummaryMetric label="值得研究" value={actionDistribution.study_now} note="現在可升級成優先研究" />
            <SummaryMetric label="持續觀察" value={actionDistribution.watch} note="保留在決策名單" />
            <SummaryMetric
              label="等價格 / 避開"
              value={actionDistribution.wait_for_better_price + actionDistribution.avoid_for_now}
              note="品質與價格尚未同時到位"
            />
            <SummaryMetric label="Active alerts" value={alerts.length} note="需要重新檢查判斷的事件" />
          </div>

          <div className="mt-4 grid gap-3 xl:grid-cols-3">
            <div className="decision-panel px-4 py-3.5">
              <p className="eyebrow-label">Buffett view</p>
              <p className="mt-2 text-sm leading-6 text-slate-700">{marketOverview.buffettView}</p>
            </div>
            <div className="decision-panel px-4 py-3.5">
              <p className="eyebrow-label">Lynch view</p>
              <p className="mt-2 text-sm leading-6 text-slate-700">{marketOverview.lynchView}</p>
            </div>
            <div className="decision-panel px-4 py-3.5">
              <p className="eyebrow-label">策略建議</p>
              <div className="mt-2 space-y-2">
                {marketOverview.recommendations.map((item) => (
                  <p key={item} className="text-sm leading-6 text-slate-700">
                    {item}
                  </p>
                ))}
              </div>
            </div>
          </div>
        </section>

        <aside className="panel px-4 py-4 sm:px-5">
          <div className="border-b border-slate-200/75 pb-3">
            <h2 className="section-title">環境數據</h2>
            <p className="mt-1 muted-copy">只保留本輪 heuristic 會用到的指標。</p>
          </div>

          <div className="mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-1">
            <SummaryMetric
              label="平均總分"
              value={marketOverview.heuristics.averageOverallScore}
              note="整體股票池品質"
            />
            <SummaryMetric
              label="平均估值"
              value={marketOverview.heuristics.averageValuationScore}
              note="目前價格友善度"
            />
            <SummaryMetric
              label="平均穩定度"
              value={marketOverview.heuristics.averageStabilityScore}
              note="風險輪廓是否偏保守"
            />
            <SummaryMetric
              label="樣本數"
              value={marketOverview.heuristics.universeSize}
              note={marketOverview.limitedSnapshot ? "limited snapshot" : "可用 universe"}
            />
          </div>
        </aside>
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <SectionBlock title="值得研究">
          <div className="space-y-3">
            {studyNow.length ? (
              studyNow.map((analysis) => {
                const actionDisplay = getActionDisplay(analysis.decision.action);
                const valuationDisplay = getValuationDisplay(analysis.decision.valuationStatus);

                return (
                  <article key={analysis.stock.id} className="decision-panel px-4 py-3.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-semibold text-ink-900">
                        {analysis.stock.ticker} {analysis.stock.companyName}
                      </p>
                      <DecisionPill label={actionDisplay.label} tone={actionDisplay.tone} />
                      <DecisionPill label={valuationDisplay.label} tone={valuationDisplay.tone} />
                    </div>
                    <p className="mt-2 text-sm leading-6 text-slate-700">{analysis.decision.summary}</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <Link
                        to={`/stocks/${analysis.stock.ticker}`}
                        className="toolbar-button border-ink-900 bg-ink-900 text-white hover:bg-ink-800"
                      >
                        看個股
                      </Link>
                    </div>
                  </article>
                );
              })
            ) : (
              <p className="text-sm leading-6 text-slate-600">目前沒有升級成 study_now 的標的。</p>
            )}
          </div>
        </SectionBlock>

        <SectionBlock title="持續觀察">
          <div className="space-y-3">
            {watch.map((analysis) => (
              <article key={analysis.stock.id} className="decision-panel px-4 py-3.5">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-semibold text-ink-900">
                    {analysis.stock.ticker} {analysis.stock.companyName}
                  </p>
                  <DecisionPill label={getActionDisplay(analysis.decision.action).label} tone="neutral" />
                </div>
                <p className="mt-2 text-sm leading-6 text-slate-700">{analysis.decision.whyNow}</p>
              </article>
            ))}
          </div>
        </SectionBlock>

        <SectionBlock title="先不要急">
          <div className="space-y-3">
            {wait.map((analysis) => (
              <article key={analysis.stock.id} className="decision-panel px-4 py-3.5">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-semibold text-ink-900">
                    {analysis.stock.ticker} {analysis.stock.companyName}
                  </p>
                  <DecisionPill
                    label={getActionDisplay(analysis.decision.action).label}
                    tone={getActionDisplay(analysis.decision.action).tone}
                  />
                </div>
                <p className="mt-2 text-sm leading-6 text-slate-700">{analysis.decision.whyNotNow}</p>
              </article>
            ))}
          </div>
        </SectionBlock>
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.1fr)_0.9fr]">
        <SectionBlock
          title="決策清單"
          subtitle="結論先行，理由其次。"
          action={
            <Link to="/watchlist" className="text-sm font-medium text-sage-700">
              進完整 watchlist
            </Link>
          }
        >
          <div className="space-y-0 divide-y divide-slate-200/75">
            {trackedAnalyses.map((analysis) => {
              const actionDisplay = getActionDisplay(analysis.decision.action);
              const valuationDisplay = getValuationDisplay(analysis.decision.valuationStatus);

              return (
                <article key={analysis.stock.id} className="grid gap-3 py-4 lg:grid-cols-[160px_minmax(0,1fr)_200px]">
                  <div>
                    <p className="text-sm font-semibold text-ink-900">{analysis.stock.ticker}</p>
                    <p className="mt-1 text-xs text-slate-500">{analysis.stock.companyName}</p>
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <DecisionPill label={actionDisplay.label} tone={actionDisplay.tone} />
                      <DecisionPill label={valuationDisplay.label} tone={valuationDisplay.tone} />
                    </div>
                    <p className="mt-2 text-sm leading-6 text-slate-700">{analysis.decision.summary}</p>
                    <p className="mt-1 text-xs leading-5 text-slate-500">{analysis.decision.reasons.join(" ")}</p>
                  </div>
                  <div className="flex items-start justify-between gap-3 lg:justify-end">
                    <div className="text-right">
                      <p className="text-[1.1rem] font-semibold tracking-tight text-ink-900">{analysis.overallScore}</p>
                      <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">overall</p>
                    </div>
                    <Link
                      to={`/stocks/${analysis.stock.ticker}`}
                      className="toolbar-button border-slate-300 bg-white text-ink-900 hover:border-slate-400"
                    >
                      查看
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        </SectionBlock>

        <SectionBlock title="決策提醒">
          <AlertList alerts={alerts.slice(0, 4)} emptyLabel="目前沒有新的 active alerts。" />

          <div className="mt-4 border-t border-slate-200/75 pt-4">
            <p className="eyebrow-label">補充快照</p>
            <div className="mt-3 space-y-3">
              {marketSummary.map((item) => (
                <article key={item.id} className="decision-panel px-4 py-3.5">
                  <p className="text-sm font-semibold text-ink-900">{item.title}</p>
                  <p className="mt-1 text-sm leading-6 text-slate-700">{item.implication}</p>
                </article>
              ))}
            </div>
          </div>
        </SectionBlock>
      </div>
    </div>
  );
}
