import type { ExpenseConcept } from "../../types/expenseConcept";
import type { PlannedExpense } from "../../types/plannedExpense";
import { formatMoneyForDisplay, isValidMoneyInput } from "../../utils/money";
import { PlannedExpenseCell } from "./PlannedExpenseCell";

const MONTHS = [
  "Ene", "Feb", "Mar", "Abr", "May", "Jun",
  "Jul", "Ago", "Sep", "Oct", "Nov", "Dic",
];

type CellKey = `${number}-${number}`;

type Props = {
  concepts: ExpenseConcept[];
  records: PlannedExpense[];
  isSaving: boolean;
  pendingValues: Map<CellKey, string>;
  onCellChange: (conceptId: number, month: number, value: string) => void;
};

function cellKey(conceptId: number, month: number): CellKey {
  return `${conceptId}-${month}`;
}

export function PlannedExpensesMatrix({
  concepts,
  records,
  isSaving,
  pendingValues,
  onCellChange,
}: Props) {
  const recordMap = new Map<CellKey, PlannedExpense>();
  for (const r of records) {
    recordMap.set(cellKey(r.expense_concept_id, r.month), r);
  }

  function displayValue(conceptId: number, month: number): string {
    const key = cellKey(conceptId, month);
    if (pendingValues.has(key)) return pendingValues.get(key)!;
    const record = recordMap.get(key);
    if (record) return record.amount;
    return "";
  }

  function existingId(conceptId: number, month: number): number | null {
    return recordMap.get(cellKey(conceptId, month))?.id ?? null;
  }

  function monthTotal(month: number): number {
    let total = 0;
    for (const concept of concepts) {
      const key = cellKey(concept.id, month);
      const raw = pendingValues.has(key)
        ? pendingValues.get(key)!
        : (recordMap.get(key)?.amount ?? "");
      if (raw.trim() !== "" && isValidMoneyInput(raw)) {
        total += parseFloat(raw.replace(",", "."));
      }
    }
    return total;
  }

  function conceptTotal(conceptId: number): number {
    let total = 0;
    for (let m = 1; m <= 12; m++) {
      const key = cellKey(conceptId, m);
      const raw = pendingValues.has(key)
        ? pendingValues.get(key)!
        : (recordMap.get(key)?.amount ?? "");
      if (raw.trim() !== "" && isValidMoneyInput(raw)) {
        total += parseFloat(raw.replace(",", "."));
      }
    }
    return total;
  }

  const grandTotal = concepts.reduce((acc, c) => acc + conceptTotal(c.id), 0);

  if (concepts.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-slate-500">
        No hay conceptos activos para este centro de costo.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto scrollbar-thin">
      <table className="min-w-full text-left text-sm">
        <thead className="bg-slate-50 text-xs font-semibold text-slate-500">
          <tr>
            <th className="sticky left-0 z-10 bg-slate-50 px-4 py-3 text-left">
              Concepto
            </th>
            {MONTHS.map((m) => (
              <th key={m} className="px-2 py-3 text-right">
                {m}
              </th>
            ))}
            <th className="px-4 py-3 text-right text-slate-600">
              Total anual
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {concepts.map((concept) => (
            <tr key={concept.id} className="hover:bg-slate-50/60">
              <td className="sticky left-0 z-10 bg-white px-4 py-2 font-medium text-slate-800 hover:bg-slate-50/60">
                <span className="block max-w-[180px] truncate" title={concept.name}>
                  {concept.name}
                </span>
              </td>
              {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                <td key={month} className="px-2 py-2">
                  <PlannedExpenseCell
                    value={displayValue(concept.id, month)}
                    existingId={existingId(concept.id, month)}
                    disabled={isSaving}
                    onChange={(v) => onCellChange(concept.id, month, v)}
                  />
                </td>
              ))}
              <td className="px-4 py-2 text-right font-semibold text-slate-700">
                {formatMoneyForDisplay(conceptTotal(concept.id))}
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot className="border-t-2 border-slate-200 bg-slate-100 text-xs font-semibold text-slate-600">
          <tr>
            <td className="sticky left-0 z-10 bg-slate-100 px-4 py-2">
              Total mensual
            </td>
            {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
              <td key={month} className="px-2 py-2 text-right">
                {formatMoneyForDisplay(monthTotal(month))}
              </td>
            ))}
            <td className="px-4 py-2 text-right font-bold text-slate-800">
              {formatMoneyForDisplay(grandTotal)}
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
