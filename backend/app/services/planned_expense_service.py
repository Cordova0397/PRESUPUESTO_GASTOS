"""Logica de negocio para gastos planificados."""
from __future__ import annotations

from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.models.planned_expense import PlannedExpense
from app.repositories import cost_center_repository as cc_repo
from app.repositories import expense_concept_repository as ec_repo
from app.repositories import planned_expense_repository as repo
from app.schemas.planned_expense import (
    PlannedExpenseCreate,
    PlannedExpenseDeleteResponse,
    PlannedExpensePatch,
    PlannedExpenseRead,
    PlannedExpenseUpdate,
)


# ---------------------------------------------------------------------------
# Helpers privados
# ---------------------------------------------------------------------------


def _get_entity(db: Session, planned_expense_id: int) -> PlannedExpense:
    entity = repo.get_planned_expense_by_id(db, planned_expense_id)
    if entity is None:
        raise HTTPException(
            status_code=404,
            detail=f"Gasto planificado con id={planned_expense_id} no encontrado.",
        )
    return entity


def _validate_cost_center(db: Session, cost_center_id: int) -> None:
    center = cc_repo.get_cost_center_by_id(db, cost_center_id)
    if center is None:
        raise HTTPException(
            status_code=404,
            detail=f"Centro de costo con id={cost_center_id} no encontrado.",
        )


def _validate_concept_in_center(
    db: Session, cost_center_id: int, expense_concept_id: int
) -> None:
    concept = ec_repo.get_expense_concept_by_id(db, expense_concept_id)
    if concept is None:
        raise HTTPException(
            status_code=404,
            detail=f"Concepto de gasto con id={expense_concept_id} no encontrado.",
        )
    if concept.cost_center_id != cost_center_id:
        raise HTTPException(
            status_code=422,
            detail=(
                f"El concepto de gasto id={expense_concept_id} "
                f"no pertenece al centro de costo id={cost_center_id}."
            ),
        )


def _validate_unique_key(
    db: Session,
    year: int,
    month: int,
    cost_center_id: int,
    expense_concept_id: int,
    exclude_id: int | None = None,
) -> None:
    existing = repo.get_planned_expense_by_unique_key(
        db, year, month, cost_center_id, expense_concept_id
    )
    if existing and (exclude_id is None or existing.id != exclude_id):
        raise HTTPException(
            status_code=409,
            detail=(
                f"Ya existe un gasto planificado para el año {year}, "
                f"mes {month}, centro id={cost_center_id} "
                f"y concepto id={expense_concept_id}."
            ),
        )


def _build_read(entity: PlannedExpense) -> PlannedExpenseRead:
    """Construye PlannedExpenseRead con datos enriquecidos desde las relaciones ORM."""
    cc = entity.cost_center
    ec = entity.expense_concept
    return PlannedExpenseRead(
        id=entity.id,
        year=entity.year,
        month=entity.month,
        cost_center_id=entity.cost_center_id,
        expense_concept_id=entity.expense_concept_id,
        amount=entity.amount,
        notes=entity.notes,
        created_at=entity.created_at,
        updated_at=entity.updated_at,
        cost_center_code=cc.code if cc else None,
        cost_center_name=cc.name if cc else None,
        expense_concept_code=ec.code if ec else None,
        expense_concept_name=ec.name if ec else None,
    )


# ---------------------------------------------------------------------------
# Operaciones públicas
# ---------------------------------------------------------------------------


def list_planned_expenses(
    db: Session,
    skip: int,
    limit: int,
    year: int | None,
    month: int | None,
    cost_center_id: int | None,
    expense_concept_id: int | None,
) -> list[PlannedExpenseRead]:
    limit = min(limit, 200)
    entities = repo.list_planned_expenses(
        db,
        skip=skip,
        limit=limit,
        year=year,
        month=month,
        cost_center_id=cost_center_id,
        expense_concept_id=expense_concept_id,
    )
    return [_build_read(e) for e in entities]


def get_planned_expense(db: Session, planned_expense_id: int) -> PlannedExpenseRead:
    entity = _get_entity(db, planned_expense_id)
    return _build_read(entity)


