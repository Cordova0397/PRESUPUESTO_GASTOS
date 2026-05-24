import type { TrafficLightStatus } from "../../utils/semaphore";

type Props = {
  value: TrafficLightStatus;
};

type BadgeStyle = {
  dot: string;
  badge: string;
  label: string;
};

const STYLES: Record<TrafficLightStatus, BadgeStyle> = {
  OK: {
    dot: "bg-green-500",
    badge: "bg-green-50 text-green-700 border border-green-200",
    label: "OK",
  },
  ALERTA: {
    dot: "bg-amber-400",
    badge: "bg-amber-50 text-amber-700 border border-amber-200",
    label: "ALERTA",
  },
  CRÍTICO: {
    dot: "bg-red-500",
    badge: "bg-red-50 text-red-700 border border-red-200",
    label: "CRÍTICO",
  },
  "SIN PRESUPUESTO": {
    dot: "bg-orange-400",
    badge: "bg-orange-50 text-orange-700 border border-orange-200",
    label: "SIN PRESUPUESTO",
  },
};

export function SemaphoreBadge({ value }: Props) {
  const style = STYLES[value];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${style.badge}`}
    >
      <span className={`inline-block h-1.5 w-1.5 rounded-full ${style.dot}`} />
      {style.label}
    </span>
  );
}
