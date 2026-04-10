import { Link } from "react-router-dom";
import { Badge } from "../components/Badge";
import { PageHeader } from "../components/PageHeader";
import { SectionBlock } from "../components/SectionBlock";
import {
  cashPosition,
  marketSummary,
  mockSnapshot,
  portfolioHoldings,
  recentChecks,
  stocks
} from "../data/mockData";
import type {
  ReminderAction,
  ReminderStatus,
  ReminderType,
  Stock,
  WatchlistFocusState,
  WorkspaceReminder,
  WorkspaceWatchlistItem
} from "../types/investment";
import { useWorkspaceState } from "../state/WorkspaceStateProvider";
import { formatCurrency, formatDate } from "../utils/format";

const snapshotDate = new Date(`${mockSnapshot.asOfDate}T00:00:00`);

function getDaysUntil(date: string) {
  const targetDate = new Date(`${date}T00:00:00`);
  const diff = targetDate.getTime() - snapshotDate.getTime();
  return Math.round(diff / (1000 * 60 * 60 * 24));
}

function getStatusTone(status: ReminderStatus) {
  switch (status) {
    case "需處理":
      return "warning" as const;
    case "即將到來":
      return "info" as const;
    default:
      return "positive" as const;
  }
}

function getTypeTone(type: ReminderType) {
  switch (type) {
    case "估值":
      return "critical" as const;
    case "Thesis":
      return "warning" as const;
    case "營收":
      return "info" as const;
    default:
      return "default" as const;
  }
}

function getUrgencyLabel(reminder: WorkspaceReminder) {
  const days = getDaysUntil(reminder.date);

  if (days <= 0) {
    return { label: "今天", tone: "warning" as const };
  }

  if (days <= 3) {
    return { label: `${days} 天後`, tone: "warning" as const };
  }

  if (days <= 7) {
    return { label: "本週內", tone: "info" as const };
  }

  return { label: `${days} 天後`, tone: "default" as const };
}

