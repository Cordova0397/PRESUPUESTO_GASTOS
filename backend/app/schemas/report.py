"""Esquemas Pydantic v2 para reportes y consolidaciones."""
from __future__ import annotations

from decimal import Decimal

from pydantic import BaseModel


class ExpenseVarianceRead(BaseModel):
    """Desviacion monetaria por periodo, centro y concepto.

    deviation_amount = actual_amount - planned_amount
    Un valor positivo indica gasto mayor al presupuestado (sobrecosto).
    Un valor negativo indica gasto menor al presupuestado (ahorro).

    Si no existe planificado para la combinacion: planned_amount = Decimal("0.00").
    Si no existe real para la combinacion:         actual_amount  = Decimal("0.00").
    No incluye porcentaje de ejecucion ni semaforos; esos calculos
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
    actual_amount: Decimal
    deviation_amount: Decimal


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
