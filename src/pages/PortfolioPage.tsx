import { Link } from "react-router-dom";
import { Badge } from "../components/Badge";
import { PageHeader } from "../components/PageHeader";
import { SectionBlock } from "../components/SectionBlock";
import { cashPosition, mockSnapshot, portfolioHoldings, portfolioNotes } from "../data/mockData";
import { useWorkspaceState } from "../state/WorkspaceStateProvider";
import type { PortfolioHolding, WorkspaceReminder } from "../types/investment";
import { formatCurrency, formatNumber } from "../utils/format";

function groupByWeight(items: { key: string; weight: number }[]) {
  return items.reduce<Record<string, number>>((accumulator, item) => {
    accumulator[item.key] = (accumulator[item.key] ?? 0) + item.weight;
    return accumulator;
  }, {});
}

function getStatusTone(status: PortfolioHolding["thesisStatus"]) {
  if (status === "符合預期") return "positive" as const;
  if (status === "估值偏高") return "critical" as const;
  return "warning" as const;
}

function getReminderTone(reminder?: WorkspaceReminder) {
  if (!reminder) return "default" as const;
  if (reminder.type === "估值") return "critical" as const;
  if (reminder.status === "需處理") return "warning" as const;
  return "info" as const;
}

function getHoldingNextStep(holding: PortfolioHolding, nextReminder?: WorkspaceReminder) {
  if (nextReminder?.type === "估值") {
    return "先確認估值區間，再決定是否維持新增部位限制。";
  }

  if (holding.thesisStatus === "估值偏高") {
    return "先維持觀察，不把好公司直接等同於好價格。";
  }

  if (holding.weight >= 20) {
    return "優先回到 Thesis，確認集中持有理由是否仍足夠。";
  }

  if (nextReminder) {
    return "先處理下一個事件提醒，再決定是否調整曝險。";
  }

  return "維持持有，按節奏回頭檢查基本面與配置理由。";
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

export function PortfolioPage() {
  const { reminders } = useWorkspaceState();
  const investedValue = portfolioHoldings.reduce((sum, holding) => sum + holding.marketValue, 0);
  const totalValue = investedValue + cashPosition.value;
  const sortedHoldings = [...portfolioHoldings].sort((a, b) => b.weight - a.weight);
  const topHolding = sortedHoldings[0]!;
  const topThreeWeight = sortedHoldings.slice(0, 3).reduce((sum, holding) => sum + holding.weight, 0);
  const sectorAllocation = groupByWeight(
    portfolioHoldings.map((holding) => ({ key: holding.sector, weight: holding.weight }))
  );
  const regionAllocation = {
    ...groupByWeight(portfolioHoldings.map((holding) => ({ key: holding.region, weight: holding.weight }))),
    現金: cashPosition.weight
  };
  const [largestSectorLabel, largestSectorWeight] = Object.entries(sectorAllocation).sort(
    ([, left], [, right]) => right - left
  )[0]!;
  const [largestRegionLabel, largestRegionWeight] = Object.entries(regionAllocation).sort(
    ([, left], [, right]) => right - left
  )[0]!;
  const activeReminders = [...reminders]
    .filter((reminder) => reminder.progress !== "已完成")
    .sort((left, right) => left.date.localeCompare(right.date));
  const holdingsWithReminders = sortedHoldings.map((holding) => ({
    holding,
    nextReminder: activeReminders.find((reminder) => reminder.ticker === holding.ticker)
  }));
  const reviewNeededCount = holdingsWithReminders.filter(
    ({ holding, nextReminder }) =>
      holding.weight >= 20 || holding.thesisStatus !== "符合預期" || Boolean(nextReminder)
  ).length;

  const portfolioAttention = [
    {
      id: "portfolio-priority-1",
      label: "集中度",
      tone: "warning" as const,
      title: `${topHolding.companyName} 權重 ${topHolding.weight}%`,
      note: "已高於自訂集中度上限，這一檔的財報與 thesis 不是例行檢查，而是組合核心風險點。",
      nextStep: "先回 Thesis 與下一個提醒，再決定是否維持現有比重。",
      primaryTo: `/thesis/${topHolding.ticker}`,
      primaryLabel: "看 Thesis",
      secondaryTo: `/stocks/${topHolding.ticker}`,
      secondaryLabel: "看個股"
    },
    {
      id: "portfolio-priority-2",
      label: "產業暴露",
      tone: "info" as const,
      title: `${largestSectorLabel} ${largestSectorWeight}%`,
      note: "最大產業曝險代表要一起看景氣、定價權與資本支出，而不是把持股當成彼此獨立。",
      nextStep: "用配置角度看事件提醒，避免只在單一公司層級反應。",
      primaryTo: "/tracking",
      primaryLabel: "看追蹤工作台",
      secondaryTo: "/portfolio",
      secondaryLabel: "看配置"
    },
    {
      id: "portfolio-priority-3",
      label: "估值紀律",
      tone: "critical" as const,
      title: "現金與等待名單一起看",
      note: "現金部位不是閒置，而是估值紀律。當觀察名單仍有偏高標的時，不需要為了提高持股率而出手。",
      nextStep: "先維持等待估值清單，再決定是否把現金轉成新部位。",
      primaryTo: "/watchlist",
      primaryLabel: "看觀察名單",
      secondaryTo: "/portfolio",
      secondaryLabel: "看組合"
    }
  ];

  return (
    <div className="space-y-4">
      <PageHeader
        eyebrow="Portfolio"
        title="投資組合工作台"
        description="先回答配置哪裡要回頭，再看單一持股。這一頁只處理組合健康度、集中風險與下一步。"
        actions={
          <>
            <Link
              to="/tracking"
              className="rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm font-medium text-ink-900 transition hover:border-slate-400"
            >
              看追蹤工作台
            </Link>
            <Link
              to="/watchlist"
              className="rounded-lg border border-ink-900 bg-ink-900 px-3.5 py-2 text-sm font-medium text-white transition hover:bg-ink-800"
            >
              看觀察名單
            </Link>
          </>
        }
      />

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.18fr)_350px]">
        <SectionBlock
          title="先處理哪個配置點"
          subtitle={`依 ${mockSnapshot.asOfDate} 的 snapshot 先找出最需要回頭的配置壓力。`}
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

        <aside className="panel px-4 py-4 sm:px-5">
          <div className="border-b border-slate-200/75 pb-2.5">
            <h2 className="section-title">關鍵狀態</h2>
            <p className="mt-1 muted-copy">先掃過集中度、現金與最大曝險，再往下處理持股。</p>
          </div>

          <div className="mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-1">
            <SummaryMetric label="總資產" value={formatCurrency(totalValue)} note={`已投資 ${formatCurrency(investedValue)}`} />
            <SummaryMetric label="需回頭" value={reviewNeededCount} note="有提醒、過高集中或 thesis 壓力" tone="warning" />
            <SummaryMetric label="前 3 大持股" value={`${topThreeWeight}%`} note="高集中，需更高 thesis 清晰度" tone="warning" />
            <SummaryMetric label="現金部位" value={`${cashPosition.weight}%`} note="保留給估值更好的時點" tone="info" />
          </div>

          <div className="mt-4 space-y-3">
            <div className="rounded-xl border border-amber-200/90 bg-amber-50/80 px-4 py-3.5">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-medium text-ink-900">最高持股</p>
                <Badge tone="warning">{topHolding.weight}%</Badge>
              </div>
              <p className="mt-2 text-base font-semibold text-ink-900">{topHolding.companyName}</p>
              <p className="mt-1 text-sm leading-6 text-slate-700">
                權重超過自訂範圍，這一檔的檢查優先級高於一般持股。
              </p>
            </div>

            <div className="rounded-xl border border-slate-200/75 bg-white/80 px-4 py-3.5">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-medium text-ink-900">最大產業曝險</p>
                <Badge tone="info">{largestSectorWeight}%</Badge>
              </div>
              <p className="mt-2 text-sm font-semibold text-ink-900">{largestSectorLabel}</p>
            </div>

            <div className="rounded-xl border border-slate-200/75 bg-white/80 px-4 py-3.5">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-medium text-ink-900">最大地區曝險</p>
                <Badge tone="info">{largestRegionWeight}%</Badge>
              </div>
              <p className="mt-2 text-sm font-semibold text-ink-900">{largestRegionLabel}</p>
            </div>
          </div>
        </aside>
      </div>

      <SectionBlock
        title="持股監控清單"
        subtitle="每一檔持股都要能回答三件事：目前狀態、下一個檢查點、現在要做什麼。"
      >
        <div className="space-y-3">
          {holdingsWithReminders.map(({ holding, nextReminder }) => (
            <article key={holding.id} className="rounded-xl border border-slate-200/75 bg-white/84 px-4 py-4">
              <div className="grid gap-4 xl:grid-cols-[minmax(0,1.02fr)_minmax(0,0.9fr)_176px] xl:items-start">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-base font-semibold text-ink-900">
                      {holding.companyName} ({holding.ticker})
                    </p>
                    <Badge tone={getStatusTone(holding.thesisStatus)}>{holding.thesisStatus}</Badge>
                    <Badge tone={holding.weight >= 20 ? "warning" : "default"}>{holding.weight}%</Badge>
                    <Badge tone="default">{holding.sector}</Badge>
                    <Badge tone="default">{holding.region}</Badge>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-slate-700">{holding.note}</p>

                  <div className="mt-3 grid gap-2 sm:grid-cols-4">
                    <div className="rounded-lg border border-slate-200/75 bg-slate-50/70 px-3 py-2.5">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-500">股數</p>
                      <p className="mt-1 text-sm font-medium text-ink-900">{formatNumber(holding.shares)}</p>
                    </div>
                    <div className="rounded-lg border border-slate-200/75 bg-slate-50/70 px-3 py-2.5">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-500">現價</p>
                      <p className="mt-1 text-sm font-medium text-ink-900">{formatCurrency(holding.currentPrice)}</p>
                    </div>
                    <div className="rounded-lg border border-slate-200/75 bg-slate-50/70 px-3 py-2.5">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-500">市值</p>
                      <p className="mt-1 text-sm font-medium text-ink-900">{formatCurrency(holding.marketValue)}</p>
                    </div>
                    <div className="rounded-lg border border-slate-200/75 bg-slate-50/70 px-3 py-2.5">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-500">成本</p>
                      <p className="mt-1 text-sm font-medium text-ink-900">{formatCurrency(holding.avgCost)}</p>
                    </div>
                  </div>
                </div>

                <div className="grid gap-2">
                  <div className="rounded-lg border border-slate-200/75 bg-slate-50/70 px-3.5 py-3">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-500">
                      下一個檢查點
                    </p>
                    {nextReminder ? (
                      <>
                        <div className="mt-1.5 flex flex-wrap items-center gap-2">
                          <Badge tone={getReminderTone(nextReminder)}>{nextReminder.type}</Badge>
                          <p className="text-sm font-medium text-ink-900">{nextReminder.title}</p>
                        </div>
                        <p className="mt-2 text-sm text-slate-700">{nextReminder.reason}</p>
                      </>
                    ) : (
                      <p className="mt-1.5 text-sm leading-6 text-slate-700">目前沒有排入提醒，維持定期複查。</p>
                    )}
                  </div>

                  <div className="rounded-lg border border-slate-200/75 bg-white/80 px-3.5 py-3">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-500">
                      下一步
                    </p>
                    <p className="mt-1.5 text-sm leading-6 text-ink-900">
                      {getHoldingNextStep(holding, nextReminder)}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <Link
                    to={`/stocks/${holding.ticker}`}
                    className="inline-flex items-center justify-center rounded-lg border border-ink-900 bg-ink-900 px-3 py-2 text-sm font-medium text-white transition hover:bg-ink-800"
                  >
                    看個股
                  </Link>
                  <Link
                    to={`/thesis/${holding.ticker}`}
                    className="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-ink-900 transition hover:border-slate-400"
                  >
                    看 Thesis
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      </SectionBlock>

      <div className="grid gap-4 lg:grid-cols-2">
        <SectionBlock title="產業配置" subtitle="確認組合是否過度暴露在同一種經濟驅動。">
          <div className="space-y-3">
            {Object.entries(sectorAllocation)
              .sort(([, left], [, right]) => right - left)
              .map(([sector, weight]) => (
                <div key={sector} className="rounded-lg border border-slate-200/75 bg-white/80 px-3.5 py-3">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-medium text-ink-900">{sector}</p>
                    <p className="text-sm font-medium text-slate-700">{weight}%</p>
                  </div>
                  <div className="mt-2 h-2 rounded-full bg-slate-100">
                    <div className="h-full rounded-full bg-ink-900" style={{ width: `${weight}%` }} />
                  </div>
                </div>
              ))}
          </div>
        </SectionBlock>

        <SectionBlock title="地區配置" subtitle="地區分散要連同政策、匯率與供應鏈一起看。">
          <div className="space-y-3">
            {Object.entries(regionAllocation)
              .sort(([, left], [, right]) => right - left)
              .map(([region, weight]) => (
                <div key={region} className="rounded-lg border border-slate-200/75 bg-white/80 px-3.5 py-3">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-medium text-ink-900">{region}</p>
                    <p className="text-sm font-medium text-slate-700">{weight}%</p>
                  </div>
                  <div className="mt-2 h-2 rounded-full bg-slate-100">
                    <div className="h-full rounded-full bg-rust-500" style={{ width: `${weight}%` }} />
                  </div>
                </div>
              ))}
          </div>
        </SectionBlock>
      </div>

      <SectionBlock
        title="配置理由"
        subtitle="保留你設計這個組合的原因，避免最後只剩下持股清單。"
      >
        <div className="grid gap-3 md:grid-cols-2">
          {portfolioNotes.map((note) => (
            <div key={note} className="rounded-xl border border-slate-200/75 bg-white/84 px-4 py-4">
              <p className="text-sm leading-6 text-slate-700">{note}</p>
            </div>
          ))}
        </div>
      </SectionBlock>
    </div>
  );
}
