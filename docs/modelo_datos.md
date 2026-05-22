# Modelo de datos MVP

## Resumen

El modelo de datos MVP de PRESUPUESTO GASTOS se centra en registrar el presupuesto base y la ejecución real de gastos por periodo, centro de costo y concepto de gasto.

Las entidades principales del MVP son:

- `cost_centers`: centros de costo.
- `expense_concepts`: conceptos o categorías de gasto asociados a centros de costo.
- `planned_expenses`: gastos planificados o presupuesto base.
- `actual_expenses`: gastos reales transaccionales.

La desviación, el análisis y el dashboard no se guardan como tablas principales en el MVP. Se calculan mediante consultas, servicios o agregados derivados desde `planned_expenses` y `actual_expenses`.

La zona horaria funcional del negocio es `America/Lima`. Las fechas funcionales deben interpretarse según Perú y no como UTC.

## Entidades MVP

### `cost_centers`

Representa centros de costo del presupuesto. Es un catálogo base para clasificar gastos planificados y reales.

### `expense_concepts`

Representa conceptos o categorías de gasto. Para el MVP, cada concepto pertenece a un único centro de costo.

### `planned_expenses`

Representa el presupuesto base por año, mes, centro de costo y concepto.

### `actual_expenses`

Representa la ejecución real de gastos. Es transaccional y permite múltiples registros para el mismo periodo, centro de costo y concepto.

## Diagrama relacional textual

```text
cost_centers 1 --- N expense_concepts
cost_centers 1 --- N planned_expenses
expense_concepts 1 --- N planned_expenses
cost_centers 1 --- N actual_expenses
expense_concepts 1 --- N actual_expenses

planned_expenses + actual_expenses
        |
        +-- cálculo de desviación
        +-- análisis de gastos
        +-- dashboard básico
```

## Tabla `cost_centers`

Propósito: representar centros de costo del presupuesto.

| Campo | Tipo sugerido MySQL | Requerido | Regla u observación |
| --- | --- | --- | --- |
| `id` | `BIGINT UNSIGNED` | Sí | Llave primaria autoincremental. |
| `code` | `VARCHAR(30)` | Sí | Código corto único. |
| `name` | `VARCHAR(150)` | Sí | Nombre visible del centro de costo. |
| `description` | `TEXT` | No | Descripción opcional. |
| `color` | `VARCHAR(30)` | No | Color opcional para UI, por ejemplo hexadecimal. |
| `sort_order` | `INT` | No | Orden sugerido de visualización. |
| `is_active` | `BOOLEAN` | Sí | Valor por defecto `true`. |
| `created_at` | `DATETIME` | Sí | Fecha/hora de creación. |
| `updated_at` | `DATETIME` | Sí | Fecha/hora de última actualización. |

Validaciones:

- `code` debe ser único.
- `name` es obligatorio.
- No eliminar físicamente si ya tiene conceptos, gastos planificados o gastos reales asociados.
- En fases futuras, usar `is_active` para ocultar centros de costo sin romper historial.

Índices y restricciones:

- Llave primaria: `id`.
- Restricción única: `uq_cost_centers_code` sobre `code`.

## Tabla `expense_concepts`

Propósito: representar conceptos o categorías de gasto asociadas a un centro de costo.

| Campo | Tipo sugerido MySQL | Requerido | Regla u observación |
| --- | --- | --- | --- |
| `id` | `BIGINT UNSIGNED` | Sí | Llave primaria autoincremental. |
| `cost_center_id` | `BIGINT UNSIGNED` | Sí | FK a `cost_centers.id`. |
| `code` | `VARCHAR(30)` | Sí | Código corto del concepto. |
| `name` | `VARCHAR(150)` | Sí | Nombre visible del concepto. |
| `description` | `TEXT` | No | Descripción opcional. |
| `sort_order` | `INT` | No | Orden sugerido de visualización. |
| `is_active` | `BOOLEAN` | Sí | Valor por defecto `true`. |
| `created_at` | `DATETIME` | Sí | Fecha/hora de creación. |
| `updated_at` | `DATETIME` | Sí | Fecha/hora de última actualización. |

Validaciones:

- `cost_center_id` es obligatorio.
- `name` es obligatorio.
- Para el MVP, un concepto pertenece a un único centro de costo.
- Se recomienda que `code` sea único por centro de costo mediante `unique(cost_center_id, code)`.
- La unicidad por centro permite reutilizar códigos simples en centros distintos sin forzar una nomenclatura global prematura.
- No eliminar físicamente si ya tiene gastos planificados o gastos reales asociados.
- En fases futuras, usar `is_active` para ocultar conceptos sin romper historial.

Índices y restricciones:

- Llave primaria: `id`.
- FK: `cost_center_id` hacia `cost_centers.id`.
- Índice: `ix_expense_concepts_cost_center_id` sobre `cost_center_id`.
- Restricción única recomendada: `uq_expense_concepts_cost_center_code` sobre `cost_center_id, code`.

## Tabla `planned_expenses`

