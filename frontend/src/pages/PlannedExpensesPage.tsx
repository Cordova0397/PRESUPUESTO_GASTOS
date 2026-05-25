import { useCallback, useEffect, useRef, useState } from "react";

import { PlannedExpenseForm } from "../components/planned-expenses/PlannedExpenseForm";
import { PlannedExpensesFilters, type PlannedExpensesFiltersValue } from "../components/planned-expenses/PlannedExpensesFilters";
import { PlannedExpensesMonthlyMatrix } from "../components/planned-expenses/PlannedExpensesMonthlyMatrix";
import { PlannedExpensesSummary } from "../components/planned-expenses/PlannedExpensesSummary";
import { PlannedExpensesTable } from "../components/planned-expenses/PlannedExpensesTable";
import { PageHeader } from "../components/layout/PageHeader";
import { EmptyState } from "../components/ui/EmptyState";
import { ErrorState } from "../components/ui/ErrorState";
import { getActiveCostCenters, getActiveExpenseConceptsByCostCenter } from "../services/catalogsService";
import {
  createPlannedExpense,
  deletePlannedExpense,
  getPlannedExpenses,
  updatePlannedExpense,
} from "../services/plannedExpensesService";
import type { PlannedExpense, PlannedExpenseCreatePayload } from "../types/plannedExpense";
import type { CostCenter } from "../types/costCenter";
import type { ExpenseConcept } from "../types/expenseConcept";
import { getCurrentMonthInLima, getCurrentYearInLima } from "../utils/date";

type Msg = { type: "ok" | "error"; text: string };
type PlannedExpensesViewMode = "matrix" | "detail";
type MatrixFilters = { year: number; cost_center_id?: number };

