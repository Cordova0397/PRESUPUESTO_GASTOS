@echo off
setlocal
cd /d "%~dp0"

echo [INFO] Iniciando instalacion del backend...

if not exist "backend\requirements.txt" (
  echo [ERROR] No se encontro backend\requirements.txt
  exit /b 1
)

set "PYTHON_CMD="

py -3.11 --version >nul 2>&1
if not errorlevel 1 set "PYTHON_CMD=py -3.11"

if not defined PYTHON_CMD (
  py -3 --version >nul 2>&1
  if not errorlevel 1 set "PYTHON_CMD=py -3"
)

if not defined PYTHON_CMD (
  python --version >nul 2>&1
  if not errorlevel 1 set "PYTHON_CMD=python"
)

if not defined PYTHON_CMD (
  echo [ERROR] No se encontro Python en el sistema.
  exit /b 1
)

echo [INFO] Usando %PYTHON_CMD%

if not exist "backend\.venv\Scripts\python.exe" (
  echo [INFO] Creando entorno virtual en backend\.venv
  %PYTHON_CMD% -m venv "backend\.venv"
  if errorlevel 1 (
    echo [ERROR] No se pudo crear el entorno virtual.
    exit /b 1
  )
)

echo [INFO] Actualizando pip...
"backend\.venv\Scripts\python.exe" -m pip install --upgrade pip
if errorlevel 1 (
  echo [ERROR] Fallo la actualizacion de pip.
  exit /b 1
)

echo [INFO] Instalando dependencias...
"backend\.venv\Scripts\python.exe" -m pip install -r "backend\requirements.txt"
if errorlevel 1 (
  echo [ERROR] Fallo la instalacion de dependencias.
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
) else (
  echo [INFO] backend\.env ya existe. No se sobrescribira.
)

echo [INFO] Instalacion del backend completada.
exit /b 0
