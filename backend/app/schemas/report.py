"""Esquemas Pydantic v2 para reportes y consolidaciones."""
from __future__ import annotations

from decimal import Decimal

from pydantic import BaseModel


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
