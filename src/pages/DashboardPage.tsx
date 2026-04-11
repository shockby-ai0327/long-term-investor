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
import { useWorkspaceState } from "../state/WorkspaceStateProvider";
import type {
  ReminderAction,
  ReminderStatus,
  ReminderType,
  Stock,
  WatchlistFocusState,
  WorkspaceReminder,
  WorkspaceWatchlistItem
} from "../types/investment";
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
    return { label: "7 天內", tone: "info" as const };
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

function ActionLink({
  action,
  fullWidth = false
}: {
  action: ReminderAction;
  fullWidth?: boolean;
}) {
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
      className={[
        "inline-flex items-center justify-center rounded-lg border px-3 py-2 text-sm font-medium transition",
        fullWidth ? "w-full" : "",
        className
      ].join(" ")}
    >
      {action.label}
    </Link>
  );
}

function SummaryMetric({
  label,
  value,
  note,
  tone = "default"
}: {
  label: string;
  value: string | number;
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
      <p className="mt-1.5 text-[1.65rem] font-semibold tracking-tight text-ink-900">{value}</p>
      <p className="mt-1 text-sm leading-5 text-slate-600">{note}</p>
    </div>
  );
}

function TaskRow({ reminder }: { reminder: WorkspaceReminder }) {
  const urgency = getUrgencyLabel(reminder);
  const primaryAction = reminder.actions[0];
  const secondaryAction = reminder.actions[1];

  return (
    <article className="rounded-xl border border-slate-200/75 bg-white/88 px-4 py-4">
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,0.95fr)_164px] xl:items-start">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone={getStatusTone(reminder.status)}>{reminder.status}</Badge>
            <Badge tone={getTypeTone(reminder.type)}>{reminder.type}</Badge>
            <Badge tone={urgency.tone}>{urgency.label}</Badge>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-600">
              {reminder.ticker}
            </p>
            <p className="text-xs text-slate-500">{formatDate(reminder.date)}</p>
            <Badge tone={reminder.progress === "處理中" ? "info" : "default"}>
              {reminder.progress}
            </Badge>
          </div>

          <h3 className="mt-2 text-[1.02rem] font-semibold tracking-tight text-ink-900">
            {reminder.title}
          </h3>

          <div className="mt-3 grid gap-2 text-sm leading-6 sm:grid-cols-[68px_minmax(0,1fr)]">
            <p className="font-medium text-slate-500">原因</p>
            <p className="text-slate-700">{reminder.reason}</p>
          </div>
        </div>

        <div className="grid gap-2">
          <div className="rounded-lg border border-slate-200/75 bg-slate-50/70 px-3.5 py-3">
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-500">
              會改變
            </p>
            <p className="mt-1.5 text-sm leading-6 text-ink-900">{reminder.affectsDecision}</p>
          </div>

          <div className="rounded-lg border border-slate-200/75 bg-white/80 px-3.5 py-3">
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-500">
              下一步
            </p>
            <p className="mt-1.5 text-sm leading-6 text-ink-900">{reminder.nextStep}</p>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          {primaryAction ? <ActionLink action={primaryAction} fullWidth /> : null}
          {secondaryAction ? <ActionLink action={secondaryAction} fullWidth /> : null}
        </div>
      </div>
    </article>
  );
}

