import { PageHeader } from "../components/layout/PageHeader";

const actualColumns = [
  "Fecha",
  "Centro de costo",
  "Categoría",
  "Descripción",
  "Importe"
];

export function ActualExpensesPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Gastos reales"
        description="Registro transaccional de gastos ejecutados."
        badge="Sin integración"
      />

      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <article className="overflow-hidden rounded-[28px] border border-slate-200/80 bg-white/95 shadow-panel">
          <div className="border-b border-slate-200 px-6 py-5">
            <h2 className="text-lg font-semibold text-slate-950">
              Estructura prevista del registro
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Placeholder de tabla para la futura carga de ejecución presupuestal.
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500">
                <tr>
                  {actualColumns.map((column) => (
                    <th key={column} className="px-6 py-4 font-semibold">
                      {column}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: 4 }).map((_, index) => (
                  <tr key={index} className="border-t border-slate-100">
                    {actualColumns.map((column) => (
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

        <article className="rounded-[28px] border border-slate-200/80 bg-sand p-6 shadow-panel">
          <h2 className="text-lg font-semibold text-slate-950">
            Qué se deja preparado
          </h2>
          <ul className="mt-4 space-y-3 text-sm leading-7 text-slate-700">
            <li>Espacio para filtros por fecha, categoría y centro de costo.</li>
            <li>Bloque listo para futura conexión con backend y validaciones.</li>
            <li>No se implementa formulario funcional ni cálculo agregado.</li>
          </ul>
        </article>
      </section>
    </div>
  );
}
