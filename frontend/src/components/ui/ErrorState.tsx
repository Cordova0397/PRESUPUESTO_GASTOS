type Props = {
  title?: string;
  message: string;
  onRetry?: () => void;
  retryLabel?: string;
  compact?: boolean;
};

export function ErrorState({
  title = "No se pudo cargar la información",
  message,
  onRetry,
  retryLabel = "Reintentar",
  compact = false,
}: Props) {
  if (compact) {
    return (
      <div className="flex flex-wrap items-center gap-4 rounded-[20px] border border-red-200 bg-red-50 px-5 py-3">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-red-700">{title}</p>
          <p className="mt-0.5 text-sm text-red-600">{message}</p>
        </div>
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="shrink-0 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            {retryLabel}
          </button>
        )}
      </div>
    );
  }

  return (
    <section className="rounded-[24px] border border-red-200 bg-red-50 p-6">
      <p className="text-sm font-semibold text-red-700">{title}</p>
      <p className="mt-2 text-sm text-red-600">{message}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-4 rounded-xl bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700"
        >
          {retryLabel}
        </button>
      )}
    </section>
  );
}
