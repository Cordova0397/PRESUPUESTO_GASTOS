import { useCallback, useEffect, useRef, useState } from "react";

import { PageHeader } from "../components/layout/PageHeader";
import { ErrorState } from "../components/ui/ErrorState";
import { VarianceFilters } from "../components/variance/VarianceFilters";
import { VarianceSummary } from "../components/variance/VarianceSummary";
import { VarianceTable } from "../components/variance/VarianceTable";
import { getActiveCostCenters } from "../services/catalogsService";
import { getExpenseVariance } from "../services/reportsService";
import type { CostCenter } from "../types/costCenter";
import type { ExpenseVariance } from "../types/report";
import type { ExpenseVarianceFilters } from "../types/report";
import { getCurrentYearInLima } from "../utils/date";

export function VariancePage() {
  // Catálogos
  const [costCenters, setCostCenters] = useState<CostCenter[]>([]);
  const [ccLoading, setCcLoading] = useState(true);
  const [ccError, setCcError] = useState<string | null>(null);

  // Registros de desviación
  const [records, setRecords] = useState<ExpenseVariance[]>([]);
  const [recordsLoading, setRecordsLoading] = useState(true);
  const [recordsError, setRecordsError] = useState<string | null>(null);

  // Filtros activos (año actual por defecto)
  const [activeFilters, setActiveFilters] = useState<ExpenseVarianceFilters>({
    year: getCurrentYearInLima(),
  });

  // Evitar race conditions en cargas concurrentes
  const loadIdRef = useRef(0);

  // ─── Cargar centros de costo al montar ───────────────────────────────────
  useEffect(() => {
    let cancelled = false;
    setCcLoading(true);
    setCcError(null);
    getActiveCostCenters()
      .then((data) => {
        if (!cancelled) setCostCenters(data);
      })
      .catch((err: unknown) => {
        if (!cancelled)
          setCcError(
            err instanceof Error ? err.message : "Error al cargar centros de costo.",
          );
      })
      .finally(() => {
        if (!cancelled) setCcLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // ─── Cargar desviaciones cuando cambian filtros ───────────────────────────
  const loadRecords = useCallback(async () => {
    const id = ++loadIdRef.current;
    setRecordsLoading(true);
    setRecordsError(null);
    try {
      const data = await getExpenseVariance(activeFilters);
      if (loadIdRef.current === id) setRecords(data);
    } catch (err) {
      if (loadIdRef.current === id)
        setRecordsError(
          err instanceof Error ? err.message : "Error al cargar las desviaciones.",
        );
    } finally {
      if (loadIdRef.current === id) setRecordsLoading(false);
    }
  }, [activeFilters]);

  useEffect(() => {
    void loadRecords();
  }, [loadRecords]);

  // ─── Manejadores ─────────────────────────────────────────────────────────
  function handleFiltersApply(filters: ExpenseVarianceFilters) {
    setActiveFilters(filters);
  }

  function handleReload() {
    void loadRecords();
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Desviación de gastos"
        description="Vista de solo lectura calculada desde gastos planificados y reales."
        badge="Solo lectura"
      />

      {/* Nota informativa */}
      <p className="rounded-[16px] border border-slate-200/70 bg-slate-50 px-5 py-3 text-xs text-slate-500">
        La desviación se calcula en backend como gasto real menos gasto planificado.
        Esta pantalla no guarda resultados calculados.
      </p>

      {/* Error de catálogos */}
      {ccError && !ccLoading && (
        <ErrorState message={ccError} onRetry={() => window.location.reload()} compact />
      )}

      {/* Tabla de desviaciones */}
      <section className="overflow-hidden rounded-[28px] border border-slate-200/80 bg-white/95 shadow-panel">
        {/* Filtros */}
        <div className="border-b border-slate-200 px-6 py-5">
          <h2 className="mb-4 text-base font-semibold text-slate-950">
            Desviaciones por periodo, centro y concepto
          </h2>
          {ccLoading ? (
            <div className="flex flex-wrap gap-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="h-8 w-32 animate-pulse rounded-lg bg-slate-100"
                />
              ))}
            </div>
          ) : (
            <VarianceFilters
              costCenters={costCenters}
              onApply={handleFiltersApply}
              onReload={handleReload}
            />
          )}
        </div>

        {/* Error de registros */}
        {recordsError && !recordsLoading && (
          <div className="border-b border-slate-100 px-6 py-4">
            <ErrorState message={recordsError} onRetry={handleReload} compact />
          </div>
        )}

        {/* Resumen */}
        <div className="border-b border-slate-100">
          <VarianceSummary records={records} isLoading={recordsLoading} />
        </div>

        {/* Tabla */}
        <VarianceTable records={records} isLoading={recordsLoading} />
      </section>
    </div>
  );
}
