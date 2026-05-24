import { apiFetch } from "./apiClient";
import type { ExpenseVariance, ExpenseVarianceFilters } from "../types/report";

/**
 * Obtiene la desviacion de gastos desde GET /api/reports/variance.
 *
 * Los montos y porcentajes vienen como string (Decimal serializado por FastAPI).
 * Esta funcion no realiza calculos; solo transporta los datos del backend.
 */
export function getExpenseVariance(
  filters: ExpenseVarianceFilters = {},
): Promise<ExpenseVariance[]> {
  const params = new URLSearchParams();
  if (filters.year !== undefined) params.set("year", String(filters.year));
  if (filters.month !== undefined) params.set("month", String(filters.month));
  if (filters.cost_center_id !== undefined)
    params.set("cost_center_id", String(filters.cost_center_id));
  if (filters.expense_concept_id !== undefined)
    params.set("expense_concept_id", String(filters.expense_concept_id));

  const qs = params.toString();
  return apiFetch<ExpenseVariance[]>(`/api/reports/variance${qs ? `?${qs}` : ""}`);
}
