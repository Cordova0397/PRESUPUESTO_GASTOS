import { apiFetch } from "./apiClient";
import type {
  ExpenseAnalysis,
  ExpenseAnalysisFilters,
  ExpenseKpis,
  ExpenseKpisFilters,
  ExpenseVariance,
  ExpenseVarianceFilters,
} from "../types/report";

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

/**
 * Obtiene el resumen de análisis por centro de costo desde GET /api/reports/analysis.
 *
 * Los montos y porcentajes vienen como string (Decimal serializado por FastAPI).
 * Esta funcion no realiza calculos; solo transporta los datos del backend.
 * No soporta expense_concept_id; el análisis es resumen por centro y periodo.
 */
export function getExpenseAnalysis(
  filters: ExpenseAnalysisFilters = {},
): Promise<ExpenseAnalysis[]> {
  const params = new URLSearchParams();
  if (filters.year !== undefined) params.set("year", String(filters.year));
  if (filters.month !== undefined) params.set("month", String(filters.month));
  if (filters.cost_center_id !== undefined)
    params.set("cost_center_id", String(filters.cost_center_id));

  const qs = params.toString();
  return apiFetch<ExpenseAnalysis[]>(`/api/reports/analysis${qs ? `?${qs}` : ""}`);
}

export function getExpenseKpis(
  filters: ExpenseKpisFilters = {},
): Promise<ExpenseKpis> {
  const params = new URLSearchParams();
  if (filters.year !== undefined) params.set("year", String(filters.year));
  if (filters.month !== undefined) params.set("month", String(filters.month));
  if (filters.cost_center_id !== undefined)
    params.set("cost_center_id", String(filters.cost_center_id));

  const qs = params.toString();
  return apiFetch<ExpenseKpis>(`/api/reports/kpis${qs ? `?${qs}` : ""}`);
}
