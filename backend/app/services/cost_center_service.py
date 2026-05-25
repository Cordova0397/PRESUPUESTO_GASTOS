"""Logica de negocio para centros de costo."""
from __future__ import annotations

import re
import unicodedata

from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.models.cost_center import CostCenter
from app.repositories import cost_center_repository as repo
from app.schemas.cost_center import (
    CostCenterCreate,
    CostCenterDeleteResponse,
    CostCenterPatch,
    CostCenterUpdate,
)


def list_cost_centers(
    db: Session,
    skip: int,
    limit: int,
    is_active: bool | None,
    search: str | None,
) -> list[CostCenter]:
    limit = min(limit, 200)
    return repo.list_cost_centers(db, skip=skip, limit=limit, is_active=is_active, search=search)


def get_cost_center(db: Session, cost_center_id: int) -> CostCenter:
    entity = repo.get_cost_center_by_id(db, cost_center_id)
    if entity is None:
        raise HTTPException(
            status_code=404,
            detail=f"Centro de costo con id={cost_center_id} no encontrado.",
        )
    return entity


def _normalize_code(code: str) -> str:
    return code.strip().upper()


def _slugify_code(value: str) -> str:
    normalized = unicodedata.normalize("NFKD", value).encode("ascii", "ignore").decode("ascii")
    upper = normalized.upper()
    slug = re.sub(r"[^A-Z0-9]+", "_", upper)
    slug = slug.strip("_")
    slug = slug[:30]
    return slug if slug else "CENTRO"


def _validate_code_unique(db: Session, code: str, exclude_id: int | None = None) -> None:
    existing = repo.get_cost_center_by_code(db, code)
    if existing and (exclude_id is None or existing.id != exclude_id):
        raise HTTPException(
            status_code=409,
            detail=f"Ya existe un centro de costo con el codigo '{code}'.",
        )


def _get_next_sort_order(db: Session) -> int:
    current_max = repo.get_max_sort_order(db)
    return (current_max or 0) + 10


def _generate_unique_code(db: Session, name: str, exclude_id: int | None = None) -> str:
    base = _slugify_code(name)
    existing = repo.get_cost_center_by_code(db, base)
    if existing is None or (exclude_id is not None and existing.id == exclude_id):
        return base
    for i in range(2, 1000):
        suffix = f"_{i}"
        max_base = 30 - len(suffix)
        candidate = base[:max_base] + suffix
        existing = repo.get_cost_center_by_code(db, candidate)
        if existing is None or (exclude_id is not None and existing.id == exclude_id):
            return candidate
    return base


def create_cost_center(db: Session, payload: CostCenterCreate) -> CostCenter:
    if payload.code:
        code = _normalize_code(payload.code)
        _validate_code_unique(db, code)
    else:
        code = _generate_unique_code(db, payload.name)
    sort_order = payload.sort_order if payload.sort_order is not None else _get_next_sort_order(db)
    data = {
        "code": code,
        "name": payload.name.strip(),
        "description": payload.description.strip() if payload.description else None,
        "color": payload.color.strip() if payload.color else None,
        "sort_order": sort_order,
        "is_active": payload.is_active,
    }
    return repo.create_cost_center(db, data)


def update_cost_center(
    db: Session, cost_center_id: int, payload: CostCenterUpdate
) -> CostCenter:
    entity = get_cost_center(db, cost_center_id)
    if payload.code:
        code = _normalize_code(payload.code)
        _validate_code_unique(db, code, exclude_id=entity.id)
    else:
        code = entity.code
    sort_order = payload.sort_order if payload.sort_order is not None else entity.sort_order
    data = {
        "code": code,
        "name": payload.name.strip(),
        "description": payload.description.strip() if payload.description else None,
        "color": payload.color.strip() if payload.color else None,
        "sort_order": sort_order,
        "is_active": payload.is_active,
    }
    return repo.update_cost_center(db, entity, data)


def patch_cost_center(
    db: Session, cost_center_id: int, payload: CostCenterPatch
) -> CostCenter:
    entity = get_cost_center(db, cost_center_id)
    changes = payload.model_dump(exclude_unset=True)
    if not changes:
        return entity

    data: dict = {}

    if "code" in changes and changes["code"] is not None:
        code = _normalize_code(changes["code"])
        _validate_code_unique(db, code, exclude_id=entity.id)
        data["code"] = code

    if "name" in changes and changes["name"] is not None:
        data["name"] = changes["name"].strip()

    if "description" in changes:
        val = changes["description"]
        data["description"] = val.strip() if val else None

    if "color" in changes:
        val = changes["color"]
        data["color"] = val.strip() if val else None

    if "sort_order" in changes:
        data["sort_order"] = changes["sort_order"]

    if "is_active" in changes and changes["is_active"] is not None:
        data["is_active"] = changes["is_active"]

    if not data:
        return entity

    return repo.update_cost_center(db, entity, data)


def delete_cost_center(db: Session, cost_center_id: int) -> CostCenterDeleteResponse:
    entity = get_cost_center(db, cost_center_id)
    repo.soft_delete_cost_center(db, entity)
    return CostCenterDeleteResponse(
        ok=True,
        message=f"Centro de costo '{entity.name}' desactivado correctamente.",
        id=entity.id,
    )
