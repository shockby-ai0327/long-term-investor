import { Badge } from "./Badge";

interface ScoreBadgeProps {
  label: string;
  score: number;
  summary: string;
}

function getTone(score: number) {
  if (score >= 8) return "positive";
  if (score >= 6) return "warning";
  return "critical";
}

export function ScoreBadge({ label, score, summary }: ScoreBadgeProps) {
  const tone = getTone(score);

  return (
    <div className="rounded-xl border border-slate-200/80 bg-white/80 px-4 py-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-medium text-ink-900">{label}</p>
        <Badge tone={tone}>{score.toFixed(1)} / 10</Badge>
      </div>
      <p className="mt-3 text-sm leading-6 text-slate-600">{summary}</p>
      <div className="mt-4 h-2 rounded-full bg-slate-100">
        <div
          className={`h-full rounded-full ${
            tone === "positive"
              ? "bg-emerald-600"
              : tone === "warning"
                ? "bg-amber-500"
                : "bg-rose-500"
          } animate-pulseLine`}
          style={{ width: `${score * 10}%` }}
        />
      </div>
    </div>
  );
}
