from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.actual_expenses import router as actual_expenses_router
from app.api.cost_centers import router as cost_centers_router
from app.api.expense_concepts import router as expense_concepts_router
from app.api.planned_expenses import router as planned_expenses_router
from app.core.config import settings
from app.core.database import check_database_connection


app = FastAPI(title=settings.app_name)

app.include_router(cost_centers_router)
app.include_router(expense_concepts_router)
app.include_router(planned_expenses_router)
app.include_router(actual_expenses_router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def healthcheck() -> dict[str, str]:
    return {
        "status": "ok",
        "app": settings.app_name,
        "env": settings.app_env,
        "timezone": settings.app_timezone,
    }


@app.get("/health/db")
def database_healthcheck() -> dict[str, str]:
    try:
        check_database_connection()
    except Exception:
        return {
            "status": "error",
            "message": "No se pudo conectar a la base de datos.",
        }

    return {"status": "ok", "database": "disponible"}
