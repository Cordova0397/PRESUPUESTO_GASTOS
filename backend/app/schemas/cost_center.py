"""Esquemas Pydantic v2 para centros de costo."""
from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class CostCenterCreate(BaseModel):
    code: str = Field(..., min_length=1, max_length=30)
    name: str = Field(..., min_length=1, max_length=150)
    description: str | None = None
    color: str | None = Field(default=None, max_length=30)
    sort_order: int | None = None
    is_active: bool = True


class CostCenterUpdate(BaseModel):
    code: str = Field(..., min_length=1, max_length=30)
    name: str = Field(..., min_length=1, max_length=150)
    description: str | None = None
    color: str | None = Field(default=None, max_length=30)
    sort_order: int | None = None
    is_active: bool = True


class CostCenterPatch(BaseModel):
    code: str | None = Field(default=None, min_length=1, max_length=30)
    name: str | None = Field(default=None, min_length=1, max_length=150)
    description: str | None = None
    color: str | None = Field(default=None, max_length=30)
    sort_order: int | None = None
    is_active: bool | None = None


class CostCenterRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    code: str
    name: str
    description: str | None
    color: str | None
    sort_order: int | None
    is_active: bool
    created_at: datetime
    updated_at: datetime


class CostCenterDeleteResponse(BaseModel):
    ok: bool
    message: str
    id: int
