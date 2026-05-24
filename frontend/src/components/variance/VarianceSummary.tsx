import type { ExpenseVariance } from "../../types/report";

type Props = {
  records: ExpenseVariance[];
  isLoading: boolean;
};

export function VarianceSummary({ records, isLoading }: Props) {
  const sinPresupuesto = records.filter((r) => r.status === "SIN PRESUPUESTO").length;
  const sobrecosto = records.filter((r) => r.status === "SOBRECOSTO").length;
  const ahorro = records.filter((r) => r.status === "AHORRO").length;
  const enPresupuesto = records.filter((r) => r.status === "EN PRESUPUESTO").length;

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
        <span className="inline-block h-2 w-2 rounded-full bg-red-500" />
        <span className="text-slate-500">Sobrecosto: </span>
        <span className="font-semibold text-slate-800">
          {isLoading ? placeholder : sobrecosto}
        </span>
      </div>

      <div className="flex items-center gap-1.5">
        <span className="inline-block h-2 w-2 rounded-full bg-green-500" />
        <span className="text-slate-500">Ahorro: </span>
        <span className="font-semibold text-slate-800">
          {isLoading ? placeholder : ahorro}
        </span>
      </div>

      <div className="flex items-center gap-1.5">
        <span className="inline-block h-2 w-2 rounded-full bg-amber-400" />
        <span className="text-slate-500">Sin presupuesto: </span>
        <span className="font-semibold text-slate-800">
          {isLoading ? placeholder : sinPresupuesto}
        </span>
      </div>

      <div className="flex items-center gap-1.5">
        <span className="inline-block h-2 w-2 rounded-full bg-blue-400" />
        <span className="text-slate-500">En presupuesto: </span>
        <span className="font-semibold text-slate-800">
          {isLoading ? placeholder : enPresupuesto}
        </span>
      </div>

      {!isLoading && records.length > 0 && (
        <p className="ml-auto text-xs text-slate-400">
          Los cálculos provienen del backend; esta pantalla es de solo lectura.
        </p>
      )}
    </div>
  );
}
