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

## API de gastos planificados

Base path: `http://127.0.0.1:8000/api/planned-expenses`

| Método | Ruta | Descripción | Respuestas |
|--------|------|-------------|------------|
| GET | `/api/planned-expenses` | Lista gastos planificados | 200 |
| GET | `/api/planned-expenses/{id}` | Obtiene registro por ID | 200 / 404 |
| POST | `/api/planned-expenses` | Crea gasto planificado | 201 / 404 / 409 / 422 |
| PUT | `/api/planned-expenses/{id}` | Actualiza completo | 200 / 404 / 409 / 422 |
| PATCH | `/api/planned-expenses/{id}` | Actualización parcial | 200 / 404 / 409 / 422 |
| DELETE | `/api/planned-expenses/{id}` | Eliminación física | 200 / 404 |

Reglas de negocio:
- `amount` usa `Decimal`, nunca float. Debe ser `>= 0`.
- `month` debe estar entre 1 y 12.
- Unicidad por `(year, month, cost_center_id, expense_concept_id)`.
- `expense_concept_id` debe pertenecer al `cost_center_id` indicado.
- DELETE elimina físicamente el registro (no hay baja lógica en planned_expenses del MVP).
- La desviación **no se calcula ni se guarda** en esta tabla; se calcula desde gastos planificados y reales.

Query params disponibles en GET lista: `skip`, `limit` (máx 200), `year`, `month`, `cost_center_id`, `expense_concept_id`.

La respuesta incluye campos enriquecidos: `cost_center_code`, `cost_center_name`, `expense_concept_code`, `expense_concept_name`.

### Ejemplos de prueba con PowerShell

```powershell
# Crear
$body = @{
    year = 2026; month = 5; cost_center_id = 2
    expense_concept_id = 3; amount = "9800.00"
    notes = "Presupuesto sueldo vendedores"
} | ConvertTo-Json
Invoke-RestMethod -Method POST -Uri "http://127.0.0.1:8000/api/planned-expenses" -ContentType "application/json" -Body $body

# Listar con filtros
Invoke-RestMethod -Method GET -Uri "http://127.0.0.1:8000/api/planned-expenses?year=2026&month=5&cost_center_id=2"

# PATCH parcial (solo amount)
$body = @{ amount = "9900.00" } | ConvertTo-Json
Invoke-RestMethod -Method PATCH -Uri "http://127.0.0.1:8000/api/planned-expenses/1" -ContentType "application/json" -Body $body

# DELETE (eliminación física)
Invoke-RestMethod -Method DELETE -Uri "http://127.0.0.1:8000/api/planned-expenses/1"
```

## Frontend: Catálogos básicos

Pantalla de solo lectura que lista los catálogos del MVP conectados al backend.

**Requisito:** el backend debe estar activo en `http://127.0.0.1:8000`.

Ruta: `http://127.0.0.1:5173/catalogs`

Comportamiento:
- Carga centros de costo activos al entrar a la página.
- Auto-selecciona el primer centro; al hacer clic en otro, carga sus conceptos.
- Muestra estados de carga (skeleton), error (con botón Reintentar) y vacío.
- Vista de solo lectura: sin formularios ni mutaciones.

La URL base de la API puede sobreescribirse con la variable de entorno Vite:

```env
VITE_API_BASE_URL=http://127.0.0.1:8000
```

## API de conceptos de gasto

Los conceptos de gasto se gestionan dentro de un centro de costo. La unicidad de `code` aplica por centro: el mismo código puede existir en centros distintos pero no dentro del mismo.

Base path: `http://127.0.0.1:8000/api/cost-centers/{cost_center_id}/expense-concepts`

| Método | Ruta | Descripción | Respuestas |
|--------|------|-------------|------------|
| GET | `/api/cost-centers/{id}/expense-concepts` | Lista conceptos del centro | 200 / 404 |
| GET | `/api/cost-centers/{id}/expense-concepts/{concept_id}` | Obtiene concepto por ID | 200 / 404 |
| POST | `/api/cost-centers/{id}/expense-concepts` | Crea concepto en el centro | 201 / 404 / 409 / 422 |
| PUT | `/api/cost-centers/{id}/expense-concepts/{concept_id}` | Actualiza completo | 200 / 404 / 409 / 422 |
| PATCH | `/api/cost-centers/{id}/expense-concepts/{concept_id}` | Actualización parcial | 200 / 404 / 409 / 422 |
| DELETE | `/api/cost-centers/{id}/expense-concepts/{concept_id}` | Baja lógica (`is_active=false`) | 200 / 404 |

El DELETE no elimina físicamente; establece `is_active = false`. No se permite crear conceptos en centros inactivos (409).

Query params disponibles en GET lista:

- `skip` (int, default 0): registros a saltar.
- `limit` (int, default 100, máx 200): registros a retornar.
- `is_active` (bool, opcional): filtra por estado activo/inactivo.
- `search` (str, opcional): filtra por code o name (case-insensitive).

