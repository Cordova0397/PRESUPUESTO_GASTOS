"""Esquemas Pydantic v2 para gastos planificados."""
from __future__ import annotations

from datetime import date, datetime
from typing import Annotated

from pydantic import BaseModel, ConfigDict, Field

from app.schemas.validation import (
    PlannedMoneyAmount,
    PositiveId,
)

# Tipos anotados con restricciones de longitud
_Supplier = Annotated[str | None, Field(default=None, max_length=150)]
_DocumentNumber = Annotated[str | None, Field(default=None, max_length=80)]


class PlannedExpenseCreate(BaseModel):
    planned_date: date
    cost_center_id: PositiveId
    expense_concept_id: PositiveId
    amount: PlannedMoneyAmount
    supplier: _Supplier = None
    document_number: _DocumentNumber = None
    description: str | None = None
    notes: str | None = None


class PlannedExpenseUpdate(BaseModel):
    planned_date: date
    cost_center_id: PositiveId
    expense_concept_id: PositiveId
    amount: PlannedMoneyAmount
    supplier: _Supplier = None
    document_number: _DocumentNumber = None
    description: str | None = None
    notes: str | None = None


class PlannedExpensePatch(BaseModel):
    planned_date: date | None = None
    cost_center_id: PositiveId | None = None
    expense_concept_id: PositiveId | None = None
    amount: PlannedMoneyAmount | None = None
    supplier: _Supplier = None
    document_number: _DocumentNumber = None
    description: str | None = None
    notes: str | None = None


class PlannedExpenseRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    planned_date: date
    year: int
    month: int
    cost_center_id: int
    expense_concept_id: int
    amount: PlannedMoneyAmount
    supplier: str | None
    document_number: str | None
    description: str | None
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
