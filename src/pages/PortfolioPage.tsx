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

function getHoldingNextStep(holding: PortfolioHolding) {
  if (holding.thesisStatus === "估值偏高") {
    return "先檢查估值區間，暫停新增部位。";
  }

  if (holding.thesisStatus === "需追蹤") {
    return "等下一次事件更新，再決定是否提高曝險。";
  }

  if (holding.weight >= 20) {
    return "回到 Thesis 確認高集中持有理由是否仍充分。";
  }

  return "維持持有，按節奏回頭檢查。";
}

function getReminderTone(reminder?: WorkspaceReminder) {
  if (!reminder) return "default" as const;
  if (reminder.status === "需處理") return "warning" as const;
  if (reminder.type === "估值") return "critical" as const;
  return "info" as const;
}

export function PortfolioPage() {
  const { reminders } = useWorkspaceState();
  const investedValue = portfolioHoldings.reduce((sum, holding) => sum + holding.marketValue, 0);
  const totalValue = investedValue + cashPosition.value;
  const topThreeWeight = [...portfolioHoldings]
    .sort((a, b) => b.weight - a.weight)
    .slice(0, 3)
    .reduce((sum, holding) => sum + holding.weight, 0);
  const topHolding = [...portfolioHoldings].sort((a, b) => b.weight - a.weight)[0];
  const sortedReminders = [...reminders]
    .filter((reminder) => reminder.progress !== "已完成")
    .sort((left, right) => left.date.localeCompare(right.date));
  const holdingsWithReminders = portfolioHoldings.map((holding) => ({
    holding,
    nextReminder: sortedReminders.find((reminder) => reminder.ticker === holding.ticker)
  }));

  const sectorAllocation = groupByWeight(
    portfolioHoldings.map((holding) => ({ key: holding.sector, weight: holding.weight }))
  );
  const regionAllocation = {
    ...groupByWeight(portfolioHoldings.map((holding) => ({ key: holding.region, weight: holding.weight }))),
    現金: cashPosition.weight
  };
  const [largestSectorLabel, largestSectorWeight] = Object.entries(sectorAllocation).sort(
    ([, left], [, right]) => right - left
  )[0];
  const [largestRegionLabel, largestRegionWeight] = Object.entries(regionAllocation).sort(
    ([, left], [, right]) => right - left
  )[0];

  return (
    <div className="space-y-4">
      <PageHeader
        eyebrow="Portfolio"
        title="投資組合工作台"
        description="先看配置哪裡需要回頭檢查，再決定是否調整單一持股。這一頁只回答組合健康度、集中風險與下一步。"
        actions={
          <>
            <Link
              to="/tracking"
              className="rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm font-medium text-ink-900 transition hover:border-slate-400"
            >
              看追蹤工作台
            </Link>
            <Link
              to="/thesis"
              className="rounded-lg border border-ink-900 bg-ink-900 px-3.5 py-2 text-sm font-medium text-white transition hover:bg-ink-800"
            >
              看 Thesis
            </Link>
          </>
        }
      />

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.08fr)_360px]">
        <SectionBlock
          title="先看配置哪裡要回頭"
          subtitle={`先用 ${mockSnapshot.asOfDate} 的組合 snapshot 找出最需要重新檢查的位置。`}
        >
          <div className="space-y-3">
            <div className="rounded-xl border border-amber-200/90 bg-amber-50/70 px-4 py-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-medium text-ink-900">最高權重持股</p>
                <Badge tone={topHolding.weight > 20 ? "warning" : "default"}>{topHolding.weight}%</Badge>
              </div>
              <p className="mt-2 text-base font-semibold text-ink-900">
                {topHolding.companyName} ({topHolding.ticker})
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                權重已高於自訂 20% 範圍，若下一次財報沒有同步提升長線報酬品質，應優先檢查減碼條件。
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Link
                  to={`/thesis/${topHolding.ticker}`}
                  className="inline-flex items-center rounded-lg border border-ink-900 bg-ink-900 px-3 py-2 text-sm font-medium text-white transition hover:bg-ink-800"
                >
                  看 Thesis
                </Link>
                <Link
                  to={`/stocks/${topHolding.ticker}`}
                  className="inline-flex items-center rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-ink-900 transition hover:border-slate-400"
                >
                  看個股
                </Link>
              </div>
            </div>

            <div className="grid gap-3 lg:grid-cols-2">
              <div className="rounded-xl border border-slate-200/80 bg-white/80 px-4 py-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-medium text-ink-900">最大產業曝險</p>
                  <Badge tone="info">{largestSectorWeight}%</Badge>
                </div>
                <p className="mt-2 text-base font-semibold text-ink-900">{largestSectorLabel}</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  這是目前最需要一起檢查景氣、定價權與政策風險的配置來源。
                </p>
              </div>

              <div className="rounded-xl border border-slate-200/80 bg-white/80 px-4 py-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-medium text-ink-900">最大地區曝險</p>
                  <Badge tone="info">{largestRegionWeight}%</Badge>
                </div>
                <p className="mt-2 text-base font-semibold text-ink-900">{largestRegionLabel}</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  要連同政策、匯率與需求來源一起看，不只是地圖上的分散程度。
                </p>
              </div>
            </div>
          </div>
        </SectionBlock>

        <SectionBlock
          title="配置摘要"
          subtitle="先確認資產結構，再決定是否需要做新的配置動作。"
        >
          <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
            <div className="rounded-xl border border-slate-200/80 bg-white/80 px-3.5 py-3">
              <p className="text-[11px] uppercase tracking-[0.22em] text-slate-500">總資產</p>
              <p className="mt-1.5 text-xl font-semibold tracking-tight text-ink-900">
                {formatCurrency(totalValue)}
              </p>
              <p className="mt-1 text-sm text-slate-600">已投資 {formatCurrency(investedValue)}</p>
            </div>
            <div className="rounded-xl border border-amber-200/90 bg-amber-50/75 px-3.5 py-3">
              <p className="text-[11px] uppercase tracking-[0.22em] text-amber-800">前 3 大持股</p>
              <p className="mt-1.5 text-2xl font-semibold tracking-tight text-ink-900">{topThreeWeight}%</p>
              <p className="mt-1 text-sm text-slate-600">高集中，需要更高 thesis 清晰度</p>
            </div>
            <div className="rounded-xl border border-slate-200/80 bg-white/80 px-3.5 py-3">
              <p className="text-[11px] uppercase tracking-[0.22em] text-slate-500">持股數量</p>
              <p className="mt-1.5 text-2xl font-semibold tracking-tight text-ink-900">
                {portfolioHoldings.length} 檔
              </p>
              <p className="mt-1 text-sm text-slate-600">刻意保持少而精</p>
            </div>
            <div className="rounded-xl border border-slate-200/80 bg-white/80 px-3.5 py-3">
              <p className="text-[11px] uppercase tracking-[0.22em] text-slate-500">現金部位</p>
              <p className="mt-1.5 text-2xl font-semibold tracking-tight text-ink-900">
                {cashPosition.weight}%
              </p>
              <p className="mt-1 text-sm text-slate-600">保留給估值更好的時點</p>
            </div>
          </div>
        </SectionBlock>
      </div>

      <SectionBlock
        title="持股與下一步"
        subtitle="每一檔持股都要能回答三件事：目前狀態、下一個檢查點、你要做什麼。"
      >
        <div className="space-y-3">
          {holdingsWithReminders.map(({ holding, nextReminder }) => (
            <div key={holding.id} className="rounded-xl border border-slate-200/80 bg-white/80 px-4 py-4">
              <div className="grid gap-4 xl:grid-cols-[minmax(0,1.1fr)_220px_220px]">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-base font-semibold text-ink-900">
                      {holding.companyName} ({holding.ticker})
                    </p>
                    <Badge tone={getStatusTone(holding.thesisStatus)}>{holding.thesisStatus}</Badge>
                    <Badge tone={holding.weight > 20 ? "warning" : "default"}>{holding.weight}%</Badge>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{holding.note}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Badge tone="default">{holding.sector}</Badge>
                    <Badge tone="default">{holding.region}</Badge>
                  </div>
                </div>

                <div className="rounded-lg border border-slate-200/80 bg-sand-50/70 px-3.5 py-3">
                  <p className="text-[11px] uppercase tracking-[0.22em] text-slate-500">下一個檢查點</p>
                  {nextReminder ? (
                    <>
                      <div className="mt-1.5 flex flex-wrap items-center gap-2">
                        <Badge tone={getReminderTone(nextReminder)}>{nextReminder.type}</Badge>
                        <Badge tone={nextReminder.progress === "處理中" ? "info" : "default"}>
                          {nextReminder.progress}
                        </Badge>
                        <p className="text-sm font-medium text-ink-900">{nextReminder.title}</p>
                      </div>
                      <p className="mt-2 text-sm text-slate-600">{nextReminder.reason}</p>
                    </>
                  ) : (
                    <p className="mt-1.5 text-sm leading-6 text-slate-600">目前沒有排入提醒，維持定期複查。</p>
                  )}
                </div>

                <div className="rounded-lg border border-slate-200/80 bg-white/75 px-3.5 py-3">
                  <p className="text-[11px] uppercase tracking-[0.22em] text-slate-500">下一步</p>
                  <p className="mt-1.5 text-sm leading-6 text-ink-900">{getHoldingNextStep(holding)}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Link
                      to={`/stocks/${holding.ticker}`}
                      className="inline-flex items-center rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-ink-900 transition hover:border-slate-400"
                    >
                      看個股
                    </Link>
                    <Link
                      to={`/thesis/${holding.ticker}`}
                      className="inline-flex items-center rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-ink-900 transition hover:border-slate-400"
                    >
                      看 Thesis
                    </Link>
                  </div>
                </div>
              </div>

              <div className="mt-4 grid gap-3 md:grid-cols-4">
                <div className="rounded-lg border border-slate-200/80 bg-sand-50/70 px-3 py-2.5">
                  <p className="text-[11px] uppercase tracking-[0.22em] text-slate-500">股數</p>
                  <p className="mt-1 text-sm font-medium text-ink-900">{formatNumber(holding.shares)}</p>
                </div>
                <div className="rounded-lg border border-slate-200/80 bg-sand-50/70 px-3 py-2.5">
                  <p className="text-[11px] uppercase tracking-[0.22em] text-slate-500">現價</p>
                  <p className="mt-1 text-sm font-medium text-ink-900">{formatCurrency(holding.currentPrice)}</p>
                </div>
                <div className="rounded-lg border border-slate-200/80 bg-sand-50/70 px-3 py-2.5">
                  <p className="text-[11px] uppercase tracking-[0.22em] text-slate-500">市值</p>
                  <p className="mt-1 text-sm font-medium text-ink-900">{formatCurrency(holding.marketValue)}</p>
                </div>
                <div className="rounded-lg border border-slate-200/80 bg-sand-50/70 px-3 py-2.5">
                  <p className="text-[11px] uppercase tracking-[0.22em] text-slate-500">成本</p>
                  <p className="mt-1 text-sm font-medium text-ink-900">{formatCurrency(holding.avgCost)}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </SectionBlock>

      <div className="grid gap-4 lg:grid-cols-2">
        <SectionBlock
          title="產業配置"
          subtitle="確認組合是否過度暴露於同一種經濟驅動。"
        >
          <div className="space-y-3">
            {Object.entries(sectorAllocation)
              .sort(([, left], [, right]) => right - left)
              .map(([sector, weight]) => (
                <div key={sector} className="rounded-lg border border-slate-200/80 bg-white/75 px-3.5 py-3">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-medium text-ink-900">{sector}</p>
                    <p className="text-sm font-medium text-slate-600">{weight}%</p>
                  </div>
                  <div className="mt-2 h-2 rounded-full bg-slate-100">
                    <div className="h-full rounded-full bg-ink-900" style={{ width: `${weight}%` }} />
                  </div>
                </div>
              ))}
          </div>
        </SectionBlock>

        <SectionBlock
          title="地區配置"
          subtitle="地區分散要連同政策與供應鏈一起看。"
        >
          <div className="space-y-3">
            {Object.entries(regionAllocation)
              .sort(([, left], [, right]) => right - left)
              .map(([region, weight]) => (
                <div key={region} className="rounded-lg border border-slate-200/80 bg-white/75 px-3.5 py-3">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-medium text-ink-900">{region}</p>
                    <p className="text-sm font-medium text-slate-600">{weight}%</p>
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
        title="組合設計原則"
        subtitle="保留你設計這個組合的原因，避免最後只剩下持股清單。"
      >
        <div className="grid gap-3 md:grid-cols-2">
          {portfolioNotes.map((note) => (
            <div key={note} className="rounded-xl border border-slate-200/80 bg-sand-50/70 px-4 py-4">
              <p className="text-sm leading-6 text-slate-600">{note}</p>
            </div>
          ))}
        </div>
      </SectionBlock>
    </div>
  );
}
