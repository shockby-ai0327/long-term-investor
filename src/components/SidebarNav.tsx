import { NavLink } from "react-router-dom";

const navItems = [
  {
    to: "/",
    label: "Dashboard",
    caption: "首頁工作台",
    end: true
  },
  {
    to: "/watchlist",
    label: "Watchlist",
    caption: "觀察名單"
  },
  {
    to: "/stocks/MSFT",
    label: "Stock Detail",
    caption: "個股分析"
  },
  {
    to: "/thesis/MSFT",
    label: "Thesis / Notes",
    caption: "投資假設"
  },
  {
    to: "/portfolio",
    label: "Portfolio",
    caption: "投資組合"
  },
  {
    to: "/tracking",
    label: "Tracking",
    caption: "追蹤工作台"
  }
];

interface SidebarNavProps {
  compact?: boolean;
}

export function SidebarNav({ compact = false }: SidebarNavProps) {
  return (
    <nav className={`flex ${compact ? "gap-2 overflow-x-auto pb-1" : "flex-col gap-1.5"}`}>
      {navItems.map((item) => (
        <NavLink
          key={item.to}
          end={item.end}
          to={item.to}
          className={({ isActive }) =>
            [
              "group rounded-xl border px-3 py-3 transition duration-200",
              compact ? "min-w-[170px]" : "",
              isActive
                ? "border-ink-900 bg-ink-900 text-white shadow-[0_12px_24px_-18px_rgba(23,33,38,0.75)]"
                : "border-transparent bg-transparent text-ink-900 hover:border-slate-200/85 hover:bg-white/70"
            ].join(" ")
          }
        >
          <p className="text-[11px] uppercase tracking-[0.24em] text-current/55">{item.label}</p>
          <p className="mt-1.5 text-sm font-medium">{item.caption}</p>
        </NavLink>
      ))}
    </nav>
  );
}
