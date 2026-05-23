"""Endpoints CRUD de centros de costo."""
from __future__ import annotations

from typing import Annotated

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.schemas.cost_center import (
    CostCenterCreate,
    CostCenterDeleteResponse,
    CostCenterPatch,
    CostCenterRead,
    CostCenterUpdate,
)
from app.services import cost_center_service as svc

router = APIRouter(prefix="/api/cost-centers", tags=["Centros de costo"])

DbDep = Annotated[Session, Depends(get_db)]


@router.get("", response_model=list[CostCenterRead])
def list_cost_centers(
    db: DbDep,
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=100, ge=1, le=200),
    is_active: bool | None = Query(default=None),
    search: str | None = Query(default=None, max_length=100),
) -> list[CostCenterRead]:
    return svc.list_cost_centers(db, skip=skip, limit=limit, is_active=is_active, search=search)


@router.get("/{cost_center_id}", response_model=CostCenterRead)
def get_cost_center(cost_center_id: int, db: DbDep) -> CostCenterRead:
    return svc.get_cost_center(db, cost_center_id)


@router.post("", response_model=CostCenterRead, status_code=201)
def create_cost_center(payload: CostCenterCreate, db: DbDep) -> CostCenterRead:
    return svc.create_cost_center(db, payload)


@router.put("/{cost_center_id}", response_model=CostCenterRead)
def update_cost_center(
    cost_center_id: int, payload: CostCenterUpdate, db: DbDep
) -> CostCenterRead:
    return svc.update_cost_center(db, cost_center_id, payload)


@router.patch("/{cost_center_id}", response_model=CostCenterRead)
def patch_cost_center(
    cost_center_id: int, payload: CostCenterPatch, db: DbDep
) -> CostCenterRead:
    return svc.patch_cost_center(db, cost_center_id, payload)


@router.delete("/{cost_center_id}", response_model=CostCenterDeleteResponse)
def delete_cost_center(cost_center_id: int, db: DbDep) -> CostCenterDeleteResponse:
    return svc.delete_cost_center(db, cost_center_id)
