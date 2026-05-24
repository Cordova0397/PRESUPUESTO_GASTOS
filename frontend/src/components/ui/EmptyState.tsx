type Props = {
  title?: string;
  message: string;
  compact?: boolean;
};

export function EmptyState({ title, message, compact = false }: Props) {
  if (compact) {
    return (
      <div className="text-center">
        {title && <p className="mb-1 text-sm font-medium text-slate-500">{title}</p>}
        <p className="text-sm text-slate-400">{message}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center rounded-2xl bg-slate-50 py-12 text-center">
      {title && <p className="mb-1 text-sm font-medium text-slate-500">{title}</p>}
      <p className="text-sm text-slate-400">{message}</p>
    </div>
  );
}
