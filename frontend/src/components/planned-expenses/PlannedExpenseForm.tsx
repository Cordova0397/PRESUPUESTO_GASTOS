import { useEffect, useRef, useState } from "react";

import { getActiveExpenseConceptsByCostCenter } from "../../services/catalogsService";
import type { PlannedExpense, PlannedExpenseCreatePayload } from "../../types/plannedExpense";
import type { CostCenter } from "../../types/costCenter";
import type { ExpenseConcept } from "../../types/expenseConcept";
import { getTodayDateInLima } from "../../utils/date";
import { plannedExpenseFormSchema } from "../../validations/budgetValidation";

type Props = {
  costCenters: CostCenter[];
  editingRecord: PlannedExpense | null;
  isSaving: boolean;
  onSubmit: (payload: PlannedExpenseCreatePayload) => void;
  onCancel: () => void;
};

type FormState = {
  planned_date: string;
  cost_center_id: string;
  expense_concept_id: string;
  amount: string;
  supplier: string;
  document_number: string;
  description: string;
  notes: string;
};

type FormErrors = Partial<Record<keyof FormState, string>>;

function emptyForm(defaultCostCenterId?: string): FormState {
  return {
    planned_date: getTodayDateInLima(),
    cost_center_id: defaultCostCenterId ?? "",
    expense_concept_id: "",
    amount: "",
    supplier: "",
    document_number: "",
    description: "",
    notes: "",
  };
}

function recordToFormState(record: PlannedExpense): FormState {
  return {
    planned_date: record.planned_date,
    cost_center_id: String(record.cost_center_id),
    expense_concept_id: String(record.expense_concept_id),
    amount: record.amount,
    supplier: record.supplier ?? "",
    document_number: record.document_number ?? "",
    description: record.description ?? "",
    notes: record.notes ?? "",
  };
}

