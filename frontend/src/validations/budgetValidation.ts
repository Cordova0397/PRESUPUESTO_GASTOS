/**
 * Validaciones Zod para el presupuesto de gastos (T-030).
 *
 * Responsabilidad: primera línea de validación de UX en frontend.
 * Autoridad final: Pydantic v2 en backend.
 *
 * Reglas monetarias:
 * - Monto planificado: >= 0, máximo 2 decimales, coma o punto decimal.
 * - Monto real:        >  0, máximo 2 decimales, coma o punto decimal.
 * - No se usa parseFloat para decidir reglas de negocio.
 */
import { z } from "zod";

// ─── Constantes de rango (sincronizadas con backend) ─────────────────────────

export const YEAR_MIN = 2000;
export const YEAR_MAX = 2099;
export const MONTH_MIN = 1;
export const MONTH_MAX = 12;

// ─── Helpers internos: string-safe, sin parseFloat ───────────────────────────

function normalizeDecimalSeparator(value: string): string {
  return value.trim().replace(",", ".");
}

function isMoneyFormat(normalized: string): boolean {
  return /^\d+(\.\d{1,2})?$/.test(normalized);
}

/**
 * Detecta si el monto normalizado es cero, comparando partes de string.
 * "0", "0.0", "0.00", "00" → true.  "0.01", "1" → false.
 */
function isZeroMoney(normalized: string): boolean {
  const [intPart, decPart = ""] = normalized.split(".");
  return /^0+$/.test(intPart) && (decPart === "" || /^0+$/.test(decPart));
}

function normalizeMoneyToTwoDecimals(normalized: string): string {
  const [intPart, decPart = ""] = normalized.split(".");
  return `${intPart}.${(decPart + "00").slice(0, 2)}`;
}

// ─── Schemas de monto ────────────────────────────────────────────────────────

/**
 * Monto planificado como string. Acepta 0.
 * Cadena vacía es válida (celda nueva no guardada).
 * Normaliza a "X.YY" con punto decimal.
 */
export const plannedAmountInputSchema = z
  .string()
  .superRefine((val, ctx) => {
    const trimmed = val.trim();
    if (trimmed === "") return; // celda nueva vacía: se omite al guardar
    const normalized = normalizeDecimalSeparator(trimmed);
    if (!isMoneyFormat(normalized)) {
      ctx.addIssue({ code: "custom" as const, message: "El monto debe tener máximo 2 decimales." });
    }
  })
  .transform((val) => {
    const trimmed = val.trim();
    if (trimmed === "") return "";
    return normalizeMoneyToTwoDecimals(normalizeDecimalSeparator(trimmed));
  });

/**
 * Monto real como string. Exige > 0.
 * Cadena vacía es inválida. Cero es inválido.
 * Normaliza a "X.YY" con punto decimal.
 */
export const actualAmountInputSchema = z
  .string()
  .min(1, { message: "Ingresa un monto válido mayor a cero." })
  .superRefine((val, ctx) => {
    const normalized = normalizeDecimalSeparator(val.trim());
    if (!isMoneyFormat(normalized)) {
      ctx.addIssue({ code: "custom" as const, message: "El monto debe tener máximo 2 decimales." });
      return;
    }
    if (isZeroMoney(normalized)) {
      ctx.addIssue({ code: "custom" as const, message: "Ingresa un monto válido mayor a cero." });
    }
  })
  .transform((val) => {
    return normalizeMoneyToTwoDecimals(normalizeDecimalSeparator(val.trim()));
  });

// ─── Schema de celda individual en la matriz de planificados ─────────────────

/**
 * Valida el valor de una celda de planificados.
 * Mismo comportamiento que plannedAmountInputSchema pero con mensaje
 * compacto "Monto inválido" para el tooltip de la celda.
 */
export const plannedExpenseCellSchema = z
  .string()
  .superRefine((val, ctx) => {
    const trimmed = val.trim();
    if (trimmed === "") return;
    const normalized = normalizeDecimalSeparator(trimmed);
    if (!isMoneyFormat(normalized)) {
      ctx.addIssue({ code: "custom" as const, message: "Monto inválido" });
    }
  })
  .transform((val) => {
    const trimmed = val.trim();
    if (trimmed === "") return "";
    return normalizeMoneyToTwoDecimals(normalizeDecimalSeparator(trimmed));
  });

