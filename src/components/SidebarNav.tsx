import { NavLink } from "react-router-dom";

const navItems = [
  {
    to: "/",
    label: "首頁工作台",
    caption: "Dashboard",
    end: true
  },
  {
    to: "/watchlist",
    label: "觀察名單",
    caption: "Watchlist"
  },
  {
    to: "/stocks/MSFT",
    label: "個股分析",
    caption: "Stock Detail"
  },
  {
    to: "/thesis/MSFT",
    label: "投資假設",
    caption: "Thesis / Notes"
  },
  {
    to: "/portfolio",
    label: "投資組合",
    caption: "Portfolio"
  },
  {
    to: "/tracking",
    label: "追蹤工作台",
    caption: "Tracking"
  }
];

interface SidebarNavProps {
  compact?: boolean;
}

export function SidebarNav({ compact = false }: SidebarNavProps) {
  return (
    <nav className={`flex ${compact ? "gap-1.5 overflow-x-auto pb-1" : "flex-col gap-1"}`}>
      {navItems.map((item) => (
        <NavLink
          key={item.to}
          end={item.end}
          to={item.to}
          className={({ isActive }) =>
            [
              "group relative overflow-hidden rounded-lg transition duration-150",
              compact ? "min-w-[132px] shrink-0 px-3 py-2.5" : "px-3 py-2.5",
              isActive
                ? "bg-ink-900 text-white"
                : "text-slate-700 hover:bg-white/78 hover:text-ink-900"
            ].join(" ")
          }
        >
          {({ isActive }) => (
            <>
              <span
                className={[
                  "absolute inset-y-2 left-0 w-[2px] rounded-full transition",
                  compact ? "hidden" : "",
                  isActive ? "bg-white/90" : "bg-transparent group-hover:bg-slate-300/80"
                ].join(" ")}
              />
              <div className={compact ? "" : "pl-2"}>
                <div className="flex items-baseline justify-between gap-3">
                  <p className="text-sm font-medium tracking-[0.01em]">{item.label}</p>
                  <p className="text-[10px] uppercase tracking-[0.18em] text-current/45">
                    {item.caption}
                  </p>
                </div>
              </div>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
}
