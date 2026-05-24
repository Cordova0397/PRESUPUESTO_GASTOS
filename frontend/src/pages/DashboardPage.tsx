import { useCallback, useEffect, useRef, useState } from "react";

import { DashboardFilters } from "../components/dashboard/DashboardFilters";
import { KpiCardsGrid } from "../components/dashboard/KpiCardsGrid";
import { PageHeader } from "../components/layout/PageHeader";
import { getExpenseKpis } from "../services/reportsService";
import type { ExpenseKpis, ExpenseKpisFilters } from "../types/report";
import { getCurrentYearInLima } from "../utils/date";

const STATUS_STYLES: Record<string, string> = {
  AHORRO: "bg-green-50 text-green-700 border-green-200",
  "EN PRESUPUESTO": "bg-blue-50 text-blue-700 border-blue-200",
  SOBRECOSTO: "bg-red-50 text-red-700 border-red-200",
  "SIN PRESUPUESTO": "bg-orange-50 text-orange-700 border-orange-200",
};

export function DashboardPage() {
  const [kpis, setKpis] = useState<ExpenseKpis | null>(null);
  const [kpisLoading, setKpisLoading] = useState(true);
  const [kpisError, setKpisError] = useState<string | null>(null);
  const [activeFilters, setActiveFilters] = useState<ExpenseKpisFilters>({
    year: getCurrentYearInLima(),
  });
  const loadIdRef = useRef(0);

  const loadKpis = useCallback(async () => {
    const id = ++loadIdRef.current;
    setKpisLoading(true);
    setKpisError(null);
    try {
      const data = await getExpenseKpis(activeFilters);
      if (loadIdRef.current === id) setKpis(data);
    } catch (err) {
      if (loadIdRef.current === id)
        setKpisError(
          err instanceof Error ? err.message : "Error al cargar los KPIs.",
        );
    } finally {
      if (loadIdRef.current === id) setKpisLoading(false);
    }
  }, [activeFilters]);

  useEffect(() => {
    void loadKpis();
  }, [loadKpis]);

  function handleFiltersApply(filters: ExpenseKpisFilters) {
    setActiveFilters(filters);
  }

  function handleReload() {
    void loadKpis();
  }

  const statusCls = kpis
    ? (STATUS_STYLES[kpis.status] ?? "bg-slate-50 text-slate-700 border-slate-200")
    : "";

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="KPIs principales del control presupuestal."
        badge="KPIs MVP"
      />

      {/* Nota informativa */}
      <p className="rounded-[16px] border border-slate-200/70 bg-slate-50 px-5 py-3 text-xs text-slate-500">
        Los KPIs se calculan en backend desde gastos planificados y reales. Esta
        pantalla no guarda resultados calculados.
      </p>

      {/* Panel de filtros */}
      <section className="overflow-hidden rounded-[28px] border border-slate-200/80 bg-white/95 shadow-panel">
        <div className="border-b border-slate-200 px-6 py-5">
          <h2 className="mb-4 text-base font-semibold text-slate-950">
            Filtros de periodo
          </h2>
          <DashboardFilters onApply={handleFiltersApply} onReload={handleReload} />
        </div>

        {/* Error */}
        {kpisError && !kpisLoading && (
          <div className="flex items-center gap-4 border-b border-red-100 bg-red-50 px-6 py-4">
            <p className="text-sm text-red-600">{kpisError}</p>
            <button
              type="button"
              onClick={handleReload}
              className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Reintentar
            </button>
          </div>
        )}

        {/* Estado backend */}
        {kpis && !kpisLoading && (
          <div className="px-6 py-3">
            <span
              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium ${statusCls}`}
            >
              Estado: {kpis.status}
            </span>
          </div>
        )}
      </section>

      {/* Tarjetas KPI */}
      <KpiCardsGrid kpis={kpis} isLoading={kpisLoading} />

      {/* Regla de negocio */}
      <section className="rounded-[28px] border border-brand-200/70 bg-brand-50 p-6 shadow-panel">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-700">
          Regla principal
        </p>
        <h2 className="mt-3 text-2xl font-semibold text-slate-950">
          Desviación monetaria
        </h2>
        <p className="mt-4 rounded-2xl bg-white/80 px-4 py-5 text-lg font-semibold text-brand-800">
          Desviación = gasto real - gasto planificado
        </p>
        <p className="mt-4 text-sm leading-7 text-slate-600">
          La fórmula queda visible desde el dashboard para alinear el MVP con la
          regla del negocio desde el inicio.
        </p>
      </section>
    </div>
  );
}
