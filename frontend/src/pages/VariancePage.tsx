import { PageHeader } from "../components/layout/PageHeader";

export function VariancePage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Desviación de gastos"
        description="Comparación calculada entre gasto real y gasto planificado."
        badge="Regla visible"
      />

      <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <article className="rounded-[28px] border border-brand-200/70 bg-white/95 p-6 shadow-panel">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-700">
            Fórmula del negocio
          </p>
          <div className="mt-5 rounded-[24px] bg-brand-50 p-6">
            <p className="text-sm font-medium text-brand-700">
              La desviación monetaria siempre debe calcularse como:
            </p>
            <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
              Desviación = Real - Planificado
            </p>
          </div>
          <p className="mt-5 text-sm leading-7 text-slate-600">
            En esta fase solo se deja visible la regla para mantener consistencia
            funcional. Aún no hay cálculos, filtros ni datos conectados.
          </p>
        </article>

        <article className="rounded-[28px] border border-slate-200/80 bg-mist p-6 shadow-panel">
          <h2 className="text-lg font-semibold text-slate-950">
            Próxima evolución de la pantalla
          </h2>
          <div className="mt-4 space-y-4">
            <div className="rounded-2xl bg-white/80 p-4">
              <p className="text-sm font-semibold text-slate-900">
                Comparativos por periodo
              </p>
              <p className="mt-2 text-sm text-slate-600">
                Año, mes, centro y concepto con señales visuales de desvío.
              </p>
            </div>
            <div className="rounded-2xl bg-white/80 p-4">
              <p className="text-sm font-semibold text-slate-900">
                Alertas y priorización
              </p>
              <p className="mt-2 text-sm text-slate-600">
                Espacio preparado para resaltar desviaciones positivas y negativas.
              </p>
            </div>
          </div>
        </article>
      </section>
    </div>
  );
}