Propósito: registrar gastos planificados por año, mes, centro de costo y concepto.

| Campo | Tipo sugerido MySQL | Requerido | Regla u observación |
| --- | --- | --- | --- |
| `id` | `BIGINT UNSIGNED` | Sí | Llave primaria autoincremental. |
| `year` | `SMALLINT UNSIGNED` | Sí | Año funcional del presupuesto. |
| `month` | `TINYINT UNSIGNED` | Sí | Mes funcional del presupuesto, valores de 1 a 12. |
| `cost_center_id` | `BIGINT UNSIGNED` | Sí | FK a `cost_centers.id`. |
| `expense_concept_id` | `BIGINT UNSIGNED` | Sí | FK a `expense_concepts.id`. |
| `amount` | `DECIMAL(14,2)` | Sí | Monto planificado. Nunca usar `FLOAT`. |
| `notes` | `TEXT` | No | Notas opcionales. |
| `created_at` | `DATETIME` | Sí | Fecha/hora de creación. |
| `updated_at` | `DATETIME` | Sí | Fecha/hora de última actualización. |

Validaciones:

- `year` es obligatorio.
- `month` debe estar entre 1 y 12.
- `amount` debe ser mayor o igual que 0.
- Los montos de dinero deben usar `DECIMAL(14,2)`, nunca `FLOAT` ni `DOUBLE`.
- Debe existir una única planificación por `year`, `month`, `cost_center_id` y `expense_concept_id`.
- `expense_concept_id` debe corresponder al `cost_center_id` seleccionado.

Índices y restricciones:

- Llave primaria: `id`.
- FK: `cost_center_id` hacia `cost_centers.id`.
- FK: `expense_concept_id` hacia `expense_concepts.id`.
- Restricción única recomendada: `uq_planned_expenses_period_center_concept` sobre `year, month, cost_center_id, expense_concept_id`.
- Índice: `ix_planned_expenses_year_month` sobre `year, month`.

## Tabla `actual_expenses`

Propósito: registrar gastos reales transaccionales.

| Campo | Tipo sugerido MySQL | Requerido | Regla u observación |
| --- | --- | --- | --- |
| `id` | `BIGINT UNSIGNED` | Sí | Llave primaria autoincremental. |
| `expense_date` | `DATE` | Sí | Fecha funcional del gasto según `America/Lima`. |
| `year` | `SMALLINT UNSIGNED` | Sí | Año funcional derivado o validado contra `expense_date`. |
| `month` | `TINYINT UNSIGNED` | Sí | Mes funcional derivado o validado contra `expense_date`, valores de 1 a 12. |
| `cost_center_id` | `BIGINT UNSIGNED` | Sí | FK a `cost_centers.id`. |
| `expense_concept_id` | `BIGINT UNSIGNED` | Sí | FK a `expense_concepts.id`. |
| `amount` | `DECIMAL(14,2)` | Sí | Monto real. Nunca usar `FLOAT`. |
| `supplier` | `VARCHAR(150)` | No | Proveedor opcional. |
| `document_number` | `VARCHAR(80)` | No | Número de documento opcional. |
| `description` | `TEXT` | No | Descripción opcional del gasto. |
| `notes` | `TEXT` | No | Notas opcionales. |
| `created_at` | `DATETIME` | Sí | Fecha/hora de creación. |
| `updated_at` | `DATETIME` | Sí | Fecha/hora de última actualización. |

Validaciones:

- `expense_date` es obligatoria.
- `year` y `month` deben derivarse de `expense_date` o validarse contra ella usando la fecha funcional en `America/Lima`.
- `month` debe estar entre 1 y 12.
- `amount` debe ser mayor que 0.
- Los montos de dinero deben usar `DECIMAL(14,2)`, nunca `FLOAT` ni `DOUBLE`.
- Se permiten múltiples gastos reales para el mismo año, mes, centro de costo y concepto.
- `expense_concept_id` debe corresponder al `cost_center_id` seleccionado.

Índices y restricciones:

- Llave primaria: `id`.
- FK: `cost_center_id` hacia `cost_centers.id`.
- FK: `expense_concept_id` hacia `expense_concepts.id`.
- Índice: `ix_actual_expenses_expense_date` sobre `expense_date`.
- Índice: `ix_actual_expenses_year_month` sobre `year, month`.
- Índice: `ix_actual_expenses_center_concept` sobre `cost_center_id, expense_concept_id`.
- Índice compuesto sugerido para reportes: `ix_actual_expenses_period_center` sobre `year, month, cost_center_id`.

## Índices y restricciones recomendadas

