# PRESUPUESTO GASTOS

Base técnica inicial del proyecto para el MVP de control presupuestal.

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
- Tailwind CSS
- React Router DOM

## Estructura principal

- `backend/`
- `frontend/`
- `docs/`
- `scripts/`

## Documentación del MVP

- [Alcance MVP](docs/alcance.md)
- [Reglas de negocio](docs/reglas_negocio.md)
- [Modelo de datos MVP](docs/modelo_datos.md)
- [Diccionario de datos MVP](docs/diccionario_datos_mvp.md)
- [Decisiones del modelo de datos](docs/decisiones_modelo_datos.md)

## Instalación y ejecución del backend

La configuración del backend se toma desde `backend/.env`. El archivo se puede crear desde `backend/.env.example` usando `instalar_backend.bat` o `run_backend.bat`.

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

Para probar `/health/db`, MySQL debe estar encendido y `DATABASE_URL` debe apuntar a una base de datos válida. El endpoint no expone la URL de conexión ni la contraseña si ocurre un error.

## Base de datos y migraciones

La configuración de base de datos se toma desde `backend/.env`. Este archivo no debe subirse a Git; `backend/.env.example` funciona como plantilla sin secretos reales.

Para crear la base MySQL local, usa como referencia:

```sql
scripts/mysql_create_database.sql.example
```

Para validar el backend:

```bat
run_backend.bat
```

Endpoints de validación:

- `GET http://127.0.0.1:8000/health`
- `GET http://127.0.0.1:8000/health/db`

Para validar Alembic desde la raíz:

```bat
db_current.bat
db_history.bat
db_upgrade.bat
```

`/health/db`, `db_current.bat` y `db_upgrade.bat` requieren que MySQL esté encendido y que `DATABASE_URL` tenga credenciales locales válidas.

Las tablas del MVP (`cost_centers`, `expense_concepts`, `planned_expenses`, `actual_expenses`) se crean al aplicar la migración `0002_create_mvp_tables` con `db_upgrade.bat`. Los timestamps `created_at` y `updated_at` se almacenan como `DATETIME` naive en hora funcional `America/Lima`, no UTC.

## Catálogos iniciales

Para cargar los catálogos iniciales (centros de costo y conceptos de gasto) en MySQL:

```bat
seed_catalogs.bat
```

Requisitos previos:
- MySQL debe estar encendido.
- `DATABASE_URL` debe tener credenciales locales válidas en `backend/.env`.
- Las migraciones deben estar aplicadas: `db_upgrade.bat`.

El seed es idempotente. Puede ejecutarse más de una vez sin duplicar registros. Para referencia completa de centros y conceptos iniciales, ver [docs/catalogos_iniciales.md](docs/catalogos_iniciales.md).

## Instalación y ejecución del frontend

Instalar dependencias:

```bat
instalar_frontend.bat
```

Ejecutar servidor de desarrollo:

```bat
run_frontend.bat
```

Abrir en navegador:

- `http://127.0.0.1:5173`

Rutas base disponibles:

- `http://127.0.0.1:5173/dashboard`
- `http://127.0.0.1:5173/planned-expenses`
- `http://127.0.0.1:5173/actual-expenses`
- `http://127.0.0.1:5173/variance`
- `http://127.0.0.1:5173/analysis`

Resumen del frontend actual:

- Layout base responsive con sidebar, topbar y contenedor principal.
- Páginas placeholder en español para dashboard, gastos planificados, gastos reales, desviación y análisis.
- Sin CRUD, sin consumo de API, sin login y sin auditoría en esta fase.

## Criterios base del proyecto

- Todo texto del sistema y la documentación se mantiene en español.
- Los archivos fuente y de configuración deben guardarse en UTF-8.
- La zona horaria de negocio a considerar en fases posteriores es `America/Lima`.
- El MVP inicial no incluye login, auditoría ni CRUD completo.
