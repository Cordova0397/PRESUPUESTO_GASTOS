"""Acceso a datos para centros de costo."""
from __future__ import annotations

from sqlalchemy import func, or_, select
from sqlalchemy.orm import Session

from app.models.cost_center import CostCenter


def list_cost_centers(
    db: Session,
    skip: int = 0,
    limit: int = 100,
    is_active: bool | None = None,
    search: str | None = None,
) -> list[CostCenter]:
    stmt = select(CostCenter)
    if is_active is not None:
        stmt = stmt.where(CostCenter.is_active == is_active)
    if search:
        pattern = f"%{search}%"
        stmt = stmt.where(
            or_(
                CostCenter.code.ilike(pattern),
                CostCenter.name.ilike(pattern),
            )
        )
    # MySQL no soporta NULLS LAST; func.isnull() devuelve 1 para NULL → va al final en ASC
    stmt = stmt.order_by(
        func.isnull(CostCenter.sort_order),
        CostCenter.sort_order.asc(),
        CostCenter.id.asc(),
    )
    stmt = stmt.offset(skip).limit(limit)
    return list(db.scalars(stmt).all())


def get_cost_center_by_id(db: Session, cost_center_id: int) -> CostCenter | None:
    return db.get(CostCenter, cost_center_id)


def get_max_sort_order(db: Session) -> int | None:
    stmt = select(func.max(CostCenter.sort_order))
    return db.scalar(stmt)


def get_cost_center_by_code(db: Session, code: str) -> CostCenter | None:
    stmt = select(CostCenter).where(CostCenter.code == code)
    return db.scalars(stmt).first()


def create_cost_center(db: Session, data: dict) -> CostCenter:
    entity = CostCenter(**data)
    db.add(entity)
    db.commit()
    db.refresh(entity)
    return entity


def update_cost_center(db: Session, entity: CostCenter, data: dict) -> CostCenter:
    for key, value in data.items():
        setattr(entity, key, value)
    db.commit()
    db.refresh(entity)
    return entity


def soft_delete_cost_center(db: Session, entity: CostCenter) -> CostCenter:
    entity.is_active = False
    db.commit()
    db.refresh(entity)
    return entity
