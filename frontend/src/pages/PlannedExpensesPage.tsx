import { PageHeader } from "../components/layout/PageHeader";

const plannedColumns = ["Año", "Mes", "Centro de costo", "Concepto", "Monto"];

export function PlannedExpensesPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Gastos planificados"
        description="Registro de presupuesto por año, mes, centro de costo y concepto."
        badge="Sin CRUD"
      />

      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <article className="overflow-hidden rounded-[28px] border border-slate-200/80 bg-white/95 shadow-panel">
          <div className="border-b border-slate-200 px-6 py-5">
            <h2 className="text-lg font-semibold text-slate-950">
              Estructura prevista del registro
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Placeholder de tabla para la futura planificación presupuestal.
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500">
                <tr>
                  {plannedColumns.map((column) => (
                    <th key={column} className="px-6 py-4 font-semibold">
                      {column}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: 4 }).map((_, index) => (
                  <tr key={index} className="border-t border-slate-100">
                    {plannedColumns.map((column) => (
                      <td key={column} className="px-6 py-4 text-slate-400">
                        Próximamente
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>

        <article className="rounded-[28px] border border-slate-200/80 bg-mist p-6 shadow-panel">
          <h2 className="text-lg font-semibold text-slate-950">
            Alcance de esta pantalla
          </h2>
          <ul className="mt-4 space-y-3 text-sm leading-7 text-slate-700">
            <li>Diseño base listo para recibir filtros, tabla y formulario.</li>
            <li>No hay conexión a API ni persistencia en esta tarea.</li>
            <li>El texto visible se mantiene en español y preparado para UTF-8.</li>
          </ul>
        </article>
      </section>
    </div>
  );
}
