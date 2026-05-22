# Base de datos

## Configuración local sugerida

- Nombre de base de datos: `presupuesto_gastos_db`.
- Charset: `utf8mb4`.
- Collation: `utf8mb4_unicode_ci`.
- Driver Python: `PyMySQL`.
- Variable de entorno: `DATABASE_URL`.

## Entorno

- La configuración del backend se toma desde `backend/.env`.
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

## Criterios técnicos del modelo MVP

- Las tablas de negocio del MVP serán `cost_centers`, `expense_concepts`, `planned_expenses` y `actual_expenses`.
- Los identificadores principales serán enteros autoincrementales.
- Los montos de dinero deben usar `DECIMAL(14,2)`.
- No usar `FLOAT` ni `DOUBLE` para dinero.
- La base debe usar `utf8mb4` para evitar problemas con tildes, Ñ y caracteres especiales.
- El MVP trabaja en soles de Perú como moneda funcional.
- Las fechas funcionales del negocio deben interpretarse según `America/Lima`.
- Las desviaciones no se almacenan como tablas principales.
- La desviación se calculará desde gastos planificados y gastos reales.
- El análisis y el dashboard consumirán consultas o agregados derivados.