function getValuationTone(signal: WorkspaceWatchlistItem["valuationSignal"]) {
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

function ActionLink({ action }: { action: ReminderAction }) {
  const emphasis = action.emphasis ?? "ghost";
  const className =
    emphasis === "primary"
      ? "border-ink-900 bg-ink-900 text-white hover:bg-ink-800"
      : emphasis === "secondary"
        ? "border-slate-300 bg-white text-ink-900 hover:border-slate-400"
        : "border-transparent bg-transparent text-slate-600 hover:border-slate-300 hover:bg-white";

  return (
    <Link
      to={action.to}
      className={`inline-flex items-center rounded-lg border px-3 py-2 text-sm font-medium transition ${className}`}
    >
      {action.label}
    </Link>
  );
}

export function DashboardPage() {
  const { reminders, watchlist } = useWorkspaceState();
  const totalPortfolioValue =
    portfolioHoldings.reduce((sum, holding) => sum + holding.marketValue, 0) + cashPosition.value;
  const topHoldings = [...portfolioHoldings].sort((a, b) => b.weight - a.weight).slice(0, 3);
  const topThreeWeight = topHoldings.reduce((sum, item) => sum + item.weight, 0);
  const topHolding = topHoldings[0];
  const recentStocks = recentChecks
    .map((ticker) => stocks.find((stock) => stock.ticker === ticker))
    .filter((stock): stock is Stock => Boolean(stock))
    .slice(0, 4);
  const priorityQueue = [...reminders]
    .filter((reminder) => reminder.progress !== "已完成")
    .sort((left, right) => getDaysUntil(left.date) - getDaysUntil(right.date))
    .slice(0, 3);
  const dueNowCount = reminders.filter(
    (reminder) => reminder.status === "需處理" && reminder.progress !== "已完成"
  ).length;
  const dueThisWeekCount = reminders.filter(
    (reminder) => getDaysUntil(reminder.date) <= 7 && reminder.progress !== "已完成"
  ).length;
  const valuationDisciplineCount = reminders.filter(
    (reminder) => reminder.type === "估值" && reminder.progress !== "已完成"
  ).length;
  const thesisReviewCount = reminders.filter(
    (reminder) => reminder.type === "Thesis" && reminder.progress !== "已完成"
  ).length;
  const focusWatchlist = [...watchlist].sort((left, right) => {
    if (left.focusState !== right.focusState) {
      const order = {
        本輪研究: 0,
        等待事件: 1,
        等待估值: 2,
        維持追蹤: 3
      };

      return order[left.focusState] - order[right.focusState];
    }

    return left.lastReviewed.localeCompare(right.lastReviewed);
  });
  const largestRegion = portfolioHoldings.reduce(
    (current, holding) => {
      current[holding.region] = (current[holding.region] ?? 0) + holding.weight;
      return current;
    },
    {} as Record<string, number>
  );
  const [largestRegionLabel, largestRegionWeight] = Object.entries(largestRegion).sort(
    ([, left], [, right]) => right - left
  )[0];

  return (
    <div className="space-y-4">
      <PageHeader
        eyebrow="Dashboard"
        title="首頁工作台"
        description="先看今天要處理的提醒，再檢查組合和觀察名單。首頁只保留能直接推進長線決策的資訊。"
        actions={
          <>
            <Link
              to="/tracking"
              className="rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm font-medium text-ink-900 transition hover:border-slate-400"
            >
              打開追蹤工作台
            </Link>
            <Link
              to="/portfolio"
              className="rounded-lg border border-ink-900 bg-ink-900 px-3.5 py-2 text-sm font-medium text-white transition hover:bg-ink-800"
            >
              檢查投資組合
            </Link>
          </>
        }
      />

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.25fr)_360px]">
        <SectionBlock
          title="今天先處理"
          subtitle={`依照 ${mockSnapshot.asOfDate} 的 snapshot 排序。先看哪一則提醒最接近決策點，而不是先看價格波動。`}
          action={
            <Link to="/tracking" className="text-sm font-medium text-sage-700">
              查看完整隊列
            </Link>
          }
        >
          <div className="space-y-3">
            {priorityQueue.map((reminder) => {
              const urgency = getUrgencyLabel(reminder);

              return (
                <div key={reminder.id} className="rounded-xl border border-slate-200/80 bg-white/80 px-4 py-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge tone={getStatusTone(reminder.status)}>{reminder.status}</Badge>
                    <Badge tone={getTypeTone(reminder.type)}>{reminder.type}</Badge>
                    <p className="text-sm font-semibold tracking-[0.08em] text-slate-700">
                      {reminder.ticker}
                    </p>
                    <p className="text-sm text-slate-500">{formatDate(reminder.date)}</p>
                    <Badge tone={urgency.tone}>{urgency.label}</Badge>
                    <Badge tone={reminder.progress === "處理中" ? "info" : "default"}>
                      {reminder.progress}
                    </Badge>
                  </div>

                  <h3 className="mt-3 text-base font-semibold text-ink-900">{reminder.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{reminder.reason}</p>

                  <div className="mt-4 grid gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
                    <div className="rounded-lg border border-slate-200/80 bg-sand-50/75 px-3.5 py-3">
                      <p className="text-[11px] uppercase tracking-[0.22em] text-slate-500">會改變</p>
                      <p className="mt-1.5 text-sm leading-6 text-ink-900">{reminder.affectsDecision}</p>
                    </div>
                    <div className="rounded-lg border border-slate-200/80 bg-white/75 px-3.5 py-3">
                      <p className="text-[11px] uppercase tracking-[0.22em] text-slate-500">下一步</p>
                      <p className="mt-1.5 text-sm leading-6 text-ink-900">{reminder.nextStep}</p>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {reminder.actions.slice(0, 2).map((action) => (
                      <ActionLink key={`${reminder.id}-${action.label}`} action={action} />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </SectionBlock>

        <SectionBlock
          title="首頁摘要"
          subtitle="先確認今天的工作量，以及組合是否有需要優先回頭處理的地方。"
        >
          <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
            <div className="rounded-xl border border-amber-200/90 bg-amber-50/75 px-3.5 py-3">
              <p className="text-[11px] uppercase tracking-[0.22em] text-amber-800">需處理</p>
              <p className="mt-1.5 text-2xl font-semibold tracking-tight text-ink-900">{dueNowCount}</p>
              <p className="mt-1 text-sm text-slate-600">今天要先排掉的提醒</p>
            </div>
            <div className="rounded-xl border border-sky-200/90 bg-sky-50/75 px-3.5 py-3">
              <p className="text-[11px] uppercase tracking-[0.22em] text-sky-800">7 天內</p>
              <p className="mt-1.5 text-2xl font-semibold tracking-tight text-ink-900">{dueThisWeekCount}</p>
              <p className="mt-1 text-sm text-slate-600">近期會進入檢查節奏</p>
            </div>
            <div className="rounded-xl border border-rose-200/90 bg-rose-50/75 px-3.5 py-3">
              <p className="text-[11px] uppercase tracking-[0.22em] text-rose-800">估值 / Thesis</p>
              <p className="mt-1.5 text-2xl font-semibold tracking-tight text-ink-900">
                {valuationDisciplineCount + thesisReviewCount}
              </p>
              <p className="mt-1 text-sm text-slate-600">直接影響持有紀律</p>
            </div>
            <div className="rounded-xl border border-slate-200/90 bg-white/80 px-3.5 py-3">
              <p className="text-[11px] uppercase tracking-[0.22em] text-slate-500">組合總值</p>
              <p className="mt-1.5 text-xl font-semibold tracking-tight text-ink-900">
                {formatCurrency(totalPortfolioValue)}
              </p>
              <p className="mt-1 text-sm text-slate-600">包含 {cashPosition.weight}% 現金</p>
            </div>
          </div>

          <div className="mt-4 space-y-3">
            <div className="rounded-xl border border-amber-200/80 bg-amber-50/60 px-4 py-3.5">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-medium text-ink-900">最高持股</p>
                <Badge tone={topHolding.weight > 20 ? "warning" : "default"}>{topHolding.weight}%</Badge>
              </div>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                {topHolding.companyName} 權重最高，已高於自訂 20% 上限，需配合更清楚的 Thesis 與估值紀律。
              </p>
            </div>

            <div className="rounded-xl border border-slate-200/80 bg-white/75 px-4 py-3.5">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-medium text-ink-900">前 3 大持股</p>
                <Badge tone={topThreeWeight > 55 ? "warning" : "default"}>{topThreeWeight}%</Badge>
              </div>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                組合刻意偏集中，代表你更需要定期回頭驗證持有理由，而不是用價格變動替代研究。
              </p>
            </div>

            <div className="rounded-xl border border-slate-200/80 bg-white/75 px-4 py-3.5">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-medium text-ink-900">地區暴露</p>
                <Badge tone="info">
                  {largestRegionLabel} {largestRegionWeight}%
                </Badge>
              </div>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                最大地區曝險集中在 {largestRegionLabel}，要一起看政策、匯率與需求來源，不只是看市場名稱。
              </p>
            </div>
          </div>
        </SectionBlock>
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <SectionBlock
          title="組合需要留意"
          subtitle="先回答組合哪裡可能需要回頭檢查，再決定是否做個股層級的動作。"
          action={
            <Link to="/portfolio" className="text-sm font-medium text-sage-700">
              打開組合頁
            </Link>
          }
        >
          <div className="space-y-3">
            <div className="rounded-xl border border-amber-200/90 bg-amber-50/70 px-4 py-3.5">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-medium text-ink-900">Microsoft 集中度偏高</p>
                <Badge tone="warning">23%</Badge>
              </div>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                權重略高於自訂範圍，若財報後估值擴張但現金流沒有同步改善，應優先檢查減碼條件。
              </p>
            </div>

            <div className="rounded-xl border border-rose-200/90 bg-rose-50/70 px-4 py-3.5">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-medium text-ink-900">Costco 估值紀律</p>
                <Badge tone="critical">偏高</Badge>
              </div>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                公司品質沒有問題，但目前更重要的是等待風險報酬比，不是繼續把好公司等同於好價格。
              </p>
            </div>

            <div className="rounded-xl border border-slate-200/80 bg-white/80 px-4 py-3.5">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-medium text-ink-900">現金部位</p>
                <Badge tone="default">{cashPosition.weight}%</Badge>
              </div>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                現金不是閒置，而是估值紀律的一部分，讓你在回檔時可以增加高品質資產。
              </p>
            </div>

            <div className="flex flex-wrap gap-2 pt-1">
              <Link
                to="/portfolio"
                className="inline-flex items-center rounded-lg border border-ink-900 bg-ink-900 px-3 py-2 text-sm font-medium text-white transition hover:bg-ink-800"
              >
                看組合
              </Link>
              <Link
                to="/thesis/MSFT"
                className="inline-flex items-center rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-ink-900 transition hover:border-slate-400"
              >
                看 Microsoft Thesis
              </Link>
            </div>
          </div>
        </SectionBlock>

        <SectionBlock
          title="觀察名單下一步"
          subtitle="不是列出一堆公司，而是告訴你下一個該回去看的標的與原因。"
          action={
            <Link to="/watchlist" className="text-sm font-medium text-sage-700">
              打開完整名單
            </Link>
          }
        >
          <div className="space-y-3">
            {focusWatchlist.slice(0, 4).map((item) => (
              <div key={item.id} className="rounded-xl border border-slate-200/80 bg-white/80 px-4 py-4">
                <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-semibold tracking-[0.08em] text-ink-900">
                          {item.companyName} ({item.ticker})
                        </p>
                        <Badge tone={getValuationTone(item.valuationSignal)}>{item.valuationSignal}</Badge>
                        <Badge tone={getFocusTone(item.focusState)}>{item.focusState}</Badge>
                        {item.tags.slice(0, 2).map((tag) => (
                          <Badge key={`${item.id}-${tag}`} tone="default">
                            {tag}
                    </Badge>
                  ))}
                </div>

                <div className="mt-3 grid gap-3 lg:grid-cols-[minmax(0,1fr)_220px]">
                  <div>
                    <p className="text-sm leading-6 text-slate-600">{item.nextCatalyst}</p>
                    <p className="mt-2 text-sm text-slate-500">最近檢查 {formatDate(item.lastReviewed)}</p>
                  </div>
                  <div className="rounded-lg border border-slate-200/80 bg-sand-50/70 px-3.5 py-3">
                    <p className="text-[11px] uppercase tracking-[0.22em] text-slate-500">目標區間</p>
                    <p className="mt-1.5 text-sm font-medium text-ink-900">{item.targetRange}</p>
                    <p className="mt-1 text-sm text-slate-500">現價 {formatCurrency(item.currentPrice)}</p>
                    <p className="mt-1 text-sm text-slate-500">
                      本地更新 {item.focusUpdatedAt ? formatDate(item.focusUpdatedAt) : "尚未調整"}
                    </p>
                  </div>
                </div>

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
            ))}
          </div>
        </SectionBlock>
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,0.88fr)_minmax(0,1.12fr)]">
        <SectionBlock
          title="最近檢查過的公司"
          subtitle="延續上一次研究，不要每次都從零開始。"
        >
          <div className="space-y-3">
            {recentStocks.map((stock) => (
              <div key={stock.id} className="rounded-xl border border-slate-200/80 bg-white/80 px-4 py-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <Link to={`/stocks/${stock.ticker}`} className="text-base font-semibold text-ink-900">
                      {stock.companyName} ({stock.ticker})
                    </Link>
                    <p className="mt-2 text-sm leading-6 text-slate-600">{stock.conclusion}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-sage-700">{formatDate(stock.lastReviewed)}</p>
                    <p className="mt-1 text-[11px] uppercase tracking-[0.22em] text-slate-500">
                      最近檢查
                    </p>
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Link
                    to={`/stocks/${stock.ticker}`}
                    className="inline-flex items-center rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-ink-900 transition hover:border-slate-400"
                  >
                    回到分析
                  </Link>
                  <Link
                    to={`/thesis/${stock.ticker}`}
                    className="inline-flex items-center rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-ink-900 transition hover:border-slate-400"
                  >
                    打開 Thesis
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </SectionBlock>

        <SectionBlock
          title="市場背景只保留決策意義"
          subtitle="保留對長線判斷有幫助的背景，避免首頁變成市場噪音牆。"
        >
          <div className="space-y-3">
            {marketSummary.map((summary) => (
              <div key={summary.id} className="rounded-xl border border-slate-200/80 bg-sand-50/70 px-4 py-4">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge tone="default">市場背景</Badge>
                  <p className="text-sm font-semibold text-ink-900">{summary.title}</p>
                </div>
                <p className="mt-3 text-sm leading-6 text-slate-600">{summary.takeaway}</p>
                <div className="mt-3 rounded-lg border border-slate-200/80 bg-white/80 px-3.5 py-3">
                  <p className="text-[11px] uppercase tracking-[0.22em] text-slate-500">對決策的意義</p>
                  <p className="mt-1.5 text-sm leading-6 text-ink-900">{summary.implication}</p>
                </div>
              </div>
            ))}
          </div>
        </SectionBlock>
      </div>
    </div>
  );
}
