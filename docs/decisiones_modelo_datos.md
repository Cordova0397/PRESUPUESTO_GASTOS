# Decisiones del modelo de datos MVP

Este documento registra las decisiones tomadas para el modelo de datos MVP antes de implementar modelos SQLAlchemy y migraciones Alembic.

## 1. IDs autoincrementales enteros

Decisión: usar `BIGINT UNSIGNED` autoincremental como identificador principal de las tablas del MVP.

Justificación:

- Simplifica relaciones y llaves foráneas.
- Es suficiente para el alcance inicial.
- Evita incorporar UUIDs antes de tener una necesidad real de integración distribuida.

## 2. Montos con `DECIMAL(14,2)`

Decisión: usar `DECIMAL(14,2)` para `planned_expenses.amount` y `actual_expenses.amount`.

Justificación:

- Los montos representan dinero.
- `DECIMAL` evita errores de precisión propios de `FLOAT` y `DOUBLE`.
- La escala de 2 decimales cubre soles y céntimos.

## 3. Moneda funcional en soles

Decisión: el MVP trabaja en soles de Perú como moneda funcional y no incluye un campo `currency`.

Justificación:

- El alcance inicial no requiere monedas múltiples.
- Evita complejidad de tipos de cambio, conversión y reportes multimoneda.
- Si se requiere en una fase posterior, se evaluará agregar moneda por registro o por presupuesto.

## 4. Periodo con `year` y `month` explícitos

Decisión: guardar `year` y `month` como campos explícitos en gastos planificados y reales.

Justificación:

- Facilita consultas de reportes mensuales.
- Simplifica agrupaciones para desviación, análisis y dashboard.
- En gastos reales, `year` y `month` deben derivarse o validarse contra `expense_date`.

## 5. Zona horaria funcional `America/Lima`

Decisión: interpretar las fechas funcionales del negocio con zona horaria de Perú: `America/Lima`.

Justificación:

- El negocio opera con fechas de Perú.
- La fecha funcional de un gasto real debe corresponder al día de negocio en Perú.
- No se debe asumir UTC como fecha funcional para reportes.

## 6. Conceptos asociados a un centro de costo

Decisión: para el MVP, cada concepto de gasto pertenece a un único centro de costo.

Justificación:

- Simplifica la captura de gastos y los reportes iniciales.
- Mantiene clara la clasificación presupuestal.
- Permite validar que un gasto use un concepto compatible con su centro de costo.

## 7. Código de concepto único por centro

Decisión: recomendar `unique(cost_center_id, code)` para `expense_concepts`.

Justificación:

- Permite reutilizar códigos simples en distintos centros de costo.
- Evita una nomenclatura global innecesaria en el MVP.
- Reduce fricción operativa al crear catálogos por área o centro.

## 8. Presupuesto único por periodo, centro y concepto

Decisión: aplicar una restricción única en `planned_expenses` sobre `year, month, cost_center_id, expense_concept_id`.

Justificación:

- El presupuesto base del mismo concepto para un mismo periodo debe tener un único valor.
- Evita duplicar el planificado y distorsionar la desviación.
- Si en el futuro se requiere versionado presupuestal, se deberá diseñar una extensión explícita.

## 9. Gastos reales transaccionales

Decisión: permitir múltiples registros en `actual_expenses` para el mismo año, mes, centro de costo y concepto.

Justificación:

- Los gastos reales representan eventos o transacciones.
- El total real para reportes se obtiene sumando transacciones.
- Evita perder detalle operativo.

## 10. Desviación calculada, no persistida

Decisión: no guardar desviación como tabla principal ni como dato persistido del MVP.

Justificación:

- La desviación se deriva de datos fuente: real menos planificado.
- Evita inconsistencias entre datos guardados y datos calculados.
- Mantiene el modelo inicial simple y auditable desde sus fuentes.

Regla:

```text
desviación monetaria = gasto real - gasto planificado
```

## 11. Análisis y dashboard como agregados calculados

Decisión: no crear tablas principales para análisis ni dashboard en el MVP.

Justificación:

- El análisis se puede construir con consultas y servicios.
- El dashboard debe consumir agregados calculados desde planificado y real.
- Persistir agregados no es necesario para el volumen esperado del MVP.

## 12. Sin multiempresa en el MVP

Decisión: no incluir `company_id` ni estructura multiempresa todavía.

Justificación:

- El alcance inicial está orientado a una sola unidad de trabajo.
- Multiempresa impactaría catálogos, reportes, permisos y aislamiento de datos.
- Se evaluará en una fase posterior si aparece el requerimiento.

## 13. Sin auditoría avanzada en el MVP

Decisión: incluir solo `created_at` y `updated_at`, sin auditoría avanzada.

Justificación:

- No hay login, roles ni usuarios en el MVP inicial.
- Campos como `created_by` o historial de cambios requieren identidad y flujo de auditoría.
- La auditoría queda fuera del alcance inicial.

## 14. Sin soft delete avanzado

Decisión: incluir `is_active` en catálogos, pero no implementar soft delete avanzado todavía.

Justificación:

- Los catálogos pueden necesitar desactivarse sin borrar historial.
- Los gastos planificados y reales no tendrán borrado lógico avanzado en esta etapa documental.
- Las reglas completas de eliminación o anulación se definirán en una fase posterior.

## 15. Sin modelos ni migraciones en esta tarea

Decisión: esta tarea solo documenta el modelo.

Justificación:

- T-005 busca aprobar el diseño antes de implementar.
- Los modelos SQLAlchemy, migraciones Alembic, schemas, endpoints y CRUD corresponden a tareas posteriores.
