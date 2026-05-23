"""Modelo ORM para conceptos o categorias de gasto."""
from __future__ import annotations

from typing import TYPE_CHECKING

from sqlalchemy import Boolean, ForeignKey, Integer, String, Text, UniqueConstraint
from sqlalchemy.dialects.mysql import BIGINT
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.models.mixins import TimestampMixin


if TYPE_CHECKING:
    from app.models.actual_expense import ActualExpense
    from app.models.cost_center import CostCenter
    from app.models.planned_expense import PlannedExpense


class ExpenseConcept(TimestampMixin, Base):
    """Concepto de gasto asociado a un centro de costo.

    Para el MVP, un concepto pertenece a un unico centro de costo. La
    unicidad de `code` aplica por centro de costo y no de forma global.
    """

    __tablename__ = "expense_concepts"
    __table_args__ = (
        UniqueConstraint(
            "cost_center_id",
            "code",
            name="uq_expense_concepts_center_code",
        ),
        {"mysql_engine": "InnoDB", "mysql_charset": "utf8mb4"},
    )

    id: Mapped[int] = mapped_column(
        BIGINT(unsigned=True),
        primary_key=True,
        autoincrement=True,
    )
    cost_center_id: Mapped[int] = mapped_column(
        BIGINT(unsigned=True),
        ForeignKey(
            "cost_centers.id",
            name="fk_expense_concepts_cost_center_id",
            ondelete="RESTRICT",
            onupdate="RESTRICT",
        ),
        nullable=False,
        index=True,
    )
    code: Mapped[str] = mapped_column(String(30), nullable=False)
    name: Mapped[str] = mapped_column(String(150), nullable=False)
    description: Mapped[str | None] = mapped_column(Text(), nullable=True)
    sort_order: Mapped[int | None] = mapped_column(Integer(), nullable=True)
    is_active: Mapped[bool] = mapped_column(
        Boolean(),
        nullable=False,
        default=True,
        server_default="1",
    )

    cost_center: Mapped[CostCenter] = relationship(
        "CostCenter",
        back_populates="expense_concepts",
    )
    planned_expenses: Mapped[list[PlannedExpense]] = relationship(
        "PlannedExpense",
        back_populates="expense_concept",
        cascade="save-update, merge",
        passive_deletes=True,
    )
    actual_expenses: Mapped[list[ActualExpense]] = relationship(
        "ActualExpense",
        back_populates="expense_concept",
        cascade="save-update, merge",
        passive_deletes=True,
    )
