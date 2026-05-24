"""Constantes y aliases de validación compartidos para esquemas Pydantic v2.

Centraliza los rangos y restricciones del dominio para que cada schema
los importe y no repita las mismas constantes en línea.
"""
from __future__ import annotations

from decimal import Decimal
from typing import Annotated

from pydantic import Field

# ─── Rangos del dominio ───────────────────────────────────────────────────────

YEAR_MIN = 2000
YEAR_MAX = 2099
MONTH_MIN = 1
MONTH_MAX = 12
MONEY_MAX_DIGITS = 14
MONEY_DECIMAL_PLACES = 2

# ─── Alias de tipo reutilizables ──────────────────────────────────────────────

BudgetYear = Annotated[int, Field(ge=YEAR_MIN, le=YEAR_MAX)]
BudgetMonth = Annotated[int, Field(ge=MONTH_MIN, le=MONTH_MAX)]
PositiveId = Annotated[int, Field(gt=0)]

PlannedMoneyAmount = Annotated[
    Decimal,
    Field(
        ge=Decimal("0"),
        max_digits=MONEY_MAX_DIGITS,
        decimal_places=MONEY_DECIMAL_PLACES,
    ),
]

ActualMoneyAmount = Annotated[
    Decimal,
    Field(
        gt=Decimal("0"),
        max_digits=MONEY_MAX_DIGITS,
        decimal_places=MONEY_DECIMAL_PLACES,
    ),
]
