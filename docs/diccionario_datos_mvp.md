# Diccionario de datos MVP

Este diccionario describe los campos sugeridos para el modelo de datos MVP. Los tipos están pensados para MySQL y deberán reflejarse en modelos SQLAlchemy y migraciones Alembic en una tarea posterior.

La moneda funcional del MVP es soles de Perú. Los montos deben almacenarse con `DECIMAL(14,2)` y nunca con `FLOAT` ni `DOUBLE`.

## Tabla `cost_centers`

| Campo | Tipo sugerido MySQL | Requerido | Regla u observación |
| --- | --- | --- | --- |
| `id` | `BIGINT UNSIGNED` | Sí | Llave primaria autoincremental. Identifica de forma estable el centro de costo. |
| `code` | `VARCHAR(30)` | Sí | Código corto único. Debe facilitar búsquedas y referencias operativas. |
| `name` | `VARCHAR(150)` | Sí | Nombre visible del centro de costo. |
| `description` | `TEXT` | No | Descripción opcional del centro de costo. |
| `color` | `VARCHAR(30)` | No | Color opcional para UI. Puede guardar valores como `#2563eb`. |
| `sort_order` | `INT` | No | Orden de visualización opcional. |
| `is_active` | `BOOLEAN` | Sí | Indica si el centro está activo. Valor por defecto `true`. |
| `created_at` | `DATETIME` | Sí | Fecha/hora de creación del registro. |
| `updated_at` | `DATETIME` | Sí | Fecha/hora de última actualización del registro. |

Restricciones recomendadas:

- PK sobre `id`.
- Unique sobre `code`.

## Tabla `expense_concepts`

| Campo | Tipo sugerido MySQL | Requerido | Regla u observación |
| --- | --- | --- | --- |
| `id` | `BIGINT UNSIGNED` | Sí | Llave primaria autoincremental. |
| `cost_center_id` | `BIGINT UNSIGNED` | Sí | Llave foránea hacia `cost_centers.id`. |
| `code` | `VARCHAR(30)` | Sí | Código corto del concepto dentro de su centro de costo. |
| `name` | `VARCHAR(150)` | Sí | Nombre visible del concepto o categoría de gasto. |
| `description` | `TEXT` | No | Descripción opcional del concepto. |
| `sort_order` | `INT` | No | Orden de visualización opcional. |
| `is_active` | `BOOLEAN` | Sí | Indica si el concepto está activo. Valor por defecto `true`. |
| `created_at` | `DATETIME` | Sí | Fecha/hora de creación del registro. |
| `updated_at` | `DATETIME` | Sí | Fecha/hora de última actualización del registro. |

Restricciones recomendadas:

- PK sobre `id`.
- FK `cost_center_id` hacia `cost_centers.id`.
- Índice sobre `cost_center_id`.
- Unique sobre `cost_center_id, code`.

## Tabla `planned_expenses`

| Campo | Tipo sugerido MySQL | Requerido | Regla u observación |
| --- | --- | --- | --- |
| `id` | `BIGINT UNSIGNED` | Sí | Llave primaria autoincremental. |
| `year` | `SMALLINT UNSIGNED` | Sí | Año funcional del presupuesto. |
| `month` | `TINYINT UNSIGNED` | Sí | Mes funcional del presupuesto. Debe estar entre 1 y 12. |
| `cost_center_id` | `BIGINT UNSIGNED` | Sí | Llave foránea hacia `cost_centers.id`. |
| `expense_concept_id` | `BIGINT UNSIGNED` | Sí | Llave foránea hacia `expense_concepts.id`. |
| `amount` | `DECIMAL(14,2)` | Sí | Monto planificado. Debe ser mayor o igual que 0. |
| `notes` | `TEXT` | No | Notas opcionales sobre la planificación. |
| `created_at` | `DATETIME` | Sí | Fecha/hora de creación del registro. |
| `updated_at` | `DATETIME` | Sí | Fecha/hora de última actualización del registro. |

Restricciones recomendadas:

- PK sobre `id`.
- FK `cost_center_id` hacia `cost_centers.id`.
- FK `expense_concept_id` hacia `expense_concepts.id`.
- Unique sobre `year, month, cost_center_id, expense_concept_id`.
- Índice sobre `year, month`.

Reglas específicas:

- No debe existir más de una planificación para el mismo año, mes, centro de costo y concepto.
- `expense_concept_id` debe pertenecer al mismo `cost_center_id`.

## Tabla `actual_expenses`

| Campo | Tipo sugerido MySQL | Requerido | Regla u observación |
| --- | --- | --- | --- |
| `id` | `BIGINT UNSIGNED` | Sí | Llave primaria autoincremental. |
| `expense_date` | `DATE` | Sí | Fecha funcional del gasto según `America/Lima`. |
| `year` | `SMALLINT UNSIGNED` | Sí | Año funcional derivado o validado contra `expense_date`. |
| `month` | `TINYINT UNSIGNED` | Sí | Mes funcional derivado o validado contra `expense_date`. Debe estar entre 1 y 12. |
| `cost_center_id` | `BIGINT UNSIGNED` | Sí | Llave foránea hacia `cost_centers.id`. |
| `expense_concept_id` | `BIGINT UNSIGNED` | Sí | Llave foránea hacia `expense_concepts.id`. |
| `amount` | `DECIMAL(14,2)` | Sí | Monto real. Debe ser mayor que 0. |
| `supplier` | `VARCHAR(150)` | No | Proveedor opcional. |
| `document_number` | `VARCHAR(80)` | No | Número de documento opcional. |
| `description` | `TEXT` | No | Descripción opcional del gasto. |
| `notes` | `TEXT` | No | Notas internas opcionales. |
| `created_at` | `DATETIME` | Sí | Fecha/hora de creación del registro. |
| `updated_at` | `DATETIME` | Sí | Fecha/hora de última actualización del registro. |

Restricciones recomendadas:

- PK sobre `id`.
- FK `cost_center_id` hacia `cost_centers.id`.
- FK `expense_concept_id` hacia `expense_concepts.id`.
- Índice sobre `expense_date`.
- Índice sobre `year, month`.
- Índice sobre `cost_center_id, expense_concept_id`.
- Índice compuesto sobre `year, month, cost_center_id`.

Reglas específicas:

- Se permiten múltiples gastos reales para el mismo año, mes, centro de costo y concepto.
- `year` y `month` deben ser consistentes con `expense_date` usando la fecha funcional de Perú.
- `expense_concept_id` debe pertenecer al mismo `cost_center_id`.

## Campos no incluidos en el MVP

Los siguientes campos no se incluyen todavía para mantener el MVP acotado:

- `company_id` o multiempresa.
- `currency` o moneda por registro.
- Campos de auditoría avanzada como `created_by`, `updated_by` o trazabilidad de cambios.
- Campos de aprobación.
- Campos de adjuntos o comprobantes digitales.
- Campos persistidos de desviación o análisis.
