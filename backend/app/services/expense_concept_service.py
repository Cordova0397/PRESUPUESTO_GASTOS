"""Logica de negocio para conceptos de gasto."""
from __future__ import annotations

from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.models.cost_center import CostCenter
from app.models.expense_concept import ExpenseConcept
from app.repositories import cost_center_repository as cc_repo
from app.repositories import expense_concept_repository as repo
from app.schemas.expense_concept import (
    ExpenseConceptCreate,
    ExpenseConceptDeleteResponse,
    ExpenseConceptPatch,
    ExpenseConceptUpdate,
)


def _get_cost_center(db: Session, cost_center_id: int) -> CostCenter:
    center = cc_repo.get_cost_center_by_id(db, cost_center_id)
    if center is None:
        raise HTTPException(
            status_code=404,
            detail=f"Centro de costo con id={cost_center_id} no encontrado.",
        )
    return center


def _normalize_code(code: str) -> str:
    return code.strip().upper()


def _validate_code_unique(
    db: Session,
    cost_center_id: int,
    code: str,
    exclude_id: int | None = None,
) -> None:
    existing = repo.get_expense_concept_by_center_and_code(db, cost_center_id, code)
    if existing and (exclude_id is None or existing.id != exclude_id):
        raise HTTPException(
            status_code=409,
            detail=f"Ya existe un concepto con el codigo '{code}' en este centro de costo.",
        )


def _get_concept_in_center(
    db: Session, cost_center_id: int, expense_concept_id: int
) -> ExpenseConcept:
    entity = repo.get_expense_concept_by_center_and_id(db, cost_center_id, expense_concept_id)
    if entity is None:
        raise HTTPException(
            status_code=404,
            detail=(
                f"Concepto de gasto con id={expense_concept_id} "
                f"no encontrado en el centro de costo id={cost_center_id}."
            ),
        )
    return entity


def list_expense_concepts(
    db: Session,
    cost_center_id: int,
    skip: int,
    limit: int,
    is_active: bool | None,
    search: str | None,
) -> list[ExpenseConcept]:
    _get_cost_center(db, cost_center_id)
    limit = min(limit, 200)
    return repo.list_expense_concepts(
        db,
        cost_center_id=cost_center_id,
        skip=skip,
        limit=limit,
        is_active=is_active,
        search=search,
    )


def get_expense_concept(
    db: Session, cost_center_id: int, expense_concept_id: int
) -> ExpenseConcept:
    _get_cost_center(db, cost_center_id)
    return _get_concept_in_center(db, cost_center_id, expense_concept_id)


def create_expense_concept(
    db: Session, cost_center_id: int, payload: ExpenseConceptCreate
) -> ExpenseConcept:
    center = _get_cost_center(db, cost_center_id)
    if not center.is_active:
        raise HTTPException(
            status_code=409,
            detail=(
                f"No se puede crear un concepto en el centro de costo "
                f"'{center.name}' porque esta inactivo."
            ),
        )
    code = _normalize_code(payload.code)
    _validate_code_unique(db, cost_center_id, code)
    data = {
        "cost_center_id": cost_center_id,
        "code": code,
        "name": payload.name.strip(),
        "description": payload.description.strip() if payload.description else None,
        "sort_order": payload.sort_order,
        "is_active": payload.is_active,
    }
    return repo.create_expense_concept(db, data)


def update_expense_concept(
    db: Session,
    cost_center_id: int,
    expense_concept_id: int,
    payload: ExpenseConceptUpdate,
) -> ExpenseConcept:
    _get_cost_center(db, cost_center_id)
    entity = _get_concept_in_center(db, cost_center_id, expense_concept_id)
    code = _normalize_code(payload.code)
    _validate_code_unique(db, cost_center_id, code, exclude_id=entity.id)
    data = {
        "code": code,
        "name": payload.name.strip(),
        "description": payload.description.strip() if payload.description else None,
        "sort_order": payload.sort_order,
        "is_active": payload.is_active,
    }
    return repo.update_expense_concept(db, entity, data)


def patch_expense_concept(
    db: Session,
    cost_center_id: int,
    expense_concept_id: int,
    payload: ExpenseConceptPatch,
) -> ExpenseConcept:
    _get_cost_center(db, cost_center_id)
    entity = _get_concept_in_center(db, cost_center_id, expense_concept_id)
    changes = payload.model_dump(exclude_unset=True)
    if not changes:
        return entity

    data: dict = {}

    if "code" in changes and changes["code"] is not None:
        code = _normalize_code(changes["code"])
        _validate_code_unique(db, cost_center_id, code, exclude_id=entity.id)
        data["code"] = code

    if "name" in changes and changes["name"] is not None:
        data["name"] = changes["name"].strip()

    if "description" in changes:
        val = changes["description"]
        data["description"] = val.strip() if val else None

    if "sort_order" in changes:
        data["sort_order"] = changes["sort_order"]

    if "is_active" in changes and changes["is_active"] is not None:
        data["is_active"] = changes["is_active"]

    if not data:
        return entity

    return repo.update_expense_concept(db, entity, data)


def delete_expense_concept(
    db: Session, cost_center_id: int, expense_concept_id: int
) -> ExpenseConceptDeleteResponse:
    _get_cost_center(db, cost_center_id)
    entity = _get_concept_in_center(db, cost_center_id, expense_concept_id)
    repo.soft_delete_expense_concept(db, entity)
    return ExpenseConceptDeleteResponse(
        ok=True,
        message=f"Concepto '{entity.name}' desactivado correctamente.",
        id=entity.id,
    )
