"""Endpoints CRUD de gastos reales."""
from __future__ import annotations

from datetime import date
from typing import Annotated

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.schemas.actual_expense import (
    ActualExpenseCreate,
    ActualExpenseDeleteResponse,
    ActualExpensePatch,
    ActualExpenseRead,
    ActualExpenseUpdate,
)
from app.services import actual_expense_service as svc

router = APIRouter(prefix="/api/actual-expenses", tags=["Gastos reales"])

DbDep = Annotated[Session, Depends(get_db)]


@router.get("", response_model=list[ActualExpenseRead])
def list_actual_expenses(
    db: DbDep,
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=100, ge=1, le=200),
    year: int | None = Query(default=None, ge=2000, le=2099),
    month: int | None = Query(default=None, ge=1, le=12),
    cost_center_id: int | None = Query(default=None, gt=0),
    expense_concept_id: int | None = Query(default=None, gt=0),
    date_from: date | None = Query(default=None),
    date_to: date | None = Query(default=None),
    supplier: str | None = Query(default=None),
    document_number: str | None = Query(default=None),
    search: str | None = Query(default=None),
) -> list[ActualExpenseRead]:
    return svc.list_actual_expenses(
        db,
        skip=skip,
        limit=limit,
        year=year,
        month=month,
        cost_center_id=cost_center_id,
        expense_concept_id=expense_concept_id,
        date_from=date_from,
        date_to=date_to,
        supplier=supplier,
        document_number=document_number,
        search=search,
    )


@router.get("/{actual_expense_id}", response_model=ActualExpenseRead)
def get_actual_expense(
    actual_expense_id: int, db: DbDep
) -> ActualExpenseRead:
    return svc.get_actual_expense(db, actual_expense_id)


@router.post("", response_model=ActualExpenseRead, status_code=201)
def create_actual_expense(
    payload: ActualExpenseCreate, db: DbDep
) -> ActualExpenseRead:
    return svc.create_actual_expense(db, payload)


@router.put("/{actual_expense_id}", response_model=ActualExpenseRead)
def update_actual_expense(
    actual_expense_id: int, payload: ActualExpenseUpdate, db: DbDep
) -> ActualExpenseRead:
    return svc.update_actual_expense(db, actual_expense_id, payload)


@router.patch("/{actual_expense_id}", response_model=ActualExpenseRead)
def patch_actual_expense(
    actual_expense_id: int, payload: ActualExpensePatch, db: DbDep
) -> ActualExpenseRead:
    return svc.patch_actual_expense(db, actual_expense_id, payload)


@router.delete("/{actual_expense_id}", response_model=ActualExpenseDeleteResponse)
def delete_actual_expense(
    actual_expense_id: int, db: DbDep
) -> ActualExpenseDeleteResponse:
    return svc.delete_actual_expense(db, actual_expense_id)
