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
    <div className="space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-slate-500">{label}</p>
          <p className="mt-1 text-[1.35rem] font-semibold tracking-tight text-ink-900">
            {current.toFixed(1)}x
          </p>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-400">
            median
          </p>
          <p className="mt-1 text-sm font-medium text-slate-600">{median.toFixed(1)}x</p>
        </div>
      </div>

      <div className="relative h-8">
        <div className="absolute inset-x-0 top-3 h-[3px] rounded-full bg-gradient-to-r from-emerald-200 via-amber-200 to-rose-200" />
        <div
          className="absolute top-1.5 h-5 w-px bg-slate-400"
          style={{ left: `${medianPosition}%` }}
        />
        <div
          className="absolute top-0 h-8 w-[2px] bg-ink-900"
          style={{ left: `${currentPosition}%` }}
        />
        <div
          className="absolute top-0 -translate-x-1/2 rounded bg-ink-900 px-1.5 py-0.5 text-[10px] font-semibold text-white"
          style={{ left: `${currentPosition}%` }}
        >
          目前
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 text-[11px] leading-4 text-slate-500">
        <div>
          <p className="uppercase tracking-[0.18em] text-slate-400">Low</p>
          <p className="mt-1 font-medium text-ink-900">{low.toFixed(1)}x</p>
        </div>
        <div className="text-center">
          <p className="uppercase tracking-[0.18em] text-slate-400">Median</p>
          <p className="mt-1 font-medium text-ink-900">{median.toFixed(1)}x</p>
        </div>
        <div className="text-right">
          <p className="uppercase tracking-[0.18em] text-slate-400">High</p>
          <p className="mt-1 font-medium text-ink-900">{high.toFixed(1)}x</p>
        </div>
      </div>
    </div>
  );
}
