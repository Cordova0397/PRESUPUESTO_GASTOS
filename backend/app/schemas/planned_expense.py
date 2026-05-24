"""Esquemas Pydantic v2 para gastos planificados."""
from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, ConfigDict

from app.schemas.validation import (
    BudgetMonth,
    BudgetYear,
    PlannedMoneyAmount,
    PositiveId,
)


class PlannedExpenseCreate(BaseModel):
    year: BudgetYear
    month: BudgetMonth
    cost_center_id: PositiveId
    expense_concept_id: PositiveId
    amount: PlannedMoneyAmount
    notes: str | None = None


class PlannedExpenseUpdate(BaseModel):
    year: BudgetYear
    month: BudgetMonth
    cost_center_id: PositiveId
    expense_concept_id: PositiveId
    amount: PlannedMoneyAmount
    notes: str | None = None


class PlannedExpensePatch(BaseModel):
    year: BudgetYear | None = None
    month: BudgetMonth | None = None
    cost_center_id: PositiveId | None = None
    expense_concept_id: PositiveId | None = None
    amount: PlannedMoneyAmount | None = None
    notes: str | None = None


class PlannedExpenseRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    year: int
    month: int
    cost_center_id: int
    expense_concept_id: int
    amount: PlannedMoneyAmount
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
