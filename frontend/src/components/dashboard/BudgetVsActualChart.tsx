import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type { ExpenseAnalysis } from "../../types/report";
import { formatMoneyForDisplay } from "../../utils/money";

type ChartRow = {
  costCenterId: number;
  label: string;
  name: string;
  planned: number;
  actual: number;
};

type Props = {
  records: ExpenseAnalysis[];
  isLoading: boolean;
  error: string | null;
  onRetry: () => void;
};

const COLOR_PLANNED = "#2f7cf6";
const COLOR_ACTUAL = "#22c55e";

function buildChartData(records: ExpenseAnalysis[]): ChartRow[] {
  const map = new Map<number, ChartRow>();
  for (const r of records) {
    const existing = map.get(r.cost_center_id);
    const label =
      r.cost_center_code ?? r.cost_center_name ?? `Centro ${r.cost_center_id}`;
    const name = r.cost_center_name ?? label;
    if (existing) {
      existing.planned += Number(r.planned_amount);
      existing.actual += Number(r.actual_amount);
    } else {
      map.set(r.cost_center_id, {
        costCenterId: r.cost_center_id,
        label,
        name,
        planned: Number(r.planned_amount),
        actual: Number(r.actual_amount),
      });
    }
  }
  return Array.from(map.values());
}

function formatYAxisTick(value: number): string {
  return `S/ ${value.toLocaleString("es-PE", { maximumFractionDigits: 0 })}`;
}

export function BudgetVsActualChart({ records, isLoading, error, onRetry }: Props) {
  if (isLoading) {
    return (
      <article className="rounded-[28px] border border-slate-200/80 bg-white/95 p-6 shadow-panel">
        <div className="h-5 w-64 animate-pulse rounded bg-slate-200" />
        <div className="mt-2 h-4 w-96 animate-pulse rounded bg-slate-100" />
        <div className="mt-6 h-[360px] animate-pulse rounded-2xl bg-slate-100" />
      </article>
    );
  }

  if (error) {
    return (
      <article className="rounded-[28px] border border-red-200/70 bg-red-50 p-6 shadow-panel">
        <h2 className="text-base font-semibold text-slate-950">
          Planificado vs real por centro de costo
        </h2>
        <div className="mt-4 flex items-center gap-4">
          <p className="text-sm text-red-600">{error}</p>
          <button
            type="button"
            onClick={onRetry}
            className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Reintentar
          </button>
        </div>
      </article>
    );
  }

  const data = buildChartData(records);

  if (data.length === 0) {
    return (
      <article className="rounded-[28px] border border-slate-200/80 bg-white/95 p-6 shadow-panel">
        <h2 className="text-base font-semibold text-slate-950">
          Planificado vs real por centro de costo
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Comparativo visual calculado desde el análisis consolidado del backend.
        </p>
        <div className="mt-6 flex h-48 items-center justify-center rounded-2xl bg-slate-50">
          <p className="text-sm text-slate-400">
            No hay datos para graficar con los filtros actuales.
          </p>
        </div>
      </article>
    );
  }

  return (
    <article className="rounded-[28px] border border-slate-200/80 bg-white/95 p-6 shadow-panel">
      <h2 className="text-base font-semibold text-slate-950">
        Planificado vs real por centro de costo
      </h2>
      <p className="mt-1 text-sm text-slate-500">
        Comparativo visual calculado desde el análisis consolidado del backend.
      </p>

      <div className="mt-6" style={{ height: 360 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 8, right: 16, left: 8, bottom: 8 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 12, fill: "#64748b" }}
              tickLine={false}
              axisLine={{ stroke: "#e2e8f0" }}
            />
            <YAxis
              tickFormatter={formatYAxisTick}
              tick={{ fontSize: 11, fill: "#64748b" }}
              tickLine={false}
              axisLine={false}
              width={90}
            />
            <Tooltip
              formatter={(value) =>
                `S/ ${formatMoneyForDisplay(String(value))}`
              }
              contentStyle={{
                borderRadius: "12px",
                border: "1px solid #e2e8f0",
                boxShadow: "0 4px 16px rgba(15,23,42,0.08)",
              }}
            />
            <Legend />
            <Bar
              dataKey="planned"
              fill={COLOR_PLANNED}
              name="Planificado"
              radius={[4, 4, 0, 0]}
            />
            <Bar
              dataKey="actual"
              fill={COLOR_ACTUAL}
              name="Real"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <p className="mt-3 text-xs text-slate-400">
        Los montos se convierten a número solo para renderizar el gráfico.
      </p>
    </article>
  );
}
