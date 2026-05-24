"""Logica de negocio para reportes y consolidaciones.

En T-015 se consolidan gastos planificados.
En T-016 se consolidan gastos reales.
No se calculan desviacion ni porcentaje; esos calculos corresponden
a tareas posteriores del sprint.
"""
from __future__ import annotations

from sqlalchemy.orm import Session

from app.repositories import report_repository as repo
from app.schemas.report import ActualExpenseConsolidatedRead, PlannedExpenseConsolidatedRead


def list_planned_expenses_consolidated(
    db: Session,
    year: int | None,
    month: int | None,
    cost_center_id: int | None,
    expense_concept_id: int | None,
) -> list[PlannedExpenseConsolidatedRead]:
    """Devuelve el consolidado de gastos planificados por periodo, centro y concepto.

    Responsabilidades:
    - Delegar la consulta al repositorio.
    - Construir y devolver lista de PlannedExpenseConsolidatedRead.

    Fuera de alcance de esta funcion:
    - Gastos reales.
    - Calculo de desviacion (gasto real - gasto planificado).
    - Calculo de porcentaje de ejecucion.
    """
    rows = repo.list_planned_expenses_consolidated(
        db,
        year=year,
        month=month,
        cost_center_id=cost_center_id,
        expense_concept_id=expense_concept_id,
    )
    return [PlannedExpenseConsolidatedRead.model_validate(row) for row in rows]


def list_actual_expenses_consolidated(
    db: Session,
    year: int | None,
    month: int | None,
    cost_center_id: int | None,
    expense_concept_id: int | None,
) -> list[ActualExpenseConsolidatedRead]:
    """Devuelve el consolidado de gastos reales por periodo, centro y concepto.

    Responsabilidades:
    - Delegar la consulta al repositorio.
    - Construir y devolver lista de ActualExpenseConsolidatedRead.

    Fuera de alcance de esta funcion:
    - Gastos planificados.
    - Calculo de desviacion (gasto real - gasto planificado).
    - Calculo de porcentaje de ejecucion.
    """
    rows = repo.list_actual_expenses_consolidated(
        db,
        year=year,
        month=month,
        cost_center_id=cost_center_id,
        expense_concept_id=expense_concept_id,
    )
    return [ActualExpenseConsolidatedRead.model_validate(row) for row in rows]
