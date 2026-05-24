import { EmptyState } from "../ui/EmptyState";
import { ErrorState } from "../ui/ErrorState";
import type { ActualExpense } from "../../types/actualExpense";
import type { ExpenseConcept } from "../../types/expenseConcept";
import { formatMoneyForDisplay } from "../../utils/money";

const MONTHS = [
  "Ene", "Feb", "Mar", "Abr", "May", "Jun",
  "Jul", "Ago", "Sep", "Oct", "Nov", "Dic",
];

type Props = {
  concepts: ExpenseConcept[];
  records: ActualExpense[];
  isLoading: boolean;
  error: string | null;
  year?: number;
  costCenterLabel?: string;
  onRetry: () => void;
};

export function ActualExpensesMonthlyMatrix({
  concepts,
  records,
  isLoading,
  error,
  year,
  costCenterLabel,
  onRetry,
}: Props) {
  function amountFor(conceptId: number, month: number): number {
    let total = 0;
    for (const r of records) {
      if (r.expense_concept_id === conceptId && r.month === month) {
        total += Number(r.amount);
      }
    }
    return total;
  }

  function conceptTotal(conceptId: number): number {
    let total = 0;
    for (let m = 1; m <= 12; m++) {
      total += amountFor(conceptId, m);
    }
    return total;
  }

  function monthTotal(month: number): number {
    let total = 0;
    for (const concept of concepts) {
      total += amountFor(concept.id, month);
    }
    return total;
  }

  const grandTotal = concepts.reduce((acc, c) => acc + conceptTotal(c.id), 0);

  if (isLoading) {
    return (
      <div className="overflow-x-auto scrollbar-thin">
        <div className="min-w-[1120px] space-y-2 px-6 py-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex gap-1.5">
              <div className="h-7 w-[150px] animate-pulse rounded bg-slate-100" />
              {Array.from({ length: 12 }).map((__, m) => (
                <div key={m} className="h-7 w-[68px] animate-pulse rounded bg-slate-100" />
              ))}
              <div className="h-7 w-[100px] animate-pulse rounded bg-slate-100" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="px-6 py-6">
        <ErrorState message={error} onRetry={onRetry} compact />
      </div>
    );
  }

  if (concepts.length === 0) {
    return (
      <div className="px-6 py-10">
        <EmptyState message="No hay conceptos activos para este centro de costo." />
      </div>
    );
  }

  return (
    <div>
      {(year !== undefined || costCenterLabel !== undefined) && (
        <div className="border-b border-slate-100 px-6 py-3">
          <p className="text-xs font-medium text-slate-700">
            {year !== undefined && <span>Año {year}</span>}
            {year !== undefined && costCenterLabel !== undefined && (
              <span className="mx-1.5 text-slate-400">·</span>
            )}
            {costCenterLabel !== undefined && <span>{costCenterLabel}</span>}
          </p>
          <p className="mt-0.5 text-xs text-slate-400">
            Los importes se consolidan desde las transacciones registradas; no se guardan como matriz.
          </p>
        </div>
      )}

      <div className="overflow-x-auto scrollbar-thin">
        <table className="w-full min-w-[1120px] table-fixed text-left text-xs">
          <colgroup>
            <col className="w-[150px]" />
            {Array.from({ length: 12 }).map((_, i) => (
              <col key={i} className="w-[68px]" />
            ))}
            <col className="w-[100px]" />
          </colgroup>
          <thead className="bg-slate-50 text-xs font-semibold text-slate-500">
            <tr>
              <th className="sticky left-0 z-10 bg-slate-50 px-2 py-2 text-left">
                Concepto
              </th>
              {MONTHS.map((m) => (
                <th key={m} className="px-1.5 py-2 text-right">
                  {m}
                </th>
              ))}
              <th className="px-2 py-2 text-right text-slate-600">
                Total anual
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {concepts.map((concept) => {
              const total = conceptTotal(concept.id);
              return (
                <tr key={concept.id} className="hover:bg-slate-50/60">
                  <td className="sticky left-0 z-10 bg-white px-2 py-1 font-medium text-slate-800 hover:bg-slate-50/60">
                    <span className="block truncate" title={concept.name}>
                      {concept.name}
                    </span>
                  </td>
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => {
                    const amt = amountFor(concept.id, month);
                    return (
                      <td
                        key={month}
                        className="px-1.5 py-1 text-right tabular-nums text-slate-700"
                      >
                        {amt > 0 ? formatMoneyForDisplay(amt) : "—"}
                      </td>
                    );
                  })}
                  <td className="px-2 py-1 text-right font-semibold tabular-nums text-slate-700">
                    {formatMoneyForDisplay(total)}
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot className="border-t-2 border-slate-200 bg-slate-100 text-xs font-semibold text-slate-600">
            <tr>
              <td className="sticky left-0 z-10 bg-slate-100 px-2 py-1.5">
                Total mensual
              </td>
              {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                <td key={month} className="px-1.5 py-1.5 text-right tabular-nums">
                  {formatMoneyForDisplay(monthTotal(month))}
                </td>
              ))}
              <td className="px-2 py-1.5 text-right font-bold tabular-nums text-slate-800">
                {formatMoneyForDisplay(grandTotal)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
