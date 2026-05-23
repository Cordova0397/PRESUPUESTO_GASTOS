"""Utilidades de zona horaria funcional del negocio.

La zona horaria funcional del proyecto PRESUPUESTO GASTOS es America/Lima.
Las funciones de este modulo se usan como default y onupdate de los
timestamps ORM (created_at, updated_at) para evitar depender de UTC como
fecha funcional.

Las columnas DATETIME en MySQL se guardan como naive y representan
la hora funcional de America/Lima.
"""
from datetime import datetime
from zoneinfo import ZoneInfo


LIMA_TIMEZONE = ZoneInfo("America/Lima")


def now_lima() -> datetime:
    """Retorna la fecha y hora actual en zona horaria America/Lima.

    Se devuelve un datetime naive (sin tzinfo) para almacenar en columnas
    DATETIME de MySQL como hora funcional del negocio.
    """
    return datetime.now(LIMA_TIMEZONE).replace(tzinfo=None)
