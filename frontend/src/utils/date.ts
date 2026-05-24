export function getCurrentYearInLima(): number {
  return parseInt(
    new Intl.DateTimeFormat("es-PE", { timeZone: "America/Lima", year: "numeric" }).format(
      new Date(),
    ),
    10,
  );
}

/** Devuelve la fecha de hoy en America/Lima como string YYYY-MM-DD. */
export function getTodayDateInLima(): string {
  const now = new Date();
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Lima",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);
  const map: Record<string, string> = {};
  for (const p of parts) map[p.type] = p.value;
  return `${map.year}-${map.month}-${map.day}`;
}
