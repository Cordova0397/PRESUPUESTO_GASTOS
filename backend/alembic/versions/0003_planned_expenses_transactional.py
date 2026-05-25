"""Homologar planned_expenses a modelo transaccional.

- Agrega planned_date (DATE NOT NULL derivado de year/month existentes)
- Agrega supplier (VARCHAR 150), document_number (VARCHAR 80), description (TEXT)
- Elimina UniqueConstraint uq_planned_expenses_period_center_concept
- Agrega indexes: ix_planned_expenses_planned_date,
  ix_planned_expenses_center_concept, ix_planned_expenses_period_center

Esta migracion es idempotente: tolera estado parcial en MySQL para permitir
reintentos seguros si una ejecucion previa fallo a mitad de camino.

Revision ID: 0003_planned_expenses_transactional
Revises: 0002_create_mvp_tables
Create Date: 2026-05-24
"""
from __future__ import annotations

import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision = "0003_planned_exp_tx"
down_revision = "0002_create_mvp_tables"
branch_labels = None
depends_on = None


TABLE_NAME = "planned_expenses"


def _column_exists(bind, table_name: str, column_name: str) -> bool:
    inspector = sa.inspect(bind)
    return any(col["name"] == column_name for col in inspector.get_columns(table_name))


def _column_is_nullable(bind, table_name: str, column_name: str) -> bool:
    inspector = sa.inspect(bind)
    for col in inspector.get_columns(table_name):
        if col["name"] == column_name:
            return bool(col.get("nullable", True))
    return True


def _index_exists(bind, table_name: str, index_name: str) -> bool:
    inspector = sa.inspect(bind)
    return any(idx["name"] == index_name for idx in inspector.get_indexes(table_name))


def _unique_constraint_exists(bind, table_name: str, constraint_name: str) -> bool:
    inspector = sa.inspect(bind)
    try:
        uniques = inspector.get_unique_constraints(table_name)
    except NotImplementedError:
        uniques = []
    if any(uq.get("name") == constraint_name for uq in uniques):
        return True

    # Fallback robusto para MySQL: las UNIQUE constraints se reflejan
    # tambien como indices unicos.
    for idx in inspector.get_indexes(table_name):
        if idx.get("name") == constraint_name and idx.get("unique"):
            return True

    # Ultimo recurso: consultar INFORMATION_SCHEMA.
    result = bind.execute(
        sa.text(
            "SELECT COUNT(*) FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS "
            "WHERE TABLE_SCHEMA = DATABASE() "
            "AND TABLE_NAME = :table_name "
            "AND CONSTRAINT_NAME = :constraint_name "
            "AND CONSTRAINT_TYPE = 'UNIQUE'"
        ),
        {"table_name": table_name, "constraint_name": constraint_name},
    ).scalar()
    return bool(result)


def upgrade() -> None:
    bind = op.get_bind()

    # 1. Agregar planned_date como nullable temporalmente (solo si no existe)
    if not _column_exists(bind, TABLE_NAME, "planned_date"):
        op.add_column(
            TABLE_NAME,
            sa.Column("planned_date", sa.Date(), nullable=True),
        )

    # 2. Poblar planned_date desde year y month (primer dia del mes) para
    #    cualquier fila que aun la tenga en NULL (incluye filas insertadas
    #    en intentos previos).
    op.execute(
        "UPDATE planned_expenses "
        "SET planned_date = STR_TO_DATE("
        "  CONCAT(year, '-', LPAD(month, 2, '0'), '-01'), "
        "  '%Y-%m-%d'"
        ") "
        "WHERE planned_date IS NULL"
    )

    # 3. Forzar NOT NULL si todavia es nullable
    if _column_is_nullable(bind, TABLE_NAME, "planned_date"):
        op.alter_column(
            TABLE_NAME,
            "planned_date",
            existing_type=sa.Date(),
            nullable=False,
        )

    # 4. Agregar columnas opcionales de detalle transaccional (solo si faltan)
    if not _column_exists(bind, TABLE_NAME, "supplier"):
        op.add_column(
            TABLE_NAME,
            sa.Column("supplier", sa.String(150), nullable=True),
        )
    if not _column_exists(bind, TABLE_NAME, "document_number"):
        op.add_column(
            TABLE_NAME,
            sa.Column("document_number", sa.String(80), nullable=True),
        )
    if not _column_exists(bind, TABLE_NAME, "description"):
        op.add_column(
            TABLE_NAME,
            sa.Column("description", sa.Text(), nullable=True),
        )

    # 5. Eliminar UniqueConstraint solo si todavia existe
    if _unique_constraint_exists(
        bind, TABLE_NAME, "uq_planned_expenses_period_center_concept"
    ):
        op.drop_constraint(
            "uq_planned_expenses_period_center_concept",
            TABLE_NAME,
            type_="unique",
        )

    # 6. Crear nuevos indices solo si no existen
    if not _index_exists(bind, TABLE_NAME, "ix_planned_expenses_planned_date"):
        op.create_index(
            "ix_planned_expenses_planned_date",
            TABLE_NAME,
            ["planned_date"],
        )
    if not _index_exists(bind, TABLE_NAME, "ix_planned_expenses_center_concept"):
        op.create_index(
            "ix_planned_expenses_center_concept",
            TABLE_NAME,
            ["cost_center_id", "expense_concept_id"],
        )
    if not _index_exists(bind, TABLE_NAME, "ix_planned_expenses_period_center"):
        op.create_index(
            "ix_planned_expenses_period_center",
            TABLE_NAME,
            ["year", "month", "cost_center_id"],
        )


def downgrade() -> None:
    bind = op.get_bind()

    # Eliminar indices nuevos solo si existen
    if _index_exists(bind, TABLE_NAME, "ix_planned_expenses_period_center"):
        op.drop_index(
            "ix_planned_expenses_period_center", table_name=TABLE_NAME
        )
    if _index_exists(bind, TABLE_NAME, "ix_planned_expenses_center_concept"):
        op.drop_index(
            "ix_planned_expenses_center_concept", table_name=TABLE_NAME
        )
    if _index_exists(bind, TABLE_NAME, "ix_planned_expenses_planned_date"):
        op.drop_index(
            "ix_planned_expenses_planned_date", table_name=TABLE_NAME
        )

    # Restaurar UniqueConstraint solo si no existe (puede fallar si existen duplicados)
    if not _unique_constraint_exists(
        bind, TABLE_NAME, "uq_planned_expenses_period_center_concept"
    ):
        op.create_unique_constraint(
            "uq_planned_expenses_period_center_concept",
            TABLE_NAME,
            ["year", "month", "cost_center_id", "expense_concept_id"],
        )

    # Eliminar columnas opcionales solo si existen
    if _column_exists(bind, TABLE_NAME, "description"):
        op.drop_column(TABLE_NAME, "description")
    if _column_exists(bind, TABLE_NAME, "document_number"):
        op.drop_column(TABLE_NAME, "document_number")
    if _column_exists(bind, TABLE_NAME, "supplier"):
        op.drop_column(TABLE_NAME, "supplier")

    # Eliminar planned_date solo si existe
    if _column_exists(bind, TABLE_NAME, "planned_date"):
        op.drop_column(TABLE_NAME, "planned_date")
