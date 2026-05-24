"""Acceso a datos para gastos planificados."""
from __future__ import annotations

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.planned_expense import PlannedExpense


def list_planned_expenses(
    db: Session,
    skip: int = 0,
    limit: int = 100,
    year: int | None = None,
    month: int | None = None,
    cost_center_id: int | None = None,
    expense_concept_id: int | None = None,
) -> list[PlannedExpense]:
    stmt = select(PlannedExpense)
    if year is not None:
        stmt = stmt.where(PlannedExpense.year == year)
    if month is not None:
        stmt = stmt.where(PlannedExpense.month == month)
    if cost_center_id is not None:
        stmt = stmt.where(PlannedExpense.cost_center_id == cost_center_id)
    if expense_concept_id is not None:
        stmt = stmt.where(PlannedExpense.expense_concept_id == expense_concept_id)
    stmt = stmt.order_by(
        PlannedExpense.year.asc(),
        PlannedExpense.month.asc(),
        PlannedExpense.cost_center_id.asc(),
        PlannedExpense.expense_concept_id.asc(),
    )
    stmt = stmt.offset(skip).limit(limit)
    return list(db.scalars(stmt).all())


def get_planned_expense_by_id(db: Session, planned_expense_id: int) -> PlannedExpense | None:
    return db.get(PlannedExpense, planned_expense_id)


def get_planned_expense_by_unique_key(
    db: Session,
    year: int,
    month: int,
    cost_center_id: int,
    expense_concept_id: int,
) -> PlannedExpense | None:
    stmt = select(PlannedExpense).where(
        PlannedExpense.year == year,
        PlannedExpense.month == month,
        PlannedExpense.cost_center_id == cost_center_id,
        PlannedExpense.expense_concept_id == expense_concept_id,
    )
    return db.scalars(stmt).first()


def create_planned_expense(db: Session, data: dict) -> PlannedExpense:
    entity = PlannedExpense(**data)
    db.add(entity)
    db.commit()
    db.refresh(entity)
    return entity


def update_planned_expense(db: Session, entity: PlannedExpense, data: dict) -> PlannedExpense:
    for key, value in data.items():
        setattr(entity, key, value)
    db.commit()
    db.refresh(entity)
    return entity


def delete_planned_expense(db: Session, entity: PlannedExpense) -> None:
    db.delete(entity)
    db.commit()
