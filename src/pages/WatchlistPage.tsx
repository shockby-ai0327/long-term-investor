import { useState } from "react";
import { Link } from "react-router-dom";
import { Badge } from "../components/Badge";
import { PageHeader } from "../components/PageHeader";
import { SectionBlock } from "../components/SectionBlock";
import { mockSnapshot } from "../data/mockData";
import { useWorkspaceState } from "../state/WorkspaceStateProvider";
import type { ReminderType, WatchlistFocusState, WorkspaceWatchlistItem } from "../types/investment";
import { formatCurrency, formatDate } from "../utils/format";

const allTags = ["全部", "高品質公司", "觀察估值", "等待財報", "研究中", "核心持股", "AI 基建", "半導體設備"];
const focusStates: WatchlistFocusState[] = ["本輪研究", "等待事件", "等待估值", "維持追蹤"];

function getSignalTone(signal: WorkspaceWatchlistItem["valuationSignal"]) {
  if (signal === "偏高觀察") return "critical" as const;
  if (signal === "低估待研究") return "positive" as const;
  return "default" as const;
}

function getFocusTone(focusState: WatchlistFocusState) {
  switch (focusState) {
    case "本輪研究":
      return "warning" as const;
    case "等待事件":
      return "info" as const;
    case "等待估值":
      return "critical" as const;
    default:
      return "default" as const;
  }
}

function getReminderTone(type?: ReminderType) {
  if (type === "估值") return "critical" as const;
  if (type === "Thesis") return "warning" as const;
  if (type === "財報" || type === "營收") return "info" as const;
  return "default" as const;
}

function getResearchAction(item: WorkspaceWatchlistItem) {
  switch (item.focusState) {
    case "本輪研究":
      return "補齊商業模式、競爭優勢與風險，完成一版可檢查的 Thesis。";
    case "等待事件":
      return "先等下一次財報或營收，再依事件結果更新判斷。";
    case "等待估值":
      return "先觀察價格回到目標區間，不急著新增部位。";
    default:
      return "維持追蹤，等更好的價格或新的基本面訊號。";
  }
}

function SummaryMetric({
  label,
  value,
  note,
  tone = "default"
}: {
  label: string;
  value: number | string;
  note: string;
  tone?: "default" | "warning" | "critical" | "info";
}) {
  const toneClassMap = {
    default: "border-slate-200/75 bg-white/80 text-slate-600",
    warning: "border-amber-200/90 bg-amber-50/80 text-amber-800",
    critical: "border-rose-200/90 bg-rose-50/80 text-rose-700",
    info: "border-sky-200/90 bg-sky-50/80 text-sky-700"
  };

  return (
    <div className={`rounded-xl border px-3.5 py-3 ${toneClassMap[tone]}`}>
      <p className="text-[10px] font-semibold uppercase tracking-[0.22em]">{label}</p>
      <p className="mt-1.5 text-[1.6rem] font-semibold tracking-tight text-ink-900">{value}</p>
      <p className="mt-1 text-sm leading-5 text-slate-600">{note}</p>
    </div>
  );
}

