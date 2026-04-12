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
      return "會改變估值與研究優先序。";
    case "valuation_status_change":
      return "會改變估值狀態與觀察名單動作。";
    case "overall_score_change":
      return "會改變研究順序與持有判斷強度。";
    case "stability_deterioration":
      return "會改變風險容忍度與部位耐受度。";
    case "data_update_reprice":
      return "會改變投資假設與評分拆解。";
    case "style_fit":
      return "會改變研究框架與 thesis 聚焦點。";
    default:
      return "會改變本輪處理順序。";
  }
}

function getAlertNextStep(alert: InvestmentAlert, analysis: StockAnalysisRecord) {
  switch (alert.rule) {
    case "target_zone":
      return "先回到估值區與投資假設，確認是否升級成優先研究。";
    case "valuation_status_change":
      return "先看 fair zone 與目前價格位置，再決定是否調整觀察狀態。";
    case "overall_score_change":
      return "打開評分拆解，確認這次變動是否真的改變研究理由。";
    case "stability_deterioration":
      return "優先處理風險與集中度，不把舊結論視為理所當然。";
    case "data_update_reprice":
      return "把事件後變化寫回投資假設，避免只跟著 headline 反應。";
    case "style_fit":
      return analysis.decision.buffettFit >= analysis.decision.lynchFit
        ? "回到品質、資本配置與護城河，不把題材敘事放前面。"
        : "回到成長與估值配比，確認 thesis 是否仍有合理報酬。";
    default:
      return "先回個股頁，確認這則提醒真正改變哪個判斷。";
  }
}

function getSecondaryAction(alert: InvestmentAlert, analysis: StockAnalysisRecord) {
  const stockTo = `/stocks/${analysis.stock.ticker}`;
  const thesisTo = `/thesis/${analysis.stock.ticker}`;

  if (alert.actionTo === stockTo) {
    return { label: "看投資假設", to: thesisTo, tone: "secondary" as const };
  }

  if (alert.actionTo === thesisTo) {
    return { label: "看個股", to: stockTo, tone: "secondary" as const };
  }

  return { label: "看個股", to: stockTo, tone: "secondary" as const };
}

