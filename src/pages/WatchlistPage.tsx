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
        低估待研究: 1,
        合理區間: 2
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

  const oldestReview = [...watchlist].sort((left, right) => left.lastReviewed.localeCompare(right.lastReviewed))[0];
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
        description="觀察名單不是候選買點清單，而是研究待辦清單。先標記這輪要研究誰、等什麼事件、目前該做什麼。"
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

      <SectionBlock
        title="篩選與排序"
        subtitle={`先決定目前想處理哪一類研究，資料以 ${mockSnapshot.asOfDate} snapshot 顯示，本地工作標記會保留在瀏覽器。`}
      >
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
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
      </SectionBlock>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.05fr)_340px]">
        <SectionBlock
          title="下一輪研究隊列"
          subtitle="每一列都要能回答現在該做什麼，並且可以直接更新工作標記。"
        >
          <div className="space-y-3">
            {sortedItems.map((item) => {
              const nextReminder = reminders
                .filter((reminder) => reminder.ticker === item.ticker && reminder.progress !== "已完成")
                .sort((left, right) => left.date.localeCompare(right.date))[0];

              return (
                <div key={item.id} className="rounded-xl border border-slate-200/80 bg-white/80 px-4 py-4">
                  <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_240px]">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-base font-semibold text-ink-900">
                          {item.companyName} ({item.ticker})
                        </p>
                        <Badge tone={getSignalTone(item.valuationSignal)}>{item.valuationSignal}</Badge>
                        <Badge tone={getFocusTone(item.focusState)}>{item.focusState}</Badge>
                        {item.tags.slice(0, 2).map((tag) => (
                          <Badge key={`${item.id}-${tag}`} tone="default">
                            {tag}
                          </Badge>
                        ))}
                      </div>

                      <p className="mt-3 text-sm leading-6 text-slate-600">{item.nextCatalyst}</p>

                      <div className="mt-4 grid gap-3 lg:grid-cols-2">
                        <div className="rounded-lg border border-slate-200/80 bg-sand-50/75 px-3.5 py-3">
                          <p className="text-[11px] uppercase tracking-[0.22em] text-slate-500">現在該做什麼</p>
                          <p className="mt-1.5 text-sm leading-6 text-ink-900">{getResearchAction(item)}</p>
                        </div>
                        <div className="rounded-lg border border-slate-200/80 bg-white/75 px-3.5 py-3">
                          <p className="text-[11px] uppercase tracking-[0.22em] text-slate-500">下一個事件</p>
                          {nextReminder ? (
                            <>
                              <div className="mt-1.5 flex flex-wrap items-center gap-2">
                                <Badge tone={getReminderTone(nextReminder.type)}>{nextReminder.type}</Badge>
                                <p className="text-sm font-medium text-ink-900">{nextReminder.title}</p>
                              </div>
                              <p className="mt-2 text-sm text-slate-600">{formatDate(nextReminder.date)}</p>
                            </>
                          ) : (
                            <p className="mt-1.5 text-sm leading-6 text-slate-600">目前沒有排入提醒。</p>
                          )}
                        </div>
                      </div>

                      <div className="mt-4 rounded-lg border border-slate-200/80 bg-white/80 px-3.5 py-3">
                        <p className="text-[11px] uppercase tracking-[0.22em] text-slate-500">工作標記</p>
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

                    <div className="rounded-lg border border-slate-200/80 bg-sand-50/70 px-3.5 py-3">
                      <p className="text-[11px] uppercase tracking-[0.22em] text-slate-500">估值與品質</p>
                      <p className="mt-1.5 text-sm font-medium text-ink-900">目標區間 {item.targetRange}</p>
                      <p className="mt-1 text-sm text-slate-600">現價 {formatCurrency(item.currentPrice)}</p>
                      <p className="mt-1 text-sm text-slate-600">品質分數 {item.qualityScore.toFixed(1)} / 10</p>
                      <p className="mt-2 text-sm text-slate-500">最近檢查 {formatDate(item.lastReviewed)}</p>
                      <p className="mt-1 text-sm text-slate-500">
                        本地更新 {item.focusUpdatedAt ? formatDate(item.focusUpdatedAt) : "尚未調整"}
                      </p>

                      <div className="mt-4 flex flex-wrap gap-2">
                        <Link
                          to={`/stocks/${item.ticker}`}
                          className="inline-flex items-center rounded-lg border border-ink-900 bg-ink-900 px-3 py-2 text-sm font-medium text-white transition hover:bg-ink-800"
                        >
                          看個股
                        </Link>
                        <Link
                          to={`/thesis/${item.ticker}`}
                          className="inline-flex items-center rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-ink-900 transition hover:border-slate-400"
                        >
                          看 Thesis
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </SectionBlock>

        <SectionBlock
          title="名單摘要"
          subtitle="快速判斷研究工作量與最久未更新的位置。"
        >
          <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
            <div className="rounded-xl border border-amber-200/90 bg-amber-50/75 px-3.5 py-3">
              <p className="text-[11px] uppercase tracking-[0.22em] text-amber-800">本輪研究</p>
              <p className="mt-1.5 text-2xl font-semibold tracking-tight text-ink-900">{summaryCounts.focus}</p>
              <p className="mt-1 text-sm text-slate-600">這輪要優先補研究的公司</p>
            </div>
            <div className="rounded-xl border border-sky-200/90 bg-sky-50/75 px-3.5 py-3">
              <p className="text-[11px] uppercase tracking-[0.22em] text-sky-800">等待事件</p>
              <p className="mt-1.5 text-2xl font-semibold tracking-tight text-ink-900">{summaryCounts.event}</p>
              <p className="mt-1 text-sm text-slate-600">先等財報或營收更新</p>
            </div>
            <div className="rounded-xl border border-rose-200/90 bg-rose-50/75 px-3.5 py-3">
              <p className="text-[11px] uppercase tracking-[0.22em] text-rose-800">等待估值</p>
              <p className="mt-1.5 text-2xl font-semibold tracking-tight text-ink-900">{summaryCounts.valuation}</p>
              <p className="mt-1 text-sm text-slate-600">先等價格，不急著出手</p>
            </div>
            <div className="rounded-xl border border-slate-200/80 bg-white/80 px-3.5 py-3">
              <p className="text-[11px] uppercase tracking-[0.22em] text-slate-500">維持追蹤</p>
              <p className="mt-1.5 text-2xl font-semibold tracking-tight text-ink-900">{summaryCounts.passive}</p>
              <p className="mt-1 text-sm text-slate-600">暫時沒有立即動作</p>
            </div>
          </div>

          <div className="mt-4 rounded-xl border border-slate-200/80 bg-white/75 px-4 py-4">
            <p className="text-[11px] uppercase tracking-[0.22em] text-slate-500">最久未檢查</p>
            <p className="mt-2 text-base font-semibold text-ink-900">
              {oldestReview.companyName} ({oldestReview.ticker})
            </p>
            <p className="mt-1 text-sm text-slate-600">最後檢查 {formatDate(oldestReview.lastReviewed)}</p>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              如果最近沒有新的提醒，至少要回頭確認商業模式、估值區間與風險假設是否仍有效。
            </p>
          </div>
        </SectionBlock>
      </div>

      <SectionBlock
        title="按工作標記整理"
        subtitle="把研究中的、等待事件的、等待估值的標的分開看，避免同一張清單混在一起。"
      >
        <div className="grid gap-4 lg:grid-cols-4">
          {groupedBoards.map((group) => (
            <div key={group.title} className="rounded-xl border border-slate-200/80 bg-white/80 px-4 py-4">
              <div className="flex flex-wrap items-center gap-2">
                <Badge tone={group.tone}>{group.title}</Badge>
                <p className="text-sm font-semibold text-ink-900">{group.items.length} 檔</p>
              </div>

              <div className="mt-4 space-y-3">
                {group.items.map((item) => (
                  <div key={item.id} className="rounded-lg border border-slate-200/80 bg-sand-50/70 px-3.5 py-3">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-medium text-ink-900">
                        {item.companyName} ({item.ticker})
                      </p>
                      <p className="text-sm text-slate-500">{formatDate(item.lastReviewed)}</p>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-slate-600">{getResearchAction(item)}</p>
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
