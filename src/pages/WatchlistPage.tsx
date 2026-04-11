import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { AlertList } from "../components/AlertList";
import { DecisionPill } from "../components/DecisionPill";
import { PageHeader } from "../components/PageHeader";
import { SectionBlock } from "../components/SectionBlock";
import {
  getActionDisplay,
  getAlertIndicatorDisplay,
  getConfidenceDisplay,
  getDecisionSectionDisplay,
  getPrimaryAlert,
  getPriorityPanelDisplay,
  getResearchPriorityScore,
  getValuationDisplay,
  type DecisionAction,
  type StockAnalysisRecord
} from "../domain/investment";
import { useWorkspaceState } from "../state/WorkspaceStateProvider";
import { formatDate } from "../utils/format";

type SortKey = "priority" | "score" | "updated";

const actionOrder: DecisionAction[] = [
  "study_now",
  "watch",
  "wait_for_better_price",
  "avoid_for_now",
  "insufficient_data"
];

function SegmentationMetric({
  label,
  count,
  note,
  active = false,
  onClick
}: {
  label: string;
  count: number;
  note: string;
  active?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`summary-metric text-left transition ${
        active ? "border-ink-900 bg-white" : "hover:border-slate-300"
      }`}
    >
      <p className="eyebrow-label">{label}</p>
      <p className="mt-1 text-[1.18rem] font-semibold tracking-tight text-ink-900">{count}</p>
      <p className="mt-1 text-xs leading-5 text-slate-500">{note}</p>
    </button>
  );
}

function PriorityIdeaCard({
  analysis
}: {
  analysis: StockAnalysisRecord;
}) {
  const actionDisplay = getActionDisplay(analysis.decision.action);
  const valuationDisplay = getValuationDisplay(analysis.decision.valuationStatus);
  const confidenceDisplay = getConfidenceDisplay(analysis.decision.confidenceLevel);
  const alertDisplay = getAlertIndicatorDisplay(getPrimaryAlert(analysis));

  return (
    <article className="decision-panel px-4 py-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-ink-900">
            {analysis.stock.ticker} {analysis.stock.companyName}
          </p>
          <p className="mt-1 text-xs text-slate-500">最後檢查 {formatDate(analysis.stock.lastReviewed)}</p>
        </div>
        <div className="text-right">
          <p className="text-[1.36rem] font-semibold tracking-tight text-ink-900">
            {analysis.overallScore.toFixed(0)}
          </p>
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">
            總分
          </p>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <DecisionPill label={actionDisplay.label} tone={actionDisplay.tone} />
        <DecisionPill label={valuationDisplay.label} tone={valuationDisplay.tone} />
        <DecisionPill label={`信心 ${confidenceDisplay.label}`} tone={confidenceDisplay.tone} />
      </div>

      <p className="mt-3 text-sm font-medium leading-6 text-ink-900">{analysis.decision.summary}</p>
      <p className="mt-1 text-sm leading-6 text-slate-600">{analysis.decision.whyNow}</p>

      <div className="mt-3 grid gap-2 text-xs leading-5 text-slate-500 sm:grid-cols-2">
        <p>
          <span className="font-medium text-slate-700">暫緩點：</span>
          {analysis.decision.whyNotNow}
        </p>
        <p>
          <span className="font-medium text-slate-700">主要警示：</span>
          {alertDisplay.detail}
        </p>
      </div>

        <div className="mt-3 flex flex-wrap gap-2">
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
            看投資假設
          </Link>
        </div>
    </article>
  );
}

