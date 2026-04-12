import { Link, Outlet } from "react-router-dom";
import { SidebarNav } from "../components/SidebarNav";
import { mockSnapshot } from "../data/mockData";

export function AppShell() {
  return (
    <div className="bg-[var(--bg-main)]">
      <div className="mx-auto max-w-[1540px] px-4 py-2.5 lg:px-5">
        <div className="grid gap-3 lg:grid-cols-[192px_minmax(0,1fr)]">
          <aside className="hidden lg:block">
            <div className="panel sticky top-2 px-3.5 py-3">
              <Link to="/" className="block border-b border-slate-200/75 pb-2.5">
                <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-slate-500">
                  Long Horizon
                </p>
                <h1 className="mt-1 text-[1rem] font-semibold tracking-tight text-ink-900">
                  長線投資工作台
                </h1>
                <p className="mt-1 text-[10px] text-slate-500">決策優先 · 長線導向</p>
              </Link>

              <div className="mt-2">
                <SidebarNav />
              </div>
            </div>
          </aside>

          <div className="min-w-0">
            <div className="panel mb-2.5 px-3.5 py-3 lg:hidden">
              <div className="flex items-center justify-between gap-4">
                <Link to="/" className="min-w-0">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-slate-500">
                    Long Horizon
                  </p>
                  <h1 className="mt-1 text-base font-semibold tracking-tight text-ink-900">
                    長線投資工作台
                  </h1>
                </Link>
                <p className="text-[10px] uppercase tracking-[0.16em] text-slate-500">長線決策</p>
              </div>

              <div className="mt-2.5 border-t border-slate-200/75 pt-2.5">
                <SidebarNav compact />
              </div>
            </div>

            <div className="shell-statusbar mb-2.5">
              <div className="shell-statusitem">
                <span className="eyebrow-label">資料快照</span>
                <span className="text-xs font-medium text-ink-900">{mockSnapshot.label}</span>
                <span className="text-xs text-slate-500">{mockSnapshot.asOfDate}</span>
              </div>
              <div className="shell-statusitem">
                <span className="eyebrow-label">資料性質</span>
                <span className="truncate text-xs text-slate-600">非即時行情、非即時新聞</span>
              </div>
              <div className="shell-statusitem">
                <span className="eyebrow-label">本地狀態</span>
                <span className="truncate text-xs text-slate-600">投資假設與工作狀態只存於目前瀏覽器</span>
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