// ─── Helpers internos para IDs de formulario ─────────────────────────────────

const costCenterIdFormSchema = z
  .string()
  .min(1, { message: "Selecciona un centro de costo." })
  .regex(/^\d+$/, { message: "Selecciona un centro de costo." })
  .transform(Number)
  .pipe(
    z.number().int().positive({ message: "Selecciona un centro de costo." }),
  );

const expenseConceptIdFormSchema = z
  .string()
  .min(1, { message: "Selecciona un concepto de gasto." })
  .regex(/^\d+$/, { message: "Selecciona un concepto de gasto." })
  .transform(Number)
  .pipe(
    z.number().int().positive({ message: "Selecciona un concepto de gasto." }),
  );

// ─── Schema del formulario de gasto real ─────────────────────────────────────

/**
 * Valida y transforma el FormState del formulario de gasto real.
 *
 * Input:  todos los campos como string (estado del formulario React).
 * Output: payload tipado listo para enviar al backend.
 */
export const actualExpenseFormSchema = z
  .object({
    expense_date: z.string().min(1, { message: "La fecha es obligatoria." }),
    cost_center_id: costCenterIdFormSchema,
    expense_concept_id: expenseConceptIdFormSchema,
    amount: actualAmountInputSchema,
    supplier: z.string(),
    document_number: z.string(),
    description: z.string(),
    notes: z.string(),
  })
  .transform((data) => ({
    expense_date: data.expense_date,
    cost_center_id: data.cost_center_id,
    expense_concept_id: data.expense_concept_id,
    amount: data.amount,
    supplier: data.supplier.trim() || null,
    document_number: data.document_number.trim() || null,
    description: data.description.trim() || null,
    notes: data.notes.trim() || null,
  }));

// ─── Schemas de filtros ───────────────────────────────────────────────────────

export const yearStringSchema = z
  .string()
  .regex(/^\d+$/, { message: "El año debe estar entre 2000 y 2099." })
  .transform(Number)
  .pipe(
    z
      .number()
      .int()
      .min(YEAR_MIN, { message: "El año debe estar entre 2000 y 2099." })
      .max(YEAR_MAX, { message: "El año debe estar entre 2000 y 2099." }),
  );

export const monthStringSchema = z
  .string()
  .regex(/^\d+$/, { message: "El mes debe estar entre 1 y 12." })
  .transform(Number)
  .pipe(
    z
      .number()
      .int()
      .min(MONTH_MIN, { message: "El mes debe estar entre 1 y 12." })
      .max(MONTH_MAX, { message: "El mes debe estar entre 1 y 12." }),
  );

export const positiveIdStringSchema = z
  .string()
  .min(1, { message: "Selecciona una opción." })
  .transform(Number)
  .pipe(
    z.number().int().positive({ message: "El ID debe ser un entero positivo." }),
  );

// Variantes opcionales para campos de filtro que pueden quedar vacíos
export const optionalYearStringSchema = z.string().optional();
export const optionalMonthStringSchema = z.string().optional();
export const optionalPositiveIdStringSchema = z.string().optional();

// ─── Helpers derivados para PlannedExpensesPage ───────────────────────────────

/**
 * Valida si un valor de celda en la matriz de planificados es aceptable.
 *
 * @param rawValue       - Valor crudo del input (puede tener coma decimal)
 * @param hasExistingRecord - true si ya existe un registro en BD para esta celda
 * @returns true si el valor es aceptable, false si hay error
 */
export function validatePlannedCellValue(
  rawValue: string,
  hasExistingRecord: boolean,
): boolean {
  const trimmed = rawValue.trim();
  if (trimmed === "") return !hasExistingRecord; // existente vacío es error
  const normalized = normalizeDecimalSeparator(trimmed);
  return isMoneyFormat(normalized);
}

/**
 * Normaliza el valor de una celda planificada para enviar al backend.
 *
 * @returns String normalizado "X.YY" con punto decimal, o null si vacío/inválido
 */
export function normalizePlannedCellValue(rawValue: string): string | null {
  const trimmed = rawValue.trim();
  if (trimmed === "") return null;
  const normalized = normalizeDecimalSeparator(trimmed);
  if (!isMoneyFormat(normalized)) return null;
  return normalizeMoneyToTwoDecimals(normalized);
}
