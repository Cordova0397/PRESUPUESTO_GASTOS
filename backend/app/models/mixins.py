"""Mixins reutilizables para modelos ORM."""
from datetime import datetime

from sqlalchemy import DateTime
from sqlalchemy.orm import Mapped, mapped_column

from app.core.timezone import now_lima


class TimestampMixin:
    """Agrega columnas created_at y updated_at en hora funcional America/Lima.

    Las columnas son DATETIME naive en MySQL. Su valor representa la hora
    funcional del negocio (America/Lima), no UTC.
    """

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=False),
        nullable=False,
        default=now_lima,
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=False),
        nullable=False,
        default=now_lima,
        onupdate=now_lima,
    )