def create_planned_expense(
    db: Session, payload: PlannedExpenseCreate
) -> PlannedExpenseRead:
    _validate_cost_center(db, payload.cost_center_id)
    _validate_concept_in_center(db, payload.cost_center_id, payload.expense_concept_id)
    _validate_unique_key(
        db, payload.year, payload.month, payload.cost_center_id, payload.expense_concept_id
    )
    data = {
        "year": payload.year,
        "month": payload.month,
        "cost_center_id": payload.cost_center_id,
        "expense_concept_id": payload.expense_concept_id,
        "amount": payload.amount,
        "notes": payload.notes.strip() if payload.notes else None,
    }
    entity = repo.create_planned_expense(db, data)
    return _build_read(entity)


def update_planned_expense(
    db: Session, planned_expense_id: int, payload: PlannedExpenseUpdate
) -> PlannedExpenseRead:
    entity = _get_entity(db, planned_expense_id)
    _validate_cost_center(db, payload.cost_center_id)
    _validate_concept_in_center(db, payload.cost_center_id, payload.expense_concept_id)
    _validate_unique_key(
        db,
        payload.year,
        payload.month,
        payload.cost_center_id,
        payload.expense_concept_id,
        exclude_id=entity.id,
    )
    data = {
        "year": payload.year,
        "month": payload.month,
        "cost_center_id": payload.cost_center_id,
        "expense_concept_id": payload.expense_concept_id,
        "amount": payload.amount,
        "notes": payload.notes.strip() if payload.notes else None,
    }
    updated = repo.update_planned_expense(db, entity, data)
    return _build_read(updated)


def patch_planned_expense(
    db: Session, planned_expense_id: int, payload: PlannedExpensePatch
) -> PlannedExpenseRead:
    entity = _get_entity(db, planned_expense_id)
    changes = payload.model_dump(exclude_unset=True)
    if not changes:
        return _build_read(entity)

    # Estado final combinando entidad actual + cambios enviados
    final_year = changes.get("year", entity.year)
    final_month = changes.get("month", entity.month)
    final_cc_id = changes.get("cost_center_id", entity.cost_center_id)
    final_ec_id = changes.get("expense_concept_id", entity.expense_concept_id)

    key_fields = {"year", "month", "cost_center_id", "expense_concept_id"}
    key_changed = bool(key_fields & changes.keys())

    # Validar centro si cambia
    if "cost_center_id" in changes:
        _validate_cost_center(db, final_cc_id)

    # Validar pertenencia si cambia centro o concepto
    if "cost_center_id" in changes or "expense_concept_id" in changes:
        _validate_concept_in_center(db, final_cc_id, final_ec_id)

    # Validar unicidad si cambia algún campo de la clave
    if key_changed:
        _validate_unique_key(
            db, final_year, final_month, final_cc_id, final_ec_id, exclude_id=entity.id
        )

    data: dict = {}
    if "year" in changes:
        data["year"] = changes["year"]
    if "month" in changes:
        data["month"] = changes["month"]
    if "cost_center_id" in changes:
        data["cost_center_id"] = changes["cost_center_id"]
    if "expense_concept_id" in changes:
        data["expense_concept_id"] = changes["expense_concept_id"]
    if "amount" in changes:
        data["amount"] = changes["amount"]
    if "notes" in changes:
        val = changes["notes"]
        data["notes"] = val.strip() if val else None

    if not data:
        return _build_read(entity)

    updated = repo.update_planned_expense(db, entity, data)
    return _build_read(updated)


def delete_planned_expense(
    db: Session, planned_expense_id: int
) -> PlannedExpenseDeleteResponse:
    entity = _get_entity(db, planned_expense_id)
    saved_id = entity.id
    repo.delete_planned_expense(db, entity)
    return PlannedExpenseDeleteResponse(
        ok=True,
        message=(
            f"Gasto planificado id={saved_id} eliminado correctamente. "
            "En fases posteriores con auditoría se evaluará baja lógica."
        ),
        id=saved_id,
    )
