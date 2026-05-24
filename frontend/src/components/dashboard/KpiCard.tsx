type Props = {
  title: string;
  value: string;
  description: string;
  tone?: "neutral" | "positive" | "negative" | "warning";
  isLoading?: boolean;
};

const TONE_STYLES: Record<
  NonNullable<Props["tone"]>,
  { card: string; value: string }
> = {
  neutral: {
    card: "border-white/60 bg-sand",
    value: "text-slate-950",
  },
  positive: {
    card: "border-green-200/70 bg-green-50",
    value: "text-green-800",
  },
  negative: {
    card: "border-red-200/70 bg-red-50",
    value: "text-red-800",
  },
  warning: {
    card: "border-amber-200/70 bg-amber-50",
    value: "text-amber-800",
  },
};

export function KpiCard({
  title,
  value,
  description,
  tone = "neutral",
  isLoading = false,
}: Props) {
  const styles = TONE_STYLES[tone];

  if (isLoading) {
    return (
      <article className={`rounded-[28px] border ${styles.card} p-6 shadow-panel`}>
        <div className="h-4 w-32 animate-pulse rounded bg-slate-200" />
        <div className="mt-6 h-9 w-40 animate-pulse rounded bg-slate-200" />
        <div className="mt-3 h-4 w-full animate-pulse rounded bg-slate-100" />
      </article>
    );
  }

  return (
    <article className={`rounded-[28px] border ${styles.card} p-6 shadow-panel`}>
      <p className="text-sm font-medium text-slate-500">{title}</p>
      <p className={`mt-6 text-3xl font-semibold tracking-tight ${styles.value}`}>
        {value}
      </p>
      <p className="mt-3 text-sm leading-6 text-slate-600">{description}</p>
    </article>
  );
}
