export function normalizeMoneyInput(value: string): string | null {
  const normalized = value.trim().replace(",", ".");
  if (normalized === "") return null;
  if (!/^\d+(\.\d{1,2})?$/.test(normalized)) return null;
  const num = parseFloat(normalized);
  if (isNaN(num) || num < 0) return null;
  return num.toFixed(2);
}

export function isValidMoneyInput(value: string): boolean {
  if (value.trim() === "") return true;
  const normalized = value.trim().replace(",", ".");
  if (!/^\d+(\.\d{1,2})?$/.test(normalized)) return false;
  const num = parseFloat(normalized);
  return !isNaN(num) && num >= 0;
}

export function formatMoneyForDisplay(value: string | number): string {
  const num = typeof value === "string" ? parseFloat(value) : value;
  if (isNaN(num)) return "0.00";
  return num.toLocaleString("es-PE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}
