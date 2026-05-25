# -*- coding: utf-8 -*-
"""Seed inicial de catalogos: centros de costo y conceptos de gasto.

Uso desde la raiz del proyecto:
    backend\\.venv\\Scripts\\python.exe scripts\\seed_initial_catalogs.py

O mediante:
    seed_catalogs.bat

El script es idempotente. Puede ejecutarse multiples veces sin duplicar
registros. Si el registro existe por su codigo clave, lo actualiza; si no
existe, lo crea.

No se cargan gastos planificados ni gastos reales en esta tarea.
No se exponen DATABASE_URL ni credenciales.
"""
from __future__ import annotations

import sys
import os

# Asegurar que backend/ este en sys.path para importar app.*
# El script se ejecuta desde la raiz o desde scripts/; en ambos casos
# backend/ esta en el mismo nivel que scripts/.
_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
_BACKEND = os.path.join(_ROOT, "backend")
if _BACKEND not in sys.path:
    sys.path.insert(0, _BACKEND)
# pydantic_settings busca .env relativo al CWD; aseguramos que sea backend/
os.chdir(_BACKEND)

from sqlalchemy.orm import Session

from app.core.database import SessionLocal
from app.models.cost_center import CostCenter
from app.models.expense_concept import ExpenseConcept


# ---------------------------------------------------------------------------
# Datos iniciales: 5 centros de costo y 37 conceptos de gasto
# ---------------------------------------------------------------------------
CATALOGS: list[dict] = [
    {
        "code": "PROD_OP",
        "name": "Centro de Costos de Producción / Operaciones",
        "color": "#dc2626",
        "sort_order": 10,
        "concepts": [
            {"code": "SALARIOS",   "name": "Salarios",   "sort_order": 10},
            {"code": "BENEFICIOS", "name": "Beneficios", "sort_order": 20},
        ],
    },
    {
        "code": "VENTAS",
        "name": "Centro de Costos de Ventas",
        "color": "#15803d",
        "sort_order": 20,
        "concepts": [
            {"code": "SUELDO_VENDEDORES",   "name": "Sueldo Vendedores",   "sort_order": 10},
            {"code": "COMISIONES",           "name": "Comisiones",           "sort_order": 20},
            {"code": "VIATICOS",             "name": "Viáticos",             "sort_order": 30},
            {"code": "CAPACITACIONES",       "name": "Capacitaciones",       "sort_order": 40},
            {"code": "MOVILIDAD_COMERCIAL",  "name": "Movilidad Comercial",  "sort_order": 50},
            {"code": "FACEBOOK_ADS",         "name": "Facebook Ads",         "sort_order": 60},
            {"code": "TELEFONIA_VENTAS",     "name": "Telefonía Ventas",     "sort_order": 70},
            {"code": "GOOGLE_ADS",           "name": "Google Ads",           "sort_order": 80},
        ],
    },
    {
        "code": "MARKETING",
        "name": "Centro de Costos de Marketing",
        "color": "#15803d",
        "sort_order": 30,
        "concepts": [
            {"code": "SUELDO_VENDEDORES",      "name": "Sueldo Vendedores",      "sort_order": 10},
            {"code": "PRODUCCION_AUDIOVISUAL", "name": "Producción audiovisual", "sort_order": 20},
            {"code": "MERCHANDISING",          "name": "Merchandising",          "sort_order": 30},
            {"code": "EVENTOS",                "name": "Eventos",                "sort_order": 40},
            {"code": "REGALOS_CORPORATIVOS",   "name": "Regalos Corporativos",   "sort_order": 50},
            {"code": "FACEBOOK_ADS",           "name": "Facebook Ads",           "sort_order": 60},
            {"code": "TELEFONIA_COMERCIAL",    "name": "Telefonía Comercial",    "sort_order": 70},
        ],
    },
    {
        "code": "ADM_GEN",
        "name": "Centro de Costos Administrativos (Generales)",
        "color": "#be185d",
        "sort_order": 40,
        "concepts": [
            {"code": "SUELDO_ADMINISTRATIVO", "name": "Sueldo Administrativo", "sort_order":  10},
            {"code": "SUELDO_GERENCIA",        "name": "Sueldo Gerencia",        "sort_order":  20},
            {"code": "SUELDO_CONTABILIDAD",    "name": "Sueldo Contabilidad",    "sort_order":  30},
            {"code": "RRHH",                   "name": "RRHH",                   "sort_order":  40},
            {"code": "INTERNET",               "name": "Internet",               "sort_order":  50},
            {"code": "TELEFONIA",              "name": "Telefonía",              "sort_order":  60},
            {"code": "AGUA",                   "name": "Agua",                   "sort_order":  70},
            {"code": "LUZ",                    "name": "Luz",                    "sort_order":  80},
            {"code": "ALQUILER_LOCAL",         "name": "Alquiler Local",         "sort_order":  90},
            {"code": "VIGILANCIA",             "name": "Vigilancia",             "sort_order": 100},
            {"code": "UTILES_OFICINA",         "name": "Útiles de Oficina",      "sort_order": 110},
            {"code": "PAPELERIA",              "name": "Papelería",              "sort_order": 120},
            {"code": "IMPRESIONES",            "name": "Impresiones",            "sort_order": 130},
            {"code": "LICENCIAS_SOFTWARE",     "name": "Licencias software",     "sort_order": 140},
            {"code": "SEGUROS",                "name": "Seguros",                "sort_order": 150},
            {"code": "ASESORIA_LEGAL",         "name": "Asesoría legal",         "sort_order": 160},
            {"code": "IMPUESTOS",              "name": "Impuestos",              "sort_order": 170},
        ],
    },
    {
        "code": "SERV_SOP",
        "name": "Centro de Costos de Servicios / Soporte",
        "color": "#dc2626",
        "sort_order": 50,
        "concepts": [
            {"code": "SUELDO_OPERATIVOS",        "name": "Sueldo Operativos",            "sort_order": 10},
            {"code": "CURSOS_APRENDIZAJE",       "name": "Cursos de aprendizaje",        "sort_order": 20},
            {"code": "COSTOS_VIAJES_APRENDIZAJE","name": "Costos de viajes de aprendizaje","sort_order": 30},
        ],
    },
]


