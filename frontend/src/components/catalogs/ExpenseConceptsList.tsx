import { EmptyState } from "../ui/EmptyState";
import { ErrorState } from "../ui/ErrorState";
import type { CostCenter } from "../../types/costCenter";
import type { ExpenseConcept } from "../../types/expenseConcept";

type Props = {
  expenseConcepts: ExpenseConcept[];
  isLoading: boolean;
  error: string | null;
  onRetry: () => void;
  selectedCostCenter: CostCenter | null;
  onNew: () => void;
  onEdit: (ec: ExpenseConcept) => void;
  onDelete: (ec: ExpenseConcept) => void;
};

function Skeleton() {
  return (
    <div className="animate-pulse space-y-3 p-6">
      {[1, 2, 3, 4, 5, 6].map((n) => (
        <div key={n} className="h-11 rounded-xl bg-slate-100" />
      ))}
    </div>
  );
}

export function ExpenseConceptsList({
  expenseConcepts,
  isLoading,
  error,
  onRetry,
  selectedCostCenter,
  onNew,
  onEdit,
  onDelete,
}: Props) {
  return (
    <section className="overflow-hidden rounded-[28px] border border-slate-200/80 bg-white/95 shadow-panel">
      <div className="border-b border-slate-200 px-6 py-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-base font-semibold text-slate-950">Conceptos de gasto</h2>
            {selectedCostCenter ? (
              <p className="mt-1 text-sm text-slate-500">
                Centro:{" "}
                <span className="font-medium text-slate-700">{selectedCostCenter.name}</span>
              </p>
            ) : (
              <p className="mt-1 text-sm text-slate-400">Selecciona un centro de costo</p>
            )}
          </div>
          <div className="flex shrink-0 items-center gap-3">
            {!isLoading && !error && selectedCostCenter && (
              <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-500">
                {expenseConcepts.length} conceptos
              </span>
            )}
            {selectedCostCenter && (
              <button
                type="button"
                onClick={onNew}
                className="rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-brand-700"
              >
                + Nuevo concepto
              </button>
            )}
          </div>
        </div>
      </div>

      {isLoading ? (
        <Skeleton />
      ) : error ? (
        <div className="p-6">
          <ErrorState
            title="Error al cargar conceptos"
            message={error}
            onRetry={onRetry}
          />
        </div>
      ) : expenseConcepts.length === 0 ? (
        <div className="px-6 py-12">
          <EmptyState
            message={
              selectedCostCenter
                ? `No hay conceptos activos en ${selectedCostCenter.name}.`
                : "Selecciona un centro de costo para ver sus conceptos."
            }
          />
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
                <th className="px-6 py-3">Nombre</th>
                <th className="hidden px-6 py-3 md:table-cell">Descripción</th>
                <th className="px-6 py-3 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {expenseConcepts.map((ec) => (
                <tr key={ec.id} className="border-t border-slate-100 hover:bg-slate-50/60">
                  <td className="px-6 py-3.5 font-medium text-slate-800">{ec.name}</td>
                  <td className="hidden px-6 py-3.5 text-slate-500 md:table-cell">
                    {ec.description ?? <span className="text-slate-300">—</span>}
                  </td>
                  <td className="px-6 py-3.5">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => onEdit(ec)}
                        className="rounded-lg border border-slate-200 px-3 py-1 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-100"
                      >
                        Editar
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete(ec)}
                        className="rounded-lg border border-red-200 px-3 py-1 text-xs font-medium text-red-600 transition-colors hover:bg-red-50"
                      >
                        Desactivar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
