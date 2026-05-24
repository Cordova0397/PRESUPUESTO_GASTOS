"""Endpoints de reportes y consolidaciones."""
from __future__ import annotations

from typing import Annotated

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.schemas.report import (
    ActualExpenseConsolidatedRead,
    ExpenseAnalysisRead,
    ExpenseKpisRead,
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
    """Calcula desviacion monetaria, porcentaje y estado por periodo, centro y concepto.

    Formula:
        deviation_amount     = actual_amount - planned_amount
        deviation_percentage = deviation_amount / planned_amount  (ratio decimal 4 dec.)

    Combina planificados y reales aunque no exista contraparte:
    - Solo planificado: actual = 0.00, deviation negativa, status "AHORRO".
    - Solo real:        planned = 0.00, deviation positiva, deviation_percentage null,
                        status "SIN PRESUPUESTO".
    - Ambos presentes:  deviation = real - planificado, status segun signo.

    Valores de status: "SIN PRESUPUESTO" | "SOBRECOSTO" | "AHORRO" | "EN PRESUPUESTO".
    No incluye semaforos visuales.
    """
    return svc.list_expense_variance(
        db,
        year=year,
        month=month,
        cost_center_id=cost_center_id,
        expense_concept_id=expense_concept_id,
    )


@router.get("/analysis", response_model=list[ExpenseAnalysisRead])
def list_expense_analysis(
    db: DbDep,
    year: int | None = Query(default=None, ge=2000, le=2099),
    month: int | None = Query(default=None, ge=1, le=12),
    cost_center_id: int | None = Query(default=None, gt=0),
) -> list[ExpenseAnalysisRead]:
    """Resume la desviacion por año, mes y centro de costo.

    Agrega planned_amount y actual_amount de todos los conceptos del centro
    para el periodo. Los calculos de desviacion se realizan sobre los totales
    consolidados del grupo, no como promedio de porcentajes por concepto.

    Formula aplicada sobre totales del grupo:
        deviation_amount     = actual_amount - planned_amount
        deviation_percentage = deviation_amount / planned_amount  (ratio 4 dec.)

    No filtra por expense_concept_id: el nivel de detalle es centro-periodo.
    No guarda el analisis en base de datos.
    """
    return svc.list_expense_analysis(
        db,
        year=year,
        month=month,
        cost_center_id=cost_center_id,
    )


@router.get("/kpis", response_model=ExpenseKpisRead)
def get_expense_kpis(
    db: DbDep,
    year: int | None = Query(default=None, ge=2000, le=2099),
    month: int | None = Query(default=None, ge=1, le=12),
) -> ExpenseKpisRead:
    """Devuelve los KPIs generales del presupuesto para el filtro indicado.

    Consolida todos los centros de costo del periodo en un unico conjunto
    de totales. Los porcentajes se calculan sobre los totales globales,
    no como promedio de porcentajes por centro o concepto.

    Campos devueltos:
    - planned_amount_total:  suma global planificada.
    - actual_amount_total:   suma global real.
    - deviation_amount_total = actual_amount_total - planned_amount_total.
    - deviation_percentage:  ratio 4 decimales sobre totales globales.
    - execution_percentage:  ratio 4 decimales sobre totales globales.
    - status:                estado calculado con la misma logica que /variance.

    No almacena KPIs en base de datos.
    """
    return svc.get_expense_kpis(db, year=year, month=month)
