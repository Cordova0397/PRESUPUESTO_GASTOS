import { Outlet, useLocation } from "react-router-dom";

import { Sidebar, type NavItem } from "../components/layout/Sidebar";
import { Topbar } from "../components/layout/Topbar";

const navigationItems: NavItem[] = [
  {
    to: "/dashboard",
    label: "Dashboard",
    shortLabel: "Inicio",
    description: "Resumen general del MVP"
  },
  {
    to: "/catalogs",
    label: "Catálogos",
    shortLabel: "Catálogos",
    description: "Centros y conceptos"
  },
  {
    to: "/planned-expenses",
    label: "Gastos planificados",
    shortLabel: "Planificados",
    description: "Presupuesto base por periodo"
  },
  {
    to: "/actual-expenses",
    label: "Gastos reales",
    shortLabel: "Reales",
    description: "Registro ejecutado"
  },
  {
    to: "/variance",
    label: "Desviación de gastos",
    shortLabel: "Desviación",
    description: "Comparación entre real y planificado"
  },
  {
    to: "/analysis",
    label: "Análisis de gastos",
    shortLabel: "Análisis",
    description: "Vista resumida para revisión"
  }
];

export function AppLayout() {
  const location = useLocation();
  const currentItem =
    navigationItems.find((item) => location.pathname.startsWith(item.to)) ??
    navigationItems[0];

  return (
    <div className="relative min-h-screen bg-slate-950">
      <div className="pointer-events-none absolute inset-0 bg-dashboard-glow" />
      <div className="relative mx-auto flex min-h-screen max-w-[1600px]">
        <Sidebar items={navigationItems} />
        <div className="flex min-h-screen min-w-0 flex-1 flex-col">
          <Topbar currentItem={currentItem} items={navigationItems} />
          <main className="flex-1 px-4 pb-8 pt-6 sm:px-6 lg:px-8">
            <div className="mx-auto w-full max-w-7xl">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
