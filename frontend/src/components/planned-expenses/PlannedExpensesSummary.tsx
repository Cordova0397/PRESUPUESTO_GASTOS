import type { PlannedExpense } from "../../types/plannedExpense";
import { formatMoneyForDisplay } from "../../utils/money";

type Props = {
  records: PlannedExpense[];
  isLoading: boolean;
};

export function PlannedExpensesSummary({ records, isLoading }: Props) {
  // Suma visual — no persistida
  const total = records.reduce((acc, r) => acc + Number(r.amount), 0);

  return (
    <div className="flex flex-wrap items-center gap-6 px-6 py-4 text-sm">
      <div>
        <span className="text-slate-500">Registros mostrados: </span>
        <span className="font-semibold text-slate-800">
          {isLoading ? "…" : records.length}
        </span>
      </div>
      <div>
        <span className="text-slate-500">Total mostrado: </span>
        <span className="font-semibold text-slate-800">
          {isLoading ? "…" : `S/ ${formatMoneyForDisplay(total)}`}
        </span>
      </div>
      {!isLoading && records.length > 0 && (
        <p className="ml-auto text-xs text-slate-400">
          Los totales son visuales y no se guardan.
        </p>
      )}
    </div>
  );
}