### Ejemplos de prueba con PowerShell

```powershell
# Listar conceptos de VENTAS (id=2)
Invoke-RestMethod -Method GET -Uri "http://127.0.0.1:8000/api/cost-centers/2/expense-concepts"

# Solo activos
Invoke-RestMethod -Method GET -Uri "http://127.0.0.1:8000/api/cost-centers/2/expense-concepts?is_active=true"

# Buscar por nombre o código
Invoke-RestMethod -Method GET -Uri "http://127.0.0.1:8000/api/cost-centers/2/expense-concepts?search=facebook"

# Crear concepto
$body = @{
    code = "TEST_CONCEPTO"
    name = "Concepto temporal"
    description = "Registro temporal"
    sort_order = 999
    is_active = $true
} | ConvertTo-Json
Invoke-RestMethod -Method POST -Uri "http://127.0.0.1:8000/api/cost-centers/2/expense-concepts" -ContentType "application/json" -Body $body

# Actualizar parcial (PATCH)
$body = @{ name = "Concepto actualizado" } | ConvertTo-Json
Invoke-RestMethod -Method PATCH -Uri "http://127.0.0.1:8000/api/cost-centers/2/expense-concepts/38" -ContentType "application/json" -Body $body

# Baja lógica (DELETE — no borra, deja is_active=false)
Invoke-RestMethod -Method DELETE -Uri "http://127.0.0.1:8000/api/cost-centers/2/expense-concepts/38"
```

## API de centros de costo

Base path: `http://127.0.0.1:8000/api/cost-centers`

| Método | Ruta | Descripción | Respuestas |
|--------|------|-------------|------------|
| GET | `/api/cost-centers` | Lista centros de costo | 200 |
| GET | `/api/cost-centers/{id}` | Obtiene un centro por ID | 200 / 404 |
| POST | `/api/cost-centers` | Crea un centro nuevo | 201 / 409 / 422 |
| PUT | `/api/cost-centers/{id}` | Actualiza completo | 200 / 404 / 409 / 422 |
| PATCH | `/api/cost-centers/{id}` | Actualización parcial | 200 / 404 / 409 / 422 |
| DELETE | `/api/cost-centers/{id}` | Baja lógica (`is_active=false`) | 200 / 404 |

El DELETE no elimina físicamente el registro; establece `is_active = false`.

Query params disponibles en GET lista:

- `skip` (int, default 0): registros a saltar.
- `limit` (int, default 100, máx 200): registros a retornar.
- `is_active` (bool, opcional): filtra por estado activo/inactivo.
- `search` (str, opcional): filtra por code o name (case-insensitive).

### Ejemplos de prueba con PowerShell

```powershell
# Listar todos
Invoke-RestMethod -Method GET -Uri "http://127.0.0.1:8000/api/cost-centers"

# Solo activos
Invoke-RestMethod -Method GET -Uri "http://127.0.0.1:8000/api/cost-centers?is_active=true"

# Buscar por nombre o código
Invoke-RestMethod -Method GET -Uri "http://127.0.0.1:8000/api/cost-centers?search=ventas"

# Obtener por ID
Invoke-RestMethod -Method GET -Uri "http://127.0.0.1:8000/api/cost-centers/1"

# Crear
$body = @{
    code = "TEST_CC"
    name = "Centro de prueba"
    description = "Registro temporal"
    color = "#2563eb"
    sort_order = 999
    is_active = $true
} | ConvertTo-Json
Invoke-RestMethod -Method POST -Uri "http://127.0.0.1:8000/api/cost-centers" -ContentType "application/json" -Body $body

# Actualizar parcial (PATCH)
$body = @{ name = "Nombre actualizado" } | ConvertTo-Json
Invoke-RestMethod -Method PATCH -Uri "http://127.0.0.1:8000/api/cost-centers/6" -ContentType "application/json" -Body $body

# Baja lógica (DELETE — no borra, deja is_active=false)
Invoke-RestMethod -Method DELETE -Uri "http://127.0.0.1:8000/api/cost-centers/6"
```

## API de gastos reales

Base path: `http://127.0.0.1:8000/api/actual-expenses`

| Método | Ruta | Descripción | Respuestas |
|--------|------|-------------|------------|
| GET | `/api/actual-expenses` | Lista gastos reales | 200 |
| GET | `/api/actual-expenses/{id}` | Obtiene registro por ID | 200 / 404 |
| POST | `/api/actual-expenses` | Crea gasto real | 201 / 404 / 422 |
| PUT | `/api/actual-expenses/{id}` | Actualiza completo | 200 / 404 / 422 |
| PATCH | `/api/actual-expenses/{id}` | Actualización parcial | 200 / 404 / 422 |
| DELETE | `/api/actual-expenses/{id}` | Eliminación física | 200 / 404 |

