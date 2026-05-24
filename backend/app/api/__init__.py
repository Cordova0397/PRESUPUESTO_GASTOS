"""Paquete para endpoints de la API."""
from app.api.cost_centers import router as cost_centers_router  # noqa: F401
from app.api.expense_concepts import router as expense_concepts_router  # noqa: F401
from app.api.planned_expenses import router as planned_expenses_router  # noqa: F401
from app.api.actual_expenses import router as actual_expenses_router  # noqa: F401
from app.api.reports import router as reports_router  # noqa: F401
