import { Link } from "react-router-dom";
import { AlertList } from "../components/AlertList";
import { Badge } from "../components/Badge";
import { DecisionPill } from "../components/DecisionPill";
import { PageHeader } from "../components/PageHeader";
import { SectionBlock } from "../components/SectionBlock";
import {
  getActionDisplay,
  getAlertRuleDisplay,
  getAlertSeverityDisplay,
  getAlertStateDisplay,
  getConfidenceDisplay,
  getValuationDisplay,
  type InvestmentAlert,
  type StockAnalysisRecord
} from "../domain/investment";
import { mockSnapshot } from "../data/mockData";
import { useWorkspaceState } from "../state/WorkspaceStateProvider";
import type { ReminderActionEmphasis, ReminderProgress, ReminderType, WorkspaceReminder } from "../types/investment";
import { formatDate } from "../utils/format";

const snapshotDate = new Date(`${mockSnapshot.asOfDate}T00:00:00`);

function getDaysUntil(date: string) {
  const targetDate = new Date(`${date}T00:00:00`);
  const diff = targetDate.getTime() - snapshotDate.getTime();
  return Math.round(diff / (1000 * 60 * 60 * 24));
}

function getReminderUrgency(reminder: WorkspaceReminder) {
  const daysUntil = getDaysUntil(reminder.date);

  if (daysUntil < 0) {
    return { label: `已過 ${Math.abs(daysUntil)} 天`, tone: "negative" as const };
  }

  if (daysUntil === 0) {
    return { label: "今天", tone: "negative" as const };
  }

  if (daysUntil <= 3) {
    return { label: `${daysUntil} 天後`, tone: "warning" as const };
  }

  if (daysUntil <= 7) {
    return { label: "7 天內", tone: "info" as const };
  }

  return { label: `${daysUntil} 天後`, tone: "neutral" as const };
}

function getReminderTypeTone(type: ReminderType) {
  switch (type) {
    case "估值":
      return "negative" as const;
    case "Thesis":
      return "warning" as const;
    case "財報":
    case "營收":
      return "info" as const;
    default:
      return "neutral" as const;
  }
}

function getReminderProgressTone(progress: ReminderProgress) {
  switch (progress) {
    case "處理中":
      return "info" as const;
    case "已完成":
      return "positive" as const;
    default:
      return "neutral" as const;
  }
}

function getReminderSortValue(reminder: WorkspaceReminder) {
  const dueRank = reminder.status === "需處理" ? 0 : 10;
  return dueRank + getDaysUntil(reminder.date);
}

function getAlertImpact(alert: InvestmentAlert) {
  switch (alert.rule) {
    case "target_zone":
      return "估值判斷與研究優先序";
    case "valuation_status_change":
      return "估值狀態與 watchlist 動作";
    case "overall_score_change":
      return "綜合判斷與研究順序";
    case "stability_deterioration":
      return "風險判斷與部位耐受度";
    case "data_update_reprice":
      return "Thesis 與評分重估";
    case "style_fit":
      return "研究框架與 thesis 重點";
    default:
      return "決策順序";
  }
}

function getAlertNextStep(alert: InvestmentAlert, analysis: StockAnalysisRecord) {
  switch (alert.rule) {
    case "target_zone":
      return "回到估值區與 Thesis，確認是否把它升級成優先研究。";
    case "valuation_status_change":
      return "先看估值區間與 fair zone，再決定要不要調整觀察狀態。";
    case "overall_score_change":
      return "打開評分拆解，確認這次變動是否真的改變持有或研究理由。";
    case "stability_deterioration":
      return "優先回頭看風險與集中度，必要時降低對這檔的容忍區間。";
    case "data_update_reprice":
      return "把事件後的變化寫回 Thesis，避免只根據 headline 做判斷。";
    case "style_fit":
      return analysis.decision.buffettFit >= analysis.decision.lynchFit
        ? "用品質與資本配置角度重看 Thesis，不要把題材敘事放前面。"
        : "把研究重點放回成長與估值配比，而不是只看公司品質。";
    default:
      return "先回到個股頁確認這次提醒真正改變了哪個判斷。";
  }
}

