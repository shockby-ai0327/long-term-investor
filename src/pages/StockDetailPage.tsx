import { Link, useParams } from "react-router-dom";
import { Badge } from "../components/Badge";
import { MetricCard } from "../components/MetricCard";
import { PageHeader } from "../components/PageHeader";
import { ScoreBadge } from "../components/ScoreBadge";
import { SectionBlock } from "../components/SectionBlock";
import { Sparkline } from "../components/Sparkline";
import { ValuationBand } from "../components/ValuationBand";
import { getStockByTicker, stocks } from "../data/mockData";
import { formatBillion, formatCompactNumber, formatCurrency, formatDate, formatPercent } from "../utils/format";

function getRiskTone(level: "低" | "中" | "高") {
  if (level === "低") return "positive";
  if (level === "中") return "warning";
  return "critical";
}

export function StockDetailPage() {
  const params = useParams();
  const stock = getStockByTicker(params.ticker);

  return (
    <div className="space-y-4">
      <PageHeader
        eyebrow="Stock Detail"
        title={`${stock.companyName} (${stock.ticker})`}
        description={stock.summary}
        actions={
          <>
            <Link
              to={`/thesis/${stock.ticker}`}
              className="rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm font-medium text-ink-900 transition hover:border-slate-400"
            >
              打開投資假設
            </Link>
            <Link
              to="/watchlist"
              className="rounded-lg bg-ink-900 px-3.5 py-2 text-sm font-medium text-white transition hover:bg-ink-800"
            >
              回到觀察名單
            </Link>
          </>
        }
      />

      <div className="panel overflow-x-auto p-3">
        <div className="flex min-w-max gap-3">
          {stocks.map((candidate) => (
            <Link
              key={candidate.id}
              to={`/stocks/${candidate.ticker}`}
              className={`rounded-lg border px-4 py-3 transition ${
                candidate.ticker === stock.ticker
                  ? "border-ink-900 bg-ink-900 text-white"
                  : "border-slate-200 bg-white/75 text-ink-900 hover:border-slate-300"
              }`}
            >
              <p className="text-xs uppercase tracking-[0.24em] text-current/70">{candidate.ticker}</p>
              <p className="mt-1 text-sm font-medium">{candidate.companyName}</p>
            </Link>
          ))}
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.1fr_0.62fr]">
        <div className="space-y-4">
          <SectionBlock
            title="公司基本資料"
            subtitle="先建立企業輪廓，再決定該把研究力氣放在哪裡。"
          >
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              <MetricCard
                label="目前價格"
                value={formatCurrency(stock.currentPrice, stock.currency)}
                hint={`${stock.market} 上市，最新檢查日期 ${formatDate(stock.lastReviewed)}`}
              />
              <MetricCard
                label="市值"
                value={`${formatCompactNumber(stock.marketCapBillion)}B`}
                hint="用來理解公司規模與未來增速的基數。"
              />
              <MetricCard
                label="產業定位"
                value={stock.industry}
                hint={`${stock.sector} / ${stock.region}`}
              />
              <MetricCard
                label="總部"
                value={stock.headquarters}
                hint={`成立於 ${stock.foundedYear} 年`}
              />
              <MetricCard
                label="公司網站"
                value={stock.website.replace("https://www.", "")}
                hint="未來可延伸到 filings、IR 與供應鏈資料。"
              />
              <MetricCard
                label="投資結論"
                value={`${stock.scores.overall.score.toFixed(1)} / 10`}
                hint={stock.scores.overall.summary}
                tone="positive"
              />
            </div>
          </SectionBlock>

          <SectionBlock
            title="商業模式說明"
            subtitle="長線投資先看企業如何賺錢，收入是否具備可持續性。"
          >
            <p className="max-w-4xl text-[15px] leading-8 text-slate-600">{stock.businessModel}</p>
          </SectionBlock>

          <SectionBlock
            title="收入來源結構"
            subtitle="看收入是怎麼組成的，才能判斷成長是不是健康、是否集中在單一引擎。"
          >
            <div className="space-y-4">
              {stock.revenueSegments.map((segment) => (
                <div key={segment.name} className="rounded-xl border border-slate-200/80 bg-sand-50/60 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-base font-semibold text-ink-900">{segment.name}</p>
                      <p className="mt-2 text-sm leading-6 text-slate-600">{segment.detail}</p>
                    </div>
                    <p className="text-2xl font-semibold text-ink-900">{segment.share}%</p>
                  </div>
                  <div className="mt-4 h-2 rounded-full bg-white">
                    <div
                      className="h-full rounded-full bg-sage-600"
                      style={{ width: `${segment.share}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </SectionBlock>

          <SectionBlock
            title="產業定位與競爭優勢"
            subtitle="這一段不是講故事，而是確認公司在產業鏈中的不可替代性與議價能力。"
          >
            <div className="space-y-3">
              {stock.positioning.map((point) => (
                <div key={point} className="rounded-lg border border-slate-200/80 bg-white/80 p-4">
                  <p className="text-sm leading-7 text-slate-600">{point}</p>
                </div>
              ))}
            </div>
          </SectionBlock>

          <SectionBlock
            title="護城河分析"
            subtitle="把抽象的競爭優勢拆成可檢查的結構。"
          >
            <div className="space-y-4">
              {stock.moat.map((item) => (
                <div key={item.label} className="rounded-xl border border-slate-200/80 bg-sand-50/60 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-base font-semibold text-ink-900">{item.label}</p>
                    <p className="text-sm font-medium text-sage-600">{item.score.toFixed(1)} / 10</p>
                  </div>
                  <div className="mt-4 h-2 rounded-full bg-white">
                    <div
                      className="h-full rounded-full bg-ink-900"
                      style={{ width: `${item.score * 10}%` }}
                    />
                  </div>
                  <p className="mt-3 text-sm leading-6 text-slate-600">{item.summary}</p>
                </div>
              ))}
            </div>
          </SectionBlock>

          <SectionBlock
            title="財務指標總覽"
            subtitle="這一頁的指標不是炫技，而是用來回答企業是否真的有複利品質。"
          >
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              <MetricCard
                label="營收 CAGR (3Y)"
                value={formatPercent(stock.financialMetrics.revenueCagr3Y)}
                hint={`5Y ${formatPercent(stock.financialMetrics.revenueCagr5Y)} / 10Y ${formatPercent(stock.financialMetrics.revenueCagr10Y)}`}
                tone="positive"
              />
              <MetricCard
                label="EPS CAGR (3Y)"
                value={formatPercent(stock.financialMetrics.epsCagr3Y)}
                hint={`5Y ${formatPercent(stock.financialMetrics.epsCagr5Y)} / 10Y ${formatPercent(stock.financialMetrics.epsCagr10Y)}`}
                tone="positive"
              />
              <MetricCard
                label="毛利率"
                value={formatPercent(stock.financialMetrics.grossMargin)}
                hint="用來看產品價值與成本結構是否穩定。"
              />
              <MetricCard
                label="營業利益率"
                value={formatPercent(stock.financialMetrics.operatingMargin)}
                hint="代表公司把成長轉為營運效率的能力。"
              />
              <MetricCard
                label="ROE"
                value={formatPercent(stock.financialMetrics.roe)}
                hint="高 ROE 要搭配財務槓桿一起看。"
              />
              <MetricCard
                label="ROIC"
                value={formatPercent(stock.financialMetrics.roic)}
                hint="是長線複利品質的核心指標之一。"
              />
              <MetricCard
                label="自由現金流"
                value={formatBillion(stock.financialMetrics.freeCashFlowBillion, stock.currency)}
                hint="看成長是否能真正轉成可分配現金。"
              />
              <MetricCard
                label="負債比"
                value={stock.financialMetrics.debtToEquity.toFixed(2)}
                hint="負債比不高，風險主要不在槓桿。"
              />
            </div>
          </SectionBlock>

          <SectionBlock
            title="歷史估值區間"
            subtitle="估值判斷不是猜今天高低，而是確認目前價格落在長期區間的哪裡。"
          >
            <div className="grid gap-4 lg:grid-cols-3">
              <div className="space-y-3 rounded-xl border border-slate-200/80 bg-white/80 p-4">
                <ValuationBand
                  label="PE"
                  low={stock.valuationMetrics.pe.low}
                  median={stock.valuationMetrics.pe.median}
                  high={stock.valuationMetrics.pe.high}
                  current={stock.valuationMetrics.pe.current}
                />
                <Sparkline values={stock.valuationMetrics.pe.historical} />
              </div>
              <div className="space-y-3 rounded-xl border border-slate-200/80 bg-white/80 p-4">
                <ValuationBand
                  label="PB"
                  low={stock.valuationMetrics.pb.low}
                  median={stock.valuationMetrics.pb.median}
                  high={stock.valuationMetrics.pb.high}
                  current={stock.valuationMetrics.pb.current}
                />
                <Sparkline values={stock.valuationMetrics.pb.historical} stroke="#a56f53" />
              </div>
              <div className="space-y-3 rounded-xl border border-slate-200/80 bg-white/80 p-4">
                <ValuationBand
                  label="PEG"
                  low={stock.valuationMetrics.peg.low}
                  median={stock.valuationMetrics.peg.median}
                  high={stock.valuationMetrics.peg.high}
                  current={stock.valuationMetrics.peg.current}
                />
                <Sparkline values={stock.valuationMetrics.peg.historical} stroke="#2f5c85" />
              </div>
            </div>
            <p className="mt-4 text-sm leading-7 text-slate-600">{stock.valuationMetrics.summary}</p>
          </SectionBlock>

          <SectionBlock
            title="風險分析"
            subtitle="長線投資不是只看好的故事，更要先知道 thesis 可能在哪裡出錯。"
          >
            <div className="space-y-4">
              {[
                { label: "產業循環風險", risk: stock.riskProfile.industryCycle },
                { label: "政策風險", risk: stock.riskProfile.policy },
                { label: "客戶集中風險", risk: stock.riskProfile.customerConcentration },
                { label: "財務風險", risk: stock.riskProfile.financial }
              ].map(({ label, risk }) => (
                <div
                  key={label}
                  className="rounded-xl border border-slate-200/80 bg-white/80 p-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="text-base font-semibold text-ink-900">{label}</p>
                    <Badge tone={getRiskTone(risk.level)}>{risk.level} 風險</Badge>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-slate-600">{risk.summary}</p>
                  <p className="mt-3 border-t border-slate-200/80 pt-3 text-sm font-medium text-sage-600">
                    追蹤重點：{risk.watchpoint}
                  </p>
                </div>
              ))}
            </div>
          </SectionBlock>

          <SectionBlock
            title="最新重大新聞與事件"
            subtitle="只保留會影響長線判斷的事件，不堆疊市場雜訊。"
          >
            <div className="space-y-4">
              {stock.recentEvents.map((event) => (
                <div key={event.id} className="rounded-xl border border-slate-200/80 bg-sand-50/60 p-5">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <Badge
                        tone={
                          event.impact === "正向"
                            ? "positive"
                            : event.impact === "中性"
                              ? "default"
                              : "warning"
                        }
                      >
                        {event.category}
                      </Badge>
                      <p className="text-sm font-medium text-slate-500">{formatDate(event.date)}</p>
                    </div>
                    <p className="text-sm font-medium text-slate-600">{event.impact}</p>
                  </div>
                  <h3 className="mt-3 text-lg font-semibold text-ink-900">{event.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-slate-600">{event.summary}</p>
                </div>
              ))}
            </div>
          </SectionBlock>
        </div>

        <div className="space-y-4 xl:sticky xl:top-4 xl:self-start">
          <SectionBlock
            title="長線判斷快照"
            subtitle="把品質、成長、估值與風險收斂成一個可以回頭複查的判斷。"
          >
            <div className="space-y-4">
              <ScoreBadge {...stock.scores.quality} />
              <ScoreBadge {...stock.scores.growth} />
              <ScoreBadge {...stock.scores.valuation} />
              <ScoreBadge {...stock.scores.risk} />
              <ScoreBadge {...stock.scores.overall} />
            </div>
            <div className="mt-5 rounded-xl border border-slate-200/80 bg-sand-50/60 p-5">
              <p className="text-sm font-medium text-ink-900">綜合判斷</p>
              <p className="mt-3 text-sm leading-7 text-slate-600">{stock.conclusion}</p>
            </div>
          </SectionBlock>

          <SectionBlock title="決策快照" subtitle="快速回到最重要的判斷軸線。">
            <div className="space-y-4">
              <div className="rounded-xl border border-slate-200/80 bg-white/80 p-4">
                <p className="text-xs uppercase tracking-[0.24em] text-slate-500">現價與估值</p>
                <p className="mt-2 text-2xl font-semibold text-ink-900">
                  {formatCurrency(stock.currentPrice, stock.currency)}
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  目前 PE {stock.valuationMetrics.pe.current.toFixed(1)}x，位於歷史中位數之上。
                </p>
              </div>
              <div className="rounded-xl border border-slate-200/80 bg-white/80 p-4">
                <p className="text-xs uppercase tracking-[0.24em] text-slate-500">成長與現金流</p>
                <p className="mt-2 text-base font-semibold text-ink-900">
                  營收 3Y CAGR {formatPercent(stock.financialMetrics.revenueCagr3Y)}
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  自由現金流 {formatBillion(stock.financialMetrics.freeCashFlowBillion, stock.currency)}
                </p>
              </div>
              <div className="rounded-xl border border-slate-200/80 bg-white/80 p-4">
                <p className="text-xs uppercase tracking-[0.24em] text-slate-500">下一步動作</p>
                <div className="mt-3 flex flex-col gap-3">
                  <Link
                    to={`/thesis/${stock.ticker}`}
                    className="rounded-lg border border-slate-300 px-4 py-2 text-center text-sm font-medium text-ink-900 transition hover:border-slate-400 hover:bg-white"
                  >
                    更新投資假設
                  </Link>
                  <Link
                    to="/tracking"
                    className="rounded-lg border border-slate-300 px-4 py-2 text-center text-sm font-medium text-ink-900 transition hover:border-slate-400 hover:bg-white"
                  >
                    查看追蹤工作台
                  </Link>
                </div>
              </div>
            </div>
          </SectionBlock>
        </div>
      </div>
    </div>
  );
}
