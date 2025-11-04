@echo off
REM Ejecuta solo el test de operador flujo con Maven Wrapper
REM Ejecutar con UI visible en Chrome para depuración del caso de uso
call "..\burger-club\burgur\mvnw.cmd" -f "%~dp0pom.xml" -Dtest=restaurante.example.burgur.E2E.TestOperadorFlujo -Dfront.url=http://localhost:4200/ -Dback.url=http://localhost:9090 -Dheadless=false test
if %errorlevel% neq 0 (
  echo Fallo al ejecutar TestOperadorFlujo
  exit /b %errorlevel%
)
echo TestOperadorFlujo ejecutado correctamente