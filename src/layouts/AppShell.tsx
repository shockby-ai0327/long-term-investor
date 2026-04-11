import { Link, Outlet } from "react-router-dom";
import { SidebarNav } from "../components/SidebarNav";
import { mockSnapshot } from "../data/mockData";

export function AppShell() {
  return (
    <div className="bg-[var(--bg-main)]">
      <div className="mx-auto max-w-[1540px] px-4 py-3 lg:px-5">
        <div className="grid gap-4 lg:grid-cols-[204px_minmax(0,1fr)]">
          <aside className="hidden lg:block">
            <div className="panel sticky top-3 px-4 py-3.5">
              <Link to="/" className="block border-b border-slate-200/75 pb-3">
                <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-slate-500">
                  Long Horizon
                </p>
                <h1 className="mt-1.5 text-[1.04rem] font-semibold tracking-tight text-ink-900">
                  長線投資工作台
                </h1>
                <p className="mt-1 text-[11px] text-slate-500">long-term investor</p>
              </Link>

              <div className="mt-2.5">
                <SidebarNav />
              </div>
            </div>
          </aside>

          <div className="min-w-0">
            <div className="panel mb-3 px-4 py-3 lg:hidden">
              <div className="flex items-center justify-between gap-4">
                <Link to="/" className="min-w-0">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-slate-500">
                    Long Horizon
                  </p>
                  <h1 className="mt-1 text-base font-semibold tracking-tight text-ink-900">
                    長線投資工作台
                  </h1>
                </Link>
                <p className="text-[10px] uppercase tracking-[0.16em] text-slate-500">決策系統</p>
              </div>

              <div className="mt-3 border-t border-slate-200/75 pt-3">
                <SidebarNav compact />
              </div>
            </div>

            <div className="shell-statusbar mb-3">
              <div className="shell-statusitem">
                <span className="eyebrow-label">資料快照</span>
                <span className="text-xs font-medium text-ink-900">{mockSnapshot.label}</span>
                <span className="text-xs text-slate-500">{mockSnapshot.asOfDate}</span>
              </div>
              <div className="shell-statusitem">
                <span className="eyebrow-label">資料來源</span>
                <span className="truncate text-xs text-slate-600">{mockSnapshot.marketDataNote}</span>
              </div>
              <div className="shell-statusitem">
                <span className="eyebrow-label">本地狀態</span>
                <span className="truncate text-xs text-slate-600">{mockSnapshot.thesisStorageNote}</span>
              </div>
            </div>

            <main className="space-y-4">
              <Outlet />
            </main>
          </div>
        </div>
      </div>
    </div>
  );
}
