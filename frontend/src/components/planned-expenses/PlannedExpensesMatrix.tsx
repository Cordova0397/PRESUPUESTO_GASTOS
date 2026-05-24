import { useCallback, useRef } from "react";

import { EmptyState } from "../ui/EmptyState";
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
  const inputRefs = useRef(new Map<CellKey, HTMLInputElement | null>());

  const recordMap = new Map<CellKey, PlannedExpense>();
  for (const r of records) {
    recordMap.set(cellKey(r.expense_concept_id, r.month), r);
  }

  const registerCellRef = useCallback(
    (conceptIndex: number, month: number, el: HTMLInputElement | null) => {
      const concept = concepts[conceptIndex];
      if (!concept) return;
      const key = cellKey(concept.id, month);
      if (el) {
        inputRefs.current.set(key, el);
      } else {
        inputRefs.current.delete(key);
      }
    },
    [concepts],
  );

  function focusCell(conceptIndex: number, month: number) {
    const concept = concepts[conceptIndex];
    if (!concept) return;
    const el = inputRefs.current.get(cellKey(concept.id, month));
    if (el) {
      el.focus();
      el.select();
    }
  }

  function handleCellKeyDown(
    event: React.KeyboardEvent<HTMLInputElement>,
    conceptIndex: number,
    month: number,
  ) {
    if (event.altKey || event.ctrlKey || event.metaKey) return;

    const lastConceptIndex = concepts.length - 1;

    if (event.key === "ArrowRight") {
      event.preventDefault();
      focusCell(conceptIndex, Math.min(12, month + 1));
      return;
    }

    if (event.key === "ArrowLeft") {
      event.preventDefault();
      focusCell(conceptIndex, Math.max(1, month - 1));
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      focusCell(Math.min(lastConceptIndex, conceptIndex + 1), month);
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      focusCell(Math.max(0, conceptIndex - 1), month);
      return;
    }

    if (event.key === "Enter") {
      event.preventDefault();

      if (conceptIndex < lastConceptIndex) {
        focusCell(conceptIndex + 1, month);
        return;
      }

      if (month < 12) {
        focusCell(0, month + 1);
        return;
      }

      focusCell(conceptIndex, month);
    }
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
      <div className="px-6 py-10">
        <EmptyState message="No hay conceptos activos para este centro de costo." />
      </div>
    );
  }

  return (
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
          {concepts.map((concept, conceptIndex) => (
            <tr key={concept.id} className="hover:bg-slate-50/60">
              <td className="sticky left-0 z-10 bg-white px-2 py-1 font-medium text-slate-800 hover:bg-slate-50/60">
                <span className="block truncate" title={concept.name}>
                  {concept.name}
                </span>
              </td>
              {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                <td key={month} className="px-1 py-1">
                  <PlannedExpenseCell
                    ref={(el) => registerCellRef(conceptIndex, month, el)}
                    value={displayValue(concept.id, month)}
                    existingId={existingId(concept.id, month)}
                    disabled={isSaving}
                    onChange={(v) => onCellChange(concept.id, month, v)}
                    onKeyDown={(e) => handleCellKeyDown(e, conceptIndex, month)}
                  />
                </td>
              ))}
              <td className="px-2 py-1 text-right font-semibold text-slate-700">
                {formatMoneyForDisplay(conceptTotal(concept.id))}
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot className="border-t-2 border-slate-200 bg-slate-100 text-xs font-semibold text-slate-600">
          <tr>
            <td className="sticky left-0 z-10 bg-slate-100 px-2 py-1.5">
              Total mensual
            </td>
            {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
              <td key={month} className="px-1.5 py-1.5 text-right">
                {formatMoneyForDisplay(monthTotal(month))}
              </td>
            ))}
            <td className="px-2 py-1.5 text-right font-bold text-slate-800">
              {formatMoneyForDisplay(grandTotal)}
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
