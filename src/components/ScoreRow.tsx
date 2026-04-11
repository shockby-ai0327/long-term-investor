interface ScoreRowProps {
  label: string;
  score: number;
  note?: string;
  tone?: "positive" | "neutral" | "negative";
}

const toneClassMap = {
  positive: "bg-emerald-500",
  neutral: "bg-slate-400",
  negative: "bg-rose-500"
};

export function ScoreRow({
  label,
  score,
  note,
  tone = score >= 75 ? "positive" : score >= 55 ? "neutral" : "negative"
}: ScoreRowProps) {
  return (
    <div className="grid gap-2 border-b border-slate-200/75 py-3 last:border-b-0 last:pb-0 first:pt-0 sm:grid-cols-[140px_minmax(0,1fr)_56px] sm:items-center">
      <div>
        <p className="text-sm font-medium text-ink-900">{label}</p>
        {note ? <p className="mt-1 text-xs leading-5 text-slate-500">{note}</p> : null}
      </div>
      <div className="h-1.5 rounded-full bg-slate-100">
        <div className={`h-full rounded-full ${toneClassMap[tone]}`} style={{ width: `${score}%` }} />
      </div>
      <p className="text-right text-sm font-semibold tracking-tight text-ink-900">{score.toFixed(1)}</p>
    </div>
  );
}
