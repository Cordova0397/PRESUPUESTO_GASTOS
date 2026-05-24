"""Esquemas Pydantic v2 para gastos planificados."""
from __future__ import annotations

from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field


class PlannedExpenseCreate(BaseModel):
    year: int = Field(..., ge=2000, le=2099)
    month: int = Field(..., ge=1, le=12)
    cost_center_id: int = Field(..., gt=0)
    expense_concept_id: int = Field(..., gt=0)
    amount: Decimal = Field(..., ge=Decimal("0"), decimal_places=2, max_digits=14)
    notes: str | None = None


class PlannedExpenseUpdate(BaseModel):
    year: int = Field(..., ge=2000, le=2099)
    month: int = Field(..., ge=1, le=12)
    cost_center_id: int = Field(..., gt=0)
    expense_concept_id: int = Field(..., gt=0)
    amount: Decimal = Field(..., ge=Decimal("0"), decimal_places=2, max_digits=14)
    notes: str | None = None


class PlannedExpensePatch(BaseModel):
    year: int | None = Field(default=None, ge=2000, le=2099)
    month: int | None = Field(default=None, ge=1, le=12)
    cost_center_id: int | None = Field(default=None, gt=0)
    expense_concept_id: int | None = Field(default=None, gt=0)
    amount: Decimal | None = Field(default=None, ge=Decimal("0"), decimal_places=2, max_digits=14)
    notes: str | None = None


class PlannedExpenseRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    year: int
    month: int
    cost_center_id: int
    expense_concept_id: int
    amount: Decimal
    notes: str | None
    created_at: datetime
    updated_at: datetime
    # Campos enriquecidos para facilitar el frontend
    cost_center_code: str | None = None
    cost_center_name: str | None = None
    expense_concept_code: str | None = None
    expense_concept_name: str | None = None


class PlannedExpenseDeleteResponse(BaseModel):
    ok: bool
    message: str
    id: int
