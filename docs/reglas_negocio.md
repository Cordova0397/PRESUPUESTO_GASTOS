# Reglas de negocio MVP

## Regla principal

`desviación monetaria = gasto real - gasto planificado`

## Interpretación

- Positivo: se gastó más de lo presupuestado.
- Negativo: se gastó menos de lo presupuestado.
- Cero: el gasto coincide con lo planificado.

## Porcentaje de desviación

El porcentaje se expresa como **ratio decimal** (no como porcentaje multiplicado por 100).

| Condición | `deviation_percentage` |
|---|---|
| `planificado > 0` | `(real - planificado) / planificado` con 4 decimales |
| `planificado = 0` y `real = 0` | `0.0000` |
| `planificado = 0` y `real > 0` | `null` — sin presupuesto definido |

Ejemplo: `planned = 1000, actual = 1200` → `deviation_percentage = 0.2000` (equivale a 20 %).

## Estados de desviación

| Estado | Condición |
|---|---|
| `SIN PRESUPUESTO` | `planned_amount = 0` y `actual_amount > 0` |
| `SOBRECOSTO` | `planned_amount > 0` y `deviation_amount > 0` |
| `AHORRO` | `planned_amount > 0` y `deviation_amount < 0` |
| `EN PRESUPUESTO` | `deviation_amount = 0` y no aplica `SIN PRESUPUESTO` |

El estado no se almacena en base de datos; se calcula en tiempo de consulta.

## Origen de datos

- El gasto planificado se registra en `planned_expenses`.
- El gasto real se registra en `actual_expenses`.
- La desviación no se guarda como tabla principal.
- El análisis no se guarda como tabla principal.
- El dashboard consume agregados calculados desde gastos planificados y gastos reales.

## Reglas de montos

- Los montos de dinero deben almacenarse con `DECIMAL(14,2)`.
- No usar `FLOAT` ni `DOUBLE` para dinero.
- El MVP trabaja en soles de Perú como moneda funcional.

## Análisis por centro y periodo

El endpoint `GET /api/reports/analysis` calcula un resumen por `(year, month, cost_center_id)`.

- Los datos se derivan de los registros de `planned_expenses` y `actual_expenses`.
- `planned_amount` y `actual_amount` son **sumas consolidadas** de todos los conceptos del centro en el periodo.
- `deviation_amount = actual_amount - planned_amount` (calculado sobre los totales del grupo).
- `deviation_percentage` se calcula sobre los totales consolidados del grupo, **no como promedio de porcentajes por concepto**.
- Los estados (`SIN PRESUPUESTO`, `SOBRECOSTO`, `AHORRO`, `EN PRESUPUESTO`) se determinan con las mismas reglas que la desviación por concepto, pero aplicadas al total del grupo.
- El análisis no se almacena en base de datos; se calcula en tiempo de consulta.

## Zona horaria del negocio

- La zona horaria oficial del negocio es `America/Lima`.
- Las fechas funcionales deben representar el negocio en zona horaria de Perú.
- No se debe asumir UTC como fecha funcional para reportes.
- En gastos reales, `year` y `month` deben derivarse o validarse contra `expense_date` según `America/Lima`.
