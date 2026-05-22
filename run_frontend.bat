@echo off
setlocal
cd /d "%~dp0"

echo [INFO] Iniciando frontend...

if not exist "frontend\package.json" (
  echo [ERROR] No se encontro frontend\package.json
  exit /b 1
)

where npm >nul 2>&1
if errorlevel 1 (
  echo [ERROR] No se encontro npm en el PATH.
  echo [INFO] Instala Node.js LTS y vuelve a ejecutar este script.
  exit /b 1
)

cd /d "%~dp0frontend"

if not exist "node_modules" (
  echo [ERROR] No existe frontend\node_modules.
  echo [INFO] Ejecuta instalar_frontend.bat primero.
  exit /b 1
)

echo [INFO] Frontend disponible normalmente en:
echo http://127.0.0.1:5173

call npm run dev