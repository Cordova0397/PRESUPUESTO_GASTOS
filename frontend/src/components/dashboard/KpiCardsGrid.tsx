import type { ExpenseKpis } from "../../types/report";
import { formatMoneyForDisplay } from "../../utils/money";
import { KpiCard } from "./KpiCard";

type Props = {
  kpis: ExpenseKpis | null;
  isLoading: boolean;
};

function deviationTone(value: string): "neutral" | "positive" | "negative" {
  const n = Number(value);
  if (n > 0) return "negative";
  if (n < 0) return "positive";
  return "neutral";
}

function executionTone(
  value: string | null,
): "neutral" | "positive" | "negative" | "warning" {
  if (value === null) return "warning";
  if (Number(value) > 1) return "negative";
  return "positive";
}

function formatExecution(value: string | null): string {
  if (value === null) return "—";
  return `${(Number(value) * 100).toFixed(2)}%`;
}

export function KpiCardsGrid({ kpis, isLoading }: Props) {
  const planned = kpis
    ? `S/ ${formatMoneyForDisplay(kpis.planned_amount_total)}`
    : "—";
  const actual = kpis
    ? `S/ ${formatMoneyForDisplay(kpis.actual_amount_total)}`
    : "—";
  const deviation = kpis
    ? `S/ ${formatMoneyForDisplay(kpis.deviation_amount_total)}`
    : "—";
  const execution = kpis ? formatExecution(kpis.execution_percentage) : "—";

  return (
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <KpiCard
        title="Planificado total"
        value={planned}
        description="Total presupuestado para el filtro seleccionado."
        tone="neutral"
        isLoading={isLoading}
      />
      <KpiCard
        title="Real total"
        value={actual}
        description="Total ejecutado registrado para el filtro seleccionado."
        tone="neutral"
        isLoading={isLoading}
      />
      <KpiCard
        title="Desviación total"
        value={deviation}
        description="Real total menos planificado total."
        tone={kpis ? deviationTone(kpis.deviation_amount_total) : "neutral"}
        isLoading={isLoading}
      />
      <KpiCard
        title="Ejecución"
        value={execution}
        description="Real total dividido entre planificado total."
        tone={kpis ? executionTone(kpis.execution_percentage) : "neutral"}
        isLoading={isLoading}
      />
    </section>
  );
}
