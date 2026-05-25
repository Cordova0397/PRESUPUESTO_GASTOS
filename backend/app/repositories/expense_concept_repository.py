"""Acceso a datos para conceptos de gasto."""
from __future__ import annotations

from sqlalchemy import func, or_, select
from sqlalchemy.orm import Session

from app.models.expense_concept import ExpenseConcept


def list_expense_concepts(
    db: Session,
    cost_center_id: int,
    skip: int = 0,
    limit: int = 100,
    is_active: bool | None = None,
    search: str | None = None,
) -> list[ExpenseConcept]:
    stmt = select(ExpenseConcept).where(ExpenseConcept.cost_center_id == cost_center_id)
    if is_active is not None:
        stmt = stmt.where(ExpenseConcept.is_active == is_active)
    if search:
        pattern = f"%{search}%"
        stmt = stmt.where(
            or_(
                ExpenseConcept.code.ilike(pattern),
                ExpenseConcept.name.ilike(pattern),
            )
        )
    # MySQL no soporta NULLS LAST; func.isnull() devuelve 1 para NULL → va al final en ASC
    stmt = stmt.order_by(
        func.isnull(ExpenseConcept.sort_order),
        ExpenseConcept.sort_order.asc(),
        ExpenseConcept.id.asc(),
    )
    stmt = stmt.offset(skip).limit(limit)
    return list(db.scalars(stmt).all())


def get_max_sort_order_by_center(db: Session, cost_center_id: int) -> int | None:
    stmt = select(func.max(ExpenseConcept.sort_order)).where(
        ExpenseConcept.cost_center_id == cost_center_id
    )
    return db.scalar(stmt)


def get_expense_concept_by_id(db: Session, expense_concept_id: int) -> ExpenseConcept | None:
    return db.get(ExpenseConcept, expense_concept_id)


def get_expense_concept_by_center_and_id(
    db: Session, cost_center_id: int, expense_concept_id: int
) -> ExpenseConcept | None:
    stmt = select(ExpenseConcept).where(
        ExpenseConcept.id == expense_concept_id,
        ExpenseConcept.cost_center_id == cost_center_id,
    )
    return db.scalars(stmt).first()


def get_expense_concept_by_center_and_code(
    db: Session, cost_center_id: int, code: str
) -> ExpenseConcept | None:
    stmt = select(ExpenseConcept).where(
        ExpenseConcept.cost_center_id == cost_center_id,
        ExpenseConcept.code == code,
    )
    return db.scalars(stmt).first()


def create_expense_concept(db: Session, data: dict) -> ExpenseConcept:
    entity = ExpenseConcept(**data)
    db.add(entity)
    db.commit()
    db.refresh(entity)
    return entity


def update_expense_concept(db: Session, entity: ExpenseConcept, data: dict) -> ExpenseConcept:
    for key, value in data.items():
        setattr(entity, key, value)
    db.commit()
    db.refresh(entity)
    return entity


def soft_delete_expense_concept(db: Session, entity: ExpenseConcept) -> ExpenseConcept:
    entity.is_active = False
    db.commit()
    db.refresh(entity)
    return entity
