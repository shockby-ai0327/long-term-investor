import { Link } from "react-router-dom";
import { Badge } from "../components/Badge";
import { PageHeader } from "../components/PageHeader";
import { SectionBlock } from "../components/SectionBlock";
import { mockSnapshot } from "../data/mockData";
import { useWorkspaceState } from "../state/WorkspaceStateProvider";
import type {
  ReminderAction,
  ReminderProgress,
  ReminderStatus,
  ReminderType,
  WorkspaceReminder
} from "../types/investment";
import { formatDate } from "../utils/format";

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

function getProgressTone(progress: ReminderProgress) {
  switch (progress) {
    case "處理中":
      return "info" as const;
    case "已完成":
      return "positive" as const;
    default:
      return "default" as const;
  }
}

function getUrgency(reminder: WorkspaceReminder) {
  const daysUntil = getDaysUntil(reminder.date);

  if (daysUntil < 0) {
    return { label: `已過 ${Math.abs(daysUntil)} 天`, tone: "critical" as const };
  }

  if (daysUntil === 0) {
    return { label: "今天", tone: "warning" as const };
  }

  if (daysUntil <= 3) {
    return { label: `${daysUntil} 天後`, tone: "warning" as const };
  }

  if (daysUntil <= 7) {
    return { label: "7 天內", tone: "info" as const };
  }

  return { label: `${daysUntil} 天後`, tone: "default" as const };
}

function getPrioritySortValue(reminder: WorkspaceReminder) {
  const urgency = reminder.status === "需處理" ? 0 : 10;
  const days = getDaysUntil(reminder.date);
  return urgency + days;
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
  value: number | string;
  note: string;
  tone?: "default" | "warning" | "critical" | "info" | "positive";
}) {
  const toneClassMap = {
    default: "border-slate-200/75 bg-white/80 text-slate-600",
    warning: "border-amber-200/90 bg-amber-50/80 text-amber-800",
    critical: "border-rose-200/90 bg-rose-50/80 text-rose-700",
    info: "border-sky-200/90 bg-sky-50/80 text-sky-700",
    positive: "border-emerald-200/90 bg-emerald-50/80 text-emerald-700"
  };

  return (
    <div className={`rounded-xl border px-3.5 py-3 ${toneClassMap[tone]}`}>
      <p className="text-[10px] font-semibold uppercase tracking-[0.22em]">{label}</p>
      <p className="mt-1.5 text-[1.6rem] font-semibold tracking-tight text-ink-900">{value}</p>
      <p className="mt-1 text-sm leading-5 text-slate-600">{note}</p>
    </div>
  );
}

function ProgressButtons({
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
        <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-500">
          本地處理狀態
        </p>
        <Badge tone={getProgressTone(reminder.progress)}>{reminder.progress}</Badge>
      </div>
      {reminder.progressUpdatedAt ? (
        <p className="text-xs text-slate-500">更新於 {formatDate(reminder.progressUpdatedAt)}</p>
      ) : null}
      <div className="flex flex-wrap gap-2">
        {reminder.progress !== "處理中" ? (
          <button
            type="button"
            onClick={onStart}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-ink-900 transition hover:border-slate-400"
          >
            開始處理
          </button>
        ) : null}
        {reminder.progress !== "已完成" ? (
          <button
            type="button"
            onClick={onComplete}
            className="rounded-lg border border-ink-900 bg-ink-900 px-3 py-2 text-sm font-medium text-white transition hover:bg-ink-800"
          >
            標記完成
          </button>
        ) : null}
        {reminder.progress !== "未開始" ? (
          <button
            type="button"
            onClick={onReset}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-ink-900 transition hover:border-slate-400"
          >
            重設
          </button>
        ) : null}
      </div>
    </div>
  );
}

