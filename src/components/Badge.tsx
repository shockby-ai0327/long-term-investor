import type { ReactNode } from "react";

interface BadgeProps {
  children: ReactNode;
  tone?: "default" | "positive" | "warning" | "critical" | "info" | "neutral" | "negative";
  size?: "sm" | "md";
}

const toneClassMap = {
  default: "border border-slate-200/90 bg-slate-100/70 text-slate-700",
  positive: "border border-emerald-200/90 bg-emerald-50/80 text-emerald-700",
  neutral: "border border-slate-200/90 bg-white/90 text-slate-700",
  negative: "border border-rose-200/90 bg-rose-50/85 text-rose-700",
  warning: "border border-amber-200/90 bg-amber-50/85 text-amber-800",
  critical: "border border-rose-200/90 bg-rose-50/85 text-rose-700",
  info: "border border-sky-200/90 bg-sky-50/80 text-sky-700"
};

const sizeClassMap = {
  sm: "rounded-md px-2 py-[3px] text-[10px] tracking-[0.14em]",
  md: "rounded-md px-2.5 py-1 text-[11px] tracking-[0.16em]"
};

export function Badge({ children, tone = "default", size = "md" }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center font-semibold uppercase ${sizeClassMap[size]} ${toneClassMap[tone]}`}
    >
      {children}
    </span>
  );
}
