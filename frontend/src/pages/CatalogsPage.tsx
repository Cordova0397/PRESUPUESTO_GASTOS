import { useEffect, useRef, useState } from "react";

import { CostCenterForm } from "../components/catalogs/CostCenterForm";
import { CostCentersList } from "../components/catalogs/CostCentersList";
import { ExpenseConceptForm } from "../components/catalogs/ExpenseConceptForm";
import { ExpenseConceptsList } from "../components/catalogs/ExpenseConceptsList";
import { PageHeader } from "../components/layout/PageHeader";
import { ErrorState } from "../components/ui/ErrorState";
import {
  createCostCenter,
  createExpenseConcept,
  deleteCostCenter,
  deleteExpenseConcept,
  getActiveCostCenters,
  getActiveExpenseConceptsByCostCenter,
  updateCostCenter,
  updateExpenseConcept,
} from "../services/catalogsService";
import type { CostCenter, CostCenterCreatePayload, CostCenterUpdatePayload } from "../types/costCenter";
import type { ExpenseConcept, ExpenseConceptCreatePayload, ExpenseConceptUpdatePayload } from "../types/expenseConcept";

type Msg = { type: "ok" | "error"; text: string };
type DeleteTarget =
  | { kind: "center"; id: number; name: string }
  | { kind: "concept"; id: number; costCenterId: number; name: string };

