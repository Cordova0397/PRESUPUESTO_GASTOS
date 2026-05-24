"""Logica de negocio para gastos reales."""
from __future__ import annotations

from datetime import date

from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.models.actual_expense import ActualExpense
from app.repositories import actual_expense_repository as repo
from app.repositories import cost_center_repository as cc_repo
from app.repositories import expense_concept_repository as ec_repo
from app.schemas.actual_expense import (
    ActualExpenseCreate,
    ActualExpenseDeleteResponse,
    ActualExpensePatch,
    ActualExpenseRead,
    ActualExpenseUpdate,
)


# ---------------------------------------------------------------------------
# Helpers privados
# ---------------------------------------------------------------------------


def _strip_or_none(value: str | None) -> str | None:
    if not value:
        return None
    stripped = value.strip()
    return stripped if stripped else None


def _derive_year_month(expense_date: date) -> tuple[int, int]:
    return expense_date.year, expense_date.month


def _get_entity(db: Session, actual_expense_id: int) -> ActualExpense:
    entity = repo.get_actual_expense_by_id(db, actual_expense_id)
    if entity is None:
        raise HTTPException(
            status_code=404,
            detail=f"Gasto real con id={actual_expense_id} no encontrado.",
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


def _build_read(entity: ActualExpense) -> ActualExpenseRead:
    """Construye ActualExpenseRead con datos enriquecidos desde las relaciones ORM."""
    cc = entity.cost_center
    ec = entity.expense_concept
    return ActualExpenseRead(
        id=entity.id,
        expense_date=entity.expense_date,
        year=entity.year,
        month=entity.month,
        cost_center_id=entity.cost_center_id,
        expense_concept_id=entity.expense_concept_id,
        amount=entity.amount,
        supplier=entity.supplier,
        document_number=entity.document_number,
        description=entity.description,
        notes=entity.notes,
        created_at=entity.created_at,
        updated_at=entity.updated_at,
        cost_center_code=cc.code if cc else None,
        cost_center_name=cc.name if cc else None,
        expense_concept_code=ec.code if ec else None,
        expense_concept_name=ec.name if ec else None,
    )


# ---------------------------------------------------------------------------
# Operaciones publicas
# ---------------------------------------------------------------------------


def list_actual_expenses(
    db: Session,
    skip: int,
    limit: int,
    year: int | None,
    month: int | None,
    cost_center_id: int | None,
    expense_concept_id: int | None,
    date_from: date | None,
    date_to: date | None,
    supplier: str | None,
    document_number: str | None,
    search: str | None,
) -> list[ActualExpenseRead]:
    limit = min(limit, 200)
    if date_from is not None and date_to is not None and date_from > date_to:
        raise HTTPException(
            status_code=422,
            detail="date_from no puede ser mayor que date_to.",
        )
    entities = repo.list_actual_expenses(
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
    return [_build_read(e) for e in entities]


def get_actual_expense(db: Session, actual_expense_id: int) -> ActualExpenseRead:
    entity = _get_entity(db, actual_expense_id)
    return _build_read(entity)


def create_actual_expense(
    db: Session, payload: ActualExpenseCreate
) -> ActualExpenseRead:
    _validate_cost_center(db, payload.cost_center_id)
    _validate_concept_in_center(db, payload.cost_center_id, payload.expense_concept_id)
    year, month = _derive_year_month(payload.expense_date)
    data = {
        "expense_date": payload.expense_date,
        "year": year,
        "month": month,
        "cost_center_id": payload.cost_center_id,
        "expense_concept_id": payload.expense_concept_id,
        "amount": payload.amount,
        "supplier": _strip_or_none(payload.supplier),
        "document_number": _strip_or_none(payload.document_number),
        "description": _strip_or_none(payload.description),
        "notes": _strip_or_none(payload.notes),
    }
    entity = repo.create_actual_expense(db, data)
    return _build_read(entity)


def update_actual_expense(
    db: Session, actual_expense_id: int, payload: ActualExpenseUpdate
) -> ActualExpenseRead:
    entity = _get_entity(db, actual_expense_id)
    _validate_cost_center(db, payload.cost_center_id)
    _validate_concept_in_center(db, payload.cost_center_id, payload.expense_concept_id)
    year, month = _derive_year_month(payload.expense_date)
    data = {
        "expense_date": payload.expense_date,
        "year": year,
        "month": month,
        "cost_center_id": payload.cost_center_id,
        "expense_concept_id": payload.expense_concept_id,
        "amount": payload.amount,
        "supplier": _strip_or_none(payload.supplier),
        "document_number": _strip_or_none(payload.document_number),
        "description": _strip_or_none(payload.description),
        "notes": _strip_or_none(payload.notes),
    }
    updated = repo.update_actual_expense(db, entity, data)
    return _build_read(updated)


def patch_actual_expense(
    db: Session, actual_expense_id: int, payload: ActualExpensePatch
) -> ActualExpenseRead:
    entity = _get_entity(db, actual_expense_id)
    changes = payload.model_dump(exclude_unset=True)
    if not changes:
        return _build_read(entity)

    # Estado final combinando entidad actual + cambios enviados
    final_cc_id = changes.get("cost_center_id", entity.cost_center_id)
    final_ec_id = changes.get("expense_concept_id", entity.expense_concept_id)
    final_date: date = changes.get("expense_date", entity.expense_date)

    if "cost_center_id" in changes:
        _validate_cost_center(db, final_cc_id)
    if "cost_center_id" in changes or "expense_concept_id" in changes:
        _validate_concept_in_center(db, final_cc_id, final_ec_id)

    data: dict = {}
    if "expense_date" in changes:
        year, month = _derive_year_month(final_date)
        data["expense_date"] = final_date
        data["year"] = year
        data["month"] = month
    if "cost_center_id" in changes:
        data["cost_center_id"] = final_cc_id
    if "expense_concept_id" in changes:
        data["expense_concept_id"] = final_ec_id
    if "amount" in changes:
        data["amount"] = changes["amount"]
    for field in ("supplier", "document_number", "description", "notes"):
        if field in changes:
            data[field] = _strip_or_none(changes[field])

    if not data:
        return _build_read(entity)

    updated = repo.update_actual_expense(db, entity, data)
    return _build_read(updated)


def delete_actual_expense(
    db: Session, actual_expense_id: int
) -> ActualExpenseDeleteResponse:
    entity = _get_entity(db, actual_expense_id)
    saved_id = entity.id
    repo.delete_actual_expense(db, entity)
    return ActualExpenseDeleteResponse(
        ok=True,
        message=(
            f"Gasto real id={saved_id} eliminado correctamente. "
            "En fases posteriores con auditoria se evaluara baja logica o historial."
        ),
        id=saved_id,
    )