export function DashboardPage() {
  const { reminders, watchlist } = useWorkspaceState();
  const totalPortfolioValue =
    portfolioHoldings.reduce((sum, holding) => sum + holding.marketValue, 0) + cashPosition.value;
  const topHoldings = [...portfolioHoldings].sort((a, b) => b.weight - a.weight).slice(0, 3);
  const topThreeWeight = topHoldings.reduce((sum, item) => sum + item.weight, 0);
  const topHolding = topHoldings[0]!;
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
  const regionExposure = Object.entries(
    portfolioHoldings.reduce(
      (current, holding) => {
        current[holding.region] = (current[holding.region] ?? 0) + holding.weight;
        return current;
      },
      {} as Record<string, number>
    )
  ).sort(([, left], [, right]) => right - left);
  const [largestRegionLabel, largestRegionWeight] = regionExposure[0] ?? ["--", 0];

  const portfolioAttention = [
    {
      id: "portfolio-1",
      label: "集中度",
      tone: "warning" as const,
      title: `${topHolding.companyName} 權重 ${topHolding.weight}%`,
      note: "高於自訂 20% 上限，已經不是一般監控，而是要配合更清楚的持有理由。",
      nextStep: "先對回財報前檢查與 thesis，再決定是否保留現有集中度。",
      primaryTo: "/portfolio",
      primaryLabel: "看組合",
      secondaryTo: `/thesis/${topHolding.ticker}`,
      secondaryLabel: "看 Thesis"
    },
    {
      id: "portfolio-2",
      label: "估值紀律",
      tone: "critical" as const,
      title: "Costco 保持觀察，不直接加碼",
      note: "公司品質沒有問題，但目前更重要的是等風險報酬比改善，而不是把好公司等同於好價格。",
      nextStep: "回個股確認估值區間，再到觀察名單維持等待估值狀態。",
      primaryTo: "/stocks/COST",
      primaryLabel: "看個股",
      secondaryTo: "/watchlist",
      secondaryLabel: "看觀察名單"
    },
    {
      id: "portfolio-3",
      label: "現金",
      tone: "default" as const,
      title: `現金部位 ${cashPosition.weight}%`,
      note: "現金不是閒置，而是讓你在價格回到合理區間時有能力加碼高品質資產。",
      nextStep: "維持等待清單，不用為了提高持股率而降低估值紀律。",
      primaryTo: "/portfolio",
      primaryLabel: "看組合",
      secondaryTo: "/watchlist",
      secondaryLabel: "看觀察名單"
    }
  ];

  return (
    <div className="space-y-4">
      <PageHeader
        eyebrow="Dashboard"
        title="首頁工作台"
        description="首頁先回答現在該處理什麼，再補上組合、觀察名單與最近檢查的延續工作。"
        actions={
          <>
            <Link
              to="/tracking"
              className="rounded-lg border border-ink-900 bg-ink-900 px-3.5 py-2 text-sm font-medium text-white transition hover:bg-ink-800"
            >
              打開追蹤工作台
            </Link>
            <Link
              to="/portfolio"
              className="rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm font-medium text-ink-900 transition hover:border-slate-400"
            >
              看投資組合
            </Link>
          </>
        }
      />

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.22fr)_350px]">
        <section className="panel px-4 py-4 sm:px-5">
          <div className="mb-3 flex flex-col gap-2.5 border-b border-slate-200/75 pb-2.5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="section-title">今日待處理</h2>
              <p className="mt-1 muted-copy">
                只保留會改變持有、估值、風險或配置判斷的提醒。
              </p>
            </div>
            <Link to="/tracking" className="text-sm font-medium text-sage-700">
              查看完整隊列
            </Link>
          </div>

          <div className="space-y-3">
            {priorityQueue.map((reminder) => (
              <TaskRow key={reminder.id} reminder={reminder} />
            ))}
          </div>
        </section>

        <aside className="panel px-4 py-4 sm:px-5">
          <div className="border-b border-slate-200/75 pb-2.5">
            <h2 className="section-title">關鍵狀態</h2>
            <p className="mt-1 muted-copy">首頁只留下今天要先掃過的摘要與警示。</p>
          </div>

          <div className="mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-1">
            <SummaryMetric label="需處理" value={dueNowCount} note="今天要先排掉的提醒" tone="warning" />
            <SummaryMetric label="7 天內" value={dueThisWeekCount} note="近期會進入檢查節奏" tone="info" />
            <SummaryMetric
              label="估值 / Thesis"
              value={valuationDisciplineCount + thesisReviewCount}
              note="直接影響持有紀律"
              tone="critical"
            />
            <SummaryMetric
              label="組合總值"
              value={formatCurrency(totalPortfolioValue)}
              note={`現金部位 ${cashPosition.weight}%`}
            />
          </div>

          <div className="mt-4 space-y-3">
            <div className="rounded-xl border border-amber-200/90 bg-amber-50/80 px-4 py-3.5">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-medium text-ink-900">最大風險</p>
                <Badge tone="warning">{topHolding.weight}%</Badge>
              </div>
              <p className="mt-2 text-base font-semibold text-ink-900">
                {topHolding.companyName}
              </p>
              <p className="mt-1 text-sm leading-6 text-slate-700">
                權重已超過自訂集中度上限，這一檔的 thesis 與財報檢查要先做。
              </p>
            </div>

            <div className="rounded-xl border border-slate-200/75 bg-white/80 px-4 py-3.5">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-medium text-ink-900">前三大持股</p>
                <Badge tone={topThreeWeight > 55 ? "warning" : "default"}>{topThreeWeight}%</Badge>
              </div>
              <div className="mt-3 space-y-2">
                {topHoldings.map((holding) => (
                  <div key={holding.id} className="flex items-center justify-between gap-3 text-sm">
                    <p className="text-slate-700">{holding.companyName}</p>
                    <p className="font-medium text-ink-900">{holding.weight}%</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-slate-200/75 bg-white/80 px-4 py-3.5">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-medium text-ink-900">地區暴露</p>
                <Badge tone="info">
                  {largestRegionLabel} {largestRegionWeight}%
                </Badge>
              </div>
              <div className="mt-3 space-y-2">
                {regionExposure.map(([region, weight]) => (
                  <div key={region} className="flex items-center justify-between gap-3 text-sm">
                    <p className="text-slate-700">{region}</p>
                    <p className="font-medium text-ink-900">{weight}%</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </aside>
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)]">
        <SectionBlock
          title="組合需要留意"
          subtitle="先回答哪個配置點要回頭，再決定是否進到個股層級。"
          action={
            <Link to="/portfolio" className="text-sm font-medium text-sage-700">
              打開組合頁
            </Link>
          }
        >
          <div className="space-y-3">
            {portfolioAttention.map((item) => (
              <article key={item.id} className="rounded-xl border border-slate-200/75 bg-white/84 px-4 py-3.5">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge tone={item.tone}>{item.label}</Badge>
                  <h3 className="text-sm font-semibold text-ink-900">{item.title}</h3>
                </div>
                <p className="mt-2 text-sm leading-6 text-slate-700">{item.note}</p>
                <div className="mt-3 rounded-lg border border-slate-200/75 bg-slate-50/70 px-3.5 py-2.5">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-500">
                    下一步
                  </p>
                  <p className="mt-1 text-sm leading-6 text-ink-900">{item.nextStep}</p>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Link
                    to={item.primaryTo}
                    className="inline-flex items-center rounded-lg border border-ink-900 bg-ink-900 px-3 py-2 text-sm font-medium text-white transition hover:bg-ink-800"
                  >
                    {item.primaryLabel}
                  </Link>
                  <Link
                    to={item.secondaryTo}
                    className="inline-flex items-center rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-ink-900 transition hover:border-slate-400"
                  >
                    {item.secondaryLabel}
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </SectionBlock>

        <SectionBlock
          title="觀察名單下一步"
          subtitle="不是列公司，而是先看哪一檔該回到研究流程。"
          action={
            <Link to="/watchlist" className="text-sm font-medium text-sage-700">
              打開完整名單
            </Link>
          }
        >
          <div className="space-y-3">
            {focusWatchlist.slice(0, 4).map((item) => (
              <article key={item.id} className="rounded-xl border border-slate-200/75 bg-white/84 px-4 py-3.5">
                <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_196px] lg:items-start">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-sm font-semibold text-ink-900">
                        {item.companyName} ({item.ticker})
                      </h3>
                      <Badge tone={getFocusTone(item.focusState)}>{item.focusState}</Badge>
                      <Badge tone={getValuationTone(item.valuationSignal)}>{item.valuationSignal}</Badge>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-slate-700">{item.nextCatalyst}</p>
                    <p className="mt-1 text-sm text-slate-500">
                      最近檢查 {formatDate(item.lastReviewed)}
                    </p>
                  </div>

                  <div className="rounded-lg border border-slate-200/75 bg-slate-50/70 px-3.5 py-3">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-500">
                      目標區間
                    </p>
                    <p className="mt-1.5 text-sm font-medium text-ink-900">{item.targetRange}</p>
                    <p className="mt-1 text-sm text-slate-500">現價 {formatCurrency(item.currentPrice)}</p>
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
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
              </article>
            ))}
          </div>
        </SectionBlock>
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,0.88fr)_minmax(0,1.12fr)]">
        <SectionBlock title="最近檢查過的公司" subtitle="延續前一次研究，不讓首頁被長說明占滿。">
          <div className="divide-y divide-slate-200/75">
            {recentStocks.map((stock, index) => (
              <article
                key={stock.id}
                className={index === 0 ? "pb-3" : "py-3"}
              >
                <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_220px] lg:items-start">
                  <div className="min-w-0">
                    <Link to={`/stocks/${stock.ticker}`} className="text-sm font-semibold text-ink-900">
                      {stock.companyName} ({stock.ticker})
                    </Link>
                    <p className="mt-1.5 text-sm leading-6 text-slate-700">{stock.conclusion}</p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 lg:justify-end">
                    <p className="text-sm text-slate-500">{formatDate(stock.lastReviewed)}</p>
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
                      看 Thesis
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </SectionBlock>

        <SectionBlock title="市場背景" subtitle="只保留對長線決策有意義的背景，不讓噪音搶首頁。">
          <div className="space-y-3">
            {marketSummary.map((summary) => (
              <article key={summary.id} className="rounded-xl border border-slate-200/75 bg-white/84 px-4 py-3.5">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge tone="default">市場背景</Badge>
                  <h3 className="text-sm font-semibold text-ink-900">{summary.title}</h3>
                </div>
                <p className="mt-2 text-sm leading-6 text-slate-700">{summary.takeaway}</p>
                <div className="mt-3 rounded-lg border border-slate-200/75 bg-slate-50/70 px-3.5 py-2.5">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-500">
                    對決策的意義
                  </p>
                  <p className="mt-1 text-sm leading-6 text-ink-900">{summary.implication}</p>
                </div>
              </article>
            ))}
          </div>
        </SectionBlock>
      </div>
    </div>
  );
}
