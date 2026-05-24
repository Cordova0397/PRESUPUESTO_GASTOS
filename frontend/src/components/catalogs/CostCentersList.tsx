import { EmptyState } from "../ui/EmptyState";
import type { CostCenter } from "../../types/costCenter";

type Props = {
  costCenters: CostCenter[];
  selectedCostCenterId: number | null;
  onSelect: (id: number) => void;
  isLoading: boolean;
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
}: Props) {
  return (
    <section className="overflow-hidden rounded-[28px] border border-slate-200/80 bg-white/95 shadow-panel">
      <div className="border-b border-slate-200 px-6 py-5">
        <h2 className="text-base font-semibold text-slate-950">Centros de costo</h2>
        <p className="mt-1 text-sm text-slate-500">
          {isLoading ? "Cargando…" : `${costCenters.length} activos`}
        </p>
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
              <button
                key={cc.id}
                onClick={() => onSelect(cc.id)}
                className={`w-full rounded-2xl border px-4 py-3 text-left transition duration-150 ${
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
                  <div className="min-w-0">
                    <span className="block text-[11px] font-semibold uppercase tracking-widest text-slate-400">
                      {cc.code}
                    </span>
                    <span
                      className={`mt-0.5 block text-sm font-medium leading-5 ${
                        active ? "text-brand-700" : "text-slate-800"
                      }`}
                    >
                      {cc.name}
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </section>
  );
}
