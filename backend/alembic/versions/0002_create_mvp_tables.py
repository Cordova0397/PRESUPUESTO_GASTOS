"""Crear tablas MVP: cost_centers, expense_concepts, planned_expenses, actual_expenses.

Revision ID: 0002_create_mvp_tables
Revises: 0001_initial_empty
Create Date: 2026-05-22

"""
from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import mysql


revision: str = "0002_create_mvp_tables"
down_revision: str | None = "0001_initial_empty"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        "cost_centers",
        sa.Column(
            "id",
            mysql.BIGINT(unsigned=True),
            autoincrement=True,
            nullable=False,
        ),
        sa.Column("code", sa.String(length=30), nullable=False),
        sa.Column("name", sa.String(length=150), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("color", sa.String(length=30), nullable=True),
        sa.Column("sort_order", sa.Integer(), nullable=True),
        sa.Column(
            "is_active",
            sa.Boolean(),
            nullable=False,
            server_default=sa.text("1"),
        ),
        sa.Column("created_at", sa.DateTime(timezone=False), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=False), nullable=False),
        sa.PrimaryKeyConstraint("id", name="pk_cost_centers"),
        sa.UniqueConstraint("code", name="uq_cost_centers_code"),
        mysql_engine="InnoDB",
        mysql_charset="utf8mb4",
    )

    op.create_table(
        "expense_concepts",
        sa.Column(
            "id",
            mysql.BIGINT(unsigned=True),
            autoincrement=True,
            nullable=False,
        ),
        sa.Column(
            "cost_center_id",
            mysql.BIGINT(unsigned=True),
            nullable=False,
        ),
        sa.Column("code", sa.String(length=30), nullable=False),
        sa.Column("name", sa.String(length=150), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("sort_order", sa.Integer(), nullable=True),
        sa.Column(
            "is_active",
            sa.Boolean(),
            nullable=False,
            server_default=sa.text("1"),
        ),
        sa.Column("created_at", sa.DateTime(timezone=False), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=False), nullable=False),
        sa.PrimaryKeyConstraint("id", name="pk_expense_concepts"),
        sa.ForeignKeyConstraint(
            ["cost_center_id"],
            ["cost_centers.id"],
            name="fk_expense_concepts_cost_center_id",
            ondelete="RESTRICT",
            onupdate="RESTRICT",
        ),
        sa.UniqueConstraint(
            "cost_center_id",
            "code",
            name="uq_expense_concepts_center_code",
        ),
        mysql_engine="InnoDB",
        mysql_charset="utf8mb4",
    )
    op.create_index(
        "ix_expense_concepts_cost_center_id",
        "expense_concepts",
        ["cost_center_id"],
        unique=False,
    )

    op.create_table(
        "planned_expenses",
        sa.Column(
            "id",
            mysql.BIGINT(unsigned=True),
            autoincrement=True,
            nullable=False,
        ),
        sa.Column("year", mysql.SMALLINT(unsigned=True), nullable=False),
        sa.Column("month", mysql.TINYINT(unsigned=True), nullable=False),
        sa.Column(
            "cost_center_id",
            mysql.BIGINT(unsigned=True),
            nullable=False,
        ),
        sa.Column(
            "expense_concept_id",
            mysql.BIGINT(unsigned=True),
            nullable=False,
        ),
        sa.Column("amount", mysql.DECIMAL(precision=14, scale=2), nullable=False),
        sa.Column("notes", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=False), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=False), nullable=False),
        sa.PrimaryKeyConstraint("id", name="pk_planned_expenses"),
        sa.ForeignKeyConstraint(
            ["cost_center_id"],
            ["cost_centers.id"],
            name="fk_planned_expenses_cost_center_id",
            ondelete="RESTRICT",
            onupdate="RESTRICT",
        ),
        sa.ForeignKeyConstraint(
            ["expense_concept_id"],
            ["expense_concepts.id"],
            name="fk_planned_expenses_expense_concept_id",
            ondelete="RESTRICT",
            onupdate="RESTRICT",
        ),
        sa.UniqueConstraint(
            "year",
            "month",
            "cost_center_id",
            "expense_concept_id",
            name="uq_planned_expenses_period_center_concept",
        ),
        sa.CheckConstraint(
            "month BETWEEN 1 AND 12",
            name="ck_planned_expenses_month_range",
        ),
        sa.CheckConstraint(
            "amount >= 0",
            name="ck_planned_expenses_amount_nonneg",
        ),
        mysql_engine="InnoDB",
        mysql_charset="utf8mb4",
    )
    op.create_index(
        "ix_planned_expenses_year_month",
        "planned_expenses",
        ["year", "month"],
        unique=False,
    )

    op.create_table(
        "actual_expenses",
        sa.Column(
            "id",
            mysql.BIGINT(unsigned=True),
            autoincrement=True,
            nullable=False,
        ),
        sa.Column("expense_date", sa.Date(), nullable=False),
        sa.Column("year", mysql.SMALLINT(unsigned=True), nullable=False),
        sa.Column("month", mysql.TINYINT(unsigned=True), nullable=False),
        sa.Column(
            "cost_center_id",
            mysql.BIGINT(unsigned=True),
            nullable=False,
        ),
        sa.Column(
            "expense_concept_id",
            mysql.BIGINT(unsigned=True),
            nullable=False,
        ),
        sa.Column("amount", mysql.DECIMAL(precision=14, scale=2), nullable=False),
        sa.Column("supplier", sa.String(length=150), nullable=True),
        sa.Column("document_number", sa.String(length=80), nullable=True),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("notes", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=False), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=False), nullable=False),
        sa.PrimaryKeyConstraint("id", name="pk_actual_expenses"),
        sa.ForeignKeyConstraint(
            ["cost_center_id"],
            ["cost_centers.id"],
            name="fk_actual_expenses_cost_center_id",
            ondelete="RESTRICT",
            onupdate="RESTRICT",
        ),
        sa.ForeignKeyConstraint(
            ["expense_concept_id"],
            ["expense_concepts.id"],
            name="fk_actual_expenses_expense_concept_id",
            ondelete="RESTRICT",
            onupdate="RESTRICT",
        ),
        sa.CheckConstraint(
            "month BETWEEN 1 AND 12",
            name="ck_actual_expenses_month_range",
        ),
        sa.CheckConstraint(
            "amount > 0",
            name="ck_actual_expenses_amount_pos",
        ),
        mysql_engine="InnoDB",
        mysql_charset="utf8mb4",
    )
    op.create_index(
        "ix_actual_expenses_expense_date",
        "actual_expenses",
        ["expense_date"],
        unique=False,
    )
    op.create_index(
        "ix_actual_expenses_year_month",
        "actual_expenses",
        ["year", "month"],
        unique=False,
    )
    op.create_index(
        "ix_actual_expenses_center_concept",
        "actual_expenses",
        ["cost_center_id", "expense_concept_id"],
        unique=False,
    )
    op.create_index(
        "ix_actual_expenses_period_center",
        "actual_expenses",
        ["year", "month", "cost_center_id"],
        unique=False,
    )


def downgrade() -> None:
    op.drop_index("ix_actual_expenses_period_center", table_name="actual_expenses")
    op.drop_index("ix_actual_expenses_center_concept", table_name="actual_expenses")
    op.drop_index("ix_actual_expenses_year_month", table_name="actual_expenses")
    op.drop_index("ix_actual_expenses_expense_date", table_name="actual_expenses")
    op.drop_table("actual_expenses")

    op.drop_index("ix_planned_expenses_year_month", table_name="planned_expenses")
    op.drop_table("planned_expenses")

    op.drop_index("ix_expense_concepts_cost_center_id", table_name="expense_concepts")
    op.drop_table("expense_concepts")

    op.drop_table("cost_centers")
