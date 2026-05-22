import { NavLink } from "react-router-dom";

export type NavItem = {
  to: string;
  label: string;
  shortLabel?: string;
  description: string;
};

type SidebarProps = {
  items: NavItem[];
};

const baseLinkClasses =
  "group rounded-2xl border px-4 py-3 transition duration-200";

export function Sidebar({ items }: SidebarProps) {
  return (
    <aside className="hidden w-80 shrink-0 border-r border-white/10 bg-slate-950/80 px-6 py-8 backdrop-blur xl:flex xl:flex-col">
      <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-panel">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-200">
          MVP local
        </p>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight text-white">
          Presupuesto gastos
        </h1>
        <p className="mt-3 text-sm leading-6 text-slate-300">
          Base visual del sistema para control presupuestal, pensada para crecer
          en fases posteriores sin perder claridad operativa.
        </p>
      </div>

      <nav className="mt-8 flex flex-1 flex-col gap-3">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              isActive
                ? `${baseLinkClasses} border-brand-400/50 bg-brand-500/15`
                : `${baseLinkClasses} border-white/8 bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.06]`
            }
          >
            <span className="block text-sm font-semibold text-white">
              {item.label}
            </span>
            <span className="mt-1 block text-sm text-slate-300">
              {item.description}
            </span>
          </NavLink>
        ))}
      </nav>

      <div className="rounded-3xl border border-emerald-400/20 bg-emerald-400/10 p-5 text-sm text-emerald-100">
        <p className="font-semibold">Zona horaria de referencia</p>
        <p className="mt-2 leading-6 text-emerald-50/90">
          America/Lima se mantiene como referencia funcional para futuras fechas
          del negocio.
        </p>
      </div>
    </aside>
  );
}
