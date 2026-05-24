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

## Semáforos visuales del MVP

Los semáforos son presentación frontend; no se almacenan en base de datos y no reemplazan las reglas financieras del backend. Se derivan de `status` y `deviation_percentage` calculados por backend.

| Semáforo | Condición |
|---|---|
| `SIN PRESUPUESTO` | `status = "SIN PRESUPUESTO"` |
| `CRÍTICO` | `status = "SOBRECOSTO"` y `deviation_percentage >= 0.1000` |
| `ALERTA` | `status = "SOBRECOSTO"` y `0 < deviation_percentage < 0.1000` |
| `OK` | `status = "AHORRO"` o `status = "EN PRESUPUESTO"` |

El umbral del 10 % (`0.1000` en ratio decimal) es el inicial del MVP y puede ajustarse sin modificar backend.

## Análisis por centro y periodo

El endpoint `GET /api/reports/analysis` calcula un resumen por `(year, month, cost_center_id)`.

- Los datos se derivan de los registros de `planned_expenses` y `actual_expenses`.
- `planned_amount` y `actual_amount` son **sumas consolidadas** de todos los conceptos del centro en el periodo.
- `deviation_amount = actual_amount - planned_amount` (calculado sobre los totales del grupo).
- `deviation_percentage` se calcula sobre los totales consolidados del grupo, **no como promedio de porcentajes por concepto**.
- Los estados (`SIN PRESUPUESTO`, `SOBRECOSTO`, `AHORRO`, `EN PRESUPUESTO`) se determinan con las mismas reglas que la desviación por concepto, pero aplicadas al total del grupo.
- El análisis no se almacena en base de datos; se calcula en tiempo de consulta.

## KPIs generales del presupuesto

El endpoint `GET /api/reports/kpis` devuelve un único objeto con los totales del presupuesto para el filtro indicado.

**Parámetros soportados:** `year`, `month`, `cost_center_id`.

- Si `cost_center_id` no se envía: consolida todos los centros de costo del filtro de año/mes.
- Si `cost_center_id` se envía: consolida solo ese centro de costo; el "global" es ese centro.
- `cost_center_id`: centro filtrado, o `null` si se consolidan todos los centros.
- `planned_amount_total`: suma de los gastos planificados del filtro.
- `actual_amount_total`: suma de los gastos reales del filtro.
- `deviation_amount_total = actual_amount_total - planned_amount_total`.
- `deviation_percentage`: ratio decimal con 4 decimales calculado sobre los totales del filtro.
- `execution_percentage`: ratio decimal con 4 decimales = `actual_amount_total / planned_amount_total`.
- `status`: estado calculado con las mismas reglas que `/variance` y `/analysis`.

Los porcentajes **no son promedios** de porcentajes por centro o concepto; se calculan sobre los totales consolidados del filtro.

| Condición | `deviation_percentage` | `execution_percentage` |
|---|---|---|
| `planned_total > 0` | `deviation_total / planned_total` con 4 dec. | `actual_total / planned_total` con 4 dec. |
| `planned_total = 0` y `actual_total = 0` | `0.0000` | `0.0000` |
| `planned_total = 0` y `actual_total > 0` | `null` | `null` |

El KPI no se almacena en base de datos; se calcula en tiempo de consulta.

## Validaciones MVP

### Rangos de dominio

| Campo | Regla | Origen |
|---|---|---|
| Año | 2000 – 2099 | `validation.py` / `budgetValidation.ts` |
| Mes | 1 – 12 | `validation.py` / `budgetValidation.ts` |
| ID centro de costo | entero > 0 | `PositiveId` / `positiveIdStringSchema` |
| ID concepto de gasto | entero > 0 | `PositiveId` / `positiveIdStringSchema` |

### Reglas de montos

| Contexto | Regla | Tipo en backend | Tipo en frontend |
|---|---|---|---|
| Planificado | `>= 0`, máximo 2 decimales | `DECIMAL(14,2)`, `ge=Decimal("0")` | string normalizado |
| Real | `> 0`, máximo 2 decimales | `DECIMAL(14,2)`, `gt=Decimal("0")` | string normalizado |

- Los montos **no se calculan con `float`** en ninguna capa.
- Frontend acepta coma o punto como separador decimal en el input.
- Frontend normaliza a string con punto decimal y dos decimales (`"X.YY"`) antes de enviar.
- Una celda planificada vacía (sin registro existente) se omite al guardar, no es error.
- Una celda planificada vacía (con registro existente en BD) es error; debe ingresar al menos `0`.

### Validación de pertenencia concepto-centro

El concepto de gasto debe pertenecer al centro de costo seleccionado.
Esta validación vive en los **servicios backend** (`planned_expense_service`, `actual_expense_service`) y no se puede eludir desde frontend.
El endpoint retorna HTTP 422 si el concepto no pertenece al centro.

### Arquitectura de validación

- **Frontend**: Zod (`budgetValidation.ts`) como primera línea de UX.
  Impide enviar payloads inválidos al backend.
- **Backend**: Pydantic v2 (`validation.py`, schemas individuales) como autoridad final.
  Rechaza cualquier petición inválida con HTTP 422 aunque el frontend haya fallado.
- Los query params de `/api/planned-expenses` y `/api/actual-expenses` incluyen `ge/le/gt` para año, mes e IDs.

## Zona horaria del negocio

- La zona horaria oficial del negocio es `America/Lima`.
- Las fechas funcionales deben representar el negocio en zona horaria de Perú.
- No se debe asumir UTC como fecha funcional para reportes.
- En gastos reales, `year` y `month` deben derivarse o validarse contra `expense_date` según `America/Lima`.
