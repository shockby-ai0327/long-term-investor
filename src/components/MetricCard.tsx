interface MetricCardProps {
  label: string;
  value: string;
  hint: string;
  tone?: "default" | "positive" | "warning";
}

const toneMap = {
  default: "border-slate-200/80 bg-white/[0.84]",
  positive: "border-emerald-200/85 bg-emerald-50/[0.6]",
  warning: "border-amber-200/85 bg-amber-50/[0.62]"
};

export function MetricCard({
  label,
  value,
  hint,
  tone = "default"
}: MetricCardProps) {
  return (
    <div className={`grid gap-1.5 rounded-lg border px-3 py-2.5 sm:grid-cols-[auto_minmax(0,1fr)] sm:items-center ${toneMap[tone]}`}>
      <div className="min-w-0 sm:order-2">
        <p className="eyebrow-label">{label}</p>
        <p className="mt-1 text-xs leading-5 text-slate-500">{hint}</p>
      </div>
      <p className="text-left text-[1.02rem] font-semibold leading-tight tracking-tight text-ink-900 sm:order-1">
        {value}
      </p>
    </div>
  );
}
