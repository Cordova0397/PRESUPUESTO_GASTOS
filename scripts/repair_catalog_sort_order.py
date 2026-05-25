# -*- coding: utf-8 -*-
"""Normaliza sort_order de centros de costo y conceptos de gasto segun el orden
original del Excel.

Uso desde la raiz del proyecto:
    backend\\.venv\\Scripts\\python.exe scripts\\repair_catalog_sort_order.py

Idempotente: puede ejecutarse multiples veces sin efectos negativos.
Solo actualiza sort_order; no inserta ni elimina registros.
Si un codigo esperado no existe en la BD, imprime WARN y continua.
"""
from __future__ import annotations

import sys
import os

_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
_BACKEND = os.path.join(_ROOT, "backend")
if _BACKEND not in sys.path:
    sys.path.insert(0, _BACKEND)
# pydantic_settings busca .env relativo al CWD; aseguramos que sea backend/
os.chdir(_BACKEND)

from app.core.database import SessionLocal
from app.models.cost_center import CostCenter
from app.models.expense_concept import ExpenseConcept

# ---------------------------------------------------------------------------
# Orden esperado de centros de costo (code -> sort_order)
# ---------------------------------------------------------------------------
CENTER_ORDER: dict[str, int] = {
    "PROD_OP":   10,
    "VENTAS":    20,
    "MARKETING": 30,
    "ADM_GEN":   40,
    "SERV_SOP":  50,
}

# ---------------------------------------------------------------------------
# Orden esperado de conceptos por centro (center_code -> {concept_code -> sort_order})
# ---------------------------------------------------------------------------
CONCEPT_ORDER: dict[str, dict[str, int]] = {
    "PROD_OP": {
        "SALARIOS":   10,
        "BENEFICIOS": 20,
    },
    "VENTAS": {
        "SUELDO_VENDEDORES":  10,
        "COMISIONES":         20,
        "VIATICOS":           30,
        "CAPACITACIONES":     40,
        "MOVILIDAD_COMERCIAL":50,
        "FACEBOOK_ADS":       60,
        "TELEFONIA_VENTAS":   70,
        "GOOGLE_ADS":         80,
    },
    "MARKETING": {
        "SUELDO_VENDEDORES":     10,
        "PRODUCCION_AUDIOVISUAL":20,
        "MERCHANDISING":         30,
        "EVENTOS":               40,
        "REGALOS_CORPORATIVOS":  50,
        "FACEBOOK_ADS":          60,
        "TELEFONIA_COMERCIAL":   70,
    },
    "ADM_GEN": {
        "SUELDO_ADMINISTRATIVO": 10,
        "SUELDO_GERENCIA":       20,
        "SUELDO_CONTABILIDAD":   30,
        "RRHH":                  40,
        "INTERNET":              50,
        "TELEFONIA":             60,
        "AGUA":                  70,
        "LUZ":                   80,
        "ALQUILER_LOCAL":        90,
        "VIGILANCIA":           100,
        "UTILES_OFICINA":       110,
        "PAPELERIA":            120,
        "IMPRESIONES":          130,
        "LICENCIAS_SOFTWARE":   140,
        "SEGUROS":              150,
        "ASESORIA_LEGAL":       160,
        "IMPUESTOS":            170,
    },
    "SERV_SOP": {
        "SUELDO_OPERATIVOS":         10,
        "CURSOS_APRENDIZAJE":        20,
        "COSTOS_VIAJES_APRENDIZAJE": 30,
    },
}


def main() -> int:
    print("Normalizando sort_order de catalogos...")
    print()

    centers_ok = 0
    concepts_ok = 0
    warnings: list[str] = []

    db = SessionLocal()
    try:
        # --- Centros de costo ---
        for center_code, sort_order in CENTER_ORDER.items():
            center = db.query(CostCenter).filter_by(code=center_code).first()
            if center is None:
                msg = f"Centro no encontrado: {center_code}"
                print(f"  [WARN] {msg}")
                warnings.append(msg)
                continue
            center.sort_order = sort_order
            centers_ok += 1
            print(f"  [OK] Centro {center_code:12s} -> sort_order={sort_order}")

            # --- Conceptos de ese centro ---
            concept_map = CONCEPT_ORDER.get(center_code, {})
            for concept_code, c_sort in concept_map.items():
                concept = (
                    db.query(ExpenseConcept)
                    .filter_by(cost_center_id=center.id, code=concept_code)
                    .first()
                )
                if concept is None:
                    msg = f"Concepto no encontrado: {center_code} / {concept_code}"
                    print(f"       [WARN] {msg}")
                    warnings.append(msg)
                    continue
                concept.sort_order = c_sort
                concepts_ok += 1

        db.commit()

    except Exception as exc:
        db.rollback()
        print()
        print(f"[ERROR] Fallo inesperado. Se hizo rollback.")
        print(f"        Detalle: {exc}")
        return 1
    finally:
        db.close()

    print()
    print("--- Resumen ---")
    print(f"  Centros actualizados:  {centers_ok}")
    print(f"  Conceptos actualizados:{concepts_ok}")
    if warnings:
        print(f"  Warnings ({len(warnings)}):")
        for w in warnings:
            print(f"    - {w}")
    else:
        print("  Warnings: ninguno")
    print()
    print("Orden de catalogos normalizado.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
