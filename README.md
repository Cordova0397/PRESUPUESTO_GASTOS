# PRESUPUESTO GASTOS

Base tecnica inicial del proyecto para el MVP de control presupuestal.

## Stack

### Backend

- Python
- FastAPI
- SQLAlchemy 2.0
- Alembic
- MySQL
- Pydantic v2

### Frontend

- React
- TypeScript
- Vite
- Tailwind se configurara en una siguiente tarea

## Estructura principal

- `backend/`
- `frontend/`
- `docs/`
- `scripts/`

## Instalacion y ejecucion del backend

La configuracion del backend se toma desde `backend/.env`. El archivo se puede crear desde `backend/.env.example` usando `instalar_backend.bat` o `run_backend.bat`.

Instalar dependencias:

```bat
instalar_backend.bat
```

Ejecutar servidor:

```bat
run_backend.bat
```

Endpoint de prueba:

- `GET http://127.0.0.1:8000/health`
- `GET http://127.0.0.1:8000/health/db`

Para probar `/health/db`, MySQL debe estar encendido y `DATABASE_URL` debe apuntar a una base de datos valida. El endpoint no expone la URL de conexion ni la contrasena si ocurre un error.

## Instalacion y ejecucion del frontend

Instalar dependencias:

```bat
instalar_frontend.bat
```

Ejecutar servidor de desarrollo:

```bat
run_frontend.bat
```

## Criterios base del proyecto

- Todo texto del sistema y la documentacion se mantiene en espanol.
- Los archivos fuente y de configuracion deben guardarse en UTF-8.
- La zona horaria de negocio a considerar en fases posteriores es `America/Lima`.
- El MVP inicial no incluye login, auditoria ni CRUD completo.
