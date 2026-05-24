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

## Tarea T-005

- Definir y documentar el modelo de datos MVP para centros de costo, conceptos de gasto, gastos planificados y gastos reales.
- Documentar propósito, campos, tipos sugeridos, validaciones, relaciones, índices y restricciones.
- Documentar que los montos usan `DECIMAL(14,2)` y no `FLOAT`.
- Documentar que la desviación monetaria se calcula como `gasto real - gasto planificado`.
- Documentar que desviación, análisis y dashboard se calculan desde gastos planificados y gastos reales, sin tablas principales persistidas para esos resultados.
- Documentar que las fechas funcionales del negocio usan `America/Lima`.
- Crear o actualizar documentación de soporte para diccionario de datos y decisiones del modelo.
- No implementar modelos SQLAlchemy, migraciones Alembic, CRUD, endpoints de negocio, formularios frontend ni seeds ejecutables en esta tarea.

## Criterios de aceptación T-005

- Existe documentación actualizada del modelo de datos MVP en `docs/modelo_datos.md`.
- Existen documentos de soporte para diccionario de datos y decisiones del modelo.
- El modelo incluye `cost_centers`, `expense_concepts`, `planned_expenses` y `actual_expenses`.
- Cada tabla tiene propósito, campos, tipos sugeridos, validaciones e índices.
- Se documenta que los montos usan `DECIMAL(14,2)` y no `FLOAT`.
- Se documenta que la desviación es `gasto real - gasto planificado`.
- Se documenta que desviación y análisis no se guardan como tablas principales.
- Se documenta la zona horaria `America/Lima` para fechas funcionales.
- Se documenta la relación entre centros, conceptos, gastos planificados y gastos reales.
- Se documenta la restricción única de `planned_expenses`.
- Se documenta que `actual_expenses` permite múltiples registros por mes, centro de costo y concepto.
- No se crean modelos SQLAlchemy ni migraciones de tablas de negocio.
- No se modifica el frontend.
- Los archivos quedan en UTF-8 y sin mojibake.

## Tarea T-006

- Crear modelos SQLAlchemy 2.0 para las 4 tablas MVP: `cost_centers`, `expense_concepts`, `planned_expenses`, `actual_expenses`.
- Crear helper de zona horaria `America/Lima` en `backend/app/core/timezone.py` con `now_lima()`.
- Crear `TimestampMixin` para `created_at` y `updated_at` en hora funcional de Perú.
- Crear migración Alembic real `backend/alembic/versions/0002_create_mvp_tables.py` con `down_revision = 0001_initial_empty`.
- Asegurar tipos MySQL adecuados: `BIGINT UNSIGNED` para IDs, `SMALLINT UNSIGNED` para `year`, `TINYINT UNSIGNED` para `month`, `DECIMAL(14,2)` para montos, `DATE` para `expense_date` y `DATETIME` para timestamps.
- Asegurar restricciones únicas, check constraints, foreign keys e índices con nombres explícitos.
- Validar que `db_upgrade.bat` y `db_current.bat` ejecuten correctamente contra MySQL local.
- Mantener documentación actualizada en `docs/sprint_1.md` y `README.md`.
- En esta tarea NO se implementan CRUD, endpoints de negocio, schemas Pydantic, servicios, formularios frontend, seeds ejecutables, login ni auditoría.

## Criterios de aceptación T-006

- Existen modelos SQLAlchemy 2.0 con `Mapped` y `mapped_column` para `cost_centers`, `expense_concepts`, `planned_expenses` y `actual_expenses`.
- Existe `backend/app/core/timezone.py` con `now_lima()` basada en `ZoneInfo("America/Lima")`.
- Existe `TimestampMixin` en `backend/app/models/mixins.py` usando `now_lima` como `default` y `onupdate`.
- Los montos usan `DECIMAL(14,2)` y no `FLOAT` ni `DOUBLE`.
- Existen relaciones entre centros, conceptos, planificados y reales con `back_populates`.
- `backend/app/models/__init__.py` registra los 4 modelos.
- `backend/alembic/env.py` importa `app.models` para que `Base.metadata` los conozca.
- Existe la migración `0002_create_mvp_tables.py` con `upgrade()` que crea las 4 tablas y `downgrade()` que las elimina en orden inverso.
- La migración incluye FKs, restricciones únicas, check constraints e índices con nombres explícitos.
- `db_upgrade.bat` ejecuta correctamente y `db_current.bat` reporta `0002_create_mvp_tables (head)`.
- `GET /health` y `GET /health/db` siguen funcionando.
- No se crean endpoints CRUD, schemas Pydantic ni servicios en esta tarea.
- No se modifica el frontend.
- Los archivos quedan en UTF-8 y sin mojibake.

