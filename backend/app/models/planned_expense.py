"""Modelo ORM para gastos planificados (presupuesto base)."""
from __future__ import annotations

from decimal import Decimal
from typing import TYPE_CHECKING

from sqlalchemy import CheckConstraint, ForeignKey, Index, Text, UniqueConstraint
from sqlalchemy.dialects.mysql import BIGINT, DECIMAL, SMALLINT, TINYINT
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.models.mixins import TimestampMixin


if TYPE_CHECKING:
    from app.models.cost_center import CostCenter
    from app.models.expense_concept import ExpenseConcept


class PlannedExpense(TimestampMixin, Base):
    """Gasto planificado por anio, mes, centro de costo y concepto.

    La integridad de que `expense_concept_id` corresponda al
    `cost_center_id` seleccionado se validara en una tarea posterior
    a nivel de servicios o schemas; no se impone como constraint DB
    compuesto en el MVP.
    """

    __tablename__ = "planned_expenses"
    __table_args__ = (
        UniqueConstraint(
            "year",
            "month",
            "cost_center_id",
            "expense_concept_id",
            name="uq_planned_expenses_period_center_concept",
        ),
        CheckConstraint(
            "month BETWEEN 1 AND 12",
            name="ck_planned_expenses_month_range",
        ),
        CheckConstraint(
            "amount >= 0",
            name="ck_planned_expenses_amount_nonneg",
        ),
        Index("ix_planned_expenses_year_month", "year", "month"),
        {"mysql_engine": "InnoDB", "mysql_charset": "utf8mb4"},
    )

    id: Mapped[int] = mapped_column(
        BIGINT(unsigned=True),
        primary_key=True,
        autoincrement=True,
    )
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
    notes: Mapped[str | None] = mapped_column(Text(), nullable=True)

    cost_center: Mapped[CostCenter] = relationship(
        "CostCenter",
        back_populates="planned_expenses",
    )
    expense_concept: Mapped[ExpenseConcept] = relationship(
        "ExpenseConcept",
        back_populates="planned_expenses",
    )
