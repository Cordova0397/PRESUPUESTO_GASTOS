@echo off
setlocal
cd /d "%~dp0"

echo [INFO] Iniciando backend...

if not exist "backend\.venv\Scripts\python.exe" (
  echo [ERROR] No se encontro el entorno virtual del backend.
  echo [INFO] Ejecuta instalar_backend.bat primero.
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

echo [INFO] Backend disponible en:
echo http://127.0.0.1:8000
echo http://127.0.0.1:8000/health

cd /d "%~dp0backend"
".venv\Scripts\python.exe" -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
