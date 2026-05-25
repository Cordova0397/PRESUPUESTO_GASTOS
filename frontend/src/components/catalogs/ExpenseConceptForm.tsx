import { useEffect, useState } from "react";

import type { CostCenter } from "../../types/costCenter";
import type { ExpenseConcept, ExpenseConceptCreatePayload, ExpenseConceptUpdatePayload } from "../../types/expenseConcept";

type Props = {
  selectedCostCenter: CostCenter | null;
  initialValue?: ExpenseConcept | null;
  onSubmit: (payload: ExpenseConceptCreatePayload | ExpenseConceptUpdatePayload) => Promise<void> | void;
  onCancel?: () => void;
  isSubmitting?: boolean;
};

type FormState = {
  name: string;
  description: string;
};

type FormErrors = Partial<Record<keyof FormState, string>>;

function toFormState(ec: ExpenseConcept | null | undefined): FormState {
  return {
    name: ec?.name ?? "",
    description: ec?.description ?? "",
  };
}

export function ExpenseConceptForm({
  selectedCostCenter,
  initialValue,
  onSubmit,
  onCancel,
  isSubmitting,
}: Props) {
  const [form, setForm] = useState<FormState>(() => toFormState(initialValue));
  const [errors, setErrors] = useState<FormErrors>({});

  useEffect(() => {
    setForm(toFormState(initialValue));
    setErrors({});
  }, [initialValue]);

  if (!selectedCostCenter) {
    return (
      <p className="text-sm text-slate-500">
        Selecciona un centro de costo para crear conceptos.
      </p>
    );
  }

  function set(field: keyof FormState, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  }

  function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    const e: FormErrors = {};
    if (!form.name.trim()) e.name = "El nombre es obligatorio.";
    if (Object.keys(e).length > 0) {
      setErrors(e);
      return;
    }
    const payload: ExpenseConceptCreatePayload = {
      name: form.name.trim(),
      description: form.description.trim() || null,
    };
    void onSubmit(payload);
  }

  const isEditing = initialValue != null;
  const inputBase =
    "rounded-lg border px-3 py-2 text-sm text-slate-800 shadow-sm outline-none transition-colors disabled:cursor-not-allowed disabled:opacity-60";
  const inputNormal = `${inputBase} border-slate-200 bg-white focus:border-brand-400 focus:ring-1 focus:ring-brand-200`;
  const inputError = `${inputBase} border-red-400 bg-red-50 focus:border-red-500 focus:ring-1 focus:ring-red-200`;

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="flex flex-col gap-4">
        {/* Nombre */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-600">
            Nombre del concepto <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
            disabled={isSubmitting}
            maxLength={150}
            placeholder="Ej. Salarios"
            className={errors.name ? inputError : inputNormal}
          />
          {errors.name && <p className="text-xs text-red-600">{errors.name}</p>}
        </div>

        {/* Descripción */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-600">Descripción</label>
          <input
            type="text"
            value={form.description}
            onChange={(e) => set("description", e.target.value)}
            disabled={isSubmitting}
            maxLength={255}
            placeholder="Descripción breve (opcional)"
            className={inputNormal}
          />
        </div>
      </div>

      {/* Botones */}
      <div className="mt-6 flex items-center justify-end gap-3">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Cancelar
          </button>
        )}
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-lg bg-brand-600 px-5 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSubmitting ? "Guardando…" : isEditing ? "Guardar cambios" : "Crear concepto"}
        </button>
      </div>
    </form>
  );
}
