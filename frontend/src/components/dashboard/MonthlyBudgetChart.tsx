import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type { ExpenseAnalysis } from "../../types/report";
import { formatMoneyForDisplay } from "../../utils/money";

type MonthlyChartRow = {
  key: string;
  label: string;
  year: number;
  month: number;
  planned: number;
  actual: number;
  deviation: number;
};

type Props = {
  records: ExpenseAnalysis[];
  isLoading: boolean;
  error: string | null;
  onRetry: () => void;
};

const MONTH_ABBR = [
  "Ene", "Feb", "Mar", "Abr", "May", "Jun",
  "Jul", "Ago", "Sep", "Oct", "Nov", "Dic",
];

const COLOR_PLANNED = "#2f7cf6";
const COLOR_ACTUAL = "#22c55e";
const COLOR_DEVIATION = "#f59e0b";

function buildChartData(records: ExpenseAnalysis[]): MonthlyChartRow[] {
  const map = new Map<string, MonthlyChartRow>();

  for (const r of records) {
    const key = `${r.year}-${String(r.month).padStart(2, "0")}`;
    const existing = map.get(key);
    if (existing) {
      existing.planned += Number(r.planned_amount);
      existing.actual += Number(r.actual_amount);
      existing.deviation += Number(r.deviation_amount);
    } else {
      map.set(key, {
        key,
        label: key,
        year: r.year,
        month: r.month,
        planned: Number(r.planned_amount),
        actual: Number(r.actual_amount),
        deviation: Number(r.deviation_amount),
      });
    }
  }

  const rows = Array.from(map.values()).sort(
    (a, b) => a.year !== b.year ? a.year - b.year : a.month - b.month,
  );

  const multiYear = new Set(rows.map((r) => r.year)).size > 1;

  for (const row of rows) {
    const abbr = MONTH_ABBR[row.month - 1] ?? String(row.month);
    row.label = multiYear ? `${abbr} ${row.year}` : abbr;
  }

  return rows;
}

function formatYAxisTick(value: number): string {
  return `S/ ${value.toLocaleString("es-PE", { maximumFractionDigits: 0 })}`;
}

export function MonthlyBudgetChart({ records, isLoading, error, onRetry }: Props) {
  if (isLoading) {
    return (
      <article className="rounded-[28px] border border-slate-200/80 bg-white/95 p-6 shadow-panel">
        <div className="h-5 w-72 animate-pulse rounded bg-slate-200" />
        <div className="mt-2 h-4 w-80 animate-pulse rounded bg-slate-100" />
        <div className="mt-6 h-[360px] animate-pulse rounded-2xl bg-slate-100" />
      </article>
    );
  }

  if (error) {
    return (
      <article className="rounded-[28px] border border-red-200/70 bg-red-50 p-6 shadow-panel">
        <h2 className="text-base font-semibold text-slate-950">
          Evolución mensual del presupuesto
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
          Evolución mensual del presupuesto
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Planificado, real y desviación agrupados por periodo.
        </p>
        <div className="mt-6 flex h-48 items-center justify-center rounded-2xl bg-slate-50">
          <p className="text-sm text-slate-400">
            No hay datos mensuales para graficar con los filtros actuales.
          </p>
        </div>
      </article>
    );
  }

  return (
    <article className="rounded-[28px] border border-slate-200/80 bg-white/95 p-6 shadow-panel">
      <h2 className="text-base font-semibold text-slate-950">
        Evolución mensual del presupuesto
      </h2>
      <p className="mt-1 text-sm text-slate-500">
        Planificado, real y desviación agrupados por periodo.
      </p>

      <div className="mt-6" style={{ height: 360 }}>
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={data}
            margin={{ top: 8, right: 24, left: 8, bottom: 8 }}
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
            <ReferenceLine y={0} stroke="#94a3b8" strokeDasharray="4 2" />
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
            <Line
              type="monotone"
              dataKey="deviation"
              stroke={COLOR_DEVIATION}
              name="Desviación"
              strokeWidth={2}
              dot={{ r: 4, fill: COLOR_DEVIATION }}
              activeDot={{ r: 6 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      <p className="mt-3 text-xs text-slate-400">
        La desviación usa el valor calculado por backend; el frontend solo agrupa para visualización.
      </p>
    </article>
  );
}