export function PlannedExpensesPage() {
  // ── Vista ────────────────────────────────────────────────────────────────────
  const [viewMode, setViewMode] = useState<PlannedExpensesViewMode>("matrix");

  // ── Centros de costo ─────────────────────────────────────────────────────────
  const [costCenters, setCostCenters] = useState<CostCenter[]>([]);
  const [ccLoading, setCcLoading] = useState(true);
  const [ccError, setCcError] = useState<string | null>(null);

  // ── Registros transaccionales ────────────────────────────────────────────────
  const [records, setRecords] = useState<PlannedExpense[]>([]);
  const [recordsLoading, setRecordsLoading] = useState(true);
  const [recordsError, setRecordsError] = useState<string | null>(null);

  // ── Edición / borrado ────────────────────────────────────────────────────────
  const [editingRecord, setEditingRecord] = useState<PlannedExpense | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<Msg | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // ── Filtros transaccionales (para la tabla detallada) ────────────────────────
  const [activeFilters, setActiveFilters] = useState<PlannedExpensesFiltersValue>({
    year: getCurrentYearInLima(),
    month: getCurrentMonthInLima(),
  });

  // ── Filtros de matriz (independientes, sin mes/concepto) ─────────────────────
  const [matrixFilters, setMatrixFilters] = useState<MatrixFilters>({
    year: getCurrentYearInLima(),
  });

  // ── Datos de la matriz ───────────────────────────────────────────────────────
  const [matrixRecords, setMatrixRecords] = useState<PlannedExpense[]>([]);
  const [matrixConcepts, setMatrixConcepts] = useState<ExpenseConcept[]>([]);
  const [matrixLoading, setMatrixLoading] = useState(false);
  const [matrixError, setMatrixError] = useState<string | null>(null);

  const msgTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const loadIdRef = useRef(0);
  const matrixLoadIdRef = useRef(0);

  function showMessage(type: "ok" | "error", text: string) {
    if (msgTimer.current) clearTimeout(msgTimer.current);
    setMessage({ type, text });
    msgTimer.current = setTimeout(() => setMessage(null), 6000);
  }

  // ── Cargar centros de costo ──────────────────────────────────────────────────
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
          setCcError(err instanceof Error ? err.message : "Error al cargar centros de costo.");
      })
      .finally(() => {
        if (!cancelled) setCcLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  // ── Autoasignar primer centro a la matriz ────────────────────────────────────
  useEffect(() => {
    if (costCenters.length > 0 && matrixFilters.cost_center_id === undefined) {
      setMatrixFilters((prev) => ({ ...prev, cost_center_id: costCenters[0].id }));
    }
  }, [costCenters, matrixFilters.cost_center_id]);

  // ── Cargar registros transaccionales ────────────────────────────────────────
  const loadRecords = useCallback(async () => {
    const id = ++loadIdRef.current;
    setRecordsLoading(true);
    setRecordsError(null);
    try {
      const data = await getPlannedExpenses(activeFilters);
      if (loadIdRef.current === id) setRecords(data);
    } catch (err) {
      if (loadIdRef.current === id)
        setRecordsError(
          err instanceof Error ? err.message : "Error al cargar los gastos planificados.",
        );
    } finally {
      if (loadIdRef.current === id) setRecordsLoading(false);
    }
  }, [activeFilters]);

  useEffect(() => {
    void loadRecords();
  }, [loadRecords]);

  // ── Cargar datos de la matriz ────────────────────────────────────────────────
  const loadMatrixData = useCallback(async () => {
    const id = ++matrixLoadIdRef.current;

    if (!matrixFilters.year || !matrixFilters.cost_center_id) {
      setMatrixRecords([]);
      setMatrixConcepts([]);
      setMatrixError(null);
      setMatrixLoading(false);
      return;
    }

    setMatrixLoading(true);
    setMatrixError(null);

    try {
      const [conceptsData, recordsData] = await Promise.all([
        getActiveExpenseConceptsByCostCenter(matrixFilters.cost_center_id),
        getPlannedExpenses({
          year: matrixFilters.year,
          cost_center_id: matrixFilters.cost_center_id,
        }),
      ]);

      if (matrixLoadIdRef.current !== id) return;

      setMatrixConcepts(conceptsData);
      setMatrixRecords(recordsData);
    } catch (err) {
      if (matrixLoadIdRef.current !== id) return;
      setMatrixError(
        err instanceof Error
          ? err.message
          : "Error al cargar el resumen mensual de gastos planificados.",
      );
    } finally {
      if (matrixLoadIdRef.current === id) setMatrixLoading(false);
    }
  }, [matrixFilters.year, matrixFilters.cost_center_id]);

  useEffect(() => {
    void loadMatrixData();
  }, [loadMatrixData]);

  // ── Handlers ─────────────────────────────────────────────────────────────────
  async function handleFormSubmit(payload: PlannedExpenseCreatePayload) {
    setIsSaving(true);
    setMessage(null);
    try {
      if (editingRecord) {
        await updatePlannedExpense(editingRecord.id, payload);
        showMessage("ok", `Gasto planificado #${editingRecord.id} actualizado correctamente.`);
      } else {
        await createPlannedExpense(payload);
        showMessage("ok", "Gasto planificado registrado correctamente.");
      }
      setEditingRecord(null);
      await loadRecords();
      await loadMatrixData();
    } catch (err) {
      showMessage(
        "error",
        err instanceof Error ? err.message : "Error al guardar el gasto planificado.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  function handleEdit(record: PlannedExpense) {
    setEditingRecord(record);
    setMessage(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleCancelEdit() {
    setEditingRecord(null);
    setMessage(null);
  }

  function handleDelete(id: number) {
    setDeleteTargetId(id);
    setMessage(null);
  }

  async function handleConfirmDelete() {
    if (deleteTargetId === null) return;
    const targetId = deleteTargetId;
    setIsDeleting(true);
    setMessage(null);
    try {
      await deletePlannedExpense(targetId);
      if (editingRecord?.id === targetId) setEditingRecord(null);
      showMessage("ok", `Gasto planificado #${targetId} eliminado correctamente.`);
      setDeleteTargetId(null);
      await loadRecords();
      await loadMatrixData();
    } catch (err) {
      showMessage(
        "error",
        err instanceof Error ? err.message : `Error al eliminar el gasto planificado #${targetId}.`,
      );
    } finally {
      setIsDeleting(false);
    }
  }

  function handleCancelDelete() {
    if (isDeleting) return;
    setDeleteTargetId(null);
  }

  function handleFiltersApply(filters: PlannedExpensesFiltersValue) {
    setActiveFilters(filters);
    setMessage(null);
  }

  function handleReload() {
    void loadRecords();
    void loadMatrixData();
    setMessage(null);
  }

  // ── Derivados ─────────────────────────────────────────────────────────────────
  const currentYear = getCurrentYearInLima();
  const selectedCostCenter = costCenters.find(
    (cc) => cc.id === matrixFilters.cost_center_id,
  );
  const selectedCostCenterLabel = selectedCostCenter
    ? `${selectedCostCenter.code} — ${selectedCostCenter.name}`
    : undefined;

  const formCardTitle = editingRecord
    ? `Editar gasto planificado #${editingRecord.id}`
    : "Registrar gasto planificado";

  // ── Render ────────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      <PageHeader
        title="Gastos planificados"
        description="Registro y revisión de gastos presupuestados."
      />

      {/* Selector de vista */}
      <div className="flex w-fit gap-1 rounded-full border border-slate-200 bg-white p-1 shadow-sm">
        <button
          type="button"
          onClick={() => setViewMode("matrix")}
          className={[
            "rounded-full px-4 py-1.5 text-sm font-semibold transition-colors",
            viewMode === "matrix"
              ? "bg-slate-900 text-white shadow-sm"
              : "text-slate-500 hover:text-slate-700",
          ].join(" ")}
        >
          Resumen mensual
        </button>
        <button
          type="button"
          onClick={() => setViewMode("detail")}
          className={[
            "rounded-full px-4 py-1.5 text-sm font-semibold transition-colors",
            viewMode === "detail"
              ? "bg-slate-900 text-white shadow-sm"
              : "text-slate-500 hover:text-slate-700",
          ].join(" ")}
        >
          Registro detallado
        </button>
      </div>

      {/* Mensaje global de éxito/error */}
      {message && (
        <div
          className={[
            "rounded-[20px] border px-6 py-4 text-sm font-medium shadow-sm",
            message.type === "ok"
              ? "border-green-200 bg-green-50 text-green-800"
              : "border-red-200 bg-red-50 text-red-800",
          ].join(" ")}
        >
          {message.text}
        </div>
      )}

      {/* ── Vista matriz ──────────────────────────────────────────────────────── */}
      {viewMode === "matrix" && (
        <section className="overflow-hidden rounded-[28px] border border-slate-200/80 bg-white/95 shadow-panel">
          <div className="border-b border-slate-200 px-6 py-5">
            <h2 className="text-base font-semibold text-slate-950">
              Resumen mensual de gastos planificados
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Vista anual consolidada por concepto.
            </p>
            <p className="mt-2 text-xs text-slate-400">
              Esta vista resume transacciones planificadas por concepto y mes. Para registrar un
              gasto con fecha, proveedor o documento, usa{" "}
              <button
                type="button"
                onClick={() => setViewMode("detail")}
                className="font-medium text-slate-600 underline underline-offset-2 hover:text-slate-900"
              >
                Registro detallado
              </button>
              .
            </p>
          </div>

          {/* Filtros de la matriz */}
          <div className="border-b border-slate-100 px-6 py-4">
            {ccLoading ? (
              <div className="flex gap-3">
                <div className="h-8 w-24 animate-pulse rounded-lg bg-slate-100" />
                <div className="h-8 w-48 animate-pulse rounded-lg bg-slate-100" />
                <div className="h-8 w-24 animate-pulse rounded-lg bg-slate-100" />
              </div>
            ) : ccError ? (
              <ErrorState message={ccError} onRetry={() => window.location.reload()} compact />
            ) : (
              <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-slate-500">Año</label>
                  <select
                    value={matrixFilters.year}
                    onChange={(e) =>
                      setMatrixFilters((prev) => ({ ...prev, year: Number(e.target.value) }))
                    }
                    className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-800 shadow-sm focus:border-brand-400 focus:outline-none focus:ring-1 focus:ring-brand-200"
                  >
                    <option value={currentYear - 1}>{currentYear - 1}</option>
                    <option value={currentYear}>{currentYear}</option>
                    <option value={currentYear + 1}>{currentYear + 1}</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-slate-500">Centro de costo</label>
                  <select
                    value={matrixFilters.cost_center_id ?? ""}
                    onChange={(e) =>
                      setMatrixFilters((prev) => ({
                        ...prev,
                        cost_center_id: e.target.value ? Number(e.target.value) : undefined,
                      }))
                    }
                    className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-800 shadow-sm focus:border-brand-400 focus:outline-none focus:ring-1 focus:ring-brand-200"
                  >
                    <option value="">— Centro —</option>
                    {costCenters.map((cc) => (
                      <option key={cc.id} value={cc.id}>
                        {cc.code} — {cc.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="sm:pb-0.5">
                  <button
                    type="button"
                    onClick={() => void loadMatrixData()}
                    className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-600 shadow-sm transition hover:border-slate-300 hover:bg-slate-50"
                  >
                    Recargar
                  </button>
                </div>
              </div>
            )}
          </div>

          {!matrixFilters.cost_center_id ? (
            <div className="px-6 py-10">
              <EmptyState message="Selecciona un centro de costo para ver el resumen mensual." />
            </div>
          ) : (
            <PlannedExpensesMonthlyMatrix
              concepts={matrixConcepts}
              records={matrixRecords}
              isLoading={matrixLoading}
              error={matrixError}
              year={matrixFilters.year}
              costCenterLabel={selectedCostCenterLabel}
              onRetry={loadMatrixData}
            />
          )}
        </section>
      )}

      {/* ── Vista detallada ───────────────────────────────────────────────────── */}
      {viewMode === "detail" && (
        <>
          {/* Formulario */}
          <section className="overflow-hidden rounded-[28px] border border-slate-200/80 bg-white/95 shadow-panel">
            <div className="border-b border-slate-200 px-6 py-5">
              <h2 className="text-base font-semibold text-slate-950">{formCardTitle}</h2>
              {editingRecord && (
                <p className="mt-1 text-sm text-slate-500">
                  Modifica los campos y guarda para actualizar el registro.
                </p>
              )}
            </div>

            <div className="p-6">
              {ccLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="h-10 animate-pulse rounded-lg bg-slate-100" />
                  ))}
                </div>
              ) : ccError ? (
                <ErrorState message={ccError} onRetry={() => window.location.reload()} compact />
              ) : (
                <PlannedExpenseForm
                  costCenters={costCenters}
                  editingRecord={editingRecord}
                  isSaving={isSaving}
                  onSubmit={handleFormSubmit}
                  onCancel={handleCancelEdit}
                />
              )}
            </div>
          </section>

          {/* Tabla de registros */}
          <section className="overflow-hidden rounded-[28px] border border-slate-200/80 bg-white/95 shadow-panel">
            <div className="border-b border-slate-200 px-6 py-5">
              <h2 className="mb-4 text-base font-semibold text-slate-950">
                Gastos planificados registrados
              </h2>
              {ccLoading ? (
                <div className="flex flex-wrap gap-3">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="h-8 w-32 animate-pulse rounded-lg bg-slate-100" />
                  ))}
                </div>
              ) : ccError ? (
                <ErrorState message={ccError} onRetry={() => window.location.reload()} compact />
              ) : (
                <PlannedExpensesFilters
                  costCenters={costCenters}
                  onApply={handleFiltersApply}
                  onReload={handleReload}
                />
              )}
            </div>

            {recordsError && !recordsLoading && (
              <div className="border-b border-slate-100 px-6 py-4">
                <ErrorState message={recordsError} onRetry={handleReload} compact />
              </div>
            )}

            <div className="border-b border-slate-100">
              <PlannedExpensesSummary records={records} isLoading={recordsLoading} />
            </div>

            <PlannedExpensesTable
              records={records}
              isLoading={recordsLoading}
              editingId={editingRecord?.id ?? null}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          </section>
        </>
      )}

      {/* Modal de confirmación de borrado (disponible en ambas vistas) */}
      {deleteTargetId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-4">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-planned-expense-title"
            className="w-full max-w-md rounded-[24px] bg-white p-6 shadow-panel"
          >
            <h2
              id="delete-planned-expense-title"
              className="text-lg font-semibold text-slate-950"
            >
              Eliminar gasto planificado
            </h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              ¿Eliminar el gasto planificado #{deleteTargetId}? Esta acción no se puede deshacer.
            </p>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={handleCancelDelete}
                disabled={isDeleting}
                className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => void handleConfirmDelete()}
                disabled={isDeleting}
                className="rounded-full bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isDeleting ? "Eliminando…" : "Eliminar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