function PriorityRow({
  reminder,
  index,
  onStart,
  onComplete,
  onReset
}: {
  reminder: WorkspaceReminder;
  index: number;
  onStart: () => void;
  onComplete: () => void;
  onReset: () => void;
}) {
  const urgency = getUrgency(reminder);
  const primaryAction = reminder.actions[0];
  const secondaryAction = reminder.actions[1];

  return (
    <article className="rounded-xl border border-slate-200/75 bg-white/88 px-4 py-4">
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)_190px] xl:items-start">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex h-7 min-w-7 items-center justify-center rounded-lg border border-slate-300 bg-white text-sm font-semibold text-ink-900">
              {index + 1}
            </span>
            <Badge tone={getStatusTone(reminder.status)}>{reminder.status}</Badge>
            <Badge tone={getTypeTone(reminder.type)}>{reminder.type}</Badge>
            <Badge tone={urgency.tone}>{urgency.label}</Badge>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-600">
              {reminder.ticker}
            </p>
            <p className="text-xs text-slate-500">{formatDate(reminder.date)}</p>
          </div>

          <h3 className="mt-2 text-[1.04rem] font-semibold tracking-tight text-ink-900">
            {reminder.title}
          </h3>
          <p className="mt-2 text-sm leading-6 text-slate-700">{reminder.reason}</p>

          <div className="mt-3 rounded-lg border border-slate-200/75 bg-slate-50/70 px-3.5 py-3">
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-500">
              驗證焦點
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {reminder.verificationFocus.map((focus) => (
                <span
                  key={focus}
                  className="rounded-lg border border-slate-200/80 bg-white px-3 py-1.5 text-sm text-slate-700"
                >
                  {focus}
                </span>
              ))}
            </div>
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

          <ProgressButtons reminder={reminder} onStart={onStart} onComplete={onComplete} onReset={onReset} />
        </div>

        <div className="flex flex-col gap-2">
          {primaryAction ? <ActionLink action={primaryAction} fullWidth /> : null}
          {secondaryAction ? <ActionLink action={secondaryAction} fullWidth /> : null}
        </div>
      </div>
    </article>
  );
}

function CompactReminderRow({
  reminder,
  primaryAction
}: {
  reminder: WorkspaceReminder;
  primaryAction?: ReminderAction;
}) {
  const urgency = getUrgency(reminder);

  return (
    <article className="rounded-xl border border-slate-200/75 bg-white/84 px-4 py-3.5">
      <div className="grid gap-3 lg:grid-cols-[180px_minmax(0,1fr)_160px] lg:items-start">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone={getStatusTone(reminder.status)}>{reminder.status}</Badge>
            <Badge tone={getTypeTone(reminder.type)}>{reminder.type}</Badge>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-semibold tracking-[0.08em] text-slate-700">{reminder.ticker}</p>
            <Badge tone={urgency.tone}>{urgency.label}</Badge>
          </div>
          <p className="text-sm text-slate-500">{formatDate(reminder.date)}</p>
        </div>

        <div className="min-w-0">
          <h3 className="text-sm font-semibold text-ink-900">{reminder.title}</h3>
          <p className="mt-1.5 text-sm leading-6 text-slate-700">{reminder.affectsDecision}</p>
          <p className="mt-2 text-sm leading-6 text-slate-500">{reminder.nextStep}</p>
        </div>

        <div className="flex flex-col gap-2">
          {primaryAction ? <ActionLink action={primaryAction} fullWidth /> : null}
          <Badge tone={getProgressTone(reminder.progress)}>{reminder.progress}</Badge>
        </div>
      </div>
    </article>
  );
}