| Tabla | Índice o restricción | Campos | Propósito |
| --- | --- | --- | --- |
| `cost_centers` | Único | `code` | Evitar centros duplicados por código. |
| `expense_concepts` | Índice | `cost_center_id` | Consultar conceptos por centro de costo. |
| `expense_concepts` | Único | `cost_center_id, code` | Evitar conceptos duplicados dentro del mismo centro. |
| `planned_expenses` | Único | `year, month, cost_center_id, expense_concept_id` | Evitar doble presupuesto para el mismo periodo y concepto. |
| `planned_expenses` | Índice | `year, month` | Facilitar reportes por periodo. |
| `actual_expenses` | Índice | `expense_date` | Facilitar búsquedas por fecha. |
| `actual_expenses` | Índice | `year, month` | Facilitar reportes mensuales. |
| `actual_expenses` | Índice | `cost_center_id, expense_concept_id` | Facilitar reportes por clasificación. |
| `actual_expenses` | Índice | `year, month, cost_center_id` | Facilitar reportes por periodo y centro. |

## Reglas de integridad

- Todo gasto planificado debe pertenecer a un centro de costo existente.
- Todo gasto planificado debe pertenecer a un concepto existente.
- Todo gasto real debe pertenecer a un centro de costo existente.
- Todo gasto real debe pertenecer a un concepto existente.
- El concepto seleccionado debe pertenecer al centro de costo seleccionado.
- No debe duplicarse un gasto planificado para el mismo año, mes, centro de costo y concepto.
- Los gastos reales son transaccionales y pueden repetirse en un mismo periodo para el mismo centro y concepto.
- Los catálogos `cost_centers` y `expense_concepts` deben usar `is_active` para desactivar registros en fases futuras, evitando eliminar físicamente registros con historial.

## Reglas de cálculo derivadas

La desviación monetaria siempre se calcula como:

```text
gasto real - gasto planificado
```

Interpretación:

- Resultado positivo: se gastó más de lo presupuestado.
- Resultado negativo: se gastó menos de lo presupuestado.
- Resultado cero: coincide con el presupuesto.

Porcentaje de desviación:

- Si `planificado > 0`: `(real - planificado) / planificado`.
- Si `planificado = 0` y `real = 0`: porcentaje = `0`.
- Si `planificado = 0` y `real > 0`: estado = `SIN PRESUPUESTO`.

Reglas para reportes:

- El gasto planificado se toma desde `planned_expenses.amount`.
- El gasto real se obtiene sumando `actual_expenses.amount` por periodo, centro de costo y concepto.
- Los reportes de desviación deben comparar la planificación única contra el total real agregado.
- La pantalla de análisis debe consumir consultas o servicios derivados, no tablas persistidas de análisis.
- El dashboard debe consumir agregados calculados desde gastos planificados y reales.

## Decisiones del modelo

- Usar IDs autoincrementales enteros para el MVP.
- Usar `DECIMAL(14,2)` para dinero.
- No usar `FLOAT` ni `DOUBLE` en montos.
- Usar `year` y `month` explícitos para facilitar reportes.
- En gastos reales, validar que `year` y `month` coincidan con `expense_date` según `America/Lima`.
- No guardar desviación como tabla principal.
- No guardar análisis como tabla principal.
- No implementar multiempresa todavía.
- No implementar monedas múltiples todavía.
- El MVP trabaja en soles de Perú como moneda funcional.
- No implementar auditoría todavía.
- No implementar soft delete avanzado todavía.
- Dejar `is_active` solo en catálogos para permitir desactivación futura.
- Usar `America/Lima` como zona horaria funcional del negocio.

## Riesgos y supuestos

- Se asume que un concepto pertenece a un único centro de costo durante el MVP.
- Se asume que el MVP trabaja con una sola empresa o unidad de negocio.
- Se asume que todos los montos están expresados en soles de Perú.
- Cambios futuros como multiempresa, monedas múltiples, auditoría o aprobaciones requerirán extender el modelo.
- La consistencia entre `actual_expenses.expense_date`, `year` y `month` deberá implementarse en modelos, schemas, servicios o validaciones de base de datos en tareas posteriores.

## Fuera de alcance del modelo MVP

- Login.
- Roles y permisos.
- Auditoría.
- Aprobaciones.
- Adjuntos o comprobantes.
- Importación/exportación Excel avanzada.
- Multiempresa.
- Monedas múltiples.
- Tablas persistidas de desviación.
- Tablas persistidas de análisis.
- Modelos SQLAlchemy.
- Migraciones Alembic de tablas de negocio.
- CRUD.
- Endpoints de negocio.
- Formularios frontend.
- Seeds ejecutables.

## Criterios de aceptación del modelo

- El modelo incluye `cost_centers`, `expense_concepts`, `planned_expenses` y `actual_expenses`.
- Cada tabla tiene propósito, campos, tipos sugeridos, validaciones e índices.
- Los montos usan `DECIMAL(14,2)` y no `FLOAT`.
- La desviación se define como `gasto real - gasto planificado`.
- La desviación y el análisis no se guardan como tablas principales.
- La zona horaria funcional documentada es `America/Lima`.
- Las relaciones entre centros, conceptos, gastos planificados y gastos reales están documentadas.
- `planned_expenses` tiene restricción única por año, mes, centro de costo y concepto.
- `actual_expenses` permite múltiples registros por mes, centro de costo y concepto.
- La documentación queda lista para implementar modelos SQLAlchemy y migraciones en una tarea posterior.