export function PlannedExpenseForm({
  costCenters,
  editingRecord,
  isSaving,
  onSubmit,
  onCancel,
}: Props) {
  const [form, setForm] = useState<FormState>(() => emptyForm());
  const [errors, setErrors] = useState<FormErrors>({});
  const [formConcepts, setFormConcepts] = useState<ExpenseConcept[]>([]);
  const [conceptsLoading, setConceptsLoading] = useState(false);
  const autoSelectedRef = useRef(false);

  // Auto-seleccionar primer centro cuando llegan los centros por primera vez
  useEffect(() => {
    if (costCenters.length > 0 && !autoSelectedRef.current && !editingRecord) {
      autoSelectedRef.current = true;
      setForm((prev) => ({
        ...prev,
        cost_center_id: prev.cost_center_id || String(costCenters[0].id),
      }));
    }
  }, [costCenters, editingRecord]);

  // Cuando cambia el registro en edición
  useEffect(() => {
    if (editingRecord) {
      setForm(recordToFormState(editingRecord));
    } else {
      const defaultId = costCenters.length > 0 ? String(costCenters[0].id) : "";
      setForm(emptyForm(defaultId));
    }
    setErrors({});
  }, [editingRecord, costCenters]);

  // Cargar conceptos cuando cambia el centro en el formulario
  useEffect(() => {
    if (!form.cost_center_id) {
      setFormConcepts([]);
      return;
    }
    let cancelled = false;
    setConceptsLoading(true);
    getActiveExpenseConceptsByCostCenter(Number(form.cost_center_id))
      .then((data) => {
        if (cancelled) return;
        setFormConcepts(data);
        setForm((prev) => {
          const validIds = new Set(data.map((c) => String(c.id)));
          if (prev.expense_concept_id && !validIds.has(prev.expense_concept_id)) {
            return { ...prev, expense_concept_id: "" };
          }
          return prev;
        });
      })
      .catch(() => {
        if (!cancelled) setFormConcepts([]);
      })
      .finally(() => {
        if (!cancelled) setConceptsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [form.cost_center_id]);

  function set(field: keyof FormState, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  }

  function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    const result = plannedExpenseFormSchema.safeParse(form);
    if (!result.success) {
      const e: FormErrors = {};
      for (const issue of result.error.issues) {
        const field = issue.path[0] as keyof FormState | undefined;
        if (field && !e[field]) {
          e[field] = issue.message;
        }
      }
      setErrors(e);
      return;
    }
    onSubmit(result.data as PlannedExpenseCreatePayload);
  }

  const isEditing = editingRecord !== null;

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {/* Fecha planificada */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-600">
            Fecha planificada <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            value={form.planned_date}
            onChange={(e) => set("planned_date", e.target.value)}
            disabled={isSaving}
            className={[
              "rounded-lg border px-3 py-2 text-sm text-slate-800 shadow-sm outline-none transition-colors",
              "disabled:cursor-not-allowed disabled:opacity-60",
              errors.planned_date
                ? "border-red-400 bg-red-50 focus:border-red-500 focus:ring-1 focus:ring-red-200"
                : "border-slate-200 bg-white focus:border-brand-400 focus:ring-1 focus:ring-brand-200",
            ].join(" ")}
          />
          {errors.planned_date && (
            <p className="text-xs text-red-600">{errors.planned_date}</p>
          )}
        </div>

        {/* Centro de costo */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-600">
            Centro de costo <span className="text-red-500">*</span>
          </label>
          <select
            value={form.cost_center_id}
            onChange={(e) => set("cost_center_id", e.target.value)}
            disabled={isSaving || costCenters.length === 0}
            className={[
              "rounded-lg border px-3 py-2 text-sm text-slate-800 shadow-sm outline-none transition-colors",
              "disabled:cursor-not-allowed disabled:opacity-60",
              errors.cost_center_id
                ? "border-red-400 bg-red-50 focus:border-red-500 focus:ring-1 focus:ring-red-200"
                : "border-slate-200 bg-white focus:border-brand-400 focus:ring-1 focus:ring-brand-200",
            ].join(" ")}
          >
            <option value="">Selecciona un centro…</option>
            {costCenters.map((cc) => (
              <option key={cc.id} value={cc.id}>
                {cc.code} — {cc.name}
              </option>
            ))}
          </select>
          {errors.cost_center_id && (
            <p className="text-xs text-red-600">{errors.cost_center_id}</p>
          )}
        </div>

        {/* Concepto */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-600">
            Concepto de gasto <span className="text-red-500">*</span>
          </label>
          <select
            value={form.expense_concept_id}
            onChange={(e) => set("expense_concept_id", e.target.value)}
            disabled={isSaving || !form.cost_center_id || conceptsLoading}
            className={[
              "rounded-lg border px-3 py-2 text-sm text-slate-800 shadow-sm outline-none transition-colors",
              "disabled:cursor-not-allowed disabled:opacity-60",
              errors.expense_concept_id
                ? "border-red-400 bg-red-50 focus:border-red-500 focus:ring-1 focus:ring-red-200"
                : "border-slate-200 bg-white focus:border-brand-400 focus:ring-1 focus:ring-brand-200",
            ].join(" ")}
          >
            <option value="">
              {conceptsLoading ? "Cargando…" : "Selecciona un concepto…"}
            </option>
            {formConcepts.map((ec) => (
              <option key={ec.id} value={ec.id}>
                {ec.name}
              </option>
            ))}
          </select>
          {errors.expense_concept_id && (
            <p className="text-xs text-red-600">{errors.expense_concept_id}</p>
          )}
        </div>

        {/* Monto */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-600">
            Monto <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            inputMode="decimal"
            value={form.amount}
            onChange={(e) => set("amount", e.target.value)}
            disabled={isSaving}
            placeholder="0.00"
            className={[
              "rounded-lg border px-3 py-2 text-right text-sm text-slate-800 shadow-sm outline-none transition-colors",
              "disabled:cursor-not-allowed disabled:opacity-60",
              errors.amount
                ? "border-red-400 bg-red-50 focus:border-red-500 focus:ring-1 focus:ring-red-200"
                : "border-slate-200 bg-white focus:border-brand-400 focus:ring-1 focus:ring-brand-200",
            ].join(" ")}
          />
          {errors.amount && (
            <p className="text-xs text-red-600">{errors.amount}</p>
          )}
        </div>

        {/* Proveedor */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-600">Proveedor</label>
          <input
            type="text"
            value={form.supplier}
            onChange={(e) => set("supplier", e.target.value)}
            disabled={isSaving}
            placeholder="Nombre del proveedor"
            maxLength={150}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 shadow-sm outline-none transition-colors focus:border-brand-400 focus:ring-1 focus:ring-brand-200 disabled:cursor-not-allowed disabled:opacity-60"
          />
        </div>

        {/* Documento */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-600">Número de documento</label>
          <input
            type="text"
            value={form.document_number}
            onChange={(e) => set("document_number", e.target.value)}
            disabled={isSaving}
            placeholder="F001-000001"
            maxLength={80}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 shadow-sm outline-none transition-colors focus:border-brand-400 focus:ring-1 focus:ring-brand-200 disabled:cursor-not-allowed disabled:opacity-60"
          />
        </div>

        {/* Descripción */}
        <div className="flex flex-col gap-1 sm:col-span-2 lg:col-span-3">
          <label className="text-xs font-medium text-slate-600">Descripción</label>
          <textarea
            value={form.description}
            onChange={(e) => set("description", e.target.value)}
            disabled={isSaving}
            placeholder="Descripción del gasto planificado…"
            rows={2}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 shadow-sm outline-none transition-colors focus:border-brand-400 focus:ring-1 focus:ring-brand-200 disabled:cursor-not-allowed disabled:opacity-60"
          />
        </div>

        {/* Observaciones */}
        <div className="flex flex-col gap-1 sm:col-span-2 lg:col-span-3">
          <label className="text-xs font-medium text-slate-600">Observaciones</label>
          <textarea
            value={form.notes}
            onChange={(e) => set("notes", e.target.value)}
            disabled={isSaving}
            placeholder="Observaciones adicionales…"
            rows={2}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 shadow-sm outline-none transition-colors focus:border-brand-400 focus:ring-1 focus:ring-brand-200 disabled:cursor-not-allowed disabled:opacity-60"
          />
        </div>
      </div>

      {/* Botones */}
      <div className="mt-5 flex items-center justify-end gap-3">
        {isEditing && (
          <button
            type="button"
            onClick={onCancel}
            disabled={isSaving}
            className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Cancelar edición
          </button>
        )}
        <button
          type="submit"
          disabled={isSaving}
          className="rounded-lg bg-brand-600 px-5 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSaving
            ? "Guardando…"
            : isEditing
              ? "Actualizar gasto planificado"
              : "Registrar gasto planificado"}
        </button>
      </div>
    </form>
  );
}
