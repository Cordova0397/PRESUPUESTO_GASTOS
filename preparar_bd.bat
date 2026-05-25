@echo off
setlocal EnableExtensions

title PRESUPUESTO GASTOS - Preparar base de datos

echo ============================================================
echo  PRESUPUESTO GASTOS - MIGRACIONES + CATALOGOS INICIALES
echo ============================================================
echo.

set "ROOT=%~dp0"
set "BACKEND=%ROOT%backend"
set "VENV_PY=%BACKEND%\.venv\Scripts\python.exe"
set "VENV_ACTIVATE=%BACKEND%\.venv\Scripts\activate.bat"
set "ENV_FILE=%BACKEND%\.env"
set "ENV_EXAMPLE=%BACKEND%\.env.example"
set "SEED_SCRIPT=%ROOT%scripts\seed_initial_catalogs.py"
set "REPAIR_SCRIPT=%ROOT%scripts\repair_catalog_sort_order.py"

cd /d "%ROOT%"

echo [INFO] Ruta del proyecto:
echo %ROOT%
echo.

if not exist "%BACKEND%" (
    echo [ERROR] No existe la carpeta backend.
    echo         Ruta esperada: %BACKEND%
    goto :error
)

if not exist "%VENV_PY%" (
    echo [ERROR] No existe el entorno virtual del backend.
    echo         Ruta esperada: %VENV_PY%
    echo.
    echo [SUGERENCIA] Ejecuta primero:
    echo         instalar_backend.bat
    goto :error
)

if not exist "%ENV_FILE%" (
    echo [ADVERTENCIA] No existe backend\.env.

    if exist "%ENV_EXAMPLE%" (
        echo [INFO] Se creara backend\.env desde backend\.env.example.
        copy "%ENV_EXAMPLE%" "%ENV_FILE%" >nul

        echo.
        echo [ERROR] Se creo backend\.env, pero debes editar DATABASE_URL
        echo         con usuario, password y nombre de base correctos.
        echo.
        echo Archivo creado:
        echo %ENV_FILE%
        echo.
        echo Luego vuelve a ejecutar este .bat.
        goto :error
    ) else (
        echo [ERROR] No existe backend\.env ni backend\.env.example.
        goto :error
    )
)

if not exist "%SEED_SCRIPT%" (
    echo [ERROR] No existe el script de carga inicial:
    echo         %SEED_SCRIPT%
    goto :error
)

if not exist "%REPAIR_SCRIPT%" (
    echo [ERROR] No existe el script de normalizacion de orden:
    echo         %REPAIR_SCRIPT%
    goto :error
)

echo [INFO] Activando entorno virtual...
call "%VENV_ACTIVATE%"
if errorlevel 1 (
    echo [ERROR] No se pudo activar el entorno virtual.
    goto :error
)

echo.
echo [1/6] Verificando sintaxis del backend...
cd /d "%BACKEND%"
"%VENV_PY%" -m compileall app -q
if errorlevel 1 (
    echo [ERROR] Fallo py -m compileall app -q
    goto :error
)

echo.
echo [2/6] Estado actual de Alembic...
alembic current
if errorlevel 1 (
    echo [ERROR] Fallo alembic current.
    echo         Verifica DATABASE_URL en backend\.env y que MySQL este encendido.
    goto :error
)

echo.
echo [3/6] Aplicando migraciones Alembic...
alembic upgrade head
if errorlevel 1 (
    echo [ERROR] Fallo alembic upgrade head.
    goto :error
)

echo.
echo [4/6] Confirmando revision actual...
alembic current
if errorlevel 1 (
    echo [ERROR] Fallo alembic current despues de migrar.
    goto :error
)

echo.
echo [5/6] Cargando catalogos iniciales...
cd /d "%ROOT%"
"%VENV_PY%" "%SEED_SCRIPT%"
if errorlevel 1 (
    echo [ERROR] Fallo la carga de catalogos iniciales.
    goto :error
)

echo.
echo [6/6] Normalizando orden de catalogos segun Excel...
"%VENV_PY%" "%REPAIR_SCRIPT%"
if errorlevel 1 (
    echo [ERROR] Fallo la normalizacion del orden de catalogos.
    goto :error
)

echo.
echo ============================================================
echo  OK - BASE DE DATOS PREPARADA CORRECTAMENTE
echo ============================================================
echo.
echo Siguiente paso sugerido:
echo   run_backend.bat
echo.
pause
exit /b 0

:error
echo.
echo ============================================================
echo  PROCESO DETENIDO CON ERROR
echo ============================================================
echo.
pause
exit /b 1