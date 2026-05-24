import type { ExpenseVariance } from "../../types/report";
import { getTrafficLightStatus } from "../../utils/semaphore";

type Props = {
  records: ExpenseVariance[];
  isLoading: boolean;
};

export function VarianceSummary({ records, isLoading }: Props) {
  const ok = records.filter(
    (r) =>
      getTrafficLightStatus({
        status: r.status,
        deviationPercentage: r.deviation_percentage,
      }) === "OK",
  ).length;
  const alerta = records.filter(
    (r) =>
      getTrafficLightStatus({
        status: r.status,
        deviationPercentage: r.deviation_percentage,
      }) === "ALERTA",
  ).length;
  const critico = records.filter(
    (r) =>
      getTrafficLightStatus({
        status: r.status,
        deviationPercentage: r.deviation_percentage,
      }) === "CRÍTICO",
  ).length;
  const sinPresupuesto = records.filter(
    (r) =>
      getTrafficLightStatus({
        status: r.status,
        deviationPercentage: r.deviation_percentage,
      }) === "SIN PRESUPUESTO",
  ).length;

  const placeholder = "…";

  return (
    <div className="flex flex-wrap items-center gap-6 px-6 py-4 text-sm">
      <div>
        <span className="text-slate-500">Filas mostradas: </span>
        <span className="font-semibold text-slate-800">
          {isLoading ? placeholder : records.length}
        </span>
      </div>

      <div className="h-4 w-px bg-slate-200" aria-hidden="true" />

      <div className="flex items-center gap-1.5">
        <span className="inline-block h-2 w-2 rounded-full bg-green-500" />
        <span className="text-slate-500">OK: </span>
        <span className="font-semibold text-slate-800">
          {isLoading ? placeholder : ok}
        </span>
      </div>

      <div className="flex items-center gap-1.5">
        <span className="inline-block h-2 w-2 rounded-full bg-amber-400" />
        <span className="text-slate-500">Alerta: </span>
        <span className="font-semibold text-slate-800">
          {isLoading ? placeholder : alerta}
        </span>
      </div>

      <div className="flex items-center gap-1.5">
        <span className="inline-block h-2 w-2 rounded-full bg-red-500" />
        <span className="text-slate-500">Crítico: </span>
        <span className="font-semibold text-slate-800">
          {isLoading ? placeholder : critico}
        </span>
      </div>

      <div className="flex items-center gap-1.5">
        <span className="inline-block h-2 w-2 rounded-full bg-orange-400" />
        <span className="text-slate-500">Sin presupuesto: </span>
        <span className="font-semibold text-slate-800">
          {isLoading ? placeholder : sinPresupuesto}
        </span>
      </div>

      {!isLoading && records.length > 0 && (
        <p className="ml-auto text-xs text-slate-400">
          Semáforos visuales derivados de los valores calculados por backend.
        </p>
      )}
    </div>
  );
}
