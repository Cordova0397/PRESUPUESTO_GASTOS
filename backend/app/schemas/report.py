"""Esquemas Pydantic v2 para reportes y consolidaciones."""
from __future__ import annotations

from decimal import Decimal

from pydantic import BaseModel


class ExpenseKpisRead(BaseModel):
    """KPIs generales del presupuesto para un filtro de año y/o mes.

    Los totales se calculan sumando planned_amount y actual_amount de todos
    los centros de costo del filtro. Los porcentajes se calculan sobre los
    totales globales, no como promedio de porcentajes individuales.

    Formulas:
        deviation_amount_total  = actual_amount_total - planned_amount_total
        deviation_percentage    = deviation_amount_total / planned_amount_total
        execution_percentage    = actual_amount_total   / planned_amount_total

    Si planned_amount_total = 0 y actual_amount_total > 0:
        deviation_percentage = None
        execution_percentage = None
        status = "SIN PRESUPUESTO"

    Si planned_amount_total = 0 y actual_amount_total = 0:
        deviation_percentage = Decimal("0.0000")
        execution_percentage = Decimal("0.0000")
        status = "EN PRESUPUESTO"

    No se almacena en base de datos; se calcula en tiempo de consulta.
    """

    year: int | None
    month: int | None
    planned_amount_total: Decimal
    actual_amount_total: Decimal
    deviation_amount_total: Decimal
    deviation_percentage: Decimal | None
    execution_percentage: Decimal | None
    status: str


class ExpenseAnalysisRead(BaseModel):
    """Resumen de desviacion agrupado por año, mes y centro de costo.

    Agrega planned_amount y actual_amount de todos los conceptos del centro
    para el periodo (year, month). Los calculos se realizan sobre los totales
    consolidados del grupo, no como promedio de porcentajes por concepto.

    Formulas aplicadas sobre totales del grupo:
        deviation_amount     = actual_amount - planned_amount
        deviation_percentage = deviation_amount / planned_amount  (ratio 4 dec.)

    Si planned_amount = 0 y actual_amount > 0: deviation_percentage = None
    y status = "SIN PRESUPUESTO".

    No se almacena en base de datos; se calcula en tiempo de consulta.
    """

    year: int
    month: int
    cost_center_id: int
    cost_center_code: str | None
    cost_center_name: str | None
    planned_amount: Decimal
    actual_amount: Decimal
    deviation_amount: Decimal
    deviation_percentage: Decimal | None
    status: str


class ExpenseVarianceRead(BaseModel):
    """Desviacion monetaria por periodo, centro y concepto.

    Formulas:
        deviation_amount     = actual_amount - planned_amount
        deviation_percentage = deviation_amount / planned_amount  (ratio decimal, no porcentaje x100)

    Casos de deviation_percentage:
    - planned_amount > 0:                   ratio con 4 decimales (ej. 0.2000 = 20 %).
    - planned_amount = 0 y actual = 0:      Decimal("0.0000").
    - planned_amount = 0 y actual > 0:      None  (sin presupuesto definido).

    Valores de status:
    - "SIN PRESUPUESTO": planned_amount = 0 y actual_amount > 0.
    - "SOBRECOSTO":      planned_amount > 0 y deviation_amount > 0.
    - "AHORRO":          planned_amount > 0 y deviation_amount < 0.
    - "EN PRESUPUESTO":  deviation_amount = 0 y no aplica SIN PRESUPUESTO.

    Si no existe planificado para la combinacion: planned_amount = Decimal("0.00").
    Si no existe real para la combinacion:         actual_amount  = Decimal("0.00").
    No se calculan semaforos visuales; esos corresponden a tareas posteriores.
    """

    year: int
    month: int
    cost_center_id: int
    cost_center_code: str | None
    cost_center_name: str | None
    expense_concept_id: int
    expense_concept_code: str | None
    expense_concept_name: str | None
    planned_amount: Decimal
    actual_amount: Decimal
    deviation_amount: Decimal
    deviation_percentage: Decimal | None
    status: str


class ActualExpenseConsolidatedRead(BaseModel):
    """Consolidado de gastos reales agrupado por periodo, centro y concepto.

    actual_amount es la suma de amount de actual_expenses para la combinacion
    (year, month, cost_center_id, expense_concept_id).
    No incluye gastos planificados, desviacion ni porcentaje; esos calculos
    corresponden a tareas posteriores.
    """

    year: int
    month: int
    cost_center_id: int
    cost_center_code: str | None
    cost_center_name: str | None
    expense_concept_id: int
    expense_concept_code: str | None
    expense_concept_name: str | None
    actual_amount: Decimal


class PlannedExpenseConsolidatedRead(BaseModel):
    """Consolidado de gastos planificados agrupado por periodo, centro y concepto.

    planned_amount es la suma de amount de planned_expenses para la combinacion
    (year, month, cost_center_id, expense_concept_id).
    No incluye gastos reales, desviacion ni porcentaje; esos calculos
    corresponden a tareas posteriores.
    """

    year: int
    month: int
    cost_center_id: int
    cost_center_code: str | None
    cost_center_name: str | None
    expense_concept_id: int
    expense_concept_code: str | None
    expense_concept_name: str | None
    planned_amount: Decimal
