"""Esquemas Pydantic v2 para gastos reales."""
from __future__ import annotations

from datetime import date, datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field


class ActualExpenseCreate(BaseModel):
    expense_date: date
    cost_center_id: int = Field(..., gt=0)
    expense_concept_id: int = Field(..., gt=0)
    amount: Decimal = Field(..., gt=Decimal("0"), decimal_places=2, max_digits=14)
    supplier: str | None = Field(default=None, max_length=150)
    document_number: str | None = Field(default=None, max_length=80)
    description: str | None = None
    notes: str | None = None


class ActualExpenseUpdate(BaseModel):
    expense_date: date
    cost_center_id: int = Field(..., gt=0)
    expense_concept_id: int = Field(..., gt=0)
    amount: Decimal = Field(..., gt=Decimal("0"), decimal_places=2, max_digits=14)
    supplier: str | None = Field(default=None, max_length=150)
    document_number: str | None = Field(default=None, max_length=80)
    description: str | None = None
    notes: str | None = None


class ActualExpensePatch(BaseModel):
    expense_date: date | None = None
    cost_center_id: int | None = Field(default=None, gt=0)
    expense_concept_id: int | None = Field(default=None, gt=0)
    amount: Decimal | None = Field(default=None, gt=Decimal("0"), decimal_places=2, max_digits=14)
    supplier: str | None = Field(default=None, max_length=150)
    document_number: str | None = Field(default=None, max_length=80)
    description: str | None = None
    notes: str | None = None


class ActualExpenseRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    expense_date: date
    year: int
    month: int
    cost_center_id: int
    expense_concept_id: int
    amount: Decimal
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


class ActualExpenseDeleteResponse(BaseModel):
    ok: bool
    message: str
    id: int
