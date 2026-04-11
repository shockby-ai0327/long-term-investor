import { Link, Outlet } from "react-router-dom";
import { SidebarNav } from "../components/SidebarNav";
import { mockSnapshot } from "../data/mockData";

export function AppShell() {
  return (
    <div className="min-h-screen bg-[var(--bg-main)]">
      <div className="mx-auto flex min-h-screen max-w-[1540px] gap-4 px-4 py-4 lg:px-5">
        <aside className="hidden w-[232px] shrink-0 lg:block">
          <div className="panel sticky top-4 flex h-[calc(100vh-2rem)] flex-col px-4 py-4">
            <Link to="/" className="border-b border-slate-200/80 pb-4">
              <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-slate-500">
                Long Horizon
              </p>
              <h1 className="mt-2 text-[1.35rem] font-semibold tracking-tight text-ink-900">
                長線投資工作台
              </h1>
              <p className="mt-1.5 text-xs uppercase tracking-[0.16em] text-slate-500">
                Long-term Investor Workspace
              </p>
            </Link>

            <div className="mt-4 flex-1 overflow-y-auto">
              <SidebarNav />
            </div>
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          <div className="panel mb-3 px-4 py-3 lg:hidden">
            <div className="flex items-start justify-between gap-4">
              <Link to="/" className="min-w-0">
                <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-slate-500">
                  Long Horizon
                </p>
                <h1 className="mt-1.5 text-lg font-semibold tracking-tight text-ink-900">
                  長線投資工作台
                </h1>
              </Link>
              <p className="shrink-0 text-[10px] font-medium uppercase tracking-[0.18em] text-slate-500">
                Workspace
              </p>
            </div>

            <div className="mt-3 border-t border-slate-200/80 pt-3">
              <SidebarNav compact />
            </div>
          </div>

          <div className="panel mb-4 px-4 py-3 sm:px-5">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.26em] text-slate-500">
                    資料狀態
                  </p>
                  <span className="text-sm font-semibold text-ink-900">{mockSnapshot.label}</span>
                  <span className="text-sm text-slate-500">{mockSnapshot.asOfDate}</span>
                </div>
                <p className="mt-1.5 text-sm text-slate-600">
                  {mockSnapshot.freshnessNote}
                </p>
              </div>

              <div className="grid gap-2 text-sm text-slate-600 sm:grid-cols-2 lg:max-w-[620px] lg:shrink-0">
                <div className="rounded-xl border border-slate-200/70 bg-white/70 px-3 py-2.5">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-500">
                    行情 / 新聞
                  </p>
                  <p className="mt-1 text-sm text-ink-900">{mockSnapshot.marketDataNote}</p>
                </div>
                <div className="rounded-xl border border-slate-200/70 bg-white/70 px-3 py-2.5">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-500">
                    本地儲存
                  </p>
                  <p className="mt-1 text-sm text-ink-900">{mockSnapshot.thesisStorageNote}</p>
                </div>
              </div>
            </div>
          </div>

          <Outlet />
        </div>
      </div>
    </div>
  );
}