Reglas de negocio:
- `amount` usa `Decimal`, nunca float. Debe ser `> 0`.
- `year` y `month` se derivan automáticamente desde `expense_date` (componentes del objeto `date`).
- Se permiten múltiples registros reales para el mismo periodo, centro de costo y concepto (gastos transaccionales).
- `expense_concept_id` debe pertenecer al `cost_center_id` indicado.
- DELETE elimina físicamente el registro en el MVP. En fases posteriores con auditoría se evaluará baja lógica o historial.
- La desviación **no se calcula ni se guarda** en esta tabla; se calculará desde gastos planificados y reales.

Query params disponibles en GET lista: `skip`, `limit` (máx 200), `year`, `month`, `cost_center_id`, `expense_concept_id`, `date_from`, `date_to`, `supplier`, `document_number`, `search`.
`date_from` no puede ser mayor que `date_to` (retorna 422).
`search` busca en `supplier`, `document_number`, `description` y `notes`.

La respuesta incluye campos enriquecidos: `cost_center_code`, `cost_center_name`, `expense_concept_code`, `expense_concept_name`.

### Ejemplos de prueba con PowerShell

```powershell
# Crear
$body = @{
    expense_date = "2026-05-23"
    cost_center_id = 2
    expense_concept_id = 3
    amount = "1500.50"
    supplier = "Proveedor de prueba"
    document_number = "F001-000123"
    description = "Gasto real de prueba"
    notes = "Registro temporal"
} | ConvertTo-Json
Invoke-RestMethod -Method POST -Uri "http://127.0.0.1:8000/api/actual-expenses" -ContentType "application/json" -Body $body

# Listar con filtros
Invoke-RestMethod -Method GET -Uri "http://127.0.0.1:8000/api/actual-expenses?year=2026&month=5&cost_center_id=2"

# Filtrar por rango de fechas
Invoke-RestMethod -Method GET -Uri "http://127.0.0.1:8000/api/actual-expenses?date_from=2026-05-01&date_to=2026-05-31"

# Buscar por texto
Invoke-RestMethod -Method GET -Uri "http://127.0.0.1:8000/api/actual-expenses?search=proveedor"

# PATCH parcial (solo amount y notes)
$body = @{ amount = "1750.75"; notes = "Gasto actualizado" } | ConvertTo-Json
Invoke-RestMethod -Method PATCH -Uri "http://127.0.0.1:8000/api/actual-expenses/1" -ContentType "application/json" -Body $body

# DELETE (eliminacion fisica)
Invoke-RestMethod -Method DELETE -Uri "http://127.0.0.1:8000/api/actual-expenses/1"
```

## Frontend: Gastos reales

Pantalla transaccional para registrar, listar, editar y eliminar gastos ejecutados.

**Requisito:** el backend debe estar activo en `http://127.0.0.1:8000`.

Ruta: `http://127.0.0.1:5173/actual-expenses`

Comportamiento:
- Carga centros de costo activos y conceptos dependientes del centro seleccionado.
- Formulario de registro con fecha, centro, concepto, monto, proveedor, documento, descripción y observaciones.
- Fecha por defecto: fecha actual en zona horaria `America/Lima`.
- Usa POST para crear y PUT para actualizar.
- Usa DELETE para eliminar (con confirmación).
- Filtros por año, mes, centro, concepto y búsqueda de texto libre.
- Búsqueda en proveedor, documento, descripción y observaciones.
- Paginación automática al consumir la API (múltiples páginas de 200 registros).
- Muestra total visual y cantidad de registros. Los totales son solo visuales, no persistidos.
- No calcula desviación en esta versión.

## Frontend: Gastos planificados

Pantalla de registro y edición mensual de presupuesto por centro de costo y concepto.

**Requisito:** el backend debe estar activo en `http://127.0.0.1:8000`.

Ruta: `http://127.0.0.1:5173/planned-expenses`

Comportamiento:
- Carga centros de costo activos y auto-selecciona el primero.
- Permite seleccionar año y centro de costo desde la barra de herramientas.
- Muestra una matriz mensual: filas = conceptos del centro, columnas = enero a diciembre.
- Cada celda permite editar el monto planificado para ese concepto y mes.
- Al guardar: usa POST si no existe registro, PATCH si ya existe.
- No implementa DELETE visual, desviación ni gastos reales en esta versión.
- Celdas vacías nuevas se ignoran al guardar.
- Si una celda ya tiene registro existente, se debe ingresar 0 para presupuesto cero; no se permite dejarla vacía.
- Acepta entrada decimal con punto o coma (`9800`, `9800.50`, `9800,50`).
- No permite montos negativos.
- Muestra totales mensuales y total anual (solo visuales, no persistidos).

## Criterios base del proyecto

- Todo texto del sistema y la documentación se mantiene en español.
- Los archivos fuente y de configuración deben guardarse en UTF-8.
- La zona horaria de negocio a considerar en fases posteriores es `America/Lima`.
- El MVP inicial no incluye login, auditoría ni CRUD completo.
