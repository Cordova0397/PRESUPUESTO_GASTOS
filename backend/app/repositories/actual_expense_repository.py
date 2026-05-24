"""Acceso a datos para gastos reales."""
from __future__ import annotations

from datetime import date

from sqlalchemy import or_, select
from sqlalchemy.orm import Session

from app.models.actual_expense import ActualExpense


def list_actual_expenses(
    db: Session,
    skip: int = 0,
    limit: int = 100,
    year: int | None = None,
    month: int | None = None,
    cost_center_id: int | None = None,
    expense_concept_id: int | None = None,
    date_from: date | None = None,
    date_to: date | None = None,
    supplier: str | None = None,
    document_number: str | None = None,
    search: str | None = None,
) -> list[ActualExpense]:
    stmt = select(ActualExpense)
    if year is not None:
        stmt = stmt.where(ActualExpense.year == year)
    if month is not None:
        stmt = stmt.where(ActualExpense.month == month)
    if cost_center_id is not None:
        stmt = stmt.where(ActualExpense.cost_center_id == cost_center_id)
    if expense_concept_id is not None:
        stmt = stmt.where(ActualExpense.expense_concept_id == expense_concept_id)
    if date_from is not None:
        stmt = stmt.where(ActualExpense.expense_date >= date_from)
    if date_to is not None:
        stmt = stmt.where(ActualExpense.expense_date <= date_to)
    if supplier is not None:
        stmt = stmt.where(ActualExpense.supplier.ilike(f"%{supplier}%"))
    if document_number is not None:
        stmt = stmt.where(ActualExpense.document_number.ilike(f"%{document_number}%"))
    if search is not None:
        pattern = f"%{search}%"
        stmt = stmt.where(
            or_(
                ActualExpense.supplier.ilike(pattern),
                ActualExpense.document_number.ilike(pattern),
                ActualExpense.description.ilike(pattern),
                ActualExpense.notes.ilike(pattern),
            )
        )
    stmt = stmt.order_by(
        ActualExpense.expense_date.desc(),
        ActualExpense.id.desc(),
    )
    stmt = stmt.offset(skip).limit(limit)
    return list(db.scalars(stmt).all())


def get_actual_expense_by_id(db: Session, actual_expense_id: int) -> ActualExpense | None:
    return db.get(ActualExpense, actual_expense_id)


def create_actual_expense(db: Session, data: dict) -> ActualExpense:
    entity = ActualExpense(**data)
    db.add(entity)
    db.commit()
    db.refresh(entity)
    return entity


def update_actual_expense(db: Session, entity: ActualExpense, data: dict) -> ActualExpense:
    for key, value in data.items():
        setattr(entity, key, value)
    db.commit()
    db.refresh(entity)
    return entity


def delete_actual_expense(db: Session, entity: ActualExpense) -> None:
    db.delete(entity)
    db.commit()
