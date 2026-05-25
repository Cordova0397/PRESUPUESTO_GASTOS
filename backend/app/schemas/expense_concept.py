"""Esquemas Pydantic v2 para conceptos de gasto."""
from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class ExpenseConceptCreate(BaseModel):
    code: str | None = Field(default=None, min_length=1, max_length=30)
    name: str = Field(..., min_length=1, max_length=150)
    description: str | None = None
    sort_order: int | None = None
    is_active: bool = True


class ExpenseConceptUpdate(BaseModel):
    code: str | None = Field(default=None, min_length=1, max_length=30)
    name: str = Field(..., min_length=1, max_length=150)
    description: str | None = None
    sort_order: int | None = None
    is_active: bool = True


class ExpenseConceptPatch(BaseModel):
    code: str | None = Field(default=None, min_length=1, max_length=30)
    name: str | None = Field(default=None, min_length=1, max_length=150)
    description: str | None = None
    sort_order: int | None = None
    is_active: bool | None = None


class ExpenseConceptRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    cost_center_id: int
    code: str
    name: str
    description: str | None
    sort_order: int | None
    is_active: bool
    created_at: datetime
    updated_at: datetime


class ExpenseConceptDeleteResponse(BaseModel):
    ok: bool
    message: str
    id: int
