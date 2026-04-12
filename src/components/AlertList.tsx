import { Link } from "react-router-dom";
import { DecisionPill } from "./DecisionPill";
import {
  getAlertRuleDisplay,
  getAlertSeverityDisplay,
  getAlertStateDisplay,
  type InvestmentAlert
} from "../domain/investment";
import { formatDate } from "../utils/format";

interface AlertListProps {
  alerts: InvestmentAlert[];
  emptyLabel?: string;
  variant?: "default" | "compact";
}

export function AlertList({
  alerts,
  emptyLabel = "目前沒有新的決策提醒。",
  variant = "default"
}: AlertListProps) {
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
        <article
          key={alert.id}
          className={
            variant === "compact"
              ? "border-b border-slate-200/75 py-2.5 first:pt-0 last:border-b-0 last:pb-0"
              : "rounded-lg border border-slate-200/80 bg-white/[0.84] px-4 py-3"
          }
        >
          <div className="flex flex-wrap items-center gap-2">
            <DecisionPill label={getAlertSeverityDisplay(alert.severity).label} tone={getAlertSeverityDisplay(alert.severity).tone} size="sm" />
            <DecisionPill label={getAlertStateDisplay(alert.state).label} tone={getAlertStateDisplay(alert.state).tone} size="sm" />
            <DecisionPill label={getAlertRuleDisplay(alert.rule).label} tone="info" size="sm" />
            <p className="text-xs text-slate-500">{formatDate(alert.triggeredAt)}</p>
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">{alert.ticker}</p>
          </div>
          <div className={`mt-2 flex flex-col gap-2 ${variant === "compact" ? "xl:flex-row xl:items-start xl:justify-between" : "lg:flex-row lg:items-start lg:justify-between"}`}>
            <div className="min-w-0">
              <h3 className="text-sm font-semibold text-ink-900">{alert.title}</h3>
              <p className={`mt-1 ${variant === "compact" ? "text-xs leading-5 text-slate-600" : "text-sm leading-6 text-slate-600"}`}>{alert.summary}</p>
              {variant === "default" ? (
                <p className="mt-1 text-xs leading-5 text-slate-500">{alert.reason}</p>
              ) : null}
            </div>
            <Link
              to={alert.actionTo}
              className={`toolbar-button shrink-0 border-slate-300 bg-white text-ink-900 hover:border-slate-400 ${variant === "compact" ? "px-2.5 py-1.5 text-xs" : ""}`}
            >
              {alert.actionLabel}
            </Link>
          </div>
        </article>
      ))}
    </div>
  );
}
