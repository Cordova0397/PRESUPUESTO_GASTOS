# Reglas de negocio MVP

## Regla principal

`desviacion monetaria = gasto real - gasto planificado`

## Interpretacion

- Positivo: se gasto mas de lo presupuestado.
- Negativo: se gasto menos de lo presupuestado.
- Cero: el gasto coincide con lo planificado.

## Porcentaje de desviacion

- Si `planificado > 0`: `(real - planificado) / planificado`.
- Si `planificado = 0` y `real = 0`: porcentaje = `0`.
- Si `planificado = 0` y `real > 0`: estado = `SIN PRESUPUESTO`.

## Zona horaria del negocio

- La zona horaria oficial del negocio es `America/Lima`.
- Este criterio debe contemplarse en fases posteriores para fechas y reportes.