function DecisionRow({
  analysis,
  onRemove
}: {
  analysis: StockAnalysisRecord;
  onRemove: () => void;
}) {
  const actionDisplay = getActionDisplay(analysis.decision.action);
  const valuationDisplay = getValuationDisplay(analysis.decision.valuationStatus);
  const confidenceDisplay = getConfidenceDisplay(analysis.decision.confidenceLevel);
  const alertDisplay = getAlertIndicatorDisplay(getPrimaryAlert(analysis));

  return (
    <article className="decision-row xl:grid-cols-[150px_110px_120px_minmax(0,1fr)_176px] xl:items-start">
      <div className="min-w-0">
        <p className="text-sm font-semibold text-ink-900">{analysis.stock.ticker}</p>
        <p className="mt-1 text-sm text-slate-600">{analysis.stock.companyName}</p>
        <p className="mt-1 text-xs text-slate-500">更新於 {formatDate(analysis.stock.lastReviewed)}</p>
      </div>

      <div>
        <p className="text-[1.08rem] font-semibold tracking-tight text-ink-900">
          {analysis.overallScore.toFixed(0)}
        </p>
        <p className="mt-1 text-xs text-slate-500">
          Buffett {analysis.decision.buffettFit.toFixed(0)} / Lynch {analysis.decision.lynchFit.toFixed(0)}
        </p>
      </div>

      <div className="flex flex-wrap gap-2 xl:flex-col xl:items-start">
        <DecisionPill label={actionDisplay.label} tone={actionDisplay.tone} size="sm" />
        <DecisionPill label={valuationDisplay.label} tone={valuationDisplay.tone} size="sm" />
        <DecisionPill label={`信心 ${confidenceDisplay.label}`} tone={confidenceDisplay.tone} size="sm" />
      </div>

      <div className="min-w-0">
        <p className="text-sm font-medium leading-6 text-ink-900">{analysis.decision.summary}</p>
        <p className="mt-1 text-xs leading-5 text-slate-600">
          <span className="font-medium text-slate-700">研究理由：</span>
          {analysis.decision.whyNow}
        </p>
        <p className="mt-1 text-xs leading-5 text-slate-500">
          <span className="font-medium text-slate-700">暫緩點：</span>
          {analysis.decision.whyNotNow}
        </p>
      </div>

      <div className="flex flex-col gap-2 xl:items-end">
        <div className="decision-strip">
          <DecisionPill label={alertDisplay.label} tone={alertDisplay.tone} size="sm" />
          <span>{alertDisplay.detail}</span>
        </div>
        <div className="flex flex-wrap gap-2 xl:justify-end">
          <Link
            to={`/stocks/${analysis.stock.ticker}`}
            className="toolbar-button border-ink-900 bg-ink-900 text-white hover:bg-ink-800"
          >
            個股
          </Link>
          <Link
            to={`/thesis/${analysis.stock.ticker}`}
            className="toolbar-button border-slate-300 bg-white text-ink-900 hover:border-slate-400"
          >
            假設
          </Link>
          <button
            type="button"
            onClick={onRemove}
            className="toolbar-button border-transparent bg-transparent text-slate-600 hover:border-slate-200 hover:bg-white"
          >
            移出
          </button>
        </div>
      </div>
    </article>
  );
}

