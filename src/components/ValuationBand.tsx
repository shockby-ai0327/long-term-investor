import { clamp } from "../utils/format";

interface ValuationBandProps {
  label: string;
  low: number;
  median: number;
  high: number;
  current: number;
}

export function ValuationBand({
  label,
  low,
  median,
  high,
  current
}: ValuationBandProps) {
  const span = high - low || 1;
  const currentPosition = clamp(((current - low) / span) * 100, 0, 100);
  const medianPosition = clamp(((median - low) / span) * 100, 0, 100);

  return (
    <div className="rounded-[24px] border border-slate-200/80 bg-sand-50/70 p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="text-sm font-medium text-ink-900">{label}</p>
        <p className="text-sm font-semibold text-sage-600">目前 {current.toFixed(1)}x</p>
      </div>
      <div className="relative h-3 rounded-full bg-gradient-to-r from-emerald-200 via-amber-200 to-rose-200">
        <div
          className="absolute top-1/2 h-5 w-5 -translate-y-1/2 rounded-full border-2 border-white bg-ink-900 shadow"
          style={{ left: `calc(${currentPosition}% - 10px)` }}
        />
        <div
          className="absolute top-1/2 h-6 w-0.5 -translate-y-1/2 bg-slate-500"
          style={{ left: `${medianPosition}%` }}
        />
      </div>
      <div className="mt-3 flex items-center justify-between text-xs tracking-wide text-slate-500">
        <span>低點 {low.toFixed(1)}x</span>
        <span>中位 {median.toFixed(1)}x</span>
        <span>高點 {high.toFixed(1)}x</span>
      </div>
    </div>
  );
}
