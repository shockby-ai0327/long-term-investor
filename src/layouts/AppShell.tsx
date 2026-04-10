import { Link, Outlet, useLocation } from "react-router-dom";
import { SidebarNav } from "../components/SidebarNav";
import { mockSnapshot } from "../data/mockData";

function getPageMeta(pathname: string) {
  if (pathname.startsWith("/stocks")) {
    return {
      title: "個股分析",
      description: "集中看公司品質、成長、估值與風險，判斷這檔股票是否值得長期持有。"
    };
  }

  if (pathname.startsWith("/thesis")) {
    return {
      title: "投資假設",
      description: "記錄買進理由、驗證重點與失效條件，讓後續持有與加減碼有依據。"
    };
  }

  if (pathname.startsWith("/portfolio")) {
    return {
      title: "投資組合",
      description: "從單一標的延伸到整體配置，檢查集中度、曝險與現金部位是否合理。"
    };
  }

  if (pathname.startsWith("/tracking")) {
    return {
      title: "追蹤工作台",
      description: "先看今天要處理什麼、會改變哪個判斷，再直接進到個股、Thesis 或組合。"
    };
  }

  if (pathname.startsWith("/watchlist")) {
    return {
      title: "觀察名單",
      description: "整理研究中的公司、估值區間與下一個檢查節點，方便回到分析流程。"
    };
  }

  return {
    title: "Dashboard",
    description: "快速查看觀察名單、投資組合、近期事件與最近檢查過的公司。"
  };
}

export function AppShell() {
  const location = useLocation();
  const pageMeta = getPageMeta(location.pathname);

  return (
    <div className="min-h-screen">
      <div className="mx-auto flex min-h-screen max-w-[1680px] gap-4 px-4 py-4 lg:px-5">
        <aside className="panel sticky top-4 hidden h-[calc(100vh-2rem)] w-[286px] shrink-0 flex-col justify-between px-5 py-5 lg:flex">
          <div>
            <Link to="/" className="block">
              <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-sage-700">
                Long Horizon
              </p>
              <h1 className="mt-2 text-[1.95rem] font-semibold leading-tight tracking-tight text-ink-900">
                長線投資工作台
              </h1>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                只服務長期投資決策。看公司品質、成長、估值與 thesis，不做短線掃描、盤中訊號或題材追價。
              </p>
            </Link>

            <div className="mt-6">
              <SidebarNav />
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200/80 bg-sand-50/75 px-4 py-4">
            <div className="flex items-center justify-between gap-3">
              <p className="text-[11px] uppercase tracking-[0.26em] text-slate-500">資料狀態</p>
              <p className="text-xs font-medium text-slate-600">{mockSnapshot.asOfDate}</p>
            </div>
            <p className="mt-3 text-sm font-medium text-ink-900">{mockSnapshot.label}</p>
            <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-600">
              <li>{mockSnapshot.marketDataNote}</li>
              <li>{mockSnapshot.thesisStorageNote}</li>
            </ul>
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          <div className="panel mb-4 px-4 py-4 lg:hidden">
            <Link to="/" className="block">
              <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-sage-700">
                Long Horizon
              </p>
              <h1 className="mt-2 text-2xl font-semibold tracking-tight text-ink-900">
                長線投資工作台
              </h1>
            </Link>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              只處理長期投資判斷，不混入盤中交易與市場噪音。
            </p>
            <div className="mt-4">
              <SidebarNav compact />
            </div>
          </div>

          <div className="panel mb-4 px-4 py-4 sm:px-5">
            <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_340px] xl:items-start">
              <div>
                <p className="text-[11px] uppercase tracking-[0.3em] text-slate-500">
                  {mockSnapshot.label} • {mockSnapshot.asOfDate}
                </p>
                <h2 className="mt-2 text-[1.75rem] font-semibold tracking-tight text-ink-900">
                  {pageMeta.title}
                </h2>
                <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
                  {pageMeta.description}
                </p>
                <div className="mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
                  <div className="rounded-xl border border-slate-200/80 bg-white/80 px-3 py-2.5">
                    <p className="text-[11px] uppercase tracking-[0.24em] text-slate-500">資料來源</p>
                    <p className="mt-1 text-sm text-ink-900">{mockSnapshot.freshnessNote}</p>
                  </div>
                  <div className="rounded-xl border border-slate-200/80 bg-white/80 px-3 py-2.5">
                    <p className="text-[11px] uppercase tracking-[0.24em] text-slate-500">行情 / 新聞</p>
                    <p className="mt-1 text-sm text-ink-900">{mockSnapshot.marketDataNote}</p>
                  </div>
                  <div className="rounded-xl border border-slate-200/80 bg-white/80 px-3 py-2.5 sm:col-span-2 xl:col-span-1">
                    <p className="text-[11px] uppercase tracking-[0.24em] text-slate-500">Thesis 儲存</p>
                    <p className="mt-1 text-sm text-ink-900">{mockSnapshot.thesisStorageNote}</p>
                  </div>
                </div>
              </div>
              <div className="grid gap-2 self-start">
                <div className="rounded-xl border border-slate-200/80 bg-sand-50/75 px-4 py-3">
                  <p className="text-[11px] uppercase tracking-[0.24em] text-slate-500">核心框架</p>
                  <p className="mt-1.5 text-sm font-medium text-ink-900">品質 / 成長 / 估值 / 風險</p>
                </div>
                <div className="rounded-xl border border-slate-200/80 bg-sand-50/75 px-4 py-3">
                  <p className="text-[11px] uppercase tracking-[0.24em] text-slate-500">工具邊界</p>
                  <p className="mt-1.5 text-sm font-medium text-ink-900">
                    不回答今天哪支會漲，不提供盤中買賣訊號
                  </p>
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
