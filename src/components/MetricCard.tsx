interface MetricCardProps {
  label: string;
  value: string;
  hint: string;
  tone?: "default" | "positive" | "warning";
}

const toneMap = {
  default: "border-slate-200/80 bg-white/80",
  positive: "border-emerald-200/80 bg-emerald-50/65",
  warning: "border-amber-200/90 bg-amber-50/75"
};

export function MetricCard({
  label,
  value,
  hint,
  tone = "default"
}: MetricCardProps) {
  return (
    <div className={`rounded-xl border px-4 py-3.5 ${toneMap[tone]}`}>
      <p className="text-[11px] uppercase tracking-[0.24em] text-slate-500">{label}</p>
      <p className="mt-2 text-[1.65rem] font-semibold tracking-tight text-ink-900">{value}</p>
      <p className="mt-1.5 text-sm leading-6 text-slate-500">{hint}</p>
    </div>
  );
}
