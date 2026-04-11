import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { AlertList } from "../components/AlertList";
import { DecisionPill } from "../components/DecisionPill";
import { PageHeader } from "../components/PageHeader";
import { SectionBlock } from "../components/SectionBlock";
import {
  getActionDisplay,
  getConfidenceDisplay,
  getValuationDisplay
} from "../domain/investment";
import { useWorkspaceState } from "../state/WorkspaceStateProvider";
import { formatDate } from "../utils/format";

type SortKey = "score" | "valuation" | "updated";

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

export function WatchlistPage() {
  const {
    alertHistory,
    trackedAnalyses,
    toggleWatchlistTracking,
    watchlistUniverse
  } = useWorkspaceState();
  const [query, setQuery] = useState("");
  const [actionFilter, setActionFilter] = useState("all");
  const [valuationFilter, setValuationFilter] = useState("all");
  const [sortBy, setSortBy] = useState<SortKey>("score");

  const filteredAnalyses = useMemo(() => {
    const items = trackedAnalyses.filter((analysis) => {
      const matchesQuery =
        !query ||
        analysis.stock.ticker.toLowerCase().includes(query.toLowerCase()) ||
        analysis.stock.companyName.toLowerCase().includes(query.toLowerCase());
      const matchesAction = actionFilter === "all" || analysis.decision.action === actionFilter;
      const matchesValuation =
        valuationFilter === "all" || analysis.decision.valuationStatus === valuationFilter;

      return matchesQuery && matchesAction && matchesValuation;
    });

    return items.sort((left, right) => {
      if (sortBy === "valuation") {
        return right.valuationScore - left.valuationScore;
      }

      if (sortBy === "updated") {
        return right.stock.lastReviewed.localeCompare(left.stock.lastReviewed);
      }

      return right.overallScore - left.overallScore;
    });
  }, [actionFilter, query, sortBy, trackedAnalyses, valuationFilter]);

  const removedItems = watchlistUniverse.filter((item) => !item.isTracked);
  const topStudy = trackedAnalyses.filter((analysis) => analysis.decision.action === "study_now");
  const watchOnly = trackedAnalyses.filter((analysis) => analysis.decision.action === "watch");
  const waitOrAvoid = trackedAnalyses.filter((analysis) =>
    ["wait_for_better_price", "avoid_for_now"].includes(analysis.decision.action)
  );

  return (
    <div className="space-y-4">
      <PageHeader
        eyebrow="Watchlist"
        title="決策 Watchlist"
        description="先回答哪些值得研究，哪些只能觀察，哪些先不要碰。"
        actions={
          <>
            <Link
              to="/"
              className="toolbar-button border-slate-300 bg-white text-ink-900 hover:border-slate-400"
            >
              看市場總覽
            </Link>
            <Link
              to="/tracking"
              className="toolbar-button border-ink-900 bg-ink-900 text-white hover:bg-ink-800"
            >
              看 Alerts
            </Link>
          </>
        }
      />

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.14fr)_320px]">
        <section className="panel px-4 py-4 sm:px-5">
          <div className="grid gap-3 sm:grid-cols-3">
            <SummaryMetric label="值得研究" value={topStudy.length} note={topStudy.map((item) => item.stock.ticker).join("、") || "目前無"} />
            <SummaryMetric label="持續觀察" value={watchOnly.length} note={watchOnly.map((item) => item.stock.ticker).join("、") || "目前無"} />
            <SummaryMetric label="先不要碰" value={waitOrAvoid.length} note={waitOrAvoid.map((item) => item.stock.ticker).join("、") || "目前無"} />
          </div>

          <div className="mt-4 grid gap-3 border-t border-slate-200/75 pt-4 lg:grid-cols-[minmax(0,1fr)_170px_170px_140px]">
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="搜尋 ticker / 公司名"
              className="field-shell"
            />
            <select value={actionFilter} onChange={(event) => setActionFilter(event.target.value)} className="field-shell">
              <option value="all">全部 action</option>
              <option value="study_now">值得研究</option>
              <option value="watch">持續觀察</option>
              <option value="wait_for_better_price">等更佳價格</option>
              <option value="avoid_for_now">先不要碰</option>
              <option value="insufficient_data">資料不足</option>
            </select>
            <select
              value={valuationFilter}
              onChange={(event) => setValuationFilter(event.target.value)}
              className="field-shell"
            >
              <option value="all">全部估值</option>
              <option value="undervalued">低估</option>
              <option value="fair">合理</option>
              <option value="overvalued">高估</option>
              <option value="insufficient_data">資料不足</option>
            </select>
            <select value={sortBy} onChange={(event) => setSortBy(event.target.value as SortKey)} className="field-shell">
              <option value="score">依分數</option>
              <option value="valuation">依估值分數</option>
              <option value="updated">依更新時間</option>
            </select>
          </div>
        </section>

        <aside className="panel px-4 py-4 sm:px-5">
          <div className="border-b border-slate-200/75 pb-3">
            <h2 className="section-title">Alert state</h2>
            <p className="mt-1 muted-copy">前端顯示的是規則觸發結果，不是即時推播。</p>
          </div>
          <div className="mt-4">
            <AlertList alerts={alertHistory.slice(0, 3)} emptyLabel="目前沒有新的 watchlist alerts。" />
          </div>
        </aside>
      </div>

      <SectionBlock title="決策清單" subtitle="每列都直接回答現在該不該升級研究。">
        <div className="space-y-0 divide-y divide-slate-200/75">
          {filteredAnalyses.map((analysis) => {
            const actionDisplay = getActionDisplay(analysis.decision.action);
            const valuationDisplay = getValuationDisplay(analysis.decision.valuationStatus);
            const confidenceDisplay = getConfidenceDisplay(analysis.decision.confidenceLevel);
            const topAlert = analysis.alerts[0];

            return (
              <article key={analysis.stock.id} className="grid gap-4 py-4 xl:grid-cols-[160px_110px_110px_120px_150px_minmax(0,1fr)_200px] xl:items-start">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-ink-900">{analysis.stock.ticker}</p>
                  <p className="mt-1 text-sm text-slate-600">{analysis.stock.companyName}</p>
                  <p className="mt-1 text-xs text-slate-500">更新於 {formatDate(analysis.stock.lastReviewed)}</p>
                </div>

                <div>
                  <p className="eyebrow-label">Overall</p>
                  <p className="mt-1.5 text-[1.15rem] font-semibold tracking-tight text-ink-900">{analysis.overallScore}</p>
                  <p className="mt-1 text-xs text-slate-500">Buffett {analysis.decision.buffettFit.toFixed(0)}</p>
                  <p className="text-xs text-slate-500">Lynch {analysis.decision.lynchFit.toFixed(0)}</p>
                </div>

                <div>
                  <p className="eyebrow-label">Valuation</p>
                  <div className="mt-1.5">
                    <DecisionPill label={valuationDisplay.label} tone={valuationDisplay.tone} />
                  </div>
                </div>

                <div>
                  <p className="eyebrow-label">Action</p>
                  <div className="mt-1.5">
                    <DecisionPill label={actionDisplay.label} tone={actionDisplay.tone} />
                  </div>
                </div>

                <div>
                  <p className="eyebrow-label">Alert state</p>
                  <div className="mt-1.5 flex flex-wrap gap-2">
                    {topAlert ? (
                      <DecisionPill label={topAlert.state === "active" ? "Active" : "Monitoring"} tone={topAlert.severity} />
                    ) : (
                      <DecisionPill label="Clear" tone="neutral" />
                    )}
                    <DecisionPill label={`信心 ${confidenceDisplay.label}`} tone={confidenceDisplay.tone} />
                  </div>
                </div>

                <div className="min-w-0">
                  <p className="text-sm font-medium text-ink-900">{analysis.decision.summary}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-700">
                    <span className="font-medium text-ink-900">Why now:</span> {analysis.decision.whyNow}
                  </p>
                  <p className="mt-1 text-sm leading-6 text-slate-600">
                    <span className="font-medium text-ink-900">Why not now:</span> {analysis.decision.whyNotNow}
                  </p>
                </div>

                <div className="flex flex-col gap-2">
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
                    看 Thesis
                  </Link>
                  <button
                    type="button"
                    onClick={() => toggleWatchlistTracking(analysis.workspaceWatchlist?.id ?? "")}
                    className="toolbar-button border-transparent bg-transparent text-slate-600 hover:border-slate-200 hover:bg-white"
                  >
                    移出 watchlist
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </SectionBlock>

      {removedItems.length ? (
        <SectionBlock title="未追蹤名單" subtitle="移出後仍保留在本地 universe，可隨時加回。">
          <div className="grid gap-3 lg:grid-cols-2">
            {removedItems.map((item) => (
              <article key={item.id} className="decision-panel flex items-center justify-between gap-3 px-4 py-3.5">
                <div>
                  <p className="text-sm font-semibold text-ink-900">
                    {item.ticker} {item.companyName}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">{item.nextCatalyst}</p>
                </div>
                <button
                  type="button"
                  onClick={() => toggleWatchlistTracking(item.id)}
                  className="toolbar-button border-slate-300 bg-white text-ink-900 hover:border-slate-400"
                >
                  加回 watchlist
                </button>
              </article>
            ))}
          </div>
        </SectionBlock>
      ) : null}
    </div>
  );
}
