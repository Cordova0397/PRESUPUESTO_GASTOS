import { PageHeader } from "../components/layout/PageHeader";

const summaryCards = [
  {
    title: "Presupuesto planificado",
    value: "Pendiente",
    description:
      "Base preparada para futuros acumulados por año, mes y centro de costo."
  },
  {
    title: "Gastos reales",
    value: "Pendiente",
    description: "Espacio reservado para la ejecución registrada desde operaciones."
  },
  {
    title: "Desviación total",
    value: "Pendiente",
    description:
      "Se mostrará cuando exista cálculo conectado entre planificado y real."
  },
  {
    title: "Ejecución presupuestal",
    value: "Pendiente",
    description: "Indicador visual para el seguimiento del uso del presupuesto."
  }
];

export function DashboardPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="Resumen inicial del control presupuestal."
        badge="Base MVP"
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {summaryCards.map((card) => (
          <article
            key={card.title}
            className="rounded-[28px] border border-white/60 bg-sand p-6 shadow-panel"
          >
            <p className="text-sm font-medium text-slate-500">{card.title}</p>
            <p className="mt-6 text-3xl font-semibold tracking-tight text-slate-950">
              {card.value}
            </p>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              {card.description}
            </p>
          </article>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <article className="rounded-[28px] border border-slate-200/80 bg-white/95 p-6 shadow-panel">
          <h2 className="text-xl font-semibold text-slate-950">
            Estado del tablero inicial
          </h2>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">
            Esta vista deja lista la navegación del MVP y el espacio para futuros
            indicadores, sin consumir API ni mostrar datos reales todavía.
          </p>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl bg-mist p-4">
              <p className="text-sm font-semibold text-slate-900">Planificación</p>
              <p className="mt-2 text-sm text-slate-600">
                Próxima fase: formularios y filtros base.
              </p>
            </div>
            <div className="rounded-2xl bg-mist p-4">
              <p className="text-sm font-semibold text-slate-900">Ejecución</p>
              <p className="mt-2 text-sm text-slate-600">
                Próxima fase: registro de gastos reales.
              </p>
            </div>
            <div className="rounded-2xl bg-mist p-4">
              <p className="text-sm font-semibold text-slate-900">Análisis</p>
              <p className="mt-2 text-sm text-slate-600">
                Próxima fase: gráficos y comparativos con datos.
              </p>
            </div>
          </div>
        </article>

        <article className="rounded-[28px] border border-brand-200/70 bg-brand-50 p-6 shadow-panel">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-700">
            Regla principal
          </p>
          <h2 className="mt-3 text-2xl font-semibold text-slate-950">
            Desviación monetaria
          </h2>
          <p className="mt-4 rounded-2xl bg-white/80 px-4 py-5 text-lg font-semibold text-brand-800">
            Desviación = gasto real - gasto planificado
          </p>
          <p className="mt-4 text-sm leading-7 text-slate-600">
            La fórmula queda visible desde el dashboard para alinear el MVP con la
            regla del negocio desde el inicio.
          </p>
        </article>
      </section>
    </div>
  );
}
