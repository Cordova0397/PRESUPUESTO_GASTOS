"""Endpoints CRUD de conceptos de gasto por centro de costo."""
from __future__ import annotations

from typing import Annotated

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.schemas.expense_concept import (
    ExpenseConceptCreate,
    ExpenseConceptDeleteResponse,
    ExpenseConceptPatch,
    ExpenseConceptRead,
    ExpenseConceptUpdate,
)
from app.services import expense_concept_service as svc

router = APIRouter(prefix="/api/cost-centers", tags=["Conceptos de gasto"])

DbDep = Annotated[Session, Depends(get_db)]


@router.get("/{cost_center_id}/expense-concepts", response_model=list[ExpenseConceptRead])
def list_expense_concepts(
    cost_center_id: int,
    db: DbDep,
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=100, ge=1, le=200),
    is_active: bool | None = Query(default=None),
    search: str | None = Query(default=None, max_length=100),
) -> list[ExpenseConceptRead]:
    return svc.list_expense_concepts(
        db,
        cost_center_id=cost_center_id,
        skip=skip,
        limit=limit,
        is_active=is_active,
        search=search,
    )


@router.get(
    "/{cost_center_id}/expense-concepts/{expense_concept_id}",
    response_model=ExpenseConceptRead,
)
def get_expense_concept(
    cost_center_id: int, expense_concept_id: int, db: DbDep
) -> ExpenseConceptRead:
    return svc.get_expense_concept(db, cost_center_id, expense_concept_id)


@router.post(
    "/{cost_center_id}/expense-concepts",
    response_model=ExpenseConceptRead,
    status_code=201,
)
def create_expense_concept(
    cost_center_id: int, payload: ExpenseConceptCreate, db: DbDep
) -> ExpenseConceptRead:
    return svc.create_expense_concept(db, cost_center_id, payload)


@router.put(
    "/{cost_center_id}/expense-concepts/{expense_concept_id}",
    response_model=ExpenseConceptRead,
)
def update_expense_concept(
    cost_center_id: int,
    expense_concept_id: int,
    payload: ExpenseConceptUpdate,
    db: DbDep,
) -> ExpenseConceptRead:
    return svc.update_expense_concept(db, cost_center_id, expense_concept_id, payload)


@router.patch(
    "/{cost_center_id}/expense-concepts/{expense_concept_id}",
    response_model=ExpenseConceptRead,
)
def patch_expense_concept(
    cost_center_id: int,
    expense_concept_id: int,
    payload: ExpenseConceptPatch,
    db: DbDep,
) -> ExpenseConceptRead:
    return svc.patch_expense_concept(db, cost_center_id, expense_concept_id, payload)


@router.delete(
    "/{cost_center_id}/expense-concepts/{expense_concept_id}",
    response_model=ExpenseConceptDeleteResponse,
)
def delete_expense_concept(
    cost_center_id: int, expense_concept_id: int, db: DbDep
) -> ExpenseConceptDeleteResponse:
    return svc.delete_expense_concept(db, cost_center_id, expense_concept_id)
