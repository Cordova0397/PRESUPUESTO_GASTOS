import { TableEmptyRow } from "../ui/TableEmptyRow";
import { TableSkeletonRows } from "../ui/TableSkeletonRows";
import { SemaphoreBadge } from "../reports/SemaphoreBadge";
import type { ExpenseAnalysis } from "../../types/report";
import { formatMoneyForDisplay } from "../../utils/money";
import { getTrafficLightStatus } from "../../utils/semaphore";

type Props = {
  records: ExpenseAnalysis[];
  isLoading: boolean;
};

const MONTHS_SHORT = [
  "", "Ene", "Feb", "Mar", "Abr", "May", "Jun",
  "Jul", "Ago", "Sep", "Oct", "Nov", "Dic",
];

function formatPeriodo(year: number, month: number): string {
  return `${MONTHS_SHORT[month] ?? String(month)} ${year}`;
}

/**
 * Formatea deviation_percentage como porcentaje visual.
 * El ratio "0.2000" viene del backend y se muestra como "20.00%".
 * Esto es solo formateo visual; no recalcula el porcentaje.
 */
function formatPct(pct: string | null): string {
  if (pct === null) return "—";
  const asNumber = Number(pct) * 100;
  return `${asNumber.toFixed(2)}%`;
}

type StatusStyle = { badge: string; label: string };

const STATUS_STYLES: Record<string, StatusStyle> = {
  SOBRECOSTO: {
    badge: "bg-red-100 text-red-700 border border-red-200",
    label: "Sobrecosto",
  },
  AHORRO: {
    badge: "bg-green-100 text-green-700 border border-green-200",
    label: "Ahorro",
  },
  "SIN PRESUPUESTO": {
    badge: "bg-amber-100 text-amber-700 border border-amber-200",
    label: "Sin presupuesto",
  },
  "EN PRESUPUESTO": {
    badge: "bg-blue-100 text-blue-700 border border-blue-200",
    label: "En presupuesto",
  },
};

function StatusBadge({ status }: { status: string }) {
  const style = STATUS_STYLES[status] ?? {
    badge: "bg-slate-100 text-slate-600 border border-slate-200",
    label: status,
  };
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${style.badge}`}
    >
      {style.label}
    </span>
  );
}

function DeviationAmount({ value }: { value: string }) {
  const num = Number(value);
  const colorCls =
    num > 0 ? "text-red-600" : num < 0 ? "text-green-700" : "text-slate-600";
  return (
    <span className={`font-semibold ${colorCls}`}>
      S/ {formatMoneyForDisplay(value)}
    </span>
  );
}

export function AnalysisTable({ records, isLoading }: Props) {
  return (
    <div className="overflow-x-auto scrollbar-thin">
      <table className="min-w-full text-left text-sm">
        <thead className="bg-slate-50 text-xs font-semibold text-slate-500">
          <tr>
            <th className="px-4 py-3 whitespace-nowrap">Periodo</th>
            <th className="px-4 py-3">Centro de costo</th>
            <th className="px-4 py-3 text-right whitespace-nowrap">Planificado</th>
            <th className="px-4 py-3 text-right whitespace-nowrap">Real</th>
            <th className="px-4 py-3 text-right whitespace-nowrap">Desviación</th>
            <th className="px-4 py-3 text-right whitespace-nowrap">% Desviación</th>
            <th className="px-4 py-3 text-center">Estado</th>
            <th className="px-4 py-3 text-center whitespace-nowrap">Semáforo</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {isLoading ? (
            <TableSkeletonRows columns={8} />
          ) : records.length === 0 ? (
            <TableEmptyRow
              colSpan={8}
              message="No hay análisis con los filtros actuales."
            />
          ) : (
            records.map((record, idx) => {
              const trafficLight = getTrafficLightStatus({
                status: record.status,
                deviationPercentage: record.deviation_percentage,
              });
              return (
              <tr
                key={`${record.year}-${record.month}-${record.cost_center_id}-${idx}`}
                className="transition-colors hover:bg-slate-50/60"
              >
                {/* Periodo */}
                <td className="whitespace-nowrap px-4 py-3 font-medium text-slate-700">
                  {formatPeriodo(record.year, record.month)}
                </td>

                {/* Centro de costo */}
                <td className="px-4 py-3">
                  <span className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    {record.cost_center_code ?? "—"}
                  </span>
                  <span
                    className="block max-w-[200px] truncate text-slate-700"
                    title={record.cost_center_name ?? ""}
                  >
                    {record.cost_center_name ?? "—"}
                  </span>
                </td>

                {/* Planificado */}
                <td className="whitespace-nowrap px-4 py-3 text-right font-medium text-slate-700">
                  S/ {formatMoneyForDisplay(record.planned_amount)}
                </td>

                {/* Real */}
                <td className="whitespace-nowrap px-4 py-3 text-right font-medium text-slate-700">
                  S/ {formatMoneyForDisplay(record.actual_amount)}
                </td>

                {/* Desviación */}
                <td className="whitespace-nowrap px-4 py-3 text-right">
                  <DeviationAmount value={record.deviation_amount} />
                </td>

                {/* % Desviación */}
                <td className="whitespace-nowrap px-4 py-3 text-right text-slate-600">
                  {formatPct(record.deviation_percentage)}
                </td>

                {/* Estado */}
                <td className="px-4 py-3 text-center">
                  <StatusBadge status={record.status} />
                </td>

                {/* Semáforo */}
                <td className="px-4 py-3 text-center">
                  <SemaphoreBadge value={trafficLight} />
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
