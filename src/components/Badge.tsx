import type { ReactNode } from "react";

interface BadgeProps {
  children: ReactNode;
  tone?: "default" | "positive" | "warning" | "critical" | "info" | "neutral" | "negative";
}

const toneClassMap = {
  default: "border border-slate-200 bg-slate-100/80 text-slate-700",
  positive: "border border-emerald-200 bg-emerald-50 text-emerald-700",
  neutral: "border border-slate-200 bg-white text-slate-700",
  negative: "border border-rose-200 bg-rose-50 text-rose-700",
  warning: "border border-amber-200 bg-amber-50 text-amber-800",
  critical: "border border-rose-200 bg-rose-50 text-rose-700",
  info: "border border-sky-200 bg-sky-50 text-sky-700"
};

export function Badge({ children, tone = "default" }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-md px-2.5 py-1 text-[11px] font-semibold tracking-[0.18em] ${toneClassMap[tone]}`}
    >
      {children}
    </span>
  );
}
