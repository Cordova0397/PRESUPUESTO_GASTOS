"""Logica de negocio para reportes y consolidaciones.

En T-015 se consolidan gastos planificados.
En T-016 se consolidan gastos reales.
En T-017 se calcula la desviacion monetaria (real - planificado).
No se calculan porcentaje ni semaforos; esos calculos corresponden
a tareas posteriores del sprint.
"""
from __future__ import annotations

from decimal import Decimal

from sqlalchemy.orm import Session

from app.repositories import report_repository as repo
from app.schemas.report import (
    ActualExpenseConsolidatedRead,
    ExpenseVarianceRead,
    PlannedExpenseConsolidatedRead,
)


def list_planned_expenses_consolidated(
    db: Session,
    year: int | None,
    month: int | None,
    cost_center_id: int | None,
    expense_concept_id: int | None,
) -> list[PlannedExpenseConsolidatedRead]:
    """Devuelve el consolidado de gastos planificados por periodo, centro y concepto.

    Responsabilidades:
    - Delegar la consulta al repositorio.
    - Construir y devolver lista de PlannedExpenseConsolidatedRead.

    Fuera de alcance de esta funcion:
    - Gastos reales.
    - Calculo de desviacion (gasto real - gasto planificado).
    - Calculo de porcentaje de ejecucion.
    """
    rows = repo.list_planned_expenses_consolidated(
        db,
        year=year,
        month=month,
        cost_center_id=cost_center_id,
        expense_concept_id=expense_concept_id,
    )
    return [PlannedExpenseConsolidatedRead.model_validate(row) for row in rows]


def list_actual_expenses_consolidated(
    db: Session,
    year: int | None,
    month: int | None,
    cost_center_id: int | None,
    expense_concept_id: int | None,
) -> list[ActualExpenseConsolidatedRead]:
    """Devuelve el consolidado de gastos reales por periodo, centro y concepto.

    Responsabilidades:
    - Delegar la consulta al repositorio.
    - Construir y devolver lista de ActualExpenseConsolidatedRead.

    Fuera de alcance de esta funcion:
    - Gastos planificados.
    - Calculo de desviacion (gasto real - gasto planificado).
    - Calculo de porcentaje de ejecucion.
    """
    rows = repo.list_actual_expenses_consolidated(
        db,
        year=year,
        month=month,
        cost_center_id=cost_center_id,
        expense_concept_id=expense_concept_id,
    )
    return [ActualExpenseConsolidatedRead.model_validate(row) for row in rows]


# ---------------------------------------------------------------------------
# Tipo interno para el acumulador de desviacion
# ---------------------------------------------------------------------------
_VarKey = tuple  # (year, month, cost_center_id, expense_concept_id)


def list_expense_variance(
    db: Session,
    year: int | None,
    month: int | None,
    cost_center_id: int | None,
    expense_concept_id: int | None,
) -> list[ExpenseVarianceRead]:
    """Calcula la desviacion monetaria por periodo, centro y concepto.

    Formula obligatoria:
        deviation_amount = actual_amount - planned_amount

    Casos manejados:
    - Planificado y real presentes:    deviation = actual - planned
    - Solo planificado (sin real):     actual = 0.00, deviation = 0.00 - planned
    - Solo real (sin planificado):     planned = 0.00, deviation = actual - 0.00

    Implementacion:
    - Reutiliza repo.list_planned_expenses_consolidated() y
      repo.list_actual_expenses_consolidated() para evitar logica duplicada.
    - La fusion se realiza en memoria usando una clave compuesta
      (year, month, cost_center_id, expense_concept_id).
    - MySQL no soporta FULL OUTER JOIN, por lo que no se usa SQL para la fusion.

    Fuera de alcance:
    - Porcentaje de ejecucion.
    - Estado SIN PRESUPUESTO.
    - Semaforos de alerta.
    """
    planned_rows = repo.list_planned_expenses_consolidated(
        db,
        year=year,
        month=month,
        cost_center_id=cost_center_id,
        expense_concept_id=expense_concept_id,
    )
    actual_rows = repo.list_actual_expenses_consolidated(
        db,
        year=year,
        month=month,
        cost_center_id=cost_center_id,
        expense_concept_id=expense_concept_id,
    )

    # Acumulador indexado por clave compuesta
    variance: dict[_VarKey, dict] = {}

    # 1. Insertar planificados; actual_amount empieza en cero
    for row in planned_rows:
        key: _VarKey = (
            row["year"],
            row["month"],
            row["cost_center_id"],
            row["expense_concept_id"],
        )
        variance[key] = {
            "year": row["year"],
            "month": row["month"],
            "cost_center_id": row["cost_center_id"],
            "cost_center_code": row["cost_center_code"],
            "cost_center_name": row["cost_center_name"],
            "expense_concept_id": row["expense_concept_id"],
            "expense_concept_code": row["expense_concept_code"],
            "expense_concept_name": row["expense_concept_name"],
            "planned_amount": Decimal(str(row["planned_amount"])),
            "actual_amount": Decimal("0.00"),
        }

    # 2. Fusionar reales; si la clave no existe la crea con planned_amount = 0.00
    for row in actual_rows:
        key = (
            row["year"],
            row["month"],
            row["cost_center_id"],
            row["expense_concept_id"],
        )
        if key in variance:
            variance[key]["actual_amount"] = Decimal(str(row["actual_amount"]))
        else:
            variance[key] = {
                "year": row["year"],
                "month": row["month"],
                "cost_center_id": row["cost_center_id"],
                "cost_center_code": row["cost_center_code"],
                "cost_center_name": row["cost_center_name"],
                "expense_concept_id": row["expense_concept_id"],
                "expense_concept_code": row["expense_concept_code"],
                "expense_concept_name": row["expense_concept_name"],
                "planned_amount": Decimal("0.00"),
                "actual_amount": Decimal(str(row["actual_amount"])),
            }

    # 3. Calcular desviacion y construir resultado ordenado
    result: list[ExpenseVarianceRead] = []
    for key in sorted(variance):
        entry = variance[key]
        planned = entry["planned_amount"]
        actual = entry["actual_amount"]
        result.append(
            ExpenseVarianceRead(
                year=entry["year"],
                month=entry["month"],
                cost_center_id=entry["cost_center_id"],
                cost_center_code=entry["cost_center_code"],
                cost_center_name=entry["cost_center_name"],
                expense_concept_id=entry["expense_concept_id"],
                expense_concept_code=entry["expense_concept_code"],
                expense_concept_name=entry["expense_concept_name"],
                planned_amount=planned,
                actual_amount=actual,
                deviation_amount=actual - planned,
            )
        )
    return result
