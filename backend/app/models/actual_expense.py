"""Modelo ORM para gastos reales transaccionales."""
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


class ActualExpense(TimestampMixin, Base):
    """Gasto real transaccional.

    Se permiten multiples registros para el mismo periodo, centro de costo
    y concepto. La validacion de que `expense_concept_id` corresponda al
    `cost_center_id` seleccionado, y de que `year`/`month` sean
    consistentes con `expense_date` (America/Lima) se hara en una tarea
    posterior a nivel de servicios o schemas.
    """

    __tablename__ = "actual_expenses"
    __table_args__ = (
        CheckConstraint(
            "month BETWEEN 1 AND 12",
            name="ck_actual_expenses_month_range",
        ),
        CheckConstraint(
            "amount > 0",
            name="ck_actual_expenses_amount_pos",
        ),
        Index("ix_actual_expenses_expense_date", "expense_date"),
        Index("ix_actual_expenses_year_month", "year", "month"),
        Index(
            "ix_actual_expenses_center_concept",
            "cost_center_id",
            "expense_concept_id",
        ),
        Index(
            "ix_actual_expenses_period_center",
            "year",
            "month",
            "cost_center_id",
        ),
        {"mysql_engine": "InnoDB", "mysql_charset": "utf8mb4"},
    )

    id: Mapped[int] = mapped_column(
        BIGINT(unsigned=True),
        primary_key=True,
        autoincrement=True,
    )
    expense_date: Mapped[date] = mapped_column(Date(), nullable=False)
    year: Mapped[int] = mapped_column(SMALLINT(unsigned=True), nullable=False)
    month: Mapped[int] = mapped_column(TINYINT(unsigned=True), nullable=False)
    cost_center_id: Mapped[int] = mapped_column(
        BIGINT(unsigned=True),
        ForeignKey(
            "cost_centers.id",
            name="fk_actual_expenses_cost_center_id",
            ondelete="RESTRICT",
            onupdate="RESTRICT",
        ),
        nullable=False,
    )
    expense_concept_id: Mapped[int] = mapped_column(
        BIGINT(unsigned=True),
        ForeignKey(
            "expense_concepts.id",
            name="fk_actual_expenses_expense_concept_id",
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
        back_populates="actual_expenses",
    )
    expense_concept: Mapped[ExpenseConcept] = relationship(
        "ExpenseConcept",
        back_populates="actual_expenses",
    )