function getSecondaryAction(alert: InvestmentAlert, analysis: StockAnalysisRecord) {
  const stockTo = `/stocks/${analysis.stock.ticker}`;
  const thesisTo = `/thesis/${analysis.stock.ticker}`;

  if (alert.actionTo === stockTo) {
    return { label: "看 Thesis", to: thesisTo, tone: "secondary" as const };
  }

  if (alert.actionTo === thesisTo) {
    return { label: "看個股", to: stockTo, tone: "secondary" as const };
  }

  return { label: "看個股", to: stockTo, tone: "secondary" as const };
}

function getAlertPriorityValue(alert: InvestmentAlert, analysis: StockAnalysisRecord) {
  const stateRank = alert.state === "active" ? 0 : 100;
  const severityRank = alert.severity === "negative" ? 0 : alert.severity === "positive" ? 20 : 40;
  const actionRank =
    analysis.decision.action === "avoid_for_now"
      ? 0
      : analysis.decision.action === "wait_for_better_price"
        ? 10
        : analysis.decision.action === "study_now"
          ? 20
          : analysis.decision.action === "watch"
            ? 30
            : 40;

  return stateRank + severityRank + actionRank - analysis.overallScore / 100;
}

function ActionLink({
  label,
  to,
  tone = "secondary",
  fullWidth = false
}: {
  label: string;
  to: string;
  tone?: ReminderActionEmphasis;
  fullWidth?: boolean;
}) {
  const className =
    tone === "primary"
      ? "border-ink-900 bg-ink-900 text-white hover:bg-ink-800"
      : tone === "ghost"
        ? "border-transparent bg-transparent text-slate-600 hover:border-slate-200 hover:bg-white"
        : "border-slate-300 bg-white text-ink-900 hover:border-slate-400";

  return (
    <Link
      to={to}
      className={[
        "toolbar-button",
        fullWidth ? "w-full" : "",
        className
      ].join(" ")}
    >
      {label}
    </Link>
  );
}

