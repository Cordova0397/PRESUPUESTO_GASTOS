# Sprint 1

## Meta

Levantar la fundacion tecnica inicial del proyecto PRESUPUESTO GASTOS con separacion de backend, frontend, documentacion y scripts de soporte.

## Tarea T-001

- Crear estructura monorepo base.
- Dejar backend minimo con FastAPI.
- Dejar frontend minimo con React + TypeScript + Vite.
- Documentar alcance, reglas de negocio y modelo de datos inicial.
- Preparar scripts para instalacion y ejecucion en Windows.

## Tarea T-002

- Configurar settings centralizados con Pydantic Settings.
- Leer variables desde `backend/.env`.
- Configurar CORS para el frontend local.
- Configurar SQLAlchemy 2.0 con `engine`, `SessionLocal`, `Base` declarativa y `get_db`.
- Mantener `GET /health` y agregar `GET /health/db` para validar conexion a MySQL cuando corresponda.
- No implementar CRUD, login, auditoria ni modelos de negocio en esta tarea.

## Tarea T-003

- Configurar MySQL como base de datos objetivo.
- Configurar Alembic dentro de `backend/`.
- Crear scripts Windows para consultar historial, revision actual y ejecutar migraciones.
- Agregar SQL de ejemplo para crear base y usuario local sin secretos reales.
- Dejar migracion inicial vacia para validar el flujo de migraciones.
- Documentar conexion, variables de entorno y reglas basicas de base de datos.
- No crear tablas de negocio, CRUD, login, auditoria ni calculos de desviacion en esta tarea.

## Criterios de aceptacion

- La raiz contiene `backend`, `frontend`, `docs` y `scripts`.
- Existen `instalar_backend.bat`, `run_backend.bat`, `instalar_frontend.bat` y `run_frontend.bat`.
- `backend/app/main.py` expone `GET /health`.
- `backend/requirements.txt` y `backend/.env.example` existen.
- `frontend/package.json` existe y permite instalar dependencias.
- `README.md` documenta instalacion, ejecucion y endpoint de prueba.
- La documentacion base del sprint queda creada en `docs/`.
- No se implementan login, auditoria, CRUD ni logica de desviacion en esta tarea.

## Criterios de aceptacion T-002

- El backend usa settings centralizados en `backend/app/core/config.py`.
- `GET /health` responde con estado, nombre de app, ambiente y zona horaria.
- CORS permite `http://127.0.0.1:5173` y `http://localhost:5173`.
- SQLAlchemy 2.0 queda preparado en `backend/app/core/database.py`.
- Existe `Base` declarativa para futuros modelos.
- Existe `get_db()` para futuras rutas.
- `GET /health/db` valida la conexion sin exponer secretos si falla.
- El backend puede arrancar aunque MySQL no este disponible.

## Criterios de aceptacion T-003

- Existe `backend/alembic.ini`.
- Existe `backend/alembic/env.py` y usa `settings.database_url`.
- Alembic usa `Base.metadata`.
- Existe `backend/alembic/versions/`.
- Existe una migracion inicial vacia para validar `upgrade head`.
- Existen `db_current.bat`, `db_history.bat` y `db_upgrade.bat`.
- Existe `scripts/mysql_create_database.sql.example` sin secretos reales.
- `backend/.env.example` contiene `DATABASE_URL` con placeholder.
- `backend/.env`, `_bundles/` y `bundle_*.txt` estan ignorados por Git.
- No se crean tablas de negocio todavia.

## Tarea T-004

- Configurar Tailwind CSS para el frontend Vite + React + TypeScript.
- Configurar React Router DOM con rutas base del MVP.
- Crear layout base responsive con sidebar, topbar y contenedor principal.
- Crear páginas placeholder en español para dashboard, gastos planificados, gastos reales, desviación de gastos y análisis de gastos.
- Mantener visible la regla de negocio: desviación = real - planificado.
- No implementar CRUD, conexión a API, login, auditoría ni cálculos reales en esta tarea.

## Criterios de aceptación T-004

- `frontend/` instala dependencias con `instalar_frontend.bat`.
- `run_frontend.bat` levanta la app local en `http://127.0.0.1:5173`.
- Tailwind CSS queda configurado y funcionando en `frontend/src/styles.css`.
- Existen las rutas `/dashboard`, `/planned-expenses`, `/actual-expenses`, `/variance` y `/analysis`.
- La app muestra layout base con navegación lateral en escritorio y navegación compacta en móvil.
- Todo el texto visible del frontend está en español.
- No se implementan CRUD, formularios funcionales ni conexión al backend en esta tarea.
