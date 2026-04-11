import { Link } from "react-router-dom";
import { DecisionPill } from "./DecisionPill";
import type { InvestmentAlert } from "../domain/investment";
import { formatDate } from "../utils/format";

interface AlertListProps {
  alerts: InvestmentAlert[];
  emptyLabel?: string;
}

export function AlertList({ alerts, emptyLabel = "目前沒有新的決策提醒。" }: AlertListProps) {
  if (!alerts.length) {
    return (
      <div className="rounded-lg border border-slate-200/80 bg-white/[0.82] px-4 py-3 text-sm text-slate-600">
        {emptyLabel}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {alerts.map((alert) => (
        <article key={alert.id} className="rounded-lg border border-slate-200/80 bg-white/[0.84] px-4 py-3.5">
          <div className="flex flex-wrap items-center gap-2">
            <DecisionPill
              label={alert.severity === "positive" ? "Positive" : alert.severity === "negative" ? "Negative" : "Neutral"}
              tone={alert.severity}
            />
            <DecisionPill
              label={alert.state === "active" ? "Active" : "Monitoring"}
              tone={alert.state === "active" ? "neutral" : "info"}
            />
            <p className="text-xs text-slate-500">{formatDate(alert.triggeredAt)}</p>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">{alert.ticker}</p>
          </div>
          <div className="mt-2 flex flex-col gap-2 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0">
              <h3 className="text-sm font-semibold text-ink-900">{alert.title}</h3>
              <p className="mt-1 text-sm leading-6 text-slate-600">{alert.summary}</p>
              <p className="mt-1 text-xs leading-5 text-slate-500">{alert.reason}</p>
            </div>
            <Link
              to={alert.actionTo}
              className="inline-flex shrink-0 items-center justify-center rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-ink-900 transition hover:border-slate-400"
            >
              {alert.actionLabel}
            </Link>
          </div>
        </article>
      ))}
    </div>
  );
}
