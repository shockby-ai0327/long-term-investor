import { Link, useParams } from "react-router-dom";
import { Badge } from "../components/Badge";
import { MetricCard } from "../components/MetricCard";
import { PageHeader } from "../components/PageHeader";
import { ScoreBadge } from "../components/ScoreBadge";
import { SectionBlock } from "../components/SectionBlock";
import { Sparkline } from "../components/Sparkline";
import { ValuationBand } from "../components/ValuationBand";
import { getStockByTicker, stocks } from "../data/mockData";
import { formatBillion, formatCurrency, formatDate, formatPercent } from "../utils/format";

type BadgeTone = "default" | "positive" | "warning" | "critical" | "info";

const riskWeight = {
  低: 1,
  中: 2,
  高: 3
} as const;

function getRiskTone(level: "低" | "中" | "高"): BadgeTone {
  if (level === "低") return "positive";
  if (level === "中") return "warning";
  return "critical";
}

function getEventTone(impact: "正向" | "中性" | "需留意"): BadgeTone {
  if (impact === "正向") return "positive";
  if (impact === "中性") return "default";
  return "warning";
}

function getValuationPosition(current: number, median: number, high: number) {
  if (current <= median) {
    return {
      label: "低於中位",
      tone: "positive" as const,
      summary: `PE ${current.toFixed(1)}x，低於 ${median.toFixed(1)}x 中位數。`
    };
  }

  if (current >= high * 0.9) {
    return {
      label: "接近高檔",
      tone: "critical" as const,
      summary: `PE ${current.toFixed(1)}x，接近 ${high.toFixed(1)}x 高檔區間。`
    };
  }

  return {
    label: "合理偏上",
    tone: "warning" as const,
    summary: `PE ${current.toFixed(1)}x，高於 ${median.toFixed(1)}x 中位數。`
  };
}

function HeaderMetric({
  label,
  value,
  detail,
  tone = "default"
}: {
  label: string;
  value: string;
  detail: string;
  tone?: "default" | "positive" | "warning";
}) {
  const toneMap = {
    default: "border-slate-200/80 bg-white/82",
    positive: "border-emerald-200/80 bg-emerald-50/55",
    warning: "border-amber-200/80 bg-amber-50/55"
  };

  return (
    <div className={`rounded-lg border px-3.5 py-3 ${toneMap[tone]}`}>
      <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-slate-500">{label}</p>
      <p className="mt-1.5 text-[1.15rem] font-semibold tracking-tight text-ink-900">{value}</p>
      <p className="mt-1 text-xs leading-5 text-slate-500">{detail}</p>
    </div>
  );
}

function FactRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid gap-1 border-b border-slate-200/75 py-3 last:border-b-0 last:pb-0 first:pt-0 sm:grid-cols-[88px_minmax(0,1fr)]">
      <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-400">{label}</p>
      <p className="text-sm leading-6 text-ink-900">{value}</p>
    </div>
  );
}

