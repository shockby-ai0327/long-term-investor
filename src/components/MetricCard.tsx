interface MetricCardProps {
  label: string;
  value: string;
  hint: string;
  tone?: "default" | "positive" | "warning";
}

const toneMap = {
  default: "border-slate-200/80 bg-white/85",
  positive: "border-emerald-200/80 bg-emerald-50/[0.55]",
  warning: "border-amber-200/85 bg-amber-50/60"
};

export function MetricCard({
  label,
  value,
  hint,
  tone = "default"
}: MetricCardProps) {
  return (
    <div className={`rounded-lg border px-3.5 py-3 ${toneMap[tone]}`}>
      <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-slate-500">{label}</p>
      <p className="mt-1.5 text-[1.1rem] font-semibold leading-tight tracking-tight text-ink-900">
        {value}
      </p>
      <p className="mt-1 text-xs leading-5 text-slate-500">{hint}</p>
    </div>
  );
}
