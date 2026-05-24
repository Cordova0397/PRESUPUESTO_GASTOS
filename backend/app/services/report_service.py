"""Logica de negocio para reportes y consolidaciones.

En T-015 se consolidan gastos planificados.
En T-016 se consolidan gastos reales.
En T-017 se calcula la desviacion monetaria (real - planificado).
En T-018 se calculan el porcentaje de desviacion y el estado.
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

_ZERO = Decimal("0.00")
_ZERO_PCT = Decimal("0.0000")
_PCT_PRECISION = Decimal("0.0001")


def _calculate_deviation_percentage(
    planned_amount: Decimal,
    deviation_amount: Decimal,
) -> Decimal:
    """Calcula el ratio de desviacion como Decimal de 4 decimales.

    - Si planned_amount > 0: (deviation_amount / planned_amount) con 4 decimales.
    - Si planned_amount = 0: Decimal("0.0000").

    No usa float. No maneja el caso SIN PRESUPUESTO (planned=0, actual>0);
    ese caso lo gestiona el llamador asignando None antes de invocar esta funcion.
    """
    if planned_amount > _ZERO:
        return (deviation_amount / planned_amount).quantize(_PCT_PRECISION)
    return _ZERO_PCT


def _calculate_variance_status(
    planned_amount: Decimal,
    actual_amount: Decimal,
    deviation_amount: Decimal,
) -> str:
    """Determina el estado de la desviacion.

    Estados posibles:
    - "SIN PRESUPUESTO": planned = 0 y actual > 0.
    - "SOBRECOSTO":      planned > 0 y deviation > 0  (se gasto mas de lo previsto).
    - "AHORRO":          planned > 0 y deviation < 0  (se gasto menos de lo previsto).
    - "EN PRESUPUESTO":  deviation = 0 y no aplica SIN PRESUPUESTO.
    """
    if planned_amount == _ZERO and actual_amount > _ZERO:
        return "SIN PRESUPUESTO"
    if deviation_amount > _ZERO:
        return "SOBRECOSTO"
    if deviation_amount < _ZERO:
        return "AHORRO"
    return "EN PRESUPUESTO"


def list_expense_variance(
    db: Session,
    year: int | None,
    month: int | None,
    cost_center_id: int | None,
    expense_concept_id: int | None,
) -> list[ExpenseVarianceRead]:
    """Calcula desviacion monetaria, porcentaje y estado por periodo, centro y concepto.

    Formulas:
        deviation_amount     = actual_amount - planned_amount
        deviation_percentage = deviation_amount / planned_amount  (ratio 4 decimales)

    Casos de deviation_percentage:
    - planned > 0:               ratio calculado.
    - planned = 0 y actual = 0:  Decimal("0.0000").
    - planned = 0 y actual > 0:  None  (estado "SIN PRESUPUESTO").

    Implementacion:
    - Reutiliza repo.list_planned_expenses_consolidated() y
      repo.list_actual_expenses_consolidated() para evitar logica duplicada.
    - La fusion se realiza en memoria usando una clave compuesta
      (year, month, cost_center_id, expense_concept_id).
    - MySQL no soporta FULL OUTER JOIN; la fusion se hace en Python.

    Fuera de alcance:
    - Semaforos visuales.
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

    # 3. Calcular desviacion, porcentaje y estado; construir resultado ordenado
    result: list[ExpenseVarianceRead] = []
    for key in sorted(variance):
        entry = variance[key]
        planned = entry["planned_amount"]
        actual = entry["actual_amount"]
        deviation = actual - planned
        status = _calculate_variance_status(planned, actual, deviation)
        deviation_pct: Decimal | None = (
            None
            if status == "SIN PRESUPUESTO"
            else _calculate_deviation_percentage(planned, deviation)
        )
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
                deviation_amount=deviation,
                deviation_percentage=deviation_pct,
                status=status,
            )
        )
    return result