export function StockDetailPage() {
  const params = useParams();
  const stock = getStockByTicker(params.ticker);

  const riskItems = [
    { label: "產業循環", risk: stock.riskProfile.industryCycle },
    { label: "政策與地緣", risk: stock.riskProfile.policy },
    { label: "客戶集中", risk: stock.riskProfile.customerConcentration },
    { label: "財務結構", risk: stock.riskProfile.financial }
  ];
  const latestEvent = [...stock.recentEvents].sort((left, right) => right.date.localeCompare(left.date))[0];
  const primaryRisk = [...riskItems].sort(
    (left, right) => riskWeight[right.risk.level] - riskWeight[left.risk.level]
  )[0];
  const valuationPosition = getValuationPosition(
    stock.valuationMetrics.pe.current,
    stock.valuationMetrics.pe.median,
    stock.valuationMetrics.pe.high
  );
  const scoreItems = [
    stock.scores.quality,
    stock.scores.growth,
    stock.scores.valuation,
    stock.scores.risk,
    stock.scores.overall
  ];
  const investmentView = [
    {
      label: "核心觀點",
      value: stock.summary
    },
    {
      label: "目前判斷",
      value: stock.conclusion
    },
    {
      label: "估值立場",
      value: stock.valuationMetrics.summary
    }
  ];
  const focusItems = [
    {
      label: "目前爭點",
      title: latestEvent.title,
      detail: latestEvent.summary
    },
    {
      label: "改變 thesis 的變數",
      title: primaryRisk.risk.watchpoint,
      detail: primaryRisk.risk.summary
    },
    {
      label: "本輪追蹤",
      title: stock.riskProfile.industryCycle.watchpoint,
      detail: stock.scores.growth.summary
    }
  ];
  const monitoringItems = [
    {
      label: "需求與利用率",
      detail: stock.riskProfile.industryCycle.watchpoint,
      affects: "成長判斷"
    },
    {
      label: "政策與地緣",
      detail: stock.riskProfile.policy.watchpoint,
      affects: "風險折價"
    },
    {
      label: "海外擴產",
      detail: stock.riskProfile.financial.watchpoint,
      affects: "毛利率 / ROIC"
    },
    {
      label: "客戶結構",
      detail: stock.riskProfile.customerConcentration.watchpoint,
      affects: "AI 需求延續"
    }
  ];

  return (
    <div className="space-y-4">
      <div className="panel overflow-x-auto p-1.5">
        <div className="flex min-w-max gap-1.5">
          {stocks.map((candidate) => {
            const active = candidate.ticker === stock.ticker;

            return (
              <Link
                key={candidate.id}
                to={`/stocks/${candidate.ticker}`}
                className={`group rounded-[10px] px-3 py-2.5 transition ${
                  active
                    ? "bg-ink-900 text-white"
                    : "border border-transparent bg-white/70 text-ink-900 hover:border-slate-200 hover:bg-white"
                }`}
              >
                <div className="flex items-baseline gap-2">
                  <p className="text-sm font-semibold tracking-[0.02em]">{candidate.ticker}</p>
                  <p className={`text-[11px] ${active ? "text-white/70" : "text-slate-500"}`}>
                    {candidate.companyName}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      <PageHeader
        variant="research"
        eyebrow="個股研究"
        title={`${stock.companyName} · ${stock.ticker}`}
        description={stock.conclusion}
        meta={
          <>
            <span>{stock.market}</span>
            <span>{stock.sector}</span>
            <span>{stock.industry}</span>
            <span>{stock.region}</span>
            <span>最後檢查 {formatDate(stock.lastReviewed)}</span>
          </>
        }
        details={
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <HeaderMetric
              label="目前價格"
              value={formatCurrency(stock.currentPrice, stock.currency)}
              detail={`${stock.market} 掛牌`}
            />
            <HeaderMetric
              label="市值"
              value={formatBillion(stock.marketCapBillion, stock.currency)}
              detail={`${stock.sector} / ${stock.region}`}
            />
            <HeaderMetric
              label="估值位置"
              value={`${stock.valuationMetrics.pe.current.toFixed(1)}x PE`}
              detail={valuationPosition.summary}
              tone={valuationPosition.tone === "positive" ? "positive" : "warning"}
            />
            <HeaderMetric
              label="綜合判斷"
              value={`${stock.scores.overall.score.toFixed(1)} / 10`}
              detail={stock.scores.overall.summary}
              tone="positive"
            />
          </div>
        }
        aside={
          <div className="space-y-4">
            <div className="border-b border-slate-200/80 pb-4">
              <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-slate-500">
                最近關鍵催化
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <Badge tone={getEventTone(latestEvent.impact)}>{latestEvent.category}</Badge>
                <span className="text-xs text-slate-500">{formatDate(latestEvent.date)}</span>
              </div>
              <p className="mt-2 text-sm font-medium text-ink-900">{latestEvent.title}</p>
              <p className="mt-1 text-sm leading-6 text-slate-600">{latestEvent.summary}</p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between gap-3">
                <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-slate-500">
                  估值判斷
                </p>
                <Badge tone={valuationPosition.tone}>{valuationPosition.label}</Badge>
              </div>
              <p className="text-sm leading-6 text-slate-600">{stock.valuationMetrics.summary}</p>
            </div>

            <div className="flex flex-wrap gap-2">
              <Link
                to={`/thesis/${stock.ticker}`}
                className="rounded-lg bg-ink-900 px-3.5 py-2 text-sm font-medium text-white transition hover:bg-ink-800"
              >
                更新投資假設
              </Link>
              <Link
                to="/tracking"
                className="rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm font-medium text-ink-900 transition hover:border-slate-400"
              >
                打開追蹤工作台
              </Link>
            </div>
          </div>
        }
      />

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-4">
          <SectionBlock title="投資判斷">
            <div className="grid gap-5 xl:grid-cols-[minmax(0,1.1fr)_0.9fr]">
              <div className="space-y-1">
                {investmentView.map((item) => (
                  <div
                    key={item.label}
                    className="grid gap-1 border-b border-slate-200/75 py-3 last:border-b-0 last:pb-0 first:pt-0 sm:grid-cols-[92px_minmax(0,1fr)]"
                  >
                    <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-400">
                      {item.label}
                    </p>
                    <p className="text-sm leading-6 text-slate-700">{item.value}</p>
                  </div>
                ))}
              </div>

              <div className="space-y-1">
                <FactRow label="市場" value={stock.market} />
                <FactRow label="產業" value={`${stock.sector} / ${stock.industry}`} />
                <FactRow label="地區" value={stock.region} />
                <FactRow label="總部" value={stock.headquarters} />
                <FactRow label="成立" value={`${stock.foundedYear}`} />
                <FactRow label="網站" value={stock.website.replace("https://www.", "")} />
              </div>
            </div>
          </SectionBlock>

          <SectionBlock title="現在最重要">
            <div className="grid gap-3 xl:grid-cols-3">
              {focusItems.map((item) => (
                <div key={item.label} className="rounded-lg border border-slate-200/80 bg-white/82 px-3.5 py-3">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-500">
                    {item.label}
                  </p>
                  <p className="mt-2 text-sm font-medium leading-6 text-ink-900">{item.title}</p>
                  <p className="mt-1 text-xs leading-5 text-slate-500">{item.detail}</p>
                </div>
              ))}
            </div>
          </SectionBlock>

          <SectionBlock
            title="估值位置"
            action={<Badge tone={valuationPosition.tone}>{valuationPosition.label}</Badge>}
          >
            <div className="flex flex-col gap-2 border-b border-slate-200/75 pb-4 md:flex-row md:items-end md:justify-between">
              <p className="text-sm leading-6 text-slate-600">{stock.valuationMetrics.summary}</p>
              <p className="text-xs text-slate-500">{valuationPosition.summary}</p>
            </div>

            <div className="mt-4 grid gap-4 lg:grid-cols-3">
              <div className="rounded-lg border border-slate-200/80 bg-white/82 p-4">
                <ValuationBand
                  label="PE"
                  low={stock.valuationMetrics.pe.low}
                  median={stock.valuationMetrics.pe.median}
                  high={stock.valuationMetrics.pe.high}
                  current={stock.valuationMetrics.pe.current}
                />
                <div className="mt-4 border-t border-slate-200/75 pt-3">
                  <Sparkline values={stock.valuationMetrics.pe.historical} />
                </div>
              </div>

              <div className="rounded-lg border border-slate-200/80 bg-white/82 p-4">
                <ValuationBand
                  label="PB"
                  low={stock.valuationMetrics.pb.low}
                  median={stock.valuationMetrics.pb.median}
                  high={stock.valuationMetrics.pb.high}
                  current={stock.valuationMetrics.pb.current}
                />
                <div className="mt-4 border-t border-slate-200/75 pt-3">
                  <Sparkline values={stock.valuationMetrics.pb.historical} stroke="#a56f53" />
                </div>
              </div>

              <div className="rounded-lg border border-slate-200/80 bg-white/82 p-4">
                <ValuationBand
                  label="PEG"
                  low={stock.valuationMetrics.peg.low}
                  median={stock.valuationMetrics.peg.median}
                  high={stock.valuationMetrics.peg.high}
                  current={stock.valuationMetrics.peg.current}
                />
                <div className="mt-4 border-t border-slate-200/75 pt-3">
                  <Sparkline values={stock.valuationMetrics.peg.historical} stroke="#2f5c85" />
                </div>
              </div>
            </div>
          </SectionBlock>

          <SectionBlock title="品質與成長">
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <MetricCard
                label="營收 CAGR"
                value={formatPercent(stock.financialMetrics.revenueCagr3Y)}
                hint={`3Y / 5Y ${formatPercent(stock.financialMetrics.revenueCagr5Y)} / 10Y ${formatPercent(stock.financialMetrics.revenueCagr10Y)}`}
                tone="positive"
              />
              <MetricCard
                label="EPS CAGR"
                value={formatPercent(stock.financialMetrics.epsCagr3Y)}
                hint={`3Y / 5Y ${formatPercent(stock.financialMetrics.epsCagr5Y)} / 10Y ${formatPercent(stock.financialMetrics.epsCagr10Y)}`}
                tone="positive"
              />
              <MetricCard
                label="毛利率"
                value={formatPercent(stock.financialMetrics.grossMargin)}
                hint="產品組合 / 成本結構"
              />
              <MetricCard
                label="營業利益率"
                value={formatPercent(stock.financialMetrics.operatingMargin)}
                hint="營運效率"
              />
              <MetricCard
                label="ROE"
                value={formatPercent(stock.financialMetrics.roe)}
                hint="股東權益報酬"
              />
              <MetricCard
                label="ROIC"
                value={formatPercent(stock.financialMetrics.roic)}
                hint="資本回收品質"
              />
              <MetricCard
                label="自由現金流"
                value={formatBillion(stock.financialMetrics.freeCashFlowBillion, stock.currency)}
                hint="現金流轉化"
              />
              <MetricCard
                label="負債比"
                value={stock.financialMetrics.debtToEquity.toFixed(2)}
                hint="資本結構"
              />
            </div>
          </SectionBlock>

          <SectionBlock title="商業模式與護城河">
            <div className="grid gap-5 xl:grid-cols-[minmax(0,1.05fr)_0.95fr]">
              <div className="space-y-5">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-slate-500">
                    商業模式
                  </p>
                  <p className="mt-2 text-sm leading-7 text-slate-600">{stock.businessModel}</p>
                </div>

                <div className="space-y-1">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-slate-500">
                    產業位置
                  </p>
                  {stock.positioning.map((point) => (
                    <div
                      key={point}
                      className="border-b border-slate-200/75 py-3 last:border-b-0 last:pb-0 first:pt-0"
                    >
                      <p className="text-sm leading-6 text-slate-700">{point}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-5">
                <div className="space-y-3">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-slate-500">
                    收入結構
                  </p>
                  {stock.revenueSegments.map((segment) => (
                    <div key={segment.name} className="rounded-lg border border-slate-200/80 bg-white/82 px-3.5 py-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-ink-900">{segment.name}</p>
                          <p className="mt-1 text-xs leading-5 text-slate-500">{segment.detail}</p>
                        </div>
                        <p className="shrink-0 text-sm font-semibold text-ink-900">{segment.share}%</p>
                      </div>
                      <div className="mt-3 h-1.5 rounded-full bg-slate-100">
                        <div className="h-full rounded-full bg-sage-600" style={{ width: `${segment.share}%` }} />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="space-y-1">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-slate-500">
                    護城河
                  </p>
                  {stock.moat.map((item) => (
                    <div
                      key={item.label}
                      className="grid gap-2 border-b border-slate-200/75 py-3 last:border-b-0 last:pb-0 first:pt-0 sm:grid-cols-[minmax(0,1fr)_auto]"
                    >
                      <div>
                        <p className="text-sm font-medium text-ink-900">{item.label}</p>
                        <p className="mt-1 text-xs leading-5 text-slate-500">{item.summary}</p>
                      </div>
                      <p className="text-sm font-semibold text-ink-900">{item.score.toFixed(1)} / 10</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </SectionBlock>

          <SectionBlock title="核心風險">
            <div className="space-y-0 divide-y divide-slate-200/75">
              {riskItems.map(({ label, risk }) => (
                <div key={label} className="grid gap-3 py-4 md:grid-cols-[140px_minmax(0,1fr)_220px]">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-ink-900">{label}</p>
                    <Badge tone={getRiskTone(risk.level)}>{risk.level} 風險</Badge>
                  </div>
                  <p className="text-sm leading-6 text-slate-600">{risk.summary}</p>
                  <p className="text-xs leading-5 text-slate-500">{risk.watchpoint}</p>
                </div>
              ))}
            </div>
          </SectionBlock>

          <SectionBlock
            title="追蹤重點"
            action={
              <Link to="/tracking" className="text-sm font-medium text-sage-700 transition hover:text-sage-800">
                打開追蹤工作台
              </Link>
            }
          >
            <div className="space-y-0 divide-y divide-slate-200/75">
              {monitoringItems.map((item) => (
                <div key={item.label} className="grid gap-2 py-4 md:grid-cols-[132px_minmax(0,1fr)_108px]">
                  <p className="text-sm font-medium text-ink-900">{item.label}</p>
                  <p className="text-sm leading-6 text-slate-600">{item.detail}</p>
                  <p className="text-xs leading-5 text-slate-500 md:text-right">{item.affects}</p>
                </div>
              ))}
            </div>
          </SectionBlock>

          <SectionBlock title="近期事件">
            <div className="space-y-0 divide-y divide-slate-200/75">
              {stock.recentEvents.map((event) => (
                <div key={event.id} className="grid gap-3 py-4 md:grid-cols-[124px_minmax(0,1fr)]">
                  <div className="space-y-2">
                    <p className="text-xs text-slate-500">{formatDate(event.date)}</p>
                    <div className="flex flex-wrap gap-2">
                      <Badge tone={getEventTone(event.impact)}>{event.category}</Badge>
                    </div>
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-sm font-medium text-ink-900">{event.title}</h3>
                      <span className="text-xs text-slate-500">{event.impact}</span>
                    </div>
                    <p className="mt-1 text-sm leading-6 text-slate-600">{event.summary}</p>
                  </div>
                </div>
              ))}
            </div>
          </SectionBlock>
        </div>

        <div className="xl:sticky xl:top-4 xl:self-start">
          <div className="panel px-4 py-4 sm:px-5">
            <div className="border-b border-slate-200/75 pb-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-slate-500">
                    研究摘要
                  </p>
                  <p className="mt-2 text-[2rem] font-semibold tracking-tight text-ink-900">
                    {stock.scores.overall.score.toFixed(1)}
                  </p>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-400">
                    總分 / 10
                  </p>
                </div>
                <Badge tone={valuationPosition.tone}>{valuationPosition.label}</Badge>
              </div>
              <p className="mt-3 text-sm leading-6 text-slate-600">{stock.scores.overall.summary}</p>
            </div>

            <div className="mt-4">
              <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-slate-500">
                因子摘要
              </p>
              <div className="mt-3">
                {scoreItems.map((score) => (
                  <ScoreBadge key={score.label} {...score} />
                ))}
              </div>
            </div>

            <div className="mt-4 border-t border-slate-200/75 pt-4">
              <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-slate-500">
                需要看什麼
              </p>
              <div className="mt-3 space-y-3">
                {monitoringItems.slice(0, 3).map((item) => (
                  <div key={item.label} className="rounded-lg border border-slate-200/80 bg-white/82 px-3.5 py-3">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-medium text-ink-900">{item.label}</p>
                      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                        {item.affects}
                      </p>
                    </div>
                    <p className="mt-1 text-xs leading-5 text-slate-500">{item.detail}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-4 border-t border-slate-200/75 pt-4">
              <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-slate-500">
                下一步
              </p>
              <div className="mt-3 flex flex-col gap-2">
                <Link
                  to={`/thesis/${stock.ticker}`}
                  className="rounded-lg bg-ink-900 px-3.5 py-2.5 text-center text-sm font-medium text-white transition hover:bg-ink-800"
                >
                  更新投資假設
                </Link>
                <Link
                  to="/tracking"
                  className="rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-center text-sm font-medium text-ink-900 transition hover:border-slate-400"
                >
                  回到追蹤工作台
                </Link>
                <Link
                  to="/watchlist"
                  className="rounded-lg border border-transparent px-3.5 py-2.5 text-center text-sm font-medium text-slate-600 transition hover:border-slate-200 hover:bg-white"
                >
                  回到觀察名單
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