function getAlertPriorityValue(alert: InvestmentAlert, analysis: StockAnalysisRecord) {
  const stateRank = alert.state === "active" ? 0 : 100;
  const severityRank = alert.severity === "negative" ? 0 : alert.severity === "positive" ? 18 : 36;
  const actionRank =
    analysis.decision.action === "avoid_for_now"
      ? 0
      : analysis.decision.action === "wait_for_better_price"
        ? 8
        : analysis.decision.action === "study_now"
          ? 16
          : analysis.decision.action === "watch"
            ? 24
            : 32;

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
      className={["toolbar-button", fullWidth ? "w-full" : "", className].join(" ")}
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
      <p className="mt-1 text-[1.3rem] font-semibold tracking-tight text-ink-900">{value}</p>
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
        <DecisionPill label={reminder.progress} tone={getReminderProgressTone(reminder.progress)} size="sm" />
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
    <article className="decision-row xl:grid-cols-[56px_150px_minmax(0,1fr)_208px] xl:items-start">
      <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-300 bg-white text-sm font-semibold text-ink-900">
        {rank}
      </div>

      <div>
        <div className="flex flex-wrap gap-2">
          <DecisionPill label={severityDisplay.label} tone={severityDisplay.tone} size="sm" />
          <DecisionPill label={stateDisplay.label} tone={stateDisplay.tone} size="sm" />
        </div>
        <p className="mt-2 text-sm font-semibold text-ink-900">{alert.ticker}</p>
        <p className="mt-1 text-xs text-slate-500">{formatDate(alert.triggeredAt)}</p>
      </div>

      <div className="min-w-0">
        <div className="flex flex-wrap gap-2">
          <DecisionPill label={ruleDisplay.label} tone="info" size="sm" />
          <DecisionPill label={actionDisplay.label} tone={actionDisplay.tone} size="sm" />
          <DecisionPill label={valuationDisplay.label} tone={valuationDisplay.tone} size="sm" />
          <DecisionPill label={`信心 ${confidenceDisplay.label}`} tone={confidenceDisplay.tone} size="sm" />
        </div>
        <p className="mt-2 text-sm font-medium leading-6 text-ink-900">{alert.title}</p>
        <p className="mt-1 text-sm leading-6 text-slate-700">{alert.summary}</p>
        <p className="mt-1 text-xs leading-5 text-slate-600">{getAlertImpact(alert)}</p>
        <p className="mt-1 text-xs leading-5 text-slate-500">{getAlertNextStep(alert, analysis)}</p>
      </div>

      <div className="space-y-2">
        <ActionLink label={alert.actionLabel} to={alert.actionTo} tone="primary" fullWidth />
        <ActionLink label={secondaryAction.label} to={secondaryAction.to} fullWidth />
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
    <article className="decision-row xl:grid-cols-[156px_minmax(0,1fr)_220px] xl:items-start">
      <div>
        <div className="flex flex-wrap gap-2">
          <Badge tone={getReminderTypeTone(reminder.type)}>{reminder.type}</Badge>
          <Badge tone={urgency.tone}>{urgency.label}</Badge>
        </div>
        <p className="mt-2 text-sm font-semibold text-ink-900">{reminder.ticker}</p>
        <p className="mt-1 text-xs text-slate-500">{formatDate(reminder.date)}</p>
      </div>

      <div className="min-w-0">
        <p className="text-sm font-medium leading-6 text-ink-900">{reminder.title}</p>
        <p className="mt-1 text-xs leading-5 text-slate-600">{reminder.affectsDecision}</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {reminder.verificationFocus.slice(0, 2).map((focus) => (
            <span
              key={focus}
              className="rounded-lg border border-slate-200/75 bg-white px-2.5 py-1 text-xs text-slate-700"
            >
              {focus}
            </span>
          ))}
        </div>
        <p className="mt-2 text-xs leading-5 text-slate-500">{reminder.nextStep}</p>
      </div>

      <div className="space-y-2">
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
        <ReminderProgressButtons reminder={reminder} onStart={onStart} onComplete={onComplete} onReset={onReset} />
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
        eyebrow="追蹤工作台"
        title="今天要重新檢查什麼"
        description="先處理會改變估值、風險與投資假設的提醒，再排接下來的事件節奏。"
        actions={
          <>
            <Link
              to="/watchlist"
              className="toolbar-button border-slate-300 bg-white text-ink-900 hover:border-slate-400"
            >
              看觀察名單
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

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.18fr)_320px] xl:items-start">
        <SectionBlock
          title="今天先處理"
          subtitle="先處理規則已經觸發的提醒，不先被所有事件與待辦淹沒。"
          className="self-start"
        >
          {activeAlertItems.length ? (
            <div className="space-y-0 divide-y divide-slate-200/75">
              {activeAlertItems.slice(0, 4).map((item, index) => (
                <AlertQueueRow key={item.alert.id} alert={item.alert} analysis={item.analysis} rank={index + 1} />
              ))}
            </div>
          ) : monitoringAlertItems.length ? (
            <div className="rounded-lg border border-slate-200/80 bg-white/[0.82] px-4 py-3.5">
              <p className="text-sm leading-6 text-slate-700">
                目前沒有新的主動提醒，先看最接近研究區間或需要持續監控的項目。
              </p>
              <div className="mt-3 border-t border-slate-200/75 pt-3">
                <AlertQueueRow alert={monitoringAlertItems[0]!.alert} analysis={monitoringAlertItems[0]!.analysis} rank={1} />
              </div>
            </div>
          ) : (
            <div className="rounded-lg border border-slate-200/80 bg-white/[0.82] px-4 py-3 text-sm text-slate-600">
              目前沒有新的規則提醒。下一步請回到事件節奏，確認近期財報、營收與投資假設檢查點。
            </div>
          )}
        </SectionBlock>

        <aside className="workspace-rail self-start">
          <div className="border-b border-slate-200/75 pb-2.5">
            <h2 className="section-title">關鍵狀態</h2>
            <p className="mt-1 compact-note">先掃過今天要處理的量，再看事件密度與研究分布。</p>
          </div>

          <div className="mt-3 grid gap-2 sm:grid-cols-2 xl:grid-cols-1">
            <SummaryMetric label="需處理" value={activeAlertItems.length} note="現在就要回頭檢查的提醒" />
            <SummaryMetric label="監控中" value={monitoringAlertItems.length} note="接近觸發，但尚未升級" />
            <SummaryMetric label="7 天內事件" value={withinAWeek.length} note="接下來一週的檢查節點" />
            <SummaryMetric label="本地已完成" value={completedReminders.length} note="這台瀏覽器已標記完成" />
          </div>

          {nextWorkItem ? (
            <div className="mt-3 decision-panel px-4 py-3.5">
              <div className="flex flex-wrap gap-2">
                <DecisionPill label={getAlertSeverityDisplay(nextWorkItem.alert.severity).label} tone={getAlertSeverityDisplay(nextWorkItem.alert.severity).tone} size="sm" />
                <DecisionPill label={getAlertStateDisplay(nextWorkItem.alert.state).label} tone={getAlertStateDisplay(nextWorkItem.alert.state).tone} size="sm" />
              </div>
              <p className="mt-2 text-sm font-semibold text-ink-900">
                {nextWorkItem.alert.ticker} {nextWorkItem.alert.title}
              </p>
              <p className="mt-1 text-sm leading-6 text-slate-700">{getAlertNextStep(nextWorkItem.alert, nextWorkItem.analysis)}</p>
            </div>
          ) : null}

          <div className="mt-3 space-y-3">
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
                <p className="text-sm font-medium text-ink-900">研究分布</p>
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
                  <p className="text-slate-700">等價格 / 暫避</p>
                  <p className="font-medium text-ink-900">{actionDistribution.waitOrAvoid}</p>
                </div>
              </div>
            </div>
          </div>
        </aside>
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.04fr)_320px] xl:items-start">
        <SectionBlock
          title="接下來的事件"
          subtitle="事件提醒留在工作流裡，避免只盯著分數與警示。"
          className="self-start"
        >
          <div className="space-y-0 divide-y divide-slate-200/75">
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

        <aside className="workspace-rail self-start">
          <div className="border-b border-slate-200/75 pb-2.5">
            <h2 className="section-title">最近觸發</h2>
            <p className="mt-1 compact-note">完整提醒放在這裡，不讓它搶走主工作區。</p>
          </div>
          <div className="mt-3">
            <AlertList alerts={alertHistory.slice(0, 6)} variant="compact" emptyLabel="目前沒有新的規則提醒。" />
          </div>
        </aside>
      </div>

      {completedReminders.length ? (
        <SectionBlock
          title="最近完成"
          subtitle="保留本地處理紀錄，方便之後重新打開同一則提醒。"
        >
          <div className="space-y-0 divide-y divide-slate-200/75">
            {completedReminders.slice(0, 4).map((reminder) => (
              <article
                key={reminder.id}
                className="decision-row xl:grid-cols-[150px_minmax(0,1fr)_220px] xl:items-start"
              >
                <div>
                  <div className="flex flex-wrap gap-2">
                    <Badge tone={getReminderTypeTone(reminder.type)}>{reminder.type}</Badge>
                    <DecisionPill label="已完成" tone="positive" size="sm" />
                  </div>
                  <p className="mt-2 text-sm font-semibold text-ink-900">{reminder.ticker}</p>
                  <p className="mt-1 text-xs text-slate-500">
                    完成於 {reminder.progressUpdatedAt ? formatDate(reminder.progressUpdatedAt) : mockSnapshot.asOfDate}
                  </p>
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium leading-6 text-ink-900">{reminder.title}</p>
                  <p className="mt-1 text-xs leading-5 text-slate-600">{reminder.affectsDecision}</p>
                </div>
                <div className="flex flex-wrap gap-2 xl:justify-end">
                  {reminder.actions.map((action) => (
                    <ActionLink
                      key={action.label}
                      label={action.label}
                      to={action.to}
                      tone={action.emphasis ?? "secondary"}
                    />
                  ))}
                  <button
                    type="button"
                    onClick={() => resetReminderProgress(reminder.id)}
                    className="toolbar-button border-transparent bg-transparent text-slate-600 hover:border-slate-200 hover:bg-white"
                  >
                    重新打開
                  </button>
                </div>
              </article>
            ))}
          </div>
        </SectionBlock>
      ) : null}
    </div>
  );
}
