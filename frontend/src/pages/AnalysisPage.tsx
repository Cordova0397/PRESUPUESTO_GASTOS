import { PageHeader } from "../components/layout/PageHeader";

const analysisPanels = [
  "Resumen por centro de costo",
  "Comportamiento por concepto",
  "Vista por mes y año",
  "Señales clave de ejecución"
];

export function AnalysisPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Análisis de gastos"
        description="Vista resumida por centro, concepto, mes y año."
        badge="Placeholder"
      />

      <section className="grid gap-4 md:grid-cols-2">
        {analysisPanels.map((panel) => (
          <article
            key={panel}
            className="rounded-[28px] border border-slate-200/80 bg-white/95 p-6 shadow-panel"
          >
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-500">
              Panel
            </p>
            <h2 className="mt-3 text-xl font-semibold text-slate-950">{panel}</h2>
            <div className="mt-6 rounded-[24px] bg-slate-100 p-5">
              <div className="flex h-36 items-center justify-center rounded-[20px] border border-dashed border-slate-300 bg-white text-sm text-slate-400">
                Espacio reservado para análisis y visualizaciones futuras.
              </div>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}