## Tarea T-007

- Crear seed inicial idempotente de catálogos en `scripts/seed_initial_catalogs.py`.
- Cargar 5 centros de costo y 37 conceptos de gasto tomados del Excel actual.
- El seed usa SQLAlchemy ORM y `SessionLocal`. Crea registros si no existen o los actualiza si ya existen.
- Crear `seed_catalogs.bat` en la raíz para ejecutar el seed en Windows.
- El seed ejecuta desde `backend/` como directorio de trabajo para que `pydantic-settings` encuentre `backend/.env` correctamente.
- No se cargan gastos planificados ni gastos reales.
- No se implementan CRUD, endpoints, schemas Pydantic ni servicios.
- Crear `docs/catalogos_iniciales.md` con referencia de centros y conceptos.

## Tarea T-010

- Crear pantallas/listados básicos de catálogos en el frontend.
- Conectar frontend con los endpoints reales del backend: centros de costo y conceptos de gasto.
- Ruta nueva: `/catalogs`.
- Agregar "Catálogos" al sidebar de navegación.
- Vista de solo lectura: sin formularios, sin mutaciones, sin DELETE desde frontend.
- Al cargar la página, lista centros de costo activos y auto-selecciona el primero.
- Al seleccionar un centro, lista sus conceptos activos en un panel lateral.
- Manejar estados de carga (skeleton), error (con botón Reintentar) y vacío.
- Los nombres con tildes y caracteres especiales se renderizan correctamente (Viáticos, Telefonía, etc.).
- No se implementan login, auditoría, formularios ni CRUD visual en esta tarea.
- No se modifica el backend.

## Criterios de aceptación T-010

- Existe `frontend/src/types/costCenter.ts` con tipo `CostCenter`.
- Existe `frontend/src/types/expenseConcept.ts` con tipo `ExpenseConcept`.
- Existe `frontend/src/services/apiClient.ts` con `apiFetch` y `ApiError`.
- Existe `frontend/src/services/catalogsService.ts` con `getActiveCostCenters` y `getActiveExpenseConceptsByCostCenter`.
- Existe `frontend/src/pages/CatalogsPage.tsx` con gestión de estado, carga y error.
- Existe `frontend/src/components/catalogs/CostCentersList.tsx` con indicador de color.
- Existe `frontend/src/components/catalogs/ExpenseConceptsList.tsx` con tabla de conceptos.
- Ruta `/catalogs` registrada en el router.
- Sidebar muestra opción "Catálogos" con descripción "Centros y conceptos".
- `npm run build` ejecuta sin errores.
- Todas las rutas existentes siguen funcionando.
- No se modifica el backend.
- No se implementa login ni auditoría.
- Archivos en UTF-8 sin mojibake.

## Tarea T-009

- Crear endpoints CRUD de conceptos de gasto por centro de costo, usando la misma arquitectura por capas de T-008: schemas Pydantic v2, repository, service y router FastAPI.
- Base path: `/api/cost-centers/{cost_center_id}/expense-concepts`.
- Endpoints: GET listado con filtros, GET por ID, POST crear, PUT actualizar completo, PATCH actualizar parcial, DELETE baja lógica.
- La unicidad de `code` aplica por `(cost_center_id, code)`: el mismo code puede existir en centros distintos pero no dentro del mismo centro.
- El DELETE no elimina físicamente; establece `is_active = false`.
- No se permite crear conceptos en centros inactivos (409).
- No se implementan login, auditoría, CRUD de gastos planificados ni CRUD de gastos reales en esta tarea.
- No se modifica el frontend.

## Criterios de aceptación T-009

