# Base de datos

## Configuracion local sugerida

- Nombre de base de datos: `presupuesto_gastos_db`.
- Charset: `utf8mb4`.
- Collation: `utf8mb4_unicode_ci`.
- Driver Python: `PyMySQL`.
- Variable de entorno: `DATABASE_URL`.

## Entorno

- La configuracion del backend se toma desde `backend/.env`.
- `backend/.env` no debe subirse a Git.
- `backend/.env.example` es la plantilla sin secretos reales.
- El archivo `scripts/mysql_create_database.sql.example` sirve como referencia para crear la base y el usuario local.
- Reemplazar `CAMBIAR_PASSWORD_LOCAL` en el entorno local.

## Alembic

- Alembic se ejecuta desde `backend` usando `backend/alembic.ini`.
- Desde la raiz del proyecto se pueden usar:
- `db_current.bat`
- `db_history.bat`
- `db_upgrade.bat`

## Regla del MVP

- Las desviaciones no se almacenan como tablas principales.
- La desviacion se calculara desde gastos planificados y gastos reales.
