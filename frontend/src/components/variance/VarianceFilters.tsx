import { useEffect, useState } from "react";

import { getActiveExpenseConceptsByCostCenter } from "../../services/catalogsService";
import type { CostCenter } from "../../types/costCenter";
import type { ExpenseConcept } from "../../types/expenseConcept";
import type { ExpenseVarianceFilters } from "../../types/report";
import { getCurrentYearInLima } from "../../utils/date";

const YEAR_OPTIONS = (() => {
  const current = getCurrentYearInLima();
  return [current - 1, current, current + 1];
})();

const MONTHS_LABELS = [
  { value: 1, label: "Enero" },
  { value: 2, label: "Febrero" },
  { value: 3, label: "Marzo" },
  { value: 4, label: "Abril" },
  { value: 5, label: "Mayo" },
  { value: 6, label: "Junio" },
  { value: 7, label: "Julio" },
  { value: 8, label: "Agosto" },
  { value: 9, label: "Septiembre" },
  { value: 10, label: "Octubre" },
  { value: 11, label: "Noviembre" },
  { value: 12, label: "Diciembre" },
];

type Props = {
  costCenters: CostCenter[];
  onApply: (filters: ExpenseVarianceFilters) => void;
  onReload: () => void;
};

type DraftFilters = {
  year: string;
  month: string;
  cost_center_id: string;
  expense_concept_id: string;
};

const DEFAULT_DRAFT: DraftFilters = {
  year: String(getCurrentYearInLima()),
  month: "",
  cost_center_id: "",
  expense_concept_id: "",
};

export function VarianceFilters({ costCenters, onApply, onReload }: Props) {
  const [draft, setDraft] = useState<DraftFilters>({ ...DEFAULT_DRAFT });
  const [filterConcepts, setFilterConcepts] = useState<ExpenseConcept[]>([]);
  const [conceptsLoading, setConceptsLoading] = useState(false);

  // Recargar conceptos cuando cambia el centro; limpiar concepto seleccionado
  useEffect(() => {
    if (!draft.cost_center_id) {
      setFilterConcepts([]);
      setDraft((prev) => ({ ...prev, expense_concept_id: "" }));
      return;
    }
    let cancelled = false;
    setConceptsLoading(true);
    getActiveExpenseConceptsByCostCenter(Number(draft.cost_center_id))
      .then((data) => {
        if (cancelled) return;
        setFilterConcepts(data);
        setDraft((prev) => ({ ...prev, expense_concept_id: "" }));
      })
      .catch(() => {
        if (!cancelled) setFilterConcepts([]);
      })
      .finally(() => {
        if (!cancelled) setConceptsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [draft.cost_center_id]);

  function buildFilters(d: DraftFilters): ExpenseVarianceFilters {
    const f: ExpenseVarianceFilters = {};
    if (d.year) f.year = Number(d.year);
    if (d.month) f.month = Number(d.month);
    if (d.cost_center_id) f.cost_center_id = Number(d.cost_center_id);
    if (d.expense_concept_id) f.expense_concept_id = Number(d.expense_concept_id);
    return f;
  }

  function handleApply() {
    onApply(buildFilters(draft));
  }

  function handleClear() {
    const cleared = { ...DEFAULT_DRAFT };
    setDraft(cleared);
    setFilterConcepts([]);
    onApply(buildFilters(cleared));
  }

  function set(field: keyof DraftFilters, value: string) {
    setDraft((prev) => ({ ...prev, [field]: value }));
  }

  const selectCls =
    "rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-800 shadow-sm focus:border-brand-400 focus:outline-none focus:ring-1 focus:ring-brand-200";

  return (
    <div className="flex flex-wrap items-end gap-3">
      {/* Año */}
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-slate-600">Año</label>
        <select
          value={draft.year}
          onChange={(e) => set("year", e.target.value)}
          className={selectCls}
        >
          <option value="">Todos</option>
          {YEAR_OPTIONS.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
      </div>

      {/* Mes */}
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-slate-600">Mes</label>
        <select
          value={draft.month}
          onChange={(e) => set("month", e.target.value)}
          className={selectCls}
        >
          <option value="">Todos</option>
          {MONTHS_LABELS.map((m) => (
            <option key={m.value} value={m.value}>
              {m.label}
            </option>
          ))}
        </select>
      </div>

      {/* Centro de costo */}
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-slate-600">Centro de costo</label>
        <select
          value={draft.cost_center_id}
          onChange={(e) => set("cost_center_id", e.target.value)}
          className={selectCls}
        >
          <option value="">Todos</option>
          {costCenters.map((cc) => (
            <option key={cc.id} value={cc.id}>
              {cc.code} — {cc.name}
            </option>
          ))}
        </select>
      </div>

      {/* Concepto (dependiente del centro) */}
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-slate-600">Concepto</label>
        <select
          value={draft.expense_concept_id}
          onChange={(e) => set("expense_concept_id", e.target.value)}
          disabled={!draft.cost_center_id || conceptsLoading}
          className={`${selectCls} disabled:cursor-not-allowed disabled:opacity-60`}
        >
          <option value="">Todos</option>
          {filterConcepts.map((ec) => (
            <option key={ec.id} value={ec.id}>
              {ec.name}
            </option>
          ))}
        </select>
      </div>

      {/* Botones */}
      <div className="flex items-end gap-2 pb-0.5">
        <button
          type="button"
          onClick={handleApply}
          className="rounded-lg bg-brand-600 px-4 py-1.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-700"
        >
          Aplicar
        </button>
        <button
          type="button"
          onClick={handleClear}
          className="rounded-lg border border-slate-200 bg-white px-4 py-1.5 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-50"
        >
          Limpiar
        </button>
        <button
          type="button"
          onClick={onReload}
          className="rounded-lg border border-slate-200 bg-white px-4 py-1.5 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-50"
        >
          Recargar
        </button>
      </div>
    </div>
  );
}
