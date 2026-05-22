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
