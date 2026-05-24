"""Endpoints de reportes y consolidaciones."""
from __future__ import annotations

from typing import Annotated

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.schemas.report import (
    ActualExpenseConsolidatedRead,
    ExpenseVarianceRead,
    PlannedExpenseConsolidatedRead,
)
from app.services import report_service as svc

router = APIRouter(prefix="/api/reports", tags=["Reportes"])

DbDep = Annotated[Session, Depends(get_db)]


@router.get("/planned-consolidated", response_model=list[PlannedExpenseConsolidatedRead])
def list_planned_expenses_consolidated(
    db: DbDep,
    year: int | None = Query(default=None, ge=2000, le=2099),
    month: int | None = Query(default=None, ge=1, le=12),
    cost_center_id: int | None = Query(default=None, gt=0),
    expense_concept_id: int | None = Query(default=None, gt=0),
) -> list[PlannedExpenseConsolidatedRead]:
    """Consolida gastos planificados agrupando por periodo, centro y concepto.

    Devuelve SUM(amount) de planned_expenses por cada combinacion de
    (year, month, cost_center_id, expense_concept_id).

    No incluye gastos reales ni calculo de desviacion.
    """
    return svc.list_planned_expenses_consolidated(
        db,
        year=year,
        month=month,
        cost_center_id=cost_center_id,
        expense_concept_id=expense_concept_id,
    )


@router.get("/actual-consolidated", response_model=list[ActualExpenseConsolidatedRead])
def list_actual_expenses_consolidated(
    db: DbDep,
    year: int | None = Query(default=None, ge=2000, le=2099),
    month: int | None = Query(default=None, ge=1, le=12),
    cost_center_id: int | None = Query(default=None, gt=0),
    expense_concept_id: int | None = Query(default=None, gt=0),
) -> list[ActualExpenseConsolidatedRead]:
    """Consolida gastos reales agrupando por periodo, centro y concepto.

    Devuelve SUM(amount) de actual_expenses por cada combinacion de
    (year, month, cost_center_id, expense_concept_id).

    No incluye gastos planificados ni calculo de desviacion.
    """
    return svc.list_actual_expenses_consolidated(
        db,
        year=year,
        month=month,
        cost_center_id=cost_center_id,
        expense_concept_id=expense_concept_id,
    )


@router.get("/variance", response_model=list[ExpenseVarianceRead])
def list_expense_variance(
    db: DbDep,
    year: int | None = Query(default=None, ge=2000, le=2099),
    month: int | None = Query(default=None, ge=1, le=12),
    cost_center_id: int | None = Query(default=None, gt=0),
    expense_concept_id: int | None = Query(default=None, gt=0),
) -> list[ExpenseVarianceRead]:
    """Calcula la desviacion monetaria por periodo, centro y concepto.

    Formula: deviation_amount = actual_amount - planned_amount

    Combina planificados y reales aunque no exista contraparte:
    - Solo planificado: actual_amount = 0.00, deviation negativa (ahorro).
    - Solo real:        planned_amount = 0.00, deviation positiva (sobrecosto).
    - Ambos presentes:  deviation = real - planificado.

    No incluye porcentaje de ejecucion ni semaforos.
    """
    return svc.list_expense_variance(
        db,
        year=year,
        month=month,
        cost_center_id=cost_center_id,
        expense_concept_id=expense_concept_id,
    )