def _upsert_cost_center(db: Session, data: dict) -> tuple[CostCenter, bool]:
    """Crea o actualiza un centro de costo por su code.

    Retorna (instancia, fue_creado).
    """
    center = db.query(CostCenter).filter_by(code=data["code"]).first()
    created = center is None
    if created:
        center = CostCenter(
            code=data["code"],
            name=data["name"],
            color=data.get("color"),
            sort_order=data.get("sort_order"),
            is_active=True,
        )
        db.add(center)
        db.flush()  # obtener center.id antes de usarlo en conceptos
    else:
        center.name = data["name"]
        center.color = data.get("color")
        center.sort_order = data.get("sort_order")
        center.is_active = True
    return center, created


def _upsert_expense_concept(
    db: Session,
    center: CostCenter,
    data: dict,
) -> bool:
    """Crea o actualiza un concepto de gasto por cost_center_id + code.

    Retorna True si fue creado, False si fue actualizado.
    """
    concept = (
        db.query(ExpenseConcept)
        .filter_by(cost_center_id=center.id, code=data["code"])
        .first()
    )
    created = concept is None
    if created:
        concept = ExpenseConcept(
            cost_center_id=center.id,
            code=data["code"],
            name=data["name"],
            sort_order=data.get("sort_order"),
            is_active=True,
        )
        db.add(concept)
    else:
        concept.name = data["name"]
        concept.sort_order = data.get("sort_order")
        concept.is_active = True
    return created


def seed_catalogs() -> None:
    """Ejecuta el seed idempotente de centros de costo y conceptos de gasto."""
    print("Iniciando seed de catalogos iniciales...")
    print()

    centers_created = 0
    centers_updated = 0
    concepts_created = 0
    concepts_updated = 0

    db: Session = SessionLocal()
    try:
        for entry in CATALOGS:
            center, c_created = _upsert_cost_center(db, entry)
            if c_created:
                centers_created += 1
                print(f"  [NUEVO]       Centro: {entry['code']}")
            else:
                centers_updated += 1
                print(f"  [ACTUALIZADO] Centro: {entry['code']}")

            for concept_data in entry.get("concepts", []):
                con_created = _upsert_expense_concept(db, center, concept_data)
                if con_created:
                    concepts_created += 1
                    print(f"                  [NUEVO]       Concepto: {concept_data['code']}")
                else:
                    concepts_updated += 1
                    print(f"                  [ACTUALIZADO] Concepto: {concept_data['code']}")

        db.commit()
        print()
        print("Seed completado exitosamente.")
        print(f"  Centros creados:    {centers_created}")
        print(f"  Centros actualizados: {centers_updated}")
        print(f"  Conceptos creados:  {concepts_created}")
        print(f"  Conceptos actualizados: {concepts_updated}")

    except Exception as exc:
        db.rollback()
        print()
        print(f"ERROR durante el seed. Se hizo rollback.")
        print(f"Detalle: {exc}")
        sys.exit(1)
    finally:
        db.close()


if __name__ == "__main__":
    seed_catalogs()
