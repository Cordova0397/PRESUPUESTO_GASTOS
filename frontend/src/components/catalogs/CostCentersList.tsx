import { EmptyState } from "../ui/EmptyState";
import type { CostCenter } from "../../types/costCenter";

type Props = {
  costCenters: CostCenter[];
  selectedCostCenterId: number | null;
  onSelect: (id: number) => void;
  isLoading: boolean;
  onNew: () => void;
  onEdit: (cc: CostCenter) => void;
  onDelete: (cc: CostCenter) => void;
};

function Skeleton() {
  return (
    <div className="animate-pulse space-y-2 p-4">
      {[1, 2, 3, 4, 5].map((n) => (
        <div key={n} className="h-[62px] rounded-2xl bg-slate-100" />
      ))}
    </div>
  );
}

export function CostCentersList({
  costCenters,
  selectedCostCenterId,
  onSelect,
  isLoading,
  onNew,
  onEdit,
  onDelete,
}: Props) {
  return (
    <section className="overflow-hidden rounded-[28px] border border-slate-200/80 bg-white/95 shadow-panel">
      <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
        <div>
          <h2 className="text-base font-semibold text-slate-950">Centros de costo</h2>
          <p className="mt-1 text-sm text-slate-500">
            {isLoading ? "Cargando…" : `${costCenters.length} activos`}
          </p>
        </div>
        <button
          type="button"
          onClick={onNew}
          className="rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-brand-700"
        >
          + Nuevo centro
        </button>
      </div>

      {isLoading ? (
        <Skeleton />
      ) : costCenters.length === 0 ? (
        <div className="px-4 py-10">
          <EmptyState message="No hay centros de costo activos." compact />
        </div>
      ) : (
        <div className="space-y-1.5 p-4">
          {costCenters.map((cc) => {
            const active = cc.id === selectedCostCenterId;
            return (
              <div
                key={cc.id}
                onClick={() => onSelect(cc.id)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === "Enter" && onSelect(cc.id)}
                className={`w-full cursor-pointer rounded-2xl border px-4 py-3 text-left transition duration-150 ${
                  active
                    ? "border-brand-400/50 bg-brand-500/10"
                    : "border-transparent hover:border-slate-200 hover:bg-slate-50"
                }`}
              >
                <div className="flex items-start gap-3">
                  <span
                    className="mt-1 h-3 w-3 shrink-0 rounded-full"
                    style={{ backgroundColor: cc.color ?? "#94a3b8" }}
                  />
                  <div className="min-w-0 flex-1">
                    <span
                      className={`block text-sm font-medium leading-5 ${
                        active ? "text-brand-700" : "text-slate-800"
                      }`}
                    >
                      {cc.name}
                    </span>
                    {cc.description && (
                      <span className="mt-0.5 block truncate text-xs text-slate-400">
                        {cc.description}
                      </span>
                    )}
                  </div>
                  <div
                    className="flex shrink-0 items-center gap-1.5"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      type="button"
                      onClick={() => onEdit(cc)}
                      className="rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-100"
                    >
                      Editar
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(cc)}
                      className="rounded-lg border border-red-200 px-2.5 py-1 text-xs font-medium text-red-600 transition-colors hover:bg-red-50"
                    >
                      Desactivar
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
