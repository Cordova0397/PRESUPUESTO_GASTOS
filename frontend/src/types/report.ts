/**
 * Tipos para reportes de desviacion de gastos.
 *
 * Los montos se reciben como string desde el backend (Decimal serializado).
 * No recalcular desviacion ni porcentaje en frontend; usar los valores del backend.
 */

export type ExpenseVariance = {
  year: number;
  month: number;
  cost_center_id: number;
  cost_center_code: string | null;
  cost_center_name: string | null;
  expense_concept_id: number;
  expense_concept_code: string | null;
  expense_concept_name: string | null;
  planned_amount: string;
  actual_amount: string;
  deviation_amount: string;
  /** Ratio decimal con 4 decimales (ej. "0.2000" = 20 %). Null si planned = 0 y actual > 0. */
  deviation_percentage: string | null;
  status: "SIN PRESUPUESTO" | "SOBRECOSTO" | "AHORRO" | "EN PRESUPUESTO" | string;
};

export type ExpenseVarianceFilters = {
  year?: number;
  month?: number;
  cost_center_id?: number;
  expense_concept_id?: number;
};

/**
 * Resumen de desviacion consolidado por año, mes y centro de costo.
 * No incluye detalle por concepto; para eso usar ExpenseVariance.
 *
 * Los montos se reciben como string desde el backend (Decimal serializado).
 * No recalcular desviacion ni porcentaje en frontend; usar los valores del backend.
 */
export type ExpenseAnalysis = {
  year: number;
  month: number;
  cost_center_id: number;
  cost_center_code: string | null;
  cost_center_name: string | null;
  planned_amount: string;
  actual_amount: string;
  deviation_amount: string;
  /** Ratio decimal con 4 decimales (ej. "0.2000" = 20 %). Null si planned = 0 y actual > 0. */
  deviation_percentage: string | null;
  status: "SIN PRESUPUESTO" | "SOBRECOSTO" | "AHORRO" | "EN PRESUPUESTO" | string;
};

export type ExpenseAnalysisFilters = {
  year?: number;
  month?: number;
  cost_center_id?: number;
};

export type ExpenseKpis = {
  year: number | null;
  month: number | null;
  planned_amount_total: string;
  actual_amount_total: string;
  deviation_amount_total: string;
  deviation_percentage: string | null;
  execution_percentage: string | null;
  status: "SIN PRESUPUESTO" | "SOBRECOSTO" | "AHORRO" | "EN PRESUPUESTO" | string;
};

export type ExpenseKpisFilters = {
  year?: number;
  month?: number;
};
