@echo off
setlocal
cd /d "%~dp0"

echo [INFO] Ejecutando seed de catalogos iniciales...

if not exist "backend\.venv\Scripts\python.exe" (
  echo [ERROR] No se encontro backend\.venv\Scripts\python.exe
  echo [INFO] Ejecuta instalar_backend.bat primero.
  exit /b 1
)

if not exist "scripts\seed_initial_catalogs.py" (
  echo [ERROR] No se encontro scripts\seed_initial_catalogs.py
  exit /b 1
)

if not exist "backend\.env" (
  if exist "backend\.env.example" (
    echo [INFO] Creando backend\.env desde .env.example
    copy /Y "backend\.env.example" "backend\.env" >nul
    if errorlevel 1 (
      echo [ERROR] No se pudo crear backend\.env
      exit /b 1
    )
  ) else (
    echo [ERROR] No se encontro backend\.env ni backend\.env.example
    exit /b 1
  )
)

echo.

rem Ejecutar desde backend\ para que pydantic-settings encuentre .env correctamente.
rem El script usa __file__ para resolver sys.path, no el directorio de trabajo.
cd /d "%~dp0backend"
".venv\Scripts\python.exe" "..\scripts\seed_initial_catalogs.py"
if errorlevel 1 (
  echo.
  echo [ERROR] El seed termino con error.
  exit /b 1
)

echo.
echo [INFO] Seed completado.
exit /b 0