export function WatchlistPage() {
  const { alertHistory, trackedAnalyses, toggleWatchlistTracking, watchlistUniverse } = useWorkspaceState();
  const [query, setQuery] = useState("");
  const [actionFilter, setActionFilter] = useState("all");
  const [valuationFilter, setValuationFilter] = useState("all");
  const [sortBy, setSortBy] = useState<SortKey>("priority");

  const trackedTickers = useMemo(
    () => new Set(trackedAnalyses.map((analysis) => analysis.stock.ticker)),
    [trackedAnalyses]
  );

  const rankedAnalyses = useMemo(
    () =>
      [...trackedAnalyses].sort(
        (left, right) => getResearchPriorityScore(right) - getResearchPriorityScore(left)
      ),
    [trackedAnalyses]
  );

  const filteredAnalyses = useMemo(() => {
    const items = rankedAnalyses.filter((analysis) => {
      const keyword = query.trim().toLowerCase();
      const matchesQuery =
        !keyword ||
        analysis.stock.ticker.toLowerCase().includes(keyword) ||
        analysis.stock.companyName.toLowerCase().includes(keyword);
      const matchesAction = actionFilter === "all" || analysis.decision.action === actionFilter;
      const matchesValuation =
        valuationFilter === "all" || analysis.decision.valuationStatus === valuationFilter;

      return matchesQuery && matchesAction && matchesValuation;
    });

    return items.sort((left, right) => {
      if (sortBy === "updated") {
        return right.stock.lastReviewed.localeCompare(left.stock.lastReviewed);
      }

      if (sortBy === "score") {
        return right.overallScore - left.overallScore;
      }

      return getResearchPriorityScore(right) - getResearchPriorityScore(left);
    });
  }, [actionFilter, query, rankedAnalyses, sortBy, valuationFilter]);

  const priorityIdeas = rankedAnalyses.slice(0, 2);
  const leadingIdea = priorityIdeas[0];
  const priorityDisplay = leadingIdea ? getPriorityPanelDisplay(leadingIdea) : null;

  const segmentation = actionOrder.map((action) => {
    const display = getDecisionSectionDisplay(action);
    const items = trackedAnalyses.filter((analysis) => analysis.decision.action === action);

    return {
      action,
      display,
      items
    };
  });

  const groupedRows = actionOrder
    .map((action) => ({
      action,
      display: getDecisionSectionDisplay(action),
      items: filteredAnalyses.filter((analysis) => analysis.decision.action === action)
    }))
    .filter((group) => group.items.length > 0);

  const secondaryAlerts = alertHistory
    .filter((alert) => trackedTickers.has(alert.ticker))
    .slice(0, 3);

  const removedItems = watchlistUniverse.filter((item) => !item.isTracked);

  return (
    <div className="space-y-4">
      <PageHeader
        eyebrow="觀察名單"
        title="觀察名單"
        description="先決定研究資源要放在哪些公司，再處理完整名單。"
        actions={
          <>
            <Link
              to="/tracking"
              className="toolbar-button border-slate-300 bg-white text-ink-900 hover:border-slate-400"
            >
              追蹤工作台
            </Link>
            <Link
              to="/"
              className="toolbar-button border-ink-900 bg-ink-900 text-white hover:bg-ink-800"
            >
              市場總覽
            </Link>
          </>
        }
      />

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.2fr)_300px]">
        <section className="panel px-4 py-4 sm:px-5">
          <div className="flex flex-col gap-3 border-b border-slate-200/75 pb-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0">
              <p className="eyebrow-label">本輪優先關注</p>
              <h2 className="mt-1 text-[1.34rem] font-semibold tracking-tight text-ink-900">
                {priorityDisplay?.label ?? "目前沒有可研究標的"}
              </h2>
              <p className="mt-1 text-sm leading-6 text-slate-600">
                {priorityDisplay?.description ?? "目前沒有足夠資料支持明確結論。"}
              </p>
            </div>
            <div className="decision-strip">
              <span>完整名單 {trackedAnalyses.length} 檔</span>
              <span>•</span>
              <span>首要目標是決定先研究誰，而不是先處理管理欄位</span>
            </div>
          </div>

          <div className="mt-4 grid gap-3 xl:grid-cols-2">
            {priorityIdeas.map((analysis) => (
              <PriorityIdeaCard key={analysis.stock.id} analysis={analysis} />
            ))}
          </div>
        </section>

        <aside className="workspace-rail">
          <div className="border-b border-slate-200/75 pb-3">
            <p className="eyebrow-label">決策分層</p>
            <p className="mt-1 text-sm leading-6 text-slate-600">先分出研究優先級，再決定是否往下展開。</p>
          </div>

          <div className="mt-3 grid gap-2">
            {segmentation.map((section) => (
              <SegmentationMetric
                key={section.action}
                label={section.display.label}
                count={section.items.length}
                note={section.display.description}
                active={actionFilter === section.action}
                onClick={() => setActionFilter((current) => (current === section.action ? "all" : section.action))}
              />
            ))}
          </div>
        </aside>
      </div>

      <section className="panel px-4 py-4 sm:px-5">
        <div className="grid gap-3 border-b border-slate-200/75 pb-4 lg:grid-cols-[minmax(0,1fr)_180px_180px_150px]">
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="搜尋 ticker / 公司名"
            className="field-shell"
          />
          <select
            value={valuationFilter}
            onChange={(event) => setValuationFilter(event.target.value)}
            className="field-shell"
          >
            <option value="all">全部估值</option>
            <option value="undervalued">低估 / 可關注</option>
            <option value="fair">合理 / 觀察</option>
            <option value="overvalued">高估 / 先不追價</option>
            <option value="insufficient_data">資料不足</option>
          </select>
          <select
            value={actionFilter}
            onChange={(event) => setActionFilter(event.target.value)}
            className="field-shell"
          >
            <option value="all">全部決策</option>
            <option value="study_now">值得研究</option>
            <option value="watch">持續觀察</option>
            <option value="wait_for_better_price">等更佳價格</option>
            <option value="avoid_for_now">先不要碰</option>
            <option value="insufficient_data">資料不足</option>
          </select>
          <select
            value={sortBy}
            onChange={(event) => setSortBy(event.target.value as SortKey)}
            className="field-shell"
          >
            <option value="priority">依研究優先級</option>
            <option value="score">依總分</option>
            <option value="updated">依更新時間</option>
          </select>
        </div>

        <div className="mt-3 grid gap-3 xl:grid-cols-[minmax(0,1fr)_280px]">
          <div className="decision-strip">
            <span>完整名單 {filteredAnalyses.length} 檔</span>
            <span>•</span>
            <span>每列保留決策必要資訊：結論、理由、估值、限制與信心</span>
          </div>
          <div className="rounded-lg border border-slate-200/75 bg-white/[0.72] px-3 py-2.5">
            <p className="text-xs font-medium text-slate-700">決策提醒</p>
            <p className="mt-1 text-xs leading-5 text-slate-500">
              提醒保留在次要欄位，完整 alert 仍在追蹤工作台處理。
            </p>
          </div>
        </div>
      </section>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_280px]">
        <div className="space-y-5">
          {groupedRows.map((group) => (
            <SectionBlock
              key={group.action}
              title={group.display.label}
              subtitle={group.display.description}
              variant="plain"
              contentClassName="facts-table"
            >
              {group.items.map((analysis) => (
                <DecisionRow
                  key={analysis.stock.id}
                  analysis={analysis}
                  onRemove={() => {
                    if (analysis.workspaceWatchlist?.id) {
                      toggleWatchlistTracking(analysis.workspaceWatchlist.id);
                    }
                  }}
                />
              ))}
            </SectionBlock>
          ))}
        </div>

        <aside className="space-y-4">
          <div className="workspace-rail">
            <div className="border-b border-slate-200/75 pb-3">
              <p className="eyebrow-label">次要提醒</p>
              <p className="mt-1 text-sm leading-6 text-slate-600">只保留最接近決策改變的訊號。</p>
            </div>
            <div className="mt-3">
              <AlertList alerts={secondaryAlerts} variant="compact" emptyLabel="目前沒有新的決策提醒。" />
            </div>
          </div>

          {removedItems.length ? (
            <div className="workspace-rail">
              <div className="border-b border-slate-200/75 pb-3">
                <p className="eyebrow-label">未追蹤名單</p>
                <p className="mt-1 text-sm leading-6 text-slate-600">移出後仍保留在本地 universe，可隨時加回。</p>
              </div>
              <div className="mt-3 space-y-2">
                {removedItems.map((item) => (
                  <article
                    key={item.id}
                    className="rounded-lg border border-slate-200/75 bg-white/[0.76] px-3 py-3"
                  >
                    <p className="text-sm font-medium text-ink-900">
                      {item.ticker} {item.companyName}
                    </p>
                    <p className="mt-1 text-xs leading-5 text-slate-500">{item.nextCatalyst}</p>
                    <button
                      type="button"
                      onClick={() => toggleWatchlistTracking(item.id)}
                      className="mt-2 text-sm font-medium text-sage-700"
                    >
                      加回名單
                    </button>
                  </article>
                ))}
              </div>
            </div>
          ) : null}
        </aside>
      </div>
    </div>
  );
}
