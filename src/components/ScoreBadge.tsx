interface ScoreBadgeProps {
  label: string;
  score: number;
  summary: string;
}

function getTone(score: number) {
  if (score >= 8) return {
    dot: "bg-emerald-500",
    text: "text-emerald-700"
  };
  if (score >= 6) return {
    dot: "bg-amber-500",
    text: "text-amber-700"
  };
  return {
    dot: "bg-rose-500",
    text: "text-rose-700"
  };
}

export function ScoreBadge({ label, score, summary }: ScoreBadgeProps) {
  const tone = getTone(score);

  return (
    <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] gap-3 border-b border-slate-200/75 py-3 last:border-b-0 last:pb-0 first:pt-0">
      <span className={`mt-1.5 h-2 w-2 rounded-full ${tone.dot}`} />
      <div className="min-w-0">
        <p className="text-sm font-medium text-ink-900">{label}</p>
        <p className="mt-1 text-xs leading-5 text-slate-500">{summary}</p>
      </div>
      <div className="text-right">
        <p className={`text-[1.1rem] font-semibold tracking-tight ${tone.text}`}>{score.toFixed(1)}</p>
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">/ 10</p>
      </div>
    </div>
  );
}
