import { Link } from "react-router-dom";
import { AlertList } from "../components/AlertList";
import { DecisionPill } from "../components/DecisionPill";
import { PageHeader } from "../components/PageHeader";
import { SectionBlock } from "../components/SectionBlock";
import {
  getActionDisplay,
  getAlertIndicatorDisplay,
  getConfidenceDisplay,
  getMarketEnvironmentDisplay,
  getPrimaryAlert,
  getResearchPriorityScore,
  getValuationDisplay,
  type StockAnalysisRecord
} from "../domain/investment";
import { marketSummary, mockSnapshot } from "../data/mockData";
import { useWorkspaceState } from "../state/WorkspaceStateProvider";
import { formatDate } from "../utils/format";

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
      <p className="mt-1 text-[1.34rem] font-semibold tracking-tight text-ink-900">{value}</p>
      <p className="mt-1 text-xs leading-5 text-slate-500">{note}</p>
    </div>
  );
}

function PriorityQueueRow({
  analysis,
  rank
}: {
  analysis: StockAnalysisRecord;
  rank: number;
}) {
  const actionDisplay = getActionDisplay(analysis.decision.action);
  const valuationDisplay = getValuationDisplay(analysis.decision.valuationStatus);
  const confidenceDisplay = getConfidenceDisplay(analysis.decision.confidenceLevel);
  const alertDisplay = getAlertIndicatorDisplay(getPrimaryAlert(analysis));

  return (
    <article className="decision-row xl:grid-cols-[56px_180px_minmax(0,1fr)_212px] xl:items-start">
      <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-300 bg-white text-sm font-semibold text-ink-900">
        {rank}
      </div>

      <div className="min-w-0">
        <p className="text-sm font-semibold text-ink-900">{analysis.stock.ticker}</p>
        <p className="mt-1 text-sm text-slate-600">{analysis.stock.companyName}</p>
        <p className="mt-1 text-xs text-slate-500">更新於 {formatDate(analysis.stock.lastReviewed)}</p>
      </div>

      <div className="min-w-0">
        <div className="flex flex-wrap gap-2">
          <DecisionPill label={actionDisplay.label} tone={actionDisplay.tone} size="sm" />
          <DecisionPill label={valuationDisplay.label} tone={valuationDisplay.tone} size="sm" />
          <DecisionPill label={`信心 ${confidenceDisplay.label}`} tone={confidenceDisplay.tone} size="sm" />
        </div>
        <p className="mt-2 text-sm font-medium leading-6 text-ink-900">{analysis.decision.summary}</p>
        <p className="mt-1 text-xs leading-5 text-slate-600">
          <span className="font-medium text-slate-700">現在先看：</span>
          {analysis.decision.whyNow}
        </p>
        <p className="mt-1 text-xs leading-5 text-slate-500">
          <span className="font-medium text-slate-700">暫時卡住：</span>
          {analysis.decision.whyNotNow}
        </p>
      </div>

      <div className="space-y-2">
        <div className="decision-strip">
          <DecisionPill label={alertDisplay.label} tone={alertDisplay.tone} size="sm" />
          <span>{alertDisplay.detail}</span>
        </div>
        <div className="flex flex-wrap gap-2 xl:justify-end">
          <Link
            to={`/stocks/${analysis.stock.ticker}`}
            className="toolbar-button border-ink-900 bg-ink-900 text-white hover:bg-ink-800"
          >
            看個股
          </Link>
          <Link
            to={`/thesis/${analysis.stock.ticker}`}
            className="toolbar-button border-slate-300 bg-white text-ink-900 hover:border-slate-400"
          >
            看假設
          </Link>
        </div>
      </div>
    </article>
  );
}

