import { useCallback, useEffect, useRef, useState } from "react";

import { ActualExpenseForm } from "../components/actual-expenses/ActualExpenseForm";
import { ActualExpensesFilters } from "../components/actual-expenses/ActualExpensesFilters";
import { ActualExpensesSummary } from "../components/actual-expenses/ActualExpensesSummary";
import { ActualExpensesTable } from "../components/actual-expenses/ActualExpensesTable";
import { PageHeader } from "../components/layout/PageHeader";
import { ErrorState } from "../components/ui/ErrorState";
import { getActiveCostCenters } from "../services/catalogsService";
import {
  createActualExpense,
  deleteActualExpense,
  getActualExpenses,
  updateActualExpense,
} from "../services/actualExpensesService";
import type { ActualExpense, ActualExpenseCreatePayload, ActualExpensesFilters as FiltersType } from "../types/actualExpense";
import type { CostCenter } from "../types/costCenter";
import { getCurrentYearInLima } from "../utils/date";

type Msg = { type: "ok" | "error"; text: string };

export function ActualExpensesPage() {
  const [costCenters, setCostCenters] = useState<CostCenter[]>([]);
  const [ccLoading, setCcLoading] = useState(true);
  const [ccError, setCcError] = useState<string | null>(null);

  const [records, setRecords] = useState<ActualExpense[]>([]);
  const [recordsLoading, setRecordsLoading] = useState(true);
  const [recordsError, setRecordsError] = useState<string | null>(null);

  const [editingRecord, setEditingRecord] = useState<ActualExpense | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<Msg | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [activeFilters, setActiveFilters] = useState<FiltersType>({
    year: getCurrentYearInLima(),
  });

  const msgTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const loadIdRef = useRef(0);

  function showMessage(type: "ok" | "error", text: string) {
    if (msgTimer.current) clearTimeout(msgTimer.current);
    setMessage({ type, text });
    msgTimer.current = setTimeout(() => setMessage(null), 6000);
  }

  // Cargar centros de costo
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
    return () => {
      cancelled = true;
    };
  }, []);

  // Cargar registros de gastos reales
  const loadRecords = useCallback(async () => {
    const id = ++loadIdRef.current;
    setRecordsLoading(true);
    setRecordsError(null);
    try {
      const data = await getActualExpenses(activeFilters);
      if (loadIdRef.current === id) setRecords(data);
    } catch (err) {
      if (loadIdRef.current === id)
        setRecordsError(
          err instanceof Error ? err.message : "Error al cargar los gastos reales.",
        );
    } finally {
      if (loadIdRef.current === id) setRecordsLoading(false);
    }
  }, [activeFilters]);

  useEffect(() => {
    void loadRecords();
  }, [loadRecords]);

  // Guardar (POST o PUT)
  async function handleFormSubmit(payload: ActualExpenseCreatePayload) {
    setIsSaving(true);
    setMessage(null);
    try {
      if (editingRecord) {
        await updateActualExpense(editingRecord.id, payload);
        showMessage("ok", `Gasto #${editingRecord.id} actualizado correctamente.`);
      } else {
        await createActualExpense(payload);
        showMessage("ok", "Gasto registrado correctamente.");
      }
      setEditingRecord(null);
      await loadRecords();
    } catch (err) {
      showMessage(
        "error",
        err instanceof Error ? err.message : "Error al guardar el gasto.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  function handleEdit(record: ActualExpense) {
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
      await deleteActualExpense(targetId);
      if (editingRecord?.id === targetId) setEditingRecord(null);
      showMessage("ok", `Gasto #${targetId} eliminado correctamente.`);
      setDeleteTargetId(null);
      await loadRecords();
    } catch (err) {
      showMessage(
        "error",
        err instanceof Error ? err.message : `Error al eliminar el gasto #${targetId}.`,
      );
    } finally {
      setIsDeleting(false);
    }
  }

  function handleCancelDelete() {
    if (isDeleting) return;
    setDeleteTargetId(null);
  }

  function handleFiltersApply(filters: FiltersType) {
    setActiveFilters(filters);
    setMessage(null);
  }

  function handleReload() {
    void loadRecords();
    setMessage(null);
  }

  const formCardTitle = editingRecord
    ? `Editar gasto #${editingRecord.id}`
    : "Registrar gasto";

  return (
    <div className="space-y-6">
      <PageHeader
        title="Gastos reales"
        description="Registro transaccional de gastos ejecutados."
      />

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
            <ActualExpenseForm
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
        {/* Filtros en la cabecera */}
        <div className="border-b border-slate-200 px-6 py-5">
          <h2 className="mb-4 text-base font-semibold text-slate-950">
            Gastos registrados
          </h2>
          {ccLoading ? (
            <div className="flex flex-wrap gap-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-8 w-32 animate-pulse rounded-lg bg-slate-100" />
              ))}
            </div>
          ) : ccError ? (
            <ErrorState message={ccError} onRetry={() => window.location.reload()} compact />
          ) : (
            <ActualExpensesFilters
              costCenters={costCenters}
              onApply={handleFiltersApply}
              onReload={handleReload}
            />
          )}
        </div>

        {/* Error de carga de registros */}
        {recordsError && !recordsLoading && (
          <div className="border-b border-slate-100 px-6 py-4">
            <ErrorState message={recordsError} onRetry={handleReload} compact />
          </div>
        )}

        {/* Resumen */}
        <div className="border-b border-slate-100">
          <ActualExpensesSummary records={records} isLoading={recordsLoading} />
        </div>

        {/* Tabla */}
        <ActualExpensesTable
          records={records}
          isLoading={recordsLoading}
          editingId={editingRecord?.id ?? null}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </section>

      {deleteTargetId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-4">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-actual-expense-title"
            className="w-full max-w-md rounded-[24px] bg-white p-6 shadow-panel"
          >
            <h2
              id="delete-actual-expense-title"
              className="text-lg font-semibold text-slate-950"
            >
              Eliminar gasto real
            </h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              ¿Eliminar el gasto real #{deleteTargetId}? Esta acción no se puede
              deshacer.
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
