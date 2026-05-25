import { TableEmptyRow } from "../ui/TableEmptyRow";
import { TableSkeletonRows } from "../ui/TableSkeletonRows";
import type { PlannedExpense } from "../../types/plannedExpense";
import { formatMoneyForDisplay } from "../../utils/money";

const MONTHS_SHORT = [
  "", "Ene", "Feb", "Mar", "Abr", "May", "Jun",
  "Jul", "Ago", "Sep", "Oct", "Nov", "Dic",
];

type Props = {
  records: PlannedExpense[];
  isLoading: boolean;
};

export function PlannedExpensesDetailTable({ records, isLoading }: Props) {
  return (
    <div className="overflow-x-auto scrollbar-thin">
      <table className="min-w-full text-left text-sm">
        <thead className="bg-slate-50 text-xs font-semibold text-slate-500">
          <tr>
            <th className="px-4 py-3">Periodo</th>
            <th className="px-4 py-3">Centro</th>
            <th className="px-4 py-3">Concepto</th>
            <th className="px-4 py-3 text-right">Monto</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {isLoading ? (
            <TableSkeletonRows columns={4} />
          ) : records.length === 0 ? (
            <TableEmptyRow
              colSpan={4}
              message="No hay gastos planificados con los filtros actuales."
            />
          ) : (
            records.map((record) => (
              <tr key={record.id} className="transition-colors hover:bg-slate-50/60">
                <td className="whitespace-nowrap px-4 py-3 font-medium text-slate-700">
                  {MONTHS_SHORT[record.month] ?? "—"} {record.year}
                </td>
                <td className="px-4 py-3">
                  <span className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    {record.cost_center_code ?? "—"}
                  </span>
                  <span
                    className="block max-w-[130px] truncate text-slate-700"
                    title={record.cost_center_name ?? ""}
                  >
                    {record.cost_center_name ?? String(record.cost_center_id)}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    {record.expense_concept_code ?? "—"}
                  </span>
                  <span
                    className="block max-w-[150px] truncate text-slate-700"
                    title={record.expense_concept_name ?? ""}
                  >
                    {record.expense_concept_name ?? String(record.expense_concept_id)}
                  </span>
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-right font-semibold text-slate-800">
                  S/ {formatMoneyForDisplay(record.amount)}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
