import { getCurrentYearInLima } from "../../utils/date";
import type { CostCenter } from "../../types/costCenter";

const YEAR_OPTIONS = (() => {
  const current = getCurrentYearInLima();
  return [current - 1, current, current + 1];
})();

type Props = {
  year: number;
  costCenters: CostCenter[];
  selectedCostCenterId: number | null;
  hasPendingChanges: boolean;
  hasErrors: boolean;
  isSaving: boolean;
  onYearChange: (year: number) => void;
  onCostCenterChange: (id: number) => void;
  onSave: () => void;
  onReload: () => void;
};

export function PlannedExpensesToolbar({
  year,
  costCenters,
  selectedCostCenterId,
  hasPendingChanges,
  hasErrors,
  isSaving,
  onYearChange,
  onCostCenterChange,
  onSave,
  onReload,
}: Props) {
  const saveDisabled = !hasPendingChanges || hasErrors || isSaving;

  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <label
            htmlFor="pe-year"
            className="text-sm font-medium text-slate-700"
          >
            Año
          </label>
          <select
            id="pe-year"
            value={year}
            onChange={(e) => onYearChange(Number(e.target.value))}
            disabled={isSaving}
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-800 shadow-sm focus:border-brand-400 focus:outline-none focus:ring-1 focus:ring-brand-200 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
          >
            {YEAR_OPTIONS.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <label
            htmlFor="pe-cost-center"
            className="text-sm font-medium text-slate-700"
          >
            Centro de costo
          </label>
          <select
            id="pe-cost-center"
            value={selectedCostCenterId ?? ""}
            onChange={(e) => onCostCenterChange(Number(e.target.value))}
            disabled={isSaving || costCenters.length === 0}
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-800 shadow-sm focus:border-brand-400 focus:outline-none focus:ring-1 focus:ring-brand-200 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
          >
            {costCenters.map((cc) => (
              <option key={cc.id} value={cc.id}>
                {cc.code} — {cc.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 lg:ml-auto">
        {hasPendingChanges && !isSaving && (
          <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-800">
            Cambios pendientes
          </span>
        )}
        <button
          type="button"
          onClick={onReload}
          disabled={isSaving}
          className="w-full rounded-lg border border-slate-200 bg-white px-4 py-1.5 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
        >
          Recargar
        </button>
        <button
          type="button"
          onClick={onSave}
          disabled={saveDisabled}
          className="w-full rounded-lg bg-brand-600 px-4 py-1.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
        >
          {isSaving ? "Guardando…" : "Guardar cambios"}
        </button>
      </div>
    </div>
  );
}
