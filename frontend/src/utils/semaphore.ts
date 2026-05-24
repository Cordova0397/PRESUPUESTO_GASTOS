/**
 * Semáforos visuales derivados para UI.
 * No reemplaza reglas financieras del backend.
 *
 * Se derivan de `status` y `deviation_percentage` calculados por backend.
 * El umbral de 10 % es visual inicial del MVP (ratio 0.10 sobre el planificado).
 */

export type TrafficLightStatus =
  | "OK"
  | "ALERTA"
  | "CRÍTICO"
  | "SIN PRESUPUESTO";

/**
 * Determina el semáforo visual a partir del estado y el porcentaje de desviación.
 *
 * Reglas:
 * - "SIN PRESUPUESTO" → SIN PRESUPUESTO
 * - "AHORRO" o "EN PRESUPUESTO" → OK
 * - "SOBRECOSTO":
 *     deviation_percentage >= 0.10  → CRÍTICO
 *     deviation_percentage >  0.00  → ALERTA
 *     fallback                      → ALERTA
 * - cualquier otro status           → ALERTA
 *
 * deviation_percentage viene como ratio decimal desde backend ("0.1000" = 10 %).
 * Se convierte a Number solo para comparar el umbral visual; no se usa en cálculos
 * financieros ni se persiste.
 */
export function getTrafficLightStatus(params: {
  status: string;
  deviationPercentage: string | null;
}): TrafficLightStatus {
  const { status, deviationPercentage } = params;

  if (status === "SIN PRESUPUESTO") return "SIN PRESUPUESTO";
  if (status === "AHORRO" || status === "EN PRESUPUESTO") return "OK";

  if (status === "SOBRECOSTO") {
    const pct = Number(deviationPercentage);
    if (Number.isFinite(pct) && pct >= 0.10) return "CRÍTICO";
    if (Number.isFinite(pct) && pct > 0) return "ALERTA";
    return "ALERTA";
  }

  // Fallback defensivo para status desconocido
  return "ALERTA";
}
