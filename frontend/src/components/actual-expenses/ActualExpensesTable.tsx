import { TableEmptyRow } from "../ui/TableEmptyRow";
import { TableSkeletonRows } from "../ui/TableSkeletonRows";
import type { ActualExpense } from "../../types/actualExpense";
import { formatMoneyForDisplay } from "../../utils/money";

type Props = {
  records: ActualExpense[];
  isLoading: boolean;
  editingId: number | null;
  onEdit: (record: ActualExpense) => void;
  onDelete: (id: number) => void;
};

const MONTHS = [
  "", "Ene", "Feb", "Mar", "Abr", "May", "Jun",
  "Jul", "Ago", "Sep", "Oct", "Nov", "Dic",
];

function formatDate(dateStr: string): string {
  const [year, month, day] = dateStr.split("-");
  const m = parseInt(month, 10);
  return `${day} ${MONTHS[m] ?? ""} ${year}`;
}

export function ActualExpensesTable({
  records,
  isLoading,
  editingId,
  onEdit,
  onDelete,
}: Props) {
  return (
    <div className="overflow-x-auto scrollbar-thin">
      <table className="min-w-full text-left text-sm">
        <thead className="bg-slate-50 text-xs font-semibold text-slate-500">
          <tr>
            <th className="px-4 py-3">Fecha</th>
            <th className="px-4 py-3">Centro</th>
            <th className="px-4 py-3">Concepto</th>
            <th className="px-4 py-3 text-right">Monto</th>
            <th className="px-4 py-3">Proveedor</th>
            <th className="px-4 py-3">Documento</th>
            <th className="px-4 py-3">Descripción</th>
            <th className="px-4 py-3 text-center">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {isLoading ? (
            <TableSkeletonRows columns={8} />
          ) : records.length === 0 ? (
            <TableEmptyRow
              colSpan={8}
              message="No hay gastos reales con los filtros actuales."
            />
          ) : (
            records.map((record) => {
              const isEditing = record.id === editingId;
              return (
                <tr
                  key={record.id}
                  className={[
                    "transition-colors",
                    isEditing
                      ? "bg-brand-50/60"
                      : "hover:bg-slate-50/60",
                  ].join(" ")}
                >
                  <td className="whitespace-nowrap px-4 py-3 font-medium text-slate-700">
                    {formatDate(record.expense_date)}
                  </td>
                  <td className="px-4 py-3">
                    <span className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                      {record.cost_center_code ?? "—"}
                    </span>
                    <span className="block max-w-[130px] truncate text-slate-700" title={record.cost_center_name ?? ""}>
                      {record.cost_center_name ?? "—"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                      {record.expense_concept_code ?? "—"}
                    </span>
                    <span className="block max-w-[150px] truncate text-slate-700" title={record.expense_concept_name ?? ""}>
                      {record.expense_concept_name ?? "—"}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-right font-semibold text-slate-800">
                    S/ {formatMoneyForDisplay(record.amount)}
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    <span className="block max-w-[140px] truncate" title={record.supplier ?? ""}>
                      {record.supplier ?? "—"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {record.document_number ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    <span className="block max-w-[160px] truncate" title={record.description ?? ""}>
                      {record.description ?? "—"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => onEdit(record)}
                        disabled={isEditing}
                        className="rounded-lg border border-slate-200 px-3 py-1 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        Editar
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete(record.id)}
                        className="rounded-lg border border-red-200 px-3 py-1 text-xs font-medium text-red-600 transition-colors hover:bg-red-50"
                      >
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
