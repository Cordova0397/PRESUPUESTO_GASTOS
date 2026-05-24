import { useCallback, useEffect, useRef, useState } from "react";

import { PageHeader } from "../components/layout/PageHeader";
import { AnalysisFilters } from "../components/analysis/AnalysisFilters";
import { AnalysisSummary } from "../components/analysis/AnalysisSummary";
import { AnalysisTable } from "../components/analysis/AnalysisTable";
import { getActiveCostCenters } from "../services/catalogsService";
import { getExpenseAnalysis } from "../services/reportsService";
import type { CostCenter } from "../types/costCenter";
import type { ExpenseAnalysis, ExpenseAnalysisFilters } from "../types/report";
import { getCurrentYearInLima } from "../utils/date";

export function AnalysisPage() {
  // Catálogos
  const [costCenters, setCostCenters] = useState<CostCenter[]>([]);
  const [ccLoading, setCcLoading] = useState(true);
  const [ccError, setCcError] = useState<string | null>(null);

  // Registros de análisis
  const [records, setRecords] = useState<ExpenseAnalysis[]>([]);
  const [recordsLoading, setRecordsLoading] = useState(true);
  const [recordsError, setRecordsError] = useState<string | null>(null);

  // Filtros activos (año actual por defecto)
  const [activeFilters, setActiveFilters] = useState<ExpenseAnalysisFilters>({
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

  // ─── Cargar análisis cuando cambian filtros ───────────────────────────────
  const loadRecords = useCallback(async () => {
    const id = ++loadIdRef.current;
    setRecordsLoading(true);
    setRecordsError(null);
    try {
      const data = await getExpenseAnalysis(activeFilters);
      if (loadIdRef.current === id) setRecords(data);
    } catch (err) {
      if (loadIdRef.current === id)
        setRecordsError(
          err instanceof Error ? err.message : "Error al cargar el análisis de gastos.",
        );
    } finally {
      if (loadIdRef.current === id) setRecordsLoading(false);
    }
  }, [activeFilters]);

  useEffect(() => {
    void loadRecords();
  }, [loadRecords]);

  // ─── Manejadores ─────────────────────────────────────────────────────────
  function handleFiltersApply(filters: ExpenseAnalysisFilters) {
    setActiveFilters(filters);
  }

  function handleReload() {
    void loadRecords();
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Análisis de gastos"
        description="Resumen consolidado por centro de costo y periodo."
        badge="Resumen por centro"
      />

      {/* Nota informativa */}
      <p className="rounded-[16px] border border-slate-200/70 bg-slate-50 px-5 py-3 text-xs text-slate-500">
        El análisis se calcula en backend desde gastos planificados y reales.
        Esta pantalla no guarda resultados calculados.
      </p>

      {/* Error de catálogos */}
      {ccError && !ccLoading && (
        <div className="flex items-center gap-4 rounded-[20px] border border-red-200 bg-red-50 px-6 py-4">
          <p className="text-sm text-red-600">{ccError}</p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Reintentar
          </button>
        </div>
      )}

      {/* Tabla de análisis */}
      <section className="overflow-hidden rounded-[28px] border border-slate-200/80 bg-white/95 shadow-panel">
        {/* Filtros */}
        <div className="border-b border-slate-200 px-6 py-5">
          <h2 className="mb-4 text-base font-semibold text-slate-950">
            Análisis por centro de costo y periodo
          </h2>
          {ccLoading ? (
            <div className="flex flex-wrap gap-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="h-8 w-32 animate-pulse rounded-lg bg-slate-100"
                />
              ))}
            </div>
          ) : (
            <AnalysisFilters
              costCenters={costCenters}
              onApply={handleFiltersApply}
              onReload={handleReload}
            />
          )}
        </div>

        {/* Error de registros */}
        {recordsError && !recordsLoading && (
          <div className="flex items-center gap-4 border-b border-red-100 bg-red-50 px-6 py-4">
            <p className="text-sm text-red-600">{recordsError}</p>
            <button
              type="button"
              onClick={handleReload}
              className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Reintentar
            </button>
          </div>
        )}

        {/* Resumen */}
        <div className="border-b border-slate-100">
          <AnalysisSummary records={records} isLoading={recordsLoading} />
        </div>

        {/* Tabla */}
        <AnalysisTable records={records} isLoading={recordsLoading} />
      </section>
    </div>
  );
}
