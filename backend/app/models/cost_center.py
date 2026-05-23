"""Modelo ORM para centros de costo."""
from __future__ import annotations

from typing import TYPE_CHECKING

from sqlalchemy import Boolean, Integer, String, Text, UniqueConstraint
from sqlalchemy.dialects.mysql import BIGINT
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.models.mixins import TimestampMixin


if TYPE_CHECKING:
    from app.models.actual_expense import ActualExpense
    from app.models.expense_concept import ExpenseConcept
    from app.models.planned_expense import PlannedExpense


class CostCenter(TimestampMixin, Base):
    """Catalogo base de centros de costo del presupuesto."""

    __tablename__ = "cost_centers"
    __table_args__ = (
        UniqueConstraint("code", name="uq_cost_centers_code"),
        {"mysql_engine": "InnoDB", "mysql_charset": "utf8mb4"},
    )

    id: Mapped[int] = mapped_column(
        BIGINT(unsigned=True),
        primary_key=True,
        autoincrement=True,
    )
    code: Mapped[str] = mapped_column(String(30), nullable=False)
    name: Mapped[str] = mapped_column(String(150), nullable=False)
    description: Mapped[str | None] = mapped_column(Text(), nullable=True)
    color: Mapped[str | None] = mapped_column(String(30), nullable=True)
    sort_order: Mapped[int | None] = mapped_column(Integer(), nullable=True)
    is_active: Mapped[bool] = mapped_column(
        Boolean(),
        nullable=False,
        default=True,
        server_default="1",
    )

    expense_concepts: Mapped[list[ExpenseConcept]] = relationship(
        "ExpenseConcept",
        back_populates="cost_center",
        cascade="save-update, merge",
        passive_deletes=True,
    )
    planned_expenses: Mapped[list[PlannedExpense]] = relationship(
        "PlannedExpense",
        back_populates="cost_center",
        cascade="save-update, merge",
        passive_deletes=True,
    )
    actual_expenses: Mapped[list[ActualExpense]] = relationship(
        "ActualExpense",
        back_populates="cost_center",
        cascade="save-update, merge",
        passive_deletes=True,
    )
