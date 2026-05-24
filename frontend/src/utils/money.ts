// ─── Helpers internos (sin parseFloat para reglas de negocio) ─────────────────

function _padToTwoDecimals(normalized: string): string {
  const [intPart, decPart = ""] = normalized.split(".");
  return `${intPart}.${(decPart + "00").slice(0, 2)}`;
}

/**
 * Detecta si el monto normalizado es cero.
 * Compara partes de string sin parseFloat.
 * "0", "0.0", "0.00" → true. "0.01", "1" → false.
 */
function _isZeroAmount(normalized: string): boolean {
  const [intPart, decPart = ""] = normalized.split(".");
  return /^0+$/.test(intPart) && (decPart === "" || /^0+$/.test(decPart));
}

/**
 * Normaliza un input de monto a string con 2 decimales y punto decimal.
 * Acepta coma o punto decimal. Acepta monto cero.
 * @returns String normalizado "X.YY", o null si inválido o vacío.
 */
export function normalizeMoneyInput(value: string): string | null {
  const trimmed = value.trim();
  if (trimmed === "") return null;
  const normalized = trimmed.replace(",", ".");
  if (!/^\d+(\.\d{1,2})?$/.test(normalized)) return null;
  return _padToTwoDecimals(normalized);
}

/**
 * Valida si el input es un monto planificado válido (>= 0) o vacío.
 * Cadena vacía es válida: celda nueva no guardada en planificados.
 */
export function isValidMoneyInput(value: string): boolean {
  const trimmed = value.trim();
  if (trimmed === "") return true;
  const normalized = trimmed.replace(",", ".");
  return /^\d+(\.\d{1,2})?$/.test(normalized);
}

/**
 * Valida si el input es un monto real válido (> 0).
 * Cadena vacía es inválida. Cero es inválido.
 */
export function isValidPositiveMoneyInput(value: string): boolean {
  const trimmed = value.trim();
  if (trimmed === "") return false;
  const normalized = trimmed.replace(",", ".");
  if (!/^\d+(\.\d{1,2})?$/.test(normalized)) return false;
  return !_isZeroAmount(normalized);
}

/**
 * Formatea un monto para visualización en español peruano.
 * parseFloat se usa SOLO para presentación visual, no para reglas de negocio.
 */
export function formatMoneyForDisplay(value: string | number): string {
  const num = typeof value === "string" ? parseFloat(value) : value;
  if (isNaN(num)) return "0.00";
  return num.toLocaleString("es-PE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}
