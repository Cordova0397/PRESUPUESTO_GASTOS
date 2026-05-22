import { NavLink } from "react-router-dom";

import type { NavItem } from "./Sidebar";

type TopbarProps = {
  currentItem: NavItem;
  items: NavItem[];
};

export function Topbar({ currentItem, items }: TopbarProps) {
  return (
    <header className="sticky top-0 z-20 border-b border-white/10 bg-slate-950/75 backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-200">
              Presupuesto gastos
            </p>
            <h2 className="truncate text-xl font-semibold text-white">
              {currentItem.label}
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-medium text-slate-100">
              MVP local
            </span>
          </div>
        </div>

        <nav className="flex gap-2 overflow-x-auto pb-1 xl:hidden">
          {items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                [
                  "whitespace-nowrap rounded-full border px-4 py-2 text-sm font-medium transition",
                  isActive
                    ? "border-brand-300 bg-brand-400/15 text-white"
                    : "border-white/10 bg-white/5 text-slate-200 hover:border-white/20 hover:bg-white/10"
                ].join(" ")
              }
            >
              {item.shortLabel ?? item.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  );
}