export function CatalogsPage() {
  const [costCenters, setCostCenters] = useState<CostCenter[]>([]);
  const [costCentersLoading, setCostCentersLoading] = useState(true);
  const [costCentersError, setCostCentersError] = useState<string | null>(null);
  const [ccRetry, setCcRetry] = useState(0);

  const [selectedCostCenterId, setSelectedCostCenterId] = useState<number | null>(null);
  const [expenseConcepts, setExpenseConcepts] = useState<ExpenseConcept[]>([]);
  const [conceptsLoading, setConceptsLoading] = useState(false);
  const [conceptsError, setConceptsError] = useState<string | null>(null);
  const [conceptsRetry, setConceptsRetry] = useState(0);

  const [costCenterFormOpen, setCostCenterFormOpen] = useState(false);
  const [editingCostCenter, setEditingCostCenter] = useState<CostCenter | null>(null);
  const [conceptFormOpen, setConceptFormOpen] = useState(false);
  const [editingExpenseConcept, setEditingExpenseConcept] = useState<ExpenseConcept | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<Msg | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const msgTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function showMessage(type: "ok" | "error", text: string) {
    if (msgTimer.current) clearTimeout(msgTimer.current);
    setMessage({ type, text });
    msgTimer.current = setTimeout(() => setMessage(null), 5000);
  }

  // ── Cargar centros de costo ───────────────────────────────────────────────
  function loadCostCenters(keepSelectedId?: number | null) {
    setCostCentersLoading(true);
    setCostCentersError(null);
    getActiveCostCenters()
      .then((data) => {
        setCostCenters(data);
        if (keepSelectedId !== undefined) {
          const still = data.find((cc) => cc.id === keepSelectedId);
          setSelectedCostCenterId(still ? still.id : data[0]?.id ?? null);
        } else {
          setSelectedCostCenterId((prev) => {
            if (prev !== null && data.find((cc) => cc.id === prev)) return prev;
            return data[0]?.id ?? null;
          });
        }
      })
      .catch((err: unknown) => {
        const msg = err instanceof Error ? err.message : "Error al cargar los centros de costo.";
        setCostCentersError(msg);
      })
      .finally(() => setCostCentersLoading(false));
  }

  // ── Cargar conceptos ─────────────────────────────────────────────────────
  function loadConcepts(costCenterId: number) {
    setConceptsLoading(true);
    setConceptsError(null);
    setExpenseConcepts([]);
    getActiveExpenseConceptsByCostCenter(costCenterId)
      .then(setExpenseConcepts)
      .catch((err: unknown) => {
        const msg = err instanceof Error ? err.message : "Error al cargar los conceptos de gasto.";
        setConceptsError(msg);
      })
      .finally(() => setConceptsLoading(false));
  }

  // Carga inicial de centros
  useEffect(() => {
    loadCostCenters();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ccRetry]);

  // Carga conceptos cuando cambia centro seleccionado
  useEffect(() => {
    if (selectedCostCenterId === null) {
      setExpenseConcepts([]);
      return;
    }
    loadConcepts(selectedCostCenterId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCostCenterId, conceptsRetry]);

  const selectedCostCenter = costCenters.find((cc) => cc.id === selectedCostCenterId) ?? null;

  // ── Formulario de centros ─────────────────────────────────────────────────
  function openNewCostCenter() {
    setEditingCostCenter(null);
    setCostCenterFormOpen(true);
  }

  function openEditCostCenter(cc: CostCenter) {
    setEditingCostCenter(cc);
    setCostCenterFormOpen(true);
  }

  function closeCostCenterForm() {
    setCostCenterFormOpen(false);
    setEditingCostCenter(null);
  }

  async function handleCreateCostCenter(payload: CostCenterCreatePayload | CostCenterUpdatePayload) {
    setSubmitting(true);
    try {
      const created = await createCostCenter(payload as CostCenterCreatePayload);
      closeCostCenterForm();
      showMessage("ok", "Centro de costo creado correctamente.");
      loadCostCenters(created.id);
    } catch (err: unknown) {
      showMessage("error", err instanceof Error ? err.message : "Error al crear el centro de costo.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleUpdateCostCenter(payload: CostCenterCreatePayload | CostCenterUpdatePayload) {
    if (!editingCostCenter) return;
    setSubmitting(true);
    try {
      await updateCostCenter(editingCostCenter.id, payload as CostCenterUpdatePayload);
      closeCostCenterForm();
      showMessage("ok", "Centro de costo actualizado correctamente.");
      loadCostCenters(editingCostCenter.id);
    } catch (err: unknown) {
      showMessage("error", err instanceof Error ? err.message : "Error al actualizar el centro de costo.");
    } finally {
      setSubmitting(false);
    }
  }

  // ── Formulario de conceptos ───────────────────────────────────────────────
  function openNewConcept() {
    setEditingExpenseConcept(null);
    setConceptFormOpen(true);
  }

  function openEditConcept(ec: ExpenseConcept) {
    setEditingExpenseConcept(ec);
    setConceptFormOpen(true);
  }

  function closeConceptForm() {
    setConceptFormOpen(false);
    setEditingExpenseConcept(null);
  }

  async function handleCreateConcept(payload: ExpenseConceptCreatePayload | ExpenseConceptUpdatePayload) {
    if (!selectedCostCenterId) return;
    setSubmitting(true);
    try {
      await createExpenseConcept(selectedCostCenterId, payload as ExpenseConceptCreatePayload);
      closeConceptForm();
      showMessage("ok", "Concepto creado correctamente.");
      loadConcepts(selectedCostCenterId);
    } catch (err: unknown) {
      showMessage("error", err instanceof Error ? err.message : "Error al crear el concepto.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleUpdateConcept(payload: ExpenseConceptCreatePayload | ExpenseConceptUpdatePayload) {
    if (!editingExpenseConcept || !selectedCostCenterId) return;
    setSubmitting(true);
    try {
      await updateExpenseConcept(
        selectedCostCenterId,
        editingExpenseConcept.id,
        payload as ExpenseConceptUpdatePayload,
      );
      closeConceptForm();
      showMessage("ok", "Concepto actualizado correctamente.");
      loadConcepts(selectedCostCenterId);
    } catch (err: unknown) {
      showMessage("error", err instanceof Error ? err.message : "Error al actualizar el concepto.");
    } finally {
      setSubmitting(false);
    }
  }

  // ── Eliminación ───────────────────────────────────────────────────────────
  function requestDeleteCostCenter(cc: CostCenter) {
    setDeleteTarget({ kind: "center", id: cc.id, name: cc.name });
  }

  function requestDeleteConcept(ec: ExpenseConcept) {
    if (!selectedCostCenterId) return;
    setDeleteTarget({ kind: "concept", id: ec.id, costCenterId: selectedCostCenterId, name: ec.name });
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      if (deleteTarget.kind === "center") {
        await deleteCostCenter(deleteTarget.id);
        setDeleteTarget(null);
        showMessage("ok", `Centro "${deleteTarget.name}" desactivado.`);
        const wasSelected = deleteTarget.id === selectedCostCenterId;
        loadCostCenters(wasSelected ? null : selectedCostCenterId);
      } else {
        await deleteExpenseConcept(deleteTarget.costCenterId, deleteTarget.id);
        setDeleteTarget(null);
        showMessage("ok", `Concepto "${deleteTarget.name}" desactivado.`);
        loadConcepts(deleteTarget.costCenterId);
      }
    } catch (err: unknown) {
      showMessage("error", err instanceof Error ? err.message : "Error al desactivar el elemento.");
      setDeleteTarget(null);
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Catálogos básicos"
        description="Centros de costo y conceptos de gasto disponibles para el MVP."
        badge="Editable"
      />

      {/* Mensaje de feedback */}
      {message && (
        <div
          className={`rounded-2xl px-5 py-3 text-sm font-medium ${
            message.type === "ok"
              ? "border border-emerald-200 bg-emerald-50 text-emerald-800"
              : "border border-red-200 bg-red-50 text-red-800"
          }`}
        >
          {message.text}
        </div>
      )}

      {costCentersError ? (
        <ErrorState
          title="Error al cargar los catálogos"
          message={costCentersError}
          onRetry={() => setCcRetry((n) => n + 1)}
        />
      ) : (
        <div className="grid gap-6 xl:grid-cols-[340px_1fr]">
          <CostCentersList
            costCenters={costCenters}
            selectedCostCenterId={selectedCostCenterId}
            onSelect={setSelectedCostCenterId}
            isLoading={costCentersLoading}
            onNew={openNewCostCenter}
            onEdit={openEditCostCenter}
            onDelete={requestDeleteCostCenter}
          />
          <ExpenseConceptsList
            expenseConcepts={expenseConcepts}
            isLoading={conceptsLoading}
            error={conceptsError}
            onRetry={() => setConceptsRetry((n) => n + 1)}
            selectedCostCenter={selectedCostCenter}
            onNew={openNewConcept}
            onEdit={openEditConcept}
            onDelete={requestDeleteConcept}
          />
        </div>
      )}

      {/* Modal — formulario de centro de costo */}
      {costCenterFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-[28px] bg-white p-8 shadow-xl">
            <h2 className="mb-6 text-lg font-semibold text-slate-950">
              {editingCostCenter ? "Editar centro de costo" : "Nuevo centro de costo"}
            </h2>
            <CostCenterForm
              initialValue={editingCostCenter}
              onSubmit={editingCostCenter ? handleUpdateCostCenter : handleCreateCostCenter}
              onCancel={closeCostCenterForm}
              isSubmitting={submitting}
            />
          </div>
        </div>
      )}

      {/* Modal — formulario de concepto */}
      {conceptFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-[28px] bg-white p-8 shadow-xl">
            <h2 className="mb-6 text-lg font-semibold text-slate-950">
              {editingExpenseConcept ? "Editar concepto" : "Nuevo concepto"}
            </h2>
            <ExpenseConceptForm
              selectedCostCenter={selectedCostCenter}
              initialValue={editingExpenseConcept}
              onSubmit={editingExpenseConcept ? handleUpdateConcept : handleCreateConcept}
              onCancel={closeConceptForm}
              isSubmitting={submitting}
            />
          </div>
        </div>
      )}

      {/* Modal — confirmación de eliminación */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-[28px] bg-white p-8 shadow-xl">
            <h2 className="mb-3 text-lg font-semibold text-slate-950">Confirmar desactivación</h2>
            <p className="mb-6 text-sm text-slate-600">
              ¿Desactivar{" "}
              <span className="font-semibold text-slate-800">"{deleteTarget.name}"</span>?
              El registro no se elimina; solo se desactiva para nuevos registros.
            </p>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                disabled={isDeleting}
                className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-60"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => void confirmDelete()}
                disabled={isDeleting}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-700 disabled:opacity-50"
              >
                {isDeleting ? "Desactivando…" : "Desactivar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
