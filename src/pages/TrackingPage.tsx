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

function getUrgencyBadge(reminder: WorkspaceReminder) {
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
    return { label: "本週內", tone: "info" as const };
  }

  return { label: `${daysUntil} 天後`, tone: "default" as const };
}

function getRowAccent(reminder: WorkspaceReminder) {
  if (reminder.progress === "已完成") {
    return "border-l-4 border-l-emerald-500 bg-emerald-50/45";
  }

  if (reminder.status === "需處理") {
    return "border-l-4 border-l-amber-500 bg-amber-50/55";
  }

  if (reminder.type === "估值") {
    return "border-l-4 border-l-rose-500 bg-rose-50/45";
  }

  if (reminder.type === "Thesis") {
    return "border-l-4 border-l-sky-500 bg-sky-50/40";
  }

  return "border-l-4 border-l-slate-300 bg-white/80";
}

function getTypeSummary(type: ReminderType) {
  if (type === "估值") {
    return "這類提醒主要改變估值紀律與新增部位的風險報酬比。";
  }

  if (type === "Thesis") {
    return "這類提醒主要改變持有理由、加減碼條件與失效條件。";
  }

  return "這類提醒主要用來更新基本面判斷。";
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

function ReminderProgressControls({
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
    <div className="mt-4 rounded-lg border border-slate-200/80 bg-white/80 px-3.5 py-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-[11px] uppercase tracking-[0.22em] text-slate-500">本地處理狀態</p>
          <Badge tone={getProgressTone(reminder.progress)}>{reminder.progress}</Badge>
        </div>
        {reminder.progressUpdatedAt ? (
          <p className="text-xs text-slate-500">更新於 {formatDate(reminder.progressUpdatedAt)}</p>
        ) : null}
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
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

export function TrackingPage() {
  const { reminders, resetReminderProgress, setReminderProgress } = useWorkspaceState();
  const sortedReminders = [...reminders]
    .filter((reminder) => reminder.progress !== "已完成")
    .sort((left, right) => getDaysUntil(left.date) - getDaysUntil(right.date));
  const dueNow = sortedReminders.filter((reminder) => reminder.status === "需處理");
  const comingSoon = sortedReminders.filter((reminder) => reminder.status === "即將到來");
  const valuationOrThesis = sortedReminders.filter(
    (reminder) => reminder.type === "估值" || reminder.type === "Thesis"
  );
  const completedReminders = reminders
    .filter((reminder) => reminder.progress === "已完成")
    .sort((left, right) => (right.progressUpdatedAt ?? "").localeCompare(left.progressUpdatedAt ?? ""));
  const nextPriority = dueNow[0] ?? sortedReminders[0];
  const withinAWeek = sortedReminders.filter((reminder) => getDaysUntil(reminder.date) <= 7);
  const actionRequiredCount = dueNow.length;
  const inProgressCount = reminders.filter((reminder) => reminder.progress === "處理中").length;
  const completedCount = completedReminders.length;
  const typeCounts = {
    valuation: sortedReminders.filter((reminder) => reminder.type === "估值").length,
    thesis: sortedReminders.filter((reminder) => reminder.type === "Thesis").length,
    earnings: sortedReminders.filter(
      (reminder) => reminder.type === "財報" || reminder.type === "營收"
    ).length
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
          eyebrow="Tracking Workspace"
          title="追蹤工作台"
          description="目前沒有提醒資料。這個頁面會在有事件、估值或 Thesis 檢查節點時，把它們排成可操作的工作隊列。"
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <PageHeader
        eyebrow="Tracking Workspace"
        title="追蹤工作台"
        description="先處理會改變判斷的提醒，再安排接下來的檢查節點。這一頁現在支援本地進度管理，讓提醒不只是閱讀卡片。"
        actions={
          <>
            <Badge tone="warning">{actionRequiredCount} 則需處理</Badge>
            <Badge tone="info">{inProgressCount} 則處理中</Badge>
            <Badge tone="positive">{completedCount} 則已完成</Badge>
          </>
        }
      />

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.45fr)_360px]">
        <SectionBlock
          title="今日優先隊列"
          subtitle="先處理最接近決策點的提醒。排序依照 snapshot 日期與提醒狀態，不依照股價波動。"
        >
          {dueNow.length === 0 ? (
            <div className="rounded-xl border border-slate-200/80 bg-white/75 px-4 py-5 text-sm leading-6 text-slate-600">
              今天到期的提醒都已處理完，接下來可以從「即將到來」區塊安排下一個檢查節點。
            </div>
          ) : (
            <ol className="space-y-3">
              {dueNow.map((reminder, index) => {
                const urgency = getUrgencyBadge(reminder);

                return (
                  <li
                    key={reminder.id}
                    className={`rounded-xl border border-slate-200/80 px-4 py-4 ${getRowAccent(reminder)}`}
                  >
                    <div className="grid gap-4 xl:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)]">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="inline-flex h-7 min-w-7 items-center justify-center rounded-lg border border-slate-300 bg-white text-sm font-semibold text-ink-900">
                            {index + 1}
                          </span>
                          <Badge tone={getStatusTone(reminder.status)}>{reminder.status}</Badge>
                          <Badge tone={getTypeTone(reminder.type)}>{reminder.type}</Badge>
                          <Badge tone={getProgressTone(reminder.progress)}>{reminder.progress}</Badge>
                          <p className="text-sm font-semibold tracking-[0.08em] text-slate-700">
                            {reminder.ticker}
                          </p>
                          <p className="text-sm text-slate-500">{formatDate(reminder.date)}</p>
                          <Badge tone={urgency.tone}>{urgency.label}</Badge>
                        </div>

                        <h3 className="mt-3 text-lg font-semibold text-ink-900">{reminder.title}</h3>
                        <p className="mt-2 text-sm leading-6 text-slate-600">{reminder.reason}</p>

                        <div className="mt-4 grid gap-3 lg:grid-cols-2">
                          <div className="rounded-xl border border-slate-200/80 bg-white/75 px-3.5 py-3">
                            <p className="text-[11px] uppercase tracking-[0.22em] text-slate-500">
                              這則提醒會改變
                            </p>
                            <p className="mt-1.5 text-sm leading-6 text-ink-900">
                              {reminder.affectsDecision}
                            </p>
                          </div>
                          <div className="rounded-xl border border-slate-200/80 bg-white/75 px-3.5 py-3">
                            <p className="text-[11px] uppercase tracking-[0.22em] text-slate-500">
                              下一步
                            </p>
                            <p className="mt-1.5 text-sm leading-6 text-ink-900">
                              {reminder.nextStep}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="border-t border-slate-200/80 pt-4 xl:border-l xl:border-t-0 xl:pl-4 xl:pt-0">
                        <div>
                          <p className="text-[11px] uppercase tracking-[0.22em] text-slate-500">
                            驗證焦點
                          </p>
                          <ul className="mt-3 space-y-2">
                            {reminder.verificationFocus.map((focus) => (
                              <li
                                key={focus}
                                className="rounded-lg border border-slate-200/80 bg-white/80 px-3 py-2 text-sm leading-6 text-slate-700"
                              >
                                {focus}
                              </li>
                            ))}
                          </ul>
                        </div>

                        <ReminderProgressControls
                          reminder={reminder}
                          onStart={() => startReminder(reminder.id)}
                          onComplete={() => completeReminder(reminder.id)}
                          onReset={() => resetReminderProgress(reminder.id)}
                        />

                        <div className="mt-4">
                          <p className="text-[11px] uppercase tracking-[0.22em] text-slate-500">
                            操作入口
                          </p>
                          <div className="mt-3 flex flex-wrap gap-2">
                            {reminder.actions.map((action) => (
                              <ActionLink key={`${reminder.id}-${action.label}`} action={action} />
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ol>
          )}
        </SectionBlock>

        <SectionBlock
          title="今天先做什麼"
          subtitle="把第一個要處理的提醒拆成原因、影響、下一步，並直接更新本地處理狀態。"
        >
          {nextPriority ? (
            <div className="space-y-4">
              <div className={`rounded-xl border border-slate-200/80 px-4 py-4 ${getRowAccent(nextPriority)}`}>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge tone="warning">優先 1</Badge>
                  <Badge tone={getTypeTone(nextPriority.type)}>{nextPriority.type}</Badge>
                  <Badge tone={getProgressTone(nextPriority.progress)}>{nextPriority.progress}</Badge>
                  <p className="text-sm font-semibold tracking-[0.08em] text-slate-700">
                    {nextPriority.ticker}
                  </p>
                </div>

                <h3 className="mt-3 text-lg font-semibold text-ink-900">{nextPriority.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{nextPriority.note}</p>

                <dl className="mt-4 space-y-3">
                  <div>
                    <dt className="text-[11px] uppercase tracking-[0.22em] text-slate-500">為什麼要處理</dt>
                    <dd className="mt-1 text-sm leading-6 text-ink-900">{nextPriority.reason}</dd>
                  </div>
                  <div>
                    <dt className="text-[11px] uppercase tracking-[0.22em] text-slate-500">下一步</dt>
                    <dd className="mt-1 text-sm leading-6 text-ink-900">{nextPriority.nextStep}</dd>
                  </div>
                </dl>

                <ReminderProgressControls
                  reminder={nextPriority}
                  onStart={() => startReminder(nextPriority.id)}
                  onComplete={() => completeReminder(nextPriority.id)}
                  onReset={() => resetReminderProgress(nextPriority.id)}
                />

                <div className="mt-4 flex flex-wrap gap-2">
                  {nextPriority.actions.map((action) => (
                    <ActionLink key={`${nextPriority.id}-${action.label}`} action={action} />
                  ))}
                </div>
              </div>

              <div className="grid gap-2 sm:grid-cols-3 xl:grid-cols-1 2xl:grid-cols-3">
                <div className="rounded-xl border border-amber-200/90 bg-amber-50/75 px-3.5 py-3">
                  <p className="text-[11px] uppercase tracking-[0.22em] text-amber-800">需處理</p>
                  <p className="mt-1.5 text-2xl font-semibold tracking-tight text-ink-900">
                    {actionRequiredCount}
                  </p>
                  <p className="mt-1 text-sm text-slate-600">今天要先排掉的決策提醒</p>
                </div>
                <div className="rounded-xl border border-sky-200/90 bg-sky-50/75 px-3.5 py-3">
                  <p className="text-[11px] uppercase tracking-[0.22em] text-sky-800">處理中</p>
                  <p className="mt-1.5 text-2xl font-semibold tracking-tight text-ink-900">
                    {inProgressCount}
                  </p>
                  <p className="mt-1 text-sm text-slate-600">已開始但尚未完成的提醒</p>
                </div>
                <div className="rounded-xl border border-emerald-200/90 bg-emerald-50/75 px-3.5 py-3">
                  <p className="text-[11px] uppercase tracking-[0.22em] text-emerald-800">已完成</p>
                  <p className="mt-1.5 text-2xl font-semibold tracking-tight text-ink-900">
                    {completedCount}
                  </p>
                  <p className="mt-1 text-sm text-slate-600">本地標記完成的提醒</p>
                </div>
              </div>

              <div className="rounded-xl border border-slate-200/80 bg-white/75 px-4 py-4">
                <p className="text-[11px] uppercase tracking-[0.22em] text-slate-500">資料透明度</p>
                <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-600">
                  <li>{mockSnapshot.freshnessNote}</li>
                  <li>{mockSnapshot.marketDataNote}</li>
                  <li>{mockSnapshot.thesisStorageNote}</li>
                </ul>
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-emerald-200/90 bg-emerald-50/70 px-4 py-5 text-sm leading-6 text-slate-700">
              目前所有提醒都已標記完成。你可以從下方的「最近完成」回顧處理紀錄，或重設部分提醒重新安排。
            </div>
          )}
        </SectionBlock>
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
        <SectionBlock
          title="即將到來"
          subtitle="提前知道接下來要驗證什麼，以及它會改變哪個判斷。"
        >
          <div className="divide-y divide-slate-200/80">
            {comingSoon.map((reminder) => {
              const urgency = getUrgencyBadge(reminder);

              return (
                <div key={reminder.id} className="grid gap-4 py-4 lg:grid-cols-[220px_minmax(0,1fr)]">
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge tone={getStatusTone(reminder.status)}>{reminder.status}</Badge>
                      <Badge tone={getTypeTone(reminder.type)}>{reminder.type}</Badge>
                      <Badge tone={getProgressTone(reminder.progress)}>{reminder.progress}</Badge>
                    </div>
                    <div>
                      <p className="text-sm font-semibold tracking-[0.08em] text-slate-700">
                        {reminder.ticker}
                      </p>
                      <p className="mt-1 text-sm text-slate-500">{formatDate(reminder.date)}</p>
                      <div className="mt-2">
                        <Badge tone={urgency.tone}>{urgency.label}</Badge>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h3 className="text-base font-semibold text-ink-900">{reminder.title}</h3>
                      <p className="mt-2 text-sm leading-6 text-slate-600">{reminder.reason}</p>
                    </div>

                    <div className="grid gap-3 lg:grid-cols-2">
                      <div className="rounded-xl border border-slate-200/80 bg-sand-50/70 px-3.5 py-3">
                        <p className="text-[11px] uppercase tracking-[0.22em] text-slate-500">
                          驗證焦點
                        </p>
                        <ul className="mt-2 space-y-2">
                          {reminder.verificationFocus.map((focus) => (
                            <li key={focus} className="text-sm leading-6 text-slate-700">
                              {focus}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="rounded-xl border border-slate-200/80 bg-white/80 px-3.5 py-3">
                        <p className="text-[11px] uppercase tracking-[0.22em] text-slate-500">
                          影響與下一步
                        </p>
                        <p className="mt-2 text-sm leading-6 text-ink-900">{reminder.affectsDecision}</p>
                        <p className="mt-2 text-sm leading-6 text-slate-600">{reminder.nextStep}</p>
                      </div>
                    </div>

                    <ReminderProgressControls
                      reminder={reminder}
                      onStart={() => startReminder(reminder.id)}
                      onComplete={() => completeReminder(reminder.id)}
                      onReset={() => resetReminderProgress(reminder.id)}
                    />

                    <div className="flex flex-wrap gap-2">
                      {reminder.actions.map((action) => (
                        <ActionLink key={`${reminder.id}-${action.label}`} action={action} />
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </SectionBlock>

        <SectionBlock
          title="估值 / Thesis 類型統整"
          subtitle="把直接影響持有紀律的提醒集中看，不和一般事件提醒混在一起。"
        >
          <div className="space-y-4">
            {(["估值", "Thesis"] as const).map((type) => {
              const reminders = valuationOrThesis.filter((reminder) => reminder.type === type);
              const tone = getTypeTone(type);

              return (
                <div key={type} className="rounded-xl border border-slate-200/80 bg-white/75 px-4 py-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Badge tone={tone}>{type}</Badge>
                      <p className="text-sm font-semibold text-ink-900">{reminders.length} 則</p>
                    </div>
                    <p className="text-xs text-slate-500">{getTypeSummary(type)}</p>
                  </div>

                  <div className="mt-4 space-y-3">
                    {reminders.map((reminder) => {
                      const urgency = getUrgencyBadge(reminder);

                      return (
                        <div
                          key={reminder.id}
                          className={`rounded-lg border border-slate-200/80 px-3.5 py-3 ${getRowAccent(reminder)}`}
                        >
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="text-sm font-semibold tracking-[0.08em] text-slate-700">
                              {reminder.ticker}
                            </p>
                            <Badge tone={getStatusTone(reminder.status)}>{reminder.status}</Badge>
                            <Badge tone={getProgressTone(reminder.progress)}>{reminder.progress}</Badge>
                            <Badge tone={urgency.tone}>{urgency.label}</Badge>
                          </div>
                          <p className="mt-2 text-sm font-medium text-ink-900">{reminder.title}</p>
                          <p className="mt-1.5 text-sm leading-6 text-slate-600">
                            {reminder.affectsDecision}
                          </p>
                          <div className="mt-3 flex flex-wrap gap-2">
                            {reminder.actions.map((action) => (
                              <ActionLink key={`${reminder.id}-${action.label}`} action={action} />
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}

            <div className="rounded-xl border border-slate-200/80 bg-sand-50/75 px-4 py-4">
              <p className="text-[11px] uppercase tracking-[0.22em] text-slate-500">提醒分布</p>
              <div className="mt-3 grid gap-2 sm:grid-cols-3">
                <div className="rounded-lg border border-slate-200/80 bg-white/75 px-3 py-3">
                  <p className="text-[11px] uppercase tracking-[0.22em] text-slate-500">財報 / 營收</p>
                  <p className="mt-1.5 text-xl font-semibold tracking-tight text-ink-900">
                    {typeCounts.earnings}
                  </p>
                  <p className="mt-1 text-sm text-slate-600">基本面重新校準</p>
                </div>
                <div className="rounded-lg border border-rose-200/80 bg-rose-50/60 px-3 py-3">
                  <p className="text-[11px] uppercase tracking-[0.22em] text-rose-700">估值</p>
                  <p className="mt-1.5 text-xl font-semibold tracking-tight text-ink-900">
                    {typeCounts.valuation}
                  </p>
                  <p className="mt-1 text-sm text-slate-600">檢查價格與回報空間</p>
                </div>
                <div className="rounded-lg border border-amber-200/80 bg-amber-50/70 px-3 py-3">
                  <p className="text-[11px] uppercase tracking-[0.22em] text-amber-700">Thesis</p>
                  <p className="mt-1.5 text-xl font-semibold tracking-tight text-ink-900">
                    {typeCounts.thesis}
                  </p>
                  <p className="mt-1 text-sm text-slate-600">檢查持有理由與紀律</p>
                </div>
              </div>
            </div>
          </div>
        </SectionBlock>
      </div>

      {completedReminders.length > 0 ? (
        <SectionBlock
          title="最近完成"
          subtitle="保留本地完成紀錄，讓你知道哪些提醒已經處理過，也能隨時重設。"
        >
          <div className="space-y-3">
            {completedReminders.slice(0, 4).map((reminder) => (
              <div
                key={reminder.id}
                className={`rounded-xl border border-slate-200/80 px-4 py-4 ${getRowAccent(reminder)}`}
              >
                <div className="flex flex-wrap items-center gap-2">
                  <Badge tone={getTypeTone(reminder.type)}>{reminder.type}</Badge>
                  <Badge tone="positive">已完成</Badge>
                  <p className="text-sm font-semibold tracking-[0.08em] text-slate-700">
                    {reminder.ticker}
                  </p>
                  {reminder.progressUpdatedAt ? (
                    <p className="text-sm text-slate-500">完成於 {formatDate(reminder.progressUpdatedAt)}</p>
                  ) : null}
                </div>
                <p className="mt-3 text-base font-semibold text-ink-900">{reminder.title}</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">{reminder.nextStep}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {reminder.actions.map((action) => (
                    <ActionLink key={`${reminder.id}-${action.label}`} action={action} />
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
            ))}
          </div>
        </SectionBlock>
      ) : null}
    </div>
  );
}
