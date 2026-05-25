"""Modelo ORM para gastos planificados (modelo transaccional).

Homologado a actual_expenses: permite multiples registros por periodo,
centro de costo y concepto. El anio y mes se derivan de planned_date
en el servicio usando la zona horaria America/Lima.
"""
from __future__ import annotations

from datetime import date
from decimal import Decimal
from typing import TYPE_CHECKING

from sqlalchemy import CheckConstraint, Date, ForeignKey, Index, String, Text
from sqlalchemy.dialects.mysql import BIGINT, DECIMAL, SMALLINT, TINYINT
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.models.mixins import TimestampMixin


if TYPE_CHECKING:
    from app.models.cost_center import CostCenter
    from app.models.expense_concept import ExpenseConcept


class PlannedExpense(TimestampMixin, Base):
    """Gasto planificado por fecha, centro de costo y concepto.

    La integridad de que `expense_concept_id` corresponda al
    `cost_center_id` seleccionado se valida en el servicio.
    """

    __tablename__ = "planned_expenses"
    __table_args__ = (
        CheckConstraint(
            "month BETWEEN 1 AND 12",
            name="ck_planned_expenses_month_range",
        ),
        CheckConstraint(
            "amount >= 0",
            name="ck_planned_expenses_amount_nonneg",
        ),
        Index("ix_planned_expenses_year_month", "year", "month"),
        Index("ix_planned_expenses_planned_date", "planned_date"),
        Index("ix_planned_expenses_center_concept", "cost_center_id", "expense_concept_id"),
        Index("ix_planned_expenses_period_center", "year", "month", "cost_center_id"),
        {"mysql_engine": "InnoDB", "mysql_charset": "utf8mb4"},
    )

    id: Mapped[int] = mapped_column(
        BIGINT(unsigned=True),
        primary_key=True,
        autoincrement=True,
    )
    planned_date: Mapped[date] = mapped_column(Date(), nullable=False)
    year: Mapped[int] = mapped_column(SMALLINT(unsigned=True), nullable=False)
    month: Mapped[int] = mapped_column(TINYINT(unsigned=True), nullable=False)
    cost_center_id: Mapped[int] = mapped_column(
        BIGINT(unsigned=True),
        ForeignKey(
            "cost_centers.id",
            name="fk_planned_expenses_cost_center_id",
            ondelete="RESTRICT",
            onupdate="RESTRICT",
        ),
        nullable=False,
    )
    expense_concept_id: Mapped[int] = mapped_column(
        BIGINT(unsigned=True),
        ForeignKey(
            "expense_concepts.id",
            name="fk_planned_expenses_expense_concept_id",
            ondelete="RESTRICT",
            onupdate="RESTRICT",
        ),
        nullable=False,
    )
    amount: Mapped[Decimal] = mapped_column(DECIMAL(14, 2), nullable=False)
    supplier: Mapped[str | None] = mapped_column(String(150), nullable=True)
    document_number: Mapped[str | None] = mapped_column(String(80), nullable=True)
    description: Mapped[str | None] = mapped_column(Text(), nullable=True)
    notes: Mapped[str | None] = mapped_column(Text(), nullable=True)

    cost_center: Mapped[CostCenter] = relationship(
        "CostCenter",
        back_populates="planned_expenses",
    )
    expense_concept: Mapped[ExpenseConcept] = relationship(
        "ExpenseConcept",
        back_populates="planned_expenses",
    )