- Existe `backend/app/schemas/expense_concept.py` con schemas Pydantic v2.
- Existe `backend/app/repositories/expense_concept_repository.py` sin lógica HTTP.
- Existe `backend/app/services/expense_concept_service.py` con reglas de negocio.
- Existe `backend/app/api/expense_concepts.py` con el router FastAPI.
- `backend/app/main.py` registra el router de conceptos de gasto.
- `GET /api/cost-centers/2/expense-concepts` lista los 8 conceptos de VENTAS del seed.
- `GET /api/cost-centers/2/expense-concepts?is_active=true` filtra activos.
- `GET /api/cost-centers/2/expense-concepts?search=facebook` filtra por code o name.
- `GET /api/cost-centers/{id}/expense-concepts/{concept_id}` retorna el concepto si pertenece al centro.
- Si el concepto no pertenece al centro indicado, responde 404 con mensaje en español.
- `POST /api/cost-centers/{id}/expense-concepts` crea un concepto con status 201.
- `POST` con code duplicado dentro del mismo centro retorna 409.
- `POST` permite el mismo code en otro centro distinto.
- `POST` en centro inactivo retorna 409 con mensaje en español.
- `PUT /api/cost-centers/{id}/expense-concepts/{concept_id}` actualiza el concepto completo.
- `PATCH /api/cost-centers/{id}/expense-concepts/{concept_id}` permite actualización parcial.
- `DELETE /api/cost-centers/{id}/expense-concepts/{concept_id}` deja `is_active = false` sin borrar el registro.
- Centro inexistente en cualquier endpoint retorna 404 con mensaje en español.
- `/health` y `/health/db` siguen funcionando sin cambios.
- No se implementa login ni auditoría.
- No se modifica el frontend.
- No hay mojibake en nombres como Viáticos, Telefonía, asesoría, etc.
- Archivos en UTF-8.

## Tarea T-008

- Crear endpoints CRUD de centros de costo usando arquitectura en capas: schemas Pydantic v2, repository, service y router FastAPI.
- Base path: `/api/cost-centers`.
- Endpoints: GET listado con filtros, GET por ID, POST crear, PUT actualizar completo, PATCH actualizar parcial, DELETE baja lógica.
- El DELETE no elimina físicamente; establece `is_active = false`.
- No se implementan login, auditoría, CRUD de conceptos, CRUD de gastos planificados ni CRUD de gastos reales en esta tarea.
- No se modifica el frontend.

## Criterios de aceptación T-008

- Existe `backend/app/schemas/cost_center.py` con schemas Pydantic v2.
- Existe `backend/app/repositories/cost_center_repository.py` sin lógica HTTP.
- Existe `backend/app/services/cost_center_service.py` con reglas de negocio.
- Existe `backend/app/api/cost_centers.py` con el router FastAPI.
- `backend/app/main.py` registra el router de centros de costo.
- `GET /api/cost-centers` lista los 5 centros cargados por el seed.
- `GET /api/cost-centers/{id}` retorna un centro existente o 404 en español.
- `POST /api/cost-centers` crea un centro nuevo con status 201.
- `POST` con code duplicado retorna 409 con mensaje en español.
- `PUT /api/cost-centers/{id}` actualiza un centro completo.
- `PATCH /api/cost-centers/{id}` permite actualización parcial de campos.
- `DELETE /api/cost-centers/{id}` deja `is_active = false`, sin borrar el registro.
- `GET` con `is_active=true` filtra solo activos.
- `GET` con `search=X` filtra por code o name (case-insensitive).
- `/health` y `/health/db` siguen funcionando sin cambios.
- No se implementa login ni auditoría.
- No se modifica el frontend.
- No hay mojibake; archivos en UTF-8.

## Criterios de aceptación T-007

- Existe `scripts/seed_initial_catalogs.py` que usa ORM y `SessionLocal`.
- Existe `seed_catalogs.bat` en la raíz.
- El seed es idempotente: ejecutado dos veces no duplica registros.
- Primera ejecución: 5 centros creados, 37 conceptos creados.
- Segunda ejecución: 0 creados, 5 centros actualizados, 37 conceptos actualizados.
- `SELECT COUNT(*) FROM cost_centers` = 5.
- `SELECT COUNT(*) FROM expense_concepts` = 37.
- `SELECT COUNT(*) FROM planned_expenses` = 0.
- `SELECT COUNT(*) FROM actual_expenses` = 0.
- Los nombres con tildes y caracteres especiales se almacenan correctamente en UTF-8 (`utf8mb4`) en MySQL.
- Existe `docs/catalogos_iniciales.md` con referencia completa de centros y conceptos.
- No se crean endpoints, schemas ni servicios en esta tarea.
- No se modifica el frontend.
- Los archivos quedan en UTF-8 y sin mojibake.