export function DashboardPage() {
  const { alerts, marketOverview, trackedAnalyses } = useWorkspaceState();
  const marketDisplay = getMarketEnvironmentDisplay(marketOverview.state);
  const confidenceDisplay = getConfidenceDisplay(marketOverview.confidenceLevel);
  const rankedAnalyses = [...trackedAnalyses].sort(
    (left, right) => getResearchPriorityScore(right) - getResearchPriorityScore(left)
  );
  const priorityIdeas = rankedAnalyses.slice(0, 3);
  const nextWave = rankedAnalyses
    .filter((analysis) => analysis.decision.action === "watch")
    .slice(0, 3);
  const holdBack = rankedAnalyses
    .filter((analysis) => ["wait_for_better_price", "avoid_for_now"].includes(analysis.decision.action))
    .slice(0, 3);
  const actionDistribution = marketOverview.heuristics.actionDistribution;

  return (
    <div className="space-y-4">
      <PageHeader
        eyebrow="決策總覽"
        title="今天先把研究順序排好"
        description="先看最值得研究的公司，再判斷整體環境是否支持提高研究強度。"
        meta={
          <>
            <span>{mockSnapshot.label}</span>
            <span>{mockSnapshot.asOfDate}</span>
            <span>{marketOverview.limitedSnapshot ? "有限快照" : "決策快照"}</span>
          </>
        }
        actions={
          <>
            <Link
              to="/watchlist"
              className="toolbar-button border-ink-900 bg-ink-900 text-white hover:bg-ink-800"
            >
              打開觀察名單
            </Link>
            <Link
              to="/tracking"
              className="toolbar-button border-slate-300 bg-white text-ink-900 hover:border-slate-400"
            >
              看追蹤工作台
            </Link>
          </>
        }
      />

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.22fr)_320px] xl:items-start">
        <SectionBlock
          title="本輪先看"
          subtitle="把最可能改變研究優先序的標的放在最前面，不先掉進整張股票清單。"
          className="self-start"
        >
          {priorityIdeas.length ? (
            <div className="space-y-0 divide-y divide-slate-200/75">
              {priorityIdeas.map((analysis, index) => (
                <PriorityQueueRow key={analysis.stock.id} analysis={analysis} rank={index + 1} />
              ))}
            </div>
          ) : (
            <div className="rounded-lg border border-slate-200/80 bg-white/[0.82] px-4 py-3 text-sm text-slate-600">
              目前沒有可研究的標的，先回到觀察名單補資料與重新排序。
            </div>
          )}
        </SectionBlock>

        <aside className="workspace-rail self-start">
          <div className="border-b border-slate-200/75 pb-2.5">
            <h2 className="section-title">關鍵狀態</h2>
            <p className="mt-1 compact-note">先看研究動作分布、策略環境與提醒密度。</p>
          </div>

          <div className="mt-3 grid gap-2 sm:grid-cols-2 xl:grid-cols-1">
            <SummaryMetric label="值得研究" value={actionDistribution.study_now} note="現在值得投入研究時間" />
            <SummaryMetric label="持續觀察" value={actionDistribution.watch} note="保留在候選名單內" />
            <SummaryMetric
              label="等價格 / 暫避"
              value={actionDistribution.wait_for_better_price + actionDistribution.avoid_for_now}
              note="品質或價格仍未同時到位"
            />
            <SummaryMetric label="需處理提醒" value={alerts.filter((alert) => alert.state === "active").length} note="會改變優先序的規則提醒" />
          </div>

          <div className="mt-3 space-y-3">
            <div className="decision-panel px-4 py-3.5">
              <div className="flex flex-wrap items-center gap-2">
                <DecisionPill label={marketDisplay.label} tone={marketDisplay.tone} />
                <DecisionPill label={`信心 ${confidenceDisplay.label}`} tone={confidenceDisplay.tone} />
              </div>
              <p className="mt-2 text-base font-semibold tracking-tight text-ink-900">
                {marketOverview.posture}
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-700">{marketOverview.summary}</p>
            </div>

            <div className="decision-panel px-4 py-3.5">
              <p className="eyebrow-label">本輪限制</p>
              <div className="mt-2 space-y-2">
                {marketOverview.recommendations.slice(0, 2).map((item) => (
                  <p key={item} className="text-sm leading-6 text-slate-700">
                    {item}
                  </p>
                ))}
              </div>
            </div>
          </div>
        </aside>
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] xl:items-start">
        <SectionBlock
          title="下一批觀察"
          subtitle="沒有立刻升級研究的標的，先保留最接近門檻的公司。"
        >
          <div className="space-y-0 divide-y divide-slate-200/75">
            {nextWave.length ? (
              nextWave.map((analysis) => (
                <article
                  key={analysis.stock.id}
                  className="decision-row xl:grid-cols-[150px_minmax(0,1fr)_160px] xl:items-start"
                >
                  <div>
                    <p className="text-sm font-semibold text-ink-900">{analysis.stock.ticker}</p>
                    <p className="mt-1 text-sm text-slate-600">{analysis.stock.companyName}</p>
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium leading-6 text-ink-900">{analysis.decision.summary}</p>
                    <p className="mt-1 text-xs leading-5 text-slate-600">{analysis.decision.whyNow}</p>
                  </div>
                  <div className="flex flex-wrap gap-2 xl:justify-end">
                    <DecisionPill label={getValuationDisplay(analysis.decision.valuationStatus).label} tone={getValuationDisplay(analysis.decision.valuationStatus).tone} size="sm" />
                    <Link
                      to={`/stocks/${analysis.stock.ticker}`}
                      className="toolbar-button border-slate-300 bg-white text-ink-900 hover:border-slate-400"
                    >
                      看個股
                    </Link>
                  </div>
                </article>
              ))
            ) : (
              <p className="text-sm leading-6 text-slate-600">目前沒有額外的觀察標的。</p>
            )}
          </div>
        </SectionBlock>

        <SectionBlock
          title="先不要急著提高強度"
          subtitle="這些標的的限制更清楚，先把研究資源留給風險報酬比更好的公司。"
        >
          <div className="space-y-0 divide-y divide-slate-200/75">
            {holdBack.length ? (
              holdBack.map((analysis) => (
                <article
                  key={analysis.stock.id}
                  className="decision-row xl:grid-cols-[150px_minmax(0,1fr)_160px] xl:items-start"
                >
                  <div>
                    <p className="text-sm font-semibold text-ink-900">{analysis.stock.ticker}</p>
                    <p className="mt-1 text-sm text-slate-600">{analysis.stock.companyName}</p>
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium leading-6 text-ink-900">{analysis.decision.summary}</p>
                    <p className="mt-1 text-xs leading-5 text-slate-600">{analysis.decision.whyNotNow}</p>
                  </div>
                  <div className="flex flex-wrap gap-2 xl:justify-end">
                    <DecisionPill label={getActionDisplay(analysis.decision.action).label} tone={getActionDisplay(analysis.decision.action).tone} size="sm" />
                    <Link
                      to={`/stocks/${analysis.stock.ticker}`}
                      className="toolbar-button border-slate-300 bg-white text-ink-900 hover:border-slate-400"
                    >
                      看個股
                    </Link>
                  </div>
                </article>
              ))
            ) : (
              <p className="text-sm leading-6 text-slate-600">目前沒有需要明確降級研究強度的標的。</p>
            )}
          </div>
        </SectionBlock>
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px] xl:items-start">
        <SectionBlock
          title="策略環境"
          subtitle="只保留會影響研究節奏與安全邊際的解讀。"
          className="self-start"
        >
          <div className="grid gap-3 lg:grid-cols-3">
            <div className="decision-panel px-4 py-3.5">
              <p className="eyebrow-label">Buffett 角度</p>
              <p className="mt-2 text-sm leading-6 text-slate-700">{marketOverview.buffettView}</p>
            </div>
            <div className="decision-panel px-4 py-3.5">
              <p className="eyebrow-label">Lynch 角度</p>
              <p className="mt-2 text-sm leading-6 text-slate-700">{marketOverview.lynchView}</p>
            </div>
            <div className="decision-panel px-4 py-3.5">
              <p className="eyebrow-label">補充快照</p>
              <div className="mt-2 space-y-2">
                {marketSummary.slice(0, 2).map((item) => (
                  <p key={item.id} className="text-sm leading-6 text-slate-700">
                    {item.implication}
                  </p>
                ))}
              </div>
            </div>
          </div>
        </SectionBlock>

        <aside className="workspace-rail self-start">
          <div className="border-b border-slate-200/75 pb-2.5">
            <h2 className="section-title">近期提醒</h2>
            <p className="mt-1 compact-note">提醒退到次要欄位，不和研究順序搶首屏。</p>
          </div>
          <div className="mt-3">
            <AlertList alerts={alerts.slice(0, 4)} variant="compact" emptyLabel="目前沒有新的決策提醒。" />
          </div>
        </aside>
      </div>
    </div>
  );
}