export function WatchlistPage() {
  const { reminders, setWatchlistFocus, watchlist } = useWorkspaceState();
  const [selectedTag, setSelectedTag] = useState("全部");
  const [sortBy, setSortBy] = useState("focus");

  const filteredItems = watchlist.filter(
    (item) => selectedTag === "全部" || item.tags.includes(selectedTag)
  );

  const sortedItems = [...filteredItems].sort((left, right) => {
    if (sortBy === "valuation") {
      const order = {
        偏高觀察: 0,
        合理區間: 1,
        低估待研究: 2
      };

      return order[left.valuationSignal] - order[right.valuationSignal];
    }

    if (sortBy === "reviewed") {
      return left.lastReviewed.localeCompare(right.lastReviewed);
    }

    const order = {
      本輪研究: 0,
      等待事件: 1,
      等待估值: 2,
      維持追蹤: 3
    };

    if (left.focusState !== right.focusState) {
      return order[left.focusState] - order[right.focusState];
    }

    return left.lastReviewed.localeCompare(right.lastReviewed);
  });

  const summaryCounts = {
    focus: watchlist.filter((item) => item.focusState === "本輪研究").length,
    event: watchlist.filter((item) => item.focusState === "等待事件").length,
    valuation: watchlist.filter((item) => item.focusState === "等待估值").length,
    passive: watchlist.filter((item) => item.focusState === "維持追蹤").length
  };
  const oldestReview = [...watchlist].sort((left, right) => left.lastReviewed.localeCompare(right.lastReviewed))[0]!;
  const groupedBoards = focusStates.map((state) => ({
    title: state,
    tone: getFocusTone(state),
    items: watchlist.filter((item) => item.focusState === state)
  }));

  return (
    <div className="space-y-4">
      <PageHeader
        eyebrow="Watchlist"
        title="觀察名單工作台"
        description="觀察名單不是候選買點清單，而是研究隊列。先標記這輪要研究誰、等什麼事件、目前該做什麼。"
        actions={
          <>
            <Link
              to="/tracking"
              className="rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm font-medium text-ink-900 transition hover:border-slate-400"
            >
              看追蹤工作台
            </Link>
            <Link
              to="/stocks/MSFT"
              className="rounded-lg border border-ink-900 bg-ink-900 px-3.5 py-2 text-sm font-medium text-white transition hover:bg-ink-800"
            >
              看個股分析
            </Link>
          </>
        }
      />

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.18fr)_350px]">
        <SectionBlock
          title="研究隊列"
          subtitle={`先看哪一檔該回到研究流程，篩選與排序都只服務 ${mockSnapshot.asOfDate} 的研究工作節奏。`}
        >
          <div className="mb-4 flex flex-col gap-3 border-b border-slate-200/75 pb-3 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex flex-wrap gap-2">
              {allTags.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => setSelectedTag(tag)}
                  className={`rounded-lg border px-3 py-2 text-sm transition ${
                    selectedTag === tag
                      ? "border-ink-900 bg-ink-900 text-white"
                      : "border-slate-200 bg-white text-ink-900 hover:border-slate-300"
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>

            <label className="flex items-center gap-3 text-sm text-slate-600">
              排序方式
              <select
                value={sortBy}
                onChange={(event) => setSortBy(event.target.value)}
                className="field-shell w-[190px]"
              >
                <option value="focus">工作標記</option>
                <option value="valuation">估值訊號</option>
                <option value="reviewed">最久未檢查</option>
              </select>
            </label>
          </div>

          <div className="space-y-3">
            {sortedItems.map((item) => {
              const nextReminder = reminders
                .filter((reminder) => reminder.ticker === item.ticker && reminder.progress !== "已完成")
                .sort((left, right) => left.date.localeCompare(right.date))[0];

              return (
                <article key={item.id} className="rounded-xl border border-slate-200/75 bg-white/84 px-4 py-4">
                  <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,0.82fr)_190px] xl:items-start">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-base font-semibold text-ink-900">
                          {item.companyName} ({item.ticker})
                        </p>
                        <Badge tone={getFocusTone(item.focusState)}>{item.focusState}</Badge>
                        <Badge tone={getSignalTone(item.valuationSignal)}>{item.valuationSignal}</Badge>
                      </div>
                      <p className="mt-2 text-sm leading-6 text-slate-700">{item.nextCatalyst}</p>
                      <p className="mt-1 text-sm text-slate-500">最近檢查 {formatDate(item.lastReviewed)}</p>

                      <div className="mt-3 rounded-lg border border-slate-200/75 bg-slate-50/70 px-3.5 py-3">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-500">
                          現在該做什麼
                        </p>
                        <p className="mt-1.5 text-sm leading-6 text-ink-900">{getResearchAction(item)}</p>
                      </div>
                    </div>

                    <div className="grid gap-2">
                      <div className="rounded-lg border border-slate-200/75 bg-slate-50/70 px-3.5 py-3">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-500">
                          下一個事件
                        </p>
                        {nextReminder ? (
                          <>
                            <div className="mt-1.5 flex flex-wrap items-center gap-2">
                              <Badge tone={getReminderTone(nextReminder.type)}>{nextReminder.type}</Badge>
                              <p className="text-sm font-medium text-ink-900">{nextReminder.title}</p>
                            </div>
                            <p className="mt-2 text-sm text-slate-700">{formatDate(nextReminder.date)}</p>
                          </>
                        ) : (
                          <p className="mt-1.5 text-sm leading-6 text-slate-700">目前沒有排入提醒。</p>
                        )}
                      </div>

                      <div className="rounded-lg border border-slate-200/75 bg-white/80 px-3.5 py-3">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-500">
                          估值與品質
                        </p>
                        <p className="mt-1.5 text-sm font-medium text-ink-900">目標區間 {item.targetRange}</p>
                        <p className="mt-1 text-sm text-slate-700">現價 {formatCurrency(item.currentPrice)}</p>
                        <p className="mt-1 text-sm text-slate-700">品質分數 {item.qualityScore.toFixed(1)} / 10</p>
                      </div>

                      <div className="rounded-lg border border-slate-200/75 bg-white/80 px-3.5 py-3">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-500">
                          工作標記
                        </p>
                        <div className="mt-3 flex flex-wrap gap-2">
                          {focusStates.map((focusState) => (
                            <button
                              key={`${item.id}-${focusState}`}
                              type="button"
                              onClick={() => setWatchlistFocus(item.id, focusState)}
                              className={`rounded-lg border px-3 py-2 text-sm transition ${
                                item.focusState === focusState
                                  ? "border-ink-900 bg-ink-900 text-white"
                                  : "border-slate-200 bg-white text-ink-900 hover:border-slate-300"
                              }`}
                            >
                              {focusState}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      <Link
                        to={`/stocks/${item.ticker}`}
                        className="inline-flex items-center justify-center rounded-lg border border-ink-900 bg-ink-900 px-3 py-2 text-sm font-medium text-white transition hover:bg-ink-800"
                      >
                        看個股
                      </Link>
                      <Link
                        to={`/thesis/${item.ticker}`}
                        className="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-ink-900 transition hover:border-slate-400"
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
          <div className="border-b border-slate-200/75 pb-2.5">
            <h2 className="section-title">關鍵狀態</h2>
            <p className="mt-1 muted-copy">先看本輪研究量、等待事件和等待估值的壓力。</p>
          </div>

          <div className="mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-1">
            <SummaryMetric label="本輪研究" value={summaryCounts.focus} note="這輪要優先補研究的公司" tone="warning" />
            <SummaryMetric label="等待事件" value={summaryCounts.event} note="先等財報或營收更新" tone="info" />
            <SummaryMetric label="等待估值" value={summaryCounts.valuation} note="先等價格，不急著出手" tone="critical" />
            <SummaryMetric label="維持追蹤" value={summaryCounts.passive} note="暫時沒有立即動作" />
          </div>

          <div className="mt-4 rounded-xl border border-slate-200/75 bg-white/80 px-4 py-3.5">
            <p className="text-sm font-medium text-ink-900">目前篩選</p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <Badge tone="default">{selectedTag}</Badge>
              <Badge tone="default">
                {sortBy === "focus" ? "工作標記" : sortBy === "valuation" ? "估值訊號" : "最久未檢查"}
              </Badge>
            </div>
          </div>

          <div className="mt-4 rounded-xl border border-slate-200/75 bg-white/80 px-4 py-3.5">
            <p className="text-sm font-medium text-ink-900">最久未檢查</p>
            <p className="mt-2 text-base font-semibold text-ink-900">
              {oldestReview.companyName} ({oldestReview.ticker})
            </p>
            <p className="mt-1 text-sm text-slate-600">最後檢查 {formatDate(oldestReview.lastReviewed)}</p>
            <p className="mt-2 text-sm leading-6 text-slate-700">
              如果最近沒有新的提醒，也要回頭確認商業模式、估值區間與風險假設是否仍有效。
            </p>
          </div>
        </aside>
      </div>

      <SectionBlock
        title="按工作標記整理"
        subtitle="把研究中的、等待事件的、等待估值的標的分開看，避免一張名單混在一起。"
      >
        <div className="grid gap-4 lg:grid-cols-4">
          {groupedBoards.map((group) => (
            <div key={group.title} className="rounded-xl border border-slate-200/75 bg-white/84 px-4 py-4">
              <div className="flex flex-wrap items-center gap-2">
                <Badge tone={group.tone}>{group.title}</Badge>
                <p className="text-sm font-semibold text-ink-900">{group.items.length} 檔</p>
              </div>

              <div className="mt-4 space-y-3">
                {group.items.map((item) => (
                  <div key={item.id} className="rounded-lg border border-slate-200/75 bg-slate-50/70 px-3.5 py-3">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-medium text-ink-900">
                        {item.companyName} ({item.ticker})
                      </p>
                      <p className="text-sm text-slate-500">{formatDate(item.lastReviewed)}</p>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-slate-700">{getResearchAction(item)}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </SectionBlock>
    </div>
  );
}
