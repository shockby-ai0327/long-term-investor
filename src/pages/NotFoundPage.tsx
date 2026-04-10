import { Link } from "react-router-dom";

export function NotFoundPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="panel max-w-lg px-8 py-10 text-center">
        <p className="text-[11px] uppercase tracking-[0.34em] text-sage-600">404</p>
        <h1 className="mt-4 font-display text-4xl text-ink-900">找不到這個頁面</h1>
        <p className="mt-4 text-sm leading-7 text-slate-600">
          這個網站只保留有助於長線投資決策的頁面，請回到 Dashboard 繼續研究。
        </p>
        <Link
          to="/"
          className="mt-6 inline-flex rounded-full bg-ink-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-ink-800"
        >
          回到首頁
        </Link>
      </div>
    </div>
  );
}