function SummaryMetric({
  label,
  value,
  note
}: {
  label: string;
  value: number | string;
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

function ReminderProgressButtons({
  reminder,
  onStart,
  onComplete,
  onReset
}: {
  reminder: WorkspaceReminder;
  onStart: () => void;
  onComplete: () => void;
  onReset: () => void;
}) {
  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        <DecisionPill label={reminder.progress} tone={getReminderProgressTone(reminder.progress)} />
        {reminder.progressUpdatedAt ? (
          <p className="text-xs text-slate-500">更新於 {formatDate(reminder.progressUpdatedAt)}</p>
        ) : null}
      </div>
      <div className="flex flex-wrap gap-2">
        {reminder.progress !== "處理中" ? (
          <button
            type="button"
            onClick={onStart}
            className="toolbar-button border-slate-300 bg-white text-ink-900 hover:border-slate-400"
          >
            開始處理
          </button>
        ) : null}
        {reminder.progress !== "已完成" ? (
          <button
            type="button"
            onClick={onComplete}
            className="toolbar-button border-ink-900 bg-ink-900 text-white hover:bg-ink-800"
          >
            標記完成
          </button>
        ) : null}
        {reminder.progress !== "未開始" ? (
          <button
            type="button"
            onClick={onReset}
            className="toolbar-button border-transparent bg-transparent text-slate-600 hover:border-slate-200 hover:bg-white"
          >
            重設
          </button>
        ) : null}
      </div>
    </div>
  );
}

function AlertQueueRow({
  alert,
  analysis,
  rank
}: {
  alert: InvestmentAlert;
  analysis: StockAnalysisRecord;
  rank: number;
}) {
  const actionDisplay = getActionDisplay(analysis.decision.action);
  const valuationDisplay = getValuationDisplay(analysis.decision.valuationStatus);
  const confidenceDisplay = getConfidenceDisplay(analysis.decision.confidenceLevel);
  const severityDisplay = getAlertSeverityDisplay(alert.severity);
  const stateDisplay = getAlertStateDisplay(alert.state);
  const ruleDisplay = getAlertRuleDisplay(alert.rule);
  const secondaryAction = getSecondaryAction(alert, analysis);

  return (
    <article className="rounded-xl border border-slate-200/75 bg-white/[0.86] px-4 py-4">
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)_184px] xl:items-start">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex h-7 min-w-7 items-center justify-center rounded-lg border border-slate-300 bg-white text-sm font-semibold text-ink-900">
              {rank}
            </span>
            <DecisionPill label={severityDisplay.label} tone={severityDisplay.tone} />
            <DecisionPill label={stateDisplay.label} tone={stateDisplay.tone} />
            <DecisionPill label={ruleDisplay.label} tone="info" />
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-600">{alert.ticker}</p>
            <p className="text-xs text-slate-500">{formatDate(alert.triggeredAt)}</p>
          </div>

          <h3 className="mt-2 text-[1.02rem] font-semibold tracking-tight text-ink-900">{alert.title}</h3>
          <p className="mt-2 text-sm leading-6 text-slate-700">{alert.summary}</p>
          <p className="mt-1.5 text-sm leading-6 text-slate-500">{alert.reason}</p>
        </div>

        <div className="grid gap-2">
          <div className="rounded-lg border border-slate-200/75 bg-slate-50/70 px-3.5 py-3">
            <p className="eyebrow-label">目前判斷</p>
            <div className="mt-2 flex flex-wrap gap-2">
              <DecisionPill label={actionDisplay.label} tone={actionDisplay.tone} />
              <DecisionPill label={valuationDisplay.label} tone={valuationDisplay.tone} />
              <DecisionPill label={`信心 ${confidenceDisplay.label}`} tone={confidenceDisplay.tone} />
            </div>
            <p className="mt-2 text-sm leading-6 text-slate-700">{analysis.decision.summary}</p>
          </div>

          <div className="rounded-lg border border-slate-200/75 bg-white/80 px-3.5 py-3">
            <p className="eyebrow-label">會改變什麼</p>
            <p className="mt-1.5 text-sm font-medium text-ink-900">{getAlertImpact(alert)}</p>
            <p className="mt-2 text-sm leading-6 text-slate-700">{getAlertNextStep(alert, analysis)}</p>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <ActionLink label={alert.actionLabel} to={alert.actionTo} tone="primary" fullWidth />
          <ActionLink label={secondaryAction.label} to={secondaryAction.to} fullWidth />
        </div>
      </div>
    </article>
  );
}

function ReminderRow({
  reminder,
  onStart,
  onComplete,
  onReset
}: {
  reminder: WorkspaceReminder;
  onStart: () => void;
  onComplete: () => void;
  onReset: () => void;
}) {
  const urgency = getReminderUrgency(reminder);
  const primaryAction = reminder.actions[0];

  return (
    <article className="rounded-xl border border-slate-200/75 bg-white/[0.84] px-4 py-3.5">
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.04fr)_minmax(0,0.96fr)_176px] xl:items-start">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone={getReminderTypeTone(reminder.type)}>{reminder.type}</Badge>
            <Badge tone={urgency.tone}>{urgency.label}</Badge>
            <DecisionPill label={reminder.progress} tone={getReminderProgressTone(reminder.progress)} />
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-600">{reminder.ticker}</p>
            <p className="text-xs text-slate-500">{formatDate(reminder.date)}</p>
          </div>

          <h3 className="mt-2 text-sm font-semibold text-ink-900">{reminder.title}</h3>
          <p className="mt-1.5 text-sm leading-6 text-slate-700">{reminder.affectsDecision}</p>
        </div>

        <div className="grid gap-2">
          <div className="rounded-lg border border-slate-200/75 bg-slate-50/70 px-3.5 py-3">
            <p className="eyebrow-label">驗證焦點</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {reminder.verificationFocus.slice(0, 2).map((focus) => (
                <span
                  key={focus}
                  className="rounded-lg border border-slate-200/75 bg-white px-3 py-1.5 text-sm text-slate-700"
                >
                  {focus}
                </span>
              ))}
            </div>
          </div>
          <div className="rounded-lg border border-slate-200/75 bg-white/80 px-3.5 py-3">
            <p className="eyebrow-label">下一步</p>
            <p className="mt-1.5 text-sm leading-6 text-slate-700">{reminder.nextStep}</p>
          </div>
          <ReminderProgressButtons reminder={reminder} onStart={onStart} onComplete={onComplete} onReset={onReset} />
        </div>

        <div className="flex flex-col gap-2">
          {primaryAction ? (
            <ActionLink
              label={primaryAction.label}
              to={primaryAction.to}
              tone={primaryAction.emphasis ?? "primary"}
              fullWidth
            />
          ) : null}
          {reminder.actions[1] ? (
            <ActionLink
              label={reminder.actions[1].label}
              to={reminder.actions[1].to}
              tone={reminder.actions[1].emphasis ?? "secondary"}
              fullWidth
            />
          ) : null}
        </div>
      </div>
    </article>
  );
}

