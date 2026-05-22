# Reglas de negocio MVP

## Regla principal

`desviación monetaria = gasto real - gasto planificado`

## Interpretación

- Positivo: se gastó más de lo presupuestado.
- Negativo: se gastó menos de lo presupuestado.
- Cero: el gasto coincide con lo planificado.

## Porcentaje de desviación

- Si `planificado > 0`: `(real - planificado) / planificado`.
- Si `planificado = 0` y `real = 0`: porcentaje = `0`.
- Si `planificado = 0` y `real > 0`: estado = `SIN PRESUPUESTO`.

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

## Zona horaria del negocio

- La zona horaria oficial del negocio es `America/Lima`.
- Las fechas funcionales deben representar el negocio en zona horaria de Perú.
- No se debe asumir UTC como fecha funcional para reportes.
- En gastos reales, `year` y `month` deben derivarse o validarse contra `expense_date` según `America/Lima`.
