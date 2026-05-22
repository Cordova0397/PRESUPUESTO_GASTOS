# Modelo de datos MVP

## Entidades base

### `cost_centers`

- Identificador.
- Codigo.
- Nombre.
- Estado.

### `expense_concepts`

- Identificador.
- Codigo.
- Nombre.
- Descripcion.
- Estado.

### `planned_expenses`

- Identificador.
- Periodo.
- Centro de costo.
- Concepto de gasto.
- Monto planificado.
- Moneda.
- Fecha de registro.

### `actual_expenses`

- Identificador.
- Periodo.
- Centro de costo.
- Concepto de gasto.
- Monto real.
- Moneda.
- Fecha de consumo o registro.

## Criterio de calculo

- La desviacion y el analisis no se guardan como datos principales.
- La desviacion se calcula a partir de los gastos planificados y reales.
- El analisis se construira desde consultas e indicadores derivados.
