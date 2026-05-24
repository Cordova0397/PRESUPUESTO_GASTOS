export function getCurrentYearInLima(): number {
  return parseInt(
    new Intl.DateTimeFormat("es-PE", { timeZone: "America/Lima", year: "numeric" }).format(
      new Date(),
    ),
    10,
  );
}
