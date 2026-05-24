"""Acceso a datos para reportes y consolidaciones.

No realiza calculos de desviacion ni analisis; esos corresponden
a tareas posteriores del sprint.
"""
from __future__ import annotations

from decimal import Decimal

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models.actual_expense import ActualExpense
from app.models.cost_center import CostCenter
from app.models.expense_concept import ExpenseConcept
from app.models.planned_expense import PlannedExpense


def list_planned_expenses_consolidated(
    db: Session,
    year: int | None = None,
    month: int | None = None,
    cost_center_id: int | None = None,
    expense_concept_id: int | None = None,
) -> list[dict]:
    """Consolida gastos planificados agrupando por periodo, centro y concepto.

    Usa SUM(planned_expenses.amount) como agregado. El GROUP BY incluye
    todos los campos no agregados para ser compatible con MySQL ONLY_FULL_GROUP_BY.
    Devuelve una lista de dicts con las claves definidas en PlannedExpenseConsolidatedRead.
    planned_amount nunca sera None; se normaliza a Decimal("0.00") si el SUM devuelve None.
    """
    stmt = (
        select(
            PlannedExpense.year,
            PlannedExpense.month,
            PlannedExpense.cost_center_id,
            CostCenter.code.label("cost_center_code"),
            CostCenter.name.label("cost_center_name"),
            PlannedExpense.expense_concept_id,
            ExpenseConcept.code.label("expense_concept_code"),
            ExpenseConcept.name.label("expense_concept_name"),
            func.coalesce(
                func.sum(PlannedExpense.amount), Decimal("0.00")
            ).label("planned_amount"),
        )
        .join(CostCenter, PlannedExpense.cost_center_id == CostCenter.id)
        .join(ExpenseConcept, PlannedExpense.expense_concept_id == ExpenseConcept.id)
        .group_by(
            PlannedExpense.year,
            PlannedExpense.month,
            PlannedExpense.cost_center_id,
            CostCenter.code,
            CostCenter.name,
            PlannedExpense.expense_concept_id,
            ExpenseConcept.code,
            ExpenseConcept.name,
        )
        .order_by(
            PlannedExpense.year.asc(),
            PlannedExpense.month.asc(),
            PlannedExpense.cost_center_id.asc(),
            PlannedExpense.expense_concept_id.asc(),
        )
    )

    if year is not None:
        stmt = stmt.where(PlannedExpense.year == year)
    if month is not None:
        stmt = stmt.where(PlannedExpense.month == month)
    if cost_center_id is not None:
        stmt = stmt.where(PlannedExpense.cost_center_id == cost_center_id)
    if expense_concept_id is not None:
        stmt = stmt.where(PlannedExpense.expense_concept_id == expense_concept_id)

    rows = db.execute(stmt).mappings().all()
    result: list[dict] = []
    for row in rows:
        amount = row["planned_amount"]
        result.append(
            {
                "year": row["year"],
                "month": row["month"],
                "cost_center_id": row["cost_center_id"],
                "cost_center_code": row["cost_center_code"],
                "cost_center_name": row["cost_center_name"],
                "expense_concept_id": row["expense_concept_id"],
                "expense_concept_code": row["expense_concept_code"],
                "expense_concept_name": row["expense_concept_name"],
                "planned_amount": Decimal(str(amount)) if amount is not None else Decimal("0.00"),
            }
        )
    return result


def list_actual_expenses_consolidated(
    db: Session,
    year: int | None = None,
    month: int | None = None,
    cost_center_id: int | None = None,
    expense_concept_id: int | None = None,
) -> list[dict]:
    """Consolida gastos reales agrupando por periodo, centro y concepto.

    Usa SUM(actual_expenses.amount) como agregado. El GROUP BY incluye
    todos los campos no agregados para ser compatible con MySQL ONLY_FULL_GROUP_BY.
    Devuelve una lista de dicts con las claves definidas en ActualExpenseConsolidatedRead.
    actual_amount nunca sera None; se normaliza a Decimal("0.00") si el SUM devuelve None.
    No calcula planificados, desviacion ni porcentaje.
    """
    stmt = (
        select(
            ActualExpense.year,
            ActualExpense.month,
            ActualExpense.cost_center_id,
            CostCenter.code.label("cost_center_code"),
            CostCenter.name.label("cost_center_name"),
            ActualExpense.expense_concept_id,
            ExpenseConcept.code.label("expense_concept_code"),
            ExpenseConcept.name.label("expense_concept_name"),
            func.coalesce(
                func.sum(ActualExpense.amount), Decimal("0.00")
            ).label("actual_amount"),
        )
        .join(CostCenter, ActualExpense.cost_center_id == CostCenter.id)
        .join(ExpenseConcept, ActualExpense.expense_concept_id == ExpenseConcept.id)
        .group_by(
            ActualExpense.year,
            ActualExpense.month,
            ActualExpense.cost_center_id,
            CostCenter.code,
            CostCenter.name,
            ActualExpense.expense_concept_id,
            ExpenseConcept.code,
            ExpenseConcept.name,
        )
        .order_by(
            ActualExpense.year.asc(),
            ActualExpense.month.asc(),
            ActualExpense.cost_center_id.asc(),
            ActualExpense.expense_concept_id.asc(),
        )
    )

    if year is not None:
        stmt = stmt.where(ActualExpense.year == year)
    if month is not None:
        stmt = stmt.where(ActualExpense.month == month)
    if cost_center_id is not None:
        stmt = stmt.where(ActualExpense.cost_center_id == cost_center_id)
    if expense_concept_id is not None:
        stmt = stmt.where(ActualExpense.expense_concept_id == expense_concept_id)

    rows = db.execute(stmt).mappings().all()
    result: list[dict] = []
    for row in rows:
        amount = row["actual_amount"]
        result.append(
            {
                "year": row["year"],
                "month": row["month"],
                "cost_center_id": row["cost_center_id"],
                "cost_center_code": row["cost_center_code"],
                "cost_center_name": row["cost_center_name"],
                "expense_concept_id": row["expense_concept_id"],
                "expense_concept_code": row["expense_concept_code"],
                "expense_concept_name": row["expense_concept_name"],
                "actual_amount": Decimal(str(amount)) if amount is not None else Decimal("0.00"),
            }
        )
    return result
