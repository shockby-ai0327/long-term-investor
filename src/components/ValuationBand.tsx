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
          <p className="eyebrow-label">{label}</p>
          <p className="mt-1 text-[1.28rem] font-semibold tracking-tight text-ink-900">
            {current.toFixed(1)}x
          </p>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">
            中位
          </p>
          <p className="mt-1 text-sm font-medium text-slate-600">{median.toFixed(1)}x</p>
        </div>
      </div>

      <div className="relative h-10">
        <div className="absolute inset-x-0 top-4 h-[4px] rounded-full bg-slate-100" />
        <div className="absolute left-0 top-4 h-[4px] rounded-full bg-emerald-200" style={{ width: `${medianPosition}%` }} />
        <div className="absolute right-0 top-4 h-[4px] rounded-full bg-rose-200" style={{ left: `${medianPosition}%` }} />
        <div
          className="absolute top-2 h-8 w-px bg-slate-400"
          style={{ left: `${medianPosition}%` }}
        />
        <div
          className="absolute top-1 h-9 w-[2px] bg-ink-900"
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
          <p className="uppercase tracking-[0.14em] text-slate-400">低檔</p>
          <p className="mt-1 font-medium text-ink-900">{low.toFixed(1)}x</p>
        </div>
        <div className="text-center">
          <p className="uppercase tracking-[0.14em] text-slate-400">中位</p>
          <p className="mt-1 font-medium text-ink-900">{median.toFixed(1)}x</p>
        </div>
        <div className="text-right">
          <p className="uppercase tracking-[0.14em] text-slate-400">高檔</p>
          <p className="mt-1 font-medium text-ink-900">{high.toFixed(1)}x</p>
        </div>
      </div>
    </div>
  );
}
