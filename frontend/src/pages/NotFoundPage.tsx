import { Link } from "react-router-dom";

export function NotFoundPage() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <section className="w-full max-w-2xl rounded-[32px] border border-slate-200/80 bg-white/95 p-8 text-center shadow-panel">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-700">
          Ruta no encontrada
        </p>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950">
          Esta pantalla no existe en el MVP actual.
        </h1>
        <p className="mt-4 text-base leading-7 text-slate-600">
          Verifica la URL o vuelve al dashboard para seguir navegando por las rutas
          base del proyecto.
        </p>
        <Link
          to="/dashboard"
          className="mt-6 inline-flex rounded-full bg-slate-950 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-800"
        >
          Ir al dashboard
        </Link>
      </section>
    </div>
  );
}
