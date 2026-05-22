@echo off
setlocal
cd /d "%~dp0"

echo [INFO] Ejecutando migraciones Alembic hasta head...

if not exist "backend\.venv\Scripts\python.exe" (
  echo [ERROR] No se encontro backend\.venv\Scripts\python.exe
  echo [INFO] Ejecuta instalar_backend.bat primero.
  exit /b 1
)

if not exist "backend\alembic.ini" (
  echo [ERROR] No se encontro backend\alembic.ini
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
  )
)

cd /d "%~dp0backend"
".venv\Scripts\python.exe" -m alembic upgrade head
exit /b %ERRORLEVEL%