export function TrackingPage() {
  const { reminders, resetReminderProgress, setReminderProgress } = useWorkspaceState();
  const openReminders = [...reminders]
    .filter((reminder) => reminder.progress !== "已完成")
    .sort((left, right) => getPrioritySortValue(left) - getPrioritySortValue(right));
  const dueNow = openReminders.filter((reminder) => reminder.status === "需處理");
  const upcoming = openReminders.filter((reminder) => reminder.status === "即將到來");
  const disciplineReminders = openReminders.filter(
    (reminder) => reminder.type === "估值" || reminder.type === "Thesis"
  );
  const completedReminders = [...reminders]
    .filter((reminder) => reminder.progress === "已完成")
    .sort((left, right) => (right.progressUpdatedAt ?? "").localeCompare(left.progressUpdatedAt ?? ""));
  const nextPriority = dueNow[0] ?? openReminders[0];
  const withinAWeek = openReminders.filter((reminder) => getDaysUntil(reminder.date) <= 7);
  const inProgressCount = reminders.filter((reminder) => reminder.progress === "處理中").length;
  const completedCount = completedReminders.length;
  const typeCounts = {
    earnings: openReminders.filter((reminder) => reminder.type === "財報" || reminder.type === "營收").length,
    valuation: openReminders.filter((reminder) => reminder.type === "估值").length,
    thesis: openReminders.filter((reminder) => reminder.type === "Thesis").length
  };

  function startReminder(id: string) {
    setReminderProgress(id, "處理中");
  }

  function completeReminder(id: string) {
    setReminderProgress(id, "已完成");
  }

  if (!nextPriority && completedReminders.length === 0) {
    return (
      <div className="space-y-4">
        <PageHeader
          eyebrow="Tracking"
          title="追蹤工作台"
          description="目前沒有提醒資料。這一頁會在有事件、估值或 thesis 檢查節點時，把它們排成可操作隊列。"
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <PageHeader
        eyebrow="Tracking"
        title="追蹤工作台"
        description="先處理會改變持有、估值、風險與配置判斷的提醒，再安排下一個檢查節點。"
        actions={
          <>
            <Link
              to="/portfolio"
              className="rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm font-medium text-ink-900 transition hover:border-slate-400"
            >
              看投資組合
            </Link>
            <Link
              to="/"
              className="rounded-lg border border-ink-900 bg-ink-900 px-3.5 py-2 text-sm font-medium text-white transition hover:bg-ink-800"
            >
              回首頁工作台
            </Link>
          </>
        }
      />

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.25fr)_350px]">
        <SectionBlock
          title="今日優先隊列"
          subtitle={`依 ${mockSnapshot.asOfDate} 的 snapshot 排序。先處理最接近決策點的提醒，不依價格波動排序。`}
        >
          {dueNow.length > 0 ? (
            <div className="space-y-3">
              {dueNow.map((reminder, index) => (
                <PriorityRow
                  key={reminder.id}
                  reminder={reminder}
                  index={index}
                  onStart={() => startReminder(reminder.id)}
                  onComplete={() => completeReminder(reminder.id)}
                  onReset={() => resetReminderProgress(reminder.id)}
                />
              ))}
            </div>
          ) : nextPriority ? (
            <div className="rounded-xl border border-slate-200/75 bg-white/80 px-4 py-4">
              <p className="text-sm leading-6 text-slate-700">
                今天到期的提醒都已處理完，目前第一個要安排的是下一個即將到來的檢查點。
              </p>
              <div className="mt-3">
                <CompactReminderRow reminder={nextPriority} primaryAction={nextPriority.actions[0]} />
              </div>
            </div>
          ) : null}
        </SectionBlock>

        <aside className="panel px-4 py-4 sm:px-5">
          <div className="border-b border-slate-200/75 pb-2.5">
            <h2 className="section-title">關鍵狀態</h2>
            <p className="mt-1 muted-copy">先回答今天要處理什麼、為什麼，以及接下來排什麼。</p>
          </div>

          <div className="mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-1">
            <SummaryMetric label="需處理" value={dueNow.length} note="今天要先排掉的提醒" tone="warning" />
            <SummaryMetric label="7 天內" value={withinAWeek.length} note="近期會進入檢查節奏" tone="info" />
            <SummaryMetric
              label="處理中"
              value={inProgressCount}
              note="已開始但尚未完成"
              tone="info"
            />
            <SummaryMetric
              label="已完成"
              value={completedCount}
              note="本地已標記完成"
              tone="positive"
            />
          </div>

          {nextPriority ? (
            <div className="mt-4 rounded-xl border border-amber-200/90 bg-amber-50/80 px-4 py-3.5">
              <div className="flex flex-wrap items-center gap-2">
                <Badge tone="warning">今天先做什麼</Badge>
                <p className="text-sm font-semibold text-ink-900">
                  {nextPriority.ticker} {nextPriority.title}
                </p>
              </div>
              <p className="mt-2 text-sm leading-6 text-slate-700">{nextPriority.reason}</p>
              <div className="mt-3 rounded-lg border border-amber-200/70 bg-white/70 px-3.5 py-3">
                <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-500">
                  下一步
                </p>
                <p className="mt-1 text-sm leading-6 text-ink-900">{nextPriority.nextStep}</p>
              </div>
            </div>
          ) : null}

          <div className="mt-4 rounded-xl border border-slate-200/75 bg-white/80 px-4 py-3.5">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-medium text-ink-900">提醒分布</p>
              <Badge tone="default">{openReminders.length} 則</Badge>
            </div>
            <div className="mt-3 space-y-2">
              <div className="flex items-center justify-between gap-3 text-sm">
                <p className="text-slate-700">財報 / 營收</p>
                <p className="font-medium text-ink-900">{typeCounts.earnings}</p>
              </div>
              <div className="flex items-center justify-between gap-3 text-sm">
                <p className="text-slate-700">估值</p>
                <p className="font-medium text-ink-900">{typeCounts.valuation}</p>
              </div>
              <div className="flex items-center justify-between gap-3 text-sm">
                <p className="text-slate-700">Thesis</p>
                <p className="font-medium text-ink-900">{typeCounts.thesis}</p>
              </div>
            </div>
          </div>
        </aside>
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.08fr)_minmax(0,0.92fr)]">
        <SectionBlock
          title="即將到來"
          subtitle="提前排好下一輪檢查，避免事件到來時才臨時反應。"
        >
          <div className="space-y-3">
            {upcoming.map((reminder) => (
              <CompactReminderRow
                key={reminder.id}
                reminder={reminder}
                primaryAction={reminder.actions[0]}
              />
            ))}
          </div>
        </SectionBlock>

        <SectionBlock
          title="估值 / Thesis"
          subtitle="把直接影響持有紀律的提醒集中看，不和一般事件提醒混在一起。"
        >
          <div className="space-y-3">
            {disciplineReminders.map((reminder) => (
              <article key={reminder.id} className="rounded-xl border border-slate-200/75 bg-white/84 px-4 py-3.5">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge tone={getTypeTone(reminder.type)}>{reminder.type}</Badge>
                  <Badge tone={getStatusTone(reminder.status)}>{reminder.status}</Badge>
                  <Badge tone={getUrgency(reminder).tone}>{getUrgency(reminder).label}</Badge>
                  <p className="text-sm font-semibold tracking-[0.08em] text-slate-700">
                    {reminder.ticker}
                  </p>
                </div>
                <h3 className="mt-2 text-sm font-semibold text-ink-900">{reminder.title}</h3>
                <p className="mt-1.5 text-sm leading-6 text-slate-700">{reminder.affectsDecision}</p>
                <p className="mt-2 text-sm leading-6 text-slate-500">{reminder.nextStep}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {reminder.actions.slice(0, 2).map((action) => (
                    <ActionLink key={`${reminder.id}-${action.label}`} action={action} />
                  ))}
                </div>
              </article>
            ))}
          </div>
        </SectionBlock>
      </div>

      {completedReminders.length > 0 ? (
        <SectionBlock
          title="最近完成"
          subtitle="保留本地完成紀錄，讓你知道哪些提醒已處理，必要時也能重新打開。"
        >
          <div className="space-y-3">
            {completedReminders.slice(0, 4).map((reminder) => (
              <article key={reminder.id} className="rounded-xl border border-slate-200/75 bg-white/84 px-4 py-3.5">
                <div className="grid gap-3 lg:grid-cols-[180px_minmax(0,1fr)_140px] lg:items-start">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge tone={getTypeTone(reminder.type)}>{reminder.type}</Badge>
                      <Badge tone="positive">已完成</Badge>
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
                    {reminder.actions.slice(0, 1).map((action) => (
                      <ActionLink key={`${reminder.id}-${action.label}`} action={action} fullWidth />
                    ))}
                    <button
                      type="button"
                      onClick={() => resetReminderProgress(reminder.id)}
                      className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-ink-900 transition hover:border-slate-400"
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
