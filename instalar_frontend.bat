@echo off
setlocal
cd /d "%~dp0"

echo [INFO] Iniciando instalacion del frontend...

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

echo [INFO] npm detectado:
call npm --version

cd /d "%~dp0frontend"

if exist "package-lock.json" (
  echo [INFO] Ejecutando npm ci...
  call npm ci
) else (
  echo [INFO] Ejecutando npm install...
  call npm install
)

if errorlevel 1 (
  echo [ERROR] Fallo la instalacion del frontend.
  exit /b 1
)

echo [INFO] Instalacion del frontend completada.
exit /b 0