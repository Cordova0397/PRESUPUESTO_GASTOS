"""Endpoints CRUD de gastos planificados."""
from __future__ import annotations

from typing import Annotated

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.schemas.planned_expense import (
    PlannedExpenseCreate,
    PlannedExpenseDeleteResponse,
    PlannedExpensePatch,
    PlannedExpenseRead,
    PlannedExpenseUpdate,
)
from app.services import planned_expense_service as svc

router = APIRouter(prefix="/api/planned-expenses", tags=["Gastos planificados"])

DbDep = Annotated[Session, Depends(get_db)]


@router.get("", response_model=list[PlannedExpenseRead])
def list_planned_expenses(
    db: DbDep,
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=100, ge=1, le=200),
    year: int | None = Query(default=None),
    month: int | None = Query(default=None, ge=1, le=12),
    cost_center_id: int | None = Query(default=None),
    expense_concept_id: int | None = Query(default=None),
) -> list[PlannedExpenseRead]:
    return svc.list_planned_expenses(
        db,
        skip=skip,
        limit=limit,
        year=year,
        month=month,
        cost_center_id=cost_center_id,
        expense_concept_id=expense_concept_id,
    )


@router.get("/{planned_expense_id}", response_model=PlannedExpenseRead)
def get_planned_expense(
    planned_expense_id: int, db: DbDep
) -> PlannedExpenseRead:
    return svc.get_planned_expense(db, planned_expense_id)


@router.post("", response_model=PlannedExpenseRead, status_code=201)
def create_planned_expense(
    payload: PlannedExpenseCreate, db: DbDep
) -> PlannedExpenseRead:
    return svc.create_planned_expense(db, payload)


@router.put("/{planned_expense_id}", response_model=PlannedExpenseRead)
def update_planned_expense(
    planned_expense_id: int, payload: PlannedExpenseUpdate, db: DbDep
) -> PlannedExpenseRead:
    return svc.update_planned_expense(db, planned_expense_id, payload)


@router.patch("/{planned_expense_id}", response_model=PlannedExpenseRead)
def patch_planned_expense(
    planned_expense_id: int, payload: PlannedExpensePatch, db: DbDep
) -> PlannedExpenseRead:
    return svc.patch_planned_expense(db, planned_expense_id, payload)


@router.delete("/{planned_expense_id}", response_model=PlannedExpenseDeleteResponse)
def delete_planned_expense(
    planned_expense_id: int, db: DbDep
) -> PlannedExpenseDeleteResponse:
    return svc.delete_planned_expense(db, planned_expense_id)
