import { useEffect, useState } from "react";

import type { CostCenter, CostCenterCreatePayload, CostCenterUpdatePayload } from "../../types/costCenter";

type Props = {
  initialValue?: CostCenter | null;
  onSubmit: (payload: CostCenterCreatePayload | CostCenterUpdatePayload) => Promise<void> | void;
  onCancel?: () => void;
  isSubmitting?: boolean;
};

type FormState = {
  name: string;
  description: string;
  color: string;
};

type FormErrors = Partial<Record<keyof FormState, string>>;

function toFormState(cc: CostCenter | null | undefined): FormState {
  return {
    name: cc?.name ?? "",
    description: cc?.description ?? "",
    color: cc?.color ?? "#94a3b8",
  };
}

export function CostCenterForm({ initialValue, onSubmit, onCancel, isSubmitting }: Props) {
  const [form, setForm] = useState<FormState>(() => toFormState(initialValue));
  const [errors, setErrors] = useState<FormErrors>({});

  useEffect(() => {
    setForm(toFormState(initialValue));
    setErrors({});
  }, [initialValue]);

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
    const payload: CostCenterCreatePayload = {
      name: form.name.trim(),
      description: form.description.trim() || null,
      color: form.color || null,
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
            Nombre del centro de costo <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
            disabled={isSubmitting}
            maxLength={150}
            placeholder="Ej. Operaciones"
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

        {/* Color */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-600">Color (opcional)</label>
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={form.color}
              onChange={(e) => set("color", e.target.value)}
              disabled={isSubmitting}
              className="h-9 w-14 cursor-pointer rounded-lg border border-slate-200 bg-white p-1 shadow-sm disabled:cursor-not-allowed disabled:opacity-60"
            />
            <span className="font-mono text-xs text-slate-500">{form.color}</span>
          </div>
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
          {isSubmitting ? "Guardando…" : isEditing ? "Guardar cambios" : "Crear centro"}
        </button>
      </div>
    </form>
  );
}