export function TrackingPage() {
  const {
    alertHistory,
    alerts,
    getAnalysisByTicker,
    reminders,
    resetReminderProgress,
    setReminderProgress,
    trackedAnalyses
  } = useWorkspaceState();

  const alertItems = alerts
    .map((alert) => ({
      alert,
      analysis: getAnalysisByTicker(alert.ticker)
    }))
    .sort((left, right) => getAlertPriorityValue(left.alert, left.analysis) - getAlertPriorityValue(right.alert, right.analysis));
  const activeAlertItems = alertItems.filter((item) => item.alert.state === "active");
  const monitoringAlertItems = alertItems.filter((item) => item.alert.state === "monitoring");
  const openReminders = [...reminders]
    .filter((reminder) => reminder.progress !== "已完成")
    .sort((left, right) => getReminderSortValue(left) - getReminderSortValue(right));
  const completedReminders = [...reminders]
    .filter((reminder) => reminder.progress === "已完成")
    .sort((left, right) => (right.progressUpdatedAt ?? "").localeCompare(left.progressUpdatedAt ?? ""));
  const withinAWeek = openReminders.filter((reminder) => getDaysUntil(reminder.date) <= 7);
  const nextWorkItem = activeAlertItems[0] ?? monitoringAlertItems[0];
  const severityCounts = {
    negative: alerts.filter((alert) => alert.severity === "negative").length,
    positive: alerts.filter((alert) => alert.severity === "positive").length,
    neutral: alerts.filter((alert) => alert.severity === "neutral").length
  };
  const ruleCounts = {
    valuation: alerts.filter((alert) => alert.rule === "target_zone" || alert.rule === "valuation_status_change").length,
    score: alerts.filter((alert) => alert.rule === "overall_score_change" || alert.rule === "style_fit").length,
    risk: alerts.filter((alert) => alert.rule === "stability_deterioration" || alert.rule === "data_update_reprice").length
  };
  const actionDistribution = {
    study: trackedAnalyses.filter((analysis) => analysis.decision.action === "study_now").length,
    watch: trackedAnalyses.filter((analysis) => analysis.decision.action === "watch").length,
    waitOrAvoid: trackedAnalyses.filter((analysis) =>
      ["wait_for_better_price", "avoid_for_now"].includes(analysis.decision.action)
    ).length
  };

  function startReminder(id: string) {
    setReminderProgress(id, "處理中");
  }

  function completeReminder(id: string) {
    setReminderProgress(id, "已完成");
  }

  return (
    <div className="space-y-4">
      <PageHeader
        eyebrow="Tracking"
        title="決策追蹤工作台"
        description="先處理規則已觸發的提醒，再排接下來的事件節奏。這一頁回答今天先看哪檔、為什麼、下一步做什麼。"
        actions={
          <>
            <Link
              to="/watchlist"
              className="toolbar-button border-slate-300 bg-white text-ink-900 hover:border-slate-400"
            >
              看 Watchlist
            </Link>
            <Link
              to="/portfolio"
              className="toolbar-button border-ink-900 bg-ink-900 text-white hover:bg-ink-800"
            >
              看投資組合
            </Link>
          </>
        }
      />

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.18fr)_320px]">
        <SectionBlock
          title="今日先處理"
          subtitle={`依 ${mockSnapshot.asOfDate} snapshot 的 alert state 排序，先看會改變估值、風險與 thesis 的訊號。`}
        >
          {activeAlertItems.length ? (
            <div className="space-y-3">
              {activeAlertItems.slice(0, 4).map((item, index) => (
                <AlertQueueRow key={item.alert.id} alert={item.alert} analysis={item.analysis} rank={index + 1} />
              ))}
            </div>
          ) : monitoringAlertItems.length ? (
            <div className="rounded-xl border border-slate-200/75 bg-white/[0.82] px-4 py-4">
              <p className="text-sm leading-6 text-slate-700">
                目前沒有新的 active alert，先看最接近研究區間或需要持續監控的項目。
              </p>
              <div className="mt-3">
                <AlertQueueRow alert={monitoringAlertItems[0]!.alert} analysis={monitoringAlertItems[0]!.analysis} rank={1} />
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-slate-200/75 bg-white/[0.82] px-4 py-4 text-sm text-slate-600">
              目前沒有新的 engine alerts。下一步請回到事件節奏，確認近期財報、營收與 Thesis 檢查節點。
            </div>
          )}
        </SectionBlock>

        <aside className="panel px-4 py-4 sm:px-5">
          <div className="border-b border-slate-200/75 pb-3">
            <h2 className="section-title">關鍵狀態</h2>
            <p className="mt-1 muted-copy">先掃過 alert 強度、7 天內事件，以及研究動作分布。</p>
          </div>

          <div className="mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-1">
            <SummaryMetric label="需處理" value={activeAlertItems.length} note="現在要先處理的規則提醒" />
            <SummaryMetric label="監控中" value={monitoringAlertItems.length} note="接近 trigger，但還在監控中" />
            <SummaryMetric label="7 天內事件" value={withinAWeek.length} note="財報、營收與估值檢查節點" />
            <SummaryMetric label="本地已完成" value={completedReminders.length} note="瀏覽器內已標記完成的提醒" />
          </div>

          {nextWorkItem ? (
            <div className="mt-4 rounded-xl border border-slate-200/75 bg-slate-50/75 px-4 py-3.5">
              <div className="flex flex-wrap items-center gap-2">
                <DecisionPill label={getAlertSeverityDisplay(nextWorkItem.alert.severity).label} tone={getAlertSeverityDisplay(nextWorkItem.alert.severity).tone} />
                <DecisionPill label={getAlertStateDisplay(nextWorkItem.alert.state).label} tone={getAlertStateDisplay(nextWorkItem.alert.state).tone} />
              </div>
              <p className="mt-2 text-sm font-semibold text-ink-900">
                {nextWorkItem.alert.ticker} {nextWorkItem.alert.title}
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-700">{nextWorkItem.alert.summary}</p>
              <p className="mt-2 text-xs leading-5 text-slate-500">{getAlertNextStep(nextWorkItem.alert, nextWorkItem.analysis)}</p>
            </div>
          ) : null}

          <div className="mt-4 space-y-3">
            <div className="decision-panel px-4 py-3.5">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-medium text-ink-900">提醒強度</p>
                <Badge tone="neutral">{alerts.length} 則</Badge>
              </div>
              <div className="mt-3 space-y-2 text-sm">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-slate-700">需警示</p>
                  <p className="font-medium text-ink-900">{severityCounts.negative}</p>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <p className="text-slate-700">可關注</p>
                  <p className="font-medium text-ink-900">{severityCounts.positive}</p>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <p className="text-slate-700">持續監控</p>
                  <p className="font-medium text-ink-900">{severityCounts.neutral}</p>
                </div>
              </div>
            </div>

            <div className="decision-panel px-4 py-3.5">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-medium text-ink-900">類型統整</p>
                <Badge tone="info">rules</Badge>
              </div>
              <div className="mt-3 space-y-2 text-sm">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-slate-700">估值 / 價格帶</p>
                  <p className="font-medium text-ink-900">{ruleCounts.valuation}</p>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <p className="text-slate-700">總分 / 風格</p>
                  <p className="font-medium text-ink-900">{ruleCounts.score}</p>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <p className="text-slate-700">風險 / 事件後重估</p>
                  <p className="font-medium text-ink-900">{ruleCounts.risk}</p>
                </div>
              </div>
            </div>

            <div className="decision-panel px-4 py-3.5">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-medium text-ink-900">研究動作分布</p>
                <Badge tone="neutral">{trackedAnalyses.length} 檔</Badge>
              </div>
              <div className="mt-3 space-y-2 text-sm">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-slate-700">值得研究</p>
                  <p className="font-medium text-ink-900">{actionDistribution.study}</p>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <p className="text-slate-700">持續觀察</p>
                  <p className="font-medium text-ink-900">{actionDistribution.watch}</p>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <p className="text-slate-700">等價格 / 先不要碰</p>
                  <p className="font-medium text-ink-900">{actionDistribution.waitOrAvoid}</p>
                </div>
              </div>
            </div>
          </div>
        </aside>
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.02fr)_minmax(0,0.98fr)]">
        <SectionBlock
          title="最近規則觸發"
          subtitle="這是前端顯示的 alert history，不是即時通知。"
        >
          <AlertList alerts={alertHistory.slice(0, 6)} emptyLabel="目前沒有新的規則提醒。" />
        </SectionBlock>

        <SectionBlock
          title="即將到來的事件節奏"
          subtitle="事件節點繼續保留在本地工作流，避免只追著分數變化跑。"
        >
          <div className="space-y-3">
            {openReminders.length ? (
              openReminders.slice(0, 5).map((reminder) => (
                <ReminderRow
                  key={reminder.id}
                  reminder={reminder}
                  onStart={() => startReminder(reminder.id)}
                  onComplete={() => completeReminder(reminder.id)}
                  onReset={() => resetReminderProgress(reminder.id)}
                />
              ))
            ) : (
              <div className="rounded-lg border border-slate-200/80 bg-white/[0.82] px-4 py-3 text-sm text-slate-600">
                目前沒有未完成的事件提醒。
              </div>
            )}
          </div>
        </SectionBlock>
      </div>

      {completedReminders.length ? (
        <SectionBlock
          title="最近完成"
          subtitle="保留本地處理紀錄，方便之後重新打開同一則提醒。"
        >
          <div className="space-y-3">
            {completedReminders.slice(0, 4).map((reminder) => (
              <article key={reminder.id} className="rounded-xl border border-slate-200/75 bg-white/[0.84] px-4 py-3.5">
                <div className="grid gap-3 lg:grid-cols-[180px_minmax(0,1fr)_176px] lg:items-start">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge tone={getReminderTypeTone(reminder.type)}>{reminder.type}</Badge>
                      <DecisionPill label="已完成" tone="positive" />
                    </div>
                    <p className="text-sm font-semibold tracking-[0.08em] text-slate-700">{reminder.ticker}</p>
                    {reminder.progressUpdatedAt ? (
                      <p className="text-sm text-slate-500">完成於 {formatDate(reminder.progressUpdatedAt)}</p>
                    ) : null}
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold text-ink-900">{reminder.title}</h3>
                    <p className="mt-1.5 text-sm leading-6 text-slate-700">{reminder.nextStep}</p>
                  </div>

                  <div className="flex flex-col gap-2">
                    {reminder.actions[0] ? (
                      <ActionLink
                        label={reminder.actions[0].label}
                        to={reminder.actions[0].to}
                        tone={reminder.actions[0].emphasis ?? "secondary"}
                        fullWidth
                      />
                    ) : null}
                    <button
                      type="button"
                      onClick={() => resetReminderProgress(reminder.id)}
                      className="toolbar-button border-transparent bg-transparent text-slate-600 hover:border-slate-200 hover:bg-white"
                    >
                      重設提醒
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </SectionBlock>
      ) : null}
    </div>
  );
}
